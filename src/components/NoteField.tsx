import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Wand2, Undo2, Loader } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';
import { fixTerms, countTerms } from '../lib/tradingTerms';

interface NoteFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  height?: string;
  style?: React.CSSProperties;
}

/** Tarayıcının yerleşik konuşma tanıması. Sunucu ya da anahtar gerektirmez. */
const Recognition: any =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

/**
 * Tanıma bir parça için birkaç okuma döndürebilir; ilki en yüksek güvenli
 * olandır. Alt sıradakinde tanıdığımız bir terim varsa onu tercih ederiz —
 * genel dil için "order block" beklenmedik, ama alternatifler arasında sık
 * sık doğrusu duruyor. Uzunluk farkı büyükse dokunmayız: alternatif bütün
 * cümleyi bozmasın diye.
 */
const bestReading = (result: any, language: string): string => {
  const top = result[0]?.transcript || '';
  if (!result.isFinal || result.length < 2) return top;
  let pick = top;
  let score = countTerms(top, language);
  for (let i = 1; i < result.length; i++) {
    const alt = result[i]?.transcript || '';
    if (!alt || Math.abs(alt.length - top.length) > top.length * 0.25) continue;
    const altScore = countTerms(alt, language);
    if (altScore > score) { pick = alt; score = altScore; }
  }
  return pick;
};

/**
 * Tanıması çalışmayan tarayıcılarda ikinci yol: sesi kaydedip sunucuda
 * Whisper'la yazıya çevirmek. Kayıt her güncel tarayıcıda var.
 */
const CanRecord =
  typeof window !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof (window as any).MediaRecorder !== 'undefined';

/** Bu tarayıcıda yerleşik tanımanın çalışmadığını bir kez öğrendiysek hatırlarız. */
const MODE_KEY = 'stj-dictation-mode';

/**
 * Yerleşik tanıma kullanılamaz mı?
 *
 * Brave ve Opera `webkitSpeechRecognition`'ı Chromium'dan devralır ama sesi
 * Google'a gönderecek anahtarları yoktur: düğmeye basılır, hiçbir sonuç
 * gelmez. Firefox'ta hiç yoktur. Bunlarda denemeden doğrudan kayda geçeriz;
 * adıyla tanınmayan bir tarayıcı da ilk hatasında kendini ele verir.
 */
function liveUnusable(): boolean {
  if (!Recognition) return true;
  if ((navigator as any).brave) return true;
  if (/\bOPR\/|\bOpera\b/.test(navigator.userAgent)) return true;
  try { return localStorage.getItem(MODE_KEY) === 'record'; } catch { return false; }
}

/** Sunucu gövdesi ~3 MB sesi kaldırıyor; beş dakikalık not bunun çok altında. */
const MAX_RECORD_MS = 5 * 60 * 1000;

function pickMime(): string {
  const MR = (window as any).MediaRecorder;
  for (const m of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg']) {
    if (MR.isTypeSupported?.(m)) return m;
  }
  return '';
}

const blobToBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

const LOCALE: Record<string, string> = {
  tr: 'tr-TR', en: 'en-US', fa: 'fa-IR', ar: 'ar-SA', ru: 'ru-RU',
  es: 'es-ES', pt: 'pt-BR', de: 'de-DE', fr: 'fr-FR',
};

/**
 * İşlem notu kutusu: yaz, söyle ya da söylediğini düzelttir.
 *
 * Sesle not tutmak yazmaktan hızlı, ama konuşma tanıma noktalama koymaz ve
 * bazı kelimeleri yanlış duyar. "Düzelt" o metni okunur hale getirir;
 * anlatılanı değiştirmez, sadece yazımını toparlar.
 */
export default function NoteField({ value, onChange, placeholder, height = '190px', style }: NoteFieldProps) {
  const { getToken } = useAuth();
  const { language } = useLanguage();
  const tr = (a: string, b: string) => (language === 'tr' ? a : b);

  const [listening, setListening] = useState(false);
  const [tidying, setTidying] = useState(false);
  /** Kaydedilen ses sunucuda yazıya çevriliyor. */
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Düzeltmeden önceki hâli — beğenmezse geri alsın. */
  const [before, setBefore] = useState<string | null>(null);

  /** Dikte sırasında gerçekten konuşuldu mu — boşuna düzeltme çağırmayalım. */
  const spokeRef = useRef(false);
  const failedRef = useRef(false);
  const recRef = useRef<any>(null);
  // Dikte sırasında kutunun başlangıç metni; üstüne ekleyerek gideriz.
  const baseRef = useRef('');
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);

  // Kayıt yolu
  const mediaRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Yerleşik tanıma hata verdi; bittiği anda kayda geçilecek. */
  const switchRef = useRef(false);

  useEffect(() => () => {
    try { recRef.current?.stop(); } catch { /* zaten durmuş */ }
    try { mediaRef.current?.stream?.getTracks().forEach((t: MediaStreamTrack) => t.stop()); } catch { /* yok */ }
  }, []);

  const micDenied = () => setError(tr(
    'Mikrofon izni verilmedi. Adres çubuğundaki kilit simgesinden açabilirsin.',
    'Microphone permission was denied. You can allow it from the padlock in the address bar.'));

  const startRecording = async () => {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      micDenied();
      return;
    }
    const mime = pickMime();
    const MR = (window as any).MediaRecorder;
    const rec = mime ? new MR(stream, { mimeType: mime }) : new MR(stream);
    chunksRef.current = [];
    rec.ondataavailable = (e: any) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      setListening(false);
      transcribe(new Blob(chunksRef.current, { type: rec.mimeType || mime || 'audio/webm' }));
    };
    mediaRef.current = rec;
    rec.start(1000);
    setListening(true);
    stopTimerRef.current = setTimeout(() => { if (rec.state === 'recording') rec.stop(); }, MAX_RECORD_MS);
  };

  async function transcribe(blob: Blob) {
    // Yarım saniyelik bir dokunuş: gönderecek bir şey yok.
    if (blob.size < 2000) { setTranscribing(false); return; }
    setTranscribing(true);
    setError(null);
    try {
      const audio = await blobToBase64(blob);
      const token = await getToken();
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ audio, mime: blob.type, language }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(res.status === 413
          ? tr('Kayıt çok uzun. Notu birkaç parçada söyle.', 'The recording is too long. Say it in a few parts.')
          : data.error || `HTTP ${res.status}`);
      }
      const text = String(data.text || '').trim();
      if (!text) {
        setError(tr('Ses algılanamadı.', 'Could not capture audio.'));
        return;
      }
      const next = (valueRef.current ? valueRef.current.replace(/\s*$/, '') + ' ' : '') + text;
      // tidy() kutunun değerini ref'ten okuyor; render'ı beklemeden güncelliyoruz.
      valueRef.current = next;
      onChange(next);
      setTranscribing(false);
      await tidy();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTranscribing(false);
    }
  }

  const startListening = () => {
    if (liveUnusable()) {
      if (CanRecord) startRecording();
      return;
    }
    setError(null);
    const rec = new Recognition();
    rec.lang = LOCALE[language] || 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    // Terimi doğru yazan okuma ikinci sırada olabiliyor; bestReading seçiyor.
    rec.maxAlternatives = 3;

    baseRef.current = valueRef.current ? valueRef.current.replace(/\s*$/, '') + ' ' : '';
    spokeRef.current = false;
    failedRef.current = false;

    rec.onresult = (e: any) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += bestReading(e.results[i], language);
      if (text.trim().length > 0) spokeRef.current = true;
      onChange(baseRef.current + text);
    };
    rec.onerror = (e: any) => {
      setListening(false);
      failedRef.current = true;
      if (e.error === 'not-allowed') {
        micDenied();
      } else if (CanRecord && ['network', 'service-not-allowed', 'language-not-supported'].includes(e.error)) {
        // Tanıma bu tarayıcıda sonuç vermiyor (Brave türevleri, bazı Edge
        // sürümleri). Kullanıcıya hata göstermeden kayda geçiyoruz ve bunu
        // hatırlıyoruz; bir dahakine hiç denemeyiz.
        try { localStorage.setItem(MODE_KEY, 'record'); } catch { /* önemsiz */ }
        switchRef.current = true;
      } else if (e.error !== 'aborted' && e.error !== 'no-speech') {
        setError(tr('Ses algılanamadı.', 'Could not capture audio.'));
      }
    };
    // Konuşma bitince yazımı kendiliğinden düzeltiriz. Sesle not tutan herkes
    // zaten bunu istiyor; ayrıca bir düğmeye basmasını beklemenin anlamı yok.
    rec.onend = () => {
      setListening(false);
      if (switchRef.current) {
        switchRef.current = false;
        startRecording();
        return;
      }
      if (spokeRef.current && !failedRef.current) tidy();
    };

    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError(tr('Dikte başlatılamadı.', 'Could not start dictation.'));
    }
  };

  const stopListening = () => {
    if (mediaRef.current?.state === 'recording') {
      // Çeviri onstop'ta başlıyor; arada "Yazımı düzelt" bir kare görünmesin.
      setTranscribing(true);
      mediaRef.current.stop();
      return;
    }
    try { recRef.current?.stop(); } catch { /* zaten durmuş */ }
    setListening(false);
    // Düzeltme onend'de başlıyor; arada bir kare "Yazımı düzelt" bağlantısı
    // görünmesin diye durumu şimdiden alıyoruz.
    if (spokeRef.current && !failedRef.current) setTidying(true);
  };

  async function tidy() {
    const raw = valueRef.current.trim();
    if (raw.length < 2) return;
    // Terim sözlüğü yapay zekâdan önce ve ondan bağımsız çalışır: kota bitse,
    // internet gitse de "order bloğu" doğru yazılır.
    const text = fixTerms(raw, language);
    if (text !== raw) onChange(text);
    setTidying(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/tidy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text, language }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setBefore(raw);
      // Model de terimleri kendince yazabiliyor; son sözü sözlük söylesin.
      onChange(fixTerms(data.text, language));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTidying(false);
    }
  }

  const undo = () => {
    if (before == null) return;
    onChange(before);
    setBefore(null);
  };

  const chip: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '5px 11px', borderRadius: '999px', fontSize: '12.5px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.6)', transition: 'all 150ms',
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...style, height, resize: 'vertical', padding: '14px', lineHeight: 1.65 }}
      />

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {(Recognition || CanRecord) && (
          <button type="button" onClick={listening ? stopListening : startListening}
            style={listening
              ? { ...chip, background: 'rgba(248,113,113,0.15)', borderColor: 'rgba(248,113,113,0.35)', color: '#f87171' }
              : chip}>
            {listening ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {listening ? tr('Durdur', 'Stop') : tr('Konuşarak yaz', 'Dictate')}
          </button>
        )}

        {/* Dikte bitince düzeltme kendiliğinden olur. Bu bağlantı yazarak not
            tutan için: adı ne yaptığını söylüyor, "Düzelt" ise söylemiyordu. */}
        {!listening && !tidying && !transcribing && before == null && value.trim().length > 1 && (
          <button type="button" onClick={tidy}
            className="ui-pill flex items-center gap-1.5 text-[12.5px]"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Wand2 className="w-3.5 h-3.5" />
            {tr('Yazımı düzelt', 'Fix the writing')}
          </button>
        )}

        {listening && (
          <span className="flex items-center gap-1.5 text-[12.5px]" style={{ color: '#f87171' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#f87171' }} />
            {tr('Dinliyor…', 'Listening…')}
          </span>
        )}

        {transcribing && (
          <span className="flex items-center gap-1.5 text-[12.5px]" style={{ color: '#a78bfa' }}>
            <Loader className="w-3.5 h-3.5 animate-spin" />
            {tr('Yazıya çevriliyor…', 'Transcribing…')}
          </span>
        )}

        {tidying && (
          <span className="flex items-center gap-1.5 text-[12.5px]" style={{ color: '#a78bfa' }}>
            <Loader className="w-3.5 h-3.5 animate-spin" />
            {tr('Yazım düzeltiliyor…', 'Fixing the writing…')}
          </span>
        )}

        {before != null && !tidying && (
          <span className="flex items-center gap-3 text-[12.5px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {tr('Yazım düzeltildi', 'Writing tidied')}
            <button type="button" onClick={undo} className="flex items-center gap-1.5" style={{ color: '#a78bfa' }}>
              <Undo2 className="w-3.5 h-3.5" />
              {tr('Geri al', 'Undo')}
            </button>
          </span>
        )}
      </div>

      {error && (
        <p className="text-[12px] mt-2" style={{ color: '#f87171' }}>{error}</p>
      )}
      {!Recognition && !CanRecord && (
        <p className="text-[11.5px] mt-2" style={{ color: 'rgba(255,255,255,0.28)' }}>
          {tr('Konuşarak yazma bu tarayıcıda çalışmıyor — güncel bir tarayıcı kullan.',
              'Dictation is not available in this browser — use an up-to-date browser.')}
        </p>
      )}
    </div>
  );
}

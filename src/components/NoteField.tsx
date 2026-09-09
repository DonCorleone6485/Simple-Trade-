import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Wand2, Undo2, Loader } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';

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

  useEffect(() => () => { try { recRef.current?.stop(); } catch { /* zaten durmuş */ } }, []);

  const startListening = () => {
    if (!Recognition) return;
    setError(null);
    const rec = new Recognition();
    rec.lang = LOCALE[language] || 'en-US';
    rec.continuous = true;
    rec.interimResults = true;

    baseRef.current = valueRef.current ? valueRef.current.replace(/\s*$/, '') + ' ' : '';
    spokeRef.current = false;
    failedRef.current = false;

    rec.onresult = (e: any) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      if (text.trim().length > 0) spokeRef.current = true;
      onChange(baseRef.current + text);
    };
    rec.onerror = (e: any) => {
      setListening(false);
      failedRef.current = true;
      if (e.error === 'not-allowed') {
        setError(tr('Mikrofon izni verilmedi. Adres çubuğundaki kilit simgesinden açabilirsin.',
                    'Microphone permission was denied. You can allow it from the padlock in the address bar.'));
      } else if (e.error !== 'aborted' && e.error !== 'no-speech') {
        setError(tr('Ses algılanamadı.', 'Could not capture audio.'));
      }
    };
    // Konuşma bitince yazımı kendiliğinden düzeltiriz. Sesle not tutan herkes
    // zaten bunu istiyor; ayrıca bir düğmeye basmasını beklemenin anlamı yok.
    rec.onend = () => {
      setListening(false);
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
    try { recRef.current?.stop(); } catch { /* zaten durmuş */ }
    setListening(false);
    // Düzeltme onend'de başlıyor; arada bir kare "Yazımı düzelt" bağlantısı
    // görünmesin diye durumu şimdiden alıyoruz.
    if (spokeRef.current && !failedRef.current) setTidying(true);
  };

  async function tidy() {
    const text = valueRef.current.trim();
    if (text.length < 2) return;
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
      setBefore(text);
      onChange(data.text);
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
        {Recognition && (
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
        {!listening && !tidying && before == null && value.trim().length > 1 && (
          <button type="button" onClick={tidy}
            className="flex items-center gap-1.5 text-[12.5px]"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#a78bfa'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}>
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
      {!Recognition && (
        <p className="text-[11.5px] mt-2" style={{ color: 'rgba(255,255,255,0.28)' }}>
          {tr('Konuşarak yazma bu tarayıcıda çalışmıyor — Chrome, Edge ya da Safari kullan.',
              'Dictation is not available in this browser — use Chrome, Edge or Safari.')}
        </p>
      )}
    </div>
  );
}

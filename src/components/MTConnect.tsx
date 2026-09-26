import React, { useEffect, useState } from 'react';
import { Plug, Copy, Check, Trash2, KeyRound, AlertTriangle, Loader, Download } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';
import MTSetupTour from './MTSetupTour';

interface ApiKey {
  id: string;
  journal_id: string;
  key_hint: string;
  label: string | null;
  created_at: string;
  last_used_at: string | null;
}

interface MTConnectProps {
  journalId: string;
  journalName: string;
}

/**
 * MetaTrader köprüsünün kurulum ekranı.
 *
 * Terminaldeki EA tarayıcı gibi giriş yapamaz; onun yerine bu journal'a bağlı
 * bir anahtar taşır. Anahtar yalnızca üretildiği anda görünür — sunucuda
 * özeti saklanır, sonradan bir daha okunamaz.
 */
export default function MTConnect({ journalId, journalName }: MTConnectProps) {
  const { getToken } = useAuth();
  const { language } = useLanguage();
  const tr = (a: string, b: string) => (language === 'tr' ? a : b);

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = async (method: 'GET' | 'POST', body?: unknown) => {
    const token = await getToken();
    const res = await fetch('/api/keys', {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  };

  const load = async () => {
    try {
      const data = await call('GET');
      setKeys((data.keys || []).filter((k: ApiKey) => k.journal_id === journalId));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [journalId]);

  const create = async () => {
    setCreating(true);
    try {
      const data = await call('POST', { action: 'create', journalId, label: journalName });
      setFresh(data.key);
      setError(null);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (keyId: string) => {
    if (!confirm(tr('Bu anahtar iptal edilsin mi? Onu kullanan EA işlem gönderemez.',
                    'Revoke this key? Any EA using it will stop sending trades.'))) return;
    try {
      await call('POST', { action: 'revoke', keyId });
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const copy = async () => {
    if (!fresh) return;
    try {
      await navigator.clipboard.writeText(fresh);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* pano kapalı olabilir; kullanıcı elle seçer */ }
  };

  const card: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '18px',
  };
  const label: React.CSSProperties = {
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em',
    color: 'rgba(255,255,255,0.3)', marginBottom: '10px',
  };

  const fmt = (iso: string | null) => {
    if (!iso) return tr('hiç', 'never');
    return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US',
      { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  };

  /**
   * Anahtar, kurulumun 4. adımında — tam kullanılacağı yerde — üretiliyor.
   * Düğme eskiden sayfanın en üstündeydi; kullanıcı 4. adıma gelince
   * "anahtarı yapıştır" okuyup yukarı dönmek zorunda kalıyordu. Yeni anahtar
   * da düğmenin hemen altında beliriyor, gözden kaçmasın.
   */
  const keyBlock = (
    <div className="mt-3">
      <button onClick={create} disabled={creating}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50"
        style={{ background: '#8b5cf6', color: '#fff' }}>
        {creating ? <Loader className="w-4 h-4 animate-spin" /> : <Plug className="w-4 h-4" />}
        {tr('Anahtar Oluştur', 'Create Key')}
      </button>
      {fresh && (
        <div className="mt-4 rounded-xl p-5" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="w-4 h-4" style={{ color: '#34d399' }} />
            <span className="text-sm font-semibold" style={{ color: '#34d399' }}>
              {tr('Anahtarın hazır — şimdi kopyala', 'Your key is ready — copy it now')}
            </span>
          </div>
          <p className="text-[13px] mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {tr('Bu anahtarı bir daha gösteremeyiz; sunucuda yalnızca özeti duruyor. Kaybedersen yenisini üretirsin.',
                'We cannot show this again — only its hash is stored. If you lose it, create a new one.')}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-[13px] px-3 py-2.5 rounded-lg overflow-x-auto whitespace-nowrap"
              style={{ background: 'rgba(0,0,0,0.35)', color: '#fff' }}>
              {fresh}
            </code>
            <button onClick={copy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium flex-shrink-0"
              style={{ background: copied ? 'rgba(52,211,153,0.2)' : '#8b5cf6', color: '#fff' }}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? tr('Kopyalandı', 'Copied') : tr('Kopyala', 'Copy')}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h2 className="font-display text-[24px] mb-3" style={{ letterSpacing: '-0.02em' }}>
          {tr('MetaTrader Bağlantısı', 'MetaTrader Connection')}
        </h2>
        <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {tr(
            `MetaTrader 5'e kuracağın küçük bir eklenti, açtığın pozisyonları "${journalName}" journal'ına anında yazar ve kapandıklarında aynı kayıtları sonuçla tamamlar. Rapor indirip yüklemene gerek kalmaz.`,
            `A small add-on installed in MetaTrader 5 writes your closed trades into "${journalName}" on its own. No more exporting and uploading reports.`
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4" style={{ color: '#f87171' }} />
            <span className="text-sm font-semibold" style={{ color: '#f87171' }}>{tr('Hata', 'Error')}</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{error}</p>
        </div>
      )}

      {/* Mevcut anahtarlar */}
      <div style={card} className="p-6">
        <div className="mb-5">
          <span style={label}>{tr('Anahtarlar', 'Keys')}</span>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{tr('Yükleniyor…', 'Loading…')}</p>
        ) : keys.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {tr('Bu journal için henüz anahtar yok.', 'No key for this journal yet.')}
          </p>
        ) : (
          <ul>
            {keys.map((k, i) => (
              <li key={k.id} className="flex items-center gap-4 py-3"
                style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                <code className="font-mono text-[15px] px-2.5 py-1 rounded-lg" style={{ color: '#fff', background: 'rgba(0,0,0,0.3)' }}>{k.key_hint}</code>
                {/* "Aktif": uzman son bir haftada bu anahtarla veri göndermiş. */}
                {k.last_used_at && Date.now() - new Date(k.last_used_at).getTime() < 7 * 86400000 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
                    {tr('Aktif', 'Active')}
                  </span>
                )}
                <span className="text-[12px] ms-auto" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {tr('son kullanım', 'last used')}: {fmt(k.last_used_at)}
                </span>
                <button onClick={() => revoke(k.id)} className="ui-pill ui-pill-danger p-1.5 rounded-lg flex-shrink-0"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                  title={tr('İptal et', 'Revoke')}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {/* Anahtarın tamamı sunucuda hiç saklanmıyor, yalnızca özeti — o yüzden
            burada sadece ipucu var. Neden görünmediğini söylemezsek kullanıcı
            bunu bir eksik sanıyor. */}
        <p className="text-[12.5px] leading-relaxed mt-4 pt-4" style={{ color: 'rgba(255,255,255,0.35)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {tr('Güvenlik için anahtarın tamamı saklanmaz, yalnızca ilk ve son harfleri görünür. MetaTrader anahtarı zaten hatırlar; kaybettiysen 4. adımdan yenisini oluştur ve eskisini buradan iptal et.',
              'For security the full key is never stored; only its first and last characters are shown. MetaTrader remembers the key anyway; if you lose it, create a new one in step 4 and revoke the old one here.')}
        </p>
      </div>

      {/* Kurulum. Tur, aşağıdaki dört maddenin aynısını oynatır; ayrı bir
          bölüm olarak değil, kartın kapağı olarak duruyor. */}
      <div style={card} className="p-6">
        <div className="tour-flush">
          <MTSetupTour />
        </div>
        <div style={label}>{tr('Kurulum', 'Setup')}</div>
        <ol className="space-y-5">
          {[
            {
              t: tr('Dosyayı indir', 'Download the file'),
              d: tr('MetaTrader\'da Dosya → Veri Klasörünü Aç. Açılan pencerede MQL5 → Experts klasörüne gir ve indirdiğin dosyayı içine at.',
                    'In MetaTrader open File → Open Data Folder, go into MQL5 → Experts, and drop the downloaded file in.'),
              download: '/SimpleTradingJournal.ex5',
            },
            {
              t: tr('İzin ver', 'Allow the connection'),
              d: tr('Araçlar → Seçenekler → Uzman Danışmanlar sekmesi. "Listelenen URL\'ler için WebRequest\'e izin ver" kutusunu işaretle, alttaki listeye şu adresi ekle:',
                    'Tools → Options → Expert Advisors. Tick "Allow WebRequest for listed URL" and add this address to the list:'),
              code: 'https://www.simpletradejournal.io',
            },
            {
              t: tr('MetaTrader\'ı yeniden başlat', 'Restart MetaTrader'),
              d: tr('Kapat, tekrar aç. Soldaki Kılavuz panelinde Uzman Danışmanlar altında SimpleTradingJournal görünecek.',
                    'Close it and open it again. SimpleTradingJournal will appear under Expert Advisors in the Navigator panel on the left.'),
            },
            {
              t: tr('Grafiğe sürükle ve anahtarı yapıştır', 'Drag it onto a chart and paste the key'),
              d: tr('SimpleTradingJournal\'ı bir grafiğin üstüne sürükle. Açılan pencerede Girdiler sekmesine geç, ApiKey satırına aşağıdaki düğmeyle oluşturduğun anahtarı yapıştır, Tamam. Grafiğin sol üstünde "Baglanti tamam" yazısı belirir.',
                    'Drag SimpleTradingJournal onto a chart. In the window that opens, go to the Inputs tab, paste the key you create with the button below into ApiKey, and click OK. "Connected" appears at the top-left of the chart.'),
              extra: (<>
                {keyBlock}
                <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.18)' }}>
                  <div className="text-[14px] font-medium mb-2" style={{ color: '#c4b5fd' }}>
                    {tr('Hangi grafiğe koymalıyım?', 'Which chart should it go on?')}
                  </div>
                  <p className="text-[13.5px] leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {tr('MetaTrader bir grafikte aynı anda yalnızca bir uzman danışman (EA) çalıştırır. Başka bir EA kullanıyorsan (örneğin Position Sizer) iki yolun var:',
                        'MetaTrader runs only one expert advisor (EA) per chart. If you already use another EA (Position Sizer, for example), you have two options:')}
                  </p>
                  <div className="space-y-3 text-[13.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <div>
                      <span className="font-medium" style={{ color: '#fff' }}>{tr('Sürekli çalışsın — önerilen. ', 'Always on — recommended. ')}</span>
                      {tr('Yeni, boş bir grafik aç ve eklentiyi oraya koy. O grafik açık kaldıkça kapanan her işlem kendiliğinden journal\'a gelir. İşlemlerini diğer grafiklerde her zamanki gibi yapmaya devam edersin.',
                          'Open a new, empty chart and put the add-on there. As long as that chart stays open, every closed trade reaches your journal by itself. Keep trading on your other charts as usual.')}
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: '#fff' }}>{tr('Sadece istediğimde güncellensin. ', 'Only when I want. ')}</span>
                      {tr('Eklentiyi, diğer EA\'nı kullandığın grafiğe at. Journal o anda güncellenir — arada kapanmış işlemler dahil — ama o grafikteki diğer EA kaldırılır. Onu geri koyduğunda bizimki kalkar ve bir dahaki sefere kadar güncelleme olmaz. Anahtarı her seferinde yeniden sormaz. Bazı EA\'lar grafikten kaldırılınca kendi ayarlarını sıfırlar; bunu göz önünde bulundur.',
                          'Drop the add-on onto the chart where your other EA runs. Your journal updates right then — including trades closed in between — but the other EA is removed. Put that one back and ours is removed, with no updates until next time. It will not ask for the key again. Some EAs reset their own settings when removed from a chart, so keep that in mind.')}
                    </div>
                  </div>
                </div>
              </>),
            },
          ].map((s: { t: string; d: string; code?: string; download?: string; extra?: React.ReactNode }, i: number) => (
            <li key={i} className="flex gap-4">
              <span className="font-display flex-shrink-0" style={{ fontSize: '22px', color: 'rgba(255,255,255,0.18)', lineHeight: 1.2 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <div className="text-[15px] font-medium mb-1.5">{s.t}</div>
                <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.d}</p>
                {s.code && (
                  <code className="inline-block mt-2.5 font-mono text-[13px] px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.3)', color: '#a78bfa' }}>
                    {s.code}
                  </code>
                )}
                {s.download && (
                  <a href={s.download} download
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-medium"
                    style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                    <Download className="w-4 h-4" />
                    SimpleTradingJournal.ex5
                  </a>
                )}
                {s.extra}
              </div>
            </li>
          ))}
        </ol>
        <p className="text-[13px] leading-relaxed mt-6 pt-5" style={{ color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {tr(
            'Mac kullanıyorsan "Veri Klasörünü Aç" bazı sürümlerde çalışmaz. O zaman Finder\'da Git → Klasöre Git ile şuraya gidebilirsin: ~/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts',
            'On a Mac, "Open Data Folder" does not work in some builds. In Finder use Go → Go to Folder and paste: ~/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Experts'
          )}
        </p>
      </div>
    </div>
  );
}

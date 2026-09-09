import React, { useEffect, useState } from 'react';
import { Plug, Copy, Check, Trash2, KeyRound, AlertTriangle, Loader, Download } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';

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

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h2 className="font-display text-[24px] mb-3" style={{ letterSpacing: '-0.02em' }}>
          {tr('MetaTrader Bağlantısı', 'MetaTrader Connection')}
        </h2>
        <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {tr(
            `MetaTrader 5'e kuracağın küçük bir eklenti, kapanan işlemleri "${journalName}" journal'ına kendiliğinden yazar. Rapor indirip yüklemene gerek kalmaz.`,
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

      {/* Yeni üretilen anahtar — bir kez gösterilir. */}
      {fresh && (
        <div className="rounded-xl p-5" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
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

      {/* Mevcut anahtarlar */}
      <div style={card} className="p-6">
        <div className="flex items-center justify-between mb-5">
          <span style={label}>{tr('Anahtarlar', 'Keys')}</span>
          <button onClick={create} disabled={creating}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50"
            style={{ background: '#8b5cf6', color: '#fff' }}>
            {creating ? <Loader className="w-4 h-4 animate-spin" /> : <Plug className="w-4 h-4" />}
            {tr('Anahtar Oluştur', 'Create Key')}
          </button>
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
                <code className="font-mono text-[13px]" style={{ color: 'rgba(255,255,255,0.75)' }}>{k.key_hint}</code>
                <span className="text-[12px] ms-auto" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {tr('son kullanım', 'last used')}: {fmt(k.last_used_at)}
                </span>
                <button onClick={() => revoke(k.id)} className="p-1.5 rounded-lg flex-shrink-0"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'; }}
                  title={tr('İptal et', 'Revoke')}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Kurulum */}
      <div style={card} className="p-6">
        <div style={label}>{tr('Kurulum', 'Setup')}</div>
        <ol className="space-y-5">
          {[
            {
              t: tr('MetaTrader\'da izin ver', 'Allow the connection in MetaTrader'),
              d: tr('Araçlar → Seçenekler → Uzman Danışmanlar sekmesi. "Listelenen URL\'ler için WebRequest\'e izin ver" kutusunu işaretle ve alttaki listeye şu adresi ekle:',
                    'Tools → Options → Expert Advisors. Tick "Allow WebRequest for listed URL" and add this address to the list below:'),
              code: 'https://www.simpletradejournal.io',
            },
            {
              t: tr('Eklentiyi kur', 'Install the add-on'),
              d: tr('Dosyayı indir ve MetaTrader\'da Dosya → Veri Klasörünü Aç → MQL5 → Experts içine koy. MetaEditor\'de aç, F7 ile derle. Sonra MetaTrader\'da Gezgin panelinden herhangi bir grafiğe sürükle.',
                    'Download it, then in MetaTrader open File → Open Data Folder → MQL5 → Experts and drop it in. Open it in MetaEditor and compile with F7. Then drag it onto any chart from the Navigator.'),
              download: '/SimpleTradingJournal.mq5',
            },
            {
              t: tr('Anahtarı yapıştır', 'Paste the key'),
              d: tr('Eklenti grafiğe eklenirken açılan ayar penceresinde yukarıdaki anahtarı ilgili alana yapıştır. Hepsi bu — kapanan işlemler birkaç saniye içinde journal\'a düşer.',
                    'In the settings window that opens, paste the key above. That is all — closed trades reach the journal within seconds.'),
            },
          ].map((s: { t: string; d: string; code?: string; download?: string }, i: number) => (
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
                    SimpleTradingJournal.mq5
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

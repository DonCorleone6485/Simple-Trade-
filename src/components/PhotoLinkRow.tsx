import React, { useState } from 'react';
import { Loader, Link as LinkIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * "Resim bağlantısını yapıştır" satırı.
 *
 * Ekran görüntüsünü indirip tekrar yüklemek uğraştırıcı; bağlantısını
 * yapıştırmak yetiyor. Bağlantı herhangi bir yerden gelebilir — TradingView,
 * MetaTrader, Imgur, kendi sunucun. Resim bizim depomuza kopyalanıyor, yani
 * bağlantı ileride ölse bile fotoğraf journal'da kalıyor.
 *
 * Hem yeni işlem formunda hem işlem düzenlemede kullanılıyor: ikisinde de
 * aynı kutu, aynı hata metni.
 */
export default function PhotoLinkRow({ onAdd }: {
  /** Hata mesajı döndürür; sorun yoksa null. */
  onAdd: (url: string) => Promise<string | null>;
}) {
  const { t } = useLanguage();
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const v = link.trim();
    if (!v || busy) return;
    setBusy(true);
    setError('');
    const err = await onAdd(v);
    setBusy(false);
    if (err) setError(err); else setLink('');
  };

  return (
    <div>
      <div className="flex gap-2">
        <input type="url" value={link} onChange={e => { setLink(e.target.value); setError(''); }}
          // Enter'ın formu göndermesini engelliyoruz: kullanıcı fotoğraf
          // eklemek isterken işlemi kaydetmiş olmasın.
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
          placeholder={t('photoLinkPlaceholder')} disabled={busy}
          className="flex-1 min-w-0 text-sm px-3.5 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', outline: 'none' }} />
        <button type="button" onClick={submit} disabled={!link.trim() || busy}
          className="ui-pill px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 flex-shrink-0 disabled:opacity-40"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)' }}>
          {busy ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <LinkIcon className="w-3.5 h-3.5" />}
          {t('photoLinkAdd')}
        </button>
      </div>
      {error && <p className="text-[12px] mt-2" style={{ color: '#f87171' }}>{error}</p>}
    </div>
  );
}

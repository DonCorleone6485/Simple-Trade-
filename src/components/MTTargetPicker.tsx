import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { pick } from '../lib/appCopy';
import { aria } from '../lib/aria';
import { X, Plug, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * MetaTrader'ı journal listesinden bağlarken ilk adım: hangi journal?
 *
 * İçe aktarmadaki akışın aynısı — yeni bir journal ya da mevcutlardan biri.
 * Bir journal'ın içinden basıldığında bu pencere hiç açılmıyor; hedef zaten
 * o journal ve doğrudan bağlantı sayfasına gidiliyor.
 *
 * Varsayılan "yeni journal" ve listede hiçbir journal önceden seçili değil:
 * önce ilk journal seçili geliyordu, kullanıcı fark etmeden Devam'a basıp
 * MetaTrader'ı yanlış journal'a bağlıyordu.
 *
 * MetaTrader'ın zaten bağlı olduğu journal'lar en üstte ayrıca gösteriliyor
 * (anahtar hangi journal'da oluşturulduysa o): çoğu kişi bu pencereyi yeni
 * bağlantı kurmak için değil, kurduğu bağlantıya dönmek için açıyor.
 */
export type MTTarget = { kind: 'new'; name: string } | { kind: 'existing'; journalId: string };

export default function MTTargetPicker({ journals, onChoose, onClose }: {
  journals: { id: string; name: string }[];
  onChoose: (target: MTTarget) => void;
  onClose: () => void;
}) {
  const { language, t } = useLanguage();
  const tr = (a: string, b: string, ...args: (string | number | null | undefined)[]) => pick(language, a, b, ...args);
  const [target, setTarget] = useState<'new' | 'existing'>('new');
  const [name, setName] = useState('');
  const [picked, setPicked] = useState('');
  const ready = target === 'new' ? name.trim().length > 0 : !!picked;

  // Anahtarı olan journal'lar: hangi MT hesabı, veri gelmiş mi.
  const { getToken } = useAuth();
  const [linked, setLinked] = useState<{ journalId: string; hint: string | null; used: boolean }[]>([]);
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const token = await getToken();
        const r = await fetch('/api/keys', { headers: { Authorization: `Bearer ${token}` } });
        const data = await r.json();
        const byJournal = new Map<string, { journalId: string; hint: string | null; used: boolean }>();
        for (const k of data.keys || []) {
          if (!journals.some(j => j.id === k.journal_id)) continue;
          const prev = byJournal.get(k.journal_id);
          if (!prev || (!prev.hint && k.mt_hint)) byJournal.set(k.journal_id, { journalId: k.journal_id, hint: k.mt_hint || null, used: !!k.last_used_at });
        }
        if (live) setLinked([...byJournal.values()]);
      } catch { /* liste yüklenemezse pencere eskisi gibi çalışır */ }
    })();
    return () => { live = false; };
  }, []);
  const linkedIds = new Set(linked.map(l => l.journalId));
  const nameOf = (id: string) => journals.find(j => j.id === id)?.name || '';

  const option = (on: boolean): React.CSSProperties => on
    ? { background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)' }
    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' };
  const radio = (on: boolean) => (
    <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
      style={{ border: `2px solid ${on ? '#8b5cf6' : 'rgba(255,255,255,0.25)'}` }}>
      {on && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#8b5cf6' }} />}
    </span>
  );
  const field: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', borderRadius: '12px', padding: '10px 14px',
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="w-full max-w-lg my-16 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-[22px] font-medium text-white flex items-center gap-2.5">
              <Plug className="w-5 h-5" style={{ color: '#a78bfa' }} />
              {tr('MetaTrader Bağlantısı', 'MetaTrader Connection')}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {tr('İşlemler hangi journal\'a yazılsın?', 'Which journal should the trades go to?')}
            </p>
          </div>
          <button onClick={onClose} aria-label={aria('close', language)} className="p-2 rounded-lg" style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {linked.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: '#1a1b2e', border: '1px solid rgba(52,211,153,0.2)' }}>
            <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {tr('MetaTrader zaten bağlı', 'MetaTrader already connected')}
            </div>
            <div className="space-y-2">
              {linked.map(l => (
                <button key={l.journalId} type="button" onClick={() => onChoose({ kind: 'existing', journalId: l.journalId })}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-start"
                  style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.used ? '#34d399' : 'rgba(255,255,255,0.3)' }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-white truncate">{nameOf(l.journalId)}</span>
                    <span className="block text-[12px] font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {l.hint || tr('henüz veri gelmedi', 'no data received yet')}
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 rtl:rotate-180" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-2xl p-5" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.05)' }}>
          {linked.length > 0 && (
            <div className="text-[11px] uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {tr('Yeni bağlantı', 'New connection')}
            </div>
          )}
          <button type="button" onClick={() => setTarget('new')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-start" style={option(target === 'new')}>
            {radio(target === 'new')}
            <span className="text-sm" style={{ color: target === 'new' ? '#fff' : 'rgba(255,255,255,0.6)' }}>{t('importToNew')}</span>
          </button>
          {target === 'new' && (
            <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={t('journalNamePlaceholder')} className="w-full outline-none text-sm" style={field} />
          )}

          {journals.length > 0 && (
            <button type="button" onClick={() => setTarget('existing')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-start" style={option(target === 'existing')}>
              {radio(target === 'existing')}
              <span className="text-sm" style={{ color: target === 'existing' ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                {tr('Mevcut journal\'ı bağla', 'Connect an existing journal')}
              </span>
            </button>
          )}
          {target === 'existing' && journals.length > 0 && (
            <select value={picked} onChange={e => setPicked(e.target.value)} className="w-full outline-none text-sm" style={{ ...field, color: picked ? '#fff' : 'rgba(255,255,255,0.45)' }}>
              <option value="" disabled style={{ background: '#1a1b2e', color: 'rgba(255,255,255,0.45)' }}>{tr('Bir journal seç…', 'Choose a journal…')}</option>
              {journals.map(j => <option key={j.id} value={j.id} style={{ background: '#1a1b2e', color: '#fff' }}>{j.name}{linkedIds.has(j.id) ? ` · ${tr('MetaTrader bağlı', 'MetaTrader connected')}` : ''}</option>)}
            </select>
          )}

          <div className="flex justify-end pt-3">
            <button disabled={!ready}
              onClick={() => ready && onChoose(target === 'new' ? { kind: 'new', name: name.trim() } : { kind: 'existing', journalId: picked })}
              className="cta px-6 py-2 text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#8b5cf6', color: '#fff' }}>
              {tr('Devam', 'Continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

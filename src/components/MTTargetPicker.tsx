import React, { useState } from 'react';
import { pick } from '../lib/appCopy';
import { aria } from '../lib/aria';
import { X, Plug } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * MetaTrader'ı journal listesinden bağlarken ilk adım: hangi journal?
 *
 * İçe aktarmadaki akışın aynısı — yeni bir journal ya da mevcutlardan biri.
 * Bir journal'ın içinden basıldığında bu pencere hiç açılmıyor; hedef zaten
 * o journal ve doğrudan bağlantı sayfasına gidiliyor.
 */
export type MTTarget = { kind: 'new'; name: string } | { kind: 'existing'; journalId: string };

export default function MTTargetPicker({ journals, onChoose, onClose }: {
  journals: { id: string; name: string }[];
  onChoose: (target: MTTarget) => void;
  onClose: () => void;
}) {
  const { language, t } = useLanguage();
  const tr = (a: string, b: string, ...args: (string | number | null | undefined)[]) => pick(language, a, b, ...args);
  const [target, setTarget] = useState<'new' | 'existing'>(journals.length > 0 ? 'existing' : 'new');
  const [name, setName] = useState('');
  const [picked, setPicked] = useState(journals[0]?.id || '');
  const ready = target === 'new' ? name.trim().length > 0 : !!picked;

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

        <div className="space-y-2 rounded-2xl p-5" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.05)' }}>
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
            <select value={picked} onChange={e => setPicked(e.target.value)} className="w-full outline-none text-sm" style={field}>
              {journals.map(j => <option key={j.id} value={j.id} style={{ background: '#1a1b2e', color: '#fff' }}>{j.name}</option>)}
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

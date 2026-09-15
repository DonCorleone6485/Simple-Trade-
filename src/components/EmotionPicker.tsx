import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { DEFAULT_EMOTIONS, emotionLabel, emotionTone, TONE_COLOR } from '../lib/emotions';

/**
 * Duygu durumu seçici — hazır seçenekler ve kullanıcının kendi ekledikleri.
 *
 * Strateji seçicisiyle aynı yapıda; farkı birden çok seçim: insan aynı anda
 * hem yorgun hem sabırsız olabilir. Özel duygular hesaba yazılır ki yeni
 * işlem formunda da düzenleme ekranında da aynı liste görünsün.
 */
export default function EmotionPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [custom, setCustom] = useState<string[]>([]);
  const { user } = useUser();
  const { language } = useLanguage();
  const tr = (a: string, b: string) => (language === 'tr' ? a : b);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /** Kullanıcı listeye dokunduysa geç gelen hesap verisi onu ezmesin. */
  const edited = useRef(false);
  const selected = value || [];
  /**
   * Seçimleri buradan okuyup buraya yazıyoruz: arka arkaya iki satıra
   * tıklanınca `value` henüz tazelenmemiş olur ve ilk seçim kaybolurdu.
   */
  const selectedRef = useRef<string[]>(selected);
  selectedRef.current = selected;
  const commit = (next: string[]) => { selectedRef.current = next; onChange(next); };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('users').select('emotions').eq('user_id', user.id).maybeSingle();
      if (cancelled || edited.current) return;
      const saved = data?.emotions as string[] | null | undefined;
      if (Array.isArray(saved)) setCustom(saved);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setShowInput(false); setInputVal('');
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => { if (showInput) inputRef.current?.focus(); }, [showInput]);

  const persist = async (next: string[]) => {
    edited.current = true;
    setCustom(next);
    if (!user) return;
    await supabase.from('users').upsert({ user_id: user.id, emotions: next }, { onConflict: 'user_id' });
  };

  const toggle = (v: string) => {
    const cur = selectedRef.current;
    commit(cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v]);
  };

  const addCustom = () => {
    const name = inputVal.trim();
    if (!name) return;
    // Hazır bir duygunun adını yazdıysa onu seç, kopyasını açma.
    const preset = DEFAULT_EMOTIONS.find(e =>
      e.tr.toLocaleLowerCase('tr-TR') === name.toLocaleLowerCase('tr-TR') || e.en.toLowerCase() === name.toLowerCase());
    const v = preset ? preset.key : name;
    if (!preset && !custom.includes(name)) persist([...custom, name]);
    if (!selectedRef.current.includes(v)) commit([...selectedRef.current, v]);
    setInputVal(''); setShowInput(false);
  };

  const removeCustom = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    persist(custom.filter(c => c !== name));
    if (selectedRef.current.includes(name)) commit(selectedRef.current.filter(x => x !== name));
  };

  const row = (v: string, removable: boolean) => {
    const on = selected.includes(v);
    const color = TONE_COLOR[emotionTone(v)];
    return (
      <div key={v} className="group flex items-center px-4 py-2 text-sm transition-all"
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
        <button type="button" onClick={() => toggle(v)} className="flex-1 text-start flex items-center gap-2.5">
          <span className="w-4 h-4 rounded flex items-center justify-center text-[10px] flex-shrink-0"
            style={{ border: `1px solid ${on ? color.fg : 'rgba(255,255,255,0.25)'}`, background: on ? color.bg : 'transparent', color: color.fg }}>
            {on ? '✓' : ''}
          </span>
          <span style={{ color: on ? '#fff' : 'rgba(255,255,255,0.75)' }}>{emotionLabel(v, language)}</span>
        </button>
        {removable && (
          <button type="button" onClick={e => removeCustom(v, e)} title={tr('Sil', 'Delete')}
            className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: '#f87171' }}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  const summary = selected.map(v => emotionLabel(v, language)).join(', ');

  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
        <span className="truncate" style={{ color: summary ? '#fff' : 'rgba(255,255,255,0.4)' }}>
          {summary || tr('— Seçin —', '— Select —')}
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.4)' }} />
      </button>

      {open && (
        <div className="absolute top-full start-0 mt-2 w-full z-50 rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: '#12131f', border: '1px solid rgba(255,255,255,0.1)', minWidth: '220px' }}>
          <div className="overflow-y-auto py-1" style={{ maxHeight: '300px' }}>
            {DEFAULT_EMOTIONS.map(e => row(e.key, false))}
            {custom.length > 0 && (
              <div className="px-4 pt-2 pb-1 mt-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.25)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {tr('Kendi Eklediklerin', 'Your Own')}
              </div>
            )}
            {custom.map(c => row(c, true))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {showInput ? (
              <div className="flex items-center gap-2 p-3">
                <input ref={inputRef} type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } if (e.key === 'Escape') { setShowInput(false); setInputVal(''); } }}
                  placeholder={tr('Örn: Heyecanlı', 'e.g. Excited')}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }} />
                <button type="button" onClick={addCustom}
                  className="px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0" style={{ background: '#8b5cf6', color: '#fff' }}>
                  {tr('Ekle', 'Add')}
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setShowInput(true)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-all" style={{ color: '#a78bfa' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.2)' }}>+</span>
                <span>{tr('Kendi Duygunu Ekle', 'Add Your Own')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Kayıtlı duyguların salt-okunur rozetleri — işlem detayında. */
export function EmotionChips({ values }: { values?: string[] }) {
  const { language } = useLanguage();
  if (!values || values.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map(v => {
        const c = TONE_COLOR[emotionTone(v)];
        return (
          <span key={v} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: c.bg, color: c.fg }}>
            {emotionLabel(v, language)}
          </span>
        );
      })}
    </div>
  );
}

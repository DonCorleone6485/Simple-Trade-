import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Strateji seçici — hazır setuplar ve kullanıcının kendi ekledikleri.
 *
 * Hem yeni işlem formu hem düzenleme ekranı bunu kullanır; ayrı bir açılır
 * liste tutulursa kullanıcının kaydettiği setuplar birinde görünüp diğerinde
 * kaybolur.
 */
export const DEFAULT_SETUPS = [
  'FVG', 'OB', 'BOS / ChoCH', 'Liquidity Sweep',
  'EQH / EQL', 'Breaker Block', 'Mitigation',
  'VWAP', 'Trend Pullback', 'Range Breakout',
];

export default function SetupPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const { user } = useUser();
  const { language } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const storageKey = `customSetups_${user?.id || 'guest'}`;

  const [customSetups, setCustomSetups] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setShowInput(false); setInputVal('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showInput && inputRef.current) inputRef.current.focus();
  }, [showInput]);

  const handleSelect = (name: string) => {
    onChange(name); setOpen(false); setShowInput(false); setInputVal('');
  };

  const addCustom = () => {
    const name = inputVal.trim();
    if (!name || customSetups.includes(name) || DEFAULT_SETUPS.includes(name)) return;
    const updated = [...customSetups, name];
    setCustomSetups(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    handleSelect(name);
  };

  const removeCustom = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customSetups.filter(s => s !== name);
    setCustomSetups(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    if (value === name) onChange('');
  };

  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
        <span style={{ color: value ? '#fff' : 'rgba(255,255,255,0.4)' }}>{value || (language === 'tr' ? '— Seçin —' : '— Select —')}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.4)' }} />
      </button>

      {open && (
        <div className="absolute top-full start-0 mt-2 w-full z-50 rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: '#12131f', border: '1px solid rgba(255,255,255,0.1)', minWidth: '220px' }}>

          <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
            {/* Boş seçenek */}
            <button type="button" onClick={() => handleSelect('')}
              className="w-full text-start px-4 py-2.5 text-sm transition-all"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              {language === 'tr' ? '— Seçin —' : '— Select —'}
            </button>

            {/* Varsayılan setuplar */}
            <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {language === 'tr' ? 'Standart Setuplar' : 'Standard Setups'}
            </div>
            {DEFAULT_SETUPS.map(s => (
              <button key={s} type="button" onClick={() => handleSelect(s)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all"
                style={{ color: value === s ? '#a78bfa' : '#fff' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                {s}
                {value === s && <span style={{ color: '#a78bfa' }}>✓</span>}
              </button>
            ))}

            {/* Özel setuplar */}
            {customSetups.length > 0 && (
              <>
                <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mt-1"
                  style={{ color: 'rgba(255,255,255,0.25)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {language === 'tr' ? 'Özel Setuplar' : 'Custom Setups'}
                </div>
                {customSetups.map(s => (
                  <div key={s} className="group flex items-center px-4 py-2.5 text-sm transition-all"
                    style={{ color: value === s ? '#a78bfa' : '#fff' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                    <button type="button" onClick={() => handleSelect(s)} className="flex-1 text-start flex items-center gap-2">
                      {s}
                      {value === s && <span style={{ color: '#a78bfa' }}>✓</span>}
                    </button>
                    <button type="button" onClick={e => removeCustom(s, e)}
                      className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      style={{ color: '#f87171' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.15)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      title={language === 'tr' ? 'Sil' : 'Delete'}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Özel setup ekle */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {showInput ? (
              <div className="flex items-center gap-2 p-3">
                <input ref={inputRef} type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } if (e.key === 'Escape') { setShowInput(false); setInputVal(''); } }}
                  placeholder={language === 'tr' ? 'Setup adı yaz...' : 'Setup name...'}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }} />
                <button type="button" onClick={addCustom}
                  className="px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0"
                  style={{ background: '#8b5cf6', color: '#fff' }}>
                  {language === 'tr' ? 'Ekle' : 'Add'}
                </button>
                <button type="button" onClick={() => { setShowInput(false); setInputVal(''); }}
                  className="p-1 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setShowInput(true)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-all"
                style={{ color: '#a78bfa' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.2)' }}>+</span>
                <span>{language === 'tr' ? 'Özel Setup Ekle' : 'Add Custom Setup'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

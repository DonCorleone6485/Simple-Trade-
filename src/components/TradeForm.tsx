import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Search, ChevronDown, Loader } from 'lucide-react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { Trade, MTFEntry, TradeResult, OrderType, ChecklistItem } from '../types';
import MTFAnalysis from './MTFAnalysis';
import Checklist from './Checklist';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

interface TradeFormProps {
  onSave: (trade: Trade) => void;
  isPro?: boolean;
}

const OWNER_EMAIL = 'asgharjafari2007@outlook.com';
const PHOTO_LIMIT_FREE = 1;
const PHOTO_LIMIT_PRO = 3;

const inp: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  borderRadius: '12px',
  padding: '8px 12px',
  width: '100%',
  outline: 'none',
  fontSize: '14px',
};

const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '6px',
  color: 'rgba(255,255,255,0.55)',
};

const card: React.CSSProperties = { background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' };

/** Zorunlu alan işareti. */
const Req = () => <span style={{ color: '#f87171', marginInlineStart: '3px' }}>*</span>;
const selStyle: React.CSSProperties = { ...inp, cursor: 'pointer' };
const optStyle: React.CSSProperties = { background: '#1a1b2e', color: '#fff' };
const divider: React.CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '32px' };
const optHint: React.CSSProperties = { color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 };
const sectionTitle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '16px',
};

const SYMBOLS: Record<string, string[]> = {
  Forex: [
    'EURUSD', 'USDJPY', 'GBPUSD', 'AUDUSD', 'USDCHF', 'USDCAD', 'NZDUSD',
    'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'EURAUD', 'EURNZD', 'EURCAD',
    'GBPCAD', 'GBPNZD', 'GBPAUD', 'AUDCAD', 'AUDCHF', 'AUDNZD', 'NZDCAD',
    'NZDCHF', 'CADJPY', 'CADCHF', 'CHFJPY', 'EURHUF', 'EURPLN', 'EURCZK',
    'USDMXN', 'USDZAR', 'USDSGD', 'USDNOK', 'USDSEK', 'USDHKD', 'USDCNH',
  ],
  Crypto: [
    'BTCUSD', 'ETHUSD', 'BNBUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD', 'DOTUSD',
    'MATICUSD', 'LINKUSD', 'AVAXUSD', 'ATOMUSD', 'LTCUSD', 'BCHUSD', 'XLMUSD',
    'UNIUSD', 'AAVEUSD', 'FILUSD', 'TRXUSD', 'ETCUSD', 'ALGOUSD', 'VETUSD',
    'ICPUSD', 'THETAUSD', 'FTMUSD', 'SANDUSD', 'MANAUSD', 'APEUSD', 'DOGEUSD',
    'SHIBUSD', 'PEPEUSD',
  ],
  Indices: [
    'US30', 'US100', 'SPX500', 'GER40', 'UK100', 'FRA40', 'JPN225',
    'AUS200', 'HKG50', 'ESP35', 'ITA40', 'SWI20', 'NLD25', 'SGP30',
    'CHINAH', 'INDIA50', 'STOXX50', 'RUSSELL2000',
  ],
  Metals: [
    'XAUUSD', 'XAGUSD', 'XPTUSD', 'XPDUSD', 'XCUUSD',
    'GOLD', 'SILVER', 'PLATINUM', 'PALLADIUM', 'COPPER',
  ],
  Futures: [
    'USOil', 'UKOil', 'NGAS', 'WHEAT', 'CORN', 'SOYBEAN', 'COFFEE',
    'SUGAR', 'COTTON', 'COCOA', 'LUMBER', 'CATTLE', 'HOGS',
    'CL', 'NG', 'GC', 'SI', 'ZC', 'ZW', 'ZS',
  ],
};

const ALL_CATEGORIES = ['Forex', 'Crypto', 'Indices', 'Metals', 'Futures'];

const DEFAULT_SETUPS = [
  'FVG', 'OB', 'BOS / ChoCH', 'Liquidity Sweep',
  'EQH / EQL', 'Breaker Block', 'Mitigation',
  'VWAP', 'Trend Pullback', 'Range Breakout',
];

// ── SYMBOL PICKER ──────────────────────────────────────────────────────────
function SymbolPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Forex');
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('recentSymbols') || '[]'); } catch { return []; }
  });
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const handleSelect = (symbol: string) => {
    onChange(symbol);
    const updated = [symbol, ...recentlyUsed.filter(s => s !== symbol)].slice(0, 5);
    setRecentlyUsed(updated);
    localStorage.setItem('recentSymbols', JSON.stringify(updated));
    setOpen(false);
    setSearch('');
  };

  const filteredSymbols = search.trim()
    ? Object.values(SYMBOLS).flat().filter(s => s.toLowerCase().includes(search.toLowerCase()))
    : SYMBOLS[category] || [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) handleSelect(search.trim().toUpperCase());
  };

  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-mono font-medium transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
        <span>{value || 'Sembol seç...'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.4)' }} />
      </button>
      {open && (
        <div className="absolute top-full start-0 mt-2 w-full z-50 rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: '#12131f', border: '1px solid rgba(255,255,255,0.1)', minWidth: '280px' }}>
          <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Sembol ara veya yaz... (Enter ile ekle)"
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500" style={{ color: '#fff' }} />
              {search && <button type="button" onClick={() => setSearch('')}><X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} /></button>}
            </div>
          </div>
          {!search && (
            <div className="flex gap-1 px-3 py-2 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {ALL_CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => setCategory(cat)}
                  className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
                  style={category === cat ? { background: '#8b5cf6', color: '#fff' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                  {cat}
                </button>
              ))}
            </div>
          )}
          <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
            {!search && recentlyUsed.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>Son Kullanılanlar</div>
                {recentlyUsed.map(symbol => (
                  <button key={`recent-${symbol}`} type="button" onClick={() => handleSelect(symbol)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all" style={{ color: '#fff' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                    <span className="font-mono font-medium">{symbol}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                      {Object.entries(SYMBOLS).find(([, v]) => v.includes(symbol))?.[0] || 'Custom'}
                    </span>
                  </button>
                ))}
                <div className="mx-4 my-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
              </div>
            )}
            {search && <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>{filteredSymbols.length > 0 ? 'Sonuçlar' : 'Bulunamadı — Enter ile ekle'}</div>}
            {!search && <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>{category}</div>}
            {filteredSymbols.map(symbol => (
              <button key={symbol} type="button" onClick={() => handleSelect(symbol)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all"
                style={{ color: value === symbol ? '#a78bfa' : '#fff' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <span className="font-mono font-medium">{symbol}</span>
                {value === symbol && <span className="text-xs" style={{ color: '#a78bfa' }}>✓</span>}
              </button>
            ))}
            {search.trim() && !filteredSymbols.includes(search.trim().toUpperCase()) && (
              <button type="button" onClick={() => handleSelect(search.trim().toUpperCase())}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all"
                style={{ color: '#a78bfa', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(139,92,246,0.2)' }}>+</span>
                <span><span className="font-mono font-semibold">{search.trim().toUpperCase()}</span> ekle</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── SETUP PICKER ───────────────────────────────────────────────────────────
function SetupPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
        <span style={{ color: value ? '#fff' : 'rgba(255,255,255,0.4)' }}>{value || '— Seçin —'}</span>
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
              — Seçin —
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

// ── PHOTO UPLOADER ─────────────────────────────────────────────────────────
function PhotoUploader({ photos, onUpload, onRemove, isUnlimited, limit, uploading }: {
  photos: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  isUnlimited?: boolean;
  limit: number;
  uploading?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const canUploadMore = isUnlimited ? true : photos.length < limit;

  return (
    <div className="space-y-4">
      {canUploadMore && (
        <div onClick={() => !uploading && fileInputRef.current?.click()}
          className="w-full h-40 flex flex-col items-center justify-center rounded-xl transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
          onMouseEnter={e => { if (!uploading) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}>
          {uploading
            ? <><Loader className="w-5 h-5 mb-2 animate-spin" style={{ color: '#8b5cf6' }} /><span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Yükleniyor...</span></>
            : <><Upload className="w-5 h-5 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }} /><span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('photoUpload')}</span>{isUnlimited && <span className="text-xs mt-1" style={{ color: 'rgba(139,92,246,0.7)' }}>∞ limitsiz</span>}</>
          }
          <input type="file" ref={fileInputRef} onChange={onUpload} accept="image/*" multiple className="hidden" disabled={uploading} />
        </div>
      )}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={photo} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
              <button type="button" onClick={() => onRemove(index)}
                className="absolute top-1 end-1 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TRADE FORM ─────────────────────────────────────────────────────────────
export default function TradeForm({ onSave, isPro = false }: TradeFormProps) {
  const { t, language } = useLanguage();
  const { user } = useUser();

  const isOwner = user?.primaryEmailAddress?.emailAddress === OWNER_EMAIL;
  const photoLimit = isOwner ? Infinity : isPro ? PHOTO_LIMIT_PRO : PHOTO_LIMIT_FREE;

  const [date, setDate] = useState(() => new Date().toISOString());
  const [symbol, setSymbol] = useState('EURUSD');
  const [type, setType] = useState<'Buy' | 'Sell'>('Buy');
  const [orderType, setOrderType] = useState<OrderType>('Market');
  const [setup, setSetup] = useState('');
  const [risk, setRisk] = useState('');
  const [reward, setReward] = useState('');
  const [rr, setRr] = useState('');
  const [result, setResult] = useState<TradeResult | ''>('');
  const [preNotes, setPreNotes] = useState('');
  const [postNotes, setPostNotes] = useState('');
  const [mtf, setMtf] = useState<MTFEntry[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [prePhotos, setPrePhotos] = useState<string[]>([]);
  const [postPhotos, setPostPhotos] = useState<string[]>([]);
  const [uploadingPre, setUploadingPre] = useState(false);
  const [uploadingPost, setUploadingPost] = useState(false);

  /** Yükleme başarısızsa hata mesajını döndürür — sessizce yutulmamalı. */
  const uploadPhotoToStorage = async (file: File, kind: 'pre' | 'post'): Promise<{ url?: string; error?: string }> => {
    if (!user) return { error: 'no user' };
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${kind}.${ext}`;
    const { data, error } = await supabase.storage.from('trade-photos').upload(path, file, { contentType: file.type });
    if (error) { console.error('Upload error:', error); return { error: error.message }; }
    const { data: urlData } = supabase.storage.from('trade-photos').getPublicUrl(data.path);
    return { url: urlData.publicUrl };
  };

  const isLossResult = result === 'Başarısız' || result === 'Manuel Zararda';
  const isWinResult = result === 'Başarılı' || result === 'Manuel Karda';
  const isBreakevenResult = result === 'Başa Baş';

  /** Tutar alanının başlığı sonuca göre değişir; sonuç seçilmeden ikisi de yazar. */
  const amountLabel = isLossResult
    ? t('lossAmountLabel')
    : isWinResult
    ? t('reward')
    : t('rewardOrLossLabel');

  /** Sonuç yalnızca tutar alanını yönetir — R/R kullanıcının girdiği gibi kalır. */
  const handleResultChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as TradeResult | '';
    setResult(val);
    if (val === 'Başa Baş') setReward('0');
    else if (reward === '0') setReward('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'pre' | 'post') => {
    const files = Array.from(e.target.files || []) as File[];
    const current = kind === 'pre' ? prePhotos : postPhotos;
    if (!isOwner && current.length + files.length > photoLimit) {
      alert(`En fazla ${photoLimit} fotoğraf yükleyebilirsiniz.`);
      return;
    }
    if (kind === 'pre') setUploadingPre(true); else setUploadingPost(true);
    let failure = '';
    for (const file of files) {
      const { url, error } = await uploadPhotoToStorage(file, kind);
      if (url) {
        if (kind === 'pre') setPrePhotos(p => [...p, url]);
        else setPostPhotos(p => [...p, url]);
      } else if (error) {
        failure = error;
      }
    }
    if (kind === 'pre') setUploadingPre(false); else setUploadingPost(false);
    e.target.value = '';
    if (failure) {
      alert(language === 'tr'
        ? `Fotoğraf yüklenemedi: ${failure}`
        : `Photo upload failed: ${failure}`);
    }
  };

  const removePhoto = async (index: number, kind: 'pre' | 'post') => {
    const photos = kind === 'pre' ? prePhotos : postPhotos;
    const url = photos[index];
    if (url && url.includes('/trade-photos/')) {
      const path = url.split('/trade-photos/')[1];
      if (path) await supabase.storage.from('trade-photos').remove([path]);
    }
    if (kind === 'pre') setPrePhotos(p => p.filter((_, i) => i !== index));
    else setPostPhotos(p => p.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) { alert(t('pleaseSelectDate') || 'Lütfen tarih seçin'); return; }
    const newTrade: Trade = {
      id: Date.now().toString(),
      date, symbol, type, orderType, setup,
      risk: parseFloat(risk) || 0,
      // Kullanıcı her zaman pozitif yazar; kayıpta değeri negatife çeviriyoruz.
      reward: isBreakevenResult ? 0 : (isLossResult ? -1 : 1) * Math.abs(parseFloat(reward) || 0),
      rr, result: result as TradeResult,
      preTradeNotes: preNotes, postTradeNotes: postNotes,
      preTradePhotos: prePhotos, postTradePhotos: postPhotos,
      mtfAnalysis: mtf.length > 0 ? mtf : undefined,
      checklist: checklist.length > 0 ? checklist : undefined,
    };
    onSave(newTrade);
    // Bir sonraki kayıt için tarihi tekrar "şu an"a al.
    setDate(new Date().toISOString()); setSymbol('EURUSD'); setOrderType('Market');
    setSetup(''); setRisk(''); setReward(''); setRr('');
    setPreNotes(''); setPostNotes('');
    setPrePhotos([]); setPostPhotos([]); setMtf([]);
    setChecklist(prev => prev.map(i => ({ ...i, checked: false })));
    setResult('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* İşleme girmeden önce kontrol listesi */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-semibold text-white">
            Checklist <span style={{ ...optHint, fontSize: '13px' }}>({t('optionalLabel')})</span>
          </h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {language === 'tr'
              ? 'İşleme girmeden önce kendi kurallarını kontrol et.'
              : 'Run through your own rules before taking the trade.'}
          </p>
        </div>
        <div className="p-6">
          <Checklist value={checklist} onChange={setChecklist} syncTemplate />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={card}>
      <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-semibold text-white">{t('formTitle')}</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('formSubtitle')}</p>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label style={lbl}>{t('dateTime')}<Req /></label>
            <DatePicker
              value={date ? new Date(date) : null}
              onChange={(dateObj: DateObject | null) => { if (dateObj) setDate(dateObj.toDate().toISOString()); else setDate(''); }}
              format="YYYY/MM/DD HH:mm"
              plugins={[<TimePicker position="bottom" />]}
              calendar={language === 'fa' ? persian : undefined}
              locale={language === 'fa' ? persian_fa : undefined}
              inputClass="dark-dp-input"
              containerClassName="w-full"
            />
          </div>
          <div>
            <label style={lbl}>{t('symbol')}<Req /></label>
            <SymbolPicker value={symbol} onChange={setSymbol} />
          </div>
          <div>
            <label style={lbl}>{t('type')}<Req /></label>
            <select value={type} onChange={e => setType(e.target.value as 'Buy' | 'Sell')} style={selStyle}>
              <option value="Buy" style={optStyle}>{t('buy')}</option>
              <option value="Sell" style={optStyle}>{t('sell')}</option>
            </select>
          </div>
          <div>
            <label style={lbl}>{t('orderType')}<Req /></label>
            <select value={orderType} onChange={e => setOrderType(e.target.value as OrderType)} style={selStyle}>
              <option value="Market" style={optStyle}>{t('orderMarket')}</option>
              <option value="Limit" style={optStyle}>{t('orderLimit')}</option>
              <option value="Stop" style={optStyle}>{t('orderStop')}</option>
            </select>
          </div>
          <div>
            <label style={lbl}>{t('setup')} <span style={optHint}>({t('optionalLabel')})</span></label>
            <SetupPicker value={setup} onChange={setSetup} />
          </div>
          <div>
            <label style={lbl}>{t('rr')}<Req /></label>
            <input type="number" step="any" required value={rr} onChange={e => setRr(e.target.value)}
              style={{ ...inp, fontFamily: 'monospace' }} placeholder={t('rrPlaceholder')} />
          </div>
        </div>

        <div style={divider}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label style={lbl}>{t('risk')}<Req /></label>
              <div className="relative">
                <span className="absolute start-3 top-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>$</span>
                <input type="number" min="0" step="0.01" required value={risk} onChange={e => setRisk(e.target.value)}
                  style={{ ...inp, paddingLeft: '28px', fontFamily: 'monospace' }} placeholder="0.00" />
              </div>
            </div>
            <div>
              <label style={lbl}>{t('result')}<Req /></label>
              <select value={result} onChange={handleResultChange} required style={selStyle}>
                <option value="" style={optStyle}>{t('selectPlaceholder')}</option>
                <option value="Başarılı" style={optStyle}>{t('resultWin')}</option>
                <option value="Başarısız" style={optStyle}>{t('resultLoss')}</option>
                <option value="Manuel Karda" style={optStyle}>{t('resultManualWin')}</option>
                <option value="Manuel Zararda" style={optStyle}>{t('resultManualLoss')}</option>
                <option value="Başa Baş" style={optStyle}>{t('resultBreakeven')}</option>
              </select>
            </div>
            <div>
              <label style={lbl}>
                <span style={{ color: isLossResult ? '#f87171' : isWinResult ? '#34d399' : 'rgba(255,255,255,0.55)' }}>
                  {amountLabel}
                </span>
                <Req />
              </label>
              <div className="relative">
                <span className="absolute start-3 top-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>$</span>
                <input type="number" min="0" step="0.01" required readOnly={isBreakevenResult}
                  value={reward} onChange={e => setReward(e.target.value)}
                  style={{ ...inp, paddingLeft: '28px', fontFamily: 'monospace', opacity: isBreakevenResult ? 0.6 : 1 }}
                  placeholder="0.00" />
              </div>
            </div>
          </div>
        </div>

        <div style={divider}>
          <p style={sectionTitle}>
            {language === 'tr' ? 'Multi Timeframe Analiz' : 'Multi-Timeframe Analysis'}
            <span style={optHint}> ({t('optionalLabel')})</span>
          </p>
          <MTFAnalysis value={mtf} onChange={setMtf} symbol={symbol} autoFill />
        </div>

        <div style={divider}>
          <p style={sectionTitle}>{t('preTrade')}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label style={lbl}>{t('photos')} <span style={optHint}>({t('optionalLabel')})</span></label>
              <PhotoUploader photos={prePhotos} onUpload={e => handlePhotoUpload(e, 'pre')} onRemove={i => removePhoto(i, 'pre')} isUnlimited={isOwner} limit={photoLimit} uploading={uploadingPre} />
            </div>
            <div>
              <label style={lbl}>{t('notes')}<Req /></label>
              <textarea required value={preNotes} onChange={e => setPreNotes(e.target.value)}
                style={{ ...inp, height: '160px', resize: 'none', padding: '12px' }} placeholder={t('preNotesPlaceholder')} />
            </div>
          </div>
        </div>

        <div style={divider}>
          <p style={sectionTitle}>{t('postTrade')}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label style={lbl}>{t('photos')} <span style={optHint}>({t('optionalLabel')})</span></label>
              <PhotoUploader photos={postPhotos} onUpload={e => handlePhotoUpload(e, 'post')} onRemove={i => removePhoto(i, 'post')} isUnlimited={isOwner} limit={photoLimit} uploading={uploadingPost} />
            </div>
            <div>
              <label style={lbl}>{t('notes')}<Req /></label>
              <textarea required value={postNotes} onChange={e => setPostNotes(e.target.value)}
                style={{ ...inp, height: '160px', resize: 'none', padding: '12px' }} placeholder={t('postNotesPlaceholder')} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex items-center justify-between gap-4 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ color: '#f87171' }}>*</span> {t('requiredNote')}
        </p>
        <button type="submit" disabled={uploadingPre || uploadingPost}
          className="px-6 py-2.5 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: '#8b5cf6', color: '#fff' }}
          onMouseEnter={e => { if (!uploadingPre && !uploadingPost) (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
          {uploadingPre || uploadingPost ? 'Fotoğraflar yükleniyor...' : t('saveButton')}
        </button>
      </div>
      </div>
    </form>
  );
}

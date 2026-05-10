import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Search, ChevronDown } from 'lucide-react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { Trade } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '@clerk/clerk-react';

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

const selStyle: React.CSSProperties = { ...inp, cursor: 'pointer' };
const optStyle: React.CSSProperties = { background: '#1a1b2e', color: '#fff' };
const divider: React.CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '32px' };
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

const SETUPS = [
  'FVG', 'OB', 'BOS / ChoCH', 'Liquidity Sweep',
  'EQH / EQL', 'Breaker Block', 'Mitigation',
  'VWAP', 'Trend Pullback', 'Range Breakout', 'Diğer',
];

const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'];

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
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-mono font-medium transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
      >
        <span>{value || 'Sembol seç...'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.4)' }} />
      </button>

      {open && (
        <div className="absolute top-full start-0 mt-2 w-full z-50 rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: '#12131f', border: '1px solid rgba(255,255,255,0.1)', minWidth: '280px' }}>

          <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Sembol ara veya yaz... (Enter ile ekle)"
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500"
                style={{ color: '#fff' }}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                </button>
              )}
            </div>
          </div>

          {!search && (
            <div className="flex gap-1 px-3 py-2 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
                  style={category === cat
                    ? { background: '#8b5cf6', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
            {!search && recentlyUsed.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Son Kullanılanlar
                </div>
                {recentlyUsed.map(symbol => (
                  <button
                    key={`recent-${symbol}`}
                    type="button"
                    onClick={() => handleSelect(symbol)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all"
                    style={{ color: '#fff' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <span className="font-mono font-medium">{symbol}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                      {Object.entries(SYMBOLS).find(([, v]) => v.includes(symbol))?.[0] || 'Custom'}
                    </span>
                  </button>
                ))}
                <div className="mx-4 my-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
              </div>
            )}

            {search && (
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {filteredSymbols.length > 0 ? 'Sonuçlar' : 'Bulunamadı — Enter ile ekle'}
              </div>
            )}

            {!search && (
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {category}
              </div>
            )}

            {filteredSymbols.map(symbol => (
              <button
                key={symbol}
                type="button"
                onClick={() => handleSelect(symbol)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all"
                style={{ color: value === symbol ? '#a78bfa' : '#fff' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span className="font-mono font-medium">{symbol}</span>
                {value === symbol && <span className="text-xs" style={{ color: '#a78bfa' }}>✓</span>}
              </button>
            ))}

            {search.trim() && !filteredSymbols.includes(search.trim().toUpperCase()) && (
              <button
                type="button"
                onClick={() => handleSelect(search.trim().toUpperCase())}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all"
                style={{ color: '#a78bfa', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
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

function PhotoUploader({ photos, onUpload, onRemove, isUnlimited, limit }: {
  photos: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  isUnlimited?: boolean;
  limit: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const canUploadMore = isUnlimited ? true : photos.length < limit;

  return (
    <div className="space-y-4">
      {canUploadMore && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-40 flex flex-col items-center justify-center cursor-pointer rounded-xl transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
        >
          <Upload className="w-5 h-5 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('photoUpload')}</span>
          {isUnlimited && (
            <span className="text-xs mt-1" style={{ color: 'rgba(139,92,246,0.7)' }}>∞ limitsiz</span>
          )}
          <input type="file" ref={fileInputRef} onChange={onUpload} accept="image/*" multiple className="hidden" />
        </div>
      )}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={photo} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-1 end-1 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TradeForm({ onSave, isPro = false }: TradeFormProps) {
  const { t, language } = useLanguage();
  const { user } = useUser();

  const isOwner = user?.primaryEmailAddress?.emailAddress === OWNER_EMAIL;
  const photoLimit = isOwner ? Infinity : isPro ? PHOTO_LIMIT_PRO : PHOTO_LIMIT_FREE;

  const [date, setDate] = useState('');
  const [symbol, setSymbol] = useState('EURUSD');
  const [type, setType] = useState<'Buy' | 'Sell'>('Buy');
  const [timeframe, setTimeframe] = useState('H1');
  const [setup, setSetup] = useState('');
  const [customSetup, setCustomSetup] = useState('');
  const [risk, setRisk] = useState('');
  const [reward, setReward] = useState('');
  const [rr, setRr] = useState('');
  const [result, setResult] = useState<'Başarılı' | 'Başarısız' | 'Manuel Karda' | 'Manuel Zararda'>('Başarılı');
  const [preNotes, setPreNotes] = useState('');
  const [postNotes, setPostNotes] = useState('');
  const [prePhotos, setPrePhotos] = useState<string[]>([]);
  const [postPhotos, setPostPhotos] = useState<string[]>([]);

  const handleResultChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'Başarılı' | 'Başarısız' | 'Manuel Karda' | 'Manuel Zararda';
    setResult(val);
    if (val === 'Başarısız' || val === 'Manuel Zararda') {
      if (!rr) { setRr('-1'); }
      else if (parseFloat(rr) > 0) { setRr((parseFloat(rr) * -1).toString()); }
    } else {
      if (rr && parseFloat(rr) < 0) { setRr(Math.abs(parseFloat(rr)).toString()); }
    }
  };

  const handleSetupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSetup(e.target.value);
    if (e.target.value !== 'Diğer') setCustomSetup('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, kind: 'pre' | 'post') => {
    const files = Array.from(e.target.files || []) as File[];
    const current = kind === 'pre' ? prePhotos : postPhotos;

    if (!isOwner && current.length + files.length > photoLimit) {
      alert(`En fazla ${photoLimit} fotoğraf yükleyebilirsiniz.`);
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (kind === 'pre') setPrePhotos(p => [...p, reader.result as string]);
        else setPostPhotos(p => [...p, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number, kind: 'pre' | 'post') => {
    if (kind === 'pre') setPrePhotos(p => p.filter((_, i) => i !== index));
    else setPostPhotos(p => p.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) { alert(t('pleaseSelectDate') || 'Lütfen tarih seçin'); return; }
    const finalSetup = setup === 'Diğer' ? customSetup : setup;
    const newTrade: Trade = {
      id: Date.now().toString(),
      date, symbol, type, timeframe,
      setup: finalSetup,
      risk: parseFloat(risk) || 0,
      reward: parseFloat(reward) || 0,
      rr, result,
      preTradeNotes: preNotes,
      postTradeNotes: postNotes,
      preTradePhotos: prePhotos,
      postTradePhotos: postPhotos,
    };
    onSave(newTrade);
    setDate(''); setSymbol('EURUSD'); setTimeframe('H1');
    setSetup(''); setCustomSetup('');
    setRisk(''); setReward(''); setRr('');
    setPreNotes(''); setPostNotes('');
    setPrePhotos([]); setPostPhotos([]);
    setResult('Başarılı');
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl overflow-hidden" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-semibold text-white">{t('formTitle')}</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('formSubtitle')}</p>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label style={lbl}>{t('dateTime')}</label>
            <DatePicker
              value={date ? new Date(date) : null}
              onChange={(dateObj: DateObject | null) => {
                if (dateObj) setDate(dateObj.toDate().toISOString());
                else setDate('');
              }}
              format="YYYY/MM/DD HH:mm"
              plugins={[<TimePicker position="bottom" />]}
              calendar={language === 'fa' ? persian : undefined}
              locale={language === 'fa' ? persian_fa : undefined}
              inputClass="dark-dp-input"
              containerClassName="w-full"
            />
          </div>

          <div>
            <label style={lbl}>{t('symbol')}</label>
            <SymbolPicker value={symbol} onChange={setSymbol} />
          </div>

          <div>
            <label style={lbl}>{t('type')}</label>
            <select value={type} onChange={e => setType(e.target.value as 'Buy' | 'Sell')} style={selStyle}>
              <option value="Buy" style={optStyle}>{t('buy')}</option>
              <option value="Sell" style={optStyle}>{t('sell')}</option>
            </select>
          </div>

          <div>
            <label style={lbl}>{t('timeframe')}</label>
            <select value={timeframe} onChange={e => setTimeframe(e.target.value)} style={selStyle}>
              {TIMEFRAMES.map(tf => (
                <option key={tf} value={tf} style={optStyle}>{tf}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={lbl}>{t('setup')}</label>
            <select value={setup} onChange={handleSetupChange} style={selStyle}>
              <option value="" style={optStyle}>— Seçin —</option>
              {SETUPS.map(s => (
                <option key={s} value={s} style={optStyle}>{s}</option>
              ))}
            </select>
            {setup === 'Diğer' && (
              <input
                type="text"
                value={customSetup}
                onChange={e => setCustomSetup(e.target.value)}
                placeholder="Setup adını yazın..."
                className="mt-2"
                style={{ ...inp }}
                autoFocus
              />
            )}
          </div>

          <div>
            <label style={lbl}>{t('rr')}</label>
            <input
              type="number" step="any"
              value={rr} onChange={e => setRr(e.target.value)}
              style={{ ...inp, fontFamily: 'monospace' }}
              placeholder={t('rrPlaceholder')}
            />
          </div>
        </div>

        <div style={divider}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label style={lbl}>{t('risk')}</label>
              <div className="relative">
                <span className="absolute start-3 top-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>$</span>
                <input
                  type="number" min="0" step="0.01" required
                  value={risk} onChange={e => setRisk(e.target.value)}
                  style={{ ...inp, paddingLeft: '28px', fontFamily: 'monospace' }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label style={lbl}>{t('reward')}</label>
              <div className="relative">
                <span className="absolute start-3 top-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>$</span>
                <input
                  type="number" step="0.01"
                  value={reward} onChange={e => setReward(e.target.value)}
                  style={{ ...inp, paddingLeft: '28px', fontFamily: 'monospace' }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label style={lbl}>{t('result')}</label>
              <select value={result} onChange={handleResultChange} style={selStyle}>
                <option value="Başarılı" style={optStyle}>{t('resultWin')}</option>
                <option value="Başarısız" style={optStyle}>{t('resultLoss')}</option>
                <option value="Manuel Karda" style={optStyle}>{t('resultManualWin')}</option>
                <option value="Manuel Zararda" style={optStyle}>{t('resultManualLoss')}</option>
              </select>
            </div>
          </div>
        </div>

        <div style={divider}>
          <p style={sectionTitle}>{t('preTrade')}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label style={lbl}>{t('photos')}</label>
              <PhotoUploader
                photos={prePhotos}
                onUpload={e => handlePhotoUpload(e, 'pre')}
                onRemove={i => removePhoto(i, 'pre')}
                isUnlimited={isOwner}
                limit={photoLimit}
              />
            </div>
            <div>
              <label style={lbl}>{t('notes')}</label>
              <textarea
                required value={preNotes} onChange={e => setPreNotes(e.target.value)}
                style={{ ...inp, height: '160px', resize: 'none', padding: '12px' }}
                placeholder={t('preNotesPlaceholder')}
              />
            </div>
          </div>
        </div>

        <div style={divider}>
          <p style={sectionTitle}>{t('postTrade')}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label style={lbl}>{t('photos')}</label>
              <PhotoUploader
                photos={postPhotos}
                onUpload={e => handlePhotoUpload(e, 'post')}
                onRemove={i => removePhoto(i, 'post')}
                isUnlimited={isOwner}
                limit={photoLimit}
              />
            </div>
            <div>
              <label style={lbl}>{t('notes')}</label>
              <textarea
                value={postNotes} onChange={e => setPostNotes(e.target.value)}
                style={{ ...inp, height: '160px', resize: 'none', padding: '12px' }}
                placeholder={t('postNotesPlaceholder')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex justify-end" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <button
          type="submit"
          className="px-6 py-2.5 font-semibold rounded-xl transition-all"
          style={{ background: '#8b5cf6', color: '#fff' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}
        >
          {t('saveButton')}
        </button>
      </div>
    </form>
  );
}

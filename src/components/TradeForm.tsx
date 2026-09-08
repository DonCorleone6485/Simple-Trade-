import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Search, ChevronDown, Loader } from 'lucide-react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { Trade, MTFEntry, TradeResult, OrderType, ChecklistItem } from '../types';
import MTFAnalysis from './MTFAnalysis';
import Checklist from './Checklist';
import SetupPicker from './SetupPicker';
import { useLanguage } from '../context/LanguageContext';
import { input as uiInput, label as uiLabel, surface, hairline, sectionLabel, primaryBtn, TRANSITION } from '../lib/ui';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

interface TradeFormProps {
  onSave: (trade: Trade) => void;
  isPro?: boolean;
  /** Portal düzeninde sayfa başlığı üst barda durur. */
  hideTitle?: boolean;
}

const OWNER_EMAIL = 'asgharjafari2007@outlook.com';
const PHOTO_LIMIT_FREE = 1;
const PHOTO_LIMIT_PRO = 3;

const inp = uiInput;
const lbl = uiLabel;

const card: React.CSSProperties = { ...surface };

/** Zorunlu alan işareti. */
const Req = () => <span style={{ color: '#f87171', marginInlineStart: '3px' }}>*</span>;
const selStyle: React.CSSProperties = { ...inp, cursor: 'pointer' };
const optStyle: React.CSSProperties = { background: '#1a1b2e', color: '#fff' };
const divider: React.CSSProperties = { borderTop: hairline, paddingTop: '40px' };
const optHint: React.CSSProperties = { color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 };
const sectionTitle: React.CSSProperties = { ...sectionLabel, marginBottom: '18px' };

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

// ── SYMBOL PICKER ──────────────────────────────────────────────────────────
function SymbolPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { language } = useLanguage();
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
        <span>{value || (language === 'tr' ? 'Sembol seç...' : 'Pick a symbol...')}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.4)' }} />
      </button>
      {open && (
        <div className="absolute top-full start-0 mt-2 w-full z-50 rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: '#12131f', border: '1px solid rgba(255,255,255,0.1)', minWidth: '280px' }}>
          <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={language === 'tr' ? 'Sembol ara veya yaz... (Enter ile ekle)' : 'Search or type a symbol... (Enter to add)'}
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
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>{language === 'tr' ? 'Son Kullanılanlar' : 'Recently Used'}</div>
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
            {search && <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>{filteredSymbols.length > 0
                ? (language === 'tr' ? 'Sonuçlar' : 'Results')
                : (language === 'tr' ? 'Bulunamadı — Enter ile ekle' : 'No match — press Enter to add')}</div>}
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
    <div className="space-y-3">
      {canUploadMore && (
        <div onClick={() => !uploading && fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2.5 py-4"
          style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1, transition: TRANSITION }}
          onMouseEnter={e => { if (!uploading) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}>
          {uploading
            ? <><Loader className="w-4 h-4 animate-spin" style={{ color: '#8b5cf6' }} /><span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Yükleniyor...</span></>
            : <>
                <Upload className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('photoUpload')}</span>
                {isUnlimited && <span className="text-xs" style={{ color: 'rgba(139,92,246,0.7)' }}>∞</span>}
              </>
          }
          <input type="file" ref={fileInputRef} onChange={onUpload} accept="image/*" multiple className="hidden" disabled={uploading} />
        </div>
      )}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
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
export default function TradeForm({ onSave, isPro = false, hideTitle = false }: TradeFormProps) {
  const { t, language } = useLanguage();
  const { user } = useUser();

  const isOwner = user?.primaryEmailAddress?.emailAddress === OWNER_EMAIL;
  const photoLimit = isOwner ? Infinity : isPro ? PHOTO_LIMIT_PRO : PHOTO_LIMIT_FREE;

  const [date, setDate] = useState(() => new Date().toISOString());
  const [exitDate, setExitDate] = useState(() => new Date().toISOString());
  /** Çıkış saati, kullanıcı ona dokunana kadar girişi izler — genelde aynı gün
      içinde kapanır, sadece saat-dakika değişir. */
  const [exitTouched, setExitTouched] = useState(false);
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
  /** Sonuç seçilmemişse işlem hâlâ açık: kapanış alanları beklenmez. */
  const isClosed = result !== '';

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
    if (!date) { alert(t('pleaseSelectDate')); return; }
    if (isClosed && !exitDate) {
      alert(language === 'tr'
        ? 'Sonuç girdiğin işlem için çıkış tarihi de gerekli.'
        : 'A trade with a result needs an exit time as well.');
      return;
    }
    if (exitDate && new Date(exitDate).getTime() < new Date(date).getTime()) {
      alert(language === 'tr'
        ? 'Çıkış tarihi, giriş tarihinden önce olamaz.'
        : 'Exit time cannot be earlier than entry time.');
      return;
    }
    const newTrade: Trade = {
      id: Date.now().toString(),
      date,
      // Açık işlemde çıkış ve tutar boş kalır; sonuç girilince tamamlanır.
      exitDate: isClosed ? (exitDate || undefined) : undefined,
      symbol, type, orderType, setup,
      risk: parseFloat(risk) || 0,
      // Kullanıcı her zaman pozitif yazar; kayıpta değeri negatife çeviriyoruz.
      reward: !isClosed ? 0 : isBreakevenResult ? 0 : (isLossResult ? -1 : 1) * Math.abs(parseFloat(reward) || 0),
      rr, result: result as TradeResult,
      preTradeNotes: preNotes, postTradeNotes: postNotes,
      preTradePhotos: prePhotos, postTradePhotos: postPhotos,
      mtfAnalysis: mtf.length > 0 ? mtf : undefined,
      checklist: checklist.length > 0 ? checklist : undefined,
    };
    onSave(newTrade);
    // Bir sonraki kayıt için tarihi tekrar "şu an"a al.
    setDate(new Date().toISOString()); setExitDate(new Date().toISOString()); setExitTouched(false);
    setSymbol('EURUSD'); setOrderType('Market');
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
          <h2 className="font-display text-[21px] text-white" style={{ letterSpacing: '-0.01em' }}>
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
      {!hideTitle && (
        <div className="p-6" style={{ borderBottom: hairline }}>
          <h2 className="font-display text-[21px] text-white" style={{ letterSpacing: '-0.01em' }}>{t('formTitle')}</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('formSubtitle')}</p>
        </div>
      )}

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label style={lbl}>{t('dateTime')}<Req /></label>
            <DatePicker
              value={date ? new Date(date) : null}
              onChange={(dateObj: DateObject | null) => {
                const iso = dateObj ? dateObj.toDate().toISOString() : '';
                setDate(iso);
                if (!exitTouched && iso) setExitDate(iso);
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
            <label style={lbl}>{t('plannedRR')}{isClosed && <Req />}</label>
            <input type="number" step="any" required={isClosed} value={rr} onChange={e => setRr(e.target.value)}
              style={{ ...inp, fontFamily: 'monospace' }} placeholder={t('rrPlaceholder')} />
          </div>
          <div>
              <label style={lbl}>{t('risk')}<Req /></label>
              <div className="relative">
                <span className="absolute start-3 top-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>$</span>
                <input type="number" min="0" step="0.01" required value={risk} onChange={e => setRisk(e.target.value)}
                  style={{ ...inp, paddingLeft: '28px', fontFamily: 'monospace' }} placeholder="0.00" />
              </div>
            </div>
            <div>
              <label style={lbl}>{t('result')}</label>
              <select value={result} onChange={handleResultChange} style={selStyle}>
                <option value="" style={optStyle}>{t('selectPlaceholder')}</option>
                <option value="Başarılı" style={optStyle}>{t('resultWin')}</option>
                <option value="Başarısız" style={optStyle}>{t('resultLoss')}</option>
                <option value="Manuel Karda" style={optStyle}>{t('resultManualWin')}</option>
                <option value="Manuel Zararda" style={optStyle}>{t('resultManualLoss')}</option>
                <option value="Başa Baş" style={optStyle}>{t('resultBreakeven')}</option>
              </select>
              {!isClosed && (
                <p className="text-[11px] mt-2 leading-snug" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {t('finishLater')}
                </p>
              )}
            </div>
            <div>
              <label style={lbl}>
                <span style={{ color: isLossResult ? '#f87171' : isWinResult ? '#34d399' : 'rgba(255,255,255,0.55)' }}>
                  {amountLabel}
                </span>
                {isClosed && <Req />}
              </label>
              <div className="relative">
                <span className="absolute start-3 top-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>$</span>
                <input type="number" min="0" step="0.01" required={isClosed} readOnly={isBreakevenResult}
                  value={reward} onChange={e => setReward(e.target.value)}
                  style={{ ...inp, paddingLeft: '28px', fontFamily: 'monospace', opacity: isBreakevenResult ? 0.6 : 1 }}
                  placeholder="0.00" />
              </div>
            </div>

            <div>
              <label style={lbl}>{t('exitDateTime')}{isClosed && <Req />}</label>
              <DatePicker
                value={exitDate ? new Date(exitDate) : null}
                onChange={(dateObj: DateObject | null) => {
                  setExitTouched(true);
                  setExitDate(dateObj ? dateObj.toDate().toISOString() : '');
                }}
                format="YYYY/MM/DD HH:mm"
                plugins={[<TimePicker position="bottom" />]}
                calendar={language === 'fa' ? persian : undefined}
                locale={language === 'fa' ? persian_fa : undefined}
                inputClass="dark-dp-input"
                containerClassName="w-full"
              />
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
          <div className="space-y-6">
            <div>
              <label style={lbl}>{t('notes')} <span style={optHint}>({t('optionalLabel')})</span></label>
              <textarea value={preNotes} onChange={e => setPreNotes(e.target.value)}
                style={{ ...inp, height: '200px', resize: 'vertical', padding: '14px', lineHeight: 1.65 }}
                placeholder={t('preNotesPlaceholder')} />
            </div>
            <div>
              <label style={lbl}>{t('photos')} <span style={optHint}>({t('optionalLabel')})</span></label>
              <PhotoUploader photos={prePhotos} onUpload={e => handlePhotoUpload(e, 'pre')} onRemove={i => removePhoto(i, 'pre')} isUnlimited={isOwner} limit={photoLimit} uploading={uploadingPre} />
            </div>
          </div>
        </div>

        <div style={divider}>
          <p style={sectionTitle}>{t('postTrade')}</p>
          <div className="space-y-6">
            <div>
              <label style={lbl}>{t('notes')}{isClosed && <Req />}</label>
              <textarea required={isClosed} value={postNotes} onChange={e => setPostNotes(e.target.value)}
                style={{ ...inp, height: '200px', resize: 'vertical', padding: '14px', lineHeight: 1.65 }}
                placeholder={t('postNotesPlaceholder')} />
            </div>
            <div>
              <label style={lbl}>{t('photos')} <span style={optHint}>({t('optionalLabel')})</span></label>
              <PhotoUploader photos={postPhotos} onUpload={e => handlePhotoUpload(e, 'post')} onRemove={i => removePhoto(i, 'post')} isUnlimited={isOwner} limit={photoLimit} uploading={uploadingPost} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex items-center justify-between gap-4 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ color: '#f87171' }}>*</span> {t('requiredNote')}
        </p>
        <button type="submit" disabled={uploadingPre || uploadingPost}
          className="px-6 py-2.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={primaryBtn}
          onMouseEnter={e => { if (!uploadingPre && !uploadingPost) (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
          {uploadingPre || uploadingPost
            ? (language === 'tr' ? 'Fotoğraflar yükleniyor...' : 'Uploading photos...')
            : t('saveButton')}
        </button>
      </div>
      </div>
    </form>
  );
}

import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { Trade } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface TradeFormProps {
  onSave: (trade: Trade) => void;
}

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

const SETUPS = [
  'FVG', 'OB', 'BOS / ChoCH', 'Liquidity Sweep',
  'EQH / EQL', 'Breaker Block', 'Mitigation',
  'VWAP', 'Trend Pullback', 'Range Breakout', 'Diğer',
];

const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'];

const SYMBOLS = [
  'EURUSD','USDJPY','GBPUSD','XAUUSD','US100','SPX500','AUDUSD',
  'US30','USOil','USDCHF','USDCAD','GBPJPY','EURJPY','UKOil',
  'GER30','EURGBP','XAGUSD','NZDUSD','AUDJPY','EURAUD','UK100',
  'JPN225','NGCUSD','F40EUR','AUS200','HSIHKD','USDCNH','USDMXN',
  'USDZAR','USDSGD','USDNOK','USDSEK','USDHKD','EURCAD','EURNZD',
  'GBPCAD','GBPNZD','AUDCAD','AUDCHF','NZDCAD','NZDCHF','CADJPY',
  'CADCHF','EURHUF','EURPLN','EURCZK','SPN35EUR',
];

function PhotoUploader({ photos, onUpload, onRemove }: {
  photos: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      {photos.length < 3 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-40 flex flex-col items-center justify-center cursor-pointer rounded-xl transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
        >
          <Upload className="w-5 h-5 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('photoUpload')}</span>
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

export default function TradeForm({ onSave }: TradeFormProps) {
  const { t, language } = useLanguage();
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
    if (current.length + files.length > 3) { alert('En fazla 3 fotoğraf yükleyebilirsiniz.'); return; }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (kind === 'pre') { setPrePhotos(p => [...p, reader.result as string]); }
        else { setPostPhotos(p => [...p, reader.result as string]); }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number, kind: 'pre' | 'post') => {
    if (kind === 'pre') { setPrePhotos(p => p.filter((_, i) => i !== index)); }
    else { setPostPhotos(p => p.filter((_, i) => i !== index)); }
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

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label style={lbl}>{t('dateTime')}</label>
            <DatePicker
              value={date ? new Date(date) : null}
              onChange={(dateObj: DateObject | null) => {
                if (dateObj) { setDate(dateObj.toDate().toISOString()); } else { setDate(''); }
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
            <select value={symbol} onChange={e => setSymbol(e.target.value)} style={selStyle}>
              {SYMBOLS.map(s => <option key={s} value={s} style={optStyle}>{s}</option>)}
            </select>
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

        {/* Row 2 */}
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

        {/* Pre-Trade */}
        <div style={divider}>
          <p style={sectionTitle}>{t('preTrade')}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label style={lbl}>{t('photos')}</label>
              <PhotoUploader photos={prePhotos} onUpload={e => handlePhotoUpload(e, 'pre')} onRemove={i => removePhoto(i, 'pre')} />
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

        {/* Post-Trade */}
        <div style={divider}>
          <p style={sectionTitle}>{t('postTrade')}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label style={lbl}>{t('photos')}</label>
              <PhotoUploader photos={postPhotos} onUpload={e => handlePhotoUpload(e, 'post')} onRemove={i => removePhoto(i, 'post')} />
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

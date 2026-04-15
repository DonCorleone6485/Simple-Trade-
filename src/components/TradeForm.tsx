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

function PhotoUploader({ photos, onUpload, onRemove }: { photos: string[], onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, onRemove: (index: number) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {photos.length < 3 && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-40 px-3 py-2 border border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-50 focus:ring-2 focus:ring-zinc-900 hover:border-zinc-400 outline-none transition-all cursor-pointer bg-white"
        >
          <Upload className="w-5 h-5 mb-2 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-600">{t('photoUpload')}</span>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onUpload} 
            accept="image/*" 
            multiple 
            className="hidden" 
          />
        </div>
      )}
      
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group">
              <img src={photo} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-1 end-1 p-1 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
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
  const [risk, setRisk] = useState('');
  const [reward, setReward] = useState('');
  const [rr, setRr] = useState('');
  const [result, setResult] = useState<'Başarılı' | 'Başarısız' | 'Manuel Karda' | 'Manuel Zararda'>('Başarılı');
  const [preNotes, setPreNotes] = useState('');

  const handleResultChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'Başarılı' | 'Başarısız' | 'Manuel Karda' | 'Manuel Zararda';
    setResult(val);
    
    if (val === 'Başarısız' || val === 'Manuel Zararda') {
      if (!rr) {
        setRr('-1');
      } else if (parseFloat(rr) > 0) {
        setRr((parseFloat(rr) * -1).toString());
      }
    } else if (val === 'Başarılı' || val === 'Manuel Karda') {
      if (rr && parseFloat(rr) < 0) {
        setRr(Math.abs(parseFloat(rr)).toString());
      }
    }
  };
  const [postNotes, setPostNotes] = useState('');
  
  const [prePhotos, setPrePhotos] = useState<string[]>([]);
  const [postPhotos, setPostPhotos] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pre' | 'post') => {
    const files = Array.from(e.target.files || []) as File[];
    const currentPhotos = type === 'pre' ? prePhotos : postPhotos;
    
    if (currentPhotos.length + files.length > 3) {
      alert('En fazla 3 fotoğraf yükleyebilirsiniz.');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'pre') {
          setPrePhotos(prev => [...prev, reader.result as string]);
        } else {
          setPostPhotos(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number, type: 'pre' | 'post') => {
    if (type === 'pre') {
      setPrePhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setPostPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      alert(t('pleaseSelectDate') || 'Lütfen tarih seçin');
      return;
    }
    const newTrade: Trade = {
      id: Date.now().toString(),
      date,
      symbol,
      type,
      risk: parseFloat(risk) || 0,
      reward: parseFloat(reward) || 0,
      rr,
      result,
      preTradeNotes: preNotes,
      postTradeNotes: postNotes,
      preTradePhotos: prePhotos,
      postTradePhotos: postPhotos,
    };
    onSave(newTrade);
    
    // Reset form
    setDate('');
    setSymbol('EURUSD');
    setRisk('');
    setReward('');
    setRr('');
    setPreNotes('');
    setPostNotes('');
    setPrePhotos([]);
    setPostPhotos([]);
    setResult('Başarılı');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="p-6 border-b border-zinc-100">
        <h2 className="text-lg font-semibold text-zinc-900">{t('formTitle')}</h2>
        <p className="text-sm text-zinc-500 mt-1">{t('formSubtitle')}</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Top Grid: Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">{t('dateTime')}</label>
            <DatePicker
              value={date ? new Date(date) : null}
              onChange={(dateObj: DateObject | null) => {
                if (dateObj) {
                  setDate(dateObj.toDate().toISOString());
                } else {
                  setDate('');
                }
              }}
              format="YYYY/MM/DD HH:mm"
              plugins={[
                <TimePicker position="bottom" />
              ]}
              calendar={language === 'fa' ? persian : undefined}
              locale={language === 'fa' ? persian_fa : undefined}
              inputClass="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
              containerClassName="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">{t('symbol')}</label>
            <select value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all bg-white">
              <option value="EURUSD">EURUSD</option>
              <option value="USDJPY">USDJPY</option>
              <option value="GBPUSD">GBPUSD</option>
              <option value="XAUUSD">XAUUSD</option>
              <option value="US100">US100</option>
              <option value="SPX500">SPX500</option>
              <option value="AUDUSD">AUDUSD</option>
              <option value="US30">US30</option>
              <option value="USOil">USOil</option>
              <option value="USDCHF">USDCHF</option>
              <option value="USDCAD">USDCAD</option>
              <option value="GBPJPY">GBPJPY</option>
              <option value="EURJPY">EURJPY</option>
              <option value="UKOil">UKOil</option>
              <option value="GER30">GER30</option>
              <option value="EURGBP">EURGBP</option>
              <option value="XAGUSD">XAGUSD</option>
              <option value="NZDUSD">NZDUSD</option>
              <option value="AUDJPY">AUDJPY</option>
              <option value="EURAUD">EURAUD</option>
              <option value="UK100">UK100</option>
              <option value="JPN225">JPN225</option>
              <option value="NGCUSD">NGCUSD</option>
              <option value="F40EUR">F40EUR</option>
              <option value="AUS200">AUS200</option>
              <option value="HSIHKD">HSIHKD</option>
              <option value="USDCNH">USDCNH</option>
              <option value="USDMXN">USDMXN</option>
              <option value="USDZAR">USDZAR</option>
              <option value="USDSGD">USDSGD</option>
              <option value="USDNOK">USDNOK</option>
              <option value="USDSEK">USDSEK</option>
              <option value="USDHKD">USDHKD</option>
              <option value="EURCAD">EURCAD</option>
              <option value="EURNZD">EURNZD</option>
              <option value="GBPCAD">GBPCAD</option>
              <option value="GBPNZD">GBPNZD</option>
              <option value="AUDCAD">AUDCAD</option>
              <option value="AUDCHF">AUDCHF</option>
              <option value="NZDCAD">NZDCAD</option>
              <option value="NZDCHF">NZDCHF</option>
              <option value="CADJPY">CADJPY</option>
              <option value="CADCHF">CADCHF</option>
              <option value="EURHUF">EURHUF</option>
              <option value="EURPLN">EURPLN</option>
              <option value="EURCZK">EURCZK</option>
              <option value="SPN35EUR">SPN35EUR</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">{t('type')}</label>
            <select value={type} onChange={e => setType(e.target.value as 'Buy' | 'Sell')} className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all bg-white">
              <option value="Buy">{t('buy')}</option>
              <option value="Sell">{t('sell')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">{t('rr')}</label>
            <input type="number" step="any" value={rr} onChange={e => setRr(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all font-mono" placeholder={t('rrPlaceholder')} />
          </div>
        </div>

        {/* Middle Grid: Financials & Result */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-100">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">{t('risk')}</label>
            <div className="relative">
              <span className="absolute start-3 top-2.5 text-zinc-400">$</span>
              <input type="number" min="0" step="0.01" required value={risk} onChange={e => setRisk(e.target.value)} className="w-full ps-8 pe-3 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all font-mono" placeholder="0.00" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">{t('reward')}</label>
            <div className="relative">
              <span className="absolute start-3 top-2.5 text-zinc-400">$</span>
              <input type="number" step="0.01" value={reward} onChange={e => setReward(e.target.value)} className="w-full ps-8 pe-3 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all font-mono" placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">{t('result')}</label>
            <select value={result} onChange={handleResultChange} className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all bg-white">
              <option value="Başarılı">{t('resultWin')}</option>
              <option value="Başarısız">{t('resultLoss')}</option>
              <option value="Manuel Karda">{t('resultManualWin')}</option>
              <option value="Manuel Zararda">{t('resultManualLoss')}</option>
            </select>
          </div>
        </div>

        {/* Pre-Trade Section */}
        <div className="pt-8 border-t border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4 uppercase tracking-wider">
            {t('preTrade')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-700">{t('photos')}</label>
              <PhotoUploader photos={prePhotos} onUpload={(e) => handlePhotoUpload(e, 'pre')} onRemove={(i) => removePhoto(i, 'pre')} />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-700">{t('notes')}</label>
              <textarea required value={preNotes} onChange={e => setPreNotes(e.target.value)} className="w-full h-40 px-3 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all resize-none" placeholder={t('preNotesPlaceholder')} />
            </div>
          </div>
        </div>

        {/* Post-Trade Section */}
        <div className="pt-8 border-t border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4 uppercase tracking-wider">
            {t('postTrade')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-700">{t('photos')}</label>
              <PhotoUploader photos={postPhotos} onUpload={(e) => handlePhotoUpload(e, 'post')} onRemove={(i) => removePhoto(i, 'post')} />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-700">{t('notes')}</label>
              <textarea value={postNotes} onChange={e => setPostNotes(e.target.value)} className="w-full h-40 px-3 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all resize-none" placeholder={t('postNotesPlaceholder')} />
            </div>
          </div>
        </div>

      </div>

      <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
        <button type="submit" className="px-6 py-2.5 bg-zinc-900 text-white font-medium rounded-xl hover:bg-black focus:ring-4 focus:ring-zinc-200 transition-all">
          {t('saveButton')}
        </button>
      </div>
    </form>
  );
}

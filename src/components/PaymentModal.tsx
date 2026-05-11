import React, { useState } from 'react';
import { X, Check, Shield, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '@clerk/clerk-react';

interface PaymentModalProps {
  onClose: () => void;
}

export default function PaymentModal({ onClose }: PaymentModalProps) {
  const { language } = useLanguage();
  const { user } = useUser();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [referralCode, setReferralCode] = useState('');
  const [referralStatus, setReferralStatus] = useState<null | 'valid' | 'invalid'>(null);
  const [rewardDays, setRewardDays] = useState(0);
  const [validating, setValidating] = useState(false);

  const monthlyPrice = 12.99;
  const yearlyPrice = 99;
  const savings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);
  const totalPrice = billing === 'monthly' ? monthlyPrice : yearlyPrice;

  const proFeatures = [
    language === 'tr' ? 'Sınırsız Journal & Trade' : 'Unlimited Journals & Trades',
    language === 'tr' ? 'Sınırsız Fotoğraf Yükleme' : 'Unlimited Photo Upload',
    language === 'tr' ? 'AI Analiz' : 'AI Analysis',
    language === 'tr' ? 'Gelişmiş İstatistikler' : 'Advanced Statistics',
    language === 'tr' ? 'Drawdown & Streak Analizi' : 'Drawdown & Streak Analysis',
    language === 'tr' ? 'Öncelikli Destek' : 'Priority Support',
  ];

  const validateCode = async () => {
    if (!referralCode.trim() || !user) return;
    setValidating(true);
    try {
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', userId: user.id, code: referralCode.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setReferralStatus('valid');
        const splitType = data.splitType || '50_50';
        const days = billing === 'monthly'
          ? (splitType === '100_friend' ? 14 : 7)
          : (splitType === '100_friend' ? 90 : 45);
        setRewardDays(days);
      } else {
        setReferralStatus('invalid');
        setRewardDays(0);
      }
    } catch {
      setReferralStatus('invalid');
    }
    setValidating(false);
  };

  const handleBillingChange = (b: 'monthly' | 'yearly') => {
    setBilling(b);
    setReferralStatus(null);
    setRewardDays(0);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="rounded-2xl w-full max-w-md my-8 overflow-hidden"
        style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="text-lg font-bold text-white">
              {language === 'tr' ? "Pro'ya Geç" : 'Upgrade to Pro'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {language === 'tr' ? 'Tüm özelliklere sınırsız erişim' : 'Unlimited access to all features'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Plan seçimi */}
          <div className="flex gap-3">
            <button onClick={() => handleBillingChange('monthly')}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all relative"
              style={billing === 'monthly'
                ? { background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.4)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>{language === 'tr' ? 'Aylık' : 'Monthly'}</div>
              <div className="text-xs mt-0.5 font-normal">$12.99 / {language === 'tr' ? 'ay' : 'mo'}</div>
            </button>
            <button onClick={() => handleBillingChange('yearly')}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all relative"
              style={billing === 'yearly'
                ? { background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.4)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: '#34d399', color: '#000' }}>%{savings}</span>
              <div>{language === 'tr' ? 'Yıllık' : 'Yearly'}</div>
              <div className="text-xs mt-0.5 font-normal">$8.25 / {language === 'tr' ? 'ay' : 'mo'}</div>
            </button>
          </div>

          {/* Özellikler */}
          <div className="space-y-2.5">
            {proFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.15)' }}>
                  <Check className="w-3 h-3" style={{ color: '#a78bfa' }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{f}</span>
              </div>
            ))}
          </div>

          {/* 3 gün trial */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <Shield className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} />
            <span className="text-xs" style={{ color: '#34d399' }}>
              {language === 'tr'
                ? '3 Gün Ücretsiz Dene — 3. günün sonunda ödeme alınır'
                : '3-Day Free Trial — charged on day 3'}
            </span>
          </div>

          {/* Referans kodu */}
          <div className="space-y-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
            <label className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <Tag className="w-3.5 h-3.5" />
              {language === 'tr' ? 'Referans Kodu (opsiyonel)' : 'Referral Code (optional)'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralCode}
                onChange={e => { setReferralCode(e.target.value.toUpperCase()); setReferralStatus(null); setRewardDays(0); }}
                onKeyDown={e => { if (e.key === 'Enter') validateCode(); }}
                placeholder="ST-XXXXXX-XXXX"
                className="flex-1 px-3 py-2 rounded-xl text-sm font-mono outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: referralStatus === 'valid'
                    ? '1px solid rgba(52,211,153,0.4)'
                    : referralStatus === 'invalid'
                    ? '1px solid rgba(248,113,113,0.4)'
                    : '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }} />
              <button onClick={validateCode} disabled={!referralCode.trim() || validating}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                {validating ? '...' : (language === 'tr' ? 'Uygula' : 'Apply')}
              </button>
            </div>

            {referralStatus === 'valid' && (
              <div className="px-3 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
                🎁 {language === 'tr'
                  ? `${rewardDays} gün ücretsiz ödülünüz ödeme onaylandığında hesabınıza eklenecektir.`
                  : `${rewardDays} free days will be added to your account once payment is confirmed.`}
              </div>
            )}
            {referralStatus === 'invalid' && (
              <p className="text-xs" style={{ color: '#f87171' }}>
                {language === 'tr' ? 'Geçersiz veya daha önce kullanılmış kod.' : 'Invalid or already used code.'}
              </p>
            )}
          </div>

          {/* Toplam + Ödeme */}
          <div className="space-y-3 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {language === 'tr' ? 'Toplam' : 'Total'}
              </span>
              <div className="text-end">
                <span className="text-2xl font-bold text-white">${totalPrice}</span>
                <span className="text-sm ms-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {billing === 'yearly'
                    ? (language === 'tr' ? '/ yıl' : '/ year')
                    : (language === 'tr' ? '/ ay' : '/ month')}
                </span>
              </div>
            </div>

            <button disabled
              className="w-full py-3 rounded-xl text-sm font-semibold cursor-not-allowed"
              style={{ background: 'rgba(139,92,246,0.15)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(139,92,246,0.15)' }}>
              💳 {language === 'tr' ? 'Ödeme Yap — Yakında' : 'Pay Now — Coming Soon'}
            </button>
            <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {language === 'tr'
                ? 'Ödeme sistemi çok yakında aktif olacak'
                : 'Payment system coming very soon'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

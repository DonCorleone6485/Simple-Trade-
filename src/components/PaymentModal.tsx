import React, { useState } from 'react';
import { pick, pct } from '../lib/appCopy';
import { aria } from '../lib/aria';
import { X, Check, Shield, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser, useAuth } from '@clerk/clerk-react';
import { usePrices } from '../lib/pricing';

interface PaymentModalProps {
  onClose: () => void;
}

export default function PaymentModal({ onClose }: PaymentModalProps) {
  const { language } = useLanguage();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [referralCode, setReferralCode] = useState('');
  const [referralStatus, setReferralStatus] = useState<null | 'valid' | 'invalid'>(null);
  const [rewardDays, setRewardDays] = useState(0);
  const [validating, setValidating] = useState(false);

  const prices = usePrices();
  const savings = prices.savings;
  const totalPrice = prices.fmt(billing === 'monthly' ? prices.monthly : prices.yearly);

  const proFeatures = [
    pick(language, 'Her gün sınırsız işlem ve journal', 'Unlimited trades & journals, every day'),
    pick(language, 'Sesli not ve yapay zekâ analizi', 'Voice notes & AI analysis'),
    pick(language, 'MetaTrader otomatik kayıt, sınırsız', 'Unlimited MetaTrader auto-sync'),
    pick(language, 'İşlem öncesi ve sonrası 3\'er fotoğraf', '3 photos before and 3 after each trade'),
  ];

  const validateCode = async () => {
    if (!referralCode.trim() || !user) return;
    setValidating(true);
    try {
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getToken()}` },
        body: JSON.stringify({ action: 'validate', code: referralCode.trim() }),
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
        style={{ background: 'rgba(255,255,255,0.025)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="text-lg font-bold text-white">
              {pick(language, 'Pro\'ya Geç', 'Upgrade to Pro')}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {pick(language, 'Tüm özelliklere sınırsız erişim', 'Unlimited access to all features')}
            </p>
          </div>
          <button onClick={onClose} aria-label={aria('close', language)} className="p-1.5 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Plan seçimi */}
          <div className="flex gap-3">
            <button onClick={() => handleBillingChange('monthly')}
              className="flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all relative"
              style={billing === 'monthly'
                ? { background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.4)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>{pick(language, 'Aylık', 'Monthly')}</div>
              <div className="text-xs mt-0.5 font-normal">{prices.fmt(prices.monthly)} / {pick(language, 'ay', 'mo')}</div>
            </button>
            <button onClick={() => handleBillingChange('yearly')}
              className="flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all relative"
              style={billing === 'yearly'
                ? { background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.4)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: '#34d399', color: '#000' }}>{pct(savings, language)}</span>
              <div>{pick(language, 'Yıllık', 'Yearly')}</div>
              <div className="text-xs mt-0.5 font-normal">{prices.fmt(prices.yearlyMonthly)} / {pick(language, 'ay', 'mo')}</div>
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
              {pick(language, 'İstediğin zaman iptal et', 'Cancel anytime')}
            </span>
          </div>

          {/* Referans kodu */}
          <div className="space-y-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
            <label className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <Tag className="w-3.5 h-3.5" />
              {pick(language, 'Referans Kodu (opsiyonel)', 'Referral Code (optional)')}
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
                className="px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-40 flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                {validating ? '...' : (pick(language, 'Uygula', 'Apply'))}
              </button>
            </div>

            {referralStatus === 'valid' && (
              <div className="px-3 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
                🎁 {pick(language, '{0} gün ücretsiz ödülünüz ödeme onaylandığında hesabınıza eklenecektir.', '{0} free days will be added to your account once payment is confirmed.', rewardDays)}
              </div>
            )}
            {referralStatus === 'invalid' && (
              <p className="text-xs" style={{ color: '#f87171' }}>
                {pick(language, 'Geçersiz veya daha önce kullanılmış kod.', 'Invalid or already used code.')}
              </p>
            )}
          </div>

          {/* Toplam + Ödeme */}
          <div className="space-y-3 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {pick(language, 'Toplam', 'Total')}
              </span>
              <div className="text-end">
                <span className="font-display text-[26px] font-medium text-white">{totalPrice}</span>
                <span className="text-sm ms-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {billing === 'yearly'
                    ? (pick(language, '/ yıl', '/ year'))
                    : (pick(language, '/ ay', '/ month'))}
                </span>
              </div>
            </div>

            <button disabled
              className="w-full py-3 rounded-full text-sm font-medium cursor-not-allowed"
              style={{ background: 'rgba(139,92,246,0.15)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(139,92,246,0.15)' }}>
              💳 {pick(language, 'Ödeme Yap — Yakında', 'Pay Now — Coming Soon')}
            </button>
            <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {pick(language, 'Ödeme sistemi çok yakında aktif olacak', 'Payment system coming very soon')}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

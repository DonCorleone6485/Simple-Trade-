import React, { useState } from 'react';
import { Check, Zap, TrendingUp, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PricingPageProps {
  onboardingMode?: boolean;
  expiredMode?: boolean;
  onFreeStart?: () => void;
  onProStart?: () => void;
}

export default function PricingPage({ onboardingMode, expiredMode, onFreeStart, onProStart }: PricingPageProps) {
  const { language } = useLanguage();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');

  const t = (tr: string, en: string, fa: string) => {
    if (language === 'tr') return tr;
    if (language === 'fa') return fa;
    return en;
  };

  const freeFeatures = [
    t('1 Journal', '1 Journal', '۱ ژورنال'),
    t('Günde 1 Trade (Maks. 20 Trade)', 'Daily 1 Trade (Max. 20 Trades)', 'روزانه ۱ معامله (حداکثر ۲۰ معامله)'),
    t('Trade Başına 1 Fotoğraf', '1 Photo per Trade', '۱ عکس در هر معامله'),
    t('Tüm İstatistikler', 'All Statistics', 'همه آمارها'),
    t('Takvim Görünümü', 'Calendar View', 'نمای تقویم'),
    t('Hedef & Kural Sistemi', 'Goals & Rules System', 'سیستم اهداف و قوانین'),
    t('Isı Haritası', 'Heat Map', 'نقشه حرارتی'),
    t('Setup Performans Analizi', 'Setup Performance Analysis', 'تحلیل عملکرد ستاپ'),
  ];

  const proFeatures = [
    t('Sınırsız Journal', 'Unlimited Journals', 'ژورنال نامحدود'),
    t('Sınırsız Trade', 'Unlimited Trades', 'معاملات نامحدود'),
    t('Sınırsız Fotoğraf Yükleme', 'Unlimited Photo Upload', 'آپلود عکس نامحدود'),
    t('AI Analiz', 'AI Analysis', 'تحلیل هوش مصنوعی'),
    t('Gelişmiş İstatistikler', 'Advanced Statistics', 'آمار پیشرفته'),
    t('Hedef & Kural Sistemi', 'Goals & Rules System', 'سیستم اهداف و قوانین'),
    t('Drawdown & Streak Analizi', 'Drawdown & Streak Analysis', 'تحلیل افت و سری'),
    t('Isı Haritası', 'Heat Map', 'نقشه حرارتی'),
    t('Setup Performans Analizi', 'Setup Performance Analysis', 'تحلیل عملکرد ستاپ'),
    t('Öncelikli Destek', 'Priority Support', 'پشتیبانی اولویت‌دار'),
  ];

  const monthlyPrice = 12.99;
  const yearlyPrice = 99;
  const yearlyMonthly = (yearlyPrice / 12).toFixed(2);
  const savings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

  const content = (
    <div className="min-h-screen py-16 px-4" style={{ background: '#0d0e1a' }}>
      <div className="text-center mb-12">
        {onboardingMode ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6" style={{ color: '#8b5cf6' }} />
              <span className="text-xl font-bold text-white">Trade Journal</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {t('Hoş Geldiniz! 👋', 'Welcome! 👋', '!خوش آمدید 👋')}
            </h1>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('Nasıl başlamak istersiniz?', 'How would you like to get started?', 'چطور می‌خواهید شروع کنید؟')}
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
              <Zap className="w-4 h-4" />
              {t('Fiyatlandırma', 'Pricing', 'قیمت‌گذاری')}
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {t('Sade ve Şeffaf Fiyatlar', 'Simple & Transparent Pricing', 'قیمت‌های ساده و شفاف')}
            </h1>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('Ücretsiz başlayın, büyüdükçe yükseltin.', 'Start free, upgrade as you grow.', 'رایگان شروع کنید، با رشد ارتقا دهید.')}
            </p>
          </>
        )}
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className="text-sm font-medium" style={{ color: billing === 'monthly' ? '#fff' : 'rgba(255,255,255,0.4)' }}>
          {t('Aylık', 'Monthly', 'ماهانه')}
        </span>
        <button
          onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
          className="relative w-14 h-7 rounded-full transition-all"
          style={{ background: billing === 'yearly' ? '#8b5cf6' : 'rgba(255,255,255,0.1)' }}
        >
          <div className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all"
            style={{ left: billing === 'yearly' ? '32px' : '4px' }} />
        </button>
        <span className="text-sm font-medium" style={{ color: billing === 'yearly' ? '#fff' : 'rgba(255,255,255,0.4)' }}>
          {t('Yıllık', 'Yearly', 'سالانه')}
          <span className="ms-2 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
            {t(`%${savings} İndirim`, `${savings}% Off`, `${savings}% تخفیف`)}
          </span>
        </span>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* FREE */}
        <div className="rounded-2xl p-8" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">{t('Ücretsiz', 'Free', 'رایگان')}</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('Başlamak için ideal', 'Perfect to get started', 'ایده‌آل برای شروع')}
            </p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-bold text-white">$0</span>
            <span className="text-sm ms-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('/ sonsuza kadar', '/ forever', '/ برای همیشه')}
            </span>
          </div>
          <button
            onClick={onFreeStart}
            className="w-full py-3 rounded-xl text-sm font-semibold mb-8 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
          >
            {t('Ücretsiz Başla', 'Get Started Free', 'شروع رایگان')}
          </button>
          <div className="space-y-3">
            {freeFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(52,211,153,0.1)' }}>
                  <Check className="w-3 h-3" style={{ color: '#34d399' }} />
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PRO */}
        <div className="rounded-2xl p-8 relative"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1))', border: '1px solid rgba(139,92,246,0.3)' }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1 rounded-full text-xs font-semibold" style={{ background: '#8b5cf6', color: '#fff' }}>
              {t('En Popüler', 'Most Popular', 'محبوب‌ترین')}
            </span>
          </div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5" style={{ color: '#a78bfa' }} />
              <h2 className="text-xl font-bold text-white">Pro</h2>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('Ciddi traderlar için', 'For serious traders', 'برای معامله‌گران جدی')}
            </p>
          </div>
          <div className="mb-2">
            <span className="text-5xl font-bold text-white">
              ${billing === 'monthly' ? monthlyPrice : yearlyMonthly}
            </span>
            <span className="text-sm ms-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('/ ay', '/ month', '/ ماه')}
            </span>
            {billing === 'yearly' && (
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {t(`Yıllık $${yearlyPrice} faturalandırılır`, `Billed $${yearlyPrice}/year`, `${yearlyPrice}$ سالانه فاکتور می‌شود`)}
              </p>
            )}
          </div>

          {/* 3 Gün Trial */}
          <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <Shield className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} />
            <span className="text-xs font-medium" style={{ color: '#34d399' }}>
              {t(
                '3 Gün Ücretsiz Dene — 3. günün sonunda ödeme alınır, istediğin zaman iptal et',
                '3-Day Free Trial — charged on day 3, cancel anytime',
                '۳ روز رایگان — در روز سوم پرداخت می‌شود، هر زمان لغو کن'
              )}
            </span>
          </div>

          <button
            onClick={onProStart}
            className="w-full py-3 rounded-xl text-sm font-semibold mb-8 transition-all"
            style={{ background: '#8b5cf6', color: '#fff' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}
          >
            {t("Pro'ya Geç", 'Upgrade to Pro', 'ارتقا به Pro')}
          </button>

          <div className="space-y-3">
            {proFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.2)' }}>
                  <Check className="w-3 h-3" style={{ color: '#a78bfa' }} />
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {t(
            'Kart bilgisi gereklidir • 3 gün ücretsiz • 3. günün sonunda ödeme alınır • İstediğiniz zaman iptal edin',
            'Card required • 3-day free trial • Charged on day 3 • Cancel anytime',
            'کارت لازم است • ۳ روز رایگان • در روز سوم پرداخت • هر زمان لغو کنید'
          )}
        </p>
      </div>
    </div>
  );

  if (onboardingMode) {
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto" style={{ background: '#0d0e1a' }}>
        {content}
      </div>
    );
  }

  return content;
}

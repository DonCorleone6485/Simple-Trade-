import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { copy } from '../lib/landingCopy';
import PricingCards from './PricingCards';

interface PricingPageProps {
  /** Tam ekran: deneme ya da Pro süresi bittiğinde bir kez açılıyor. */
  onboardingMode?: boolean;
  expiredMode?: boolean;
  onFreeStart?: () => void;
  onProStart?: () => void;
  /** Düğme yazıları duruma göre App'ten gelir ("Mevcut planın" gibi). */
  freeLabel?: string;
  proLabel?: string;
  freeDisabled?: boolean;
  proDisabled?: boolean;
}

/**
 * Uygulamadaki fiyat sayfası. Kartlar ana sayfadakiyle aynı bileşen
 * (PricingCards); burada ek olarak aylık/yıllık seçimi var.
 */
export default function PricingPage({
  onboardingMode, expiredMode, onFreeStart, onProStart, freeLabel, proLabel, freeDisabled, proDisabled,
}: PricingPageProps) {
  const { language } = useLanguage();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');

  /**
   * Metinler kaynakta üç dille yazılı; kalan altı dil landingCopy.ts'ten
   * İngilizce metnin kendisiyle aranıyor. Çeviri bulunamazsa İngilizce
   * dönüyor — eksik bir satır sayfayı boş bırakmıyor.
   */
  const t = (tr: string, en: string, fa: string) => {
    if (language === 'tr') return tr;
    if (language === 'fa') return fa;
    if (language === 'en') return en;
    return copy(en, language);
  };

  const monthlyPrice = 12.99;
  const yearlyPrice = 99;
  const yearlyMonthly = (yearlyPrice / 12).toFixed(2);
  const savings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

  const content = (
    <div className={onboardingMode ? 'min-h-screen py-16 px-4' : 'py-4'} style={onboardingMode ? { background: '#0d0e1a' } : undefined}>
      <div className="max-w-4xl mx-auto mb-10">
        <span className="channel mb-5 block">{t('Fiyat', 'Pricing', 'قیمت')}</span>
        <h1 className="poster text-[2.1rem] sm:text-[2.6rem] mb-3">
          {expiredMode
            ? t('Pro süren bitti', 'Your Pro time has ended', 'زمان Pro تو تمام شد')
            : t('Sade ve Şeffaf Fiyatlandırma', 'Simple & Transparent Pricing', 'قیمت‌گذاری ساده و شفاف')}
        </h1>
        <p className="text-[16px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {expiredMode
            ? t('Ücretsiz planla devam edebilir ya da Pro\'ya geçebilirsin. Kayıtların hiçbiri silinmedi.',
                'You can carry on with the Free plan or upgrade to Pro. None of your records were deleted.',
                'می‌توانی با پلن رایگان ادامه دهی یا به Pro ارتقا دهی. هیچ‌کدام از سوابقت حذف نشد.')
            : t('Ücretsiz başla, büyüdükçe yükselt.', 'Start free, upgrade as you grow.', 'رایگان شروع کنید، با رشد ارتقا دهید.')}
        </p>
      </div>

      {/* Aylık / yıllık */}
      <div className="flex items-center justify-center gap-4 mb-8">
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
            {t('%{n} İndirim', '{n}% Off', '{n}% تخفیف').replace('{n}', String(savings))}
          </span>
        </span>
      </div>

      <PricingCards
        t={t}
        free={{
          label: freeLabel || (expiredMode
            ? t('Ücretsiz devam et', 'Continue free', 'ادامه رایگان')
            : t('Ücretsiz Başla', 'Get Started Free', 'شروع رایگان')),
          onClick: () => onFreeStart?.(),
          disabled: freeDisabled,
        }}
        pro={{
          label: proLabel || t("Pro'ya Geç", 'Upgrade to Pro', 'ارتقا به Pro'),
          onClick: () => onProStart?.(),
          disabled: proDisabled,
        }}
        proPrice={billing === 'monthly'
          ? { amount: `$${monthlyPrice}`, note: t('/ ay', '/ month', '/ ماه') }
          : { amount: `$${yearlyMonthly}`, note: t('/ ay (yıllık $99)', '/ mo (billed $99/yr)', '/ ماه (سالانه ۹۹$)') }}
      />

      <p className="text-center text-[13px] mt-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {t('Deneme için kart istemiyoruz · Deneme bitince kendiliğinden Ücretsiz plana dönersin',
          'No card for the trial · When it ends you drop back to Free on your own',
          'برای آزمایش کارت نمی‌خواهیم · بعد از پایان، خودکار به پلن رایگان برمی‌گردی')}
      </p>
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

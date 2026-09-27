import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { usePrices } from '../lib/pricing';

/**
 * Ücretsiz ve Pro kartları — ana sayfa ile uygulamadaki "Pro'ya Geç" sayfası
 * aynı kartları gösteriyor. Önce iki ayrı tasarım vardı ve biri güncellenip
 * öteki unutuldukça ikisi farklı şeyler söylemeye başlamıştı (uygulamadaki
 * sayfa hâlâ "kart gerekli, 3. gün ücret alınır" diyordu). Değişen tek şey
 * düğmeler: ana sayfada "Ücretsiz Başla", uygulamada "Mevcut planın" gibi.
 *
 * İki kart da sütun: düğme her zaman dibe oturuyor, satır sayısı ya da dil
 * değişse de iki düğme aynı hizada kalıyor.
 */
type T = (tr: string, en: string, fa: string) => string;

interface CardButton {
  label: string;
  onClick: () => void;
  /** Tıklanamaz (örneğin zaten bu plandasın). */
  disabled?: boolean;
}

export default function PricingCards({ t, free, pro, proPrice }: {
  t: T;
  free: CardButton;
  pro: CardButton;
  /** Pro'nun büyük rakamı ve yanındaki not; verilmezse yıllığın aylık karşılığı. */
  proPrice?: { amount: string; note: string };
}) {
  const reduce = useReducedMotion();
  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
  };
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.1 } } };

  const freeFeatures = [
    t('1 Journal', '1 Journal', '۱ ژورنال'),
    t('Günde 2 işlem (fazlası kilitli saklanır)', '2 trades a day (extras kept locked)', '۲ معامله در روز (بقیه قفل نگه داشته می‌شوند)'),
    t('MetaTrader otomatik kayıt ve içe aktarma', 'MetaTrader auto-sync & file import', 'ثبت خودکار متاتریدر و وارد کردن فایل'),
    t('Tüm istatistikler, takvim ve disiplin analizi', 'All statistics, calendar & discipline analysis', 'همه آمارها، تقویم و تحلیل انضباط'),
    t('Seanslar, günün haberleri ve prop değerlendirme', 'Sessions, daily news & prop review', 'سشن‌ها، اخبار روز و ارزیابی پراپ'),
  ];
  const proFeatures = [
    t('Her gün sınırsız işlem ve journal', 'Unlimited trades & journals, every day', 'معامله و ژورنال نامحدود، هر روز'),
    t('MetaTrader otomatik kayıt, sınırsız', 'Unlimited MetaTrader auto-sync', 'ثبت خودکار متاتریدر، نامحدود'),
    t('Sesli not ve yapay zekâ analizi', 'Voice notes & AI analysis', 'یادداشت صوتی و تحلیل هوش مصنوعی'),
    t('İşlem öncesi ve sonrası 3\'er fotoğraf', '3 Photos Before and 3 After Each Trade', '۳ عکس قبل و ۳ عکس بعد از هر معامله'),
    t('Ücretsiz plandaki her şey', 'Everything in Free', 'همه امکانات پلن رایگان'),
  ];
  const prices = usePrices();
  const price = proPrice || { amount: prices.fmt(prices.yearlyMonthly), note: t('/ ay (yıllık)', '/ mo (yearly)', '/ ماه') };

  return (
    // İki plan tek yüzey üstünde, aralarında ince bir çizgi. Pro'yu doygun
    // mor bir kutuya koymak fiyatı değil reklamı öne çıkarıyordu.
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}
      className="max-w-4xl mx-auto rounded-3xl overflow-hidden grid sm:grid-cols-2"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>

      <motion.div variants={fadeUp} className="p-8 sm:p-10 flex flex-col">
        <h3 className="text-[15px] font-medium tracking-wide" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {t('Ücretsiz', 'Free', 'رایگان')}
        </h3>
        <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t('Başlamak için ideal', 'Perfect to get started', 'ایده‌آل برای شروع')}
        </p>
        <div className="mt-7 mb-8 flex items-baseline gap-2">
          <span className="font-display" style={{ fontSize: '52px', letterSpacing: '-0.04em', lineHeight: 1 }}>$0</span>
          <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('/ sonsuza kadar', '/ forever', '/ برای همیشه')}</span>
        </div>
        <div className="space-y-3 mb-9">
          {freeFeatures.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <span className="text-[14.5px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{f}</span>
            </div>
          ))}
        </div>
        <button onClick={free.onClick} disabled={free.disabled}
          className="mt-auto w-full py-3 rounded-full text-sm font-medium transition-all disabled:cursor-default"
          style={{ background: 'transparent', color: free.disabled ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.14)' }}
          onMouseEnter={e => { if (!free.disabled) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
          {free.label}
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="p-8 sm:p-10 relative flex flex-col"
        style={{
          borderInlineStart: '1px solid rgba(139,92,246,0.22)',
          background: 'linear-gradient(180deg, rgba(139,92,246,0.09), transparent 70%)',
          // Kutuyu doygun mora boyamak reklam gibi okunuyordu; ışık kenardan
          // içeri sızsın, kart kendi zemininde kalsın.
          boxShadow: 'inset 0 0 80px -40px rgba(139,92,246,0.55)',
        }}>
        {/* Vurgu: kutunun tamamını boyamak yerine üstte tek bir çizgi. */}
        <span className="absolute top-0 start-0 end-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #8b5cf6, transparent)' }} />
        <div className="flex items-baseline justify-between">
          <h3 className="text-[15px] font-medium tracking-wide">
            Pro
            {/* Deneme kartsız: bunu fiyatın hemen yanında söylemek, "önce
                kartımı mı isteyecekler" korkusunu baştan siliyor. */}
            <span className="ms-2 text-[12.5px] font-normal" style={{ color: '#34d399' }}>
              {t('(3 gün kartsız deneme)', '(3-day trial, no card)', '(۳ روز آزمایش بدون کارت)')}
            </span>
          </h3>
          <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: '#a78bfa' }}>
            {t('En Popüler', 'Most Popular', 'محبوب‌ترین')}
          </span>
        </div>
        <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t('Ciddi traderlar için', 'For serious traders', 'برای معامله‌گران جدی')}
        </p>
        <div className="mt-7 mb-8 flex items-baseline gap-2">
          <span className="font-display" style={{ fontSize: '52px', letterSpacing: '-0.04em', lineHeight: 1 }}>{price.amount}</span>
          <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{price.note}</span>
        </div>
        <div className="space-y-3 mb-9">
          {proFeatures.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#a78bfa' }} />
              <span className="text-[14.5px]" style={{ color: 'rgba(255,255,255,0.75)' }}>{f}</span>
            </div>
          ))}
        </div>
        <button onClick={pro.onClick} disabled={pro.disabled}
          className="cta mt-auto w-full py-3 rounded-full text-sm font-medium disabled:opacity-60 disabled:cursor-default"
          // Görünmez çerçeve: yandaki düğmenin 1px çizgisiyle aynı boyda kalsın.
          style={{ background: '#8b5cf6', color: '#fff', border: '1px solid transparent' }}>
          {pro.label}
        </button>
      </motion.div>
    </motion.div>
  );
}

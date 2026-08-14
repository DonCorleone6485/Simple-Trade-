import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  TrendingUp, BookOpen, BarChart2, CalendarDays, Target, Sparkles, Upload,
  Check, ChevronDown, ArrowRight, Shield, Globe,
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  /** Kullanıcı zaten giriş yapmışsa CTA'lar auth yerine journal'a yönlenir. */
  signedIn?: boolean;
}

const equityData = [
  { i: 1, v: 0 }, { i: 2, v: 180 }, { i: 3, v: 340 }, { i: 4, v: 260 }, { i: 5, v: 420 },
  { i: 6, v: 610 }, { i: 7, v: 540 }, { i: 8, v: 780 }, { i: 9, v: 950 }, { i: 10, v: 890 },
  { i: 11, v: 1120 }, { i: 12, v: 1340 }, { i: 13, v: 1280 }, { i: 14, v: 1560 }, { i: 15, v: 1840 },
];

const languages = [
  { code: 'tr', label: 'Türkçe' }, { code: 'en', label: 'English' }, { code: 'fa', label: 'فارسی' },
  { code: 'ar', label: 'العربية' }, { code: 'ru', label: 'Русский' }, { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' }, { code: 'de', label: 'Deutsch' }, { code: 'fr', label: 'Français' },
];

export default function LandingPage({ onGetStarted, onSignIn, signedIn = false }: LandingPageProps) {
  const { language, setLanguage } = useLanguage();
  const isRTL = language === 'fa' || language === 'ar';
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const t = (tr: string, en: string, fa: string) => {
    if (language === 'tr') return tr;
    if (language === 'fa') return fa;
    return en;
  };

  // Giriş yapmış kullanıcı için tüm "Ücretsiz Başla" CTA'ları journal'a götürür.
  const ctaLabel = signedIn
    ? t("Journal'a Git", 'Go to Journal', 'رفتن به ژورنال')
    : t('Ücretsiz Başla', 'Get Started Free', 'رایگان شروع کنید');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1 } },
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const whyItems = [
    {
      icon: <BarChart2 className="w-5 h-5" />,
      title: t('Örüntüyü Gör', 'See the Pattern', 'الگو را ببینید'),
      desc: t(
        'Hangi setup\'ta kazanıyorsun, hangi saatte kaybediyorsun? Veri olmadan bunu bilemezsin — hafızan yalan söyler, sayılar söylemez.',
        'Which setup wins, which hour bleeds you? You can\'t know without data — memory lies, numbers don\'t.',
        'در کدام ستاپ برنده می‌شوید و در چه ساعتی می‌بازید؟ بدون داده نمی‌توانید بدانید.'
      ),
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: t('Disiplini Koru', 'Keep the Discipline', 'نظم را حفظ کنید'),
      desc: t(
        'Kendi kurallarını yaz, ihlal ettiğin anı gör. Duygularınla değil, koyduğun sınırlarla trade et.',
        'Write your own rules, catch the moment you break them. Trade by the limits you set, not the emotions you feel.',
        'قوانین خود را بنویسید و لحظه نقض آن‌ها را ببینید.'
      ),
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: t('Hesap Ver', 'Stay Accountable', 'پاسخگو باشید'),
      desc: t(
        'Her işlemden sonra ne düşündüğünü not al. Aynı hatayı üçüncü kez yapmadan önce, ikincisini hatırla.',
        'Write down what you were thinking after every trade. Remember mistake two before you make it a third time.',
        'بعد از هر معامله، افکار خود را یادداشت کنید.'
      ),
    },
  ];

  const features = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: t('Her İşlem, Eksiksiz Kayıtlı', 'Every Trade, Fully Logged', 'هر معامله، کاملاً ثبت‌شده'),
      desc: t(
        'Sembol, yön, timeframe, setup, risk/kazanç ve R/R — işleme girmeden önce ve çıktıktan sonra not al, ekran görüntüsü ekle.',
        'Symbol, direction, timeframe, setup, risk/reward and R/R — write notes and attach screenshots before and after every trade.',
        'نماد، جهت، تایم‌فریم، ستاپ و ریسک/ریوارد را ثبت کنید.'
      ),
      span: 'lg:col-span-2',
      accent: '#8b5cf6',
    },
    {
      icon: <BarChart2 className="w-5 h-5" />,
      title: t('Verinin Arkasındaki Gerçek', 'The Truth Behind the Numbers', 'حقیقت پشت اعداد'),
      desc: t(
        'Kazanma oranı, profit factor, en iyi/en kötü işlem, seri analizleri ve kümülatif PnL grafiği — tek bakışta.',
        'Win rate, profit factor, best/worst trade, streak analysis and a cumulative PnL chart — at a glance.',
        'نرخ برد، فاکتور سود و تحلیل سری‌ها را در یک نگاه ببینید.'
      ),
      span: 'lg:col-span-2',
      accent: '#10b981',
    },
    {
      icon: <CalendarDays className="w-5 h-5" />,
      title: t('Takvimde Örüntünü Gör', 'See Your Calendar Pattern', 'الگوی خود را در تقویم ببینید'),
      desc: t('Günlük kâr/zarara göre renklenen takvim — hangi günler seni yoruyor, hemen belli olur.', 'A calendar color-coded by daily P&L — which days wear you down becomes obvious.', 'تقویمی که بر اساس سود و زیان روزانه رنگ می‌شود.'),
      span: '',
      accent: '#34d399',
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: t('Kuralların, İhlallerin Görünür', 'Your Rules, Your Violations', 'قوانین و نقض‌های شما'),
      desc: t('Aylık hedef, max risk, işlem yasağı saatleri belirle — sınırı aştığında sistem sana söylesin.', 'Set monthly goals, max risk and no-trade hours — the system flags it the moment you cross a line.', 'اهداف ماهانه و حداکثر ریسک را تعیین کنید.'),
      span: '',
      accent: '#fbbf24',
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: t('Yapay Zeka Koçun', 'Your AI Coach', 'مربی هوش مصنوعی شما'),
      desc: t('Tüm trade geçmişini AI ile analiz et — güçlü/zayıf yönlerini ve kişisel önerilerini al.', 'Analyze your entire trade history with AI — get strengths, weaknesses and personal recommendations.', 'تاریخچه معاملات خود را با هوش مصنوعی تحلیل کنید.'),
      span: '',
      accent: '#a78bfa',
      pro: true,
    },
    {
      icon: <Upload className="w-5 h-5" />,
      title: t('Geçmişini Bir Tıkla Aktar', 'Import Your History in One Click', 'تاریخچه خود را با یک کلیک وارد کنید'),
      desc: t('Broker\'ından aldığın CSV dosyasını yükle, işlemlerin otomatik olarak journal\'ına eklensin.', 'Upload the CSV export from your broker and every trade lands in your journal automatically.', 'فایل CSV کارگزار خود را آپلود کنید.'),
      span: '',
      accent: '#f87171',
    },
  ];

  const steps = [
    { n: '01', title: t('Journal Oluştur', 'Create a Journal', 'یک ژورنال بسازید'), desc: t('Başlangıç sermayeni ve tarihi gir, hesabını tanımla.', 'Set your starting capital and date to define your account.', 'سرمایه اولیه و تاریخ را وارد کنید.') },
    { n: '02', title: t('İşlemlerini Gir', 'Log Your Trades', 'معاملات خود را ثبت کنید'), desc: t('Tek tek kaydet ya da broker CSV\'ni tek seferde aktar.', 'Log them one by one, or import your broker\'s CSV in one go.', 'یک به یک ثبت کنید یا CSV را وارد کنید.') },
    { n: '03', title: t('Örüntünü İncele', 'Review Your Patterns', 'الگوهای خود را بررسی کنید'), desc: t('İstatistikler, takvim ve grafiklerle nerede güçlü nerede zayıf olduğunu gör.', 'See where you\'re strong and where you leak, through stats, calendar and charts.', 'با آمار و نمودارها نقاط قوت و ضعف را ببینید.') },
    { n: '04', title: t('Kurallarına Uy, Geliş', 'Follow the Rules, Improve', 'به قوانین پایبند باشید و پیشرفت کنید'), desc: t('Hedef koy, ihlalleri takip et, her ay bir öncekinden daha disiplinli ol.', 'Set goals, track violations, be more disciplined every month than the last.', 'اهداف تعیین کنید و نقض‌ها را دنبال کنید.') },
  ];

  const faqs = [
    {
      q: t('Ücretsiz olarak kullanabilir miyim?', 'Can I use it for free?', 'آیا می‌توانم رایگان استفاده کنم؟'),
      a: t('Evet. Free plan 1 journal, günde 1 / toplamda 20 işlem ve trade başına 1 fotoğrafla, tüm istatistiklere ve takvim görünümüne süresiz erişim sağlar. Kart bilgisi istemiyoruz.', 'Yes. The Free plan gives you 1 journal, 1 trade a day (20 total), 1 photo per trade, and unlimited access to all statistics and the calendar view. No card required.', 'بله. طرح رایگان به شما امکان دسترسی نامحدود به آمار می‌دهد.'),
    },
    {
      q: t('Pro deneme için kart bilgisi gerekiyor mu?', 'Does the Pro trial require a card?', 'آیا آزمایش Pro نیاز به کارت دارد؟'),
      a: t('Evet — 3 günlük ücretsiz deneme kart bilgisiyle başlar, 3. günün sonunda ücretlendirilir. İstediğin an, tek tıkla iptal edebilirsin.', 'Yes — the 3-day free trial starts with a card on file and you\'re charged at the end of day 3. Cancel anytime with one click.', 'بله — آزمایش ۳ روزه با کارت شروع می‌شود.'),
    },
    {
      q: t('Verilerim güvende mi?', 'Is my data private?', 'آیا داده‌های من امن است؟'),
      a: t('Evet. Verilerin Supabase üzerinde, satır bazlı güvenlik (RLS) ile korunur — başka hiçbir kullanıcı senin journal\'ına ya da işlemlerine erişemez.', 'Yes. Your data lives in Supabase with row-level security (RLS) enabled — no other user can ever access your journals or trades.', 'بله. داده‌های شما با امنیت سطح ردیف محافظت می‌شود.'),
    },
    {
      q: t('Hangi piyasalarda kullanabilirim?', 'Which markets can I use this for?', 'برای کدام بازارها می‌توانم استفاده کنم؟'),
      a: t('Herhangi birinde. Sembolü elle giriyorsun — forex, hisse, kripto, emtia; hiçbir borsaya veya brokere bağlı değiliz.', 'Any of them. You enter the symbol yourself — forex, stocks, crypto, commodities; we\'re not tied to any exchange or broker.', 'در هر بازاری — فارکس، سهام، ارز دیجیتال.'),
    },
    {
      q: t('CSV içe aktarma nasıl çalışır?', 'How does CSV import work?', 'وارد کردن CSV چگونه کار می‌کند؟'),
      a: t('Broker\'ından indirdiğin CSV dosyasını yükle; işlemlerin otomatik olarak seçtiğin journal\'a eklenir, tek tek elle girmene gerek kalmaz.', 'Upload the CSV file you export from your broker and every trade is added to the journal you pick — no manual re-entry.', 'فایل CSV کارگزار خود را آپلود کنید.'),
    },
    {
      q: t('Mobil uygulaması var mı?', 'Is there a mobile app?', 'آیا اپلیکیشن موبایل دارید؟'),
      a: t('Şu an için hayır — ama tamamen responsive bir web uygulaması, telefon veya tablet tarayıcından sorunsuz kullanabilirsin.', 'Not yet — but it\'s a fully responsive web app, so it works smoothly from your phone or tablet browser.', 'خیر، اما یک برنامه وب کاملاً واکنش‌گرا است.'),
    },
  ];

  const navLink: React.CSSProperties = { color: 'rgba(255,255,255,0.6)' };

  return (
    <div className="min-h-screen" style={{ background: '#0d0e1a', color: '#fff' }}>

      {/* ── NAV ── */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(13,14,26,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#8b5cf6' }} />
            <span className="font-bold tracking-tight text-sm sm:text-base">
              {t('Simple Trading Journal', 'Simple Trading Journal', 'سیمپل تریدینگ ژورنال')}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('features')} className="text-sm font-medium transition-colors" style={navLink}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
              {t('Özellikler', 'Features', 'امکانات')}
            </button>
            <button onClick={() => scrollTo('how-it-works')} className="text-sm font-medium transition-colors" style={navLink}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
              {t('Nasıl Çalışır', 'How It Works', 'چگونه کار می‌کند')}
            </button>
            <button onClick={() => scrollTo('pricing')} className="text-sm font-medium transition-colors" style={navLink}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
              {t('Fiyatlandırma', 'Pricing', 'قیمت‌گذاری')}
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden sm:block">
              <button onClick={() => setLangMenuOpen(o => !o)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}>
                <Globe className="w-4 h-4" />
                <span className="uppercase text-xs">{language}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {langMenuOpen && (
                <div className="absolute top-full end-0 mt-2 w-44 rounded-xl shadow-xl overflow-hidden z-50 py-1"
                  style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {languages.map(lang => (
                    <button key={lang.code} onClick={() => { setLanguage(lang.code as any); setLangMenuOpen(false); }}
                      className="w-full text-start px-4 py-2 text-sm transition-colors"
                      style={{ color: language === lang.code ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: language === lang.code ? 600 : 400 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!signedIn && (
              <button onClick={onSignIn}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ color: 'rgba(255,255,255,0.8)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; }}>
                {t('Giriş Yap', 'Sign In', 'ورود')}
              </button>
            )}
            <button onClick={onGetStarted}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#8b5cf6', color: '#fff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
              {signedIn && <BookOpen className="w-4 h-4" />}
              {ctaLabel}
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-32 sm:pt-40 pb-20 sm:pb-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-3xl opacity-[0.18]"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
              <Sparkles className="w-4 h-4" />
              {t('İşlem Günlüğü Platformu', 'Trading Journal Platform', 'پلتفرم ژورنال معاملاتی')}
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] font-medium mb-6"
              style={{ letterSpacing: '-0.01em' }}>
              {t('Her kayıp bir yerde ', 'Every loss repeats ', 'هر ضرر جایی ')}
              <span style={{ color: '#a78bfa', fontStyle: 'italic' }}>{t('tekrar eder', 'somewhere', 'تکرار می‌شود')}</span>
              {t('. Biz o yeri gösteririz.', '. We show you where.', '. ما آن را نشان می‌دهیم.')}
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg mb-8 max-w-xl" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {t(
                'İşlemlerini kaydet, istatistiklerini gör, kendi kurallarına uy. Simple Trading Journal, trading\'ini duygudan çıkarıp veriye döker.',
                'Log your trades, see the statistics, follow your own rules. Simple Trading Journal turns your trading from emotion into data.',
                'معاملات خود را ثبت کنید، آمار را ببینید و از قوانین خود پیروی کنید.'
              )}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: shouldReduceMotion ? 1 : 1.03 }}
                whileTap={{ scale: shouldReduceMotion ? 1 : 0.97 }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold"
                style={{ background: '#8b5cf6', color: '#fff' }}>
                {ctaLabel}
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </motion.button>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {t('Kredi kartı gerekmez • 30 saniyede başla', 'No credit card required • Start in 30 seconds', 'نیازی به کارت اعتباری نیست')}
              </span>
            </motion.div>
          </motion.div>

          {/* Hero visual: real equity-curve chart */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative rounded-2xl p-5 sm:p-6"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1))', border: '1px solid rgba(139,92,246,0.3)' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {t('Kümülatif PnL', 'Cumulative PnL', 'سود/زیان انباشته')}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                  +$1,840
                </span>
              </div>

              <motion.div
                className="h-56 sm:h-64 w-full"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: shouldReduceMotion ? 0 : 1.3, delay: shouldReduceMotion ? 0 : 0.8, ease: [0.65, 0, 0.35, 1] }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="i" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} dy={8} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} dx={-8} tickFormatter={v => `$${v}`} />
                    <Tooltip contentStyle={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      formatter={(value: number) => [`$${value}`, t('Kümülatif PnL', 'Cumulative PnL', 'سود/زیان انباشته')]}
                      labelFormatter={label => `${t('İşlem', 'Trade', 'معامله')} #${label}`} />
                    <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#heroGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: shouldReduceMotion ? 0 : 1.9 }}
              className="absolute -bottom-5 -start-3 sm:-start-6 rounded-xl px-4 py-3 shadow-2xl"
              style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('Kazanma Oranı', 'Win Rate', 'نرخ برد')}</div>
              <div className="text-2xl font-bold font-mono" style={{ color: '#34d399' }}>%68</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── NEDEN JOURNAL ── */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}
        className="py-20 sm:py-24 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-medium mb-4">
              {t('Neden Journal Tutmak İşe Yarar?', 'Why Trade Journaling Works', 'چرا ثبت معاملات مؤثر است؟')}
            </h2>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('Trading kaybı çoğunlukla kötü bir setup\'tan değil, aynı hatanın fark edilmeden tekrarından gelir.', 'Trading losses usually come not from a bad setup, but from the same mistake repeating unnoticed.', 'ضررهای معاملاتی معمولاً از تکرار ناخودآگاه یک اشتباه می‌آید.')}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {whyItems.map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="rounded-2xl p-6"
                style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── ÖZELLİKLER (BENTO) ── */}
      <section id="features" className="py-20 sm:py-24 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-medium mb-4">
              {t('İhtiyacın Olan Her Araç, Tek Ekranda', 'Every Tool You Need, One Screen', 'هر ابزاری که نیاز دارید، در یک صفحه')}
            </h2>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('Kayıttan analize, hedeften disipline — trading sürecinin her adımı burada.', 'From logging to analysis, from goals to discipline — every step of your process lives here.', 'از ثبت تا تحلیل، هر مرحله در اینجاست.')}
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: shouldReduceMotion ? 0 : -4 }}
                className={`rounded-2xl p-6 relative ${f.span}`}
                style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.06)' }}>
                {f.pro && (
                  <span className="absolute top-5 end-5 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                    PRO
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.accent}1f`, color: f.accent }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2 pe-10">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section id="how-it-works" className="py-20 sm:py-24 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-medium mb-4">
              {t('4 Adımda Başla', 'Get Started in 4 Steps', 'در ۴ مرحله شروع کنید')}
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
            <div className="hidden lg:block absolute top-6 start-0 end-0 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="relative">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-mono font-semibold text-sm mb-5 relative z-10"
                  style={{ background: '#1a1b2e', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}>
                  {s.n}
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FİYATLANDIRMA ÖNİZLEME ── */}
      <section id="pricing" className="py-20 sm:py-24 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-medium mb-4">
              {t('Sade ve Şeffaf Fiyatlandırma', 'Simple & Transparent Pricing', 'قیمت‌گذاری ساده و شفاف')}
            </h2>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('Ücretsiz başla, büyüdükçe yükselt.', 'Start free, upgrade as you grow.', 'رایگان شروع کنید، با رشد ارتقا دهید.')}
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}
            className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
            <motion.div variants={fadeUp} className="rounded-2xl p-8" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="text-lg font-bold mb-1">{t('Ücretsiz', 'Free', 'رایگان')}</h3>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('Başlamak için ideal', 'Perfect to get started', 'ایده‌آل برای شروع')}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-sm ms-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('/ sonsuza kadar', '/ forever', '/ برای همیشه')}</span>
              </div>
              <div className="space-y-2.5 mb-8">
                {[
                  t('1 Journal', '1 Journal', '۱ ژورنال'),
                  t('Günde 1 / Toplam 20 Trade', '1/Day, 20 Total Trades', 'روزانه ۱ / مجموعاً ۲۰ معامله'),
                  t('Tüm İstatistikler & Takvim', 'All Statistics & Calendar', 'همه آمارها و تقویم'),
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={onGetStarted}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
                {ctaLabel}
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="rounded-2xl p-8 relative"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1))', border: '1px solid rgba(139,92,246,0.3)' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full text-xs font-semibold" style={{ background: '#8b5cf6', color: '#fff' }}>
                  {t('En Popüler', 'Most Popular', 'محبوب‌ترین')}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-1">Pro</h3>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('Ciddi traderlar için', 'For serious traders', 'برای معامله‌گران جدی')}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$8.25</span>
                <span className="text-sm ms-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('/ ay (yıllık)', '/ mo (yearly)', '/ ماه')}</span>
              </div>
              <div className="space-y-2.5 mb-8">
                {[
                  t('Sınırsız Journal & Trade', 'Unlimited Journals & Trades', 'ژورنال و معامله نامحدود'),
                  t('AI Analiz & Gelişmiş İstatistik', 'AI Analysis & Advanced Stats', 'تحلیل هوش مصنوعی'),
                  t('Isı Haritası & Setup Analizi', 'Heat Map & Setup Analysis', 'نقشه حرارتی و تحلیل ستاپ'),
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={onGetStarted}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: '#8b5cf6', color: '#fff' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
                {signedIn ? ctaLabel : t('Ücretsiz Dene', 'Start Free Trial', 'شروع آزمایشی رایگان')}
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SSS ── */}
      <section className="py-20 sm:py-24 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}
            className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-medium">
              {t('Sıkça Sorulan Sorular', 'Frequently Asked Questions', 'سؤالات متداول')}
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFAQ === i;
              return (
                <motion.div key={i} variants={fadeUp} className="rounded-2xl overflow-hidden"
                  style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <button onClick={() => setOpenFAQ(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-start">
                    <span className="font-medium text-sm sm:text-base">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'rgba(255,255,255,0.4)' }} />
                  </button>
                  <motion.div initial={false} animate={{ height: isOpen ? 'auto' : 0 }} className="overflow-hidden"
                    transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}>
                    <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{faq.a}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── KAPANIŞ CTA ── */}
      <section className="py-20 sm:py-24 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}
            className="relative rounded-3xl px-6 sm:px-16 py-16 text-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(99,102,241,0.1))', border: '1px solid rgba(139,92,246,0.3)' }}>
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-3xl opacity-25"
              style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
            <h2 className="font-display text-3xl sm:text-4xl font-medium mb-4 relative">
              {t('Trading\'ini Bugün Kaydetmeye Başla', 'Start Logging Your Trading Today', 'همین امروز معاملات خود را ثبت کنید')}
            </h2>
            <p className="text-base mb-8 relative" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {t('Ücretsiz, kart bilgisi olmadan, 30 saniyede.', 'Free, no card required, in 30 seconds.', 'رایگان، بدون کارت، در ۳۰ ثانیه.')}
            </p>
            <motion.button onClick={onGetStarted}
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.03 }} whileTap={{ scale: shouldReduceMotion ? 1 : 0.97 }}
              className="relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: '#8b5cf6', color: '#fff' }}>
              {ctaLabel}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            <span className="text-sm font-semibold">{t('Simple Trading Journal', 'Simple Trading Journal', 'سیمپل تریدینگ ژورنال')}</span>
          </div>
          <div className="flex items-center gap-6">
            {!signedIn && (
              <button onClick={onSignIn} className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('Giriş Yap', 'Sign In', 'ورود')}</button>
            )}
            <button onClick={onGetStarted} className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {signedIn ? ctaLabel : t('Ücretsiz Başla', 'Get Started', 'شروع رایگان')}
            </button>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} Simple Trading Journal
          </p>
        </div>
      </footer>
    </div>
  );
}

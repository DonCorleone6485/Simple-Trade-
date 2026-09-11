import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  TrendingUp, BookOpen, BarChart2, CalendarDays, Target, Sparkles, Upload,
  Check, ChevronDown, ArrowRight, Shield, Globe, Zap, Mic, ListChecks, Clock,
  Newspaper, Wallet,
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
      title: t('Gelişimini Ölç', 'Measure the Progress', 'پیشرفت را بسنجید'),
      desc: t(
        'Bu ay geçen aydan iyi miydi? Aylık kırılım, seriler ve disiplin sayıları cevabı tahmine bırakmaz.',
        'Was this month better than the last? A monthly breakdown, streaks and discipline figures answer that without guesswork.',
        'آیا این ماه بهتر از ماه قبل بود؟ تفکیک ماهانه پاسخ را می‌دهد.'
      ),
    },
  ];

  /**
   * Özellikler üç kümede: kaydetmek, görmek, sürdürmek. Tek bir uzun ızgara
   * hepsini eşit ağırlıkta gösteriyordu; kümelenince sayfanın anlattığı sıra
   * ortaya çıkıyor — önce işlem kendiliğinden gelir, sonra sayıya döner,
   * sonra alışkanlığa.
   */
  const featureGroups = [
    {
      label: t('Kaydet', 'Capture', 'ثبت'),
      title: t('İşlemler kendiliğinden gelsin', 'Let the trades arrive on their own', 'معاملات خودشان بیایند'),
      items: [
        {
          icon: <Zap className="w-5 h-5" />,
          title: t('MetaTrader 5 Bağlantısı', 'MetaTrader 5 Connection', 'اتصال متاتریدر ۵'),
          desc: t(
            'Uzman danışmanı bir kez kur; kapanan her işlem journal\'ına kendiliğinden düşsün. Bir yıllık geçmişini de getirir.',
            'Install the expert advisor once; every closed trade lands in your journal by itself — and it brings a year of history with it.',
            'یک بار اکسپرت را نصب کنید؛ هر معامله بسته‌شده خودش در ژورنال ثبت می‌شود.'
          ),
          span: 'lg:col-span-2',
          accent: '#8b5cf6',
        },
        {
          icon: <Upload className="w-5 h-5" />,
          title: t('Altı Platformdan İçe Aktar', 'Import From Six Platforms', 'ورود از شش پلتفرم'),
          desc: t(
            'MT5, MT4, cTrader, TradeLocker, DXtrade, Match-Trader raporunu yükle. Tanınmayan bir dosyada sütunları kendin eşle; aynı işlem ikinci kez eklenmez.',
            'Upload a report from MT5, MT4, cTrader, TradeLocker, DXtrade or Match-Trader. Map the columns yourself if the file is unfamiliar — nothing is ever added twice.',
            'گزارش شش پلتفرم را آپلود کنید؛ هیچ معامله‌ای دوبار اضافه نمی‌شود.'
          ),
          span: 'lg:col-span-2',
          accent: '#f87171',
        },
        {
          icon: <Mic className="w-5 h-5" />,
          title: t('Konuşarak Not Al', 'Dictate Your Notes', 'یادداشت را با صدا بگویید'),
          desc: t(
            'Mikrofona konuş, bitir — yazım kendiliğinden toparlanır. Order Block, FVG, CHoCH gibi terimleri doğru yazar; ücretsiz.',
            'Talk into the microphone and stop — the writing tidies itself. It knows the terms, too: Order Block, FVG, CHoCH. Free.',
            'با میکروفون صحبت کنید؛ نگارش خودش مرتب می‌شود و اصطلاحات را درست می‌نویسد.'
          ),
          span: 'lg:col-span-2',
          accent: '#22d3ee',
        },
        {
          icon: <BookOpen className="w-5 h-5" />,
          title: t('Öncesi ve Sonrası', 'Before and After', 'قبل و بعد'),
          desc: t(
            'Sembol, yön, timeframe, risk ve R/R — üstüne girmeden önce ne düşündüğün, çıktıktan sonra ne öğrendiğin, ekran görüntüleriyle.',
            'Symbol, direction, timeframe, risk and R/R — plus what you were thinking before you entered and what you learned after, with screenshots.',
            'نماد، جهت، ریسک و R/R — همراه با افکار قبل و درس بعد از معامله.'
          ),
          span: 'lg:col-span-2',
          accent: '#a78bfa',
        },
      ],
    },
    {
      label: t('Gör', 'See', 'ببینید'),
      title: t('Neyin işe yaradığını sayılarla gör', 'See what works, in numbers', 'با اعداد ببینید چه چیزی کار می‌کند'),
      items: [
        {
          icon: <BarChart2 className="w-5 h-5" />,
          title: t('Verinin Arkasındaki Gerçek', 'The Truth Behind the Numbers', 'حقیقت پشت اعداد'),
          desc: t(
            'Beklenen değer, profit factor, payoff oranı, ortalama kazanç ve kayıp, en uzun seriler ve kümülatif PnL — tek bakışta.',
            'Expectancy, profit factor, payoff ratio, average win and loss, longest streaks and cumulative PnL — at a glance.',
            'ارزش مورد انتظار، فاکتور سود، میانگین برد و باخت و سود انباشته — در یک نگاه.'
          ),
          span: 'lg:col-span-2',
          accent: '#10b981',
        },
        {
          icon: <CalendarDays className="w-5 h-5" />,
          title: t('Takvimde Örüntün', 'Your Calendar Pattern', 'الگوی تقویم شما'),
          desc: t('Günlük kâr/zarara göre renklenen takvim — hangi günler sana yarıyor, hemen belli olur.', 'A calendar colored by daily P&L — the days that suit you become obvious.', 'تقویمی که بر اساس سود و زیان روزانه رنگ می‌شود.'),
          span: '',
          accent: '#34d399',
        },
        {
          icon: <Wallet className="w-5 h-5" />,
          title: t('Hesabın Nereye Gitti', 'Where the Account Went', 'حساب به کجا رسید'),
          desc: t('Başlangıç sermayenden bugüne bakiye, getiri yüzdesi, aylık kırılım ve yön bazlı performans.', 'Balance from your starting capital to today, return percentage, a monthly breakdown and long-vs-short performance.', 'مانده، درصد بازده و تفکیک ماهانه.'),
          span: '',
          accent: '#fbbf24',
        },
        {
          icon: <Sparkles className="w-5 h-5" />,
          title: t('Yapay Zeka Koçun', 'Your AI Coach', 'مربی هوش مصنوعی شما'),
          desc: t('Tüm geçmişini AI ile analiz et — güçlü yönlerini, sızdıran yerleri ve kişisel önerileri al.', 'Analyze your whole history with AI — strengths, leaks and personal recommendations.', 'تاریخچه خود را با هوش مصنوعی تحلیل کنید.'),
          span: 'lg:col-span-2',
          accent: '#a78bfa',
          pro: true,
        },
      ],
    },
    {
      label: t('Sürdür', 'Keep it up', 'ادامه دهید'),
      title: t('Kazandıran davranışı tekrar et', 'Repeat the behaviour that pays', 'رفتاری که سود می‌دهد را تکرار کنید'),
      items: [
        {
          icon: <ListChecks className="w-5 h-5" />,
          title: t('Kendi Checklist\'in', 'Your Own Checklist', 'چک‌لیست خودتان'),
          desc: t(
            'Kurulumların için ayrı listeler tut, adlandır. İşlem açarken hangisini kullanacağını seç — seçtiğin liste o journal\'da kalır.',
            'Keep a separate named list for each setup. Pick one as you open a trade — it stays with that journal.',
            'برای هر ستاپ فهرست جداگانه بسازید و هنگام ثبت معامله یکی را انتخاب کنید.'
          ),
          span: 'lg:col-span-2',
          accent: '#60a5fa',
        },
        {
          icon: <Shield className="w-5 h-5" />,
          title: t('Disiplin', 'Discipline', 'انضباط'),
          desc: t(
            'İntikam işlemi, aşırı işlem, riski büyütme, alışılmış saatlerin dışı — dört alışkanlık, hepsi zaten girdiğin veriden çıkıyor. Ayrıca bir şey doldurmuyorsun.',
            'Revenge trades, overtrading, raising the stake, drifting outside your usual hours — four habits, all read from the data you already entered.',
            'چهار عادت رفتاری از همان داده‌های موجود استخراج می‌شود.'
          ),
          span: 'lg:col-span-2',
          accent: '#f472b6',
        },
        {
          icon: <Clock className="w-5 h-5" />,
          title: t('Seans Saatleri', 'Session Clock', 'ساعت سشن‌ها'),
          desc: t('Sydney, Tokyo, Londra, New York — hangisi açık, hangisi kaç saat sonra açılıyor.', 'Sydney, Tokyo, London, New York — which one is open, and how long until the next.', 'کدام سشن باز است و بعدی چه زمانی باز می‌شود.'),
          span: '',
          accent: '#38bdf8',
        },
        {
          icon: <Newspaper className="w-5 h-5" />,
          title: t('Günün Haberleri', 'Today\'s News', 'اخبار امروز'),
          desc: t('Yüksek etkili ekonomik takvim — ve işlemlerinin haber saatine denk gelip gelmediği.', 'A high-impact economic calendar — and whether your trades land on the news.', 'تقویم اقتصادی و اینکه معاملات شما به زمان خبر می‌خورد یا نه.'),
          span: '',
          accent: '#fb923c',
        },
        {
          icon: <Target className="w-5 h-5" />,
          title: t('Kuralların ve Hedeflerin', 'Your Rules and Targets', 'قوانین و اهداف شما'),
          desc: t('Aylık hedef, maksimum risk, işlem yasağı saatleri — sınırı aştığında sistem sana söylesin.', 'Monthly targets, maximum risk, no-trade hours — the system tells you the moment you cross a line.', 'اهداف ماهانه و حداکثر ریسک را تعیین کنید.'),
          span: 'lg:col-span-2',
          accent: '#facc15',
        },
      ],
    },
  ];

  const steps = [
    { n: '01', title: t('Journal Oluştur', 'Create a Journal', 'یک ژورنال بسازید'), desc: t('Başlangıç sermayeni ve tarihi gir, hesabını tanımla.', 'Set your starting capital and date to define your account.', 'سرمایه اولیه و تاریخ را وارد کنید.') },
    { n: '02', title: t('İşlemleri Bağla', 'Bring the Trades In', 'معاملات را وارد کنید'), desc: t('MetaTrader\'ı bağla ve kendiliğinden gelsin, raporunu yükle ya da tek tek kaydet.', 'Connect MetaTrader and let them arrive by themselves, upload a report, or log them one by one.', 'متاتریدر را وصل کنید، گزارش را آپلود کنید یا دستی ثبت کنید.') },
    { n: '03', title: t('Örüntünü İncele', 'Review Your Patterns', 'الگوهای خود را بررسی کنید'), desc: t('İstatistikler, takvim ve grafiklerle nerede güçlü nerede zayıf olduğunu gör.', 'See where you\'re strong and where you leak, through stats, calendar and charts.', 'با آمار و نمودارها نقاط قوت و ضعف را ببینید.') },
    { n: '04', title: t('Tekrar Et', 'Repeat What Works', 'آنچه کار می‌کند را تکرار کنید'), desc: t('Checklist\'ini kur, disiplin sayılarına bak, kazandıran davranışı alışkanlığa çevir.', 'Set up your checklist, watch the discipline figures, and turn the behaviour that pays into a habit.', 'چک‌لیست خود را بسازید و رفتار سودده را به عادت تبدیل کنید.') },
  ];

  const faqs = [
    {
      q: t('Ücretsiz olarak kullanabilir miyim?', 'Can I use it for free?', 'آیا می‌توانم رایگان استفاده کنم؟'),
      a: t('Evet. Free plan 1 journal, günde 1 / toplamda 20 işlem ve işlem öncesi ve sonrası 1\'er fotoğrafla, tüm istatistiklere ve takvim görünümüne süresiz erişim sağlar. Kart bilgisi istemiyoruz.', 'Yes. The Free plan gives you 1 journal, 1 trade a day (20 total), 1 photo before and 1 after each trade, and unlimited access to all statistics and the calendar view. No card required.', 'بله. طرح رایگان به شما امکان دسترسی نامحدود به آمار می‌دهد.'),
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
      q: t('İçe aktarma nasıl çalışır?', 'How does importing work?', 'وارد کردن چگونه کار می‌کند؟'),
      a: t('Broker\'ından indirdiğin dosyayı yükle — MT5, MT4, cTrader, TradeLocker, DXtrade ve Match-Trader raporları (HTML ya da CSV) tanınır. Tanımadığı bir dosyada sütunları kendin eşlersin. Aynı raporu tekrar yüklersen sadece yeni işlemler eklenir.', 'Upload the file your broker gives you — reports from MT5, MT4, cTrader, TradeLocker, DXtrade and Match-Trader (HTML or CSV) are recognised. If a file is unfamiliar you map the columns yourself. Re-upload the same report and only the new trades are added.', 'گزارش شش پلتفرم شناخته می‌شود و اگر فایل ناشناس باشد ستون‌ها را خودتان تطبیق می‌دهید.'),
    },
    {
      q: t('İşlemlerim MetaTrader\'dan otomatik gelebilir mi?', 'Can my trades arrive from MetaTrader automatically?', 'آیا معاملات به‌طور خودکار از متاتریدر می‌آیند؟'),
      a: t('Evet. Hazır uzman danışmanı (.ex5) indirip bir grafiğe sürüklüyorsun, anahtarını yapıştırıyorsun — kapanan her işlem journal\'ına kendiliğinden düşüyor. İlk kurulumda bir yıllık geçmişini de getiriyor. Derleme, kod, ayar yok.', 'Yes. Download the ready-made expert advisor (.ex5), drop it on a chart and paste your key — every closed trade lands in your journal by itself, and the first run brings a year of history with it. No compiling, no code, no settings.', 'بله. اکسپرت آماده را روی چارت بیندازید و کلید خود را وارد کنید.'),
    },
    {
      q: t('Sesli not gerçekten ücretsiz mi?', 'Is the voice note really free?', 'آیا یادداشت صوتی واقعاً رایگان است؟'),
      a: t('Evet. Konuşmayı tarayıcının kendi tanıması yazıya çeviriyor, yazımı da biz toparlıyoruz — ayrı bir ücret ya da kota yok. Trading terimlerini de bilir: "order bloğu" dediğinde Order Block\'u yazar.', 'Yes. Your browser\'s own recognition turns speech into text and we tidy the writing — no extra charge, no quota. It knows the vocabulary too: say "order block" and it writes Order Block.', 'بله. تشخیص گفتار مرورگر متن را می‌نویسد و ما نگارش را مرتب می‌کنیم.'),
    },
    {
      q: t('Mobil uygulaması var mı?', 'Is there a mobile app?', 'آیا اپلیکیشن موبایل دارید؟'),
      a: t('Şu an için hayır — ama tamamen responsive bir web uygulaması, telefon veya tablet tarayıcından sorunsuz kullanabilirsin.', 'Not yet — but it\'s a fully responsive web app, so it works smoothly from your phone or tablet browser.', 'خیر، اما یک برنامه وب کاملاً واکنش‌گرا است.'),
    },
  ];

  const navLink: React.CSSProperties = { color: 'rgba(255,255,255,0.6)' };

  return (
    <div className="app-ground min-h-screen" style={{ color: '#fff' }}>

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
            <span className="font-semibold tracking-tight text-[13px] sm:text-base whitespace-nowrap">
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
                className="hidden sm:block px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{ color: 'rgba(255,255,255,0.8)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; }}>
                {t('Giriş Yap', 'Sign In', 'ورود')}
              </button>
            )}
            <button onClick={onGetStarted}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all"
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
      <section className="relative overflow-hidden pt-36 sm:pt-44 pb-24 sm:pb-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full blur-3xl opacity-[0.16]"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.035]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 100%)',
          }} />
        </div>

        <motion.div initial="hidden" animate="visible" variants={stagger}
          className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium mb-8"
            style={{ background: 'rgba(139,92,246,0.09)', color: '#a78bfa' }}>
            <Sparkles className="w-3.5 h-3.5" />
            {t('İşlem Günlüğü Platformu', 'Trading Journal Platform', 'پلتفرم ژورنال معاملاتی')}
          </motion.div>

          {/* İki cümlelik başlık. Vitrin kayıpla açılmaz: burada söylenen şey
              iyi işlemin tesadüf olmadığı — ikinci cümle de onun cevabı. */}
          <motion.h1 variants={fadeUp}
            className="font-display text-[2rem] sm:text-5xl lg:text-[4.5rem] leading-[1.06] sm:leading-[1.02] font-medium mb-7"
            style={{ letterSpacing: '-0.035em' }}>
            <span>
              {t('Kazandıran ne varsa, ', 'Whatever works is ', 'هر چه سود می‌دهد، ')}
              <span style={{ color: '#a78bfa', fontStyle: 'italic' }}>{t('tekrarlanabilir', 'repeatable', 'تکرارشدنی است')}</span>.
            </span>
            <br />
            <span className="text-[0.82em]" style={{ color: 'rgba(255,255,255,0.72)' }}>
              {t('Biz onu görünür kılarız.', 'We make it visible.', 'ما آن را نمایان می‌کنیم.')}
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-[17px] sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            {t(
              'İşlemlerin MetaTrader\'dan kendiliğinden gelsin, notunu konuşarak tut, hangi kurulumun kazandırdığını sayılarla gör.',
              'Let your trades arrive from MetaTrader on their own, dictate your notes out loud, and see in numbers which setup pays.',
              'معاملات شما به‌طور خودکار از متاتریدر بیاید، یادداشت را با صدا بگویید و ببینید کدام ستاپ سود می‌دهد.'
            )}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4">
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
              whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-medium"
              style={{ background: '#8b5cf6', color: '#fff' }}>
              {ctaLabel}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </motion.button>
            <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {t('Kredi kartı gerekmez · 30 saniyede başla', 'No credit card required · Start in 30 seconds', 'نیازی به کارت اعتباری نیست')}
            </span>
          </motion.div>
        </motion.div>

        {/* Ürün görseli: gerçek kümülatif PnL grafiği */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto px-6 mt-20 sm:mt-24"
        >
          <div className="relative rounded-3xl p-6 sm:p-8"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))', boxShadow: '0 40px 120px -20px rgba(139,92,246,0.25)' }}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {t('Kümülatif PnL', 'Cumulative PnL', 'سود/زیان انباشته')}
              </span>
              <div className="flex items-center gap-8 sm:gap-10">
                <div className="text-end">
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {t('Kazanma Oranı', 'Win Rate', 'نرخ برد')}
                  </div>
                  <div className="font-mono text-[15px]" style={{ color: '#fff', fontVariantNumeric: 'tabular-nums' }}>%68</div>
                </div>
                <div className="text-end">
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {t('Net', 'Net', 'خالص')}
                  </div>
                  <div className="font-mono text-[15px]" style={{ color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>+$1,840</div>
                </div>
              </div>
            </div>

            <motion.div
              className="h-64 sm:h-80 w-full"
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: shouldReduceMotion ? 0 : 1.4, delay: shouldReduceMotion ? 0 : 0.9, ease: [0.65, 0, 0.35, 1] }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="i" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.22)', fontSize: 11 }} dy={8} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.22)', fontSize: 11 }} dx={-8} tickFormatter={v => `$${v}`} />
                  <Tooltip contentStyle={{ background: '#12131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    formatter={(value: number) => [`$${value}`, t('Kümülatif PnL', 'Cumulative PnL', 'سود/زیان انباشته')]}
                    labelFormatter={label => `${t('İşlem', 'Trade', 'معامله')} #${label}`} />
                  <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#heroGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Hangi platformlarla çalıştığı ilk ekranda görünsün: logo yığmadan,
              tek satır. Okuyanın ilk sorusu genelde bu. */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 1.1 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {t('Şuralardan aktarır', 'Imports from', 'وارد می‌کند از')}
            </span>
            {['MetaTrader 5', 'MetaTrader 4', 'cTrader', 'TradeLocker', 'DXtrade', 'Match-Trader'].map(name => (
              <span key={name} className="text-[13.5px]" style={{ color: 'rgba(255,255,255,0.42)' }}>{name}</span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── NEDEN JOURNAL ── */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}
        className="py-24 sm:py-32 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Sayfanın en büyük cümlesi. Ortalanmış bir başlık yığını yerine
              tek başına duran bir ifade — bölümler arası ritmi burada kırıyoruz. */}
          <motion.div variants={fadeUp} className="max-w-3xl mb-20 sm:mb-24">
            <h2 className="font-display text-[2.6rem] sm:text-[3.6rem] leading-[1.06] font-medium"
              style={{ letterSpacing: '-0.035em' }}>
              {t('Neden Journal Tutmak İşe Yarar?', 'Why Trade Journaling Works', 'چرا ثبت معاملات مؤثر است؟')}
            </h2>
            <p className="text-[17px] leading-relaxed mt-6 max-w-xl" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {t('İyi işlemlerin ortak bir yanı vardır — ama bunu ancak yazılı bir kayıt gösterir. Journal, işe yarayanı görünür kılar; yarına da taşır.', 'Your good trades have something in common — but only a written record shows you what. A journal makes what works visible, and carries it into tomorrow.', 'معاملات خوب شما وجه مشترکی دارند — و فقط یک ثبت مکتوب آن را نشان می‌دهد.')}
            </p>
          </motion.div>

          {/* Kutu yok: sütunları ince bir çizgi ayırıyor. */}
          <div className="grid sm:grid-cols-3">
            {whyItems.map((item, i) => (
              <motion.div key={i} variants={fadeUp}
                className={`py-2 ${i > 0 ? 'sm:ps-10' : ''} ${i < whyItems.length - 1 ? 'sm:pe-10' : ''} mb-10 sm:mb-0`}
                style={i > 0 ? { borderInlineStart: '1px solid rgba(255,255,255,0.07)' } : undefined}>
                <div className="mb-5" style={{ color: '#a78bfa' }}>{item.icon}</div>
                <h3 className="text-[17px] font-medium mb-2.5" style={{ letterSpacing: '-0.01em' }}>{item.title}</h3>
                <p className="text-[14.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── ÖZELLİKLER (BENTO) ── */}
      <section id="features" className="py-24 sm:py-32 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}
            className="max-w-2xl mb-16 sm:mb-20">
            <h2 className="font-display text-[2.1rem] sm:text-[2.6rem] leading-[1.1] font-medium mb-4" style={{ letterSpacing: '-0.03em' }}>
              {t('İhtiyacın Olan Her Araç, Tek Ekranda', 'Every Tool You Need, One Screen', 'هر ابزاری که نیاز دارید، در یک صفحه')}
            </h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {t('İşlem kendiliğinden gelir, sayıya döner, alışkanlığa dönüşür.', 'The trade arrives on its own, becomes a number, then becomes a habit.', 'معامله خودش می‌آید، به عدد تبدیل می‌شود و بعد به عادت.')}
            </p>
          </motion.div>

          {featureGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-16 sm:mt-24' : ''}>
              {/* Küme başlığı: numara yerine sessiz bir etiket, yanında çizgi. */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-7">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap" style={{ color: '#a78bfa' }}>
                  {group.label}
                </span>
                <h3 className="text-[17px] sm:text-[19px] font-medium" style={{ letterSpacing: '-0.015em' }}>{group.title}</h3>
                <span className="hidden sm:block flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {group.items.map((f, i) => (
                  <motion.div key={i} variants={fadeUp} whileHover={{ y: shouldReduceMotion ? 0 : -3 }}
                    className={`rounded-2xl p-7 relative h-full ${f.span}`}
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))',
                      border: '1px solid rgba(255,255,255,0.05)',
                      boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
                    }}>
                    {f.pro && (
                      <span className="absolute top-5 end-5 px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                        PRO
                      </span>
                    )}
                    <div className="mb-5" style={{ color: f.accent }}>{f.icon}</div>
                    <h4 className="text-[16px] font-medium mb-2.5 pe-10" style={{ letterSpacing: '-0.01em' }}>{f.title}</h4>
                    <p className="text-[14.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{f.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section id="how-it-works" className="py-24 sm:py-32 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}
            className="max-w-2xl mb-16">
            <h2 className="font-display text-[2.1rem] sm:text-[2.6rem] leading-[1.1] font-medium" style={{ letterSpacing: '-0.03em' }}>
              {t('4 Adımda Başla', 'Get Started in 4 Steps', 'در ۴ مرحله شروع کنید')}
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-10">
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp}
                className={i > 0 ? 'lg:ps-10' : ''}
                style={i > 0 ? { borderInlineStart: '1px solid rgba(255,255,255,0.07)' } : undefined}>
                {/* Numara rozet değil, tipografi: sayfanın serifiyle büyük ve sessiz. */}
                <div className="font-display leading-none mb-6"
                  style={{ fontSize: '46px', color: 'rgba(255,255,255,0.16)', letterSpacing: '-0.03em' }}>
                  {s.n}
                </div>
                <h3 className="text-[16px] font-medium mb-2.5" style={{ letterSpacing: '-0.01em' }}>{s.title}</h3>
                <p className="text-[14.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FİYATLANDIRMA ÖNİZLEME ── */}
      <section id="pricing" className="py-24 sm:py-32 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}
            className="max-w-2xl mb-14">
            <h2 className="font-display text-[2.1rem] sm:text-[2.6rem] leading-[1.1] font-medium mb-4" style={{ letterSpacing: '-0.03em' }}>
              {t('Sade ve Şeffaf Fiyatlandırma', 'Simple & Transparent Pricing', 'قیمت‌گذاری ساده و شفاف')}
            </h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {t('Ücretsiz başla, büyüdükçe yükselt.', 'Start free, upgrade as you grow.', 'رایگان شروع کنید، با رشد ارتقا دهید.')}
            </p>
          </motion.div>

          {/* İki plan tek yüzey üstünde, aralarında ince bir çizgi. Pro'yu
              doygun mor bir kutuya koymak fiyatı değil reklamı öne çıkarıyordu. */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}
            className="max-w-4xl rounded-3xl overflow-hidden grid sm:grid-cols-2"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>

            <motion.div variants={fadeUp} className="p-8 sm:p-10">
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
                {[
                  t('1 Journal', '1 Journal', '۱ ژورنال'),
                  t('Günde 1 / Toplam 20 Trade', '1/Day, 20 Total Trades', 'روزانه ۱ / مجموعاً ۲۰ معامله'),
                  t('Tüm İstatistikler & Takvim', 'All Statistics & Calendar', 'همه آمارها و تقویم'),
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <span className="text-[14.5px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={onGetStarted}
                className="w-full py-3 rounded-full text-sm font-medium transition-all"
                style={{ background: 'transparent', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.14)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                {ctaLabel}
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="p-8 sm:p-10 relative"
              style={{
                borderInlineStart: '1px solid rgba(255,255,255,0.06)',
                background: 'linear-gradient(180deg, rgba(139,92,246,0.07), transparent 70%)',
              }}>
              {/* Vurgu: kutunun tamamını boyamak yerine üstte tek bir çizgi. */}
              <span className="absolute top-0 start-0 end-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #8b5cf6, transparent)' }} />
              <div className="flex items-baseline justify-between">
                <h3 className="text-[15px] font-medium tracking-wide">Pro</h3>
                <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: '#a78bfa' }}>
                  {t('En Popüler', 'Most Popular', 'محبوب‌ترین')}
                </span>
              </div>
              <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {t('Ciddi traderlar için', 'For serious traders', 'برای معامله‌گران جدی')}
              </p>
              <div className="mt-7 mb-8 flex items-baseline gap-2">
                <span className="font-display" style={{ fontSize: '52px', letterSpacing: '-0.04em', lineHeight: 1 }}>$8.25</span>
                <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('/ ay (yıllık)', '/ mo (yearly)', '/ ماه')}</span>
              </div>
              <div className="space-y-3 mb-9">
                {[
                  t('Sınırsız Journal & Trade', 'Unlimited Journals & Trades', 'ژورنال و معامله نامحدود'),
                  t('AI Analiz & Gelişmiş İstatistik', 'AI Analysis & Advanced Stats', 'تحلیل هوش مصنوعی'),
                  t('Isı Haritası & Setup Analizi', 'Heat Map & Setup Analysis', 'نقشه حرارتی و تحلیل ستاپ'),
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#a78bfa' }} />
                    <span className="text-[14.5px]" style={{ color: 'rgba(255,255,255,0.75)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={onGetStarted}
                className="w-full py-3 rounded-full text-sm font-medium transition-all"
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
      <section className="py-24 sm:py-32 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Başlık solda kalır, sorular sağda akar — sayfadaki tek iki
              sütunlu bölüm; ritmi burada bir kez daha değiştiriyoruz. */}
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-10 lg:gap-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}>
              <h2 className="font-display text-[2.1rem] sm:text-[2.6rem] leading-[1.1] font-medium lg:sticky lg:top-28"
                style={{ letterSpacing: '-0.03em' }}>
                {t('Sıkça Sorulan Sorular', 'Frequently Asked Questions', 'سؤالات متداول')}
              </h2>
            </motion.div>

            {/* Kutu yok: sorular tek bir sütun, aralarında ince çizgi. */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}>
              {faqs.map((faq, i) => {
                const isOpen = openFAQ === i;
                return (
                  <motion.div key={i} variants={fadeUp}
                    style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)' }}>
                    <button onClick={() => setOpenFAQ(isOpen ? null : i)}
                      className="w-full flex items-start justify-between gap-6 py-6 text-start group">
                      <span className="text-[16px] leading-snug transition-colors"
                        style={{ color: isOpen ? '#fff' : 'rgba(255,255,255,0.78)' }}>
                        {faq.q}
                      </span>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        style={{ color: isOpen ? '#a78bfa' : 'rgba(255,255,255,0.3)' }} />
                    </button>
                    <motion.div initial={false} animate={{ height: isOpen ? 'auto' : 0 }} className="overflow-hidden"
                      transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}>
                      <p className="pb-7 pe-10 text-[14.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{faq.a}</p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── KAPANIŞ CTA ── */}
      <section className="relative overflow-hidden border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {/* Kutu değil, sayfanın kendisi. Mor gradyanlı bir pano yerine sessiz
            bir alan ve tek bir cümle — kapanış daha ağır durur. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
          style={{ background: 'radial-gradient(620px 300px at 50% 0%, rgba(139,92,246,0.16), transparent 70%)' }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-28 sm:py-36 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}>
            <h2 className="font-display text-[2.3rem] sm:text-[3.2rem] leading-[1.06] font-medium mb-6"
              style={{ letterSpacing: '-0.035em' }}>
              {t('Trading\'ini Bugün Kaydetmeye Başla', 'Start Logging Your Trading Today', 'همین امروز معاملات خود را ثبت کنید')}
            </h2>
            <p className="text-[16px] mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {t('Ücretsiz, kart bilgisi olmadan, 30 saniyede.', 'Free, no card required, in 30 seconds.', 'رایگان، بدون کارت، در ۳۰ ثانیه.')}
            </p>
            <motion.button onClick={onGetStarted}
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.03 }} whileTap={{ scale: shouldReduceMotion ? 1 : 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[15px] font-medium"
              style={{ background: '#8b5cf6', color: '#fff' }}>
              {ctaLabel}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          {/* Marka üstte tek başına, bağlantılar altta: tek satıra sıkışmış
              bir footer sitenin sonunu aceleye getirilmiş gösteriyordu. */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <TrendingUp className="w-[18px] h-[18px]" style={{ color: '#8b5cf6' }} />
                <span className="font-display text-[15px]" style={{ letterSpacing: '-0.01em' }}>
                  {t('Simple Trading Journal', 'Simple Trading Journal', 'سیمپل تریدینگ ژورنال')}
                </span>
              </div>
              <p className="text-[13.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t('İşlem Günlüğü Platformu', 'Trading Journal Platform', 'پلتفرم دفترچه معاملات')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {[
                { label: t('Özellikler', 'Features', 'ویژگی‌ها'), href: '#features' },
                { label: t('Nasıl Çalışır', 'How It Works', 'چگونه کار می‌کند'), href: '#how-it-works' },
                { label: t('Fiyatlandırma', 'Pricing', 'قیمت‌گذاری'), href: '#pricing' },
              ].map(l => (
                <a key={l.href} href={l.href} className="text-[13.5px] transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}>
                  {l.label}
                </a>
              ))}
              {!signedIn && (
                <button onClick={onSignIn} className="text-[13.5px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {t('Giriş Yap', 'Sign In', 'ورود')}
                </button>
              )}
              <button onClick={onGetStarted} className="text-[13.5px]" style={{ color: '#a78bfa' }}>
                {signedIn ? ctaLabel : t('Ücretsiz Başla', 'Get Started', 'شروع رایگان')}
              </button>
            </div>
          </div>

          <div className="mt-12 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
              © {new Date().getFullYear()} Simple Trading Journal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

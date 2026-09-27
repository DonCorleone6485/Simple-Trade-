import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  TrendingUp, BookOpen, BarChart2, CalendarDays, Target, Sparkles, Upload,
  Check, ChevronDown, ArrowRight, Shield, Globe, Zap, Mic, ListChecks, Clock,
  Newspaper, Wallet, Gauge, Lock, LogOut,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SESSIONS, sessionState } from '../lib/sessions';
import { copy } from '../lib/landingCopy';
import { Lock as LogoLock } from './Logo';
import PricingCards from './PricingCards';
import HeroEquityChart from './HeroEquityChart';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  /** Kullanıcı zaten giriş yapmışsa CTA'lar auth yerine journal'a yönlenir. */
  signedIn?: boolean;
  /**
   * Giriş yapmış kullanıcının hesap menüsü. Çıkış yalnızca journal'ın sol
   * menüsündeydi: ana sayfaya dönen biri çıkmak için önce journal'a girmek
   * zorunda kalıyordu.
   */
  account?: { label?: string; image?: string; isPro?: boolean; onSignOut: () => void };
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

/**
 * Kart içindeki küçük canlı parçalar.
 *
 * Seans saati uygulamanın kullandığı hesabın aynısını kullanıyor, puan
 * rozeti gerçek bandı çiziyor. Vitrinde uydurma bir ekran göstermek, ürünü
 * ilk açtığında hayal kırıklığına dönüşür.
 */
function SessionClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-2 mt-5 flex-wrap">
      {SESSIONS.map(s => {
        const { open } = sessionState(s, now);
        return (
          <span key={s.key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-medium"
            style={{
              background: open ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)',
              color: open ? '#34d399' : 'rgba(255,255,255,0.38)',
              border: `1px solid ${open ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.06)'}`,
            }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: open ? '#34d399' : 'rgba(255,255,255,0.22)' }} />
            {s.code}
            <span className="font-mono" style={{ fontVariantNumeric: 'tabular-nums', opacity: 0.85 }}>
              {new Intl.DateTimeFormat('en-GB', { timeZone: s.tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(now)}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** Mikrofon açıkken görünen ses dalgası. Yalnız CSS — kayıt yapmaz. */
function MicWave({ still }: { still: boolean }) {
  return (
    <div className="flex items-end gap-[3px] mt-5 h-7" aria-hidden="true">
      {[0.5, 0.9, 0.35, 1, 0.65, 0.85, 0.45, 0.75, 0.3, 0.6, 0.95, 0.4].map((h, i) => (
        <span key={i} className={still ? undefined : 'stj-wave-bar'}
          style={{
            width: '3px', borderRadius: '2px', background: '#22d3ee',
            height: `${h * 100}%`, opacity: 0.75, animationDelay: `${i * 90}ms`,
          }} />
      ))}
    </div>
  );
}

/** Prop değerlendirmenin sonucu ekranda nasıl görünüyorsa öyle. */
function PropScore({ language }: { language: string }) {
  const rows = [
    { name: 'A', score: 78, color: '#a3e635' },
    { name: 'B', score: 54, color: '#fb923c' },
  ];
  return (
    <div className="mt-5 space-y-2 max-w-md">
      {rows.map(r => (
        <div key={r.name} className="flex items-center gap-3">
          <span className="text-[12px] w-16 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {language === 'tr' ? 'Firma' : 'Firm'} {r.name}
          </span>
          <span className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <span className="block h-full rounded-full" style={{ width: `${r.score}%`, background: r.color }} />
          </span>
          <span className="font-mono text-[12.5px] w-16 text-end flex-shrink-0" style={{ color: r.color }}>
            {r.score} / 100
          </span>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage({ onGetStarted, onSignIn, signedIn = false, account }: LandingPageProps) {
  const { language, setLanguage } = useLanguage();
  const isRTL = language === 'fa' || language === 'ar';
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!accountOpen) return;
    const close = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [accountOpen]);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

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

  // Sekme başlığı ve açıklama seçili dilde (index.html'deki İngilizce; dil
  // değişince güncelleniyor — Google sayfayı çizdikten sonraki hâlini okuyor).
  useEffect(() => {
    document.title = `Simple Trading Journal — ${t('MetaTrader ile otomatik kayıt yapan işlem günlüğü', 'Trading Journal with MetaTrader Auto-Sync', 'ژورنال معاملاتی با ثبت خودکار متاتریدر')}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t(
      'İşlemleri MetaTrader\'dan kendiliğinden gelen işlem günlüğü. Hangi kurulumun kazandırdığını, hatalarının sana kaça mal olduğunu ve prop sınırlarına ne kadar kaldığını gör. Ücretsiz başla.',
      'A trading journal whose trades arrive from MetaTrader on their own. See which setup pays, what your mistakes cost and how close you are to your prop limits. Free to start, in 9 languages.',
      'ژورنال معاملاتی که معاملات خودکار از متاتریدر وارد آن می‌شوند. ببین کدام ستاپ سود می‌دهد، اشتباهاتت چقدر هزینه دارد و تا حدود پراپ چقدر فاصله داری. رایگان شروع کن.',
    ));
  }, [language]);

  // Paylaşılan bir bağlantı (/#pricing) doğrudan o bölüme açılsın. Tarayıcı
  // kendisi kaydıramıyor: sayfa yüklendiğinde bölüm henüz çizilmemiş oluyor.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || id.startsWith('/')) return;
    const timer = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 150);
    return () => clearTimeout(timer);
  }, []);

  /**
   * İmlecin kutu içindeki yerini iki CSS değişkenine yazar; ışık huzmesi
   * (index.css'teki .hover-quiet::before) oradan besleniyor. Konumu CSS'e
   * devretmek, ışığı her karede JavaScript'le çizmekten çok daha ucuz:
   * burada sadece iki sayı değişiyor, boyama tarayıcının işi.
   */
  const spotlight = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion) return;
    const el = e.currentTarget;
    const box = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - box.left}px`);
    el.style.setProperty('--y', `${e.clientY - box.top}px`);
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
      /** Kart sayısını tam bölen sütun: satırın sonunda boşluk kalmasın. */
      cols: 'sm:grid-cols-2',
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
          widget: <MicWave still={!!shouldReduceMotion} />,
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
          accent: '#a78bfa',
        },
      ],
    },
    {
      cols: 'sm:grid-cols-2',
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
          accent: '#10b981',
        },
        {
          icon: <CalendarDays className="w-5 h-5" />,
          title: t('Takvimde Örüntün', 'Your Calendar Pattern', 'الگوی تقویم شما'),
          desc: t('Günlük kâr/zarara göre renklenen takvim — hangi günler sana yarıyor, hemen belli olur.', 'A calendar colored by daily P&L — the days that suit you become obvious.', 'تقویمی که بر اساس سود و زیان روزانه رنگ می‌شود.'),
          accent: '#34d399',
        },
        {
          icon: <Wallet className="w-5 h-5" />,
          title: t('Hesabın Nereye Gitti', 'Where the Account Went', 'حساب به کجا رسید'),
          desc: t('Başlangıç sermayenden bugüne bakiye, getiri yüzdesi, aylık kırılım ve yön bazlı performans.', 'Balance from your starting capital to today, return percentage, a monthly breakdown and long-vs-short performance.', 'مانده، درصد بازده و تفکیک ماهانه.'),
          accent: '#fbbf24',
        },
        {
          icon: <Sparkles className="w-5 h-5" />,
          title: t('Yapay Zeka Koçun', 'Your AI Coach', 'مربی هوش مصنوعی شما'),
          desc: t('Tüm geçmişini AI ile analiz et — güçlü yönlerini, sızdıran yerleri ve kişisel önerileri al.', 'Analyze your whole history with AI — strengths, leaks and personal recommendations.', 'تاریخچه خود را با هوش مصنوعی تحلیل کنید.'),
          accent: '#a78bfa',
          pro: true,
        },
      ],
    },
    {
      cols: 'sm:grid-cols-2 lg:grid-cols-3',
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
          accent: '#f472b6',
        },
        {
          icon: <Clock className="w-5 h-5" />,
          title: t('Seans Saatleri', 'Session Clock', 'ساعت سشن‌ها'),
          desc: t('Sydney, Tokyo, Londra, New York — hangisi açık, hangisi kaç saat sonra açılıyor.', 'Sydney, Tokyo, London, New York — which one is open, and how long until the next.', 'کدام سشن باز است و بعدی چه زمانی باز می‌شود.'),
          widget: <SessionClock />,
          accent: '#38bdf8',
        },
        {
          icon: <Newspaper className="w-5 h-5" />,
          title: t('Günün Haberleri', 'Today\'s News', 'اخبار امروز'),
          desc: t('Yüksek etkili ekonomik takvim — ve işlemlerinin haber saatine denk gelip gelmediği.', 'A high-impact economic calendar — and whether your trades land on the news.', 'تقویم اقتصادی و اینکه معاملات شما به زمان خبر می‌خورد یا نه.'),
          accent: '#fb923c',
        },
        {
          icon: <Gauge className="w-5 h-5" />,
          title: t('Prop Hesabı Değerlendirme', 'Prop Account Review', 'ارزیابی حساب پراپ'),
          desc: t(
            'Bir prop hesabını 12 maddede puanla — drawdown tipi, haber kuralı, açık pozisyon limiti, ödeme sıklığı… 100 üzerinden sonucu gör, üç firmayı yan yana koy. Her maddenin yanında o kuralın ne demek olduğunu rakamlarla anlatan bir açıklama var. Kabul edemeyeceğin kuralı kırmızı çizgi yaparsan, o kuralı olan firma puanı ne olursa olsun "uygun değil" görünür.',
            'Score a prop account on 12 criteria — drawdown type, news rule, floating loss limit, payout frequency… See the result out of 100 and put three firms side by side. Each criterion carries an explanation of what that rule means, in numbers. Mark a rule you cannot live with as a red line and any firm carrying it shows as "not suitable", whatever it scores.',
            'یک حساب پراپ را در ۱۲ بند امتیاز بده و نتیجه را از ۱۰۰ ببین؛ تا سه شرکت را کنار هم مقایسه کن.'
          ),
          widget: <PropScore language={language} />,
          accent: '#c084fc',
        },
        {
          icon: <Target className="w-5 h-5" />,
          title: t('Kuralların ve Hedeflerin', 'Your Rules and Targets', 'قوانین و اهداف شما'),
          desc: t('Aylık hedef, maksimum risk, işlem yasağı saatleri — sınırı aştığında sistem sana söylesin.', 'Monthly targets, maximum risk, no-trade hours — the system tells you the moment you cross a line.', 'اهداف ماهانه و حداکثر ریسک را تعیین کنید.'),
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
      a: t('Evet. Ücretsiz plan 1 journal ve günde 2 işlemle süresiz senin; fazladan girilen işlemler silinmez, kilitli saklanır. MetaTrader otomatik kaydı, içe aktarma, tüm istatistikler, takvim ve disiplin analizi dahil. Kart bilgisi istemiyoruz.', 'Yes. The Free plan is yours for good with 1 journal and 2 trades a day; extra trades aren\'t deleted, they\'re kept locked. MetaTrader auto-sync, importing, all statistics, the calendar and discipline analysis are included. No card required.', 'بله. پلن رایگان با ۱ ژورنال و ۲ معامله در روز همیشه در اختیار توست؛ معاملات اضافه حذف نمی‌شوند و قفل نگه داشته می‌شوند. ثبت خودکار متاتریدر، وارد کردن فایل، همه آمارها، تقویم و تحلیل انضباط شامل است. کارت لازم نیست.'),
    },
    {
      q: t('Pro deneme için kart bilgisi gerekiyor mu?', 'Does the Pro trial require a card?', 'آیا آزمایش Pro نیاز به کارت دارد؟'),
      a: t('Hayır. Ücretsiz planı kullanırken bir sınıra geldiğinde 3 günlük Pro denemesini tek tıkla başlatabilirsin. Kart istemiyoruz; deneme bitince kendiliğinden Ücretsiz plana dönersin, hiçbir ücret alınmaz.', 'No. While on the Free plan, you can start a 3-day Pro trial in one click when you hit a limit. We don\'t ask for a card; when the trial ends you drop back to Free on your own and nothing is charged.', 'نه. در پلن رایگان وقتی به یک محدودیت برسی، می‌توانی آزمایش ۳ روزه Pro را با یک کلیک شروع کنی. کارت نمی‌خواهیم؛ بعد از پایان آزمایش خودکار به رایگان برمی‌گردی و هزینه‌ای گرفته نمی‌شود.'),
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
      q: t('Prop hesabı değerlendirme nedir?', 'What is the prop account review?', 'ارزیابی حساب پراپ چیست؟'),
      a: t('Bir prop firmasının kurallarını 12 maddede puanlayıp 100 üzerinden sonuç veren bir araç: drawdown tipi 20 puan, haber kuralı 15, açık pozisyon limiti 12 — ağırlıklar maddenin hesabı gerçekten bitirme gücüne göre. Üç firmayı yan yana koyup karşılaştırabilir, çıktısını PDF alabilirsin. Her maddenin yanında o kuralın ne anlama geldiğini örneklerle anlatan bir açıklama var; kurallar sözleşmede hangi adlarla geçiyorsa onlar da yazıyor.', 'A tool that scores a prop firm\'s rules on 12 criteria out of 100: drawdown type 20 points, the news rule 15, the floating loss limit 12 — weighted by how likely each is to actually end the account. Put three firms side by side and export the comparison as a PDF. Each criterion carries an explanation with worked examples, plus the names the rule goes by in the firm\'s terms.', 'ابزاری که قوانین یک شرکت پراپ را در ۱۲ بند از ۱۰۰ امتیاز می‌دهد و امکان مقایسه سه شرکت را می‌دهد.'),
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
          <LogoLock className="h-[26px] sm:h-[30px] w-auto flex-shrink-0" />

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('features')} className="nav-link text-sm font-medium">
              {t('Özellikler', 'Features', 'امکانات')}
            </button>
            <button onClick={() => scrollTo('how-it-works')} className="nav-link text-sm font-medium">
              {t('Nasıl Çalışır', 'How It Works', 'چگونه کار می‌کند')}
            </button>
            <button onClick={() => scrollTo('pricing')} className="nav-link text-sm font-medium">
              {t('Fiyatlandırma', 'Pricing', 'قیمت‌گذاری')}
            </button>
            <a href="/blog" className="nav-link text-sm font-medium">{t('Blog', 'Blog', 'بلاگ')}</a>
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
                className="nav-quiet hidden sm:block px-4 py-2 rounded-full text-sm font-medium"
                style={{ color: 'rgba(255,255,255,0.8)' }}>
                {t('Giriş Yap', 'Sign In', 'ورود')}
              </button>
            )}
            <button onClick={onGetStarted}
              className="cta flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-sm font-medium"
              style={{ background: '#8b5cf6', color: '#fff' }}>
              {signedIn && <BookOpen className="w-4 h-4" />}
              {ctaLabel}
            </button>

            {signedIn && account && (
              <div className="relative" ref={accountRef}>
                <button onClick={() => setAccountOpen(o => !o)}
                  title={account.label}
                  className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {account.image
                    ? <img src={account.image} alt="" className="w-full h-full object-cover" />
                    : <span className="text-[13px] font-medium" style={{ color: '#a78bfa' }}>
                        {(account.label || '?').charAt(0).toUpperCase()}
                      </span>}
                </button>
                {accountOpen && (
                  <div className="absolute top-full end-0 mt-2 w-56 rounded-xl shadow-xl overflow-hidden z-50 py-1"
                    style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-sm truncate" style={{ color: '#fff' }}>{account.label}</div>
                      {account.isPro && <div className="text-[10px] tracking-wider mt-0.5" style={{ color: '#a78bfa' }}>PRO</div>}
                    </div>
                    <button onClick={() => { setAccountOpen(false); onGetStarted(); }}
                      className="w-full flex items-center gap-2.5 text-start px-4 py-2.5 text-sm transition-colors"
                      style={{ color: 'rgba(255,255,255,0.75)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      <BookOpen className="w-4 h-4" />
                      {t("Journal'a Git", 'Go to Journal', 'رفتن به ژورنال')}
                    </button>
                    <button onClick={() => { setAccountOpen(false); account.onSignOut(); }}
                      className="w-full flex items-center gap-2.5 text-start px-4 py-2.5 text-sm transition-colors"
                      style={{ color: '#f87171' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      <LogOut className="w-4 h-4" />
                      {t('Çıkış Yap', 'Sign Out', 'خروج')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-36 sm:pt-44 pb-24 sm:pb-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* İki ışık: mor marka rengi, altın ise başlığın sıcaklığı. İkisi de
              fark edilmeyecek kadar hafif — fark edilirse abartılmış demektir. */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full blur-3xl opacity-[0.11]"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[760px] h-[420px] rounded-full blur-3xl opacity-[0.07]"
            style={{ background: 'radial-gradient(circle, #f0b429, transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.035]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 100%)',
          }} />
        </div>

        <motion.div initial="hidden" animate="visible" variants={stagger}
          className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-8">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#f0b429' }} />
            <span className="eyebrow">
              {t('İşlem Günlüğü Platformu', 'Trading Journal Platform', 'پلتفرم ژورنال معاملاتی')}
            </span>
          </motion.div>

          {/* İki cümlelik başlık. Vitrin kayıpla açılmaz: burada söylenen şey
              iyi işlemin tesadüf olmadığı — ikinci cümle de onun cevabı. */}
          {/* Afiş başlık: dar ve büyük. Son satır serif ve altın — bir tek o
              cümle "el yazısı" gibi durup gözü kendine çeker. */}
          <motion.h1 variants={fadeUp} className="poster mb-7 text-[2.2rem] sm:text-[3.4rem] lg:text-[4.6rem]">
            <span className="block">{t('Kazandıran ne varsa,', 'Whatever works is', 'هر چه سود می‌دهد،')}</span>
            <span className="block" style={{ color: 'rgba(255,255,255,0.92)' }}>
              {t('tekrarlanabilir.', 'repeatable.', 'تکرارشدنی است.')}
            </span>
            <span className="block font-display mt-3 text-[0.55em] leading-[1.15]"
              style={{ color: '#f0b429', fontStyle: 'italic', letterSpacing: '-0.02em' }}>
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
              className="cta flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-medium"
              style={{ background: '#8b5cf6', color: '#fff' }}>
              {ctaLabel}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </motion.button>
            <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
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
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {t('Kümülatif PnL', 'Cumulative PnL', 'سود/زیان انباشته')}
              </span>
              <div className="flex items-center gap-8 sm:gap-10">
                <div className="text-end">
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {t('Kazanma Oranı', 'Win Rate', 'نرخ برد')}
                  </div>
                  <div className="font-mono text-[15px]" style={{ color: '#fff', fontVariantNumeric: 'tabular-nums' }}>%68</div>
                </div>
                <div className="text-end">
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
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
              <HeroEquityChart data={equityData}
                seriesLabel={t('Kümülatif PnL', 'Cumulative PnL', 'سود/زیان انباشته')}
                tradeWord={t('İşlem', 'Trade', 'معامله')} />
            </motion.div>
          </div>

          {/* Hangi platformlarla çalıştığı ilk ekranda görünsün: logo yığmadan,
              tek satır. Okuyanın ilk sorusu genelde bu. */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 1.1 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <span className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('Şuralardan aktarır', 'Imports from', 'وارد می‌کند از')}
            </span>
            {['MetaTrader 5', 'MetaTrader 4', 'cTrader', 'TradeLocker', 'DXtrade', 'Match-Trader'].map((name, i) => (
              <React.Fragment key={name}>
                {i > 0 && <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />}
                <span className="text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.01em' }}>
                  {name}
                </span>
              </React.Fragment>
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
            <span className="channel mb-5 block">CH 01 · {t('Neden', 'Why', 'چرا')}</span>
            <h2 className="poster text-[2.4rem] sm:text-[3.4rem]">
              {t('Neden Journal Tutmak İşe Yarar?', 'Why Trade Journaling Works', 'چرا ثبت معاملات مؤثر است؟')}
            </h2>
            <p className="text-[17px] leading-relaxed mt-6 max-w-xl" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('İyi işlemlerin ortak bir yanı vardır — ama bunu ancak yazılı bir kayıt gösterir. Journal, işe yarayanı görünür kılar; yarına da taşır.', 'Your good trades have something in common — but only a written record shows you what. A journal makes what works visible, and carries it into tomorrow.', 'معاملات خوب شما وجه مشترکی دارند — و فقط یک ثبت مکتوب آن را نشان می‌دهد.')}
            </p>
          </motion.div>

          {/* Kutu yok: sütunları ince bir çizgi ayırıyor. */}
          <div className="hover-group grid sm:grid-cols-3">
            {whyItems.map((item, i) => (
              <motion.div key={i} variants={fadeUp} onMouseMove={spotlight}
                className={`hover-quiet py-2 ${i > 0 ? 'sm:ps-10' : ''} ${i < whyItems.length - 1 ? 'sm:pe-10' : ''} mb-10 sm:mb-0`}
                style={i > 0 ? { borderInlineStart: '1px solid rgba(255,255,255,0.07)' } : undefined}>
                {/* Morun satır içi stille değil sınıfla verilmesi şart: satır içi
                    stil, imleç gelince ikonu altına çeviren kuralı yeniyor. */}
                <div className="hover-icon mb-5">{item.icon}</div>
                <h3 className="hover-title text-[17px] font-medium" style={{ letterSpacing: '-0.01em' }}>{item.title}</h3>
                <span className="hover-rule" />
                <p className="text-[14.5px] leading-relaxed mt-2.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
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
            <span className="channel mb-5 block">CH 02 · {t('Araçlar', 'Tools', 'ابزارها')}</span>
            <h2 className="poster text-[2.1rem] sm:text-[3rem] mb-4">
              {t('İhtiyacın Olan Her Araç, Tek Ekranda', 'Every Tool You Need, One Screen', 'هر ابزاری که نیاز دارید، در یک صفحه')}
            </h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('İşlem kendiliğinden gelir, sayıya döner, alışkanlığa dönüşür.', 'The trade arrives on its own, becomes a number, then becomes a habit.', 'معامله خودش می‌آید، به عدد تبدیل می‌شود و بعد به عادت.')}
            </p>
          </motion.div>

          {featureGroups.map((group: any, gi: number) => (
            <div key={gi} className={gi > 0 ? 'mt-16 sm:mt-24' : ''}>
              {/* Küme başlığı: numara yerine sessiz bir etiket, yanında çizgi. */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-7">
                <span className="eyebrow whitespace-nowrap" style={{ color: '#f0b429' }}>
                  {group.label}
                </span>
                <h3 className="text-[17px] sm:text-[19px] font-medium" style={{ letterSpacing: '-0.015em' }}>{group.title}</h3>
                <span className="hidden sm:block flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}
                className={`hover-group grid ${group.cols} gap-4 sm:gap-5`}>
                {group.items.map((f: any, i: number) => (
                  <motion.div key={i} variants={fadeUp} whileHover={{ y: shouldReduceMotion ? 0 : -3 }}
                    onMouseMove={spotlight}
                    className="hover-card rounded-2xl p-7 relative h-full"
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
                    <h4 className="hover-title text-[16px] font-medium mb-2.5 pe-10" style={{ letterSpacing: '-0.01em' }}>{f.title}</h4>
                    <p className="text-[14.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.desc}</p>
                    {f.widget}
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
            <span className="channel mb-5 block">CH 03 · {t('Kurulum', 'Setup', 'راه‌اندازی')}</span>
            <h2 className="poster text-[2.1rem] sm:text-[3rem]">
              {t('4 Adımda Başla', 'Get Started in 4 Steps', 'در ۴ مرحله شروع کنید')}
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}
            className="hover-group grid sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-10">
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} onMouseMove={spotlight}
                className={`hover-quiet ${i > 0 ? 'lg:ps-10' : ''}`}
                style={i > 0 ? { borderInlineStart: '1px solid rgba(255,255,255,0.07)' } : undefined}>
                {/* Numara rozet değil, tipografi: sayfanın serifiyle büyük ve sessiz. */}
                <div className="relative font-display leading-none mb-6 w-fit"
                  style={{ fontSize: '46px', color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.03em' }}>
                  {/* Sayının arkasında dağınık bir mor ışık: numara arka plandan
                      ayrılsın, ama rozet gibi kutulanmasın. */}
                  <span className="pointer-events-none absolute -inset-6 rounded-full blur-2xl"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)' }} />
                  <span className="hover-mark relative">{s.n}</span>
                </div>
                <h3 className="hover-title text-[16px] font-medium" style={{ letterSpacing: '-0.01em' }}>{s.title}</h3>
                <span className="hover-rule" />
                <p className="text-[14.5px] leading-relaxed mt-2.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.desc}</p>
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
            <span className="channel mb-5 block">CH 04 · {t('Fiyat', 'Pricing', 'قیمت')}</span>
            <h2 className="poster text-[2.1rem] sm:text-[3rem] mb-4">
              {t('Sade ve Şeffaf Fiyatlandırma', 'Simple & Transparent Pricing', 'قیمت‌گذاری ساده و شفاف')}
            </h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('Ücretsiz başla, büyüdükçe yükselt.', 'Start free, upgrade as you grow.', 'رایگان شروع کنید، با رشد ارتقا دهید.')}
            </p>
          </motion.div>

          <PricingCards
            t={t}
            free={{ label: ctaLabel, onClick: onGetStarted }}
            pro={{ label: signedIn ? ctaLabel : t('3 Gün Ücretsiz Dene', 'Try Free for 3 Days', '۳ روز رایگان امتحان کن'), onClick: onGetStarted }}
          />

          {/* Söz verebileceğimiz kadarını söylüyoruz: "banka düzeyinde güvenlik"
              gibi ölçülemeyen bir iddia, kontrol eden kullanıcıda güveni
              artırmaz, azaltır. Burada yazan şey veritabanında açık olan şey. */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}
            className="max-w-4xl mx-auto mt-6 flex items-center gap-2.5 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Lock className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} />
            <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t(
                'Verilerin satır bazlı güvenlikle (RLS) izole — başka hiçbir kullanıcı senin journal\'ını, işlemlerini ya da fotoğraflarını göremez. Kart bilgisi istemiyoruz.',
                'Your data is isolated with row-level security (RLS) — no other user can see your journals, trades or screenshots. We never ask for a card.',
                'داده‌های شما با امنیت سطح ردیف (RLS) ایزوله است — هیچ کاربر دیگری ژورنال شما را نمی‌بیند.'
              )}
            </p>
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
              <div className="lg:sticky lg:top-28">
                <span className="channel mb-5 block">CH 05 · {t('Sorular', 'Questions', 'پرسش‌ها')}</span>
                <h2 className="poster text-[2.1rem] sm:text-[3rem]">
                  {t('Sıkça Sorulan Sorular', 'Frequently Asked Questions', 'سؤالات متداول')}
                </h2>
              </div>
            </motion.div>

            {/* Kutu yok: sorular tek bir sütun, aralarında ince çizgi. */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}>
              {faqs.map((faq, i) => {
                const isOpen = openFAQ === i;
                return (
                  <motion.div key={i} variants={fadeUp}
                    style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)' }}>
                    <button onClick={() => setOpenFAQ(isOpen ? null : i)} onMouseMove={spotlight}
                      className="hover-row hover-lit w-full flex items-start justify-between gap-6 py-6 text-start group">
                      <span className="flex items-baseline gap-4 min-w-0">
                        {/* Renkler satır içi stille değil sınıfla veriliyor:
                            satır içi stil, imleç geldiğinde altına dönmesini
                            sağlayan kuralı yeniyordu. */}
                        <span className={`hover-mark eyebrow flex-shrink-0 ${isOpen ? 'text-[#f0b429]' : ''}`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className={`hover-title text-[16px] leading-snug ${isOpen ? 'text-white' : 'text-white/[0.78]'}`}>
                          {faq.q}
                        </span>
                      </span>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        style={{ color: isOpen ? '#a78bfa' : 'rgba(255,255,255,0.3)' }} />
                    </button>
                    <motion.div initial={false} animate={{ height: isOpen ? 'auto' : 0 }} className="overflow-hidden"
                      transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}>
                      <p className="pb-7 pe-10 ps-9 text-[14.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{faq.a}</p>
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
            <h2 className="poster text-[2.4rem] sm:text-[3.6rem] mb-6">
              {t('İşlemlerini Bugün Kaydetmeye Başla', 'Start Logging Your Trades Today', 'همین امروز معاملات خود را ثبت کنید')}
            </h2>
            <p className="text-[16px] mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('Ücretsiz, kart bilgisi olmadan, 30 saniyede.', 'Free, no card required, in 30 seconds.', 'رایگان، بدون کارت، در ۳۰ ثانیه.')}
            </p>
            <motion.button onClick={onGetStarted}
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.03 }} whileTap={{ scale: shouldReduceMotion ? 1 : 0.97 }}
              className="cta inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[15px] font-medium"
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
              <LogoLock className="h-[24px] w-auto mb-3" />
              <p className="text-[13.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {t('İşlem Günlüğü Platformu', 'Trading Journal Platform', 'پلتفرم دفترچه معاملات')}
              </p>
              <a href="mailto:support@simpletradejournal.io" className="nav-link nav-link-dim inline-block mt-3 text-[13px]" dir="ltr">
                support@simpletradejournal.io
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {[
                { label: t('Özellikler', 'Features', 'ویژگی‌ها'), href: '#features' },
                { label: t('Nasıl Çalışır', 'How It Works', 'چگونه کار می‌کند'), href: '#how-it-works' },
                { label: t('Fiyatlandırma', 'Pricing', 'قیمت‌گذاری'), href: '#pricing' },
                { label: t('Yardım', 'Help', 'راهنما'), href: '/help' },
                { label: t('Blog', 'Blog', 'بلاگ'), href: '/blog' },
                { label: t('İletişim', 'Contact', 'تماس با ما'), href: 'mailto:support@simpletradejournal.io' },
                { label: t('Değişiklikler', 'Changelog', 'تغییرات'), href: '/changelog' },
              ].map(l => (
                /* Renk satır içi stille verilmiyordu diye değil — veriliyordu
                   diye sorun çıkıyordu: onMouseEnter beyazı doğrudan elemana
                   yazınca, imleç gelince altına çeviren kural yeniliyordu. */
                <a key={l.href} href={l.href} className="nav-link nav-link-dim text-[13.5px]">
                  {l.label}
                </a>
              ))}
              {!signedIn && (
                <button onClick={onSignIn} className="nav-link nav-link-dim text-[13.5px]">
                  {t('Giriş Yap', 'Sign In', 'ورود')}
                </button>
              )}
              <button onClick={onGetStarted} className="nav-link nav-link-accent text-[13.5px]">
                {signedIn ? ctaLabel : t('Ücretsiz Başla', 'Get Started', 'شروع رایگان')}
              </button>
            </div>
          </div>

          <div className="mt-12 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              © {new Date().getFullYear()} Simple Trading Journal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

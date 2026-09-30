/**
 * Ücretsiz hesap makineleri (/tools, /tools/<makine>).
 *
 * Neden var: rakipler (TradeZella'da 10 tane) kayıt istemeyen hesap
 * makineleriyle arama ve bağlantı topluyor; bizde hiç yoktu. SEO.md "Rakip
 * analizi". Hesaplar lib/toolMath.ts'te (testli), görünüş
 * components/ToolPage.tsx'te, metinler burada dokuz dilde.
 *
 * Metinler eğitim amaçlı; kâr vaadi, yatırım tavsiyesi ya da "şu kadar lot
 * al" gibi buyruk yok. Her sayfada uyarı notu var.
 */
import type { ArticleLang } from './articles';

export const TOOLS = [
  { slug: 'position-size-calculator', key: 'pos' },
  { slug: 'risk-reward-calculator', key: 'rr' },
  { slug: 'prop-firm-loss-calculator', key: 'prop' },
] as const;
export type ToolKey = (typeof TOOLS)[number]['key'];

export const toolPath = (slug: string) => `/tools/${slug}`;
export const findTool = (slug: string) => TOOLS.find(t => t.slug === slug);
export const isToolPath = (path: string) => /^\/tools(\/|$)/.test(path);
export const TOOL_PATHS: string[] = ['/tools', ...TOOLS.map(t => toolPath(t.slug))];

export interface ToolCopy {
  title: string;
  description: string;
  lead: string;
  how: [string, string];
  tips: [string, string, string];
}

export interface ToolText {
  home: string; tools: string; allTools: string;
  indexTitle: string; indexDesc: string; indexLead: string;
  open: string; inputs: string; results: string; howH2: string; tipsH2: string;
  ctaTitle: string; ctaText: string; disclaimer: string;
  invalid: string; direction: string;
  balance: string; riskPct: string; stopPips: string; pipValue: string;
  entry: string; stop: string; target: string; winRate: string;
  size: string; dailyPct: string; maxPct: string; lossType: string;
  optStatic: string; optTrailing: string; currentBalance: string; dayStart: string; highest: string;
  preset: string; custom: string;
  riskAmount: string; lots: string; actualRisk: string;
  riskDist: string; rewardDist: string; ratio: string; beRate: string; expectancy: string;
  dailyLimit: string; dailyFloor: string; dailyLeft: string; totalFloor: string; totalLeft: string;
  within: string; breached: string;
  pos: ToolCopy; rr: ToolCopy; prop: ToolCopy;
}

export const TOOL_TEXT: Record<ArticleLang, ToolText> = {
  en: {
    home: 'Home', tools: 'Free tools', allTools: 'All free tools',
    indexTitle: 'Free trading calculators', indexDesc: 'Free trading calculators with no sign-up: position size, risk-reward and expectancy, and prop firm daily and total loss limits.',
    indexLead: 'Free calculators for the numbers you work out before and after a trade. No sign-up, nothing is stored.',
    open: 'Open calculator', inputs: 'Your numbers', results: 'Result', howH2: 'How it works', tipsH2: 'Good to know',
    ctaTitle: 'Keep the numbers, not just the answer', ctaText: 'A calculator gives one answer. Simple Trading Journal keeps every trade, shows how you really did against your plan and tracks your prop limits. Free plan, no card.',
    disclaimer: 'For education only. The results depend on the numbers you enter and are not investment advice.',
    invalid: 'Enter positive numbers in every field.', direction: 'The stop loss and the take profit must be on opposite sides of the entry price.',
    balance: 'Account balance', riskPct: 'Risk per trade (%)', stopPips: 'Stop loss (pips)', pipValue: 'Value of one pip for 1 lot',
    entry: 'Entry price', stop: 'Stop loss price', target: 'Take profit price', winRate: 'Win rate (%), optional',
    size: 'Account size', dailyPct: 'Max daily loss (%)', maxPct: 'Max total loss (%)', lossType: 'Total loss is measured from',
    optStatic: 'Starting balance (static)', optTrailing: 'Highest balance (trailing)', currentBalance: 'Current balance', dayStart: 'Balance at the start of the day', highest: 'Highest balance so far',
    preset: 'Load a prop firm program', custom: 'Custom',
    riskAmount: 'Amount at risk', lots: 'Position size (lots)', actualRisk: 'Actual risk at that size',
    riskDist: 'Risk distance', rewardDist: 'Reward distance', ratio: 'Risk-reward ratio', beRate: 'Break-even win rate', expectancy: 'Expectancy per trade (R)',
    dailyLimit: 'Daily loss limit', dailyFloor: 'Balance floor today', dailyLeft: 'Room left today', totalFloor: 'Balance floor (total loss)', totalLeft: 'Room left in total',
    within: 'Within limits', breached: 'Limit breached',
    pos: {
      title: 'Forex position size calculator',
      description: 'Free forex position size calculator: enter your balance, risk percentage, stop loss in pips and pip value to get the lot size and the amount at risk.',
      lead: 'Work out the lot size that keeps a trade to the amount you chose to risk.',
      how: ['The risk amount is your balance times the risk percentage. The lot size is that amount divided by the stop loss in pips times the value of one pip for one lot.', 'The lot size is rounded down to 0.01, because rounding up would risk more than you chose. The result shows the actual risk at the rounded size.'],
      tips: ['The pip value depends on the pair and your account currency: about 10 for EUR/USD on a USD account, different for JPY pairs and crosses. Check it in your platform.', 'Risk per trade is a choice you make in advance. Many traders keep it small so that a run of losses cannot end the account.', 'Spread, commission and slippage are not included: the real loss on a stopped trade can be a little larger.'],
    },
    rr: {
      title: 'Risk-reward ratio and expectancy calculator',
      description: 'Free risk-reward calculator: enter entry, stop loss and take profit to get the ratio, the break-even win rate and, with your win rate, the expectancy per trade in R.',
      lead: 'See what a trade pays for what it risks, and how often you need to win for it to break even.',
      how: ['The risk is the distance from entry to stop loss and the reward is the distance from entry to take profit. The ratio is reward divided by risk: a 20-pip stop with a 40-pip target is 1:2, or 2R.', 'The break-even win rate is 100 divided by (1 + ratio). With a win rate, expectancy per trade in R is win rate × ratio − (1 − win rate).'],
      tips: ['The direction comes from the order of the prices: a stop below the entry is a buy, above it a sell.', 'A high ratio is not automatically good: if the target is rarely reached, the win rate falls. Judge the two together, on your own results.', 'A win rate you type in is an assumption. Your journal shows the real one from your closed trades.'],
    },
    prop: {
      title: 'Prop firm daily loss and drawdown calculator',
      description: 'Free prop firm loss calculator: enter account size, daily and total loss limits and your balance to see the floor for today and for the account, and how much room is left.',
      lead: 'See how far your balance is from the daily and the total loss limit of a prop firm account.',
      how: ['The daily floor is the balance at the start of the day minus the daily limit. The total floor is the starting balance minus the total limit, or, for a trailing limit, the highest balance reached minus the total limit.', 'Percentages are of the initial account size, as on the firms\' rule pages. Pick a program to fill them in, then check them against the firm\'s own page.'],
      tips: ['This calculator uses closed-trade balances. Firms may also count the floating loss of open positions, so keep a buffer below each limit.', 'When the daily limit resets, and whether it is measured from balance or equity, differs by firm. Confirm on the firm\'s own site.', 'For the rules of each firm, see the prop firm pages on this site.'],
    },
  },
  tr: {
    home: 'Ana sayfa', tools: 'Ücretsiz araçlar', allTools: 'Tüm ücretsiz araçlar',
    indexTitle: 'Ücretsiz trading hesap makineleri', indexDesc: 'Kayıt gerektirmeyen ücretsiz trading hesap makineleri: pozisyon büyüklüğü, risk/ödül ve beklenti, prop firma günlük ve toplam kayıp limitleri.',
    indexLead: 'İşlemden önce ve sonra hesapladığın sayılar için ücretsiz hesap makineleri. Kayıt yok, hiçbir şey saklanmaz.',
    open: 'Hesap makinesini aç', inputs: 'Sayıların', results: 'Sonuç', howH2: 'Nasıl çalışır', tipsH2: 'Bilmekte fayda var',
    ctaTitle: 'Yalnız cevabı değil, sayıları da sakla', ctaText: 'Hesap makinesi tek bir cevap verir. Simple Trading Journal her işlemi saklar, planına karşı gerçekte nasıl yaptığını gösterir ve prop limitlerini takip eder. Ücretsiz plan, kart yok.',
    disclaimer: 'Yalnızca eğitim amaçlıdır. Sonuçlar girdiğin sayılara bağlıdır ve yatırım tavsiyesi değildir.',
    invalid: 'Her alana pozitif bir sayı gir.', direction: 'Zarar durdur ile kâr al fiyatı, giriş fiyatının karşıt taraflarında olmalı.',
    balance: 'Hesap bakiyesi', riskPct: 'İşlem başına risk (%)', stopPips: 'Zarar durdur (pip)', pipValue: '1 lot için bir pipin değeri',
    entry: 'Giriş fiyatı', stop: 'Zarar durdur fiyatı', target: 'Kâr al fiyatı', winRate: 'Kazanma oranı (%), isteğe bağlı',
    size: 'Hesap büyüklüğü', dailyPct: 'Maksimum günlük kayıp (%)', maxPct: 'Maksimum toplam kayıp (%)', lossType: 'Toplam kayıp nereden ölçülür',
    optStatic: 'Başlangıç bakiyesi (sabit)', optTrailing: 'En yüksek bakiye (takipli)', currentBalance: 'Güncel bakiye', dayStart: 'Günün başındaki bakiye', highest: 'Şimdiye kadarki en yüksek bakiye',
    preset: 'Bir prop firma programı yükle', custom: 'Özel',
    riskAmount: 'Riske edilen tutar', lots: 'Pozisyon büyüklüğü (lot)', actualRisk: 'Bu büyüklükte gerçek risk',
    riskDist: 'Risk mesafesi', rewardDist: 'Ödül mesafesi', ratio: 'Risk/ödül oranı', beRate: 'Başabaş kazanma oranı', expectancy: 'İşlem başına beklenti (R)',
    dailyLimit: 'Günlük kayıp limiti', dailyFloor: 'Bugünün bakiye tabanı', dailyLeft: 'Bugün kalan pay', totalFloor: 'Bakiye tabanı (toplam kayıp)', totalLeft: 'Toplamda kalan pay',
    within: 'Limitler içinde', breached: 'Limit aşıldı',
    pos: {
      title: 'Forex pozisyon büyüklüğü hesaplama',
      description: 'Ücretsiz forex pozisyon büyüklüğü hesap makinesi: bakiyeni, risk yüzdesini, pip cinsinden zarar durdurunu ve pip değerini gir; lot büyüklüğünü ve riske edilen tutarı gör.',
      lead: 'İşlemi seçtiğin risk tutarında tutan lot büyüklüğünü hesapla.',
      how: ['Risk tutarı, bakiyen çarpı risk yüzdendir. Lot büyüklüğü, bu tutarın pip cinsinden zarar durdur çarpı bir lot için bir pipin değerine bölünmesidir.', 'Lot 0,01\'e aşağı yuvarlanır, çünkü yukarı yuvarlamak seçtiğinden fazla risk demektir. Sonuç, yuvarlanmış büyüklükteki gerçek riski gösterir.'],
      tips: ['Pip değeri pariteye ve hesap para birimine bağlıdır: USD hesapta EUR/USD için yaklaşık 10, JPY ve çapraz paritelerde farklıdır. Platformundan kontrol et.', 'İşlem başına risk, önceden yaptığın bir seçimdir. Birçok trader onu küçük tutar ki bir kayıp serisi hesabı bitirmesin.', 'Spread, komisyon ve kayma dahil değildir: zarar durdurun çalıştığı bir işlemde gerçek kayıp biraz daha büyük olabilir.'],
    },
    rr: {
      title: 'Risk/ödül oranı ve beklenti hesaplama',
      description: 'Ücretsiz risk/ödül hesap makinesi: giriş, zarar durdur ve kâr al fiyatını gir; oranı, başabaş kazanma oranını ve kazanma oranınla birlikte işlem başına beklentiyi R cinsinden gör.',
      lead: 'Bir işlemin riske ettiğine karşılık ne kazandırdığını ve başabaş için ne sıklıkta kazanman gerektiğini gör.',
      how: ['Risk, girişten zarar durdura; ödül, girişten kâr ala olan mesafedir. Oran, ödülün riske bölünmesidir: 20 pip zarar durdur ve 40 pip hedef 1:2, yani 2R eder.', 'Başabaş kazanma oranı, 100 bölü (1 + oran) kadardır. Kazanma oranıyla birlikte işlem başına beklenti, R cinsinden kazanma oranı × oran − (1 − kazanma oranı) olur.'],
      tips: ['Yön, fiyatların sırasından çıkar: girişin altındaki zarar durdur alış, üstündeki satıştır.', 'Yüksek oran kendiliğinden iyi değildir: hedefe nadiren ulaşılıyorsa kazanma oranı düşer. İkisini birlikte, kendi sonuçlarına bakarak değerlendir.', 'Yazdığın kazanma oranı bir varsayımdır. Journal\'ın kapanan işlemlerinden gerçeğini gösterir.'],
    },
    prop: {
      title: 'Prop firma günlük kayıp ve drawdown hesaplama',
      description: 'Ücretsiz prop firma kayıp hesap makinesi: hesap büyüklüğünü, günlük ve toplam kayıp limitlerini ve bakiyeni gir; bugünün ve hesabın tabanını, ne kadar payın kaldığını gör.',
      lead: 'Bir prop firma hesabında bakiyenin günlük ve toplam kayıp limitine ne kadar uzak olduğunu gör.',
      how: ['Günlük taban, günün başındaki bakiyeden günlük limitin düşülmesidir. Toplam taban, başlangıç bakiyesinden toplam limitin düşülmesidir; takipli limitte ulaşılan en yüksek bakiyeden düşülür.', 'Yüzdeler, firmaların kural sayfalarındaki gibi başlangıç hesap büyüklüğüne göredir. Doldurmak için bir program seç, sonra firmanın kendi sayfasından kontrol et.'],
      tips: ['Bu hesap makinesi kapanan işlemlerin bakiyesini kullanır. Firmalar açık pozisyonların anlık zararını da sayabilir; her limitin altında pay bırak.', 'Günlük limitin ne zaman yenilendiği ve bakiyeden mi varlıktan mı ölçüldüğü firmaya göre değişir. Firmanın kendi sitesinden doğrula.', 'Her firmanın kuralları için bu sitedeki prop firma sayfalarına bak.'],
    },
  },
  fa: {
    home: 'صفحه اصلی', tools: 'ابزارهای رایگان', allTools: 'همه ابزارهای رایگان',
    indexTitle: 'ماشین‌حساب‌های رایگان ترید', indexDesc: 'ماشین‌حساب‌های رایگان ترید بدون ثبت‌نام: حجم پوزیشن، ریسک به ریوارد و امید ریاضی، و حد ضرر روزانه و کل پراپ فرم.',
    indexLead: 'ماشین‌حساب‌های رایگان برای عددهایی که قبل و بعد از معامله حساب می‌کنی. بدون ثبت‌نام و چیزی ذخیره نمی‌شود.',
    open: 'باز کردن ماشین‌حساب', inputs: 'عددهای تو', results: 'نتیجه', howH2: 'چطور کار می‌کند', tipsH2: 'خوب است بدانی',
    ctaTitle: 'عددها را نگه دار، نه فقط جواب را', ctaText: 'ماشین‌حساب فقط یک جواب می‌دهد. Simple Trading Journal هر معامله را نگه می‌دارد، نشان می‌دهد در برابر برنامه‌ات واقعاً چطور بوده‌ای و حدود پراپ را دنبال می‌کند. پلن رایگان، بدون کارت.',
    disclaimer: 'فقط برای آموزش. نتیجه‌ها به عددهایی که وارد می‌کنی بستگی دارند و توصیه سرمایه‌گذاری نیستند.',
    invalid: 'در همه فیلدها عدد مثبت وارد کن.', direction: 'حد ضرر و حد سود باید در دو سوی متقابل قیمت ورود باشند.',
    balance: 'موجودی حساب', riskPct: 'ریسک هر معامله (٪)', stopPips: 'حد ضرر (پیپ)', pipValue: 'ارزش یک پیپ برای ۱ لات',
    entry: 'قیمت ورود', stop: 'قیمت حد ضرر', target: 'قیمت حد سود', winRate: 'نرخ برد (٪)، اختیاری',
    size: 'اندازه حساب', dailyPct: 'حداکثر ضرر روزانه (٪)', maxPct: 'حداکثر ضرر کل (٪)', lossType: 'ضرر کل از کجا اندازه‌گیری می‌شود',
    optStatic: 'موجودی اولیه (ثابت)', optTrailing: 'بالاترین موجودی (دنباله‌رو)', currentBalance: 'موجودی فعلی', dayStart: 'موجودی ابتدای روز', highest: 'بالاترین موجودی تا امروز',
    preset: 'بارگذاری یک برنامه پراپ فرم', custom: 'دلخواه',
    riskAmount: 'مبلغ ریسک‌شده', lots: 'حجم پوزیشن (لات)', actualRisk: 'ریسک واقعی در این حجم',
    riskDist: 'فاصله ریسک', rewardDist: 'فاصله ریوارد', ratio: 'نسبت ریسک به ریوارد', beRate: 'نرخ برد سربه‌سر', expectancy: 'امید ریاضی هر معامله (R)',
    dailyLimit: 'حد ضرر روزانه', dailyFloor: 'کف موجودی امروز', dailyLeft: 'فاصله باقی‌مانده امروز', totalFloor: 'کف موجودی (ضرر کل)', totalLeft: 'فاصله باقی‌مانده در کل',
    within: 'در محدوده مجاز', breached: 'حد نقض شده',
    pos: {
      title: 'ماشین‌حساب حجم پوزیشن فارکس',
      description: 'ماشین‌حساب رایگان حجم پوزیشن فارکس: موجودی، درصد ریسک، حد ضرر به پیپ و ارزش پیپ را وارد کن و حجم لات و مبلغ ریسک را ببین.',
      lead: 'حجم لاتی را حساب کن که معامله را در همان مبلغی که برای ریسک انتخاب کرده‌ای نگه دارد.',
      how: ['مبلغ ریسک برابر است با موجودی ضرب در درصد ریسک. حجم لات برابر است با آن مبلغ تقسیم بر حد ضرر به پیپ ضرب در ارزش یک پیپ برای یک لات.', 'حجم لات به ۰٫۰۱ رو به پایین گرد می‌شود، چون گرد کردن به بالا بیش از انتخابت ریسک می‌کند. نتیجه ریسک واقعی در حجم گردشده را نشان می‌دهد.'],
      tips: ['ارزش پیپ به جفت‌ارز و ارز حسابت بستگی دارد: در حساب دلاری برای EUR/USD حدود ۱۰ است و برای جفت‌ارزهای ین و کراس‌ها فرق دارد. آن را در پلتفرمت بررسی کن.', 'ریسک هر معامله انتخابی است که از قبل می‌کنی. بسیاری از تریدرها آن را کوچک نگه می‌دارند تا یک رشته ضرر حساب را تمام نکند.', 'اسپرد، کمیسیون و لغزش قیمت حساب نشده‌اند: ضرر واقعی معامله‌ای که حد ضررش خورده ممکن است کمی بیشتر باشد.'],
    },
    rr: {
      title: 'ماشین‌حساب نسبت ریسک به ریوارد و امید ریاضی',
      description: 'ماشین‌حساب رایگان ریسک به ریوارد: قیمت ورود، حد ضرر و حد سود را وارد کن و نسبت، نرخ برد سربه‌سر و با نرخ برد خودت امید ریاضی هر معامله را بر حسب R ببین.',
      lead: 'ببین یک معامله در برابر ریسکش چه می‌دهد و برای سربه‌سر شدن هر چند وقت یک بار باید ببری.',
      how: ['ریسک فاصله ورود تا حد ضرر و ریوارد فاصله ورود تا حد سود است. نسبت یعنی ریوارد تقسیم بر ریسک: حد ضرر ۲۰ پیپ با هدف ۴۰ پیپ برابر ۱:۲ یا ۲R است.', 'نرخ برد سربه‌سر برابر است با ۱۰۰ تقسیم بر (۱ + نسبت). با نرخ برد، امید ریاضی هر معامله بر حسب R برابر است با نرخ برد × نسبت − (۱ − نرخ برد).'],
      tips: ['جهت از ترتیب قیمت‌ها معلوم می‌شود: حد ضرر زیر قیمت ورود یعنی خرید و بالای آن یعنی فروش.', 'نسبت بالا خودبه‌خود خوب نیست: اگر به هدف کم‌تر برسی نرخ برد پایین می‌آید. هر دو را با هم و بر اساس نتیجه‌های خودت بسنج.', 'نرخ بردی که وارد می‌کنی فرض است. ژورنالت مقدار واقعی را از معاملات بسته‌شده‌ات نشان می‌دهد.'],
    },
    prop: {
      title: 'ماشین‌حساب ضرر روزانه و دراودان پراپ فرم',
      description: 'ماشین‌حساب رایگان ضرر پراپ فرم: اندازه حساب، حد ضرر روزانه و کل و موجودی‌ات را وارد کن و کف امروز و کف حساب و فاصله باقی‌مانده را ببین.',
      lead: 'ببین موجودی حساب پراپ چقدر از حد ضرر روزانه و کل فاصله دارد.',
      how: ['کف روزانه برابر است با موجودی ابتدای روز منهای حد روزانه. کف کل برابر است با موجودی اولیه منهای حد کل، یا در حد دنباله‌رو، بالاترین موجودی رسیده‌شده منهای حد کل.', 'درصدها نسبت به اندازه اولیه حساب است، مثل صفحه‌های قوانین شرکت‌ها. برای پر کردن یک برنامه انتخاب کن و بعد با صفحه خود شرکت مطابقت بده.'],
      tips: ['این ماشین‌حساب از موجودی معاملات بسته‌شده استفاده می‌کند. شرکت‌ها ممکن است ضرر لحظه‌ای پوزیشن‌های باز را هم حساب کنند؛ زیر هر حد فاصله بگذار.', 'زمان ریست شدن حد روزانه و اینکه از موجودی سنجیده می‌شود یا اکوییتی، بسته به شرکت فرق دارد. در سایت خود شرکت تأیید کن.', 'برای قوانین هر شرکت به صفحه‌های پراپ فرم همین سایت مراجعه کن.'],
    },
  },
  ar: {
    home: 'الرئيسية', tools: 'أدوات مجانية', allTools: 'كل الأدوات المجانية',
    indexTitle: 'حاسبات تداول مجانية', indexDesc: 'حاسبات تداول مجانية دون تسجيل: حجم المركز، والمخاطرة إلى العائد والتوقع الرياضي، وحدود الخسارة اليومية والإجمالية لشركات التمويل.',
    indexLead: 'حاسبات مجانية للأرقام التي تحسبها قبل الصفقة وبعدها. دون تسجيل، ولا يُحفظ شيء.',
    open: 'افتح الحاسبة', inputs: 'أرقامك', results: 'النتيجة', howH2: 'كيف تعمل', tipsH2: 'من المفيد أن تعرف',
    ctaTitle: 'احتفظ بالأرقام لا بالجواب فقط', ctaText: 'الحاسبة تعطي جواباً واحداً. يحفظ Simple Trading Journal كل صفقة ويريك كيف كان أداؤك فعلاً مقابل خطتك ويتابع حدود حسابات التمويل. خطة مجانية دون بطاقة.',
    disclaimer: 'للتعليم فقط. تعتمد النتائج على الأرقام التي تدخلها وليست نصيحة استثمارية.',
    invalid: 'أدخل أرقاماً موجبة في كل حقل.', direction: 'يجب أن يكون وقف الخسارة وجني الأرباح على جانبين متقابلين من سعر الدخول.',
    balance: 'رصيد الحساب', riskPct: 'المخاطرة في الصفقة (٪)', stopPips: 'وقف الخسارة (نقاط)', pipValue: 'قيمة النقطة الواحدة للوت واحد',
    entry: 'سعر الدخول', stop: 'سعر وقف الخسارة', target: 'سعر جني الأرباح', winRate: 'نسبة الربح (٪)، اختياري',
    size: 'حجم الحساب', dailyPct: 'أقصى خسارة يومية (٪)', maxPct: 'أقصى خسارة إجمالية (٪)', lossType: 'تُقاس الخسارة الإجمالية من',
    optStatic: 'الرصيد الابتدائي (ثابت)', optTrailing: 'أعلى رصيد (متحرك)', currentBalance: 'الرصيد الحالي', dayStart: 'الرصيد في بداية اليوم', highest: 'أعلى رصيد حتى الآن',
    preset: 'حمّل برنامج شركة تمويل', custom: 'مخصص',
    riskAmount: 'المبلغ المخاطَر به', lots: 'حجم المركز (لوت)', actualRisk: 'المخاطرة الفعلية بهذا الحجم',
    riskDist: 'مسافة المخاطرة', rewardDist: 'مسافة العائد', ratio: 'نسبة المخاطرة إلى العائد', beRate: 'نسبة الربح عند التعادل', expectancy: 'التوقع الرياضي لكل صفقة (R)',
    dailyLimit: 'حد الخسارة اليومي', dailyFloor: 'أدنى رصيد اليوم', dailyLeft: 'الهامش المتبقي اليوم', totalFloor: 'أدنى رصيد (الخسارة الإجمالية)', totalLeft: 'الهامش المتبقي إجمالاً',
    within: 'ضمن الحدود', breached: 'تم تجاوز الحد',
    pos: {
      title: 'حاسبة حجم المركز في الفوركس',
      description: 'حاسبة مجانية لحجم المركز في الفوركس: أدخل رصيدك ونسبة المخاطرة ووقف الخسارة بالنقاط وقيمة النقطة لتحصل على حجم اللوت والمبلغ المخاطَر به.',
      lead: 'احسب حجم اللوت الذي يبقي الصفقة ضمن المبلغ الذي اخترت المخاطرة به.',
      how: ['مبلغ المخاطرة هو رصيدك مضروباً في نسبة المخاطرة. وحجم اللوت هو هذا المبلغ مقسوماً على وقف الخسارة بالنقاط مضروباً في قيمة النقطة الواحدة للوت واحد.', 'يُقرَّب حجم اللوت إلى الأدنى عند 0.01 لأن التقريب إلى الأعلى يعني مخاطرة أكبر مما اخترت. وتُظهر النتيجة المخاطرة الفعلية بالحجم المقرَّب.'],
      tips: ['تعتمد قيمة النقطة على الزوج وعملة حسابك: نحو 10 لزوج EUR/USD في حساب بالدولار، وتختلف في أزواج الين والأزواج المتقاطعة. راجعها في منصتك.', 'المخاطرة في الصفقة قرار تتخذه مسبقاً. يبقيها كثير من المتداولين صغيرة كي لا تنهي سلسلة خسائر الحساب.', 'السبريد والعمولة والانزلاق السعري غير محسوبة: قد تكون الخسارة الفعلية لصفقة ضُرب وقفها أكبر قليلاً.'],
    },
    rr: {
      title: 'حاسبة نسبة المخاطرة إلى العائد والتوقع الرياضي',
      description: 'حاسبة مجانية للمخاطرة إلى العائد: أدخل الدخول ووقف الخسارة وجني الأرباح لتحصل على النسبة ونسبة الربح عند التعادل، ومع نسبة ربحك التوقع الرياضي لكل صفقة بوحدة R.',
      lead: 'اعرف ما تدفعه الصفقة مقابل ما تخاطر به، وكم مرة تحتاج أن تربح لتتعادل.',
      how: ['المخاطرة هي المسافة من الدخول إلى وقف الخسارة، والعائد هو المسافة من الدخول إلى جني الأرباح. والنسبة هي العائد مقسوماً على المخاطرة: وقف 20 نقطة مع هدف 40 نقطة يعني 1:2 أو 2R.', 'نسبة الربح عند التعادل هي 100 مقسوماً على (1 + النسبة). ومع نسبة الربح، يكون التوقع الرياضي لكل صفقة بوحدة R هو نسبة الربح × النسبة − (1 − نسبة الربح).'],
      tips: ['يُعرف الاتجاه من ترتيب الأسعار: وقف أسفل الدخول شراء، وأعلاه بيع.', 'النسبة العالية ليست جيدة تلقائياً: إذا نادراً ما يُبلغ الهدف تنخفض نسبة الربح. قيّم الاثنين معاً وبحسب نتائجك أنت.', 'نسبة الربح التي تكتبها افتراض. سجلك يريك النسبة الحقيقية من صفقاتك المغلقة.'],
    },
    prop: {
      title: 'حاسبة الخسارة اليومية والتراجع لشركات التمويل',
      description: 'حاسبة مجانية لخسارة حسابات التمويل: أدخل حجم الحساب وحدي الخسارة اليومي والإجمالي ورصيدك لترى أدنى رصيد اليوم وللحساب وكم بقي من الهامش.',
      lead: 'اعرف كم يبعد رصيدك عن حد الخسارة اليومي والإجمالي في حساب شركة تمويل.',
      how: ['أدنى رصيد يومي هو رصيد بداية اليوم ناقص الحد اليومي. وأدنى رصيد إجمالي هو الرصيد الابتدائي ناقص الحد الإجمالي، أو في الحد المتحرك أعلى رصيد بلغته ناقص الحد الإجمالي.', 'النسب محسوبة من الحجم الابتدائي للحساب كما في صفحات قواعد الشركات. اختر برنامجاً ليملأها ثم راجعها في صفحة الشركة نفسها.'],
      tips: ['تستخدم هذه الحاسبة أرصدة الصفقات المغلقة. قد تحتسب الشركات أيضاً الخسارة العائمة للصفقات المفتوحة، فاترك هامشاً تحت كل حد.', 'موعد إعادة ضبط الحد اليومي وهل يُقاس من الرصيد أو من حقوق الملكية يختلف بحسب الشركة. تأكد من موقع الشركة نفسها.', 'لقواعد كل شركة راجع صفحات شركات التمويل في هذا الموقع.'],
    },
  },
  ru: {
    home: 'Главная', tools: 'Бесплатные инструменты', allTools: 'Все бесплатные инструменты',
    indexTitle: 'Бесплатные калькуляторы трейдера', indexDesc: 'Бесплатные калькуляторы без регистрации: размер позиции, риск/прибыль и матожидание, дневной и общий лимиты убытка проп-фирм.',
    indexLead: 'Бесплатные калькуляторы для чисел, которые вы считаете до и после сделки. Без регистрации, ничего не сохраняется.',
    open: 'Открыть калькулятор', inputs: 'Ваши числа', results: 'Результат', howH2: 'Как это работает', tipsH2: 'Полезно знать',
    ctaTitle: 'Сохраняйте числа, а не только ответ', ctaText: 'Калькулятор даёт один ответ. Simple Trading Journal хранит каждую сделку, показывает, как вы на деле торгуете относительно плана, и следит за лимитами проп-счёта. Бесплатный план, без карты.',
    disclaimer: 'Только в образовательных целях. Результаты зависят от введённых вами чисел и не являются инвестиционной рекомендацией.',
    invalid: 'Введите положительные числа во все поля.', direction: 'Стоп-лосс и тейк-профит должны находиться по разные стороны от цены входа.',
    balance: 'Баланс счёта', riskPct: 'Риск на сделку (%)', stopPips: 'Стоп-лосс (пункты)', pipValue: 'Стоимость одного пункта для 1 лота',
    entry: 'Цена входа', stop: 'Цена стоп-лосса', target: 'Цена тейк-профита', winRate: 'Доля прибыльных сделок (%), необязательно',
    size: 'Размер счёта', dailyPct: 'Макс. дневной убыток (%)', maxPct: 'Макс. общий убыток (%)', lossType: 'Общий убыток считается от',
    optStatic: 'Стартовый баланс (статичный)', optTrailing: 'Максимальный баланс (плавающий)', currentBalance: 'Текущий баланс', dayStart: 'Баланс на начало дня', highest: 'Максимальный баланс на сегодня',
    preset: 'Загрузить программу проп-фирмы', custom: 'Свои значения',
    riskAmount: 'Сумма риска', lots: 'Размер позиции (лоты)', actualRisk: 'Фактический риск при таком размере',
    riskDist: 'Дистанция риска', rewardDist: 'Дистанция прибыли', ratio: 'Соотношение риск/прибыль', beRate: 'Безубыточная доля прибыльных сделок', expectancy: 'Матожидание на сделку (R)',
    dailyLimit: 'Дневной лимит убытка', dailyFloor: 'Нижняя граница баланса на сегодня', dailyLeft: 'Запас на сегодня', totalFloor: 'Нижняя граница баланса (общий убыток)', totalLeft: 'Общий запас',
    within: 'В пределах лимитов', breached: 'Лимит нарушен',
    pos: {
      title: 'Калькулятор размера позиции на форексе',
      description: 'Бесплатный калькулятор размера позиции на форексе: введите баланс, процент риска, стоп-лосс в пунктах и стоимость пункта — получите размер лота и сумму риска.',
      lead: 'Рассчитайте размер лота, при котором сделка укладывается в выбранную вами сумму риска.',
      how: ['Сумма риска — это баланс, умноженный на процент риска. Размер лота — эта сумма, делённая на стоп-лосс в пунктах, умноженный на стоимость одного пункта для одного лота.', 'Лот округляется вниз до 0,01, потому что округление вверх означало бы риск больше выбранного. В результате показан фактический риск при округлённом размере.'],
      tips: ['Стоимость пункта зависит от пары и валюты счёта: около 10 для EUR/USD на долларовом счёте, для пар с иеной и кроссов иная. Проверьте её в своей платформе.', 'Риск на сделку — выбор, который делается заранее. Многие трейдеры держат его небольшим, чтобы серия убытков не закончила счёт.', 'Спред, комиссия и проскальзывание не учтены: реальный убыток по сделке, закрытой по стопу, может быть чуть больше.'],
    },
    rr: {
      title: 'Калькулятор соотношения риск/прибыль и матожидания',
      description: 'Бесплатный калькулятор риск/прибыль: введите вход, стоп-лосс и тейк-профит — получите соотношение, безубыточную долю прибыльных сделок и, с вашей долей, матожидание на сделку в R.',
      lead: 'Посмотрите, что сделка приносит за свой риск и как часто нужно выигрывать, чтобы выйти в ноль.',
      how: ['Риск — расстояние от входа до стоп-лосса, прибыль — расстояние от входа до тейк-профита. Соотношение — прибыль, делённая на риск: стоп 20 пунктов и цель 40 пунктов — это 1:2, или 2R.', 'Безубыточная доля прибыльных сделок равна 100, делённому на (1 + соотношение). С долей прибыльных сделок матожидание на сделку в R равно доля × соотношение − (1 − доля).'],
      tips: ['Направление определяется порядком цен: стоп ниже входа — покупка, выше — продажа.', 'Высокое соотношение само по себе не хорошо: если цель достигается редко, доля прибыльных падает. Оценивайте оба показателя вместе и по собственным результатам.', 'Введённая доля прибыльных сделок — предположение. Журнал покажет реальную по вашим закрытым сделкам.'],
    },
    prop: {
      title: 'Калькулятор дневного убытка и просадки проп-фирмы',
      description: 'Бесплатный калькулятор убытков проп-фирмы: введите размер счёта, дневной и общий лимиты и баланс — увидите нижнюю границу на сегодня и для счёта и оставшийся запас.',
      lead: 'Посмотрите, как далеко баланс от дневного и общего лимита убытка проп-счёта.',
      how: ['Дневная граница — баланс на начало дня минус дневной лимит. Общая граница — стартовый баланс минус общий лимит, а при плавающем лимите — максимальный достигнутый баланс минус общий лимит.', 'Проценты берутся от начального размера счёта, как на страницах правил фирм. Выберите программу, чтобы заполнить их, и сверьте со страницей самой фирмы.'],
      tips: ['Калькулятор использует баланс по закрытым сделкам. Фирмы могут учитывать и плавающий убыток открытых позиций, поэтому оставляйте запас до каждого лимита.', 'Когда сбрасывается дневной лимит и считается ли он от баланса или эквити — зависит от фирмы. Проверяйте на сайте самой фирмы.', 'Правила каждой фирмы — на страницах проп-фирм этого сайта.'],
    },
  },
  es: {
    home: 'Inicio', tools: 'Herramientas gratuitas', allTools: 'Todas las herramientas gratuitas',
    indexTitle: 'Calculadoras de trading gratuitas', indexDesc: 'Calculadoras de trading gratuitas y sin registro: tamaño de posición, riesgo-beneficio y expectativa, y límites de pérdida diaria y total de las prop firms.',
    indexLead: 'Calculadoras gratuitas para los números que sacas antes y después de una operación. Sin registro y sin guardar nada.',
    open: 'Abrir la calculadora', inputs: 'Tus números', results: 'Resultado', howH2: 'Cómo funciona', tipsH2: 'Conviene saber',
    ctaTitle: 'Guarda los números, no solo la respuesta', ctaText: 'Una calculadora da una sola respuesta. Simple Trading Journal guarda cada operación, muestra cómo te fue de verdad frente a tu plan y sigue tus límites de prop firm. Plan gratuito, sin tarjeta.',
    disclaimer: 'Solo con fines educativos. Los resultados dependen de los números que introduzcas y no son asesoramiento de inversión.',
    invalid: 'Introduce números positivos en todos los campos.', direction: 'El stop loss y el take profit deben estar en lados opuestos del precio de entrada.',
    balance: 'Saldo de la cuenta', riskPct: 'Riesgo por operación (%)', stopPips: 'Stop loss (pips)', pipValue: 'Valor de un pip por 1 lote',
    entry: 'Precio de entrada', stop: 'Precio del stop loss', target: 'Precio del take profit', winRate: 'Tasa de acierto (%), opcional',
    size: 'Tamaño de la cuenta', dailyPct: 'Pérdida diaria máxima (%)', maxPct: 'Pérdida total máxima (%)', lossType: 'La pérdida total se mide desde',
    optStatic: 'Saldo inicial (estático)', optTrailing: 'Saldo máximo (trailing)', currentBalance: 'Saldo actual', dayStart: 'Saldo al inicio del día', highest: 'Saldo máximo hasta ahora',
    preset: 'Cargar un programa de prop firm', custom: 'Personalizado',
    riskAmount: 'Importe en riesgo', lots: 'Tamaño de posición (lotes)', actualRisk: 'Riesgo real con ese tamaño',
    riskDist: 'Distancia de riesgo', rewardDist: 'Distancia de beneficio', ratio: 'Ratio riesgo-beneficio', beRate: 'Tasa de acierto de equilibrio', expectancy: 'Expectativa por operación (R)',
    dailyLimit: 'Límite de pérdida diaria', dailyFloor: 'Suelo de saldo hoy', dailyLeft: 'Margen que queda hoy', totalFloor: 'Suelo de saldo (pérdida total)', totalLeft: 'Margen total que queda',
    within: 'Dentro de los límites', breached: 'Límite superado',
    pos: {
      title: 'Calculadora de tamaño de posición en forex',
      description: 'Calculadora gratuita de tamaño de posición en forex: introduce tu saldo, el porcentaje de riesgo, el stop loss en pips y el valor del pip para obtener el lote y el importe en riesgo.',
      lead: 'Calcula el lote que mantiene una operación en la cantidad que elegiste arriesgar.',
      how: ['El importe en riesgo es tu saldo por el porcentaje de riesgo. El lote es ese importe dividido entre el stop loss en pips por el valor de un pip para un lote.', 'El lote se redondea hacia abajo a 0,01, porque redondear hacia arriba arriesgaría más de lo elegido. El resultado muestra el riesgo real con el tamaño redondeado.'],
      tips: ['El valor del pip depende del par y de la divisa de tu cuenta: unos 10 para EUR/USD en una cuenta en dólares, distinto en pares con yen y en cruces. Compruébalo en tu plataforma.', 'El riesgo por operación es una decisión que tomas de antemano. Muchos traders lo mantienen bajo para que una racha de pérdidas no acabe con la cuenta.', 'No incluye spread, comisión ni slippage: la pérdida real de una operación cerrada por stop puede ser algo mayor.'],
    },
    rr: {
      title: 'Calculadora de ratio riesgo-beneficio y expectativa',
      description: 'Calculadora gratuita de riesgo-beneficio: introduce entrada, stop loss y take profit para obtener la ratio, la tasa de acierto de equilibrio y, con tu tasa de acierto, la expectativa por operación en R.',
      lead: 'Mira qué paga una operación por lo que arriesga y con qué frecuencia necesitas acertar para quedar en tablas.',
      how: ['El riesgo es la distancia de la entrada al stop loss y el beneficio, la distancia de la entrada al take profit. La ratio es el beneficio dividido entre el riesgo: un stop de 20 pips con un objetivo de 40 pips es 1:2, o 2R.', 'La tasa de acierto de equilibrio es 100 dividido entre (1 + ratio). Con una tasa de acierto, la expectativa por operación en R es tasa × ratio − (1 − tasa).'],
      tips: ['La dirección sale del orden de los precios: un stop por debajo de la entrada es una compra, por encima, una venta.', 'Una ratio alta no es buena por sí sola: si el objetivo casi nunca se alcanza, la tasa de acierto cae. Juzga las dos juntas y con tus propios resultados.', 'La tasa de acierto que escribes es una suposición. Tu diario muestra la real con tus operaciones cerradas.'],
    },
    prop: {
      title: 'Calculadora de pérdida diaria y drawdown de prop firm',
      description: 'Calculadora gratuita de pérdida de prop firm: introduce el tamaño de la cuenta, los límites de pérdida diaria y total y tu saldo para ver el suelo de hoy y de la cuenta y cuánto margen queda.',
      lead: 'Mira a qué distancia está tu saldo del límite de pérdida diaria y total de una cuenta de prop firm.',
      how: ['El suelo diario es el saldo al inicio del día menos el límite diario. El suelo total es el saldo inicial menos el límite total o, en un límite trailing, el saldo máximo alcanzado menos el límite total.', 'Los porcentajes son sobre el tamaño inicial de la cuenta, como en las páginas de reglas de las firmas. Elige un programa para rellenarlos y compruébalos en la página de la propia firma.'],
      tips: ['Esta calculadora usa saldos de operaciones cerradas. Las firmas pueden contar también la pérdida flotante de las posiciones abiertas, así que deja margen bajo cada límite.', 'Cuándo se reinicia el límite diario y si se mide desde el saldo o el capital varía según la firma. Confírmalo en su web.', 'Para las reglas de cada firma, consulta las páginas de prop firms de este sitio.'],
    },
  },
  pt: {
    home: 'Início', tools: 'Ferramentas gratuitas', allTools: 'Todas as ferramentas gratuitas',
    indexTitle: 'Calculadoras de trading gratuitas', indexDesc: 'Calculadoras de trading gratuitas e sem registo: tamanho da posição, risco-retorno e expectativa, e limites de perda diária e total das prop firms.',
    indexLead: 'Calculadoras gratuitas para os números que fazes antes e depois de uma operação. Sem registo e sem guardar nada.',
    open: 'Abrir a calculadora', inputs: 'Os teus números', results: 'Resultado', howH2: 'Como funciona', tipsH2: 'Convém saber',
    ctaTitle: 'Guarda os números, não só a resposta', ctaText: 'Uma calculadora dá uma única resposta. O Simple Trading Journal guarda cada operação, mostra como te saíste de facto face ao teu plano e acompanha os limites da prop firm. Plano gratuito, sem cartão.',
    disclaimer: 'Apenas para fins educativos. Os resultados dependem dos números que introduzes e não são aconselhamento de investimento.',
    invalid: 'Introduz números positivos em todos os campos.', direction: 'O stop loss e o take profit têm de estar em lados opostos do preço de entrada.',
    balance: 'Saldo da conta', riskPct: 'Risco por operação (%)', stopPips: 'Stop loss (pips)', pipValue: 'Valor de um pip por 1 lote',
    entry: 'Preço de entrada', stop: 'Preço do stop loss', target: 'Preço do take profit', winRate: 'Taxa de acerto (%), opcional',
    size: 'Tamanho da conta', dailyPct: 'Perda diária máxima (%)', maxPct: 'Perda total máxima (%)', lossType: 'A perda total mede-se a partir de',
    optStatic: 'Saldo inicial (estático)', optTrailing: 'Saldo máximo (trailing)', currentBalance: 'Saldo atual', dayStart: 'Saldo no início do dia', highest: 'Saldo máximo até agora',
    preset: 'Carregar um programa de prop firm', custom: 'Personalizado',
    riskAmount: 'Valor em risco', lots: 'Tamanho da posição (lotes)', actualRisk: 'Risco real com esse tamanho',
    riskDist: 'Distância de risco', rewardDist: 'Distância de ganho', ratio: 'Rácio risco-retorno', beRate: 'Taxa de acerto de equilíbrio', expectancy: 'Expectativa por operação (R)',
    dailyLimit: 'Limite de perda diária', dailyFloor: 'Piso de saldo hoje', dailyLeft: 'Margem que resta hoje', totalFloor: 'Piso de saldo (perda total)', totalLeft: 'Margem total que resta',
    within: 'Dentro dos limites', breached: 'Limite ultrapassado',
    pos: {
      title: 'Calculadora de tamanho de posição em forex',
      description: 'Calculadora gratuita de tamanho de posição em forex: introduz o saldo, a percentagem de risco, o stop loss em pips e o valor do pip para obteres o lote e o valor em risco.',
      lead: 'Calcula o lote que mantém uma operação no valor que escolheste arriscar.',
      how: ['O valor em risco é o teu saldo vezes a percentagem de risco. O lote é esse valor dividido pelo stop loss em pips vezes o valor de um pip para um lote.', 'O lote arredonda-se para baixo a 0,01, porque arredondar para cima arriscaria mais do que escolheste. O resultado mostra o risco real com o tamanho arredondado.'],
      tips: ['O valor do pip depende do par e da moeda da conta: cerca de 10 para EUR/USD numa conta em dólares, diferente nos pares com iene e nos cruzados. Confirma na tua plataforma.', 'O risco por operação é uma decisão que tomas de antemão. Muitos traders mantêm-no pequeno para que uma série de perdas não acabe com a conta.', 'Não inclui spread, comissão nem slippage: a perda real de uma operação fechada por stop pode ser um pouco maior.'],
    },
    rr: {
      title: 'Calculadora de rácio risco-retorno e expectativa',
      description: 'Calculadora gratuita de risco-retorno: introduz entrada, stop loss e take profit para obteres o rácio, a taxa de acerto de equilíbrio e, com a tua taxa de acerto, a expectativa por operação em R.',
      lead: 'Vê o que uma operação paga pelo que arrisca e com que frequência precisas de acertar para ficar em zero.',
      how: ['O risco é a distância da entrada ao stop loss e o ganho é a distância da entrada ao take profit. O rácio é o ganho dividido pelo risco: um stop de 20 pips com um alvo de 40 pips é 1:2, ou 2R.', 'A taxa de acerto de equilíbrio é 100 a dividir por (1 + rácio). Com uma taxa de acerto, a expectativa por operação em R é taxa × rácio − (1 − taxa).'],
      tips: ['A direção sai da ordem dos preços: um stop abaixo da entrada é uma compra, acima, uma venda.', 'Um rácio alto não é bom por si só: se o alvo raramente é atingido, a taxa de acerto cai. Avalia os dois juntos e com os teus próprios resultados.', 'A taxa de acerto que escreves é um pressuposto. O teu diário mostra a real com as tuas operações fechadas.'],
    },
    prop: {
      title: 'Calculadora de perda diária e drawdown de prop firm',
      description: 'Calculadora gratuita de perda de prop firm: introduz o tamanho da conta, os limites de perda diária e total e o teu saldo para veres o piso de hoje e da conta e quanta margem resta.',
      lead: 'Vê a que distância o teu saldo está do limite de perda diária e total de uma conta de prop firm.',
      how: ['O piso diário é o saldo no início do dia menos o limite diário. O piso total é o saldo inicial menos o limite total ou, num limite trailing, o saldo máximo atingido menos o limite total.', 'As percentagens são sobre o tamanho inicial da conta, como nas páginas de regras das firmas. Escolhe um programa para as preencher e confirma-as na página da própria firma.'],
      tips: ['Esta calculadora usa saldos de operações fechadas. As firmas podem contar também a perda flutuante das posições abertas, por isso deixa margem abaixo de cada limite.', 'Quando o limite diário é reposto e se é medido a partir do saldo ou do capital varia consoante a firma. Confirma no site dela.', 'Para as regras de cada firma, consulta as páginas de prop firms deste site.'],
    },
  },
  de: {
    home: 'Startseite', tools: 'Kostenlose Tools', allTools: 'Alle kostenlosen Tools',
    indexTitle: 'Kostenlose Trading-Rechner', indexDesc: 'Kostenlose Trading-Rechner ohne Anmeldung: Positionsgröße, Chance-Risiko und Erwartungswert sowie Tages- und Gesamtverlustlimits von Prop-Firms.',
    indexLead: 'Kostenlose Rechner für die Zahlen, die du vor und nach einem Trade ausrechnest. Ohne Anmeldung, nichts wird gespeichert.',
    open: 'Rechner öffnen', inputs: 'Deine Zahlen', results: 'Ergebnis', howH2: 'So funktioniert es', tipsH2: 'Gut zu wissen',
    ctaTitle: 'Behalte die Zahlen, nicht nur die Antwort', ctaText: 'Ein Rechner gibt eine einzige Antwort. Simple Trading Journal speichert jeden Trade, zeigt dir, wie du im Vergleich zu deinem Plan wirklich abschneidest, und verfolgt deine Prop-Limits. Gratis-Plan, keine Karte.',
    disclaimer: 'Nur zu Bildungszwecken. Die Ergebnisse hängen von deinen Eingaben ab und sind keine Anlageberatung.',
    invalid: 'Gib in jedes Feld eine positive Zahl ein.', direction: 'Stop-Loss und Take-Profit müssen auf entgegengesetzten Seiten des Einstiegskurses liegen.',
    balance: 'Kontostand', riskPct: 'Risiko pro Trade (%)', stopPips: 'Stop-Loss (Pips)', pipValue: 'Wert eines Pips bei 1 Lot',
    entry: 'Einstiegskurs', stop: 'Stop-Loss-Kurs', target: 'Take-Profit-Kurs', winRate: 'Trefferquote (%), optional',
    size: 'Kontogröße', dailyPct: 'Max. Tagesverlust (%)', maxPct: 'Max. Gesamtverlust (%)', lossType: 'Gesamtverlust wird gemessen ab',
    optStatic: 'Startguthaben (statisch)', optTrailing: 'Höchster Stand (trailing)', currentBalance: 'Aktueller Kontostand', dayStart: 'Kontostand zu Tagesbeginn', highest: 'Bisher höchster Stand',
    preset: 'Prop-Firm-Programm laden', custom: 'Eigene Werte',
    riskAmount: 'Risikobetrag', lots: 'Positionsgröße (Lots)', actualRisk: 'Tatsächliches Risiko bei dieser Größe',
    riskDist: 'Risikoabstand', rewardDist: 'Gewinnabstand', ratio: 'Chance-Risiko-Verhältnis', beRate: 'Break-even-Trefferquote', expectancy: 'Erwartungswert pro Trade (R)',
    dailyLimit: 'Tagesverlustlimit', dailyFloor: 'Kontostand-Untergrenze heute', dailyLeft: 'Verbleibender Spielraum heute', totalFloor: 'Kontostand-Untergrenze (Gesamtverlust)', totalLeft: 'Verbleibender Spielraum gesamt',
    within: 'Innerhalb der Limits', breached: 'Limit überschritten',
    pos: {
      title: 'Forex-Positionsgrößenrechner',
      description: 'Kostenloser Forex-Positionsgrößenrechner: Kontostand, Risikoprozent, Stop-Loss in Pips und Pip-Wert eingeben und Lotgröße und Risikobetrag erhalten.',
      lead: 'Berechne die Lotgröße, die einen Trade auf dem Betrag hält, den du riskieren wolltest.',
      how: ['Der Risikobetrag ist dein Kontostand mal Risikoprozent. Die Lotgröße ist dieser Betrag geteilt durch den Stop-Loss in Pips mal den Wert eines Pips für ein Lot.', 'Die Lotgröße wird auf 0,01 abgerundet, weil Aufrunden mehr riskieren würde als gewählt. Das Ergebnis zeigt das tatsächliche Risiko bei der gerundeten Größe.'],
      tips: ['Der Pip-Wert hängt vom Paar und der Kontowährung ab: etwa 10 bei EUR/USD auf einem USD-Konto, bei Yen-Paaren und Crosses anders. Prüfe ihn in deiner Plattform.', 'Das Risiko pro Trade ist eine Entscheidung, die du vorher triffst. Viele Trader halten es klein, damit eine Verlustserie das Konto nicht beendet.', 'Spread, Kommission und Slippage sind nicht enthalten: Der echte Verlust eines ausgestoppten Trades kann etwas größer sein.'],
    },
    rr: {
      title: 'Rechner für Chance-Risiko-Verhältnis und Erwartungswert',
      description: 'Kostenloser Chance-Risiko-Rechner: Einstieg, Stop-Loss und Take-Profit eingeben und Verhältnis, Break-even-Trefferquote und mit deiner Trefferquote den Erwartungswert pro Trade in R erhalten.',
      lead: 'Sieh, was ein Trade für sein Risiko bringt und wie oft du gewinnen musst, um bei null zu landen.',
      how: ['Das Risiko ist der Abstand vom Einstieg zum Stop-Loss, die Chance der Abstand vom Einstieg zum Take-Profit. Das Verhältnis ist Chance geteilt durch Risiko: 20 Pips Stop und 40 Pips Ziel sind 1:2, also 2R.', 'Die Break-even-Trefferquote ist 100 geteilt durch (1 + Verhältnis). Mit einer Trefferquote ist der Erwartungswert pro Trade in R gleich Trefferquote × Verhältnis − (1 − Trefferquote).'],
      tips: ['Die Richtung ergibt sich aus der Reihenfolge der Kurse: Ein Stop unter dem Einstieg ist ein Kauf, darüber ein Verkauf.', 'Ein hohes Verhältnis ist nicht automatisch gut: Wird das Ziel selten erreicht, sinkt die Trefferquote. Beurteile beides zusammen und anhand deiner eigenen Ergebnisse.', 'Eine eingetippte Trefferquote ist eine Annahme. Dein Journal zeigt die echte aus deinen geschlossenen Trades.'],
    },
    prop: {
      title: 'Prop-Firm-Rechner für Tagesverlust und Drawdown',
      description: 'Kostenloser Prop-Firm-Verlustrechner: Kontogröße, Tages- und Gesamtverlustlimit und deinen Kontostand eingeben und die Untergrenze für heute und das Konto sowie den Spielraum sehen.',
      lead: 'Sieh, wie weit dein Kontostand vom Tages- und Gesamtverlustlimit eines Prop-Firm-Kontos entfernt ist.',
      how: ['Die Tages-Untergrenze ist der Kontostand zu Tagesbeginn minus das Tageslimit. Die Gesamt-Untergrenze ist das Startguthaben minus das Gesamtlimit oder, bei einem Trailing-Limit, der höchste erreichte Stand minus das Gesamtlimit.', 'Prozentangaben beziehen sich auf die ursprüngliche Kontogröße, wie auf den Regelseiten der Firmen. Wähle ein Programm zum Ausfüllen und prüfe es auf der Seite der Firma.'],
      tips: ['Dieser Rechner nutzt Kontostände geschlossener Trades. Firmen können auch den schwebenden Verlust offener Positionen zählen — lass dir unter jedem Limit Puffer.', 'Wann das Tageslimit zurückgesetzt wird und ob es vom Kontostand oder vom Eigenkapital gemessen wird, ist je Firma verschieden. Prüfe es auf der Seite der Firma.', 'Die Regeln jeder Firma findest du auf den Prop-Firm-Seiten dieser Website.'],
    },
  },
  fr: {
    home: 'Accueil', tools: 'Outils gratuits', allTools: 'Tous les outils gratuits',
    indexTitle: 'Calculatrices de trading gratuites', indexDesc: 'Calculatrices de trading gratuites, sans inscription : taille de position, risque/rendement et espérance, limites de perte journalière et totale des prop firms.',
    indexLead: 'Des calculatrices gratuites pour les chiffres que vous faites avant et après un trade. Sans inscription, rien n\'est enregistré.',
    open: 'Ouvrir la calculatrice', inputs: 'Vos chiffres', results: 'Résultat', howH2: 'Comment ça marche', tipsH2: 'Bon à savoir',
    ctaTitle: 'Gardez les chiffres, pas seulement la réponse', ctaText: 'Une calculatrice donne une seule réponse. Simple Trading Journal conserve chaque trade, montre comment vous vous en sortez vraiment face à votre plan et suit vos limites de prop firm. Plan gratuit, sans carte.',
    disclaimer: 'À but pédagogique uniquement. Les résultats dépendent des chiffres saisis et ne constituent pas un conseil en investissement.',
    invalid: 'Saisissez des nombres positifs dans chaque champ.', direction: 'Le stop loss et le take profit doivent se trouver de part et d\'autre du prix d\'entrée.',
    balance: 'Solde du compte', riskPct: 'Risque par trade (%)', stopPips: 'Stop loss (pips)', pipValue: 'Valeur d\'un pip pour 1 lot',
    entry: 'Prix d\'entrée', stop: 'Prix du stop loss', target: 'Prix du take profit', winRate: 'Taux de réussite (%), facultatif',
    size: 'Taille du compte', dailyPct: 'Perte journalière max. (%)', maxPct: 'Perte totale max. (%)', lossType: 'La perte totale est mesurée depuis',
    optStatic: 'Solde initial (statique)', optTrailing: 'Plus haut solde (trailing)', currentBalance: 'Solde actuel', dayStart: 'Solde en début de journée', highest: 'Plus haut solde atteint',
    preset: 'Charger un programme de prop firm', custom: 'Personnalisé',
    riskAmount: 'Montant risqué', lots: 'Taille de position (lots)', actualRisk: 'Risque réel à cette taille',
    riskDist: 'Distance de risque', rewardDist: 'Distance de gain', ratio: 'Ratio risque/rendement', beRate: 'Taux de réussite d\'équilibre', expectancy: 'Espérance par trade (R)',
    dailyLimit: 'Limite de perte journalière', dailyFloor: 'Plancher de solde aujourd\'hui', dailyLeft: 'Marge restante aujourd\'hui', totalFloor: 'Plancher de solde (perte totale)', totalLeft: 'Marge totale restante',
    within: 'Dans les limites', breached: 'Limite dépassée',
    pos: {
      title: 'Calculateur de taille de position forex',
      description: 'Calculateur gratuit de taille de position forex : saisissez votre solde, le pourcentage de risque, le stop loss en pips et la valeur du pip pour obtenir le lot et le montant risqué.',
      lead: 'Calculez le lot qui maintient un trade au montant que vous avez choisi de risquer.',
      how: ['Le montant risqué est votre solde multiplié par le pourcentage de risque. Le lot est ce montant divisé par le stop loss en pips multiplié par la valeur d\'un pip pour un lot.', 'Le lot est arrondi à l\'inférieur à 0,01, car arrondir au supérieur ferait risquer plus que prévu. Le résultat indique le risque réel à la taille arrondie.'],
      tips: ['La valeur du pip dépend de la paire et de la devise du compte : environ 10 pour l\'EUR/USD sur un compte en dollars, différente pour les paires en yen et les croisées. Vérifiez-la dans votre plateforme.', 'Le risque par trade est un choix fait à l\'avance. Beaucoup de traders le gardent faible pour qu\'une série de pertes n\'achève pas le compte.', 'Le spread, la commission et le slippage ne sont pas inclus : la perte réelle d\'un trade stoppé peut être un peu plus grande.'],
    },
    rr: {
      title: 'Calculateur de ratio risque/rendement et d\'espérance',
      description: 'Calculateur gratuit de risque/rendement : saisissez l\'entrée, le stop loss et le take profit pour obtenir le ratio, le taux de réussite d\'équilibre et, avec votre taux de réussite, l\'espérance par trade en R.',
      lead: 'Voyez ce qu\'un trade rapporte pour ce qu\'il risque et à quelle fréquence il faut gagner pour être à l\'équilibre.',
      how: ['Le risque est la distance de l\'entrée au stop loss et le gain, la distance de l\'entrée au take profit. Le ratio est le gain divisé par le risque : un stop à 20 pips avec un objectif à 40 pips donne 1:2, soit 2R.', 'Le taux de réussite d\'équilibre vaut 100 divisé par (1 + ratio). Avec un taux de réussite, l\'espérance par trade en R vaut taux × ratio − (1 − taux).'],
      tips: ['La direction se déduit de l\'ordre des prix : un stop sous l\'entrée est un achat, au-dessus une vente.', 'Un ratio élevé n\'est pas bon en soi : si l\'objectif est rarement atteint, le taux de réussite baisse. Jugez les deux ensemble, sur vos propres résultats.', 'Le taux de réussite saisi est une hypothèse. Votre journal montre le vrai, à partir de vos trades clôturés.'],
    },
    prop: {
      title: 'Calculateur de perte journalière et de drawdown de prop firm',
      description: 'Calculateur gratuit de perte de prop firm : saisissez la taille du compte, les limites de perte journalière et totale et votre solde pour voir le plancher du jour et du compte et la marge restante.',
      lead: 'Voyez à quelle distance votre solde se trouve de la limite de perte journalière et totale d\'un compte de prop firm.',
      how: ['Le plancher journalier est le solde en début de journée moins la limite journalière. Le plancher total est le solde initial moins la limite totale ou, pour une limite trailing, le plus haut solde atteint moins la limite totale.', 'Les pourcentages portent sur la taille initiale du compte, comme sur les pages de règles des firmes. Choisissez un programme pour les remplir, puis vérifiez-les sur la page de la firme.'],
      tips: ['Ce calculateur utilise les soldes des trades clôturés. Les firmes peuvent aussi compter la perte latente des positions ouvertes : gardez une marge sous chaque limite.', 'Le moment de la réinitialisation de la limite journalière et sa mesure depuis le solde ou le capital varient selon la firme. Vérifiez sur son site.', 'Pour les règles de chaque firme, consultez les pages de prop firms de ce site.'],
    },
  },
};

const SUFFIX = ' — Simple Trading Journal';

/** Arama sonuçlarında görünen başlık ve açıklama; adres araç değilse null. */
export function toolMeta(path: string, lang: ArticleLang): { title: string; description: string } | null {
  const t = TOOL_TEXT[lang];
  const [, section, slug] = path.split('/');
  if (section !== 'tools') return null;
  if (!slug) return { title: t.indexTitle + SUFFIX, description: t.indexDesc };
  const tool = findTool(slug);
  return tool ? { title: t[tool.key].title + SUFFIX, description: t[tool.key].description } : null;
}

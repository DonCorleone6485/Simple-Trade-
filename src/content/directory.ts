/**
 * Prop firma ve broker sayfaları (/prop-firms/…, /brokers/…).
 *
 * Neden var: "FTMO kuralları", "Pepperstone trading journal" gibi aramalarla
 * gelen kişi tam hedef kullanıcı — o firmada ya da broker'da işlem yapıyor.
 * Her firma/broker için bir sayfa; hepsi aynı şablon (DirectoryPage), veri
 * burada. SEO.md'de "Programatik sayfalar".
 *
 * KURALLAR YALNIZ FİRMANIN KENDİ SAYFASINDAN. Her programın `source`'u o
 * sayfa, `checked` son kontrol tarihi. Yanlış bir sayı birine hesabını
 * kaybettirebilir: emin olunmayan alan boş bırakılır (null), tahmin yazılmaz.
 * Kurallar değişince yalnız buradaki satır değişir, dokuz dildeki sayfa
 * kendiliğinden güncellenir. Kontrol düzeni: SEO.md "Otomatik kontrol görevi".
 *
 * Logo yok, ortaklık ima edilmez; her sayfada "bağlantımız yok" notu var.
 */
import type { ArticleLang } from './articles';

type L9 = Record<ArticleLang, string>;
type L9List = Record<ArticleLang, string[]>;

export type Platform = 'MT4' | 'MT5' | 'cTrader' | 'TradeLocker' | 'Match-Trader' | 'DXtrade' | 'TradingView';

/**
 * Toplam kaybın nereden ölçüldüğü.
 * static      — başlangıç bakiyesinden, hiç kıpırdamaz.
 * trailing    — ulaşılan en yüksek bakiyeden (yüksek su işareti).
 * eodTrailing — gün sonu bakiyelerinin en yükseğinden; yalnız yükselir.
 * smart       — Instant Funding'in "Smart Drawdown"ı (notlarda anlatılıyor).
 * null        — firmanın sayfası söylemiyor; yazılmaz.
 */
export type MaxType = 'static' | 'trailing' | 'eodTrailing' | 'smart' | null;

export interface PropProgram {
  /** Firmanın kullandığı ad; çevrilmez. */
  name: string;
  /** Aşama hedefleri: ['10%', '5%']. Boş dizi: hedef yok. */
  targets: string[];
  /** Günlük kayıp sınırı; null: yok. Satın alırken seçilen seçeneğe göre değişiyorsa '3% / 5%'. */
  daily: string | null;
  /** Toplam kayıp sınırı. */
  max: string;
  maxType: MaxType;
  /** Asgari işlem günü; null: yok; 'unknown': kaynak söylemiyor. `profitable`: kârlı gün sayılıyor. */
  minDays: { n: number; profitable?: boolean } | null | 'unknown';
  /** Bu programın rakamlarının alındığı resmî sayfa. */
  source: string;
}

export interface PropFirm {
  slug: string;
  name: string;
  /** Son kontrol (YYYY-AA-GG). */
  checked: string;
  platforms: Platform[];
  programs: PropProgram[];
  /** Tabloya sığmayan, bilinmesi gereken ayrıntılar — dokuz dilde. */
  notes: L9List;
}

export interface Broker {
  slug: string;
  name: string;
  checked: string;
  platforms: Platform[];
  /** Platform listesinin alındığı resmî sayfa. */
  source: string;
}

export const PROP_FIRMS: PropFirm[] = [
  {
    slug: 'ftmo',
    name: 'FTMO',
    checked: '2026-09-29',
    platforms: ['MT4', 'MT5', 'cTrader', 'TradingView'],
    programs: [
      { name: 'FTMO Challenge 2-Step', targets: ['10%', '5%'], daily: '5%', max: '10%', maxType: 'static', minDays: { n: 4 }, source: 'https://ftmo.com/en/trading-objectives/' },
      { name: 'FTMO Challenge 1-Step', targets: ['10%'], daily: '3%', max: '10%', maxType: 'eodTrailing', minDays: null, source: 'https://ftmo.com/en/trading-objectives/' },
    ],
    notes: {
      en: [
        'Both limits are checked against equity (balance plus the floating result of open positions), not only closed trades.',
        'The daily limit is reset at 00:00 CE(S)T: it is the balance at midnight minus the daily amount (5% or 3% of the initial capital).',
        '1-Step: the maximum loss trails the highest midnight balance and can only move up. It resets when a reward is withdrawn.',
        '1-Step: the Best Day Rule — your most profitable day may be at most 50% of the profit of all positive days. Going over is not a breach, but you have to keep trading until it drops to 50%.',
        'A trading day counts on 2-Step only if at least one position is opened that day.',
      ],
      tr: [
        'İki sınır da yalnızca kapanan işlemlere göre değil, varlığa (equity: bakiye + açık pozisyonların anlık sonucu) göre kontrol edilir.',
        'Günlük sınır 00:00 CE(S)T\'de yenilenir: gece yarısındaki bakiyeden günlük tutar (başlangıç sermayesinin %5\'i ya da %3\'ü) düşülür.',
        '1-Step: maksimum kayıp gece yarısı bakiyelerinin en yükseğini takip eder ve yalnız yukarı gider. Ödül çekildiğinde sıfırlanır.',
        '1-Step: En İyi Gün Kuralı — en kârlı günün, tüm kârlı günlerin toplam kârının en fazla %50\'si olabilir. Aşmak ihlal sayılmaz ama %50\'ye inene kadar işlem yapmaya devam etmen gerekir.',
        '2-Step\'te bir gün, o gün en az bir pozisyon açıldıysa işlem günü sayılır.',
      ],
      fa: [
        'هر دو حد بر اساس اکوییتی (موجودی به‌علاوه نتیجه لحظه‌ای پوزیشن‌های باز) بررسی می‌شوند، نه فقط معاملات بسته‌شده.',
        'حد روزانه ساعت 00:00 به وقت CE(S)T تازه می‌شود: موجودی نیمه‌شب منهای مبلغ روزانه (۵٪ یا ۳٪ سرمایه اولیه).',
        '1-Step: حداکثر ضرر بالاترین موجودی نیمه‌شب را دنبال می‌کند و فقط بالا می‌رود. با برداشت پاداش از نو تنظیم می‌شود.',
        '1-Step: قانون بهترین روز — سودآورترین روزت حداکثر می‌تواند ۵۰٪ سود همه روزهای مثبت باشد. عبور از آن تخلف نیست، اما باید آن‌قدر معامله کنی تا به ۵۰٪ برسد.',
        'در 2-Step روزی روز معاملاتی حساب می‌شود که دست‌کم یک پوزیشن در آن باز شده باشد.',
      ],
      ar: [
        'يُقاس الحدّان على أساس حقوق الملكية (الرصيد مع النتيجة العائمة للصفقات المفتوحة)، لا على الصفقات المغلقة وحدها.',
        'يُعاد حساب الحد اليومي عند 00:00 بتوقيت CE(S)T: رصيد منتصف الليل ناقص المبلغ اليومي (5٪ أو 3٪ من رأس المال الابتدائي).',
        '1-Step: الحد الأقصى للخسارة يتبع أعلى رصيد عند منتصف الليل ولا يتحرك إلا صعوداً، ويُعاد ضبطه عند سحب المكافأة.',
        '1-Step: قاعدة أفضل يوم — لا يجوز أن يتجاوز ربح أفضل أيامك 50٪ من ربح كل الأيام الرابحة. تجاوزها ليس مخالفة، لكن عليك مواصلة التداول حتى تنزل النسبة إلى 50٪.',
        'في 2-Step يُحتسب اليوم يوم تداول إذا فُتحت فيه صفقة واحدة على الأقل.',
      ],
      ru: [
        'Оба лимита считаются по эквити (баланс плюс плавающий результат открытых позиций), а не только по закрытым сделкам.',
        'Дневной лимит пересчитывается в 00:00 по CE(S)T: баланс на полночь минус дневная сумма (5% или 3% от начального капитала).',
        '1-Step: максимальный убыток следует за самым высоким балансом на полночь и может только расти. Сбрасывается при выводе вознаграждения.',
        '1-Step: правило лучшего дня — самый прибыльный день может давать не больше 50% прибыли всех прибыльных дней. Превышение не считается нарушением, но торговать придётся, пока доля не опустится до 50%.',
        'В 2-Step день считается торговым, если в этот день открыта хотя бы одна позиция.',
      ],
      es: [
        'Ambos límites se comprueban sobre el equity (saldo más el resultado flotante de las posiciones abiertas), no solo sobre operaciones cerradas.',
        'El límite diario se recalcula a las 00:00 CE(S)T: saldo a medianoche menos el importe diario (5% o 3% del capital inicial).',
        '1-Step: la pérdida máxima sigue el saldo más alto a medianoche y solo puede subir. Se reinicia al retirar una recompensa.',
        '1-Step: la regla del mejor día — tu día más rentable no puede superar el 50% del beneficio de todos los días positivos. Pasarse no es una infracción, pero debes seguir operando hasta bajar al 50%.',
        'En 2-Step un día cuenta como día de trading si se abre al menos una posición.',
      ],
      pt: [
        'Os dois limites são verificados sobre o equity (saldo mais o resultado flutuante das posições abertas), não só sobre operações fechadas.',
        'O limite diário é recalculado às 00:00 CE(S)T: saldo à meia-noite menos o valor diário (5% ou 3% do capital inicial).',
        '1-Step: a perda máxima acompanha o saldo mais alto à meia-noite e só pode subir. É reposta quando se levanta uma recompensa.',
        '1-Step: regra do melhor dia — o teu dia mais lucrativo pode representar no máximo 50% do lucro de todos os dias positivos. Ultrapassar não é infração, mas tens de continuar a negociar até descer aos 50%.',
        'No 2-Step um dia conta como dia de negociação se for aberta pelo menos uma posição.',
      ],
      de: [
        'Beide Grenzen werden am Equity gemessen (Kontostand plus schwebendes Ergebnis offener Positionen), nicht nur an geschlossenen Trades.',
        'Das Tageslimit wird um 00:00 CE(S)T neu berechnet: Kontostand um Mitternacht minus Tagesbetrag (5 % bzw. 3 % des Startkapitals).',
        '1-Step: Der Maximalverlust folgt dem höchsten Mitternachts-Kontostand und steigt nur. Er wird bei Auszahlung einer Belohnung zurückgesetzt.',
        '1-Step: Best-Day-Regel — dein profitabelster Tag darf höchstens 50 % des Gewinns aller positiven Tage ausmachen. Überschreiten ist kein Verstoß, aber du musst weiter handeln, bis der Anteil bei 50 % liegt.',
        'Bei 2-Step zählt ein Tag als Handelstag, wenn an ihm mindestens eine Position eröffnet wird.',
      ],
      fr: [
        'Les deux limites sont mesurées sur l\'equity (solde plus résultat latent des positions ouvertes), pas seulement sur les trades clôturés.',
        'La limite journalière est recalculée à 00:00 CE(S)T : solde à minuit moins le montant journalier (5 % ou 3 % du capital initial).',
        '1-Step : la perte maximale suit le plus haut solde de minuit et ne peut que monter. Elle est réinitialisée au retrait d\'une récompense.',
        '1-Step : règle du meilleur jour — votre jour le plus rentable ne peut dépasser 50 % du profit de tous les jours positifs. Ce n\'est pas une violation, mais il faut continuer à trader jusqu\'à revenir à 50 %.',
        'En 2-Step, un jour compte comme jour de trading si au moins une position y est ouverte.',
      ],
    },
  },
  {
    slug: 'the5ers',
    name: 'The5ers',
    checked: '2026-09-29',
    platforms: ['MT5'],
    programs: [
      { name: 'High Stakes (2-Step)', targets: ['10%', '5%'], daily: '5%', max: '10%', maxType: null, minDays: { n: 3, profitable: true }, source: 'https://the5ers.com/high-stakes/' },
      { name: 'Hyper Growth (1-Step)', targets: ['10%'], daily: '3%', max: '6%', maxType: null, minDays: { n: 3, profitable: true }, source: 'https://the5ers.com/hyper-growth/' },
    ],
    notes: {
      en: [
        'A profitable day is one where closed positions made at least 0.5% of the initial balance.',
        'On Hyper Growth the total loss limit is called the "stop out level".',
        'There is no time limit, but an account with no activity for 30 days in a row expires.',
        'The5ers also sells other plans (including promotional ones) with different limits. Enter the figures of the plan you actually bought.',
      ],
      tr: [
        'Kârlı gün: kapanan pozisyonların başlangıç bakiyesinin en az %0,5\'i kadar kâr ettiği gün.',
        'Hyper Growth\'ta toplam kayıp sınırının adı "stop out level".',
        'Süre sınırı yok, ama 30 gün üst üste hiç işlem yapılmayan hesap sona erer.',
        'The5ers\'in farklı sınırlara sahip başka planları da var (kampanyalı olanlar dahil). Gerçekten satın aldığın planın rakamlarını gir.',
      ],
      fa: [
        'روز سودده روزی است که پوزیشن‌های بسته‌شده دست‌کم ۰٫۵٪ موجودی اولیه سود داده باشند.',
        'در Hyper Growth حد ضرر کل «stop out level» نام دارد.',
        'محدودیت زمانی ندارد، اما حسابی که ۳۰ روز پشت‌سرهم فعالیتی نداشته باشد منقضی می‌شود.',
        'The5ers طرح‌های دیگری هم (از جمله تخفیفی) با حدود متفاوت دارد. ارقام همان طرحی را وارد کن که واقعاً خریده‌ای.',
      ],
      ar: [
        'اليوم الرابح هو اليوم الذي تحقق فيه الصفقات المغلقة ربحاً لا يقل عن 0.5٪ من الرصيد الابتدائي.',
        'في Hyper Growth يُسمّى حد الخسارة الكلية «stop out level».',
        'لا يوجد حد زمني، لكن الحساب الذي لا يشهد أي نشاط لمدة 30 يوماً متتالية تنتهي صلاحيته.',
        'لدى The5ers خطط أخرى (منها عروض ترويجية) بحدود مختلفة. أدخل أرقام الخطة التي اشتريتها فعلاً.',
      ],
      ru: [
        'Прибыльный день — день, когда закрытые позиции принесли не меньше 0,5% от начального баланса.',
        'В Hyper Growth лимит общего убытка называется «stop out level».',
        'Ограничения по времени нет, но счёт без активности 30 дней подряд закрывается.',
        'У The5ers есть и другие планы (в том числе акционные) с другими лимитами. Вводите цифры того плана, который вы купили.',
      ],
      es: [
        'Un día rentable es aquel en que las posiciones cerradas ganan al menos el 0,5% del saldo inicial.',
        'En Hyper Growth el límite de pérdida total se llama "stop out level".',
        'No hay límite de tiempo, pero una cuenta sin actividad durante 30 días seguidos caduca.',
        'The5ers vende también otros planes (incluidos promocionales) con límites distintos. Introduce las cifras del plan que compraste.',
      ],
      pt: [
        'Um dia lucrativo é aquele em que as posições fechadas ganham pelo menos 0,5% do saldo inicial.',
        'No Hyper Growth o limite de perda total chama-se "stop out level".',
        'Não há limite de tempo, mas uma conta sem atividade durante 30 dias seguidos expira.',
        'A The5ers vende também outros planos (incluindo promocionais) com limites diferentes. Introduz os números do plano que compraste.',
      ],
      de: [
        'Ein profitabler Tag ist ein Tag, an dem geschlossene Positionen mindestens 0,5 % des Startguthabens verdient haben.',
        'Bei Hyper Growth heißt die Gesamtverlustgrenze „stop out level“.',
        'Es gibt kein Zeitlimit, aber ein Konto ohne Aktivität an 30 aufeinanderfolgenden Tagen verfällt.',
        'The5ers verkauft auch andere Pläne (auch Aktionspläne) mit anderen Grenzen. Trage die Zahlen des Plans ein, den du tatsächlich gekauft hast.',
      ],
      fr: [
        'Un jour rentable est un jour où les positions clôturées ont rapporté au moins 0,5 % du solde initial.',
        'Sur Hyper Growth, la limite de perte totale s\'appelle « stop out level ».',
        'Pas de limite de temps, mais un compte sans activité pendant 30 jours consécutifs expire.',
        'The5ers vend aussi d\'autres plans (y compris promotionnels) avec des limites différentes. Saisissez les chiffres du plan que vous avez réellement acheté.',
      ],
    },
  },
  {
    slug: 'alpha-capital',
    name: 'Alpha Capital',
    checked: '2026-09-29',
    platforms: ['MT5', 'cTrader', 'TradeLocker'],
    programs: [
      { name: 'Alpha Pro 8%', targets: ['8%', '5%'], daily: '4%', max: '8%', maxType: 'static', minDays: { n: 3 }, source: 'https://help.alphacapitalgroup.uk/en/articles/8420429-alpha-pro-8-10' },
      { name: 'Alpha Pro 10%', targets: ['10%', '5%'], daily: '5%', max: '10%', maxType: 'static', minDays: { n: 3 }, source: 'https://help.alphacapitalgroup.uk/en/articles/8420429-alpha-pro-8-10' },
      { name: 'Alpha One 6%', targets: ['6%'], daily: '3%', max: '4%', maxType: 'trailing', minDays: { n: 1 }, source: 'https://help.alphacapitalgroup.uk/en/articles/10097421-alpha-one-6-10-12' },
      { name: 'Alpha One 10%', targets: ['10%'], daily: '4%', max: '6%', maxType: 'trailing', minDays: { n: 1 }, source: 'https://help.alphacapitalgroup.uk/en/articles/10097421-alpha-one-6-10-12' },
      { name: 'Alpha One 12%', targets: ['12%'], daily: '5%', max: '8%', maxType: 'trailing', minDays: { n: 1 }, source: 'https://help.alphacapitalgroup.uk/en/articles/10097421-alpha-one-6-10-12' },
    ],
    notes: {
      en: [
        'Alpha Pro: the daily limit is balance-based; minimum trading days apply to each phase.',
        'Alpha One: the daily limit is calculated from the higher of the end-of-day balance or equity. On One 6% it is 3% during the evaluation and 4% on the qualified account.',
        'Alpha One: the maximum loss trails the highest balance reached. Once profits equal the plan\'s drawdown percentage, it stops at the initial balance.',
        'Every plan has a maximum lot size per account size, and new trades or closes on the affected instrument are not allowed from 5 minutes before to 5 minutes after major news.',
      ],
      tr: [
        'Alpha Pro: günlük sınır bakiyeye göre hesaplanır; asgari işlem günü her aşama için ayrı geçerlidir.',
        'Alpha One: günlük sınır, gün sonu bakiyesi ile varlığın (equity) büyük olanından hesaplanır. One 6%\'da değerlendirme sırasında %3, onaylı hesapta %4\'tür.',
        'Alpha One: maksimum kayıp ulaşılan en yüksek bakiyeyi takip eder. Kâr, planın düşüş yüzdesine eşit olunca başlangıç bakiyesinde durur.',
        'Her planda hesap büyüklüğüne göre azami lot sınırı var; önemli haberden 5 dakika önce ile 5 dakika sonra arasında ilgili enstrümanda yeni işlem açılamaz ve kapatılamaz.',
      ],
      fa: [
        'Alpha Pro: حد روزانه بر اساس موجودی (balance) است؛ حداقل روز معاملاتی برای هر مرحله جداگانه اعمال می‌شود.',
        'Alpha One: حد روزانه از بزرگ‌ترِ موجودی یا اکوییتیِ پایان روز حساب می‌شود. در One 6% هنگام ارزیابی ۳٪ و در حساب تأییدشده ۴٪ است.',
        'Alpha One: حداکثر ضرر بالاترین موجودی به‌دست‌آمده را دنبال می‌کند. وقتی سود به درصد افت طرح برسد، روی موجودی اولیه ثابت می‌ماند.',
        'هر طرح بر اساس اندازه حساب سقف حجم لات دارد و از ۵ دقیقه پیش تا ۵ دقیقه پس از خبرهای مهم، باز یا بسته کردن معامله روی نماد مربوط مجاز نیست.',
      ],
      ar: [
        'Alpha Pro: الحد اليومي محسوب على الرصيد، والحد الأدنى لأيام التداول يسري على كل مرحلة.',
        'Alpha One: يُحسب الحد اليومي من الأعلى بين رصيد نهاية اليوم وحقوق الملكية. في One 6% يكون 3٪ أثناء التقييم و4٪ في الحساب المؤهل.',
        'Alpha One: الحد الأقصى للخسارة يتبع أعلى رصيد تم بلوغه، ويثبت عند الرصيد الابتدائي حين تساوي الأرباح نسبة التراجع في الخطة.',
        'لكل خطة حد أقصى لحجم اللوت بحسب حجم الحساب، ولا يُسمح بفتح أو إغلاق صفقات على الأداة المعنية من 5 دقائق قبل الأخبار المهمة حتى 5 دقائق بعدها.',
      ],
      ru: [
        'Alpha Pro: дневной лимит считается от баланса; минимум торговых дней действует на каждом этапе.',
        'Alpha One: дневной лимит считается от большего из баланса и эквити на конец дня. На One 6% он 3% во время оценки и 4% на квалифицированном счёте.',
        'Alpha One: максимальный убыток следует за наивысшим достигнутым балансом. Когда прибыль достигает процента просадки плана, он останавливается на начальном балансе.',
        'В каждом плане есть максимальный лот в зависимости от размера счёта; открывать и закрывать сделки по затронутому инструменту нельзя за 5 минут до и 5 минут после важных новостей.',
      ],
      es: [
        'Alpha Pro: el límite diario se calcula sobre el saldo; los días mínimos de trading se aplican a cada fase.',
        'Alpha One: el límite diario se calcula sobre el mayor entre el saldo y el equity al cierre del día. En One 6% es 3% durante la evaluación y 4% en la cuenta cualificada.',
        'Alpha One: la pérdida máxima sigue el saldo más alto alcanzado. Cuando las ganancias igualan el porcentaje de drawdown del plan, se queda en el saldo inicial.',
        'Cada plan tiene un lote máximo según el tamaño de la cuenta, y no se pueden abrir ni cerrar operaciones en el instrumento afectado desde 5 minutos antes hasta 5 minutos después de noticias importantes.',
      ],
      pt: [
        'Alpha Pro: o limite diário é calculado sobre o saldo; os dias mínimos de negociação aplicam-se a cada fase.',
        'Alpha One: o limite diário é calculado sobre o maior entre o saldo e o equity no fim do dia. No One 6% é 3% durante a avaliação e 4% na conta qualificada.',
        'Alpha One: a perda máxima acompanha o saldo mais alto atingido. Quando os lucros igualam a percentagem de drawdown do plano, fica no saldo inicial.',
        'Cada plano tem um lote máximo por tamanho de conta, e não se pode abrir nem fechar operações no instrumento afetado desde 5 minutos antes até 5 minutos depois de notícias importantes.',
      ],
      de: [
        'Alpha Pro: Das Tageslimit bezieht sich auf den Kontostand; die Mindesthandelstage gelten für jede Phase.',
        'Alpha One: Das Tageslimit wird vom höheren Wert aus Kontostand und Equity zum Tagesende berechnet. Bei One 6 % beträgt es 3 % in der Evaluation und 4 % auf dem qualifizierten Konto.',
        'Alpha One: Der Maximalverlust folgt dem höchsten erreichten Kontostand. Sobald die Gewinne dem Drawdown-Prozentsatz des Plans entsprechen, bleibt er beim Startguthaben stehen.',
        'Jeder Plan hat eine maximale Lotgröße je Kontogröße, und von 5 Minuten vor bis 5 Minuten nach wichtigen News dürfen im betroffenen Instrument keine Trades eröffnet oder geschlossen werden.',
      ],
      fr: [
        'Alpha Pro : la limite journalière est calculée sur le solde ; le nombre minimum de jours s\'applique à chaque phase.',
        'Alpha One : la limite journalière se calcule sur le plus élevé du solde ou de l\'equity en fin de journée. Sur One 6 %, elle est de 3 % pendant l\'évaluation et de 4 % sur le compte qualifié.',
        'Alpha One : la perte maximale suit le plus haut solde atteint. Quand les gains égalent le pourcentage de drawdown du plan, elle se fixe au solde initial.',
        'Chaque plan a une taille de lot maximale selon la taille du compte, et il est interdit d\'ouvrir ou de clôturer sur l\'instrument concerné de 5 minutes avant à 5 minutes après une annonce majeure.',
      ],
    },
  },
  {
    slug: 'instant-funding',
    name: 'Instant Funding',
    checked: '2026-09-29',
    platforms: ['MT5', 'cTrader', 'Match-Trader'],
    programs: [
      { name: 'Instant Funding', targets: [], daily: null, max: '10%', maxType: 'smart', minDays: null, source: 'https://instantfunding.com/trading-rules/' },
      { name: 'One-Phase', targets: ['10%'], daily: '3%', max: '8%', maxType: 'static', minDays: { n: 3 }, source: 'https://instantfunding.com/trading-rules/' },
      { name: 'Two-Phase', targets: ['8%', '5%'], daily: '5%', max: '10%', maxType: 'static', minDays: { n: 3 }, source: 'https://instantfunding.com/trading-rules/' },
    ],
    notes: {
      en: [
        'Instant Funding accounts have no evaluation, no profit target and no daily limit. The Smart Drawdown starts at 10% of the starting balance; once you are 5% in profit it becomes 5% below the starting balance and stays there (on $10,000: $9,000, then $9,500).',
        'To request a payout on an Instant Funding account you first need to reach 5% profit.',
        'A trading day counts only when you open a new trade; holding positions from earlier days does not count.',
        'Instant Funding sells more programs (Micro, Crypto, IF1 and others) with different limits. Check your own program on their rules page.',
      ],
      tr: [
        'Instant Funding hesaplarında değerlendirme, kâr hedefi ve günlük sınır yok. Smart Drawdown başlangıç bakiyesinin %10\'u ile başlar; %5 kâra ulaşınca başlangıç bakiyesinin %5 altına sabitlenir ve orada kalır (10.000 $\'da: önce 9.000 $, sonra 9.500 $).',
        'Instant Funding hesabında ödeme isteyebilmek için önce %5 kâra ulaşman gerekir.',
        'Bir gün, yalnızca yeni işlem açtığında işlem günü sayılır; önceki günlerden taşınan pozisyonlar saymaz.',
        'Instant Funding\'in farklı sınırlara sahip başka programları da var (Micro, Crypto, IF1 ve diğerleri). Kendi programını kurallar sayfalarından kontrol et.',
      ],
      fa: [
        'حساب‌های Instant Funding ارزیابی، هدف سود و حد روزانه ندارند. Smart Drawdown از ۱۰٪ موجودی اولیه شروع می‌شود؛ وقتی ۵٪ سود کنی، روی ۵٪ زیر موجودی اولیه ثابت می‌شود و همان‌جا می‌ماند (در ۱۰٬۰۰۰ دلار: اول ۹٬۰۰۰ و بعد ۹٬۵۰۰ دلار).',
        'برای درخواست برداشت در حساب Instant Funding ابتدا باید به ۵٪ سود برسی.',
        'روزی روز معاملاتی حساب می‌شود که معامله جدیدی باز کنی؛ نگه‌داشتن پوزیشن‌های روزهای قبل حساب نمی‌شود.',
        'Instant Funding برنامه‌های دیگری هم با حدود متفاوت دارد (Micro، Crypto، IF1 و غیره). برنامه خودت را در صفحه قوانینشان بررسی کن.',
      ],
      ar: [
        'حسابات Instant Funding بلا تقييم ولا هدف ربح ولا حد يومي. يبدأ Smart Drawdown عند 10٪ من الرصيد الابتدائي، وحين تبلغ ربح 5٪ يثبت عند 5٪ تحت الرصيد الابتدائي ويبقى هناك (على 10,000$: أولاً 9,000$ ثم 9,500$).',
        'لطلب سحب الأرباح من حساب Instant Funding عليك أولاً بلوغ ربح 5٪.',
        'يُحتسب اليوم يوم تداول فقط عند فتح صفقة جديدة؛ الاحتفاظ بصفقات من أيام سابقة لا يُحتسب.',
        'لدى Instant Funding برامج أخرى بحدود مختلفة (Micro وCrypto وIF1 وغيرها). تحقق من برنامجك في صفحة القواعد لديهم.',
      ],
      ru: [
        'На счетах Instant Funding нет оценки, цели по прибыли и дневного лимита. Smart Drawdown начинается с 10% от начального баланса; при прибыли 5% он фиксируется на 5% ниже начального баланса и остаётся там (на $10 000: сначала $9 000, затем $9 500).',
        'Чтобы запросить выплату на счёте Instant Funding, сначала нужно выйти в прибыль 5%.',
        'День считается торговым, только если вы открыли новую сделку; удержание позиций с прошлых дней не считается.',
        'У Instant Funding есть и другие программы с иными лимитами (Micro, Crypto, IF1 и др.). Проверьте свою программу на их странице правил.',
      ],
      es: [
        'Las cuentas Instant Funding no tienen evaluación, objetivo de beneficio ni límite diario. El Smart Drawdown empieza en el 10% del saldo inicial; al llegar a un 5% de beneficio pasa a quedar un 5% por debajo del saldo inicial y ahí se queda (con $10.000: primero $9.000, luego $9.500).',
        'Para pedir un retiro en una cuenta Instant Funding primero debes llegar a un 5% de beneficio.',
        'Un día cuenta como día de trading solo si abres una operación nueva; mantener posiciones de días anteriores no cuenta.',
        'Instant Funding vende más programas (Micro, Crypto, IF1 y otros) con límites distintos. Revisa el tuyo en su página de reglas.',
      ],
      pt: [
        'As contas Instant Funding não têm avaliação, objetivo de lucro nem limite diário. O Smart Drawdown começa em 10% do saldo inicial; ao chegares a 5% de lucro passa a ficar 5% abaixo do saldo inicial e aí se mantém (com $10.000: primeiro $9.000, depois $9.500).',
        'Para pedir um levantamento numa conta Instant Funding tens primeiro de chegar a 5% de lucro.',
        'Um dia só conta como dia de negociação se abrires uma operação nova; manter posições de dias anteriores não conta.',
        'A Instant Funding vende mais programas (Micro, Crypto, IF1 e outros) com limites diferentes. Confirma o teu na página de regras deles.',
      ],
      de: [
        'Instant-Funding-Konten haben keine Evaluation, kein Gewinnziel und kein Tageslimit. Der Smart Drawdown startet bei 10 % des Startguthabens; ab 5 % Gewinn liegt er fest 5 % unter dem Startguthaben (bei 10.000 $: erst 9.000 $, dann 9.500 $).',
        'Für eine Auszahlung auf einem Instant-Funding-Konto musst du zuerst 5 % Gewinn erreichen.',
        'Ein Tag zählt nur als Handelstag, wenn du einen neuen Trade eröffnest; das Halten von Positionen aus früheren Tagen zählt nicht.',
        'Instant Funding verkauft weitere Programme (Micro, Crypto, IF1 u. a.) mit anderen Grenzen. Prüfe dein Programm auf ihrer Regelseite.',
      ],
      fr: [
        'Les comptes Instant Funding n\'ont ni évaluation, ni objectif de gain, ni limite journalière. Le Smart Drawdown démarre à 10 % du solde initial ; une fois 5 % de gain atteints, il se fixe à 5 % sous le solde initial et y reste (sur 10 000 $ : d\'abord 9 000 $, puis 9 500 $).',
        'Pour demander un retrait sur un compte Instant Funding, il faut d\'abord atteindre 5 % de gain.',
        'Un jour ne compte comme jour de trading que si vous ouvrez un nouveau trade ; garder des positions des jours précédents ne compte pas.',
        'Instant Funding vend d\'autres programmes (Micro, Crypto, IF1…) avec des limites différentes. Vérifiez le vôtre sur leur page de règles.',
      ],
    },
  },
  {
    slug: 'fundingpips',
    name: 'FundingPips',
    checked: '2026-09-29',
    platforms: ['MT5', 'cTrader', 'Match-Trader'],
    programs: [
      { name: '2 Step Standard', targets: ['8%', '5%'], daily: '3% / 5%', max: '10%', maxType: null, minDays: null, source: 'https://fundingpips.com/trading-objectives' },
      { name: '2 Step Flex', targets: ['10%', '8%'], daily: '4%', max: '12%', maxType: null, minDays: { n: 1 }, source: 'https://fundingpips.com/trading-objectives' },
      { name: '2 Step Pro', targets: ['6%', '6%'], daily: '3%', max: '6%', maxType: null, minDays: null, source: 'https://fundingpips.com/trading-objectives' },
      { name: '1 Step Flex', targets: ['12%'], daily: '2% / 3%', max: '12%', maxType: null, minDays: 'unknown', source: 'https://fundingpips.com/trading-objectives' },
    ],
    notes: {
      en: [
        'Where two daily limits are shown (2 Step Standard: 3% or 5%, 1 Step Flex: 2% or 3%), it depends on the option you chose at checkout.',
        'Minimum trading days are per phase; a day counts with a trade of at least 0.01 lots. 2 Step Standard starts "from 0 days" depending on the option.',
        'Close at least one trade every 30 days, or the account counts as inactive.',
        'On the Master account you may not open or close positions 5 minutes before or after high-impact news on the affected currencies, and holding overnight or over the weekend needs the Swing add-on.',
        'The rules apply to accounts bought after the latest update; existing accounts keep their original rules.',
      ],
      tr: [
        'İki günlük sınır gösterilen yerlerde (2 Step Standard: %3 ya da %5, 1 Step Flex: %2 ya da %3) hangisinin geçerli olduğu satın alırken seçtiğin seçeneğe bağlıdır.',
        'Asgari işlem günü her aşama için ayrıdır; bir gün en az 0,01 lotluk bir işlemle sayılır. 2 Step Standard seçeneğe göre "0 günden" başlar.',
        'En az 30 günde bir işlem kapatmalısın; yoksa hesap etkin değil sayılır.',
        'Master hesapta ilgili para birimlerindeki önemli haberlerden 5 dakika önce ve sonra pozisyon açılamaz ve kapatılamaz; gece ve hafta sonu pozisyon taşımak için Swing eklentisi gerekir.',
        'Kurallar son güncellemeden sonra satın alınan hesaplar için geçerlidir; mevcut hesaplar eski kurallarıyla devam eder.',
      ],
      fa: [
        'جایی که دو حد روزانه آمده (2 Step Standard: ۳٪ یا ۵٪، 1 Step Flex: ۲٪ یا ۳٪)، بسته به گزینه‌ای است که هنگام خرید انتخاب کرده‌ای.',
        'حداقل روز معاملاتی برای هر مرحله جداست؛ روزی حساب می‌شود که دست‌کم یک معامله ۰٫۰۱ لات داشته باشد. 2 Step Standard بسته به گزینه «از ۰ روز» شروع می‌شود.',
        'دست‌کم هر ۳۰ روز یک معامله ببند، وگرنه حساب غیرفعال به شمار می‌آید.',
        'در حساب Master، از ۵ دقیقه پیش تا ۵ دقیقه پس از خبرهای مهم روی ارزهای مربوط نمی‌توانی پوزیشن باز یا بسته کنی و نگه‌داشتن پوزیشن در شب یا آخر هفته افزونه Swing می‌خواهد.',
        'این قوانین برای حساب‌هایی است که پس از آخرین به‌روزرسانی خریده شده‌اند؛ حساب‌های موجود با قوانین قبلی ادامه می‌دهند.',
      ],
      ar: [
        'حيث يظهر حدّان يوميان (2 Step Standard: 3٪ أو 5٪، و1 Step Flex: 2٪ أو 3٪) فالمعتمد يتوقف على الخيار الذي اخترته عند الشراء.',
        'الحد الأدنى لأيام التداول لكل مرحلة؛ ويُحتسب اليوم بصفقة لا تقل عن 0.01 لوت. يبدأ 2 Step Standard «من 0 أيام» بحسب الخيار.',
        'أغلق صفقة واحدة على الأقل كل 30 يوماً، وإلا اعتُبر الحساب غير نشط.',
        'في حساب Master لا يجوز فتح أو إغلاق صفقات قبل الأخبار المهمة أو بعدها بخمس دقائق على العملات المعنية، والاحتفاظ بالصفقات ليلاً أو في عطلة نهاية الأسبوع يتطلب إضافة Swing.',
        'تسري القواعد على الحسابات المشتراة بعد آخر تحديث؛ أما الحسابات القائمة فتبقى على قواعدها الأصلية.',
      ],
      ru: [
        'Где указаны два дневных лимита (2 Step Standard: 3% или 5%, 1 Step Flex: 2% или 3%), действует тот, что выбран при покупке.',
        'Минимум торговых дней — на каждом этапе; день засчитывается при сделке от 0,01 лота. У 2 Step Standard в зависимости от варианта — «от 0 дней».',
        'Закрывайте хотя бы одну сделку каждые 30 дней, иначе счёт считается неактивным.',
        'На Master-счёте нельзя открывать и закрывать позиции за 5 минут до и после важных новостей по затронутым валютам, а перенос через ночь и выходные требует дополнения Swing.',
        'Правила действуют для счетов, купленных после последнего обновления; действующие счета сохраняют прежние правила.',
      ],
      es: [
        'Donde se muestran dos límites diarios (2 Step Standard: 3% o 5%, 1 Step Flex: 2% o 3%), depende de la opción que elegiste al comprar.',
        'Los días mínimos son por fase; un día cuenta con una operación de al menos 0,01 lotes. 2 Step Standard empieza «desde 0 días» según la opción.',
        'Cierra al menos una operación cada 30 días o la cuenta se considera inactiva.',
        'En la cuenta Master no puedes abrir ni cerrar posiciones 5 minutos antes o después de noticias de alto impacto en las divisas afectadas, y mantener posiciones de noche o el fin de semana requiere el complemento Swing.',
        'Las reglas se aplican a cuentas compradas tras la última actualización; las cuentas existentes conservan sus reglas.',
      ],
      pt: [
        'Onde aparecem dois limites diários (2 Step Standard: 3% ou 5%, 1 Step Flex: 2% ou 3%), depende da opção escolhida na compra.',
        'Os dias mínimos são por fase; um dia conta com uma operação de pelo menos 0,01 lotes. O 2 Step Standard começa «a partir de 0 dias» conforme a opção.',
        'Fecha pelo menos uma operação a cada 30 dias, ou a conta é considerada inativa.',
        'Na conta Master não podes abrir nem fechar posições 5 minutos antes ou depois de notícias de alto impacto nas moedas afetadas, e manter posições durante a noite ou o fim de semana exige o extra Swing.',
        'As regras aplicam-se a contas compradas depois da última atualização; as contas existentes mantêm as regras originais.',
      ],
      de: [
        'Wo zwei Tageslimits stehen (2 Step Standard: 3 % oder 5 %, 1 Step Flex: 2 % oder 3 %), gilt die beim Kauf gewählte Option.',
        'Mindesthandelstage gelten je Phase; ein Tag zählt mit einem Trade ab 0,01 Lot. 2 Step Standard beginnt je nach Option „ab 0 Tagen“.',
        'Schließe mindestens alle 30 Tage einen Trade, sonst gilt das Konto als inaktiv.',
        'Auf dem Master-Konto dürfen 5 Minuten vor und nach wichtigen News in den betroffenen Währungen keine Positionen eröffnet oder geschlossen werden; Halten über Nacht oder das Wochenende erfordert das Swing-Add-on.',
        'Die Regeln gelten für Konten, die nach dem letzten Update gekauft wurden; bestehende Konten behalten ihre Regeln.',
      ],
      fr: [
        'Là où deux limites journalières figurent (2 Step Standard : 3 % ou 5 %, 1 Step Flex : 2 % ou 3 %), c\'est l\'option choisie à l\'achat qui compte.',
        'Les jours minimum s\'entendent par phase ; un jour compte avec un trade d\'au moins 0,01 lot. 2 Step Standard démarre « à partir de 0 jour » selon l\'option.',
        'Clôturez au moins un trade tous les 30 jours, sinon le compte est considéré comme inactif.',
        'Sur le compte Master, impossible d\'ouvrir ou de clôturer une position 5 minutes avant ou après une annonce majeure sur les devises concernées ; garder des positions la nuit ou le week-end nécessite l\'option Swing.',
        'Les règles s\'appliquent aux comptes achetés après la dernière mise à jour ; les comptes existants gardent leurs règles d\'origine.',
      ],
    },
  },
];

export const BROKERS: Broker[] = [
  { slug: 'pepperstone', name: 'Pepperstone', checked: '2026-09-29', platforms: ['MT4', 'MT5', 'cTrader', 'TradingView'], source: 'https://pepperstone.com/en/' },
  { slug: 'blackbull-markets', name: 'BlackBull Markets', checked: '2026-09-29', platforms: ['MT4', 'MT5', 'cTrader', 'TradingView'], source: 'https://www.blackbull.com/en/' },
  { slug: 'axi', name: 'Axi', checked: '2026-09-29', platforms: ['MT4', 'MT5', 'TradingView'], source: 'https://www.axi.com/int' },
  { slug: 'oanda', name: 'OANDA', checked: '2026-09-29', platforms: ['MT4', 'TradingView'], source: 'https://www.oanda.com/' },
];

export const propFirmPath = (f: Pick<PropFirm, 'slug'>) => `/prop-firms/${f.slug}`;
export const brokerPath = (b: Pick<Broker, 'slug'>) => `/brokers/${b.slug}`;
export const findPropFirm = (slug: string) => PROP_FIRMS.find(f => f.slug === slug);
export const findBroker = (slug: string) => BROKERS.find(b => b.slug === slug);

/** Bu platformdan işlemler nasıl gelir. */
export type Method = 'auto' | 'file' | 'none';
export const methodFor = (p: Platform): Method =>
  p === 'MT4' || p === 'MT5' ? 'auto' : p === 'TradingView' ? 'none' : 'file';

/** Sayfaların başlık ve açıklamaları; hem çizim hem <head> (prerender) kullanıyor. */
const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');

const META = {
  propIndexTitle: {
    en: 'Prop firm rules: daily loss, max loss and profit targets', tr: 'Prop firma kuralları: günlük kayıp, maksimum kayıp ve kâr hedefleri',
    fa: 'قوانین پراپ فرم‌ها: ضرر روزانه، حداکثر ضرر و هدف سود', ar: 'قواعد شركات التمويل: الخسارة اليومية والقصوى وأهداف الربح',
    ru: 'Правила проп-фирм: дневной и максимальный убыток, цели по прибыли', es: 'Reglas de firmas de fondeo: pérdida diaria, pérdida máxima y objetivos',
    pt: 'Regras de prop firms: perda diária, perda máxima e objetivos de lucro', de: 'Prop-Firm-Regeln: Tagesverlust, Maximalverlust und Gewinnziele',
    fr: 'Règles des prop firms : perte journalière, perte maximale et objectifs',
  },
  propIndexDesc: {
    en: 'Profit targets and loss limits of {names}, taken from their official pages, and how to track them trade by trade in your journal.',
    tr: '{names} firmalarının kâr hedefleri ve kayıp sınırları, resmî sayfalarından; ve bunları journal\'ında işlem işlem nasıl takip edeceğin.',
    fa: 'هدف‌های سود و حدود ضرر {names} از صفحه‌های رسمی‌شان، و اینکه چطور معامله به معامله در ژورنالت دنبالشان کنی.',
    ar: 'أهداف الربح وحدود الخسارة لدى {names} من صفحاتها الرسمية، وكيف تتابعها صفقةً بصفقة في سجلك.',
    ru: 'Цели по прибыли и лимиты убытков {names} с их официальных страниц — и как отслеживать их в журнале по каждой сделке.',
    es: 'Objetivos de beneficio y límites de pérdida de {names}, tomados de sus páginas oficiales, y cómo seguirlos operación a operación en tu diario.',
    pt: 'Objetivos de lucro e limites de perda de {names}, retirados das páginas oficiais, e como os acompanhar operação a operação no teu diário.',
    de: 'Gewinnziele und Verlustgrenzen von {names} aus ihren offiziellen Seiten — und wie du sie Trade für Trade im Journal verfolgst.',
    fr: 'Objectifs de gain et limites de perte de {names}, tirés de leurs pages officielles, et comment les suivre trade par trade dans votre journal.',
  },
  firmTitle: {
    en: '{name} rules: daily loss, max loss and how to track them', tr: '{name} kuralları: günlük kayıp, maksimum kayıp ve takibi',
    fa: 'قوانین {name}: ضرر روزانه، حداکثر ضرر و نحوه پیگیری', ar: 'قواعد {name}: الخسارة اليومية والقصوى وكيف تتابعها',
    ru: 'Правила {name}: дневной и максимальный убыток и как их отслеживать', es: 'Reglas de {name}: pérdida diaria, pérdida máxima y cómo seguirlas',
    pt: 'Regras da {name}: perda diária, perda máxima e como acompanhá-las', de: '{name}-Regeln: Tagesverlust, Maximalverlust und wie du sie verfolgst',
    fr: 'Règles {name} : perte journalière, perte maximale et comment les suivre',
  },
  firmDesc: {
    en: "{name}'s profit targets, daily and maximum loss limits by program, checked against the official rules, and how to see how far you are from each limit.",
    tr: '{name} programlarının kâr hedefleri, günlük ve maksimum kayıp sınırları — resmî kurallarla karşılaştırılmış — ve her sınıra ne kadar kaldığını nasıl göreceğin.',
    fa: 'هدف سود و حدود ضرر روزانه و کل برنامه‌های {name}، مطابق قوانین رسمی، و اینکه چطور ببینی تا هر حد چقدر فاصله داری.',
    ar: 'أهداف الربح وحدود الخسارة اليومية والقصوى لبرامج {name} وفق القواعد الرسمية، وكيف ترى كم بقي لك قبل كل حد.',
    ru: 'Цели по прибыли, дневные и максимальные лимиты убытка программ {name} по официальным правилам — и как видеть, сколько осталось до каждого лимита.',
    es: 'Objetivos y límites de pérdida diaria y máxima de los programas de {name}, según las reglas oficiales, y cómo ver cuánto margen te queda.',
    pt: 'Objetivos e limites de perda diária e máxima dos programas da {name}, segundo as regras oficiais, e como ver quanta margem te resta.',
    de: 'Gewinnziele, Tages- und Maximalverlust der {name}-Programme laut offiziellen Regeln — und wie du siehst, wie viel Spielraum bleibt.',
    fr: 'Objectifs, pertes journalière et maximale des programmes {name} selon les règles officielles, et comment voir la marge restante.',
  },
  brokerIndexTitle: {
    en: 'Trading journal for your broker: MT4, MT5 and cTrader', tr: 'Broker\'ın için trading journal: MT4, MT5 ve cTrader',
    fa: 'ژورنال معاملاتی برای بروکر تو: MT4، MT5 و cTrader', ar: 'سجل تداول لوسيطك: MT4 وMT5 وcTrader',
    ru: 'Журнал трейдера для вашего брокера: MT4, MT5 и cTrader', es: 'Diario de trading para tu bróker: MT4, MT5 y cTrader',
    pt: 'Diário de trading para a tua corretora: MT4, MT5 e cTrader', de: 'Trading-Journal für deinen Broker: MT4, MT5 und cTrader',
    fr: 'Journal de trading pour votre broker : MT4, MT5 et cTrader',
  },
  brokerIndexDesc: {
    en: 'Which platforms {names} offer and how to bring your trades from each into Simple Trading Journal.',
    tr: '{names} hangi platformları sunuyor ve her birinden işlemlerini Simple Trading Journal\'a nasıl getirirsin.',
    fa: '{names} چه پلتفرم‌هایی ارائه می‌دهند و معاملاتت را از هر کدام چطور به Simple Trading Journal بیاوری.',
    ar: 'ما المنصات التي يقدمها {names} وكيف تنقل صفقاتك من كل منها إلى Simple Trading Journal.',
    ru: 'Какие платформы предлагают {names} и как перенести сделки из каждой в Simple Trading Journal.',
    es: 'Qué plataformas ofrecen {names} y cómo llevar tus operaciones de cada una a Simple Trading Journal.',
    pt: 'Que plataformas oferecem {names} e como trazer as tuas operações de cada uma para o Simple Trading Journal.',
    de: 'Welche Plattformen {names} anbieten und wie du deine Trades von jeder in Simple Trading Journal bringst.',
    fr: 'Quelles plateformes proposent {names} et comment importer vos trades de chacune dans Simple Trading Journal.',
  },
  brokerTitle: {
    en: '{name} trading journal: sync {platforms}', tr: '{name} trading journal: {platforms} bağlantısı',
    fa: 'ژورنال معاملاتی {name}: اتصال {platforms}', ar: 'سجل تداول {name}: ربط {platforms}',
    ru: 'Журнал трейдера для {name}: синхронизация {platforms}', es: 'Diario de trading para {name}: sincroniza {platforms}',
    pt: 'Diário de trading para {name}: sincroniza {platforms}', de: '{name} Trading-Journal: {platforms} verbinden',
    fr: 'Journal de trading {name} : synchronisez {platforms}',
  },
  brokerDesc: {
    en: 'How to bring your {name} trades into Simple Trading Journal: automatic MetaTrader sync, file import, platform by platform.',
    tr: '{name} işlemlerini Simple Trading Journal\'a getirmek: otomatik MetaTrader bağlantısı ve dosya içe aktarma, platform platform.',
    fa: 'آوردن معاملات {name} به Simple Trading Journal: همگام‌سازی خودکار متاتریدر و وارد کردن فایل، پلتفرم به پلتفرم.',
    ar: 'كيف تنقل صفقات {name} إلى Simple Trading Journal: مزامنة تلقائية لميتاتريدر واستيراد الملفات، منصةً بمنصة.',
    ru: 'Как перенести сделки {name} в Simple Trading Journal: автосинхронизация MetaTrader и импорт файлов для каждой платформы.',
    es: 'Cómo llevar tus operaciones de {name} a Simple Trading Journal: sincronización automática de MetaTrader e importación de archivos, plataforma por plataforma.',
    pt: 'Como trazer as tuas operações da {name} para o Simple Trading Journal: sincronização automática do MetaTrader e importação de ficheiros, plataforma a plataforma.',
    de: 'So bringst du deine {name}-Trades in Simple Trading Journal: automatische MetaTrader-Synchronisierung und Dateiimport, Plattform für Plattform.',
    fr: 'Comment importer vos trades {name} dans Simple Trading Journal : synchronisation MetaTrader automatique et import de fichiers, plateforme par plateforme.',
  },
} satisfies Record<string, L9>;

const SUFFIX = ' — Simple Trading Journal';
const names = (xs: { name: string }[]) => xs.map(x => x.name).join(', ');

/** Dilsiz yol için başlık/açıklama; yol bu bölüme ait değilse null. */
export function directoryMeta(path: string, lang: ArticleLang): { title: string; description: string } | null {
  const [, section, slug] = path.split('/');
  if (section === 'prop-firms') {
    if (!slug) return { title: META.propIndexTitle[lang] + SUFFIX, description: fill(META.propIndexDesc[lang], { names: names(PROP_FIRMS) }) };
    const f = findPropFirm(slug);
    return f ? { title: fill(META.firmTitle[lang], { name: f.name }) + SUFFIX, description: fill(META.firmDesc[lang], { name: f.name }) } : null;
  }
  if (section === 'brokers') {
    if (!slug) return { title: META.brokerIndexTitle[lang] + SUFFIX, description: fill(META.brokerIndexDesc[lang], { names: names(BROKERS) }) };
    const b = findBroker(slug);
    const platforms = b ? b.platforms.filter(p => methodFor(p) !== 'none').join(', ') : '';
    return b ? { title: fill(META.brokerTitle[lang], { name: b.name, platforms }) + SUFFIX, description: fill(META.brokerDesc[lang], { name: b.name }) } : null;
  }
  return null;
}

/** Bu bölümün tüm dilsiz yolları (ön çizim ve site haritası için). */
export const DIRECTORY_PATHS: string[] = [
  '/prop-firms', ...PROP_FIRMS.map(propFirmPath),
  '/brokers', ...BROKERS.map(brokerPath),
];

export const isDirectoryPath = (path: string) => /^\/(prop-firms|brokers)(\/|$)/.test(path);

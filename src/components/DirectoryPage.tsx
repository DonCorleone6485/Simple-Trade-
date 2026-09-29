import React, { useEffect } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Lock as LogoLock } from './Logo';
import { ARTICLE_LANGS, type ArticleLang } from '../content/articles';
import {
  BROKERS, PROP_FIRMS, brokerPath, directoryMeta, findBroker, findPropFirm, methodFor, propFirmPath,
  type Broker, type MaxType, type PropFirm,
} from '../content/directory';
import { langPath } from '../lib/langPath';

/**
 * Prop firma ve broker sayfaları (/prop-firms, /prop-firms/<firma>,
 * /brokers, /brokers/<broker>). Veri ve açıklama: src/content/directory.ts.
 * Görünüş blog yazılarıyla aynı aile (ArticlePage).
 */
type L9 = Record<ArticleLang, string>;
const UI = {
  propFirms: { en: 'Prop firm rules', tr: 'Prop firma kuralları', fa: 'قوانین پراپ فرم‌ها', ar: 'قواعد شركات التمويل', ru: 'Правила проп-фирм', es: 'Reglas de firmas de fondeo', pt: 'Regras de prop firms', de: 'Prop-Firm-Regeln', fr: 'Règles des prop firms' },
  propLead: {
    en: 'Profit targets and loss limits of popular prop firms, taken from their official pages, and how to track them in your journal.',
    tr: 'Popüler prop firmaların kâr hedefleri ve kayıp sınırları, resmî sayfalarından alınmış; ve bunları journal\'ında nasıl takip edeceğin.',
    fa: 'هدف‌های سود و حدود ضرر پراپ فرم‌های پرطرفدار، برگرفته از صفحه‌های رسمی‌شان، و اینکه چطور در ژورنالت دنبالشان کنی.',
    ar: 'أهداف الربح وحدود الخسارة لدى أشهر شركات التمويل، مأخوذة من صفحاتها الرسمية، وكيف تتابعها في سجلك.',
    ru: 'Цели по прибыли и лимиты убытков популярных проп-фирм с их официальных страниц — и как отслеживать их в журнале.',
    es: 'Objetivos de beneficio y límites de pérdida de las firmas de fondeo más conocidas, tomados de sus páginas oficiales, y cómo seguirlos en tu diario.',
    pt: 'Objetivos de lucro e limites de perda das prop firms mais conhecidas, retirados das páginas oficiais, e como os acompanhar no teu diário.',
    de: 'Gewinnziele und Verlustgrenzen bekannter Prop-Firms, direkt von ihren offiziellen Seiten — und wie du sie im Journal verfolgst.',
    fr: 'Objectifs de gain et limites de perte des prop firms les plus connues, tirés de leurs pages officielles, et comment les suivre dans votre journal.',
  },
  brokers: { en: 'Brokers', tr: 'Broker\'lar', fa: 'بروکرها', ar: 'الوسطاء', ru: 'Брокеры', es: 'Brókers', pt: 'Corretoras', de: 'Broker', fr: 'Brokers' },
  brokerLeadIndex: {
    en: 'Which platforms each broker offers and how to bring your trades into Simple Trading Journal.',
    tr: 'Her broker\'ın hangi platformları sunduğu ve işlemlerini Simple Trading Journal\'a nasıl getireceğin.',
    fa: 'هر بروکر چه پلتفرم‌هایی دارد و معاملاتت را چطور به Simple Trading Journal بیاوری.',
    ar: 'ما المنصات التي يقدمها كل وسيط وكيف تنقل صفقاتك إلى Simple Trading Journal.',
    ru: 'Какие платформы предлагает каждый брокер и как перенести сделки в Simple Trading Journal.',
    es: 'Qué plataformas ofrece cada bróker y cómo llevar tus operaciones a Simple Trading Journal.',
    pt: 'Que plataformas oferece cada corretora e como trazer as tuas operações para o Simple Trading Journal.',
    de: 'Welche Plattformen jeder Broker anbietet und wie deine Trades in Simple Trading Journal kommen.',
    fr: 'Quelles plateformes propose chaque broker et comment importer vos trades dans Simple Trading Journal.',
  },
  home: { en: 'Home', tr: 'Ana sayfa', fa: 'صفحه اصلی', ar: 'الرئيسية', ru: 'Главная', es: 'Inicio', pt: 'Início', de: 'Startseite', fr: 'Accueil' },
  firmH1: { en: '{name} rules and how to track them', tr: '{name} kuralları ve nasıl takip edilir', fa: 'قوانین {name} و نحوه پیگیری آن‌ها', ar: 'قواعد {name} وكيف تتابعها', ru: 'Правила {name} и как их отслеживать', es: 'Reglas de {name} y cómo seguirlas', pt: 'Regras da {name} e como acompanhá-las', de: '{name}-Regeln und wie du sie verfolgst', fr: 'Règles {name} et comment les suivre' },
  firmLead: {
    en: "{name}'s profit targets and loss limits by program, and how to set them up in Simple Trading Journal so you always see how far you are from each limit.",
    tr: '{name} programlarının kâr hedefleri ve kayıp sınırları; ve her sınıra ne kadar kaldığını hep görmek için bunları Simple Trading Journal\'da nasıl kuracağın.',
    fa: 'هدف سود و حدود ضرر برنامه‌های {name}، و اینکه چطور آن‌ها را در Simple Trading Journal تنظیم کنی تا همیشه ببینی تا هر حد چقدر فاصله داری.',
    ar: 'أهداف الربح وحدود الخسارة لبرامج {name}، وكيف تضبطها في Simple Trading Journal لترى دائماً كم بقي لك قبل كل حد.',
    ru: 'Цели по прибыли и лимиты убытков программ {name} — и как настроить их в Simple Trading Journal, чтобы всегда видеть запас до каждого лимита.',
    es: 'Objetivos de beneficio y límites de pérdida de los programas de {name}, y cómo configurarlos en Simple Trading Journal para ver siempre cuánto margen te queda.',
    pt: 'Objetivos de lucro e limites de perda dos programas da {name}, e como os configurar no Simple Trading Journal para veres sempre quanta margem te resta.',
    de: 'Gewinnziele und Verlustgrenzen der {name}-Programme — und wie du sie in Simple Trading Journal einrichtest, damit du immer siehst, wie viel Spielraum bleibt.',
    fr: 'Objectifs de gain et limites de perte des programmes {name}, et comment les configurer dans Simple Trading Journal pour toujours voir la marge restante.',
  },
  rulesH2: { en: 'Rules by program', tr: 'Programlara göre kurallar', fa: 'قوانین به تفکیک برنامه', ar: 'القواعد حسب البرنامج', ru: 'Правила по программам', es: 'Reglas por programa', pt: 'Regras por programa', de: 'Regeln nach Programm', fr: 'Règles par programme' },
  program: { en: 'Program', tr: 'Program', fa: 'برنامه', ar: 'البرنامج', ru: 'Программа', es: 'Programa', pt: 'Programa', de: 'Programm', fr: 'Programme' },
  target: { en: 'Profit target', tr: 'Kâr hedefi', fa: 'هدف سود', ar: 'هدف الربح', ru: 'Цель по прибыли', es: 'Objetivo de beneficio', pt: 'Objetivo de lucro', de: 'Gewinnziel', fr: 'Objectif de gain' },
  daily: { en: 'Max daily loss', tr: 'Maksimum günlük kayıp', fa: 'حداکثر ضرر روزانه', ar: 'الحد الأقصى للخسارة اليومية', ru: 'Макс. дневной убыток', es: 'Pérdida diaria máxima', pt: 'Perda diária máxima', de: 'Max. Tagesverlust', fr: 'Perte journalière max.' },
  max: { en: 'Max total loss', tr: 'Maksimum toplam kayıp', fa: 'حداکثر ضرر کل', ar: 'الحد الأقصى للخسارة الإجمالية', ru: 'Макс. общий убыток', es: 'Pérdida total máxima', pt: 'Perda total máxima', de: 'Max. Gesamtverlust', fr: 'Perte totale max.' },
  maxType: { en: 'Measured from', tr: 'Nereden ölçülür', fa: 'مبنای اندازه‌گیری', ar: 'يُقاس من', ru: 'Откуда считается', es: 'Se mide desde', pt: 'Mede-se a partir de', de: 'Gemessen ab', fr: 'Mesurée depuis' },
  minDays: { en: 'Minimum days', tr: 'Asgari gün', fa: 'حداقل روز', ar: 'الحد الأدنى للأيام', ru: 'Мин. дней', es: 'Días mínimos', pt: 'Dias mínimos', de: 'Mindesttage', fr: 'Jours minimum' },
  platforms: { en: 'Platforms', tr: 'Platformlar', fa: 'پلتفرم‌ها', ar: 'المنصات', ru: 'Платформы', es: 'Plataformas', pt: 'Plataformas', de: 'Plattformen', fr: 'Plateformes' },
  none: { en: 'None', tr: 'Yok', fa: 'ندارد', ar: 'لا يوجد', ru: 'Нет', es: 'No', pt: 'Não', de: 'Keins', fr: 'Aucun' },
  notStated: { en: 'Not stated', tr: 'Belirtilmemiş', fa: 'ذکر نشده', ar: 'غير مذكور', ru: 'Не указано', es: 'No indicado', pt: 'Não indicado', de: 'Nicht angegeben', fr: 'Non précisé' },
  days: { en: '{n} trading days', tr: '{n} işlem günü', fa: '{n} روز معاملاتی', ar: '{n} أيام تداول', ru: '{n} торг. дн.', es: '{n} días de trading', pt: '{n} dias de negociação', de: '{n} Handelstage', fr: '{n} jours de trading' },
  day1: { en: '1 trading day', tr: '1 işlem günü', fa: '۱ روز معاملاتی', ar: 'يوم تداول واحد', ru: '1 торг. день', es: '1 día de trading', pt: '1 dia de negociação', de: '1 Handelstag', fr: '1 jour de trading' },
  profitableDays: { en: '{n} profitable days', tr: '{n} kârlı gün', fa: '{n} روز سودده', ar: '{n} أيام رابحة', ru: '{n} приб. дн.', es: '{n} días rentables', pt: '{n} dias lucrativos', de: '{n} profitable Tage', fr: '{n} jours rentables' },
  mtStatic: { en: 'Starting balance (static)', tr: 'Başlangıç bakiyesi (sabit)', fa: 'موجودی اولیه (ثابت)', ar: 'الرصيد الابتدائي (ثابت)', ru: 'Стартовый баланс (статичный)', es: 'Saldo inicial (estático)', pt: 'Saldo inicial (estático)', de: 'Startguthaben (statisch)', fr: 'Solde initial (statique)' },
  mtTrailing: { en: 'Highest balance (trailing)', tr: 'En yüksek bakiye (takipli)', fa: 'بالاترین موجودی (دنباله‌رو)', ar: 'أعلى رصيد (متحرك)', ru: 'Макс. баланс (плавающий)', es: 'Saldo máximo (trailing)', pt: 'Saldo máximo (trailing)', de: 'Höchster Stand (trailing)', fr: 'Plus haut solde (trailing)' },
  mtEod: { en: 'Highest end-of-day balance (trailing)', tr: 'En yüksek gün sonu bakiyesi (takipli)', fa: 'بالاترین موجودی پایان روز (دنباله‌رو)', ar: 'أعلى رصيد نهاية يوم (متحرك)', ru: 'Макс. баланс на конец дня (плавающий)', es: 'Saldo máximo al cierre del día (trailing)', pt: 'Saldo máximo no fim do dia (trailing)', de: 'Höchster Tagesendstand (trailing)', fr: 'Plus haut solde de fin de journée (trailing)' },
  mtSmart: { en: 'Smart Drawdown (see below)', tr: 'Smart Drawdown (aşağıya bak)', fa: 'Smart Drawdown (پایین‌تر را ببین)', ar: 'Smart Drawdown (انظر أدناه)', ru: 'Smart Drawdown (см. ниже)', es: 'Smart Drawdown (ver abajo)', pt: 'Smart Drawdown (ver abaixo)', de: 'Smart Drawdown (siehe unten)', fr: 'Smart Drawdown (voir ci-dessous)' },
  source: { en: 'Source', tr: 'Kaynak', fa: 'منبع', ar: 'المصدر', ru: 'Источник', es: 'Fuente', pt: 'Fonte', de: 'Quelle', fr: 'Source' },
  pctNote: {
    en: 'Percentages are of the initial account balance. Two targets mean phase 1 and phase 2.',
    tr: 'Yüzdeler başlangıç hesap bakiyesine göredir. İki hedef varsa birincisi 1. aşama, ikincisi 2. aşamadır.',
    fa: 'درصدها نسبت به موجودی اولیه حساب است. اگر دو هدف هست، اولی مرحله ۱ و دومی مرحله ۲ است.',
    ar: 'النسب محسوبة من الرصيد الابتدائي للحساب. عند وجود هدفين، فالأول للمرحلة 1 والثاني للمرحلة 2.',
    ru: 'Проценты — от начального баланса счёта. Две цели — это этап 1 и этап 2.',
    es: 'Los porcentajes son sobre el saldo inicial de la cuenta. Dos objetivos significan fase 1 y fase 2.',
    pt: 'As percentagens são sobre o saldo inicial da conta. Dois objetivos significam fase 1 e fase 2.',
    de: 'Prozentangaben beziehen sich auf das Startguthaben. Zwei Ziele bedeuten Phase 1 und Phase 2.',
    fr: 'Les pourcentages portent sur le solde initial du compte. Deux objectifs = phase 1 et phase 2.',
  },
  notesH2: { en: 'Details worth knowing', tr: 'Bilinmesi gereken ayrıntılar', fa: 'جزئیاتی که باید بدانی', ar: 'تفاصيل يجب معرفتها', ru: 'Важные детали', es: 'Detalles que conviene saber', pt: 'Detalhes que convém saber', de: 'Wissenswerte Details', fr: 'Détails à connaître' },
  setupH2: { en: 'How to track {name} in Simple Trading Journal', tr: '{name} hesabını Simple Trading Journal\'da takip etmek', fa: 'پیگیری حساب {name} در Simple Trading Journal', ar: 'كيف تتابع حساب {name} في Simple Trading Journal', ru: 'Как отслеживать счёт {name} в Simple Trading Journal', es: 'Cómo seguir tu cuenta de {name} en Simple Trading Journal', pt: 'Como acompanhar a tua conta {name} no Simple Trading Journal', de: 'So verfolgst du dein {name}-Konto in Simple Trading Journal', fr: 'Suivre votre compte {name} dans Simple Trading Journal' },
  step1: { en: 'Create a new journal and choose Prop Account.', tr: 'Yeni bir journal oluştur ve Prop Hesap\'ı seç.', fa: 'یک ژورنال جدید بساز و «حساب پراپ» را انتخاب کن.', ar: 'أنشئ سجلاً جديداً واختر «حساب Prop».', ru: 'Создайте новый журнал и выберите «Prop-счёт».', es: 'Crea un diario nuevo y elige «Cuenta prop».', pt: 'Cria um diário novo e escolhe «Conta prop».', de: 'Lege ein neues Journal an und wähle „Prop-Konto“.', fr: 'Créez un nouveau journal et choisissez « Compte prop ».' },
  step2: { en: 'Enter your account size as the starting capital.', tr: 'Hesap büyüklüğünü başlangıç sermayesi olarak yaz.', fa: 'اندازه حسابت را به‌عنوان سرمایه اولیه وارد کن.', ar: 'أدخل حجم حسابك كرأس المال الابتدائي.', ru: 'Укажите размер счёта как начальный капитал.', es: 'Introduce el tamaño de tu cuenta como capital inicial.', pt: 'Introduz o tamanho da conta como capital inicial.', de: 'Trage deine Kontogröße als Startkapital ein.', fr: 'Saisissez la taille du compte comme capital initial.' },
  step3: {
    en: 'Enter the profit target, max daily loss and max total loss as amounts. On a $100,000 account, 5% is $5,000.',
    tr: 'Kâr hedefini, maksimum günlük kaybı ve maksimum toplam kaybı tutar olarak yaz. 100.000 $\'lık hesapta %5, 5.000 $ eder.',
    fa: 'هدف سود، حداکثر ضرر روزانه و حداکثر ضرر کل را به مبلغ وارد کن. در حساب ۱۰۰٬۰۰۰ دلاری، ۵٪ یعنی ۵٬۰۰۰ دلار.',
    ar: 'أدخل هدف الربح والحد الأقصى للخسارة اليومية والإجمالية كمبالغ. في حساب 100,000$، تعادل 5٪ مبلغ 5,000$.',
    ru: 'Введите цель по прибыли, макс. дневной и общий убыток в деньгах. На счёте $100 000 5% — это $5 000.',
    es: 'Introduce el objetivo, la pérdida diaria máxima y la pérdida total máxima como importes. En una cuenta de $100.000, el 5% son $5.000.',
    pt: 'Introduz o objetivo, a perda diária máxima e a perda total máxima como valores. Numa conta de $100.000, 5% são $5.000.',
    de: 'Trage Gewinnziel, maximalen Tages- und Gesamtverlust als Beträge ein. Bei einem 100.000-$-Konto sind 5 % 5.000 $.',
    fr: 'Saisissez l\'objectif, la perte journalière max. et la perte totale max. en montants. Sur un compte de 100 000 $, 5 % font 5 000 $.',
  },
  step4: {
    en: 'For the total loss, choose "from the starting balance" or "from the highest balance (trailing)" to match the table above.',
    tr: 'Toplam kayıp için yukarıdaki tabloya göre "Başlangıç bakiyesinden" ya da "En yüksek bakiyeden (takipli)" seçeneğini seç.',
    fa: 'برای ضرر کل، مطابق جدول بالا «از موجودی اولیه» یا «از بالاترین موجودی (دنباله‌رو)» را انتخاب کن.',
    ar: 'للخسارة الإجمالية اختر «من الرصيد الابتدائي» أو «من أعلى رصيد (متحرك)» بحسب الجدول أعلاه.',
    ru: 'Для общего убытка выберите «От стартового баланса» или «От максимального баланса (плавающий)» — как в таблице выше.',
    es: 'Para la pérdida total, elige «Desde el saldo inicial» o «Desde el saldo máximo (trailing)» según la tabla de arriba.',
    pt: 'Para a perda total, escolhe «Do saldo inicial» ou «Do saldo máximo (trailing)» conforme a tabela acima.',
    de: 'Wähle für den Gesamtverlust „Vom Startkapital“ oder „Vom höchsten Stand (trailing)“ — wie in der Tabelle oben.',
    fr: 'Pour la perte totale, choisissez « Du solde de départ » ou « Du plus haut solde (trailing) » selon le tableau ci-dessus.',
  },
  step5mt: {
    en: 'Connect MetaTrader with the Expert Advisor so every trade arrives on its own, or import your history file.',
    tr: 'MetaTrader\'ı Expert Advisor ile bağla, her işlem kendiliğinden gelsin; ya da geçmiş dosyanı içe aktar.',
    fa: 'متاتریدر را با اکسپرت وصل کن تا هر معامله خودکار بیاید، یا فایل تاریخچه‌ات را وارد کن.',
    ar: 'اربط ميتاتريدر بالمستشار الخبير لتصل كل صفقة تلقائياً، أو استورد ملف السجل.',
    ru: 'Подключите MetaTrader через советник, чтобы сделки приходили сами, или импортируйте файл истории.',
    es: 'Conecta MetaTrader con el Expert Advisor para que cada operación llegue sola, o importa tu archivo de historial.',
    pt: 'Liga o MetaTrader com o Expert Advisor para que cada operação chegue sozinha, ou importa o teu ficheiro de histórico.',
    de: 'Verbinde MetaTrader über den Expert Advisor, damit jeder Trade von selbst ankommt, oder importiere deine Verlaufsdatei.',
    fr: 'Connectez MetaTrader avec l\'Expert Advisor pour que chaque trade arrive tout seul, ou importez votre fichier d\'historique.',
  },
  step5file: {
    en: 'Import your history file after trading.', tr: 'İşlemden sonra geçmiş dosyanı içe aktar.', fa: 'بعد از معامله فایل تاریخچه‌ات را وارد کن.', ar: 'استورد ملف السجل بعد التداول.', ru: 'После торговли импортируйте файл истории.', es: 'Importa tu archivo de historial después de operar.', pt: 'Importa o teu ficheiro de histórico depois de negociar.', de: 'Importiere nach dem Handel deine Verlaufsdatei.', fr: 'Importez votre fichier d\'historique après avoir tradé.',
  },
  bufferNote: {
    en: 'The counter in your journal uses closed trades. {name} can also count the floating loss of open positions, so leave yourself a buffer below each limit.',
    tr: 'Journal\'ındaki sayaç kapanan işlemleri kullanır. {name} açık pozisyonların anlık zararını da sayabilir; bu yüzden her sınırın altında kendine pay bırak.',
    fa: 'شمارنده ژورنال بر اساس معاملات بسته‌شده است. {name} ممکن است ضرر لحظه‌ای پوزیشن‌های باز را هم حساب کند؛ پس زیر هر حد برای خودت فاصله بگذار.',
    ar: 'يعتمد العدّاد في سجلك على الصفقات المغلقة. قد تحتسب {name} أيضاً الخسارة العائمة للصفقات المفتوحة، لذا اترك هامشاً تحت كل حد.',
    ru: 'Счётчик в журнале считает закрытые сделки. {name} может учитывать и плавающий убыток открытых позиций, поэтому оставляйте запас до каждого лимита.',
    es: 'El contador de tu diario usa operaciones cerradas. {name} puede contar también la pérdida flotante de las posiciones abiertas, así que deja margen bajo cada límite.',
    pt: 'O contador do teu diário usa operações fechadas. A {name} pode contar também a perda flutuante das posições abertas, por isso deixa margem abaixo de cada limite.',
    de: 'Der Zähler im Journal nutzt geschlossene Trades. {name} kann auch den schwebenden Verlust offener Positionen zählen — lass dir unter jeder Grenze Puffer.',
    fr: 'Le compteur du journal utilise les trades clôturés. {name} peut aussi compter la perte latente des positions ouvertes : gardez une marge sous chaque limite.',
  },
  checked: {
    en: 'Checked against the official pages on {date}. Rules change and differ by account type: always confirm on {name}\'s own site. Simple Trading Journal is not affiliated with {name}.',
    tr: 'Resmî sayfalarla {date} tarihinde karşılaştırıldı. Kurallar değişir ve hesap türüne göre farklıdır: her zaman {name}\'in kendi sitesinden doğrula. Simple Trading Journal\'ın {name} ile bir bağlantısı yoktur.',
    fa: 'در تاریخ {date} با صفحه‌های رسمی مطابقت داده شد. قوانین تغییر می‌کنند و بسته به نوع حساب فرق دارند: همیشه در سایت خود {name} تأیید کن. Simple Trading Journal هیچ وابستگی‌ای به {name} ندارد.',
    ar: 'تمت مطابقتها مع الصفحات الرسمية بتاريخ {date}. القواعد تتغير وتختلف بحسب نوع الحساب: تأكد دائماً من موقع {name} نفسه. لا تربط Simple Trading Journal أي علاقة بـ {name}.',
    ru: 'Сверено с официальными страницами {date}. Правила меняются и зависят от типа счёта — всегда проверяйте на сайте {name}. Simple Trading Journal не связан с {name}.',
    es: 'Comprobado con las páginas oficiales el {date}. Las reglas cambian y varían según el tipo de cuenta: confírmalas siempre en la web de {name}. Simple Trading Journal no está afiliado a {name}.',
    pt: 'Verificado com as páginas oficiais em {date}. As regras mudam e variam conforme o tipo de conta: confirma sempre no site da {name}. O Simple Trading Journal não tem ligação à {name}.',
    de: 'Am {date} mit den offiziellen Seiten abgeglichen. Regeln ändern sich und hängen vom Kontotyp ab — prüfe sie immer auf der Seite von {name}. Simple Trading Journal ist nicht mit {name} verbunden.',
    fr: 'Vérifié avec les pages officielles le {date}. Les règles changent et varient selon le type de compte : vérifiez toujours sur le site de {name}. Simple Trading Journal n\'est pas affilié à {name}.',
  },
  otherFirms: { en: 'Other prop firms', tr: 'Diğer prop firmalar', fa: 'پراپ فرم‌های دیگر', ar: 'شركات تمويل أخرى', ru: 'Другие проп-фирмы', es: 'Otras firmas de fondeo', pt: 'Outras prop firms', de: 'Weitere Prop-Firms', fr: 'Autres prop firms' },
  allFirms: { en: 'All prop firms', tr: 'Tüm prop firmalar', fa: 'همه پراپ فرم‌ها', ar: 'كل شركات التمويل', ru: 'Все проп-фирмы', es: 'Todas las firmas', pt: 'Todas as prop firms', de: 'Alle Prop-Firms', fr: 'Toutes les prop firms' },
  brokerH1: { en: '{name} trading journal', tr: '{name} için trading journal', fa: 'ژورنال معاملاتی برای {name}', ar: 'سجل تداول لحساب {name}', ru: 'Журнал трейдера для {name}', es: 'Diario de trading para {name}', pt: 'Diário de trading para {name}', de: 'Trading-Journal für {name}', fr: 'Journal de trading pour {name}' },
  brokerLead: {
    en: 'How to bring your {name} trades into Simple Trading Journal, platform by platform.',
    tr: '{name} işlemlerini Simple Trading Journal\'a platform platform nasıl getireceğin.',
    fa: 'چطور معاملات {name} را پلتفرم به پلتفرم به Simple Trading Journal بیاوری.',
    ar: 'كيف تنقل صفقات {name} إلى Simple Trading Journal، منصةً بمنصة.',
    ru: 'Как перенести сделки {name} в Simple Trading Journal — для каждой платформы.',
    es: 'Cómo llevar tus operaciones de {name} a Simple Trading Journal, plataforma por plataforma.',
    pt: 'Como trazer as tuas operações da {name} para o Simple Trading Journal, plataforma a plataforma.',
    de: 'So kommen deine {name}-Trades in Simple Trading Journal — Plattform für Plattform.',
    fr: 'Comment importer vos trades {name} dans Simple Trading Journal, plateforme par plateforme.',
  },
  connectH2: { en: 'Platforms and how to connect', tr: 'Platformlar ve bağlantı yolu', fa: 'پلتفرم‌ها و روش اتصال', ar: 'المنصات وطريقة الربط', ru: 'Платформы и способ подключения', es: 'Plataformas y cómo conectarlas', pt: 'Plataformas e como ligar', de: 'Plattformen und Anbindung', fr: 'Plateformes et connexion' },
  platform: { en: 'Platform', tr: 'Platform', fa: 'پلتفرم', ar: 'المنصة', ru: 'Платформа', es: 'Plataforma', pt: 'Plataforma', de: 'Plattform', fr: 'Plateforme' },
  inJournal: { en: 'In Simple Trading Journal', tr: 'Simple Trading Journal\'da', fa: 'در Simple Trading Journal', ar: 'في Simple Trading Journal', ru: 'В Simple Trading Journal', es: 'En Simple Trading Journal', pt: 'No Simple Trading Journal', de: 'In Simple Trading Journal', fr: 'Dans Simple Trading Journal' },
  mAuto: { en: 'Automatic sync with the Expert Advisor, or file import', tr: 'Expert Advisor ile otomatik aktarım ya da dosya içe aktarma', fa: 'همگام‌سازی خودکار با اکسپرت، یا وارد کردن فایل', ar: 'مزامنة تلقائية بالمستشار الخبير، أو استيراد ملف', ru: 'Автосинхронизация через советник или импорт файла', es: 'Sincronización automática con el Expert Advisor o importación de archivo', pt: 'Sincronização automática com o Expert Advisor ou importação de ficheiro', de: 'Automatisch über den Expert Advisor oder Dateiimport', fr: 'Synchronisation automatique via l\'Expert Advisor, ou import de fichier' },
  mFile: { en: 'File import (export your history)', tr: 'Dosya içe aktarma (geçmişi dışa aktararak)', fa: 'وارد کردن فایل (با خروجی گرفتن از تاریخچه)', ar: 'استيراد ملف (بتصدير السجل)', ru: 'Импорт файла (экспорт истории)', es: 'Importación de archivo (exporta tu historial)', pt: 'Importação de ficheiro (exporta o teu histórico)', de: 'Dateiimport (Verlauf exportieren)', fr: 'Import de fichier (export de l\'historique)' },
  mNone: { en: 'No direct connection yet', tr: 'Henüz doğrudan bağlantı yok', fa: 'هنوز اتصال مستقیم ندارد', ar: 'لا يوجد ربط مباشر بعد', ru: 'Прямого подключения пока нет', es: 'Aún sin conexión directa', pt: 'Ainda sem ligação direta', de: 'Noch keine direkte Anbindung', fr: 'Pas encore de connexion directe' },
  guideMt: { en: 'Step-by-step: connect MetaTrader', tr: 'Adım adım: MetaTrader\'ı bağlamak', fa: 'گام‌به‌گام: اتصال متاتریدر', ar: 'خطوة بخطوة: ربط ميتاتريدر', ru: 'Пошагово: подключение MetaTrader', es: 'Paso a paso: conectar MetaTrader', pt: 'Passo a passo: ligar o MetaTrader', de: 'Schritt für Schritt: MetaTrader verbinden', fr: 'Pas à pas : connecter MetaTrader' },
  guideImport: { en: 'Step-by-step: import your history', tr: 'Adım adım: geçmişini içe aktarmak', fa: 'گام‌به‌گام: وارد کردن تاریخچه', ar: 'خطوة بخطوة: استيراد السجل', ru: 'Пошагово: импорт истории', es: 'Paso a paso: importar tu historial', pt: 'Passo a passo: importar o teu histórico', de: 'Schritt für Schritt: Verlauf importieren', fr: 'Pas à pas : importer votre historique' },
  brokerNote: {
    en: 'Available platforms can differ by country and by the {name} entity you open your account with. Platform list checked on {date}; Simple Trading Journal is not affiliated with {name}.',
    tr: 'Sunulan platformlar ülkeye ve hesabı açtığın {name} şirketine göre değişebilir. Platform listesi {date} tarihinde kontrol edildi; Simple Trading Journal\'ın {name} ile bir bağlantısı yoktur.',
    fa: 'پلتفرم‌های در دسترس بسته به کشور و شرکتی از {name} که حسابت را نزدش باز می‌کنی فرق دارد. فهرست پلتفرم‌ها در {date} بررسی شد؛ Simple Trading Journal هیچ وابستگی‌ای به {name} ندارد.',
    ar: 'قد تختلف المنصات المتاحة بحسب البلد والكيان التابع لـ {name} الذي تفتح لديه حسابك. تم التحقق من قائمة المنصات بتاريخ {date}، ولا تربط Simple Trading Journal أي علاقة بـ {name}.',
    ru: 'Доступные платформы зависят от страны и компании {name}, в которой открыт счёт. Список проверен {date}; Simple Trading Journal не связан с {name}.',
    es: 'Las plataformas disponibles pueden variar según el país y la entidad de {name} con la que abras la cuenta. Lista comprobada el {date}; Simple Trading Journal no está afiliado a {name}.',
    pt: 'As plataformas disponíveis podem variar conforme o país e a entidade da {name} onde abres conta. Lista verificada em {date}; o Simple Trading Journal não tem ligação à {name}.',
    de: 'Die verfügbaren Plattformen können je nach Land und {name}-Gesellschaft variieren. Liste geprüft am {date}; Simple Trading Journal ist nicht mit {name} verbunden.',
    fr: 'Les plateformes disponibles peuvent varier selon le pays et l\'entité {name} auprès de laquelle vous ouvrez votre compte. Liste vérifiée le {date} ; Simple Trading Journal n\'est pas affilié à {name}.',
  },
  otherBrokers: { en: 'Other brokers', tr: 'Diğer broker\'lar', fa: 'بروکرهای دیگر', ar: 'وسطاء آخرون', ru: 'Другие брокеры', es: 'Otros brókers', pt: 'Outras corretoras', de: 'Weitere Broker', fr: 'Autres brokers' },
  allBrokers: { en: 'All brokers', tr: 'Tüm broker\'lar', fa: 'همه بروکرها', ar: 'كل الوسطاء', ru: 'Все брокеры', es: 'Todos los brókers', pt: 'Todas as corretoras', de: 'Alle Broker', fr: 'Tous les brokers' },
  ctaTitle: { en: 'Start your journal for free', tr: 'Journal\'ını ücretsiz başlat', fa: 'ژورنالت را رایگان شروع کن', ar: 'ابدأ سجلك مجاناً', ru: 'Начните журнал бесплатно', es: 'Empieza tu diario gratis', pt: 'Começa o teu diário grátis', de: 'Starte dein Journal kostenlos', fr: 'Commencez votre journal gratuitement' },
  ctaText: {
    en: 'Set your firm\'s limits once and see after every trade how much room is left — or look around with sample data first.',
    tr: 'Firmanın sınırlarını bir kez gir, her işlemden sonra ne kadar pay kaldığını gör — ya da önce örnek verilerle gez.',
    fa: 'حدود شرکتت را یک بار وارد کن و بعد از هر معامله ببین چقدر جا مانده — یا اول با داده‌های نمونه نگاهی بینداز.',
    ar: 'أدخل حدود شركتك مرة واحدة وشاهد بعد كل صفقة كم بقي لك — أو تجوّل أولاً ببيانات تجريبية.',
    ru: 'Введите лимиты фирмы один раз и после каждой сделки видьте, сколько осталось, — или сначала посмотрите на демо-данных.',
    es: 'Introduce una vez los límites de tu firma y ve tras cada operación cuánto margen queda, o explora primero con datos de ejemplo.',
    pt: 'Introduz uma vez os limites da tua firma e vê depois de cada operação quanta margem resta — ou explora primeiro com dados de exemplo.',
    de: 'Trage die Grenzen deiner Firma einmal ein und sieh nach jedem Trade, wie viel Spielraum bleibt — oder schau dich erst mit Beispieldaten um.',
    fr: 'Saisissez une fois les limites de votre firme et voyez après chaque trade la marge restante — ou explorez d\'abord avec des données d\'exemple.',
  },
} satisfies Record<string, L9>;

/** Blog dizininden bu bölüme bağlantı etiketleri. */
export const DIRECTORY_LINKS = { propFirms: UI.propFirms, brokers: UI.brokers, propLead: UI.propLead, brokerLead: UI.brokerLeadIndex };

const LOCALES: Record<ArticleLang, string> = {
  tr: 'tr-TR', en: 'en-US', fa: 'fa-IR', ar: 'ar-u-nu-latn', ru: 'ru-RU', es: 'es-ES', pt: 'pt-PT', de: 'de-DE', fr: 'fr-FR',
};
const SITE = 'https://www.simpletradejournal.io';
const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');

const muted = { color: 'rgba(255,255,255,0.72)' };

/** "10%" dile göre: Türkçe %10, Almanca/Fransızca 10 %. */
const pct = (v: string, lang: ArticleLang) => {
  const n = v.replace('%', '');
  return lang === 'tr' ? `%${n}` : lang === 'de' || lang === 'fr' ? `${n}\u00a0%` : v;
};

const Card: React.FC<{ href: string; onClick: () => void; title: string; text: string; lang: ArticleLang }> = ({ href, onClick, title, text, lang }) => {
  return (
    <a href={langPath(href, lang)} onClick={e => { e.preventDefault(); onClick(); }}
      className="block rounded-2xl p-6 transition-colors hover:bg-white/[0.05]"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 className="text-[17px] font-medium text-white mb-2">{title}</h3>
      <p className="text-[14.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{text}</p>
    </a>
  );
};

function Table({ head, rows }: { head: React.ReactNode[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto mb-4 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      <table className="w-full text-[14px]" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>{head.map((h, i) => (
            <th key={i} className="text-start font-medium px-3.5 py-2.5 whitespace-nowrap" style={{ color: i === 0 ? 'rgba(255,255,255,0.55)' : '#c4b5fd', background: 'rgba(255,255,255,0.04)' }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {r.map((c, j) => (
                <td key={j} className="px-3.5 py-2.5 align-top" style={{ color: j === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.85)' }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DirectoryPage({ path, onHome, onOpen, cta }: {
  /** /prop-firms, /prop-firms/<firma>, /brokers ya da /brokers/<broker> */
  path: string;
  onHome: () => void;
  onOpen: (path: string) => void;
  cta: { label: string; onClick: () => void };
}) {
  const { language } = useLanguage();
  const lang: ArticleLang = (ARTICLE_LANGS as string[]).includes(language) ? (language as ArticleLang) : 'en';
  const ui = (k: keyof typeof UI, v: Record<string, string> = {}) => fill(UI[k][lang], v);
  const rtl = lang === 'fa' || lang === 'ar';

  const [, section, slug] = path.split('/');
  const isProp = section === 'prop-firms';
  const firm = isProp && slug ? findPropFirm(slug) : undefined;
  const broker = !isProp && slug ? findBroker(slug) : undefined;
  const meta = directoryMeta(path, lang);
  const date = (d: string) => new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: 'long' }).format(new Date(`${d}T12:00:00Z`));

  useEffect(() => {
    if (meta) document.title = meta.title;
    window.scrollTo(0, 0);
  }, [path, lang]);

  const link = (to: string, label: React.ReactNode, className = '') => (
    <a href={langPath(to, lang)} onClick={e => { e.preventDefault(); onOpen(to); }} className={`link-gold ${className}`}>{label}</a>
  );

  const maxTypeLabel = (t: MaxType) =>
    t === 'static' ? ui('mtStatic') : t === 'trailing' ? ui('mtTrailing') : t === 'eodTrailing' ? ui('mtEod') : t === 'smart' ? ui('mtSmart') : ui('notStated');

  const breadcrumb = [
    { name: ui('home'), path: '/' },
    { name: isProp ? ui('propFirms') : ui('brokers'), path: isProp ? '/prop-firms' : '/brokers' },
    ...(firm ? [{ name: firm.name, path: propFirmPath(firm) }] : broker ? [{ name: broker.name, path: brokerPath(broker) }] : []),
  ];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: SITE + langPath(b.path, lang) })),
  };

  const back = (to: string, label: string, onClick: () => void) => (
    <a href={langPath(to, lang)} onClick={e => { e.preventDefault(); onClick(); }}
      className="link-gold inline-flex items-center gap-1.5 text-[13px] mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
      <ArrowLeft className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
      {label}
    </a>
  );

  const h2 = (text: string) => <h2 className="text-[21px] font-medium text-white mt-10 mb-3">{text}</h2>;
  const smallH2 = (text: string) => <h2 className="text-[12px] uppercase tracking-[0.14em] mt-14 mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{text}</h2>;
  const firmCard = (f: PropFirm) => (
    <Card key={f.slug} href={propFirmPath(f)} onClick={() => onOpen(propFirmPath(f))} lang={lang}
      title={fill(UI.firmH1[lang], { name: f.name })} text={f.programs.map(p => p.name).join(' · ')} />
  );
  const brokerCard = (b: Broker) => (
    <Card key={b.slug} href={brokerPath(b)} onClick={() => onOpen(brokerPath(b))} lang={lang}
      title={fill(UI.brokerH1[lang], { name: b.name })} text={b.platforms.join(' · ')} />
  );

  const ctaBox = (
    <section className="rounded-2xl p-7 mt-14" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
      <h2 className="text-[19px] font-medium text-white mb-2">{ui('ctaTitle')}</h2>
      <p className="text-[15px] leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>{ui('ctaText')}</p>
      <button onClick={cta.onClick} className="cta px-5 py-2.5 rounded-full text-[15px] font-medium" style={{ background: '#8b5cf6', color: '#fff' }}>
        {cta.label}
      </button>
    </section>
  );

  let body: React.ReactNode;
  if (firm) {
    const n = { name: firm.name };
    const hasMt = firm.platforms.some(p => methodFor(p) === 'auto');
    const sources = [...new Set(firm.programs.map(p => p.source))];
    body = (
      <>
        {back('/prop-firms', ui('allFirms'), () => onOpen('/prop-firms'))}
        <article dir={rtl ? 'rtl' : 'ltr'} lang={lang}>
          <div className="text-[12px] uppercase tracking-[0.14em] mb-3" style={{ color: '#f0b429' }}>{ui('propFirms')}</div>
          <h1 className="poster text-[2rem] sm:text-[2.6rem] leading-tight mb-4">{ui('firmH1', n)}</h1>
          <p className="text-[16px] leading-[1.75] mb-4" style={muted}>{ui('firmLead', n)}</p>

          {h2(ui('rulesH2'))}
          <Table
            head={[ui('program'), ...firm.programs.map(p => <span dir="ltr">{p.name}</span>)]}
            rows={[
              [ui('target'), ...firm.programs.map(p => p.targets.length ? <span dir="ltr">{p.targets.map(x => pct(x, lang)).join(' → ')}</span> : ui('none'))],
              [ui('daily'), ...firm.programs.map(p => (p.daily ? p.daily.split(' / ').map(x => pct(x, lang)).join(' / ') : ui('none')))],
              [ui('max'), ...firm.programs.map(p => pct(p.max, lang))],
              [ui('maxType'), ...firm.programs.map(p => maxTypeLabel(p.maxType))],
              [ui('minDays'), ...firm.programs.map(p => p.minDays === 'unknown' ? ui('notStated') : !p.minDays ? ui('none')
                : p.minDays.profitable ? ui('profitableDays', { n: String(p.minDays.n) })
                : p.minDays.n === 1 ? ui('day1') : ui('days', { n: String(p.minDays.n) }))],
            ]}
          />
          <p className="text-[13.5px] leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{ui('pctNote')}</p>
          <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {ui('platforms')}: <span dir="ltr">{firm.platforms.join(', ')}</span>
          </p>

          {h2(ui('notesH2'))}
          <ul className="list-disc ps-6 mb-4 space-y-2 text-[16px] leading-[1.7]" style={muted}>
            {firm.notes[lang].map((t, i) => <li key={i} className="ps-1">{t}</li>)}
          </ul>

          {h2(ui('setupH2', n))}
          <ol className="list-decimal ps-6 mb-4 space-y-2 text-[16px] leading-[1.7]" style={muted}>
            <li className="ps-1">{ui('step1')}</li>
            <li className="ps-1">{ui('step2')}</li>
            <li className="ps-1">{ui('step3')}</li>
            <li className="ps-1">{ui('step4')}</li>
            <li className="ps-1">{hasMt ? ui('step5mt') : ui('step5file')}</li>
          </ol>
          <p className="text-[14.5px] mb-4">
            {hasMt && link('/guides/metatrader-5-auto-sync', ui('guideMt'), 'me-5')}
            {link('/guides/import-trade-history', ui('guideImport'))}
          </p>
          <p className="text-[14.5px] leading-relaxed rounded-xl px-4 py-3 mb-4" style={{ background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.2)', color: 'rgba(255,255,255,0.7)' }}>
            {ui('bufferNote', n)}
          </p>

          {h2(ui('source'))}
          <ul className="mb-3 space-y-1.5 text-[14.5px]">
            {sources.map(s => (
              <li key={s}><a href={s} target="_blank" rel="noopener noreferrer nofollow" className="link-gold inline-flex items-center gap-1.5" dir="ltr" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {s.replace(/^https:\/\//, '')}<ExternalLink className="w-3.5 h-3.5" />
              </a></li>
            ))}
          </ul>
          <p className="text-[13.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{ui('checked', { ...n, date: date(firm.checked) })}</p>
        </article>
        {ctaBox}
        {smallH2(ui('otherFirms'))}
        <div className="grid gap-4">{PROP_FIRMS.filter(f => f !== firm).map(firmCard)}</div>
      </>
    );
  } else if (broker) {
    const n = { name: broker.name };
    const methods = new Set(broker.platforms.map(methodFor));
    body = (
      <>
        {back('/brokers', ui('allBrokers'), () => onOpen('/brokers'))}
        <article dir={rtl ? 'rtl' : 'ltr'} lang={lang}>
          <div className="text-[12px] uppercase tracking-[0.14em] mb-3" style={{ color: '#f0b429' }}>{ui('brokers')}</div>
          <h1 className="poster text-[2rem] sm:text-[2.6rem] leading-tight mb-4">{ui('brokerH1', n)}</h1>
          <p className="text-[16px] leading-[1.75] mb-4" style={muted}>{ui('brokerLead', n)}</p>

          {h2(ui('connectH2'))}
          <Table
            head={[ui('platform'), ui('inJournal')]}
            rows={broker.platforms.map(p => {
              const m = methodFor(p);
              return [<span dir="ltr">{p}</span>, m === 'auto' ? ui('mAuto') : m === 'file' ? ui('mFile') : ui('mNone')];
            })}
          />
          <p className="text-[14.5px] mb-4 mt-4">
            {methods.has('auto') && link('/guides/metatrader-5-auto-sync', ui('guideMt'), 'me-5')}
            {link('/guides/import-trade-history', ui('guideImport'))}
          </p>

          {h2(ui('source'))}
          <p className="text-[14.5px] mb-3">
            <a href={broker.source} target="_blank" rel="noopener noreferrer nofollow" className="link-gold inline-flex items-center gap-1.5" dir="ltr" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {broker.source.replace(/^https:\/\//, '')}<ExternalLink className="w-3.5 h-3.5" />
            </a>
          </p>
          <p className="text-[13.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{ui('brokerNote', { ...n, date: date(broker.checked) })}</p>
        </article>
        {ctaBox}
        {smallH2(ui('otherBrokers'))}
        <div className="grid gap-4">{BROKERS.filter(b => b !== broker).map(brokerCard)}</div>
      </>
    );
  } else {
    body = (
      <>
        {back('/', ui('home'), onHome)}
        <div dir={rtl ? 'rtl' : 'ltr'}>
          <h1 className="poster text-[2.2rem] sm:text-[2.8rem] mb-3">{isProp ? ui('propFirms') : ui('brokers')}</h1>
          <p className="text-[16px] leading-relaxed mb-12" style={{ color: 'rgba(255,255,255,0.55)' }}>{isProp ? ui('propLead') : ui('brokerLeadIndex')}</p>
          <div className="grid gap-4">{isProp ? PROP_FIRMS.map(firmCard) : BROKERS.map(brokerCard)}</div>
          {smallH2(isProp ? ui('brokers') : ui('propFirms'))}
          <Card href={isProp ? '/brokers' : '/prop-firms'} onClick={() => onOpen(isProp ? '/brokers' : '/prop-firms')} lang={lang}
            title={isProp ? ui('brokers') : ui('propFirms')} text={isProp ? ui('brokerLeadIndex') : ui('propLead')} />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0d0e1a' }}>
      <header className="max-w-3xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href={langPath('/', lang)} onClick={e => { e.preventDefault(); onHome(); }} aria-label="Simple Trading Journal">
          <LogoLock className="h-[26px] w-auto text-white" />
        </a>
        <button onClick={cta.onClick} className="cta px-4 py-2 rounded-full text-sm font-medium" style={{ background: '#8b5cf6', color: '#fff' }}>
          {cta.label}
        </button>
      </header>
      <main className="max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-24">
        {body}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      </main>
    </div>
  );
}

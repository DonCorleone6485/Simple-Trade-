import React, { useEffect } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { openContact } from '../lib/contact';
import { langPath } from '../lib/langPath';
import { useLanguage } from '../context/LanguageContext';
import { Lock as LogoLock } from './Logo';

/**
 * Yardım (/help) ve Değişiklikler (/changelog).
 *
 * Giriş yapmadan da açılan, arama motorlarının da okuyabildiği iki sade sayfa
 * (derlemede önceden çiziliyor: scripts/prerender.mjs). Metinler dokuz dilde
 * burada duruyor; uygulamanın geri kalanındaki çeviri tablosuna girmiyorlar
 * çünkü yalnızca bu sayfada kullanılıyorlar.
 */
type Lang = 'tr' | 'en' | 'fa' | 'ar' | 'ru' | 'es' | 'pt' | 'de' | 'fr';
type L9 = Record<Lang, string>;

export type InfoKind = 'help' | 'changelog';

const SUPPORT_EMAIL = 'support@simpletradejournal.io';
const PRIVACY_EMAIL = 'privacy@simpletradejournal.io';

const UI: Record<string, L9> = {
  helpTitle: { tr: 'Yardım', en: 'Help', fa: 'راهنما', ar: 'المساعدة', ru: 'Помощь', es: 'Ayuda', pt: 'Ajuda', de: 'Hilfe', fr: 'Aide' },
  helpLead: {
    tr: 'Simple Trading Journal\'ı kullanırken en çok sorulanlar.',
    en: 'The questions people ask most while using Simple Trading Journal.',
    fa: 'پرتکرارترین پرسش‌ها هنگام استفاده از Simple Trading Journal.',
    ar: 'أكثر الأسئلة شيوعاً أثناء استخدام Simple Trading Journal.',
    ru: 'Самые частые вопросы о работе с Simple Trading Journal.',
    es: 'Las preguntas más frecuentes al usar Simple Trading Journal.',
    pt: 'As perguntas mais frequentes ao usar o Simple Trading Journal.',
    de: 'Die häufigsten Fragen zur Nutzung von Simple Trading Journal.',
    fr: 'Les questions les plus fréquentes sur l\'utilisation de Simple Trading Journal.',
  },
  changelogTitle: { tr: 'Değişiklikler', en: 'Changelog', fa: 'تغییرات', ar: 'سجل التغييرات', ru: 'Что нового', es: 'Novedades', pt: 'Novidades', de: 'Änderungen', fr: 'Nouveautés' },
  changelogLead: {
    tr: 'Sitede neyin yeni olduğu, en yeniden en eskiye.',
    en: 'What\'s new on the site, newest first.',
    fa: 'تازه‌های سایت، از جدیدترین به قدیمی‌ترین.',
    ar: 'الجديد في الموقع، من الأحدث إلى الأقدم.',
    ru: 'Новое на сайте — от свежего к старому.',
    es: 'Lo nuevo en el sitio, de lo más reciente a lo más antiguo.',
    pt: 'O que há de novo no site, do mais recente ao mais antigo.',
    de: 'Was es Neues gibt, das Neueste zuerst.',
    fr: 'Les nouveautés du site, des plus récentes aux plus anciennes.',
  },
  contactTitle: { tr: 'Cevabını bulamadın mı?', en: 'Didn\'t find your answer?', fa: 'پاسخت را پیدا نکردی؟', ar: 'لم تجد إجابتك؟', ru: 'Не нашли ответ?', es: '¿No encontraste tu respuesta?', pt: 'Não encontraste a resposta?', de: 'Keine Antwort gefunden?', fr: 'Vous n\'avez pas trouvé la réponse ?' },
  contactLead: {
    tr: 'Bize yaz, genelde bir iş günü içinde dönüyoruz.',
    en: 'Write to us — we usually reply within one business day.',
    fa: 'به ما بنویس؛ معمولاً ظرف یک روز کاری پاسخ می‌دهیم.',
    ar: 'راسلنا، وعادةً نرد خلال يوم عمل واحد.',
    ru: 'Напишите нам — обычно отвечаем в течение рабочего дня.',
    es: 'Escríbenos: solemos responder en un día hábil.',
    pt: 'Escreve-nos: normalmente respondemos num dia útil.',
    de: 'Schreib uns – wir antworten meist innerhalb eines Werktags.',
    fr: 'Écrivez-nous : nous répondons généralement sous un jour ouvré.',
  },
  contactPrivacy: {
    tr: 'Verilerin ve gizlilikle ilgili talepler için:',
    en: 'For data and privacy requests:',
    fa: 'برای درخواست‌های مربوط به داده و حریم خصوصی:',
    ar: 'لطلبات البيانات والخصوصية:',
    ru: 'По вопросам данных и конфиденциальности:',
    es: 'Para solicitudes de datos y privacidad:',
    pt: 'Para pedidos sobre dados e privacidade:',
    de: 'Für Anfragen zu Daten und Datenschutz:',
    fr: 'Pour les demandes relatives aux données et à la confidentialité :',
  },
  guidesTitle: { tr: 'Adım adım rehberler', en: 'Step-by-step guides', fa: 'راهنماهای گام‌به‌گام', ar: 'أدلة خطوة بخطوة', ru: 'Пошаговые руководства', es: 'Guías paso a paso', pt: 'Guias passo a passo', de: 'Schritt-für-Schritt-Anleitungen', fr: 'Guides pas à pas' },
  guideMt5: { tr: 'MetaTrader 4 ve 5\'i bağlamak', en: 'Connecting MetaTrader 4 and 5', fa: 'وصل کردن متاتریدر ۴ و ۵', ar: 'ربط ميتاتريدر 4 و5', ru: 'Подключение MetaTrader 4 и 5', es: 'Conectar MetaTrader 4 y 5', pt: 'Ligar o MetaTrader 4 e 5', de: 'MetaTrader 4 und 5 verbinden', fr: 'Connecter MetaTrader 4 et 5' },
  guideImport: { tr: 'İşlem geçmişini içe aktarmak', en: 'Importing your trade history', fa: 'وارد کردن تاریخچه معاملات', ar: 'استيراد سجل الصفقات', ru: 'Импорт истории сделок', es: 'Importar tu historial', pt: 'Importar o teu histórico', de: 'Handelshistorie importieren', fr: 'Importer votre historique' },
  home: { tr: 'Ana sayfa', en: 'Home', fa: 'صفحه اصلی', ar: 'الرئيسية', ru: 'Главная', es: 'Inicio', pt: 'Início', de: 'Startseite', fr: 'Accueil' },
  seeChangelog: { tr: 'Değişikliklere bak', en: 'See the changelog', fa: 'دیدن تغییرات', ar: 'عرض سجل التغييرات', ru: 'Что нового', es: 'Ver novedades', pt: 'Ver novidades', de: 'Änderungen ansehen', fr: 'Voir les nouveautés' },
  roadmapTitle: { tr: 'Sırada ne var', en: 'What\'s next', fa: 'بعدی چیست', ar: 'ما القادم', ru: 'Что дальше', es: 'Lo que viene', pt: 'O que vem a seguir', de: 'Was als Nächstes kommt', fr: 'La suite' },
  roadmapLead: {
    tr: 'Tarih vermiyoruz; sıra, kullananların isteklerine göre değişebiliyor. Bir önerin varsa bize yaz.',
    en: 'We don\'t give dates; the order can change with what users ask for. If you have a suggestion, write to us.',
    fa: 'تاریخ نمی‌دهیم؛ ترتیب ممکن است با درخواست کاربران تغییر کند. اگر پیشنهادی داری، برایمان بنویس.',
    ar: 'لا نحدد مواعيد؛ قد يتغير الترتيب حسب طلبات المستخدمين. إن كان لديك اقتراح فاكتب لنا.',
    ru: 'Сроков мы не называем: порядок может меняться в зависимости от запросов пользователей. Есть предложение — напишите нам.',
    es: 'No damos fechas; el orden puede cambiar según lo que pidan los usuarios. Si tienes una sugerencia, escríbenos.',
    pt: 'Não damos datas; a ordem pode mudar conforme o que os utilizadores pedirem. Se tens uma sugestão, escreve-nos.',
    de: 'Termine nennen wir nicht; die Reihenfolge kann sich nach den Wünschen der Nutzer ändern. Hast du einen Vorschlag, schreib uns.',
    fr: 'Nous ne donnons pas de dates ; l\'ordre peut changer selon les demandes des utilisateurs. Une suggestion ? Écrivez-nous.',
  },
  roadmapNext: { tr: 'Sırada', en: 'Up next', fa: 'در نوبت', ar: 'التالي', ru: 'На очереди', es: 'Lo siguiente', pt: 'A seguir', de: 'Als Nächstes', fr: 'Prochainement' },
  roadmapLater: { tr: 'Değerlendiriliyor', en: 'Being considered', fa: 'در حال بررسی', ar: 'قيد الدراسة', ru: 'Рассматривается', es: 'En estudio', pt: 'Em estudo', de: 'In Prüfung', fr: 'À l\'étude' },
  roadmapSuggest: { tr: 'Öneri gönder', en: 'Send a suggestion', fa: 'فرستادن پیشنهاد', ar: 'أرسل اقتراحاً', ru: 'Отправить предложение', es: 'Enviar una sugerencia', pt: 'Enviar uma sugestão', de: 'Vorschlag senden', fr: 'Envoyer une suggestion' },
  changesTitle: { tr: 'Yapılanlar', en: 'What changed', fa: 'تغییرات انجام‌شده', ar: 'ما تغيّر', ru: 'Что изменилось', es: 'Lo que cambió', pt: 'O que mudou', de: 'Was sich geändert hat', fr: 'Ce qui a changé' },
  seeHelp: { tr: 'Yardıma dön', en: 'Back to help', fa: 'بازگشت به راهنما', ar: 'العودة إلى المساعدة', ru: 'К помощи', es: 'Volver a la ayuda', pt: 'Voltar à ajuda', de: 'Zur Hilfe', fr: 'Retour à l\'aide' },
};

const HELP: { q: L9; a: L9 }[] = [
  {
    q: { tr: 'Nasıl başlarım?', en: 'How do I get started?', fa: 'چطور شروع کنم؟', ar: 'كيف أبدأ؟', ru: 'С чего начать?', es: '¿Cómo empiezo?', pt: 'Como começo?', de: 'Wie fange ich an?', fr: 'Comment commencer ?' },
    a: {
      tr: '"Journallerim" sayfasında "Yeni Journal" ile bir journal aç. Sonra işlemlerini elle gir, broker raporunu içe aktar ya da MetaTrader\'ı bağla. Kayıt olmadan önce "Ücretsiz Başla" ile her şeyi örnek verilerle deneyebilirsin.',
      en: 'Open a journal with "New Journal" on the "My Journals" page. Then enter trades by hand, import your broker\'s report or connect MetaTrader. Before signing up you can try everything with sample data from "Get Started".',
      fa: 'در صفحه «ژورنال‌های من» با «ژورنال جدید» یک ژورنال بساز. بعد معاملاتت را دستی وارد کن، گزارش بروکر را وارد کن یا متاتریدر را وصل کن. قبل از ثبت‌نام می‌توانی با «شروع رایگان» همه‌چیز را با داده‌های نمونه امتحان کنی.',
      ar: 'افتح سجلاً عبر «سجل جديد» في صفحة «سجلاتي». ثم أدخل صفقاتك يدوياً أو استورد تقرير الوسيط أو اربط ميتاتريدر. وقبل التسجيل يمكنك تجربة كل شيء ببيانات تجريبية عبر «ابدأ مجاناً».',
      ru: 'Создайте журнал кнопкой «Новый журнал» на странице «Мои журналы». Затем вносите сделки вручную, импортируйте отчёт брокера или подключите MetaTrader. До регистрации всё можно попробовать на демо-данных через «Начать бесплатно».',
      es: 'Abre un diario con «Nuevo diario» en la página «Mis diarios». Después registra operaciones a mano, importa el informe de tu bróker o conecta MetaTrader. Antes de registrarte puedes probarlo todo con datos de ejemplo desde «Empieza gratis».',
      pt: 'Abre um diário com «Novo diário» na página «Os meus diários». Depois regista operações à mão, importa o relatório da corretora ou liga o MetaTrader. Antes de te registares podes experimentar tudo com dados de exemplo em «Começar grátis».',
      de: 'Lege auf der Seite „Meine Journale“ mit „Neues Journal“ ein Journal an. Dann erfasst du Trades von Hand, importierst den Bericht deines Brokers oder verbindest MetaTrader. Vor der Anmeldung kannst du über „Kostenlos starten“ alles mit Beispieldaten ausprobieren.',
      fr: 'Créez un journal avec « Nouveau journal » sur la page « Mes journaux ». Saisissez ensuite vos trades à la main, importez le rapport de votre courtier ou connectez MetaTrader. Avant de vous inscrire, vous pouvez tout essayer avec des données d\'exemple via « Commencer gratuitement ».',
    },
  },
  {
    q: { tr: 'MetaTrader\'ı nasıl bağlarım?', en: 'How do I connect MetaTrader?', fa: 'چطور متاتریدر را وصل کنم؟', ar: 'كيف أربط ميتاتريدر؟', ru: 'Как подключить MetaTrader?', es: '¿Cómo conecto MetaTrader?', pt: 'Como ligo o MetaTrader?', de: 'Wie verbinde ich MetaTrader?', fr: 'Comment connecter MetaTrader ?' },
    a: {
      tr: 'Journal\'ın içinde "MetaTrader"e bas ve dört adımı izle: eklentiyi (EA) indir, MetaTrader\'da WebRequest iznini ver, anahtarını oluştur, EA\'yı bir grafiğe sürükleyip anahtarı yapıştır. Açtığın pozisyonlar journal\'a hemen yazılır, kapanınca sonuçla tamamlanır. MetaTrader 4 ve MetaTrader 5 destekleniyor; MetaTrader ekranında önce sürümünü seç.',
      en: 'Inside a journal, press "MetaTrader" and follow the four steps: download the add-on (EA), allow WebRequest in MetaTrader, create your key, then drag the EA onto a chart and paste the key. Positions you open are written to the journal right away and completed with the result when they close. MetaTrader 4 and MetaTrader 5 are supported; choose your version first on the MetaTrader screen.',
      fa: 'داخل ژورنال روی «متاتریدر» بزن و چهار مرحله را دنبال کن: افزونه (EA) را دانلود کن، در متاتریدر اجازه WebRequest را بده، کلیدت را بساز، سپس EA را روی یک چارت بکش و کلید را بچسبان. پوزیشن‌هایی که باز می‌کنی فوراً در ژورنال ثبت می‌شوند و هنگام بسته شدن با نتیجه کامل می‌شوند. متاتریدر ۴ و متاتریدر ۵ پشتیبانی می‌شوند؛ اول در صفحه متاتریدر نسخه‌ات را انتخاب کن.',
      ar: 'داخل السجل اضغط «ميتاتريدر» واتبع الخطوات الأربع: نزّل الإضافة (EA)، واسمح بـ WebRequest في ميتاتريدر، وأنشئ مفتاحك، ثم اسحب الـ EA إلى رسم بياني والصق المفتاح. تُكتب المراكز التي تفتحها في السجل فوراً وتُستكمل بالنتيجة عند إغلاقها. ميتاتريدر 4 وميتاتريدر 5 مدعومان؛ اختر إصدارك أولاً في شاشة ميتاتريدر.',
      ru: 'В журнале нажмите «MetaTrader» и пройдите четыре шага: скачайте советник (EA), разрешите WebRequest в MetaTrader, создайте ключ, перетащите EA на график и вставьте ключ. Открытые позиции сразу попадают в журнал и дополняются результатом при закрытии. Поддерживаются MetaTrader 4 и MetaTrader 5 — сначала выберите версию на экране MetaTrader.',
      es: 'Dentro de un diario pulsa «MetaTrader» y sigue los cuatro pasos: descarga el complemento (EA), permite WebRequest en MetaTrader, crea tu clave y arrastra el EA a un gráfico pegando la clave. Las posiciones que abres se escriben en el diario al momento y se completan con el resultado al cerrarse. Compatible con MetaTrader 4 y MetaTrader 5; elige primero tu versión en la pantalla de MetaTrader.',
      pt: 'Dentro de um diário carrega em «MetaTrader» e segue os quatro passos: descarrega o complemento (EA), permite o WebRequest no MetaTrader, cria a tua chave e arrasta o EA para um gráfico colando a chave. As posições que abres são registadas logo no diário e completadas com o resultado quando fecham. Compatível com MetaTrader 4 e MetaTrader 5; escolhe primeiro a tua versão no ecrã do MetaTrader.',
      de: 'Drücke im Journal auf „MetaTrader“ und folge den vier Schritten: Add-on (EA) herunterladen, WebRequest in MetaTrader erlauben, Schlüssel erstellen, EA auf einen Chart ziehen und den Schlüssel einfügen. Eröffnete Positionen landen sofort im Journal und werden beim Schließen mit dem Ergebnis ergänzt. Unterstützt werden MetaTrader 4 und MetaTrader 5 – wähle zuerst deine Version auf dem MetaTrader-Bildschirm.',
      fr: 'Dans un journal, appuyez sur « MetaTrader » et suivez les quatre étapes : téléchargez le module (EA), autorisez WebRequest dans MetaTrader, créez votre clé, puis glissez l\'EA sur un graphique et collez la clé. Les positions ouvertes sont inscrites aussitôt dans le journal et complétées avec le résultat à leur clôture. MetaTrader 4 et MetaTrader 5 sont pris en charge ; choisissez d\'abord votre version sur l\'écran MetaTrader.',
    },
  },
  {
    q: { tr: 'Bir anahtarı iki MetaTrader hesabında kullanabilir miyim?', en: 'Can I use one key on two MetaTrader accounts?', fa: 'آیا می‌توانم یک کلید را در دو حساب متاتریدر استفاده کنم؟', ar: 'هل يمكنني استخدام مفتاح واحد في حسابين على ميتاتريدر؟', ru: 'Можно ли использовать один ключ на двух счетах MetaTrader?', es: '¿Puedo usar una clave en dos cuentas de MetaTrader?', pt: 'Posso usar uma chave em duas contas MetaTrader?', de: 'Kann ich einen Schlüssel für zwei MetaTrader-Konten nutzen?', fr: 'Puis-je utiliser une clé sur deux comptes MetaTrader ?' },
    a: {
      tr: 'Hayır. Her anahtar ilk bağlandığı hesaba kilitlenir; böylece bir hesabın işlemleri yanlış journal\'a gitmez. Her hesap için ayrı bir anahtar oluştur. Grafikte "başka bir MetaTrader hesabına bağlı" yazısını görürsen sebebi budur.',
      en: 'No. Each key locks to the first account it connects from, so one account\'s trades never end up in the wrong journal. Create a separate key for each account. If the chart says the key is "linked to another MetaTrader account", that\'s why.',
      fa: 'نه. هر کلید به اولین حسابی که از آن وصل شود قفل می‌شود تا معاملات یک حساب به ژورنال اشتباه نرود. برای هر حساب کلید جداگانه بساز. اگر روی چارت پیام «به حساب متاتریدر دیگری وصل است» را دیدی، دلیلش همین است.',
      ar: 'لا. يُقفل كل مفتاح على أول حساب يتصل منه حتى لا تذهب صفقات حساب إلى سجل خاطئ. أنشئ مفتاحاً منفصلاً لكل حساب. وإن ظهرت على الرسم رسالة «مرتبط بحساب ميتاتريدر آخر» فهذا هو السبب.',
      ru: 'Нет. Каждый ключ закрепляется за первым счётом, с которого подключился, чтобы сделки одного счёта не попали в чужой журнал. Для каждого счёта создайте отдельный ключ. Сообщение на графике «привязан к другому счёту MetaTrader» означает именно это.',
      es: 'No. Cada clave queda ligada a la primera cuenta desde la que se conecta, para que las operaciones de una cuenta nunca acaben en el diario equivocado. Crea una clave para cada cuenta. Si el gráfico dice que la clave está «vinculada a otra cuenta de MetaTrader», es por eso.',
      pt: 'Não. Cada chave fica presa à primeira conta a partir da qual se liga, para que as operações de uma conta nunca vão para o diário errado. Cria uma chave para cada conta. Se o gráfico disser que a chave está «ligada a outra conta MetaTrader», é por isso.',
      de: 'Nein. Jeder Schlüssel wird an das erste Konto gebunden, von dem er sich verbindet, damit die Trades eines Kontos nie im falschen Journal landen. Erstelle für jedes Konto einen eigenen Schlüssel. Meldet der Chart „mit einem anderen MetaTrader-Konto verknüpft“, ist das der Grund.',
      fr: 'Non. Chaque clé se verrouille sur le premier compte qui l\'utilise, pour que les trades d\'un compte n\'arrivent jamais dans le mauvais journal. Créez une clé par compte. Si le graphique indique que la clé est « liée à un autre compte MetaTrader », c\'est pour cette raison.',
    },
  },
  {
    q: { tr: 'Broker raporumu nasıl içe aktarırım?', en: 'How do I import my broker report?', fa: 'چطور گزارش بروکرم را وارد کنم؟', ar: 'كيف أستورد تقرير الوسيط؟', ru: 'Как импортировать отчёт брокера?', es: '¿Cómo importo el informe de mi bróker?', pt: 'Como importo o relatório da corretora?', de: 'Wie importiere ich den Bericht meines Brokers?', fr: 'Comment importer le rapport de mon courtier ?' },
    a: {
      tr: '"İçe Aktar"a bas, işlemlerin gideceği journal\'ı seç ve raporu yükle. MT5, MT4, cTrader, TradeLocker, DXtrade ve Match-Trader raporları tanınır; tanımadığı bir dosyada sütunları kendin eşlersin. Aynı raporu tekrar yüklersen yalnız yeni işlemler eklenir. İşleme girerken yazdığın bekleyen bir kayıt varsa yeni satır açılmaz, o kayıt tamamlanır.',
      en: 'Press "Import", choose the journal the trades go to and upload the report. Reports from MT5, MT4, cTrader, TradeLocker, DXtrade and Match-Trader are recognised; for an unfamiliar file you map the columns yourself. Upload the same report again and only new trades are added. If you logged a trade before it closed, that row is completed instead of a new one being added.',
      fa: 'روی «وارد کردن» بزن، ژورنال مقصد را انتخاب کن و گزارش را بارگذاری کن. گزارش‌های MT5، MT4، cTrader، TradeLocker، DXtrade و Match-Trader شناخته می‌شوند؛ برای فایل ناشناس ستون‌ها را خودت تطبیق می‌دهی. اگر همان گزارش را دوباره بارگذاری کنی فقط معاملات جدید اضافه می‌شوند. اگر معامله‌ای را قبل از بسته شدن ثبت کرده باشی، به‌جای ردیف جدید همان کامل می‌شود.',
      ar: 'اضغط «استيراد» واختر السجل الذي تذهب إليه الصفقات وارفع التقرير. تُعرف تقارير MT5 وMT4 وcTrader وTradeLocker وDXtrade وMatch-Trader؛ وفي الملف غير المعروف تطابق الأعمدة بنفسك. إن رفعت التقرير نفسه مجدداً تُضاف الصفقات الجديدة فقط. وإن سجّلت صفقة قبل إغلاقها يُستكمل ذلك السطر بدلاً من إضافة سطر جديد.',
      ru: 'Нажмите «Импорт», выберите журнал и загрузите отчёт. Распознаются отчёты MT5, MT4, cTrader, TradeLocker, DXtrade и Match-Trader; для незнакомого файла столбцы сопоставляются вручную. При повторной загрузке того же отчёта добавляются только новые сделки. Если сделка была записана до закрытия, дополняется эта запись, а не создаётся новая.',
      es: 'Pulsa «Importar», elige el diario de destino y sube el informe. Se reconocen informes de MT5, MT4, cTrader, TradeLocker, DXtrade y Match-Trader; en un archivo desconocido asignas tú las columnas. Si subes el mismo informe otra vez solo se añaden las operaciones nuevas. Si registraste una operación antes de que cerrara, se completa esa fila en lugar de añadir otra.',
      pt: 'Carrega em «Importar», escolhe o diário de destino e envia o relatório. São reconhecidos relatórios do MT5, MT4, cTrader, TradeLocker, DXtrade e Match-Trader; num ficheiro desconhecido associas tu as colunas. Se enviares o mesmo relatório outra vez, só entram as operações novas. Se registaste uma operação antes de fechar, essa linha é completada em vez de surgir outra.',
      de: 'Drücke „Importieren“, wähle das Ziel-Journal und lade den Bericht hoch. Berichte von MT5, MT4, cTrader, TradeLocker, DXtrade und Match-Trader werden erkannt; bei unbekannten Dateien ordnest du die Spalten selbst zu. Lädst du denselben Bericht erneut hoch, kommen nur neue Trades hinzu. Hast du einen Trade vor dem Schließen erfasst, wird diese Zeile ergänzt statt eine neue anzulegen.',
      fr: 'Appuyez sur « Importer », choisissez le journal de destination et téléversez le rapport. Les rapports MT5, MT4, cTrader, TradeLocker, DXtrade et Match-Trader sont reconnus ; pour un fichier inconnu, vous associez vous-même les colonnes. Si vous importez à nouveau le même rapport, seuls les nouveaux trades sont ajoutés. Si vous aviez saisi un trade avant sa clôture, c\'est cette ligne qui est complétée.',
    },
  },
  {
    q: { tr: 'Ücretsiz planın sınırları neler?', en: 'What are the Free plan\'s limits?', fa: 'محدودیت‌های پلن رایگان چیست؟', ar: 'ما حدود الخطة المجانية؟', ru: 'Какие ограничения у бесплатного плана?', es: '¿Qué límites tiene el plan gratuito?', pt: 'Quais são os limites do plano gratuito?', de: 'Welche Grenzen hat der kostenlose Plan?', fr: 'Quelles sont les limites du plan gratuit ?' },
    a: {
      tr: '1 journal ve günde 2 işlem. O günün üçüncü işlemi silinmez, kilitli kaydedilir: listede saati, sembolü ve yönü görünür, sonucu gizlidir ve istatistiklere girmez; Pro\'ya geçince hepsi açılır. Ücretsiz planda işlem ve journal silinemez, ama hatalı bir işlemi düzenleyebilirsin. Sesli not ve yapay zekâ Pro\'da.',
      en: 'One journal and 2 trades a day. A third trade that day isn\'t deleted; it\'s saved locked: its time, symbol and side show in the list, its result is hidden and it stays out of the statistics until you upgrade, when all of them open. Trades and journals can\'t be deleted on Free, but you can edit a trade that\'s wrong. Voice notes and AI are Pro features.',
      fa: 'یک ژورنال و ۲ معامله در روز. معامله سوم آن روز حذف نمی‌شود و قفل ذخیره می‌شود: ساعت، نماد و جهتش در فهرست دیده می‌شود، نتیجه‌اش پنهان است و در آمار حساب نمی‌شود؛ با Pro همه باز می‌شوند. در پلن رایگان معامله و ژورنال حذف نمی‌شود، ولی معامله اشتباه را می‌توانی ویرایش کنی. یادداشت صوتی و هوش مصنوعی در Pro است.',
      ar: 'سجل واحد وصفقتان يومياً. الصفقة الثالثة في ذلك اليوم لا تُحذف بل تُحفظ مقفلة: يظهر وقتها ورمزها واتجاهها في القائمة، وتبقى نتيجتها مخفية وخارج الإحصاءات حتى الترقية حيث تُفتح كلها. لا يمكن حذف الصفقات والسجلات في الخطة المجانية، لكن يمكنك تعديل صفقة خاطئة. الملاحظات الصوتية والذكاء الاصطناعي في Pro.',
      ru: 'Один журнал и 2 сделки в день. Третья сделка за день не удаляется, а сохраняется заблокированной: в списке видны время, символ и направление, результат скрыт и не учитывается в статистике — в Pro откроются все. В бесплатном плане сделки и журналы нельзя удалить, но ошибочную сделку можно отредактировать. Голосовые заметки и ИИ — в Pro.',
      es: 'Un diario y 2 operaciones al día. La tercera operación del día no se borra: se guarda bloqueada. En la lista se ven su hora, símbolo y dirección, su resultado queda oculto y fuera de las estadísticas hasta que pases a Pro, cuando se abren todas. En el plan gratuito no se pueden borrar operaciones ni diarios, pero puedes editar una operación errónea. Las notas de voz y la IA son de Pro.',
      pt: 'Um diário e 2 operações por dia. A terceira operação do dia não é apagada: fica guardada bloqueada. Na lista vês a hora, o símbolo e a direção, o resultado fica oculto e fora das estatísticas até passares para Pro, quando abrem todas. No plano gratuito não é possível apagar operações nem diários, mas podes editar uma operação errada. Notas de voz e IA são do Pro.',
      de: 'Ein Journal und 2 Trades pro Tag. Ein dritter Trade an dem Tag wird nicht gelöscht, sondern gesperrt gespeichert: Uhrzeit, Symbol und Richtung sind in der Liste sichtbar, das Ergebnis bleibt verborgen und außerhalb der Statistik, bis du auf Pro wechselst und alle sich öffnen. Im kostenlosen Plan lassen sich Trades und Journale nicht löschen, einen falschen Trade kannst du aber bearbeiten. Sprachnotizen und KI gibt es in Pro.',
      fr: 'Un journal et 2 trades par jour. Un troisième trade dans la journée n\'est pas supprimé : il est enregistré verrouillé. Son heure, son symbole et son sens apparaissent dans la liste, son résultat reste masqué et hors statistiques jusqu\'au passage à Pro, où tout s\'ouvre. En gratuit, les trades et journaux ne peuvent pas être supprimés, mais vous pouvez corriger un trade erroné. Les notes vocales et l\'IA sont dans Pro.',
    },
  },
  {
    q: { tr: 'Pro denemesi nasıl çalışır?', en: 'How does the Pro trial work?', fa: 'آزمایش Pro چطور کار می‌کند؟', ar: 'كيف تعمل تجربة Pro؟', ru: 'Как работает пробный Pro?', es: '¿Cómo funciona la prueba de Pro?', pt: 'Como funciona o teste do Pro?', de: 'Wie funktioniert der Pro-Test?', fr: 'Comment fonctionne l\'essai Pro ?' },
    a: {
      tr: 'Bir sınıra ilk takıldığında açılan pencerede "Pro\'yu 3 gün ücretsiz dene"ye bas. Kart istenmez; üç gün sonra kendiliğinden Ücretsiz plana dönersin ve ücret alınmaz. Deneme her hesap, e-posta adresi ve MetaTrader hesabı için bir kez verilir.',
      en: 'The first time you hit a limit, press "Try Pro free for 3 days" in the dialog that opens. No card is needed; after three days you drop back to Free on your own and nothing is charged. The trial is given once per account, email address and MetaTrader account.',
      fa: 'اولین باری که به یک محدودیت برسی، در پنجره‌ای که باز می‌شود روی «Pro را ۳ روز رایگان امتحان کن» بزن. کارت لازم نیست؛ بعد از سه روز خودکار به پلن رایگان برمی‌گردی و هزینه‌ای گرفته نمی‌شود. آزمایش برای هر حساب، ایمیل و حساب متاتریدر فقط یک بار داده می‌شود.',
      ar: 'عند بلوغ أول حد، اضغط «جرّب Pro مجاناً لمدة 3 أيام» في النافذة التي تظهر. لا حاجة لبطاقة؛ بعد ثلاثة أيام تعود إلى المجانية تلقائياً دون أي رسوم. تُمنح التجربة مرة واحدة لكل حساب وبريد إلكتروني وحساب ميتاتريدر.',
      ru: 'Когда вы впервые упрётесь в лимит, нажмите «Попробовать Pro 3 дня бесплатно» в появившемся окне. Карта не нужна; через три дня вы сами вернётесь на бесплатный план, ничего не списывается. Пробный период даётся один раз на аккаунт, адрес почты и счёт MetaTrader.',
      es: 'La primera vez que llegues a un límite, pulsa «Prueba Pro gratis 3 días» en la ventana que aparece. No se pide tarjeta; a los tres días vuelves solo al plan gratuito y no se cobra nada. La prueba se da una vez por cuenta, correo y cuenta de MetaTrader.',
      pt: 'Na primeira vez que chegares a um limite, carrega em «Experimenta o Pro grátis por 3 dias» na janela que abre. Não é pedido cartão; ao fim de três dias voltas sozinho ao plano gratuito e nada é cobrado. O teste é dado uma vez por conta, email e conta MetaTrader.',
      de: 'Wenn du zum ersten Mal an eine Grenze stößt, drücke im erscheinenden Fenster „Pro 3 Tage kostenlos testen“. Eine Karte ist nicht nötig; nach drei Tagen wechselst du von selbst zurück zu Free, und es wird nichts berechnet. Der Test gilt einmal pro Konto, E-Mail-Adresse und MetaTrader-Konto.',
      fr: 'La première fois que vous atteignez une limite, appuyez sur « Essayer Pro gratuitement 3 jours » dans la fenêtre qui s\'ouvre. Aucune carte n\'est demandée ; au bout de trois jours vous repassez seul en gratuit et rien n\'est facturé. L\'essai est accordé une fois par compte, adresse e-mail et compte MetaTrader.',
    },
  },
  {
    q: { tr: 'Disiplin analizi neye bakar?', en: 'What does the discipline analysis look at?', fa: 'تحلیل انضباط به چه چیزی نگاه می‌کند؟', ar: 'إلامَ ينظر تحليل الانضباط؟', ru: 'Что учитывает анализ дисциплины?', es: '¿Qué mira el análisis de disciplina?', pt: 'O que analisa a análise de disciplina?', de: 'Was prüft die Disziplinanalyse?', fr: 'Qu\'examine l\'analyse de discipline ?' },
    a: {
      tr: 'Dört alışkanlığa: kayıptan sonra 15 dakika içinde yeniden girmek, kayıptan sonra riski bir buçuk katından fazla büyütmek, olağan gününün iki katından fazla işlem açmak ve her zamanki saatlerinin dışında işlem yapmak. Her birinin sana kaça mal olduğunu gösterir. Ayrıca bir şey doldurman gerekmez; işlemlerinin tarih, risk ve sonucundan çıkarılır.',
      en: 'Four habits: re-entering within 15 minutes of a loss, raising risk by more than half after a loss, trading more than twice your usual day, and trading outside your usual hours. It shows what each one cost you. You don\'t fill in anything extra; it\'s worked out from your trades\' dates, risk and results.',
      fa: 'چهار عادت: ورود دوباره در ۱۵ دقیقه پس از ضرر، افزایش ریسک بیش از یک‌ونیم برابر پس از ضرر، بیش از دو برابر روز عادی معامله کردن و معامله بیرون از ساعت‌های همیشگی. نشان می‌دهد هر کدام چقدر برایت هزینه داشته است. لازم نیست چیز اضافه‌ای پر کنی؛ از تاریخ، ریسک و نتیجه معاملاتت محاسبه می‌شود.',
      ar: 'أربع عادات: الدخول مجدداً خلال 15 دقيقة من خسارة، ورفع المخاطرة أكثر من مرة ونصف بعد خسارة، والتداول بأكثر من ضعف يومك المعتاد، والتداول خارج ساعاتك المعتادة. ويُظهر كم كلّفتك كل واحدة. لا تملأ شيئاً إضافياً؛ يُستخرج من تواريخ صفقاتك ومخاطرتها ونتائجها.',
      ru: 'Четыре привычки: повторный вход в течение 15 минут после убытка, рост риска более чем в полтора раза после убытка, торговля больше чем вдвое против обычного дня и сделки вне привычных часов. Показывается, во сколько обошлась каждая. Ничего дополнительно заполнять не нужно — всё берётся из дат, риска и результатов сделок.',
      es: 'Cuatro hábitos: volver a entrar en los 15 minutos siguientes a una pérdida, subir el riesgo más de la mitad tras una pérdida, operar más del doble de tu día habitual y operar fuera de tus horas habituales. Muestra cuánto te costó cada uno. No rellenas nada extra: se calcula a partir de las fechas, el riesgo y los resultados de tus operaciones.',
      pt: 'Quatro hábitos: voltar a entrar nos 15 minutos seguintes a uma perda, aumentar o risco mais de metade depois de uma perda, operar mais do dobro do teu dia habitual e operar fora das tuas horas habituais. Mostra quanto te custou cada um. Não preenches nada extra: é calculado a partir das datas, do risco e dos resultados das operações.',
      de: 'Vier Gewohnheiten: Wiedereinstieg innerhalb von 15 Minuten nach einem Verlust, Risiko nach einem Verlust um mehr als die Hälfte erhöhen, mehr als doppelt so viel handeln wie an einem normalen Tag und außerhalb der üblichen Zeiten handeln. Es zeigt, was dich jede davon gekostet hat. Du musst nichts zusätzlich ausfüllen; alles ergibt sich aus Datum, Risiko und Ergebnis deiner Trades.',
      fr: 'Quatre habitudes : reprendre position dans les 15 minutes après une perte, augmenter le risque de plus de moitié après une perte, trader plus du double d\'une journée habituelle et trader en dehors de vos heures habituelles. Elle montre ce que chacune vous a coûté. Rien à remplir en plus : tout est déduit des dates, du risque et des résultats de vos trades.',
    },
  },
  {
    q: { tr: 'Prop hesabımı nasıl takip ederim?', en: 'How do I track a prop account?', fa: 'چطور حساب پراپ را دنبال کنم؟', ar: 'كيف أتابع حساب Prop؟', ru: 'Как вести проп-счёт?', es: '¿Cómo sigo una cuenta prop?', pt: 'Como acompanho uma conta prop?', de: 'Wie verfolge ich ein Prop-Konto?', fr: 'Comment suivre un compte prop ?' },
    a: {
      tr: 'Yeni journal açarken türünü "Prop" seç; kâr hedefini, günlük ve toplam kayıp sınırlarını gir. Journal\'ın tepesindeki sayaç her işlemden sonra sınırlara ne kadar kaldığını gösterir. Bir firma seçmeden önce "Prop Değerlendirme" sayfasında kurallarını 12 kritere göre puanlayıp üç firmayı yan yana koyabilirsin.',
      en: 'When you open a new journal, choose the "Prop" type and enter the profit target and the daily and overall loss limits. The counter at the top of the journal shows after every trade how much room is left. Before picking a firm, you can score its rules on 12 criteria on the "Prop Review" page and put three firms side by side.',
      fa: 'هنگام ساخت ژورنال جدید نوع «پراپ» را انتخاب کن و هدف سود و حدود ضرر روزانه و کل را وارد کن. شمارنده بالای ژورنال پس از هر معامله نشان می‌دهد چقدر تا حدود فاصله داری. پیش از انتخاب یک شرکت می‌توانی در صفحه «ارزیابی پراپ» قوانینش را با ۱۲ معیار امتیاز بدهی و سه شرکت را کنار هم بگذاری.',
      ar: 'عند فتح سجل جديد اختر النوع «Prop» وأدخل هدف الربح وحدّي الخسارة اليومي والإجمالي. يُظهر العدّاد أعلى السجل بعد كل صفقة كم بقي لك. وقبل اختيار شركة يمكنك تقييم قواعدها وفق 12 معياراً في صفحة «تقييم Prop» ووضع ثلاث شركات جنباً إلى جنب.',
      ru: 'При создании журнала выберите тип «Проп» и укажите цель по прибыли, дневной и общий лимиты убытка. Счётчик вверху журнала после каждой сделки показывает запас до лимитов. Перед выбором фирмы можно оценить её правила по 12 критериям на странице «Оценка проп-фирм» и сравнить три фирмы.',
      es: 'Al abrir un diario nuevo elige el tipo «Prop» e introduce el objetivo de beneficio y los límites de pérdida diaria y total. El contador en la parte superior del diario muestra tras cada operación cuánto margen te queda. Antes de elegir una firma puedes puntuar sus reglas en 12 criterios en la página «Evaluación prop» y comparar tres firmas.',
      pt: 'Ao abrir um diário novo escolhe o tipo «Prop» e indica o objetivo de lucro e os limites de perda diária e total. O contador no topo do diário mostra depois de cada operação quanta margem te resta. Antes de escolher uma firma podes pontuar as regras em 12 critérios na página «Avaliação prop» e comparar três firmas.',
      de: 'Wähle beim Anlegen eines Journals den Typ „Prop“ und trage Gewinnziel sowie tägliche und gesamte Verlustgrenze ein. Der Zähler oben im Journal zeigt nach jedem Trade, wie viel Luft noch bleibt. Bevor du eine Firma wählst, kannst du ihre Regeln auf der Seite „Prop-Bewertung“ nach 12 Kriterien bewerten und drei Firmen vergleichen.',
      fr: 'En créant un journal, choisissez le type « Prop » et saisissez l\'objectif de profit ainsi que les limites de perte journalière et totale. Le compteur en haut du journal indique après chaque trade la marge restante. Avant de choisir une firme, vous pouvez noter ses règles sur 12 critères dans la page « Évaluation prop » et comparer trois firmes.',
    },
  },
  {
    q: { tr: 'İşlemlerimi Excel\'e aktarabilir miyim?', en: 'Can I export my trades to Excel?', fa: 'آیا می‌توانم معاملاتم را به اکسل ببرم؟', ar: 'هل يمكنني تصدير صفقاتي إلى Excel؟', ru: 'Можно ли выгрузить сделки в Excel?', es: '¿Puedo exportar mis operaciones a Excel?', pt: 'Posso exportar as operações para o Excel?', de: 'Kann ich meine Trades nach Excel exportieren?', fr: 'Puis-je exporter mes trades vers Excel ?' },
    a: {
      tr: 'Evet. İşlemler listesinde "Excel\'e aktar"a bas: seçtiğin işlemler varsa yalnız onlar, yoksa bütün journal indirilir. Dosya Excel\'de çift tıklayınca doğru sütunlarla açılır.',
      en: 'Yes. In the trade list press "Export to Excel": if you\'ve selected trades only those are exported, otherwise the whole journal. The file opens in Excel with the right columns on a double-click.',
      fa: 'بله. در فهرست معاملات روی «خروجی اکسل» بزن: اگر معاملاتی را انتخاب کرده باشی فقط همان‌ها، وگرنه کل ژورنال دانلود می‌شود. فایل با دوبار کلیک در اکسل با ستون‌های درست باز می‌شود.',
      ar: 'نعم. في قائمة الصفقات اضغط «تصدير إلى Excel»: إن حددت صفقات يُصدَّر ما حددته فقط، وإلا فالسجل كاملاً. يُفتح الملف في Excel بالأعمدة الصحيحة بنقرة مزدوجة.',
      ru: 'Да. В списке сделок нажмите «Экспорт в Excel»: если сделки выделены, выгрузятся только они, иначе весь журнал. Файл открывается в Excel двойным щелчком с правильными столбцами.',
      es: 'Sí. En la lista de operaciones pulsa «Exportar a Excel»: si has seleccionado operaciones se exportan solo esas; si no, todo el diario. El archivo se abre en Excel con doble clic y con las columnas correctas.',
      pt: 'Sim. Na lista de operações carrega em «Exportar para Excel»: se selecionaste operações, só essas são exportadas; caso contrário, todo o diário. O ficheiro abre no Excel com duplo clique e com as colunas certas.',
      de: 'Ja. Drücke in der Trade-Liste auf „Nach Excel exportieren“: Sind Trades ausgewählt, werden nur diese exportiert, sonst das ganze Journal. Die Datei öffnet sich per Doppelklick in Excel mit den richtigen Spalten.',
      fr: 'Oui. Dans la liste des trades, appuyez sur « Exporter vers Excel » : si des trades sont sélectionnés, seuls ceux-ci sont exportés, sinon tout le journal. Le fichier s\'ouvre dans Excel d\'un double clic avec les bonnes colonnes.',
    },
  },
  {
    q: { tr: 'Hesabımı ve verilerimi nasıl silerim?', en: 'How do I delete my account and data?', fa: 'چطور حساب و داده‌هایم را حذف کنم؟', ar: 'كيف أحذف حسابي وبياناتي؟', ru: 'Как удалить аккаунт и данные?', es: '¿Cómo elimino mi cuenta y mis datos?', pt: 'Como apago a conta e os dados?', de: 'Wie lösche ich mein Konto und meine Daten?', fr: 'Comment supprimer mon compte et mes données ?' },
    a: {
      tr: 'Sol alttaki adına tıkla, açılan "Hesabım" penceresinde "Hesabımı ve bütün verilerimi sil"i seç ve onayla. Journal\'ların, işlemlerin, notların, fotoğrafların ve MetaTrader bağlantıların kalıcı olarak silinir; bu geri alınamaz.',
      en: 'Click your name at the bottom left, choose "Delete my account and all my data" in the "My account" window and confirm. Your journals, trades, notes, photos and MetaTrader connections are permanently deleted; this can\'t be undone.',
      fa: 'روی نامت در پایین سمت چپ بزن، در پنجره «حساب من» گزینه «حذف حساب و همه داده‌هایم» را انتخاب و تأیید کن. ژورنال‌ها، معاملات، یادداشت‌ها، عکس‌ها و اتصال‌های متاتریدر برای همیشه حذف می‌شوند؛ این کار برگشت‌پذیر نیست.',
      ar: 'انقر على اسمك أسفل اليسار، واختر «حذف حسابي وكل بياناتي» في نافذة «حسابي» ثم أكّد. تُحذف سجلاتك وصفقاتك وملاحظاتك وصورك واتصالات ميتاتريدر نهائياً، ولا يمكن التراجع.',
      ru: 'Нажмите на своё имя внизу слева, в окне «Мой аккаунт» выберите «Удалить аккаунт и все данные» и подтвердите. Журналы, сделки, заметки, фото и подключения MetaTrader удаляются навсегда; отменить это нельзя.',
      es: 'Haz clic en tu nombre abajo a la izquierda, elige «Eliminar mi cuenta y todos mis datos» en la ventana «Mi cuenta» y confirma. Tus diarios, operaciones, notas, fotos y conexiones de MetaTrader se borran para siempre; no se puede deshacer.',
      pt: 'Clica no teu nome em baixo à esquerda, escolhe «Apagar a minha conta e todos os dados» na janela «A minha conta» e confirma. Os diários, operações, notas, fotos e ligações ao MetaTrader são apagados para sempre; não é possível desfazer.',
      de: 'Klicke unten links auf deinen Namen, wähle im Fenster „Mein Konto“ „Mein Konto und alle Daten löschen“ und bestätige. Journale, Trades, Notizen, Fotos und MetaTrader-Verbindungen werden endgültig gelöscht; das lässt sich nicht rückgängig machen.',
      fr: 'Cliquez sur votre nom en bas à gauche, choisissez « Supprimer mon compte et toutes mes données » dans la fenêtre « Mon compte » et confirmez. Vos journaux, trades, notes, photos et connexions MetaTrader sont supprimés définitivement ; c\'est irréversible.',
    },
  },
  {
    q: { tr: 'İşlemlerimi kimler görebilir?', en: 'Who can see my trades?', fa: 'چه کسانی معاملاتم را می‌بینند؟', ar: 'من يستطيع رؤية صفقاتي؟', ru: 'Кто видит мои сделки?', es: '¿Quién puede ver mis operaciones?', pt: 'Quem pode ver as minhas operações?', de: 'Wer kann meine Trades sehen?', fr: 'Qui peut voir mes trades ?' },
    a: {
      tr: 'Yalnızca sen. Her kayıt hesabına bağlı ve veritabanı, başka bir hesabın senin işlemlerini, notlarını ya da fotoğraflarını okumasına izin vermiyor. MetaTrader anahtarının tamamı saklanmıyor; yalnızca ilk ve son harfleri görünüyor. Verilerini istediğin an Hesabım penceresinden tamamen silebilirsin.',
      en: 'Only you. Every record is tied to your account, and the database does not let any other account read your trades, notes or photos. Your MetaTrader key is never stored in full — only its first and last characters are shown. You can delete all your data at any time from the My account window.',
      fa: 'فقط خودت. هر رکورد به حسابت متصل است و پایگاه داده اجازه نمی‌دهد حساب دیگری معاملات، یادداشت‌ها یا عکس‌هایت را بخواند. کلید متاتریدر هرگز کامل ذخیره نمی‌شود؛ فقط حروف اول و آخرش دیده می‌شود. هر وقت بخواهی می‌توانی همه داده‌هایت را از پنجره «حساب من» پاک کنی.',
      ar: 'أنت فقط. كل سجل مرتبط بحسابك، ولا تسمح قاعدة البيانات لأي حساب آخر بقراءة صفقاتك أو ملاحظاتك أو صورك. لا يُحفظ مفتاح ميتاتريدر كاملاً أبداً؛ تظهر أحرفه الأولى والأخيرة فقط. يمكنك حذف كل بياناتك في أي وقت من نافذة «حسابي».',
      ru: 'Только вы. Каждая запись привязана к вашему аккаунту, и база данных не позволяет другим аккаунтам читать ваши сделки, заметки или фото. Ключ MetaTrader целиком не хранится — видны только первые и последние символы. Удалить все данные можно в любой момент в окне «Мой аккаунт».',
      es: 'Solo tú. Cada registro está ligado a tu cuenta y la base de datos no deja que ninguna otra cuenta lea tus operaciones, notas o fotos. La clave de MetaTrader nunca se guarda completa: solo se ven sus primeros y últimos caracteres. Puedes borrar todos tus datos cuando quieras desde la ventana Mi cuenta.',
      pt: 'Só tu. Cada registo está ligado à tua conta e a base de dados não deixa nenhuma outra conta ler as tuas operações, notas ou fotos. A chave do MetaTrader nunca é guardada por inteiro — só se veem os primeiros e últimos caracteres. Podes apagar todos os teus dados quando quiseres na janela A minha conta.',
      de: 'Nur du. Jeder Eintrag gehört zu deinem Konto, und die Datenbank lässt kein anderes Konto deine Trades, Notizen oder Fotos lesen. Dein MetaTrader-Schlüssel wird nie vollständig gespeichert – nur die ersten und letzten Zeichen sind sichtbar. Alle Daten kannst du jederzeit im Fenster „Mein Konto“ löschen.',
      fr: 'Vous seul. Chaque enregistrement est lié à votre compte et la base de données ne permet à aucun autre compte de lire vos trades, notes ou photos. Votre clé MetaTrader n\'est jamais stockée en entier — seuls ses premiers et derniers caractères sont affichés. Vous pouvez supprimer toutes vos données à tout moment depuis la fenêtre Mon compte.',
    },
  },
  {
    q: { tr: 'Para birimini ve saat dilimini nasıl değiştiririm?', en: 'How do I change the currency and time zone?', fa: 'چطور واحد پول و منطقه زمانی را عوض کنم؟', ar: 'كيف أغيّر العملة والمنطقة الزمنية؟', ru: 'Как сменить валюту и часовой пояс?', es: '¿Cómo cambio la moneda y la zona horaria?', pt: 'Como mudo a moeda e o fuso horário?', de: 'Wie ändere ich Währung und Zeitzone?', fr: 'Comment changer la devise et le fuseau horaire ?' },
    a: {
      tr: 'Menünün altındaki adına tıkla; Hesabım penceresi açılır. Oradan tutarların hangi para biriminde gösterileceğini seçebilirsin. Saat dilimi bilgisayarından ya da telefonundan kendiliğinden alınır ve günlük işlem hakkı senin gününe göre sayılır.',
      en: 'Click your name at the bottom of the menu to open My account. There you choose the currency amounts are shown in. The time zone is taken from your computer or phone automatically, and the daily trade allowance is counted by your own day.',
      fa: 'روی نامت در پایین منو بزن تا پنجره «حساب من» باز شود. آنجا واحد پولی را که مبالغ با آن نمایش داده می‌شوند انتخاب می‌کنی. منطقه زمانی خودکار از کامپیوتر یا گوشی‌ات گرفته می‌شود و سهمیه روزانه معاملات بر اساس روز خودت شمرده می‌شود.',
      ar: 'اضغط على اسمك أسفل القائمة لفتح نافذة «حسابي». هناك تختار العملة التي تُعرض بها المبالغ. تؤخذ المنطقة الزمنية تلقائياً من حاسوبك أو هاتفك، ويُحسب الحد اليومي للصفقات حسب يومك أنت.',
      ru: 'Нажмите на своё имя внизу меню — откроется «Мой аккаунт». Там выбирается валюта, в которой показываются суммы. Часовой пояс берётся с компьютера или телефона автоматически, а дневной лимит сделок считается по вашим суткам.',
      es: 'Pulsa tu nombre al final del menú para abrir Mi cuenta. Allí eliges la moneda en la que se muestran los importes. La zona horaria se toma automáticamente de tu ordenador o móvil, y el límite diario de operaciones se cuenta según tu propio día.',
      pt: 'Carrega no teu nome no fundo do menu para abrir A minha conta. Aí escolhes a moeda em que os valores são mostrados. O fuso horário é lido automaticamente do computador ou telemóvel, e o limite diário de operações conta pelo teu próprio dia.',
      de: 'Klicke unten im Menü auf deinen Namen, um „Mein Konto“ zu öffnen. Dort wählst du die Währung, in der Beträge angezeigt werden. Die Zeitzone wird automatisch von Computer oder Handy übernommen, und das tägliche Trade-Limit richtet sich nach deinem eigenen Tag.',
      fr: 'Cliquez sur votre nom en bas du menu pour ouvrir Mon compte. Vous y choisissez la devise d\'affichage des montants. Le fuseau horaire est repris automatiquement de votre ordinateur ou téléphone, et la limite quotidienne de trades suit votre propre journée.',
    },
  },
  {
    q: { tr: 'Telefonda kullanabilir miyim?', en: 'Can I use it on my phone?', fa: 'می‌توانم با گوشی استفاده کنم؟', ar: 'هل يمكنني استخدامه على هاتفي؟', ru: 'Можно ли пользоваться с телефона?', es: '¿Puedo usarlo en el móvil?', pt: 'Posso usar no telemóvel?', de: 'Kann ich es auf dem Handy nutzen?', fr: 'Puis-je l\'utiliser sur mon téléphone ?' },
    a: {
      tr: 'Evet, tarayıcıdan. Ayrı bir uygulama indirmen gerekmiyor: iPhone\'da Safari\'de Paylaş → Ana Ekrana Ekle, Android\'de Chrome menüsünden Ana ekrana ekle. Simge journal\'ı doğrudan, tarayıcı çubuğu olmadan açar. MetaTrader eklentisi ise yalnızca bilgisayardaki MetaTrader 4 ya da 5\'te çalışır.',
      en: 'Yes, in the browser — there is nothing to download. On iPhone use Safari → Share → Add to Home Screen; on Android use Chrome\'s menu → Add to Home screen. The icon opens your journal directly, without the browser bar. The MetaTrader add-on itself only runs in MetaTrader 4 or 5 on a computer.',
      fa: 'بله، در مرورگر — چیزی برای دانلود نیست. در آیفون از Safari → اشتراک‌گذاری → افزودن به صفحه اصلی و در اندروید از منوی Chrome → افزودن به صفحه اصلی استفاده کن. آیکون، ژورنال را مستقیم و بدون نوار مرورگر باز می‌کند. افزونه متاتریدر فقط در متاتریدر ۴ یا ۵ روی کامپیوتر کار می‌کند.',
      ar: 'نعم، من المتصفح — لا حاجة لتنزيل شيء. في iPhone استخدم Safari ← مشاركة ← إضافة إلى الشاشة الرئيسية، وفي Android قائمة Chrome ← إضافة إلى الشاشة الرئيسية. تفتح الأيقونة سجلك مباشرة دون شريط المتصفح. أما إضافة ميتاتريدر فتعمل فقط في ميتاتريدر 4 أو 5 على الحاسوب.',
      ru: 'Да, в браузере — скачивать ничего не нужно. На iPhone: Safari → «Поделиться» → «На экран „Домой“»; на Android: меню Chrome → «Добавить на главный экран». Значок открывает журнал сразу, без панели браузера. Сам модуль для MetaTrader работает только в MetaTrader 4 или 5 на компьютере.',
      es: 'Sí, en el navegador; no hay nada que descargar. En iPhone usa Safari → Compartir → Añadir a pantalla de inicio; en Android, el menú de Chrome → Añadir a pantalla de inicio. El icono abre tu diario directamente, sin la barra del navegador. El complemento de MetaTrader solo funciona en MetaTrader 4 o 5 en un ordenador.',
      pt: 'Sim, no navegador — não há nada para descarregar. No iPhone usa Safari → Partilhar → Adicionar ao ecrã principal; no Android, o menu do Chrome → Adicionar ao ecrã principal. O ícone abre o diário diretamente, sem a barra do navegador. O complemento do MetaTrader só funciona no MetaTrader 4 ou 5 num computador.',
      de: 'Ja, im Browser – herunterladen musst du nichts. Auf dem iPhone: Safari → Teilen → Zum Home-Bildschirm; auf Android: Chrome-Menü → Zum Startbildschirm hinzufügen. Das Symbol öffnet dein Journal direkt, ohne Browserleiste. Das MetaTrader-Add-on selbst läuft nur in MetaTrader 4 oder 5 auf dem Computer.',
      fr: 'Oui, dans le navigateur — rien à télécharger. Sur iPhone : Safari → Partager → Sur l\'écran d\'accueil ; sur Android : menu de Chrome → Ajouter à l\'écran d\'accueil. L\'icône ouvre directement votre journal, sans barre de navigateur. Le module MetaTrader, lui, ne fonctionne que dans MetaTrader 4 ou 5 sur ordinateur.',
    },
  },
];

/**
 * Yol haritası: Değişiklikler sayfasının başında. Söz değil, niyet — tarih
 * yok. Biri yapılınca buradan silinip CHANGELOG'a yazılır.
 */
const ROADMAP: { next: L9[]; later: L9[] } = {
  next: [
    { tr: 'Haftalık özet e-postası: haftanın işlemleri ve sonuçları kısaca, kullandığın dilde.', en: 'A weekly summary email: the week\'s trades and results in brief, in your language.', fa: 'ایمیل خلاصه هفتگی: معاملات و نتایج هفته به‌طور خلاصه، به زبان خودت.', ar: 'رسالة ملخص أسبوعية: صفقات الأسبوع ونتائجها باختصار، بلغتك.', ru: 'Еженедельная сводка на почту: сделки и результаты недели кратко, на вашем языке.', es: 'Un correo de resumen semanal: las operaciones y resultados de la semana, en breve y en tu idioma.', pt: 'Um e-mail de resumo semanal: as operações e os resultados da semana, em breve e no teu idioma.', de: 'Eine wöchentliche Zusammenfassung per E-Mail: die Trades und Ergebnisse der Woche kurz, in deiner Sprache.', fr: 'Un e-mail de résumé hebdomadaire : les trades et résultats de la semaine en bref, dans votre langue.' },
    { tr: 'Adım adım MetaTrader kurulum videosu.', en: 'A step-by-step MetaTrader setup video.', fa: 'ویدیوی گام‌به‌گام راه‌اندازی متاتریدر.', ar: 'فيديو خطوة بخطوة لإعداد ميتاتريدر.', ru: 'Пошаговое видео по настройке MetaTrader.', es: 'Un vídeo paso a paso para configurar MetaTrader.', pt: 'Um vídeo passo a passo para configurar o MetaTrader.', de: 'Ein Schritt-für-Schritt-Video zur Einrichtung von MetaTrader.', fr: 'Une vidéo pas à pas pour configurer MetaTrader.' },
    { tr: 'Daha fazla rehber ve yazı, dokuz dilde.', en: 'More guides and articles, in nine languages.', fa: 'راهنماها و مقاله‌های بیشتر، به نُه زبان.', ar: 'مزيد من الأدلة والمقالات، بتسع لغات.', ru: 'Больше руководств и статей на девяти языках.', es: 'Más guías y artículos, en nueve idiomas.', pt: 'Mais guias e artigos, em nove idiomas.', de: 'Mehr Anleitungen und Artikel, in neun Sprachen.', fr: 'Plus de guides et d\'articles, en neuf langues.' },
  ],
  later: [
    { tr: 'MetaTrader dışındaki platformlardan otomatik kayıt: cTrader, TradingView, NinjaTrader, Tradovate.', en: 'Auto-sync from platforms beyond MetaTrader: cTrader, TradingView, NinjaTrader, Tradovate.', fa: 'ثبت خودکار از پلتفرم‌هایی غیر از متاتریدر: cTrader، TradingView، NinjaTrader، Tradovate.', ar: 'التسجيل التلقائي من منصات غير ميتاتريدر: cTrader وTradingView وNinjaTrader وTradovate.', ru: 'Автозапись с других платформ, кроме MetaTrader: cTrader, TradingView, NinjaTrader, Tradovate.', es: 'Registro automático desde plataformas además de MetaTrader: cTrader, TradingView, NinjaTrader, Tradovate.', pt: 'Registo automático a partir de plataformas além do MetaTrader: cTrader, TradingView, NinjaTrader, Tradovate.', de: 'Automatische Übernahme aus Plattformen neben MetaTrader: cTrader, TradingView, NinjaTrader, Tradovate.', fr: 'Synchronisation automatique depuis d\'autres plateformes que MetaTrader : cTrader, TradingView, NinjaTrader, Tradovate.' },
  ],
};

/** En yeniden en eskiye. Tarih ISO; gösterirken kullanıcının diline göre biçimleniyor. */
const CHANGELOG: { date: string; items: L9[] }[] = [
  {
    date: '2026-09-29',
    items: [
      { tr: 'MetaTrader eklentisi 1.09: grafikteki mesajlar artık MetaTrader\'ın kendi dilinde — Türkçe, İngilizce, Farsça, Arapça, Rusça, İspanyolca, Portekizce, Almanca ve Fransızca.', en: 'MetaTrader add-on 1.09: the messages on the chart now follow MetaTrader\'s own language — English, Turkish, Persian, Arabic, Russian, Spanish, Portuguese, German and French.', fa: 'افزونه متاتریدر ۱.۰۹: پیام‌های روی چارت حالا به زبان خود متاتریدر است — فارسی، انگلیسی، ترکی، عربی، روسی، اسپانیایی، پرتغالی، آلمانی و فرانسوی.', ar: 'إضافة ميتاتريدر 1.09: رسائل الرسم البياني أصبحت بلغة ميتاتريدر نفسها — العربية والإنجليزية والتركية والفارسية والروسية والإسبانية والبرتغالية والألمانية والفرنسية.', ru: 'Модуль MetaTrader 1.09: сообщения на графике теперь на языке самого MetaTrader — русском, английском, турецком, персидском, арабском, испанском, португальском, немецком и французском.', es: 'Complemento de MetaTrader 1.09: los mensajes del gráfico ahora siguen el idioma de MetaTrader: español, inglés, turco, persa, árabe, ruso, portugués, alemán y francés.', pt: 'Complemento do MetaTrader 1.09: as mensagens no gráfico seguem agora o idioma do próprio MetaTrader — português, inglês, turco, persa, árabe, russo, espanhol, alemão e francês.', de: 'MetaTrader-Add-on 1.09: Die Meldungen im Chart folgen jetzt der Sprache von MetaTrader – Deutsch, Englisch, Türkisch, Persisch, Arabisch, Russisch, Spanisch, Portugiesisch und Französisch.', fr: 'Module MetaTrader 1.09 : les messages sur le graphique suivent désormais la langue de MetaTrader — français, anglais, turc, persan, arabe, russe, espagnol, portugais et allemand.' },
      { tr: 'İki yeni yazı: işlem öncesi checklist nasıl yazılır ve duyguları journal\'da kaydetmek.', en: 'Two new articles: how to write a pre-trade checklist, and tracking emotions in your journal.', fa: 'دو مقاله تازه: چطور چک‌لیست پیش از معامله بنویسی، و ثبت احساسات در ژورنال.', ar: 'مقالان جديدان: كيف تكتب قائمة تحقق قبل الصفقة، وتسجيل المشاعر في سجلك.', ru: 'Две новые статьи: как составить чек-лист перед сделкой и как отмечать эмоции в журнале.', es: 'Dos artículos nuevos: cómo escribir una checklist antes de operar y cómo registrar emociones en tu diario.', pt: 'Dois artigos novos: como escrever uma checklist antes de operar e como registar emoções no diário.', de: 'Zwei neue Artikel: wie du eine Checkliste vor dem Trade schreibst und Emotionen im Journal festhältst.', fr: 'Deux nouveaux articles : écrire une checklist avant un trade, et noter ses émotions dans son journal.' },
    ],
  },
  {
    date: '2026-09-28',
    items: [
      { tr: 'Aynı MetaTrader hesabına yeni anahtar bağlanınca eskisi kendiliğinden kapanıyor. Eklenti 1.08 eksik kalan işlemleri saatte bir kendiliğinden tamamlıyor; journal\'dan sildiğin işlem geri gelmiyor.', en: 'When a new key connects from the same MetaTrader account, the old one closes by itself. Add-on 1.08 fills in missing trades on its own every hour; a trade you delete from a journal does not come back.', fa: 'وقتی کلید جدیدی از همان حساب متاتریدر وصل شود، کلید قدیمی خودبه‌خود بسته می‌شود. افزونه ۱.۰۸ هر ساعت معاملات جاافتاده را خودش تکمیل می‌کند؛ معامله‌ای که از ژورنال پاک کنی برنمی‌گردد.', ar: 'عندما يتصل مفتاح جديد من حساب ميتاتريدر نفسه يُغلق القديم تلقائياً. الإضافة 1.08 تُكمل الصفقات الناقصة وحدها كل ساعة؛ والصفقة التي تحذفها من السجل لا تعود.', ru: 'Когда с того же счёта MetaTrader подключается новый ключ, старый закрывается сам. Модуль 1.08 каждый час сам дополняет пропущенные сделки; удалённая из журнала сделка не возвращается.', es: 'Cuando una clave nueva se conecta desde la misma cuenta de MetaTrader, la antigua se cierra sola. El complemento 1.08 completa solo cada hora las operaciones que falten; una operación que borres del diario no vuelve.', pt: 'Quando uma chave nova se liga a partir da mesma conta MetaTrader, a antiga fecha-se sozinha. O complemento 1.08 completa sozinho, de hora a hora, as operações em falta; uma operação que apagues do diário não volta.', de: 'Verbindet sich ein neuer Schlüssel vom selben MetaTrader-Konto, wird der alte automatisch geschlossen. Add-on 1.08 ergänzt fehlende Trades jede Stunde von selbst; ein Trade, den du aus einem Journal löschst, kommt nicht zurück.', fr: 'Quand une nouvelle clé se connecte depuis le même compte MetaTrader, l\'ancienne se ferme d\'elle-même. Le module 1.08 complète seul, toutes les heures, les trades manquants ; un trade supprimé d\'un journal ne revient pas.' },
      { tr: 'MetaTrader 4 otomatik kayıt: MetaTrader sayfasında MT4 ya da MT5 seçiliyor, derlenmiş eklenti hazır iniyor.', en: 'MetaTrader 4 auto-sync: choose MT4 or MT5 on the MetaTrader screen and download a ready-to-use add-on.', fa: 'ثبت خودکار متاتریدر ۴: در صفحه متاتریدر MT4 یا MT5 را انتخاب کن و افزونه آماده را دانلود کن.', ar: 'مزامنة تلقائية مع ميتاتريدر 4: اختر MT4 أو MT5 في شاشة ميتاتريدر ونزّل إضافة جاهزة للاستخدام.', ru: 'Автосинхронизация MetaTrader 4: выберите MT4 или MT5 на экране MetaTrader и скачайте готовый модуль.', es: 'Sincronización automática de MetaTrader 4: elige MT4 o MT5 en la pantalla de MetaTrader y descarga un complemento listo para usar.', pt: 'Sincronização automática do MetaTrader 4: escolhe MT4 ou MT5 no ecrã do MetaTrader e descarrega um complemento pronto a usar.', de: 'Automatischer Sync für MetaTrader 4: Wähle auf dem MetaTrader-Bildschirm MT4 oder MT5 und lade ein fertiges Add-on herunter.', fr: 'Synchronisation automatique MetaTrader 4 : choisissez MT4 ou MT5 sur l\'écran MetaTrader et téléchargez un module prêt à l\'emploi.' },
      { tr: 'Eklenti grafikte hangi journal\'a gönderdiğini gösteriyor; yeni işlemler sayfayı yenilemeden görünüyor.', en: 'The add-on shows on the chart which journal it sends to, and new trades appear without reloading the page.', fa: 'افزونه روی چارت نشان می‌دهد به کدام ژورنال می‌فرستد و معاملات جدید بدون بارگذاری دوباره صفحه دیده می‌شوند.', ar: 'تُظهر الإضافة على الرسم السجل الذي ترسل إليه، وتظهر الصفقات الجديدة دون إعادة تحميل الصفحة.', ru: 'Модуль показывает на графике, в какой журнал отправляет сделки, а новые сделки появляются без перезагрузки страницы.', es: 'El complemento muestra en el gráfico a qué diario envía, y las operaciones nuevas aparecen sin recargar la página.', pt: 'O complemento mostra no gráfico para que diário envia, e as operações novas aparecem sem recarregar a página.', de: 'Das Add-on zeigt auf dem Chart, an welches Journal es sendet, und neue Trades erscheinen ohne Neuladen der Seite.', fr: 'Le module indique sur le graphique vers quel journal il envoie, et les nouveaux trades apparaissent sans recharger la page.' },
      { tr: 'Blog ve rehberler: MetaTrader 5 kurulumu, içe aktarma, journal tutmak, R değeri ve prop kuralları üzerine.', en: 'Blog and guides: setting up MetaTrader 5, importing, keeping a journal, R-multiples and prop firm rules.', fa: 'بلاگ و راهنماها: راه‌اندازی متاتریدر ۵، وارد کردن معاملات، نوشتن ژورنال، R و قوانین پراپ.', ar: 'مدونة وأدلة: إعداد ميتاتريدر 5، الاستيراد، تدوين السجل، مضاعف R وقواعد شركات التمويل.', ru: 'Блог и руководства: настройка MetaTrader 5, импорт, ведение журнала, R-мультипликатор и правила проп-фирм.', es: 'Blog y guías: configurar MetaTrader 5, importar, llevar un diario, múltiplos R y reglas de las prop firms.', pt: 'Blog e guias: configurar o MetaTrader 5, importar, manter um diário, múltiplos R e regras das prop firms.', de: 'Blog und Anleitungen: MetaTrader 5 einrichten, importieren, Journal führen, R-Multiples und Prop-Firm-Regeln.', fr: 'Blog et guides : configurer MetaTrader 5, importer, tenir un journal, multiples de R et règles des prop firms.' },
      { tr: 'Hoş geldin ve deneme hatırlatma e-postaları, kullandığın dilde.', en: 'Welcome and trial reminder emails, in the language you use.', fa: 'ایمیل خوش‌آمد و یادآوری دوره آزمایشی، به زبانی که استفاده می‌کنی.', ar: 'رسائل ترحيب وتذكير بالتجربة، باللغة التي تستخدمها.', ru: 'Приветственные письма и напоминания о пробном периоде — на вашем языке.', es: 'Correos de bienvenida y recordatorios de la prueba, en tu idioma.', pt: 'E-mails de boas-vindas e lembretes do teste, na tua língua.', de: 'Willkommens- und Test-Erinnerungsmails in deiner Sprache.', fr: 'E-mails de bienvenue et rappels d\'essai, dans votre langue.' },
      { tr: 'Telefonda ana ekrana eklenebiliyor; simge journal\'ı doğrudan açıyor.', en: 'Add it to your phone\'s home screen; the icon opens your journal directly.', fa: 'قابل افزودن به صفحه اصلی گوشی؛ آیکون مستقیم ژورنال را باز می‌کند.', ar: 'يمكن إضافته إلى الشاشة الرئيسية للهاتف؛ تفتح الأيقونة سجلك مباشرة.', ru: 'Можно добавить на главный экран телефона — значок сразу открывает журнал.', es: 'Añádelo a la pantalla de inicio del móvil; el icono abre tu diario directamente.', pt: 'Adiciona-o ao ecrã principal do telemóvel; o ícone abre o diário diretamente.', de: 'Lässt sich auf den Home-Bildschirm legen; das Symbol öffnet direkt dein Journal.', fr: 'Ajoutez-le à l\'écran d\'accueil de votre téléphone ; l\'icône ouvre directement votre journal.' },
      { tr: 'İletişim: support@simpletradejournal.io.', en: 'Contact: support@simpletradejournal.io.', fa: 'تماس: support@simpletradejournal.io.', ar: 'التواصل: support@simpletradejournal.io.', ru: 'Связь: support@simpletradejournal.io.', es: 'Contacto: support@simpletradejournal.io.', pt: 'Contacto: support@simpletradejournal.io.', de: 'Kontakt: support@simpletradejournal.io.', fr: 'Contact : support@simpletradejournal.io.' },
    ],
  },
  {
    date: '2026-09-27',
    items: [
      { tr: 'Kayıt olmadan örnek verilerle uygulamayı gezme.', en: 'Explore the app with sample data before signing up.', fa: 'گشت در برنامه با داده‌های نمونه، پیش از ثبت‌نام.', ar: 'تصفّح التطبيق ببيانات تجريبية قبل التسجيل.', ru: 'Можно осмотреть приложение на демо-данных до регистрации.', es: 'Explora la app con datos de ejemplo antes de registrarte.', pt: 'Explora a app com dados de exemplo antes de te registares.', de: 'Die App vor der Anmeldung mit Beispieldaten erkunden.', fr: 'Explorez l\'application avec des données d\'exemple avant de vous inscrire.' },
      { tr: 'Yeni ücretsiz plan: günde 2 işlem, fazlası silinmeden kilitli saklanır. Kartsız 3 günlük Pro denemesi.', en: 'New Free plan: 2 trades a day, with extras kept locked rather than deleted. A 3-day Pro trial with no card.', fa: 'پلن رایگان جدید: ۲ معامله در روز و بقیه بدون حذف، قفل نگه داشته می‌شوند. آزمایش ۳ روزه Pro بدون کارت.', ar: 'خطة مجانية جديدة: صفقتان يومياً، والزائد يُحفظ مقفلاً بدل حذفه. تجربة Pro لمدة 3 أيام دون بطاقة.', ru: 'Новый бесплатный план: 2 сделки в день, лишние не удаляются, а блокируются. Пробный Pro на 3 дня без карты.', es: 'Nuevo plan gratuito: 2 operaciones al día, las extra se guardan bloqueadas en vez de borrarse. Prueba de Pro de 3 días sin tarjeta.', pt: 'Novo plano gratuito: 2 operações por dia, as extra ficam bloqueadas em vez de apagadas. Teste Pro de 3 dias sem cartão.', de: 'Neuer kostenloser Plan: 2 Trades pro Tag, weitere werden gesperrt statt gelöscht. 3 Tage Pro testen ohne Karte.', fr: 'Nouveau plan gratuit : 2 trades par jour, les suivants gardés verrouillés plutôt que supprimés. Essai Pro de 3 jours sans carte.' },
      { tr: 'İşlemleri Excel\'e aktarma.', en: 'Export trades to Excel.', fa: 'خروجی گرفتن معاملات به اکسل.', ar: 'تصدير الصفقات إلى Excel.', ru: 'Экспорт сделок в Excel.', es: 'Exportar operaciones a Excel.', pt: 'Exportar operações para o Excel.', de: 'Trades nach Excel exportieren.', fr: 'Export des trades vers Excel.' },
      { tr: 'MetaTrader anahtarı ilk bağlandığı hesaba kilitleniyor; işlemler yanlış journal\'a gitmiyor (EA 1.06).', en: 'A MetaTrader key now locks to the first account it connects from, so trades can\'t land in the wrong journal (EA 1.06).', fa: 'کلید متاتریدر به اولین حسابی که وصل شود قفل می‌شود و معاملات به ژورنال اشتباه نمی‌روند (EA 1.06).', ar: 'يُقفل مفتاح ميتاتريدر على أول حساب يتصل منه فلا تذهب الصفقات إلى سجل خاطئ (EA 1.06).', ru: 'Ключ MetaTrader закрепляется за первым подключившимся счётом — сделки не попадут в чужой журнал (EA 1.06).', es: 'La clave de MetaTrader queda ligada a la primera cuenta que se conecta, así las operaciones no acaban en otro diario (EA 1.06).', pt: 'A chave do MetaTrader fica presa à primeira conta que se liga, e as operações não vão para o diário errado (EA 1.06).', de: 'Ein MetaTrader-Schlüssel wird an das erste verbundene Konto gebunden; Trades landen nicht mehr im falschen Journal (EA 1.06).', fr: 'Une clé MetaTrader se verrouille sur le premier compte connecté ; les trades n\'arrivent plus dans le mauvais journal (EA 1.06).' },
      { tr: 'Rapor içe aktarılırken, işleme girerken yazılmış kayıtlar tamamlanıyor.', en: 'Importing a report completes trades you logged before they closed.', fa: 'هنگام وارد کردن گزارش، معاملاتی که پیش از بسته شدن ثبت کرده‌ای کامل می‌شوند.', ar: 'عند استيراد تقرير تُستكمل الصفقات التي سجّلتها قبل إغلاقها.', ru: 'При импорте отчёта дополняются сделки, записанные до закрытия.', es: 'Al importar un informe se completan las operaciones que registraste antes de que cerraran.', pt: 'Ao importar um relatório, as operações registadas antes de fechar são completadas.', de: 'Beim Import werden Trades ergänzt, die du vor dem Schließen erfasst hast.', fr: 'L\'import d\'un rapport complète les trades saisis avant leur clôture.' },
      { tr: 'Site yaklaşık iki kat daha hızlı açılıyor.', en: 'The site opens about twice as fast.', fa: 'سایت تقریباً دو برابر سریع‌تر باز می‌شود.', ar: 'يفتح الموقع أسرع بنحو الضعف.', ru: 'Сайт открывается примерно вдвое быстрее.', es: 'El sitio carga aproximadamente el doble de rápido.', pt: 'O site abre cerca de duas vezes mais depressa.', de: 'Die Seite lädt etwa doppelt so schnell.', fr: 'Le site s\'ouvre environ deux fois plus vite.' },
      { tr: 'Hesabı ve bütün verileri silme; herkes yalnızca kendi verisini görüyor.', en: 'Delete your account and all data; everyone sees only their own data.', fa: 'حذف حساب و همه داده‌ها؛ هر کس فقط داده‌های خودش را می‌بیند.', ar: 'حذف الحساب وكل البيانات؛ ولا يرى أحد إلا بياناته.', ru: 'Удаление аккаунта и всех данных; каждый видит только свои данные.', es: 'Elimina tu cuenta y todos los datos; cada uno ve solo sus datos.', pt: 'Apaga a conta e todos os dados; cada um vê só os seus dados.', de: 'Konto und alle Daten löschen; jeder sieht nur seine eigenen Daten.', fr: 'Suppression du compte et de toutes les données ; chacun ne voit que ses propres données.' },
    ],
  },
  {
    date: '2026-09-25',
    items: [
      { tr: 'MetaTrader açık pozisyonları da kaydediyor; işleme girerken yazdığın kayıt, pozisyon kapanınca sonuçla tamamlanıyor.', en: 'MetaTrader now records open positions too; a trade you logged on entry is completed with the result when the position closes.', fa: 'متاتریدر پوزیشن‌های باز را هم ثبت می‌کند؛ معامله‌ای که هنگام ورود نوشته‌ای، با بسته شدن پوزیشن با نتیجه کامل می‌شود.', ar: 'صار ميتاتريدر يسجّل المراكز المفتوحة أيضاً، وتُستكمل الصفقة التي سجّلتها عند الدخول بالنتيجة عند الإغلاق.', ru: 'MetaTrader записывает и открытые позиции; сделка, внесённая при входе, дополняется результатом при закрытии.', es: 'MetaTrader también registra posiciones abiertas; la operación que anotaste al entrar se completa con el resultado al cerrar.', pt: 'O MetaTrader também regista posições abertas; a operação anotada à entrada é completada com o resultado ao fechar.', de: 'MetaTrader erfasst jetzt auch offene Positionen; ein beim Einstieg notierter Trade wird beim Schließen mit dem Ergebnis ergänzt.', fr: 'MetaTrader enregistre aussi les positions ouvertes ; le trade saisi à l\'entrée est complété avec le résultat à la clôture.' },
    ],
  },
  {
    date: '2026-09-24',
    items: [
      { tr: 'Üst bantta açık seans ve sıradaki önemli haber; haberden ve seans açılışından önce bildirim.', en: 'The header shows the open session and the next major release, with alerts before releases and session opens.', fa: 'نوار بالا سشن باز و خبر مهم بعدی را نشان می‌دهد؛ اعلان پیش از خبر و باز شدن سشن.', ar: 'يعرض الشريط العلوي الجلسة المفتوحة والخبر المهم التالي، مع تنبيه قبل الأخبار وافتتاح الجلسات.', ru: 'В шапке — открытая сессия и ближайшая важная новость; уведомления перед новостями и открытием сессий.', es: 'La cabecera muestra la sesión abierta y la próxima noticia importante, con avisos antes de noticias y aperturas.', pt: 'O cabeçalho mostra a sessão aberta e a próxima notícia importante, com avisos antes das notícias e aberturas.', de: 'Die Kopfzeile zeigt die offene Session und die nächste wichtige Nachricht, mit Warnung vor Nachrichten und Session-Eröffnungen.', fr: 'L\'en-tête affiche la session ouverte et la prochaine annonce importante, avec alertes avant annonces et ouvertures.' },
      { tr: 'Prop journal: kâr hedefine ve kayıp sınırlarına kalan mesafe.', en: 'Prop journals show how far you are from the target and the loss limits.', fa: 'ژورنال پراپ: فاصله تا هدف سود و حدود ضرر.', ar: 'سجل Prop: المسافة المتبقية إلى الهدف وحدود الخسارة.', ru: 'Проп-журнал: запас до цели и лимитов убытка.', es: 'Diario prop: cuánto falta para el objetivo y los límites de pérdida.', pt: 'Diário prop: quanto falta para o objetivo e os limites de perda.', de: 'Prop-Journal: Abstand zu Ziel und Verlustgrenzen.', fr: 'Journal prop : distance restante à l\'objectif et aux limites de perte.' },
      { tr: 'Ekran görüntüsü bağlantıyla eklenebiliyor (TradingView dahil).', en: 'Add a screenshot by pasting its link (TradingView included).', fa: 'افزودن اسکرین‌شات با چسباندن لینک (از جمله تریدینگ‌ویو).', ar: 'إضافة لقطة شاشة بلصق رابطها (بما في ذلك TradingView).', ru: 'Скриншот можно добавить ссылкой (в том числе TradingView).', es: 'Añade una captura pegando su enlace (incluido TradingView).', pt: 'Adiciona uma captura colando o link (incluindo TradingView).', de: 'Screenshot per Link hinzufügen (auch TradingView).', fr: 'Ajout d\'une capture en collant son lien (TradingView compris).' },
    ],
  },
  {
    date: '2026-09-19',
    items: [
      { tr: 'Prop firma değerlendirmesi: 12 kritere göre puan, üç firma yan yana, PDF çıktısı.', en: 'Prop firm review: a score on 12 criteria, three firms side by side, PDF export.', fa: 'ارزیابی شرکت پراپ: امتیاز بر اساس ۱۲ معیار، سه شرکت کنار هم، خروجی PDF.', ar: 'تقييم شركات Prop: نتيجة وفق 12 معياراً وثلاث شركات جنباً إلى جنب وتصدير PDF.', ru: 'Оценка проп-фирм: балл по 12 критериям, три фирмы рядом, экспорт в PDF.', es: 'Evaluación de prop firms: puntuación en 12 criterios, tres firmas lado a lado, exportación a PDF.', pt: 'Avaliação de prop firms: pontuação em 12 critérios, três firmas lado a lado, exportação em PDF.', de: 'Prop-Firmen-Bewertung: 12 Kriterien, drei Firmen nebeneinander, PDF-Export.', fr: 'Évaluation des prop firms : note sur 12 critères, trois firmes côte à côte, export PDF.' },
    ],
  },
  {
    date: '2026-09-10',
    items: [
      { tr: 'MetaTrader 5 otomatik kayıt.', en: 'MetaTrader 5 auto-sync.', fa: 'ثبت خودکار متاتریدر ۵.', ar: 'مزامنة تلقائية مع ميتاتريدر 5.', ru: 'Автозапись из MetaTrader 5.', es: 'Registro automático desde MetaTrader 5.', pt: 'Registo automático do MetaTrader 5.', de: 'MetaTrader-5-Autoimport.', fr: 'Synchronisation automatique MetaTrader 5.' },
      { tr: 'Sesli not: konuş, yazıya dönsün ve düzeltilsin.', en: 'Voice notes: speak, and it\'s written down and tidied.', fa: 'یادداشت صوتی: حرف بزن، نوشته و مرتب می‌شود.', ar: 'ملاحظات صوتية: تحدّث فتُكتب وتُنقّح.', ru: 'Голосовые заметки: говорите — текст запишется и поправится.', es: 'Notas de voz: habla y se escribe y se ordena.', pt: 'Notas de voz: fala, e fica escrito e arrumado.', de: 'Sprachnotizen: sprechen, mitschreiben lassen, aufräumen lassen.', fr: 'Notes vocales : parlez, c\'est écrit et mis au propre.' },
      { tr: 'Disiplin, Seanslar ve Günün Haberleri sayfaları; birden çok checklist.', en: 'Discipline, Sessions and Today\'s News pages; more than one checklist.', fa: 'صفحه‌های انضباط، سشن‌ها و اخبار روز؛ چند چک‌لیست.', ar: 'صفحات الانضباط والجلسات وأخبار اليوم؛ وأكثر من قائمة تحقق.', ru: 'Страницы «Дисциплина», «Сессии» и «Новости дня»; несколько чек-листов.', es: 'Páginas de Disciplina, Sesiones y Noticias del día; varias checklists.', pt: 'Páginas de Disciplina, Sessões e Notícias do dia; várias checklists.', de: 'Seiten für Disziplin, Sessions und Tagesnews; mehrere Checklisten.', fr: 'Pages Discipline, Sessions et Actus du jour ; plusieurs checklists.' },
    ],
  },
  {
    date: '2026-09-08',
    items: [
      { tr: 'Altı platformun raporu için tek içe aktarma; aynı rapor tekrar yüklenince yalnız yeni işlemler.', en: 'One import for six platforms\' reports; re-uploading a report adds only new trades.', fa: 'یک ابزار وارد کردن برای گزارش شش پلتفرم؛ بارگذاری دوباره فقط معاملات جدید را اضافه می‌کند.', ar: 'استيراد واحد لتقارير ست منصات؛ وإعادة رفع التقرير تضيف الصفقات الجديدة فقط.', ru: 'Единый импорт отчётов шести платформ; повторная загрузка добавляет только новые сделки.', es: 'Una importación para informes de seis plataformas; volver a subirlo añade solo lo nuevo.', pt: 'Uma importação para relatórios de seis plataformas; reenviar acrescenta só as novas operações.', de: 'Ein Import für Berichte von sechs Plattformen; erneutes Hochladen fügt nur neue Trades hinzu.', fr: 'Un seul import pour les rapports de six plateformes ; réimporter n\'ajoute que les nouveaux trades.' },
      { tr: 'İşlemleri journal\'lar arasında taşıma; gerçekleşen R.', en: 'Move trades between journals; realised R.', fa: 'انتقال معاملات میان ژورنال‌ها؛ R محقق‌شده.', ar: 'نقل الصفقات بين السجلات؛ وقيمة R المحققة.', ru: 'Перенос сделок между журналами; фактический R.', es: 'Mover operaciones entre diarios; R realizado.', pt: 'Mover operações entre diários; R realizado.', de: 'Trades zwischen Journalen verschieben; realisiertes R.', fr: 'Déplacer des trades entre journaux ; R réalisé.' },
    ],
  },
  {
    date: '2026-09-05',
    items: [
      { tr: 'PDF rapor: tek işlem ya da bütün journal. Sonucu belli olmayan işlemi kaydedip sonra tamamlama.', en: 'PDF reports for a single trade or a whole journal. Save a trade before it closes and complete it later.', fa: 'گزارش PDF برای یک معامله یا کل ژورنال. ذخیره معامله پیش از بسته شدن و تکمیل بعدی.', ar: 'تقارير PDF لصفقة واحدة أو لسجل كامل. حفظ صفقة قبل إغلاقها واستكمالها لاحقاً.', ru: 'PDF-отчёт по одной сделке или журналу. Сохранение сделки до закрытия с дополнением позже.', es: 'Informes PDF de una operación o de todo el diario. Guarda una operación antes de cerrar y complétala después.', pt: 'Relatórios PDF de uma operação ou de todo o diário. Guarda uma operação antes de fechar e completa-a depois.', de: 'PDF-Berichte für einen Trade oder ein ganzes Journal. Trades vor dem Schließen speichern und später ergänzen.', fr: 'Rapports PDF d\'un trade ou d\'un journal entier. Enregistrer un trade avant sa clôture et le compléter ensuite.' },
    ],
  },
];

const LOCALES: Record<Lang, string> = {
  tr: 'tr-TR', en: 'en-US', fa: 'fa-IR', ar: 'ar', ru: 'ru-RU', es: 'es-ES', pt: 'pt-PT', de: 'de-DE', fr: 'fr-FR',
};

export default function InfoPage({ kind, onHome, onOther, cta }: {
  kind: InfoKind;
  onHome: () => void;
  /** Öteki sayfaya geç (Yardım ↔ Değişiklikler). */
  onOther: () => void;
  cta: { label: string; onClick: () => void };
}) {
  const { language } = useLanguage();
  const lang = (language in LOCALES ? language : 'en') as Lang;
  const s = (k: keyof typeof UI) => UI[k][lang];
  const isHelp = kind === 'help';

  // Sekme başlığı seçili dilde.
  useEffect(() => {
    document.title = `${isHelp ? UI.helpTitle[lang] : UI.changelogTitle[lang]} — Simple Trading Journal`;
  }, [isHelp, lang]);

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
        <button onClick={onHome} className="link-gold inline-flex items-center gap-1.5 text-[13px] mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
          <ArrowLeft className={`w-4 h-4 ${lang === 'fa' || lang === 'ar' ? 'rotate-180' : ''}`} />
          {s('home')}
        </button>
        <h1 className="poster text-[2.2rem] sm:text-[2.8rem] mb-3">{isHelp ? s('helpTitle') : s('changelogTitle')}</h1>
        <p className="text-[16px] leading-relaxed mb-12" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {isHelp ? s('helpLead') : s('changelogLead')}
        </p>

        {isHelp ? (
          <div className="space-y-4">
            {HELP.map((h, i) => (
              <section key={i} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="text-[17px] font-medium text-white mb-2">{h.q[lang]}</h2>
                <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{h.a[lang]}</p>
              </section>
            ))}
            <section className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-[17px] font-medium text-white mb-3">{s('guidesTitle')}</h2>
              <div className="flex flex-col gap-2">
                <a href={langPath('/guides/metatrader-5-auto-sync', lang)} className="text-[15px]" style={{ color: '#a78bfa' }}>{s('guideMt5')} →</a>
                <a href={langPath('/guides/import-trade-history', lang)} className="text-[15px]" style={{ color: '#a78bfa' }}>{s('guideImport')} →</a>
              </div>
            </section>
            {/* Soruların altında: yardım sayfası, cevabı bulamayanın
                bakacağı son yer; uygulamadaki "Yardım" da buraya geliyor. */}
            <section className="rounded-2xl p-6" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
              <h2 className="text-[17px] font-medium text-white mb-2">{s('contactTitle')}</h2>
              <p className="text-[15px] leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>{s('contactLead')}</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} onClick={openContact} className="inline-flex items-center gap-2 text-[15px] font-medium" style={{ color: '#a78bfa' }} dir="ltr">
                <Mail className="w-4 h-4" />
                {SUPPORT_EMAIL}
              </a>
              <p className="text-[13px] leading-relaxed mt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {s('contactPrivacy')}{' '}
                <a href={`mailto:${PRIVACY_EMAIL}`} className="underline" dir="ltr">{PRIVACY_EMAIL}</a>
              </p>
            </section>
          </div>
        ) : (
          <>
          <section className="rounded-2xl p-6 mb-14" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
            <h2 className="text-[20px] font-medium text-white mb-2">{s('roadmapTitle')}</h2>
            <p className="text-[14px] leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>{s('roadmapLead')}</p>
            {([['roadmapNext', ROADMAP.next, '#8b5cf6'], ['roadmapLater', ROADMAP.later, 'rgba(255,255,255,0.35)']] as const).map(([label, items, dot]) => (
              <div key={label} className="mb-5">
                <h3 className="text-[13px] font-medium mb-2.5" style={{ color: '#f0b429' }}>{s(label)}</h3>
                <ul className="space-y-2.5">
                  {items.map((it, i) => (
                    <li key={i} className="flex gap-3 text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
                      <span>{it[lang]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <a href={`mailto:${SUPPORT_EMAIL}`} onClick={openContact} className="inline-flex items-center gap-2 text-[14px] font-medium" style={{ color: '#a78bfa' }}>
              <Mail className="w-4 h-4" />
              {s('roadmapSuggest')}
            </a>
          </section>
          <h2 className="text-[20px] font-medium text-white mb-6">{s('changesTitle')}</h2>
          <ol className="space-y-10">
            {CHANGELOG.map(entry => (
              <li key={entry.date}>
                <time dateTime={entry.date} className="block text-[13px] font-medium mb-3" style={{ color: '#f0b429' }}>
                  {new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: 'long' }).format(new Date(`${entry.date}T12:00:00Z`))}
                </time>
                <ul className="space-y-2.5">
                  {entry.items.map((it, i) => (
                    <li key={i} className="flex gap-3 text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#8b5cf6' }} />
                      <span>{it[lang]}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          </>
        )}

        <button onClick={onOther} className="link-gold inline-flex items-center gap-1.5 text-[14px] mt-14" style={{ color: '#a78bfa' }}>
          {isHelp ? s('seeChangelog') : s('seeHelp')}
        </button>
      </main>
    </div>
  );
}

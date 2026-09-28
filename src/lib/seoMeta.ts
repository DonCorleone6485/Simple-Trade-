/**
 * Arama sonuçlarında görünen başlık ve açıklama — dil başına adresler için
 * her dilde (bkz. lib/langPath.ts). Yazıların başlıkları kendi dosyalarında
 * (content/articles/<dil>.ts).
 */
type L9 = Record<'en' | 'tr' | 'fa' | 'ar' | 'ru' | 'es' | 'pt' | 'de' | 'fr', string>;

export const SEO_META: Record<'home' | 'help' | 'changelog' | 'blog', { title: L9; description: L9 }> = {
  home: {
    title: {
      en: 'Simple Trading Journal — Trading Journal with MetaTrader Auto-Sync',
      tr: 'Simple Trading Journal — MetaTrader ile otomatik kayıt yapan işlem günlüğü',
      fa: 'Simple Trading Journal — ژورنال معاملاتی با ثبت خودکار متاتریدر',
      ar: 'Simple Trading Journal — سجل تداول بمزامنة تلقائية مع ميتاتريدر',
      ru: 'Simple Trading Journal — дневник трейдера с автозаписью из MetaTrader',
      es: 'Simple Trading Journal — diario de trading con registro automático de MetaTrader',
      pt: 'Simple Trading Journal — diário de trading com registo automático do MetaTrader',
      de: 'Simple Trading Journal — Trading-Journal mit automatischem MetaTrader-Import',
      fr: 'Simple Trading Journal — journal de trading synchronisé avec MetaTrader',
    },
    description: {
      en: 'A trading journal whose trades arrive from MetaTrader on their own. See which setup pays, what your mistakes cost and how close you are to your prop limits. Free to start, in 9 languages.',
      tr: 'İşlemleri MetaTrader\'dan kendiliğinden gelen bir trading journal. Hangi setup\'ın kazandırdığını, hatalarının neye mal olduğunu ve prop sınırlarına ne kadar yaklaştığını gör. Ücretsiz başla, 9 dilde.',
      fa: 'ژورنال معاملاتی که معاملاتش خودکار از متاتریدر می‌رسد. ببین کدام ستاپ سود می‌دهد، اشتباه‌هایت چقدر هزینه دارند و چقدر به حدهای پراپ نزدیکی. شروع رایگان، به ۹ زبان.',
      ar: 'سجل تداول تصل صفقاته من ميتاتريدر تلقائياً. اعرف أي نموذج يربح، وكم تكلّفك أخطاؤك، وكم أنت قريب من حدود حساب التمويل. ابدأ مجاناً، بـ 9 لغات.',
      ru: 'Дневник трейдера, в который сделки приходят из MetaTrader сами. Смотрите, какой сетап приносит деньги, во что обходятся ошибки и далеко ли до лимитов проп-счёта. Бесплатный старт, 9 языков.',
      es: 'Un diario de trading al que las operaciones llegan solas desde MetaTrader. Descubre qué setup gana, cuánto te cuestan los errores y lo cerca que estás de los límites de tu prop firm. Gratis para empezar, en 9 idiomas.',
      pt: 'Um diário de trading onde as operações chegam sozinhas do MetaTrader. Vê que setup dá lucro, quanto custam os teus erros e quão perto estás dos limites da prop firm. Grátis para começar, em 9 línguas.',
      de: 'Ein Trading-Journal, in das deine Trades von selbst aus MetaTrader kommen. Sieh, welches Setup sich lohnt, was deine Fehler kosten und wie nah du an deinen Prop-Limits bist. Kostenlos starten, in 9 Sprachen.',
      fr: 'Un journal de trading où vos trades arrivent tout seuls depuis MetaTrader. Voyez quel setup rapporte, ce que coûtent vos erreurs et à quelle distance vous êtes de vos limites de prop firm. Gratuit pour commencer, en 9 langues.',
    },
  },
  help: {
    title: {
      en: 'Help — Simple Trading Journal', tr: 'Yardım — Simple Trading Journal', fa: 'راهنما — Simple Trading Journal',
      ar: 'المساعدة — Simple Trading Journal', ru: 'Помощь — Simple Trading Journal', es: 'Ayuda — Simple Trading Journal',
      pt: 'Ajuda — Simple Trading Journal', de: 'Hilfe — Simple Trading Journal', fr: 'Aide — Simple Trading Journal',
    },
    description: {
      en: 'How to connect MetaTrader, import broker reports, use the Free plan and the Pro trial, read the discipline analysis, track a prop account, export to Excel and delete your data.',
      tr: 'MetaTrader\'ı bağlamak, broker raporu aktarmak, Ücretsiz plan ve Pro denemesi, disiplin analizi, prop hesabı takibi, Excel\'e aktarma ve verilerini silme.',
      fa: 'وصل کردن متاتریدر، وارد کردن گزارش بروکر، پلن رایگان و دوره آزمایشی Pro، تحلیل انضباط، دنبال کردن حساب پراپ، خروجی اکسل و حذف داده‌ها.',
      ar: 'ربط ميتاتريدر، واستيراد تقارير الوسيط، والخطة المجانية وتجربة Pro، وتحليل الانضباط، ومتابعة حساب التمويل، والتصدير إلى Excel وحذف بياناتك.',
      ru: 'Как подключить MetaTrader, импортировать отчёт брокера, пользоваться бесплатным планом и пробным Pro, читать анализ дисциплины, вести проп-счёт, выгружать в Excel и удалять данные.',
      es: 'Cómo conectar MetaTrader, importar informes del bróker, usar el plan gratuito y la prueba de Pro, leer el análisis de disciplina, seguir una cuenta prop, exportar a Excel y borrar tus datos.',
      pt: 'Como ligar o MetaTrader, importar relatórios da corretora, usar o plano gratuito e o teste do Pro, ler a análise de disciplina, acompanhar uma conta prop, exportar para Excel e apagar os dados.',
      de: 'MetaTrader verbinden, Broker-Berichte importieren, Gratis-Plan und Pro-Test nutzen, Disziplin-Analyse lesen, Prop-Konto verfolgen, nach Excel exportieren und Daten löschen.',
      fr: 'Connecter MetaTrader, importer les relevés du courtier, utiliser le plan gratuit et l\'essai Pro, lire l\'analyse de discipline, suivre un compte prop, exporter vers Excel et supprimer vos données.',
    },
  },
  changelog: {
    title: {
      en: 'Changelog — Simple Trading Journal', tr: 'Değişiklikler — Simple Trading Journal', fa: 'تغییرات — Simple Trading Journal',
      ar: 'سجل التغييرات — Simple Trading Journal', ru: 'Что нового — Simple Trading Journal', es: 'Novedades — Simple Trading Journal',
      pt: 'Novidades — Simple Trading Journal', de: 'Änderungen — Simple Trading Journal', fr: 'Nouveautés — Simple Trading Journal',
    },
    description: {
      en: 'What is new in Simple Trading Journal: MetaTrader auto-sync, report import, discipline analysis, prop tracking and more, newest first.',
      tr: 'Simple Trading Journal\'da neler yeni: MetaTrader otomatik kayıt, rapor aktarma, disiplin analizi, prop takibi ve dahası, en yeniden eskiye.',
      fa: 'تازه‌های Simple Trading Journal: ثبت خودکار متاتریدر، وارد کردن گزارش، تحلیل انضباط، دنبال کردن پراپ و بیشتر، از جدید به قدیم.',
      ar: 'الجديد في Simple Trading Journal: مزامنة ميتاتريدر التلقائية، واستيراد التقارير، وتحليل الانضباط، ومتابعة حسابات التمويل وغيرها، من الأحدث إلى الأقدم.',
      ru: 'Что нового в Simple Trading Journal: автозапись из MetaTrader, импорт отчётов, анализ дисциплины, проп-счета и другое — от новых к старым.',
      es: 'Novedades de Simple Trading Journal: sincronización con MetaTrader, importación de informes, análisis de disciplina, seguimiento prop y más, de lo más reciente a lo más antiguo.',
      pt: 'Novidades do Simple Trading Journal: sincronização com o MetaTrader, importação de relatórios, análise de disciplina, acompanhamento prop e mais, do mais recente ao mais antigo.',
      de: 'Neu in Simple Trading Journal: MetaTrader-Sync, Berichtsimport, Disziplin-Analyse, Prop-Tracking und mehr – das Neueste zuerst.',
      fr: 'Les nouveautés de Simple Trading Journal : synchro MetaTrader, import de relevés, analyse de discipline, suivi prop et plus, des plus récentes aux plus anciennes.',
    },
  },
  blog: {
    title: {
      en: 'Blog & guides — Simple Trading Journal', tr: 'Blog ve rehberler — Simple Trading Journal', fa: 'بلاگ و راهنماها — Simple Trading Journal',
      ar: 'المدونة والأدلة — Simple Trading Journal', ru: 'Блог и руководства — Simple Trading Journal', es: 'Blog y guías — Simple Trading Journal',
      pt: 'Blog e guias — Simple Trading Journal', de: 'Blog & Anleitungen — Simple Trading Journal', fr: 'Blog et guides — Simple Trading Journal',
    },
    description: {
      en: 'Guides for connecting MetaTrader 4 and 5 and importing trade history, and articles on keeping a trading journal, R-multiples and prop firm rules.',
      tr: 'MetaTrader 4 ve 5\'i bağlama ve işlem geçmişini aktarma rehberleri; trading journal tutmak, R değeri ve prop firma kuralları üzerine yazılar.',
      fa: 'راهنمای وصل کردن متاتریدر ۴ و ۵ و وارد کردن تاریخچه معاملات، و مقاله‌هایی درباره ژورنال‌نویسی، مضرب R و قوانین پراپ‌فرم‌ها.',
      ar: 'أدلة لربط ميتاتريدر 4 و5 واستيراد سجل الصفقات، ومقالات عن تدوين سجل التداول ومضاعف R وقواعد شركات التمويل.',
      ru: 'Руководства по подключению MetaTrader 4 и 5 и импорту истории сделок, статьи о ведении журнала, R-мультипликаторе и правилах проп-фирм.',
      es: 'Guías para conectar MetaTrader 4 y 5 e importar tu historial, y artículos sobre llevar un diario de trading, múltiplos R y reglas de las prop firms.',
      pt: 'Guias para ligar o MetaTrader 4 e 5 e importar o histórico, e artigos sobre manter um diário de trading, múltiplos R e regras das prop firms.',
      de: 'Anleitungen zum Verbinden von MetaTrader 4 und 5 und zum Import der Handelshistorie sowie Artikel über Journal-Führung, R-Multiples und Prop-Firm-Regeln.',
      fr: 'Guides pour connecter MetaTrader 4 et 5 et importer votre historique, et articles sur la tenue d\'un journal, les multiples de R et les règles des prop firms.',
    },
  },
};

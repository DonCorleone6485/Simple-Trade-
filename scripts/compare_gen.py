"""
Rakip karşılaştırma yazılarını (/blog/<ad>-alternative) dokuz dilde üretir.

Rakip bilgileri tek yerde (COMP), dil metinleri P'de; çıktı
src/content/articles/<dil>.ts dosyalarının sonuna yazılır (önceki üretim
silinip yeniden yazılır). Fiyat değişince COMP'u güncelle, çalıştır:
    python3 scripts/compare_gen.py
Veriler: rakiplerin kendi fiyat/yardım sayfaları, Eylül 2026.
"""
import json, os, re

ROOT = os.path.join(os.path.dirname(__file__), '..', 'src', 'content', 'articles') + os.sep
LANGS = ['en', 'tr', 'fa', 'ar', 'ru', 'es', 'pt', 'de', 'fr']

# ---- per-language phrases ----
P = {
'en': dict(
  title='Simple Trading Journal vs {X}: an honest comparison',
  desc='Looking for a {X} alternative? Prices, free plan, trial and MetaTrader sync compared side by side, with where each one is stronger.',
  intro='{X} is one of the best-known trading journals. If you are looking for an alternative — cheaper, in your own language, or with a free plan — here is how Simple Trading Journal compares.',
  note='{X}\'s prices and features are taken from its own pricing and help pages in September 2026 and may have changed since. Check its website before you decide.',
  labels=['', 'Monthly price', 'Yearly price', 'Free plan', 'Free trial', 'MetaTrader auto-sync', 'How MetaTrader connects', 'Imports'],
  yes='Yes', no='No',
  free_us='Yes — 2 trades a day, no time limit', trial_us='3 days of Pro, no card',
  mt_us='MetaTrader 5 (MT4: report import)', conn_us='Add-on in MT5 + key, no password shared',
  imp_us='MT4/MT5 report, cTrader, TradeLocker, DXtrade, Match-Trader, any CSV',
  yearly_only='— (yearly only)', not_listed='Not listed on its pricing page',
  trial_ts='7 days, no card', trial_ew='No — 14-day money-back guarantee',
  mt_both='MT4 and MT5', conn_tz='Account number + investor password', conn_ew='MetaTrader\'s FTP report publishing',
  imp_tz='500+ broker and prop firm integrations', imp_ts='200+ brokers and platforms', imp_ew='Many platforms (see its import page)',
  h_them='Where {X} is stronger', h_us='Where Simple Trading Journal is stronger', h_choose='Which one should you choose?',
  us=['A free plan with no time limit (2 trades a day) and a 3-day Pro trial without a card.',
      'Pro costs $14.99 a month or $119 a year — {X}\'s cheapest option is {P}.',
      'The whole app in 9 languages, including Turkish, Persian and Arabic.',
      'MetaTrader 5 syncs through a small add-on and a key; you never share your investor password.',
      'Built-in discipline analysis (revenge trades, rising risk after losses, overtrading, off-hours trading) and prop firm limit tracking.'],
  them={
    'tradezella': ['Far more broker and prop firm integrations — more than 500, according to Tradezella.',
                   'A longer track record and a bigger feature set in its higher plans.',
                   'MT4 and MT5 accounts sync without installing anything in MetaTrader.'],
    'tradersync': ['More than 200 supported brokers and platforms.',
                   'An AI assistant (Cypher) and trade replay in its higher plans.',
                   'A 7-day trial with every feature, without a card.'],
    'edgewonk': ['A long-established journal with a single plan that includes every feature.',
                 'A 14-day money-back guarantee.',
                 'MT4 and MT5 auto-sync using MetaTrader\'s own report publishing.'],
  },
  choose='If you need a very wide range of broker integrations or its more advanced tools, {X} may suit you better. If you trade on MetaTrader, want a journal in your own language and would rather start free, try Simple Trading Journal — the free plan needs no card.',
),
'tr': dict(
  title='Simple Trading Journal ve {X}: dürüst bir karşılaştırma',
  desc='{X} alternatifi mi arıyorsun? Fiyat, ücretsiz plan, deneme ve MetaTrader bağlantısı yan yana; hangisinin nerede güçlü olduğu da.',
  intro='{X} en bilinen trading journal\'lardan biri. Daha ucuz, kendi dilinde ya da ücretsiz planı olan bir alternatif arıyorsan, Simple Trading Journal\'ın nasıl karşılaştırıldığı aşağıda.',
  note='{X}\'ın fiyat ve özellikleri Eylül 2026\'da kendi fiyat ve yardım sayfalarından alındı; o tarihten beri değişmiş olabilir. Karar vermeden önce sitesine bak.',
  labels=['', 'Aylık fiyat', 'Yıllık fiyat', 'Ücretsiz plan', 'Ücretsiz deneme', 'MetaTrader otomatik kayıt', 'MetaTrader nasıl bağlanıyor', 'İçe aktarma'],
  yes='Var', no='Yok',
  free_us='Var — günde 2 işlem, süre sınırı yok', trial_us='3 gün Pro, kart gerekmez',
  mt_us='MetaTrader 5 (MT4: rapor aktarma)', conn_us='MT5\'e eklenti + anahtar, şifre paylaşılmaz',
  imp_us='MT4/MT5 raporu, cTrader, TradeLocker, DXtrade, Match-Trader, her CSV',
  yearly_only='— (yalnızca yıllık)', not_listed='Fiyat sayfasında belirtilmemiş',
  trial_ts='7 gün, kart gerekmez', trial_ew='Yok — 14 gün para iadesi',
  mt_both='MT4 ve MT5', conn_tz='Hesap numarası + yatırımcı şifresi', conn_ew='MetaTrader\'ın FTP ile rapor yayını',
  imp_tz='500\'den fazla broker ve prop firma', imp_ts='200\'den fazla broker ve platform', imp_ew='Birçok platform (içe aktarma sayfasına bak)',
  h_them='{X} nerede daha güçlü', h_us='Simple Trading Journal nerede daha güçlü', h_choose='Hangisini seçmeli?',
  us=['Süre sınırı olmayan ücretsiz plan (günde 2 işlem) ve kartsız 3 günlük Pro denemesi.',
      'Pro aylık $14.99 ya da yıllık $119 — {X}\'ın en ucuz seçeneği {P}.',
      'Uygulamanın tamamı 9 dilde; Türkçe, Farsça ve Arapça dahil.',
      'MetaTrader 5 küçük bir eklenti ve anahtarla bağlanıyor; yatırımcı şifreni hiç paylaşmıyorsun.',
      'Hazır disiplin analizi (intikam işlemi, kayıptan sonra artan risk, aşırı işlem, alışılmadık saatler) ve prop firma sınır takibi.'],
  them={
    'tradezella': ['Çok daha fazla broker ve prop firma bağlantısı — Tradezella\'ya göre 500\'den fazla.',
                   'Daha uzun geçmiş ve üst planlarında daha geniş özellik seti.',
                   'MT4 ve MT5 hesapları MetaTrader\'a bir şey kurmadan bağlanıyor.'],
    'tradersync': ['200\'den fazla desteklenen broker ve platform.',
                   'Üst planlarında yapay zekâ asistanı (Cypher) ve işlem tekrarı.',
                   'Bütün özellikleriyle, kartsız 7 günlük deneme.'],
    'edgewonk': ['Her özelliği tek bir planda sunan, köklü bir journal.',
                 '14 gün para iade garantisi.',
                 'MetaTrader\'ın kendi rapor yayınıyla MT4 ve MT5 otomatik kayıt.'],
  },
  choose='Çok geniş bir broker bağlantısı yelpazesine ya da daha gelişmiş araçlarına ihtiyacın varsa {X} sana daha uygun olabilir. MetaTrader\'da işlem yapıyor, kendi dilinde bir journal istiyor ve ücretsiz başlamayı tercih ediyorsan Simple Trading Journal\'ı dene — ücretsiz plan kart istemiyor.',
),
'fa': dict(
  title='Simple Trading Journal در برابر {X}: یک مقایسه صادقانه',
  desc='دنبال جایگزین {X} هستی؟ قیمت، پلن رایگان، دوره آزمایشی و اتصال متاتریدر کنار هم، و اینکه هرکدام کجا قوی‌تر است.',
  intro='{X} یکی از شناخته‌شده‌ترین ژورنال‌های معاملاتی است. اگر دنبال جایگزینی ارزان‌تر، به زبان خودت یا با پلن رایگان هستی، مقایسه Simple Trading Journal با آن اینجاست.',
  note='قیمت‌ها و امکانات {X} در سپتامبر ۲۰۲۶ از صفحه‌های قیمت و راهنمای خودش گرفته شده و ممکن است تغییر کرده باشد. پیش از تصمیم، سایتش را ببین.',
  labels=['', 'قیمت ماهانه', 'قیمت سالانه', 'پلن رایگان', 'دوره آزمایشی رایگان', 'همگام‌سازی خودکار متاتریدر', 'روش اتصال متاتریدر', 'وارد کردن معاملات'],
  yes='دارد', no='ندارد',
  free_us='دارد — روزانه ۲ معامله، بدون محدودیت زمانی', trial_us='۳ روز Pro، بدون کارت',
  mt_us='متاتریدر ۵ (MT4: وارد کردن گزارش)', conn_us='افزونه در MT5 + کلید، بدون اشتراک رمز',
  imp_us='گزارش MT4/MT5، cTrader، TradeLocker، DXtrade، Match-Trader، هر CSV',
  yearly_only='— (فقط سالانه)', not_listed='در صفحه قیمت ذکر نشده',
  trial_ts='۷ روز، بدون کارت', trial_ew='ندارد — ضمانت بازگشت وجه ۱۴ روزه',
  mt_both='MT4 و MT5', conn_tz='شماره حساب + رمز سرمایه‌گذار', conn_ew='انتشار گزارش FTP خود متاتریدر',
  imp_tz='بیش از ۵۰۰ بروکر و پراپ‌فرم', imp_ts='بیش از ۲۰۰ بروکر و پلتفرم', imp_ew='پلتفرم‌های متعدد (صفحه وارد کردنش را ببین)',
  h_them='{X} کجا قوی‌تر است', h_us='Simple Trading Journal کجا قوی‌تر است', h_choose='کدام را انتخاب کنم؟',
  us=['پلن رایگان بدون محدودیت زمانی (روزانه ۲ معامله) و دوره آزمایشی ۳ روزه Pro بدون کارت.',
      'Pro ماهانه $14.99 یا سالانه $119 است — ارزان‌ترین گزینه {X} {P} است.',
      'کل برنامه به ۹ زبان، از جمله فارسی، ترکی و عربی.',
      'متاتریدر ۵ با یک افزونه کوچک و یک کلید وصل می‌شود؛ هرگز رمز سرمایه‌گذار را به اشتراک نمی‌گذاری.',
      'تحلیل انضباط داخلی (معامله انتقامی، افزایش ریسک پس از ضرر، معامله بیش از حد، معامله خارج از ساعت) و دنبال کردن حدهای پراپ‌فرم.'],
  them={
    'tradezella': ['اتصال به بروکرها و پراپ‌فرم‌های بسیار بیشتر — به گفته Tradezella بیش از ۵۰۰.',
                   'سابقه طولانی‌تر و امکانات گسترده‌تر در پلن‌های بالاتر.',
                   'حساب‌های MT4 و MT5 بدون نصب چیزی در متاتریدر وصل می‌شوند.'],
    'tradersync': ['بیش از ۲۰۰ بروکر و پلتفرم پشتیبانی‌شده.',
                   'دستیار هوش مصنوعی (Cypher) و بازپخش معاملات در پلن‌های بالاتر.',
                   'دوره آزمایشی ۷ روزه با همه امکانات، بدون کارت.'],
    'edgewonk': ['ژورنالی قدیمی و جاافتاده با یک پلن که همه امکانات را دارد.',
                 'ضمانت بازگشت وجه ۱۴ روزه.',
                 'همگام‌سازی خودکار MT4 و MT5 با انتشار گزارش خود متاتریدر.'],
  },
  choose='اگر به طیف بسیار گسترده‌ای از اتصال بروکرها یا ابزارهای پیشرفته‌ترش نیاز داری، {X} شاید برایت مناسب‌تر باشد. اگر روی متاتریدر معامله می‌کنی، ژورنالی به زبان خودت می‌خواهی و ترجیح می‌دهی رایگان شروع کنی، Simple Trading Journal را امتحان کن — پلن رایگان کارت نمی‌خواهد.',
),
'ar': dict(
  title='Simple Trading Journal مقابل {X}: مقارنة صادقة',
  desc='تبحث عن بديل لـ {X}؟ الأسعار والخطة المجانية والتجربة ومزامنة ميتاتريدر جنباً إلى جنب، وأين يتفوق كل منهما.',
  intro='{X} من أشهر سجلات التداول. إن كنت تبحث عن بديل أرخص أو بلغتك أو بخطة مجانية، فهذه مقارنة Simple Trading Journal به.',
  note='أُخذت أسعار {X} وميزاته من صفحات الأسعار والمساعدة الخاصة به في سبتمبر 2026 وقد تكون تغيّرت. راجع موقعه قبل أن تقرر.',
  labels=['', 'السعر الشهري', 'السعر السنوي', 'خطة مجانية', 'تجربة مجانية', 'مزامنة ميتاتريدر التلقائية', 'طريقة ربط ميتاتريدر', 'الاستيراد'],
  yes='نعم', no='لا',
  free_us='نعم — صفقتان يومياً دون حد زمني', trial_us='3 أيام من Pro دون بطاقة',
  mt_us='ميتاتريدر 5 (MT4: استيراد التقرير)', conn_us='إضافة في MT5 + مفتاح، دون مشاركة كلمة مرور',
  imp_us='تقرير MT4/MT5، cTrader، TradeLocker، DXtrade، Match-Trader، أي CSV',
  yearly_only='— (سنوي فقط)', not_listed='غير مذكورة في صفحة الأسعار',
  trial_ts='7 أيام دون بطاقة', trial_ew='لا — ضمان استرداد 14 يوماً',
  mt_both='MT4 وMT5', conn_tz='رقم الحساب + كلمة مرور المستثمر', conn_ew='نشر تقارير ميتاتريدر عبر FTP',
  imp_tz='أكثر من 500 وسيط وشركة تمويل', imp_ts='أكثر من 200 وسيط ومنصة', imp_ew='منصات عديدة (راجع صفحة الاستيراد لديه)',
  h_them='أين يتفوق {X}', h_us='أين يتفوق Simple Trading Journal', h_choose='أيهما تختار؟',
  us=['خطة مجانية دون حد زمني (صفقتان يومياً) وتجربة Pro لمدة 3 أيام دون بطاقة.',
      'يكلّف Pro ‏$14.99 شهرياً أو $119 سنوياً — أرخص خيار لدى {X} هو {P}.',
      'التطبيق كله بـ 9 لغات، منها العربية والتركية والفارسية.',
      'يتصل ميتاتريدر 5 عبر إضافة صغيرة ومفتاح؛ لا تشارك كلمة مرور المستثمر أبداً.',
      'تحليل انضباط مدمج (صفقات الانتقام، رفع المخاطرة بعد الخسائر، الإفراط في التداول، التداول خارج الساعات المعتادة) ومتابعة حدود شركات التمويل.'],
  them={
    'tradezella': ['تكاملات أكثر بكثير مع الوسطاء وشركات التمويل — أكثر من 500 بحسب Tradezella.',
                   'سجل أطول وميزات أوسع في خططه الأعلى.',
                   'تتصل حسابات MT4 وMT5 دون تثبيت أي شيء في ميتاتريدر.'],
    'tradersync': ['أكثر من 200 وسيط ومنصة مدعومة.',
                   'مساعد ذكاء اصطناعي (Cypher) وإعادة تشغيل الصفقات في خططه الأعلى.',
                   'تجربة 7 أيام بكل الميزات دون بطاقة.'],
    'edgewonk': ['سجل عريق بخطة واحدة تشمل كل الميزات.',
                 'ضمان استرداد المال لمدة 14 يوماً.',
                 'مزامنة تلقائية لـ MT4 وMT5 عبر نشر التقارير الخاص بميتاتريدر.'],
  },
  choose='إن كنت تحتاج مجموعة واسعة جداً من تكاملات الوسطاء أو أدواته الأكثر تقدماً، فقد يناسبك {X} أكثر. وإن كنت تتداول على ميتاتريدر وتريد سجلاً بلغتك وتفضّل البدء مجاناً، فجرّب Simple Trading Journal — الخطة المجانية لا تحتاج بطاقة.',
),
'ru': dict(
  title='Simple Trading Journal и {X}: честное сравнение',
  desc='Ищете альтернативу {X}? Цены, бесплатный план, пробный период и синхронизация с MetaTrader рядом — и в чём каждый сильнее.',
  intro='{X} — один из самых известных торговых журналов. Если вам нужна альтернатива — дешевле, на вашем языке или с бесплатным планом, — вот как с ним сравнивается Simple Trading Journal.',
  note='Цены и возможности {X} взяты с его собственных страниц цен и справки в сентябре 2026 года и могли измениться. Проверьте на его сайте, прежде чем решать.',
  labels=['', 'Цена в месяц', 'Цена в год', 'Бесплатный план', 'Бесплатный пробный период', 'Автосинхронизация MetaTrader', 'Как подключается MetaTrader', 'Импорт'],
  yes='Есть', no='Нет',
  free_us='Есть — 2 сделки в день, без ограничения по времени', trial_us='3 дня Pro, без карты',
  mt_us='MetaTrader 5 (MT4: импорт отчёта)', conn_us='Модуль в MT5 + ключ, без передачи пароля',
  imp_us='Отчёт MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, любой CSV',
  yearly_only='— (только годовая)', not_listed='Не указан на странице цен',
  trial_ts='7 дней, без карты', trial_ew='Нет — возврат денег в течение 14 дней',
  mt_both='MT4 и MT5', conn_tz='Номер счёта + инвесторский пароль', conn_ew='Публикация отчётов MetaTrader по FTP',
  imp_tz='Более 500 брокеров и проп-фирм', imp_ts='Более 200 брокеров и платформ', imp_ew='Много платформ (см. его страницу импорта)',
  h_them='В чём сильнее {X}', h_us='В чём сильнее Simple Trading Journal', h_choose='Что выбрать?',
  us=['Бесплатный план без ограничения по времени (2 сделки в день) и 3 дня Pro без карты.',
      'Pro стоит $14.99 в месяц или $119 в год — самый дешёвый вариант {X} стоит {P}.',
      'Всё приложение на 9 языках, включая русский, турецкий, персидский и арабский.',
      'MetaTrader 5 подключается через небольшой модуль и ключ — инвесторский пароль вы никому не передаёте.',
      'Встроенный анализ дисциплины (сделки «на отыгрыш», рост риска после убытков, овертрейдинг, торговля вне привычных часов) и контроль лимитов проп-фирм.'],
  them={
    'tradezella': ['Гораздо больше интеграций с брокерами и проп-фирмами — более 500, по данным Tradezella.',
                   'Более долгая история и больше функций в старших тарифах.',
                   'Счета MT4 и MT5 подключаются без установки чего-либо в MetaTrader.'],
    'tradersync': ['Более 200 поддерживаемых брокеров и платформ.',
                   'ИИ-ассистент (Cypher) и повтор сделок в старших тарифах.',
                   '7-дневный пробный период со всеми функциями, без карты.'],
    'edgewonk': ['Давно известный журнал с одним тарифом, включающим все функции.',
                 'Гарантия возврата денег в течение 14 дней.',
                 'Автосинхронизация MT4 и MT5 через собственную публикацию отчётов MetaTrader.'],
  },
  choose='Если вам нужен очень широкий выбор интеграций с брокерами или его более продвинутые инструменты, {X} может подойти лучше. Если вы торгуете в MetaTrader, хотите журнал на своём языке и предпочитаете начать бесплатно, попробуйте Simple Trading Journal — бесплатному плану карта не нужна.',
),
'es': dict(
  title='Simple Trading Journal frente a {X}: una comparación honesta',
  desc='¿Buscas una alternativa a {X}? Precios, plan gratuito, prueba y sincronización con MetaTrader lado a lado, y en qué destaca cada uno.',
  intro='{X} es uno de los diarios de trading más conocidos. Si buscas una alternativa más barata, en tu idioma o con plan gratuito, así se compara Simple Trading Journal.',
  note='Los precios y funciones de {X} se tomaron de sus propias páginas de precios y ayuda en septiembre de 2026 y pueden haber cambiado. Consulta su web antes de decidir.',
  labels=['', 'Precio mensual', 'Precio anual', 'Plan gratuito', 'Prueba gratuita', 'Sincronización automática con MetaTrader', 'Cómo se conecta MetaTrader', 'Importación'],
  yes='Sí', no='No',
  free_us='Sí — 2 operaciones al día, sin límite de tiempo', trial_us='3 días de Pro, sin tarjeta',
  mt_us='MetaTrader 5 (MT4: importar informe)', conn_us='Complemento en MT5 + clave, sin compartir contraseña',
  imp_us='Informe MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, cualquier CSV',
  yearly_only='— (solo anual)', not_listed='No figura en su página de precios',
  trial_ts='7 días, sin tarjeta', trial_ew='No — garantía de devolución de 14 días',
  mt_both='MT4 y MT5', conn_tz='Número de cuenta + contraseña de inversor', conn_ew='Publicación de informes por FTP de MetaTrader',
  imp_tz='Más de 500 brókers y prop firms', imp_ts='Más de 200 brókers y plataformas', imp_ew='Muchas plataformas (ver su página de importación)',
  h_them='Dónde destaca {X}', h_us='Dónde destaca Simple Trading Journal', h_choose='¿Cuál elegir?',
  us=['Un plan gratuito sin límite de tiempo (2 operaciones al día) y 3 días de Pro sin tarjeta.',
      'Pro cuesta $14.99 al mes o $119 al año; la opción más barata de {X} es {P}.',
      'Toda la aplicación en 9 idiomas, incluidos español, turco, persa y árabe.',
      'MetaTrader 5 se conecta con un pequeño complemento y una clave; nunca compartes tu contraseña de inversor.',
      'Análisis de disciplina integrado (operaciones de venganza, más riesgo tras pérdidas, sobreoperar, operar fuera de horario) y seguimiento de límites de prop firms.'],
  them={
    'tradezella': ['Muchas más integraciones con brókers y prop firms: más de 500, según Tradezella.',
                   'Más trayectoria y más funciones en sus planes superiores.',
                   'Las cuentas MT4 y MT5 se sincronizan sin instalar nada en MetaTrader.'],
    'tradersync': ['Más de 200 brókers y plataformas compatibles.',
                   'Un asistente de IA (Cypher) y repetición de operaciones en sus planes superiores.',
                   'Una prueba de 7 días con todas las funciones, sin tarjeta.'],
    'edgewonk': ['Un diario veterano con un único plan que incluye todas las funciones.',
                 'Garantía de devolución de 14 días.',
                 'Sincronización automática de MT4 y MT5 con la publicación de informes del propio MetaTrader.'],
  },
  choose='Si necesitas una gama muy amplia de integraciones con brókers o sus herramientas más avanzadas, {X} puede encajarte mejor. Si operas en MetaTrader, quieres un diario en tu idioma y prefieres empezar gratis, prueba Simple Trading Journal: el plan gratuito no pide tarjeta.',
),
'pt': dict(
  title='Simple Trading Journal vs {X}: uma comparação honesta',
  desc='Procuras uma alternativa ao {X}? Preços, plano gratuito, teste e sincronização com o MetaTrader lado a lado, e onde cada um é mais forte.',
  intro='O {X} é um dos diários de trading mais conhecidos. Se procuras uma alternativa mais barata, na tua língua ou com plano gratuito, é assim que o Simple Trading Journal se compara.',
  note='Os preços e funcionalidades do {X} foram retirados das suas próprias páginas de preços e ajuda em setembro de 2026 e podem ter mudado. Confirma no site antes de decidir.',
  labels=['', 'Preço mensal', 'Preço anual', 'Plano gratuito', 'Teste gratuito', 'Sincronização automática com o MetaTrader', 'Como o MetaTrader se liga', 'Importação'],
  yes='Sim', no='Não',
  free_us='Sim — 2 operações por dia, sem limite de tempo', trial_us='3 dias de Pro, sem cartão',
  mt_us='MetaTrader 5 (MT4: importar relatório)', conn_us='Complemento no MT5 + chave, sem partilhar palavra-passe',
  imp_us='Relatório MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, qualquer CSV',
  yearly_only='— (só anual)', not_listed='Não indicado na página de preços',
  trial_ts='7 dias, sem cartão', trial_ew='Não — garantia de reembolso de 14 dias',
  mt_both='MT4 e MT5', conn_tz='Número de conta + palavra-passe de investidor', conn_ew='Publicação de relatórios por FTP do MetaTrader',
  imp_tz='Mais de 500 corretoras e prop firms', imp_ts='Mais de 200 corretoras e plataformas', imp_ew='Muitas plataformas (ver a página de importação)',
  h_them='Onde o {X} é mais forte', h_us='Onde o Simple Trading Journal é mais forte', h_choose='Qual escolher?',
  us=['Um plano gratuito sem limite de tempo (2 operações por dia) e 3 dias de Pro sem cartão.',
      'O Pro custa $14.99 por mês ou $119 por ano — a opção mais barata do {X} é {P}.',
      'A aplicação inteira em 9 línguas, incluindo português, turco, persa e árabe.',
      'O MetaTrader 5 liga-se com um pequeno complemento e uma chave; nunca partilhas a palavra-passe de investidor.',
      'Análise de disciplina integrada (operações de vingança, mais risco depois de perdas, excesso de operações, operar fora de horas) e acompanhamento dos limites das prop firms.'],
  them={
    'tradezella': ['Muitas mais integrações com corretoras e prop firms — mais de 500, segundo o Tradezella.',
                   'Mais historial e mais funcionalidades nos planos superiores.',
                   'As contas MT4 e MT5 sincronizam sem instalar nada no MetaTrader.'],
    'tradersync': ['Mais de 200 corretoras e plataformas suportadas.',
                   'Um assistente de IA (Cypher) e repetição de operações nos planos superiores.',
                   'Um teste de 7 dias com todas as funcionalidades, sem cartão.'],
    'edgewonk': ['Um diário veterano com um único plano que inclui todas as funcionalidades.',
                 'Garantia de reembolso de 14 dias.',
                 'Sincronização automática de MT4 e MT5 com a publicação de relatórios do próprio MetaTrader.'],
  },
  choose='Se precisas de uma gama muito grande de integrações com corretoras ou das ferramentas mais avançadas, o {X} pode servir-te melhor. Se operas no MetaTrader, queres um diário na tua língua e preferes começar grátis, experimenta o Simple Trading Journal — o plano gratuito não pede cartão.',
),
'de': dict(
  title='Simple Trading Journal vs. {X}: ein ehrlicher Vergleich',
  desc='Auf der Suche nach einer {X}-Alternative? Preise, Gratis-Plan, Testphase und MetaTrader-Sync im direkten Vergleich – und wo welches Tool stärker ist.',
  intro='{X} ist eines der bekanntesten Trading-Journale. Wenn du eine Alternative suchst – günstiger, in deiner Sprache oder mit Gratis-Plan –, so schneidet Simple Trading Journal im Vergleich ab.',
  note='Preise und Funktionen von {X} stammen von seinen eigenen Preis- und Hilfeseiten im September 2026 und können sich geändert haben. Prüfe seine Website, bevor du dich entscheidest.',
  labels=['', 'Monatspreis', 'Jahrespreis', 'Gratis-Plan', 'Kostenlose Testphase', 'Automatischer MetaTrader-Sync', 'So wird MetaTrader verbunden', 'Import'],
  yes='Ja', no='Nein',
  free_us='Ja – 2 Trades pro Tag, ohne Zeitlimit', trial_us='3 Tage Pro, ohne Karte',
  mt_us='MetaTrader 5 (MT4: Berichtsimport)', conn_us='Add-on in MT5 + Schlüssel, kein Passwort nötig',
  imp_us='MT4/MT5-Bericht, cTrader, TradeLocker, DXtrade, Match-Trader, jede CSV',
  yearly_only='– (nur jährlich)', not_listed='Nicht auf der Preisseite angegeben',
  trial_ts='7 Tage, ohne Karte', trial_ew='Nein – 14 Tage Geld-zurück-Garantie',
  mt_both='MT4 und MT5', conn_tz='Kontonummer + Investor-Passwort', conn_ew='FTP-Berichtsveröffentlichung von MetaTrader',
  imp_tz='Über 500 Broker und Prop-Firmen', imp_ts='Über 200 Broker und Plattformen', imp_ew='Viele Plattformen (siehe Import-Seite)',
  h_them='Wo {X} stärker ist', h_us='Wo Simple Trading Journal stärker ist', h_choose='Welches solltest du wählen?',
  us=['Ein Gratis-Plan ohne Zeitlimit (2 Trades pro Tag) und 3 Tage Pro ohne Karte.',
      'Pro kostet $14.99 im Monat oder $119 im Jahr – die günstigste Option von {X} kostet {P}.',
      'Die ganze App in 9 Sprachen, darunter Deutsch, Türkisch, Persisch und Arabisch.',
      'MetaTrader 5 verbindet sich über ein kleines Add-on und einen Schlüssel; dein Investor-Passwort gibst du nie weiter.',
      'Eingebaute Disziplin-Analyse (Revenge-Trades, steigendes Risiko nach Verlusten, Overtrading, Handeln außerhalb deiner Zeiten) und Prop-Firm-Limit-Tracking.'],
  them={
    'tradezella': ['Deutlich mehr Broker- und Prop-Firm-Anbindungen – laut Tradezella über 500.',
                   'Längere Erfahrung und mehr Funktionen in den höheren Tarifen.',
                   'MT4- und MT5-Konten synchronisieren, ohne etwas in MetaTrader zu installieren.'],
    'tradersync': ['Über 200 unterstützte Broker und Plattformen.',
                   'Ein KI-Assistent (Cypher) und Trade-Replay in den höheren Tarifen.',
                   'Eine 7-tägige Testphase mit allen Funktionen, ohne Karte.'],
    'edgewonk': ['Ein etabliertes Journal mit einem einzigen Tarif, der alle Funktionen enthält.',
                 'Eine 14-tägige Geld-zurück-Garantie.',
                 'Automatischer MT4- und MT5-Sync über die eigene Berichtsveröffentlichung von MetaTrader.'],
  },
  choose='Wenn du eine sehr breite Auswahl an Broker-Anbindungen oder die fortgeschritteneren Werkzeuge brauchst, passt {X} vielleicht besser. Wenn du auf MetaTrader handelst, ein Journal in deiner Sprache willst und lieber kostenlos startest, probier Simple Trading Journal – der Gratis-Plan braucht keine Karte.',
),
'fr': dict(
  title='Simple Trading Journal ou {X} : une comparaison honnête',
  desc='Vous cherchez une alternative à {X} ? Prix, plan gratuit, essai et synchronisation MetaTrader côte à côte, et les points forts de chacun.',
  intro='{X} est l\'un des journaux de trading les plus connus. Si vous cherchez une alternative moins chère, dans votre langue ou avec un plan gratuit, voici comment Simple Trading Journal se compare.',
  note='Les prix et fonctionnalités de {X} proviennent de ses propres pages de tarifs et d\'aide en septembre 2026 et ont pu changer. Vérifiez sur son site avant de décider.',
  labels=['', 'Prix mensuel', 'Prix annuel', 'Plan gratuit', 'Essai gratuit', 'Synchro automatique MetaTrader', 'Connexion à MetaTrader', 'Import'],
  yes='Oui', no='Non',
  free_us='Oui — 2 trades par jour, sans limite de durée', trial_us='3 jours de Pro, sans carte',
  mt_us='MetaTrader 5 (MT4 : import de relevé)', conn_us='Module dans MT5 + clé, sans partager de mot de passe',
  imp_us='Relevé MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader, tout CSV',
  yearly_only='— (annuel uniquement)', not_listed='Non indiqué sur sa page de tarifs',
  trial_ts='7 jours, sans carte', trial_ew='Non — satisfait ou remboursé 14 jours',
  mt_both='MT4 et MT5', conn_tz='Numéro de compte + mot de passe investisseur', conn_ew='Publication des rapports MetaTrader par FTP',
  imp_tz='Plus de 500 courtiers et prop firms', imp_ts='Plus de 200 courtiers et plateformes', imp_ew='Nombreuses plateformes (voir sa page d\'import)',
  h_them='Là où {X} est plus fort', h_us='Là où Simple Trading Journal est plus fort', h_choose='Lequel choisir ?',
  us=['Un plan gratuit sans limite de durée (2 trades par jour) et 3 jours de Pro sans carte.',
      'Pro coûte $14.99 par mois ou $119 par an — l\'option la moins chère de {X} est à {P}.',
      'Toute l\'application en 9 langues, dont le français, le turc, le persan et l\'arabe.',
      'MetaTrader 5 se connecte par un petit module et une clé ; vous ne partagez jamais votre mot de passe investisseur.',
      'Analyse de discipline intégrée (trades de revanche, risque en hausse après des pertes, surtrading, trading hors horaires) et suivi des limites de prop firm.'],
  them={
    'tradezella': ['Beaucoup plus d\'intégrations de courtiers et de prop firms — plus de 500 selon Tradezella.',
                   'Plus d\'ancienneté et davantage de fonctionnalités dans ses offres supérieures.',
                   'Les comptes MT4 et MT5 se synchronisent sans rien installer dans MetaTrader.'],
    'tradersync': ['Plus de 200 courtiers et plateformes pris en charge.',
                   'Un assistant IA (Cypher) et le replay des trades dans ses offres supérieures.',
                   'Un essai de 7 jours avec toutes les fonctionnalités, sans carte.'],
    'edgewonk': ['Un journal de longue date avec une seule offre qui inclut toutes les fonctionnalités.',
                 'Une garantie satisfait ou remboursé de 14 jours.',
                 'Synchro automatique MT4 et MT5 via la publication de rapports propre à MetaTrader.'],
  },
  choose='Si vous avez besoin d\'un très large choix d\'intégrations de courtiers ou de ses outils plus avancés, {X} vous conviendra peut-être mieux. Si vous tradez sur MetaTrader, voulez un journal dans votre langue et préférez commencer gratuitement, essayez Simple Trading Journal — le plan gratuit ne demande pas de carte.',
),
}

COMP = {
  'tradezella': dict(X='Tradezella', monthly='$35 – $99', yearly='$315 – $891', P='$35 {pm}', trial='not_listed', conn='conn_tz', imp='imp_tz'),
  'tradersync': dict(X='TraderSync', monthly='$29.95 – $79.95', yearly='$269.52 – $719.52', P='$29.95 {pm}', trial='trial_ts', conn=None, imp='imp_ts'),
  'edgewonk': dict(X='Edgewonk', monthly=None, yearly='$197', P='$197 {py}', trial='trial_ew', conn='conn_ew', imp='imp_ew'),
}
PER = {  # "per month" / "per year" tails for {P}
  'en': ('a month', 'a year'), 'tr': ('aylık', 'yıllık'), 'fa': ('در ماه', 'در سال'), 'ar': ('شهرياً', 'سنوياً'),
  'ru': ('в месяц', 'в год'), 'es': ('al mes', 'al año'), 'pt': ('por mês', 'por ano'), 'de': ('im Monat', 'im Jahr'), 'fr': ('par mois', 'par an'),
}

def price_phrase(lang, c):
    pm, py = PER[lang]
    amt, unit = c['P'].split(' ')
    tail = pm if unit == '{pm}' else py
    if lang == 'tr':
        return f'{tail} {amt}'
    return f'{amt} {tail}'

def build(lang, slug):
    p = P[lang]; c = COMP[slug]; X = c['X']
    GEN = {'Tradezella': "Tradezella'nın", 'TraderSync': "TraderSync'in", 'Edgewonk': "Edgewonk'un"}
    f = lambda s: s.replace("{X}'ın", GEN[X]).replace('{X}', X).replace('{P}', price_phrase(lang, c))
    L = p['labels']
    rows = [
        [L[0], 'Simple Trading Journal', X],
        [L[1], '$14.99', c['monthly'] or p['yearly_only']],
        [L[2], '$119', c['yearly']],
        [L[3], p['free_us'], p['no']],
        [L[4], p['trial_us'], p[c['trial']]],
        [L[5], p['mt_us'], p['mt_both']],
    ]
    if c['conn']:
        rows.append([L[6], p['conn_us'], p[c['conn']]])
    rows.append([L[7], p['imp_us'], p[c['imp']]])
    body = [
        {'p': f(p['intro'])},
        {'table': rows},
        {'note': f(p['note'])},
        {'h2': f(p['h_them'])},
        {'ul': [f(x) for x in p['them'][slug]]},
        {'h2': f(p['h_us'])},
        {'ul': [f(x) for x in p['us']]},
        {'h2': f(p['h_choose'])},
        {'p': f(p['choose'])},
    ]
    return {'title': f(p['title']), 'description': f(p['desc']), 'body': body}

for lang in LANGS:
    path = ROOT + lang + '.ts'
    s = open(path).read()
    entries = ''.join(
        f"  '{slug}-alternative': {json.dumps(build(lang, slug), ensure_ascii=False, indent=2).replace(chr(10), chr(10) + '  ')},\n"
        for slug in COMP)
    anchor = '};\n\nexport default TEXT;'
    assert anchor in s, lang
    # idempotent: drop earlier generated comparisons
    s = re.sub(r"  // --- karşılaştırmalar \(scripts: compare_gen\) ---\n.*?(?=};\n\nexport default TEXT;)", '', s, flags=re.S)
    s = s.replace(anchor, "  // --- karşılaştırmalar (scripts: compare_gen) ---\n" + entries + anchor)
    open(path, 'w').write(s)
print('ok')

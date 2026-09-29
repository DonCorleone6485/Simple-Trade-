# Sosyal medya kurulum listesi

Hesapları kullanıcı açar (şifre, telefon doğrulaması, CAPTCHA). Hesap açıldıktan ve
kullanıcı giriş yaptıktan sonra profil alanlarını Claude, kullanıcının onayıyla
doldurabilir. Şifre hiçbir zaman sohbete yazılmaz; hepsi şifre yöneticisinde durur.

Kullanıcı adı kontrolü: 2026-09-29, herkese açık profil adreslerinden. Kayıt anında
yeniden kontrol edilir; arada biri alabilir.

## 0. Önce

1. **`social@simpletradejournal.io` takma adı** (Google Workspace, ücretsiz):
   admin.google.com → **Dizin → Kullanıcılar** → admin@ satırına tıkla →
   **Kullanıcı bilgileri → Alternatif e-posta adresleri (takma adlar)** → `social` yaz →
   **Kaydet**. Birkaç dakika içinde çalışır. *(Durum 2026-09-29: eklendi, "Sosyal medya" filtresi kuruldu; deneme postası bekleniyor.)*

   **Nasıl çalışır:** `social@` ayrı bir hesap değil, admin@'in ikinci adresi. Ayrı
   giriş, ayrı şifre ya da ayrı gelen kutusu yok; social@'e gelen her posta doğrudan
   admin@ gelen kutusuna düşer. Ek ücret yok. Platformlara kayıt olurken e-posta olarak
   `social@simpletradejournal.io` yazılır; doğrulama kodları admin@'de okunur.

   **Gmail'de ayırmak için filtre** (admin@ ile giriş yapılmışken): arama kutusundaki
   ayar simgesi → **Kime:** `social@simpletradejournal.io` → **Filtre oluştur** →
   **Etiketi uygula: "Sosyal medya"** (yeni etiket) → isteğe bağlı **Gelen kutusunu
   atla** → **Filtre oluştur**. Böylece platform postaları tek etikette toplanır.

   **Hangi platform hangi e-postayla açılır:**

   | Platform | Kayıt e-postası | Not |
   |---|---|---|
   | Instagram | `social@` | |
   | Threads | — | Instagram hesabıyla giriş, ayrı e-posta yok |
   | YouTube | `admin@` (Google hesabı) | Takma adla Google girişi yapılmaz; kanal admin@ altında **marka hesabı** olarak açılır |
   | TikTok | `social@` | |
   | X | `social@` | |
   | Telegram kanalı | — | E-posta değil telefon numarası ister |
   | Facebook sayfası | Kişisel Facebook hesabı | Sayfa kişisel hesaptan açılır; sayfanın iletişim e-postası `support@` |
   | LinkedIn şirket sayfası | Kişisel LinkedIn hesabı | Sayfa kişisel hesaptan açılır; sayfanın iletişim e-postası `support@` |
   | Discord | `social@` | |
   | Reddit | `social@` | |
   | Meta Business Suite (ileride) | `social@` | İşletme hesabının iletişim e-postası |

   Profillerde herkese görünen e-posta her zaman `support@` (aşağıda "Her profilde
   ortak"); `social@` yalnız kayıt ve bildirimler için.
2. **Şifre yöneticisi:** Bitwarden (ücretsiz plan yeter). Her hesaba ayrı, uzun,
   rastgele şifre; her hesapta iki adımlı doğrulama (2FA) açık.
3. Profil fotoğrafı: logo (kare, en az 400×400). Kapak görselleri sonra marka kitiyle.

## 1. Platformlar ve kullanıcı adları

| # | Platform | Kullanıcı adı | Durum (2026-09-29) | Kayıt | Not |
|---|---|---|---|---|---|
| 1 | Instagram | `@simpletradejournal` | ✅ boş | instagram.com/accounts/emailsignup | Kayıttan sonra **Profesyonel hesap → İşletme**'ye geç (reklam ve istatistik için) |
| 2 | Threads | `@simpletradejournal` | Instagram'dan gelir | threads.com (Instagram ile giriş) | Ayrı kayıt yok |
| 3 | YouTube | `@simpletradejournal` | ✅ boş | youtube.com → Kanal oluştur | admin@ Google hesabıyla, **marka hesabı** olarak aç (kişisel adla değil) |
| 4 | TikTok | `@simpletradejournal` | ✅ boş | tiktok.com/signup | Sonra **İşletme hesabına** geç |
| 5 | X | `@SimpleTradeJrnl` | ✅ boş | x.com/i/flow/signup | X en fazla 15 karakter kabul ediyor; `simpletradejournal` sığmıyor. `@stjournal` dolu (2011'den kalma boş hesap) |
| 6 | Telegram kanalı | `@simpletradejournal` | ✅ boş | Telegram uygulaması → Yeni kanal → Herkese açık | Telefon numarası ister. `@stjournal` dolu |
| 7 | Facebook sayfası | `facebook.com/simpletradejournal` | ✅ boş görünüyor | facebook.com/pages/create | Kişisel Facebook hesabı gerekir; sayfa ondan açılır. Meta Business Suite ve Pixel için şart |
| 8 | LinkedIn şirket sayfası | `linkedin.com/company/simpletradejournal` | ✅ boş | linkedin.com/company/setup/new | Kişisel LinkedIn hesabı gerekir |
| 9 | Discord sunucusu | "Simple Trading Journal" | — | discord.com/register → Sunucu oluştur | Özel adres (discord.gg/…) yalnız yükseltilmiş sunucularda var; kalıcı bir davet bağlantısı kullanılır |
| 10 | Reddit | `u/simpletradejournal` | kontrol edilemedi | reddit.com/register | Tarayıcıdan açılmadı; kayıtta görülür. Reklam için değil, yardım ederek kullanılacak |

`@stjournal` Instagram, TikTok, X, YouTube ve Telegram'da dolu — yedek olarak işe yaramıyor.
Bir yerde `simpletradejournal` alınmışsa yedek: `simpletradejournal.app` (Instagram,
TikTok'ta nokta serbest) ya da `stjournalapp`.

**Her profilde ortak:**
- Görünen ad: **Simple Trading Journal**
- Web sitesi: **https://simpletradejournal.io**
- E-posta (istenirse): **support@simpletradejournal.io**
- Kategori (sorulursa): Yazılım / Uygulama sayfası

## 2. Biyografiler

Kâr vaadi yok; yalnız ürünün yaptığı. Karakter sınırları: TikTok 80, Instagram/Threads
150, X 160, Telegram açıklaması 255, Facebook tanıtım 101. YouTube, LinkedIn ve
Facebook "Hakkında" için uzun metin.

- **Kısa** (≤80) — TikTok, Facebook tanıtım
- **Standart** (≤150) — Instagram, Threads, X, Telegram
- **Uzun** — YouTube kanal açıklaması, LinkedIn "Hakkında", Facebook "Hakkında", Discord

Hangi dil nerede: ana hesaplar İngilizce. Türkçe ve Farsça Instagram ile Telegram
açılırsa kendi dilinde. Diğer diller, ileride o dilde hesap açılırsa ya da uzun
açıklamanın altına eklemek için.

### English
**Kısa:** Trading journal for MT4 & MT5 traders. Free plan, 9 languages.

**Standart:** Trading journal that syncs MT4 & MT5 automatically. Discipline analysis, prop firm limits, 9 languages. Free plan, no card.

**Uzun:** Simple Trading Journal records your MetaTrader 4 and 5 trades automatically and shows what actually drives your results: expectancy, profit factor, setups, a calendar and discipline analysis — revenge trades, overtrading and rising risk after losses. Prop firm accounts show how close you are to your daily and total loss limits. Available in 9 languages. Free plan, no card needed. simpletradejournal.io

### Türkçe
**Kısa:** MT4 ve MT5 trader'ları için trading journal. Ücretsiz plan, 9 dil.

**Standart:** MT4 ve MT5 işlemlerini otomatik kaydeden trading journal. Disiplin analizi, prop firma limitleri, 9 dil. Ücretsiz plan, kart yok.

**Uzun:** Simple Trading Journal, MetaTrader 4 ve 5 işlemlerini otomatik kaydeder ve sonuçlarını gerçekte neyin belirlediğini gösterir: beklenti, kâr faktörü, kurulumlar, takvim ve disiplin analizi — intikam işlemleri, aşırı işlem ve kayıptan sonra artan risk. Prop firma hesaplarında günlük ve toplam kayıp limitlerine ne kadar yakın olduğunu görürsün. 9 dilde. Ücretsiz plan, kart gerekmez. simpletradejournal.io

### فارسی
**Kısa:** ژورنال معاملاتی برای معامله‌گران MT4 و MT5. پلن رایگان، ۹ زبان.

**Standart:** ژورنال معاملاتی که معاملات MT4 و MT5 را خودکار ثبت می‌کند. تحلیل انضباط، محدودیت‌های پراپ فرم، ۹ زبان. پلن رایگان، بدون کارت.

**Uzun:** Simple Trading Journal معاملات متاتریدر ۴ و ۵ تو را خودکار ثبت می‌کند و نشان می‌دهد واقعاً چه چیزی نتایجت را می‌سازد: امید ریاضی، فاکتور سود، ستاپ‌ها، تقویم و تحلیل انضباط — معاملات انتقامی، معامله بیش از حد و افزایش ریسک بعد از ضرر. در حساب‌های پراپ فرم می‌بینی چقدر به محدودیت ضرر روزانه و کل نزدیکی. به ۹ زبان. پلن رایگان، بدون نیاز به کارت. simpletradejournal.io

### العربية
**Kısa:** سجل تداول لمتداولي MT4 وMT5. خطة مجانية، 9 لغات.

**Standart:** سجل تداول يسجّل صفقات MT4 وMT5 تلقائياً. تحليل الانضباط، حدود شركات التمويل، 9 لغات. خطة مجانية دون بطاقة.

**Uzun:** يسجّل Simple Trading Journal صفقاتك على ميتاتريدر 4 و5 تلقائياً ويُظهر ما يصنع نتائجك فعلاً: التوقع الرياضي، معامل الربح، الإعدادات، التقويم وتحليل الانضباط — صفقات الانتقام، الإفراط في التداول ورفع المخاطرة بعد الخسارة. في حسابات شركات التمويل ترى مدى قربك من حدَّي الخسارة اليومية والإجمالية. متوفر بـ 9 لغات. خطة مجانية دون بطاقة. simpletradejournal.io

### Русский
**Kısa:** Торговый журнал для трейдеров MT4 и MT5. Бесплатный план, 9 языков.

**Standart:** Торговый журнал с автозаписью сделок MT4 и MT5. Анализ дисциплины, лимиты проп-фирм, 9 языков. Бесплатный план, без карты.

**Uzun:** Simple Trading Journal автоматически записывает ваши сделки в MetaTrader 4 и 5 и показывает, что на самом деле определяет результат: матожидание, профит-фактор, сетапы, календарь и анализ дисциплины — сделки на отыгрыш, овертрейдинг и рост риска после убытков. На счетах проп-фирм видно, насколько вы близки к дневному и общему лимиту убытка. 9 языков. Бесплатный план, карта не нужна. simpletradejournal.io

### Español
**Kısa:** Diario de trading para traders de MT4 y MT5. Plan gratis, 9 idiomas.

**Standart:** Diario de trading que registra MT4 y MT5 automáticamente. Análisis de disciplina, límites de prop firms, 9 idiomas. Plan gratis, sin tarjeta.

**Uzun:** Simple Trading Journal registra automáticamente tus operaciones de MetaTrader 4 y 5 y muestra qué impulsa de verdad tus resultados: esperanza matemática, factor de beneficio, setups, un calendario y análisis de disciplina — operaciones de venganza, sobreoperar y más riesgo tras pérdidas. En cuentas de prop firms ves lo cerca que estás de los límites de pérdida diaria y total. En 9 idiomas. Plan gratis, sin tarjeta. simpletradejournal.io

### Português
**Kısa:** Diário de trading para traders de MT4 e MT5. Plano grátis, 9 línguas.

**Standart:** Diário de trading que regista MT4 e MT5 automaticamente. Análise de disciplina, limites de prop firms, 9 línguas. Plano grátis, sem cartão.

**Uzun:** O Simple Trading Journal regista automaticamente as tuas operações do MetaTrader 4 e 5 e mostra o que realmente determina os teus resultados: expectativa, fator de lucro, setups, um calendário e análise de disciplina — operações de vingança, overtrading e mais risco após perdas. Nas contas de prop firms vês quão perto estás dos limites de perda diária e total. Em 9 línguas. Plano grátis, sem cartão. simpletradejournal.io

### Deutsch
**Kısa:** Trading-Journal für MT4- und MT5-Trader. Gratis-Plan, 9 Sprachen.

**Standart:** Trading-Journal, das MT4 und MT5 automatisch erfasst. Disziplinanalyse, Prop-Firm-Limits, 9 Sprachen. Gratis-Plan, ohne Karte.

**Uzun:** Simple Trading Journal erfasst deine Trades aus MetaTrader 4 und 5 automatisch und zeigt, was deine Ergebnisse wirklich bestimmt: Erwartungswert, Profitfaktor, Setups, einen Kalender und eine Disziplinanalyse – Rache-Trades, Overtrading und steigendes Risiko nach Verlusten. Bei Prop-Firm-Konten siehst du, wie nah du an den täglichen und gesamten Verlustgrenzen bist. In 9 Sprachen. Gratis-Plan, ohne Karte. simpletradejournal.io

### Français
**Kısa:** Journal de trading pour traders MT4 et MT5. Plan gratuit, 9 langues.

**Standart:** Journal de trading qui enregistre MT4 et MT5 automatiquement. Analyse de discipline, limites des prop firms, 9 langues. Plan gratuit, sans carte.

**Uzun:** Simple Trading Journal enregistre automatiquement vos trades MetaTrader 4 et 5 et montre ce qui détermine vraiment vos résultats : espérance, profit factor, setups, un calendrier et une analyse de discipline — trades de revanche, surtrading et risque en hausse après une perte. Sur les comptes de prop firms, vous voyez à quel point vous êtes proche des limites de perte journalière et totale. En 9 langues. Plan gratuit, sans carte. simpletradejournal.io

## 3. Hesaplar açılınca (Claude)

- Profil alanlarını doldurmak (kullanıcı giriş yaptıktan sonra, onayıyla).
- Sitenin alt kısmına sosyal medya bağlantıları ve yapısal veriye `sameAs`.
- PLAN.md §2 tablosunda ilgili satırı ✅ yapmak.

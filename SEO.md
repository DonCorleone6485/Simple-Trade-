# SEO.md

SEO ile ilgili yapılan ve yapılacak her iş burada. Bir SEO işi bittiğinde ya da yeni
bir iş çıktığında aynı değişiklikte buraya işlenir (tarihle). Genel iş listesi
PLAN.md'de, teknik ayrıntılar NOTES.md'de.

Son güncelleme: 2026-09-29 (prop firma ve broker sayfaları)

---

## SEO nasıl bir çalışma? (kısa anlatım)

**Amaç:** İnsanlar Google'da (ve Bing'de, ChatGPT gibi asistanlarda) bir şey aradığında
karşılarına bizim sitemizin çıkması. Reklam parası ödemeden gelen ziyaretçi demek.

**Nasıl işler:** Google sürekli siteleri gezer (buna "tarama" denir), okuduğu sayfaları
kendi dizinine ekler, sonra her arama için en iyi cevabı veren sayfaları üste koyar.
Bizim işimiz üç şey:
1. **Google sayfalarımızı bulabilsin ve okuyabilsin** — teknik SEO.
2. **Sayfalarımız insanların aradığı sorulara iyi cevap versin** — içerik.
3. **Başka siteler bizden bahsetsin, bize bağlantı versin** — geri bağlantı. Google
   bunu "bu site güvenilir" işareti sayar.
Bir de **ölçüm**: hangi aramada kaçıncı çıkıyoruz, kaç kişi tıklıyor (Search Console).

**Ne kadar sürede sonuç verir:** Yavaş. Yeni bir sayfanın Google'da yerleşmesi birkaç
hafta ile birkaç ay sürer; yeni bir alan adı ilk 3–6 ayda az görünür. Ama bir kez
yerleşince sayfa yıllarca bedava ziyaretçi getirir. Bu yüzden erken ve düzenli
yapmak önemli, bir kerede çok yapmak değil.

### Ne zaman ne yapılır (takvim)

| Ne zaman | Ne yapılır | Kim |
|---|---|---|
| **Her yeni sayfada** | 9 dilde yazılır, başlık/açıklama, sitemap'e kendiliğinden girer; önemliyse Search Console'da "dizine eklenmesini iste". Bu dosyaya eklenir. | Claude |
| **Haftada 1** | Yeni bir yazı (içerik kümelerinden). | Claude yazar, kullanıcı onaylar |
| **Ayda 1** | Search Console raporu: hangi aramalarda çıkıyoruz, tıklamalar, dizine eklenmeyen sayfalar, hatalar. Sonuca göre başlık/açıklama düzeltmeleri. | Claude bakar, kullanıcıya özet |
| **Ayda 1** | Prop firma kuralları kontrolü (aşağıda). | Otomatik görev + kullanıcı onayı |
| **3–6 ayda 1** | Rakip karşılaştırma sayfalarındaki fiyatları kontrol; eski yazıları güncelleme. | Claude |
| **Sürekli** | Geri bağlantı: dizinler, sosyal medya profilleri, YouTube açıklamaları, forumlarda yardım. | Çoğu kullanıcı (hesaplar ona ait), metinleri Claude hazırlar |

### Otomatik kontrol görevi (prop firma kuralları) — kuruldu (2026-09-29)

Claude masaüstü uygulamasında zamanlanmış görev `prop-firm-rules-check` (her ayın 1'i 10:00):
1. Kurallar tek bir veri dosyasında durur; her kuralın yanında **kaynak bağlantısı**
   (firmanın resmî sayfası) ve **son kontrol tarihi** vardır.
2. **Ayda bir** zamanlanmış bir görev (Claude, arka planda) her firmanın kaynak
   sayfasını açar, bizdeki kurallarla karşılaştırır.
3. Fark bulursa **kendiliğinden yayınlamaz**; kullanıcıya özet gelir:
   "FTMO günlük kayıp limitini %5'ten %4'e çekmiş, güncelleyeyim mi?" Onay gelince
   veri dosyası değişir, 9 dildeki sayfalar kendiliğinden güncellenir.
4. Fark yoksa yalnız "son kontrol" tarihi yenilenir.
5. Bir firma uzun süre doğrulanamazsa (site değişti, kapandı) o sayfadaki sayılar
   gizlenir, okuyucu firmanın sitesine yönlendirilir. Eski kuralı doğruymuş gibi
   göstermektense hiç göstermemek.

Aynı düzen ileride rakip fiyatları için de kurulabilir.

---

## Arama motorları ve araçlar

| Araç | Durum | Ayrıntı |
|---|---|---|
| Google Search Console | ✅ 2026-09-27 | Alan adı mülkü, admin@ hesabıyla (otomatik doğrulandı). Sitemap gönderildi. Ana sayfa, /blog ve MT5 rehberi için dizine ekleme istendi. Yeni önemli sayfada: URL denetimi → "Dizine eklenmesini iste". |
| Vercel Analytics | ✅ 2026-09-28 | Ziyaretçi sayısı ve hangi sayfaların okunduğu (ücretsiz plan). |
| Bing Webmaster Tools | ⬜ Kullanıcıda | ChatGPT ve Copilot aramaları Bing'den besleniyor. Hesap açmak kullanıcıya ait: bing.com/webmasters → Google ile giriş → Search Console'dan içe aktar. Dizine ekleme IndexNow ile zaten gidiyor; hesap raporlar için. |
| IndexNow | ✅ 2026-09-29 | Yeni/değişen sayfayı Bing ve Yandex'e anında bildirir. Anahtar `public/8ed09c22….txt`; `npm run indexnow` (hepsi) ya da `npm run indexnow -- /blog/yeni` (yalnız verilenler), yayından sonra. |
| Yandex Webmaster | ⬜ İsteğe bağlı | Rusça trader'lar için. |
| Meta Pixel | ⬜ Bekliyor | SEO değil, reklam ölçümü; kimlik kullanıcıdan gelecek. |

## Teknik SEO

| İş | Durum | Nerede |
|---|---|---|
| Ön çizim (arama motoru sayfayı JavaScript'siz okur) | ✅ 2026-09-27 | `scripts/prerender.mjs`, `src/prerender.tsx` (PAGES) |
| Her sayfaya ayrı başlık ve açıklama | ✅ | `src/lib/seoMeta.ts` |
| Paylaşım resmi ve etiketleri (Open Graph) | ✅ | `public/og-image.png` |
| Yapısal veri: Organization, SoftwareApplication, Offer (fiyatlar) | ✅ | ana sayfa |
| robots.txt (`/journal` ve `/api/` kapalı) | ✅ | `public/robots.txt` |
| sitemap.xml (dilli, 126 adres) | ✅ | derlemede kendiliğinden üretiliyor |
| Gerçek 404 (olmayan sayfa 404 döner, ana sayfaya düşmez) | ✅ | canlıda doğrulandı |
| Dil başına adresler: /tr, /fa, /ar, /ru, /es, /pt, /de, /fr + hreflang + x-default | ✅ 2026-09-28 | `src/lib/langPath.ts` |
| Hız: kod bölme, ana paket 86 KB (gzip) | ✅ 2026-09-28 | |
| Yapısal veri: yazılar için Article, yardım için FAQPage, BreadcrumbList | ⬜ Yapılacak | Google'da zengin sonuç (tarih, SSS açılır kutusu) |
| llms.txt (yapay zekâ asistanları için site özeti) | ⬜ İsteğe bağlı | |

## Sayfalar (9 dilde, ön çizimli)

**Ana sayfalar:** ana sayfa, /help (yardım, 13 soru), /changelog (değişiklikler + yol haritası), /blog.

**Rehberler ve yazılar** (`src/content/articles.ts`, metinler `src/content/articles/<dil>.ts`):
| Adres | Tür | Eklendi |
|---|---|---|
| /blog/metatrader-5-auto-sync | Rehber | 2026-09-28 |
| /blog/import-trade-history | Rehber | 2026-09-28 |
| /blog/how-to-keep-a-trading-journal | Yazı | 2026-09-28 |
| /blog/r-multiple-explained | Yazı | 2026-09-28 |
| /blog/prop-firm-daily-loss-and-drawdown | Yazı | 2026-09-28 |
| /blog/pre-trade-checklist | Yazı | 2026-09-29 |
| /blog/trading-emotions-journal | Yazı | 2026-09-29 |
| /blog/position-sizing-risk-per-trade | Yazı (risk yönetimi) | 2026-09-29 |
| /blog/revenge-trading | Yazı (psikoloji) | 2026-09-29 |
| /blog/expectancy-and-profit-factor | Yazı (journal metrikleri) | 2026-09-29 |

**Rakip karşılaştırmaları** (rakip fiyatları Eylül 2026; 3–6 ayda bir kontrol et):
| Adres | Eklendi |
|---|---|
| /blog/tradezella-alternative | 2026-09-28 |
| /blog/tradersync-alternative | 2026-09-28 |
| /blog/edgewonk-alternative | 2026-09-28 |

**Prop firma sayfaları** — 2026-09-29 (veri: `src/content/directory.ts`, şablon: `src/components/DirectoryPage.tsx`):
| Adres | Programlar | Kaynak |
|---|---|---|
| /prop-firms | liste sayfası | — |
| /prop-firms/ftmo | Challenge 2-Step, 1-Step | ftmo.com/en/trading-objectives |
| /prop-firms/the5ers | High Stakes, Hyper Growth | the5ers.com/high-stakes, /hyper-growth |
| /prop-firms/alpha-capital | Pro 8%, Pro 10%, One 6/10/12% | help.alphacapitalgroup.uk (22 Tem 2026 tarihli yazılar) |
| /prop-firms/instant-funding | Instant Funding, One-Phase, Two-Phase | instantfunding.com/trading-rules |
| /prop-firms/fundingpips | 2 Step Standard, 2 Step Flex, 2 Step Pro, 1 Step Flex | fundingpips.com/trading-objectives (tarayıcıyla okundu) |

Her sayfada: kural tablosu (hedef, günlük/toplam kayıp, nereden ölçüldüğü, asgari gün),
firmaya özel notlar, Simple Trading Journal'da prop hesabı kurma adımları, "journal kapanan
işlemleri sayar, firma açık pozisyonu da sayabilir" uyarısı, kaynak bağlantıları, son kontrol
tarihi, "bağlantımız yok" notu, BreadcrumbList yapısal verisi. Firmanın sayfası bir şeyi
açıkça söylemiyorsa tabloda "Belirtilmemiş" yazar, tahmin yazılmaz.

**Broker sayfaları** — 2026-09-29:
| Adres | Platformlar (resmî sitesinden) |
|---|---|
| /brokers | liste sayfası |
| /brokers/pepperstone | MT4, MT5, cTrader, TradingView |
| /brokers/blackbull-markets | MT4, MT5, cTrader, TradingView |
| /brokers/axi | MT4, MT5, TradingView |
| /brokers/oanda | MT4, TradingView |

Her platform için Simple Trading Journal'a nasıl geldiği (MT4/MT5: EA ile otomatik ya da
dosya; cTrader vb.: dosya; TradingView: henüz doğrudan yok) ve rehber bağlantıları.
Bağlantılar: ana sayfa alt kısmı ("Prop Firmalar", "Broker'lar") ve /blog dizininin sonu.

Toplam: 28 sayfa × 9 dil = 252 adres (sitemap, 2026-09-29).

Search Console'da dizine ekleme istendi (2026-09-29): /prop-firms, /brokers, /tr/prop-firms, /prop-firms/ftmo.

## Yapılacaklar

### İçerik
- ⬜ **İçerik kümeleri:** trading journal, prop firm, risk yönetimi, trader psikolojisi — her birinde 10–20 yazı. Şu an toplam 13 (2026-09-29: pozisyon büyüklüğü, intikam işlemi, beklenti/kâr faktörü eklendi).
- ⬜ **Yeni karşılaştırmalar:** TradesViz, Tradervue, FX Replay.
- 🟡 **Programatik prop firma sayfaları** (`/prop-firms/<firma>`) — 5 firma YAPILDI (2026-09-29; FundingPips aynı gün tarayıcıyla eklendi). Sıradakiler: FundedNext (bot doğrulaması, tarayıcı da geçemiyor — kullanıcı kuralları yapıştırırsa eklenir), FXIFY (tablo hesap büyüklüğü seçicisine bağlı, okunan değerler çelişkili), E8 Markets. Kaynak yalnız firmanın resmî sitesi; her kuralda kaynak bağlantısı ve "son kontrol" tarihi. Kurallar tek veri dosyasında; ayda bir zamanlanmış görev kaynak sayfaları karşılaştırır, fark varsa kullanıcıya sorar (kendiliğinden yayınlamaz). Uzun süre doğrulanamayan firmada sayılar gizlenir. Logo yok, ortaklık ima edilmez.
- 🟡 **Programatik broker sayfaları** (`/brokers/<broker>`) — ilk 4 broker YAPILDI (2026-09-29). IC Markets, Exness, XM, FxPro, Tickmill siteleri buradan (Türkiye) açılmadı; başka ağdan platform listesi doğrulanınca eklenebilir.
- ✅ **Liste sayfaları** /prop-firms ve /brokers; ana sayfa alt kısmından ve blogdan bağlantı (2026-09-29).
- ✅ **Aylık kural kontrol görevi** — kuruldu (2026-09-29): masaüstü uygulamasında zamanlanmış görev `prop-firm-rules-check`, her ayın 1'i 10:00. Uygulama kapalıysa açılınca çalışır.

### Geri bağlantılar (başka sitelerden bize bağlantı)
- 🟡 Dizinler: Product Hunt, G2, Capterra, Trustpilot, AlternativeTo, SaaSHub — metinler hazır (2026-09-29, `docs/listings.md`); başvuruyu kullanıcı yapar.
- ⬜ Sosyal medya profillerinde site bağlantısı.
- ⬜ YouTube video açıklamaları, forumlar (Reddit, Forex Factory), konuk yazılar.

### Teknik
- ✅ IndexNow (2026-09-29). ⬜ Bing Webmaster hesabı (kullanıcı).
- 🟡 Yapısal veri: BreadcrumbList prop firma/broker sayfalarında var (2026-09-29); yazılarda BlogPosting/HowTo var. Kalan: yardım için FAQPage.
- ⬜ Search Console'da dizine eklenmeyen sayfaları ve arama sorgularını ayda bir kontrol.

## Kurallar
- Kâr vaadi dili yok ("bununla kazanırsın" vb.).
- Her yeni sayfa aynı değişiklikte 9 dilde.
- Uydurma yorum, kullanıcı sayısı ya da başarı iddiası yok.

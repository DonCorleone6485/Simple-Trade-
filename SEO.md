# SEO.md

SEO ile ilgili yapılan ve yapılacak her iş burada. Bir SEO işi bittiğinde ya da yeni
bir iş çıktığında aynı değişiklikte buraya işlenir (tarihle). Genel iş listesi
PLAN.md'de, teknik ayrıntılar NOTES.md'de.

Son güncelleme: 2026-09-29

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

### Otomatik kontrol görevi (prop firma kuralları) — henüz kurulmadı

Prop firma sayfaları yapılınca kurulacak:
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
| Bing Webmaster Tools | ⬜ Yapılacak | ChatGPT ve Copilot aramaları Bing'den besleniyor. Kullanıcının bir kez girişi gerekiyor; Search Console'dan içe aktarılabilir. |
| IndexNow | ⬜ Yapılacak | Yeni/değişen sayfayı Bing ve Yandex'e anında bildirir. Bing kurulunca. |
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

**Rakip karşılaştırmaları** (rakip fiyatları Eylül 2026; 3–6 ayda bir kontrol et):
| Adres | Eklendi |
|---|---|
| /blog/tradezella-alternative | 2026-09-28 |
| /blog/tradersync-alternative | 2026-09-28 |
| /blog/edgewonk-alternative | 2026-09-28 |

Toplam: 14 sayfa × 9 dil = 126 adres (sitemap).

## Yapılacaklar

### İçerik
- ⬜ **İçerik kümeleri:** trading journal, prop firm, risk yönetimi, trader psikolojisi — her birinde 10–20 yazı. Şu an toplam 10.
- ⬜ **Yeni karşılaştırmalar:** TradesViz, Tradervue, FX Replay.
- ⬜ **Programatik prop firma sayfaları** (`/prop-firms/<firma>`): kurallar + nasıl takip edilir. 5–10 firmayla başla (FTMO, The5ers, FundedNext, FivePercentOnline, Funding Pips). Kaynak yalnız firmanın resmî sitesi; her kuralda kaynak bağlantısı ve "son kontrol" tarihi. Kurallar tek veri dosyasında; ayda bir zamanlanmış görev kaynak sayfaları karşılaştırır, fark varsa kullanıcıya sorar (kendiliğinden yayınlamaz). Uzun süre doğrulanamayan firmada sayılar gizlenir. Logo yok, ortaklık ima edilmez.
- ⬜ **Programatik broker sayfaları** (`/brokers/<broker>`): o broker'dan işlemleri aktarma.
- ⬜ **Liste sayfaları** /prop-firms ve /brokers; ana sayfa alt kısmından bağlantı.

### Geri bağlantılar (başka sitelerden bize bağlantı)
- ⬜ Dizinler: Product Hunt, G2, Capterra, Trustpilot, AlternativeTo, SaaSHub (başvuru metinleri hazırlanacak, başvuruyu kullanıcı yapar).
- ⬜ Sosyal medya profillerinde site bağlantısı.
- ⬜ YouTube video açıklamaları, forumlar (Reddit, Forex Factory), konuk yazılar.

### Teknik
- ⬜ Bing Webmaster Tools + IndexNow.
- ⬜ Article / FAQPage / BreadcrumbList yapısal verisi.
- ⬜ Search Console'da dizine eklenmeyen sayfaları ve arama sorgularını ayda bir kontrol.

## Kurallar
- Kâr vaadi dili yok ("bununla kazanırsın" vb.).
- Her yeni sayfa aynı değişiklikte 9 dilde.
- Uydurma yorum, kullanıcı sayısı ya da başarı iddiası yok.

# SEO.md

SEO ile ilgili yapılan ve yapılacak her iş burada. Bir SEO işi bittiğinde ya da yeni
bir iş çıktığında aynı değişiklikte buraya işlenir (tarihle). Genel iş listesi
PLAN.md'de, teknik ayrıntılar NOTES.md'de.

Son güncelleme: 2026-09-29

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

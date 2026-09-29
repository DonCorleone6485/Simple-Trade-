# PLAN.md

Kalan işler ve büyüme planı. Tek kaynak burası: bir iş bitince aynı değişiklikte
burada işaretlenir (✅ + tarih), yeni iş çıkınca eklenir. Ayrıntılar ve kararlar
NOTES.md'de.

Son güncelleme: 2026-09-29

---

## 1. Kalan işler

### Kullanıcıdan bekleyenler
- [ ] **Sosyal medya hesapları** — aynı kullanıcı adıyla (bkz. büyüme planı §1–2). Kullanıcı adları ve 9 dilde biyografiler hazır.
- [ ] **Hakkımızda metni** — birkaç cümle; 9 dile çevrilip yerleştirilecek.
- [ ] **MetaTrader kurulum videosu** — `~/Desktop/STJ-Kayit/` klasörüne 7 ekran kaydı (01-indir … 07-sonuc). Gelince Remotion kurgusu.
- [ ] **Meta Pixel kimliği** — Instagram reklamından önce; çerez bandı da gerekecek.
- [ ] **Sosyal kanıt** — ilk kullanıcılardan gerçek yorumlar.
- [ ] **Farsça ve Arapça çeviri kontrolü** — ana dili olan biri.
- [ ] **Dizin başvuruları** — metinler [docs/listings.md](docs/listings.md)'de hazır; hesap açıp göndermek kullanıcıda. G2/Capterra şirket bilgisi istiyor, şirketten sonra.
- [ ] **Bing Webmaster Tools hesabı** — bing.com/webmasters → Google ile giriş → "Search Console'dan içe aktar" (hesap açmak kullanıcıya ait). IndexNow zaten çalışıyor, bu yalnız rapor görmek için.

### Kullanıcıyı beklemeden yapılabilecekler
- ✅ 2026-09-29 **Dizin başvuru metinleri** — [docs/listings.md](docs/listings.md): Product Hunt, G2, Capterra, Trustpilot, AlternativeTo, SaaSHub; 9 dilde kısa açıklama.
- ✅ 2026-09-29 **IndexNow (Bing, Yandex)** — `npm run indexnow` canlı sitemap'i bildirir; yeni sayfada `npm run indexnow -- /yol`. Bing Webmaster hesabı kullanıcıda (yukarıda).
- ✅ 2026-09-29 **Haftalık özet e-postası** — pazartesi 09:00 UTC günlük görevle, 9 dilde, yalnız o hafta işlemi olana (`api/_digest.ts`).
- [ ] **CSP'yi engelleme moduna almak** — 2026-10-06 … 10-13 arası, `client_errors` kind 'csp' raporlarına bakarak.
- [ ] **Yeni blog yazıları** — 9 dilde, içerik kümelerine göre (§4).
- 🟡 **Programatik prop firma / broker sayfaları** (§4) — ✅ 2026-09-29 5 prop firma (FTMO, The5ers, Alpha Capital, Instant Funding, FundingPips) + 4 broker, 9 dilde; aylık kural kontrol görevi kuruldu. Kalan: FundedNext, FXIFY, E8 ve Türkiye'den açılmayan broker'lar (SEO.md).
- [ ] **Yeni entegrasyonlar** — cTrader, TradingView, NinjaTrader, Tradovate (büyük iş).

### Ertelenenler
- Ödeme sistemi ve yasal sayfalar — şirket kurulunca. Bölgesel fiyat grupları, kurucu üye kampanyası, ortaklık programı buna bağlı.

### Biten (son)
- ✅ 2026-09-29 Namecheap 2FA yeniden açıldı (kullanıcı).
- ✅ 2026-09-29 Prop firma ve broker sayfaları (/prop-firms, /brokers), 9 dilde, 72 yeni adres.
- ✅ 2026-09-29 EA 1.09 MT4'te kuruldu ve işlem aktarıyor.
- ✅ 2026-09-29 Hesap silme test hesabıyla denendi.
- ✅ 2026-09-29 Gerçek MT5 raporu bulundu; test raporun kendi özetiyle karşılaştırıyor.
- ✅ 2026-09-29 Better Stack izleme + durum sayfası, `npm test`, CSP Report-Only, yol haritası, 2 yazı.

---

## 2. Büyüme planı (2026-09-27)

### §1 Marka ve hesap güvenliği
- [ ] Aynı kullanıcı adı her yerde: `@simpletradejournal`, doluysa `@stjournal` — kullanılmayacak platformlarda da al.
- [ ] Marka kiti: logo çeşitleri, renkler, yazı tipleri, Canva şablonları.
- [ ] Şifre yöneticisi (Bitwarden / 1Password) + her hesapta 2FA.
- [ ] `social@` takma adı; hesaplar kişisel değil şirket adresiyle.
- [ ] Marka tescili (TÜRKPATENT), yedek alan adları — şirket kurulunca.

### §2 Sosyal medya
| Platform | Rol | Dil | Durum |
|---|---|---|---|
| Instagram (+ Threads) | Reels, karusel, reklam | EN + TR + FA | [ ] |
| YouTube | Kurulum eğitimleri + Shorts | EN + TR | [ ] |
| TikTok | Kısa video | EN + TR | [ ] |
| X | Trader topluluğu, güncellemeler | EN | [ ] |
| Telegram kanalı | TR, FA, AR trader'lar | TR, FA, AR | [ ] |
| Discord | Topluluk, destek | EN | [ ] |
| LinkedIn şirket sayfası | Güven, prop firma ortaklıkları | EN | [ ] |
| Facebook sayfası | Meta reklam hesabı + Pixel için zorunlu | EN | [ ] |
| Reddit | Reklam değil, yardım ederek | EN | [ ] |

### §3 İş altyapısı
- [ ] Meta Business Suite (Instagram, Facebook, reklam hesabı, Pixel).
- [ ] Bing Webmaster Tools.
- [ ] Tanıtım dizinleri: Product Hunt, G2, Capterra, Trustpilot, AlternativeTo, SaaSHub.
- [ ] Ortaklık programı — ödemeyle birlikte.
- ✅ İzleme: Better Stack + durum sayfası, kendi hata izleme.
- [ ] E-posta pazarlama: haftalık bülten.
- [ ] Canlı destek (isteğe bağlı): Crisp ücretsiz.

### §4 SEO
Ayrıntılı kayıt (yapılanlar, sayfalar, araçlar, yapılacaklar): [SEO.md](SEO.md).

- ✅ Dil başına adresler (/tr, /fa, /ar …).
- [ ] İçerik kümeleri: trading journal, prop firm, risk yönetimi, trader psikolojisi — her biri 10–20 yazı (şu an 10 yazı toplam).
- 🟡 Programatik sayfalar: ✅ ilk 4 prop firma + 4 broker (2026-09-29); devamı SEO.md'de.
- ✅ Karşılaştırma sayfaları (Tradezella, TraderSync, Edgewonk).
- [ ] Geri bağlantılar: dizinler, konuk yazılar, forumlar, YouTube açıklamaları.

### §5 İçerik motoru
Haftada 1 uzun YouTube videosu → 4–5 kısa video (Reels/TikTok/Shorts), 1 karusel,
1 X thread, 1 blog yazısı (9 dil), 1 bülten + Telegram paylaşımı.

### §6 Otomasyon (n8n / Make + Buffer/Metricool + Claude API)
- [ ] A. İçerik hattı: fikir → taslak → kullanıcı onayı → yayın.
- [ ] B. Blog → sosyal medya otomatik paylaşım.
- 🟡 C. Kullanıcı yolculuğu: ✅ kayıt ve deneme e-postaları; [ ] "7 gündür girmedin".
- [ ] D. Destek: form → cevap taslağı → kullanıcı gönderir.
- [ ] E. 2 hafta aktif kullanana Trustpilot daveti.
- [ ] F. Her pazartesi kullanıcıya kayıt/deneme/ziyaretçi/Google tıklama özeti.
- [ ] G. Reddit ve X'te "trading journal" konuşmaları bildirimi.

Kural: yayın tam otomatik olmaz, son onay kullanıcıda. Kâr vaadi dili hiçbir yerde yok.

### §7 Sıralama
- **Şimdi:** kullanıcı adları, marka kiti, şifre yöneticisi, hesaplar, Bing, dizinler, ✅ kesinti takibi.
- **Şirket kurulunca:** ödeme, yasal sayfalar, marka tescili, Meta Pixel + çerez bandı, ortaklık, Trustpilot.
- **Sonra:** otomasyon merkezi, içerik motoru, bülten, Discord, ✅ dil başına SEO.

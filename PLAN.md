# PLAN.md

Kalan işler ve büyüme planı. Tek kaynak burası: bir iş bitince aynı değişiklikte
burada işaretlenir (✅ + tarih), yeni iş çıkınca eklenir. Ayrıntılar ve kararlar
NOTES.md'de.

Son güncelleme: 2026-09-29

---

## 1. Kalan işler

### Yakın tarihli
- [ ] **Google Workspace ödemesi — 2026-10-11** — ücretli dönem başlıyor; o tarihe kadar karta ödeme yöntemi eklenmiş olmalı (kullanıcı). Hatırlatma görevi 2026-10-25'e kurulu.
- [ ] **Search Console dizine ekleme — 2026-09-30** — günlük kota 29 Eylül'de doldu; kalan: /blog/fx-replay-alternative, /help. Kota site başına günde ~10 istek.
- [ ] **İlk haftalık özet e-postasını kontrol — 2026-10-03 cumartesi** — gönderim günlüğü ve `users.weekly_digest_sent_at`.
- [ ] **CSP'yi engelleme moduna almak — 2026-10-06 … 10-13** — `client_errors` kind 'csp' raporlarına bakarak. Zamanlanmış görev `csp-enforce-check` 6 Ekim 10:00'da yapacak (29 Eylül'e kadar yalnız 'eval' ve 'wasm-eval' raporu, 2'şer).

### Kullanıcıdan bekleyenler
- [ ] **Sosyal medya hesapları** — aynı kullanıcı adıyla (bkz. büyüme planı §1–2 ve aşağıdaki "Sosyal medya kurulumu"). Hesap açmak, şifre, telefon doğrulaması ve CAPTCHA kullanıcıda; Claude şifreye dokunmaz.
- [ ] **Hakkımızda metni** — birkaç cümle; 9 dile çevrilip yerleştirilecek.
- [ ] **MetaTrader kurulum videosu** — `~/Desktop/STJ-Kayit/` klasörüne 7 ekran kaydı (01-indir … 07-sonuc). Gelince Remotion kurgusu.
- [ ] **Meta Pixel kimliği** — Instagram reklamından önce; çerez bandı da gerekecek.
- [ ] **Sosyal kanıt** — ilk kullanıcılardan gerçek yorumlar.
- [ ] **Farsça ve Arapça çeviri kontrolü** — ana dili olan biri.
- [ ] **Dizin başvuruları** — metinler [docs/listings.md](docs/listings.md)'de hazır; hesap açıp göndermek kullanıcıda. G2/Capterra şirket bilgisi istiyor, şirketten sonra.
- [ ] **İlk gerçek yeni üyeyi izlemek** — kayıttan sonra örnek verinin kalkması ve deneme akışı (kullanıcı haber verir, ben kontrol ederim).
- [ ] **Hesabım penceresini kontrol** — para birimi, saat dilimi, profil ve MetaTrader sayfasındaki "•••1234 · Sunucu" satırı.
- ✅ 2026-09-29 **Bing Webmaster Tools** — kullanıcı Google ile girip Search Console'dan içe aktardı.

### Sosyal medya kurulumu (2026-09-29'da konuşuldu; kullanıcı "bekle" dedi)
Not: 29 Eylül'e kadar listelerde "biyografiler hazır" yazıyordu ama yazılmamıştı; 2026-09-29'da yazıldı.
1. ✅ 2026-09-29 **Kullanıcı adı kontrolü (Claude)** — `simpletradejournal` Instagram, YouTube, TikTok, Telegram, Facebook, LinkedIn'de boş; X 15 karakter sınırı yüzünden `@SimpleTradeJrnl` (boş); Reddit kontrol edilemedi. `@stjournal` çoğu yerde dolu. Ayrıntı: [docs/social.md](docs/social.md).
2. ✅ 2026-09-29 **Kontrol listesi sayfası (Claude)** — [docs/social.md](docs/social.md): kayıt adresleri, kullanıcı adları, `social@` adımları, 9 dilde kısa/standart/uzun biyografi (karakter sınırları kontrol edildi).
3. ✅ 2026-09-29 **`social@` takma adı (kullanıcı)** — Google Workspace'te eklendi (ilk denemede yanlışlıkla `sosial` yazılmıştı, `social` olarak düzeltildi) ve Gmail'de `to:social@` → "Sosyal medya" etiketi filtresi kuruldu. Yahoo'dan atılan deneme postası "Sosyal medya" etiketine düştü, doğrulandı; adımlar docs/social.md §0'da.
4. [ ] **Hesaplar açılınca (Claude, kullanıcı onayıyla)** — kullanıcı giriş yaptıktan sonra profil fotoğrafı, biyografi ve site bağlantısı açık oturumda doldurulur.
5. ✅ 2026-09-30 **Şifre yöneticisi (kullanıcı)** — Bitwarden ücretsiz plan kuruldu (Edge uzantısı + telefon, kendi 2FA'sı açık); Edge'in şifre kaydı kapatıldı, mevcut şirket şifreleri aktarıldı.
- [ ] **YouTube kanalını aç — admin@ hesabı 30 günlük olunca (kullanıcı; Claude oturum başında hatırlatır)** — hesap yaşı: admin.google.com → Dizin → Kullanıcılar → admin@ → oluşturma tarihi. Uygun olunca admin@ ile youtube.com → Kanal oluştur → marka hesabı, ad `Simple Trading Journal`, `@simpletradejournal`, logo + uzun biyografi (docs/social.md §2). Acele yok: uzun video üretimi henüz planda yok. Kişisel hesapla açıp sahipliği devretmek de mümkün ama gereksiz.
- [ ] **TikTok kullanıcı adını düzelt — 2026-10-30 sonrası (kullanıcı; Claude oturum başında hatırlatır)** — kayıtta TikTok otomatik saçma bir `@` adı verdi, 30 gün değiştirilemiyor. Ay dolunca `simpletradejournal` yap (doluysa `simpletradejournal.app` ya da `stjournalapp`). O zamana kadar görünen ad `Simple Trading Journal`.
6. [ ] **Siteye sosyal medya bağlantıları (Claude)** — hesaplar açılınca alt bilgiye ve yapısal veriye (sameAs) eklenir.

### Kullanıcıyı beklemeden yapılabilecekler
- [ ] **MetaTrader eklentisinin (EA) mesajlarını 9 dile çevirmek** — sunucu şu an hata/uyarı mesajlarını yalnız İngilizce döndürüyor (`api/ingest.ts`); kullanıcının dilinde döndürülebilir.
- [ ] **DMARC'ı sıkılaştırmak** (p=none → p=quarantine) — önce admin@'e gelen DMARC raporlarında Google, Clerk ve Resend'in geçtiğini görmek gerekiyor. Şu an `p=none`.
- ✅ 2026-09-29 **Dizin başvuru metinleri** — [docs/listings.md](docs/listings.md): Product Hunt, G2, Capterra, Trustpilot, AlternativeTo, SaaSHub; 9 dilde kısa açıklama.
- ✅ 2026-09-29 **IndexNow (Bing, Yandex)** — `npm run indexnow` canlı sitemap'i bildirir; yeni sayfada `npm run indexnow -- /yol`. Bing Webmaster hesabı kullanıcıda (yukarıda).
- ✅ 2026-09-29 **Haftalık özet e-postası** — cumartesi 09:00 UTC günlük görevle (cuma kapanışından sonra; 2026-09-29 pazartesiden alındı), 9 dilde, yalnız o hafta işlemi olana (`api/_digest.ts`).
- 🟡 **Yeni blog yazıları** — 9 dilde, içerik kümelerine göre (§4). ✅ 2026-09-29 3 yazı: pozisyon büyüklüğü, intikam işlemi, beklenti ve kâr faktörü (toplam 13). ✅ 2026-09-29 aşırı işlem. Toplam 17 sayfa (2 rehber, 9 yazı, 6 karşılaştırma). Haftada 1 devam; sıradaki konular prop firm ve risk kümesinden.
- 🟡 **Programatik prop firma / broker sayfaları** (§4) — ✅ 2026-09-29 5 prop firma (FTMO, The5ers, Alpha Capital, Instant Funding, FundingPips) + 4 broker, 9 dilde; aylık kural kontrol görevi kuruldu. ✅ 2026-09-29 E8 Markets eklendi (6 firma). Kalan: FundedNext, FXIFY ve Türkiye'den açılmayan broker'lar (SEO.md).
- [ ] **Yeni entegrasyonlar** — cTrader, TradingView, NinjaTrader, Tradovate (büyük iş). Engel: gerçek örnek dışa aktarım dosyası yok; Tradovate'te yön sütunu yok, TradingView bir işlemi iki satıra yazıyor — ezbere ayrıştırıcı yazılırsa kâr/zarar yanlış çıkar. Kullanıcı ya da ilk kullanıcılardan birer örnek dosya gelince yapılır. ✅ 2026-09-29 hazırlık: içe aktarıcı artık ABD biçimini ("$1,250.00", "($75.50)", 9/22/2026) ve ";"/sekme ayırıcılı dosyaları okuyor; NinjaTrader tarzı tablo elle eşleştirmeden geliyor.

### Ertelenenler (şirket kurulunca)
- Ödeme sistemi ve yasal sayfalar.
- Bölgesel fiyat grupları — indirim grupları onaylı, ödemeyle anlam kazanıyor.
- Yıllıkta 14 gün iade.
- Ortaklık programı (§3).

### Karar bekleyen
- **Kurucu üye kampanyası** — ilk 500 kişiye yıllık $79 (1.990 TL), ömür boyu bu fiyat. Ödeme sistemine bağlı.

### Biten (son)
- ✅ 2026-09-29 Yardım sayfasına FAQPage yapısal verisi (13 soru, 9 dil).
- ✅ 2026-09-29 Aşırı işlem yazısı + Tradervue, TradesViz, FX Replay karşılaştırmaları (9 dil, 36 yeni adres); IndexNow'a 38 adres, Search Console'da 3 adres.
- ✅ 2026-09-29 Namecheap 2FA yeniden açıldı (kullanıcı).
- ✅ 2026-09-29 Prop firma ve broker sayfaları (/prop-firms, /brokers), 9 dilde, 72 yeni adres.
- ✅ 2026-09-29 EA 1.09 MT4'te kuruldu ve işlem aktarıyor.
- ✅ 2026-09-29 Hesap silme test hesabıyla denendi.
- ✅ 2026-09-29 Gerçek MT5 raporu bulundu; test raporun kendi özetiyle karşılaştırıyor.
- ✅ 2026-09-29 Better Stack izleme + durum sayfası, `npm test`, CSP Report-Only, yol haritası, 2 yazı.

---

## 2. Büyüme planı (2026-09-27)

Ana fikir: **tek bir içerik merkezi olsun, her şey oradan otomatik dağılsın.** Bir kez
üret, 9 dilde ve her kanalda yayınlansın; kullanıcı yalnızca onay verir.

### §1 Temel: marka ve hesap güvenliği (her şeyden önce)
| Ne | Neden | Durum |
|---|---|---|
| **Aynı kullanıcı adı her yerde** (`@simpletradejournal`, doluysa `@stjournal`) | Tanınırlık. Kullanılmasa bile bütün platformlarda şimdiden kapılmalı. | [ ] |
| **Marka kiti:** logo çeşitleri, renkler, yazı tipleri, Canva şablonları | Bütün paylaşımlar aynı kurumsal görünsün. | [ ] |
| **Şifre yöneticisi** (Bitwarden / 1Password) + her hesapta iki adımlı doğrulama | Hesap çalınması bir markayı bitirebilir. | [ ] |
| Hesaplar kişisel değil **şirket adresleriyle** (yeni `social@` takma adı) | Hesaplar şirketin olsun, kişiye bağlı kalmasın. | [ ] |
| **Marka tescili** (TÜRKPATENT) + yedek alan adları (.com vb.) | İsmi başkası alamasın. Şirket kurulunca. | [ ] |

### §2 Sosyal medya: nerede, hangi dilde
Trading kitlesi platformlara eşit dağılmıyor. Önceliğe göre:

| Platform | Rol | Dil | Durum |
|---|---|---|---|
| **Instagram** (+ otomatik Threads) | Reels, karuseller, reklam | EN + TR + FA | ✅ 2026-09-30 hesap `@simpletradejournal` açıldı (social@), İşletme hesabı, logo, biyografi, site bağlantısı; Facebook bağlantısı ve iletişim bilgisi sonra |
| **YouTube** | Kurulum eğitimleri (uzun) + Shorts; Google'da da çıkar | EN + TR (FA altyazı) | ⏸ 2026-09-30 ertelendi: Workspace hesabı yeni olduğu için Google "bu hesap henüz YouTube için uygun değil" diyor (hesap 30 günlük olmalı ya da 30$ tahsilat). Video üretimi başlayınca açılacak |
| **TikTok** | Kısa video, hızlı büyüme | EN + TR | 🟡 2026-09-30 hesap açıldı (social@, 2FA açık); `@` adı otomatik verildi, 30 gün sonra düzelt |
| **X (Twitter)** | Trader topluluğunun kalbi; tartışma ve güncellemeler | EN | ✅ 2026-09-30 `@SimpleTradeJrnl` açıldı (social@), profesyonel profil, logo, biyografi, site bağlantısı |
| **Telegram kanalı** | Türk, İranlı ve Arap trader'lar burada çok yoğun | TR, FA, AR | ✅ 2026-09-30 `t.me/simpletradejournal` açıldı (açıklama şimdilik İngilizce; TR/FA/AR içerik başlayınca açıklamaya eklenecek) |
| **Discord** | Kullanıcı topluluğu, destek, geri bildirim | EN (dil kanallarıyla) | [ ] |
| **LinkedIn şirket sayfası** | Güven, prop firma ortaklıkları, yatırımcı | EN | ✅ 2026-09-30 `linkedin.com/company/simpletradejournal`: Yazılım Geliştirme, slogan, web sitesi, Genel Bakış açıklaması ve 6 uzmanlık kaydedildi (uzmanlık kutusu: etiketi yazıp yanındaki + ile onayla, Enter değil). Kapak görseli sonra; kuruluş yılı 2026 ve büyüklük 2-10 çalışan formda öyle duruyor, şirket kurulunca gözden geçir |
| **Facebook sayfası** | Meta reklam hesabı ve Pixel için zorunlu | EN | ✅ 2026-09-30 sayfa açıldı (kişisel hesaptan), Yazılım şirketi, logo, biyografi, site bağlantısı, eylem düğmesi = siteyi ziyaret et. Kullanıcı adı `simpletradejournal` alınamadı, `facebook.com/simpletradejournalapp` alındı. Sonra: Meta Business'ta ayrı `Simple Trading Journal` portföyü, Instagram bağlantısı, ikinci yönetici |
| **Reddit** | Reklam değil, gerçekten yardım ederek (r/Daytrading, r/Forex) | EN | [ ] |

Her dilde her platformda hesap açmak dağılmak demek. Öneri: EN ana hesaplar + TR ve FA
için Instagram ve Telegram. Kullanıcı adları ve 9 dilde biyografiler hazır: [docs/social.md](docs/social.md) (2026-09-29).

### §3 İş altyapısı
- [ ] **Meta Business Suite:** Instagram, Facebook, reklam hesabı, Pixel ve katalog tek yerde.
- [ ] **Meta Verified (işletme doğrulaması):** Instagram'da teklif edildi (ilk hafta ücretsiz, sonra ücretli abonelik); şirket belgesi ister. Şirket kurulunca değerlendir, şimdi geçildi (2026-09-30).
- ✅ 2026-09-29 **Bing Webmaster Tools** — ChatGPT'nin arama sonuçları Bing'den besleniyor; yapay zekâ aramalarında görünmek için önemli. IndexNow da kuruldu.
- 🟡 **Tanıtım dizinleri:** Product Hunt lansmanı, G2, Capterra, Trustpilot, AlternativeTo, SaaSHub. Hem geri bağlantı hem yorum toplar. ✅ Metinler hazır ([docs/listings.md](docs/listings.md)); başvuru kullanıcıda, G2/Capterra şirketten sonra.
- [ ] **Ortaklık (affiliate) programı:** trader YouTuber'ları ve prop firmalar satış başına komisyon alır. En güçlü büyüme kanalı olabilir. Ödeme sistemiyle birlikte kurulur.
- ✅ 2026-09-29 **İzleme:** Better Stack kesinti takibi (UptimeRobot yerine; ücretsiz planı ticari kullanıma izin veriyor), herkese açık durum sayfası status.simpletradejournal.io, kendi hata izleme (Sentry yerine `client_errors`).
- 🟡 **E-posta pazarlama:** ✅ kullanıcıya haftalık özet (2026-09-29). [ ] Haftalık bülten: blog yazıları ve ürün yenilikleri (Resend'de altyapı var).
- [ ] **Canlı destek (isteğe bağlı):** Crisp ücretsiz plan + yardım sayfalarından cevap veren yapay zekâ asistanı.

### §4 SEO: rakipleri geçmek için
Ayrıntılı kayıt (yapılanlar, sayfalar, araçlar, yapılacaklar): [SEO.md](SEO.md).

1. ✅ **Dil başına adresler** (/tr, /fa, /ar …) — önceden Google siteyi yalnız İngilizce görüyordu; en büyük kaldıraç buydu.
2. 🟡 **İçerik kümeleri:** "trading journal", "prop firm", "risk yönetimi", "trader psikolojisi"; her birinin altında 10–20 yazı. Şu an (2026-09-29) toplam 17 sayfa: 2 rehber, 9 yazı, 6 karşılaştırma. Kümelere göre yazılar: journal/metrikler 4 (journal tutma, R-multiple, beklenti/kâr faktörü, işlem öncesi kontrol listesi), psikoloji 3 (duygular, intikam, aşırı işlem), risk 1 (pozisyon büyüklüğü), prop firm 1 (günlük kayıp/drawdown). En zayıf: prop firm ve risk — sıradaki yazılar oradan.
3. 🟡 **Programatik sayfalar:** her prop firma ve her broker için ayrı sayfa ("FTMO kuralları takip aracı", "IC Markets MT5 raporu içe aktarma" gibi). Rakiplerin yapmadığı, çok arama alan bir alan. ✅ 6 prop firma + 4 broker (2026-09-29); devamı SEO.md'de.
4. ✅ **Karşılaştırma sayfaları** — satın almaya en yakın aramalar. Tradezella, TraderSync, Edgewonk (2026-09-28); Tradervue, TradesViz, FX Replay (2026-09-29).
5. [ ] **Geri bağlantılar:** dizinler, konuk yazılar, trading forumları, YouTube açıklamaları.
- ✅ 2026-09-29 Yapısal veri: yazılarda BlogPosting/HowTo, dizin sayfalarında BreadcrumbList, yardımda FAQPage.
- ✅ 2026-09-29 Arama motorlarına bildirim: Search Console + Bing Webmaster + IndexNow.

### §5 İçerik motoru: bir kez üret, her yere dağıt
Her hafta:
```
1 uzun YouTube videosu (eğitim)
  ├─ 4–5 kısa video → Reels / TikTok / Shorts
  ├─ 1 karusel → Instagram / LinkedIn
  ├─ 1 X thread
  ├─ 1 blog yazısı (9 dil)
  └─ 1 bülten + Telegram paylaşımı
```
İçerik başlıkları: eğitim (R değeri, risk), ürün kullanımı, trader psikolojisi, prop firma
kuralları, kullanıcı başarı hikâyeleri. Video için Remotion ile kod tabanlı video altyapısı var.

### §6 Otomasyon mimarisi
**Merkez:** n8n (kendi sunucumuzda neredeyse ücretsiz) ya da Make. **Yayın:** Metricool veya
Buffer. **Metin ve çeviri:** Claude API.

| Otomasyon | Ne yapar | Durum |
|---|---|---|
| **A. İçerik hattı** | Takvimdeki (Notion/Google Sheets) fikir → yapay zekâ her platform ve dil için taslak yazar → kullanıcı onaylar → zamanlanır ve yayınlanır | [ ] |
| **B. Blog → sosyal medya** | Yeni yazı yayınlanınca her kanala ve bültene otomatik paylaşım | [ ] |
| **C. Kullanıcı yolculuğu** | Kayıt, deneme ve deneme bitişi e-postaları ✅; haftalık özet ✅ (2026-09-29); sonraki adım "7 gündür girmedin" gibi geri çağırma | 🟡 |
| **D. Destek** | Form mesajı → Gmail etiketi → yapay zekâ cevap taslağı → kullanıcı gönderir | [ ] |
| **E. Yorum toplama** | 2 hafta aktif kullanana Trustpilot yorum daveti | [ ] |
| **F. Haftalık rapor** | Her pazartesi kullanıcıya tek mesaj: yeni kayıtlar, denemeler, ziyaretçiler, Google tıklamaları, sosyal medya büyümesi | [ ] |
| **G. Dinleme** | Reddit ve X'te "trading journal" geçen konuşmalar bildirim olarak gelir, katılıp yardım edilir | [ ] |

**Önemli kural:** yayın tamamen otomatik olmaz, **son onay kullanıcıda.** Finans alanında tek
bir yanlış cümle ("bununla kazanırsın" gibi) hem markaya hem hukuki duruma zarar verir.
Türkiye'de yatırım tavsiyesi ve kaldıraçlı işlem reklamı SPK kurallarına tabi; Meta ve
Google'ın finans reklam kuralları da sıkı. Aracı kurum değil bir **araç** sattığımız için
rahatız, ama "kâr vaadi" dili hiçbir yerde kullanılmaz.

### §7 Sıralama
| Aşama | İçerik |
|---|---|
| **Şimdi** | Kullanıcı adlarını kapmak, marka kiti, şifre yöneticisi, hesapları açmak (IG, YT, TikTok, X, Telegram, LinkedIn, FB/Meta Business), ✅ Bing, dizinler, ✅ kesinti takibi |
| **Şirket kurulunca** | Ödeme, yasal sayfalar, marka tescili, Meta Pixel + çerez bandı, ortaklık programı, Trustpilot |
| **Sonra** | Otomasyon merkezi, içerik motoru, bülten, Discord topluluğu, ✅ dil başına SEO |

### İş bölümü
- **Kullanıcı:** hesap açmak ve girişler, marka kararları, içerik onayı, video kayıtları.
- **Claude:** ✅ 9 dilde biyografiler ([docs/social.md](docs/social.md)) ve marka kiti tanımı; siteye sosyal medya
  bağlantıları ve teknik işaretler; ✅ Bing ve dizin başvuru hazırlığı; n8n otomasyonları;
  ilk 30 günlük içerik takvimi ve paylaşımlar; ✅ dil başına SEO ve 🟡 programatik sayfalar.

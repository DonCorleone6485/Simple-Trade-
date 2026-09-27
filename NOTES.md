# Proje Notları

## Teknik Yapı
- Frontend: React + Vite + TypeScript + Tailwind
- Hosting: Vercel — https://www.simpletradejournal.io (main'e push = otomatik yayın)
- Veritabanı: Supabase
- Kullanıcı sistemi: Clerk (canlıda Production instance, pk_live)
- AI: Groq (llama-3.3-70b-versatile; ses için Whisper)
- Repo: github.com/DonCorleone6485/Simple-Trade-

## Önemli Notlar
- `src/lib/supabase.ts` → URL ve anon key direkt yazılı (env variable Vite'da çalışmadı);
  her isteğe Clerk oturum anahtarı ekleniyor (accessToken).
- Supabase RLS: herkes yalnız kendi satırlarını görür (user_id = Clerk JWT `sub`).
  Clerk, Supabase'e üçüncü taraf kimlik sağlayıcı olarak ekli. Sunucu uçları service key ile.
- Fotoğraflar Supabase Storage'da (`trade-photos` kovası, `user_id/...` klasörleri);
  işlemde yalnız bağlantıları duruyor.
- Groq API key Vercel'de GROQ_API_KEY olarak kayıtlı.

## Vercel Environment Variables
- VITE_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- GROQ_API_KEY
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Test
- Local git push yetkisi doğrulandı (2026-07-17)

## Yapılacaklar

Site denetimi (2026-09-26) ~%45 olgunluk bulmuştu; 27 Eylül'de bilgi gerektirmeyen
her şey yapıldı (aşağıda "Yapılanlar"). Kalanların çoğu kullanıcıdan bir bilgi,
hesap ya da karar bekliyor.

### A. Kullanıcıdan bilgi / hesap bekleyenler
> **2026-09-27 karar:** Ödeme sistemi (1) ve yasal sayfalar (2) şirket kurulana
> kadar ERTELENDİ — ikisi de şirket adı ve adresi istiyor. Şirket kurulunca
> ikisi birlikte ele alınacak; o zamana kadar gündeme getirme.

1. **Ödeme sistemi** — şirket kurulunca Paddle veya Lemon Squeezy hesabı (şirket +
   banka bilgileri). Sonra: abonelik, fatura, iptal akışı; PaymentModal'daki
   "Ödeme Yap — Yakında" düğmesi; ödeme olayıyla (webhook) users.has_paid /
   pro_until güncelleme; yıllıkta 14 gün iade; iptalde dondurma veya 2 ay %50.
   Şu an kimse Pro satın alamıyor — yalnız 3 günlük deneme var.
2. **Yasal sayfalar** — Gizlilik Politikası, Kullanım Şartları, KVKK Aydınlatma
   Metni, Çerez Politikası, İade Politikası, risk uyarısı ("yatırım tavsiyesi
   değildir"). Gerekli: sitede görünecek isim/unvan ve iletişim adresi. Taslağı
   ben yazarım; son hâli avukata gösterilmeli. Ödeme hesabı onayı için şart.
3. **İletişim + Hakkımızda** — "Bize yaz" FORMU (2026-09-28): uygulama menüsü, ana
   sayfa altı ve yardım sayfasından açılıyor (lib/contact.ts, ContactModal.tsx),
   mesaj api/emails.ts POST → Resend → support@, Yanıtla gönderene gider. Kalan: Hakkımızda metni, sosyal medya
   hesapları, varsa Discord/Telegram topluluğu.
4. **Meta Pixel** — Meta Business'ta Pixel oluşturup kimliği vermek. Instagram
   reklamından ÖNCE. Çerez onay bandı da gerekecek (KVKK/GDPR).
5. **Google Search Console** — YAPILDI (2026-09-27): alan adı mülkü admin@ ile
   (otomatik doğrulandı), sitemap gönderildi (9 sayfa), ana sayfa, /blog ve MT5
   rehberi için dizine ekleme istendi. Yeni önemli sayfada: URL denetimi →
   Dizine eklenmesini iste.
6. **E-posta akışları** — ÇALIŞIYOR (2026-09-27, Outlook ile denendi): hoş geldin,
   "deneme bitiyor", "deneme bitti", 9 dilde (api/_email.ts, api/emails.ts; günlük
   görev 09:00 UTC). Resend (updates.simpletradejournal.io, doğrulandı). Kalan:
   ödeme açılınca deneme postalarına Pro'ya geçiş bağlantısı; haftalık özet;
   isteğe bağlı CRON_SECRET. Not: Vercel Hobby en fazla 12 fonksiyon — api/ tam 12.
7. **Diğer ülkelere bölgesel fiyat** — onay: grup 1 tam fiyat (ABD, Batı Avrupa,
   İngiltere, Körfez), grup 2 %30 indirim (Doğu Avrupa, Latin Amerika), grup 3
   %50 indirim (Mısır, Hindistan, Pakistan, Nijerya, Endonezya…). Teknik yer:
   src/lib/pricing.ts TABLE + /api/geo. İran'dan ödeme alınamaz.
8. **Sosyal kanıt** — gerçek kullanıcı yorumları (uydurulmayacak). Kurucu üye
   kampanyası kaynak olabilir.
9. **MetaTrader kurulum videosu** — kullanıcının ekran kayıtları (aşağıdaki bölüm).

### B. Karar bekleyen
- **Kurucu üye kampanyası**: ilk 500 kişiye yıllık $79 (1.990 TL), ömür boyu bu
  fiyat; karşılığında yorum. Yapılsın mı? (Ödeme sistemi gelince.)

### C. Bilgi gerektirmeyen, sonra yapılacaklar
1. **Vercel Analytics** — YAPILDI (2026-09-28, ücretsiz plan): src/main.tsx;
   /journal/<id> adresleri /journal olarak sayılıyor.
2. **Dil başına adresler** — YAPILDI (2026-09-28): /tr, /fa, /ar, /ru, /es, /pt, /de, /fr
   altında ana sayfa, yardım, değişiklikler, blog ve yazılar; 81 ön çizimli sayfa,
   hreflang + x-default, dilli sitemap. Tek yer: src/lib/langPath.ts (yol),
   src/lib/seoMeta.ts (başlık/açıklama), src/prerender.tsx (PAGES).
3. **Tam içerik güvenlik politikası** (script-src CSP) — Clerk, Supabase, Google
   Fonts, Cloudflare Turnstile ve fotoğraf bağlantıları için izin listesiyle; önce
   Report-Only olarak denenmeli (bozulursa giriş çalışmaz).
4. **Blog / eğitim içeriği** — YAPILDI (2026-09-28): /blog, 2 rehber + 3 yazı,
   ön çizimli. 9 DİLDE (2026-09-28): metinler src/content/articles/<dil>.ts, sıra ve
   tarih src/content/articles.ts; eksik dil İngilizceye düşer. Sayfa, sitemap ve
   yönlendirme kendiliğinden. Kalan: rakip karşılaştırmaları — rakiplerin güncel fiyat/özellikleri
   doğrulanmadan yazılmamalı; daha fazla yazı.
5. **Yardım merkezi** — 13 soru + rehber bağlantıları. Kalan: yol haritası sayfası.
6. **PWA** — manifest YAPILDI (ana ekrana ekle → /journal). Service worker bilerek
   yok. Kalan: sekme kapalıyken bildirim (web push, service worker ister).
7. **Yeni entegrasyonlar** — cTrader, TradingView, NinjaTrader, Tradovate.
8. **Sentry** (hata izleme), otomatik testler, durum sayfası.
9. **Paket boyutu** — YAPILDI (2026-09-28): 7 dilin çeviri tablosu ayrı dosyada,
   yalnız o dillerde ve çizimden önce yükleniyor; ana paket 124 → 86 KB (gzip).

### D. Kullanıcının kontrol etmesi gerekenler
- Hesabım penceresi: para birimi seçimi, saat dilimi, "ad/e-posta/şifre" düğmesi.
- MetaTrader sayfası: anahtarın bağlı olduğu hesap ("•••1234 · Sunucu").
- EA'yı 1.06'ya güncellemek (grafikte "başka hesaba bağlı" uyarısı için).
  Not: iki hesapta aynı anahtar varsa, yayından sonra ilk bağlanan hesap sahiplenir.
- İlk gerçek yeni üyede: kayıttan sonra örnek verinin kalkması, deneme akışı.
- Hesap silme — kendi hesabıyla değil, boş bir test hesabıyla denenmeli.
- Çeviriler — Farsça ve Arapçayı ana dili olan birine kontrol ettirmek
  (src/lib/appCopyData.ts, InfoPage.tsx, LanguageContext.tsx).

### Yapılanlar (2026-09-27)
Güvenlik: /api/analyze ve /api/referral kimlik + Pro kontrolü; satır bazlı erişim
(Clerk JWT); Pro/deneme alanlarını tarayıcı yazamıyor; güvenlik başlıkları
(vercel.json). Ücretsiz model ve kilitli işlemler; 3 günlük kartsız deneme ve
kötüye kullanım önlemleri; ücretsizde silme yok; hesap silme. Kayıtsız gezinti
(örnek veri). Fiyatlar ($14.99/$119, TR 349/2.790 TL). MT anahtarı hesaba kilitli
(EA 1.06); dosya içe aktarması bekleyen kaydı tamamlıyor. Excel'e aktarma. Hız
(kod bölme; ana sayfa ~1 MB). SEO: ön çizim (scripts/prerender.mjs — ana sayfa,
/help, /changelog), OG resmi, JSON-LD, robots, sitemap, gerçek 404. Yardım ve
Değişiklikler sayfaları. Hesap ayarları (para birimi, saat dilimi, profil).
Okunabilirlik (kontrast, aria etiketleri). Uygulamanın 9 dile çevirisi
(src/lib/appCopy*.ts) ve dile göre tarih/yüzde biçimi.
E-posta: Google Workspace (admin@simpletradejournal.io; takma adlar info@,
support@, billing@, privacy@ aynı kutuya düşer). Namecheap'te MX (1 smtp.google.com), SPF,
DKIM (google._domainkey, 2048 bit), DMARC ve Google doğrulama kaydı var.
İleride DMARC p=none → p=quarantine yapılabilir (önce admin@'e gelen DMARC
raporlarında Google, Clerk ve Resend'in geçtiği görülsün). 2026-09-27: Outlook
hem Clerk kodunu hem Resend hoş geldin postasını Gereksiz'e attı — yeni alan adı
itibarı; kimlik doğrulama kayıtları doğru. Kod ekranına "Spam'e bak" notu eklendi. Paket: Business Starter, Esnek (aylık) plan;
ücretli dönem 2026-10-11'de başlıyor — o tarihe kadar ödeme yöntemi ekli olmalı.
Abonelik hatırlatması 2026-10-25'e kuruldu.

### MetaTrader kurulum videosu (bekliyor: kullanıcının ekran kaydı)
Yapay zekâ videosu değil — gerçek ekran kaydı + Remotion kurgusu (yakınlaşma,
imleç vurgusu, adım numaraları, 9 dile altyazı). Kredi gerekmez.
Kayıt: demo hesap + kayıt için geçici anahtar (sonra iptal), Rahatsız Etme
açık, Cmd+Shift+5 "Fare Tıklamalarını Göster". Dosyalar masaüstünde
`STJ-Kayit/`: 01-indir, 02-klasor, 03-izin, 04-yeniden-baslat, 05-anahtar,
06-grafik, 07-sonuc. Kullanıcı "kayıtlar hazır" deyince kurguya başlanacak.

### Fiyatlandırma planı (2026-09-27 güncel — kısmen karar verildi)
Rakipler: TradeZella $35–99, TraderSync $29.95–79.95, Tradervue $29.95–49.95,
Edgewonk $197/yıl, TradesViz ücretsiz + $19.99–29.99, FX Replay ücretsiz +
$17.99–35.

Kararlar (kullanıcı):
- İki plan: Ücretsiz ve Pro. Prop kademesi yok.
- Asıl sınır işlem sayısı (Google Flow'un günlük kredisi gibi), istatistik değil.
- Ücretsizde kapalı: sesli not, yapay zekâ (analiz + not düzeltme).
- Deneme 3 gün tam Pro, kartsız — YAPILDI. Kayıtta başlamaz: kullanıcı önce
  Ücretsiz'i kullanır, ilk sınıra takılınca yükseltme penceresinde "Pro'yu 3 gün
  ücretsiz dene · kart gerekmez" görür ve kendisi başlatır (/api/trial start).
  EA 1.05 hesap no + sunucu gönderiyor; aynı MT hesabı başka bir denemede
  görüldüyse deneme biter (mt_accounts, yalnız özet).
- Tek kullanımlık e-posta: ne deneme ne ücretsiz — hesap açılmaz, "gerçek
  e-posta" ekranında durur (e-posta pazarlaması için gerçek adres şart).

- Ücretsiz model — YAPILDI (2026-09-27): 1 journal, günde 2 işlem, toplam sınır
  yok. Fazlası silinmez, kilitli kaydedilir — kararı veritabanı veriyor
  (lock_free_trades tetikleyicisi, users.timezone'a göre gün). Kilitli satır:
  saat/sembol/yön görünür, sonuç bulanık; istatistiğe girmez; Pro'da açılır.
  Sesli not, not düzeltme, yapay zekâ analizi Pro (sunucuda da kontrol).
  "Yeni İşlem" düğmesinde 1/2 sayacı; her kısıtlamada kendi mesajıyla pencere.
- Ana sayfa ve uygulama içi fiyat kartları aynı bileşen (PricingCards).
- Fiyatlar — YAPILDI: Pro $14.99/ay, $119/yıl; Türkiye'den 349 TL / 2.790 TL
  (src/lib/pricing.ts tek kaynak, ülke /api/geo'dan). TL 6 ayda bir gözden geçir.
  Diğer ülke grupları (%30/%50 indirim) henüz yok.
- Ücretsizde journal/işlem silme yok (RLS delete politikası Pro ister).
- Hesap silme — YAPILDI: kenar menüsünde isme tıkla → Hesabım → sil (/api/account).
  Sonrasında yalnız özetler kalır (mt_accounts, used_trials: deneme tekrarı engeli).
- Kayıtsız gezinti — YAPILDI: "Ücretsiz Başla" örnek verili uygulamayı açar
  (src/lib/demo.ts, iki journal, dört disiplin alışkanlığı bilerek içeride);
  kayıt gerektiren her şey "ücretsiz hesap aç" penceresini açar.
- Takvim ve journal kartında "N kilitli" göstergesi — YAPILDI.
- Yıllıkta 14 gün iade ve kurucu üye kampanyası: ödeme sistemi gelince (bkz. A1, B).
Karar verildi: fiyat ($14.99 / 349 TL) ve günlük sınır (2 işlem). Açık: kurucu kampanyası.
Güvenlik: users tablosunda Pro/deneme alanlarını tarayıcı yazamıyor
(protect_user_privileges tetikleyicisi, silme yetkisi yok), referrals RLS açık,
/api/referral kimliği Clerk oturumundan alıyor — YAPILDI.
Satır bazlı erişim — YAPILDI (2026-09-27): Clerk, Supabase'e üçüncü taraf kimlik
sağlayıcı olarak eklendi (Clerk panelinde Supabase entegrasyonu Production'da
açık; Supabase third-party auth: https://clerk.simpletradejournal.io). İstemci
her isteğe Clerk oturum anahtarını koyuyor (src/lib/supabase.ts accessToken).
trades/journals/users politikaları: yalnız authenticated, user_id =
auth.jwt()->>'sub'. trade-photos: yalnız kendi klasörü (user_id/...); kova
herkese açık, bağlantılar çalışıyor. anon anahtarla hiçbir tablo okunamıyor.

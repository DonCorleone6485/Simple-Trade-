# Proje Notları

## Teknik Yapı
- Frontend: React + Vite + TypeScript + Tailwind
- Hosting: Vercel (simple-trade-nu.vercel.app)
- Veritabanı: Supabase
- Kullanıcı sistemi: Clerk
- AI: Groq (llama-3.3-70b-versatile)
- Repo: github.com/DonCorleone6485/Simple-Trade-

## Önemli Notlar
- `src/lib/supabase.ts` → URL ve key direkt yazılı (env variable Vite'da çalışmadı)
- Supabase RLS açık → güvenli
- Fotoğraflar base64 olarak Supabase'e kaydediliyor
- Groq API key Vercel'de GROQ_API_KEY olarak kayıtlı

## Vercel Environment Variables
- VITE_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- GROQ_API_KEY
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Test
- Local git push yetkisi doğrulandı (2026-07-17)

## Yapılacaklar

Site denetimi (2026-09-26): genel olgunluk ~%45. Ürün ve tasarım güçlü
(~%85); eksikler ürünün etrafında — para alma, güven, bulunabilirlik, ölçüm.
Önerilen sıra aşağıdaki gibi.

### Durum (2026-09-27 sonu)
YAPILDI: güvenlik açıkları (analyze/referral/RLS), Pro kilitleri, kayıtsız gezinti,
güvenlik başlıkları (vercel.json; script-src CSP bilerek yok), SEO (ön çizim:
scripts/prerender.mjs — ana sayfa, /help, /changelog; OG resmi, JSON-LD,
robots, sitemap, gerçek 404), hız (kod bölme; ana sayfa ~1 MB), Excel'e aktarma,
MT anahtarının hesaba kilitlenmesi (EA 1.06), içe aktarmada bekleyen kaydı
tamamlama, hesap ayarları (para birimi, saat dilimi, profil, silme),
okunabilirlik (kontrast ≥%50, aria etiketleri), uygulamanın 9 dile çevirisi
(src/lib/appCopy*.ts), dile göre tarih/yüzde biçimi, Yardım ve Değişiklikler.

### 🔴 Kritik (kalan)
1. **Ödeme sistemi** — şirket kurulunca Paddle/Lemon Squeezy.
2. **Yasal sayfalar** — Gizlilik, Kullanım Şartları, KVKK, çerez, iade, risk
   uyarısı. Kullanıcıdan: görünecek isim + iletişim adresi.
3. **Ölçüm** — Vercel Analytics açılabilir; Meta Pixel için Pixel kimliği lazım.

### 🟠 / 🟡 Kalan
- İletişim + Hakkımızda (destek e-postası lazım), sosyal kanıt (gerçek yorum).
- E-posta (hoş geldin, deneme bitiyor) — Resend hesabı lazım.
- Diğer ülkelere bölgesel fiyat (onay lazım).
- Dil başına adresler (/de, /tr…) + hreflang — ön çizimin bir sonraki adımı.
- Blog/eğitim içeriği, yardım merkezi genişletme, PWA, yeni entegrasyonlar,
  Sentry/testler.

### Diğer açık işler
- MT5 anahtarını hesap numarasına bağlamak (aynı anahtar iki hesaba
  yapıştırılınca işlemler karışıyor — iki kez yaşandı).
- CSV/HTML içe aktarma, açık kaydı tamamlama mantığını henüz kullanmıyor.

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
- Pro $14.99/ay, $119/yıl; TR 349 TL/ay, 2.790 TL/yıl. Yıllıkta 14 gün iade.
- Kurucu üye: ilk 500 kişi yıllık $79 (1.990 TL), ömür boyu.
- Altyapı: Paddle veya Lemon Squeezy (MoR). Kilitlerden ÖNCE ödeme kurulmalı —
  şu an ödeme düğmesi "Yakında".
Açık: fiyat, kurucu kampanyası, günlük sınırın sayısı (2?).
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

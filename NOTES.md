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

### 🔴 Kritik
1. **Güvenlik açıkları** — `/api/analyze` kimlik doğrulamasız (herkes bizim
   Groq hesabımızı kullanabilir); `/api/referral` kullanıcı kimliğini istek
   gövdesinden alıyor (başkası adına kod üretilebilir).
2. **Pro kilidi yok** — AI analiz, ısı haritası, kurulum analizi Pro diye
   tanıtılıyor ama herkese açık.
3. **Yasal sayfalar** — Gizlilik Politikası, Kullanım Şartları, KVKK Aydınlatma
   Metni, çerez politikası + onayı, iade politikası, risk uyarısı ("yatırım
   tavsiyesi değildir").
4. **Ödeme sistemi** — PaymentModal'daki düğme devre dışı ("Ödeme Yap —
   Yakında"); fiyat sayfası "Ücretsiz Dene" diyor. Stripe (veya Lemon Squeezy),
   abonelik yönetimi, fatura, iptal. (Kripto: Coinbase Commerce — eski not.)
5. **Ölçüm** — hiç analitik yok. Meta Pixel (Instagram reklamından ÖNCE),
   GA4 veya Vercel Analytics, UTM, Search Console.

### 🟠 Yüksek
6. **SEO altyapısı** — SPA, HTML'de içerik yok: ana sayfa için ön-çizim
   (prerender/SSR); OG/Twitter paylaşım etiketleri + görsel; robots.txt,
   sitemap.xml; JSON-LD (SoftwareApplication, FAQPage, Organization); dil
   başına adres (/tr, /de, /ar…) + hreflang; gerçek 404; sayfa başına başlık.
7. **Sosyal kanıt** — kullanıcı yorumları, kullanıcı sayısı, desteklenen
   broker/prop firma logoları.
8. **İletişim ve kimlik** — destek e-postası/formu, Hakkımızda, sosyal medya
   hesapları ve logoları, Discord/Telegram topluluğu.
9. **Önizleme** — kayıtsız demo hesap; tanıtım videoları ana sayfada
   (Maç Kaseti ana sayfa videosu olarak yapıldı — promo/).
10. **Performans** — tek parça ~1.9 MB JS; ana sayfa ile uygulamayı ayır
    (code splitting); Google Fonts CSS @import yerine preconnect/preload.

### 🟡 Orta
11. Blog / eğitim içeriği; "prop firm trading journal", "MT5 trading journal"
    gibi aramalar için sayfalar; rakip karşılaştırma sayfaları.
12. Yardım merkezi, değişiklik günlüğü, yol haritası.
13. Hesap ayarları sayfası (profil, saat dilimi, para birimi — şu an yalnız
    USD —, bildirimler, abonelik).
14. İşlemleri CSV olarak dışa aktarma (yalnız içe aktarma var).
15. E-posta: hoş geldin, haftalık özet, bülten; e-posta toplama.
16. Erişilebilirlik: ~123 yerde düşük kontrastlı soluk gri yazı (%25–30
    beyaz); simge düğmelerde ve görsellerde etiket eksik.
17. Uygulama içinde ~190 metin yalnız tr/en (ana sayfa 9 dilde).
18. Güvenlik başlıkları (CSP, HSTS, X-Frame-Options, Referrer-Policy) — vercel.json.

### 🟢 Sonra
19. PWA / mobil; sekme kapalıyken bildirim (web push).
20. cTrader, TradingView, Tradovate, NinjaTrader entegrasyonları.
21. Durum sayfası, otomatik testler, hata izleme (Sentry).

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

### Fiyatlandırma planı (öneri 2026-09-26 — kararlar bekliyor)
Rakipler: TradeZella $35–99, TraderSync $29.95–79.95, Tradervue $29.95–49.95,
Edgewonk $197/yıl, TradesViz ücretsiz + $19.99–29.99, FX Replay ücretsiz +
$17.99–35. Mevcut planımız: Ücretsiz (toplam 20 işlem) + Pro $12.99/ay, $99/yıl.
Öneri:
- 14 gün tam Pro, kartsız (tersine deneme) → sonra Ücretsiz'e düşüş.
- Ücretsiz: 1 journal, ayda 30 işlem (her ay yenilenir), elle giriş + CSV,
  temel istatistik, takvim, seans/haber sayfaları, prop puanlama; disiplin
  analizi yalnız önizleme.
- Pro $14.99/ay, $119/yıl: 3 journal, sınırsız işlem, MT5 otomatik kayıt
  (1 hesap), disiplin, ısı haritası, bildirimler, AI, 1 prop hesabı, CSV dışa aktarma.
- Prop $24.99/ay, $199/yıl: sınırsız journal ve prop hesabı, 10 MT5 hesabı,
  yüksek AI limiti, öncelikli destek.
- Yıllıkta 14 gün para iadesi; 6 aylık plan yok.
- Türkiye TL (KDV dahil): Pro 349 TL/ay, 2.790 TL/yıl; Prop 599 TL/ay,
  4.790 TL/yıl. 6 ayda bir gözden geçir. Diğer ülkeler 3 grup
  (tam / %30 / %50 indirim). İran'dan yaptırımlar nedeniyle ödeme alınamaz.
- Kurucu üye kampanyası: ilk 500 kişi / ilk 3 ay, Pro yıllık $79 (1.990 TL),
  ömür boyu bu fiyat; karşılığında kullanıcı yorumu.
- E-posta dizisi: gün 0, 1, 3, 7, 12, 14, 30 (Resend/Loops gerekir).
- İptal akışı: dondurma veya 2 ay %50; davet: iki tarafa 1 ay Pro.
- Altyapı: Paddle veya Lemon Squeezy (MoR, yerel fiyat, KDV). Stripe
  Türkiye'deki şirketlere doğrudan açık değil.
Açık kararlar: Prop kademesi olsun mu, TR fiyatı 349 TL mi, kurucu kampanyası.

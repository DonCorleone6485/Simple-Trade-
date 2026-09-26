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

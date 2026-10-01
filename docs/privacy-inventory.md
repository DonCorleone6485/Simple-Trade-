# Veri envanteri (gizlilik / KVKK metninin ham maddesi)

Tarih: 2026-10-01. Kaynak: kodun kendisi (api/, src/, vercel.json). Hukuki tavsiye değildir;
şirket kurulunca `/privacy` yazılırken buradan çıkılır ve hukukçuya gösterilir. Metne yalnız
**gerçekten olan** yazılır (bülten yok, piksel yok, o yüzden yazılmaz).

## 1. Hangi veri, nerede, ne için

| Veri | Tablo / yer | Neden | Silinme |
|---|---|---|---|
| E-posta, ad, oturum | Clerk | giriş | hesap silince Clerk'ten de silinir |
| Profil, plan, dil, para birimi, saat dilimi | `users` | hizmet | hesap silince silinir |
| İşlemler, notlar, fotoğraflar, hedefler | `trades`, `journals`, depolama `trade-photos` | hizmetin kendisi | hesap silince silinir |
| MetaTrader API anahtarı (özet), son kullanım | `api_keys` | EA bağlantısı | hesap silince silinir |
| Davet kodu ilişkileri | `referrals` | davet sistemi | referrer tarafı silinir |
| MT hesap numarası + sunucu **özeti**, e-posta **özeti** | `mt_accounts`, `used_trials` | deneme kötüye kullanımını önlemek | **bilerek tutulur** (kimlik değil, özet) |
| İletişim formu: e-posta, mesaj, ad, kullanıcı no, dil, sayfa | `contact_messages` | destek | hesap silince silinir (✅ 2026-10-01); 1 yıl sonra otomatik silinir |
| Tarayıcı/sunucu/CSP hataları: mesaj, yığın, sayfa adresi, tarayıcı bilgisi, dil | `client_errors` | hata düzeltme | 90 gün sonra otomatik silinir (✅ 2026-10-01) |
| Ziyaret sayıları, sayfalar | Vercel Analytics | istatistik | çerezsiz; adres `/journal/…` kısaltılıyor |
| Ülke kodu (IP'den) | yalnız yanıt olarak döner, **saklanmaz** | para birimi/dil önerisi | — |

## 2. Yurt dışına giden veri (aktarım listesi)

| Hizmet | Ne gidiyor | Not |
|---|---|---|
| **Clerk** | e-posta, ad, oturum | giriş sistemi |
| **Supabase** | bütün uygulama verisi | veritabanı + dosya depolama |
| **Vercel** | istekler, sunucu fonksiyonları, Analytics | barındırma |
| **Groq** | AI analizinde: istatistikler, sembol/setup özeti ve **en çok 10 işlemin notları (150 karaktere kısaltılmış)**; ses yazdırmada **ses kaydı** | notlara kişisel bir şey yazılırsa oraya gider |
| **Resend** | alıcı e-postası ve mesaj içeriği | haftalık özet, deneme, iletişim formu |
| **Cloudflare Turnstile** | kayıtta bot doğrulaması (Clerk üzerinden) | CSP'de `challenges.cloudflare.com` |
| ~~Google Fonts~~ | ✅ 2026-10-01 kaldırıldı: yazı tipleri `public/fonts/` altından kendi sunucumuzdan | artık Google'a istek yok |
| **Better Stack** | durum sayfası için sağlık kontrolü | kullanıcı verisi yok (`/api/geo?health`) |
| Google Workspace | admin@, support@, social@ kutuları, iletişim formu postaları | şirket e-postası |

## 3. Bulgular (2026-10-01'de 1, 2, 3, 4, 6 giderildi; 5 zaten temizdi)

1. **Hesap silince `contact_messages` kalıyor.** `api/account.ts` bu tabloyu silmiyor; kullanıcının e-postası ve yazdıkları duruyor. Çözüm: hesap silerken `user_id` ya da e-postaya göre sil (küçük kod değişikliği, onayla yapılır).
2. **`client_errors` ve `contact_messages` için saklama süresi yok.** Öneri: hatalar 90 gün, iletişim mesajları sorun kapanınca/1 yıl. Günlük cron (`api/emails.ts`) içinde silme eklenir.
3. **Google Fonts** yazı tipini Google sunucusundan çekiyor (`vercel.json` CSP: `fonts.googleapis.com`, `fonts.gstatic.com`). Ziyaretçi IP'si Google'a gidiyor ve izinsiz üçüncü taraf aktarımı sayılabiliyor (Almanya'da dava konusu oldu). Çözüm: yazı tiplerini siteden sunmak (kendi sunucumuzda), böylece listeden ve CSP'den çıkar. Değişiklik küçük ama görünümü etkiler; onayla yapılır.
4. **`client_errors.url` sorgu dizesini (`?…`) de kaydediyor** (`src/lib/errorLog.ts`). Şu an kayıtlarda kişisel veri görünmedi (ERRORS.md'de e-posta ya da anahtar yok), ama davet kodu gibi şeyler girebilir. Öneri: yalnız yol kaydedilsin.
5. **Loglar:** `api/` fonksiyonları yalnız hata durumunu `console.error` ile yazıyor (Resend/Groq yanıt durumu); form gövdesi, parola, işlem verisi yazılmıyor. Vercel'in kendi istek günlükleri ayrıca tutuluyor (adres, zaman, IP), süresi planına bağlı.
6. **AI notları:** analiz ekranında kullanıcıya "notların Groq'a (ABD) gönderilir" uyarısı yok. Metinde yazılacak, ekranda kısa bir not da iyi olur.

## 4. Şirket kurulunca sorulacaklar
- Veri sorumlusu (şirket adı, adres, iletişim), VERBİS kaydı gerekip gerekmediği.
- Yurt dışı aktarımda KVKK m.9 yolu (açık rıza / standart sözleşme / taahhüt) — hukukçu.
- Aydınlatma metni ile açık rıza **ayrı kutular**; pazarlama izni ayrı (Aşama C ile birlikte).
- Çerez/ piksel: Meta Pixel eklendiği gün onay bandı **zorunlu**, onaydan önce hiçbir şey yüklenmemeli.
- Metin sitenin gerçekte yaptığıyla birebir olmalı: şablon kopyalanmaz.

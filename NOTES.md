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

## Yapılacaklar
- Stripe ödeme entegrasyonu
- Coinbase Commerce kripto ödeme
- Domain bağlama
- Fiyatlandırma sayfası

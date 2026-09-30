# ERRORS.md

Kullanıcıların karşılaştığı hatalar (`client_errors` tablosu: tarayıcı + sunucu). İşaretler arası
`node scripts/errors-report.mjs` ile yenilenir; her saat zamanlanmış görev çalıştırır.
Kişisel bilgi silinir. Düzeltme akışı: Claude hatayı inceler → dalda düzeltir + test → kullanıcı
onayı → main. Çözülenler aşağıdaki "Çözülenler" bölümüne taşınır.

## Açık hatalar
<!-- ERRORS:START -->
_Otomatik üretildi: 2026-09-30T19:49 UTC, son 30 gün, 12 farklı hata. Elle düzenleme: bu işaretlerin dışında._

### render — Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/ToolPage-*.js
- 12× · 2 kişi · ilk 2026-09-30 09:53 · son 2026-09-30 16:01 UTC
- Sayfa: `/tr/tools/risk-reward-calculator`
```
TypeError: Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/ToolPage-cZuQWe3E.js

    at Lazy (<anonymous>)
    at Suspense (<anonymous>)
    at div (<anonymous>)
    at pi (https://www.simpletradejournal.io/assets/index-BbaGSm-j.js:172:154455)
    at kr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7910)
    at or (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:5590)
    at pr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7678)
    at yr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:8013)
  
```

### render — Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/ArticlePage-*.js
- 9× · 2 kişi · ilk 2026-09-28 04:05 · son 2026-09-30 15:33 UTC
- Sayfa: `/tr/blog/tradezella-alternative`
```
TypeError: Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/ArticlePage-CJ1I1z7w.js

    at Lazy (<anonymous>)
    at Suspense (<anonymous>)
    at div (<anonymous>)
    at pi (https://www.simpletradejournal.io/assets/index-CL7IrKuN.js:172:154455)
    at kr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7910)
    at or (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:5590)
    at pr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7678)
    at yr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:8013)
```

### render — Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/DirectoryPage-*.js
- 3× · 2 kişi · ilk 2026-09-29 19:04 · son 2026-09-30 11:48 UTC
- Sayfa: `/pt/prop-firms/e8-markets`
```
TypeError: Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/DirectoryPage-gituvu8f.js

    at Lazy (<anonymous>)
    at Suspense (<anonymous>)
    at div (<anonymous>)
    at ui (https://www.simpletradejournal.io/assets/index-BRmwiOVL.js:172:154343)
    at kr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7910)
    at or (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:5590)
    at pr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7678)
    at yr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:801
```

### render — Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/LandingPage-*.js
- 9× · 4 kişi · ilk 2026-09-28 02:33 · son 2026-09-30 11:32 UTC
- Sayfa: `/tr`
```
TypeError: Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/LandingPage-DxXPrXl2.js

    at Lazy (<anonymous>)
    at Suspense (<anonymous>)
    at div (<anonymous>)
    at di (https://www.simpletradejournal.io/assets/index-Bn5-8nHr.js:172:154195)
    at kr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7910)
    at or (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:5590)
    at pr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7678)
    at yr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:8013)
```

### render — @clerk/clerk-react: The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key=[SENSITIVE])
- 8× · 2 kişi · ilk 2026-09-28 22:34 · son 2026-09-30 03:08 UTC
- Sayfa: `/tr/prop-firms/alpha-capital`
```
Error: @clerk/clerk-react: The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key=[SENSITIVE])
    at Object.throwInvalidPublishableKeyError (http://localhost:3000/node_modules/.vite/deps/@clerk_clerk-react.js?v=e3458098:161:13)
    at ClerkProviderBase (http://localhost:3000/node_modules/.vite/deps/@clerk_clerk-react.js?v=e3458098:6966:20)
    at Object.react_stack_bottom_frame (http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=478da2a0:18509:20)
    at renderWithHooks (http://localhost:3
```

### rejection — Loading chunk 344 failed.
(error: https://clerk.simpletradejournal.io/npm/@clerk/<email>/dist/framework_clerk.browser_70f75e_5.128.0.js)
- 3× · 1 kişi · ilk 2026-09-28 01:15 · son 2026-09-29 20:39 UTC
- Sayfa: `/tr/blog/how-to-keep-a-trading-journal`
```
ChunkLoadError
    at i.f.j (https://clerk.simpletradejournal.io/npm/@clerk/clerk-js@5/dist/clerk.browser.js:19:23703)
    at https://clerk.simpletradejournal.io/npm/@clerk/clerk-js@5/dist/clerk.browser.js:19:20457
    at Array.reduce (<anonymous>)
    at i.e (https://clerk.simpletradejournal.io/npm/@clerk/clerk-js@5/dist/clerk.browser.js:19:20436)
    at Object.ensureMounted (https://clerk.simpletradejournal.io/npm/@clerk/clerk-js@5/dist/clerk.browser.js:5:95419)
    at tP.__unstable__updateProps (https://clerk.simpletradejournal.io/npm/@clerk/clerk-js@5/dist/clerk.browser.js:5:79617)
    at 
```

### render — Importing a module script failed.
- 4× · 1 kişi · ilk 2026-09-28 21:29 · son 2026-09-29 15:08 UTC
- Sayfa: `/journal`
```

Lazy@unknown:0:0
Suspense@unknown:0:0
div@unknown:0:0
div@unknown:0:0
div@unknown:0:0
So@https://www.simpletradejournal.io/assets/index-D8XIB_AA.js:172:133835
div@unknown:0:0
ci@https://www.simpletradejournal.io/assets/index-D8XIB_AA.js:172:154209
kr@https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7900
or@https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:5594
pr@https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7701
yr@https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:8046
$s@https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:23:56421

```

### render — Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/InfoPage-*.js
- 1× · 1 kişi · ilk 2026-09-28 15:01 · son 2026-09-28 15:01 UTC
- Sayfa: `/es/changelog`
```
TypeError: Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/InfoPage-Blzb2lQE.js

    at Lazy (<anonymous>)
    at Suspense (<anonymous>)
    at div (<anonymous>)
    at ci (https://www.simpletradejournal.io/assets/index-D8XIB_AA.js:172:154207)
    at kr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7910)
    at or (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:5590)
    at pr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7678)
    at yr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:8013)
  
```

### render — Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/ContactModal-*.js
- 1× · 1 kişi · ilk 2026-09-28 13:16 · son 2026-09-28 13:16 UTC
- Sayfa: `/tr`
```
TypeError: Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/ContactModal-sGzYvp0o.js

    at Lazy (<anonymous>)
    at Suspense (<anonymous>)
    at div (<anonymous>)
    at ci (https://www.simpletradejournal.io/assets/index-1a0LXvOq.js:172:154207)
    at kr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7910)
    at or (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:5590)
    at pr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7678)
    at yr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:8013
```

### render — Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/MTTargetPicker-*.js
- 2× · 1 kişi · ilk 2026-09-27 23:48 · son 2026-09-28 00:16 UTC
- Sayfa: `/journal`
```
TypeError: Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/MTTargetPicker-YUko3Gjo.js

    at Lazy (<anonymous>)
    at Suspense (<anonymous>)
    at div (<anonymous>)
    at di (https://www.simpletradejournal.io/assets/index-Mn7f2aiG.js:172:154195)
    at kr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7910)
    at or (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:5590)
    at pr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7678)
    at yr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:80
```

### render — Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/MTConnect-*.js
- 1× · 1 kişi · ilk 2026-09-28 00:04 · son 2026-09-28 00:04 UTC
- Sayfa: `/journal/721fff20-ce9d-4fbe-a328-75517fd618fd/mtConnect`
```
TypeError: Failed to fetch dynamically imported module: https://www.simpletradejournal.io/assets/MTConnect-72FWuWxR.js

    at Lazy (<anonymous>)
    at div (<anonymous>)
    at Suspense (<anonymous>)
    at div (<anonymous>)
    at div (<anonymous>)
    at div (<anonymous>)
    at To (https://www.simpletradejournal.io/assets/index-DblyrAxH.js:172:133822)
    at div (<anonymous>)
    at di (https://www.simpletradejournal.io/assets/index-DblyrAxH.js:172:154195)
    at kr (https://www.simpletradejournal.io/assets/clerk-lG9-cG11.js:16:7910)
    at or (https://www.simpletradejournal.io/assets/cler
```

### rejection — Internal JSON-RPC error.
- 1× · 1 kişi · ilk 2026-09-27 23:47 · son 2026-09-27 23:47 UTC
- Sayfa: `/journal/3565118d-82ad-4570-a19a-006f3e9e447d/trades`

<!-- ERRORS:END -->

## Onay bekleyen düzeltmeler
- **Eski sekmede "Failed to fetch dynamically imported module"** (son 3 günde ~20 kişi, her yeni yayından sonra): dal `fix/stale-chunk-reload`, `src/lib/lazyRetry.ts`. Sayfa dosyası yüklenemezse bir kez yeniden yüklenir, döngüye girmez. 74 test geçiyor, build temiz. Kullanıcı onaylayınca main'e alınır.
- `@clerk/clerk-react: publishableKey invalid` (8×): büyük ihtimalle yerel geliştirme (yerel Clerk anahtarı geçersiz, canlıda sorun yok); kullanıcı raporu değil, işlem yok.

## Çözülenler
_Henüz yok._

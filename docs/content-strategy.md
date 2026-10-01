# İçerik ve platform stratejisi (PDF)

Belge: masaüstünde `STJ-PDF/Simple Trading Journal - Icerik ve Platform Stratejisi.pdf` (23 sayfa).
İçinde: ekip (4 kişi + trader danışman), 23 içerik türü, içerik × platform tablosu (● ana, ✓ doğrudan paylaşılır,
↗ kesit/bağlantı), 10 kanal için platform bölümleri (her içerik türü ayrı blokta), ek platformlar, haftalık akış.

Kaynak: `scripts/strategy-pdf/build.py` (yapı, içerik türleri, tablo) ve `plat.py` (platform bölümleri).
Yeniden üretmek (Chrome gerekir, internet: yazı tipi Google Fonts'tan):
```
cd scripts/strategy-pdf && python3 build.py   # stj-strateji.html üretir
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer \
  --virtual-time-budget=9000 --print-to-pdf="$HOME/Desktop/STJ-PDF/Simple Trading Journal - Icerik ve Platform Stratejisi.pdf" \
  "file://$PWD/stj-strateji.html"
```
(`stj-strateji.html` üretilen dosya, commit'lenmez.)

Tutarlılık kontrolü: `scripts/strategy-pdf/check.py` tablodaki her işaretin (●, ✓, ↗) ilgili platform bölümünde
bir bloğu olduğunu ve bölümlerdeki her türün tabloda işaretli olduğunu denetler; `build.py` uyuşmazlık varsa PDF üretmez.
Platform bölümlerine ek bloklar `plat_extra.py` içinde. 2026-10-01: 23 sayfa, 0 uyuşmazlık; şablon (tür 12) satırı
Instagram, X ve YouTube'da ↗ (PDF yüklenmez, bağlantı), Telegram ve Discord ●, LinkedIn ✓.

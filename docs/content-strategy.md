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

## Çalışan el kitabı (detaylı, 54 sayfa)

`STJ-PDF/Simple Trading Journal - Icerik Ekibi El Kitabi.pdf`: işe yeni başlayan, konuyu hiç bilmeyen bir çalışan için.
Bölümler: ürün ve ekip, sözlük (28 terim, örnekli), altın kurallar (YAPMA/YAP örnekleriyle), çalışma akışı + araçlar +
yayın öncesi kontrol listesi, 23 içerik türünün her biri için kart (ne, kim, sıklık, adım adım, hazır örnek, yapma),
içerik x platform tablosu, 10 kanal için rehber (nasıl yüklenir, hazır örnek metinler, yapma, haftalık liste),
takılırsan (SSS), sonra eklenecek kanallar.

Kaynak: `scripts/strategy-pdf/handbook.py` + `hb_intro.py` (ürün, sözlük, kurallar, araçlar), `hb_types.py` (23 kart),
`hb_platforms.py` (kanal rehberi); platform bölümleri ve tablo için `plat.py`, `plat_extra.py`, `build.py` (MX). Üretmek:
`cd scripts/strategy-pdf && python3 handbook.py` sonra Chrome ile `handbook.html` -> PDF (komut yukarıda). Aynı tutarlılık kontrolü çalışır.
Uygulama menü yolları (hangi butona basılır) 2026-10-01'de yazıldı; arayüzler değişebilir, kullanılırken doğrula.

## Yapay zekâ ekibi el kitabı (2. sürüm, 22 sayfa)

`STJ-PDF/Simple Trading Journal - Yapay Zeka Ekibi El Kitabi.pdf`: siteyi yönetecek 1 koordinatör + 7 yapay zekâ asistanının
görev talimatları (Kalite Kontrol, Teknik Bakım, SEO ve İçerik, Araştırma, Sosyal Medya, Müşteri, Operasyon ve Güven).
İlk sürüm (`STJ-PDF/simpletradejournal-yapay-zeka-ekibi.pdf`, 12 sayfa) başka bir Claude oturumunun dışarıdan incelemesiydi;
2. sürüm sitenin gerçek durumuna göre düzeltildi (yazılar 9 dilde, Pro satılmıyor, kurulu görevler, onay kuralları) ve
Bölüm 1'deki tabloda neyin neden değiştiği yazılı. Kurulum 3 aşamalı; Aşama 1 Ali'nin onayını bekliyor.

Kaynak: `scripts/strategy-pdf/ai_1.py` (giriş, site gerçekleri, şema, ortak kurallar), `ai_2.py` (8 rol), `ai_3.py`
(kurulum sırası, SSS), `ai_build.py`. Üretmek: `cd scripts/strategy-pdf && python3 ai_build.py`, sonra Chrome ile
`ai_ekip.html` -> PDF (komut yukarıda). Site gerçekleri (sayfa sayıları, kurulu görevler) değişince Bölüm 2 güncellenir.

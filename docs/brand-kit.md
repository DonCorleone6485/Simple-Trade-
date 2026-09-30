# Marka kiti

Logo dosyaları ve kuralları: [public/brand/README.md](../public/brand/README.md).
Stil: koyu (sitenin kendi görünümü).

## Renkler (src/index.css ile aynı)

| Ad | Kod | Nerede |
|---|---|---|
| Zemin | `#08080c` | Tüm koyu yüzeyler |
| Yazı | `#F4F2EC` | Ana metin, logodaki S ve T |
| Altın | `#f0b429` | Yalnız J ve vurgu kelimesi (italik) |
| Mor | `#8b5cf6` | Düğme ve bağlantı; arka planda çok hafif ışık (%10-20) |
| Soluk yazı | `rgba(244,242,236,.55)` | Adres, ikincil metin |

Altın yalnızca vurguda: bir görselde bir kez. Düğme rengi mor, altın değil.

## Yazı tipleri (Google Fonts, ücretsiz)

- **Newsreader** — başlıklar (düz + altın italik vurgu). Sitenin başlık yazısı.
- **Inter** (500) — adres, etiket, küçük metin.
- **JetBrains Mono** — sayı ve fiyat.

## Kapak görselleri

`public/brand/covers/` — 2x çözünürlük, koyu, "Every trade recorded. / Every mistake visible."

| Dosya | Piksel | Nereye |
|---|---|---|
| `cover-x.png` | 3000×1000 (1500×500'ün 2x'i) | X profil kapağı |
| `cover-li.png` | 2256×382 (1128×191'in 2x'i) | LinkedIn şirket sayfası kapağı |
| `cover-fb.png` | 1640×624 (820×312'nin 2x'i) | Facebook sayfası kapağı |
| `cover-rd.png` | 1920×384 | Reddit profil afişi (yaklaşık; Reddit kırpma aracı sunar) |
| `cover-yt.png` | 2560×1440 | YouTube kanal afişi (kanal açılınca; metin telefon güvenli alanının içinde, ortada) |

Instagram, TikTok, Telegram'da kapak alanı yok. Discord sunucu afişi sunucu güçlendirmesi (boost) ister, şimdilik yok.

Sol alt köşe profil resmiyle örtüşür; metin bilerek orta-sağda. Facebook telefonda
kenarları kırpar, metin ortada kaldığı için sorun olmaz.
Kapak metni İngilizce: ana hesaplar İngilizce (Telegram/Instagram dil hesapları
açılınca kendi dilinde kapak yapılır).

Yeniden üretmek (metin ya da renk değişince): `scripts/brand/covers.html` içindeki
metni düzenle, sonra Chrome'la her boyut için ekran görüntüsü al:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
  --allow-file-access-from-files --force-device-scale-factor=2 --virtual-time-budget=6000 \
  --window-size=1500,500 --screenshot=public/brand/covers/cover-x.png \
  "file://$PWD/scripts/brand/covers.html?c=x"
```
(`c=x` 1500×500, `c=li` 1128×191, `c=fb` 820×312, `c=rd` 1920×384 ve `c=yt` 2560×1440 — ikisi 1x; pencere boyutu aynı olmalı.)

Logo dosyasındaki "Simple Trading Journal" yazısının alt kuyrukları kesik (p, g, j);
kapaklarda bu yüzden yalnız STJ işareti kullanıldı.

## Kalanlar
- Paylaşım şablonları (Instagram 1080×1350 karusel, X 1600×900): henüz yok.
- Kapak yüklemesi hesaplarda: kullanıcı yapar.

LinkedIn kapağı tek satır: alan çok ince (191 px) ve LinkedIn üstten alttan kırpıyor, üç satır sığmadı.

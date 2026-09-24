# Simple Trading Journal — marka dosyaları

Harfler Georgia'dan alınıp **vektör yola** çevrildi. Buradaki hiçbir dosya
fonta ihtiyaç duymaz; işaret her cihazda ve her programda birebir aynı çizilir.

## Hangisi nerede

| Dosya | Nerede kullanılır |
|---|---|
| `stj-mark*.svg` | Yalnız işaret. Kare alanlar, profil resmi, ürün. |
| `stj-lock*.svg` | İşaret + isim. Site başlığı, imza, fatura, sunum. |
| `stj-tile.svg` | Uygulama ikonu — koyu karo, tam monogram. |
| `stj-tile-j.svg` | Favicon. Üç harf 16 pikselde okunmuyor; burada markanın imzası olan altın J tek başına duruyor. |

Renk sonekleri: `-white` koyu zemin için, `-black` açık zemin için,
`-mono-*` tek renk baskı, kaşe ve gravür için. Soneki olmayan
(`stj-mark.svg`, `stj-lock.svg`) `currentColor` kullanır — yalnızca SVG kodun
içine gömülünce çalışır, `<img>` ile açılınca siyaha düşer.

Kodda kullanmak için: `src/components/Logo.tsx` → `<Mark />`, `<Lock />`.

## Kurallar

- **Altın yalnızca J'de.** S ve T bulundukları yerin rengini alır.
- Altın: `#f0b429` — sitenin vurgu rengiyle aynı.
- Çevresinde en az S harfinin genişliği kadar boşluk bırak.
- İşareti germe, eğme, gölge ekleme, harflerin arasını açma.

## Lisans notu

Harfler **Georgia**'dan türetildi. Georgia, Microsoft'un lisanslı fontudur ve
dış hatlarını kalıcı bir markaya dönüştürmek lisans açısından net değildir.
Bu bilinçli bir tercihti. Risksiz alternatif, aynı monogramı **Newsreader**
ile üretmektir — SIL Open Font License'lı olduğu için logo yapmaya ve ticari
kullanıma açıkça izin verir, üstelik sitenin zaten kullandığı yazıdır.

# Tanıtım videoları

Dört kısa reklam, kodla üretiliyor (Remotion). Görüntüde sitenin kendi
arayüzü, renkleri ve logosu var; müzik ve efektler `scripts/` içinde
sıfırdan sentezleniyor. Hazır müzik yok, dolayısıyla telif derdi de yok.

| Kompozisyon | Süre | Biçim | Fikir |
|---|---|---|---|
| `Ayna` | 30 sn | 1080×1920 | "Kendine yalan söyleyebilirsin. Journal'ına söyleyemezsin." |
| `Fis` | 20 sn | 1080×1920 | "Aynı hatayı satın almayı bırak." |
| `Hic` | 15 sn | 1080×1920 | "Journal'a tek tuşa bile basmadın." |
| `Mac` | 60 sn | 1920×1080 | "Şampiyonlar kaybettikleri maçı izler." |

## Üretmek

```bash
npm install
npm run sounds                      # public/sfx ve public/music
npx remotion render src/index.ts Ayna out/ayna_raw.mp4 --codec=h264 --crf=17
scripts/finish.sh out/ayna_raw.mp4 out/ayna.mp4 -14   # ses: −14 LUFS
```

Müziksiz versiyon (Instagram/TikTok'ta uygulamanın içinden ses eklemek için):
`--props='{"music":false}'`, ardından `finish.sh ... -18`.

## Görseller

`public/img/` içindeki üç boksör karesi Higgsfield'de Nano Banana Pro ile
üretildi (kare başına 2 kredi); ikisi ilk karenin referansıyla, yüz aynı kalsın
diye. Sesler gibi bedavaya yeniden üretilemedikleri için depoda duruyorlar.
Hareketi (yakınlaşma, kayma) `Mac.tsx` içindeki `Still` veriyor.

## Kurallar

- **Zamanlama tek yerde:** `src/cues.ts`. Görüntü de müzik de oradan okuyor;
  bir sayıyı değiştirince ikisi birlikte kayar.
- **Yalnızca sitede olan özellikler.** Kartlardaki etiketler sitedeki metinlerin
  aynısı (Disiplin, Isı Haritası, prop sayacı, "Tamamlanmadı"…). Sitede
  olmayan bir analizi reklamda göstermek, vaat edip veremediğimiz bir şey olur.
- Rakamlar birbirini tutmalı: lot × stop mesafesi = risk, kazanç ÷ risk = R.
- Remotion lisansı: bireyler ve en fazla üç kişilik şirketler için ücretsiz.

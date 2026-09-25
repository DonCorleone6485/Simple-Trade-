/**
 * Zaman çizelgeleri — saniye cinsinden.
 *
 * Hem görüntü (Remotion) hem müzik (scripts/music.mjs) buradan okur. Müzikteki
 * darbe ile ekrandaki yazının aynı kareye düşmesinin tek güvencesi bu: bir
 * sayıyı burada değiştirince ikisi birlikte kayar.
 */
export const FPS = 30;

export const AYNA = {
  duration: 30,
  /** Üç iddia/cevap çifti. Her biri 5 saniye. */
  pairs: [0, 5, 10],
  pair: {
    claim: 0.2,     // iddianın ilk kelimesi
    answer: 1.9,    // journal'ın kartı
    count: 2.2,     // rakam saymaya başlar
    countEnd: 3.2,
    strike: 3.35,   // iddianın üstü çizilir
    exit: 4.55,     // sahne çıkar
  },
  compare: 15,      // "Kurala uyan / işaretlenen" karşılaştırması
  compareBars: 16.3,
  riser: 16.8,
  drop: 19.5,       // müzik susar
  line1: 19.7,      // "Kendine yalan söyleyebilirsin."
  line2: 22.1,      // "Journal'ına söyleyemezsin." — darbe
  end: 25.2,        // logo
};

export const FIS = {
  duration: 20,
  /** Başlık satırları hızlı, challenge satırları gittikçe hızlanarak basılıyor. */
  header: 0.25,
  rows: [0.95, 1.57, 2.13, 2.63, 3.07, 3.45, 3.77, 4.04],
  rule: 4.4,
  pause: 4.55,      // yazıcı duruyor — nefes
  total: 5.2,       // TOPLAM — darbe
  payout: 6.05,
  rule2: 6.6,
  thanks: 6.9,
  again: 7.45,      // "YİNE BEKLERİZ :)"
  tear: 8.35,
  black: 8.95,
  line: 9.25,       // "Aynı hatayı satın almayı bırak."
  lineHit: 10.55,
  prop: 12.45,
  propCard: 13.0,
  propCount: 13.45,
  propCountEnd: 15.3,
  end: 16.8,
};

export const HIC = {
  duration: 15,
  cap1: 0.3,        // "Sen işlemine gir."
  cursor: 0.9,      // imleç SELL'e gidiyor
  click: 1.75,      // tık — pozisyon açıldı
  sync1: 1.95,      // terminalden journal'a akan ışık
  row: 2.35,        // journal'da AÇIK satırı
  cap2: 3.1,        // "Biz yazalım."
  tp: 8.3,          // hedef — pozisyon kapandı
  sync2: 8.5,
  fill: 8.9,        // satır tamamlanıyor
  cap3: 8.7,        // "Kapanınca biz tamamlayalım."
  verdict: 10.9,    // "Journal'a tek tuş basmadın."
  end: 12.5,
};

/** Maç Kaseti — 60 sn, yatay. Üç klip aynı ritimle: oynat, durdur, çiz, söyle. */
const clip = (start: number) => ({
  start,                 // geri sarma geçişi başlar
  play: start + 0.5,     // oynat
  freeze: start + 1.9,   // ❚❚ duraklat
  draw: start + 2.2,     // kalem daireyi çiziyor
  sub: start + 2.7,      // antrenörün cümlesi
  data: start + 3.9,     // journal'ın rakamı
  end: start + 6.9,
});

export const MAC = {
  duration: 60,
  insert: 0.3,           // kaset takılıyor
  rewind: 1.0,
  play: 2.6,
  sub1: 3.2,             // "Her maçtan sonra aynı şeyi yaparlar."
  sub2: 5.8,             // "Kaseti açarlar."
  clips: [clip(8.2), clip(15.1), clip(22.0)],
  // Son klibin bitişiyle aynı an: arada kaset boş oynamasın (29,0'da
  // 0,1 saniyelik boş bir 'OYNAT' karesi kalıyordu).
  stop: 22.0 + 6.9,      // ■ DURDUR
  champ1: 30.4,          // "Şampiyonlar kaybettikleri maçı izler."
  hit1: 31.8,
  champ2: 34.6,          // "Amatörler bir sonrakine koşar."
  hit2: 36.0,
  riser: 37.0,
  montage: 38.8,
  beat: 60 / 126.3,      // montajın temposu: dört vuruş = bir kesme
  week: 50.2,            // "Bu hafta" karşılaştırması
  end: 53.6,
};

/**
 * Sayı biçimlendirme — sitenin tek kaynağı.
 *
 * Tutarlar her dilde aynı görünür: ondalık ayırıcı nokta, binlik ayırıcı
 * virgül ($1,234.56). Tarayıcının yereline bırakılsaydı Türkçe bir tarayıcıda
 * "1.234,56", İngilizce bir tarayıcıda "1,234.56" çıkar; aynı ekranda iki
 * farklı format görünürdü. Semboller ve fiyatlar uluslararası olduğu için
 * finans dünyasının ortak yazımında sabitliyoruz.
 */

const LOCALE = 'en-US';

/** Ayırıcılı sayı: 1234.5 → "1,234.50" (varsayılan 2 basamak). */
export const num = (v: number, digits = 2) =>
  v.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Tam sayı: 10000 → "10,000". */
export const int = (v: number) => v.toLocaleString(LOCALE, { maximumFractionDigits: 0 });

/** İşaretsiz tutar: 1234.5 → "$1,234.50". */
export const money = (v: number, digits = 2) => `$${num(Math.abs(v), digits)}`;

/** İşaretli tutar: -1234.5 → "−$1,234.50" (eksi işareti tipografik U+2212). */
export const signedMoney = (v: number, digits = 2) =>
  `${v >= 0 ? '+' : '−'}$${num(Math.abs(v), digits)}`;

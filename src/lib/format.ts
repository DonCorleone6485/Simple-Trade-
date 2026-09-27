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

/**
 * Gösterilen para birimi — kullanıcının hesap ayarı (users.currency).
 *
 * Yalnızca simge değişiyor, kur çevrilmiyor: tutarlar kullanıcının hesabının
 * para biriminde girilmiş ya da MetaTrader'dan öyle gelmiş oluyor. TL hesabı
 * olan biri tutarlarını zaten TL girer; "$" görmesi yanlıştı.
 */
export const CURRENCIES: { code: string; symbol: string }[] = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'TRY', symbol: '₺' },
  { code: 'CHF', symbol: 'CHF ' },
  { code: 'JPY', symbol: '¥' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'CAD', symbol: 'C$' },
];

let SYMBOL = '$';
try {
  // Açılışta bir an "$" görünüp değişmesin: son seçim tarayıcıda da duruyor.
  const saved = localStorage.getItem('stjCurrency');
  const hit = CURRENCIES.find(c => c.code === saved);
  if (hit) SYMBOL = hit.symbol;
} catch { /* yok */ }

export function setCurrency(code: string | null | undefined) {
  const hit = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
  SYMBOL = hit.symbol;
  try { localStorage.setItem('stjCurrency', hit.code); } catch { /* yok */ }
}

/** Şu anki simge: "$", "€", "₺"… */
export const cur = () => SYMBOL;

/** Ayırıcılı sayı: 1234.5 → "1,234.50" (varsayılan 2 basamak). */
export const num = (v: number, digits = 2) =>
  v.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Tam sayı: 10000 → "10,000". */
export const int = (v: number) => v.toLocaleString(LOCALE, { maximumFractionDigits: 0 });

/** İşaretsiz tutar: 1234.5 → "$1,234.50". */
export const money = (v: number, digits = 2) => `${SYMBOL}${num(Math.abs(v), digits)}`;

/** İşaretli tutar: -1234.5 → "−$1,234.50" (eksi işareti tipografik U+2212). */
export const signedMoney = (v: number, digits = 2) =>
  `${v >= 0 ? '+' : '−'}${SYMBOL}${num(Math.abs(v), digits)}`;

/**
 * Uygulama içi metinlerin kalan yedi dili (fa, ar, ru, es, pt, de, fr).
 *
 * Uygulamanın bir kısmı LanguageContext'teki anahtarlarla dokuz dilde;
 * geri kalanı kaynakta Türkçe/İngilizce çift olarak yazılıydı ve öteki
 * dillerde İngilizce görünüyordu. Bu tablo o çiftleri İngilizce metnin
 * kendisiyle anahtarlıyor (landingCopy.ts ile aynı yöntem), böylece yüzlerce
 * çağrı yerinden hiçbiri anahtar adı taşımıyor.
 *
 * İNGİLİZCE METNİ DEĞİŞTİRİRSEN BURADAKİ ANAHTARI DA DEĞİŞTİR — unutursan
 * hata çıkmaz, o satır yedi dilde İngilizce görünür.
 *
 * {0}, {1}… yer tutucuları çağıran taraftan gelen değerlerle doluyor.
 */

/**
 * Tablo (~90 KB) ana pakette değil, ayrı dosyada: Türkçe ve İngilizce
 * kullanıcıların hiç ihtiyacı yok. Öbür dillerde uygulama çizilmeden önce
 * yükleniyor (main.tsx, LanguageContext.setLanguage) — yoksa bir an
 * İngilizce görünürdü. Yüklenene kadar pick() İngilizceye düşer.
 */
let APP_COPY: Record<string, Record<string, string>> = {};
let loading: Promise<void> | null = null;

export const needsAppCopy = (language: string) => language !== 'tr' && language !== 'en';

export function loadAppCopy(): Promise<void> {
  if (!loading) {
    loading = import('./appCopyData')
      .then(m => { APP_COPY = m.APP_COPY as Record<string, Record<string, string>>; })
      .catch(() => { loading = null; /* bir dahaki dil değişiminde yeniden denenir */ });
  }
  return loading;
}

export function pick(language: string, trText: string, enText: string, ...args: (string | number | null | undefined)[]): string {
  const base = language === 'tr' ? trText
    : language === 'en' ? enText
    : APP_COPY[enText]?.[language] ?? enText;
  return args.length ? base.replace(/\{(\d+)\}/g, (m, i) => (args[+i] == null ? '' : String(args[+i]))) : base;
}

/** Tarih ve saat biçimi için yerel ayar. Tutarlar bilerek en-US kalıyor (lib/format.ts). */
export function localeOf(language: string): string {
  return ({
    tr: 'tr-TR', en: 'en-US', fa: 'fa-IR', ar: 'ar-u-nu-latn', ru: 'ru-RU', es: 'es-ES', pt: 'pt-PT', de: 'de-DE', fr: 'fr-FR',
  } as Record<string, string>)[language] || 'en-US';
}

/**
 * Yüzde, dilin kendi yazımıyla: Türkçe "%58", İngilizce "58%", Almanca ve
 * Fransızca "58 %". Rakamlar her dilde Latin (tutarlarla aynı); Farsçada
 * yalnız işaret "٪".
 */
export function pct(value: number | string, language: string, digits = 0): string {
  const n = typeof value === 'number' ? value : parseFloat(value);
  if (!isFinite(n)) return String(value);
  const locale = language === 'fa' ? 'fa-IR-u-nu-latn' : localeOf(language);
  return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n / 100);
}

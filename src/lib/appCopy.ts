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
import { APP_COPY } from './appCopyData';

export function pick(language: string, trText: string, enText: string, ...args: (string | number | null | undefined)[]): string {
  const base = language === 'tr' ? trText
    : language === 'en' ? enText
    : (APP_COPY[enText] as Record<string, string> | undefined)?.[language] ?? enText;
  return args.length ? base.replace(/\{(\d+)\}/g, (m, i) => (args[+i] == null ? '' : String(args[+i]))) : base;
}

/** Tarih ve saat biçimi için yerel ayar. Tutarlar bilerek en-US kalıyor (lib/format.ts). */
export function localeOf(language: string): string {
  return ({
    tr: 'tr-TR', en: 'en-US', fa: 'fa-IR', ar: 'ar-u-nu-latn', ru: 'ru-RU', es: 'es-ES', pt: 'pt-PT', de: 'de-DE', fr: 'fr-FR',
  } as Record<string, string>)[language] || 'en-US';
}

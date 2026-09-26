import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadSerif } from '@remotion/google-fonts/Newsreader';

/**
 * Sitenin görsel dili — src/index.css ile aynı. Türkçe harfler (ı, ş, ğ, İ)
 * latin-ext alt kümesinde; o yüklenmezse harfler yedek fonta düşer ve aynı
 * kelimenin içinde iki ayrı yazı tipi görünür.
 */
export const sans = loadInter('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const mono = loadMono('normal', { weights: ['400', '500'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const serif = loadSerif('normal', { weights: ['400', '500'], subsets: ['latin', 'latin-ext'] }).fontFamily;

export const C = {
  bg: '#050507',
  text: '#F4F4F6',
  dim: 'rgba(255,255,255,0.45)',
  faint: 'rgba(255,255,255,0.26)',
  line: 'rgba(255,255,255,0.08)',
  purple: '#8b5cf6',
  lilac: '#a78bfa',
  gold: '#f0b429',
  red: '#f87171',
  green: '#34d399',
  amber: '#fbbf24',
};

/** Sitedeki tutar yazımı: "−$1,380" — tipografik eksi, binlik virgül. */
// LRI…PDI (görünmez): Farsça gibi sağdan sola metinde tutarın işareti ve $ yer değiştirmesin.
export const signed = (v: number) =>
  `\u2066${v >= 0 ? '+' : '−'}$${Math.abs(Math.round(v)).toLocaleString('en-US')}\u2069`;
export const money = (v: number, d = 0) =>
  `\u2066$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}\u2069`;

// ── Farsça ──
// Başlıklar: Noto Naskh Arabic — klasik nesih, serif başlıkların karşılığı.
// Arayüz ve altyazı: Vazirmatn — İran'da en yaygın açık kaynaklı arayüz fontu.
// Farsçada harf aralığı (letterSpacing) kullanılmaz: harflerin bitişmesini bozar.
import { loadFont as loadVazir } from '@remotion/google-fonts/Vazirmatn';
import { loadFont as loadNaskh } from '@remotion/google-fonts/NotoNaskhArabic';
export const faSans = loadVazir('normal', { weights: ['400', '500', '600', '700'], subsets: ['arabic', 'latin'] }).fontFamily;
export const faSerif = loadNaskh('normal', { weights: ['500', '600', '700'], subsets: ['arabic'] }).fontFamily;

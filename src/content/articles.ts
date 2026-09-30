/**
 * Rehberler ve blog yazıları (/guides/…, /blog/…).
 *
 * Neden var: uygulamanın içindeki kurulum anlatımları Google'dan
 * bulunamıyordu; "MT5 trading journal", "how to keep a trading journal" gibi
 * aramalardan gelecek kişinin inebileceği bir sayfa yoktu. Bu sayfalar
 * derlemede önceden çiziliyor (scripts/prerender.mjs), yani JavaScript
 * çalıştırmayan botlar da içeriği görüyor.
 *
 * Metinler dokuz dilde, her dil kendi dosyasında (articles/<dil>.ts);
 * burada yalnızca yazıların sırası, adresi ve tarihi var. Yeni yazı: buraya
 * bir satır, dokuz dil dosyasına aynı anahtarla metin. Bir dilde eksik
 * kalırsa o dilde İngilizcesi görünür.
 *
 * Yazılar yalnızca sitenin gerçekten yaptığını anlatıyor; rakiplerle ilgili
 * doğrulanmamış iddia yok.
 */
import en from './articles/en';
import tr from './articles/tr';
import fa from './articles/fa';
import ar from './articles/ar';
import ru from './articles/ru';
import es from './articles/es';
import pt from './articles/pt';
import de from './articles/de';
import fr from './articles/fr';

export type ArticleLang = 'en' | 'tr' | 'fa' | 'ar' | 'ru' | 'es' | 'pt' | 'de' | 'fr';

export type Block =
  | { h2: string }
  | { p: string }
  | { ol: string[] }
  | { ul: string[] }
  | { code: string }
  | { note: string }
  /** Karşılaştırma tablosu: ilk satır başlık; ilk sütun satır adı. */
  | { table: string[][] };

/** Bir yazının tek bir dildeki metni. */
export interface ArticleText {
  title: string;
  description: string;
  body: Block[];
}

export interface Article {
  slug: string;
  section: 'guides' | 'blog';
  /** Yayın / son güncelleme tarihi (YYYY-AA-GG). */
  date: string;
  minutes: number;
}

const TEXTS: Record<ArticleLang, Record<string, ArticleText>> = { en, tr, fa, ar, ru, es, pt, de, fr };
export const ARTICLE_LANGS = Object.keys(TEXTS) as ArticleLang[];

export const ARTICLES: Article[] = [
  { slug: 'metatrader-5-auto-sync', section: 'guides', date: '2026-09-27', minutes: 5 },
  { slug: 'import-trade-history', section: 'guides', date: '2026-09-27', minutes: 4 },
  { slug: 'how-to-keep-a-trading-journal', section: 'blog', date: '2026-09-27', minutes: 6 },
  { slug: 'r-multiple-explained', section: 'blog', date: '2026-09-27', minutes: 5 },
  { slug: 'prop-firm-daily-loss-and-drawdown', section: 'blog', date: '2026-09-27', minutes: 5 },
  { slug: 'pre-trade-checklist', section: 'blog', date: '2026-09-29', minutes: 4 },
  { slug: 'trading-emotions-journal', section: 'blog', date: '2026-09-29', minutes: 4 },
  { slug: 'position-sizing-risk-per-trade', section: 'blog', date: '2026-09-29', minutes: 5 },
  { slug: 'revenge-trading', section: 'blog', date: '2026-09-29', minutes: 4 },
  { slug: 'expectancy-and-profit-factor', section: 'blog', date: '2026-09-29', minutes: 5 },
  { slug: 'overtrading', section: 'blog', date: '2026-09-29', minutes: 4 },
  { slug: 'forex-trading-journal', section: 'blog', date: '2026-09-30', minutes: 5 },
  { slug: 'trading-glossary', section: 'guides', date: '2026-09-30', minutes: 6 },
  // Karşılaştırmalar: rakip bilgileri kendi fiyat/yardım sayfalarından
  // (Eylül 2026). Fiyatlar değişir — güncellerken tarihi de değiştir.
  { slug: 'tradezella-alternative', section: 'blog', date: '2026-09-28', minutes: 4 },
  { slug: 'tradersync-alternative', section: 'blog', date: '2026-09-28', minutes: 4 },
  { slug: 'edgewonk-alternative', section: 'blog', date: '2026-09-28', minutes: 4 },
  { slug: 'tradervue-alternative', section: 'blog', date: '2026-09-29', minutes: 4 },
  { slug: 'tradesviz-alternative', section: 'blog', date: '2026-09-29', minutes: 4 },
  { slug: 'fx-replay-alternative', section: 'blog', date: '2026-09-29', minutes: 4 },
];

export const articlePath = (a: Pick<Article, 'section' | 'slug'>) => `/${a.section}/${a.slug}`;

export const findArticle = (section: string, slug: string) =>
  ARTICLES.find(a => a.section === section && a.slug === slug);

/** Yazının istenen dildeki metni; o dilde yoksa İngilizcesi. */
export const articleText = (a: Article, lang: string): ArticleText =>
  TEXTS[lang as ArticleLang]?.[a.slug] || TEXTS.en[a.slug];

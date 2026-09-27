import React, { useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Lock as LogoLock } from './Logo';
import { ARTICLES, articlePath, findArticle, type Article, type ArticleLang, type Block } from '../content/articles';

/**
 * Blog dizini (/blog) ve tek tek yazılar (/guides/…, /blog/…).
 *
 * Görünüş Yardım sayfasıyla aynı aile (InfoPage). Yazılar İngilizce ve
 * Türkçe; öbür dillerde İngilizce gösteriliyor, çevresindeki düğmeler ise
 * seçili dilde (bkz. src/content/articles.ts).
 */
type L9 = Record<'tr' | 'en' | 'fa' | 'ar' | 'ru' | 'es' | 'pt' | 'de' | 'fr', string>;
const UI: Record<string, L9> = {
  blog: { tr: 'Blog ve rehberler', en: 'Blog & guides', fa: 'بلاگ و راهنماها', ar: 'المدونة والأدلة', ru: 'Блог и руководства', es: 'Blog y guías', pt: 'Blog e guias', de: 'Blog & Anleitungen', fr: 'Blog et guides' },
  blogLead: {
    tr: 'Journal tutmak, riski ölçmek ve Simple Trading Journal\'ı kurmak üzerine.',
    en: 'On keeping a journal, measuring risk and setting up Simple Trading Journal.',
    fa: 'درباره نوشتن ژورنال، سنجش ریسک و راه‌اندازی Simple Trading Journal.',
    ar: 'عن تدوين السجل وقياس المخاطرة وإعداد Simple Trading Journal.',
    ru: 'О ведении журнала, измерении риска и настройке Simple Trading Journal.',
    es: 'Sobre llevar un diario, medir el riesgo y configurar Simple Trading Journal.',
    pt: 'Sobre manter um diário, medir o risco e configurar o Simple Trading Journal.',
    de: 'Über Journal-Führung, Risikomessung und die Einrichtung von Simple Trading Journal.',
    fr: 'Tenir un journal, mesurer le risque et configurer Simple Trading Journal.',
  },
  guides: { tr: 'Rehberler', en: 'Guides', fa: 'راهنماها', ar: 'الأدلة', ru: 'Руководства', es: 'Guías', pt: 'Guias', de: 'Anleitungen', fr: 'Guides' },
  articles: { tr: 'Yazılar', en: 'Articles', fa: 'مقاله‌ها', ar: 'المقالات', ru: 'Статьи', es: 'Artículos', pt: 'Artigos', de: 'Artikel', fr: 'Articles' },
  minRead: { tr: '{0} dk okuma', en: '{0} min read', fa: '{0} دقیقه مطالعه', ar: 'قراءة {0} دقائق', ru: '{0} мин чтения', es: '{0} min de lectura', pt: '{0} min de leitura', de: '{0} Min. Lesezeit', fr: '{0} min de lecture' },
  back: { tr: 'Tüm yazılar', en: 'All articles', fa: 'همه مقاله‌ها', ar: 'كل المقالات', ru: 'Все статьи', es: 'Todos los artículos', pt: 'Todos os artigos', de: 'Alle Artikel', fr: 'Tous les articles' },
  home: { tr: 'Ana sayfa', en: 'Home', fa: 'صفحه اصلی', ar: 'الرئيسية', ru: 'Главная', es: 'Inicio', pt: 'Início', de: 'Startseite', fr: 'Accueil' },
  related: { tr: 'Bunlar da işine yarayabilir', en: 'You may also find useful', fa: 'شاید این‌ها هم به کارت بیاید', ar: 'قد يفيدك أيضاً', ru: 'Может пригодиться', es: 'También te puede servir', pt: 'Também te pode ser útil', de: 'Auch nützlich', fr: 'À lire aussi' },
  ctaTitle: { tr: 'Journal\'ını ücretsiz başlat', en: 'Start your journal for free', fa: 'ژورنالت را رایگان شروع کن', ar: 'ابدأ سجلك مجاناً', ru: 'Начните журнал бесплатно', es: 'Empieza tu diario gratis', pt: 'Começa o teu diário grátis', de: 'Starte dein Journal kostenlos', fr: 'Commencez votre journal gratuitement' },
  ctaText: {
    tr: 'MetaTrader\'ı bağla ya da raporunu aktar; kayıt olmadan örnek verilerle de gezebilirsin.',
    en: 'Connect MetaTrader or import your report — or look around with sample data before signing up.',
    fa: 'متاتریدر را وصل کن یا گزارشت را وارد کن — یا قبل از ثبت‌نام با داده‌های نمونه نگاهی بینداز.',
    ar: 'اربط ميتاتريدر أو استورد تقريرك — أو تجوّل ببيانات تجريبية قبل التسجيل.',
    ru: 'Подключите MetaTrader или импортируйте отчёт — или посмотрите всё на демо-данных до регистрации.',
    es: 'Conecta MetaTrader o importa tu informe, o explora con datos de ejemplo antes de registrarte.',
    pt: 'Liga o MetaTrader ou importa o teu relatório — ou explora com dados de exemplo antes de te registares.',
    de: 'Verbinde MetaTrader oder importiere deinen Bericht – oder sieh dich vor der Anmeldung mit Beispieldaten um.',
    fr: 'Connectez MetaTrader ou importez votre relevé — ou explorez avec des données d\'exemple avant de vous inscrire.',
  },
};

const LOCALES: Record<string, string> = { tr: 'tr-TR', en: 'en-US' };
const SITE = 'https://www.simpletradejournal.io';

export const BLOG_META = {
  title: 'Blog & guides — Simple Trading Journal',
  description: 'Guides for connecting MetaTrader 5 and importing trade history, and articles on keeping a trading journal, R-multiples and prop firm rules.',
};

const BlockView: React.FC<{ b: Block }> = ({ b }) => {
  if ('h2' in b) return <h2 className="text-[21px] font-medium text-white mt-10 mb-3">{b.h2}</h2>;
  if ('p' in b) return <p className="text-[16px] leading-[1.75] mb-4" style={{ color: 'rgba(255,255,255,0.72)' }}>{b.p}</p>;
  if ('code' in b) return (
    <pre className="font-mono text-[14px] px-4 py-3 rounded-xl mb-4 overflow-x-auto" style={{ background: 'rgba(0,0,0,0.35)', color: '#c4b5fd' }}>{b.code}</pre>
  );
  if ('note' in b) return (
    <p className="text-[14.5px] leading-relaxed rounded-xl px-4 py-3 mb-4" style={{ background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.2)', color: 'rgba(255,255,255,0.7)' }}>{b.note}</p>
  );
  const items = 'ol' in b ? b.ol : b.ul;
  const List = 'ol' in b ? 'ol' : 'ul';
  return (
    <List className={`${'ol' in b ? 'list-decimal' : 'list-disc'} ps-6 mb-4 space-y-2 text-[16px] leading-[1.7]`} style={{ color: 'rgba(255,255,255,0.72)' }}>
      {items.map((it, i) => <li key={i} className="ps-1">{it}</li>)}
    </List>
  );
};

const ArticleCard: React.FC<{ a: Article; lang: ArticleLang; onOpen: (path: string) => void; minRead: string }> = ({ a, lang, onOpen, minRead }) => {
  const path = articlePath(a);
  return (
    <a href={path} onClick={e => { e.preventDefault(); onOpen(path); }}
      className="block rounded-2xl p-6 transition-colors hover:bg-white/[0.05]"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      dir={lang === 'tr' ? 'ltr' : undefined}>
      <h3 className="text-[17px] font-medium text-white mb-2">{a.title[lang]}</h3>
      <p className="text-[14.5px] leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{a.description[lang]}</p>
      <span className="text-[12.5px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{minRead.replace('{0}', String(a.minutes))}</span>
    </a>
  );
};

export default function ArticlePage({ path, onHome, onOpen, cta }: {
  /** /blog, /guides/… ya da /blog/… */
  path: string;
  onHome: () => void;
  /** Site içi geçiş (sayfa yenilenmeden). */
  onOpen: (path: string) => void;
  cta: { label: string; onClick: () => void };
}) {
  const { language } = useLanguage();
  const ui = (k: keyof typeof UI) => (UI[k] as Record<string, string>)[language] || UI[k].en;
  const lang: ArticleLang = language === 'tr' ? 'tr' : 'en';
  const rtl = language === 'fa' || language === 'ar';

  const [, section, slug] = path.split('/');
  const article = slug ? findArticle(section, slug) : undefined;
  const isIndex = !article;

  useEffect(() => {
    document.title = article ? `${article.title[lang]} — Simple Trading Journal` : `${ui('blog')} — Simple Trading Journal`;
    window.scrollTo(0, 0);
  }, [path, lang]);

  const guides = ARTICLES.filter(a => a.section === 'guides');
  const posts = ARTICLES.filter(a => a.section === 'blog');
  const related = article ? ARTICLES.filter(a => a !== article).slice(0, 3) : [];

  const jsonLd = article ? {
    '@context': 'https://schema.org',
    '@type': article.section === 'guides' ? 'HowTo' : 'BlogPosting',
    ...(article.section === 'guides' ? { name: article.title.en } : { headline: article.title.en }),
    description: article.description.en,
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: ['en', 'tr'],
    url: SITE + articlePath(article),
    publisher: { '@type': 'Organization', name: 'Simple Trading Journal', url: SITE + '/' },
  } : null;

  return (
    <div className="min-h-screen" style={{ background: '#0d0e1a' }}>
      <header className="max-w-3xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="/" onClick={e => { e.preventDefault(); onHome(); }} aria-label="Simple Trading Journal">
          <LogoLock className="h-[26px] w-auto text-white" />
        </a>
        <button onClick={cta.onClick} className="cta px-4 py-2 rounded-full text-sm font-medium" style={{ background: '#8b5cf6', color: '#fff' }}>
          {cta.label}
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-24">
        {isIndex ? (
          <>
            <button onClick={onHome} className="link-gold inline-flex items-center gap-1.5 text-[13px] mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <ArrowLeft className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
              {ui('home')}
            </button>
            <h1 className="poster text-[2.2rem] sm:text-[2.8rem] mb-3">{ui('blog')}</h1>
            <p className="text-[16px] leading-relaxed mb-12" style={{ color: 'rgba(255,255,255,0.55)' }}>{ui('blogLead')}</p>

            <h2 className="text-[12px] uppercase tracking-[0.14em] mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{ui('guides')}</h2>
            <div className="grid gap-4 mb-12">
              {guides.map(a => <ArticleCard key={a.slug} a={a} lang={lang} onOpen={onOpen} minRead={ui('minRead')} />)}
            </div>
            <h2 className="text-[12px] uppercase tracking-[0.14em] mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{ui('articles')}</h2>
            <div className="grid gap-4">
              {posts.map(a => <ArticleCard key={a.slug} a={a} lang={lang} onOpen={onOpen} minRead={ui('minRead')} />)}
            </div>
          </>
        ) : (
          <>
            <a href="/blog" onClick={e => { e.preventDefault(); onOpen('/blog'); }}
              className="link-gold inline-flex items-center gap-1.5 text-[13px] mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <ArrowLeft className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
              {ui('back')}
            </a>
            {/* Yazının kendisi yalnızca İngilizce/Türkçe; Farsça/Arapça
                arayüzde de soldan sağa okunmalı. */}
            <article dir="ltr" lang={lang}>
              <div className="text-[12px] uppercase tracking-[0.14em] mb-3" style={{ color: '#f0b429' }}>
                {article.section === 'guides' ? ui('guides') : ui('articles')}
              </div>
              <h1 className="poster text-[2rem] sm:text-[2.6rem] leading-tight mb-4">{article.title[lang]}</h1>
              <div className="flex items-center gap-3 text-[13px] mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <time dateTime={article.date}>
                  {new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: 'long' }).format(new Date(`${article.date}T12:00:00Z`))}
                </time>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{ui('minRead').replace('{0}', String(article.minutes))}</span>
              </div>
              {article.body[lang].map((b, i) => <BlockView key={i} b={b} />)}
            </article>

            <section className="rounded-2xl p-7 mt-14" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
              <h2 className="text-[19px] font-medium text-white mb-2">{ui('ctaTitle')}</h2>
              <p className="text-[15px] leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>{ui('ctaText')}</p>
              <button onClick={cta.onClick} className="cta px-5 py-2.5 rounded-full text-[15px] font-medium" style={{ background: '#8b5cf6', color: '#fff' }}>
                {cta.label}
              </button>
            </section>

            <h2 className="text-[12px] uppercase tracking-[0.14em] mt-14 mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{ui('related')}</h2>
            <div className="grid gap-4">
              {related.map(a => <ArticleCard key={a.slug} a={a} lang={lang} onOpen={onOpen} minRead={ui('minRead')} />)}
            </div>
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />}
          </>
        )}
      </main>
    </div>
  );
}

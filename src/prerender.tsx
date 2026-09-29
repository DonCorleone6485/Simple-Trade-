import React from 'react';
import { renderToString } from 'react-dom/server';
import LandingPage from './components/LandingPage';
import InfoPage from './components/InfoPage';
import ArticlePage from './components/ArticlePage';
import DirectoryPage from './components/DirectoryPage';
import { ARTICLES, articlePath, articleText, type ArticleLang } from './content/articles';
import { DIRECTORY_PATHS, directoryMeta, isDirectoryPath } from './content/directory';
import { LanguageProvider, type Language } from './context/LanguageContext';
import { loadAppCopy } from './lib/appCopy';
import { ALL_LANGS, langPath } from './lib/langPath';
import { SEO_META } from './lib/seoMeta';

/**
 * Sayfaların derleme sırasında çizilmiş hâli (scripts/prerender.mjs).
 *
 * Site tek sayfalık bir uygulama: HTML'de boş bir <div id="root"> var,
 * içerik JavaScript çalışınca geliyor. Google JavaScript çalıştırıyor ama
 * yapay zekâ arama botları (ChatGPT, Perplexity, Claude) ve bazı arama
 * motorları çalıştırmıyor; onlar siteyi bomboş görüyordu. Buradaki çıktı
 * HTML'e yazılıyor ve JavaScript'li tarayıcılarda hiç görünmüyor — React
 * sayfayı kendisi çizip onun yerine koyuyor.
 *
 * Her sayfa dokuz dilde, kendi adresinde çiziliyor (/blog, /tr/blog, /fa/blog…;
 * bkz. lib/langPath.ts). Sayfalar birbirini hreflang ile gösteriyor.
 */
export interface PrerenderPage {
  /** Dilsiz yol: '/', '/help', '/blog/x' — aynı sayfanın dillerini gruplar. */
  base: string;
  lang: Language;
  /** Dilli adres: '/tr/help'. */
  path: string;
  /** dist/ altındaki dosya: 'tr/help.html'. */
  file: string;
  title: string;
  description: string;
}

const baseFile = (base: string) => (base === '/' ? 'index.html' : `${base.slice(1)}.html`);

const BASES: { base: string; meta: (l: Language) => { title: string; description: string } }[] = [
  { base: '/', meta: l => ({ title: SEO_META.home.title[l], description: SEO_META.home.description[l] }) },
  { base: '/help', meta: l => ({ title: SEO_META.help.title[l], description: SEO_META.help.description[l] }) },
  { base: '/changelog', meta: l => ({ title: SEO_META.changelog.title[l], description: SEO_META.changelog.description[l] }) },
  { base: '/blog', meta: l => ({ title: SEO_META.blog.title[l], description: SEO_META.blog.description[l] }) },
  ...ARTICLES.map(a => ({
    base: articlePath(a),
    meta: (l: Language) => ({ title: `${articleText(a, l).title} — Simple Trading Journal`, description: articleText(a, l).description }),
  })),
  ...DIRECTORY_PATHS.map(base => ({ base, meta: (l: Language) => directoryMeta(base, l as ArticleLang)! })),
];

export const PAGES: PrerenderPage[] = BASES.flatMap(({ base, meta }) =>
  ALL_LANGS.map(lang => ({
    base,
    lang,
    path: langPath(base, lang),
    file: lang === 'en' ? baseFile(base) : `${lang}/${baseFile(base)}`,
    ...meta(lang),
  })),
);

/** Öbür dillerin uygulama metinleri ayrı dosyada; çizmeden önce yüklensin. */
export const prepare = () => loadAppCopy();

export function render(page: Pick<PrerenderPage, 'base' | 'lang'>): string {
  const noop = () => {};
  const cta = { label: 'Get Started Free', onClick: noop };
  const { base, lang } = page;
  let body: React.ReactNode;
  if (base === '/') body = <LandingPage onGetStarted={noop} onSignIn={noop} />;
  else if (base === '/help' || base === '/changelog') {
    body = <InfoPage kind={base.slice(1) as 'help' | 'changelog'} onHome={noop} onOther={noop} cta={cta} />;
  } else if (isDirectoryPath(base)) body = <DirectoryPage path={base} onHome={noop} onOpen={noop} cta={cta} />;
  else body = <ArticlePage path={base} onHome={noop} onOpen={noop} cta={cta} />;
  return renderToString(<LanguageProvider initial={lang}>{body}</LanguageProvider>);
}

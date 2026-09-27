import React from 'react';
import { renderToString } from 'react-dom/server';
import LandingPage from './components/LandingPage';
import InfoPage, { INFO_META } from './components/InfoPage';
import ArticlePage, { BLOG_META } from './components/ArticlePage';
import { ARTICLES, articlePath, articleText } from './content/articles';
import { LanguageProvider } from './context/LanguageContext';

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
 * Dil İngilizce: sunucuda tarayıcı dili yok, dil tespiti İngilizceye düşüyor.
 */
export type PrerenderPage = 'home' | 'help' | 'changelog';

export const META: Record<Exclude<PrerenderPage, 'home'>, { title: string; description: string; path: string }> = {
  help: { ...INFO_META.help, path: '/help' },
  changelog: { ...INFO_META.changelog, path: '/changelog' },
};

/**
 * Ana sayfa dışında önceden çizilen her sayfa: adres, dist/ altındaki dosya
 * ve <head> bilgileri. scripts/prerender.mjs bu listeyi dolaşıyor; vercel.json
 * adresleri bu dosyalara yönlendiriyor.
 */
export const PAGES: { path: string; file: string; title: string; description: string }[] = [
  { ...META.help, file: 'help.html' },
  { ...META.changelog, file: 'changelog.html' },
  { ...BLOG_META, path: '/blog', file: 'blog.html' },
  ...ARTICLES.map(a => ({
    path: articlePath(a),
    file: `${a.section}/${a.slug}.html`,
    title: `${articleText(a, 'en').title} — Simple Trading Journal`,
    description: articleText(a, 'en').description,
  })),
];

export function render(page: string = 'home'): string {
  const noop = () => {};
  const cta = { label: 'Get Started Free', onClick: noop };
  let body: React.ReactNode;
  if (page === 'home') body = <LandingPage onGetStarted={noop} onSignIn={noop} />;
  else if (page === 'help' || page === 'changelog' || page === '/help' || page === '/changelog') {
    body = <InfoPage kind={page.replace('/', '') as 'help' | 'changelog'} onHome={noop} onOther={noop} cta={cta} />;
  } else body = <ArticlePage path={page} onHome={noop} onOpen={noop} cta={cta} />;
  return renderToString(<LanguageProvider>{body}</LanguageProvider>);
}

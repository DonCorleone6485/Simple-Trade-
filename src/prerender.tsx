import React from 'react';
import { renderToString } from 'react-dom/server';
import LandingPage from './components/LandingPage';
import InfoPage, { INFO_META } from './components/InfoPage';
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

export function render(page: PrerenderPage = 'home'): string {
  const noop = () => {};
  return renderToString(
    <LanguageProvider>
      {page === 'home'
        ? <LandingPage onGetStarted={noop} onSignIn={noop} />
        : <InfoPage kind={page} onHome={noop} onOther={noop} cta={{ label: 'Get Started Free', onClick: noop }} />}
    </LanguageProvider>
  );
}

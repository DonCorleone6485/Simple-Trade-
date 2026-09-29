/**
 * Dil başına adresler: /tr/blog, /fa/help … İngilizce kökte (/blog).
 *
 * Neden: önceden her sayfanın tek adresi vardı ve Google o adresi yalnızca
 * İngilizce görüyordu (dil tarayıcıda seçiliyordu). Türkçe, Farsça, Arapça
 * aramalarda çıkabilmek için her dilin kendi, önceden çizilmiş adresi var;
 * sayfalar birbirini hreflang ile gösteriyor (scripts/prerender.mjs).
 *
 * Yalnızca herkese açık sayfalar dilli: ana sayfa, yardım, değişiklikler,
 * blog ve yazılar, prop firma ve broker sayfaları. Uygulama (/journal) dilden bağımsız — orada dil kullanıcının
 * kendi seçimi.
 */
export const URL_LANGS = ['tr', 'fa', 'ar', 'ru', 'es', 'pt', 'de', 'fr'] as const;
export const ALL_LANGS = ['en', ...URL_LANGS] as const;

/** "/tr/blog/x" → { lang: 'tr', path: '/blog/x' };  "/blog" → { lang: null, path: '/blog' } */
export function splitLangPath(pathname: string): { lang: string | null; path: string } {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const seg = clean.split('/')[1] || '';
  if ((URL_LANGS as readonly string[]).includes(seg)) {
    return { lang: seg, path: clean.slice(seg.length + 1) || '/' };
  }
  return { lang: null, path: clean };
}

/** Dilsiz yola dil öneki: ('/blog', 'tr') → '/tr/blog';  ('/', 'tr') → '/tr';  İngilizcede olduğu gibi. */
export function langPath(path: string, language: string): string {
  if (!(URL_LANGS as readonly string[]).includes(language)) return path;
  return path === '/' ? `/${language}` : `/${language}${path}`;
}

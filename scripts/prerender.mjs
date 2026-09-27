/**
 * Derlemenin son adımı: src/prerender.tsx'teki PAGES listesini — her sayfa
 * dokuz dilde (/, /tr, /fa/blog …) — önceden çizip dist/ altına yazar
 * (index.html, tr/index.html, fa/blog/x.html …) ve site haritasını üretir.
 * Neden: src/prerender.tsx'teki açıklamaya bak. vercel.json adresleri bu
 * dosyalara yönlendiriyor.
 *
 * Her sayfanın <head>'i kendi dilinde: başlık, açıklama, <html lang/dir>,
 * canonical ve öbür dillerini gösteren hreflang bağlantıları (x-default:
 * İngilizce). Google her dili ayrı sayfa olarak böyle tanıyor.
 *
 * JavaScript'li tarayıcıda bu kopya görünmez: <head>'deki tek satırlık betik
 * <html>'e "js" sınıfını ekliyor, CSS de o sınıf varken kopyayı gizliyor.
 * React kendi çizimini kopyanın yerine koyuyor.
 *
 * Bir şey ters giderse derleme durmaz: ön çizim olmadan da site çalışıyor
 * (adresler için uygulama kabuğu kopyalanır).
 */
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';

const SITE = 'https://www.simpletradejournal.io';
const indexPath = resolve('dist/index.html');
const template = readFileSync(indexPath, 'utf8');

const OG_LOCALE = { en: 'en_US', tr: 'tr_TR', fa: 'fa_IR', ar: 'ar_AR', ru: 'ru_RU', es: 'es_ES', pt: 'pt_PT', de: 'de_DE', fr: 'fr_FR' };
const RTL = ['fa', 'ar'];

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function withBody(page, html) {
  if (!page.includes('<div id="root"></div>')) throw new Error('root div not found');
  return page
    .replace('<div id="root"></div>', `<div id="root"><div id="prerender">${html}</div></div>`)
    .replace('</head>', `<script>document.documentElement.classList.add('js')</script><style>.js #prerender{display:none}</style></head>`);
}

function withHead(page, { title, description, path, lang }, alternates) {
  const url = SITE + path;
  const links = alternates
    .map(a => `<link rel="alternate" hreflang="${a.lang}" href="${SITE}${a.path}" />`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${SITE}${alternates.find(a => a.lang === 'en').path}" />`)
    .join('');
  return page
    .replace(/<html lang="[^"]*">/, `<html lang="${lang}" dir="${RTL.includes(lang) ? 'rtl' : 'ltr'}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace('</head>', `<meta property="og:locale" content="${OG_LOCALE[lang] || 'en_US'}" />${links}</head>`);
}

const write = (file, content) => {
  const out = resolve('dist', file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, content);
};

let pages = [];
try {
  const mod = await import(pathToFileURL(resolve('dist-ssr/prerender.js')).href);
  await mod.prepare();
  pages = mod.PAGES;
  const byBase = new Map();
  for (const p of pages) byBase.set(p.base, [...(byBase.get(p.base) || []), p]);

  let total = 0;
  for (const page of pages) {
    const html = mod.render(page);
    write(page.file, withBody(withHead(template, page, byBase.get(page.base)), html));
    total += html.length;
  }
  console.log(`prerender: ${pages.length} pages (${byBase.size} × ${pages.length / byBase.size} languages), ${Math.round(total / 1024)} KB`);

  // Site haritası: her adres, öbür dillerini de göstererek.
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages.map(p => {
    const alts = byBase.get(p.base)
      .map(a => `<xhtml:link rel="alternate" hreflang="${a.lang}" href="${SITE}${a.path}"/>`).join('');
    const priority = p.base === '/' ? '1.0' : p.base.startsWith('/guides') ? '0.7' : '0.6';
    return `  <url><loc>${SITE}${p.path}</loc><lastmod>${today}</lastmod><priority>${priority}</priority>${alts}</url>`;
  });
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
  console.log(`prerender: sitemap ${urls.length} urls`);
} catch (err) {
  console.warn('prerender skipped:', err && err.message ? err.message : err);
  // Adresler yine çalışsın: ön çizimsiz uygulama kabuğu.
  const files = pages.length ? pages.map(p => p.file) : ['help.html', 'changelog.html', 'blog.html'];
  for (const file of files) if (file !== 'index.html') write(file, template);
} finally {
  rmSync(resolve('dist-ssr'), { recursive: true, force: true });
}

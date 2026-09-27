/**
 * Derlemenin son adımı: ana sayfayı ve src/prerender.tsx'teki PAGES
 * listesini (Yardım, Değişiklikler, blog, rehberler) önceden çizip dist/
 * altına yazar (index.html, help.html, blog/….html …).
 * Neden: src/prerender.tsx'teki açıklamaya bak. vercel.json /help ve
 * /changelog adreslerini bu dosyalara yönlendiriyor.
 *
 * JavaScript'li tarayıcıda bu kopya görünmez: <head>'deki tek satırlık betik
 * <html>'e "js" sınıfını ekliyor, CSS de o sınıf varken kopyayı gizliyor.
 * Böylece Türkçe kullanıcı sayfa yüklenirken bir an bile İngilizce metin
 * görmüyor; React kendi çizimini kopyanın yerine koyuyor.
 *
 * Bir şey ters giderse derleme durmaz: ön çizim olmadan da site çalışıyor
 * (yalnızca /help ve /changelog için index.html kopyalanır).
 */
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';

const SITE = 'https://www.simpletradejournal.io';
const indexPath = resolve('dist/index.html');
const template = readFileSync(indexPath, 'utf8');

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function withBody(page, html) {
  if (!page.includes('<div id="root"></div>')) throw new Error('root div not found');
  return page
    .replace('<div id="root"></div>', `<div id="root"><div id="prerender">${html}</div></div>`)
    .replace('</head>', `<script>document.documentElement.classList.add('js')</script><style>.js #prerender{display:none}</style></head>`);
}

function withHead(page, { title, description, path }) {
  const url = SITE + path;
  return page
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(description)}$2`);
}

let pages = [];
try {
  const mod = await import(pathToFileURL(resolve('dist-ssr/prerender.js')).href);
  pages = mod.PAGES;
  const home = mod.render('home');
  writeFileSync(indexPath, withBody(template, home));
  console.log(`prerender: home ${Math.round(home.length / 1024)} KB`);
  for (const page of pages) {
    const html = mod.render(page.path);
    const out = resolve('dist', page.file);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, withBody(withHead(template, page), html));
    console.log(`prerender: ${page.path} ${Math.round(html.length / 1024)} KB`);
  }
} catch (err) {
  console.warn('prerender skipped:', err && err.message ? err.message : err);
  // Adresler yine çalışsın: ön çizimsiz uygulama kabuğu.
  const files = pages.length ? pages.map(p => p.file) : ['help.html', 'changelog.html', 'blog.html'];
  for (const file of files) {
    const out = resolve('dist', file);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, template);
  }
} finally {
  rmSync(resolve('dist-ssr'), { recursive: true, force: true });
}

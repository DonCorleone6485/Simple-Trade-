#!/usr/bin/env node
/**
 * IndexNow: yeni ya da değişen sayfaları Bing'e (ve Yandex, Seznam, Naver'e —
 * hepsi aynı listeyi paylaşıyor) anında bildirir. Bing'in dizini ChatGPT ve
 * Copilot aramalarını da besliyor.
 *
 * Anahtar gizli değil: public/8ed09c22b34c8d29a61d44dd43238b49.txt olarak yayında, arama motoru
 * site bize ait mi diye oradan okuyor.
 *
 *   node scripts/indexnow.mjs                 → canlı sitemap'teki bütün adresler
 *   node scripts/indexnow.mjs /blog/yeni-yazi  → yalnız verilen yollar
 *
 * Yayından SONRA çalıştırılır (sayfa canlıda yoksa bildirmenin anlamı yok).
 * Sık sık hepsini göndermek gereksiz; yeni sayfa eklenince o sayfaları gönder.
 */
const HOST = 'www.simpletradejournal.io';
const KEY = '8ed09c22b34c8d29a61d44dd43238b49';
const SITE = `https://${HOST}`;

const args = process.argv.slice(2);
let urls;
if (args.length) {
  urls = args.map(p => (p.startsWith('http') ? p : SITE + (p.startsWith('/') ? p : '/' + p)));
} else {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  urls = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]))];
}

const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls.slice(0, 10000) }),
});
console.log(`indexnow: ${urls.length} adres → ${r.status} ${r.statusText}`, await r.text());
// 200 ya da 202 başarılı; 403 anahtar dosyası okunamadı; 422 adres bu siteye ait değil.
process.exit(r.status === 200 || r.status === 202 ? 0 : 1);

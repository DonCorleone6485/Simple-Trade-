/**
 * landingCopy.ts, İngilizce metnin kendisini anahtar olarak kullanıyor.
 * Bu kolay okunur ama kırılgandır: kaynaktaki İngilizce cümleyi düzeltip
 * anahtarı güncellemeyi unutursan hiçbir hata çıkmaz — o satır altı dilde
 * sessizce İngilizce görünür. Bu betik tam o sessiz kaymayı yakalıyor.
 *
 *   npm run check:copy
 */
import { readFileSync } from 'node:fs';

const FILES = ['src/components/LandingPage.tsx', 'src/components/PricingPage.tsx'];
/** Marka adı bilerek çevrilmiyor. */
const ALLOWED_UNTRANSLATED = new Set(['Simple Trading Journal']);

/** Açan tırnaktan başlayıp kaçışlara saygı duyarak dize okur. */
function readString(s, i) {
  const q = s[i];
  let out = '';
  i += 1;
  for (;;) {
    const c = s[i];
    if (c === undefined) return null;
    if (c === '\\') { out += JSON.parse(`"\\${s[i + 1] === "'" ? "u0027" : s[i + 1]}"`); i += 2; continue; }
    if (c === q) return [out, i + 1];
    out += c;
    i += 1;
  }
}
const skipWs = (s, i) => { while (i < s.length && ' \t\r\n'.includes(s[i])) i += 1; return i; };

/** Kaynaktaki t('tr', 'en', 'fa') çağrılarından İngilizce olanı toplar. */
function englishStrings(path) {
  const s = readFileSync(path, 'utf8');
  const found = [];
  for (let i = 0; ; ) {
    const j = s.indexOf('t(', i);
    if (j < 0) break;
    i = j + 2;
    if (j > 0 && /[A-Za-z0-9_$.]/.test(s[j - 1])) continue;
    let k = skipWs(s, j + 2);
    const args = [];
    let ok = true;
    for (let n = 0; n < 3; n += 1) {
      k = skipWs(s, k);
      if (!"'\"".includes(s[k])) { ok = false; break; }
      const r = readString(s, k);
      if (!r) { ok = false; break; }
      args.push(r[0]);
      k = skipWs(s, r[1]);
      if (n < 2) { if (s[k] !== ',') { ok = false; break; } k += 1; }
    }
    if (ok && s[k] === ')') found.push(args[1]);
  }
  return found;
}

const copySrc = readFileSync('src/lib/landingCopy.ts', 'utf8');
const keys = new Set([...copySrc.matchAll(/^ {2}("(?:[^"\\]|\\.)*"): C\(/gm)].map(m => JSON.parse(m[1])));

const used = new Set(FILES.flatMap(englishStrings));
const missing = [...used].filter(s => !keys.has(s) && !ALLOWED_UNTRANSLATED.has(s));
const stale = [...keys].filter(s => !used.has(s));

if (missing.length) {
  console.error(`\n${missing.length} metnin altı dilde karşılığı yok (İngilizce görünecekler):`);
  missing.forEach(s => console.error('  +', JSON.stringify(s)));
}
if (stale.length) {
  console.error(`\n${stale.length} çeviri artık hiçbir yerde kullanılmıyor:`);
  stale.forEach(s => console.error('  -', JSON.stringify(s)));
}
if (missing.length || stale.length) {
  console.error('\nsrc/lib/landingCopy.ts dosyasını güncelle.\n');
  process.exit(1);
}
console.log(`landingCopy: ${used.size} metnin hepsi altı dilde karşılanıyor.`);

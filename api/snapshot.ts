import { verifyToken } from '@clerk/backend';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

/**
 * Bir bağlantıdaki resmi indirir ve tarayıcıya geri verir.
 *
 * Ekran görüntüsünü indirip tekrar yüklemek yerine bağlantısını yapıştırmak
 * yetsin istiyoruz. Bağlantı herhangi bir yerden gelebilir; üç yol deneniyor:
 *
 *   1. adres zaten bir resimse doğrudan indirilir (her sunucu),
 *   2. TradingView'in /x/ bağlantısıysa resmin adresi türetilir — o adres bir
 *      sayfa, resim değil, o yüzden özel ele alınıyor,
 *   3. başka bir sayfaysa sayfanın önizleme görseli (og:image) alınır.
 *
 * Yani TradingView özel bir durum, tek durum değil.
 *
 * Resmi burada indirip istemciye veriyoruz, o da kendi deposuna kendi
 * kullanıcı klasörüne yüklüyor. Böylece kota, silme ve sahiplik kuralları
 * elle yüklenen fotoğraflarla birebir aynı yoldan geçiyor.
 *
 * GÜVENLİK: burada kullanıcının yazdığı bir adrese sunucudan istek atıyoruz.
 * Hiçbir kısıt koymazsak bu bir SSRF açığıdır — biri "http://169.254.169.254"
 * yazıp bulut sağlayıcısının kimlik uçnoktasını bize okutabilir. Bu yüzden:
 * sadece https, sadece genel IP'ler, sadece resim içerik türü, boyut ve süre
 * sınırlı, ve yönlendirmeler elle takip edilip her adımda aynı kontrol.
 */

const MAX_BYTES = 8 * 1024 * 1024;
const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 4;

const OK_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

async function userFromRequest(req: any): Promise<string | null> {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) return null;
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  try {
    const claims = await verifyToken(token, { secretKey: secret });
    return claims.sub || null;
  } catch {
    return null;
  }
}

/** Özel ağlar, geri döngü ve bulut meta adresleri — hiçbiri dışarıdan istenemez. */
export function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    if (v === '::1' || v === '::') return true;
    if (v.startsWith('fe80') || v.startsWith('fc') || v.startsWith('fd')) return true;
    // ::ffff:10.0.0.1 gibi eşlenmiş adresler v4 kuralına düşsün
    const m = v.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (m) return isPrivateAddress(m[1]);
    return false;
  }
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = p;
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 169 && b === 254) ||              // bulut meta verisi
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||    // taşıyıcı NAT
    a >= 224                                  // çok noktaya yayın ve ayrılmış
  );
}

async function assertPublicHttps(raw: string): Promise<URL> {
  let u: URL;
  try { u = new URL(raw); } catch { throw new Error('bad-url'); }
  if (u.protocol !== 'https:') throw new Error('not-https');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (isIP(host)) {
    if (isPrivateAddress(host)) throw new Error('private-address');
    return u;
  }
  // Ad çözümlemesi de kontrol edilmeli: bir alan adı özel bir adrese
  // işaret ediyor olabilir.
  const hits = await lookup(host, { all: true });
  if (!hits.length || hits.some(h => isPrivateAddress(h.address))) throw new Error('private-address');
  return u;
}

const withTimeout = (url: string, init: RequestInit = {}) => {
  const c = new AbortController();
  const timer = setTimeout(() => c.abort(), TIMEOUT_MS);
  return fetch(url, {
    ...init,
    signal: c.signal,
    redirect: 'manual',
    headers: { 'User-Agent': 'Mozilla/5.0 SimpleTradingJournal', ...(init.headers || {}) },
  }).finally(() => clearTimeout(timer));
};

/** Yönlendirmeleri elle izler; her adımda adres yeniden denetlenir. */
async function safeFetch(start: string): Promise<Response> {
  let url = start;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    await assertPublicHttps(url);
    const res = await withTimeout(url);
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get('location');
      if (!next) return res;
      url = new URL(next, url).toString();
      continue;
    }
    return res;
  }
  throw new Error('too-many-redirects');
}

/**
 * TradingView'ün ekran görüntüsü bağlantısından resmin adresini kurar.
 *
 * tradingview.com/x/ABC123/  →  s3.tradingview.com/a/ABC123.png
 *
 * Klasör kimliğin ilk harfinin küçüğü. Bu kalıbı tahmin etmedik, gerçek
 * bağlantılarla doğruladık — ama yine de tek yol değil: tutmazsa aşağıdaki
 * og:image yolu devreye giriyor.
 */
export function tradingViewImage(u: URL): string | null {
  if (!/(^|\.)tradingview\.com$/i.test(u.hostname)) return null;
  const m = u.pathname.match(/^\/x\/([A-Za-z0-9]{6,20})\/?$/);
  if (!m) return null;
  const id = m[1];
  return `https://s3.tradingview.com/${id[0].toLowerCase()}/${id}.png`;
}

/** Sayfanın og:image etiketi — çoğu görsel servisi bunu doğru doldurur. */
export function ogImage(html: string, base: string): string | null {
  const m = html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]*>/i);
  if (!m) return null;
  const c = m[0].match(/content=["']([^"']+)["']/i);
  if (!c) return null;
  try { return new URL(c[1], base).toString(); } catch { return null; }
}

async function readImage(res: Response): Promise<{ base64: string; contentType: string } | null> {
  const type = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!OK_TYPES.has(type)) return null;
  const declared = Number(res.headers.get('content-length') || 0);
  if (declared > MAX_BYTES) throw new Error('too-large');
  const buf = Buffer.from(await res.arrayBuffer());
  // Sunucu uzunluğu yalan söylemiş olabilir; indirdikten sonra da bakıyoruz.
  if (buf.length > MAX_BYTES) throw new Error('too-large');
  return { base64: buf.toString('base64'), contentType: type };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });

  const userId = await userFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'unauthorized' });

  const raw = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
  if (!raw) return res.status(400).json({ error: 'no-url' });

  try {
    const u = await assertPublicHttps(raw);

    // 1) TradingView bağlantısıysa resmin adresi doğrudan kurulabiliyor.
    const tv = tradingViewImage(u);
    if (tv) {
      const r = await safeFetch(tv);
      if (r.ok) {
        const img = await readImage(r);
        if (img) return res.status(200).json(img);
      }
    }

    // 2) Adres zaten bir resme işaret ediyor olabilir.
    const first = await safeFetch(u.toString());
    if (!first.ok) return res.status(422).json({ error: 'fetch-failed', status: first.status });
    const direct = await readImage(first.clone());
    if (direct) return res.status(200).json(direct);

    // 3) Değilse sayfanın önizleme görselini arıyoruz.
    const html = (await first.text()).slice(0, 400_000);
    const og = ogImage(html, u.toString());
    if (!og) return res.status(422).json({ error: 'no-image' });

    const second = await safeFetch(og);
    if (!second.ok) return res.status(422).json({ error: 'fetch-failed', status: second.status });
    const img = await readImage(second);
    if (!img) return res.status(422).json({ error: 'no-image' });
    return res.status(200).json(img);
  } catch (e: any) {
    const known = ['bad-url', 'not-https', 'private-address', 'too-large', 'too-many-redirects'];
    const msg = known.includes(e?.message) ? e.message : 'failed';
    return res.status(msg === 'failed' ? 500 : 400).json({ error: msg });
  }
}

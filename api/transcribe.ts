import { verifyToken } from '@clerk/backend';

/**
 * Kaydedilmiş sesli notu yazıya çevirir.
 *
 * Tarayıcının yerleşik konuşma tanıması Chrome, Edge ve Safari'de çalışır;
 * Brave, Opera ve Firefox'ta ya hiç yoktur ya da görünüşte vardır ama sonuç
 * döndürmez (sesi Google'a göndermek için gereken anahtar o tarayıcılarda
 * yok). O tarayıcılarda sesi kaydedip burada Whisper'a veriyoruz.
 */

/** Vercel fonksiyon gövdesi en çok 4,5 MB; base64 şişmesiyle ~3 MB ses. */
const MAX_BASE64 = 4_000_000;

const LANGS = new Set(['tr', 'en', 'fa', 'ar', 'ru', 'es', 'pt', 'de', 'fr']);

/**
 * Whisper'a verilen ipucu. Model bunu önceki konuşma sayar ve bu yazımlara
 * yaslanır — "order bloğu" yerine Order Block, "çenç of karakter" yerine CHoCH.
 * Sınır 224 token; en sık geçen terimlerle sınırlı tutuyoruz.
 */
const HINT =
  'Order Block, FVG, CHoCH, BOS, MSS, Liquidity Sweep, Displacement, Premium, Discount, ' +
  'Stop Loss, Take Profit, Break Even, Risk/Reward, Long, Short, Swing High, Swing Low, ' +
  'HTF, LTF, Killzone, EURUSD, GBPUSD, XAUUSD, NAS100, US30.';

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

const EXT: Record<string, string> = {
  'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/x-m4a': 'm4a',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Groq çağrısı kota harcıyor; kimliği doğrulanmamış istek kabul etmeyiz.
  const userId = await userFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { audio, mime, language } = req.body || {};
  if (typeof audio !== 'string' || audio.length < 100) return res.status(400).json({ error: 'No audio' });
  if (audio.length > MAX_BASE64) return res.status(413).json({ error: 'Recording too long' });

  // "audio/webm;codecs=opus" gibi gelir; dosya uzantısı için yalnız türü alırız.
  const type = String(mime || '').split(';')[0].trim().toLowerCase();
  const ext = EXT[type];
  if (!ext) return res.status(415).json({ error: 'Unsupported audio type' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'GROQ_API_KEY is not set on the server' });

  const form = new FormData();
  form.append('file', new Blob([Buffer.from(audio, 'base64')], { type }), `note.${ext}`);
  form.append('model', 'whisper-large-v3-turbo');
  form.append('response_format', 'json');
  form.append('temperature', '0');
  form.append('prompt', HINT);
  if (LANGS.has(language)) form.append('language', language);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: `Groq ${response.status}`, detail: detail.slice(0, 200) });
    }
    const data = await response.json();
    const text = String(data?.text || '').trim();
    return res.status(200).json({ text });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed' });
  }
}

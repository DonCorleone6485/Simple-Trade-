import { verifyToken } from '@clerk/backend';

/**
 * Sesle yazdırılmış işlem notunu düzenli metne çevirir.
 *
 * Konuşma tanıma noktalama koymaz, cümleleri birleştirir, bazı kelimeleri
 * yanlış duyar. Burada yapılan iş yazım ve noktalama düzeltmek — anlatılanı
 * değiştirmek, süslemek ya da yorum katmak değil.
 *
 * Terimlerin bilinen yanlış duyulmaları istemciden geçerken zaten düzeltilir
 * (src/lib/tradingTerms.ts). Buradaki liste onun kaçırdıklarını toparlamak
 * için: doğru yazımı modele söyleyip başka bir yazıma kaymasını engelliyoruz.
 * İki liste elle aynı tutulur — biri regex tablosu, biri modele verilen ipucu.
 */
const GLOSSARY =
  'CHoCH, BOS, MSS, FVG, Inversion FVG, BPR, Order Block, Breaker Block, Mitigation Block, ' +
  'Rejection Block, Propulsion Block, BSL, SSL, ERL, IRL, Liquidity Sweep, Liquidity Void, ' +
  'Stop Hunt, Turtle Soup, Judas Swing, Silver Bullet, Displacement, OTE, PO3, SMT, Unicorn, ' +
  'Equilibrium, Premium, Discount, Dealing Range, Imbalance, Inducement, Equal Highs, Equal Lows, ' +
  'Swing High, Swing Low, PDH, PDL, NDOG, NWOG, Supply Zone, Demand Zone, POI, Killzone, HTF, LTF, ' +
  'Daily Bias, Order Flow, Breakout, Fakeout, Pullback, Retest, Divergence, Engulfing, Pin Bar, ' +
  'Stop Loss, Take Profit, Break Even, Trailing Stop, Risk/Reward, Drawdown, Slippage, Payout, ' +
  'Prop Firm, Win Rate, Profit Factor, RSI, MACD, EMA, VWAP, ATR, Fibonacci, NFP, CPI, FOMC';

const PROMPT: Record<string, string> = {
  tr: `Aşağıdaki metin bir trader'ın sesli olarak dikte ettiği işlem notudur.
Görevin SADECE şunlar:
- Yazım ve noktalama hatalarını düzelt, cümleleri düzgün ayır.
- Konuşma tanımanın yanlış duyduğu belli olan kelimeleri düzelt. Trading terimleri İngilizce ve şu yazımlarla kalsın: ${GLOSSARY}.
- Terim Türkçe çekime girmişse İngilizce hâline döndür, eki kesme işaretiyle bağla: "order bloğu" → "Order Block'u", "çençini gördüm" → "CHoCH'u gördüm", "efvegeye" → "FVG'ye". Terimi Türkçeleştirme, çevirme.
- "boş" kelimesi açıkça BOS (break of structure) yerine kullanılmışsa BOS yaz; gerçekten "boş" anlamındaysa dokunma.
- Harf harf söylenen kısaltmaları da tanı ve listedeki yazıma çevir: OB → Order Block, TP → Take Profit, SL → Stop Loss, RR → Risk/Reward, EQH → Equal Highs, EQL → Equal Lows.
- Gereksiz "şey", "yani", "işte" gibi dolgu sözcüklerini temizle.
- Uzun bir anlatım varsa paragraflara böl.

Yapmayacakların:
- Yeni bilgi ekleme, yorum yapma, tavsiye verme.
- Anlamı değiştirme, abartma, süsleme.
- Başlık, madde işareti ya da giriş cümlesi ekleme.

Sadece düzeltilmiş metni döndür, başka hiçbir şey yazma.

Metin:
`,
  en: `The text below is a trading note dictated out loud by a trader.
Your job is ONLY to:
- Fix spelling and punctuation, and break it into proper sentences.
- Correct words the speech recogniser clearly misheard. Keep trading terms in English, spelled exactly like this: ${GLOSSARY}.
- If a term was written phonetically or inflected, restore it ("change of character" → "CHoCH", "fair value gap" → "FVG").
- Expand spelled-out abbreviations to the same spellings: OB → Order Block, TP → Take Profit, SL → Stop Loss, RR → Risk/Reward.
- Remove filler words.
- Split long passages into paragraphs.

Do not:
- Add information, opinions or advice.
- Change the meaning, embellish, or dress it up.
- Add headings, bullets or an introduction.

Return only the corrected text and nothing else.

Text:
`,
};

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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Groq çağrısı bize para/kota maliyeti; kimliği doğrulanmamış istek kabul etmeyiz.
  const userId = await userFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { text, language } = req.body || {};
  if (typeof text !== 'string' || text.trim().length < 2) {
    return res.status(400).json({ error: 'No text' });
  }
  if (text.length > 6000) return res.status(413).json({ error: 'Text too long' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'GROQ_API_KEY is not set on the server' });

  const prompt = (PROMPT[language] || PROMPT.en) + text.trim();

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        // Düzeltme işi; yaratıcılık istemiyoruz.
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: `Groq ${response.status}`, detail: detail.slice(0, 200) });
    }

    const data = await response.json();
    const out = data?.choices?.[0]?.message?.content?.trim();
    if (!out) return res.status(502).json({ error: 'Empty response' });

    return res.status(200).json({ text: out });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed' });
  }
}

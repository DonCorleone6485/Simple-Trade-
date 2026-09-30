import { createClient } from '@supabase/supabase-js';

/**
 * Sunucu tarafı hata kaydı. Tarayıcı hataları zaten client_errors'a yazılıyor
 * (src/lib/errorLog.ts); bu, api/ fonksiyonlarının hatalarını aynı tabloya
 * kind 'server' ile yazar. Her fonksiyon `export default withErrorLog('ad', handler)`
 * ile sarılır.
 *
 * Kaydedilenler: fırlatılıp yakalanmamış hata (kullanıcıya 500 döner) ve
 * 5xx ile biten yanıt (hata metni gövdedeki "error" alanından). 4xx kaydedilmez:
 * yanlış istek, yetkisiz erişim gibi beklenen durumlar.
 * Aynı hata saatte bir kez yazılır; kaydederken hata olursa sessizce geçilir —
 * hata kaydı asla isteği bozmamalı.
 */
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'missing',
);
const recent = new Map<string, number>();

async function record(name: string, message: string, stack: string | undefined, req: any) {
  try {
    const msg = `[${name}] ${message}`.slice(0, 1000);
    const now = Date.now();
    if ((recent.get(msg) || 0) > now - 3600_000) return;
    recent.set(msg, now);
    if (recent.size > 200) recent.clear();
    const hourAgo = new Date(now - 3600_000).toISOString();
    const { count } = await supabase.from('client_errors')
      .select('id', { count: 'exact', head: true }).eq('kind', 'server').eq('message', msg).gte('created_at', hourAgo);
    if (count) return;
    await supabase.from('client_errors').insert({
      kind: 'server', message: msg, stack: stack ? stack.slice(0, 4000) : null,
      url: String(req?.url || '').split('?')[0].slice(0, 500) || null,
      user_agent: String(req?.headers?.['user-agent'] || '').slice(0, 400) || null,
    });
  } catch { /* kayıt hatası isteği bozmasın */ }
}

export function withErrorLog(name: string, handler: (req: any, res: any) => unknown) {
  return async (req: any, res: any) => {
    let errorBody = '';
    const json = res.json?.bind(res);
    if (json) res.json = (body: any) => { errorBody = String(body?.error ?? body?.message ?? ''); return json(body); };
    try {
      await handler(req, res);
      if (res.statusCode >= 500) await record(name, `HTTP ${res.statusCode}${errorBody ? `: ${errorBody}` : ''}`, undefined, req);
    } catch (e: any) {
      await record(name, String(e?.message || e || 'Unknown error'), e?.stack, req);
      if (!res.headersSent) res.status(500).json({ error: 'Internal error' });
    }
  };
}

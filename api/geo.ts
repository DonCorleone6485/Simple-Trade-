/**
 * Ziyaretçinin ülkesi.
 *
 * Vercel her isteğe IP'den çözdüğü ülke kodunu başlık olarak ekler; ayrı bir
 * servise ya da anahtara gerek yok. Yalnızca iki harflik ülke kodunu döneriz —
 * IP adresi ne saklanır ne de geri verilir.
 */
export default async function handler(req: any, res: any) {
  if (req.query?.health !== undefined) return health(res);
  const country =
    req.headers['x-vercel-ip-country'] ||
    req.headers['cf-ipcountry'] ||
    '';
  // Ülke isteğin kendisinden gelir; kenarda kısa süre önbelleklenebilir.
  res.setHeader('Cache-Control', 'public, max-age=600');
  res.status(200).json({ country: String(country).toUpperCase() });
}

/**
 * Sağlık kontrolü: /api/geo?health=1. Dışarıdaki bir izleme servisi (durum
 * sayfası) bunu dakikada bir çağırır: 200 ise sunucu fonksiyonları ve
 * veritabanı ayakta, 503 ise veritabanına ulaşılamıyor. Ayrı fonksiyon değil:
 * Vercel ücretsiz planda 12 sınırındayız. Veri döndürmez, yalnız durum.
 */
async function health(res: any) {
  const started = Date.now();
  let db = false;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
      process.env.SUPABASE_SERVICE_KEY!,
    );
    const { error } = await supabase.from('journals').select('id').limit(1);
    db = !error;
  } catch { /* db false kalır */ }
  res.setHeader('Cache-Control', 'no-store');
  res.status(db ? 200 : 503).json({ ok: db, db, ms: Date.now() - started });
}

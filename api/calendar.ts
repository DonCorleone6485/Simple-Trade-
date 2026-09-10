import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Ekonomik takvim.
 *
 * Kaynak ForexFactory'nin haftalık akışları: anahtar istemiyor, ücretsiz.
 * Tarayıcı bunları doğrudan çekemiyor (CORS), o yüzden buradan geçiyor.
 *
 * Akış yalnızca üç haftayı gösterir. Geçmiş işlemleri haberlerle eşleştirmek
 * için arşiv gerekiyor, o yüzden her çekişte gelenler veritabanına yazılıyor;
 * site kullanıldıkça geçmiş kendiliğinden birikiyor.
 */
const FEEDS = [
  'https://nfs.faireconomy.media/ff_calendar_lastweek.json',
  'https://nfs.faireconomy.media/ff_calendar_thisweek.json',
  'https://nfs.faireconomy.media/ff_calendar_nextweek.json',
];

async function refresh() {
  const rows: any[] = [];
  for (const url of FEEDS) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'SimpleTradingJournal/1.0' } });
      if (!r.ok) continue;
      const list = await r.json();
      if (!Array.isArray(list)) continue;
      for (const e of list) {
        const at = new Date(e.date);
        if (isNaN(at.getTime()) || !e.title || !e.country) continue;
        rows.push({
          at: at.toISOString(),
          currency: String(e.country),
          title: String(e.title),
          impact: e.impact || null,
          forecast: e.forecast || null,
          previous: e.previous || null,
        });
      }
    } catch { /* bir akış düşerse ötekiler yine gelsin */ }
  }
  if (rows.length > 0) {
    await supabase.from('calendar_events').upsert(rows, { onConflict: 'at,currency,title' });
  }
  return rows.length;
}

export default async function handler(req: any, res: any) {
  const { from, to, refresh: wantRefresh } = req.query || {};

  try {
    // Aralık istenmediyse bu haftayı gösteriyoruz demektir; akışı da tazeleriz.
    if (!from || wantRefresh === '1') await refresh();

    let query = supabase
      .from('calendar_events')
      .select('at, currency, title, impact, forecast, previous')
      .order('at', { ascending: true })
      .limit(2000);

    if (from) query = query.gte('at', new Date(String(from)).toISOString());
    if (to) query = query.lte('at', new Date(String(to)).toISOString());
    if (!from && !to) {
      const weekAgo = new Date(Date.now() - 3 * 86400_000);
      query = query.gte('at', weekAgo.toISOString());
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Aynı biçim: istemci `date` bekliyor.
    const events = (data || []).map((e: any) => ({
      title: e.title, country: e.currency, date: e.at,
      impact: e.impact || 'Low', forecast: e.forecast || '', previous: e.previous || '',
    }));

    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
    return res.status(200).json({ events });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed' });
  }
}

/**
 * Ekonomik takvim.
 *
 * Veri ForexFactory'nin haftalık akışından geliyor: anahtar istemiyor,
 * ücretsiz. Tarayıcıdan doğrudan çekemiyoruz (CORS), o yüzden buradan
 * geçiriyoruz — böylece kenarda önbelleğe de alınabiliyor.
 */
const FEED = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';

export default async function handler(_req: any, res: any) {
  try {
    const upstream = await fetch(FEED, {
      headers: { 'User-Agent': 'SimpleTradingJournal/1.0' },
    });
    if (!upstream.ok) {
      return res.status(502).json({ error: `Upstream ${upstream.status}` });
    }
    const data = await upstream.json();

    // Takvim saatte bir değişir; her ziyaretçi için yeniden çekmeye gerek yok.
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json({ events: data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed' });
  }
}

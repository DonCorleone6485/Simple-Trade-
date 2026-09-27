// deno-lint-ignore-file no-explicit-any
/**
 * Sekme kapalıyken gelen bildirimler (Web Push).
 *
 * Önceden haber ve seans bildirimleri yalnızca sitenin sekmesi açıkken
 * geliyordu (src/components/AlertRunner.tsx). Bu görev Supabase'de dakikada
 * bir çalışıyor (pg_cron → pg_net → bu fonksiyon) ve bildirimi açmış her
 * tarayıcıya zamanı gelen uyarıyı gönderiyor. Vercel'in ücretsiz planı
 * dakikalık görev çalıştırmıyor; o yüzden burada.
 *
 * Kurallar sitedekiyle aynı (src/lib/alerts.ts → dueAlerts): aynı anahtar,
 * aynı pencere. Anahtar bildirimin "tag"i de olduğu için sekme açıkken hem
 * sekme hem sunucu gönderse bile ekranda tek bildirim kalıyor.
 *
 * Gönderilenler aboneliğin 'fired' listesinde; ikinci kez gitmez. Tarayıcı
 * aboneliği iptal ettiyse (404/410) satır silinir.
 *
 * Saatte bir ekonomik takvimi de tazeler: siteye kimse girmese bile gelecek
 * haftanın haberleri veritabanında olsun.
 */
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { SESSIONS, sessionState } from './sessions.ts';

const L: Record<string, { news: string; opening: string; inMin: string }> = {
  tr: { news: 'Önemli haber yaklaşıyor', opening: 'açılıyor', inMin: '{n} dakika sonra' },
  en: { news: 'High-impact release coming', opening: 'is opening', inMin: 'in {n} minutes' },
  fa: { news: 'خبر مهم نزدیک است', opening: 'باز می‌شود', inMin: '{n} دقیقه دیگر' },
  ar: { news: 'خبر مهم يقترب', opening: 'يفتح', inMin: 'بعد {n} دقيقة' },
  ru: { news: 'Скоро важная новость', opening: 'открывается', inMin: 'через {n} мин.' },
  es: { news: 'Se acerca una noticia importante', opening: 'está abriendo', inMin: 'en {n} minutos' },
  pt: { news: 'Aproxima-se uma notícia importante', opening: 'está a abrir', inMin: 'daqui a {n} minutos' },
  de: { news: 'Wichtige Nachricht steht an', opening: 'öffnet', inMin: 'in {n} Minuten' },
  fr: { news: 'Annonce importante imminente', opening: 'ouvre', inMin: 'dans {n} minutes' },
};

const FEEDS = [
  'https://nfs.faireconomy.media/ff_calendar_thisweek.json',
  'https://nfs.faireconomy.media/ff_calendar_nextweek.json',
];

const dayStamp = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

async function refreshCalendar(sb: any) {
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
          at: at.toISOString(), currency: String(e.country), title: String(e.title),
          impact: e.impact || null, forecast: e.forecast || null, previous: e.previous || null,
        });
      }
    } catch { /* bir akış düşerse öteki yine gelsin */ }
  }
  if (rows.length) await sb.from('calendar_events').upsert(rows, { onConflict: 'at,currency,title' });
}

Deno.serve(async req => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) return new Response('Unauthorized', { status: 401 });

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const now = new Date();
  if (now.getUTCMinutes() === 0) await refreshCalendar(sb);

  const { data: subs } = await sb.from('push_subscriptions').select('endpoint, p256dh, auth, settings, language, fired');
  const active = (subs || []).filter((s: any) => s.settings?.news || s.settings?.session);
  if (!active.length) return Response.json({ subs: 0, sent: 0 });

  webpush.setVapidDetails('mailto:support@simpletradejournal.io', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);

  const horizon = Math.max(...active.map((s: any) => Number(s.settings?.newsMinutes) || 60), 15);
  const { data: events } = await sb.from('calendar_events')
    .select('at, title, impact')
    .gt('at', now.toISOString())
    .lte('at', new Date(now.getTime() + horizon * 60_000).toISOString())
    .in('impact', ['High', 'Medium']);

  let sent = 0;
  for (const s of active) {
    const st = s.settings || {};
    const t = L[s.language] || L.en;
    const inMin = (m: number) => t.inMin.replace('{n}', String(m));
    const seen = new Set<string>(s.fired || []);
    const due: { key: string; title: string; body: string; target: string }[] = [];

    if (st.news) {
      const scope = st.newsMedium ? ['High', 'Medium'] : ['High'];
      const window = Number(st.newsMinutes) || 60;
      for (const e of events || []) {
        if (!scope.includes(e.impact)) continue;
        const left = Math.round((new Date(e.at).getTime() - now.getTime()) / 60000);
        if (left <= 0 || left > window) continue;
        const key = `news:${e.at}:${e.title}`;
        if (!seen.has(key)) due.push({ key, title: t.news, body: `${e.title} · ${inMin(left)}`, target: 'news' });
      }
    }
    if (st.session) {
      const window = Number(st.sessionMinutes) || 15;
      for (const sess of SESSIONS) {
        const ss = sessionState(sess, now);
        if (ss.open || ss.weekend) continue;
        const left = Math.round(ss.left * 60);
        if (left <= 0 || left > window) continue;
        // Anahtardaki gün damgası sitedekiyle aynı olsun diye kullanıcının
        // gününe değil sunucu gününe bakıyor; ikisi farklıysa en kötü ihtimalle
        // ekranda iki bildirim görünür, kaçırılan bildirim olmaz.
        const key = `session:${sess.key}:${dayStamp(now)}`;
        if (!seen.has(key)) due.push({ key, title: `${sess.en} ${t.opening}`, body: inMin(left), target: 'sessions' });
      }
    }
    if (!due.length) continue;

    const fired: string[] = [];
    for (const a of due) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: a.title, body: a.body, tag: a.key, target: a.target }),
          { TTL: 600, urgency: 'high' },
        );
        fired.push(a.key);
        sent++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await sb.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
          break;
        }
        console.error('push', err?.statusCode, err?.body || err?.message);
      }
    }
    if (fired.length) {
      await sb.from('push_subscriptions').update({ fired: [...(s.fired || []), ...fired].slice(-100) }).eq('endpoint', s.endpoint);
    }
  }
  return Response.json({ subs: active.length, sent });
});

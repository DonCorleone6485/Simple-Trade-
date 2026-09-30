import { createClient } from '@supabase/supabase-js';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { timingSafeEqual } from 'crypto';
import { emailEnabled, sendContactMessage, sendEmail, sendInternal, sendRendered, toLang, unsubscribeToken } from './_email.js';
import { renderDigest, weekStats, type DigestTrade } from './_digest.js';
import { withErrorLog } from './_log';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * E-postayla ilgili üç uç tek dosyada — Vercel'in ücretsiz planı en fazla
 * 12 fonksiyona izin veriyor:
 *   /api/emails?u=…&t=…      → abonelikten çıkma (aşağıda unsubscribe)
 *   POST /api/emails         → sitedeki iletişim formu (aşağıda contact)
 *   GET /api/emails          → günlük gönderim görevi (vercel.json → crons)
 *
 * Günde bir kez çalışan otomatik e-postalar:
 *
 * - Hoş geldin: normalde kayıtta api/trial.ts gönderiyor; o an gidemediyse
 *   (Resend'e ulaşılamadı, anahtar henüz yoktu) son 3 günde açılan hesaplara
 *   burada yeniden deneniyor. Daha eskilere gitmiyor — haftalar sonra gelen
 *   "hoş geldin" tuhaf olur.
 * - Deneme bitiyor: bitişe 36 saatten az kalmışsa. Görev 24 saatte bir
 *   çalıştığı için her deneme bu pencereye bir kez düşüyor.
 * - Deneme bitti: son 3 gün içinde bitmişse.
 * - Haftalık özet: cumartesi (bütçe yetmezse pazar) — piyasa cuma
 *   kapanınca biten haftanın işlemleri. Yalnız o hafta kapanmış işlemi olana (bkz. _digest.ts).
 *
 * Her postanın "gönderildi" işareti ayrı sütunda; ikinci kez gitmez. Uç
 * herkese açık olsa bile zararsız: yalnızca zamanı gelmiş postalar gidiyor.
 * Yine de CRON_SECRET tanımlıysa Vercel'in gönderdiği anahtar aranıyor.
 *
 * Ödeme sistemi açılınca "deneme bitiyor/bitti" metinlerine Pro'ya geçiş
 * bağlantısı eklenmeli (şimdilik satın alınamıyor, o yüzden yok).
 */
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** Ücretsiz Resend planı günde 100 posta; payı hoş geldine bırakalım. */
const MAX_PER_RUN = 80;

/**
 * Postalardaki "abonelikten çık" bağlantısı. GET: bağlantıya tıklayan kişi.
 * POST: Gmail/Yahoo'nun "tek tıkla çık" düğmesi (List-Unsubscribe-Post).
 * Giriş gerekmiyor; bağlantıdaki özet (t) yalnızca sunucunun anahtarıyla
 * üretilebildiği için başkası başkasını çıkaramıyor. Yalnızca otomatik
 * hatırlatmalar duruyor; hoş geldin ve ileride ödeme/şifre bildirimleri değil.
 */
const DONE: Record<string, [string, string]> = {
  tr: ['Abonelikten çıktın', 'Artık deneme hatırlatması gibi otomatik e-postalar almayacaksın.'],
  en: ['You\'re unsubscribed', 'You won\'t receive automatic emails such as trial reminders any more.'],
  fa: ['اشتراکت لغو شد', 'دیگر ایمیل‌های خودکار مثل یادآوری دوره آزمایشی دریافت نمی‌کنی.'],
  ar: ['تم إلغاء اشتراكك', 'لن تصلك بعد الآن رسائل تلقائية مثل تذكير التجربة.'],
  ru: ['Вы отписались', 'Автоматические письма, например напоминания о пробном периоде, больше приходить не будут.'],
  es: ['Te has dado de baja', 'Ya no recibirás correos automáticos como los recordatorios de la prueba.'],
  pt: ['Subscrição cancelada', 'Já não vais receber e-mails automáticos, como lembretes do teste.'],
  de: ['Du bist abgemeldet', 'Du erhältst keine automatischen E-Mails wie Test-Erinnerungen mehr.'],
  fr: ['Désabonnement effectué', 'Vous ne recevrez plus d\'e-mails automatiques comme les rappels d\'essai.'],
};

function valid(userId: string, t: string): boolean {
  const want = Buffer.from(unsubscribeToken(userId));
  const got = Buffer.from(t);
  return !!userId && got.length === want.length && timingSafeEqual(got, want);
}

async function unsubscribe(req: any, res: any) {
  const userId = String(req.query?.u || '');
  const t = String(req.query?.t || '');
  if (!valid(userId, t)) return res.status(400).send('Invalid link');

  const { data } = await supabase.from('users').update({ emails_opt_out: true }).eq('user_id', userId).select('language').maybeSingle();
  if (req.method === 'POST') return res.status(200).end();

  const lang = toLang(data?.language);
  const [title, text] = DONE[lang];
  const rtl = lang === 'fa' || lang === 'ar';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`<!doctype html><html lang="${lang}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d0e1a;color:#fff;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:16px">
<main style="max-width:420px;text-align:center"><h1 style="font-size:22px;font-weight:600;margin:0 0 12px">${title}</h1>
<p style="font-size:15px;line-height:1.6;color:rgba(255,255,255,.65);margin:0 0 24px">${text}</p>
<a href="https://www.simpletradejournal.io/" style="color:#a78bfa;font-size:14px">simpletradejournal.io</a></main></body></html>`);
}

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

/**
 * İletişim formu. Giriş yapmışsa e-posta Clerk'ten okunuyor (formdakine
 * güvenmiyoruz); değilse formdaki adres. Botlara karşı iki basit önlem:
 * insanın görmediği bir alan (website) boş olmalı ve form açıldıktan en az
 * 3 saniye sonra gönderilmiş olmalı. Resend'in günlük sınırı da üst sınır.
 */
async function contact(req: any, res: any) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const message = String(body.message || '').trim();
  const name = String(body.name || '').trim().slice(0, 80);
  if (body.website) return res.status(200).json({ ok: true }); // bot: sessizce yut
  if (typeof body.openedAt !== 'number' || Date.now() - body.openedAt < 3000) return res.status(400).json({ error: 'too_fast' });
  if (message.length < 5 || message.length > 5000) return res.status(400).json({ error: 'message' });

  let email = String(body.email || '').trim().slice(0, 200);
  let userId = '';
  const auth = req.headers.authorization || '';
  const secret = process.env.CLERK_SECRET_KEY;
  if (auth.startsWith('Bearer ') && secret) {
    try {
      userId = (await verifyToken(auth.slice(7), { secretKey: secret })).sub || '';
      if (userId) {
        const u = await createClerkClient({ secretKey: secret }).users.getUser(userId);
        email = u.emailAddresses.find(e => e.id === u.primaryEmailAddressId)?.emailAddress || email;
      }
    } catch { /* oturum yoksa formdaki adresle devam */ }
  }
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'email' });

  const ok = await sendContactMessage({
    email, message, name: name || undefined, userId: userId || undefined,
    lang: String(body.language || '').slice(0, 5) || undefined,
    page: String(body.page || '').slice(0, 200) || undefined,
  });
  return ok ? res.status(200).json({ ok: true }) : res.status(502).json({ error: 'send' });
}

/**
 * İçerik güvenlik politikasının (vercel.json, şimdilik Report-Only) ihlal
 * raporları. Tarayıcı engellemiyor, yalnız bildiriyor: politika sıkılaşmadan
 * önce Clerk, Supabase ve fontların gerçekte nelere ihtiyaç duyduğunu görmek
 * için. client_errors'a kind 'csp' ile yazılır, günlük hata özetine girer.
 * Ayrı fonksiyon değil: Vercel ücretsiz planda 12 sınırındayız.
 */
async function cspReport(req: any, res: any) {
  // Tarayıcı application/csp-report ya da application/reports+json gönderiyor;
  // Vercel bunları ayrıştırmıyor, gövde akıştan okunur.
  const type = String(req.headers['content-type'] || '');
  let raw: any;
  try {
    if (/^application\/json/.test(type)) raw = req.body;
    else {
      const chunks: Buffer[] = [];
      for await (const c of req) chunks.push(Buffer.from(c));
      raw = Buffer.concat(chunks).toString('utf8').slice(0, 64_000);
    }
    if (typeof raw === 'string') raw = JSON.parse(raw);
  } catch { return res.status(204).end(); }
  // Eski biçim {"csp-report": {...}}; Reporting API [{type, body}, ...].
  const reports: any[] = Array.isArray(raw)
    ? raw.filter(r => r?.type === 'csp-violation').map(r => r.body)
    : [raw?.['csp-report']];
  const rows = [];
  for (const r of reports.slice(0, 5)) {
    if (!r || typeof r !== 'object') continue;
    const directive = String(r.effectiveDirective || r['effective-directive'] || r['violated-directive'] || '').split(' ')[0];
    const blocked = String(r.blockedURL || r['blocked-uri'] || '');
    const source = String(r.sourceFile || r['source-file'] || '');
    // Tarayıcı eklentileri sayfaya kendi kodunu sokuyor; bizim sorunumuz değil.
    if (/extension:/.test(blocked) || /extension:/.test(source)) continue;
    let where = blocked || 'inline';
    try { where = new URL(blocked).origin; } catch { /* inline, eval, data… */ }
    let path = '';
    try { path = new URL(String(r.documentURL || r['document-uri'] || '')).pathname; } catch { /* yok */ }
    rows.push({
      kind: 'csp',
      message: `CSP ${directive}: ${where}`.slice(0, 1000),
      stack: JSON.stringify(r).slice(0, 4000),
      url: path.slice(0, 500) || null,
      user_agent: String(req.headers['user-agent'] || '').slice(0, 400) || null,
    });
  }
  // Aynı ihlal her sayfa açılışında yeniden gelir; saatte bir kez yazmak yeter.
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  for (const row of rows) {
    const { count } = await supabase.from('client_errors')
      .select('id', { count: 'exact', head: true })
      .eq('kind', 'csp').eq('message', row.message).gte('created_at', hourAgo);
    if (!count) await supabase.from('client_errors').insert(row);
  }
  return res.status(204).end();
}

async function handler(req: any, res: any) {
  if (req.query?.u) return unsubscribe(req, res);
  if (req.query?.csp && req.method === 'POST') return cspReport(req, res);
  if (req.method === 'POST') return contact(req, res);
  if (req.method !== 'GET') return res.status(405).end();
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'Unauthorized' });
  if (!emailEnabled()) return res.status(200).json({ skipped: 'RESEND_API_KEY is not set' });
  const clerkKey = process.env.CLERK_SECRET_KEY;
  if (!clerkKey) return res.status(503).json({ error: 'CLERK_SECRET_KEY is not set on the server' });
  const clerk = createClerkClient({ secretKey: clerkKey });

  const now = Date.now();
  const iso = (t: number) => new Date(t).toISOString();
  const cols = 'user_id, language, timezone, trial_ends_at';

  const [welcome, ending, ended] = await Promise.all([
    supabase.from('users').select(cols)
      .is('welcome_sent_at', null).eq('email_disposable', false)
      .gte('email_checked_at', iso(now - 3 * DAY)).limit(MAX_PER_RUN),
    supabase.from('users').select(cols)
      .is('trial_reminder_sent_at', null).eq('emails_opt_out', false)
      .or('has_paid.is.null,has_paid.eq.false').is('trial_denied', null)
      .gt('trial_ends_at', iso(now)).lte('trial_ends_at', iso(now + 36 * HOUR)).limit(MAX_PER_RUN),
    supabase.from('users').select(cols)
      .is('trial_ended_sent_at', null).eq('emails_opt_out', false)
      .or('has_paid.is.null,has_paid.eq.false').is('trial_denied', null)
      .lte('trial_ends_at', iso(now)).gt('trial_ends_at', iso(now - 3 * DAY)).limit(MAX_PER_RUN),
  ]);

  const jobs: { kind: 'welcome' | 'trialEnding' | 'trialEnded'; column: string; rows: any[] }[] = [
    { kind: 'welcome', column: 'welcome_sent_at', rows: welcome.data || [] },
    { kind: 'trialEnding', column: 'trial_reminder_sent_at', rows: ending.data || [] },
    { kind: 'trialEnded', column: 'trial_ended_sent_at', rows: ended.data || [] },
  ];

  const counts: Record<string, number> = {};
  let budget = MAX_PER_RUN;
  for (const job of jobs) {
    counts[job.kind] = 0;
    for (const row of job.rows) {
      if (budget <= 0) break;
      let email = '';
      try {
        const u = await clerk.users.getUser(row.user_id);
        email = u.emailAddresses.find(e => e.id === u.primaryEmailAddressId)?.emailAddress || u.emailAddresses[0]?.emailAddress || '';
      } catch { continue; /* hesap silinmiş olabilir */ }
      if (!email) continue;
      budget--;
      const ok = await sendEmail(job.kind, email, {
        userId: row.user_id, lang: toLang(row.language), date: row.trial_ends_at || undefined, timeZone: row.timezone,
      });
      if (ok) {
        await supabase.from('users').update({ [job.column]: new Date().toISOString() }).eq('user_id', row.user_id);
        counts[job.kind]++;
      }
    }
  }
  counts.weekly = await weeklyDigests(clerk, now, budget);

  // Günlük hata özeti: son 24 saatte tarayıcılarda hata çıktıysa bize tek
  // posta (bkz. src/lib/errorLog.ts). Hata yoksa hiçbir şey gitmez.
  const errors = await errorDigest(now);

  // MetaTrader anahtarı temizliği (Vercel'in 12 fonksiyon sınırı yüzünden
  // ayrı görev değil, buraya ekli):
  // • Oluşturulup 7 günde hiçbir hesaba bağlanmamış anahtarlar silinir —
  //   "Anahtar Oluştur"a birkaç kez basınca biriken, hiç kullanılmayanlar.
  //   last_used_at şartı, hesap bilgisi göndermeyen eski EA'ları korur.
  // • Yenisiyle değiştirilmiş anahtarlar 7 gün boyunca listede "değiştirildi"
  //   diye görünür, sonra silinir.
  const weekAgo = new Date(now - 7 * 86400000).toISOString();
  const { data: unused } = await supabase.from('api_keys').delete()
    .is('mt_fingerprint', null).is('last_used_at', null).eq('revoked', false)
    .lt('created_at', weekAgo).select('id');
  const { data: replaced } = await supabase.from('api_keys').delete()
    .not('replaced_by', 'is', null).lt('revoked_at', weekAgo).select('id');

  return res.status(200).json({
    sent: counts, errors,
    keysRemoved: { unused: (unused || []).length, replaced: (replaced || []).length },
  });
}

/**
 * Haftalık özet. Forex cuma akşamı kapandığı için cumartesi gönderilir,
 * günlük 80 postalık bütçe yetmediyse kalanlar pazar. Pencere geçen
 * cumartesi 00:00 UTC'den bu cumartesi 00:00'a: hafta sonu işlem yapan
 * (kripto) kullanıcıların işlemleri de bir haftaya düşer, arada kaybolmaz.
 * weekly_digest_sent_at aynı haftaya ikinci postayı engeller.
 */
async function weeklyDigests(clerk: ReturnType<typeof createClerkClient>, now: number, budget: number): Promise<number> {
  const today = new Date(now);
  const dow = today.getUTCDay(); // 6 cumartesi, 0 pazar
  if ((dow !== 6 && dow !== 0) || budget <= 0) return 0;
  const weekEnd = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (dow === 0 ? 1 : 0));
  const weekStart = weekEnd - 7 * DAY;
  const prevStart = weekStart - 7 * DAY;
  const iso = (t: number) => new Date(t).toISOString();

  const { data: trades } = await supabase.from('trades')
    .select('user_id, date, symbol, result, reward, risk')
    .gte('date', iso(prevStart)).lt('date', iso(weekEnd))
    .or('locked.is.null,locked.eq.false').limit(20000);
  const byUser = new Map<string, { week: DigestTrade[]; prev: DigestTrade[] }>();
  for (const t of trades || []) {
    const g = byUser.get(t.user_id) || { week: [], prev: [] };
    (new Date(t.date).getTime() >= weekStart ? g.week : g.prev).push(t);
    byUser.set(t.user_id, g);
  }
  const active = [...byUser.entries()].filter(([, g]) => g.week.some(t => !!t.result)).map(([id]) => id);
  if (!active.length) return 0;

  const { data: users } = await supabase.from('users')
    .select('user_id, language, timezone, currency, weekly_digest_sent_at')
    .in('user_id', active.slice(0, 500)).eq('emails_opt_out', false)
    .or(`weekly_digest_sent_at.is.null,weekly_digest_sent_at.lt."${iso(weekEnd)}"`);

  let sent = 0;
  for (const u of users || []) {
    if (sent >= budget) break;
    const g = byUser.get(u.user_id)!;
    const stats = weekStats(g.week, g.prev);
    if (!stats) continue;
    let email = '';
    try {
      const cu = await clerk.users.getUser(u.user_id);
      email = cu.emailAddresses.find(e => e.id === cu.primaryEmailAddressId)?.emailAddress || cu.emailAddresses[0]?.emailAddress || '';
    } catch { continue; }
    if (!email) continue;
    const m = renderDigest(stats, {
      lang: toLang(u.language), userId: u.user_id, currency: u.currency, timeZone: u.timezone,
      from: new Date(weekStart), to: new Date(weekEnd - 1),
    });
    if (await sendRendered('weekly', email, m)) {
      await supabase.from('users').update({ weekly_digest_sent_at: new Date().toISOString() }).eq('user_id', u.user_id);
      sent++;
    }
  }
  return sent;
}

async function errorDigest(now: number): Promise<number> {
  const { data } = await supabase.from('client_errors')
    .select('message, kind, url, user_id, created_at')
    .gte('created_at', new Date(now - DAY).toISOString())
    .order('created_at', { ascending: false }).limit(500);
  if (!data?.length) return 0;
  const groups = new Map<string, { n: number; users: Set<string>; url: string; kind: string }>();
  for (const e of data) {
    const g = groups.get(e.message) || { n: 0, users: new Set<string>(), url: e.url || '', kind: e.kind || '' };
    g.n++;
    g.users.add(e.user_id || 'anon');
    groups.set(e.message, g);
  }
  const lines = [...groups.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 15)
    .map(([msg, g]) => `• ${g.n}× (${g.users.size} kişi, ${g.kind}) ${msg}\n  ${g.url}`);
  await sendInternal(
    `[Hata özeti] Son 24 saatte ${data.length} hata`,
    `Son 24 saatte kullanıcı tarayıcılarında ${data.length} hata kaydedildi (${groups.size} farklı).\n\n${lines.join('\n\n')}\n\nAyrıntı: Supabase → client_errors tablosu.`,
  );
  return data.length;
}

export default withErrorLog('emails', handler);

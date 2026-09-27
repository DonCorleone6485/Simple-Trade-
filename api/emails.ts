import { createClient } from '@supabase/supabase-js';
import { createClerkClient } from '@clerk/backend';
import { timingSafeEqual } from 'crypto';
import { emailEnabled, sendEmail, toLang, unsubscribeToken } from './_email.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Otomatik e-postaların iki ucu tek dosyada — Vercel'in ücretsiz planı en
 * fazla 12 fonksiyona izin veriyor:
 *   /api/emails?u=…&t=…  → abonelikten çıkma (aşağıda unsubscribe)
 *   /api/emails          → günlük gönderim görevi (vercel.json → crons)
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

export default async function handler(req: any, res: any) {
  if (req.query?.u) return unsubscribe(req, res);
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
  return res.status(200).json({ sent: counts });
}

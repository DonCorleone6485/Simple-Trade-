import { createClient } from '@supabase/supabase-js';
import { createClerkClient } from '@clerk/backend';
import { emailEnabled, sendEmail, toLang } from './_email.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Günde bir kez (vercel.json → crons) çalışan otomatik e-postalar.
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

export default async function handler(req: any, res: any) {
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

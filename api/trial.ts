import { createClient } from '@supabase/supabase-js';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { isDisposableEmailDomain } from 'disposable-email-domains-js';
import { createHash } from 'crypto';
import { sendEmail, toLang } from './_email.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Hesap kontrolü ve deneme süresi.
 *
 * action: 'check' — e-postayı Clerk'ten okuyup tek kullanımlık mı diye
 * bakar, sonucu users satırına yazar. Tek kullanımlık e-postayla açılan hesap
 * siteyi hiç kullanamaz, ücretsiz planı da: ileride e-postayla ulaşamayacağımız
 * bir kullanıcıyı ağırlamanın anlamı yok. Uygulama bu işareti görünce "gerçek
 * bir e-postayla kayıt ol" ekranında durur.
 *
 * action: 'start' — 3 günlük Pro denemesini başlatır. Kayıtta kendiliğinden
 * başlamıyor: kullanıcı önce Ücretsiz'i kullanıyor, bir sınıra ilk
 * takıldığında "3 gün ücretsiz dene, kart gerekmez" teklifini görüyor ve
 * kendisi başlatıyor. Her hesaba bir kez; kart istenmez; bitince kendiliğinden
 * Ücretsiz'e düşer.
 *
 * Denemenin öbür koruması api/ingest.ts'te: aynı MetaTrader hesabı başka bir
 * hesabın denemesinde kullanıldıysa deneme biter.
 *
 * Varsayılan 'check': eski sürüm sayfa bu uca gövdesiz istek atıp denemeyi
 * kendiliğinden başlatıyordu; önbellekte kalmış o sayfa artık başlatamasın.
 */
const TRIAL_DAYS = 3;

/** pro_until saat dilimsiz tutuluyor ve UTC yazılıyor; öyle okunmalı. */
const utc = (s: string) => new Date(/(Z|[+-]\d\d:?\d\d)$/.test(s) ? s : s + 'Z');

/** "x.mailinator.com" gibi alt alan adları da yakalansın. */
function isDisposable(email: string): boolean {
  const domain = email.split('@')[1]?.trim().toLowerCase() || '';
  const parts = domain.split('.');
  for (let i = 0; i < parts.length - 1; i++) {
    if (isDisposableEmailDomain(parts.slice(i).join('.'))) return true;
  }
  return false;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) return res.status(503).json({ error: 'CLERK_SECRET_KEY is not set on the server' });

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  let userId = '';
  try {
    const claims = await verifyToken(token, { secretKey: secret });
    userId = claims.sub || '';
  } catch { /* aşağıda 401 */ }
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const action = body.action === 'start' ? 'start' : 'check';
  // Otomatik e-postalar bu dilde gidiyor; tarayıcı her açılışta da günceller.
  const language = body.language ? toLang(body.language) : null;

  const { data: row } = await supabase
    .from('users')
    .select('is_pro, pro_until, has_paid, trial_started_at, email_checked_at, email_disposable')
    .eq('user_id', userId)
    .maybeSingle();

  // E-posta kontrolü: bir kez yapılıyor, deneme başlatılırken de şart.
  let disposable = !!row?.email_disposable;
  if (!row?.email_checked_at) {
    let email = '';
    try {
      const user = await createClerkClient({ secretKey: secret }).users.getUser(userId);
      email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
        || user.emailAddresses[0]?.emailAddress || '';
    } catch {
      // Clerk'e ulaşılamadı: kimseyi yanlışlıkla engellemeyelim, sonra yeniden denenir.
      return res.status(502).json({ error: 'Could not read the account' });
    }
    disposable = !!email && isDisposable(email);
    await supabase.from('users').upsert(
      { user_id: userId, email_checked_at: new Date().toISOString(), email_disposable: disposable, ...(language ? { language } : {}) },
      { onConflict: 'user_id' },
    );
    // Hesabı ilk kez görüyoruz: hoş geldin postası. Gitmezse (Resend'e
    // ulaşılamadı, anahtar yok) günlük görev (api/emails.ts) yeniden dener.
    if (email && !disposable) {
      const sent = await sendEmail('welcome', email, { userId, lang: language || 'en' });
      if (sent) await supabase.from('users').update({ welcome_sent_at: new Date().toISOString() }).eq('user_id', userId);
    }
  }

  if (action === 'check') return res.status(200).json({ blocked: disposable });

  // ── Denemeyi başlat ──
  if (disposable) return res.status(403).json({ error: 'disposable' });
  if (row?.trial_started_at) return res.status(409).json({ error: 'already_used' });
  const proActive = row?.is_pro && (!row.pro_until || utc(row.pro_until) > new Date());
  if (row?.has_paid || proActive) return res.status(409).json({ error: 'already_pro' });

  // Aynı e-posta daha önce deneme kullandıysa (hesap silinip yeniden
  // açılmış) ikinci kez verilmez. Açık e-posta değil, özeti tutuluyor.
  let emailHash = '';
  try {
    const user = await createClerkClient({ secretKey: secret }).users.getUser(userId);
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
      || user.emailAddresses[0]?.emailAddress || '';
    emailHash = email ? createHash('sha256').update(email.trim().toLowerCase()).digest('hex') : '';
  } catch {
    return res.status(502).json({ error: 'Could not read the account' });
  }
  if (emailHash) {
    const { data: used } = await supabase.from('used_trials').select('email_hash').eq('email_hash', emailHash).maybeSingle();
    if (used) return res.status(409).json({ error: 'already_used' });
    await supabase.from('used_trials').insert({ email_hash: emailHash });
  }

  const now = new Date();
  const endsAt = new Date(now.getTime() + TRIAL_DAYS * 86_400_000);
  await supabase.from('users').upsert(
    {
      user_id: userId,
      is_pro: true,
      // pro_until saat dilimsiz bir sütun; UTC olarak yazıyoruz.
      pro_until: endsAt.toISOString(),
      trial_started_at: now.toISOString(),
      trial_ends_at: endsAt.toISOString(),
    },
    { onConflict: 'user_id' },
  );
  return res.status(200).json({ status: 'trial', endsAt: endsAt.toISOString() });
}

import { createClient } from '@supabase/supabase-js';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { isDisposableEmailDomain } from 'disposable-email-domains-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Deneme süresi.
 *
 * Her hesap bir kez, kayıttan sonraki ilk açılışta 3 gün tam Pro alır; süre
 * bitince kendiliğinden Ücretsiz'e düşer. Kart istenmez.
 *
 * Bir kez verildiği trial_started_at'ten bilinir — verilmese bile (geçici
 * e-posta) o sütun dolar ki her açılışta yeniden denenmesin.
 *
 * İki kötüye kullanım önlemi var:
 *   1. Tek kullanımlık e-posta servisleriyle açılan hesaba deneme verilmez.
 *      Ücretsiz plan yine açık; yalnızca deneme yok.
 *   2. Deneme sırasında bağlanan MetaTrader hesabı daha önce başka bir
 *      hesabın denemesinde kullanıldıysa deneme biter (bkz. api/ingest.ts).
 *      E-posta değiştirmek kolay, MT hesabı değiştirmek zor.
 *
 * Karar sunucuda veriliyor: e-posta Clerk'ten okunuyor, tarayıcının
 * söylediğine bakılmıyor.
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

  const { data: row } = await supabase
    .from('users')
    .select('is_pro, pro_until, has_paid, trial_started_at, trial_ends_at, trial_denied')
    .eq('user_id', userId)
    .maybeSingle();

  // Deneme bir kez: verildiyse ya da reddedildiyse olduğu gibi bildir.
  if (row?.trial_started_at) {
    return res.status(200).json({ status: row.trial_denied ? 'denied' : 'used', endsAt: row.trial_ends_at, reason: row.trial_denied });
  }

  // Zaten Pro olana (ödemiş ya da davetle kazanmış) deneme harcamıyoruz.
  const proActive = row?.is_pro && (!row.pro_until || utc(row.pro_until) > new Date());
  if (row?.has_paid || proActive) return res.status(200).json({ status: 'pro' });

  const now = new Date();
  let email = '';
  try {
    const clerk = createClerkClient({ secretKey: secret });
    const user = await clerk.users.getUser(userId);
    email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
      || user.emailAddresses[0]?.emailAddress || '';
  } catch {
    // Clerk'e ulaşılamadıysa denemeyi yakmayalım; bir sonraki açılışta tekrar denenir.
    return res.status(502).json({ error: 'Could not read the account' });
  }

  if (!email || isDisposable(email)) {
    await supabase.from('users').upsert(
      { user_id: userId, trial_started_at: now.toISOString(), trial_denied: 'disposable' },
      { onConflict: 'user_id' },
    );
    return res.status(200).json({ status: 'denied', reason: 'disposable' });
  }

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

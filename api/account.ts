import { createClient } from '@supabase/supabase-js';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { withErrorLog } from './_log';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Hesabı ve bütün verileri silme.
 *
 * Ücretsiz planda tek tek işlem ve journal silinemiyor (günlük hakkı
 * sıfırlamak olmasın), ama kullanıcı hesabının ve verilerinin tamamen
 * silinmesini her zaman isteyebilmeli (KVKK / GDPR). Burası o yol.
 *
 * Silinenler: fotoğraflar, işlemler, journal'lar, MetaTrader anahtarları,
 * davet kodları, kullanıcı satırı ve en son Clerk hesabı.
 *
 * Tutulanlar — kimliği değil yalnızca özeti: mt_accounts (MT hesap no +
 * sunucunun özeti) ve used_trials (e-postanın özeti). İkisi de denemenin
 * silip yeniden açarak tekrar tekrar alınmasını engellemek için; ne
 * e-postayı ne hesap numarasını geri verir.
 *
 * Sıra önemli: Clerk hesabı en son siliniyor. Veritabanı silme yarıda
 * kalırsa kullanıcı hâlâ giriş yapıp yeniden deneyebilsin.
 */
async function handler(req: any, res: any) {
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
  // Kazayla gelen bir istek hesabı silmesin: onay kelimesi şart.
  if (body.action !== 'delete' || body.confirm !== true) {
    return res.status(400).json({ error: 'Confirmation required' });
  }

  // ── Fotoğraflar: kullanıcının klasörü ──
  for (let round = 0; round < 50; round++) {
    const { data: files } = await supabase.storage.from('trade-photos').list(userId, { limit: 100 });
    if (!files || files.length === 0) break;
    await supabase.storage.from('trade-photos').remove(files.map(f => `${userId}/${f.name}`));
    if (files.length < 100) break;
  }

  // ── Veritabanı ──
  const steps: [string, () => PromiseLike<{ error: any }>][] = [
    ['trades', () => supabase.from('trades').delete().eq('user_id', userId)],
    ['api_keys', () => supabase.from('api_keys').delete().eq('user_id', userId)],
    ['journals', () => supabase.from('journals').delete().eq('user_id', userId)],
    ['referrals', () => supabase.from('referrals').delete().eq('referrer_user_id', userId)],
    ['users', () => supabase.from('users').delete().eq('user_id', userId)],
  ];
  for (const [name, run] of steps) {
    const { error } = await run();
    if (error) return res.status(500).json({ error: `Could not delete ${name}: ${error.message}` });
  }

  // ── Clerk hesabı ──
  try {
    await createClerkClient({ secretKey: secret }).users.deleteUser(userId);
  } catch {
    return res.status(502).json({ error: 'Data deleted, but the sign-in account could not be removed' });
  }

  return res.status(200).json({ deleted: true });
}

export default withErrorLog('account', handler);

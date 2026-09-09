import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@clerk/backend';
import { createHash, randomBytes } from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Anahtar veritabanında açık hâlde durmaz; yalnızca özeti saklanır.
 * Kullanıcı anahtarı bir kez görür, sonra biz de göremeyiz — sızarsa
 * veritabanından okunup kullanılamaz.
 */
const hash = (key: string) => createHash('sha256').update(key).digest('hex');

/**
 * Tarayıcıdan gelen Clerk oturumunu doğrular; kimse başkasının adına anahtar
 * üretemesin. Sunucu anahtarı eksik ya da yanlış ortamınsa, bunu "yetkisiz"
 * diye göstermek yanıltıcı olur — ayrı bir hata döneriz ki neyin eksik olduğu
 * belli olsun.
 */
type AuthResult = { userId: string } | { error: 'unconfigured' | 'unauthorized' };

async function requireUser(req: any): Promise<AuthResult> {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) return { error: 'unconfigured' };

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return { error: 'unauthorized' };
  try {
    const claims = await verifyToken(token, { secretKey: secret });
    return claims.sub ? { userId: claims.sub } : { error: 'unauthorized' };
  } catch {
    // Anahtar yanlış ortamın (sk_test ile canlı oturum) olabilir; ikisini
    // buradan ayırt edemeyiz ama en azından ipucunu veririz.
    return { error: 'unauthorized' };
  }
}

export default async function handler(req: any, res: any) {
  const auth = await requireUser(req);
  if ('error' in auth) {
    if (auth.error === 'unconfigured') {
      return res.status(503).json({
        error: 'CLERK_SECRET_KEY is not set on the server',
        hint: 'Add it in the hosting project settings and redeploy.',
      });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = auth.userId;

  // ── Listele ──
  if (req.method === 'GET') {
    const { data } = await supabase
      .from('api_keys')
      .select('id, journal_id, key_hint, label, created_at, last_used_at')
      .eq('user_id', userId)
      .eq('revoked', false)
      .order('created_at', { ascending: false });
    return res.status(200).json({ keys: data || [] });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, journalId, keyId, label } = req.body || {};

  // ── Yeni anahtar ──
  if (action === 'create') {
    if (!journalId) return res.status(400).json({ error: 'journalId required' });

    // Journal gerçekten bu kullanıcının mı?
    const { data: journal } = await supabase
      .from('journals').select('id').eq('id', journalId).eq('user_id', userId).maybeSingle();
    if (!journal) return res.status(404).json({ error: 'Journal not found' });

    // stj_ öneki, kazayla paylaşılan bir metinde anahtarı tanınır kılar.
    const key = 'stj_' + randomBytes(24).toString('base64url');
    const { error } = await supabase.from('api_keys').insert({
      user_id: userId,
      journal_id: journalId,
      key_hash: hash(key),
      key_hint: key.slice(0, 8) + '…' + key.slice(-4),
      label: label || null,
    });
    if (error) return res.status(500).json({ error: error.message });

    // Açık hâli yalnızca burada, yalnızca bir kez döner.
    return res.status(200).json({ key });
  }

  // ── İptal ──
  if (action === 'revoke') {
    if (!keyId) return res.status(400).json({ error: 'keyId required' });
    await supabase.from('api_keys').update({ revoked: true }).eq('id', keyId).eq('user_id', userId);
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Unknown action' });
}

import { createClient } from '@supabase/supabase-js';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { isDisposableEmailDomain } from 'disposable-email-domains-js';
import { withErrorLog } from './_log';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Davet kodları.
 *
 * Kimlik tarayıcının söylediğinden değil, Clerk oturumundan okunuyor. Önce
 * gövdedeki userId'ye güveniliyordu: herhangi biri sahte kimliklerle kod
 * üretip kendi kodunu onlara kullandırarak kendine sınırsız "1 ay Pro"
 * toplayabiliyordu.
 *
 * Her hesap en fazla bir davet kodu kullanabilir; tek kullanımlık e-posta ile
 * açılmış hesap kod kullanamaz (deneme süresiyle aynı kural, api/trial.ts).
 */

/** pro_until saat dilimsiz tutuluyor ve UTC yazılıyor; öyle okunmalı. */
const utc = (s: string) => new Date(/(Z|[+-]\d\d:?\d\d)$/.test(s) ? s : s + 'Z');

function isDisposable(email: string): boolean {
  const domain = email.split('@')[1]?.trim().toLowerCase() || '';
  const parts = domain.split('.');
  for (let i = 0; i < parts.length - 1; i++) {
    if (isDisposableEmailDomain(parts.slice(i).join('.'))) return true;
  }
  return false;
}

/** Süresi dolmamışsa kalan Pro'nun üstüne, dolmuşsa bugünden bir ay. */
async function addProMonth(userId: string) {
  const { data } = await supabase.from('users').select('pro_until').eq('user_id', userId).maybeSingle();
  const until = new Date();
  if (data?.pro_until && utc(data.pro_until) > until) until.setTime(utc(data.pro_until).getTime());
  until.setUTCMonth(until.getUTCMonth() + 1);
  await supabase.from('users').upsert(
    { user_id: userId, is_pro: true, pro_until: until.toISOString() },
    { onConflict: 'user_id' },
  );
}

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

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { action, code } = body;

  // ── GENERATE NEW (her tıklamada yeni kod) ──
  if (action === 'generate_new') {
    const { splitType, code: newCode } = body;
    if (!newCode || !splitType) return res.status(400).json({ error: 'Eksik parametre' });

    await supabase.from('referrals').insert({
      referrer_user_id: userId,
      code: newCode,
      split_type: splitType,
    });

    await supabase.from('users').upsert(
      { user_id: userId, referral_code: newCode },
      { onConflict: 'user_id' }
    );

    return res.json({ code: newCode });
  }

  // ── GENERATE (ilk kod, değişmez) ──
  if (action === 'generate') {
    const { data: existing } = await supabase
      .from('users')
      .select('referral_code')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing?.referral_code) {
      return res.json({ code: existing.referral_code });
    }

    const newCode = `ST-${userId.slice(-6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    await supabase.from('referrals').insert({
      referrer_user_id: userId,
      code: newCode,
    });

    await supabase.from('users').upsert(
      { user_id: userId, referral_code: newCode },
      { onConflict: 'user_id' }
    );

    return res.json({ code: newCode });
  }

  if (action !== 'validate' && action !== 'use') return res.status(400).json({ error: 'Geçersiz action' });
  if (!code) return res.status(400).json({ valid: false, error: 'Eksik parametre' });

  const { data: referral } = await supabase
    .from('referrals')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (!referral) return res.status(404).json({ valid: false, error: 'Geçersiz kod' });
  if (referral.used_at) return res.status(400).json({ valid: false, error: 'Bu kod zaten kullanılmış' });
  if (referral.referrer_user_id === userId) return res.status(400).json({ valid: false, error: 'Kendi kodunuzu kullanamazsınız' });

  const { data: already } = await supabase
    .from('referrals').select('code').eq('referred_user_id', userId).limit(1);
  if (already && already.length > 0) {
    return res.status(400).json({ valid: false, error: 'Daha önce bir davet kodu kullandınız' });
  }

  // ── VALIDATE ──
  if (action === 'validate') {
    return res.json({ valid: true, splitType: referral.split_type || '50_50' });
  }

  // ── USE ──
  let email = '';
  try {
    const user = await createClerkClient({ secretKey: secret }).users.getUser(userId);
    email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
      || user.emailAddresses[0]?.emailAddress || '';
  } catch {
    return res.status(502).json({ error: 'Could not read the account' });
  }
  if (!email || isDisposable(email)) {
    return res.status(400).json({ error: 'Bu e-posta adresiyle davet kodu kullanılamaz' });
  }

  // Kod yalnızca hâlâ kullanılmamışsa işaretlensin: iki istek aynı anda
  // gelirse ikincisi boşa düşer.
  const { data: claimed } = await supabase.from('referrals')
    .update({ referred_user_id: userId, used_at: new Date().toISOString() })
    .eq('code', code)
    .is('used_at', null)
    .select('code');
  if (!claimed || claimed.length === 0) return res.status(400).json({ error: 'Bu kod zaten kullanılmış' });

  await addProMonth(userId);
  await addProMonth(referral.referrer_user_id);

  return res.json({ success: true });
}

export default withErrorLog('referral', handler);

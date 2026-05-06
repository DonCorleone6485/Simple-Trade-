import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, userId, code } = req.body;
  console.log('Referral action:', action, 'userId:', userId, 'code:', code);

  if (action === 'generate') {
    const { data: existing } = await supabase
      .from('users')
      .select('referral_code')
      .eq('user_id', userId)
      .single();

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

  if (action === 'use') {
    console.log('Trying to use code:', code, 'for user:', userId);

    if (!code || !userId) {
      return res.status(400).json({ error: 'Kod veya kullanıcı ID eksik' });
    }

    const { data: referral, error: refError } = await supabase
      .from('referrals')
      .select('*')
      .eq('code', code)
      .single();

    console.log('Referral found:', referral, 'Error:', refError);

    if (!referral) return res.status(404).json({ error: 'Geçersiz kod' });
    if (referral.used_at) return res.status(400).json({ error: 'Bu kod zaten kullanılmış' });
    if (referral.referrer_user_id === userId) return res.status(400).json({ error: 'Kendi kodunuzu kullanamazsınız' });

    const now = new Date();
    const oneMonthLater = new Date(now);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    // Referral'ı kullanıldı olarak işaretle
    const { error: updateError } = await supabase
      .from('referrals')
      .update({ referred_user_id: userId, used_at: new Date().toISOString() })
      .eq('code', code);

    console.log('Update referral error:', updateError);

    // Yeni kullanıcıya 1 ay pro ekle
    const { error: newUserError } = await supabase
      .from('users')
      .upsert(
        { user_id: userId, is_pro: true, pro_until: oneMonthLater.toISOString() },
        { onConflict: 'user_id' }
      );

    console.log('New user pro error:', newUserError);

    // Referral gönderen kişiye de 1 ay pro ekle
    const { data: referrer } = await supabase
      .from('users')
      .select('pro_until')
      .eq('user_id', referral.referrer_user_id)
      .single();

    const referrerProUntil = new Date();
    if (referrer?.pro_until && new Date(referrer.pro_until) > new Date()) {
      referrerProUntil.setTime(new Date(referrer.pro_until).getTime());
    }
    referrerProUntil.setMonth(referrerProUntil.getMonth() + 1);

    await supabase
      .from('users')
      .upsert(
        { user_id: referral.referrer_user_id, is_pro: true, pro_until: referrerProUntil.toISOString() },
        { onConflict: 'user_id' }
      );

    return res.json({ success: true });
  }

  return res.status(400).json({ error: 'Geçersiz action' });
}

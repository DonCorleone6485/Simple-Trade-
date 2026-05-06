import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const { action, userId, code } = req.body;

    // Referral kodu oluştur
    if (action === 'generate') {
      // Kullanıcının zaten kodu var mı?
      const { data: existing } = await supabase
        .from('users')
        .select('referral_code')
        .eq('user_id', userId)
        .single();

      if (existing?.referral_code) {
        return res.json({ code: existing.referral_code });
      }

      // Yeni kod oluştur
      const newCode = `ST-${userId.slice(-6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      // referrals tablosuna ekle
      await supabase.from('referrals').insert({
        referrer_user_id: userId,
        code: newCode,
      });

      // users tablosuna kaydet
      await supabase
        .from('users')
        .upsert({ user_id: userId, referral_code: newCode }, { onConflict: 'user_id' });

      return res.json({ code: newCode });
    }

    // Referral kodunu kullan (yeni kullanıcı kaydolunca)
    if (action === 'use') {
      // Kod geçerli mi?
      const { data: referral } = await supabase
        .from('referrals')
        .select('*')
        .eq('code', code)
        .single();

      if (!referral) return res.status(404).json({ error: 'Geçersiz kod' });
      if (referral.used_at) return res.status(400).json({ error: 'Bu kod zaten kullanılmış' });
      if (referral.referrer_user_id === userId) return res.status(400).json({ error: 'Kendi kodunuzu kullanamazsınız' });

      const now = new Date();
      const oneMonthLater = new Date(now.setMonth(now.getMonth() + 1)).toISOString();

      // Referral'ı kullanıldı olarak işaretle
      await supabase
        .from('referrals')
        .update({ referred_user_id: userId, used_at: new Date().toISOString() })
        .eq('code', code);

      // Yeni kullanıcıya 1 ay pro ekle
      await supabase
        .from('users')
        .upsert({
          user_id: userId,
          is_pro: true,
          pro_until: oneMonthLater,
        }, { onConflict: 'user_id' });

      // Referral gönderen kişiye de 1 ay pro ekle
      const { data: referrer } = await supabase
        .from('users')
        .select('pro_until')
        .eq('user_id', referral.referrer_user_id)
        .single();

      const referrerProUntil = referrer?.pro_until
        ? new Date(referrer.pro_until)
        : new Date();

      if (referrerProUntil < new Date()) referrerProUntil.setTime(new Date().getTime());
      referrerProUntil.setMonth(referrerProUntil.getMonth() + 1);

      await supabase
        .from('users')
        .upsert({
          user_id: referral.referrer_user_id,
          is_pro: true,
          pro_until: referrerProUntil.toISOString(),
        }, { onConflict: 'user_id' });

      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'Geçersiz action' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}

import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';
import { toLang, unsubscribeToken } from './_email.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Otomatik e-postalardaki "abonelikten çık" bağlantısı.
 *
 * GET: postadaki bağlantıya tıklayan kişi. POST: Gmail/Yahoo'nun "tek
 * tıkla çık" düğmesi (List-Unsubscribe-Post). Giriş gerekmiyor; bağlantıdaki
 * özet (t) yalnızca sunucunun anahtarıyla üretilebildiği için başkası
 * başkasını çıkaramıyor.
 *
 * Yalnızca deneme hatırlatmaları duruyor; hesapla ilgili zorunlu bildirimler
 * (ileride: ödeme, şifre) bu işareti dikkate almaz.
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();
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

import { createHmac } from 'crypto';

/**
 * Otomatik e-postalar: hoş geldin, "deneme bitiyor", "deneme bitti"
 * (haftalık özet ayrı dosyada: _digest.ts).
 *
 * Adı alt çizgiyle başlıyor: Vercel bu dosyayı ayrı bir adres (/api/_email)
 * olarak yayınlamıyor, yalnızca öbür uçlar içeri alıyor.
 *
 * Gönderen alt alan adı (updates.) ayrı tutuldu: Resend'in DNS kayıtları
 * Google Workspace'in MX/SPF kayıtlarıyla çakışmasın, toplu gönderimin itibarı
 * da şirket posta kutusunu etkilemesin. Cevaplar support@'a — Google'a — gidiyor.
 *
 * RESEND_API_KEY yoksa hiçbir şey gönderilmez ve "gönderildi" diye de
 * işaretlenmez; anahtar eklenince bekleyenler gider.
 */
const FROM = 'Simple Trading Journal <hello@updates.simpletradejournal.io>';
const REPLY_TO = 'support@simpletradejournal.io';
const SITE = 'https://www.simpletradejournal.io';
const APP = `${SITE}/journal`;

export type Lang = 'tr' | 'en' | 'fa' | 'ar' | 'ru' | 'es' | 'pt' | 'de' | 'fr';
const LANGS: Lang[] = ['tr', 'en', 'fa', 'ar', 'ru', 'es', 'pt', 'de', 'fr'];
export const toLang = (l: unknown): Lang => (LANGS.includes(l as Lang) ? (l as Lang) : 'en');

const LOCALES: Record<Lang, string> = {
  tr: 'tr-TR', en: 'en-US', fa: 'fa-IR', ar: 'ar', ru: 'ru-RU', es: 'es-ES', pt: 'pt-PT', de: 'de-DE', fr: 'fr-FR',
};

export const emailEnabled = () => !!process.env.RESEND_API_KEY;

/** Bağlantıyı yalnızca biz üretebilelim diye: kimliğin sunucu anahtarıyla özeti. */
export function unsubscribeToken(userId: string): string {
  return createHmac('sha256', process.env.SUPABASE_SERVICE_KEY || '').update(`unsub:${userId}`).digest('hex').slice(0, 32);
}
export const unsubscribeUrl = (userId: string) =>
  `${SITE}/api/emails?u=${encodeURIComponent(userId)}&t=${unsubscribeToken(userId)}`;

type Mail = { subject: string; lead: string; body: string[]; cta: string; foot: string };
type Kind = 'welcome' | 'trialEnding' | 'trialEnded';

/** {date} → kullanıcının dilinde ve saat diliminde tarih-saat. */
const COPY: Record<Kind, Record<Lang, Mail>> = {
  welcome: {
    tr: {
      subject: 'Simple Trading Journal\'a hoş geldin',
      lead: 'Hesabın hazır. Başlamanın üç yolu var:',
      body: ['İşlemlerini elle gir.', 'Broker raporunu içe aktar (MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader).', 'MetaTrader 4 ya da 5\'i bağla, işlemlerin kendiliğinden gelsin.', 'Ücretsiz planda günde 2 işlem kaydedebilirsin. Bir sınıra takıldığında Pro\'yu 3 gün, kart vermeden deneyebilirsin.'],
      cta: 'Journal\'ını aç',
      foot: 'Takıldığın bir yer ya da sorun olursa bu postaya cevap yazman yeterli.',
    },
    en: {
      subject: 'Welcome to Simple Trading Journal',
      lead: 'Your account is ready. There are three ways to start:',
      body: ['Enter your trades by hand.', 'Import your broker\'s report (MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader).', 'Connect MetaTrader 4 or 5 and let your trades arrive on their own.', 'The Free plan records 2 trades a day. When you hit a limit you can try Pro for 3 days, no card needed.'],
      cta: 'Open your journal',
      foot: 'Questions or problems? Just reply to this email.',
    },
    fa: {
      subject: 'به Simple Trading Journal خوش آمدی',
      lead: 'حسابت آماده است. سه راه برای شروع داری:',
      body: ['معاملاتت را دستی وارد کن.', 'گزارش بروکرت را وارد کن (MT4/MT5، cTrader، TradeLocker، DXtrade، Match-Trader).', 'متاتریدر ۴ یا ۵ را وصل کن تا معاملات خودکار بیایند.', 'در پلن رایگان روزانه ۲ معامله ثبت می‌شود. وقتی به محدودیت رسیدی، می‌توانی Pro را ۳ روز بدون کارت امتحان کنی.'],
      cta: 'باز کردن ژورنال',
      foot: 'سؤال یا مشکلی داری؟ کافی است به همین ایمیل پاسخ بدهی.',
    },
    ar: {
      subject: 'مرحباً بك في Simple Trading Journal',
      lead: 'حسابك جاهز. هناك ثلاث طرق للبدء:',
      body: ['أدخل صفقاتك يدوياً.', 'استورد تقرير الوسيط (MT4/MT5، cTrader، TradeLocker، DXtrade، Match-Trader).', 'اربط ميتاتريدر 4 أو 5 لتصل صفقاتك تلقائياً.', 'الخطة المجانية تسجّل صفقتين يومياً. عند بلوغ الحد يمكنك تجربة Pro لمدة 3 أيام دون بطاقة.'],
      cta: 'افتح سجلك',
      foot: 'لديك سؤال أو مشكلة؟ يكفي أن ترد على هذه الرسالة.',
    },
    ru: {
      subject: 'Добро пожаловать в Simple Trading Journal',
      lead: 'Ваш аккаунт готов. Начать можно тремя способами:',
      body: ['Вносите сделки вручную.', 'Импортируйте отчёт брокера (MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader).', 'Подключите MetaTrader 4 или 5 — сделки будут приходить сами.', 'На бесплатном плане — 2 сделки в день. Упрётесь в лимит — сможете 3 дня попробовать Pro без карты.'],
      cta: 'Открыть журнал',
      foot: 'Вопросы или проблемы? Просто ответьте на это письмо.',
    },
    es: {
      subject: 'Bienvenido a Simple Trading Journal',
      lead: 'Tu cuenta está lista. Hay tres formas de empezar:',
      body: ['Registra tus operaciones a mano.', 'Importa el informe de tu bróker (MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader).', 'Conecta MetaTrader 4 o 5 y deja que tus operaciones lleguen solas.', 'El plan gratuito registra 2 operaciones al día. Cuando llegues a un límite podrás probar Pro 3 días sin tarjeta.'],
      cta: 'Abrir tu diario',
      foot: '¿Dudas o problemas? Responde a este correo.',
    },
    pt: {
      subject: 'Bem-vindo ao Simple Trading Journal',
      lead: 'A tua conta está pronta. Há três formas de começar:',
      body: ['Regista as tuas operações à mão.', 'Importa o relatório da corretora (MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader).', 'Liga o MetaTrader 4 ou 5 e deixa as operações chegarem sozinhas.', 'O plano gratuito regista 2 operações por dia. Quando chegares a um limite podes experimentar o Pro 3 dias, sem cartão.'],
      cta: 'Abrir o teu diário',
      foot: 'Dúvidas ou problemas? Basta responder a este e-mail.',
    },
    de: {
      subject: 'Willkommen bei Simple Trading Journal',
      lead: 'Dein Konto ist bereit. Es gibt drei Wege zu starten:',
      body: ['Trades von Hand erfassen.', 'Den Bericht deines Brokers importieren (MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader).', 'MetaTrader 4 oder 5 verbinden – die Trades kommen von selbst.', 'Im Gratis-Plan werden 2 Trades pro Tag erfasst. Erreichst du ein Limit, kannst du Pro 3 Tage ohne Karte testen.'],
      cta: 'Journal öffnen',
      foot: 'Fragen oder Probleme? Antworte einfach auf diese E-Mail.',
    },
    fr: {
      subject: 'Bienvenue sur Simple Trading Journal',
      lead: 'Votre compte est prêt. Trois façons de commencer :',
      body: ['Saisissez vos trades à la main.', 'Importez le relevé de votre courtier (MT4/MT5, cTrader, TradeLocker, DXtrade, Match-Trader).', 'Connectez MetaTrader 4 ou 5 et laissez vos trades arriver tout seuls.', 'Le plan gratuit enregistre 2 trades par jour. Arrivé à une limite, vous pourrez essayer Pro 3 jours sans carte.'],
      cta: 'Ouvrir votre journal',
      foot: 'Une question, un problème ? Répondez simplement à cet e-mail.',
    },
  },
  trialEnding: {
    tr: {
      subject: 'Pro denemen yakında bitiyor',
      lead: 'Pro denemen {date} tarihinde bitiyor.',
      body: ['Bitmeden denemediklerine bak: yapay zekâ analizi, sesli not ve disiplin analizi.', 'Deneme bitince hesabın Ücretsiz plana geçer. Verilerin silinmez; günde 2\'den fazla işlem kilitli görünür, Pro özellikleri kapanır.'],
      cta: 'Journal\'ını aç',
      foot: 'Denemeyle ilgili bir sorun ya da görüşün varsa bu postaya cevap yaz.',
    },
    en: {
      subject: 'Your Pro trial ends soon',
      lead: 'Your Pro trial ends on {date}.',
      body: ['Before it does, try what you haven\'t yet: AI analysis, voice notes and the discipline analysis.', 'After the trial your account moves to the Free plan. Nothing is deleted; trades beyond 2 a day show as locked and Pro features switch off.'],
      cta: 'Open your journal',
      foot: 'Anything about the trial on your mind? Reply to this email.',
    },
    fa: {
      subject: 'دوره آزمایشی Pro به‌زودی تمام می‌شود',
      lead: 'دوره آزمایشی Pro تو در {date} تمام می‌شود.',
      body: ['قبل از پایان، چیزهایی را که هنوز امتحان نکرده‌ای ببین: تحلیل هوش مصنوعی، یادداشت صوتی و تحلیل انضباط.', 'بعد از پایان، حسابت به پلن رایگان برمی‌گردد. چیزی پاک نمی‌شود؛ معاملات بیش از ۲ در روز قفل نشان داده می‌شوند و امکانات Pro خاموش می‌شوند.'],
      cta: 'باز کردن ژورنال',
      foot: 'درباره دوره آزمایشی نظری داری؟ به همین ایمیل پاسخ بده.',
    },
    ar: {
      subject: 'تجربة Pro تنتهي قريباً',
      lead: 'تنتهي تجربة Pro الخاصة بك في {date}.',
      body: ['قبل انتهائها جرّب ما لم تجربه بعد: تحليل الذكاء الاصطناعي والملاحظات الصوتية وتحليل الانضباط.', 'بعد التجربة ينتقل حسابك إلى الخطة المجانية. لا يُحذف شيء؛ تظهر الصفقات التي تتجاوز اثنتين يومياً مقفلة وتتوقف ميزات Pro.'],
      cta: 'افتح سجلك',
      foot: 'لديك ملاحظة عن التجربة؟ رد على هذه الرسالة.',
    },
    ru: {
      subject: 'Пробный период Pro скоро закончится',
      lead: 'Ваш пробный период Pro заканчивается {date}.',
      body: ['Успейте попробовать то, до чего ещё не дошли: ИИ-анализ, голосовые заметки и анализ дисциплины.', 'После пробного периода аккаунт перейдёт на бесплатный план. Ничего не удаляется; сделки сверх 2 в день будут заблокированы, функции Pro отключатся.'],
      cta: 'Открыть журнал',
      foot: 'Есть мысли о пробном периоде? Ответьте на это письмо.',
    },
    es: {
      subject: 'Tu prueba de Pro termina pronto',
      lead: 'Tu prueba de Pro termina el {date}.',
      body: ['Antes de que acabe, prueba lo que aún no has usado: análisis con IA, notas de voz y el análisis de disciplina.', 'Después tu cuenta pasa al plan gratuito. No se borra nada; las operaciones que superen 2 al día aparecen bloqueadas y las funciones Pro se desactivan.'],
      cta: 'Abrir tu diario',
      foot: '¿Algo que decirnos sobre la prueba? Responde a este correo.',
    },
    pt: {
      subject: 'O teu teste do Pro termina em breve',
      lead: 'O teu teste do Pro termina a {date}.',
      body: ['Antes que acabe, experimenta o que ainda não usaste: análise com IA, notas de voz e a análise de disciplina.', 'Depois a tua conta passa para o plano gratuito. Nada é apagado; as operações acima de 2 por dia aparecem bloqueadas e as funções Pro desligam-se.'],
      cta: 'Abrir o teu diário',
      foot: 'Algo a dizer sobre o teste? Responde a este e-mail.',
    },
    de: {
      subject: 'Dein Pro-Test endet bald',
      lead: 'Dein Pro-Test endet am {date}.',
      body: ['Probier vorher aus, was du noch nicht genutzt hast: KI-Analyse, Sprachnotizen und die Disziplin-Analyse.', 'Danach wechselt dein Konto in den Gratis-Plan. Nichts wird gelöscht; Trades über 2 pro Tag erscheinen gesperrt, Pro-Funktionen werden abgeschaltet.'],
      cta: 'Journal öffnen',
      foot: 'Etwas zum Test loswerden? Antworte auf diese E-Mail.',
    },
    fr: {
      subject: 'Votre essai Pro se termine bientôt',
      lead: 'Votre essai Pro se termine le {date}.',
      body: ['D\'ici là, essayez ce que vous n\'avez pas encore utilisé : l\'analyse IA, les notes vocales et l\'analyse de discipline.', 'Ensuite, votre compte passe au plan gratuit. Rien n\'est supprimé ; les trades au-delà de 2 par jour apparaissent verrouillés et les fonctions Pro se désactivent.'],
      cta: 'Ouvrir votre journal',
      foot: 'Un avis sur l\'essai ? Répondez à cet e-mail.',
    },
  },
  trialEnded: {
    tr: {
      subject: 'Pro denemen bitti — verilerin yerinde',
      lead: 'Pro denemen bitti ve hesabın Ücretsiz plana geçti.',
      body: ['Hiçbir verin silinmedi. Günde 2 işlemi aşanlar kilitli görünüyor; Pro\'ya geçtiğinde kilitleri açılır.', 'Kısa bir iyilik: neyi sevdin, neyi eksik buldun? Bu postaya iki satır cevap yazman bize çok yardımcı olur.'],
      cta: 'Journal\'ını aç',
      foot: 'Her cevabı biz okuyoruz.',
    },
    en: {
      subject: 'Your Pro trial has ended — your data is safe',
      lead: 'Your Pro trial has ended and your account is now on the Free plan.',
      body: ['Nothing was deleted. Trades beyond 2 a day show as locked and unlock when you move to Pro.', 'A small favour: what did you like, and what was missing? Two lines in reply to this email help us a lot.'],
      cta: 'Open your journal',
      foot: 'We read every reply.',
    },
    fa: {
      subject: 'دوره آزمایشی Pro تمام شد — داده‌هایت سر جایش است',
      lead: 'دوره آزمایشی Pro تمام شد و حسابت به پلن رایگان برگشت.',
      body: ['هیچ داده‌ای پاک نشد. معاملات بیش از ۲ در روز قفل نشان داده می‌شوند و با Pro باز می‌شوند.', 'یک لطف کوچک: چه چیزی را دوست داشتی و چه چیزی کم بود؟ دو خط پاسخ به همین ایمیل خیلی کمکمان می‌کند.'],
      cta: 'باز کردن ژورنال',
      foot: 'همه پاسخ‌ها را خودمان می‌خوانیم.',
    },
    ar: {
      subject: 'انتهت تجربة Pro — بياناتك محفوظة',
      lead: 'انتهت تجربة Pro وانتقل حسابك إلى الخطة المجانية.',
      body: ['لم يُحذف شيء. الصفقات التي تتجاوز اثنتين يومياً تظهر مقفلة وتُفتح عند الانتقال إلى Pro.', 'معروف صغير: ما الذي أعجبك وما الذي نقص؟ سطران رداً على هذه الرسالة يساعداننا كثيراً.'],
      cta: 'افتح سجلك',
      foot: 'نقرأ كل رد.',
    },
    ru: {
      subject: 'Пробный период Pro закончился — данные на месте',
      lead: 'Пробный период Pro закончился, аккаунт перешёл на бесплатный план.',
      body: ['Ничего не удалено. Сделки сверх 2 в день заблокированы и откроются после перехода на Pro.', 'Небольшая просьба: что понравилось и чего не хватило? Пара строк в ответ на это письмо очень нам поможет.'],
      cta: 'Открыть журнал',
      foot: 'Мы читаем каждый ответ.',
    },
    es: {
      subject: 'Tu prueba de Pro ha terminado — tus datos siguen ahí',
      lead: 'Tu prueba de Pro ha terminado y tu cuenta está ahora en el plan gratuito.',
      body: ['No se ha borrado nada. Las operaciones que superan 2 al día aparecen bloqueadas y se desbloquean al pasar a Pro.', 'Un pequeño favor: ¿qué te gustó y qué echaste en falta? Dos líneas respondiendo a este correo nos ayudan mucho.'],
      cta: 'Abrir tu diario',
      foot: 'Leemos cada respuesta.',
    },
    pt: {
      subject: 'O teu teste do Pro terminou — os teus dados estão seguros',
      lead: 'O teu teste do Pro terminou e a tua conta está agora no plano gratuito.',
      body: ['Nada foi apagado. As operações acima de 2 por dia aparecem bloqueadas e desbloqueiam quando passares para o Pro.', 'Um pequeno favor: o que gostaste e o que faltou? Duas linhas em resposta a este e-mail ajudam-nos muito.'],
      cta: 'Abrir o teu diário',
      foot: 'Lemos todas as respostas.',
    },
    de: {
      subject: 'Dein Pro-Test ist vorbei – deine Daten bleiben',
      lead: 'Dein Pro-Test ist beendet, dein Konto ist jetzt im Gratis-Plan.',
      body: ['Nichts wurde gelöscht. Trades über 2 pro Tag erscheinen gesperrt und werden mit Pro wieder freigeschaltet.', 'Eine kleine Bitte: Was hat dir gefallen, was hat gefehlt? Zwei Zeilen als Antwort auf diese E-Mail helfen uns sehr.'],
      cta: 'Journal öffnen',
      foot: 'Wir lesen jede Antwort.',
    },
    fr: {
      subject: 'Votre essai Pro est terminé — vos données sont conservées',
      lead: 'Votre essai Pro est terminé et votre compte est passé au plan gratuit.',
      body: ['Rien n\'a été supprimé. Les trades au-delà de 2 par jour apparaissent verrouillés et se débloquent en passant à Pro.', 'Un petit service : qu\'avez-vous aimé, qu\'est-ce qui manquait ? Deux lignes en réponse à cet e-mail nous aident beaucoup.'],
      cta: 'Ouvrir votre journal',
      foot: 'Nous lisons chaque réponse.',
    },
  },
};

const UNSUB: Record<Lang, string> = {
  tr: 'Bu tür e-postaları almak istemiyorsan', en: 'Don\'t want these emails?', fa: 'این ایمیل‌ها را نمی‌خواهی؟', ar: 'لا تريد هذه الرسائل؟',
  ru: 'Не хотите получать такие письма?', es: '¿No quieres estos correos?', pt: 'Não queres estes e-mails?', de: 'Keine solchen E-Mails mehr?', fr: 'Vous ne voulez plus ces e-mails ?',
};
const UNSUB_LINK: Record<Lang, string> = {
  tr: 'buradan çık', en: 'Unsubscribe', fa: 'لغو اشتراک', ar: 'إلغاء الاشتراك',
  ru: 'Отписаться', es: 'Darse de baja', pt: 'Cancelar subscrição', de: 'Abmelden', fr: 'Se désabonner',
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function formatDate(iso: string, lang: Lang, timeZone?: string | null): string {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeStyle: 'short' };
  try {
    return new Intl.DateTimeFormat(LOCALES[lang], { ...opts, timeZone: timeZone || 'UTC' }).format(d)
      + (timeZone ? '' : ' UTC');
  } catch {
    return new Intl.DateTimeFormat(LOCALES[lang], { ...opts, timeZone: 'UTC' }).format(d) + ' UTC';
  }
}

function render(kind: Kind, lang: Lang, userId: string, vars: { date?: string }) {
  const c = COPY[kind][lang];
  const fill = (s: string) => s.replace('{date}', vars.date || '');
  const rtl = lang === 'fa' || lang === 'ar';
  const unsub = unsubscribeUrl(userId);
  const align = rtl ? 'right' : 'left';

  const html = `<!doctype html><html lang="${lang}" dir="${rtl ? 'rtl' : 'ltr'}"><body style="margin:0;background:#f4f4f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2030">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;padding:32px;text-align:${align}">
<tr><td style="font-size:14px;font-weight:600;color:#8b5cf6;padding-bottom:20px">Simple Trading Journal</td></tr>
<tr><td style="font-size:20px;font-weight:600;line-height:1.4;padding-bottom:16px">${esc(fill(c.lead))}</td></tr>
${c.body.map(p => `<tr><td style="font-size:15px;line-height:1.6;color:#44465a;padding-bottom:12px">${esc(fill(p))}</td></tr>`).join('')}
<tr><td style="padding:16px 0 24px"><a href="${APP}" style="display:inline-block;background:#8b5cf6;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:999px">${esc(c.cta)}</a></td></tr>
<tr><td style="font-size:14px;line-height:1.6;color:#6b6d80">${esc(c.foot)}</td></tr>
</table>
<p style="font-size:12px;color:#9a9cad;margin:16px 0 0">${esc(UNSUB[lang])} <a href="${unsub}" style="color:#9a9cad">${esc(UNSUB_LINK[lang])}</a></p>
</td></tr></table></body></html>`;

  const text = [fill(c.lead), '', ...c.body.map(fill), '', `${c.cta}: ${APP}`, '', c.foot, '', `${UNSUB[lang]} ${UNSUB_LINK[lang]}: ${unsub}`].join('\n');
  return { subject: fill(c.subject), html, text, unsub };
}

/**
 * Gönderir; başarıyı döndürür. Başarısızlık sessiz: çağıran "gönderildi"
 * işaretini koymaz, bir sonraki turda yeniden dener.
 */
export async function sendEmail(kind: Kind, to: string, opts: { userId: string; lang: Lang; date?: string; timeZone?: string | null }): Promise<boolean> {
  const date = opts.date ? formatDate(opts.date, opts.lang, opts.timeZone) : undefined;
  return sendRendered(kind, to, render(kind, opts.lang, opts.userId, { date }));
}

/** Hazır bir postayı (konu, html, metin, çıkış bağlantısı) gönderir — haftalık özet de bunu kullanıyor. */
export async function sendRendered(kind: string, to: string, m: { subject: string; html: string; text: string; unsub: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        reply_to: REPLY_TO,
        subject: m.subject,
        html: m.html,
        text: m.text,
        // Gmail ve Yahoo'nun istediği tek tıkla abonelikten çıkma.
        headers: { 'List-Unsubscribe': `<${m.unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
        tags: [{ name: 'kind', value: kind }],
      }),
    });
    if (!r.ok) console.error('resend', kind, r.status, await r.text().catch(() => ''));
    return r.ok;
  } catch (e) {
    console.error('resend', kind, e);
    return false;
  }
}

/**
 * Sitedeki iletişim formundan gelen mesajı support@'a iletir. Gönderen
 * bizim adresimiz (başkası adına posta atamayız), "Yanıtla" ise doğrudan
 * mesajı yazan kişiye gider.
 */
export async function sendContactMessage(m: { email: string; message: string; name?: string; userId?: string; lang?: string; page?: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const who = m.name ? `${m.name} <${m.email}>` : m.email;
  const text = [
    m.message,
    '',
    '—',
    `From: ${who}`,
    m.userId ? `Account: ${m.userId}` : 'Account: not signed in',
    m.lang ? `Language: ${m.lang}` : '',
    m.page ? `Page: ${m.page}` : '',
  ].filter(Boolean).join('\n');
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Simple Trading Journal <contact@updates.simpletradejournal.io>',
        to: [REPLY_TO],
        reply_to: m.email,
        subject: `[Contact] ${m.message.replace(/\s+/g, ' ').slice(0, 60)}`,
        text,
        tags: [{ name: 'kind', value: 'contact' }],
      }),
    });
    if (!r.ok) console.error('resend contact', r.status, await r.text().catch(() => ''));
    return r.ok;
  } catch (e) {
    console.error('resend contact', e);
    return false;
  }
}

/** Bize (support@) giden iç bildirim — örneğin günlük hata özeti. */
export async function sendInternal(subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Simple Trading Journal <alerts@updates.simpletradejournal.io>', to: [REPLY_TO], subject, text, tags: [{ name: 'kind', value: 'internal' }] }),
    });
    return r.ok;
  } catch { return false; }
}

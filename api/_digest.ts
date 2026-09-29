import { unsubscribeUrl, type Lang } from './_email.js';

/**
 * Haftalık özet e-postası: kullanıcının geçen 7 günü, kendi dilinde.
 *
 * Yalnızca o hafta en az bir kapanmış işlemi olana gider — işlem yoksa
 * "bu hafta hiçbir şey yapmadın" postası atmıyoruz. Gönderimi api/emails.ts
 * (günlük görev) cumartesi ve pazar yapıyor; ayrı fonksiyon değil, Vercel'in
 * ücretsiz planında 12 fonksiyon sınırındayız.
 *
 * Hesaplar src/lib/tradeMath.ts ile aynı; oradan içe alınmıyor çünkü
 * src/ tarayıcı kodu (types.ts, localStorage) — sunucu paketine girmesin.
 * Kâr vaadi dili yok: yalnız olanı sayıyor.
 */

export type DigestTrade = { date: string; symbol?: string | null; result?: string | null; reward?: number | null; risk?: number | null };

const isWin = (r?: string | null) => r === 'Başarılı' || r === 'Manuel Karda';
const isLoss = (r?: string | null) => r === 'Başarısız' || r === 'Manuel Zararda';
const pnl = (t: DigestTrade) => {
  const reward = Number(t.reward) || 0;
  if (isWin(t.result)) return Math.abs(reward);
  if (isLoss(t.result)) return -(reward < 0 ? Math.abs(reward) : Number(t.risk) || 0);
  return 0;
};

export type WeekStats = {
  trades: number; wins: number; losses: number; winRate: number | null;
  net: number; best: number; worst: number; topSymbol: string | null; prevNet: number | null;
};

/** Sonucu girilmemiş (açık) işlemler sayılmaz. prev: bir önceki haftanın işlemleri. */
export function weekStats(week: DigestTrade[], prev?: DigestTrade[]): WeekStats | null {
  const closed = week.filter(t => !!t.result);
  if (!closed.length) return null;
  const wins = closed.filter(t => isWin(t.result)).length;
  const losses = closed.filter(t => isLoss(t.result)).length;
  const values = closed.map(pnl);
  const bySymbol = new Map<string, number>();
  for (const t of closed) if (t.symbol) bySymbol.set(t.symbol, (bySymbol.get(t.symbol) || 0) + 1);
  const top = [...bySymbol.entries()].sort((a, b) => b[1] - a[1])[0];
  const prevClosed = (prev || []).filter(t => !!t.result);
  return {
    trades: closed.length,
    wins, losses,
    winRate: wins + losses ? wins / (wins + losses) : null,
    net: values.reduce((a, b) => a + b, 0),
    best: Math.max(...values),
    worst: Math.min(...values),
    topSymbol: top ? top[0] : null,
    prevNet: prevClosed.length ? prevClosed.map(pnl).reduce((a, b) => a + b, 0) : null,
  };
}

const SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', TRY: '₺', CHF: 'CHF ', JPY: '¥', AUD: 'A$', CAD: 'C$' };
/** Sitedeki gibi: her dilde "+$1,234.50" (src/lib/format.ts). */
export function money(v: number, currency?: string | null, signed = true): string {
  const s = SYMBOLS[currency || ''] || '$';
  const n = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${signed ? (v >= 0 ? '+' : '−') : ''}${s}${n}`;
}

type Copy = {
  subject: string; lead: string; trades: string; winRate: string; net: string; best: string; worst: string;
  top: string; prev: string; tip: string; cta: string; foot: string;
};

/** {n} işlem sayısı, {range} tarih aralığı. */
const COPY: Record<Lang, Copy> = {
  tr: {
    subject: 'Haftan: {n} işlem', lead: '{range} arasındaki işlemlerinin özeti.',
    trades: 'İşlem', winRate: 'Kazanma oranı', net: 'Net sonuç', best: 'En iyi işlem', worst: 'En kötü işlem',
    top: 'En çok işlem yapılan', prev: 'Önceki hafta net', tip: 'Haftanın notlarına bir göz at: hangi işlemler plana uygundu, hangileri değildi?',
    cta: 'Journal\'ını aç', foot: 'Bu özet her cumartesi, yalnız o hafta işlem kaydettiysen gelir.',
  },
  en: {
    subject: 'Your week: {n} trades', lead: 'A summary of your trades from {range}.',
    trades: 'Trades', winRate: 'Win rate', net: 'Net result', best: 'Best trade', worst: 'Worst trade',
    top: 'Most traded', prev: 'Previous week net', tip: 'Take a look at the week\'s notes: which trades followed your plan and which didn\'t?',
    cta: 'Open your journal', foot: 'This summary arrives on Saturdays, only if you logged trades that week.',
  },
  fa: {
    subject: 'هفته تو: {n} معامله', lead: 'خلاصه معاملاتت در بازه {range}.',
    trades: 'معامله', winRate: 'نرخ برد', net: 'نتیجه خالص', best: 'بهترین معامله', worst: 'بدترین معامله',
    top: 'بیشترین نماد', prev: 'خالص هفته قبل', tip: 'یادداشت‌های این هفته را مرور کن: کدام معاملات طبق برنامه بود و کدام نبود؟',
    cta: 'باز کردن ژورنال', foot: 'این خلاصه هر شنبه می‌آید، فقط اگر آن هفته معامله‌ای ثبت کرده باشی.',
  },
  ar: {
    subject: 'أسبوعك: {n} صفقات', lead: 'ملخص صفقاتك في الفترة {range}.',
    trades: 'الصفقات', winRate: 'نسبة الربح', net: 'النتيجة الصافية', best: 'أفضل صفقة', worst: 'أسوأ صفقة',
    top: 'الأكثر تداولاً', prev: 'صافي الأسبوع السابق', tip: 'ألقِ نظرة على ملاحظات الأسبوع: أي الصفقات اتبعت خطتك وأيها لم تتبعها؟',
    cta: 'افتح سجلك', foot: 'يصلك هذا الملخص كل يوم سبت، فقط إذا سجلت صفقات في ذلك الأسبوع.',
  },
  ru: {
    subject: 'Ваша неделя: сделок — {n}', lead: 'Итоги ваших сделок за {range}.',
    trades: 'Сделки', winRate: 'Доля прибыльных', net: 'Итог', best: 'Лучшая сделка', worst: 'Худшая сделка',
    top: 'Чаще всего', prev: 'Итог прошлой недели', tip: 'Загляните в заметки за неделю: какие сделки были по плану, а какие нет?',
    cta: 'Открыть журнал', foot: 'Эта сводка приходит по субботам, только если за неделю были сделки.',
  },
  es: {
    subject: 'Tu semana: {n} operaciones', lead: 'Resumen de tus operaciones del {range}.',
    trades: 'Operaciones', winRate: 'Tasa de acierto', net: 'Resultado neto', best: 'Mejor operación', worst: 'Peor operación',
    top: 'Más operado', prev: 'Neto semana anterior', tip: 'Echa un vistazo a las notas de la semana: ¿qué operaciones siguieron tu plan y cuáles no?',
    cta: 'Abrir tu diario', foot: 'Este resumen llega los sábados, solo si registraste operaciones esa semana.',
  },
  pt: {
    subject: 'A tua semana: {n} operações', lead: 'Resumo das tuas operações de {range}.',
    trades: 'Operações', winRate: 'Taxa de acerto', net: 'Resultado líquido', best: 'Melhor operação', worst: 'Pior operação',
    top: 'Mais negociado', prev: 'Líquido da semana anterior', tip: 'Dá uma olhada nas notas da semana: que operações seguiram o teu plano e quais não?',
    cta: 'Abrir o teu diário', foot: 'Este resumo chega aos sábados, só se registaste operações nessa semana.',
  },
  de: {
    subject: 'Deine Woche: {n} Trades', lead: 'Zusammenfassung deiner Trades vom {range}.',
    trades: 'Trades', winRate: 'Trefferquote', net: 'Nettoergebnis', best: 'Bester Trade', worst: 'Schlechtester Trade',
    top: 'Am häufigsten gehandelt', prev: 'Netto Vorwoche', tip: 'Wirf einen Blick auf die Notizen der Woche: Welche Trades folgten deinem Plan, welche nicht?',
    cta: 'Journal öffnen', foot: 'Diese Zusammenfassung kommt samstags – nur wenn du in der Woche Trades erfasst hast.',
  },
  fr: {
    subject: 'Votre semaine : {n} trades', lead: 'Résumé de vos trades du {range}.',
    trades: 'Trades', winRate: 'Taux de réussite', net: 'Résultat net', best: 'Meilleur trade', worst: 'Pire trade',
    top: 'Le plus tradé', prev: 'Net semaine précédente', tip: 'Jetez un œil aux notes de la semaine : quels trades ont suivi votre plan, lesquels non ?',
    cta: 'Ouvrir votre journal', foot: 'Ce résumé arrive le samedi, seulement si vous avez enregistré des trades cette semaine-là.',
  },
};

const LOCALES: Record<Lang, string> = {
  tr: 'tr-TR', en: 'en-US', fa: 'fa-IR', ar: 'ar', ru: 'ru-RU', es: 'es-ES', pt: 'pt-PT', de: 'de-DE', fr: 'fr-FR',
};

function range(from: Date, to: Date, lang: Lang, timeZone?: string | null): string {
  const f = (d: Date) => {
    try { return new Intl.DateTimeFormat(LOCALES[lang], { day: 'numeric', month: 'long', timeZone: timeZone || 'UTC' }).format(d); }
    catch { return new Intl.DateTimeFormat(LOCALES[lang], { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d); }
  };
  return `${f(from)} – ${f(to)}`;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const APP = 'https://www.simpletradejournal.io/journal';
const UNSUB: Record<Lang, string> = {
  tr: 'Bu özeti almak istemiyorsan', en: 'Don\'t want these emails?', fa: 'این ایمیل‌ها را نمی‌خواهی؟', ar: 'لا تريد هذه الرسائل؟',
  ru: 'Не хотите получать такие письма?', es: '¿No quieres estos correos?', pt: 'Não queres estes e-mails?', de: 'Keine solchen E-Mails mehr?', fr: 'Vous ne voulez plus ces e-mails ?',
};
const UNSUB_LINK: Record<Lang, string> = {
  tr: 'buradan çık', en: 'Unsubscribe', fa: 'لغو اشتراک', ar: 'إلغاء الاشتراك',
  ru: 'Отписаться', es: 'Darse de baja', pt: 'Cancelar subscrição', de: 'Abmelden', fr: 'Se désabonner',
};

export function renderDigest(s: WeekStats, o: { lang: Lang; userId: string; currency?: string | null; timeZone?: string | null; from: Date; to: Date }) {
  const c = COPY[o.lang];
  const rtl = o.lang === 'fa' || o.lang === 'ar';
  const align = rtl ? 'right' : 'left';
  const unsub = unsubscribeUrl(o.userId);
  const subject = c.subject.replace('{n}', String(s.trades));
  const lead = c.lead.replace('{range}', range(o.from, o.to, o.lang, o.timeZone));
  const rows: [string, string][] = [
    [c.trades, `${s.trades} (${s.wins}W / ${s.losses}L)`],
    ...(s.winRate != null ? [[c.winRate, `${Math.round(s.winRate * 100)}%`] as [string, string]] : []),
    [c.net, money(s.net, o.currency)],
    [c.best, money(s.best, o.currency)],
    [c.worst, money(s.worst, o.currency)],
    ...(s.topSymbol ? [[c.top, s.topSymbol] as [string, string]] : []),
    ...(s.prevNet != null ? [[c.prev, money(s.prevNet, o.currency)] as [string, string]] : []),
  ];
  const html = `<!doctype html><html lang="${o.lang}" dir="${rtl ? 'rtl' : 'ltr'}"><body style="margin:0;background:#f4f4f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2030">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;padding:32px;text-align:${align}">
<tr><td style="font-size:14px;font-weight:600;color:#8b5cf6;padding-bottom:20px">Simple Trading Journal</td></tr>
<tr><td style="font-size:20px;font-weight:600;line-height:1.4;padding-bottom:16px">${esc(lead)}</td></tr>
<tr><td style="padding-bottom:16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${rows.map(([k, v]) => `<tr><td style="font-size:14px;color:#6b6d80;padding:8px 0;border-bottom:1px solid #eeeef3;text-align:${align}">${esc(k)}</td><td dir="ltr" style="font-size:15px;font-weight:600;padding:8px 0;border-bottom:1px solid #eeeef3;text-align:${rtl ? 'left' : 'right'}">${esc(v)}</td></tr>`).join('')}
</table></td></tr>
<tr><td style="font-size:15px;line-height:1.6;color:#44465a;padding-bottom:12px">${esc(c.tip)}</td></tr>
<tr><td style="padding:8px 0 24px"><a href="${APP}" style="display:inline-block;background:#8b5cf6;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:999px">${esc(c.cta)}</a></td></tr>
<tr><td style="font-size:13px;line-height:1.6;color:#6b6d80">${esc(c.foot)}</td></tr>
</table>
<p style="font-size:12px;color:#9a9cad;margin:16px 0 0">${esc(UNSUB[o.lang])} <a href="${unsub}" style="color:#9a9cad">${esc(UNSUB_LINK[o.lang])}</a></p>
</td></tr></table></body></html>`;
  const text = [lead, '', ...rows.map(([k, v]) => `${k}: ${v}`), '', c.tip, '', `${c.cta}: ${APP}`, '', c.foot, '', `${UNSUB[o.lang]} ${UNSUB_LINK[o.lang]}: ${unsub}`].join('\n');
  return { subject, html, text, unsub };
}

export const DIGEST_LANGS = Object.keys(COPY) as Lang[];

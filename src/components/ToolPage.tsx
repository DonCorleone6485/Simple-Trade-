import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Lock as LogoLock } from './Logo';
import { ARTICLE_LANGS, articleText, findArticle, type ArticleLang } from '../content/articles';
import { PROP_FIRMS } from '../content/directory';
import { DIRECTORY_LINKS } from './DirectoryPage';
import { TOOLS, TOOL_TEXT, findTool, toolMeta, toolPath, type ToolKey, type ToolText } from '../content/tools';
import { langPath } from '../lib/langPath';
import { positionSize, propLoss, riskReward, type LossBase } from '../lib/toolMath';

/**
 * Ücretsiz hesap makineleri (/tools, /tools/<makine>). Hesaplar
 * lib/toolMath.ts'te, metinler content/tools.ts'te (dokuz dil). Görünüş blog
 * ve prop firma sayfalarıyla aynı aile. Hiçbir şey kaydedilmez ya da
 * gönderilmez: her şey tarayıcıda.
 */
const SITE = 'https://www.simpletradejournal.io';
const muted = { color: 'rgba(255,255,255,0.72)' };

/** Sayı biçimi: Farsça ve Arapçada da Latin rakam, girişlerle aynı olsun. */
const NUM_LOCALE: Record<ArticleLang, string> = {
  en: 'en-US', tr: 'tr-TR', fa: 'fa-u-nu-latn', ar: 'ar-u-nu-latn', ru: 'ru-RU', es: 'es-ES', pt: 'pt-PT', de: 'de-DE', fr: 'fr-FR',
};
const fmt = (n: number, lang: ArticleLang, max = 2) =>
  new Intl.NumberFormat(NUM_LOCALE[lang], { maximumFractionDigits: max }).format(n);
/** Fiyat mesafeleri için (0,0020 gibi) daha çok basamak. */
const fmtPrice = (n: number, lang: ArticleLang) =>
  new Intl.NumberFormat(NUM_LOCALE[lang], { maximumFractionDigits: 5 }).format(n);

/** "1,5" ve "1.5" ikisi de kabul; boş ya da geçersizse NaN. */
const num = (s: string) => {
  const v = s.trim().replace(',', '.');
  return v === '' ? NaN : Number(v);
};

function Field({ label, value, onChange, suffix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <label className="block">
      <span className="block text-[13px] mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="text" inputMode="decimal" dir="ltr" value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-lg px-3 py-2.5 text-[15px] text-white outline-none focus:ring-2 focus:ring-violet-500/60"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
        />
        {suffix && <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.45)' }} dir="ltr">{suffix}</span>}
      </span>
    </label>
  );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <dt className="text-[14px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</dt>
      <dd className={`text-[16px] tabular-nums ${strong ? 'font-medium text-white' : ''}`} style={strong ? undefined : muted} dir="ltr">{value}</dd>
    </div>
  );
}

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-2xl p-5 sm:p-6 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>{children}</div>
);

function Message({ text }: { text: string }) {
  return <p className="text-[14.5px] rounded-xl px-4 py-3" style={{ background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.2)', color: 'rgba(255,255,255,0.75)' }}>{text}</p>;
}

function PositionCalc({ t, lang }: { t: ToolText; lang: ArticleLang }) {
  const [balance, setBalance] = useState('10000');
  const [riskPct, setRiskPct] = useState('1');
  const [stopPips, setStopPips] = useState('20');
  const [pipValue, setPipValue] = useState('10');
  const r = positionSize({ balance: num(balance), riskPct: num(riskPct), stopPips: num(stopPips), pipValuePerLot: num(pipValue) });
  return (
    <>
      <Panel>
        <h2 className="text-[12px] uppercase tracking-[0.14em] mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.inputs}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.balance} value={balance} onChange={setBalance} />
          <Field label={t.riskPct} value={riskPct} onChange={setRiskPct} suffix="%" />
          <Field label={t.stopPips} value={stopPips} onChange={setStopPips} />
          <Field label={t.pipValue} value={pipValue} onChange={setPipValue} />
        </div>
      </Panel>
      <Panel>
        <h2 className="text-[12px] uppercase tracking-[0.14em] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.results}</h2>
        {r ? (
          <dl aria-live="polite">
            <Row label={t.riskAmount} value={fmt(r.riskAmount, lang)} />
            <Row label={t.lots} value={fmt(r.lots, lang)} strong />
            <Row label={t.actualRisk} value={fmt(r.actualRisk, lang)} />
          </dl>
        ) : <Message text={t.invalid} />}
      </Panel>
    </>
  );
}

function RiskRewardCalc({ t, lang }: { t: ToolText; lang: ArticleLang }) {
  const [entry, setEntry] = useState('1.0850');
  const [stop, setStop] = useState('1.0830');
  const [target, setTarget] = useState('1.0890');
  const [winRate, setWinRate] = useState('45');
  const wr = num(winRate);
  const r = riskReward({ entry: num(entry), stop: num(stop), target: num(target), winRatePct: Number.isNaN(wr) ? null : wr });
  return (
    <>
      <Panel>
        <h2 className="text-[12px] uppercase tracking-[0.14em] mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.inputs}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.entry} value={entry} onChange={setEntry} />
          <Field label={t.stop} value={stop} onChange={setStop} />
          <Field label={t.target} value={target} onChange={setTarget} />
          <Field label={t.winRate} value={winRate} onChange={setWinRate} suffix="%" />
        </div>
      </Panel>
      <Panel>
        <h2 className="text-[12px] uppercase tracking-[0.14em] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.results}</h2>
        {'value' in r ? (
          <dl aria-live="polite">
            <Row label={t.riskDist} value={fmtPrice(r.value.risk, lang)} />
            <Row label={t.rewardDist} value={fmtPrice(r.value.reward, lang)} />
            <Row label={t.ratio} value={`1 : ${fmt(r.value.ratio, lang)}  (${fmt(r.value.ratio, lang)}R)`} strong />
            <Row label={t.beRate} value={`${fmt(r.value.breakEvenWinRate, lang, 1)}%`} />
            {r.value.expectancyR != null && (
              <Row label={t.expectancy} value={`${r.value.expectancyR > 0 ? '+' : ''}${fmt(r.value.expectancyR, lang)}R`} strong />
            )}
          </dl>
        ) : <Message text={r.error === 'direction' ? t.direction : t.invalid} />}
      </Panel>
    </>
  );
}

/** Ön ayar olarak yalnız günlük sınırı tek bir yüzde olan programlar: "3% / 5%" gibi seçeneğe bağlı olanlar tahmine yol açar. */
const PRESETS = PROP_FIRMS.flatMap(f => f.programs
  .filter(p => p.daily && /^\d+(\.\d+)?%$/.test(p.daily) && /^\d+(\.\d+)?%$/.test(p.max))
  .map(p => ({ id: `${f.slug}:${p.name}`, label: `${f.name} — ${p.name}`, daily: p.daily!.replace('%', ''), max: p.max.replace('%', ''), maxType: p.maxType })));

function PropCalc({ t, lang }: { t: ToolText; lang: ArticleLang }) {
  const [size, setSize] = useState('100000');
  const [dailyPct, setDailyPct] = useState('5');
  const [maxPct, setMaxPct] = useState('10');
  const [base, setBase] = useState<LossBase>('static');
  const [balance, setBalance] = useState('98500');
  const [dayStart, setDayStart] = useState('100000');
  const [highest, setHighest] = useState('100000');
  const [preset, setPreset] = useState('');

  const pick = (id: string) => {
    setPreset(id);
    const p = PRESETS.find(x => x.id === id);
    if (!p) return;
    setDailyPct(p.daily);
    setMaxPct(p.max);
    if (p.maxType === 'static') setBase('static');
    else if (p.maxType === 'trailing' || p.maxType === 'eodTrailing') setBase('trailing');
  };

  const r = propLoss({ size: num(size), dailyPct: num(dailyPct), maxPct: num(maxPct), base, balance: num(balance), dayStart: num(dayStart), highest: num(highest) });
  const ok = r && r.dailyLeft >= 0 && r.totalLeft >= 0;
  return (
    <>
      <Panel>
        <h2 className="text-[12px] uppercase tracking-[0.14em] mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.inputs}</h2>
        <label className="block mb-4">
          <span className="block text-[13px] mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{t.preset}</span>
          <select value={preset} onChange={e => pick(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-[15px] text-white outline-none focus:ring-2 focus:ring-violet-500/60"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <option value="" style={{ color: '#000' }}>{t.custom}</option>
            {PRESETS.map(p => <option key={p.id} value={p.id} style={{ color: '#000' }}>{p.label}</option>)}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.size} value={size} onChange={setSize} />
          <label className="block">
            <span className="block text-[13px] mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{t.lossType}</span>
            <select value={base} onChange={e => { setBase(e.target.value as LossBase); setPreset(''); }}
              className="w-full rounded-lg px-3 py-2.5 text-[15px] text-white outline-none focus:ring-2 focus:ring-violet-500/60"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <option value="static" style={{ color: '#000' }}>{t.optStatic}</option>
              <option value="trailing" style={{ color: '#000' }}>{t.optTrailing}</option>
            </select>
          </label>
          <Field label={t.dailyPct} value={dailyPct} onChange={v => { setDailyPct(v); setPreset(''); }} suffix="%" />
          <Field label={t.maxPct} value={maxPct} onChange={v => { setMaxPct(v); setPreset(''); }} suffix="%" />
          <Field label={t.currentBalance} value={balance} onChange={setBalance} />
          <Field label={t.dayStart} value={dayStart} onChange={setDayStart} />
          {base === 'trailing' && <Field label={t.highest} value={highest} onChange={setHighest} />}
        </div>
      </Panel>
      <Panel>
        <h2 className="text-[12px] uppercase tracking-[0.14em] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.results}</h2>
        {r ? (
          <dl aria-live="polite">
            <Row label={t.dailyLimit} value={fmt(r.dailyLimit, lang)} />
            <Row label={t.dailyFloor} value={fmt(r.dailyFloor, lang)} />
            <Row label={t.dailyLeft} value={fmt(r.dailyLeft, lang)} strong />
            <Row label={t.totalFloor} value={fmt(r.totalFloor, lang)} />
            <Row label={t.totalLeft} value={fmt(r.totalLeft, lang)} strong />
            <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="inline-block rounded-full px-3 py-1 text-[13px] font-medium"
                style={ok ? { background: 'rgba(52,211,153,0.12)', color: '#6ee7b7' } : { background: 'rgba(248,113,113,0.14)', color: '#fca5a5' }}>
                {ok ? t.within : t.breached}
              </span>
            </div>
          </dl>
        ) : <Message text={t.invalid} />}
      </Panel>
    </>
  );
}

const Card: React.FC<{ href: string; onClick: () => void; title: string; text: string; lang: ArticleLang; cta?: string }> = ({ href, onClick, title, text, lang, cta }) => (
  <a href={langPath(href, lang)} onClick={e => { e.preventDefault(); onClick(); }}
    className="block rounded-2xl p-6 transition-colors hover:bg-white/[0.05]"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
    <h3 className="text-[17px] font-medium text-white mb-2">{title}</h3>
    {text && <p className="text-[14.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{text}</p>}
    {cta && <span className="link-gold inline-block mt-3 text-[14px]">{cta}</span>}
  </a>
);

export default function ToolPage({ path, onHome, onOpen, cta }: {
  /** /tools ya da /tools/<makine> */
  path: string;
  onHome: () => void;
  onOpen: (path: string) => void;
  cta: { label: string; onClick: () => void };
}) {
  const { language } = useLanguage();
  const lang: ArticleLang = (ARTICLE_LANGS as string[]).includes(language) ? (language as ArticleLang) : 'en';
  const t = TOOL_TEXT[lang];
  const rtl = lang === 'fa' || lang === 'ar';
  const tool = findTool(path.split('/')[2] || '');
  const meta = toolMeta(path, lang);

  useEffect(() => {
    if (meta) document.title = meta.title;
    window.scrollTo(0, 0);
  }, [path, lang]);

  const breadcrumb = [
    { name: t.home, path: '/' },
    { name: t.tools, path: '/tools' },
    ...(tool ? [{ name: t[tool.key].title, path: toolPath(tool.slug) }] : []),
  ];
  const jsonLd: object[] = [{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: SITE + langPath(b.path, lang) })),
  }];
  if (tool) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: t[tool.key].title,
      description: t[tool.key].description,
      url: SITE + langPath(toolPath(tool.slug), lang),
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      inLanguage: lang,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });
  }

  const back = (to: string, label: string, onClick: () => void) => (
    <a href={langPath(to, lang)} onClick={e => { e.preventDefault(); onClick(); }}
      className="link-gold inline-flex items-center gap-1.5 text-[13px] mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
      <ArrowLeft className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
      {label}
    </a>
  );
  const h2 = (text: string) => <h2 className="text-[21px] font-medium text-white mt-10 mb-3">{text}</h2>;

  const ctaBox = (
    <section className="rounded-2xl p-7 mt-14" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
      <h2 className="text-[19px] font-medium text-white mb-2">{t.ctaTitle}</h2>
      <p className="text-[15px] leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>{t.ctaText}</p>
      <button onClick={cta.onClick} className="cta px-5 py-2.5 rounded-full text-[15px] font-medium" style={{ background: '#8b5cf6', color: '#fff' }}>
        {cta.label}
      </button>
    </section>
  );

  /** Aracın yanında okunacak yazılar: aynı konuda hazır sayfalar. */
  const related = (key: ToolKey): { path: string; title: string }[] => {
    const art = (section: 'blog' | 'guides', slug: string) => {
      const a = findArticle(section, slug);
      return a ? { path: `/${section}/${slug}`, title: articleText(a, lang).title } : null;
    };
    const list = key === 'pos'
      ? [art('blog', 'position-sizing-risk-per-trade'), art('guides', 'trading-glossary')]
      : key === 'rr'
        ? [art('blog', 'r-multiple-explained'), art('blog', 'expectancy-and-profit-factor')]
        : [{ path: '/prop-firms', title: DIRECTORY_LINKS.propFirms[lang] }, art('blog', 'prop-firm-daily-loss-and-drawdown')];
    return list.filter((x): x is { path: string; title: string } => !!x);
  };

  let body: React.ReactNode;
  if (tool) {
    const c = t[tool.key];
    const others = TOOLS.filter(x => x.key !== tool.key);
    body = (
      <>
        {back('/tools', t.allTools, () => onOpen('/tools'))}
        <article dir={rtl ? 'rtl' : 'ltr'} lang={lang}>
          <div className="text-[12px] uppercase tracking-[0.14em] mb-3" style={{ color: '#f0b429' }}>{t.tools}</div>
          <h1 className="poster text-[2rem] sm:text-[2.6rem] leading-tight mb-4">{c.title}</h1>
          <p className="text-[16px] leading-[1.75] mb-8" style={muted}>{c.lead}</p>

          {tool.key === 'pos' && <PositionCalc t={t} lang={lang} />}
          {tool.key === 'rr' && <RiskRewardCalc t={t} lang={lang} />}
          {tool.key === 'prop' && <PropCalc t={t} lang={lang} />}

          <p className="text-[13.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.disclaimer}</p>

          {h2(t.howH2)}
          {c.how.map((p, i) => <p key={i} className="text-[16px] leading-[1.75] mb-4" style={muted}>{p}</p>)}
          {h2(t.tipsH2)}
          <ul className="list-disc ps-6 mb-4 space-y-2 text-[16px] leading-[1.7]" style={muted}>
            {c.tips.map((p, i) => <li key={i} className="ps-1">{p}</li>)}
          </ul>
        </article>
        {ctaBox}
        <h2 className="text-[12px] uppercase tracking-[0.14em] mt-14 mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.tools}</h2>
        <div className="grid gap-4" dir={rtl ? 'rtl' : 'ltr'}>
          {related(tool.key).map(r => <Card key={r.path} href={r.path} onClick={() => onOpen(r.path)} lang={lang} title={r.title} text="" />)}
          {others.map(o => <Card key={o.slug} href={toolPath(o.slug)} onClick={() => onOpen(toolPath(o.slug))} lang={lang} title={t[o.key].title} text={t[o.key].lead} />)}
        </div>
      </>
    );
  } else {
    body = (
      <>
        {back('/', t.home, onHome)}
        <div dir={rtl ? 'rtl' : 'ltr'}>
          <h1 className="poster text-[2.2rem] sm:text-[2.8rem] mb-3">{t.indexTitle}</h1>
          <p className="text-[16px] leading-relaxed mb-12" style={{ color: 'rgba(255,255,255,0.55)' }}>{t.indexLead}</p>
          <div className="grid gap-4">
            {TOOLS.map(o => <Card key={o.slug} href={toolPath(o.slug)} onClick={() => onOpen(toolPath(o.slug))} lang={lang}
              title={t[o.key].title} text={t[o.key].lead} cta={t.open} />)}
          </div>
          <p className="text-[13.5px] leading-relaxed mt-8" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.disclaimer}</p>
        </div>
        {ctaBox}
      </>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#0d0e1a' }}>
      <header className="max-w-3xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href={langPath('/', lang)} onClick={e => { e.preventDefault(); onHome(); }} aria-label="Simple Trading Journal">
          <LogoLock className="h-[26px] w-auto text-white" />
        </a>
        <button onClick={cta.onClick} className="cta px-4 py-2 rounded-full text-sm font-medium" style={{ background: '#8b5cf6', color: '#fff' }}>
          {cta.label}
        </button>
      </header>
      <main className="max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-24">
        {body}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      </main>
    </div>
  );
}

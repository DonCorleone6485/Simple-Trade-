import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FFEvent {
  title: string;
  country: string;   // para birimi kodu: USD, EUR...
  date: string;      // ISO, kaynağın kendi saat diliminde
  impact: string;    // High | Medium | Low | Holiday
  forecast: string;
  previous: string;
}

/**
 * Seanslar, şehirlerinin yerel saatiyle tanımlı.
 *
 * Sabit UTC aralıkları yazmak yaz saatinde kayar: Londra yılın yarısında
 * UTC+0, yarısında UTC+1. Şehrin saat dilimini kullanınca bu kendiliğinden
 * doğru olur.
 */
const SESSIONS = [
  { key: 'sydney', tz: 'Australia/Sydney', open: 8, close: 17, tr: 'Sidney', en: 'Sydney' },
  { key: 'tokyo', tz: 'Asia/Tokyo', open: 9, close: 18, tr: 'Tokyo', en: 'Tokyo' },
  { key: 'london', tz: 'Europe/London', open: 8, close: 17, tr: 'Londra', en: 'London' },
  { key: 'newyork', tz: 'America/New_York', open: 8, close: 17, tr: 'New York', en: 'New York' },
];

/** Bir şehirde şu an saat kaç (ondalık saat olarak). */
function hourIn(tz: string, now: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short',
  }).formatToParts(now);
  const get = (t: string) => parts.find(p => p.type === t)?.value || '0';
  return Number(get('hour')) + Number(get('minute')) / 60;
}

function weekdayIn(tz: string, now: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(now);
}

const IMPACT: Record<string, { color: string; tr: string; en: string }> = {
  High: { color: '#f87171', tr: 'Yüksek', en: 'High' },
  Medium: { color: '#fbbf24', tr: 'Orta', en: 'Medium' },
  Low: { color: 'rgba(255,255,255,0.35)', tr: 'Düşük', en: 'Low' },
  Holiday: { color: '#818cf8', tr: 'Tatil', en: 'Holiday' },
};

export default function MarketView() {
  const { language } = useLanguage();
  const tr = (a: string, b: string) => (language === 'tr' ? a : b);
  const locale = language === 'tr' ? 'tr-TR' : language === 'fa' ? 'fa-IR' : 'en-US';

  const [now, setNow] = useState(new Date());
  const [events, setEvents] = useState<FFEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyImportant, setOnlyImportant] = useState(true);

  // Saat başlıklarının canlı kalması için dakikada bir yeter.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/calendar')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => { if (!cancelled) setEvents(d.events || []); })
      .catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, []);

  const card: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '18px',
  };
  const label: React.CSSProperties = {
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em',
    color: 'rgba(255,255,255,0.3)',
  };

  const fmtLeft = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h > 0) return `${h}${tr('s', 'h')} ${m}${tr('dk', 'm')}`;
    return `${m}${tr('dk', 'm')}`;
  };

  // ── Bugünün ve sonraki günlerin olayları ──
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const upcoming = (events || [])
    .map(e => ({ ...e, when: new Date(e.date) }))
    .filter(e => !isNaN(e.when.getTime()) && e.when >= today)
    .filter(e => (onlyImportant ? e.impact === 'High' || e.impact === 'Medium' : true))
    .sort((a, b) => a.when.getTime() - b.when.getTime());

  type Dated = typeof upcoming[number];
  const byDay = upcoming.reduce<Record<string, Dated[]>>((acc, e) => {
    const key = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(e.when);
    (acc[key] = acc[key] || []).push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-10 max-w-4xl">

      {/* ── Seanslar ── */}
      <section>
        <div style={label} className="mb-5">{tr('Seanslar', 'Sessions')}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SESSIONS.map(s => {
            const h = hourIn(s.tz, now);
            const day = weekdayIn(s.tz, now);
            const weekend = day === 'Sat' || day === 'Sun';
            const open = !weekend && h >= s.open && h < s.close;
            const left = open ? s.close - h : (h < s.open ? s.open - h : 24 - h + s.open);

            return (
              <div key={s.key} style={{ ...card, padding: '18px' }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: open ? '#34d399' : 'rgba(255,255,255,0.2)' }} />
                  <span className="text-[14px] font-medium">{language === 'tr' ? s.tr : s.en}</span>
                </div>
                <div className="font-mono text-[19px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {new Intl.DateTimeFormat('en-GB', { timeZone: s.tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(now)}
                </div>
                <div className="text-[12px] mt-1.5" style={{ color: open ? '#34d399' : 'rgba(255,255,255,0.3)' }}>
                  {weekend
                    ? tr('kapalı', 'closed')
                    : open
                    ? `${tr('açık', 'open')} · ${fmtLeft(left)} ${tr('kaldı', 'left')}`
                    : `${fmtLeft(left)} ${tr('sonra açılır', 'to open')}`}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Ekonomik takvim ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <span style={label}>{tr('Ekonomik Takvim', 'Economic Calendar')}</span>
          <button onClick={() => setOnlyImportant(v => !v)} className="text-[12.5px]"
            style={{ color: onlyImportant ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}>
            {onlyImportant ? tr('Sadece önemli olaylar', 'Important events only') : tr('Tüm olaylar', 'All events')}
          </button>
        </div>

        {error && (
          <div className="rounded-xl p-4 flex items-center gap-2" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#f87171' }} />
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {tr('Takvim şu an alınamadı.', 'The calendar could not be loaded right now.')}
            </span>
          </div>
        )}

        {!events && !error && (
          <div className="flex items-center gap-3 py-6">
            <Loader className="w-4 h-4 animate-spin" style={{ color: '#8b5cf6' }} />
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{tr('Yükleniyor…', 'Loading…')}</span>
          </div>
        )}

        {events && upcoming.length === 0 && (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {tr('Bu haftanın kalanında olay yok.', 'Nothing left on the calendar this week.')}
          </p>
        )}

        {(Object.entries(byDay) as [string, Dated[]][]).map(([day, list]) => (
          <div key={day} className="mb-8">
            <h3 className="font-display text-[16px] mb-3 pb-2.5"
              style={{ color: 'rgba(255,255,255,0.55)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {day}
            </h3>
            <ul>
              {list.map((e, i) => {
                const imp = IMPACT[e.impact] || IMPACT.Low;
                const past = e.when < now;
                return (
                  <li key={i} className="flex items-center gap-4 py-2.5"
                    style={{
                      borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                      opacity: past ? 0.4 : 1,
                    }}>
                    <span className="w-12 font-mono text-[13px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(e.when)}
                    </span>
                    <span className="w-10 font-mono text-[12.5px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {e.country}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: imp.color }}
                      title={language === 'tr' ? imp.tr : imp.en} />
                    <span className="flex-1 text-[14px] min-w-0 truncate">{e.title}</span>
                    {(e.forecast || e.previous) && (
                      <span className="hidden sm:flex items-center gap-4 font-mono text-[12.5px] flex-shrink-0"
                        style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {e.forecast && <span>{tr('bek', 'fc')} {e.forecast}</span>}
                        {e.previous && <span>{tr('önc', 'prev')} {e.previous}</span>}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <p className="text-[11.5px] pt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {tr('Saatler kendi saat dilimine göre gösteriliyor. Kaynak: ForexFactory.',
              'Times are shown in your own timezone. Source: ForexFactory.')}
        </p>
      </section>
    </div>
  );
}

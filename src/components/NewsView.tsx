import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { NewsEvent } from '../lib/news';

/**
 * Etki derecesi.
 *
 * Renkli bir nokta tek başına okunmuyordu — kırmızı mı turuncu mu, küçük bir
 * daireden anlaşılmıyor. Derecenin adını yazıyoruz; renk yalnızca destekliyor.
 */
const IMPACT: Record<string, { color: string; bg: string; tr: string; en: string }> = {
  High:    { color: '#f87171', bg: 'rgba(248,113,113,0.14)', tr: 'Yüksek', en: 'High' },
  Medium:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.13)',  tr: 'Orta',   en: 'Medium' },
  Low:     { color: 'rgba(255,255,255,0.45)', bg: 'rgba(255,255,255,0.06)', tr: 'Düşük', en: 'Low' },
  Holiday: { color: '#818cf8', bg: 'rgba(129,140,248,0.14)', tr: 'Tatil',  en: 'Holiday' },
};

export default function NewsView() {
  const { language } = useLanguage();
  const tr = (a: string, b: string) => (language === 'tr' ? a : b);
  const locale = language === 'tr' ? 'tr-TR' : language === 'fa' ? 'fa-IR' : 'en-US';

  const [now, setNow] = useState(new Date());
  const [events, setEvents] = useState<NewsEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyImportant, setOnlyImportant] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
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

  const isToday = (d: Date) => d.toDateString() === now.toDateString();

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-end mb-6">
        <button onClick={() => setOnlyImportant(v => !v)} className="text-[13px]"
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
        <div key={day} className="mb-9">
          <h3 className="font-display text-[17px] mb-3 pb-2.5 flex items-baseline gap-3"
            style={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {day}
            {isToday(list[0].when) && (
              <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: '#a78bfa' }}>
                {tr('bugün', 'today')}
              </span>
            )}
          </h3>
          <ul>
            {list.map((e, i) => {
              const imp = IMPACT[e.impact] || IMPACT.Low;
              const past = e.when < now;
              return (
                <li key={i} className="flex items-center gap-4 py-3"
                  style={{
                    borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                    opacity: past ? 0.4 : 1,
                  }}>
                  <span className="w-12 font-mono text-[13.5px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(e.when)}
                  </span>

                  <span className="w-11 font-mono text-[12.5px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {e.country}
                  </span>

                  {/* Derecenin adı yazılı: renk destek, bilgi değil. */}
                  <span className="flex-shrink-0 text-center text-[11px] font-medium px-2.5 py-1 rounded-md"
                    style={{ background: imp.bg, color: imp.color, minWidth: '58px' }}>
                    {language === 'tr' ? imp.tr : imp.en}
                  </span>

                  <span className="flex-1 text-[14.5px] min-w-0 truncate">{e.title}</span>

                  {(e.forecast || e.previous) && (
                    <span className="hidden sm:flex items-center gap-5 font-mono text-[12.5px] flex-shrink-0"
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
    </div>
  );
}

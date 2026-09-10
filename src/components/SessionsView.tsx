import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

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

function hourIn(tz: string, now: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find(p => p.type === t)?.value || '0';
  return Number(get('hour')) + Number(get('minute')) / 60;
}

const weekdayIn = (tz: string, now: Date) =>
  new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(now);

export default function SessionsView() {
  const { language } = useLanguage();
  const tr = (a: string, b: string) => (language === 'tr' ? a : b);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const card: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '18px',
    padding: '20px',
  };

  const fmtLeft = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return h > 0 ? `${h}${tr('s', 'h')} ${m}${tr('dk', 'm')}` : `${m}${tr('dk', 'm')}`;
  };

  return (
    <div className="max-w-4xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SESSIONS.map(s => {
          const h = hourIn(s.tz, now);
          const day = weekdayIn(s.tz, now);
          const weekend = day === 'Sat' || day === 'Sun';
          const open = !weekend && h >= s.open && h < s.close;
          const left = open ? s.close - h : (h < s.open ? s.open - h : 24 - h + s.open);

          return (
            <div key={s.key} style={card}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: open ? '#34d399' : 'rgba(255,255,255,0.2)' }} />
                <span className="text-[14px] font-medium">{language === 'tr' ? s.tr : s.en}</span>
              </div>
              <div className="font-mono text-[21px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
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

      <p className="text-[11.5px] mt-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
        {tr('Saatler her seansın kendi şehrine göre. Yaz saati değişimleri kendiliğinden hesaba katılır.',
            'Clocks show each session\'s own city. Daylight saving changes are handled automatically.')}
      </p>
    </div>
  );
}

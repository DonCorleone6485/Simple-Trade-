import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SESSIONS, sessionState } from '../lib/sessions';

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
          const { weekend, open, left } = sessionState(s, now);

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

import React, { useEffect, useState } from 'react';
import { SESSIONS, sessionState } from '../lib/sessions';
import { NewsEvent } from '../lib/news';
import { useLanguage } from '../context/LanguageContext';

/**
 * Başlık çubuğundaki sessiz şerit.
 *
 * Başlıkla sağdaki düğmeler arasında boş duran yer, sürekli değişen ve
 * bakmadan bilinemeyen iki bilgiye ayrıldı: hangi seans açık, ve bugünün
 * sıradaki önemli haberi ne zaman.
 *
 * NEDEN KAYMIYOR: kayan bir bant iki şeyi birden bozar. Okumak istediğinde
 * okuyamazsın — yazının sana gelmesini beklersin. Ve sen bakmazken bile
 * kıpırdar; göz kenarındaki hareket dikkati istemsiz çeker, ki grafik
 * karşısında oturan birinin istediği son şey budur. Burada yerinden kıpırdayan
 * hiçbir şey yok: dakikada bir yalnızca sayılar sayıyor.
 *
 * Bugün birden çok önemli haber varsa ikinci yuva aralarında geçiş yapar —
 * kayarak değil, solarak. Geçiş okunabilirliği bozmuyor.
 */

const FADE_MS = 8000;

/** "2:15" — saat ve dakika. Bir saatin altındaysa yalnız dakika. */
function countdown(hours: number): string {
  const total = Math.max(0, Math.round(hours * 60));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}` : `${m}dk`;
}

const IMPACT_COLOR: Record<string, string> = {
  High: '#f87171',
  Medium: '#fbbf24',
};

function Slot({ dot, label, children, onClick }: {
  dot: string; label: string; children: React.ReactNode; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="ui-pill flex items-center gap-2 px-2.5 py-1.5 rounded-lg whitespace-nowrap"
      style={{ background: 'transparent', border: '1px solid transparent' }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
      <span className="text-[9.5px] uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
      <span className="text-[12.5px]" style={{ color: 'rgba(255,255,255,0.62)' }}>{children}</span>
    </button>
  );
}

export default function HeaderStrip({ onOpenSessions, onOpenNews }: {
  onOpenSessions: () => void;
  onOpenNews: () => void;
}) {
  const { t, language } = useLanguage();
  const [now, setNow] = useState(new Date());
  const [events, setEvents] = useState<NewsEvent[] | null>(null);
  const [slide, setSlide] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/calendar')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error())))
      // Haber alınamazsa şerit susuyor, hata göstermiyor: bu bilgi yardımcı,
      // zorunlu değil. Kırmızı bir uyarı başlık çubuğunda yersiz olurdu.
      .then(d => { if (!cancelled) setEvents(d.events || []); })
      .catch(() => { if (!cancelled) setEvents([]); });
    return () => { cancelled = true; };
  }, []);

  // ── Seans ──
  const states = SESSIONS.map(s => sessionState(s, now));
  const open = states.find(s => s.open);
  // Açık seans yoksa en yakın açılacak olanı gösteriyoruz — "hiçbiri açık
  // değil" demek yerine "şuna şu kadar var" demek daha işe yarar.
  const next = states.filter(s => !s.open).sort((a, b) => a.left - b.left)[0];

  // ── Bugünün kalan önemli haberleri ──
  const upcoming = (events || [])
    .filter(e => {
      const d = new Date(e.date);
      return (
        (e.impact === 'High' || e.impact === 'Medium') &&
        d.getTime() > now.getTime() &&
        d.toDateString() === now.toDateString()
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Birden fazlaysa aralarında yumuşakça geçiş.
  useEffect(() => {
    if (upcoming.length < 2) { setSlide(0); return; }
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setSlide(i => (i + 1) % upcoming.length); setVisible(true); }, 260);
    }, FADE_MS);
    return () => clearInterval(id);
  }, [upcoming.length]);

  const item = upcoming[slide % Math.max(1, upcoming.length)];
  const locale = language === 'tr' ? 'tr-TR' : language === 'fa' ? 'fa-IR' : 'en-US';

  return (
    // Dar ekranda tamamen gizleniyor: başlıkla çakışmaktansa hiç görünmesin.
    <div className="hidden lg:flex items-center gap-1 min-w-0">
      {(open || next) && (
        <Slot dot={open ? '#34d399' : 'rgba(255,255,255,0.25)'}
          label={t('stripSession')} onClick={onOpenSessions}>
          {open
            ? `${language === 'tr' ? open.session.tr : open.session.en} · ${countdown(open.left)}`
            : `${language === 'tr' ? next.session.tr : next.session.en} ${countdown(next.left)}`}
        </Slot>
      )}

      {item && (
        <Slot dot={IMPACT_COLOR[item.impact] || 'rgba(255,255,255,0.25)'}
          label={t('stripNext')} onClick={onOpenNews}>
          <span style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease', display: 'inline-block' }}>
            {new Date(item.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
            {' · '}
            {/* Uzun haber adları başlığı itiyordu; ekranda kalan yere göre
                kısalıyor, tamamı tıklayınca açılan sayfada duruyor. */}
            <span className="inline-block align-bottom truncate max-w-[180px] xl:max-w-[260px]">{item.title}</span>
          </span>
        </Slot>
      )}
    </div>
  );
}

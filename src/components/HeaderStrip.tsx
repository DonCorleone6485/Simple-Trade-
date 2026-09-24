import React, { useEffect, useState } from 'react';
import { SESSIONS, sessionState } from '../lib/sessions';
import { NewsEvent } from '../lib/news';
import { Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { loadAlerts, saveAlerts, permissionState, requestPermission } from '../lib/alerts';

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

/**
 * "6s 13dk" — birimleriyle.
 *
 * Önce "6:13" yazıyordu ve kimse ne olduğunu anlamıyordu: saat mi, kalan süre
 * mi, kapanış saati mi? İki harf ekleyince soru kalmıyor.
 */
function countdown(hours: number, hLabel: string, mLabel: string): string {
  const total = Math.max(0, Math.round(hours * 60));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}${hLabel} ${m}${mLabel}` : `${m}${mLabel}`;
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
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
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
  // Zil, uyarıların açık olup olmadığına göre görünüyor. Durumu her karede
  // localStorage'dan okumak yerine bir kez alıp burada tutuyoruz.
  const [alertsOn, setAlertsOn] = useState(() => {
    const a = loadAlerts();
    return a.news || a.session;
  });
  const [justOn, setJustOn] = useState(false);

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
  //
  // Tek bir seans göstermek yetmiyordu: "Londra 6s 13dk" yazısı, Londra'nın
  // kapanmasına mı yoksa açılmasına mı kaldığını söylemiyordu. Artık her
  // satır ne olduğunu yazıyor ve haber yuvası gibi sırayla dönüyor — açık
  // olanlar önce, sonra en yakın açılacaklar.
  const hLabel = t('stripHour');
  const mLabel = t('stripMinute');
  const states = SESSIONS.map(s => sessionState(s, now)).filter(s => !s.weekend);
  const sessionFacts = [
    ...states.filter(s => s.open).sort((a, b) => a.left - b.left)
      .map(s => ({
        open: true,
        text: `${language === 'tr' ? s.session.tr : s.session.en} · ${t('stripToClose')} ${countdown(s.left, hLabel, mLabel)}`,
      })),
    ...states.filter(s => !s.open).sort((a, b) => a.left - b.left).slice(0, 2)
      .map(s => ({
        open: false,
        text: `${language === 'tr' ? s.session.tr : s.session.en} · ${t('stripToOpen')} ${countdown(s.left, hLabel, mLabel)}`,
      })),
  ];

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

  // İki yuva tek sayaçla dönüyor: ayrı ayrı dönselerdi şerit sürekli bir
  // yerinden kıpırdıyor olurdu. Birlikte değişince göz bir kez bakıp geçiyor.
  const cycle = Math.max(sessionFacts.length, upcoming.length);
  useEffect(() => {
    if (cycle < 2) { setSlide(0); return; }
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setSlide(i => i + 1); setVisible(true); }, 260);
    }, FADE_MS);
    return () => clearInterval(id);
  }, [cycle]);

  const fade = { opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease', display: 'inline-block' } as const;

  /**
   * Keşif buradan oluyor.
   *
   * Uyarı anahtarları Günün Haberleri ve Seanslar sayfalarında duruyordu ve
   * oraya girmeyen kimse böyle bir şey olduğunu anlamıyordu. Oysa kullanıcı
   * uyarı isteyeceği anda tam da buraya bakıyor: sıradaki habere. Zil o yazının
   * yanında duruyor ve tek dokunuşla açıyor; ince ayar iki sayfada.
   */
  const turnOn = async () => {
    let state = permissionState();
    if (state === 'default') state = await requestPermission();
    if (state !== 'granted') return;
    const a = loadAlerts();
    saveAlerts({ ...a, news: true, session: true });
    setAlertsOn(true);
    // İzin zaten verilmişse tarayıcı hiçbir pencere açmıyor ve zil sessizce
    // kayboluyordu — tıklayan kişi bir şey olup olmadığını anlamıyordu.
    // Birkaç saniyelik teyit, o boşluğu kapatıyor.
    setJustOn(true);
    setTimeout(() => setJustOn(false), 4000);
  };

  // İzni reddetmiş kullanıcıya zil göstermek anlamsız: tıklasa da bir şey
  // olmuyor, tarayıcı bir daha sormuyor.
  const canOffer = !alertsOn && permissionState() !== 'denied' && permissionState() !== 'unsupported';
  const fact = sessionFacts.length ? sessionFacts[slide % sessionFacts.length] : null;
  const item = upcoming.length ? upcoming[slide % upcoming.length] : null;
  const locale = language === 'tr' ? 'tr-TR' : language === 'fa' ? 'fa-IR' : 'en-US';

  return (
    // Dar ekranda tamamen gizleniyor: başlıkla çakışmaktansa hiç görünmesin.
    <div className="hidden lg:flex items-center gap-1 min-w-0">
      {fact && (
        <Slot dot={fact.open ? '#34d399' : 'rgba(255,255,255,0.28)'}
          label={t('stripSession')} onClick={onOpenSessions}>
          <span style={fade}>{fact.text}</span>
        </Slot>
      )}

      {item && (
        <Slot dot={IMPACT_COLOR[item.impact] || 'rgba(255,255,255,0.25)'}
          label={t('stripNext')} onClick={onOpenNews}>
          <span style={fade}>
            {new Date(item.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
            {' · '}
            {/* Uzun haber adları başlığı itiyordu; ekranda kalan yere göre
                kısalıyor, tamamı tıklayınca açılan sayfada duruyor. */}
            <span className="inline-block align-bottom truncate max-w-[180px] xl:max-w-[260px]">{item.title}</span>
          </span>
        </Slot>
      )}
      {justOn && (
        <span className="flex items-center gap-1.5 px-2 py-1.5 text-[11.5px] flex-shrink-0" style={{ color: '#34d399' }}>
          <Bell className="w-3.5 h-3.5" />
          {t('alertsOnNow')}
        </span>
      )}

      {canOffer && (fact || item) && (
        <button onClick={turnOn} title={t('alertsRemindMe')}
          className="ui-pill flex items-center gap-1.5 px-2 py-1.5 rounded-lg flex-shrink-0"
          style={{ background: 'transparent', border: '1px solid transparent', color: 'rgba(255,255,255,0.35)' }}>
          <Bell className="w-3.5 h-3.5" />
          <span className="text-[11.5px]">{t('alertsRemindMe')}</span>
        </button>
      )}
    </div>
  );
}

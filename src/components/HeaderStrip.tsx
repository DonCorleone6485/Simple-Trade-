import React, { useEffect, useRef, useState } from 'react';
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

function Slot({ dot, label, children, onClick, maxText }: {
  dot: string; label: string; children: React.ReactNode; onClick: () => void;
  /** Yazının sığabileceği piksel — ölçülen alandan hesaplanıyor. */
  maxText?: number;
}) {
  return (
    <button onClick={onClick}
      className="ui-pill flex items-center gap-2 px-2.5 py-1.5 rounded-lg flex-shrink-0"
      style={{ background: 'transparent', border: '1px solid transparent' }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
      <span className="text-[9.5px] uppercase tracking-[0.12em] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
      {/* Genişliği esnek kutu pazarlığına bırakmak yerine açıkça veriyoruz:
          iç içe span'lerde üç nokta bir türlü çıkmıyor, yazı kabın kenarından
          kesiliyordu. Ölçülen alandan hesaplanan piksel sınırı kesin çalışıyor. */}
      <span className="text-[12.5px] block overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ color: 'rgba(255,255,255,0.62)', maxWidth: maxText ? `${maxText}px` : undefined }}>
        {children}
      </span>
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

  /**
   * Şeride KALAN alan.
   *
   * Yan taraftaki düğme sayısı ekrandan ekrana ve sayfadan sayfaya değişiyor
   * (journal ekranında dört düğme var, journal listesinde iki), o yüzden sabit
   * bir kırılma noktası tutmuyor. Kalan yeri ölçüp ona göre karar veriyoruz:
   * yer yoksa haber yuvası tamamen gizleniyor. Yarıda kesilmiş bir saat
   * ("17:0") hiç göstermemekten kötü.
   *
   * w-full şart: ölçtüğümüz şey içeriğin genişliği değil, kaba KALAN alan
   * olmalı. Aksi hâlde haber gizlenince şerit daralıyor, daraldığı için bir
   * daha asla yer açılmıyor ve haber bir kez kaybolduktan sonra geri
   * gelmiyordu.
   */
  const box = useRef<HTMLDivElement>(null);
  // Sıfırdan başlıyoruz: ölçüm gelene kadar hiçbir şey çizilmesin. Geniş bir
  // değerle başlasaydık ilk karede iki yuva birden çizilip düğmelerin üstüne
  // taşardı — kullanıcının gördüğü o anlık karışıklık.
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Journal ekranında düğmeler çok: 1140 piksellik başlık çubuğunda şeride
  // yalnızca ~350 piksel kalıyor, iki yuva oraya sığmıyor. Orada tek yuva
  // gösterip iki bilgiyi sırayla geçiriyoruz — böylece dar ekranda haber
  // büsbütün kaybolmuyor.
  const showBoth = width >= 430;
  const showAny = width >= 170;
  // Nokta, etiket, boşluklar ve düğme dolgusu ~110 piksel; kalanı yazıya.
  // İki yuva birden varsa alan ikiye bölünüyor.
  const textRoom = Math.max(60, Math.floor(width / (showBoth ? 2 : 1)) - 110);

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

  const locale = language === 'tr' ? 'tr-TR' : language === 'fa' ? 'fa-IR' : 'en-US';

  // ── Sıradaki önemli haberler ──
  //
  // Önce yalnızca BUGÜNÜN kalanları gösteriliyordu ve günün son haberi
  // geçtiği anda yuva kayboluyordu — akşam boyunca şerit yarı boş kalıyordu,
  // oysa yarın sabah için gösterilecek bir şey vardı. Artık gün sınırına
  // bakmıyoruz: sıradaki üç olay hangi güne düşüyorsa o.
  const upcoming = (events || [])
    .filter(e => (e.impact === 'High' || e.impact === 'Medium') && new Date(e.date).getTime() > now.getTime())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  /** Bugün değilse hangi gün olduğu yazılıyor; yoksa "12:15" yanıltıcı olur. */
  const dayPrefix = (d: Date): string => {
    if (d.toDateString() === now.toDateString()) return '';
    const t1 = new Date(now);
    t1.setDate(t1.getDate() + 1);
    if (d.toDateString() === t1.toDateString()) return `${t('stripTomorrow')} `;
    return `${d.toLocaleDateString(locale, { weekday: 'short' })} `;
  };

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

  // display'i satır içinde 'inline-block' vermek üç noktayı öldürüyordu:
  // satır içi stil sınıfı yeniyor, öğe içeriği kadar genişleyip kabın
  // kenarından kesiliyordu. Blok olarak kalmalı ki kısaltma çalışsın.
  const fade = { opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' } as const;

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
  /**
   * Dar alanda tek yuva var ve iki bilgi onu sırayla paylaşıyor.
   * Yalnızca biri varsa sıra hep onda kalıyor — boş yuva göstermiyoruz.
   */
  const soloIsSession = !item ? true : !fact ? false : slide % 2 === 0;

  return (
    // Dar ekranda tamamen gizleniyor: başlıkla çakışmaktansa hiç görünmesin.
    <div ref={box} className="hidden lg:flex items-center justify-center gap-1 w-full min-w-0 overflow-hidden">
      {fact && showAny && (!showBoth ? soloIsSession : true) && (
        <Slot dot={fact.open ? '#34d399' : 'rgba(255,255,255,0.28)'}
          label={t('stripSession')} onClick={onOpenSessions} maxText={textRoom}>
          <span style={fade} className="truncate">{fact.text}</span>
        </Slot>
      )}

      {item && showAny && (!showBoth ? !soloIsSession : true) && (
        <Slot dot={IMPACT_COLOR[item.impact] || 'rgba(255,255,255,0.25)'}
          label={t('stripNext')} onClick={onOpenNews} maxText={textRoom}>
          {/* Sabit bir genişlikle kesmek yerine kalan yere göre kısalıyor:
              düğme sayısı ekrandan ekrana değiştiği için sabit ölçü tutmuyordu.
              Tamamı, tıklayınca açılan sayfada duruyor. */}
          <span style={fade} className="truncate">
            {dayPrefix(new Date(item.date))}
            {new Date(item.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
            {' · '}
            {item.title}
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

import { useEffect, useRef } from 'react';
import { NewsEvent } from '../lib/news';
import { useLanguage } from '../context/LanguageContext';
import { dueAlerts, loadAlerts, loadFired, rememberFired, showAlert, permissionState } from '../lib/alerts';

/**
 * Bildirimleri zamanı gelince gösteren döngü. Ekrana hiçbir şey çizmiyor.
 *
 * AppShell'in içinde duruyor: hangi sayfada olursan ol çalışması gerekiyor,
 * kullanıcı Günün Haberleri'nde beklemiyor.
 *
 * Ayarları her turda localStorage'dan okuyor. Paylaşılan bir durum kurmaya
 * gerek yok — ayar iki ayrı sayfadan değişebiliyor ve bu yolla ikisi de
 * kendiliğinden geçerli oluyor.
 */

const TICK_MS = 60_000;
const CALENDAR_REFRESH_MS = 60 * 60_000;

export default function AlertRunner({ onNavigate }: {
  onNavigate: (target: 'news' | 'sessions') => void;
}) {
  const { t } = useLanguage();
  const events = useRef<NewsEvent[]>([]);
  // Dile ve gezinmeye her turda taze erişmek için: aksi hâlde zamanlayıcı
  // kurulduğu andaki dili ömrü boyunca taşırdı.
  const nav = useRef(onNavigate);
  nav.current = onNavigate;
  const tr = useRef(t);
  tr.current = t;

  useEffect(() => {
    let dead = false;

    const tick = () => {
      const s = loadAlerts();
      if ((!s.news && !s.session) || permissionState() !== 'granted') return;
      const due = dueAlerts(new Date(), events.current, s, loadFired(), {
        inMinutes: (m: number) => tr.current('alertInMinutes').replace('{n}', String(m)),
        newsTitle: tr.current('alertNewsTitle'),
        sessionTitle: (name: string) => `${name} ${tr.current('alertSessionOpening')}`,
      });
      if (!due.length) return;
      // Önce hatırla, sonra göster: gösterme sırasında bir hata olursa bile
      // aynı bildirim bir dakika sonra tekrar gelmesin.
      rememberFired(due.map(d => d.key));
      due.forEach(a => showAlert(a, target => nav.current(target)));
    };

    const pull = () => {
      fetch('/api/calendar')
        .then(r => (r.ok ? r.json() : Promise.reject(new Error())))
        .then(d => {
          if (dead) return;
          events.current = d.events || [];
          // Takvim geldiği anda bir kez daha bakıyoruz. Yoksa sekmeyi
          // haberden 40 dakika önce açan biri, ilk turda takvim henüz
          // gelmediği için uyarısını bir dakika geç alıyordu.
          tick();
        })
        // Takvim gelmezse bildirim de olmuyor; ekranda hata göstermek yersiz,
        // kullanıcı bu döngünün varlığını bilmiyor.
        .catch(() => { /* sessiz */ });
    };

    pull();
    tick();
    const t1 = setInterval(tick, TICK_MS);
    const t2 = setInterval(pull, CALENDAR_REFRESH_MS);
    return () => { dead = true; clearInterval(t1); clearInterval(t2); };
  }, []);

  return null;
}

import { NewsEvent } from './news';
import { SESSIONS, sessionState } from './sessions';

/**
 * Tarayıcı bildirimleri.
 *
 * Sunucu yok, e-posta yok, uygulama yok: işletim sisteminin bildirimini
 * tarayıcının kendisi gösteriyor. Zamanlayıcı da burada — takvimi zaten
 * çekiyoruz, ne zaman ateşleneceğini hesaplamak için başka bir şey gerekmiyor.
 *
 * SINIRI AÇIKÇA SÖYLEMEK GEREKİR: sekme kapalıysa bildirim gelmez. Ekranda da
 * yazıyor, çünkü "haber bildirimi açık" sanıp haberi kaçıran biri için bu
 * özellik hiç olmamasından kötüdür.
 *
 * Ayarlar tarayıcıda duruyor, veritabanında değil: bildirim izni zaten
 * tarayıcıya özel. Telefonda izin verip bilgisayarda vermemiş olabilirsin.
 */

export interface AlertSettings {
  news: boolean;
  /** Haberden kaç dakika önce. */
  newsMinutes: number;
  /** Varsayılan yalnızca yüksek etkili — kullanıcı "kırmızı" dediği için. */
  newsMedium: boolean;
  session: boolean;
  sessionMinutes: number;
}

export const DEFAULT_ALERTS: AlertSettings = {
  news: false,
  newsMinutes: 60,
  newsMedium: false,
  session: false,
  sessionMinutes: 15,
};

export const MINUTE_CHOICES = [15, 30, 60, 120];

const SETTINGS_KEY = 'stj-alerts';
const FIRED_KEY = 'stj-alerts-fired';

export function loadAlerts(): AlertSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_ALERTS, ...JSON.parse(raw) } : { ...DEFAULT_ALERTS };
  } catch {
    return { ...DEFAULT_ALERTS };
  }
}

export function saveAlerts(s: AlertSettings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* gizli sekme */ }
}

/** Bir kez gösterilen bildirim tekrar gösterilmez. */
export function loadFired(): string[] {
  try { return JSON.parse(localStorage.getItem(FIRED_KEY) || '[]'); } catch { return []; }
}

export function rememberFired(keys: string[]) {
  try {
    // Liste sonsuza kadar büyümesin: son 200 yeter, eskisi zaten geçmişte.
    const next = [...loadFired(), ...keys].slice(-200);
    localStorage.setItem(FIRED_KEY, JSON.stringify(next));
  } catch { /* gizli sekme */ }
}

export interface DueAlert {
  key: string;
  title: string;
  body: string;
  /** Tıklanınca gidilecek yer. */
  target: 'news' | 'sessions';
}

const dayStamp = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/**
 * Şu an gösterilmesi gereken bildirimler.
 *
 * Saf fonksiyon: aynı girdiyle her zaman aynı çıktı, tarayıcıya dokunmuyor.
 * Zamanlamanın doğruluğunu ancak böyle sınayabiliyoruz.
 *
 * Geç açılan sekme için: ateşleme anı geçmişse bildirim yine gösterilir, ama
 * metinde GERÇEK kalan süre yazar. Sekmeyi olayın 10 dakika öncesinde açan
 * birine "1 saat kaldı" demek, hiç dememekten daha kötü olurdu.
 */
export function dueAlerts(
  now: Date,
  events: NewsEvent[],
  s: AlertSettings,
  fired: string[],
  fmt: { inMinutes: (m: number) => string; newsTitle: string; sessionTitle: (name: string) => string },
): DueAlert[] {
  const seen = new Set(fired);
  const out: DueAlert[] = [];

  if (s.news) {
    const scope = s.newsMedium ? ['High', 'Medium'] : ['High'];
    for (const e of events) {
      if (!scope.includes(e.impact)) continue;
      const at = new Date(e.date).getTime();
      const minutesLeft = Math.round((at - now.getTime()) / 60000);
      if (minutesLeft <= 0 || minutesLeft > s.newsMinutes) continue;
      const key = `news:${e.date}:${e.title}`;
      if (seen.has(key)) continue;
      out.push({
        key,
        title: fmt.newsTitle,
        body: `${e.title} · ${fmt.inMinutes(minutesLeft)}`,
        target: 'news',
      });
    }
  }

  if (s.session) {
    for (const sess of SESSIONS) {
      const st = sessionState(sess, now);
      if (st.open || st.weekend) continue;
      const minutesLeft = Math.round(st.left * 60);
      if (minutesLeft <= 0 || minutesLeft > s.sessionMinutes) continue;
      // Gün damgası anahtarda: yarın aynı seans için tekrar gelmeli.
      const key = `session:${sess.key}:${dayStamp(now)}`;
      if (seen.has(key)) continue;
      out.push({
        key,
        title: fmt.sessionTitle(sess.en),
        body: fmt.inMinutes(minutesLeft),
        target: 'sessions',
      });
    }
  }

  return out;
}

export type PermissionState = 'unsupported' | 'default' | 'granted' | 'denied';

export function permissionState(): PermissionState {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission as PermissionState;
}

/** İzni ancak kullanıcı bir şeyi açtığında istiyoruz: reddedilen izin geri alınamıyor. */
export async function requestPermission(): Promise<PermissionState> {
  if (typeof Notification === 'undefined') return 'unsupported';
  try {
    return (await Notification.requestPermission()) as PermissionState;
  } catch {
    return 'denied';
  }
}

export function showAlert(a: DueAlert, onClick: (target: DueAlert['target']) => void) {
  if (permissionState() !== 'granted') return;
  try {
    const n = new Notification(a.title, {
      body: a.body,
      // Aynı etiketli bildirim üst üste yığılmıyor, sonuncusu öncekini değiştiriyor.
      tag: a.key,
      icon: '/apple-touch-icon.png',
      badge: '/favicon-32.png',
    });
    n.onclick = () => { window.focus(); onClick(a.target); n.close(); };
  } catch { /* bazı tarayıcılar servis çalışanı olmadan izin vermez */ }
}

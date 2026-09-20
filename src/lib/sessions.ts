/**
 * Piyasa seansları, şehirlerinin yerel saatiyle tanımlı.
 *
 * Sabit UTC aralıkları yazmak yaz saatinde kayar: Londra yılın yarısında
 * UTC+0, yarısında UTC+1. Şehrin saat dilimini kullanınca bu kendiliğinden
 * doğru olur.
 *
 * Hem Seanslar sayfası hem ana sayfadaki küçük saat buradan besleniyor:
 * vitrinde gösterilen şey uygulamanın gerçekten hesapladığı şey olmalı.
 */
export interface Session {
  key: string;
  tz: string;
  /** Şehrin yerel saatiyle açılış ve kapanış. */
  open: number;
  close: number;
  tr: string;
  en: string;
  /** Ana sayfadaki dar saatte kullanılan kısa ad. */
  code: string;
}

export const SESSIONS: Session[] = [
  { key: 'sydney', tz: 'Australia/Sydney', open: 8, close: 17, tr: 'Sidney', en: 'Sydney', code: 'SYD' },
  { key: 'tokyo', tz: 'Asia/Tokyo', open: 9, close: 18, tr: 'Tokyo', en: 'Tokyo', code: 'TYO' },
  { key: 'london', tz: 'Europe/London', open: 8, close: 17, tr: 'Londra', en: 'London', code: 'LDN' },
  { key: 'newyork', tz: 'America/New_York', open: 8, close: 17, tr: 'New York', en: 'New York', code: 'NY' },
];

export function hourIn(tz: string, now: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find(p => p.type === t)?.value || '0';
  return Number(get('hour')) + Number(get('minute')) / 60;
}

export const weekdayIn = (tz: string, now: Date) =>
  new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(now);

export interface SessionState {
  session: Session;
  weekend: boolean;
  open: boolean;
  /** Açıksa kapanışa, kapalıysa açılışa kalan saat. */
  left: number;
}

export function sessionState(s: Session, now: Date): SessionState {
  const h = hourIn(s.tz, now);
  const day = weekdayIn(s.tz, now);
  const weekend = day === 'Sat' || day === 'Sun';
  const open = !weekend && h >= s.open && h < s.close;
  const left = open ? s.close - h : h < s.open ? s.open - h : 24 - h + s.open;
  return { session: s, weekend, open, left };
}

export const sessionStates = (now: Date): SessionState[] => SESSIONS.map(s => sessionState(s, now));

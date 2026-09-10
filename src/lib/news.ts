import { Trade } from '../types';
import { isOpenTrade, tradePnL } from './tradeMath';

export interface NewsEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
}

/** Bir haberin "etki penceresi": öncesinde ve sonrasında bu kadar dakika. */
export const NEWS_WINDOW_MINUTES = 30;

/**
 * Bir işlemin girişine denk gelen yüksek etkili haberler.
 *
 * Sembolle para birimini eşleştiriyoruz: XAUUSD ve EURUSD için USD haberleri
 * sayılır, EURUSD için ayrıca EUR. Altın ve endeksler dolara bağlı olduğu için
 * USD her zaman dahil.
 */
export function eventsAround(trade: Trade, events: NewsEvent[], minutes = NEWS_WINDOW_MINUTES): NewsEvent[] {
  const at = new Date(trade.date).getTime();
  const symbol = (trade.symbol || '').toUpperCase();
  return events.filter(e => {
    if (e.impact !== 'High') return false;
    const d = Math.abs(new Date(e.date).getTime() - at) / 60000;
    if (d > minutes) return false;
    const cur = (e.country || '').toUpperCase();
    // Sembolde geçen para birimi ya da dolar.
    return symbol.includes(cur) || cur === 'USD';
  });
}

export interface NewsSplit {
  nearCount: number;
  nearPnL: number;
  nearWinRate: string | null;
  awayCount: number;
  awayPnL: number;
  awayWinRate: string | null;
}

const rate = (list: Trade[]) => {
  const wins = list.filter(t => tradePnL(t) > 0).length;
  const losses = list.filter(t => tradePnL(t) < 0).length;
  return wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(0) : null;
};

/** Haber saatlerinde açılan işlemlerle ötekileri karşılaştırır. */
export function splitByNews(trades: Trade[], events: NewsEvent[]): NewsSplit {
  const closed = trades.filter(t => !isOpenTrade(t));
  const near: Trade[] = [];
  const away: Trade[] = [];
  closed.forEach(t => (eventsAround(t, events).length > 0 ? near : away).push(t));
  const sum = (l: Trade[]) => l.reduce((s, t) => s + tradePnL(t), 0);
  return {
    nearCount: near.length, nearPnL: sum(near), nearWinRate: rate(near),
    awayCount: away.length, awayPnL: sum(away), awayWinRate: rate(away),
  };
}

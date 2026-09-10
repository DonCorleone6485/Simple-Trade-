import { Trade } from '../types';
import { isLossTrade, isOpenTrade, tradePnL } from './tradeMath';

/**
 * Disiplin ölçümü.
 *
 * Kaybettiren şey çoğu zaman kötü bir setup değil, kaybettikten sonra
 * yapılanlardır: hemen geri girmek, riski büyütmek, o gün durmamak, her zamanki
 * saatlerin dışına taşmak. Bunların hepsi elimizdeki tarih, risk ve sonuç
 * alanlarından çıkar — kullanıcıdan ek bir şey istemez.
 *
 * Her kural bir işlem kümesi döndürür; asıl bilgi kümenin büyüklüğü değil,
 * o işlemlerin ne kadar kaybettirdiğidir.
 */

export type RuleKey = 'revenge' | 'riskUp' | 'overtrading' | 'offHours';

export interface Flag {
  key: RuleKey;
  trades: Trade[];
  /** Bu işlemlerin net sonucu. */
  pnl: number;
}

export interface DisciplineReport {
  flags: Flag[];
  /** İşaretlenmiş işlemlerin toplam net sonucu. */
  flaggedPnL: number;
  /** İşaretlenmemiş işlemlerin net sonucu — karşılaştırma buradan anlam kazanır. */
  cleanPnL: number;
  flaggedCount: number;
  cleanCount: number;
}

/** Kayıptan sonra bu kadar dakika içinde açılan işlem "hemen geri girmek"tir. */
const REVENGE_MINUTES = 15;
/** Riski bir önceki işlemin bu katına çıkarmak "büyütmek" sayılır. */
const RISK_FACTOR = 1.5;

const startOfDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const median = (xs: number[]) => {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function analyseDiscipline(trades: Trade[]): DisciplineReport {
  const closed = trades.filter(t => !isOpenTrade(t));
  const byTime = [...closed].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const revenge: Trade[] = [];
  const riskUp: Trade[] = [];

  for (let i = 1; i < byTime.length; i++) {
    const prev = byTime[i - 1];
    const cur = byTime[i];
    if (!isLossTrade(prev)) continue;

    // Bir önceki kayıp kapandıktan sonra ne kadar beklenmiş?
    const prevEnd = new Date(prev.exitDate || prev.date).getTime();
    const gap = (new Date(cur.date).getTime() - prevEnd) / 60000;
    if (gap >= 0 && gap <= REVENGE_MINUTES) revenge.push(cur);

    const prevRisk = prev.risk || 0;
    const curRisk = cur.risk || 0;
    if (prevRisk > 0 && curRisk > prevRisk * RISK_FACTOR) riskUp.push(cur);
  }

  // ── Aşırı işlem: günlük sayısı, olağan gününün iki katını aşan günler ──
  const days = new Map<string, Trade[]>();
  closed.forEach(t => {
    const k = startOfDay(t.date);
    days.set(k, [...(days.get(k) || []), t]);
  });
  const counts = [...days.values()].map(d => d.length);
  const usual = median(counts);
  const overtrading: Trade[] = [];
  if (days.size >= 5 && usual >= 1) {
    const limit = Math.max(3, Math.ceil(usual * 2));
    days.forEach(list => { if (list.length > limit) overtrading.push(...list); });
  }

  // ── Saat kayması: işlemlerinin %80'inin toplandığı bandın dışı ──
  const hours = closed.map(t => new Date(t.date).getHours()).sort((a, b) => a - b);
  const offHours: Trade[] = [];
  if (hours.length >= 10) {
    const lo = hours[Math.floor(hours.length * 0.1)];
    const hi = hours[Math.floor(hours.length * 0.9)];
    // Band çok genişse ayırt edici değildir, atla.
    if (hi - lo < 12) {
      closed.forEach(t => {
        const h = new Date(t.date).getHours();
        if (h < lo || h > hi) offHours.push(t);
      });
    }
  }

  const sum = (list: Trade[]) => list.reduce((s, t) => s + tradePnL(t), 0);

  const flags: Flag[] = ([
    ['revenge', revenge],
    ['riskUp', riskUp],
    ['overtrading', overtrading],
    ['offHours', offHours],
  ] as [RuleKey, Trade[]][])
    .filter(([, list]) => list.length > 0)
    .map(([key, list]) => ({ key, trades: list, pnl: sum(list) }));

  // Aynı işlem birden fazla kurala takılabilir; toplamda bir kez sayılır.
  const flaggedIds = new Set<string>();
  flags.forEach(f => f.trades.forEach(t => flaggedIds.add(t.id)));
  const flagged = closed.filter(t => flaggedIds.has(t.id));
  const clean = closed.filter(t => !flaggedIds.has(t.id));

  return {
    flags,
    flaggedPnL: sum(flagged),
    cleanPnL: sum(clean),
    flaggedCount: flagged.length,
    cleanCount: clean.length,
  };
}

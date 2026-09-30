/**
 * Ücretsiz hesap makinelerinin (/tools/…) hesapları. Arayüzden ayrı tutuldu ki
 * formüller test edilebilsin (tests/toolMath.test.ts): yanlış bir formül burada
 * doğrudan yanlış lot ya da yanlış limit demek.
 *
 * Hepsi eğitim amaçlı; sonuçlar kesin değil, girilen sayılara göredir.
 */

const isPos = (n: number) => Number.isFinite(n) && n > 0;

export interface PositionSizeResult {
  /** Riske edilen tutar (hesap × risk %). */
  riskAmount: number;
  /** Lot büyüklüğü, 0,01'e aşağı yuvarlanmış (riski aşmamak için). */
  lots: number;
  /** Yuvarlanmış lotta gerçek risk. */
  actualRisk: number;
}

/**
 * Pozisyon büyüklüğü: risk tutarı / (stop pip × 1 lotun pip değeri).
 * Lot aşağı yuvarlanır; yukarı yuvarlamak istenenden fazla risk demek olur.
 */
export function positionSize(input: {
  balance: number; riskPct: number; stopPips: number; pipValuePerLot: number;
}): PositionSizeResult | null {
  const { balance, riskPct, stopPips, pipValuePerLot } = input;
  if (![balance, riskPct, stopPips, pipValuePerLot].every(isPos) || riskPct > 100) return null;
  const riskAmount = (balance * riskPct) / 100;
  const raw = riskAmount / (stopPips * pipValuePerLot);
  // 1e-9: 0,29 gibi ikili kesirde 0,28999… çıkan değerler bir adım eksik yuvarlanmasın.
  const lots = Math.floor(raw * 100 + 1e-9) / 100;
  return { riskAmount, lots, actualRisk: lots * stopPips * pipValuePerLot };
}

export interface RiskRewardResult {
  /** Girişten stop'a mesafe (fiyat birimi). */
  risk: number;
  /** Girişten hedefe mesafe. */
  reward: number;
  /** Ödül / risk (2 = 1:2). */
  ratio: number;
  /** Başabaş kazanma oranı, yüzde. */
  breakEvenWinRate: number;
  /** Kazanma oranı verildiyse işlem başına beklenti, R cinsinden. */
  expectancyR: number | null;
}

/**
 * Risk/ödül. Yön girişle stop'un sırasından çıkar: stop girişin altındaysa
 * alış, üstündeyse satış. Hedef girişin stop'a ters tarafında olmalı.
 */
export function riskReward(input: {
  entry: number; stop: number; target: number; winRatePct?: number | null;
}): { ok: true; value: RiskRewardResult } | { ok: false; error: 'invalid' | 'direction' } {
  const { entry, stop, target, winRatePct } = input;
  if (![entry, stop, target].every(Number.isFinite) || entry <= 0 || stop <= 0 || target <= 0) return { ok: false, error: 'invalid' };
  if (entry === stop) return { ok: false, error: 'invalid' };
  const long = stop < entry;
  const targetOk = long ? target > entry : target < entry;
  if (!targetOk) return { ok: false, error: 'direction' };
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  const ratio = reward / risk;
  const breakEvenWinRate = 100 / (1 + ratio);
  let expectancyR: number | null = null;
  if (winRatePct != null && Number.isFinite(winRatePct) && winRatePct >= 0 && winRatePct <= 100) {
    const w = winRatePct / 100;
    expectancyR = w * ratio - (1 - w);
  }
  return { ok: true, value: { risk, reward, ratio, breakEvenWinRate, expectancyR } };
}

export type LossBase = 'static' | 'trailing';

export interface PropLossResult {
  /** Günlük kayıp limiti, tutar (hesap büyüklüğü × %). */
  dailyLimit: number;
  /** Bugün bakiyenin inemeyeceği seviye (gün başı bakiye − limit). */
  dailyFloor: number;
  /** Bugün için kalan pay (negatifse limit aşıldı). */
  dailyLeft: number;
  /** Toplam kayıp seviyesi. */
  totalFloor: number;
  /** Toplam kayba kalan pay (negatifse limit aşıldı). */
  totalLeft: number;
}

/**
 * Prop firma kayıp sınırları. Yüzdeler başlangıç hesap büyüklüğüne göre
 * (firmaların kural sayfalarındaki gibi). Toplam kayıp sabitse başlangıç
 * bakiyesinden, takipliyse ulaşılan en yüksek bakiyeden ölçülür.
 *
 * Bu hesap kapanmış bakiyeyle çalışır; firmalar açık pozisyonların anlık
 * zararını da sayabilir (bkz. /prop-firms sayfalarındaki uyarı).
 */
export function propLoss(input: {
  size: number; dailyPct: number; maxPct: number; base: LossBase;
  balance: number; dayStart: number; highest: number;
}): PropLossResult | null {
  const { size, dailyPct, maxPct, base, balance, dayStart, highest } = input;
  if (![size, dailyPct, maxPct].every(isPos) || dailyPct > 100 || maxPct > 100) return null;
  if (![balance, dayStart, highest].every(Number.isFinite) || balance < 0 || dayStart < 0 || highest < 0) return null;
  const dailyLimit = (size * dailyPct) / 100;
  const dailyFloor = dayStart - dailyLimit;
  const totalLimit = (size * maxPct) / 100;
  const totalFloor = (base === 'trailing' ? Math.max(highest, size) : size) - totalLimit;
  return {
    dailyLimit,
    dailyFloor,
    dailyLeft: balance - dailyFloor,
    totalFloor,
    totalLeft: balance - totalFloor,
  };
}

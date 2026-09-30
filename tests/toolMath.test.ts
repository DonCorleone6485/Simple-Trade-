import { describe, expect, it } from 'vitest';
import { positionSize, propLoss, riskReward } from '../src/lib/toolMath';

/**
 * Hesap makinelerinin formülleri (/tools/…). Buradaki sayılar elle hesaplandı;
 * biri değişirse ya formül bozulmuş ya da bilerek değiştirilmiştir.
 */

describe('positionSize', () => {
  it('10.000 $, %1 risk, 20 pip stop, lot başına 10 $ → 0,50 lot', () => {
    const r = positionSize({ balance: 10000, riskPct: 1, stopPips: 20, pipValuePerLot: 10 });
    expect(r).toEqual({ riskAmount: 100, lots: 0.5, actualRisk: 100 });
  });

  it('lotu aşağı yuvarlar; gerçek risk hedefi aşmaz', () => {
    const r = positionSize({ balance: 10000, riskPct: 2, stopPips: 35, pipValuePerLot: 10 })!;
    expect(r.riskAmount).toBe(200);
    expect(r.lots).toBe(0.57); // 200 / 350 = 0,5714…
    expect(r.actualRisk).toBeCloseTo(199.5, 6);
    expect(r.actualRisk).toBeLessThanOrEqual(r.riskAmount);
  });

  it('ikili kesir yüzünden bir adım eksik yuvarlamaz', () => {
    // 29 $ risk / (10 pip × 10 $) = 0,29 tam.
    const r = positionSize({ balance: 2900, riskPct: 1, stopPips: 10, pipValuePerLot: 10 })!;
    expect(r.lots).toBe(0.29);
  });

  it('küçük hesapta lot 0,01 altına inebilir (0)', () => {
    const r = positionSize({ balance: 100, riskPct: 1, stopPips: 100, pipValuePerLot: 10 })!;
    expect(r.lots).toBe(0);
  });

  it('geçersiz girişte null', () => {
    expect(positionSize({ balance: 0, riskPct: 1, stopPips: 20, pipValuePerLot: 10 })).toBeNull();
    expect(positionSize({ balance: 1000, riskPct: -1, stopPips: 20, pipValuePerLot: 10 })).toBeNull();
    expect(positionSize({ balance: 1000, riskPct: 1, stopPips: 0, pipValuePerLot: 10 })).toBeNull();
    expect(positionSize({ balance: 1000, riskPct: 101, stopPips: 20, pipValuePerLot: 10 })).toBeNull();
    expect(positionSize({ balance: NaN, riskPct: 1, stopPips: 20, pipValuePerLot: 10 })).toBeNull();
  });
});

describe('riskReward', () => {
  const ok = (r: ReturnType<typeof riskReward>) => {
    if (r.ok === false) throw new Error(`beklenmedik hata: ${r.error}`);
    return r.value;
  };

  it('alış: stop 20 pip aşağıda, hedef 40 pip yukarıda → 1:2', () => {
    const v = ok(riskReward({ entry: 1.085, stop: 1.083, target: 1.089, winRatePct: 45 }));
    expect(v.ratio).toBeCloseTo(2, 6);
    expect(v.breakEvenWinRate).toBeCloseTo(33.3333, 3);
    expect(v.expectancyR).toBeCloseTo(0.35, 6); // 0,45 × 2 − 0,55
  });

  it('satış: yön stop girişin üstündeyse satış olur', () => {
    const v = ok(riskReward({ entry: 1.085, stop: 1.087, target: 1.081 }));
    expect(v.ratio).toBeCloseTo(2, 6);
    expect(v.expectancyR).toBeNull();
  });

  it('kazanma oranı başabaş noktasında beklenti sıfır', () => {
    const v = ok(riskReward({ entry: 100, stop: 90, target: 130, winRatePct: 25 })); // 1:3 → başabaş %25
    expect(v.breakEvenWinRate).toBeCloseTo(25, 6);
    expect(v.expectancyR).toBeCloseTo(0, 9);
  });

  it('hedef yanlış tarafta ise yön hatası', () => {
    expect(riskReward({ entry: 1.085, stop: 1.083, target: 1.08 })).toEqual({ ok: false, error: 'direction' });
    expect(riskReward({ entry: 1.085, stop: 1.087, target: 1.09 })).toEqual({ ok: false, error: 'direction' });
  });

  it('giriş = stop ya da geçersiz sayı ise invalid', () => {
    expect(riskReward({ entry: 1, stop: 1, target: 2 })).toEqual({ ok: false, error: 'invalid' });
    expect(riskReward({ entry: NaN, stop: 1, target: 2 })).toEqual({ ok: false, error: 'invalid' });
    expect(riskReward({ entry: 0, stop: 1, target: 2 })).toEqual({ ok: false, error: 'invalid' });
  });

  it('kazanma oranı aralık dışındaysa beklenti hesaplanmaz', () => {
    const v = ok(riskReward({ entry: 100, stop: 90, target: 120, winRatePct: 120 }));
    expect(v.expectancyR).toBeNull();
  });
});

describe('propLoss', () => {
  const base = { size: 100000, dailyPct: 5, maxPct: 10, balance: 98500, dayStart: 100000, highest: 100000 };

  it('sabit: günlük 5.000 $, taban 95.000 $; toplam taban 90.000 $', () => {
    const r = propLoss({ ...base, base: 'static' })!;
    expect(r.dailyLimit).toBe(5000);
    expect(r.dailyFloor).toBe(95000);
    expect(r.dailyLeft).toBe(3500);
    expect(r.totalFloor).toBe(90000);
    expect(r.totalLeft).toBe(8500);
  });

  it('takipli: taban en yüksek bakiyeden ölçülür', () => {
    const r = propLoss({ ...base, base: 'trailing', highest: 105000 })!;
    expect(r.totalFloor).toBe(95000);
    expect(r.totalLeft).toBe(3500);
  });

  it('takipli: en yüksek bakiye başlangıcın altındaysa başlangıç sayılır', () => {
    const r = propLoss({ ...base, base: 'trailing', highest: 99000 })!;
    expect(r.totalFloor).toBe(90000);
  });

  it('limit aşıldıysa kalan pay negatif', () => {
    const r = propLoss({ ...base, base: 'static', balance: 94000 })!;
    expect(r.dailyLeft).toBe(-1000);
    expect(r.totalLeft).toBe(4000);
  });

  it('geçersiz girişte null', () => {
    expect(propLoss({ ...base, base: 'static', size: 0 })).toBeNull();
    expect(propLoss({ ...base, base: 'static', dailyPct: 0 })).toBeNull();
    expect(propLoss({ ...base, base: 'static', maxPct: 150 })).toBeNull();
    expect(propLoss({ ...base, base: 'static', balance: NaN })).toBeNull();
  });
});

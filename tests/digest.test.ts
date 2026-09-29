import { describe, expect, it } from 'vitest';
import { DIGEST_LANGS, money, renderDigest, weekStats } from '../api/_digest';

/** Haftalık özet e-postası (api/_digest.ts). */
describe('haftalık özet', () => {
  const week = [
    { date: '2026-09-22T10:00:00Z', symbol: 'EURUSD', result: 'Başarılı', reward: 120, risk: 50 },
    { date: '2026-09-23T10:00:00Z', symbol: 'EURUSD', result: 'Başarısız', reward: -50, risk: 50 },
    { date: '2026-09-24T10:00:00Z', symbol: 'XAUUSD', result: 'Manuel Zararda', reward: 0, risk: 30 },
    { date: '2026-09-25T10:00:00Z', symbol: 'GBPUSD', result: 'Başa Baş', reward: 0, risk: 20 },
    { date: '2026-09-26T10:00:00Z', symbol: 'EURUSD', result: null, reward: 0, risk: 40 },
  ];

  it('açık işlemleri saymaz, başa baş kazanma oranına girmez', () => {
    const s = weekStats(week, [{ date: '2026-09-15T10:00:00Z', result: 'Başarılı', reward: 10 }])!;
    expect(s.trades).toBe(4);
    expect(s.wins).toBe(1);
    expect(s.losses).toBe(2);
    expect(s.winRate).toBeCloseTo(1 / 3);
    expect(s.net).toBe(40); // 120 − 50 − 30 (eski kayıtta kayıp risk alanından)
    expect(s.best).toBe(120);
    expect(s.worst).toBe(-50);
    expect(s.topSymbol).toBe('EURUSD');
    expect(s.prevNet).toBe(10);
  });

  it('kapanmış işlem yoksa posta yok', () => {
    expect(weekStats([week[4]])).toBeNull();
    expect(weekStats([])).toBeNull();
  });

  it('tutarlar sitedeki gibi yazılır', () => {
    expect(money(-1234.5, 'EUR')).toBe('−€1,234.50');
    expect(money(40, null)).toBe('+$40.00');
  });

  it('dokuz dilde çıkar, işlem sayısı ve çıkış bağlantısı içinde', () => {
    expect(DIGEST_LANGS).toHaveLength(9);
    const s = weekStats(week)!;
    for (const lang of DIGEST_LANGS) {
      const m = renderDigest(s, { lang, userId: 'user_1', from: new Date('2026-09-21'), to: new Date('2026-09-27') });
      expect(m.subject).toContain('4');
      expect(m.html).toContain('/api/emails?u=user_1');
      expect(m.text).toContain('+$40.00');
    }
  });
});

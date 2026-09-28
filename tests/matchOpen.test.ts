import { describe, expect, it } from 'vitest';
import { matchOpenTrade } from '../src/lib/matchOpen';

const inc = { symbol: 'EURUSD', type: 'Buy', openPrice: 1.1, openTime: '2026-09-10T10:00:00Z' };

describe('matchOpenTrade', () => {
  it('sembol, yön ve fiyatı tutan elle girilmiş kaydı bulur', () => {
    const c = [{ id: 'a', symbol: 'eurusd', type: 'Buy', date: '2026-09-10T09:58:00Z', entryPrice: 1.1002 }];
    expect(matchOpenTrade(inc, c)?.id).toBe('a');
  });

  it('yön ya da sembol farklıysa eşleşmez', () => {
    expect(matchOpenTrade(inc, [{ id: 'a', symbol: 'EURUSD', type: 'Sell', date: inc.openTime }])).toBeNull();
    expect(matchOpenTrade(inc, [{ id: 'a', symbol: 'GBPUSD', type: 'Buy', date: inc.openTime }])).toBeNull();
  });

  it('fiyat binde beşten fazla ayrılıyorsa eşleşmez', () => {
    const c = [{ id: 'a', symbol: 'EURUSD', type: 'Buy', date: inc.openTime, entryPrice: 1.11 }];
    expect(matchOpenTrade(inc, c)).toBeNull();
  });

  it('üç günden eski kayıt eşleşmez', () => {
    const c = [{ id: 'a', symbol: 'EURUSD', type: 'Buy', date: '2026-09-06T10:00:00Z', entryPrice: 1.1 }];
    expect(matchOpenTrade(inc, c)).toBeNull();
  });

  it('fiyatı yazılmış aday, fiyatsız adaydan önce gelir', () => {
    const c = [
      { id: 'fiyatsiz', symbol: 'EURUSD', type: 'Buy', date: '2026-09-10T10:00:00Z' },
      { id: 'fiyatli', symbol: 'EURUSD', type: 'Buy', date: '2026-09-10T08:00:00Z', entryPrice: 1.1001 },
    ];
    expect(matchOpenTrade(inc, c)?.id).toBe('fiyatli');
  });
});

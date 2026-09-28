import { describe, expect, it } from 'vitest';
import { holdMinutes, isOpenTrade, lossAmount, realizedR, tradePnL } from '../src/lib/tradeMath';

describe('tradePnL', () => {
  it('kazançta artı, kayıpta eksi, başa başta sıfır', () => {
    expect(tradePnL({ result: 'Başarılı', reward: 250, risk: 100 })).toBe(250);
    expect(tradePnL({ result: 'Başarısız', reward: -100, risk: 100 })).toBe(-100);
    expect(tradePnL({ result: 'Başa Baş', reward: 0, risk: 100 })).toBe(0);
  });

  it('eski kayıtlarda kayıp tutarını risk alanından alır', () => {
    // Eski kayıtlarda kayıp reward'a yazılmıyordu, yalnız risk'te duruyordu.
    expect(lossAmount({ reward: 0, risk: 80 })).toBe(80);
    expect(tradePnL({ result: 'Manuel Zararda', reward: 0, risk: 80 })).toBe(-80);
  });

  it('açık işlem kâr/zarara girmez', () => {
    expect(isOpenTrade({ result: '' })).toBe(true);
    expect(tradePnL({ result: '', reward: 500, risk: 100 })).toBe(0);
  });
});

describe('realizedR', () => {
  it('sonucu riske böler', () => {
    expect(realizedR({ result: 'Başarılı', reward: 200, risk: 100 })).toBe(2);
    expect(realizedR({ result: 'Başarısız', reward: -100, risk: 100 })).toBe(-1);
  });

  it('risk yoksa R yoktur', () => {
    expect(realizedR({ result: 'Başarılı', reward: 200, risk: 0 })).toBeNull();
  });
});

describe('holdMinutes', () => {
  it('giriş ile çıkış arası dakika', () => {
    expect(holdMinutes({ date: '2026-09-01T10:00:00Z', exitDate: '2026-09-01T11:30:00Z' })).toBe(90);
  });

  it('çıkış yoksa ya da girişten önceyse null', () => {
    expect(holdMinutes({ date: '2026-09-01T10:00:00Z' })).toBeNull();
    expect(holdMinutes({ date: '2026-09-01T10:00:00Z', exitDate: '2026-09-01T09:00:00Z' })).toBeNull();
  });
});

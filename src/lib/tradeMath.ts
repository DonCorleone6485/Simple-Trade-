import { Trade } from '../types';

/**
 * İşlem sonucundan para hesapları.
 *
 * Kullanıcı formda her zaman pozitif bir tutar girer; kayıp sonuçlarda bu
 * tutar `reward` alanına negatif olarak yazılır. Eski kayıtlarda ise kayıp
 * tutarı `risk` alanından geliyordu — `lossAmount` iki durumu da karşılar.
 */

export const isWinTrade = (t: Pick<Trade, 'result'>) =>
  t.result === 'Başarılı' || t.result === 'Manuel Karda';

export const isLossTrade = (t: Pick<Trade, 'result'>) =>
  t.result === 'Başarısız' || t.result === 'Manuel Zararda';

export const isBreakevenTrade = (t: Pick<Trade, 'result'>) => t.result === 'Başa Baş';

/** Kaybedilen tutar — her zaman pozitif. */
export const lossAmount = (t: Pick<Trade, 'reward' | 'risk'>) =>
  (t.reward || 0) < 0 ? Math.abs(t.reward || 0) : (t.risk || 0);

/** Kazanılan tutar — her zaman pozitif. */
export const winAmount = (t: Pick<Trade, 'reward'>) => Math.abs(t.reward || 0);

/** İşlemin net kâr/zararı: kazançta artı, kayıpta eksi, başa başta sıfır. */
export const tradePnL = (t: Pick<Trade, 'result' | 'reward' | 'risk'>) =>
  isWinTrade(t) ? winAmount(t) : isLossTrade(t) ? -lossAmount(t) : 0;

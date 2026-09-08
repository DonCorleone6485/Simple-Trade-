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

/** Sonucu girilmemiş işlem — hâlâ açık ya da kaydı tamamlanmamış. */
export const isOpenTrade = (t: Pick<Trade, 'result'>) => !t.result;

/** Kaybedilen tutar — her zaman pozitif. */
export const lossAmount = (t: Pick<Trade, 'reward' | 'risk'>) =>
  (t.reward || 0) < 0 ? Math.abs(t.reward || 0) : (t.risk || 0);

/** Kazanılan tutar — her zaman pozitif. */
export const winAmount = (t: Pick<Trade, 'reward'>) => Math.abs(t.reward || 0);

/** İşlemin net kâr/zararı: kazançta artı, kayıpta eksi, başa başta sıfır. */
export const tradePnL = (t: Pick<Trade, 'result' | 'reward' | 'risk'>) =>
  isWinTrade(t) ? winAmount(t) : isLossTrade(t) ? -lossAmount(t) : 0;

/** Giriş ile çıkış arasındaki süre (dakika). Çıkış yoksa null. */
export const holdMinutes = (t: Pick<Trade, 'date' | 'exitDate'>): number | null => {
  if (!t.exitDate) return null;
  const ms = new Date(t.exitDate).getTime() - new Date(t.date).getTime();
  if (!isFinite(ms) || ms < 0) return null;
  return Math.round(ms / 60000);
};

/** "2s 15dk" / "1g 3s" gibi kısa süre metni. */
export const formatDuration = (minutes: number | null, lang: string): string => {
  if (minutes == null) return '-';
  const tr = lang === 'tr';
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  const D = tr ? 'g' : 'd', H = tr ? 's' : 'h', M = tr ? 'dk' : 'm';
  if (d > 0) return h > 0 ? `${d}${D} ${h}${H}` : `${d}${D}`;
  if (h > 0) return m > 0 ? `${h}${H} ${m}${M}` : `${h}${H}`;
  return `${m}${M}`;
};

/**
 * Gerçekleşen R — işlemin net sonucunun, göze alınan riske oranı.
 *
 * Formdaki `rr` alanı işleme girmeden önce yazılan *plandır*: 3R hedefleyip
 * stop olan işlem 3R kaybetmez, 1R kaybeder. Gerçekten olanı görmek için
 * kâr/zararı riske bölüyoruz.
 *
 * Risk girilmemişse (eski ya da içe aktarılmış bazı kayıtlar) oran
 * hesaplanamaz; null döner ve ekranda çizgi gösterilir.
 */
export const realizedR = (t: Pick<Trade, 'result' | 'reward' | 'risk'>): number | null => {
  if (isOpenTrade(t)) return null;
  const risk = t.risk || 0;
  if (risk <= 0) return null;
  return tradePnL(t) / risk;
};

/** "+0.50R" / "−1.00R" — işaretli, tipografik eksi ile. */
export const formatR = (r: number | null): string =>
  r == null ? '-' : `${r >= 0 ? '+' : '−'}${Math.abs(r).toFixed(2)}R`;

/**
 * Bir işlemin düştüğü yerel takvim günü: "2026-09-07".
 *
 * `trade.date` bir ISO metnidir ve UTC'dir. Baştan on karakterini kesmek
 * (ya da startsWith ile karşılaştırmak) kullanıcının saat dilimini yok sayar:
 * Türkiye'de 7 Eylül 01:02'de açılan işlem "2026-09-06T22:02Z" olarak
 * saklanır ve 6 Eylül'e düşer. İşlem listesi yerel saatle gruplandığı için
 * takvimle listenin gün sayısı birbirini tutmazdı.
 */
export const dayKey = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

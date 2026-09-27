/**
 * Elle girilmiş, henüz sonuçlanmamış işlemi, sonradan gelen gerçek işlemle
 * eşleştirmek.
 *
 * Kullanıcı pozisyonu açınca journal'a "işlem öncesi" kaydı giriyor (notlar,
 * fotoğraflar), sonra aynı işlem rapordan ya da MetaTrader'dan geliyor. Ayrı
 * bir satır açılırsa yazdıkları bir kenarda, sonuç başka bir kenarda kalıyor.
 * Eşleşirse o satır doldurulur.
 *
 * Elle girilen kaydın platform numarası yok; ayırt edici olan sembol, yön,
 * giriş fiyatı ve zaman. Fiyatlar belirgin biçimde ayrılıyorsa aday düşer.
 *
 * AYNI KURAL api/ingest.ts'te (MetaTrader) de var — sunucu fonksiyonu tarayıcı
 * koduyla paylaşılamadığı için iki kopya. Birini değiştirirsen ötekini de.
 */

/** Plan ile gerçek açılış arasındaki en fazla fark. */
export const MATCH_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

/** Fiyat bu orandan fazla ayrılıyorsa aynı işlem sayılmaz (binde beş). */
export const PRICE_TOLERANCE = 0.005;

export interface OpenCandidate {
  id: string;
  symbol: string;
  type: string;
  date: string;
  entryPrice?: number;
}

export function matchOpenTrade<T extends OpenCandidate>(
  inc: { symbol: string; type: string; openPrice: number; openTime: string },
  candidates: T[],
): T | null {
  const openMs = new Date(inc.openTime).getTime();
  const symbol = inc.symbol.toUpperCase().trim();
  let best: T | null = null;
  // Fiyatı tutan aday, fiyatı yazılmamış adaydan önce gelir; sonra fiyat
  // farkı, sonra zaman farkı.
  let bestTier = 2, bestGap = Infinity, bestDt = Infinity;

  for (const c of candidates) {
    if ((c.symbol || '').toUpperCase().trim() !== symbol) continue;
    if (c.type !== inc.type) continue;

    const dt = Math.abs(new Date(c.date).getTime() - openMs);
    if (!isFinite(dt) || dt > MATCH_WINDOW_MS) continue;

    const price = Number(c.entryPrice) || 0;
    let tier = 1, gap = 0;
    if (price > 0 && inc.openPrice > 0) {
      gap = Math.abs(price - inc.openPrice) / inc.openPrice;
      if (gap > PRICE_TOLERANCE) continue;
      tier = 0;
    }

    if (tier < bestTier || (tier === bestTier && (gap < bestGap || (gap === bestGap && dt < bestDt)))) {
      bestTier = tier; bestGap = gap; bestDt = dt; best = c;
    }
  }
  return best;
}

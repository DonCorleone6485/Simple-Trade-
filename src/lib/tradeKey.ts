/**
 * Bir işlemin kimliği — aynı işlemin ikinci kez içe aktarılmasını önlemek için.
 *
 * MetaTrader her pozisyona benzersiz bir numara verir (raporda "Pozisyon" ya da
 * "Ticket"); varsa en güvenilir işaret odur. Numara vermeyen platformlarda
 * tarih + sembol + yön + tutar dörtlüsü pratikte yeterince ayırt edici: aynı
 * dakikada, aynı sembolde, aynı yönde, aynı tutarla kapanan iki ayrı işlem
 * olması beklenmez.
 */
export interface KeyedTrade {
  externalId?: string;
  date: string;
  symbol: string;
  type: string;
  reward?: number;
}

export function tradeKey(t: KeyedTrade): string {
  if (t.externalId) return `id:${t.externalId}`;
  const minute = new Date(t.date).toISOString().slice(0, 16);
  return `fp:${minute}|${(t.symbol || '').toUpperCase()}|${t.type}|${(t.reward || 0).toFixed(2)}`;
}

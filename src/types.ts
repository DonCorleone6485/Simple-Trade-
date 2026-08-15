export interface Account {
  id: string;
  user_id?: string;
  name: string;
  startDate?: string;
  startingCapital?: number;
  goals?: JournalGoals;
}

export interface JournalGoals {
  monthlyPnL?: number;
  winRate?: number;
  maxDailyTrades?: number;
  maxRiskPerTrade?: number;
  noTradeHoursStart?: number;
  noTradeHoursEnd?: number;
}

/** "Başa Baş" ne kâr ne zarar sayılır — kazanma oranı paydasına da girmez. */
export type TradeResult =
  | 'Başarılı'
  | 'Başarısız'
  | 'Manuel Karda'
  | 'Manuel Zararda'
  | 'Başa Baş';

export type MTFBias = 'bullish' | 'bearish' | 'consolidation';

/** Tek bir timeframe için multi-timeframe analiz kaydı. */
export interface MTFEntry {
  timeframe: string;
  bias: MTFBias;
  notes: string;
}

export interface Trade {
  id: string;
  accountId?: string;
  journal_id?: string;
  user_id?: string;
  date: string;
  symbol: string;
  type: 'Buy' | 'Sell';
  timeframe?: string;
  setup?: string;
  risk: number;
  reward: number;
  rr: string;
  result: TradeResult;
  preTradeNotes: string;
  postTradeNotes: string;
  preTradePhotos: string[];
  postTradePhotos: string[];
  mtfAnalysis?: MTFEntry[];
  importSource?: string;
}

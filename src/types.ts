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
  result: 'Başarılı' | 'Başarısız' | 'Manuel Karda' | 'Manuel Zararda';
  preTradeNotes: string;
  postTradeNotes: string;
  preTradePhotos: string[];
  postTradePhotos: string[];
  importSource?: string;
}

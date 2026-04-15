export interface Account {
  id: string;
  name: string;
}

export interface Trade {
  id: string;
  accountId?: string;
  date: string;
  symbol: string;
  type: 'Buy' | 'Sell';
  risk: number;
  reward: number;
  rr: string;
  result: 'Başarılı' | 'Başarısız' | 'Manuel Karda' | 'Manuel Zararda';
  preTradeNotes: string;
  postTradeNotes: string;
  preTradePhotos: string[];
  postTradePhotos: string[];
}

/**
 * Journal'ın türü.
 *
 * 'real' kendi paranla açtığın hesap; kuralı sadece kendi koyduğun hedefler.
 * 'prop' bir fon şirketinin hesabı: kâr hedefi, günlük ve toplam kayıp
 * sınırları dışarıdan dayatılıyor ve aşıldığında hesap kapanıyor. Bu yüzden
 * ayrı bir tür: aynı işlemler, tamamen farklı bir "nerede duruyorum" sorusu.
 */
export type JournalKind = 'real' | 'prop';

/**
 * Maksimum toplam kaybın nereden ölçüldüğü.
 *
 * 'static'   — başlangıç bakiyesinden. Kâr ettikçe sınır uzaklaşır.
 * 'trailing' — ulaşılan en yüksek bakiyeden. Kâr ettikçe sınır peşinden gelir,
 *              yani kazancını geri vermek de hesabı patlatır.
 *
 * Aynı rakam, ikisinde bambaşka yerde durur; sormadan doğru sayı yazılamaz.
 */
export type DrawdownType = 'static' | 'trailing';

/** Fon şirketinin dayattığı sınırlar. Hepsi para birimi cinsinden saklanır. */
export interface PropRules {
  profitTarget?: number;
  maxDailyLoss?: number;
  maxTotalLoss?: number;
  drawdownType?: DrawdownType;
}

export interface Account {
  id: string;
  user_id?: string;
  name: string;
  startDate?: string;
  startingCapital?: number;
  goals?: JournalGoals;
  /** Bu journal'da en son kullanılan checklist. */
  checklistId?: string | null;
  /** Eski kayıtlarda yok; yokluğu 'real' demek. */
  kind?: JournalKind;
  prop?: PropRules;
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

export type OrderType = 'Market' | 'Limit' | 'Stop';

/**
 * İşlem öncesi kontrol maddesi. Maddelerin kendisi kullanıcı bazlı kalıcıdır
 * (users.checklist_template); `checked` ise her işleme özeldir.
 */
export interface ChecklistItem {
  id: string;
  title: string;
  desc?: string;
  checked?: boolean;
}

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
  /** İşlemin kapandığı an; eski kayıtlarda yok. */
  exitDate?: string;
  symbol: string;
  type: 'Buy' | 'Sell';
  timeframe?: string;
  orderType?: OrderType;
  setup?: string;
  risk: number;
  reward: number;
  rr: string;
  /** Boş: işlem henüz sonuçlanmadı (açık pozisyon). */
  result: TradeResult | '';
  preTradeNotes: string;
  postTradeNotes: string;
  preTradePhotos: string[];
  postTradePhotos: string[];
  mtfAnalysis?: MTFEntry[];
  checklist?: ChecklistItem[];
  importSource?: string;
  /** Platformun işleme verdiği numara — tekrar içe aktarmayı önler. */
  externalId?: string;
  /** İşleme girerkenki ruh hâli: hazır anahtarlar ya da kullanıcının yazdıkları. */
  emotions?: string[];
  /** Fiyatlar — isteğe bağlı; MetaTrader'dan ve rapordan kendiliğinden gelir. */
  entryPrice?: number;
  stopLoss?: number;
  exitPrice?: number;
}

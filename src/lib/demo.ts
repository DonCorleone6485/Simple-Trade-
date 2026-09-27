import { Account, Trade, TradeResult } from '../types';

/**
 * Kayıt olmadan gezenler için örnek veri.
 *
 * "Ücretsiz Başla"ya basan kişi önce siteyi görsün, sonra hesap açsın. Boş bir
 * journal hiçbir özelliği göstermez; bu yüzden gezinti, yaklaşık bir aylık
 * gerçekçi işlemle dolu iki journal'la açılıyor. Veri tarayıcıda üretiliyor,
 * veritabanına hiç yazılmıyor.
 *
 * İşlemler elle seçildi, rastgele değil: disiplin analizinin yakalayacağı
 * hatalar bilerek içeride — kayıptan hemen sonra büyütülmüş riskle girilen
 * intikam işlemi, bir günde dört işlem, gece yarısı açılmış bir pozisyon.
 * Gezen kişi o sayfada boş bir "her şey yolunda" değil, gerçek bir tespit
 * görsün.
 *
 * Tarihler bugüne göre kuruluyor (son iş günleri), yani örnek hep güncel.
 */

export const DEMO_USER = 'demo';

type Two = [string, string];

interface Spec {
  /** Kaç iş günü önce (0 = en yakın iş günü). */
  w: number;
  /** UTC saat ve dakika. */
  h: number;
  m: number;
  sym: keyof typeof MARKETS;
  type: 'Buy' | 'Sell';
  setup: string;
  /** Riske edilen tutar. */
  risk: number;
  /** Gerçekleşen R: pozitif kazanç, -1 zarar, 0 başa baş, null hâlâ açık. */
  r: number | null;
  emo: string[];
  pre?: Two;
  post?: Two;
}

const MARKETS = {
  EURUSD: { price: 1.0842, dist: 0.0015, digits: 5 },
  GBPUSD: { price: 1.2718, dist: 0.0020, digits: 5 },
  USDJPY: { price: 149.62, dist: 0.25, digits: 3 },
  XAUUSD: { price: 2651.4, dist: 6.0, digits: 2 },
  NAS100: { price: 20185, dist: 40, digits: 1 },
};

const REAL: Spec[] = [
  { w: 19, h: 8, m: 15, sym: 'EURUSD', type: 'Buy', setup: 'FVG', risk: 100, r: 2, emo: ['calm'],
    pre: ['Londra açılışında 15dk FVG dolumu, 1s trend yukarı.', '15m FVG fill at the London open, 1h trend up.'] },
  { w: 19, h: 13, m: 40, sym: 'XAUUSD', type: 'Sell', setup: 'OB', risk: 100, r: -1, emo: ['focused'] },
  { w: 18, h: 9, m: 5, sym: 'GBPUSD', type: 'Buy', setup: 'Liquidity Sweep', risk: 100, r: 2.5, emo: ['confident'],
    post: ['Asya dibinin altı süpürüldü, plan tuttu. Kısmi almadım, iyi ki.', 'Asian low swept, plan worked. Didn\'t take partials — glad I didn\'t.'] },
  { w: 17, h: 13, m: 30, sym: 'NAS100', type: 'Buy', setup: 'Trend Pullback', risk: 100, r: -1, emo: ['fomo'],
    post: ['Girişi kovaladım, geri çekilmeyi beklemedim.', 'Chased the entry, didn\'t wait for the pullback.'] },
  { w: 17, h: 13, m: 48, sym: 'NAS100', type: 'Buy', setup: 'Trend Pullback', risk: 200, r: -1, emo: ['revenge', 'angry'],
    post: ['Zararı hemen geri almak istedim, riski iki katına çıkardım. Yapmamalıydım.', 'Wanted the loss back right away and doubled the risk. Shouldn\'t have.'] },
  { w: 16, h: 13, m: 50, sym: 'XAUUSD', type: 'Buy', setup: 'BOS / ChoCH', risk: 100, r: 3, emo: ['focused'] },
  { w: 15, h: 9, m: 20, sym: 'EURUSD', type: 'Sell', setup: 'OB', risk: 100, r: 0, emo: ['calm'],
    post: ['Stopu girişe çektim, başa baş kapandı.', 'Moved the stop to entry, closed at breakeven.'] },
  { w: 14, h: 14, m: 10, sym: 'USDJPY', type: 'Buy', setup: 'Range Breakout', risk: 100, r: 1.8, emo: ['confident'] },
  { w: 13, h: 1, m: 30, sym: 'XAUUSD', type: 'Sell', setup: 'FVG', risk: 100, r: -1, emo: ['tired'],
    post: ['Gece yarısı, uykusuz. Kuralım dışında.', 'Past midnight, no sleep. Outside my rules.'] },
  { w: 12, h: 8, m: 5, sym: 'GBPUSD', type: 'Sell', setup: 'Liquidity Sweep', risk: 100, r: 2, emo: ['focused'] },
  { w: 12, h: 10, m: 30, sym: 'EURUSD', type: 'Buy', setup: 'FVG', risk: 100, r: -1, emo: ['impatient'] },
  { w: 12, h: 11, m: 10, sym: 'EURUSD', type: 'Buy', setup: 'FVG', risk: 100, r: -1, emo: ['angry'] },
  { w: 12, h: 11, m: 40, sym: 'GBPUSD', type: 'Buy', setup: 'OB', risk: 150, r: -1, emo: ['revenge'],
    post: ['Günün kârını ve fazlasını geri verdim. 2 zarardan sonra durmalıydım.', 'Gave back the day\'s profit and more. Should have stopped after 2 losses.'] },
  { w: 11, h: 14, m: 5, sym: 'NAS100', type: 'Sell', setup: 'BOS / ChoCH', risk: 100, r: 2.2, emo: ['calm'] },
  { w: 10, h: 8, m: 40, sym: 'XAUUSD', type: 'Buy', setup: 'Trend Pullback', risk: 100, r: 1.5, emo: ['confident'] },
  { w: 9, h: 13, m: 30, sym: 'EURUSD', type: 'Sell', setup: 'Breaker Block', risk: 100, r: -1, emo: ['fearful'] },
  { w: 8, h: 9, m: 15, sym: 'GBPUSD', type: 'Buy', setup: 'FVG', risk: 100, r: 2, emo: ['focused'] },
  { w: 7, h: 13, m: 45, sym: 'XAUUSD', type: 'Sell', setup: 'Liquidity Sweep', risk: 100, r: 2.8, emo: ['calm'],
    pre: ['NY açılışı öncesi Londra tepesi süpürüldü; 5dk yapı kırılımını bekliyorum.', 'London high swept before the NY open; waiting for a 5m structure break.'] },
  { w: 6, h: 8, m: 20, sym: 'USDJPY', type: 'Sell', setup: 'OB', risk: 100, r: -1, emo: ['overconfident'] },
  { w: 5, h: 14, m: 5, sym: 'NAS100', type: 'Buy', setup: 'Trend Pullback', risk: 100, r: 1.6, emo: ['focused'] },
  { w: 4, h: 9, m: 30, sym: 'EURUSD', type: 'Buy', setup: 'FVG', risk: 100, r: 2, emo: ['calm'] },
  { w: 3, h: 13, m: 55, sym: 'XAUUSD', type: 'Buy', setup: 'BOS / ChoCH', risk: 100, r: -1, emo: ['impatient'] },
  { w: 2, h: 8, m: 10, sym: 'GBPUSD', type: 'Sell', setup: 'OB', risk: 100, r: 2.4, emo: ['focused'] },
  { w: 1, h: 14, m: 20, sym: 'XAUUSD', type: 'Sell', setup: 'FVG', risk: 100, r: 1.2, emo: ['calm'] },
  { w: 0, h: 8, m: 35, sym: 'EURUSD', type: 'Buy', setup: 'Liquidity Sweep', risk: 100, r: null, emo: ['focused'],
    pre: ['Hedef önceki günün tepesi, stop Asya dibinin altında.', 'Target is yesterday\'s high, stop below the Asian low.'] },
];

const PROP: Spec[] = [
  { w: 9, h: 9, m: 0, sym: 'XAUUSD', type: 'Buy', setup: 'OB', risk: 500, r: 2, emo: ['calm'] },
  { w: 8, h: 14, m: 15, sym: 'NAS100', type: 'Sell', setup: 'FVG', risk: 500, r: -1, emo: ['focused'] },
  { w: 7, h: 8, m: 30, sym: 'EURUSD', type: 'Buy', setup: 'Liquidity Sweep', risk: 500, r: 2.5, emo: ['confident'] },
  { w: 6, h: 13, m: 40, sym: 'GBPUSD', type: 'Sell', setup: 'BOS / ChoCH', risk: 500, r: -1, emo: ['impatient'] },
  { w: 5, h: 9, m: 10, sym: 'XAUUSD', type: 'Buy', setup: 'Trend Pullback', risk: 500, r: 3, emo: ['focused'] },
  { w: 4, h: 14, m: 25, sym: 'NAS100', type: 'Buy', setup: 'FVG', risk: 500, r: -1, emo: ['fomo'] },
  { w: 3, h: 8, m: 50, sym: 'EURUSD', type: 'Sell', setup: 'OB', risk: 500, r: 2, emo: ['calm'] },
  { w: 2, h: 13, m: 30, sym: 'XAUUSD', type: 'Sell', setup: 'Liquidity Sweep', risk: 500, r: 1.5, emo: ['focused'] },
  { w: 1, h: 9, m: 40, sym: 'USDJPY', type: 'Buy', setup: 'Range Breakout', risk: 500, r: -1, emo: ['tired'] },
  { w: 0, h: 14, m: 0, sym: 'GBPUSD', type: 'Buy', setup: 'FVG', risk: 500, r: 2, emo: ['calm'] },
];

/** Bugünden geriye son n iş günü (UTC gece yarısı). Bugün hafta içiyse o da sayılır. */
function weekdays(n: number): Date[] {
  const out: Date[] = [];
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  // Bugünün işlemleri henüz olmamış olabilir; en yakın iş günü dünden başlıyor.
  d.setUTCDate(d.getUTCDate() - 1);
  while (out.length < n) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) out.push(new Date(d));
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return out;
}

function build(specs: Spec[], journalId: string, tr: boolean, days: Date[]): Trade[] {
  return specs.map((s, i) => {
    const mk = MARKETS[s.sym];
    const open = new Date(days[s.w].getTime() + (s.h * 60 + s.m) * 60_000);
    // Fiyat günden güne biraz oynasın; hepsi aynı rakamda durmasın.
    const drift = ((i * 37) % 11 - 5) / 5;
    const entry = +(mk.price + drift * mk.dist * 3).toFixed(mk.digits);
    const dir = s.type === 'Buy' ? 1 : -1;
    const stop = +(entry - dir * mk.dist).toFixed(mk.digits);
    const closed = s.r !== null;
    const exit = closed ? +(entry + dir * mk.dist * (s.r as number)).toFixed(mk.digits) : undefined;
    const minutes = 20 + ((i * 53) % 160);
    const result: TradeResult | '' = !closed ? '' : s.r! > 0 ? 'Başarılı' : s.r! < 0 ? 'Başarısız' : 'Başa Baş';
    const reward = !closed ? 0 : s.r! > 0 ? Math.round(s.risk * s.r!) : s.r! < 0 ? -s.risk : 0;
    const pick = (t?: Two) => (t ? (tr ? t[0] : t[1]) : '');
    return {
      id: `${journalId}-${i}`,
      accountId: journalId,
      journal_id: journalId,
      user_id: DEMO_USER,
      date: open.toISOString(),
      exitDate: closed ? new Date(open.getTime() + minutes * 60_000).toISOString() : undefined,
      symbol: s.sym,
      type: s.type,
      timeframe: '15m',
      orderType: 'Market',
      setup: s.setup,
      risk: s.risk,
      reward,
      rr: s.r && s.r > 0 ? s.r.toFixed(1) : '2.0',
      result,
      preTradeNotes: pick(s.pre),
      postTradeNotes: pick(s.post),
      preTradePhotos: [],
      postTradePhotos: [],
      mtfAnalysis: [],
      checklist: [],
      emotions: s.emo,
      entryPrice: entry,
      stopLoss: stop,
      exitPrice: exit,
    };
  });
}

/** Gezintinin journal'ları ve işlemleri, seçili dilde. */
export function demoData(language: string): { journals: Account[]; trades: Trade[] } {
  const tr = language === 'tr';
  const days = weekdays(20);
  const start = days[days.length - 1].toISOString().slice(0, 10);
  const journals: Account[] = [
    {
      id: 'demo-real',
      user_id: DEMO_USER,
      name: tr ? 'Örnek Journal' : 'Sample Journal',
      startDate: start,
      startingCapital: 10000,
      kind: 'real',
      goals: { maxDailyTrades: 3, maxRiskPerTrade: 150, winRate: 55, monthlyPnL: 1500 },
    },
    {
      id: 'demo-prop',
      user_id: DEMO_USER,
      name: tr ? 'Prop Challenge 100K (örnek)' : 'Prop Challenge 100K (sample)',
      startDate: start,
      startingCapital: 100000,
      kind: 'prop',
      prop: { profitTarget: 10000, maxDailyLoss: 5000, maxTotalLoss: 10000, drawdownType: 'static' },
    },
  ];
  const trades = [...build(REAL, 'demo-real', tr, days), ...build(PROP, 'demo-prop', tr, days)]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return { journals, trades };
}

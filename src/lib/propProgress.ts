import { Account, Trade } from '../types';
import { isOpenTrade, tradePnL } from './tradeMath';

/**
 * Prop hesabın kurallarına göre "nerede duruyorum" hesabı.
 *
 * ÖNEMLİ SINIR: burada yalnızca KAPANMIŞ işlemler sayılır. Fon şirketi kendi
 * tarafında açık pozisyonun anlık zararını da günlük kayba ekler; bizim
 * elimizde o veri yok. Yani bu sayaç "kapattıklarına göre" konuşur, şirketin
 * ekranı "şu anda" konuşur. Aradaki fark kullanıcıya ekranda yazılıyor —
 * yazılmazsa insan kendini olduğundan güvende sanır.
 */

export interface RuleState {
  /** Kuralın kendisi — kullanıcının girdiği tutar. */
  limit: number;
  /** Limitin ne kadarı harcandı. Her zaman sıfır ya da artı. */
  used: number;
  /** Ne kadar kaldı. Eksiye düşerse kural çiğnenmiş demektir. */
  left: number;
  /** 0 ile 1 arası doluluk; aşıldığında 1'de durur. */
  ratio: number;
  breached: boolean;
}

export interface PropProgress {
  startingCapital: number;
  /** Kapanmış işlemlerden sonraki bakiye. */
  balance: number;
  netPnL: number;
  /** Bakiyenin gördüğü en yüksek nokta — takipli drawdown buradan ölçülür. */
  peak: number;
  /** Bugün kapanan işlemlerin toplamı. */
  todayPnL: number;
  /** Toplam kaybın ölçüldüğü taban: bunun altına inersen hesap gider. */
  floor: number | null;
  target: RuleState | null;
  daily: RuleState | null;
  total: RuleState | null;
  /** Herhangi bir kayıp sınırı aşıldı mı. */
  failed: boolean;
  /** Kâr hedefine ulaşıldı mı. */
  passed: boolean;
}

const rule = (limit: number | undefined, used: number): RuleState | null => {
  if (limit == null || !(limit > 0)) return null;
  const u = Math.max(0, used);
  return {
    limit,
    used: u,
    left: limit - u,
    ratio: Math.min(1, u / limit),
    breached: u >= limit,
  };
};

/** Yerel takvime göre gün anahtarı — sunucu saati değil, kullanıcının günü. */
const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/**
 * Günlük kayıp, işlemin AÇILDIĞI değil KAPANDIĞI güne yazılır — fon
 * şirketleri de öyle sayar. Eski kayıtlarda çıkış tarihi yok; orada giriş
 * tarihine düşüyoruz.
 */
const closedAt = (t: Trade) => t.exitDate || t.date;

export function propProgress(account: Account, trades: Trade[], now = new Date()): PropProgress {
  const start = account.startingCapital ?? 0;
  const rules = account.prop || {};

  const closed = trades
    .filter(t => !isOpenTrade(t))
    .sort((a, b) => new Date(closedAt(a)).getTime() - new Date(closedAt(b)).getTime());

  // Bakiye çizgisini sırayla yürüyoruz: zirveyi ancak böyle bulabiliriz.
  let balance = start;
  let peak = start;
  for (const t of closed) {
    balance += tradePnL(t);
    if (balance > peak) peak = balance;
  }
  const netPnL = balance - start;

  const today = dayKey(now.toISOString());
  const todayPnL = closed
    .filter(t => dayKey(closedAt(t)) === today)
    .reduce((s, t) => s + tradePnL(t), 0);

  // Takipli drawdown zirveden ölçülür, sabit olan başlangıçtan. Aynı rakam,
  // bambaşka bir taban.
  const trailing = rules.drawdownType === 'trailing';
  const anchor = trailing ? peak : start;
  const totalUsed = anchor - balance;

  const target = rule(rules.profitTarget, netPnL);
  const daily = rule(rules.maxDailyLoss, -todayPnL);
  const total = rule(rules.maxTotalLoss, totalUsed);

  return {
    startingCapital: start,
    balance,
    netPnL,
    peak,
    todayPnL,
    floor: rules.maxTotalLoss != null ? anchor - rules.maxTotalLoss : null,
    target,
    daily,
    total,
    failed: !!(daily?.breached || total?.breached),
    // Hedef "harcandıkça" dolmuyor, kazanıldıkça doluyor: burada breached
    // kötü bir şey değil, geçtin demek.
    passed: !!(rules.profitTarget && netPnL >= rules.profitTarget),
  };
}

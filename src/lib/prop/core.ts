/**
 * Prop hesabı değerlendirme maddelerinin iskeleti.
 *
 * Burada yalnız dile bağlı olmayan şeyler var: madde sırası, puanlar ve
 * kuralın firmaların metinlerinde geçtiği İngilizce adlar. Başlıklar,
 * açıklamalar ve uzun anlatımlar dil paketlerinde (./tr, ./en, …) durur ve
 * seçenek sıraları buradaki `points` dizisiyle birebir aynı sıradadır.
 *
 * Toplam 100 puan; ağırlıklar maddenin hesabı gerçekten bitirme gücüne göre
 * dağıtılmış: drawdown tipi tek başına 20 puan, hafta sonu taşıma 1 puan.
 */

export type DetailBlock =
  | { p: string }
  | { h: string }
  | { ul: string[] }
  | { table: { head: string[]; rows: string[][] } };

export interface PropCriterion {
  id: string;
  /** Bu maddeden alınabilecek en yüksek puan. */
  max: number;
  /** Seçeneklerin puanları — dil paketlerindeki seçenek sırasıyla aynı. */
  points: number[];
  /** Firmaların kural metninde bu maddenin geçtiği adlar; çevrilmez. */
  keywords: string;
}

export interface PropCriterionCopy {
  title: string;
  short: string;
  options: string[];
  detail: DetailBlock[];
}

export type PropPack = Record<string, PropCriterionCopy>;

export const PROP_CRITERIA: PropCriterion[] = [
  {
    id: 'drawdown', max: 20, points: [20, 14, 10, 2],
    keywords: '"Max Drawdown", "Maximum Loss", "Overall Drawdown", "Static / Trailing Drawdown", "Smart Drawdown", "High Water Mark"',
  },
  {
    id: 'news', max: 15, points: [15, 12, 9, 6, 1],
    keywords: '"News Trading", "News Restriction", "Blackout Period", "High-Impact News", "Major News Events", "News Straddling"',
  },
  {
    id: 'floating', max: 12, points: [12, 9, 7, 4, 1],
    keywords: '"Guardian Shield", "Equity Protection", "Position Loss Limit", "Open P&L Protection", "Account Drawdown", "Max Floating Loss", "Unrealised Loss Limit"',
  },
  {
    id: 'dailyBase', max: 10, points: [10, 9, 5, 1],
    keywords: '"Daily Loss Limit", "Daily Drawdown", "Balance-based / Equity-based", "Higher of balance or equity", "Previous day\'s closing balance", "Midnight Mark"',
  },
  {
    id: 'consistency', max: 10, points: [10, 8, 6, 4, 1],
    keywords: '"Consistency Rule", "Consistency Score", "Best Day Rule", "Profit Consistency", "Daily Profit Distribution", "Profit Concentration"',
  },
  {
    id: 'overnight', max: 9, points: [9, 6, 1],
    keywords: '"Overnight Holding", "Swing Trading", "Hold Overnight", "Rollover", "Flat by Close", "End of Session Close"',
  },
  {
    id: 'payout', max: 8, points: [8, 7, 5, 4, 1],
    keywords: '"Payout Frequency", "Reward Cycle", "Withdrawal Cycle", "On-Demand Payout", "First Payout", "Minimum Withdrawal"',
  },
  {
    id: 'riskPerTrade', max: 6, points: [6, 5, 4, 2, 1],
    keywords: '"Risk per Trade", "Symbol Loss Limit", "Risk per Trade Idea", "Max Risk per Position", "Maximum Lot Size", "Position Size Limit"',
  },
  {
    id: 'stopLoss', max: 5, points: [5, 4, 3, 1],
    keywords: '"Stop Loss Requirement", "Mandatory Stop Loss", "Hidden / Stealth Stop Loss", "Visible SL", "SL must remain on platform"',
  },
  {
    id: 'minDays', max: 2, points: [2, 1.5, 1, 0.5],
    keywords: '"Minimum Trading Days", "Profitable Days", "Active Trading Days", "Qualifying Days", "Minimum Profitable Days"',
  },
  {
    id: 'payoutDrawdown', max: 2, points: [2, 1, 0.5],
    keywords: '"Drawdown Lock Upon Payout", "Payout Drawdown Adjustment", "Withdrawal Impact on Drawdown", "Buffer after withdrawal"',
  },
  {
    id: 'weekend', max: 1, points: [1, 0.75, 0.25],
    keywords: '"Weekend Holding", "Hold Over Weekend", "Friday Close", "Weekend Gap Risk", "Flat by Friday", "Swing Add-on"',
  },
];

/** Tüm maddelerin en yüksek puanları toplamı — 100. */
export const PROP_MAX_SCORE = PROP_CRITERIA.reduce((sum, c) => sum + c.max, 0);

/** Her maddede en kötü seçenek seçilseydi çıkacak puan — tabanın sıfır olmadığını gösterir. */
export const PROP_MIN_SCORE = PROP_CRITERIA.reduce((sum, c) => sum + Math.min(...c.points), 0);

export interface ScoreBand {
  min: number;
  color: string;
  /** Bandın adı, dil koduna göre. */
  label: Record<string, string>;
}

export const SCORE_BANDS: ScoreBand[] = [
  {
    min: 85, color: '#34d399',
    label: {
      tr: 'Kusursuza yakın — nadir bulunur', en: 'Near flawless — rare',
      fa: 'تقریباً بی‌نقص — کمیاب', ar: 'شبه مثالي — نادر',
      ru: 'Почти безупречно — редкость', es: 'Casi impecable — poco común',
      pt: 'Quase impecável — raro', de: 'Nahezu makellos — selten',
      fr: 'Presque parfait — rare',
    },
  },
  {
    min: 70, color: '#a3e635',
    label: {
      tr: 'Güçlü hesap, sektörün üst dilimi', en: 'Strong account, top of the field',
      fa: 'حساب قوی، در ردهٔ بالای بازار', ar: 'حساب قوي، في الشريحة العليا',
      ru: 'Сильный счёт, верхний эшелон', es: 'Cuenta sólida, en lo alto del sector',
      pt: 'Conta forte, no topo do setor', de: 'Starkes Konto, oberes Feld',
      fr: 'Compte solide, haut du panier',
    },
  },
  {
    min: 55, color: '#fbbf24',
    label: {
      tr: 'Ortalama — çoğu firma bu bantta', en: 'Average — where most firms sit',
      fa: 'متوسط — بیشتر شرکت‌ها اینجا هستند', ar: 'متوسط — حيث تقع معظم الشركات',
      ru: 'Средне — здесь большинство фирм', es: 'Media — donde está la mayoría',
      pt: 'Média — onde está a maioria', de: 'Durchschnitt — hier liegen die meisten',
      fr: 'Moyen — la plupart des firmes',
    },
  },
  {
    min: 40, color: '#fb923c',
    label: {
      tr: 'Zayıf, ciddi kısıtlar var', en: 'Weak, with serious restrictions',
      fa: 'ضعیف، با محدودیت‌های جدی', ar: 'ضعيف، بقيود جدية',
      ru: 'Слабо, серьёзные ограничения', es: 'Débil, con restricciones serias',
      pt: 'Fraca, com restrições sérias', de: 'Schwach, mit harten Auflagen',
      fr: 'Faible, restrictions sérieuses',
    },
  },
  {
    min: 0, color: '#f87171',
    label: {
      tr: 'Kötü', en: 'Poor', fa: 'ضعیف', ar: 'سيئ', ru: 'Плохо',
      es: 'Malo', pt: 'Ruim', de: 'Schlecht', fr: 'Mauvais',
    },
  },
];

export const bandFor = (score: number): ScoreBand =>
  SCORE_BANDS.find(b => score >= b.min) || SCORE_BANDS[SCORE_BANDS.length - 1];

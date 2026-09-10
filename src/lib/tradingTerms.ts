/**
 * Trading terimleri sözlüğü — sesle yazdırılan notlar için.
 *
 * Tarayıcının konuşma tanıması genel dil için eğitilmiş: "change of character"
 * duyduğunda CHoCH yazmayı, "order bloğu" duyduğunda bunun İngilizce bir terim
 * olduğunu bilmez. Tanımaya kelime öğretemiyoruz (Web Speech API'nin sözlük
 * desteği yok), ama duyduğunu sonradan düzeltebiliriz.
 *
 * Buradaki düzeltme yapaydır ve kesindir: yapay zekâya sorulmaz, internet
 * gerektirmez, her seferinde aynı sonucu verir. AI düzeltmesi bunun üstüne
 * biner — o da açık uçlu yanlış duymaları toparlar.
 *
 * Türkçe ekler: terim İngilizce kalır, ek kesme işaretiyle bağlanır —
 * "order bloğu" → "Order Block'u", "FVG'ye" → "FVG'ye". Ek olduğu gibi
 * korunur; konuşan zaten doğru eki söylemiştir.
 */

/**
 * Türkçe ekler. İki biçimde gelirler: kelimeye yapışık ("bloğu", "Block'u")
 * ya da tanıma ayırdığında boşlukla ("FVG ye"). Boşluklu biçimde İngilizce
 * kelimeyle karışabilecek ekler (a, e, in, de, la…) bilerek yok — yoksa
 * İngilizce bir notta "an order block a few minutes later" bozulurdu.
 *
 * Türkçe ekler üst üste biner: "bloğunu" = un + u, "bloklarını" = lar + ın + ı.
 * Yapışık biçimde en fazla dört ek arka arkaya kabul ediliyor; sınır, uzun bir
 * harf dizisinde regex'in geri izlemeyle boğulmaması için.
 */
const ATTACHED =
  "lerden|lardan|lerde|larda|lere|lara|leri|ları|ler|lar|ndan|nden|nda|nde|den|dan|ten|tan|nin|nın|nun|nün|yle|yla|ydı|ydi|dir|dır|tir|tır|mış|miş|ken|de|da|te|ta|le|la|ye|ya|yi|yı|un|ün|ın|in|ki|u|ü|ı|i|a|e";
const SPACED =
  "lerden|lardan|lerde|larda|lere|lara|leri|ları|ler|lar|den|dan|ten|tan|nin|nın|nun|nün|yle|yla|dir|dır|tir|tır|ye|ya|yi|yı|yu|yü|ün|ın|ı|ü";
const SUFFIX = `(?:['’´]?((?:${ATTACHED}){1,4})|\\s(${SPACED}))?`;

/** Terimden önce harf/rakam olmamalı — "reorder block" yakalanmasın. */
const LEAD = '(^|[^\\p{L}\\p{N}])';
/**
 * Arapça ve Farsçada bağlaç ve edatlar kelimeye yapışır: "وتيك بروفيت" =
 * "ve Take Profit". Bunları da başlangıç sayıyoruz, yoksa terim kaçar.
 */
const LEAD_RTL = '(^|[^\\p{L}\\p{N}]|[وفبلك])';

/**
 * Ekin terime nasıl bağlanacağı. Türkçede kesme işaretiyle ("Order Block'u"),
 * İngilizcede doğrudan ("Order Blocks"), Rusça/Farsça/Arapçada ise hiç: o
 * dillerde çekim eki terimin kendisine değil cümleye ait, düşürmek doğrusu —
 * zaten "по order block" diye yazılıyor.
 */
type Join = 'apostrophe' | 'plain' | 'drop';

interface Spec {
  canonical: string;
  variants: string[];
  suffixes: boolean;
  /** Yalnız belli bir dilde geçerli olan biçimler: dil kodu → biçimler. */
  byLang: Record<string, string[]>;
}
interface Rule { re: RegExp; canonical: string; join: Join }

/**
 * Bir terim kuralı. `variants` küçük harfle yazılmış regex parçalarıdır;
 * aralarındaki boşluk "boşluk, tire ya da bitişik" anlamına gelir, böylece
 * "orderblock" da "order-block" da yakalanır.
 */
function rule(canonical: string, variants: string[], suffixes = true,
              byLang: Record<string, string[]> = {}): Spec {
  return { canonical, variants, suffixes, byLang };
}

/** Rusçada terime yapışan çekim ekleri — eşleşmede yutulur, yazıya geçmez. */
const RU_CASE = '(?:ами|ому|ого|ов|ом|ам|ах|ей|ая|ые|ый|ой|а|у|е|ы|и|о)';
/** Farsça/Arapçada çoğul ve izafe: "بلاک‌ها", "بلاکی". */
const RTL_TAIL = "(?:ها|های|ی|هایی)";

/**
 * Sözlüğü bir dile göre derler.
 *
 * Türkçe ekler yalnız Türkçe metinde aranır: "stop loss ten pips below"
 * cümlesinde "ten" İngilizce bir kelime, ek değil — Türkçe kuralları
 * İngilizceye uygularsak "Stop Loss'ten pips" çıkar. İngilizcede ekin yerini
 * çoğul "s" alır ve kesme işareti kullanılmaz: "order blocks" → "Order Blocks".
 */
const JOIN: Record<string, Join> = { tr: 'apostrophe', ru: 'drop', fa: 'drop', ar: 'drop' };

function tailFor(language: string, suffixes: boolean): string {
  if (!suffixes) return '()()';
  if (language === 'tr') return SUFFIX;
  if (language === 'ru') return `(${RU_CASE})?()`;
  if (language === 'fa' || language === 'ar') return `(${RTL_TAIL})?()`;
  return '(s)?()';
}

function compile(specs: Spec[], language: string): Rule[] {
  return specs.map(sp => {
    const variants = [...sp.variants, ...(sp.byLang[language] || [])];
    const body = variants.map(v => v.trim().replace(/\s+/g, '[\\s-]*')).join('|');
    // Ek almayan terimlerde de iki grup duruyor: yerleri sabit kalsın diye boş.
    const tail = tailFor(language, sp.suffixes);
    const lead = language === 'ar' || language === 'fa' ? LEAD_RTL : LEAD;
    // Sonda kesme işareti kalmışsa eşleşmiyoruz: "bloğu'u" gibi bozuk bir metne
    // ikinci bir ek yapıştırmaktansa hiç dokunmamak daha az zarar verir.
    return {
      canonical: sp.canonical,
      join: JOIN[language] || 'plain',
      re: new RegExp(`${lead}(?:${body})${tail}(?![\\p{L}\\p{N}'’´])`, 'giu'),
    };
  });
}

/**
 * Sözlük. Her satır: doğru yazım + konuşma tanımanın onun yerine yazdıkları.
 * Türkçe fonetik karşılıklar ("çenç of karakter") bilerek burada — tanıma
 * Türkçe dinlerken İngilizce terimi böyle yazıyor.
 */
const SPECS: Spec[] = [
  // — ICT / Smart Money ————————————————————————————————
  // Kısaltmalar da söyleniyor: "OB", "TP", "FVG"… Harflerin Türkçe okunuşu
  // (obe, tepe, sele) bilerek yok — "tepe" ve "sele" gerçek kelimeler, notu
  // bozarlardı. Yazıya "ob", "tp" olarak düşen biçimleri yakalıyoruz.
  rule('CHoCH', ['ch(?:o|a)ch', 'çoç',
                 '(?:change|chan?ge|ch(?:e|ey)n[cç]|ç(?:e|ey)n[cç]|chain) of (?:ch?ara[ck]ter|karakter)'], true,
       { ru: ['чоч', 'ч(?:е|э)н(?:дж|ч) оф к(?:а|э)рактер'],
         fa: ['چاچ', 'چوچ', 'چنج آف کرکتر'], ar: ['تشوتش', 'تشينج اوف كاراكتر'] }),
  // Kısaltmanın kendisi de söyleniyor: "bos", "b o s", bazen "boss". Türkçe
  // "boş" bilerek dışarıda — gerçek bir kelime, ona dokunmak notu bozardı;
  // onu bağlamdan anlaması için yapay zekâya bırakıyoruz.
  // "boss" ve düz "bos" yalnız Türkçe metinde BOS sayılır: İngilizcede "boss"
  // patron demek, üstelik çoğul eki yüzünden "BOSs" gibi bir şeye dönüşürdü.
  // İngilizce notta zaten "BOS" diye doğru yazılıyor, dokunmaya gerek yok.
  rule('BOS', ['break of structure', 'brake of structure', 'br(?:e|ey)k of strak(?:t|ç|c)(?:ı|i)r'],
       true, { tr: ['b o s', 'boss'], ru: ['брейк оф структур'],
               fa: ['بی او اس', 'بریک آف استراکچر'], ar: ['بريك اوف ستراكتشر'] }),
  rule('MSS', ['market structure shift', 'market strak(?:t|ç|c)(?:ı|i)r şift', 'm s s']),
  // Özel biçimler genelden önce: "inversion fvg" düz FVG'ye düşmesin.
  rule('Inversion FVG', ['inversion f v g', 'inversiyon f v g', 'i f v g']),
  rule('BPR', ['balanced price range', 'b p r']),
  rule('FVG', ['f v g', 'fair value ga?e?p', 'f(?:e|ey)r v(?:a|e)ly?u g(?:a|e)p'], true,
       { ru: ['фвг', 'ф в г', 'ф(?:э|е)йр в(?:э|е)лью г(?:э|е)п'],
         fa: ['اف وی جی', 'فیر ولیو گپ'], ar: ['اف في جي', 'فير فاليو جاب'] }),
  rule('Order Block', ['order blo(?:ck|k|ğ|g)', 'ord(?:ı|i)r blo(?:ck|k|ğ|g)', 'order bl(?:a|e)k', 'ob'], true,
       { ru: ['ордер бло(?:к|ки)', 'орде?р-блок'],
         fa: ['اردر بلاک', 'اوردر بلاک', 'آردر بلاک'],
         ar: ['اوردر بلوك', 'أوردر بلوك', 'اوردر بلوك'] }),
  rule('Breaker Block', ['breaker blo(?:ck|k|ğ|g)', 'br(?:i|e)k(?:ı|e)r blo(?:ck|k|ğ|g)'], true,
       { ru: ['брейкер блок'], fa: ['بریکر بلاک'], ar: ['بريكر بلوك'] }),
  rule('Mitigation Block', ['mitigation blo(?:ck|k|ğ|g)', 'mitigasyon blo(?:ck|k|ğ|g)'], true,
       { ru: ['митигейшн блок'], fa: ['میتیگیشن بلاک'], ar: ['ميتيجيشن بلوك'] }),
  rule('Rejection Block', ['rejection blo(?:ck|k|ğ|g)', 'ricekşın blo(?:ck|k|ğ|g)']),
  rule('Propulsion Block', ['propulsion blo(?:ck|k|ğ|g)', 'propulsiyon blo(?:ck|k|ğ|g)']),
  rule('BSL', ['buy side liquidity', 'bay sayd likidite', 'b s l']),
  rule('SSL', ['sell side liquidity', 'sel sayd likidite', 's s l']),
  rule('ERL', ['external range liquidity', 'e r l']),
  rule('IRL', ['internal range liquidity', 'i r l']),
  rule('Liquidity Sweep', ['liquidity sweep', 'likidite sweep', 'likidite s(?:v|w)ip'], true,
       { ru: ['ликвидити свип'], fa: ['لیکوییدیتی سوییپ'], ar: ['ليكويديتي سويب'] }),
  rule('Liquidity Void', ['liquidity void', 'likidite void']),
  rule('Stop Hunt', ['stop hunt', 'stop hant', 'stop raid']),
  rule('Turtle Soup', ['turtle soup', 'türt(?:ı|i)l sup']),
  rule('Judas Swing', ['judas s(?:v|w)ing', 'cudas s(?:v|w)ing']),
  rule('Silver Bullet', ['silver bullet', 'silv(?:ı|e)r bul(?:e|ı)t']),
  rule('Displacement', ['displacement', 'displ(?:e|a)ysment', 'displasman'], true,
       { ru: ['дисплейсмент'], fa: ['دیسپلیسمنت'] }),
  // Ek yok: "otel", "otele", "oteli" gerçek kelimeler — OTE ek alsaydı onları
  // yerdi. Ek almayınca "ote" tek başınayken yakalanır, "otele" es geçilir.
  rule('OTE', ['optimal trade entry', 'o t e'], false),
  rule('PO3', ['power of three', 'p o 3']),
  rule('SMT', ['s m t']),
  rule('Unicorn', ['unicorn', 'yunikorn']),
  rule('Consequent Encroachment', ['consequent encroachment']),
  rule('Equilibrium', ['equilibrium', 'ekuilibriyum', 'ikuilibrium']),
  rule('Premium', ['premium', 'premyum'], true,
       { ru: ['премиум'], fa: ['پریمیوم'], ar: ['بريميوم'] }),
  rule('Discount', ['discount', 'diskaunt'], true,
       { ru: ['дискаунт'], fa: ['دیسکانت'], ar: ['ديسكاونت'] }),
  rule('Dealing Range', ['dealing range', 'diling reync']),
  rule('Volume Imbalance', ['volume imbalance', 'volüm i(?:m|n)balans']),
  rule('Imbalance', ['imbalance', 'i(?:m|n)balans'], true,
       { ru: ['имбаланс'], fa: ['ایمبالانس'], ar: ['ايمبالانس'] }),
  rule('Inducement', ['inducement', 'indus(?:e)?ment']),
  rule('Mitigation', ['mitigation', 'mitigasyon']),
  rule('Equal Highs', ['equal highs', 'ikual hays', 'e q h']),
  rule('Equal Lows', ['equal lows', 'ikual lo(?:v|w)s', 'e q l']),
  rule('Swing High', ['swing high', 's(?:v|w)ing hay'], true, { ru: ['свинг хай'] }),
  rule('Swing Low', ['swing low', 's(?:v|w)ing lo(?:v|w)?'], true, { ru: ['свинг лоу'] }),
  rule('PDH', ['previous day high', 'p d h']),
  rule('PDL', ['previous day low', 'p d l']),
  rule('PWH', ['previous week high', 'p w h']),
  rule('PWL', ['previous week low', 'p w l']),
  rule('NDOG', ['new day opening gap', 'n d o g']),
  rule('NWOG', ['new week opening gap', 'n w o g']),
  rule('Supply Zone', ['supply zone', 'saplay zon']),
  rule('Demand Zone', ['demand zone', 'dimand zon']),
  rule('POI', ['point of interest', 'p o i'], true,
       { ru: ['поинт оф интерест'], fa: ['پی او آی'] }),
  rule('Killzone', ['kill zone', 'k(?:ı|i)l zon'], true,
       { ru: ['килзон', 'кил зона'], fa: ['کیل زون'], ar: ['كيل زون'] }),
  rule('HTF', ['high time ?frame', 'hay taym fr(?:e|ey)m', 'h t f']),
  rule('LTF', ['low time ?frame', 'lo taym fr(?:e|ey)m', 'l t f']),
  rule('Daily Bias', ['daily bias', 'deyli bayıs']),
  rule('Order Flow', ['order flow', 'ordır flo(?:v|w)?']),

  // — Fiyat hareketi ve formasyonlar ——————————————————
  rule('Breakout', ['breakout', 'br(?:e|i)kaut']),
  rule('Fakeout', ['fake out', 'f(?:e|ey)kaut']),
  // "pull back" İngilizcede fiil ("price will pull back"); orada dokunmuyoruz.
  rule('Pullback', ['pulb(?:e|a)k'], true, { tr: ['pull back'], ru: ['пулбэк', 'пуллбек'] }),
  rule('Retest', ['re test', 'rit(?:e|ı)st'], true,
       { ru: ['ретест'], fa: ['ری تست'], ar: ['ريتست'] }),
  rule('Divergence', ['divergence', 'div(?:e|ı)rc(?:a|ı)ns', 'dayvırcıns', 'diverjans']),
  rule('Engulfing', ['engulfing', 'ing(?:a|ı)lfing']),
  rule('Pin Bar', ['pin bar', 'pinbar']),
  rule('Doji', ['doji', 'doci']),
  rule('Inside Bar', ['inside bar', 'insayd bar']),
  rule('Double Top', ['double top', 'dabıl top']),
  rule('Double Bottom', ['double bottom', 'dabıl botom']),

  // — İndikatörler ————————————————————————————————————
  rule('RSI', ['r s i']),
  rule('MACD', ['m a c d', 'makdi']),
  rule('EMA', ['e m a']),
  rule('SMA', ['s m a']),
  rule('VWAP', ['v w a p', 'vivap']),
  rule('ATR', ['a t r']),
  rule('Fibonacci', ['fibonacci', 'fibonaci', 'fibo']),
  rule('Bollinger', ['bollinger', 'bolinger', 'bolincır']),
  rule('Stochastic', ['stochastic', 'stokastik']),
  rule('Ichimoku', ['ichimoku', 'içimoku']),

  // — Emir, risk, hesap ————————————————————————————————
  rule('Stop Loss', ['stop lo(?:ss|s)', 'st(?:a|o)p los', 's l'], true,
       { ru: ['стоп ло(?:сс|с)'], fa: ['استاپ لا?س'], ar: ['ستوب لو(?:س|ز)'] }),
  rule('Take Profit', ['take profit', 't(?:e|ey)k profit', 't p'], true,
       { ru: ['тейк профит'], fa: ['تیک پ(?:ر|رو)افیت', 'تیک پروفیت'], ar: ['تيك بروفيت'] }),
  rule('Break Even', ['break even', 'br(?:e|i)k (?:e|i)v(?:e|ı)n'], true,
       { ru: ['брейк ивен'], fa: ['بریک ایون'] }),
  rule('Trailing Stop', ['trailing stop', 'tr(?:e|ey)ling stop']),
  rule('Risk/Reward', ['risk re?ward', 'risk riv(?:a|o)rd', 'r r'], true,
       { ru: ['риск ревард'], fa: ['ریسک ریوارد'], ar: ['ريسك ريوارد'] }),
  rule('Drawdown', ['draw down', 'dr(?:a|o)vdaun', 'dradaun'], true,
       { ru: ['драудаун'], fa: ['دراودان'] }),
  rule('Slippage', ['slippage', 'slip(?:a|ı)c', 'slipaj']),
  rule('Spread', ['spread', 'spr(?:a|e)d']),
  rule('Swap', ['svap']),
  rule('Payout', ['payout', 'p(?:e|a)yaut']),
  rule('Prop Firm', ['prop firm', 'pr(?:a|o)p firm']),
  rule('Win Rate', ['win rate', 'vin r(?:e|ey)t']),
  rule('Profit Factor', ['profit factor', 'profit faktör']),
  rule('Scalp', ['scalp', 'skalp']),

  // — Haber ——————————————————————————————————————————
  rule('NFP', ['n f p', 'non farm payroll(?:s)?']),
  rule('CPI', ['c p i']),
  rule('PPI', ['p p i']),
  rule('PMI', ['p m i']),
  rule('GDP', ['g d p']),
  rule('FOMC', ['f o m c', 'fom(?:s|c)i', 'efomsi']),
];

/** Kendi terim biçimleri olan diller; kalanı ortak (İngilizce) sete düşer. */
const COMPILED: Record<string, Rule[]> = {
  tr: compile(SPECS, 'tr'),
  ru: compile(SPECS, 'ru'),
  fa: compile(SPECS, 'fa'),
  ar: compile(SPECS, 'ar'),
  intl: compile(SPECS, 'intl'),
};
const rulesFor = (language: string) => COMPILED[language] || COMPILED.intl;

/** Sesle yazılmış metindeki terimleri doğru yazımlarına çevirir. */
export function fixTerms(text: string, language: string): string {
  let out = text;
  for (const { re, canonical, join } of rulesFor(language)) {
    out = out.replace(re, (_m, lead: string, attached?: string, spaced?: string) => {
      const suffix = attached || spaced;
      if (!suffix || join === 'drop') return lead + canonical;
      return lead + canonical + (join === 'apostrophe' ? `'${suffix}` : suffix);
    });
  }
  return out;
}

/** Metinde kaç tanınmış terim geçiyor — tanımanın alternatifleri arasında seçim için. */
export function countTerms(text: string, language: string): number {
  let n = 0;
  for (const { re } of rulesFor(language)) n += (text.match(re) || []).length;
  return n;
}

/** AI'ya verilecek terim listesi; sözlükle aynı yazımı kullansın diye buradan üretilir. */
export const TERM_LIST = SPECS.map(r => r.canonical).join(', ');

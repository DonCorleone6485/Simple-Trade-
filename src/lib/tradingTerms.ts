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
  "lerden|lardan|lerde|larda|lere|lara|leri|ları|ler|lar|ndan|nden|nda|nde|den|dan|ten|tan|nin|nın|nun|nün|yle|yla|ydı|ydi|dir|dır|tir|tır|mış|miş|ken|de|da|te|ta|le|la|ye|ya|un|ün|ın|in|ki|u|ü|ı|i|a|e";
const SPACED =
  "lerden|lardan|lerde|larda|lere|lara|leri|ları|ler|lar|den|dan|ten|tan|nin|nın|nun|nün|yle|yla|dir|dır|tir|tır|ye|ya|ün|ın|ı|ü";
const SUFFIX = `(?:['’´]?((?:${ATTACHED}){1,4})|\\s(${SPACED}))?`;

/** Terimden önce harf/rakam olmamalı — "reorder block" yakalanmasın. */
const LEAD = '(^|[^\\p{L}\\p{N}])';

interface Rule { re: RegExp; canonical: string }

/**
 * Bir terim kuralı. `variants` küçük harfle yazılmış regex parçalarıdır;
 * aralarındaki boşluk "boşluk, tire ya da bitişik" anlamına gelir, böylece
 * "orderblock" da "order-block" da yakalanır.
 */
function rule(canonical: string, variants: string[]): Rule {
  const body = variants.map(v => v.trim().replace(/\s+/g, '[\\s-]*')).join('|');
  // Sonda kesme işareti kalmışsa eşleşmiyoruz: "bloğu'u" gibi bozuk bir metne
  // ikinci bir ek yapıştırmaktansa hiç dokunmamak daha az zarar verir.
  return { canonical, re: new RegExp(`${LEAD}(?:${body})${SUFFIX}(?![\\p{L}\\p{N}'’´])`, 'giu') };
}

/**
 * Sözlük. Her satır: doğru yazım + konuşma tanımanın onun yerine yazdıkları.
 * Türkçe fonetik karşılıklar ("çenç of karakter") bilerek burada — tanıma
 * Türkçe dinlerken İngilizce terimi böyle yazıyor.
 */
const RULES: Rule[] = [
  // Kısaltmalar da söyleniyor: "OB", "TP", "FVG"… Harflerin Türkçe okunuşu
  // (obe, tepe, sele) bilerek yok — "tepe" ve "sele" gerçek kelimeler, notu
  // bozarlardı. Yazıya "ob", "tp" olarak düşen biçimleri yakalıyoruz.
  rule('CHoCH', ['ch(?:o|a)ch', 'çoç',
                 '(?:change|chan?ge|ch(?:e|ey)n[cç]|ç(?:e|ey)n[cç]|chain) of (?:ch?ara[ck]ter|karakter)']),
  // Kısaltmanın kendisi de söyleniyor: "bos", "b o s", bazen "boss". Türkçe
  // "boş" bilerek dışarıda — gerçek bir kelime, ona dokunmak notu bozardı;
  // onu bağlamdan anlaması için yapay zekâya bırakıyoruz.
  rule('BOS', ['break of structure', 'brake of structure', 'br(?:e|ey)k of strakt(?:ı|i)r',
               'b o s', 'boss']),
  rule('FVG', ['f v g', 'fair value ga?e?p', 'f(?:e|ey)r v(?:a|e)ly?u g(?:a|e)p']),
  rule('Order Block', ['order blo(?:ck|k|ğ|g)', 'ord(?:ı|i)r blo(?:ck|k|ğ|g)', 'order bl(?:a|e)k', 'ob']),
  rule('Breaker Block', ['breaker blo(?:ck|k|ğ|g)', 'br(?:i|e)k(?:ı|e)r blo(?:ck|k|ğ|g)']),
  rule('Mitigation Block', ['mitigation blo(?:ck|k|ğ|g)', 'mitigasyon blo(?:ck|k|ğ|g)']),
  rule('Liquidity Sweep', ['liquidity sweep', 'likidite sweep', 'likidite s(?:v|w)ip']),
  rule('SMT', ['s m t']),
  rule('Imbalance', ['imbalance', 'i(?:m|n)balans']),
  rule('Inducement', ['inducement', 'indus(?:e)?ment']),
  rule('Equal Highs', ['equal highs', 'ikual hays', 'e q h']),
  rule('Equal Lows', ['equal lows', 'ikual lo(?:v|w)s', 'e q l']),
  rule('Swing High', ['swing high', 's(?:v|w)ing hay']),
  rule('Swing Low', ['swing low', 's(?:v|w)ing lo(?:v|w)?']),
  rule('Supply Zone', ['supply zone', 'saplay zon']),
  rule('Demand Zone', ['demand zone', 'dimand zon']),
  rule('Killzone', ['kill zone', 'k(?:ı|i)l zon']),
  rule('HTF', ['high time ?frame', 'hay taym fr(?:e|ey)m', 'h t f']),
  rule('LTF', ['low time ?frame', 'lo taym fr(?:e|ey)m', 'l t f']),
  rule('POI', ['point of interest', 'p o i']),
  rule('Stop Loss', ['stop lo(?:ss|s)', 'st(?:a|o)p los', 's l']),
  rule('Take Profit', ['take profit', 't(?:e|ey)k profit', 't p']),
  rule('Break Even', ['break even', 'br(?:e|i)k (?:e|i)v(?:e|ı)n']),
  rule('Trailing Stop', ['trailing stop', 'tr(?:e|ey)ling stop']),
  rule('Risk/Reward', ['risk re?ward', 'risk riv(?:a|o)rd', 'r r']),
  rule('Fakeout', ['fake out', 'f(?:e|ey)kaut']),
  rule('Pullback', ['pull back', 'pulb(?:e|a)k']),
  rule('Retest', ['re test', 'rit(?:e|ı)st']),
];

/** Sesle yazılmış metindeki terimleri doğru yazımlarına çevirir. */
export function fixTerms(text: string): string {
  let out = text;
  for (const { re, canonical } of RULES) {
    out = out.replace(re, (_m, lead: string, attached?: string, spaced?: string) => {
      const suffix = attached || spaced;
      return lead + canonical + (suffix ? `'${suffix}` : '');
    });
  }
  return out;
}

/** Metinde kaç tanınmış terim geçiyor — tanımanın alternatifleri arasında seçim için. */
export function countTerms(text: string): number {
  let n = 0;
  for (const { re } of RULES) n += (text.match(re) || []).length;
  return n;
}

/** AI'ya verilecek terim listesi; sözlükle aynı yazımı kullansın diye buradan üretilir. */
export const TERM_LIST = RULES.map(r => r.canonical).join(', ');

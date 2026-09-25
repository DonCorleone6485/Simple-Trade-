import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://obaqhbfaeejepocsdgiv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY!
);

const hash = (key: string) => createHash('sha256').update(key).digest('hex');

/** Tek seferde kabul edilen işlem sayısı — kazara ya da kasten dev gövde gelmesin. */
const MAX_TRADES = 200;

/** Ücretsiz planın toplam işlem sınırı — uygulamadakiyle aynı. */
const FREE_TRADE_LIMIT = 20;

type Incoming = {
  externalId?: string | number;
  openTime?: string | number;
  closeTime?: string | number;
  symbol?: string;
  type?: string;
  openPrice?: number;
  closePrice?: number;
  sl?: number;
  tp?: number;
  profit?: number;
  commission?: number;
  swap?: number;
  fee?: number;
  /** MT5 pozisyonun neden kapandığını kendisi bilir: 'sl' | 'tp' | 'manual'. */
  closeReason?: string;
};

const num = (v: any) => (typeof v === 'number' && isFinite(v) ? v : parseFloat(v) || 0);
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Zaman.
 *
 * En güvenilir biçim, saniye cinsinden UTC damgasıdır — EA `TimeGMT()` ile
 * gönderir, ortada yorumlanacak bir şey kalmaz. MetaTrader'ın kendi yazdığı
 * "2026.09.07 12:49:20" biçimi de kabul edilir ve UTC sayılır; EA sunucu
 * saatini göndermeden önce GMT'ye çevirmekle yükümlüdür. Sunucu saatini
 * olduğu gibi yollamak, aynı işlemin dosyadan gelenle farklı saatte
 * görünmesine yol açar.
 */
function toISO(raw?: string | number): string | null {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'number' || /^\d{9,11}$/.test(String(raw))) {
    const d = new Date(Number(raw) * 1000);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  const mt = String(raw).match(/(\d{4})[.\-/](\d{2})[.\-/](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  const d = mt
    ? new Date(`${mt[1]}-${mt[2]}-${mt[3]}T${mt[4]}:${mt[5]}:${mt[6] || '00'}Z`)
    : new Date(String(raw));
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Sonuç, kapanışın stop ya da hedefe göre nerede olduğundan çıkar; kâr/zararın
 * işareti tek başına stop olmakla elle kapatmayı ayırt etmez.
 * (İçe aktarmadaki mtResult ile aynı kural.)
 */
function resultOf(net: number, type: 'Buy' | 'Sell', close: number, sl: number, tp: number, reason?: string) {
  if (net === 0) return 'Başa Baş';
  // MT5 kapanış sebebini kendi kaydeder; fiyat karşılaştırmasından kesindir.
  if (reason === 'sl') return net > 0 ? 'Manuel Karda' : 'Başarısız';
  if (reason === 'tp') return net > 0 ? 'Başarılı' : 'Manuel Zararda';
  if (reason === 'manual') return net > 0 ? 'Manuel Karda' : 'Manuel Zararda';

  const buy = type === 'Buy';
  if (net < 0) {
    if (close > 0 && sl > 0 && (buy ? close <= sl : close >= sl)) return 'Başarısız';
    return (sl > 0 || tp > 0) && close > 0 ? 'Manuel Zararda' : 'Başarısız';
  }
  if (close > 0 && tp > 0 && (buy ? close >= tp : close <= tp)) return 'Başarılı';
  return (sl > 0 || tp > 0) && close > 0 ? 'Manuel Karda' : 'Başarılı';
}

/**
 * ELLE GİRİLEN AÇIK İŞLEMİ TAMAMLAMAK
 *
 * Kullanıcı pozisyonu MetaTrader'da açtıktan sonra journal'a "işlem öncesi"
 * olarak girebiliyor: sonuç boş, notlar ve fotoğraflar dolu. Pozisyon kapanınca
 * EA aynı işlemi getiriyor ve o zamana kadar bu ikinci bir satır olarak
 * ekleniyordu — kullanıcının yazdığı her şey bir kenarda, gerçek sonuç
 * başka bir kenarda kalıyordu.
 *
 * Artık EA'nın getirdiği işlem, önce bekleyen açık kayıtla eşleştirilmeye
 * çalışılıyor; eşleşirse o satır DOLDURULUYOR, yeni satır açılmıyor.
 *
 * Eşleşmenin ölçütü ne olabilir: elle girilen kaydın platform numarası yok,
 * yani kesin kimlik yok. Elimizde sembol, yön, giriş fiyatı ve zaman var.
 * Ayırt edici olan fiyattır — kullanıcı fiyatı MetaTrader'dan kopyalıyor.
 * Fiyat yazılmamışsa sembol + yön + zaman penceresi ile yetiniyoruz.
 *
 * Yanlış eşleşmeye karşı iki kural: fiyatlar belirgin biçimde ayrılıyorsa aday
 * tamamen düşer, ve her aday tek bir işlemle eşleşir — aynı sembolde iki açık
 * pozisyonu olan biri iki kaydının ikisini de doğru doldurulmuş görür.
 */

/** Plan ile gerçek açılış arasındaki en fazla fark. */
const MATCH_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Fiyat bu orandan fazla ayrılıyorsa aynı işlem sayılmaz. Binde beş, EURUSD'de
 * ~55 pip: kaymayı ve spread'i rahatça kapsar, ayrı bir kuruluma benzemez.
 */
const PRICE_TOLERANCE = 0.005;

export interface OpenCandidate {
  id: string;
  symbol: string;
  type: string;
  date: string;
  entry_price?: number | null;
  stop_loss?: number | null;
  risk?: number | null;
  rr?: string | null;
}

export interface MatchInput {
  symbol: string;
  type: 'Buy' | 'Sell';
  openPrice: number;
  openTime: string;
}

export function matchOpenTrade(inc: MatchInput, candidates: OpenCandidate[]): OpenCandidate | null {
  const openMs = new Date(inc.openTime).getTime();
  let best: OpenCandidate | null = null;
  // Sıralama ölçütü: fiyatı tutan aday her zaman fiyatı yazılmamış adaydan
  // önce gelir; sonra fiyat farkı, sonra zaman farkı.
  let bestTier = 2, bestGap = Infinity, bestDt = Infinity;

  for (const c of candidates) {
    if ((c.symbol || '').toUpperCase().trim() !== inc.symbol) continue;
    if (c.type !== inc.type) continue;

    const dt = Math.abs(new Date(c.date).getTime() - openMs);
    if (!isFinite(dt) || dt > MATCH_WINDOW_MS) continue;

    const price = Number(c.entry_price) || 0;
    let tier = 1, gap = 0;
    if (price > 0 && inc.openPrice > 0) {
      gap = Math.abs(price - inc.openPrice) / inc.openPrice;
      if (gap > PRICE_TOLERANCE) continue;
      tier = 0;
    }

    if (tier < bestTier || (tier === bestTier && (gap < bestGap || (gap === bestGap && dt < bestDt)))) {
      bestTier = tier; bestGap = gap; bestDt = dt; best = c;
    }
  }
  return best;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { key, trades, startingCapital } = body as
    { key?: string; trades?: Incoming[]; startingCapital?: number };

  if (!key || typeof key !== 'string') return res.status(401).json({ error: 'Missing key' });
  if (!Array.isArray(trades)) return res.status(400).json({ error: 'trades must be an array' });
  if (trades.length > MAX_TRADES) return res.status(413).json({ error: `At most ${MAX_TRADES} trades per request` });

  const { data: apiKey } = await supabase
    .from('api_keys')
    .select('id, user_id, journal_id')
    .eq('key_hash', hash(key))
    .eq('revoked', false)
    .maybeSingle();

  if (!apiKey) return res.status(401).json({ error: 'Invalid key' });

  // Kullanıcının hangi işlemleri zaten var — aynı pozisyon iki kez gönderilse
  // de ikinci kez eklenmesin. EA her açılışta geçmişi baştan taradığı için bu
  // koruma sürekli devrede.
  //
  // Bakılan yer journal değil kullanıcının tamamı: EA'nın getirdiği bir
  // işlemi başka bir journal'a taşıyan kullanıcıya, EA bir sonraki açılışta
  // aynı işlemi eski journal'a yeniden yazıyordu. Numara tek başına yetmez —
  // iki ayrı broker aynı pozisyon numarasını verebilir — sembolle birlikte
  // eşleştiriyoruz.
  const ids = trades.map(t => String(t.externalId ?? '')).filter(Boolean);
  const known = new Set<string>();
  const seenKey = (id: string, symbol: string) => `${id}|${symbol.toUpperCase().trim()}`;
  if (ids.length > 0) {
    const { data: existing } = await supabase
      .from('trades').select('external_id, symbol').eq('user_id', apiKey.user_id).in('external_id', ids);
    (existing || []).forEach((r: any) => r.external_id && known.add(seenKey(String(r.external_id), r.symbol || '')));
  }

  // Ücretsiz planın işlem sınırı. Uygulama tarafında elle giriş ve dosyadan
  // aktarma zaten sınırlı; buradan sınırsız yazılabilseydi sınır anlamsız
  // olurdu — bir yıllık geçmiş çeken biri binlerce satır yollayabilir.
  let remaining = Infinity;
  {
    const { data: account } = await supabase
      .from('users').select('is_pro, pro_until').eq('user_id', apiKey.user_id).maybeSingle();
    const isPro = !!account?.is_pro && (!account.pro_until || new Date(account.pro_until) > new Date());
    if (!isPro) {
      const { count } = await supabase
        .from('trades').select('*', { count: 'exact', head: true }).eq('user_id', apiKey.user_id);
      remaining = Math.max(0, FREE_TRADE_LIMIT - (count || 0));
    }
  }

  // Elle girilmiş, henüz sonuçlanmamış işlemler: EA'nın getirdiği kapanışlar
  // önce bunlarla eşleştirilecek. Yalnızca bu journal'a bakıyoruz — kullanıcı
  // kaydı hangi journal'a girdiyse tamamlanması gereken yer orası.
  const openCandidates: OpenCandidate[] = [];
  {
    const opens = trades.map(t => toISO(t.openTime)).filter(Boolean).sort() as string[];
    if (opens.length > 0) {
      const from = new Date(new Date(opens[0]).getTime() - MATCH_WINDOW_MS).toISOString();
      const { data } = await supabase
        .from('trades')
        .select('id, symbol, type, date, entry_price, stop_loss, risk, rr, result')
        .eq('user_id', apiKey.user_id)
        .eq('journal_id', apiKey.journal_id)
        .is('external_id', null)
        .gte('date', from)
        .limit(500);
      // Sonucu olan kayıt kapanmış demektir; onu doldurmak değil, korumak gerekir.
      (data || []).forEach((r: any) => { if (!r.result) openCandidates.push(r); });
    }
  }

  const rows: any[] = [];
  let merged = 0;
  for (const t of trades) {

    const externalId = t.externalId != null ? String(t.externalId) : null;
    const date = toISO(t.openTime);
    const symbol = (t.symbol || '').toUpperCase().trim();
    if (!date || !symbol) continue;
    if (externalId && known.has(seenKey(externalId, symbol))) continue;

    const type = String(t.type || '').toLowerCase().startsWith('s') ? 'Sell' : 'Buy';
    const gross = num(t.profit);
    const cost = num(t.commission) + num(t.swap) + num(t.fee);
    const net = round2(gross + cost);

    const openPrice = num(t.openPrice);
    const closePrice = num(t.closePrice);
    const sl = num(t.sl);
    const tp = num(t.tp);

    // Risk, stop mesafesinden çıkar: kâr fiyat mesafesiyle orantılıdır.
    const moved = Math.abs(openPrice - closePrice);
    const toStop = Math.abs(openPrice - sl);
    const risk = (sl > 0 && openPrice > 0 && closePrice > 0 && moved > 0 && gross !== 0)
      ? round2((toStop / moved) * Math.abs(gross))
      : (net < 0 ? Math.abs(net) : 0);

    const rr = (sl > 0 && tp > 0 && openPrice > 0)
      ? (() => {
          const r = type === 'Buy' ? Math.abs(openPrice - sl) : Math.abs(sl - openPrice);
          const w = type === 'Buy' ? Math.abs(tp - openPrice) : Math.abs(openPrice - tp);
          return r > 0 ? (w / r).toFixed(2) : '';
        })()
      : '';

    const closeISO = toISO(t.closeTime);
    const exitDate = closeISO && new Date(closeISO) >= new Date(date) ? closeISO : null;
    const result = resultOf(net, type, closePrice, sl, tp, String(t.closeReason || '').toLowerCase());

    // Bekleyen bir kayıt varsa onu tamamlıyoruz. Kullanıcının yazdığı alanlara
    // dokunmuyoruz: notlar, fotoğraflar, kurulum, duygular olduğu gibi kalır.
    // Kendi yazdığı risk / RR / stop da korunur — kendi hesabı bizim
    // tahminimizden iyidir; yalnızca boş bıraktığı yerleri dolduruyoruz.
    const hit = matchOpenTrade({ symbol, type, openPrice, openTime: date }, openCandidates);
    if (hit) {
      const patch: any = { external_id: externalId, date, exit_date: exitDate, reward: net, result };
      if (!(Number(hit.risk) > 0) && risk > 0) patch.risk = risk;
      if (!hit.rr && rr) patch.rr = rr;
      if (hit.stop_loss == null && sl > 0) patch.stop_loss = sl;
      if (hit.entry_price == null && openPrice > 0) patch.entry_price = openPrice;
      if (closePrice > 0) patch.exit_price = closePrice;

      const { error } = await supabase.from('trades').update(patch).eq('id', hit.id);
      if (!error) {
        merged++;
        // Aynı aday ikinci bir pozisyonla eşleşmesin.
        openCandidates.splice(openCandidates.indexOf(hit), 1);
        if (externalId) known.add(seenKey(externalId, symbol));
        continue;
      }
    }

    // Tamamlama satır eklemediği için ücretsiz plan sınırına girmiyor; sınır
    // burada, yeni satır yazılmadan önce işliyor.
    if (rows.length >= remaining) continue;

    rows.push({
      user_id: apiKey.user_id,
      journal_id: apiKey.journal_id,
      date,
      exit_date: exitDate,
      symbol,
      type,
      timeframe: '',
      order_type: 'Market',
      setup: '',
      risk,
      reward: net,
      rr,
      result,
      pre_trade_notes: '',
      post_trade_notes: '',
      pre_trade_photos: [],
      post_trade_photos: [],
      external_id: externalId,
      // EA fiyatları gönderiyor; formdaki fiyat alanları boş kalmasın.
      entry_price: openPrice > 0 ? openPrice : null,
      stop_loss: sl > 0 ? sl : null,
      exit_price: closePrice > 0 ? closePrice : null,
    });
    // Aynı pakette aynı pozisyon iki kez gelirse (eski EA'lar kısmi kapanışı
    // ayrı ayrı gönderiyordu) ikincisini eklemeyiz.
    if (externalId) known.add(seenKey(externalId, symbol));
  }

  let inserted = 0;
  if (rows.length > 0) {
    const { data, error } = await supabase.from('trades').insert(rows).select('id');
    if (error) return res.status(500).json({ error: error.message });
    inserted = (data || []).length;
  }

  // Hesabın gerçek sermayesi EA'dan geliyorsa, journal hâlâ varsayılan
  // 10.000 ile duruyorsa onu düzeltiriz. Kullanıcı kendi bir rakam yazdıysa
  // dokunmayız — onun bildiği bizden iyidir.
  const deposit = Number(startingCapital);
  if (isFinite(deposit) && deposit > 0) {
    const { data: journal } = await supabase
      .from('journals').select('starting_capital').eq('id', apiKey.journal_id).maybeSingle();
    const current = journal?.starting_capital;
    if (current == null || Number(current) === 10000) {
      await supabase.from('journals')
        .update({ starting_capital: round2(deposit) })
        .eq('id', apiKey.journal_id);
    }
  }

  await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', apiKey.id);

  return res.status(200).json({
    inserted,
    merged,
    skipped: trades.length - inserted - merged,
    journalId: apiKey.journal_id,
    ...(remaining !== Infinity && inserted < trades.length
      ? { limit: `Free plan is capped at ${FREE_TRADE_LIMIT} trades.` }
      : {}),
  });
}

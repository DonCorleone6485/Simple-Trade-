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

  // Bu journal'da hangi işlem numaraları zaten var — aynı pozisyon iki kez
  // gönderilse de ikinci kez eklenmesin. EA çevrimdışı kalıp geçmişi baştan
  // taradığında bu koruma devreye girer.
  const ids = trades.map(t => String(t.externalId ?? '')).filter(Boolean);
  const known = new Set<string>();
  if (ids.length > 0) {
    const { data: existing } = await supabase
      .from('trades').select('external_id').eq('journal_id', apiKey.journal_id).in('external_id', ids);
    (existing || []).forEach((r: any) => r.external_id && known.add(String(r.external_id)));
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

  const rows: any[] = [];
  for (const t of trades) {
    if (rows.length >= remaining) break;

    const externalId = t.externalId != null ? String(t.externalId) : null;
    if (externalId && known.has(externalId)) continue;

    const date = toISO(t.openTime);
    const symbol = (t.symbol || '').toUpperCase().trim();
    if (!date || !symbol) continue;

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
    rows.push({
      user_id: apiKey.user_id,
      journal_id: apiKey.journal_id,
      date,
      exit_date: closeISO && new Date(closeISO) >= new Date(date) ? closeISO : null,
      symbol,
      type,
      timeframe: '',
      order_type: 'Market',
      setup: '',
      risk,
      reward: net,
      rr,
      result: resultOf(net, type, closePrice, sl, tp, String(t.closeReason || '').toLowerCase()),
      pre_trade_notes: '',
      post_trade_notes: '',
      pre_trade_photos: [],
      post_trade_photos: [],
      external_id: externalId,
    });
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
    skipped: trades.length - inserted,
    journalId: apiKey.journal_id,
    ...(remaining !== Infinity && inserted < trades.length
      ? { limit: `Free plan is capped at ${FREE_TRADE_LIMIT} trades.` }
      : {}),
  });
}

import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertTriangle, FileText, Columns } from 'lucide-react';
import { Trade, TradeResult } from '../types';
import { useLanguage, detectLanguage } from '../context/LanguageContext';
import { tradeKey } from '../lib/tradeKey';

/**
 * Ayrıştırıcılar bileşenin dışında çalışır, bu yüzden dili context'ten
 * alamazlar; seçilen dil kalıcı olduğu için doğrudan okuyoruz.
 */
const msg = (tr: string, en: string) => (detectLanguage() === 'tr' ? tr : en);

/** İçe aktarılan işlemlerin nereye yazılacağı. */
export type ImportTarget =
  | { kind: 'existing'; journalId: string }
  | { kind: 'new'; name: string };

interface CSVImportProps {
  onImport: (trades: Trade[], target: ImportTarget) => void;
  onClose: () => void;
  /** Açık journal varsa onun kimliği; journal listesinden açıldığında boştur. */
  journalId?: string;
  journalName?: string;
  userId: string;
  /** Açık journal'da hâlihazırda bulunan işlemlerin anahtarları. */
  existingKeys?: string[];
}

interface ParseResult {
  trades: Trade[];
  platform: string;
  errors: string[];
  /** Eşleştirme ekranı için ham veri. */
  headers: string[];
  rows: string[][];
  map: ColumnMap;
  /** Sütunlar tanınamadı — kullanıcının eşleştirmesi gerekiyor. */
  needsMapping?: boolean;
}

// ── PROPER CSV PARSER (handles quoted commas) ──────────────────────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * MetaTrader'ın "Rapor kaydet" çıktısı CSV değil HTML'dir; tablo satırlarını
 * CSV ile aynı biçime (satır -> hücre dizisi) çeviriyoruz.
 */
function parseHTMLTables(content: string): string[][] {
  const doc = new DOMParser().parseFromString(content, 'text/html');
  const rows: string[][] = [];
  doc.querySelectorAll('tr').forEach(tr => {
    const cells = Array.from(tr.querySelectorAll('td, th'))
      // MT5 veri satırlarına görünmez bir dolgu hücresi koyar
      // (<td class="hidden" colspan="8">). Başlıkta karşılığı yoktur; sayılırsa
      // ondan sonraki bütün sütunlar bir kayar ve kâr sütunu swap'ı okur.
      .filter(td => !td.classList.contains('hidden')
        && !/display\s*:\s*none/i.test(td.getAttribute('style') || ''))
      .map(td => (td.textContent || '').replace(/\u00a0/g, ' ').trim());
    if (cells.some(c => c !== '')) rows.push(cells);
  });
  return rows;
}

const isHTML = (content: string) => /<\s*table|<\s*html|<\s*tr[\s>]/i.test(content.slice(0, 4000));

// ── PLATFORM TANIMA ────────────────────────────────────────────────────────
// Yalnızca etiket içindir: dosyanın hangi programdan geldiğini kullanıcıya
// söyler. Sütunları okuma işi tanımadan bağımsız çalışır, bu yüzden tanınmayan
// bir dosya da elle eşleştirilerek aktarılabilir.
export const SUPPORTED_PLATFORMS = ['MT5', 'MT4', 'cTrader', 'TradeLocker', 'DXtrade', 'Match-Trader'] as const;

function detectPlatform(headers: string[]): string {
  const h = headers.map(x => x.trim().toLowerCase());
  const has = (...names: string[]) => names.some(n => h.includes(n));

  // MetaTrader: S/L ve T/P sütunlarının birlikte bulunması en güvenilir işaret;
  // dilden de MT4/MT5 farkından da bağımsız.
  const mt = (has('s / l', 's/l') && has('t / p', 't/p'))
    || (has('ticket') && has('open time', 'open_time', 'açılış zamanı'))
    || (has('sembol') && has('hacim'))
    || (has('zaman') && has('sembol'));
  if (mt) {
    // MT5 pozisyon raporunda "Pozisyon" numarası vardır, MT4'te "Ticket".
    if (has('position', 'pozisyon')) return 'MT5';
    if (has('ticket', 'bilet')) return 'MT4';
    return 'MT4/MT5';
  }

  if (has('opening direction') || (has('opening time') && has('closing time') && has('entry price'))) return 'cTrader';
  if (has('position id', 'positionid') && has('net profit', 'netprofit')) return 'TradeLocker';
  if (has('dxtrade') || (has('instrument') && has('gross p/l', 'gross pl') && has('net p/l', 'net pl'))) return 'DXtrade';
  if (has('open time') && has('close time') && has('swap') && has('net profit')) return 'Match-Trader';

  return 'Unknown';
}

// ── HELPERS ────────────────────────────────────────────────────────────────
function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  const mt5 = dateStr.match(/(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})/);
  if (mt5) return new Date(`${mt5[1]}-${mt5[2]}-${mt5[3]}T${mt5[4]}:${mt5[5]}:00`).toISOString();
  const cleaned = dateStr.trim().replace(/\./g, '-');
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d.toISOString();
  return new Date().toISOString();
}

/** Kayan nokta artıklarını temizler: 30.000000000001 -> 30 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseNumber(val: string): number {
  if (!val) return 0;
  // "- 127,74" → -127.74 ve "26 973,16" → 26973.16
  const cleaned = val
    .replace(/"/g, '')
    .trim()
    .replace(/\s/g, '')   // boşlukları kaldır
    .replace(',', '.');   // ondalık virgülü noktaya çevir
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function calcRR(openPrice: number, sl: number, tp: number, type: 'Buy' | 'Sell'): string {
  if (!sl || !tp || sl === 0 || tp === 0) return '';
  const risk = type === 'Buy' ? Math.abs(openPrice - sl) : Math.abs(sl - openPrice);
  const reward = type === 'Buy' ? Math.abs(tp - openPrice) : Math.abs(openPrice - tp);
  if (risk === 0) return '';
  return (reward / risk).toFixed(2);
}

function getResult(profit: number): 'Başarılı' | 'Başarısız' | 'Başa Baş' {
  if (profit === 0) return 'Başa Baş';
  return profit > 0 ? 'Başarılı' : 'Başarısız';
}

/** Bir satırın işlem satırı sayılması için yön sütununda bulunabilecek değerler. */
const SIDE_WORDS = [
  'buy', 'sell', 'b', 's', 'long', 'short',
  'al', 'sat', 'alış', 'satış', 'alis', 'satis', 'uzun', 'kısa',
];

function getType(side: string): 'Buy' | 'Sell' {
  const s = side.trim().toLowerCase();
  if (['buy', 'b', 'long', 'al', 'alış', 'alis', 'uzun'].includes(s)) return 'Buy';
  return 'Sell';
}

function makeId(): string {
  return `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function cleanSymbol(symbol: string): string {
  return symbol
    .toUpperCase()
    .replace('FX:', '').replace('NASDAQ:', '').replace('NYSE:', '')
    .replace('CME_MINI:', '').replace('.X', '').replace('.R', '')
    .trim();
}

// ── MT4/MT5 PARSER ────────────────────────────────────────────────────────
// MT4 ve MT5 raporlarının sütun sırası aynı değil (MT4'te 4. sütun Size, MT5'te
// Type), üstelik başlıklar dile göre değişiyor. Sabit indeks yerine başlıktan
// eşliyoruz. MT5'te "Zaman"/"Fiyat" iki kez geçer: ilki açılış, ikincisi kapanış.
/**
 * Bir dosyanın hangi sütununun ne olduğu. Otomatik tahmin de, kullanıcının
 * elle yaptığı eşleştirme de aynı yapıyı üretir; işlemleri kuran kod ikisini
 * ayırt etmez. -1 "bu sütun yok" demektir.
 */
export interface ColumnMap {
  openTime: number; closeTime: number; symbol: number; type: number;
  openPrice: number; closePrice: number; sl: number; tp: number; profit: number;
  commission: number; swap: number; fee: number;
  /** Platformun işlem numarası — aynı raporu tekrar yüklemeyi güvenli kılar. */
  ticket: number;
}

export const EMPTY_MAP: ColumnMap = {
  openTime: -1, closeTime: -1, symbol: -1, type: -1, openPrice: -1,
  closePrice: -1, sl: -1, tp: -1, profit: -1, commission: -1, swap: -1, fee: -1,
  ticket: -1,
};

/** İşlem kurabilmek için en az bunlar gerekli. */
export const REQUIRED_FIELDS: (keyof ColumnMap)[] = ['openTime', 'symbol', 'type', 'profit'];

/**
 * Sütun başlıklarından ne olduklarını tahmin eder.
 *
 * Platform başına ayrı ayrıştırıcı yazmak yerine başlık isimlerinin ortak
 * sözlüğünü tutuyoruz: broker'lar aynı şeye "Symbol", "Instrument", "Sembol"
 * diyor ama isim havuzu dar. Tanımadığımız bir program bile çoğu zaman buraya
 * düşer; düşmezse kullanıcı elle eşleştirir.
 */
const FIELD_NAMES: Record<keyof ColumnMap, string[]> = {
  openTime: ['open time', 'opening time', 'open date', 'entry time', 'time', 'date', 'date/time', 'open_time',
             'açılış zamanı', 'zaman', 'tarih', 'giriş zamanı', 'açılış saati'],
  closeTime: ['close time', 'closing time', 'close date', 'exit time', 'close_time',
              'kapanış zamanı', 'çıkış zamanı', 'kapanış saati'],
  symbol: ['symbol', 'instrument', 'item', 'contract', 'market', 'pair', 'ticker',
           'sembol', 'enstrüman', 'parite'],
  type: ['type', 'side', 'direction', 'action', 'b/s', 'buy/sell', 'opening direction', 'position type',
         'tür', 'tur', 'yön', 'işlem türü', 'alış/satış'],
  openPrice: ['open price', 'opening price', 'entry price', 'price', 'fill price', 'avg entry price',
              'açılış fiyatı', 'giriş fiyatı', 'fiyat'],
  closePrice: ['close price', 'closing price', 'exit price', 'avg exit price',
               'kapanış fiyatı', 'çıkış fiyatı'],
  sl: ['s / l', 's/l', 'sl', 'stop loss', 'stoploss', 'stop', 'zarar durdur'],
  tp: ['t / p', 't/p', 'tp', 'take profit', 'takeprofit', 'kar al', 'hedef'],
  profit: ['profit', 'net profit', 'net p/l', 'net pl', 'gross p/l', 'gross pl', 'p/l', 'pnl', 'p&l',
           'realized pnl', 'realized p&l', 'result', 'gain',
           'kar', 'kâr', 'net kar', 'kar/zarar', 'kazanç'],
  commission: ['commission', 'commissions', 'ibcommission', 'komisyon'],
  swap: ['swap', 'swaps', 'rollover', 'takas'],
  fee: ['taxes', 'tax', 'fee', 'fees', 'ücret', 'vergi', 'masraf'],
  ticket: ['ticket', 'position', 'position id', 'positionid', 'order id', 'orderid',
           'deal id', 'trade id', 'transaction id', 'pozisyon', 'bilet', 'emir no', 'işlem no'],
};

export function guessColumns(headers: string[]): ColumnMap {
  const h = headers.map(x => x.trim().toLowerCase().replace(/\s+/g, ' '));
  const used = new Set<number>();

  // Aynı başlık birden fazla geçebilir (MT5'te "Zaman" ve "Fiyat" iki kez):
  // ilki açılış, ikincisi kapanıştır.
  const occurrences = (names: string[]) =>
    h.map((v, i) => (names.includes(v) ? i : -1)).filter(i => i >= 0);

  const pick = (field: keyof ColumnMap, second = false): number => {
    const hits = occurrences(FIELD_NAMES[field]);
    const idx = second ? (hits[1] ?? -1) : (hits.find(i => !used.has(i)) ?? -1);
    if (idx >= 0) used.add(idx);
    return idx;
  };

  const map = { ...EMPTY_MAP };
  // Sırası önemli: dar isimler ("close time") geniş olanlardan ("time") önce.
  map.closeTime = pick('closeTime');
  map.openTime = pick('openTime');
  map.symbol = pick('symbol');
  map.type = pick('type');
  map.sl = pick('sl');
  map.tp = pick('tp');
  map.closePrice = pick('closePrice');
  map.openPrice = pick('openPrice');
  map.commission = pick('commission');
  map.swap = pick('swap');
  map.fee = pick('fee');
  map.profit = pick('profit');
  map.ticket = pick('ticket');

  // MT tarzı raporda tek isimli tekrarlar: ikinci "Zaman"/"Fiyat" kapanıştır.
  if (map.closeTime < 0) {
    const t = occurrences(FIELD_NAMES.openTime);
    if (t.length > 1) map.closeTime = t[1];
  }
  if (map.closePrice < 0) {
    const pr = occurrences(FIELD_NAMES.openPrice);
    if (pr.length > 1) map.closePrice = pr[1];
  }
  return map;
}

export const mapIsUsable = (m: ColumnMap) => REQUIRED_FIELDS.every(f => m[f] >= 0);

/**
 * İşlem stopta mı kapandı, elle mi?
 *
 * Kâr/zararın işareti tek başına yetmez: stop olan işlem bir R kaybeder, elle
 * kapatılan ise ne kadar götürdüyse onu. Kapanış fiyatını stop ve hedef
 * seviyelerine bakarak ayırıyoruz — alışta stopun altında, satışta üstünde
 * kapandıysa stop yemiştir.
 */
function mtResult(net: number, type: 'Buy' | 'Sell', close: number, sl: number, tp: number): TradeResult {
  if (net === 0) return 'Başa Baş';
  const buy = type === 'Buy';
  // Sonucun işareti her zaman net tutardan gelir; seviyeler yalnızca bunun
  // stopta mı yoksa elle mi olduğunu söyler.
  if (net < 0) {
    if (close > 0 && sl > 0 && (buy ? close <= sl : close >= sl)) return 'Başarısız';
    return (sl > 0 || tp > 0) && close > 0 ? 'Manuel Zararda' : 'Başarısız';
  }
  if (close > 0 && tp > 0 && (buy ? close >= tp : close <= tp)) return 'Başarılı';
  return (sl > 0 || tp > 0) && close > 0 ? 'Manuel Karda' : 'Başarılı';
}

/**
 * Satırları işlemlere çevirir. Sütunların nereden geldiği önemli değil:
 * otomatik tahmin de elle eşleştirme de aynı ColumnMap'i verir.
 */
function parseRows(rows: string[][], c: ColumnMap, journalId: string, userId: string, source: string): Trade[] {
  const trades: Trade[] = [];

  for (const cols of rows) {
    const typeRaw = (cols[c.type] || '').trim().toLowerCase();
    // Yalnızca alış/satış satırları işlemdir; balance, credit, deposit gibi
    // hesap hareketleri ve toplam satırları buradan elenir.
    if (!SIDE_WORDS.includes(typeRaw)) continue;

    const symbol = cleanSymbol(cols[c.symbol] || '').toUpperCase();
    if (!symbol) continue;

    const type = getType(typeRaw);
    const openDate = parseDate(cols[c.openTime] || '');
    const closeRaw = c.closeTime >= 0 ? (cols[c.closeTime] || '') : '';
    const openPrice = parseNumber(cols[c.openPrice] || '0');
    const closePrice = c.closePrice >= 0 ? parseNumber(cols[c.closePrice] || '0') : 0;
    const sl = c.sl >= 0 ? parseNumber(cols[c.sl] || '0') : 0;
    const tp = c.tp >= 0 ? parseNumber(cols[c.tp] || '0') : 0;
    // Rapordaki "Kar" brüttür: komisyon, swap ve ücretler ayrı sütunlardadır ve
    // hesap bakiyesine ayrıca yansır. Kullanıcının cebine giren net tutar
    // üçünün toplamıdır.
    const gross = parseNumber(cols[c.profit] || '0');
    const cost =
      (c.commission >= 0 ? parseNumber(cols[c.commission] || '0') : 0) +
      (c.swap >= 0 ? parseNumber(cols[c.swap] || '0') : 0) +
      (c.fee >= 0 ? parseNumber(cols[c.fee] || '0') : 0);
    const profit = round2(gross + cost);

    // Rapor kaç para riske atıldığını yazmaz, ama stop seviyesini yazar.
    // Kâr fiyat mesafesiyle doğru orantılı olduğu için stop mesafesini
    // gerçekleşen mesafeye oranlayınca risk tutarı birebir çıkar.
    const moved = Math.abs(openPrice - closePrice);
    const toStop = Math.abs(openPrice - sl);
    const riskFromStop = (sl > 0 && openPrice > 0 && closePrice > 0 && moved > 0 && gross !== 0)
      ? round2((toStop / moved) * Math.abs(gross))
      : 0;

    // Kapanış zamanı yalnızca gerçek bir tarihse alınır.
    let exitDate: string | undefined;
    if (closeRaw && /\d{4}[.\-/]\d{2}[.\-/]\d{2}/.test(closeRaw)) {
      const parsed = parseDate(closeRaw);
      if (new Date(parsed).getTime() >= new Date(openDate).getTime()) exitDate = parsed;
    }

    trades.push({
      id: makeId(),
      accountId: journalId,
      journal_id: journalId,
      user_id: userId,
      date: openDate,
      exitDate,
      symbol,
      type,
      timeframe: '',
      setup: '',
      // Gerçekleşen tutar işaretli tutulur. Risk stop mesafesinden hesaplanır;
      // stop yoksa kayıplarda kaybedilen tutarı riske eşitliyoruz.
      risk: riskFromStop > 0 ? riskFromStop : (profit < 0 ? Math.abs(profit) : 0),
      reward: profit,
      rr: calcRR(openPrice, sl, tp, type),
      result: mtResult(profit, type, closePrice, sl, tp),
      preTradeNotes: '',
      postTradeNotes: '',
      preTradePhotos: [],
      postTradePhotos: [],
      importSource: source,
      externalId: c.ticket >= 0 ? (cols[c.ticket] || '').trim() || undefined : undefined,
    } as Trade);
  }

  return trades;
}

// ── MAIN PARSER ────────────────────────────────────────────────────────────
/** Sonraki bölüm başlığı: buradan sonrası artık kapanmış işlem değildir. */
const SECTION_BREAKS = [
  // MT5
  'emirler', 'orders', 'deals', 'işlemler',
  // MT4 raporu kapanmış işlemlerden sonra bunları listeler
  'açık işlemler', 'open trades', 'bekleyen emirler', 'working orders',
  'closed transactions', 'kapalı işlemler', 'summary', 'özet',
];

function findRows(content: string): { rows: string[][]; error?: string } {
  if (isHTML(content)) {
    const rows = parseHTMLTables(content);
    if (rows.length < 2) return { rows: [], error: msg('HTML raporunda tablo bulunamadı.', 'No table found in the HTML report.') };
    return { rows };
  }
  const raw = content.split('\n').filter(l => l.trim() !== '');
  if (raw.length < 2) return { rows: [], error: msg('Dosya boş veya geçersiz.', 'The file is empty or unreadable.') };
  return { rows: raw.map(l => parseCSVLine(l)) };
}

/**
 * Başlık satırını bulur. Sabit bir isim listesi yerine "hangi satır işlem
 * tablosunun başlığına en çok benziyor" diye bakıyoruz: tahmin edilebilen
 * alan sayısı en yüksek olan satır kazanır. Böylece tanımadığımız
 * platformlarda da başlık doğru yerde bulunur.
 */
function findHeader(rows: string[][]): number {
  let best = -1, bestScore = -Infinity;
  for (let i = 0; i < Math.min(60, rows.length); i++) {
    const cells = rows[i];
    if (cells.length < 3) continue;                       // başlık en az üç sütundur
    const m = guessColumns(cells);
    const guessed = (Object.keys(m) as (keyof ColumnMap)[]).filter(k => m[k] >= 0).length;
    // Tanınan alan en güçlü işaret; hiçbiri tanınmasa bile bir tablonun
    // başlığı, altındaki satırlarla aynı sütun sayısına sahip olur.
    const matchesBelow = rows[i + 1] && rows[i + 1].length === cells.length ? 2 : 0;
    const score = guessed * 3 + matchesBelow + (mapIsUsable(m) ? 10 : 0) - i * 0.01;
    if (score > bestScore) { bestScore = score; best = i; }
  }
  return best >= 0 ? best : 0;
}

export function parseCSVFile(
  content: string,
  journalId: string,
  userId: string,
  overrideMap?: ColumnMap,
): ParseResult {
  const { rows: parsedLines, error } = findRows(content);
  if (error) return { trades: [], platform: 'Unknown', errors: [error], headers: [], rows: [], map: EMPTY_MAP };

  const headerIdx = findHeader(parsedLines);
  const headers = parsedLines[headerIdx];
  const platform = detectPlatform(headers);

  // Kapanmış işlemler tablosu bitince duruyoruz; sonrasında gelen açık
  // işlemler, bekleyen emirler ve özet satırları işlem değildir.
  let endIdx = parsedLines.length;
  for (let i = headerIdx + 1; i < parsedLines.length; i++) {
    const first = (parsedLines[i][0] || '').trim().toLowerCase();
    if (SECTION_BREAKS.includes(first)) { endIdx = i; break; }
  }

  const dataLines = parsedLines.slice(headerIdx + 1, endIdx).filter(cols => cols.length >= 3);
  const map = overrideMap || guessColumns(headers);

  const base = { platform, headers, rows: dataLines, map };

  if (dataLines.length === 0) {
    return { ...base, trades: [], errors: [msg('Dosyada işlem satırı bulunamadı.', 'No trade rows found in the file.')] };
  }
  if (!mapIsUsable(map)) {
    return { ...base, trades: [], errors: [], needsMapping: true };
  }

  let trades: Trade[] = [];
  const errors: string[] = [];
  try {
    trades = parseRows(dataLines, map, journalId, userId, platform === 'Unknown' ? 'Manuel' : platform);
  } catch (e) {
    errors.push(`${msg('Dosya okunurken hata', 'Error while reading the file')}: ${e}`);
  }

  trades = trades.filter(t => t.symbol && t.symbol.length > 0 && t.date);
  // Sütunlar eşleşiyor ama tek satır bile işleme dönüşmediyse eşleştirme
  // yanlıştır; kullanıcıya sormak, sessizce boş dönmekten iyidir.
  if (trades.length === 0 && errors.length === 0) {
    return { ...base, trades: [], errors: [], needsMapping: true };
  }
  return { ...base, trades, errors };
}

// ── UI ─────────────────────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  'MT5': '#818cf8',
  'MT4': '#818cf8',
  'MT4/MT5': '#818cf8',
  'cTrader': '#34d399',
  'TradeLocker': '#f59e0b',
  'DXtrade': '#60a5fa',
  'Match-Trader': '#a78bfa',
  'Manuel': '#94a3b8',
};

/** Eşleştirme ekranında gösterilecek alanlar ve etiketleri. */
const MAP_FIELDS: { key: keyof ColumnMap; tr: string; en: string; required?: boolean }[] = [
  { key: 'openTime',   tr: 'Giriş tarihi',     en: 'Entry date',     required: true },
  { key: 'symbol',     tr: 'Sembol',           en: 'Symbol',         required: true },
  { key: 'type',       tr: 'Yön (alış/satış)', en: 'Side (buy/sell)', required: true },
  { key: 'profit',     tr: 'Kâr / Zarar',      en: 'Profit / Loss',  required: true },
  { key: 'closeTime',  tr: 'Çıkış tarihi',     en: 'Exit date' },
  { key: 'openPrice',  tr: 'Giriş fiyatı',     en: 'Entry price' },
  { key: 'closePrice', tr: 'Çıkış fiyatı',     en: 'Exit price' },
  { key: 'sl',         tr: 'Stop (S/L)',       en: 'Stop loss' },
  { key: 'tp',         tr: 'Hedef (T/P)',      en: 'Take profit' },
  { key: 'commission', tr: 'Komisyon',         en: 'Commission' },
  { key: 'swap',       tr: 'Swap',             en: 'Swap' },
  { key: 'fee',        tr: 'Ücret / Vergi',    en: 'Fees / Taxes' },
  { key: 'ticket',     tr: 'İşlem no',         en: 'Trade / ticket no' },
];

/** Aynı dosya tekrar yüklenirse kullanıcının eşleştirmesi hatırlansın. */
const mapKey = (headers: string[]) => 'importMap:' + headers.join('|').toLowerCase().slice(0, 200);

function loadSavedMap(headers: string[]): ColumnMap | null {
  try {
    const raw = localStorage.getItem(mapKey(headers));
    return raw ? { ...EMPTY_MAP, ...JSON.parse(raw) } : null;
  } catch { return null; }
}

function saveMap(headers: string[], map: ColumnMap) {
  try { localStorage.setItem(mapKey(headers), JSON.stringify(map)); } catch { /* kotayı doldurduysa önemsiz */ }
}

export default function CSVImport({ onImport, onClose, journalId, journalName, userId, existingKeys = [] }: CSVImportProps) {
  // Açık journal yoksa tek seçenek yeni journal oluşturmaktır.
  const [target, setTarget] = useState<'existing' | 'new'>(journalId ? 'existing' : 'new');
  const [newName, setNewName] = useState('');
  const { language, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  /** Dosya içeriği elde tutulur: eşleştirme değişince yeniden ayrıştırılır. */
  const [content, setContent] = useState('');
  const [showMapping, setShowMapping] = useState(false);

  /**
   * MetaTrader raporları UTF-8 değildir: MT5 UTF-16 (BOM'lu), MT4 ise
   * Windows kod sayfası yazar. UTF-8 varsayılırsa dosya baştan sona bozuk
   * okunur ve hiçbir sütun tanınmaz.
   */
  const readFileText = async (file: File): Promise<string> => {
    const buf = await file.arrayBuffer();
    const b = new Uint8Array(buf);
    if (b[0] === 0xff && b[1] === 0xfe) return new TextDecoder('utf-16le').decode(buf);
    if (b[0] === 0xfe && b[1] === 0xff) return new TextDecoder('utf-16be').decode(buf);
    // BOM'suz UTF-16: ASCII karakterlerin arasında sıfır bayt kalır.
    if (b.length > 3 && b[1] === 0x00 && b[3] === 0x00) return new TextDecoder('utf-16le').decode(buf);
    const utf8 = new TextDecoder('utf-8').decode(buf);
    if (!utf8.includes('\ufffd')) return utf8;
    try { return new TextDecoder('windows-1254').decode(buf); } catch { return utf8; }
  };

  const processFile = (file: File) => {
    const name = file.name.toLowerCase();
    if (!['.csv', '.txt', '.html', '.htm'].some(ext => name.endsWith(ext))) {
      setParseResult({ trades: [], platform: 'Unknown', headers: [], rows: [], map: EMPTY_MAP,
        errors: [msg('Sadece .csv, .txt, .html veya .htm dosyaları desteklenir.', 'Only .csv, .txt, .html and .htm files are supported.')] });
      return;
    }
    setFileName(file.name);
    if (!newName) {
      const base = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
      setNewName(base.slice(0, 40) || (language === 'tr' ? 'İçe Aktarılan Journal' : 'Imported Journal'));
    }
    setLoading(true);
    readFileText(file)
      .then(text => {
        setContent(text);
        // Önce otomatik tahmin; bu dosya için daha önce elle eşleştirme
        // yapıldıysa o kullanılır.
        const first = parseCSVFile(text, journalId || '', userId);
        const saved = first.headers.length ? loadSavedMap(first.headers) : null;
        const result = saved
          ? parseCSVFile(text, journalId || '', userId, saved)
          : first;
        setParseResult(result);
        setShowMapping(!!result.needsMapping);
      })
      .catch(() => setParseResult({
        trades: [], platform: 'Unknown', headers: [], rows: [], map: EMPTY_MAP,
        errors: [language === 'tr' ? 'Dosya okunamadı.' : 'The file could not be read.'],
      }))
      .finally(() => setLoading(false));
  };

  /** Kullanıcı bir sütun seçtiğinde dosyayı o eşleştirmeyle yeniden okur. */
  const updateMap = (field: keyof ColumnMap, index: number) => {
    if (!parseResult) return;
    const next = { ...parseResult.map, [field]: index };
    const result = parseCSVFile(content, journalId || '', userId, next);
    // needsMapping yeniden okumada tekrar dolabilir; panel açık kalsın.
    setParseResult({ ...result, map: next });
    if (mapIsUsable(next)) saveMap(result.headers, next);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // Mevcut journal'a eklerken zaten kayıtlı olanları ayır: aynı raporu tekrar
  // yüklemek işlemleri ikinci kez eklememeli.
  const known = React.useMemo(() => new Set(existingKeys), [existingKeys]);
  const checkDuplicates = target === 'existing' && !!journalId && known.size > 0;
  const freshTrades = React.useMemo(
    () => !parseResult ? []
      : checkDuplicates ? parseResult.trades.filter(t => !known.has(tradeKey(t)))
      : parseResult.trades,
    [parseResult, checkDuplicates, known],
  );
  const skipped = (parseResult?.trades.length || 0) - freshTrades.length;

  const canImport =
    !!parseResult && freshTrades.length > 0 &&
    (target === 'existing' ? !!journalId : newName.trim().length > 0);

  const handleImport = () => {
    if (!canImport) return;
    onImport(
      freshTrades,
      target === 'existing' && journalId
        ? { kind: 'existing', journalId }
        : { kind: 'new', name: newName.trim() }
    );
    onClose();
  };

  const card: React.CSSProperties = {
    background: '#1a1b2e',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '16px',
    padding: '20px',
  };

  const supportedPlatforms = [...SUPPORTED_PLATFORMS];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-8 space-y-4">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-[22px] font-medium text-white">
              {language === 'tr' ? 'İşlem Geçmişi İçe Aktar' : 'Import Trade History'}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {language === 'tr' ? 'Trade geçmişinizi otomatik içe aktarın' :
               language === 'fa' ? 'تاریخچه معاملات خود را وارد کنید' :
               'Automatically import your trade history'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div style={card}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {language === 'tr' ? 'Desteklenen Platformlar' : 'Supported Platforms'}
          </p>
          <div className="flex flex-wrap gap-2">
            {supportedPlatforms.map(p => (
              <span key={p} className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${PLATFORM_COLORS[p]}20`, color: PLATFORM_COLORS[p], border: `1px solid ${PLATFORM_COLORS[p]}40` }}>
                {p}
              </span>
            ))}
          </div>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
          style={{
            border: `2px dashed ${dragging ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
            background: dragging ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.02)',
            padding: '48px 24px',
          }}
        >
          <input ref={fileInputRef} type="file" accept=".csv,.txt,.html,.htm" className="hidden" onChange={handleFileChange} />
          <Upload className="w-10 h-10 mb-4" style={{ color: dragging ? '#8b5cf6' : 'rgba(255,255,255,0.2)' }} />
          <p className="font-medium text-white mb-1">
            {language === 'tr' ? 'Rapor dosyasını sürükleyin veya tıklayın' :
             language === 'fa' ? 'فایل گزارش را بکشید یا کلیک کنید' :
             'Drag & drop your report, or click to browse'}
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {language === 'tr'
              ? 'CSV veya HTML · MetaTrader raporu doğrudan yüklenebilir · Platform otomatik tanınır'
              : 'CSV or HTML · MetaTrader reports work as-is · Platform auto-detected'}
          </p>
        </div>

        {loading && (
          <div style={card} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6' }} />
            <span className="text-sm text-white">
              {language === 'tr' ? 'Dosya analiz ediliyor...' : 'Analyzing file...'}
            </span>
          </div>
        )}

        {parseResult && !loading && (
          <div style={card} className="space-y-4">

            {parseResult.platform !== 'Unknown' && (
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {language === 'tr' ? 'Tanınan Platform:' : 'Detected Platform:'}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    background: `${PLATFORM_COLORS[parseResult.platform] || '#8b5cf6'}20`,
                    color: PLATFORM_COLORS[parseResult.platform] || '#8b5cf6',
                    border: `1px solid ${PLATFORM_COLORS[parseResult.platform] || '#8b5cf6'}40`,
                  }}>
                  {parseResult.platform}
                </span>
              </div>
            )}

            {/* Sütun eşleştirme — tanınmayan dosyalar burada kurtarılır. */}
            {(showMapping || parseResult.needsMapping) && parseResult.headers.length > 0 && (
              <div className="rounded-xl p-4 space-y-3"
                style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <Columns className="w-4 h-4" style={{ color: '#a78bfa' }} />
                    <span className="text-sm font-semibold text-white">
                      {language === 'tr' ? 'Sütunları Eşleştir' : 'Match the columns'}
                    </span>
                  </div>
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {language === 'tr'
                      ? 'Dosyandaki hangi sütunun ne olduğunu seç. Bir kere seçmen yeterli — aynı biçimdeki dosyalarda hatırlanır.'
                      : 'Tell us which column is which. You only do this once — the same file format is remembered.'}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5">
                  {MAP_FIELDS.map(f => (
                    <label key={f.key} className="block">
                      <span className="block text-[11px] mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {language === 'tr' ? f.tr : f.en}
                        {f.required && <span style={{ color: '#f87171' }}> *</span>}
                      </span>
                      <select
                        value={parseResult.map[f.key]}
                        onChange={e => updateMap(f.key, parseInt(e.target.value, 10))}
                        className="w-full outline-none text-sm"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${f.required && parseResult.map[f.key] < 0 ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
                          color: '#fff', borderRadius: '10px', padding: '7px 10px', cursor: 'pointer',
                        }}>
                        <option value={-1} style={{ background: '#1a1b2e' }}>—</option>
                        {parseResult.headers.map((h, i) => (
                          <option key={i} value={i} style={{ background: '#1a1b2e' }}>
                            {h.trim() || `${language === 'tr' ? 'Sütun' : 'Column'} ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>

                {/* Seçim doğru mu, ilk satırla göster. */}
                {parseResult.rows.length > 0 && (
                  <div className="rounded-lg p-3 text-[11px] leading-relaxed"
                    style={{ background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.5)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {language === 'tr' ? 'İlk satır: ' : 'First row: '}
                    </span>
                    {MAP_FIELDS.filter(f => parseResult.map[f.key] >= 0).map((f, i) => (
                      <span key={f.key}>
                        {i > 0 && ' · '}
                        <span style={{ color: 'rgba(255,255,255,0.35)' }}>{(language === 'tr' ? f.tr : f.en)}: </span>
                        <span className="font-mono" style={{ color: '#fff' }}>
                          {parseResult.rows[0][parseResult.map[f.key]] || '—'}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {parseResult.needsMapping && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4" style={{ color: '#fbbf24' }} />
                  <span className="text-sm font-semibold" style={{ color: '#fbbf24' }}>
                    {language === 'tr' ? 'Bu dosyayı otomatik tanıyamadım' : 'This file was not recognised automatically'}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {language === 'tr'
                    ? 'Yukarıdan sütunları kendin eşleştirirsen dosya yine de aktarılır.'
                    : 'Match the columns above and the file will import all the same.'}
                </p>
              </div>
            )}

            {parseResult.errors.length > 0 && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" style={{ color: '#f87171' }} />
                  <span className="text-sm font-semibold" style={{ color: '#f87171' }}>
                    {language === 'tr' ? 'Uyarılar' : 'Warnings'}
                  </span>
                </div>
                {parseResult.errors.map((err, i) => (
                  <p key={i} className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>• {err}</p>
                ))}
              </div>
            )}

            {parseResult.trades.length > 0 && (
              <div className="rounded-xl p-4" style={freshTrades.length > 0
                ? { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4" style={{ color: freshTrades.length > 0 ? '#34d399' : 'rgba(255,255,255,0.4)' }} />
                  <span className="text-sm font-semibold" style={{ color: freshTrades.length > 0 ? '#34d399' : 'rgba(255,255,255,0.6)' }}>
                    {freshTrades.length > 0
                      ? `${freshTrades.length} ${language === 'tr' ? 'yeni işlem' : freshTrades.length === 1 ? 'new trade' : 'new trades'}`
                      : (language === 'tr' ? 'Yeni işlem yok' : 'Nothing new to import')}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {skipped > 0
                    ? (language === 'tr'
                        ? `${skipped} işlem bu journal'da zaten var, atlanacak — notların ve fotoğrafların olduğu gibi kalır.`
                        : `${skipped} already in this journal and will be skipped — your notes and photos stay as they are.`)
                    : (language === 'tr' ? "Journal'ınıza eklenecek:" : 'Will be added to your journal:')}
                </p>
              </div>
            )}

            {parseResult.trades.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider grid grid-cols-4 gap-2"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }}>
                  <span>{language === 'tr' ? 'Tarih' : 'Date'}</span>
                  <span>Symbol</span>
                  <span>Type</span>
                  <span>Sonuç</span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {(freshTrades.length > 0 ? freshTrades : parseResult.trades).slice(0, 50).map((trade, i) => (
                    <div key={i} className="px-4 py-2 grid grid-cols-4 gap-2 text-sm"
                      style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {new Date(trade.date).toLocaleDateString('tr-TR')}
                      </span>
                      <span className="font-mono font-medium text-white">{trade.symbol}</span>
                      <span style={{ color: trade.type === 'Buy' ? '#34d399' : '#f87171' }}>{trade.type}</span>
                      <span style={{ color: trade.result === 'Başarılı' ? '#34d399' : trade.result === 'Başa Baş' ? 'rgba(255,255,255,0.45)' : '#f87171' }}>
                        {trade.result === 'Başarılı' ? t('winStatus')
                          : trade.result === 'Başa Baş' ? t('resultBreakeven')
                          : t('lossStatus')}
                      </span>
                    </div>
                  ))}
                  {(freshTrades.length > 0 ? freshTrades : parseResult.trades).length > 50 && (
                    <div className="px-4 py-2 text-sm text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      +{(freshTrades.length > 0 ? freshTrades : parseResult.trades).length - 50} {language === 'tr' ? 'daha...' : 'more...'}
                    </div>
                  )}
                </div>

                {/* Hedef: yeni journal mı, açık journal mı */}
                <div className="mt-6">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-3"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {t('importTarget')}
                  </div>

                  <div className="space-y-2">
                    <button type="button" onClick={() => setTarget('new')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-start transition-all"
                      style={target === 'new'
                        ? { background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{ border: `2px solid ${target === 'new' ? '#8b5cf6' : 'rgba(255,255,255,0.25)'}` }}>
                        {target === 'new' && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#8b5cf6' }} />}
                      </span>
                      <span className="text-sm" style={{ color: target === 'new' ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                        {t('importToNew')}
                      </span>
                    </button>

                    {target === 'new' && (
                      <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                        placeholder={t('journalNamePlaceholder')}
                        className="w-full outline-none text-sm"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff', borderRadius: '12px', padding: '10px 14px', marginInlineStart: 0 }} />
                    )}

                    {journalId && (
                      <button type="button" onClick={() => setTarget('existing')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-start transition-all"
                        style={target === 'existing'
                          ? { background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)' }
                          : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                          style={{ border: `2px solid ${target === 'existing' ? '#8b5cf6' : 'rgba(255,255,255,0.25)'}` }}>
                          {target === 'existing' && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#8b5cf6' }} />}
                        </span>
                        <span className="text-sm" style={{ color: target === 'existing' ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                          {t('importToExisting')}
                          {journalName && <span style={{ color: 'rgba(255,255,255,0.4)' }}> — {journalName}</span>}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end items-center gap-3 pt-2">
              {parseResult.headers.length > 0 && !showMapping && !parseResult.needsMapping && (
                <button onClick={() => setShowMapping(true)}
                  className="me-auto flex items-center gap-1.5 text-sm"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Columns className="w-3.5 h-3.5" />
                  {language === 'tr' ? 'Sütunları kendim eşleştir' : 'Match columns myself'}
                </button>
              )}
              <button onClick={() => { setParseResult(null); setFileName(''); setContent(''); setShowMapping(false); }}
                className="px-4 py-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {language === 'tr' ? 'Temizle' : 'Clear'}
              </button>
              <button
                onClick={handleImport}
                disabled={!canImport}
                className="px-6 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#8b5cf6', color: '#fff' }}
                onMouseEnter={e => { if (canImport) (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}
              >
                {/* Sayı gerçekten eklenecek olanı gösterir; dosyadaki toplamı değil. */}
                {freshTrades.length > 0
                  ? `${freshTrades.length} ${language === 'tr' ? 'İşlem İçe Aktar' : freshTrades.length === 1 ? 'Trade — Import' : 'Trades — Import'}`
                  : parseResult.trades.length > 0
                  ? (language === 'tr' ? 'Hepsi Zaten Ekli' : 'Already Imported')
                  : (language === 'tr' ? 'İşlem Bulunamadı' : 'No Trades Found')}
              </button>
            </div>
          </div>
        )}

        {fileName && !loading && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <FileText className="w-4 h-4" />
            <span>{fileName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

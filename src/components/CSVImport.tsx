import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { Trade, TradeResult } from '../types';
import { useLanguage } from '../context/LanguageContext';

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
}

interface ParseResult {
  trades: Trade[];
  platform: string;
  errors: string[];
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

// ── PLATFORM DETECTION ─────────────────────────────────────────────────────
function detectPlatform(headers: string[]): string {
  const h = headers.map(x => x.trim().toLowerCase());

  // MetaTrader 4/5 — English
  if (h.includes('ticket') && (h.includes('open time') || h.includes('open_time'))) return 'MT4/MT5';

  // S/L ve T/P sütunları yalnızca MetaTrader raporlarında birlikte bulunur;
  // bu, dilden ve MT4/MT5 farkından bağımsız en güvenilir işaret.
  const hasSL = h.includes('s / l') || h.includes('s/l');
  const hasTP = h.includes('t / p') || h.includes('t/p');
  if (hasSL && hasTP) return 'MT4/MT5';
  if (h.includes('position') && h.includes('symbol') && h.includes('volume')) return 'MT4/MT5';

  // MetaTrader 4/5 — Turkish
  if (h.includes('sembol') && h.includes('hacim')) return 'MT4/MT5';
  if (h.includes('sembol') && h.includes('kar')) return 'MT4/MT5';
  if (h.includes('zaman') && h.includes('sembol')) return 'MT4/MT5';

  // cTrader
  if (h.includes('opening direction') || (h.includes('opening time') && h.includes('closing time') && h.includes('entry price'))) return 'cTrader';

  // TradeLocker
  if ((h.includes('position id') || h.includes('positionid')) && (h.includes('net profit') || h.includes('netprofit'))) return 'TradeLocker';

  // Tradovate
  if ((h.includes('orderid') || h.includes('order id')) && (h.includes('b/s') || h.includes('contract') || h.includes('fill time'))) return 'Tradovate';

  // NinjaTrader
  if (h.includes('instrument') && h.includes('action') && h.includes('e/x')) return 'NinjaTrader';

  // TradingView
  if (h.includes('fill price') && (h.includes('closing time') || h.includes('side'))) return 'TradingView';

  // IBKR
  if (h.includes('ibcommission') || h.includes('fifopnlrealized') || (h.includes('tradeprice') && h.includes('buy/sell'))) return 'IBKR';

  // Binance
  if (h.includes('base-asset') || h.includes('fee-currency') || h.includes('base asset') || h.includes('fee currency')) return 'Binance';

  // Bybit
  if (h.includes('realized pnl') || h.includes('realized p&l') || (h.includes('entry price') && h.includes('exit price'))) return 'Bybit';

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

function getType(side: string): 'Buy' | 'Sell' {
  const s = side.trim().toLowerCase();
  if (s === 'buy' || s === 'b' || s === 'long' || s === 'al' || s === 'alış') return 'Buy';
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
interface MTCols {
  openTime: number; closeTime: number; symbol: number; type: number;
  openPrice: number; closePrice: number; sl: number; tp: number; profit: number;
}

function mapMTColumns(headers: string[]): MTCols | null {
  const h = headers.map(x => x.trim().toLowerCase().replace(/\s+/g, ' '));
  const findAll = (...names: string[]) =>
    h.map((v, i) => (names.includes(v) ? i : -1)).filter(i => i >= 0);
  const first = (...names: string[]) => (findAll(...names)[0] ?? -1);

  const times = findAll('open time', 'close time', 'time', 'zaman', 'açılış zamanı', 'kapanış zamanı');
  const prices = findAll('price', 'fiyat');

  const openTime = first('open time', 'açılış zamanı') >= 0 ? first('open time', 'açılış zamanı') : (times[0] ?? -1);
  const closeTime = first('close time', 'kapanış zamanı') >= 0 ? first('close time', 'kapanış zamanı') : (times[1] ?? -1);
  const openPrice = prices[0] ?? -1;

  const cols: MTCols = {
    openTime,
    closeTime,
    symbol: first('item', 'symbol', 'sembol', 'enstrüman'),
    type: first('type', 'tür', 'tur', 'işlem türü'),
    openPrice,
    closePrice: prices[1] ?? -1,
    sl: first('s/l', 's / l', 'sl', 'stop loss'),
    tp: first('t/p', 't / p', 'tp', 'take profit'),
    profit: first('profit', 'kar', 'kâr', 'net kar', 'kar/zarar'),
  };
  if (cols.symbol < 0 || cols.type < 0 || cols.profit < 0) return null;
  return cols;
}

/**
 * İşlem stopta mı kapandı, elle mi?
 *
 * Kâr/zararın işareti tek başına yetmez: stop olan işlem bir R kaybeder, elle
 * kapatılan ise ne kadar götürdüyse onu. Kapanış fiyatını stop ve hedef
 * seviyelerine bakarak ayırıyoruz — alışta stopun altında, satışta üstünde
 * kapandıysa stop yemiştir.
 */
function mtResult(profit: number, type: 'Buy' | 'Sell', close: number, sl: number, tp: number): TradeResult {
  if (profit === 0) return 'Başa Baş';
  const buy = type === 'Buy';
  if (close > 0) {
    if (sl > 0 && (buy ? close <= sl : close >= sl)) return 'Başarısız';
    if (tp > 0 && (buy ? close >= tp : close <= tp)) return 'Başarılı';
    // Seviyelerin hiçbirine değmeden kapanmış: elle kapatılmış.
    if (sl > 0 || tp > 0) return profit > 0 ? 'Manuel Karda' : 'Manuel Zararda';
  }
  return profit > 0 ? 'Başarılı' : 'Başarısız';
}

function parseMT(rows: string[][], headers: string[], journalId: string, userId: string): Trade[] {
  const c = mapMTColumns(headers);
  if (!c) return [];
  const trades: Trade[] = [];

  for (const cols of rows) {
    const typeRaw = (cols[c.type] || '').trim().toLowerCase();
    // balance / credit gibi hesap hareketlerini atla
    if (typeRaw !== 'buy' && typeRaw !== 'sell' && typeRaw !== 'al' && typeRaw !== 'sat') continue;

    const symbol = cleanSymbol(cols[c.symbol] || '').toUpperCase();
    if (!symbol) continue;

    const type = getType(typeRaw);
    const openDate = parseDate(cols[c.openTime] || '');
    const closeRaw = c.closeTime >= 0 ? (cols[c.closeTime] || '') : '';
    const openPrice = parseNumber(cols[c.openPrice] || '0');
    const closePrice = c.closePrice >= 0 ? parseNumber(cols[c.closePrice] || '0') : 0;
    const sl = c.sl >= 0 ? parseNumber(cols[c.sl] || '0') : 0;
    const tp = c.tp >= 0 ? parseNumber(cols[c.tp] || '0') : 0;
    const profit = parseNumber(cols[c.profit] || '0');

    // Rapor kaç para riske atıldığını yazmaz, ama stop seviyesini yazar.
    // Kâr fiyat mesafesiyle doğru orantılı olduğu için stop mesafesini
    // gerçekleşen mesafeye oranlayınca risk tutarı birebir çıkar.
    const moved = Math.abs(openPrice - closePrice);
    const toStop = Math.abs(openPrice - sl);
    const riskFromStop = (sl > 0 && openPrice > 0 && closePrice > 0 && moved > 0 && profit !== 0)
      ? round2((toStop / moved) * Math.abs(profit))
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
      importSource: 'MT4/MT5',
    } as Trade);
  }

  return trades;
}

// ── DİĞER PARSER'LAR (dict bazlı) ─────────────────────────────────────────
function parseCTrader(rows: Record<string, string>[], journalId: string, userId: string): Trade[] {
  return rows
    .filter(row => row['Opening Direction'] || row['opening direction'])
    .map(row => {
      const profit = parseNumber(row['Profit'] || row['profit'] || row['Net Profit'] || row['net profit'] || '0');
      const type = getType(row['Opening Direction'] || row['opening direction'] || 'buy');
      return {
        id: makeId(),
        accountId: journalId,
        journal_id: journalId,
        user_id: userId,
        date: parseDate(row['Opening Time'] || row['opening time'] || ''),
        symbol: cleanSymbol(row['Symbol'] || row['symbol'] || ''),
        type,
        timeframe: '',
        setup: '',
        risk: profit < 0 ? Math.abs(profit) : 0,
        reward: profit,
        rr: '',
        result: getResult(profit),
        preTradeNotes: '',
        postTradeNotes: '',
        preTradePhotos: [],
        postTradePhotos: [],
        importSource: 'cTrader',
      } as Trade;
    });
}

function parseTradeLocker(rows: Record<string, string>[], journalId: string, userId: string): Trade[] {
  return rows.map(row => {
    const profit = parseNumber(row['Net Profit'] || row['net profit'] || row['NetProfit'] || row['netprofit'] || '0');
    const entryPrice = parseNumber(row['Entry Price'] || row['entry price'] || row['EntryPrice'] || '0');
    const sl = parseNumber(row['SL'] || row['sl'] || row['Stop Loss'] || '0');
    const tp = parseNumber(row['TP'] || row['tp'] || row['Take Profit'] || '0');
    const type = getType(row['Side'] || row['side'] || row['Direction'] || row['direction'] || 'buy');
    const rr = calcRR(entryPrice, sl, tp, type);
    return {
      id: makeId(),
      accountId: journalId,
      journal_id: journalId,
      user_id: userId,
      date: parseDate(row['Open Time'] || row['open time'] || row['OpenTime'] || row['opentime'] || ''),
      symbol: cleanSymbol(row['Symbol'] || row['symbol'] || row['Instrument'] || ''),
      type,
      timeframe: '',
      setup: '',
      risk: profit < 0 ? Math.abs(profit) : 0,
      reward: profit,
      rr,
      result: getResult(profit),
      preTradeNotes: '',
      postTradeNotes: '',
      preTradePhotos: [],
      postTradePhotos: [],
      importSource: 'TradeLocker',
    } as Trade;
  });
}

function parseTradovate(rows: Record<string, string>[], journalId: string, userId: string): Trade[] {
  const trades: Trade[] = [];
  const entries: Record<string, string>[] = [];
  const exits: Record<string, string>[] = [];
  rows.forEach(row => {
    const bs = (row['B/S'] || row['b/s'] || row['Side'] || '').trim().toUpperCase();
    if (bs === 'B' || bs === 'BUY') entries.push(row);
    else if (bs === 'S' || bs === 'SELL') exits.push(row);
  });
  const used = new Set<number>();
  entries.forEach(entry => {
    const contract = entry['Contract'] || entry['Product'] || entry['Symbol'] || '';
    const exitIdx = exits.findIndex((ex, i) => {
      if (used.has(i)) return false;
      return (ex['Contract'] || ex['Product'] || ex['Symbol'] || '') === contract;
    });
    if (exitIdx >= 0) {
      used.add(exitIdx);
      const ex = exits[exitIdx];
      const entryPrice = parseNumber(entry['Avg Fill Price'] || entry['avgPrice'] || entry['Price'] || '0');
      const exitPrice = parseNumber(ex['Avg Fill Price'] || ex['avgPrice'] || ex['Price'] || '0');
      const qty = parseNumber(entry['Filled Qty'] || entry['filledQty'] || entry['Quantity'] || '1');
      const profit = round2((exitPrice - entryPrice) * qty);
      trades.push({
        id: makeId(),
        accountId: journalId,
        journal_id: journalId,
        user_id: userId,
        date: parseDate(entry['Fill Time'] || entry['Timestamp'] || entry['Date'] || ''),
        symbol: cleanSymbol(contract),
        type: 'Buy',
        timeframe: '',
        setup: '',
        risk: profit < 0 ? Math.abs(profit) : 0,
        reward: profit,
        rr: '',
        result: getResult(profit),
        preTradeNotes: '',
        postTradeNotes: '',
        preTradePhotos: [],
        postTradePhotos: [],
        importSource: 'Tradovate',
      } as Trade);
    }
  });
  return trades;
}

function parseNinjaTrader(rows: Record<string, string>[], journalId: string, userId: string): Trade[] {
  const trades: Trade[] = [];
  const entries: Record<string, string>[] = [];
  const exits: Record<string, string>[] = [];
  rows.forEach(row => {
    const ex = (row['E/X'] || row['e/x'] || '').trim().toUpperCase();
    if (ex === 'E' || ex === 'ENTRY') entries.push(row);
    else if (ex === 'X' || ex === 'EXIT') exits.push(row);
  });
  const used = new Set<number>();
  entries.forEach(entry => {
    const instrument = entry['Instrument'] || entry['instrument'] || entry['Symbol'] || '';
    const exitIdx = exits.findIndex((ex, i) => {
      if (used.has(i)) return false;
      return (ex['Instrument'] || ex['instrument'] || ex['Symbol'] || '') === instrument;
    });
    if (exitIdx >= 0) {
      used.add(exitIdx);
      const ex = exits[exitIdx];
      const entryPrice = parseNumber(entry['Price'] || entry['price'] || '0');
      const exitPrice = parseNumber(ex['Price'] || ex['price'] || '0');
      const qty = parseNumber(entry['Quantity'] || entry['quantity'] || '1');
      const action = (entry['Action'] || entry['action'] || 'Buy').trim();
      const type = getType(action);
      const profit = type === 'Buy'
        ? (exitPrice - entryPrice) * qty
        : (entryPrice - exitPrice) * qty;
      trades.push({
        id: makeId(),
        accountId: journalId,
        journal_id: journalId,
        user_id: userId,
        date: parseDate(entry['Time'] || entry['time'] || ''),
        symbol: cleanSymbol(instrument),
        type,
        timeframe: '',
        setup: '',
        risk: profit < 0 ? Math.abs(profit) : 0,
        reward: profit,
        rr: '',
        result: getResult(profit),
        preTradeNotes: '',
        postTradeNotes: '',
        preTradePhotos: [],
        postTradePhotos: [],
        importSource: 'NinjaTrader',
      } as Trade);
    }
  });
  return trades;
}

function parseTradingView(rows: Record<string, string>[], journalId: string, userId: string): Trade[] {
  const entries: Record<string, string>[] = [];
  const exits: Record<string, string>[] = [];
  rows.forEach(row => {
    const side = (row['Side'] || row['side'] || row['Type'] || '').trim().toUpperCase();
    if (side === 'BUY' || side === 'B') entries.push(row);
    else exits.push(row);
  });
  const trades: Trade[] = [];
  const used = new Set<number>();
  entries.forEach(entry => {
    const sym = entry['Symbol'] || entry['symbol'] || '';
    const exitIdx = exits.findIndex((ex, i) => {
      if (used.has(i)) return false;
      return (ex['Symbol'] || ex['symbol'] || '') === sym;
    });
    if (exitIdx >= 0) {
      used.add(exitIdx);
      const ex = exits[exitIdx];
      const entryPrice = parseNumber(entry['Fill Price'] || entry['fill price'] || entry['Price'] || '0');
      const exitPrice = parseNumber(ex['Fill Price'] || ex['fill price'] || ex['Price'] || '0');
      const qty = parseNumber(entry['Qty'] || entry['qty'] || entry['Quantity'] || '1');
      const profit = round2((exitPrice - entryPrice) * qty);
      trades.push({
        id: makeId(),
        accountId: journalId,
        journal_id: journalId,
        user_id: userId,
        date: parseDate(entry['Closing Time'] || entry['closing time'] || entry['Time'] || ''),
        symbol: cleanSymbol(sym),
        type: 'Buy',
        timeframe: '',
        setup: '',
        risk: profit < 0 ? Math.abs(profit) : 0,
        reward: profit,
        rr: '',
        result: getResult(profit),
        preTradeNotes: '',
        postTradeNotes: '',
        preTradePhotos: [],
        postTradePhotos: [],
        importSource: 'TradingView',
      } as Trade);
    }
  });
  return trades;
}

function parseIBKR(rows: Record<string, string>[], journalId: string, userId: string): Trade[] {
  return rows
    .filter(row => row['Buy/Sell'] || row['buy/sell'])
    .map(row => {
      const profit = parseNumber(row['FifoPnlRealized'] || row['fifopnlrealized'] || row['Realized P/L'] || '0');
      const type = getType(row['Buy/Sell'] || row['buy/sell'] || 'buy');
      return {
        id: makeId(),
        accountId: journalId,
        journal_id: journalId,
        user_id: userId,
        date: parseDate(row['DateTime'] || row['datetime'] || row['Date/Time'] || ''),
        symbol: cleanSymbol(row['Symbol'] || row['symbol'] || ''),
        type,
        timeframe: '',
        setup: '',
        risk: profit < 0 ? Math.abs(profit) : 0,
        reward: profit,
        rr: '',
        result: getResult(profit),
        preTradeNotes: '',
        postTradeNotes: '',
        preTradePhotos: [],
        postTradePhotos: [],
        importSource: 'IBKR',
      } as Trade;
    });
}

function parseBinance(rows: Record<string, string>[], journalId: string, userId: string): Trade[] {
  const entries: Record<string, string>[] = [];
  const exits: Record<string, string>[] = [];
  rows.forEach(row => {
    const type = (row['Side'] || row['side'] || row['Type'] || row['type'] || '').toUpperCase();
    if (type === 'BUY' || type === 'B') entries.push(row);
    else exits.push(row);
  });
  const trades: Trade[] = [];
  const used = new Set<number>();
  entries.forEach(entry => {
    const base = entry['Base Asset'] || entry['base-asset'] || entry['base asset'] || '';
    const quote = entry['Quote Asset'] || entry['quote-asset'] || entry['quote asset'] || 'USDT';
    const symbol = `${base}${quote}`;
    const exitIdx = exits.findIndex((ex, i) => {
      if (used.has(i)) return false;
      const exBase = ex['Base Asset'] || ex['base-asset'] || ex['base asset'] || '';
      const exQuote = ex['Quote Asset'] || ex['quote-asset'] || ex['quote asset'] || 'USDT';
      return `${exBase}${exQuote}` === symbol;
    });
    if (exitIdx >= 0) {
      used.add(exitIdx);
      const ex = exits[exitIdx];
      const entryPrice = parseNumber(entry['Price'] || entry['price'] || '0');
      const exitPrice = parseNumber(ex['Price'] || ex['price'] || '0');
      const qty = parseNumber(entry['Quantity'] || entry['quantity'] || entry['Amount'] || '1');
      const profit = round2((exitPrice - entryPrice) * qty);
      trades.push({
        id: makeId(),
        accountId: journalId,
        journal_id: journalId,
        user_id: userId,
        date: parseDate(entry['Time'] || entry['time'] || entry['Date'] || ''),
        symbol,
        type: 'Buy',
        timeframe: '',
        setup: '',
        risk: profit < 0 ? Math.abs(profit) : 0,
        reward: profit,
        rr: '',
        result: getResult(profit),
        preTradeNotes: '',
        postTradeNotes: '',
        preTradePhotos: [],
        postTradePhotos: [],
        importSource: 'Binance',
      } as Trade);
    }
  });
  return trades;
}

function parseBybit(rows: Record<string, string>[], journalId: string, userId: string): Trade[] {
  return rows
    .filter(row => {
      const pnl = row['Realized PNL'] || row['Realized P&L'] || row['realized pnl'] || row['Realized Profit'] || '';
      const side = row['Side'] || row['side'] || '';
      return pnl !== '' || side !== '';
    })
    .map(row => {
      const profit = parseNumber(
        row['Realized PNL'] || row['Realized P&L'] || row['realized pnl'] ||
        row['Realized Profit'] || row['Closed PnL'] || '0'
      );
      const entryPrice = parseNumber(row['Entry Price'] || row['entry price'] || row['Avg Entry Price'] || '0');
      const sl = parseNumber(row['SL'] || row['Stop Loss'] || row['stop loss'] || '0');
      const tp = parseNumber(row['TP'] || row['Take Profit'] || row['take profit'] || '0');
      const type = getType(row['Side'] || row['side'] || row['Direction'] || 'buy');
      const rr = calcRR(entryPrice, sl, tp, type);
      return {
        id: makeId(),
        accountId: journalId,
        journal_id: journalId,
        user_id: userId,
        date: parseDate(row['Open Time'] || row['open time'] || row['Create Time'] || row['Time'] || ''),
        symbol: cleanSymbol(row['Symbol'] || row['symbol'] || row['Contract'] || row['Contracts'] || row['contracts'] || ''),
        type,
        timeframe: '',
        setup: '',
        risk: profit < 0 ? Math.abs(profit) : 0,
        reward: profit,
        rr,
        result: getResult(profit),
        preTradeNotes: '',
        postTradeNotes: '',
        preTradePhotos: [],
        postTradePhotos: [],
        importSource: 'Bybit',
      } as Trade;
    });
}

// ── MAIN PARSER ────────────────────────────────────────────────────────────
function parseCSVFile(content: string, journalId: string, userId: string): ParseResult {
  const errors: string[] = [];

  // HTML rapor mu, CSV mi?
  let parsedLines: string[][];
  if (isHTML(content)) {
    parsedLines = parseHTMLTables(content);
    if (parsedLines.length < 2) {
      return { trades: [], platform: 'Unknown', errors: ['HTML raporunda tablo bulunamadı.'] };
    }
  } else {
    const rawLines = content.split('\n').filter(l => l.trim() !== '');
    if (rawLines.length < 2) return { trades: [], platform: 'Unknown', errors: ['Dosya boş veya geçersiz.'] };
    parsedLines = rawLines.map(l => parseCSVLine(l));
  }

  // Header satırını bul
  let headerIdx = 0;
  for (let i = 0; i < Math.min(60, parsedLines.length); i++) {
    const cols = parsedLines[i].map(c => c.toLowerCase());
    if (cols.length >= 3 && (
      cols.includes('symbol') || cols.includes('sembol') ||
      cols.includes('instrument') || cols.includes('contract') ||
      cols.includes('ticket') || cols.includes('zaman') ||
      cols.includes('hacim') || cols.includes('base-asset') ||
      cols.includes('side') || cols.includes('b/s') ||
      cols.includes('opening direction') || cols.includes('buy/sell')
    )) {
      headerIdx = i;
      break;
    }
  }

  // MT5'te "Emirler" bölümünü atla
  let endIdx = parsedLines.length;
  for (let i = headerIdx + 1; i < parsedLines.length; i++) {
    const first = parsedLines[i][0]?.trim().toLowerCase() || '';
    if (first === 'emirler' || first === 'orders' || first === 'deals' || first === 'işlemler') {
      endIdx = i;
      break;
    }
  }

  const headers = parsedLines[headerIdx];
  const platform = detectPlatform(headers);

  const dataLines = parsedLines.slice(headerIdx + 1, endIdx).filter(cols => cols.length >= 3);

  if (dataLines.length === 0) return { trades: [], platform, errors: ['CSV dosyasında veri bulunamadı.'] };

  let trades: Trade[] = [];

  try {
    if (platform === 'MT4/MT5') {
      // MT4/MT5: sütunlar başlıktan eşlenir
      trades = parseMT(dataLines, headers, journalId, userId);
    } else {
      // Diğer platformlar için dict bazlı parser
      const rows: Record<string, string>[] = dataLines.map(cols => {
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = cols[idx] || ''; });
        return row;
      });

      switch (platform) {
        case 'cTrader': trades = parseCTrader(rows, journalId, userId); break;
        case 'TradeLocker': trades = parseTradeLocker(rows, journalId, userId); break;
        case 'Tradovate': trades = parseTradovate(rows, journalId, userId); break;
        case 'NinjaTrader': trades = parseNinjaTrader(rows, journalId, userId); break;
        case 'TradingView': trades = parseTradingView(rows, journalId, userId); break;
        case 'IBKR': trades = parseIBKR(rows, journalId, userId); break;
        case 'Binance': trades = parseBinance(rows, journalId, userId); break;
        case 'Bybit': trades = parseBybit(rows, journalId, userId); break;
        default:
          errors.push('Platform otomatik tanınamadı. Lütfen doğru CSV formatında olduğunu kontrol edin.');
      }
    }
  } catch (e) {
    errors.push(`Parse hatası: ${e}`);
  }

  trades = trades.filter(t => t.symbol && t.symbol.length > 0 && t.date);
  return { trades, platform, errors };
}

// ── UI ─────────────────────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  'MT4/MT5': '#818cf8',
  'cTrader': '#34d399',
  'TradeLocker': '#f59e0b',
  'Tradovate': '#60a5fa',
  'NinjaTrader': '#f87171',
  'TradingView': '#a78bfa',
  'IBKR': '#2dd4bf',
  'Binance': '#fbbf24',
  'Bybit': '#fb923c',
};

export default function CSVImport({ onImport, onClose, journalId, journalName, userId }: CSVImportProps) {
  // Açık journal yoksa tek seçenek yeni journal oluşturmaktır.
  const [target, setTarget] = useState<'existing' | 'new'>(journalId ? 'existing' : 'new');
  const [newName, setNewName] = useState('');
  const { language, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

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
      setParseResult({ trades: [], platform: 'Unknown', errors: ['Sadece .csv, .txt, .html veya .htm dosyaları desteklenir.'] });
      return;
    }
    setFileName(file.name);
    if (!newName) {
      const base = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
      setNewName(base.slice(0, 40) || (language === 'tr' ? 'İçe Aktarılan Journal' : 'Imported Journal'));
    }
    setLoading(true);
    readFileText(file)
      .then(content => setParseResult(parseCSVFile(content, journalId || '', userId)))
      .catch(() => setParseResult({
        trades: [], platform: 'Unknown',
        errors: [language === 'tr' ? 'Dosya okunamadı.' : 'The file could not be read.'],
      }))
      .finally(() => setLoading(false));
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

  const canImport =
    !!parseResult && parseResult.trades.length > 0 &&
    (target === 'existing' ? !!journalId : newName.trim().length > 0);

  const handleImport = () => {
    if (!parseResult || parseResult.trades.length === 0 || !canImport) return;
    onImport(
      parseResult.trades,
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

  const supportedPlatforms = ['MT4/MT5', 'cTrader', 'TradeLocker', 'Tradovate', 'NinjaTrader', 'TradingView', 'IBKR', 'Binance', 'Bybit'];

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
              <div className="rounded-xl p-4" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4" style={{ color: '#34d399' }} />
                  <span className="text-sm font-semibold" style={{ color: '#34d399' }}>
                    {parseResult.trades.length} {language === 'tr' ? 'trade bulundu' : 'trades found'}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {language === 'tr' ? "Journal'ınıza eklenecek:" : 'Will be added to your journal:'}
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
                  {parseResult.trades.slice(0, 50).map((trade, i) => (
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
                  {parseResult.trades.length > 50 && (
                    <div className="px-4 py-2 text-sm text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      +{parseResult.trades.length - 50} {language === 'tr' ? 'daha...' : 'more...'}
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

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setParseResult(null); setFileName(''); }}
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
                {parseResult.trades.length > 0
                  ? `${parseResult.trades.length} ${language === 'tr' ? 'Trade İçe Aktar' : 'Trades Import'}`
                  : (language === 'tr' ? 'Trade Bulunamadı' : 'No Trades Found')}
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

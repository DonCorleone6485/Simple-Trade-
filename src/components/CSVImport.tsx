import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { Trade } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CSVImportProps {
  onImport: (trades: Trade[]) => void;
  onClose: () => void;
  journalId: string;
  userId: string;
}

interface ParseResult {
  trades: Trade[];
  platform: string;
  errors: string[];
}

function detectPlatform(headers: string[]): string {
  const h = headers.map(x => x.trim().toLowerCase());

  // MetaTrader 4/5 — English
  if (h.includes('ticket') && (h.includes('open time') || h.includes('open_time'))) return 'MT4/MT5';

  // MetaTrader 4/5 — Turkish (encoding sorununa karşı geniş kontrol)
  if (h.includes('zaman') && h.includes('sembol')) return 'MT4/MT5';
  if (h.includes('pozisyon') && h.includes('sembol')) return 'MT4/MT5';
  if (h.includes('sembol') && h.includes('kar')) return 'MT4/MT5';
  if (h.includes('sembol') && h.includes('hacim')) return 'MT4/MT5';

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
  if (h.includes('realized profit') && h.includes('trading fee')) return 'Binance';

  // Bybit
  if (h.includes('realized pnl') || h.includes('realized p&l') || (h.includes('entry price') && h.includes('exit price'))) return 'Bybit';

  return 'Unknown';
}

function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  const mt5 = dateStr.match(/(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})/);
  if (mt5) return new Date(`${mt5[1]}-${mt5[2]}-${mt5[3]}T${mt5[4]}:${mt5[5]}:00`).toISOString();
  const cleaned = dateStr.trim().replace(/\./g, '-');
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d.toISOString();
  return new Date().toISOString();
}

function parseNumber(val: string): number {
  if (!val) return 0;
  const cleaned = val
    .replace(/"/g, '')
    .trim()
    .replace(/\s/g, '')
    .replace(/,/g, '.');
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

function getResult(profit: number): 'Başarılı' | 'Başarısız' {
  return profit >= 0 ? 'Başarılı' : 'Başarısız';
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
    .replace('FX:', '').replace('NASDAQ:', '').replace('NYSE:', '')
    .replace('CME_MINI:', '').replace('.x', '').replace('.r', '')
    .trim();
}

// MT4/MT5 — Türkçe + İngilizce
function parseMT4(rows: Record<string, string>[], journalId: string, userId: string): Trade[] {
  return rows
    .filter(row => {
      const symbol = row['Sembol'] || row['Symbol'] || row['symbol'] || '';
      const hasTradeType = Object.values(row).some(v =>
        v.toLowerCase() === 'buy' || v.toLowerCase() === 'sell'
      );
      return symbol.trim() !== '' && hasTradeType;
    })
    .map(row => {
      const symbol = cleanSymbol(row['Sembol'] || row['Symbol'] || row['symbol'] || '');

      const typeRaw = Object.values(row).find(v =>
        v.toLowerCase() === 'buy' || v.toLowerCase() === 'sell'
      ) || 'buy';
      const type = getType(typeRaw);

      const openPrice = parseNumber(row['Fiyat'] || row['Open Price'] || row['open price'] || '0');
      const sl = parseNumber(row['S / L'] || row['S/L'] || row['s / l'] || row['s/l'] || '0');
      const tp = parseNumber(row['T / P'] || row['T/P'] || row['t / p'] || row['t/p'] || '0');
      const profit = parseNumber(row['Kar'] || row['Profit'] || row['profit'] || '0');
      const date = parseDate(row['Zaman'] || row['Open Time'] || row['open time'] || '');
      const rr = calcRR(openPrice, sl, tp, type);
      const risk = sl > 0 ? Math.abs(openPrice - sl) : 0;

      return {
        id: makeId(),
        accountId: journalId,
        journal_id: journalId,
        user_id: userId,
        date,
        symbol,
        type,
        timeframe: '',
        setup: '',
        risk,
        reward: profit > 0 ? profit : 0,
        rr,
        result: getResult(profit),
        preTradeNotes: row['Yorum'] || row['Comment'] || row['comment'] || '',
        postTradeNotes: '',
        preTradePhotos: [],
        postTradePhotos: [],
        importSource: 'MT4/MT5',
      } as Trade;
    });
}

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
        risk: 0,
        reward: profit > 0 ? profit : 0,
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
      risk: sl > 0 ? Math.abs(entryPrice - sl) : 0,
      reward: profit > 0 ? profit : 0,
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
      const profit = (exitPrice - entryPrice) * qty;
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
        risk: 0,
        reward: profit > 0 ? profit : 0,
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
        risk: 0,
        reward: profit > 0 ? profit : 0,
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
      const profit = (exitPrice - entryPrice) * qty;
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
        risk: 0,
        reward: profit > 0 ? profit : 0,
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
        risk: 0,
        reward: profit > 0 ? profit : 0,
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
    const type = (row['Type'] || row['type'] || row['Side'] || row['side'] || '').toUpperCase();
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
      const profit = (exitPrice - entryPrice) * qty;
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
        risk: 0,
        reward: profit > 0 ? profit : 0,
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
        symbol: cleanSymbol(row['Symbol'] || row['symbol'] || row['Contract'] || ''),
        type,
        timeframe: '',
        setup: '',
        risk: sl > 0 ? Math.abs(entryPrice - sl) : 0,
        reward: profit > 0 ? profit : 0,
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

function parseCSV(content: string, journalId: string, userId: string): ParseResult {
  const errors: string[] = [];
  const lines = content.split('\n').filter(l => l.trim() !== '');
  if (lines.length < 2) return { trades: [], platform: 'Unknown', errors: ['CSV dosyası boş veya geçersiz.'] };

  let headerIdx = 0;
for (let i = 0; i < Math.min(15, lines.length); i++) {
  const lower = lines[i].toLowerCase();
  const cols = lower.split(',').map(c => c.trim());
  // En az 3 kolon olmalı ki header satırı olsun
  if (cols.length < 3) continue;
  if (
    cols.includes('symbol') || cols.includes('sembol') ||
    cols.includes('instrument') || cols.includes('contract') ||
    cols.includes('ticket') || cols.includes('zaman') ||
    cols.includes('hacim') || cols.includes('base-asset') ||
    cols.includes('side') || cols.includes('b/s') ||
    cols.includes('opening direction') || cols.includes('buy/sell')
  ) {
    headerIdx = i;
    break;
  }
}

  // MT5'te "Emirler" bölümünü atla
  let endIdx = lines.length;
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();
    if (line.startsWith('emirler') || line.startsWith('orders')) {
      endIdx = i;
      break;
    }
  }

  const separator = lines[headerIdx].includes(';') ? ';' : ',';
  const headers = lines[headerIdx].split(separator).map(h => h.trim().replace(/"/g, ''));
  const platform = detectPlatform(headers);

  const rows: Record<string, string>[] = [];
  for (let i = headerIdx + 1; i < endIdx; i++) {
    const values = lines[i].split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length < 2 || values.every(v => v === '')) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    rows.push(row);
  }

  if (rows.length === 0) return { trades: [], platform, errors: ['CSV dosyasında veri bulunamadı.'] };

  let trades: Trade[] = [];
  try {
    switch (platform) {
      case 'MT4/MT5': trades = parseMT4(rows, journalId, userId); break;
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
  } catch (e) {
    errors.push(`Parse hatası: ${e}`);
  }

  trades = trades.filter(t => t.symbol && t.symbol.length > 0 && t.date);
  return { trades, platform, errors };
}

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

export default function CSVImport({ onImport, onClose, journalId, userId }: CSVImportProps) {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setParseResult({ trades: [], platform: 'Unknown', errors: ['Sadece .csv veya .txt dosyaları desteklenir.'] });
      return;
    }
    setFileName(file.name);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseCSV(content, journalId, userId);
      setParseResult(result);
      setLoading(false);
    };
    reader.readAsText(file, 'UTF-8');
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

  const handleImport = () => {
    if (parseResult && parseResult.trades.length > 0) {
      onImport(parseResult.trades);
      onClose();
    }
  };

  const card: React.CSSProperties = {
    background: '#1a1b2e',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '20px',
  };

  const supportedPlatforms = ['MT4/MT5', 'cTrader', 'TradeLocker', 'Tradovate', 'NinjaTrader', 'TradingView', 'IBKR', 'Binance', 'Bybit'];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-8 space-y-4">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">CSV Import</h2>
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
          <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileChange} />
          <Upload className="w-10 h-10 mb-4" style={{ color: dragging ? '#8b5cf6' : 'rgba(255,255,255,0.2)' }} />
          <p className="font-medium text-white mb-1">
            {language === 'tr' ? 'CSV dosyasını sürükleyin veya tıklayın' :
             language === 'fa' ? 'فایل CSV را بکشید یا کلیک کنید' :
             'Drag & drop CSV or click to browse'}
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {language === 'tr' ? 'Platform otomatik tanınır' : 'Platform auto-detected'}
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
                        {new Date(trade.date).toLocaleDateString()}
                      </span>
                      <span className="font-mono font-medium text-white">{trade.symbol}</span>
                      <span style={{ color: trade.type === 'Buy' ? '#34d399' : '#f87171' }}>{trade.type}</span>
                      <span style={{ color: trade.result === 'Başarılı' ? '#34d399' : '#f87171' }}>
                        {trade.result === 'Başarılı' ? '✅ Win' : '❌ Loss'}
                      </span>
                    </div>
                  ))}
                  {parseResult.trades.length > 50 && (
                    <div className="px-4 py-2 text-sm text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      +{parseResult.trades.length - 50} {language === 'tr' ? 'daha...' : 'more...'}
                    </div>
                  )}
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
                disabled={parseResult.trades.length === 0}
                className="px-6 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#8b5cf6', color: '#fff' }}
                onMouseEnter={e => { if (parseResult.trades.length > 0) (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
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

import React, { useState, useEffect, useRef } from 'react';
import { Trade, OrderType } from '../types';
import { isWinTrade, isLossTrade, isBreakevenTrade, lossAmount, winAmount, tradePnL, holdMinutes, formatDuration, isOpenTrade, realizedR, formatR } from '../lib/tradeMath';
import { money, signedMoney } from '../lib/format';
import {
  ArrowUpRight, ArrowDownRight, Calendar, Target, Trash2,
  ChevronLeft, PieChart, DollarSign, TrendingUp, Activity,
  Award, AlertTriangle, Zap, TrendingDown, Edit2, Eye,
  CheckSquare, Square, X, Save, Upload, Loader, Sparkles, Printer, FolderInput
} from 'lucide-react';
import MTFAnalysis, { MTFAnalysisView } from './MTFAnalysis';
import Checklist, { ChecklistView } from './Checklist';
import SetupPicker from './SetupPicker';
import NoteField from './NoteField';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

interface TradeHistoryProps {
  trades: Trade[];
  onDelete: (id: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  /** İstatistiklerde hesap bakiyesi ve getiri için başlangıç sermayesi. */
  account?: { startingCapital?: number | null };
  /** Bu journal dışındaki journal'lar — işlem taşımak için. */
  otherJournals?: { id: string; name: string }[];
  onMoveTrades?: (ids: string[], targetJournalId: string) => void;
  onUpdate?: (trade: Trade) => void;
  statsOnly?: boolean;
  /** Tek bir işlemi PDF/yazdırma görünümüne gönderir. */
  onPrintTrade?: (trade: Trade) => void;
}

/** İstatistik başlığı — ince, aralıklı, sayfayı bölümlere ayırır. */
const figureLabel: React.CSSProperties = {
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: 'rgba(255,255,255,0.3)',
  marginBottom: '10px',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-display text-[15px] mb-6 pb-3"
        style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.02em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Kutu yok, hizalı sayılar — sayfanın geri kalanıyla aynı sakin dil. */
function StatGrid({ items }: { items: { label: string; value: string; color?: string; hint?: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8">
      {items.map((s, i) => (
        <div key={i}>
          <div style={figureLabel} className="truncate">{s.label}</div>
          <div className="font-mono text-[24px]"
            style={{ color: s.color || 'rgba(255,255,255,0.92)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            {s.value}
          </div>
          {s.hint && <div className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{s.hint}</div>}
        </div>
      ))}
    </div>
  );
}

export default function TradeHistory({
  trades,
  onDelete,
  onDeleteMultiple,
  account,
  otherJournals = [],
  onMoveTrades,
  onUpdate,
  statsOnly = false,
  onPrintTrade,
}: TradeHistoryProps) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [editForm, setEditForm] = useState<Partial<Trade>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  /** Taşınacak işlemler; hedef journal seçilene kadar açık kalır. */
  const [movingIds, setMovingIds] = useState<string[] | null>(null);

  /**
   * Detay ve düzenleme ekranları da tarayıcı geçmişine yazılır.
   *
   * Bunlar yalnızca state olsaydı geri tuşu doğrudan journal'dan çıkarırdı;
   * oysa kullanıcının beklediği, açtığı ekranın kapanıp listeye dönmesi.
   * Aynı adrese bir kayıt ekliyoruz — geri tuşu onu tüketince ekranı kapatıyoruz.
   */
  const overlayPushed = useRef(false);

  const openOverlay = (open: () => void) => {
    if (!overlayPushed.current) {
      window.history.pushState({ tradeOverlay: true }, '');
      overlayPushed.current = true;
    }
    open();
  };

  /** Ekranı kapatır. Geçmişe kayıt eklediysek geri giderek kapatırız ki
      geçmişte ölü bir adım kalmasın. */
  const closeOverlay = () => {
    if (overlayPushed.current) { window.history.back(); return; }
    setEditingTrade(null);
    setSelectedTrade(null);
  };

  useEffect(() => {
    const onPop = () => {
      if (!overlayPushed.current) return;
      overlayPushed.current = false;
      setEditingTrade(null);
      setSelectedTrade(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const canMove = !!onMoveTrades && otherJournals.length > 0;

  const doMove = (targetId: string) => {
    if (movingIds && onMoveTrades) onMoveTrades(movingIds, targetId);
    setMovingIds(null);
    setSelectedIds(new Set());
    // Taşınan işlem artık bu journal'da değil; açıksa detayını kapat.
    if (selectedTrade) closeOverlay();
  };
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [uploadingEditPhoto, setUploadingEditPhoto] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showAi, setShowAi] = useState(false);
  const { t, language } = useLanguage();

  /** Hedef journal seçimi. Liste ve detay görünümlerinin ikisinde de görünür. */
  const movePicker = movingIds && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setMovingIds(null)}>
      <div className="w-full max-w-sm rounded-2xl p-5" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-[18px] text-white">
          {language === 'tr' ? "Başka Journal'a Taşı" : 'Move to Another Journal'}
        </h3>
        <p className="text-sm mt-1.5 mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {movingIds.length === 1
            ? (language === 'tr' ? 'Bu işlem seçtiğin journal\'a taşınacak.' : 'This trade will move to the journal you pick.')
            : (language === 'tr'
                ? `${movingIds.length} işlem seçtiğin journal'a taşınacak.`
                : `${movingIds.length} trades will move to the journal you pick.`)}
        </p>
        <div className="space-y-2">
          {otherJournals.map(j => (
            <button key={j.id} onClick={() => doMove(j.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-start text-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#fff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}>
              <FolderInput className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
              <span className="truncate">{j.name}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setMovingIds(null)} className="w-full mt-4 py-2 text-sm"
          style={{ color: 'rgba(255,255,255,0.45)' }}>
          {t('cancel')}
        </button>
      </div>
    </div>
  );

  const { user } = useUser();
  const isOwner = user?.primaryEmailAddress?.emailAddress === 'asgharjafari2007@outlook.com';

  const card: React.CSSProperties = {
    background: '#1a1b2e',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '16px',
  };
  const statCard: React.CSSProperties = { ...card, padding: '16px' };

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: '10px',
    padding: '6px 10px',
    outline: 'none',
    fontSize: '14px',
    width: '100%',
  };


  const runAiAnalysis = async () => {
    setAiLoading(true);
    setAiError('');
    setShowAi(true);
    setAiAnalysis('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trades, language, journalName: '', startingCapital: 0 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiAnalysis(data.analysis);
    } catch (e) {
      setAiError((language === 'tr' ? 'Analiz yapılamadı. Lütfen tekrar deneyin.' : 'The analysis could not be completed. Please try again.'));
    } finally {
      setAiLoading(false);
    }
  };

  const getOrderTypeText = (orderType?: string) => {
    if (orderType === 'Market') return t('orderMarket');
    if (orderType === 'Limit') return t('orderLimit');
    if (orderType === 'Stop') return t('orderStop');
    return '';
  };

  const getResultText = (result: string) => {
    if (result === 'Başarılı') return t('winStatus');
    if (result === 'Başarısız') return t('lossStatus');
    if (result === 'Manuel Karda') return t('resultManualWin');
    if (result === 'Manuel Zararda') return t('resultManualLoss');
    if (result === 'Başa Baş') return t('resultBreakeven');
    return t('openStatus');
  };

  const getFullDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (language === 'fa') return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short', calendar: 'persian' }).format(d);
    if (language === 'tr') return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  };

  const getMonthYear = (dateStr: string) => {
    const d = new Date(dateStr);
    if (language === 'fa') return new Intl.DateTimeFormat('fa-IR', { month: 'long', year: 'numeric', calendar: 'persian' }).format(d);
    if (language === 'tr') return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(d);
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
  };

  const getDayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (language === 'fa') return new Intl.DateTimeFormat('fa-IR', { day: '2-digit', month: '2-digit', year: 'numeric', calendar: 'persian' }).format(d);
    if (language === 'tr') return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
    return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  };

  // ── STATS ──────────────────────────────────────────────────────────────────
  const closedTrades = trades;
  const winningTrades = closedTrades.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda');
  const losingTrades = closedTrades.filter(t => t.result === 'Başarısız' || t.result === 'Manuel Zararda');
  const openTrades = closedTrades.filter(isOpenTrade);
  const totalClosed = closedTrades.length - openTrades.length;
  // Başa baş işlemler ne kazanç ne kayıp — oranın paydasına girmezler.
  const decidedTrades = winningTrades.length + losingTrades.length;
  const winRate = decidedTrades > 0 ? ((winningTrades.length / decidedTrades) * 100).toFixed(1) : '0.0';
  const getLossAmount = lossAmount;
  const grossProfit = winningTrades.reduce((sum, t) => sum + winAmount(t), 0);
  const grossLoss = losingTrades.reduce((sum, t) => sum + getLossAmount(t), 0);
  const netProfit = grossProfit - grossLoss;
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? '∞' : '0.00');
  const bestTrade = winningTrades.length > 0 ? Math.max(...winningTrades.map(winAmount)) : 0;
  const worstTrade = losingTrades.length > 0 ? Math.max(...losingTrades.map(getLossAmount)) : 0;
  const holdTimes = closedTrades.map(holdMinutes).filter((n): n is number => n != null);
  const avgHold = holdTimes.length > 0 ? Math.round(holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length) : null;
  // Planlanan R/R değil, gerçekleşen R'lerin ortalaması.
  const realizedRs = closedTrades.map(realizedR).filter((n): n is number => n != null);
  const avgR = realizedRs.length > 0 ? realizedRs.reduce((a, b) => a + b, 0) / realizedRs.length : null;
  const maxR = realizedRs.length > 0 ? Math.max(...realizedRs) : null;

  // Ortalama kazanç ve kayıp — beklenti hesabının iki bacağı.
  const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
  /** Kazanan bir işlem, kaybeden bir işlemin kaç katını getiriyor. */
  const payoff = avgLoss > 0 ? avgWin / avgLoss : null;
  /**
   * Beklenti: uzun vadede işlem başına ortalama kaç dolar.
   * Kazanma oranı tek başına yanıltır — %30 isabetle de para kazanılır,
   * %70 isabetle de kaybedilir. Bu ikisini tek sayıda birleştirir.
   */
  const expectancy = decidedTrades > 0
    ? ((winningTrades.length / decidedTrades) * avgWin) - ((losingTrades.length / decidedTrades) * avgLoss)
    : 0;
  const breakevenCount = closedTrades.filter(isBreakevenTrade).length;

  // Hesabın bugünkü hali: journal'ın başlangıç sermayesi + net sonuç.
  const startingCapital = account?.startingCapital ?? null;
  const balance = startingCapital != null ? startingCapital + netProfit : null;
  const returnPct = startingCapital && startingCapital > 0 ? (netProfit / startingCapital) * 100 : null;

  // Yöne göre: alışta mı satışta mı daha iyisin.
  const directionStats = (['Buy', 'Sell'] as const).map(dir => {
    const dt = closedTrades.filter(t => t.type === dir && !isOpenTrade(t));
    const w = dt.filter(isWinTrade).length;
    const l = dt.filter(isLossTrade).length;
    return {
      dir,
      total: dt.length,
      rate: w + l > 0 ? ((w / (w + l)) * 100).toFixed(0) : '0',
      pnl: dt.reduce((sum, t) => sum + tradePnL(t), 0),
    };
  });

  const sortedByDate = [...closedTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  /** Ay ay net sonuç — hangi ayların iyi gittiği tek bakışta görünsün. */
  const monthlyStats = (() => {
    const map = new Map<string, { label: string; pnl: number; total: number }>();
    sortedByDate.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : language === 'fa' ? 'fa-IR' : 'en-US',
        { month: 'short', year: '2-digit' }).format(d);
      const cur = map.get(key) || { label, pnl: 0, total: 0 };
      cur.pnl += tradePnL(t);
      cur.total += 1;
      map.set(key, cur);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  })();

  const chartData = sortedByDate.reduce((acc: any[], trade, index) => {
    const prevTotal = index > 0 ? acc[index - 1].cumulative : 0;
    const pnl = tradePnL(trade);
    acc.push({ name: index + 1, date: getDayDate(trade.date), pnl, cumulative: prevTotal + pnl, isWin: pnl >= 0 });
    return acc;
  }, []);

  const drawdownData = chartData.map((d, i) => {
    const peak = Math.max(...chartData.slice(0, i + 1).map((x: any) => x.cumulative));
    return { name: d.name, drawdown: d.cumulative - peak };
  });
  const maxDrawdown = drawdownData.length > 0 ? Math.min(...drawdownData.map((d: any) => d.drawdown)) : 0;

  const streakCalc = () => {
    if (sortedByDate.length === 0) return { current: 0, currentType: 'win' as 'win' | 'loss', bestWin: 0, bestLoss: 0 };
    let current = 0, currentType: 'win' | 'loss' = 'win', bestWin = 0, bestLoss = 0, tempStreak = 0;
    let tempType: 'win' | 'loss' = 'win';
    const decided = sortedByDate.filter(t => t.result !== 'Başa Baş');
    if (decided.length === 0) return { current: 0, currentType: 'win' as 'win' | 'loss', bestWin: 0, bestLoss: 0 };
    decided.forEach((trade, i) => {
      const isWin = trade.result === 'Başarılı' || trade.result === 'Manuel Karda';
      const tradeType: 'win' | 'loss' = isWin ? 'win' : 'loss';
      if (i === 0) { tempStreak = 1; tempType = tradeType; }
      else if (tradeType === tempType) { tempStreak++; }
      else {
        if (tempType === 'win') bestWin = Math.max(bestWin, tempStreak);
        else bestLoss = Math.max(bestLoss, tempStreak);
        tempStreak = 1; tempType = tradeType;
      }
      if (i === decided.length - 1) {
        current = tempStreak; currentType = tempType;
        if (tempType === 'win') bestWin = Math.max(bestWin, tempStreak);
        else bestLoss = Math.max(bestLoss, tempStreak);
      }
    });
    return { current, currentType, bestWin, bestLoss };
  };
  const streak = streakCalc();

  const getSession = (dateStr: string) => {
    const hour = new Date(dateStr).getUTCHours();
    if (hour >= 22 || hour < 7) return 'asianSession';
    if (hour >= 7 && hour < 12) return 'londonSession';
    return 'nySession';
  };

  const sessionStats = ['asianSession', 'londonSession', 'nySession'].map(session => {
    const st = closedTrades.filter(t => getSession(t.date) === session);
    const wins = st.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda').length;
    const profit = st.filter(isWinTrade).reduce((s, t) => s + winAmount(t), 0);
    const lossCount = st.filter(isLossTrade).length;
    const loss = st.filter(isLossTrade).reduce((s, t) => s + lossAmount(t), 0);
    return { session, rate: wins + lossCount > 0 ? ((wins / (wins + lossCount)) * 100).toFixed(0) : 0, total: st.length, pnl: profit - loss };
  });

  const getDayKey = (dateStr: string) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date(dateStr).getDay()];
  };

  const dayStats = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
    const dt = closedTrades.filter(t => getDayKey(t.date) === day);
    const wins = dt.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda').length;
    const profit = dt.filter(isWinTrade).reduce((s, t) => s + winAmount(t), 0);
    const lossCount = dt.filter(isLossTrade).length;
    const loss = dt.filter(isLossTrade).reduce((s, t) => s + lossAmount(t), 0);
    return { day, rate: wins + lossCount > 0 ? ((wins / (wins + lossCount)) * 100).toFixed(0) : 0, total: dt.length, pnl: profit - loss };
  }).filter(d => d.total > 0);

  const setupStats = (() => {
    const map: Record<string, { wins: number; losses: number; total: number; pnl: number }> = {};
    closedTrades.forEach(trade => {
      const key = trade.setup || 'Diğer';
      if (!map[key]) map[key] = { wins: 0, losses: 0, total: 0, pnl: 0 };
      map[key].total++;
      const isWin = trade.result === 'Başarılı' || trade.result === 'Manuel Karda';
      const isLoss = trade.result === 'Başarısız' || trade.result === 'Manuel Zararda';
      if (isWin) { map[key].wins++; map[key].pnl += winAmount(trade); }
      if (isLoss) { map[key].losses++; map[key].pnl -= getLossAmount(trade); }
    });
    return Object.entries(map).map(([setup, s]) => ({ setup, ...s, winRate: s.wins + s.losses > 0 ? ((s.wins / (s.wins + s.losses)) * 100).toFixed(0) : '0' })).sort((a, b) => b.pnl - a.pnl);
  })();

  const symbolStats = (() => {
    const map: Record<string, { wins: number; losses: number; total: number; pnl: number }> = {};
    closedTrades.forEach(trade => {
      const key = trade.symbol;
      if (!map[key]) map[key] = { wins: 0, losses: 0, total: 0, pnl: 0 };
      map[key].total++;
      const isWin = trade.result === 'Başarılı' || trade.result === 'Manuel Karda';
      const isLoss = trade.result === 'Başarısız' || trade.result === 'Manuel Zararda';
      if (isWin) { map[key].wins++; map[key].pnl += winAmount(trade); }
      if (isLoss) { map[key].losses++; map[key].pnl -= getLossAmount(trade); }
    });
    return Object.entries(map).map(([symbol, s]) => ({ symbol, ...s, winRate: s.wins + s.losses > 0 ? ((s.wins / (s.wins + s.losses)) * 100).toFixed(0) : '0' })).sort((a, b) => b.pnl - a.pnl).slice(0, 8);
  })();

  const heatMapData = (() => {
    const days = language === 'tr' ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayIndices = [1, 2, 3, 4, 5, 6, 0];
    const hours = [0, 4, 8, 12, 16, 20];
    return days.map((dayLabel, di) => {
      const dayIndex = dayIndices[di];
      return {
        day: dayLabel,
        hours: hours.map(hour => {
          const filtered = closedTrades.filter(trade => {
            const d = new Date(trade.date);
            return d.getDay() === dayIndex && d.getHours() >= hour && d.getHours() < hour + 4;
          });
          const pnl = filtered.reduce((s, t) => {
            return s + tradePnL(t);
          }, 0);
          return { hour: `${String(hour).padStart(2, '0')}:00`, total: filtered.length, pnl };
        }),
      };
    });
  })();

  const getHeatColor = (pnl: number, total: number) => {
    if (total === 0) return 'rgba(255,255,255,0.03)';
    if (pnl > 0) { const intensity = Math.min(pnl / 50, 1); return `rgba(52,211,153,${0.1 + intensity * 0.4})`; }
    else { const intensity = Math.min(Math.abs(pnl) / 50, 1); return `rgba(248,113,113,${0.1 + intensity * 0.4})`; }
  };

  // ── SELECTION ──────────────────────────────────────────────────────────────
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === trades.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(trades.map(t => t.id)));
  };

  const handleDeleteSelected = () => {
    if (onDeleteMultiple) onDeleteMultiple(Array.from(selectedIds));
    else selectedIds.forEach(id => onDelete(id));
    setSelectedIds(new Set());
  };

  // ── EDIT ──────────────────────────────────────────────────────────────────
  const startEdit = (trade: Trade, e: React.MouseEvent) => {
    e.stopPropagation();
    // Detaydan geliyorsa geçmişte zaten bir kaydımız var; ikinciyi eklemeyiz,
    // yoksa geri tuşu bir kez boşa basılmış olur.
    openOverlay(() => {
      setEditingTrade(trade);
      setEditForm({ ...trade });
      setSelectedTrade(null);
    });
  };

  const saveEdit = () => {
    if (!editingTrade || !onUpdate) return;
    const merged = { ...editingTrade, ...editForm } as Trade;
    if (merged.exitDate && new Date(merged.exitDate).getTime() < new Date(merged.date).getTime()) {
      alert(language === 'tr'
        ? 'Çıkış tarihi, giriş tarihinden önce olamaz.'
        : 'Exit time cannot be earlier than entry time.');
      return;
    }
    onUpdate(merged);
    setEditForm({});
    closeOverlay();
  };

  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'pre' | 'post') => {
    const files = Array.from(e.target.files || []) as File[];
    const current = kind === 'pre' ? (editForm.preTradePhotos || []) : (editForm.postTradePhotos || []);
    if (!isOwner && current.length + files.length > 3) {
      alert((language === 'tr' ? 'En fazla 3 fotoğraf yükleyebilirsiniz.' : 'You can upload at most 3 photos.'));
      return;
    }
    setUploadingEditPhoto(true);
    let failure = '';
    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user?.id}/${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${kind}.${ext}`;
      const { data, error } = await supabase.storage.from('trade-photos').upload(path, file, { contentType: file.type });
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('trade-photos').getPublicUrl(data.path);
        const url = urlData.publicUrl;
        if (kind === 'pre') setEditForm(f => ({ ...f, preTradePhotos: [...(f.preTradePhotos || []), url] }));
        else setEditForm(f => ({ ...f, postTradePhotos: [...(f.postTradePhotos || []), url] }));
      } else if (error) {
        console.error('Upload error:', error);
        failure = error.message;
      }
    }
    setUploadingEditPhoto(false);
    e.target.value = '';
    if (failure) {
      alert(language === 'tr' ? `Fotoğraf yüklenemedi: ${failure}` : `Photo upload failed: ${failure}`);
    }
  };

  const removeEditPhoto = async (index: number, kind: 'pre' | 'post') => {
    const photos = kind === 'pre' ? (editForm.preTradePhotos || []) : (editForm.postTradePhotos || []);
    const url = photos[index];
    if (url && url.includes('/trade-photos/')) {
      const path = url.split('/trade-photos/')[1];
      if (path) await supabase.storage.from('trade-photos').remove([path]);
    }
    if (kind === 'pre') setEditForm(f => ({ ...f, preTradePhotos: (f.preTradePhotos || []).filter((_, i) => i !== index) }));
    else setEditForm(f => ({ ...f, postTradePhotos: (f.postTradePhotos || []).filter((_, i) => i !== index) }));
  };

  // ── STATS ONLY ─────────────────────────────────────────────────────────────
  if (statsOnly) {
    if (trades.length === 0) {
      return (
        <div className="text-center py-20 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <Target className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p style={{ color: 'rgba(255,255,255,0.35)' }}>{t('emptyDesc')}</p>
        </div>
      );
    }
    return (
      <div className="space-y-12">

        {/* ── Hesabın bugünkü hali ── */}
        <div className="flex flex-wrap items-end gap-x-14 gap-y-8 pb-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {balance != null && (
            <div>
              <div style={figureLabel}>{t('accountBalance')}</div>
              <div className="font-mono" style={{ fontSize: '38px', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                {money(balance)}
              </div>
            </div>
          )}
          <div>
            <div style={figureLabel}>{t('netProfit')}</div>
            <div className="font-mono" style={{ fontSize: '38px', letterSpacing: '-0.03em', color: netProfit >= 0 ? '#34d399' : '#f87171', fontVariantNumeric: 'tabular-nums' }}>
              {signedMoney(netProfit)}
            </div>
          </div>
          {returnPct != null && (
            <div>
              <div style={figureLabel}>{t('totalReturn')}</div>
              <div className="font-mono" style={{ fontSize: '38px', letterSpacing: '-0.03em', color: returnPct >= 0 ? '#34d399' : '#f87171', fontVariantNumeric: 'tabular-nums' }}>
                {returnPct >= 0 ? '+' : '\u2212'}%{Math.abs(returnPct).toFixed(1)}
              </div>
            </div>
          )}
        </div>

        {/* ── Kazanan / kaybeden dağılımı ── */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <span style={figureLabel}>{t('winRate')}</span>
            <span className="font-mono text-[15px]" style={{ fontVariantNumeric: 'tabular-nums' }}>%{winRate}</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {[
              { n: winningTrades.length, c: '#34d399' },
              { n: breakevenCount, c: 'rgba(255,255,255,0.25)' },
              { n: losingTrades.length, c: '#f87171' },
            ].map((seg, i) => seg.n > 0 && (
              <div key={i} style={{ width: `${(seg.n / Math.max(totalClosed, 1)) * 100}%`, background: seg.c }} />
            ))}
          </div>
          <div className="flex gap-6 mt-3 text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span><span style={{ color: '#34d399' }}>●</span> {winningTrades.length} {t('winnersCount')}</span>
            {breakevenCount > 0 && <span><span style={{ color: 'rgba(255,255,255,0.35)' }}>●</span> {breakevenCount} {t('breakevenCount')}</span>}
            <span><span style={{ color: '#f87171' }}>●</span> {losingTrades.length} {t('losersCount')}</span>
            <span className="ms-auto">{totalClosed} {t('totalTrades').toLocaleLowerCase(language === 'tr' ? 'tr-TR' : 'en-US')}</span>
          </div>
        </div>

        {/* ── Risk ve getiri ── */}
        <Section title={t('riskMetrics')}>
          <StatGrid items={[
            { label: t('expectancy'), value: signedMoney(expectancy), color: expectancy >= 0 ? '#34d399' : '#f87171',
              hint: language === 'tr' ? 'İşlem başına uzun vadeli ortalama' : 'Long-run average per trade' },
            { label: t('profitFactor'), value: profitFactor },
            { label: t('avgRealizedR'), value: formatR(avgR), color: avgR == null ? undefined : avgR >= 0 ? '#34d399' : '#f87171' },
            { label: t('payoffRatio'), value: payoff != null ? `${payoff.toFixed(2)}x` : '-' },
            { label: t('avgWin'), value: `+${money(avgWin)}`, color: '#34d399' },
            { label: t('avgLoss'), value: `\u2212${money(avgLoss)}`, color: '#f87171' },
            { label: t('bestTrade'), value: `+${money(bestTrade)}`, color: '#34d399' },
            { label: t('worstTrade'), value: `\u2212${money(worstTrade)}`, color: '#f87171' },
            { label: t('maxRealizedR'), value: formatR(maxR), color: maxR != null && maxR >= 0 ? '#34d399' : undefined },
            { label: t('maxDrawdown'), value: money(maxDrawdown), color: '#f87171' },
            ...(avgHold != null ? [{ label: t('avgDuration'), value: formatDuration(avgHold, language) }] : []),
            ...(openTrades.length > 0 ? [{ label: t('openTradesCount'), value: String(openTrades.length), color: '#fbbf24' }] : []),
          ]} />
        </Section>

        {/* ── Seriler ── */}
        <Section title={t('streaks')}>
          <StatGrid items={[
            { label: t('currentStreak'), value: String(streak.current),
              color: streak.currentType === 'win' ? '#34d399' : '#f87171',
              hint: streak.currentType === 'win' ? t('winStatus') : t('lossStatus') },
            { label: t('bestWinStreak'), value: String(streak.bestWin), color: '#34d399' },
            { label: t('bestLossStreak'), value: String(streak.bestLoss), color: '#f87171' },
          ]} />
        </Section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div style={{ ...statCard, padding: '20px' }} className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('cumulativePnl')}</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={netProfit >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={netProfit >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 12 }} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 12 }} dx={-10} tickFormatter={v => `$${v}`} />
                  <RechartsTooltip contentStyle={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} formatter={(value: number) => [money(value), t('cumulativePnl')]} labelFormatter={label => `Trade #${label}`} />
                  <Area type="monotone" dataKey="cumulative" stroke={netProfit >= 0 ? '#10b981' : '#f43f5e'} strokeWidth={2} fillOpacity={1} fill="url(#colorCumulative)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ ...statCard, padding: '20px' }}>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('tradePnl')}</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 12 }} dy={10} />
                  <RechartsTooltip contentStyle={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} formatter={(value: number) => [money(value), 'PnL']} labelFormatter={label => `Trade #${label}`} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="pnl" radius={[4, 4, 4, 4]}>
                    {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.isWin ? '#10b981' : '#f43f5e'} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div style={{ ...statCard, padding: '20px' }}>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('drawdownChart')}</h4>
            <div className="text-sm font-mono" style={{ color: '#f87171' }}>{t('maxDrawdown')}: {money(maxDrawdown)}</div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={drawdownData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 12 }} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 12 }} dx={-10} tickFormatter={v => `$${v}`} />
                <RechartsTooltip contentStyle={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} formatter={(value: number) => [money(value), 'Drawdown']} labelFormatter={label => `Trade #${label}`} />
                <Area type="monotone" dataKey="drawdown" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorDrawdown)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* ── Aylık performans ── */}
        {monthlyStats.length > 1 && (
          <div style={{ ...statCard, padding: '20px' }}>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('monthlyPerformance')}</h4>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 12 }} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 12 }} dx={-10} tickFormatter={v => `$${v}`} />
                  <RechartsTooltip contentStyle={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }}
                    formatter={(value: number) => [signedMoney(value), t('netProfit')]} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                    {monthlyStats.map((m, i) => (<Cell key={i} fill={m.pnl >= 0 ? '#10b981' : '#f43f5e'} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Yöne göre: alış mı satış mı ── */}
        <div style={{ ...statCard, padding: '20px' }}>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('directionStats')}</h4>
          <div className="grid grid-cols-2 gap-8">
            {directionStats.map(({ dir, total, rate, pnl }) => (
              <div key={dir}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: dir === 'Buy' ? '#34d399' : '#f87171' }}>
                    {dir === 'Buy' ? t('buy') : t('sell')}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {total} {t('totalTrades').toLocaleLowerCase(language === 'tr' ? 'tr-TR' : 'en-US')}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${rate}%`, background: dir === 'Buy' ? '#34d399' : '#f87171' }} />
                </div>
                <div className="flex items-baseline justify-between font-mono text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>%{rate}</span>
                  <span style={{ color: pnl >= 0 ? '#34d399' : '#f87171' }}>{signedMoney(pnl)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...statCard, padding: '20px' }}>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('heatMap')}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left pb-3 pe-4 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}></th>
                  {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map(h => (<th key={h} className="pb-3 px-1 font-medium text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {heatMapData.map(({ day, hours }) => (
                  <tr key={day}>
                    <td className="pe-4 py-1 font-medium" style={{ color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{day}</td>
                    {hours.map((cell, i) => (
                      <td key={i} className="px-1 py-1">
                        <div className="rounded-lg flex items-center justify-center text-xs font-mono"
                          style={{ background: getHeatColor(cell.pnl, cell.total), border: '1px solid rgba(255,255,255,0.04)', height: '40px', minWidth: '48px', color: cell.total > 0 ? (cell.pnl >= 0 ? '#34d399' : '#f87171') : 'rgba(255,255,255,0.15)' }}
                          title={cell.total > 0 ? `${cell.total} trade, ${signedMoney(cell.pnl)}` : ''}>
                          {cell.total > 0 ? `${cell.total}` : ''}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-4 mt-4 justify-end">
              <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <div className="w-3 h-3 rounded" style={{ background: 'rgba(52,211,153,0.4)' }} />
                {t('profitable')}
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <div className="w-3 h-3 rounded" style={{ background: 'rgba(248,113,113,0.4)' }} />
                {t('losing')}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {setupStats.length > 0 && (
            <div style={{ ...statCard, padding: '20px' }}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('setupPerformance')}</h4>
              <div className="space-y-3">
                {setupStats.map(({ setup, total, winRate, pnl }) => (
                  <div key={setup} className="flex items-center gap-3">
                    <span className="text-sm font-medium truncate" style={{ color: '#818cf8', minWidth: '80px', maxWidth: '120px' }}>{setup}</span>
                    <div className="flex-1"><div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}><div className="h-full rounded-full" style={{ width: `${winRate}%`, background: '#818cf8' }} /></div></div>
                    <span className="text-xs font-mono w-8 text-end" style={{ color: 'rgba(255,255,255,0.4)' }}>%{winRate}</span>
                    <span className="text-xs font-mono w-16 text-end" style={{ color: pnl >= 0 ? '#34d399' : '#f87171' }}>{signedMoney(pnl, 0)}</span>
                    <span className="text-xs w-8 text-end" style={{ color: 'rgba(255,255,255,0.3)' }}>{total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {symbolStats.length > 0 && (
            <div style={{ ...statCard, padding: '20px' }}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('symbolPerformance')}</h4>
              <div className="space-y-3">
                {symbolStats.map(({ symbol, total, winRate, pnl }) => (
                  <div key={symbol} className="flex items-center gap-3">
                    <span className="text-sm font-medium font-mono" style={{ color: '#fff', minWidth: '80px' }}>{symbol}</span>
                    <div className="flex-1"><div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}><div className="h-full rounded-full" style={{ width: `${winRate}%`, background: '#2dd4bf' }} /></div></div>
                    <span className="text-xs font-mono w-8 text-end" style={{ color: 'rgba(255,255,255,0.4)' }}>%{winRate}</span>
                    <span className="text-xs font-mono w-16 text-end" style={{ color: pnl >= 0 ? '#34d399' : '#f87171' }}>{signedMoney(pnl, 0)}</span>
                    <span className="text-xs w-8 text-end" style={{ color: 'rgba(255,255,255,0.3)' }}>{total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div style={{ ...statCard, padding: '20px' }}>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('sessionStats')}</h4>
            <div className="space-y-4">
              {sessionStats.map(({ session, rate, total, pnl }) => (
                <div key={session} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-24 text-white">{t(session as any)} <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>({total})</span></span>
                  <div className="flex-1 mx-4"><div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}><div className="h-full rounded-full" style={{ width: `${rate}%`, background: '#818cf8' }} /></div></div>
                  <span className="text-xs font-mono w-12 text-end" style={{ color: pnl >= 0 ? '#34d399' : '#f87171' }}>{signedMoney(pnl, 0)}</span>
                  <span className="text-sm font-semibold font-mono w-10 text-end text-white ms-2">%{rate}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...statCard, padding: '20px' }}>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('dayStats')}</h4>
            <div className="space-y-4">
              {dayStats.length > 0 ? dayStats.map(({ day, rate, total, pnl }) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-24 text-white">{t(day as any)} <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>({total})</span></span>
                  <div className="flex-1 mx-4"><div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}><div className="h-full rounded-full" style={{ width: `${rate}%`, background: '#2dd4bf' }} /></div></div>
                  <span className="text-xs font-mono w-12 text-end" style={{ color: pnl >= 0 ? '#34d399' : '#f87171' }}>{signedMoney(pnl, 0)}</span>
                  <span className="text-sm font-semibold font-mono w-10 text-end text-white ms-2">%{rate}</span>
                </div>
              )) : <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('emptyDesc')}</p>}
            </div>
          </div>
        </div>
        <div style={{ ...statCard, padding: '20px' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: '#a78bfa' }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.3)' }}>AI Analiz</span>
            </div>
            <button onClick={runAiAnalysis} disabled={aiLoading}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#8b5cf6', color: '#fff' }}
              onMouseEnter={e => { if (!aiLoading) (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
              {aiLoading ? t('aiAnalyzeLoading') : t('aiAnalyzeBtn')}
            </button>
          </div>
          {!showAi && !aiLoading && <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('aiAnalyzeDesc')}</p>}
          {aiLoading && (
            <div className="flex items-center gap-3 py-4">
              <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6' }} />
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('aiAnalyzing')}</span>
            </div>
          )}
          {aiError && <p className="text-sm mt-2" style={{ color: '#f87171' }}>{aiError}</p>}
          {aiAnalysis && !aiLoading && (
            <div className="mt-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {aiAnalysis.split('\n').map((line, i) => {
                if (line.startsWith('## ') || line.startsWith('# ')) return <h3 key={i} className="text-base font-bold mt-6 mb-2 text-white">{line.replace(/^#+\s/, '')}</h3>;
                if (line.match(/^\*\*.*\*\*$/)) return <p key={i} className="font-semibold mt-3 mb-1 text-white">{line.replace(/\*\*/g, '')}</p>;
                if (line.match(/^\d+\.\s\*\*/)) return <p key={i} className="font-semibold mt-3 mb-1" style={{ color: '#a78bfa' }}>{line.replace(/\*\*/g, '')}</p>;
                if (line.startsWith('- ') || line.startsWith('• ')) return <p key={i} className="mt-1 ps-4" style={{ color: 'rgba(255,255,255,0.65)' }}>• {line.replace(/^[-•]\s/, '')}</p>;
                if (line.trim() === '') return <div key={i} className="h-2" />;
                return <p key={i} className="mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{line}</p>;
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EDIT VIEW ──────────────────────────────────────────────────────────────
  if (editingTrade) {
    /** ISO -> datetime-local (yerel saat). */
    const toLocalInput = (iso?: string) =>
      iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
    const editLossResult = editForm.result === 'Başarısız' || editForm.result === 'Manuel Zararda';
    const editWinResult = editForm.result === 'Başarılı' || editForm.result === 'Manuel Karda';
    const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: 'rgba(255,255,255,0.5)' };
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={closeOverlay}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}>
            <ChevronLeft className="w-4 h-4" />
            {language === 'tr' ? 'Geri' : 'Back'}
          </button>
          <div className="flex items-center gap-3">
            <button onClick={closeOverlay} className="px-4 py-2 text-sm rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
              {t('cancel')}
            </button>
            <button onClick={saveEdit} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl"
              style={{ background: '#8b5cf6', color: '#fff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
              <Save className="w-4 h-4" />
              {t('save')}
            </button>
          </div>
        </div>

        <div className="rounded-2xl p-6 space-y-6" style={card}>
          <h2 className="text-lg font-semibold text-white">{language === 'tr' ? 'İşlemi Düzenle' : language === 'fa' ? 'ویرایش معامله' : 'Edit Trade'}</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label style={lbl}>{t('dateTime')}</label>
              <input type="datetime-local" style={{ ...inp, colorScheme: 'dark' }}
                value={toLocalInput(editForm.date)}
                onChange={e => setEditForm(f => ({ ...f, date: e.target.value ? new Date(e.target.value).toISOString() : f.date }))} />
            </div>
            <div>
              <label style={lbl}>{t('symbol')}</label>
              <input style={inp} value={editForm.symbol || ''} onChange={e => setEditForm(f => ({ ...f, symbol: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>{t('type')}</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={editForm.type || 'Buy'} onChange={e => setEditForm(f => ({ ...f, type: e.target.value as 'Buy' | 'Sell' }))}>
                <option value="Buy" style={{ background: '#1a1b2e' }}>Buy</option>
                <option value="Sell" style={{ background: '#1a1b2e' }}>Sell</option>
              </select>
            </div>
            <div>
              <label style={lbl}>{t('orderType')}</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={editForm.orderType || 'Market'} onChange={e => setEditForm(f => ({ ...f, orderType: e.target.value as OrderType }))}>
                <option value="Market" style={{ background: '#1a1b2e' }}>{t('orderMarket')}</option>
                <option value="Limit" style={{ background: '#1a1b2e' }}>{t('orderLimit')}</option>
                <option value="Stop" style={{ background: '#1a1b2e' }}>{t('orderStop')}</option>
              </select>
            </div>
            <div>
              <label style={lbl}>{t('setup')}</label>
              {/* Yeni işlem formundaki seçicinin aynısı: kullanıcının kaydettiği
                  özel setuplar burada da çıksın. */}
              <SetupPicker value={editForm.setup || ''} onChange={v => setEditForm(f => ({ ...f, setup: v }))} />
            </div>
            <div>
              <label style={lbl}>{t('risk')}</label>
              <input type="number" step="0.01" style={inp} value={editForm.risk || ''} onChange={e => setEditForm(f => ({ ...f, risk: parseFloat(e.target.value) || 0 }))} placeholder="0.00" />
            </div>
            <div>
              <label style={lbl}>
                {editLossResult ? t('lossAmountLabel') : editWinResult ? t('reward') : t('rewardOrLossLabel')}
              </label>
              {/* Kullanıcı pozitif görür ve girer; işareti sonuç belirler. */}
              <input type="number" min="0" step="0.01" style={inp}
                value={editForm.reward === undefined ? '' : Math.abs(editForm.reward)}
                onChange={e => {
                  const amount = Math.abs(parseFloat(e.target.value) || 0);
                  setEditForm(f => ({ ...f, reward: editLossResult ? -amount : amount }));
                }}
                placeholder="0.00" />
            </div>
            <div>
              <label style={lbl}>{t('plannedRR')}</label>
              <input type="number" step="0.01" style={inp} value={editForm.rr || ''} onChange={e => setEditForm(f => ({ ...f, rr: e.target.value }))} placeholder="2.5" />
            </div>
            <div>
              <label style={lbl}>{t('result')}</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={editForm.result || 'Başarılı'}
                onChange={e => {
                  const val = e.target.value as Trade['result'];
                  const amount = Math.abs(editForm.reward || 0);
                  const isLossVal = val === 'Başarısız' || val === 'Manuel Zararda';
                  setEditForm(f => ({
                    ...f,
                    result: val,
                    reward: val === 'Başa Baş' ? 0 : (isLossVal ? -amount : amount),
                  }));
                }}>
                <option value="Başarılı" style={{ background: '#1a1b2e' }}>{t('resultWin')}</option>
                <option value="Başarısız" style={{ background: '#1a1b2e' }}>{t('resultLoss')}</option>
                <option value="Manuel Karda" style={{ background: '#1a1b2e' }}>{t('resultManualWin')}</option>
                <option value="Manuel Zararda" style={{ background: '#1a1b2e' }}>{t('resultManualLoss')}</option>
                <option value="Başa Baş" style={{ background: '#1a1b2e' }}>{t('resultBreakeven')}</option>
              </select>
            </div>
            <div>
              <label style={lbl}>{t('exitDateTime')}</label>
              {/* Takvim girişten önce açılmasın: boşken de giriş anını gösterir. */}
              <input type="datetime-local" style={{ ...inp, colorScheme: 'dark' }}
                min={toLocalInput(editForm.date)}
                value={toLocalInput(editForm.exitDate)}
                onFocus={() => {
                  // Kapanmış işlemde çıkış alanı boşsa girişten başlat — genelde
                  // sadece saat ve dakika değişir, gün aynı kalır.
                  if (!editForm.exitDate && editForm.result && editForm.date) {
                    setEditForm(f => ({ ...f, exitDate: f.date }));
                  }
                }}
                onChange={e => setEditForm(f => ({ ...f, exitDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))} />
            </div>
          </div>

          <div>
            <label style={lbl}>Checklist</label>
            <Checklist
              value={editForm.checklist || []}
              onChange={items => setEditForm(f => ({ ...f, checklist: items }))}
            />
          </div>

          <div>
            <label style={lbl}>{language === 'tr' ? 'Multi Timeframe Analiz' : 'Multi-Timeframe Analysis'}</label>
            <MTFAnalysis
              value={editForm.mtfAnalysis || []}
              onChange={entries => setEditForm(f => ({ ...f, mtfAnalysis: entries }))}
            />
          </div>

          {/* Not ve fotoğraflar, işlemin akışına göre: önce işleme girerken
              düşündüklerin ve baktığın grafik, sonra kapandıktan sonrakiler. */}
          {(['pre', 'post'] as const).map(kind => {
            const photos = (kind === 'pre' ? editForm.preTradePhotos : editForm.postTradePhotos) || [];
            const canUpload = isOwner || photos.length < 3;
            const fileRef = React.createRef<HTMLInputElement>();
            return (
              <div key={kind} className="space-y-5">
                <div>
                  <label style={lbl}>{kind === 'pre' ? t('preTrade') : t('postTrade')} {t('notes')}</label>
                  <NoteField style={inp}
                    value={(kind === 'pre' ? editForm.preTradeNotes : editForm.postTradeNotes) || ''}
                    onChange={v => setEditForm(f => kind === 'pre'
                      ? { ...f, preTradeNotes: v }
                      : { ...f, postTradeNotes: v })}
                    placeholder={kind === 'pre' ? t('preNotesPlaceholder') : t('postNotesPlaceholder')} />
                </div>

                <div>
                  <label style={lbl}>
                    {kind === 'pre' ? t('preTrade') : t('postTrade')} {t('photos')}
                    {!isOwner && <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 6 }}>({photos.length}/3)</span>}
                  </label>
                  <div className="space-y-3">
                    {canUpload && (
                      <div
                        onClick={() => !uploadingEditPhoto && fileRef.current?.click()}
                        className="w-full h-24 flex flex-col items-center justify-center rounded-xl transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px dashed rgba(255,255,255,0.12)',
                          cursor: uploadingEditPhoto ? 'not-allowed' : 'pointer',
                          opacity: uploadingEditPhoto ? 0.6 : 1,
                        }}
                        onMouseEnter={e => { if (!uploadingEditPhoto) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                      >
                        {uploadingEditPhoto
                          ? <><Loader className="w-4 h-4 mb-1 animate-spin" style={{ color: '#8b5cf6' }} /><span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{language === 'tr' ? 'Yükleniyor...' : 'Uploading...'}</span></>
                          : <><Upload className="w-4 h-4 mb-1" style={{ color: 'rgba(255,255,255,0.25)' }} /><span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('photoUpload')}</span></>
                        }
                        <input type="file" ref={fileRef} onChange={e => handleEditPhotoUpload(e, kind)} accept="image/*" multiple className="hidden" disabled={uploadingEditPhoto} />
                      </div>
                    )}
                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {photos.map((photo, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden group" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={photo} alt={`photo-${i}`} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeEditPhoto(i, kind)}
                              className="absolute top-1 end-1 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Düzenleme uzun bir form; kaydet aşağıda da dursun ki başa dönmek
              gerekmesin. */}
          <div className="flex items-center justify-end gap-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={closeOverlay} className="px-4 py-2 text-sm rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
              {t('cancel')}
            </button>
            <button onClick={saveEdit} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl"
              style={{ background: '#8b5cf6', color: '#fff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
              <Save className="w-4 h-4" />
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ────────────────────────────────────────────────────────────
  if (selectedTrade) {
    const isWin = selectedTrade.result === 'Başarılı' || selectedTrade.result === 'Manuel Karda';
    const isLoss = selectedTrade.result === 'Başarısız' || selectedTrade.result === 'Manuel Zararda';
    return (
      <>
        {movePicker}
        {/* ── LIGHTBOX ── */}
        {lightboxPhoto && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,0.92)' }}
            onClick={() => setLightboxPhoto(null)}
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 end-4 p-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxPhoto}
              alt="Trade photo"
              className="rounded-2xl object-contain"
              style={{ maxHeight: '90vh', maxWidth: '90vw' }}
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={closeOverlay}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              {t('backToList')}
            </button>
            <div className="flex items-center gap-2">
              {onPrintTrade && (
                <button onClick={() => onPrintTrade(selectedTrade)} title={t('printTrade')}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}>
                  <Printer className="w-4 h-4" />
                  {t('printPdf')}
                </button>
              )}
              {canMove && (
                <button onClick={() => setMovingIds([selectedTrade.id])}
                  title={language === 'tr' ? "Başka journal'a taşı" : 'Move to another journal'}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}>
                  <FolderInput className="w-4 h-4" />
                  {language === 'tr' ? 'Taşı' : 'Move'}
                </button>
              )}
              <button onClick={e => startEdit(selectedTrade, e)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-all"
                style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}>
                <Edit2 className="w-4 h-4" />
                {language === 'tr' ? 'Düzenle' : 'Edit'}
              </button>
              <button onClick={() => { onDelete(selectedTrade.id); closeOverlay(); }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-all"
                style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'; }}>
                <Trash2 className="w-4 h-4" />
                {t('delete')}
              </button>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="p-5 flex flex-wrap items-center justify-between gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                  background: selectedTrade.type === 'Buy' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                  border: selectedTrade.type === 'Buy' ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(248,113,113,0.2)',
                }}>
                  {selectedTrade.type === 'Buy'
                    ? <ArrowUpRight className="w-6 h-6 rtl:-scale-x-100" style={{ color: '#34d399' }} />
                    : <ArrowDownRight className="w-6 h-6 rtl:-scale-x-100" style={{ color: '#f87171' }} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-white">{selectedTrade.symbol}</span>
                    {selectedTrade.orderType && (
                      <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                        {getOrderTypeText(selectedTrade.orderType)}
                      </span>
                    )}
                    {selectedTrade.setup && (
                      <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>
                        {selectedTrade.setup}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1 flex-wrap" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <Calendar className="w-4 h-4" />
                    <span>{getFullDateTime(selectedTrade.date)}</span>
                    {selectedTrade.exitDate && (
                      <>
                        <span style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>
                        <span>{getFullDateTime(selectedTrade.exitDate)}</span>
                      </>
                    )}
                    {holdMinutes(selectedTrade) != null && (
                      <span className="px-2 py-0.5 rounded-lg text-xs"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }}>
                        {formatDuration(holdMinutes(selectedTrade), language)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-end">
                  <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('riskRewardLabel')}</div>
                  <div className="font-semibold text-white">{money(selectedTrade.risk || 0)} <span className="mx-1" style={{ color: 'rgba(255,255,255,0.2)' }}>/</span> {money(isLossTrade(selectedTrade) ? lossAmount(selectedTrade) : winAmount(selectedTrade))}</div>
                </div>
                <div className="text-end">
                  <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('plannedRR')}</div>
                  <div className="font-mono font-semibold text-white">{selectedTrade.rr ? `${selectedTrade.rr}R` : '-'}</div>
                </div>
                {/* Planlanan hedefin yanında gerçekten olan. */}
                {realizedR(selectedTrade) != null && (
                  <div className="text-end">
                    <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('realizedR')}</div>
                    <div className="font-mono font-semibold" style={{ color: (realizedR(selectedTrade) as number) >= 0 ? '#34d399' : '#f87171' }}>
                      {formatR(realizedR(selectedTrade))}
                    </div>
                  </div>
                )}
                <div className="px-4 py-1.5 rounded-full text-sm font-semibold" style={{
                  background: isWin ? 'rgba(52,211,153,0.1)' : isLoss ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
                  border: isWin ? '1px solid rgba(52,211,153,0.2)' : isLoss ? '1px solid rgba(248,113,113,0.2)' : '1px solid rgba(251,191,36,0.2)',
                  color: isWin ? '#34d399' : isLoss ? '#f87171' : '#fbbf24',
                }}>
                  {isOpenTrade(selectedTrade) ? t('incompleteTrade') : getResultText(selectedTrade.result)}
                </div>
              </div>
            </div>

            {/* ── NOTlar ve FOTOĞRAFLAR ── */}
            <div className="p-5 space-y-8" style={{ background: 'rgba(255,255,255,0.01)' }}>

              {/* Multi Timeframe Analiz & Checklist */}
              {((selectedTrade.mtfAnalysis?.length ?? 0) > 0 || (selectedTrade.checklist?.length ?? 0) > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {(selectedTrade.mtfAnalysis?.length ?? 0) > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {language === 'tr' ? 'Multi Timeframe Analiz' : 'Multi-Timeframe Analysis'}
                      </h4>
                      <MTFAnalysisView entries={selectedTrade.mtfAnalysis!} />
                    </div>
                  )}
                  {(selectedTrade.checklist?.length ?? 0) > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Checklist
                        <span className="ms-2 font-mono" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {selectedTrade.checklist!.filter(i => i.checked).length}/{selectedTrade.checklist!.length}
                        </span>
                      </h4>
                      <ChecklistView items={selectedTrade.checklist!} />
                    </div>
                  )}
                </div>
              )}

              {/* İşlem Öncesi */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('preTrade')}</h4>
                <p className="text-sm whitespace-pre-wrap leading-relaxed p-4 rounded-xl"
                  style={{ color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {selectedTrade.preTradeNotes || <span style={{ color: 'rgba(255,255,255,0.25)' }}>{t('noNotes')}</span>}
                </p>
                {selectedTrade.preTradePhotos?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTrade.preTradePhotos.map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxPhoto(photo)}
                        className="rounded-xl overflow-hidden hover:opacity-90 transition-opacity w-full"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '16/9' }}
                      >
                        <img src={photo} alt={`Pre-trade ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* İşlem Sonrası */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('postTrade')}</h4>
                <p className="text-sm whitespace-pre-wrap leading-relaxed p-4 rounded-xl"
                  style={{ color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {selectedTrade.postTradeNotes || <span style={{ color: 'rgba(255,255,255,0.25)' }}>{t('noNotes')}</span>}
                </p>
                {selectedTrade.postTradePhotos?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTrade.postTradePhotos.map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxPhoto(photo)}
                        className="rounded-xl overflow-hidden hover:opacity-90 transition-opacity w-full"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '16/9' }}
                      >
                        <img src={photo} alt={`Post-trade ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </>
    );
  }

  // ── TRADE LIST ─────────────────────────────────────────────────────────────
  if (trades.length === 0) {
    return (
      <div className="text-center py-20 rounded-2xl" style={card}>
        <Target className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
        <h3 className="text-lg font-medium text-white">{t('emptyTitle')}</h3>
        <p className="mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('emptyDesc')}</p>
      </div>
    );
  }

  const sortedTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const groupedTrades = sortedTrades.reduce((acc, trade) => {
    const monthYear = getMonthYear(trade.date);
    const dayDate = getDayDate(trade.date);
    if (!acc[monthYear]) acc[monthYear] = {};
    if (!acc[monthYear][dayDate]) acc[monthYear][dayDate] = [];
    acc[monthYear][dayDate].push(trade);
    return acc;
  }, {} as Record<string, Record<string, Trade[]>>);


  return (
    <div className="space-y-6">
      {movePicker}
      <div className="flex items-center justify-between">
        <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm transition-all"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}>
          {selectedIds.size > 0
            ? <CheckSquare className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            : <Square className="w-4 h-4" />}
          <span>{selectedIds.size === trades.length && trades.length > 0
            ? (language === 'tr' ? 'Tümünü Kaldır' : 'Deselect All')
            : (language === 'tr' ? 'Tümünü Seç' : 'Select All')}</span>
          {/* Kısmi seçimde kaç tane olduğunu söyle. */}
          {selectedIds.size > 0 && selectedIds.size < trades.length && (
            <span className="text-[13px]" style={{ color: '#a78bfa' }}>
              · {selectedIds.size} {language === 'tr' ? 'seçili' : 'selected'}
            </span>
          )}
        </button>

        {selectedIds.size > 0 && canMove && (
          <button onClick={() => setMovingIds(Array.from(selectedIds))}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ms-auto me-3"
            style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}>
            <FolderInput className="w-4 h-4" />
            {selectedIds.size} {language === 'tr' ? 'işlemi taşı' : 'trades — move'}
          </button>
        )}

        {selectedIds.size > 0 && (
          <button onClick={handleDeleteSelected}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'; }}>
            <Trash2 className="w-4 h-4" />
            {selectedIds.size} {language === 'tr' ? 'işlemi sil' : 'trades delete'}
          </button>
        )}
      </div>

      {Object.entries(groupedTrades).map(([monthYear, days]) => (
        <div key={monthYear} className="space-y-6">
          <div className="pb-2" style={{ borderBottom: '2px solid rgba(255,255,255,0.15)' }}>
            <h2 className="text-2xl font-semibold capitalize tracking-tight text-white">{monthYear}</h2>
          </div>
          <div className="space-y-8">
            {Object.entries(days).map(([dayDate, dayTrades]) => (
              <div key={dayDate} className="space-y-1">
                <h3 className="text-base font-medium ps-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{dayDate}</h3>
                {dayTrades.map(trade => {
                  const isW = trade.result === 'Başarılı' || trade.result === 'Manuel Karda';
                  const isL = trade.result === 'Başarısız' || trade.result === 'Manuel Zararda';
                  const isSelected = selectedIds.has(trade.id);

                  return (
                    <div key={trade.id}
                      className="group flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer relative"
                      style={{
                        color: 'rgba(255,255,255,0.8)',
                        background: isSelected ? 'rgba(139,92,246,0.08)' : 'transparent',
                        border: isSelected ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      onClick={() => openOverlay(() => setSelectedTrade(trade))}
                    >
                      {/* Kutu her zaman görünür. Saydam bırakılınca kimse tek
                          tek seçebildiğini fark etmiyordu. */}
                      <div onClick={e => toggleSelect(trade.id, e)}
                        className="flex-shrink-0 -m-1.5 p-1.5 rounded-md transition-colors"
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                        {isSelected
                          ? <CheckSquare className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                          : <Square className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.22)' }} />}
                      </div>
                      {/* Saat: gün başlığı hangi gün olduğunu söylüyor, bu da
                          günün neresinde olduğunu. Satırdaki boşluğu da doldurur. */}
                      <span className="hidden sm:inline w-12 font-mono text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {new Date(trade.date).toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="w-20 sm:w-24 font-medium">{trade.symbol}</span>
                      <span className="w-10 sm:w-14 text-sm font-medium" style={{ color: trade.type === 'Buy' ? '#34d399' : '#f87171' }}>
                        {trade.type === 'Buy' ? t('buy') : t('sell')}
                      </span>
                      {trade.setup && (
                        <span className="hidden md:block text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>
                          {trade.setup}
                        </span>
                      )}
                      {(() => {
                        const r = realizedR(trade);
                        return (
                          <span className="w-16 sm:w-20 font-mono text-sm text-end" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {r == null ? '' : formatR(r)}
                          </span>
                        );
                      })()}
                      <span className="ms-auto text-end font-mono font-medium" style={{ color: isW ? '#34d399' : isL ? '#f87171' : 'rgba(255,255,255,0.4)' }}>
                        {isW ? signedMoney(winAmount(trade))
                          : isL ? signedMoney(-lossAmount(trade))
                          : trade.result === 'Başa Baş' ? <span style={{ color: 'rgba(255,255,255,0.45)' }}>$0.00</span>
                          : <span className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap"
                              style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>
                              {t('incompleteTrade')}
                            </span>}
                      </span>

                      <div className="absolute end-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: '#1a1b2e', borderRadius: '8px', padding: '2px', border: '1px solid rgba(255,255,255,0.08)' }}
                        onClick={e => e.stopPropagation()}>
                        <button onClick={e => startEdit(trade, e)}
                          className="p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1"
                          style={{ color: '#a78bfa' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.15)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          title={language === 'tr' ? 'Düzenle' : 'Edit'}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); openOverlay(() => setSelectedTrade(trade)); }}
                          className="p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1"
                          style={{ color: 'rgba(255,255,255,0.5)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          title={language === 'tr' ? 'Detaylar' : 'Details'}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canMove && (
                          <button onClick={e => { e.stopPropagation(); setMovingIds([trade.id]); }}
                            className="p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            title={language === 'tr' ? "Başka journal'a taşı" : 'Move to another journal'}>
                            <FolderInput className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={e => { e.stopPropagation(); onDelete(trade.id); }}
                          className="p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1"
                          style={{ color: '#f87171' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.15)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          title={t('deleteTrade')}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

import React, { useState } from 'react';
import { Trade } from '../types';
import {
  ArrowUpRight, ArrowDownRight, Calendar, Target, Trash2,
  ChevronLeft, PieChart, DollarSign, TrendingUp, Activity,
  Award, AlertTriangle, Zap, TrendingDown, Edit2, Eye,
  CheckSquare, Square, X, Save
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

interface TradeHistoryProps {
  trades: Trade[];
  onDelete: (id: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  onUpdate?: (trade: Trade) => void;
  statsOnly?: boolean;
}

export default function TradeHistory({
  trades,
  onDelete,
  onDeleteMultiple,
  onUpdate,
  statsOnly = false
}: TradeHistoryProps) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [editForm, setEditForm] = useState<Partial<Trade>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showAi, setShowAi] = useState(false);
  const { t, language } = useLanguage();

  const card: React.CSSProperties = {
    background: '#1a1b2e',
    border: '1px solid rgba(255,255,255,0.07)',
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

  const SETUPS = ['FVG', 'OB', 'BOS / ChoCH', 'Liquidity Sweep', 'EQH / EQL', 'Breaker Block', 'Mitigation', 'VWAP', 'Trend Pullback', 'Range Breakout', 'Diğer'];
  const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'];

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
      setAiError('Analiz yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setAiLoading(false);
    }
  };

  const getResultText = (result: string) => {
    if (result === 'Başarılı') return t('winStatus');
    if (result === 'Başarısız') return t('lossStatus');
    if (result === 'Manuel Karda') return t('resultManualWin');
    if (result === 'Manuel Zararda') return t('resultManualLoss');
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
  const totalClosed = closedTrades.length;
  const winRate = totalClosed > 0 ? ((winningTrades.length / totalClosed) * 100).toFixed(1) : '0.0';
  const getLossAmount = (t: Trade) => (t.reward || 0) < 0 ? Math.abs(t.reward || 0) : (t.risk || 0);
  const grossProfit = winningTrades.reduce((sum, t) => sum + (t.reward || 0), 0);
  const grossLoss = losingTrades.reduce((sum, t) => sum + getLossAmount(t), 0);
  const netProfit = grossProfit - grossLoss;
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? '∞' : '0.00');
  const bestTrade = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.reward || 0)) : 0;
  const worstTrade = losingTrades.length > 0 ? Math.max(...losingTrades.map(getLossAmount)) : 0;
  const validRRs = closedTrades.map(t => parseFloat(t.rr)).filter(n => !isNaN(n));
  const avgRR = validRRs.length > 0 ? (validRRs.reduce((a, b) => a + b, 0) / validRRs.length).toFixed(2) : '0.00';
  const sortedByDate = [...closedTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData = sortedByDate.reduce((acc: any[], trade, index) => {
    const prevTotal = index > 0 ? acc[index - 1].cumulative : 0;
    const pnl = (trade.result === 'Başarılı' || trade.result === 'Manuel Karda') ? (trade.reward || 0) : -getLossAmount(trade);
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
    sortedByDate.forEach((trade, i) => {
      const isWin = trade.result === 'Başarılı' || trade.result === 'Manuel Karda';
      const tradeType: 'win' | 'loss' = isWin ? 'win' : 'loss';
      if (i === 0) { tempStreak = 1; tempType = tradeType; }
      else if (tradeType === tempType) { tempStreak++; }
      else {
        if (tempType === 'win') bestWin = Math.max(bestWin, tempStreak);
        else bestLoss = Math.max(bestLoss, tempStreak);
        tempStreak = 1; tempType = tradeType;
      }
      if (i === sortedByDate.length - 1) {
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
    const profit = st.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda').reduce((s, t) => s + (t.reward || 0), 0);
    const loss = st.filter(t => t.result === 'Başarısız' || t.result === 'Manuel Zararda').reduce((s, t) => s + (t.risk || 0), 0);
    return { session, rate: st.length > 0 ? ((wins / st.length) * 100).toFixed(0) : 0, total: st.length, pnl: profit - loss };
  });

  const getDayKey = (dateStr: string) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date(dateStr).getDay()];
  };

  const dayStats = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
    const dt = closedTrades.filter(t => getDayKey(t.date) === day);
    const wins = dt.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda').length;
    const profit = dt.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda').reduce((s, t) => s + (t.reward || 0), 0);
    const loss = dt.filter(t => t.result === 'Başarısız' || t.result === 'Manuel Zararda').reduce((s, t) => s + (t.risk || 0), 0);
    return { day, rate: dt.length > 0 ? ((wins / dt.length) * 100).toFixed(0) : 0, total: dt.length, pnl: profit - loss };
  }).filter(d => d.total > 0);

  const setupStats = (() => {
    const map: Record<string, { wins: number; total: number; pnl: number }> = {};
    closedTrades.forEach(trade => {
      const key = trade.setup || 'Diğer';
      if (!map[key]) map[key] = { wins: 0, total: 0, pnl: 0 };
      map[key].total++;
      const isWin = trade.result === 'Başarılı' || trade.result === 'Manuel Karda';
      const isLoss = trade.result === 'Başarısız' || trade.result === 'Manuel Zararda';
      if (isWin) { map[key].wins++; map[key].pnl += (trade.reward || 0); }
      if (isLoss) { map[key].pnl -= getLossAmount(trade); }
    });
    return Object.entries(map).map(([setup, s]) => ({ setup, ...s, winRate: ((s.wins / s.total) * 100).toFixed(0) })).sort((a, b) => b.pnl - a.pnl);
  })();

  const symbolStats = (() => {
    const map: Record<string, { wins: number; total: number; pnl: number }> = {};
    closedTrades.forEach(trade => {
      const key = trade.symbol;
      if (!map[key]) map[key] = { wins: 0, total: 0, pnl: 0 };
      map[key].total++;
      const isWin = trade.result === 'Başarılı' || trade.result === 'Manuel Karda';
      const isLoss = trade.result === 'Başarısız' || trade.result === 'Manuel Zararda';
      if (isWin) { map[key].wins++; map[key].pnl += (trade.reward || 0); }
      if (isLoss) { map[key].pnl -= getLossAmount(trade); }
    });
    return Object.entries(map).map(([symbol, s]) => ({ symbol, ...s, winRate: ((s.wins / s.total) * 100).toFixed(0) })).sort((a, b) => b.pnl - a.pnl).slice(0, 8);
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
            const isW = t.result === 'Başarılı' || t.result === 'Manuel Karda';
            const isL = t.result === 'Başarısız' || t.result === 'Manuel Zararda';
            return s + (isW ? (t.reward || 0) : isL ? -getLossAmount(t) : 0);
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
    setEditingTrade(trade);
    setEditForm({ ...trade });
    setSelectedTrade(null);
  };

  const saveEdit = () => {
    if (!editingTrade || !onUpdate) return;
    onUpdate({ ...editingTrade, ...editForm } as Trade);
    setEditingTrade(null);
    setEditForm({});
  };

  // ── STATS ONLY ─────────────────────────────────────────────────────────────
  if (statsOnly) {
    if (trades.length === 0) {
      return (
        <div className="text-center py-20 rounded-2xl" style={{ background: '#1a1b2e', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <Target className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p style={{ color: 'rgba(255,255,255,0.35)' }}>{t('emptyDesc')}</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <PieChart className="w-4 h-4" />, label: t('winRate'), value: `%${winRate}`, color: '#fff' },
            { icon: <DollarSign className="w-4 h-4" />, label: t('netProfit'), value: `${netProfit >= 0 ? '+' : '-'}$${Math.abs(netProfit).toFixed(2)}`, color: netProfit >= 0 ? '#34d399' : '#f87171' },
            { icon: <TrendingUp className="w-4 h-4" />, label: t('profitFactor'), value: profitFactor, color: '#fff' },
            { icon: <Target className="w-4 h-4" />, label: t('avgRR'), value: `${avgRR}R`, color: '#fff' },
            { icon: <Activity className="w-4 h-4" />, label: t('totalTrades'), value: String(totalClosed), color: '#fff' },
            { icon: <Award className="w-4 h-4" />, label: t('bestTrade'), value: `+$${bestTrade.toFixed(2)}`, color: '#34d399' },
            { icon: <AlertTriangle className="w-4 h-4" />, label: t('worstTrade'), value: `-$${worstTrade.toFixed(2)}`, color: '#f87171' },
            { icon: <TrendingDown className="w-4 h-4" />, label: t('maxDrawdown'), value: `$${maxDrawdown.toFixed(2)}`, color: '#f87171' },
          ].map((s, i) => (
            <div key={i} style={statCard}>
              <div className="flex items-center gap-2 mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {s.icon}
                <span className="text-xs font-medium uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-2xl font-semibold font-mono" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={statCard}>
            <div className="flex items-center gap-2 mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <Zap className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">{t('currentStreak')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold font-mono" style={{ color: streak.currentType === 'win' ? '#34d399' : '#f87171' }}>{streak.current}</div>
              <div className="text-sm px-2 py-1 rounded-lg" style={{ background: streak.currentType === 'win' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: streak.currentType === 'win' ? '#34d399' : '#f87171' }}>
                {streak.currentType === 'win' ? t('winStatus') : t('lossStatus')}
              </div>
            </div>
          </div>
          <div style={statCard}>
            <div className="flex items-center gap-2 mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}><Award className="w-4 h-4" /><span className="text-xs font-medium uppercase tracking-wider">{t('bestWinStreak')}</span></div>
            <div className="text-3xl font-bold font-mono" style={{ color: '#34d399' }}>{streak.bestWin}</div>
          </div>
          <div style={statCard}>
            <div className="flex items-center gap-2 mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}><AlertTriangle className="w-4 h-4" /><span className="text-xs font-medium uppercase tracking-wider">{t('bestLossStreak')}</span></div>
            <div className="text-3xl font-bold font-mono" style={{ color: '#f87171' }}>{streak.bestLoss}</div>
          </div>
        </div>
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
                  <RechartsTooltip contentStyle={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} formatter={(value: number) => [`$${value.toFixed(2)}`, t('cumulativePnl')]} labelFormatter={label => `Trade #${label}`} />
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
                  <RechartsTooltip contentStyle={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} formatter={(value: number) => [`$${value.toFixed(2)}`, 'PnL']} labelFormatter={label => `Trade #${label}`} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
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
            <div className="text-sm font-mono" style={{ color: '#f87171' }}>{t('maxDrawdown')}: ${maxDrawdown.toFixed(2)}</div>
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
                <RechartsTooltip contentStyle={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} formatter={(value: number) => [`$${value.toFixed(2)}`, 'Drawdown']} labelFormatter={label => `Trade #${label}`} />
                <Area type="monotone" dataKey="drawdown" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorDrawdown)" />
              </AreaChart>
            </ResponsiveContainer>
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
                          title={cell.total > 0 ? `${cell.total} trade, $${cell.pnl.toFixed(2)}` : ''}>
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
                    <span className="text-xs font-mono w-16 text-end" style={{ color: pnl >= 0 ? '#34d399' : '#f87171' }}>{pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(0)}</span>
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
                    <span className="text-xs font-mono w-16 text-end" style={{ color: pnl >= 0 ? '#34d399' : '#f87171' }}>{pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(0)}</span>
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
                  <span className="text-xs font-mono w-12 text-end" style={{ color: pnl >= 0 ? '#34d399' : '#f87171' }}>{pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(0)}</span>
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
                  <span className="text-xs font-mono w-12 text-end" style={{ color: pnl >= 0 ? '#34d399' : '#f87171' }}>{pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(0)}</span>
                  <span className="text-sm font-semibold font-mono w-10 text-end text-white ms-2">%{rate}</span>
                </div>
              )) : <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('emptyDesc')}</p>}
            </div>
          </div>
        </div>
        <div style={{ ...statCard, padding: '20px' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>AI Analiz</span>
            </div>
            <button onClick={runAiAnalysis} disabled={aiLoading}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: 'rgba(255,255,255,0.5)' };
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <button onClick={() => setEditingTrade(null)}
  className="flex items-center gap-2 text-sm font-medium"
  style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}>
            <ChevronLeft className="w-4 h-4" />
            {language === 'tr' ? 'Geri' : 'Back'}
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => setEditingTrade(null)} className="px-4 py-2 text-sm rounded-xl"
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
              <label style={lbl}>{t('timeframe')}</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={editForm.timeframe || ''} onChange={e => setEditForm(f => ({ ...f, timeframe: e.target.value }))}>
                <option value="" style={{ background: '#1a1b2e' }}>—</option>
                {TIMEFRAMES.map(tf => <option key={tf} value={tf} style={{ background: '#1a1b2e' }}>{tf}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>{t('setup')}</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={editForm.setup || ''} onChange={e => setEditForm(f => ({ ...f, setup: e.target.value }))}>
                <option value="" style={{ background: '#1a1b2e' }}>—</option>
                {SETUPS.map(s => <option key={s} value={s} style={{ background: '#1a1b2e' }}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>{t('risk')}</label>
              <input type="number" step="0.01" style={inp} value={editForm.risk || ''} onChange={e => setEditForm(f => ({ ...f, risk: parseFloat(e.target.value) || 0 }))} placeholder="0.00" />
            </div>
            <div>
              <label style={lbl}>{t('reward')}</label>
              <input type="number" step="0.01" style={inp} value={editForm.reward || ''} onChange={e => setEditForm(f => ({ ...f, reward: parseFloat(e.target.value) || 0 }))} placeholder="0.00" />
            </div>
            <div>
              <label style={lbl}>{t('rr')}</label>
              <input type="number" step="0.01" style={inp} value={editForm.rr || ''} onChange={e => setEditForm(f => ({ ...f, rr: e.target.value }))} placeholder="2.5" />
            </div>
            <div>
              <label style={lbl}>{t('result')}</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={editForm.result || 'Başarılı'} onChange={e => setEditForm(f => ({ ...f, result: e.target.value as any }))}>
                <option value="Başarılı" style={{ background: '#1a1b2e' }}>{t('resultWin')}</option>
                <option value="Başarısız" style={{ background: '#1a1b2e' }}>{t('resultLoss')}</option>
                <option value="Manuel Karda" style={{ background: '#1a1b2e' }}>{t('resultManualWin')}</option>
                <option value="Manuel Zararda" style={{ background: '#1a1b2e' }}>{t('resultManualLoss')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={lbl}>{t('preTrade')} {t('notes')}</label>
              <textarea rows={4} style={{ ...inp, resize: 'none', padding: '10px' }}
                value={editForm.preTradeNotes || ''}
                onChange={e => setEditForm(f => ({ ...f, preTradeNotes: e.target.value }))}
                placeholder={t('preNotesPlaceholder')} />
            </div>
            <div>
              <label style={lbl}>{t('postTrade')} {t('notes')}</label>
              <textarea rows={4} style={{ ...inp, resize: 'none', padding: '10px' }}
                value={editForm.postTradeNotes || ''}
                onChange={e => setEditForm(f => ({ ...f, postTradeNotes: e.target.value }))}
                placeholder={t('postNotesPlaceholder')} />
            </div>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
         <button onClick={() => setSelectedTrade(null)}
  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
  style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            {t('backToList')}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={e => startEdit(selectedTrade, e)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all"
              style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}>
              <Edit2 className="w-4 h-4" />
              {language === 'tr' ? 'Düzenle' : 'Edit'}
            </button>
            <button onClick={() => { onDelete(selectedTrade.id); setSelectedTrade(null); }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all"
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
                {selectedTrade.type === 'Buy' ? <ArrowUpRight className="w-6 h-6 rtl:-scale-x-100" style={{ color: '#34d399' }} /> : <ArrowDownRight className="w-6 h-6 rtl:-scale-x-100" style={{ color: '#f87171' }} />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold text-white">{selectedTrade.symbol}</span>
                  {selectedTrade.timeframe && <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>{selectedTrade.timeframe}</span>}
                  {selectedTrade.setup && <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>{selectedTrade.setup}</span>}
                </div>
                <div className="flex items-center gap-1.5 text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Calendar className="w-4 h-4" />
                  {getFullDateTime(selectedTrade.date)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-end">
                <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('riskRewardLabel')}</div>
                <div className="font-semibold text-white">${selectedTrade.risk} <span className="mx-1" style={{ color: 'rgba(255,255,255,0.2)' }}>/</span> ${selectedTrade.reward}</div>
              </div>
              <div className="text-end">
                <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>R/R</div>
                <div className="font-mono font-semibold text-white">{selectedTrade.rr || '-'}</div>
              </div>
              <div className="px-4 py-1.5 rounded-full text-sm font-semibold" style={{
                background: isWin ? 'rgba(52,211,153,0.1)' : isLoss ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
                border: isWin ? '1px solid rgba(52,211,153,0.2)' : isLoss ? '1px solid rgba(248,113,113,0.2)' : '1px solid rgba(251,191,36,0.2)',
                color: isWin ? '#34d399' : isLoss ? '#f87171' : '#fbbf24',
              }}>
                {getResultText(selectedTrade.result)}
              </div>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('preTrade')}</h4>
              <p className="text-sm whitespace-pre-wrap leading-relaxed p-4 rounded-xl" style={{ color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {selectedTrade.preTradeNotes || <span style={{ color: 'rgba(255,255,255,0.25)' }}>{t('noNotes')}</span>}
              </p>
              {selectedTrade.preTradePhotos?.length > 0 && (
                <div className="flex gap-3">
                  {selectedTrade.preTradePhotos.map((photo, i) => (
                    <a key={i} href={photo} target="_blank" rel="noreferrer" className="w-20 h-20 rounded-lg overflow-hidden block hover:opacity-80 transition-opacity" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={photo} alt="Pre-trade" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('postTrade')}</h4>
              <p className="text-sm whitespace-pre-wrap leading-relaxed p-4 rounded-xl" style={{ color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {selectedTrade.postTradeNotes || <span style={{ color: 'rgba(255,255,255,0.25)' }}>{t('noNotes')}</span>}
              </p>
              {selectedTrade.postTradePhotos?.length > 0 && (
                <div className="flex gap-3">
                  {selectedTrade.postTradePhotos.map((photo, i) => (
                    <a key={i} href={photo} target="_blank" rel="noreferrer" className="w-20 h-20 rounded-lg overflow-hidden block hover:opacity-80 transition-opacity" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={photo} alt="Post-trade" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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

  const getRRDisplay = (trade: Trade) => {
    if (!trade.rr) return '';
    const rrNum = parseFloat(trade.rr);
    if (isNaN(rrNum)) return `${trade.rr}R`;
    const isWin = trade.result === 'Başarılı' || trade.result === 'Manuel Karda';
    const isLoss = trade.result === 'Başarısız' || trade.result === 'Manuel Zararda';
    if (isWin) return `+${Math.abs(rrNum).toFixed(2)}R`;
    if (isLoss) return `-${Math.abs(rrNum).toFixed(2)}R`;
    return `${trade.rr}R`;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Toplu işlem toolbar */}
      <div className="flex items-center justify-between">
        <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm transition-all"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}>
          {selectedIds.size === trades.length && trades.length > 0
            ? <CheckSquare className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            : <Square className="w-4 h-4" />}
          <span>{selectedIds.size === trades.length && trades.length > 0
            ? (language === 'tr' ? 'Tümünü Kaldır' : 'Deselect All')
            : (language === 'tr' ? 'Tümünü Seç' : 'Select All')}</span>
        </button>

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

      {/* Trade listesi */}
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
                      onClick={() => setSelectedTrade(trade)}
                    >
                      {/* Checkbox */}
                      <div onClick={e => toggleSelect(trade.id, e)} className="flex-shrink-0 transition-opacity"
                        style={{ opacity: isSelected ? 1 : 0 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; e.stopPropagation(); }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.opacity = '0'; }}>
                        {isSelected
                          ? <CheckSquare className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                          : <Square className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />}
                      </div>

                      <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>-</span>
                      <span className="w-20 sm:w-24 font-medium">{trade.symbol}</span>
                      <span className="w-10 sm:w-14 text-sm font-medium" style={{ color: trade.type === 'Buy' ? '#34d399' : '#f87171' }}>
                        {trade.type === 'Buy' ? t('buy') : t('sell')}
                      </span>
                      {trade.timeframe && (
                        <span className="hidden sm:block text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}>
                          {trade.timeframe}
                        </span>
                      )}
                      {trade.setup && (
                        <span className="hidden md:block text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>
                          {trade.setup}
                        </span>
                      )}
                      <span className="w-16 sm:w-20 font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{getRRDisplay(trade)}</span>
                      <span className="ms-auto text-end font-mono font-medium" style={{ color: isW ? '#34d399' : isL ? '#f87171' : 'rgba(255,255,255,0.4)' }}>
                        {isW ? `+${trade.reward}$` : isL ? `-${trade.risk}$` : <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('openStatus')}</span>}
                      </span>

                      {/* Hover aksiyon butonları */}
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
                        <button onClick={e => { e.stopPropagation(); setSelectedTrade(trade); }}
                          className="p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1"
                          style={{ color: 'rgba(255,255,255,0.5)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          title={language === 'tr' ? 'Detaylar' : 'Details'}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
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

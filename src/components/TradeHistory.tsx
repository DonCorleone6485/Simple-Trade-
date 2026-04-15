import React, { useState } from 'react';
import { Trade } from '../types';
import { ArrowUpRight, ArrowDownRight, Calendar, Target, Trash2, ChevronLeft, PieChart, DollarSign, TrendingUp, Activity, Award, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function TradeHistory({ trades, onDelete }: { trades: Trade[], onDelete: (id: string) => void }) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const { t, language } = useLanguage();

  if (trades.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200 shadow-sm">
        <Target className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-zinc-900">{t('emptyTitle')}</h3>
        <p className="text-zinc-500 mt-1">{t('emptyDesc')}</p>
      </div>
    );
  }

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

  if (selectedTrade) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedTrade(null)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          {t('backToList')}
        </button>
        
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${selectedTrade.type === 'Buy' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                {selectedTrade.type === 'Buy' ? <ArrowUpRight className="w-6 h-6 rtl:-scale-x-100" /> : <ArrowDownRight className="w-6 h-6 rtl:-scale-x-100" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-zinc-900">{selectedTrade.symbol}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-zinc-500 mt-1">
                  <Calendar className="w-4 h-4" />
                  {getFullDateTime(selectedTrade.date)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-end">
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{t('riskRewardLabel')}</div>
                <div className="font-semibold text-zinc-900">${selectedTrade.risk} <span className="text-zinc-300 mx-1">/</span> ${selectedTrade.reward}</div>
              </div>
              <div className="text-end">
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">R/R</div>
                <div className="font-mono font-semibold text-zinc-900">{selectedTrade.rr || '-'}</div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                (selectedTrade.result === 'Başarılı' || selectedTrade.result === 'Manuel Karda') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                (selectedTrade.result === 'Başarısız' || selectedTrade.result === 'Manuel Zararda') ? 'bg-rose-50 border-rose-200 text-rose-700' : 
                'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {getResultText(selectedTrade.result)}
              </div>
              <button
                onClick={() => {
                  onDelete(selectedTrade.id);
                  setSelectedTrade(null);
                }}
                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title={t('deleteTrade')}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-50/50">
            {/* Pre-trade */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                {t('preTrade')}
              </h4>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap bg-white p-4 rounded-xl border border-zinc-200 shadow-sm leading-relaxed">{selectedTrade.preTradeNotes}</p>
              {selectedTrade.preTradePhotos.length > 0 && (
                <div className="flex gap-3 mt-3">
                  {selectedTrade.preTradePhotos.map((photo, i) => (
                    <a key={i} href={photo} target="_blank" rel="noreferrer" className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 hover:opacity-80 transition-opacity shadow-sm block">
                      <img src={photo} alt="Pre-trade" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Post-trade */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                {t('postTrade')}
              </h4>
              {selectedTrade.postTradeNotes ? (
                <p className="text-sm text-zinc-700 whitespace-pre-wrap bg-white p-4 rounded-xl border border-zinc-200 shadow-sm leading-relaxed">{selectedTrade.postTradeNotes}</p>
              ) : (
                <p className="text-sm text-zinc-400 italic p-4">{t('noNotes')}</p>
              )}
              {selectedTrade.postTradePhotos.length > 0 && (
                <div className="flex gap-3 mt-3">
                  {selectedTrade.postTradePhotos.map((photo, i) => (
                    <a key={i} href={photo} target="_blank" rel="noreferrer" className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 hover:opacity-80 transition-opacity shadow-sm block">
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

  // Group trades
  const sortedTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedTrades = sortedTrades.reduce((acc, trade) => {
    const monthYear = getMonthYear(trade.date);
    const dayDate = getDayDate(trade.date);

    if (!acc[monthYear]) {
      acc[monthYear] = {};
    }
    if (!acc[monthYear][dayDate]) {
      acc[monthYear][dayDate] = [];
    }
    acc[monthYear][dayDate].push(trade);
    return acc;
  }, {} as Record<string, Record<string, Trade[]>>);

  const getRRDisplay = (trade: Trade) => {
    if (!trade.rr) return '';
    if (trade.rr.startsWith('+') || trade.rr.startsWith('-')) return `${trade.rr}R`;
    if (trade.result === 'Başarılı' || trade.result === 'Manuel Karda') return `+${trade.rr}R`;
    if (trade.result === 'Başarısız' || trade.result === 'Manuel Zararda') return `-${trade.rr}R`;
    return `${trade.rr}R`;
  };

  // Calculate Statistics
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

  // Chart Data
  const chartData = [...closedTrades]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc: any[], trade, index) => {
      const prevTotal = index > 0 ? acc[index - 1].cumulative : 0;
      const pnl = (trade.result === 'Başarılı' || trade.result === 'Manuel Karda') 
        ? (trade.reward || 0) 
        : -getLossAmount(trade);
      
      acc.push({
        name: index + 1,
        date: getDayDate(trade.date),
        pnl: pnl,
        cumulative: prevTotal + pnl,
        isWin: pnl >= 0
      });
      return acc;
    }, []);

  // Advanced Stats: Sessions
  const getSession = (dateStr: string) => {
    const hour = new Date(dateStr).getUTCHours();
    if (hour >= 22 || hour < 7) return 'asianSession';
    if (hour >= 7 && hour < 12) return 'londonSession';
    return 'nySession';
  };

  const sessionStats = ['asianSession', 'londonSession', 'nySession'].map(session => {
    const sessionTrades = closedTrades.filter(t => getSession(t.date) === session);
    const wins = sessionTrades.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda').length;
    const total = sessionTrades.length;
    const rate = total > 0 ? ((wins / total) * 100).toFixed(0) : 0;
    return { session, rate, total };
  });

  // Advanced Stats: Days
  const getDayKey = (dateStr: string) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date(dateStr).getDay()];
  };

  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayStats = allDays.map(day => {
    const dayTrades = closedTrades.filter(t => getDayKey(t.date) === day);
    const wins = dayTrades.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda').length;
    const total = dayTrades.length;
    const rate = total > 0 ? ((wins / total) * 100).toFixed(0) : 0;
    return { day, rate, total };
  }).filter(d => d.total > 0); // Only show days that have trades

  return (
    <div className="space-y-12 max-w-3xl mx-auto">
      {Object.entries(groupedTrades).map(([monthYear, days]) => (
        <div key={monthYear} className="space-y-6">
          <div className="border-b-2 border-zinc-800 pb-2 inline-block">
            <h2 className="text-2xl font-semibold text-zinc-900 capitalize tracking-tight">{monthYear}</h2>
          </div>
          
          <div className="space-y-8">
            {Object.entries(days).map(([dayDate, dayTrades]) => (
              <div key={dayDate} className="space-y-3">
                <h3 className="text-lg font-medium text-zinc-800 tracking-tight ps-2">{dayDate}</h3>
                <div className="space-y-1">
                  {dayTrades.map(trade => (
                    <div 
                      key={trade.id} 
                      onClick={() => setSelectedTrade(trade)}
                      className="flex items-center gap-4 sm:gap-8 p-3 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer text-base sm:text-lg font-medium text-zinc-800 group"
                    >
                      <span className="text-zinc-400 font-mono">-</span>
                      <span className="w-20 sm:w-24">{trade.symbol}</span>
                      <span className="w-12 sm:w-16">{trade.type === 'Buy' ? t('buy') : t('sell')}</span>
                      <span className="w-16 sm:w-20">{getRRDisplay(trade)}</span>
                      <span className="ms-auto text-end w-24">
                        {(trade.result === 'Başarılı' || trade.result === 'Manuel Karda') ? `${(trade.reward || 0) < 0 ? '' : '+'}${trade.reward}$` : 
                         (trade.result === 'Başarısız' || trade.result === 'Manuel Zararda') ? ((trade.reward || 0) < 0 ? `${trade.reward}$` : `-${trade.risk}$`) : 
                         <span className="text-sm text-zinc-400 font-normal">{t('openStatus')}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Statistics Section */}
      {closedTrades.length > 0 && (
        <div className="mt-16 pt-8 border-t border-zinc-200">
          <h3 className="text-xl font-semibold text-zinc-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-zinc-500" />
            {t('statsTitle')}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <PieChart className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{t('winRate')}</span>
              </div>
              <div className="text-2xl font-semibold text-zinc-900 font-mono">
                %{winRate}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{t('netProfit')}</span>
              </div>
              <div className={`text-2xl font-semibold font-mono ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toFixed(2)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{t('profitFactor')}</span>
              </div>
              <div className="text-2xl font-semibold text-zinc-900 font-mono">
                {profitFactor}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{t('avgRR')}</span>
              </div>
              <div className="text-2xl font-semibold text-zinc-900 font-mono">
                {avgRR}R
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{t('totalTrades')}</span>
              </div>
              <div className="text-2xl font-semibold text-zinc-900 font-mono">
                {totalClosed}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Award className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{t('bestTrade')}</span>
              </div>
              <div className="text-2xl font-semibold text-emerald-600 font-mono">
                +${bestTrade.toFixed(2)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{t('worstTrade')}</span>
              </div>
              <div className="text-2xl font-semibold text-rose-600 font-mono">
                -${worstTrade.toFixed(2)}
              </div>
            </div>

          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Cumulative PnL Chart */}
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm lg:col-span-2">
              <h4 className="text-sm font-semibold text-zinc-900 mb-6 uppercase tracking-wider">{t('cumulativePnl')}</h4>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={netProfit >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={netProfit >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dy={10} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value}`} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, t('cumulativePnl')]}
                      labelFormatter={(label) => `Trade #${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke={netProfit >= 0 ? '#10b981' : '#f43f5e'} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCumulative)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trade by Trade PnL Chart */}
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
              <h4 className="text-sm font-semibold text-zinc-900 mb-6 uppercase tracking-wider">{t('tradePnl')}</h4>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dy={10} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'PnL']}
                      labelFormatter={(label) => `Trade #${label}`}
                      cursor={{ fill: '#f4f4f5' }}
                    />
                    <Bar dataKey="pnl" radius={[4, 4, 4, 4]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isWin ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Advanced Stats: Sessions & Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            
            {/* Session Stats */}
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
              <h4 className="text-sm font-semibold text-zinc-900 mb-4 uppercase tracking-wider">{t('sessionStats')}</h4>
              <div className="space-y-4">
                {sessionStats.map(({ session, rate, total }) => (
                  <div key={session} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700 w-24">
                      {t(session as any)} <span className="text-xs text-zinc-400 font-normal">({total})</span>
                    </span>
                    <div className="flex-1 mx-4 flex items-center">
                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${rate}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 w-10 text-end font-mono">
                      %{rate}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day Stats */}
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
              <h4 className="text-sm font-semibold text-zinc-900 mb-4 uppercase tracking-wider">{t('dayStats')}</h4>
              <div className="space-y-4">
                {dayStats.length > 0 ? dayStats.map(({ day, rate, total }) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700 w-24">
                      {t(day as any)} <span className="text-xs text-zinc-400 font-normal">({total})</span>
                    </span>
                    <div className="flex-1 mx-4 flex items-center">
                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${rate}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 w-10 text-end font-mono">
                      %{rate}
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-zinc-500 italic">{t('emptyDesc')}</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Trade } from '../types';
import { ArrowUpRight, ArrowDownRight, Calendar, Target, Trash2, ChevronLeft, PieChart, DollarSign, TrendingUp, Activity, Award, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function TradeHistory({ trades, onDelete }: { trades: Trade[], onDelete: (id: string) => void }) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const { t, language } = useLanguage();

  const card: React.CSSProperties = { background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' };

  if (trades.length === 0) {
    return (
      <div className="text-center py-20 rounded-2xl" style={card}>
        <Target className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
        <h3 className="text-lg font-medium text-white">{t('emptyTitle')}</h3>
        <p className="mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('emptyDesc')}</p>
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
    const isWin = selectedTrade.result === 'Başarılı' || selectedTrade.result === 'Manuel Karda';
    const isLoss = selectedTrade.result === 'Başarısız' || selectedTrade.result === 'Manuel Zararda';
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedTrade(null)} className="flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          {t('backToList')}
        </button>

        <div className="rounded-2xl overflow-hidden" style={card}>
          {/* Detail Header */}
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
                <span className="text-lg font-bold text-white">{selectedTrade.symbol}</span>
                <div className="flex items-center gap-1.5 text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Calendar className="w-4 h-4" />
                  {getFullDateTime(selectedTrade.date)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
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
              <button onClick={() => { onDelete(selectedTrade.id); setSelectedTrade(null); }} className="p-2 rounded-lg transition-all" style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                title={t('deleteTrade')}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('preTrade')}</h4>
              <p className="text-sm whitespace-pre-wrap leading-relaxed p-4 rounded-xl" style={{ color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {selectedTrade.preTradeNotes}
              </p>
              {selectedTrade.preTradePhotos.length > 0 && (
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
              {selectedTrade.postTradeNotes ? (
                <p className="text-sm whitespace-pre-wrap leading-relaxed p-4 rounded-xl" style={{ color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {selectedTrade.postTradeNotes}
                </p>
              ) : (
                <p className="text-sm italic p-4" style={{ color: 'rgba(255,255,255,0.25)' }}>{t('noNotes')}</p>
              )}
              {selectedTrade.postTradePhotos.length > 0 && (
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
    if (trade.rr.startsWith('+') || trade.rr.startsWith('-')) return `${trade.rr}R`;
    if (trade.result === 'Başarılı' || trade.result === 'Manuel Karda') return `+${trade.rr}R`;
    if (trade.result === 'Başarısız' || trade.result === 'Manuel Zararda') return `-${trade.rr}R`;
    return `${trade.rr}R`;
  };

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

  const chartData = [...closedTrades]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc: any[], trade, index) => {
      const prevTotal = index > 0 ? acc[index - 1].cumulative : 0;
      const pnl = (trade.result === 'Başarılı' || trade.result === 'Manuel Karda') ? (trade.reward || 0) : -getLossAmount(trade);
      acc.push({ name: index + 1, date: getDayDate(trade.date), pnl, cumulative: prevTotal + pnl, isWin: pnl >= 0 });
      return acc;
    }, []);

  const getSession = (dateStr: string) => {
    const hour = new Date(dateStr).getUTCHours();
    if (hour >= 22 || hour < 7) return 'asianSession';
    if (hour >= 7 && hour < 12) return 'londonSession';
    return 'nySession';
  };

  const sessionStats = ['asianSession', 'londonSession', 'nySession'].map(session => {
    const st = closedTrades.filter(t => getSession(t.date) === session);
    const wins = st.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda').length;
    return { session, rate: st.length > 0 ? ((wins / st.length) * 100).toFixed(0) : 0, total: st.length };
  });

  const getDayKey = (dateStr: string) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date(dateStr).getDay()];
  };

  const dayStats = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => {
    const dt = closedTrades.filter(t => getDayKey(t.date) === day);
    const wins = dt.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda').length;
    return { day, rate: dt.length > 0 ? ((wins / dt.length) * 100).toFixed(0) : 0, total: dt.length };
  }).filter(d => d.total > 0);

  const statCard: React.CSSProperties = { ...card, padding: '16px' };

  return (
    <div className="space-y-12 max-w-3xl mx-auto">
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
                  return (
                    <div
                      key={trade.id}
                      onClick={() => setSelectedTrade(trade)}
                      className="flex items-center gap-4 sm:gap-8 p-3 rounded-xl transition-all cursor-pointer text-base sm:text-lg font-medium"
                      style={{ color: 'rgba(255,255,255,0.8)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>-</span>
                      <span className="w-20 sm:w-24">{trade.symbol}</span>
                      <span className="w-12 sm:w-16" style={{ color: trade.type === 'Buy' ? '#34d399' : '#f87171' }}>
                        {trade.type === 'Buy' ? t('buy') : t('sell')}
                      </span>
                      <span className="w-16 sm:w-20 font-mono text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{getRRDisplay(trade)}</span>
                      <span className="ms-auto text-end w-24 font-mono" style={{ color: isW ? '#34d399' : isL ? '#f87171' : 'rgba(255,255,255,0.4)' }}>
                        {isW ? `${(trade.reward || 0) < 0 ? '' : '+'}${trade.reward}$` :
                         isL ? ((trade.reward || 0) < 0 ? `${trade.reward}$` : `-${trade.risk}$`) :
                         <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('openStatus')}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Statistics */}
      {closedTrades.length > 0 && (
        <div className="mt-16 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
            {t('statsTitle')}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <PieChart className="w-4 h-4" />, label: t('winRate'), value: `%${winRate}`, color: '#fff' },
              { icon: <DollarSign className="w-4 h-4" />, label: t('netProfit'), value: `${netProfit >= 0 ? '+' : '-'}$${Math.abs(netProfit).toFixed(2)}`, color: netProfit >= 0 ? '#34d399' : '#f87171' },
              { icon: <TrendingUp className="w-4 h-4" />, label: t('profitFactor'), value: profitFactor, color: '#fff' },
              { icon: <Target className="w-4 h-4" />, label: t('avgRR'), value: `${avgRR}R`, color: '#fff' },
              { icon: <Activity className="w-4 h-4" />, label: t('totalTrades'), value: totalClosed, color: '#fff' },
              { icon: <Award className="w-4 h-4" />, label: t('bestTrade'), value: `+$${bestTrade.toFixed(2)}`, color: '#34d399' },
              { icon: <AlertTriangle className="w-4 h-4" />, label: t('worstTrade'), value: `-$${worstTrade.toFixed(2)}`, color: '#f87171' },
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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div style={{ ...statCard, padding: '20px' }} className="lg:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('cumulativePnl')}</h4>
              <div className="h-72 w-full">
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
                    <RechartsTooltip
                      contentStyle={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, t('cumulativePnl')]}
                      labelFormatter={label => `Trade #${label}`}
                    />
                    <Area type="monotone" dataKey="cumulative" stroke={netProfit >= 0 ? '#10b981' : '#f43f5e'} strokeWidth={2} fillOpacity={1} fill="url(#colorCumulative)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ ...statCard, padding: '20px' }}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('tradePnl')}</h4>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 12 }} dy={10} />
                    <RechartsTooltip
                      contentStyle={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'PnL']}
                      labelFormatter={label => `Trade #${label}`}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
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

          {/* Session & Day Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div style={{ ...statCard, padding: '20px' }}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('sessionStats')}</h4>
              <div className="space-y-4">
                {sessionStats.map(({ session, rate, total }) => (
                  <div key={session} className="flex items-center justify-between">
                    <span className="text-sm font-medium w-24 text-white">
                      {t(session as any)} <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>({total})</span>
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, background: '#818cf8' }} />
                      </div>
                    </div>
                    <span className="text-sm font-semibold font-mono w-10 text-end text-white">%{rate}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...statCard, padding: '20px' }}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('dayStats')}</h4>
              <div className="space-y-4">
                {dayStats.length > 0 ? dayStats.map(({ day, rate, total }) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm font-medium w-24 text-white">
                      {t(day as any)} <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>({total})</span>
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, background: '#2dd4bf' }} />
                      </div>
                    </div>
                    <span className="text-sm font-semibold font-mono w-10 text-end text-white">%{rate}</span>
                  </div>
                )) : (
                  <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('emptyDesc')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

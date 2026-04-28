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
      acc.pus

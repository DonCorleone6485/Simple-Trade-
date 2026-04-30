import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Trade } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CalendarViewProps {
  trades: Trade[];
  onDelete: (id: string) => void;
}

export default function CalendarView({ trades, onDelete }: CalendarViewProps) {
  const { language, t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const getMonthLabel = () => {
    if (language === 'tr') return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(currentDate);
    if (language === 'fa') return new Intl.DateTimeFormat('fa-IR', { month: 'long', year: 'numeric' }).format(currentDate);
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);
  };

  const getDayKey = (day: number) => {
    const d = new Date(year, month, day);
    return d.toISOString().split('T')[0];
  };

  const getTradesForDay = (day: number) => {
    const key = getDayKey(day);
    return trades.filter(t => t.date.startsWith(key));
  };

  const getDayStats = (day: number) => {
    const dayTrades = getTradesForDay(day);
    if (dayTrades.length === 0) return null;
    const wins = dayTrades.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda');
    const losses = dayTrades.filter(t => t.result === 'Başarısız' || t.result === 'Manuel Zararda');
    const grossProfit = wins.reduce((s, t) => s + (t.reward || 0), 0);
    const grossLoss = losses.reduce((s, t) => s + (t.risk || 0), 0);
    const netPnL = grossProfit - grossLoss;
    return { total: dayTrades.length, netPnL, wins: wins.length, losses: losses.length };
  };

  const weekDays = language === 'tr'
    ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    : language === 'fa'
    ? ['دوش', 'سه', 'چهار', 'پنج', 'جمعه', 'شنبه', 'یکشنبه']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const selectedTrades = selectedDay
    ? trades.filter(t => t.date.startsWith(selectedDay))
    : [];

  const getResultText = (result: string) => {
    if (result === 'Başarılı') return t('winStatus');
    if (result === 'Başarısız') return t('lossStatus');
    if (result === 'Manuel Karda') return t('resultManualWin');
    if (result === 'Manuel Zararda') return t('resultManualLoss');
    return t('openStatus');
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(language === 'tr' ? 'tr-TR' : language === 'fa' ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  // Monthly summary
  const monthTrades = trades.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const monthWins = monthTrades.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda');
  const monthLosses = monthTrades.filter(t => t.result === 'Başarısız' || t.result === 'Manuel Zararda');
  const monthProfit = monthWins.reduce((s, t) => s + (t.reward || 0), 0);
  const monthLoss = monthLosses.reduce((s, t) => s + (t.risk || 0), 0);
  const monthNetPnL = monthProfit - monthLoss;
  const monthWinRate = monthTrades.length > 0 ? ((monthWins.length / monthTrades.length) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      {/* Monthly Summary Bar */}
      {monthTrades.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t('totalTrades'), value: String(monthTrades.length), color: '#fff' },
            { label: t('winRate'), value: `%${monthWinRate}`, color: '#fff' },
            { label: t('netProfit'), value: `${monthNetPnL >= 0 ? '+' : '-'}$${Math.abs(monthNetPnL).toFixed(2)}`, color: monthNetPnL >= 0 ? '#34d399' : '#f87171' },
            { label: t('bestDay'), value: (() => {
              const days: Record<string, number> = {};
              monthTrades.forEach(tr => {
                const key = tr.date.split('T')[0];
                const isW = tr.result === 'Başarılı' || tr.result === 'Manuel Karda';
                const isL = tr.result === 'Başarısız' || tr.result === 'Manuel Zararda';
                days[key] = (days[key] || 0) + (isW ? (tr.reward || 0) : isL ? -(tr.risk || 0) : 0);
              });
              const best = Math.max(...Object.values(days));
              return best > 0 ? `+$${best.toFixed(0)}` : '-';
            })(), color: '#34d399' },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
              <div className="text-xl font-semibold font-mono" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <h2 className="text-lg font-semibold capitalize text-white">{getMonthLabel()}</h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>

        {/* Week days */}
        <div className="grid grid-cols-7 px-4 pt-4">
          {weekDays.map(d => (
            <div key={d} className="text-center text-xs font-semibold pb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 px-4 pb-4">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const stats = getDayStats(day);
            const key = getDayKey(day);
            const isSelected = selectedDay === key;
            const isTodayDay = isToday(day);

            let bg = 'transparent';
            let border = '1px solid transparent';
            let textColor = 'rgba(255,255,255,0.3)';

            if (stats) {
              if (stats.netPnL > 0) {
                bg = isSelected ? 'rgba(52,211,153,0.25)' : 'rgba(52,211,153,0.1)';
                border = isSelected ? '1px solid rgba(52,211,153,0.6)' : '1px solid rgba(52,211,153,0.2)';
                textColor = '#34d399';
              } else if (stats.netPnL < 0) {
                bg = isSelected ? 'rgba(248,113,113,0.25)' : 'rgba(248,113,113,0.1)';
                border = isSelected ? '1px solid rgba(248,113,113,0.6)' : '1px solid rgba(248,113,113,0.2)';
                textColor = '#f87171';
              } else {
                bg = isSelected ? 'rgba(251,191,36,0.2)' : 'rgba(251,191,36,0.08)';
                border = isSelected ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(251,191,36,0.15)';
                textColor = '#fbbf24';
              }
            } else if (isTodayDay) {
              border = '1px solid rgba(234,179,8,0.4)';
              textColor = '#eab308';
            }

            return (
              <div
                key={day}
                onClick={() => stats ? setSelectedDay(isSelected ? null : key) : null}
                className="relative rounded-xl transition-all flex flex-col"
                style={{
                  background: bg,
                  border,
                  cursor: stats ? 'pointer' : 'default',
                  minHeight: '72px',
                  padding: '8px',
                }}
                onMouseEnter={e => { if (stats) (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                onMouseLeave={e => { if (stats) (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                <span className="text-sm font-semibold" style={{ color: textColor }}>
                  {day}
                </span>
                {stats && (
                  <div className="mt-auto space-y-0.5">
                    <div className="text-xs font-mono font-semibold" style={{ color: textColor }}>
                      {stats.netPnL >= 0 ? '+' : '-'}${Math.abs(stats.netPnL).toFixed(0)}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {stats.total} {t('tradeCount')}
                    </div>
                  </div>
                )}
                {isTodayDay && !stats && (
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: '#eab308' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Panel */}
      {selectedDay && selectedTrades.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <h3 className="font-semibold text-white">
                {new Intl.DateTimeFormat(
                  language === 'tr' ? 'tr-TR' : language === 'fa' ? 'fa-IR' : 'en-US',
                  { dateStyle: 'long' }
                ).format(new Date(selectedDay))}
              </h3>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {selectedTrades.length} {t('tradeCount')}
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-2 rounded-lg transition-all"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {selectedTrades.map(trade => {
              const isWin = trade.result === 'Başarılı' || trade.result === 'Manuel Karda';
              const isLoss = trade.result === 'Başarısız' || trade.result === 'Manuel Zararda';
              const pnl = isWin ? (trade.reward || 0) : isLoss ? -(trade.risk || 0) : 0;

              return (
                <div key={trade.id} className="px-6 py-4 flex items-center gap-6">
                  <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: isWin ? '#34d399' : isLoss ? '#f87171' : '#fbbf24' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">{trade.symbol}</span>
                      <span className="text-sm px-2 py-0.5 rounded-lg" style={{
                        background: trade.type === 'Buy' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                        color: trade.type === 'Buy' ? '#34d399' : '#f87171',
                      }}>
                        {trade.type}
                      </span>
                      {trade.timeframe && (
                        <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                          {trade.timeframe}
                        </span>
                      )}
                      {trade.setup && (
                        <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8' }}>
                          {trade.setup}
                        </span>
                      )}
                    </div>
                    <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {formatTime(trade.date)}
                      {trade.rr && <span className="ms-3 font-mono">{trade.rr}R</span>}
                    </div>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <div className="font-semibold font-mono" style={{ color: isWin ? '#34d399' : isLoss ? '#f87171' : '#fbbf24' }}>
                      {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {getResultText(trade.result)}
                    </div>
                  </div>
                  <button
                    onClick={() => { onDelete(trade.id); if (selectedTrades.length === 1) setSelectedDay(null); }}
                    className="p-2 rounded-lg transition-all flex-shrink-0"
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {trades.length === 0 && (
        <div className="text-center py-20 rounded-2xl" style={{ background: '#1a1b2e', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)' }}>{t('emptyDesc')}</p>
        </div>
      )}
    </div>
  );
}

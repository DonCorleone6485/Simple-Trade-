import React, { useState } from 'react';
import { localeOf, pct } from '../lib/appCopy';
import { aria } from '../lib/aria';
import { ChevronLeft, ChevronRight, X, Lock } from 'lucide-react';
import { Trade } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { usePlan } from '../context/PlanContext';
import { signedMoney } from '../lib/format';
import { isWinTrade, isLossTrade, lossAmount, winAmount, tradePnL, dayKey, isOpenTrade } from '../lib/tradeMath';


interface CalendarViewProps {
  trades: Trade[];
  onDelete: (id: string) => void;
  /**
   * Ücretsiz planın günlük hakkını aşıp kilitli kaydedilenler. Günün
   * rakamlarına girmiyorlar (sonuç gizli), ama o günde oldukları görünüyor.
   */
  lockedTrades?: Trade[];
}

export default function CalendarView({ trades, onDelete, lockedTrades = [] }: CalendarViewProps) {
  const { language, t } = useLanguage();
  const { askUpgrade } = usePlan();
  const lockedOn = (key: string) => lockedTrades.filter(tr => dayKey(tr.date) === key).length;
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
    return new Intl.DateTimeFormat(localeOf(language), { month: 'long', year: 'numeric' }).format(currentDate);
  };

  const getDayKey = (day: number) => {
  const y = year;
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
  };

  const getTradesForDay = (day: number) => {
    const key = getDayKey(day);
    return trades.filter(t => dayKey(t.date) === key);
  };

  /**
   * Günün özeti. Sonucu girilmiş işlemler ile hâlâ açık olanlar ayrı tutulur:
   * açık bir işlemin kâr/zararını bilemeyiz, onu sıfır sayıp "+$0" yazmak
   * "bugün başa baş kapattım" gibi okunur ve yanlış olur.
   */
  const getDayStats = (day: number) => {
    const dayTrades = getTradesForDay(day);
    if (dayTrades.length === 0) return null;
    const open = dayTrades.filter(isOpenTrade).length;
    const closed = dayTrades.length - open;
    const wins = dayTrades.filter(isWinTrade);
    const losses = dayTrades.filter(isLossTrade);
    const grossProfit = wins.reduce((s, t) => s + winAmount(t), 0);
    const grossLoss = losses.reduce((s, t) => s + lossAmount(t), 0);
    const netPnL = grossProfit - grossLoss;
    return { total: dayTrades.length, closed, open, netPnL, wins: wins.length, losses: losses.length };
  };

  const weekDays = language === 'tr'
    ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    : language === 'fa'
    ? ['دوش', 'سه', 'چهار', 'پنج', 'جمعه', 'شنبه', 'یکشنبه']
    // Diğer diller: haftanın günleri tarayıcının kendi yerel adlarıyla, Pazartesi'den başlayarak.
    // 1 Ocak 2024 bir Pazartesi.
    : Array.from({ length: 7 }, (_, i) =>
        new Intl.DateTimeFormat(localeOf(language), { weekday: 'short' }).format(new Date(2024, 0, 1 + i)));

  const selectedTrades = selectedDay
    ? trades.filter(t => dayKey(t.date) === selectedDay)
    : [];

  const getResultText = (result: string) => {
    if (result === 'Başarılı') return t('winStatus');
    if (result === 'Başarısız') return t('lossStatus');
    if (result === 'Manuel Karda') return t('resultManualWin');
    if (result === 'Manuel Zararda') return t('resultManualLoss');
    if (result === 'Başa Baş') return t('resultBreakeven');
    return t('openStatus');
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(localeOf(language), { hour: '2-digit', minute: '2-digit' });
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  // Monthly summary
  const monthTrades = trades.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const monthWins = monthTrades.filter(isWinTrade);
  const monthLosses = monthTrades.filter(isLossTrade);
  const monthProfit = monthWins.reduce((s, t) => s + winAmount(t), 0);
  const monthLoss = monthLosses.reduce((s, t) => s + lossAmount(t), 0);
  const monthNetPnL = monthProfit - monthLoss;
  // Başa baş işlemler oranın paydasına girmez.
  const monthDecided = monthWins.length + monthLosses.length;
  const monthWinRate = monthDecided > 0 ? ((monthWins.length / monthDecided) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-9">
      {/* Monthly Summary Bar */}
      {monthTrades.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 pb-9" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { label: t('totalTrades'), value: String(monthTrades.length), color: '#fff' },
            { label: t('winRate'), value: pct(monthWinRate, language), color: '#fff' },
            { label: t('netProfit'), value: signedMoney(monthNetPnL), color: monthNetPnL >= 0 ? '#34d399' : '#f87171' },
            { label: t('bestDay'), value: (() => {
              const days: Record<string, number> = {};
              monthTrades.forEach(tr => {
                const key = dayKey(tr.date);
                const isW = tr.result === 'Başarılı' || tr.result === 'Manuel Karda';
                const isL = tr.result === 'Başarısız' || tr.result === 'Manuel Zararda';
                days[key] = (days[key] || 0) + tradePnL(tr);
              });
              const best = Math.max(...Object.values(days));
              return best > 0 ? signedMoney(best, 0) : '-';
            })(), color: '#34d399' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-[11px] mb-2.5 uppercase tracking-[0.12em] truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
              <div className="font-mono text-[26px]" style={{ color: s.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={prevMonth}
            aria-label={aria('prevMonth', language)}
            className="ui-pill p-2 rounded-lg transition-all"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <h2 className="font-display text-[20px] capitalize text-white">{getMonthLabel()}</h2>
          <button
            onClick={nextMonth}
            aria-label={aria('nextMonth', language)}
            className="ui-pill p-2 rounded-lg transition-all"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>

        {/* Week days */}
        <div className="grid grid-cols-7 px-4 pt-4">
          {weekDays.map(d => (
            <div key={d} className="text-center text-xs font-semibold pb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
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
            const locked = lockedOn(key);

            let bg = 'transparent';
            let border = '1px solid transparent';
            let textColor = 'rgba(255,255,255,0.3)';

            if (stats && stats.closed === 0) {
              // Sadece açık işlem var: ne kâr ne zarar — beklemede.
              bg = isSelected ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.03)';
              border = '1px solid rgba(251,191,36,0.25)';
              textColor = '#fbbf24';
            } else if (stats) {
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
                onClick={() => stats ? setSelectedDay(isSelected ? null : key) : locked > 0 ? askUpgrade('locked') : null}
                /* Günün rengi kâr/zararı anlatıyor; onu altına boyamak
                   bilgiyi siler. Dokunulabilirliği renk yerine ince bir
                   altın halka söylüyor. */
                className="ui-cell relative rounded-xl flex flex-col"
                style={{
                  background: bg,
                  border,
                  cursor: stats || locked > 0 ? 'pointer' : 'default',
                  minHeight: '72px',
                  padding: '8px',
                }}
              >
                <span className="text-sm font-semibold" style={{ color: textColor }}>
                  {day}
                </span>
                {stats && (
                  <div className="mt-auto space-y-0.5">
                    {stats.closed > 0 && (
                      <div className="text-xs font-mono font-semibold" style={{ color: textColor }}>
                        {signedMoney(stats.netPnL, 0)}
                      </div>
                    )}
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {stats.closed > 0 && `${stats.closed} ${t('tradeCount')}`}
                      {stats.closed > 0 && stats.open > 0 && ' · '}
                      {stats.open > 0 && (
                        <span style={{ color: '#fbbf24' }}>{stats.open} {t('openShort')}</span>
                      )}
                    </div>
                  </div>
                )}
                {locked > 0 && (
                  <div className={`${stats ? 'mt-0.5' : 'mt-auto'} flex items-center gap-1 text-[11px]`} style={{ color: '#a78bfa' }}>
                    <Lock className="w-3 h-3" />
                    {t('lockedCountShort').replace('{n}', String(locked))}
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
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <h3 className="font-semibold text-white">
                {new Intl.DateTimeFormat(
                  localeOf(language),
                  { dateStyle: 'long' }
                ).format(new Date(selectedDay))}
              </h3>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {selectedTrades.length} {t('tradeCount')}
                {lockedOn(selectedDay) > 0 && (
                  <button onClick={() => askUpgrade('locked')} className="ms-2 inline-flex items-center gap-1" style={{ color: '#a78bfa' }}>
                    · <Lock className="w-3 h-3" /> {t('lockedCountShort').replace('{n}', String(lockedOn(selectedDay)))}
                  </button>
                )}
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              aria-label={aria('close', language)}
              className="link-gold p-2 rounded-lg transition-all"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {selectedTrades.map(trade => {
              const isWin = trade.result === 'Başarılı' || trade.result === 'Manuel Karda';
              const isLoss = trade.result === 'Başarısız' || trade.result === 'Manuel Zararda';
              const pnl = tradePnL(trade);

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
                        <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                          {trade.timeframe}
                        </span>
                      )}
                      {trade.setup && (
                        <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8' }}>
                          {trade.setup}
                        </span>
                      )}
                    </div>
                    <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {formatTime(trade.date)}
                      {trade.rr && <span className="ms-3 font-mono">{trade.rr}R</span>}
                    </div>
                  </div>
                  <div className="text-end flex-shrink-0">
                    {/* Açık işlemde tutar yok; "+$0.00" yazmak başa baş sanılır. */}
                    <div className="font-semibold font-mono" style={{ color: isWin ? '#34d399' : isLoss ? '#f87171' : '#fbbf24' }}>
                      {isOpenTrade(trade) ? '—' : signedMoney(pnl)}
                    </div>
                    <div className="text-xs mt-1" style={{ color: isOpenTrade(trade) ? '#fbbf24' : 'rgba(255,255,255,0.35)' }}>
                      {isOpenTrade(trade) ? t('incompleteTrade') : getResultText(trade.result)}
                    </div>
                  </div>
                  <button
                    onClick={() => { onDelete(trade.id); if (selectedTrades.length === 1) setSelectedDay(null); }}
                    aria-label={aria('deleteTrade', language)}
                    className="ui-pill ui-pill-danger p-2 rounded-lg transition-all flex-shrink-0"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
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
        <div className="text-center py-20 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>{t('emptyDesc')}</p>
        </div>
      )}
    </div>
  );
}

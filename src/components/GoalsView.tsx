import React, { useState } from 'react';
import { Trade, Account, JournalGoals } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Target, TrendingUp, DollarSign, Activity, Clock, AlertTriangle, CheckCircle, Edit3, Save, X } from 'lucide-react';

interface GoalsViewProps {
  trades: Trade[];
  account: Account;
  onUpdateGoals: (goals: JournalGoals) => void;
}

export default function GoalsView({ trades, account, onUpdateGoals }: GoalsViewProps) {
  const { t, language } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [goals, setGoals] = useState<JournalGoals>(account.goals || {});

  const card: React.CSSProperties = {
    background: '#1a1b2e',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '20px',
  };

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: '12px',
    padding: '8px 12px',
    width: '100%',
    outline: 'none',
    fontSize: '14px',
  };

  const lbl: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '6px',
    color: 'rgba(255,255,255,0.55)',
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTrades = trades.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const wins = monthTrades.filter(t => t.result === 'Başarılı' || t.result === 'Manuel Karda');
  const losses = monthTrades.filter(t => t.result === 'Başarısız' || t.result === 'Manuel Zararda');
  const grossProfit = wins.reduce((s, t) => s + (t.reward || 0), 0);
  const grossLoss = losses.reduce((s, t) => s + (t.risk || 0), 0);
  const monthlyPnL = grossProfit - grossLoss;
  const currentWinRate = monthTrades.length > 0 ? ((wins.length / monthTrades.length) * 100) : 0;

  const todayTrades = trades.filter(t => {
    const d = new Date(t.date);
    return d.toDateString() === now.toDateString();
  });

  const violations: string[] = [];

  if (goals.maxDailyTrades && todayTrades.length > goals.maxDailyTrades) {
    violations.push(`${t('maxDailyTradesViolation')} (${todayTrades.length}/${goals.maxDailyTrades})`);
  }

  if (goals.maxRiskPerTrade) {
    const overRiskTrades = monthTrades.filter(t => (t.risk || 0) > (goals.maxRiskPerTrade || 0));
    if (overRiskTrades.length > 0) {
      violations.push(`${t('maxRiskViolation')} (${overRiskTrades.length} ${t('tradeCount')})`);
    }
  }

  if (goals.noTradeHoursStart !== undefined && goals.noTradeHoursEnd !== undefined) {
    const noTradeViolations = monthTrades.filter(t => {
      const hour = new Date(t.date).getHours();
      if (goals.noTradeHoursStart! < goals.noTradeHoursEnd!) {
        return hour >= goals.noTradeHoursStart! && hour < goals.noTradeHoursEnd!;
      }
      return hour >= goals.noTradeHoursStart! || hour < goals.noTradeHoursEnd!;
    });
    if (noTradeViolations.length > 0) {
      violations.push(`${t('noTradeHoursViolation')} (${noTradeViolations.length} ${t('tradeCount')})`);
    }
  }

  const getMonthLabel = () => {
    if (language === 'tr') return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(now);
    if (language === 'fa') return new Intl.DateTimeFormat('fa-IR', { month: 'long', year: 'numeric' }).format(now);
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now);
  };

  const handleSave = () => {
    onUpdateGoals(goals);
    setEditing(false);
  };

  const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
    const pct = Math.min((value / max) * 100, 100);
    return (
      <div className="w-full h-2 rounded-full mt-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{t('goalsTitle')}</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{getMonthLabel()}</p>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: editing ? '#8b5cf6' : 'rgba(255,255,255,0.08)', color: '#fff' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = editing ? '#7c3aed' : 'rgba(255,255,255,0.12)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = editing ? '#8b5cf6' : 'rgba(255,255,255,0.08)'; }}
        >
          {editing ? <><Save className="w-4 h-4" /> {t('save')}</> : <><Edit3 className="w-4 h-4" /> {t('editGoals')}</>}
        </button>
      </div>

      {/* Kural ihlalleri */}
      {violations.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" style={{ color: '#f87171' }} />
            <span className="text-sm font-semibold" style={{ color: '#f87171' }}>{t('violations')}</span>
          </div>
          <div className="space-y-1">
            {violations.map((v, i) => (
              <p key={i} className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>• {v}</p>
            ))}
          </div>
        </div>
      )}

      {violations.length === 0 && Object.keys(account.goals || {}).length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" style={{ color: '#34d399' }} />
            <span className="text-sm font-semibold" style={{ color: '#34d399' }}>{t('noViolations')}</span>
          </div>
        </div>
      )}

      {/* Hedef Kartları */}
      {!editing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {goals.monthlyPnL ? (
            <div style={card}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{t('monthlyPnLGoal')}</span>
                </div>
                <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  ${monthlyPnL.toFixed(0)} / ${goals.monthlyPnL}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono mt-2" style={{ color: monthlyPnL >= goals.monthlyPnL ? '#34d399' : '#fff' }}>
                {monthlyPnL >= goals.monthlyPnL ? '✅' : ''} {((monthlyPnL / goals.monthlyPnL) * 100).toFixed(0)}%
              </div>
              <ProgressBar value={monthlyPnL} max={goals.monthlyPnL} color={monthlyPnL >= goals.monthlyPnL ? '#34d399' : '#8b5cf6'} />
            </div>
          ) : (
            <div style={{ ...card, border: '1px dashed rgba(255,255,255,0.1)' }} className="flex items-center justify-center">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>{t('noMonthlyPnLGoal')}</p>
            </div>
          )}

          {goals.winRate ? (
            <div style={card}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{t('winRateGoal')}</span>
                </div>
                <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  %{currentWinRate.toFixed(0)} / %{goals.winRate}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono mt-2" style={{ color: currentWinRate >= goals.winRate ? '#34d399' : '#fff' }}>
                {currentWinRate >= goals.winRate ? '✅' : ''} %{currentWinRate.toFixed(0)}
              </div>
              <ProgressBar value={currentWinRate} max={goals.winRate} color={currentWinRate >= goals.winRate ? '#34d399' : '#8b5cf6'} />
            </div>
          ) : (
            <div style={{ ...card, border: '1px dashed rgba(255,255,255,0.1)' }} className="flex items-center justify-center">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>{t('noWinRateGoal')}</p>
            </div>
          )}

          {goals.maxDailyTrades ? (
            <div style={card}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{t('maxDailyTrades')}</span>
                </div>
                <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {todayTrades.length} / {goals.maxDailyTrades}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono mt-2" style={{ color: todayTrades.length > goals.maxDailyTrades ? '#f87171' : '#34d399' }}>
                {todayTrades.length > goals.maxDailyTrades ? '⚠️' : '✅'} {todayTrades.length}
              </div>
              <ProgressBar
                value={todayTrades.length}
                max={goals.maxDailyTrades}
                color={todayTrades.length > goals.maxDailyTrades ? '#f87171' : '#34d399'}
              />
            </div>
          ) : (
            <div style={{ ...card, border: '1px dashed rgba(255,255,255,0.1)' }} className="flex items-center justify-center">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>{t('noMaxDailyTrades')}</p>
            </div>
          )}

          {goals.maxRiskPerTrade ? (
            <div style={card}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{t('maxRiskPerTrade')}</span>
                </div>
              </div>
              <div className="text-2xl font-bold font-mono mt-2 text-white">
                ${goals.maxRiskPerTrade}
              </div>
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {t('maxRiskDesc')}
              </p>
            </div>
          ) : (
            <div style={{ ...card, border: '1px dashed rgba(255,255,255,0.1)' }} className="flex items-center justify-center">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>{t('noMaxRisk')}</p>
            </div>
          )}
        </div>
      )}

      {/* Yasak Saatler */}
      {!editing && goals.noTradeHoursStart !== undefined && goals.noTradeHoursEnd !== undefined && (
        <div style={card}>
          <div className="flex items-center gap-2 mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">{t('noTradeHours')}</span>
          </div>
          <p className="text-lg font-semibold text-white">
            {String(goals.noTradeHoursStart).padStart(2, '0')}:00 — {String(goals.noTradeHoursEnd).padStart(2, '0')}:00
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('noTradeHoursDesc')}</p>
        </div>
      )}

      {/* Düzenleme Formu */}
      {editing && (
        <div style={card} className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">{t('editGoals')}</h3>
            <button onClick={() => setEditing(false)} style={{ color: 'rgba(255,255,255,0.4)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label style={lbl}>{t('monthlyPnLGoal')} ($)</label>
              <input
                type="number" min="0"
                value={goals.monthlyPnL || ''}
                onChange={e => setGoals({ ...goals, monthlyPnL: parseFloat(e.target.value) || undefined })}
                style={inp}
                placeholder="Örn: 500"
              />
            </div>
            <div>
              <label style={lbl}>{t('winRateGoal')} (%)</label>
              <input
                type="number" min="0" max="100"
                value={goals.winRate || ''}
                onChange={e => setGoals({ ...goals, winRate: parseFloat(e.target.value) || undefined })}
                style={inp}
                placeholder="Örn: 60"
              />
            </div>
            <div>
              <label style={lbl}>{t('maxDailyTrades')}</label>
              <input
                type="number" min="1"
                value={goals.maxDailyTrades || ''}
                onChange={e => setGoals({ ...goals, maxDailyTrades: parseInt(e.target.value) || undefined })}
                style={inp}
                placeholder="Örn: 3"
              />
            </div>
            <div>
              <label style={lbl}>{t('maxRiskPerTrade')} ($)</label>
              <input
                type="number" min="0"
                value={goals.maxRiskPerTrade || ''}
                onChange={e => setGoals({ ...goals, maxRiskPerTrade: parseFloat(e.target.value) || undefined })}
                style={inp}
                placeholder="Örn: 50"
              />
            </div>
            <div>
              <label style={lbl}>{t('noTradeHoursStart')}</label>
              <select
                value={goals.noTradeHoursStart ?? ''}
                onChange={e => setGoals({ ...goals, noTradeHoursStart: e.target.value !== '' ? parseInt(e.target.value) : undefined })}
                style={{ ...inp, cursor: 'pointer' }}
              >
                <option value="">— {t('notSet')} —</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} style={{ background: '#1a1b2e' }}>{String(i).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>{t('noTradeHoursEnd')}</label>
              <select
                value={goals.noTradeHoursEnd ?? ''}
                onChange={e => setGoals({ ...goals, noTradeHoursEnd: e.target.value !== '' ? parseInt(e.target.value) : undefined })}
                style={{ ...inp, cursor: 'pointer' }}
              >
                <option value="">— {t('notSet')} —</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} style={{ background: '#1a1b2e' }}>{String(i).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-semibold rounded-xl transition-all"
              style={{ background: '#8b5cf6', color: '#fff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}
            >
              {t('save')}
            </button>
          </div>
        </div>
      )}

      {/* Hedef yoksa */}
      {!editing && Object.keys(account.goals || {}).length === 0 && (
        <div className="text-center py-16 rounded-2xl" style={{ background: '#1a1b2e', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <Target className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="font-medium text-white mb-1">{t('noGoalsTitle')}</p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('noGoalsDesc')}</p>
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-2 text-sm font-semibold rounded-xl transition-all"
            style={{ background: '#8b5cf6', color: '#fff' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}
          >
            {t('editGoals')}
          </button>
        </div>
      )}
    </div>
  );
}

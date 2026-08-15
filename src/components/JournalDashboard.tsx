import React from 'react';
import { Plus, Trash2, ArrowUpRight } from 'lucide-react';
import { Account } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface JournalStats {
  total: number;
  winRate: string;
  netPnL: number;
  profitFactor: string;
}

interface JournalDashboardProps {
  accounts: Account[];
  getStats: (accountId: string) => JournalStats;
  formatDate: (date?: string) => string;
  onNewJournal: () => void;
  onOpen: (account: Account) => void;
  onDelete: (accountId: string) => void;
  userLabel?: string;
  /** Portal düzeninde başlık ve buton üst barda durur. */
  hideHeader?: boolean;
}

const money = (v: number) => `${v >= 0 ? '+' : '−'}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Sayı hücresi — sütunlar hizalı kalsın diye sabit genişlik ve tabular-nums. */
function Cell({ value, color = 'rgba(255,255,255,0.85)', width }: { value: string; color?: string; width: string }) {
  return (
    <div className={`${width} text-end font-mono text-[15px]`} style={{ color, fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </div>
  );
}

const COL = { trades: 'w-14', winRate: 'w-20', net: 'w-28 sm:w-32' };

function ColumnHead({ children, width, className = '' }: { children: React.ReactNode; width: string; className?: string }) {
  return (
    <div className={`${width} ${className} text-end text-[11px] uppercase tracking-[0.1em] whitespace-nowrap`} style={{ color: 'rgba(255,255,255,0.25)' }}>
      {children}
    </div>
  );
}

export default function JournalDashboard({
  accounts, getStats, formatDate, onNewJournal, onOpen, onDelete, userLabel, hideHeader = false,
}: JournalDashboardProps) {
  const { t, language } = useLanguage();

  const ordered = [...accounts].reverse();
  const totals = accounts.reduce(
    (acc, a) => {
      const s = getStats(a.id);
      return { trades: acc.trades + s.total, net: acc.net + s.netPnL };
    },
    { trades: 0, net: 0 }
  );

  const tr = (a: string, b: string) => (language === 'tr' ? a : b);

  return (
    <main className={hideHeader ? 'max-w-5xl' : 'max-w-5xl mx-auto px-6 sm:px-8 py-14 sm:py-20'}>

      {/* ── Başlık ── */}
      {!hideHeader && (
      <header className="flex items-end justify-between gap-6 flex-wrap mb-12 sm:mb-16">
        <div>
          <h1 className="font-display text-4xl sm:text-[2.75rem] leading-none font-medium"
            style={{ letterSpacing: '-0.02em' }}>
            {t('dashboardTitle')}
          </h1>
          {userLabel && (
            <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{userLabel}</p>
          )}
        </div>

        <button onClick={onNewJournal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
          style={{ background: '#8b5cf6', color: '#fff', transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
          <Plus className="w-4 h-4" />
          {t('newJournal')}
        </button>
      </header>
      )}

      {accounts.length > 0 ? (
        <>
          {/* ── Toplam özet ── */}
          <div className="flex items-baseline gap-10 sm:gap-16 mb-10 pb-10"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div className="text-[11px] uppercase tracking-[0.12em] mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {tr('Toplam Net', 'Net Total')}
              </div>
              <div className="font-mono text-3xl sm:text-4xl"
                style={{ color: totals.net >= 0 ? '#34d399' : '#f87171', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                {money(totals.net)}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.12em] mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t('tradeCount')}
              </div>
              <div className="font-mono text-3xl sm:text-4xl" style={{ color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                {totals.trades}
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-[11px] uppercase tracking-[0.12em] mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t('myJournals')}
              </div>
              <div className="font-mono text-3xl sm:text-4xl" style={{ color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                {accounts.length}
              </div>
            </div>
          </div>

          {/* ── Sütun başlıkları ── */}
          <div className="flex items-center gap-5 sm:gap-8 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex-1" />
            <div className="flex items-center gap-7 sm:gap-12">
              <ColumnHead width={COL.trades} className="hidden md:block">{t('tradeCount')}</ColumnHead>
              <ColumnHead width={COL.winRate} className="hidden sm:block">{t('winRate')}</ColumnHead>
              <ColumnHead width={COL.net}>{t('netProfit')}</ColumnHead>
            </div>
            <div className="w-8" />
          </div>

          {/* ── Journal listesi: kutu yok, satır ve ince ayraç ── */}
          <ul>
            {ordered.map((acc, i) => {
              const stats = getStats(acc.id);
              return (
                <li key={acc.id}
                  style={{ borderBottom: i === ordered.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
                  <div onClick={() => onOpen(acc)}
                    className="group flex items-center gap-5 sm:gap-8 py-6 cursor-pointer -mx-4 px-4 rounded-2xl"
                    style={{ transition: 'background 150ms cubic-bezier(0.4,0,0.2,1)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[17px] font-medium truncate" style={{ letterSpacing: '-0.01em' }}>{acc.name}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 flex-shrink-0"
                          style={{ color: 'rgba(255,255,255,0.35)', transition: 'opacity 150ms' }} />
                      </div>
                      <div className="text-[13px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {formatDate(acc.startDate)}
                        {acc.startingCapital != null && (
                          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {'  ·  '}${acc.startingCapital.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-7 sm:gap-12 flex-shrink-0">
                      <div className="hidden md:block"><Cell width={COL.trades} value={String(stats.total)} /></div>
                      <div className="hidden sm:block"><Cell width={COL.winRate} value={`%${stats.winRate}`} /></div>
                      <Cell width={COL.net} value={money(stats.netPnL)}
                        color={stats.netPnL >= 0 ? '#34d399' : '#f87171'} />
                    </div>

                    <button onClick={e => { e.stopPropagation(); onDelete(acc.id); }}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 flex-shrink-0 w-8"
                      style={{ color: 'rgba(255,255,255,0.25)', transition: 'all 150ms' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'; }}
                      title={t('delete')}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="py-24 text-center">
          <p className="font-display text-2xl mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {t('noJournals')}
          </p>
          <button onClick={onNewJournal}
            className="text-sm font-medium mt-2"
            style={{ color: '#a78bfa', transition: 'color 150ms' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c4b5fd'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#a78bfa'; }}>
            {t('newJournal')} →
          </button>
        </div>
      )}
    </main>
  );
}

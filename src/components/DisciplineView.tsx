import React from 'react';
import { Trade } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { analyseDiscipline, RuleKey } from '../lib/discipline';
import { signedMoney } from '../lib/format';

interface DisciplineViewProps {
  /** Kullanıcının bütün işlemleri — journal ayrımı olmadan. */
  trades: Trade[];
  journalCount: number;
}

const RULE_KEYS: Record<RuleKey, [string, string]> = {
  revenge: ['ruleRevenge', 'ruleRevengeDesc'],
  riskUp: ['ruleRiskUp', 'ruleRiskUpDesc'],
  overtrading: ['ruleOvertrading', 'ruleOvertradingDesc'],
  offHours: ['ruleOffHours', 'ruleOffHoursDesc'],
};

/** Bütün journal'lar birlikte: disiplin hesabın değil, kişinin özelliği. */
export default function DisciplineView({ trades, journalCount }: DisciplineViewProps) {
  const { t, language } = useLanguage();
  const tr = (a: string, b: string) => (language === 'tr' ? a : b);
  const report = analyseDiscipline(trades);

  const label: React.CSSProperties = {
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em',
    color: 'rgba(255,255,255,0.3)', marginBottom: '10px',
  };
  const lower = (s: string) => s.toLocaleLowerCase(language === 'tr' ? 'tr-TR' : 'en-US');

  return (
    <div className="max-w-3xl space-y-10">

      {/* ── Bu nedir ── */}
      <section>
        <p className="text-[15.5px] leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.72)' }}>
          {t('disciplineIntro1')}
        </p>
        <p className="text-[14.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {t('disciplineIntro2')}
        </p>
      </section>

      {/* ── Neden hepsi birlikte ── */}
      <section className="rounded-2xl p-5"
        style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.18)' }}>
        <div className="text-[14px] font-medium mb-2" style={{ color: '#a78bfa' }}>
          {t('disciplineAllJournals')}
          {journalCount > 1 && (
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
              {' · '}{journalCount} journal
            </span>
          )}
        </div>
        <p className="text-[13.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {t('disciplineWhyAll')}
        </p>
      </section>

      {/* ── Sonuç ── */}
      {report.flags.length === 0 ? (
        <p className="text-[14.5px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('disciplineNone')}</p>
      ) : (
        <>
          <section>
            <div className="flex flex-wrap gap-x-14 gap-y-6">
              {[
                { l: t('disciplineClean'), pnl: report.cleanPnL, n: report.cleanCount },
                { l: t('disciplineFlagged'), pnl: report.flaggedPnL, n: report.flaggedCount },
              ].map((b, i) => (
                <div key={i}>
                  <div style={label}>{b.l}</div>
                  <div className="font-mono text-[28px]"
                    style={{ color: b.pnl >= 0 ? '#34d399' : '#f87171', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                    {signedMoney(b.pnl)}
                  </div>
                  <div className="text-[11.5px] mt-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    {b.n} {lower(t('totalTrades'))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div style={label}>{tr('İşaretlenen alışkanlıklar', 'Habits flagged')}</div>
            <ul>
              {report.flags.map((f, i) => {
                const [titleKey, descKey] = RULE_KEYS[f.key];
                return (
                  <li key={f.key} className="flex items-start gap-5 py-4"
                    style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="font-mono text-[20px] w-9 flex-shrink-0 text-end"
                      style={{ color: '#fbbf24', fontVariantNumeric: 'tabular-nums' }}>
                      {f.trades.length}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-medium">{t(titleKey as any)}</div>
                      <p className="text-[13px] mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
                        {t(descKey as any)}
                      </p>
                    </div>
                    <span className="font-mono text-[15px] flex-shrink-0"
                      style={{ color: f.pnl >= 0 ? '#34d399' : '#f87171', fontVariantNumeric: 'tabular-nums' }}>
                      {signedMoney(f.pnl)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}

      <p className="text-[12.5px] leading-relaxed pt-2"
        style={{ color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '18px' }}>
        {t('disciplinePerJournal')}
      </p>
    </div>
  );
}

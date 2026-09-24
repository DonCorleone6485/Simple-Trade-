import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { Account, Trade } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { money, signedMoney } from '../lib/format';
import { propProgress, RuleState } from '../lib/propProgress';

/**
 * Prop hesabın tepesindeki sayaç.
 *
 * Tek bir soruya cevap veriyor: sınıra ne kadar kaldı. Prop hesabını
 * kaybettiren şey genellikle kötü bir işlem değil, o mesafeyi bilmemektir.
 *
 * Kâr hedefi doldukça yeşile döner — orada dolmak iyi bir şey. Kayıp
 * sınırları ise tam tersi: doldukça kızarır, çünkü orada dolmak hesabın
 * bitmesi demek. Aynı çubuk, iki zıt anlam; renk bunu ayırıyor.
 */

const GREEN = '#34d399';
const AMBER = '#fbbf24';
const RED = '#f87171';
const GOLD = '#f0b429';

/** Kayıp sınırında renk mesafeye göre: uzaksa yeşil, yaklaşınca sarı, aşınca kırmızı. */
const lossColor = (r: RuleState) =>
  r.breached ? RED : r.ratio >= 0.75 ? RED : r.ratio >= 0.5 ? AMBER : GREEN;

function Cell({ label, value, color, ratio, note }: {
  label: string; value: string; color: string; ratio: number; note?: string;
}) {
  return (
    <div className="flex-1 min-w-[150px]">
      <div className="text-[11px] uppercase tracking-[0.12em] mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {label}
      </div>
      <div className="font-mono text-2xl sm:text-3xl mb-3"
        style={{ color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {/* Çubuk bilgiyi tekrar etmiyor, mesafeyi görünür kılıyor: sayı okunmadan
          önce göz zaten ne kadar dolduğunu anlıyor. */}
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="h-full rounded-full"
          style={{ width: `${Math.round(ratio * 100)}%`, background: color, transition: 'width 0.3s ease' }} />
      </div>
      {note && (
        <div className="text-[11.5px] mt-2 font-mono" style={{ color: 'rgba(255,255,255,0.28)' }}>{note}</div>
      )}
    </div>
  );
}

export default function PropStatus({ account, trades }: { account: Account; trades: Trade[] }) {
  const { t } = useLanguage();
  const p = propProgress(account, trades);
  if (!p.target && !p.daily && !p.total) return null;

  return (
    <div className="mb-10 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      {(p.failed || p.passed) && (
        <div className="flex items-center gap-2.5 mb-6 px-4 py-3 rounded-xl text-[13.5px]"
          style={{
            background: p.failed ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)',
            border: `1px solid ${p.failed ? 'rgba(248,113,113,0.25)' : 'rgba(52,211,153,0.25)'}`,
            color: p.failed ? RED : GREEN,
          }}>
          {p.failed ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <Check className="w-4 h-4 flex-shrink-0" />}
          <span>{p.failed ? t('propFailed') : t('propPassed')}</span>
        </div>
      )}

      <div className="flex gap-8 sm:gap-14 flex-wrap">
        {p.target && (
          <Cell
            label={t('propLeftToTarget')}
            value={p.target.left <= 0 ? t('propReached') : money(p.target.left)}
            color={p.passed ? GREEN : GOLD}
            ratio={p.target.ratio}
            note={`${money(p.target.limit)} · ${signedMoney(p.netPnL)}`}
          />
        )}
        {p.daily && (
          <Cell
            label={t('propDailyLeft')}
            value={money(Math.max(0, p.daily.left))}
            color={lossColor(p.daily)}
            ratio={p.daily.ratio}
            note={`${money(p.daily.limit)} · ${t('propToday')} ${signedMoney(p.todayPnL)}`}
          />
        )}
        {p.total && (
          <Cell
            label={t('propTotalLeft')}
            value={money(Math.max(0, p.total.left))}
            color={lossColor(p.total)}
            ratio={p.total.ratio}
            note={p.floor != null ? `${t('propFloor')} ${money(p.floor)}` : undefined}
          />
        )}
      </div>

      {/* Bu satır süs değil. Şirketin ekranı açık pozisyonun anlık zararını da
          sayar, bizimki sayamaz; bunu yazmazsak kullanıcı kendini olduğundan
          güvende sanıp hesabı patlatabilir. */}
      <p className="text-[11.5px] mt-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.28)' }}>
        {t('propClosedOnly')}
      </p>
    </div>
  );
}

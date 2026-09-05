import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trade, Account } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { isWinTrade, isLossTrade, lossAmount, winAmount, tradePnL, holdMinutes, formatDuration } from '../lib/tradeMath';
import { MTF_TIMEFRAMES } from './MTFAnalysis';

interface PrintableReportProps {
  journal: Account;
  trades: Trade[];
  /** Tek işlem raporunda başlık ve özet sadeleşir. */
  single?: boolean;
  onDone: () => void;
}

const ink = {
  text: '#111',
  soft: '#555',
  faint: '#888',
  rule: '#ddd',
  win: '#0f7a4d',
  loss: '#b3261e',
};

const money = (v: number) =>
  `${v >= 0 ? '+' : '−'}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Yazdırma / PDF görünümü. Ekranda görünmez; @media print kuralları yalnızca
 * bu ağacı gösterir. Görseller yüklenmeden yazdırma açılırsa boş basılacağı
 * için önce hepsinin decode edilmesi beklenir.
 */
export default function PrintableReport({ journal, trades, single = false, onDone }: PrintableReportProps) {
  const { t, language } = useLanguage();
  const tr = (a: string, b: string) => (language === 'tr' ? a : b);

  const fmtDate = (d?: string) => {
    if (!d) return '-';
    const date = new Date(d);
    return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'medium' }).format(date);
  };
  const fmtDateTime = (d?: string) => {
    if (!d) return '-';
    const date = new Date(d);
    return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  };

  const ordered = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const wins = trades.filter(isWinTrade);
  const losses = trades.filter(isLossTrade);
  const decided = wins.length + losses.length;
  const winRate = decided > 0 ? ((wins.length / decided) * 100).toFixed(0) : '0';
  const grossProfit = wins.reduce((s, x) => s + winAmount(x), 0);
  const grossLoss = losses.reduce((s, x) => s + lossAmount(x), 0);
  const net = grossProfit - grossLoss;
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : '0.00';

  const resultText = (r: string) => {
    if (r === 'Başarılı') return t('winStatus');
    if (r === 'Başarısız') return t('lossStatus');
    if (r === 'Manuel Karda') return t('resultManualWin');
    if (r === 'Manuel Zararda') return t('resultManualLoss');
    if (r === 'Başa Baş') return t('resultBreakeven');
    return r;
  };
  const orderText = (o?: string) =>
    o === 'Market' ? t('orderMarket') : o === 'Limit' ? t('orderLimit') : o === 'Stop' ? t('orderStop') : '';
  const tfLabel = (code: string) => {
    const tf = MTF_TIMEFRAMES.find(x => x.code === code);
    return tf ? (language === 'tr' ? tf.tr : tf.en) : code;
  };
  const biasText = (b: string) =>
    b === 'bullish' ? 'Bullish' : b === 'bearish' ? 'Bearish' : tr('Konsolidasyon', 'Consolidation');

  // Görseller hazır olunca yazdırma penceresini aç.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const root = document.getElementById('print-root');
      const imgs = root ? Array.from(root.querySelectorAll('img')) : [];
      await Promise.all(
        imgs.map(img =>
          img.complete ? Promise.resolve() : new Promise<void>(res => {
            img.addEventListener('load', () => res(), { once: true });
            img.addEventListener('error', () => res(), { once: true });
          })
        )
      );
      if (cancelled) return;
      window.print();
      onDone();
    };
    const id = window.setTimeout(run, 120);
    return () => { cancelled = true; window.clearTimeout(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Belirgin başlıklı bölüm. */
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 18 }}>
      <h3 className="print-heading" style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px', color: ink.text }}>
        {title}
      </h3>
      {children}
    </div>
  );

  const Photos = ({ list }: { list: string[] }) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {list.map((src, i) => (
        // Sabit yükseklikli çerçeve: baskıda img'nin max-height'i yok sayılıyor,
        // görsel bir sayfayı yutuyordu.
        <div key={i} className="print-keep"
          style={{
            width: list.length === 1 ? '80%' : 'calc(50% - 4px)',
            height: '62mm',
            border: `1px solid ${ink.rule}`,
            borderRadius: 4,
            overflow: 'hidden',
          }}>
          <img src={src} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} />
        </div>
      ))}
    </div>
  );

  const report = (
    <div id="print-root" style={{ display: 'none', fontFamily: 'Inter, system-ui, sans-serif', color: ink.text, background: '#fff', padding: '0 4px' }}>
      {/* ── Başlık ── */}
      <div style={{ borderBottom: `2px solid ${ink.text}`, paddingBottom: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{journal.name}</div>
            <div style={{ fontSize: 11, color: ink.soft, marginTop: 3 }}>
              {single
                ? tr('İşlem Raporu', 'Trade Report')
                : `${tr('Journal Raporu', 'Journal Report')} · ${trades.length} ${tr('işlem', 'trades')}`}
              {journal.startDate ? ` · ${tr('Başlangıç', 'Start')}: ${fmtDate(journal.startDate)}` : ''}
              {journal.startingCapital != null ? ` · ${tr('Sermaye', 'Capital')}: $${journal.startingCapital.toLocaleString()}` : ''}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 10, color: ink.faint, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600, color: ink.soft }}>Simple Trading Journal</div>
            <div>{fmtDateTime(new Date().toISOString())}</div>
          </div>
        </div>
      </div>

      {/* ── Özet (yalnızca toplu raporda) ── */}
      {!single && (
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', paddingBottom: 16, marginBottom: 18, borderBottom: `1px solid ${ink.rule}` }}>
          {[
            { l: t('totalTrades'), v: String(trades.length), c: ink.text },
            { l: t('winRate'), v: `%${winRate}`, c: ink.text },
            { l: t('netProfit'), v: money(net), c: net >= 0 ? ink.win : ink.loss },
            { l: t('profitFactor'), v: profitFactor, c: ink.text },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: ink.faint, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: s.c, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── İşlemler ── */}
      {ordered.map((trade, idx) => {
        const win = isWinTrade(trade);
        const loss = isLossTrade(trade);
        const pnl = tradePnL(trade);
        const pre = trade.preTradePhotos || [];
        const post = trade.postTradePhotos || [];

        const facts: [string, string][] = [
          [t('symbol'), `${trade.symbol} · ${trade.type === 'Buy' ? t('buy') : t('sell')}`],
          [t('reportEntry'), fmtDateTime(trade.date)],
          ...(trade.exitDate ? [[t('reportExit'), fmtDateTime(trade.exitDate)] as [string, string]] : []),
          ...(holdMinutes(trade) != null ? [[t('tradeDuration'), formatDuration(holdMinutes(trade), language)] as [string, string]] : []),
          ...(trade.orderType ? [[t('orderType'), orderText(trade.orderType)] as [string, string]] : []),
          ...(trade.setup ? [[t('setup'), trade.setup] as [string, string]] : []),
          [t('risk'), `$${(trade.risk || 0).toLocaleString()}`],
          [
            win ? t('reward') : loss ? t('lossAmountLabel') : t('rewardOrLossLabel'),
            `$${(win ? winAmount(trade) : loss ? lossAmount(trade) : 0).toLocaleString()}`,
          ],
          [t('rr'), trade.rr || '-'],
          [t('result'), resultText(trade.result)],
        ];

        return (
          <div key={trade.id} className={!single && idx > 0 ? 'print-new-page' : undefined}
            style={{ marginBottom: single ? 0 : 26 }}>

            {/* Başlık şeridi */}
            <div className="print-keep" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, borderBottom: `1px solid ${ink.rule}`, paddingBottom: 8, marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                {t('reportTradeDetails')}
              </h2>
              <span style={{ fontSize: 15, fontWeight: 700, color: win ? ink.win : loss ? ink.loss : ink.soft, fontVariantNumeric: 'tabular-nums' }}>
                {pnl === 0 ? '$0.00' : money(pnl)}
              </span>
            </div>

            {/* Künye — madde madde */}
            <ul className="print-keep" style={{ listStyle: 'none', padding: 0, margin: '0 0 18px' }}>
              {facts.map(([label, value]) => (
                <li key={label} style={{ display: 'flex', gap: 8, fontSize: 12, lineHeight: 1.75 }}>
                  <span style={{ color: ink.faint }}>•</span>
                  <span style={{ color: ink.faint, minWidth: 130 }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </li>
              ))}
            </ul>

            {/* Checklist */}
            {trade.checklist && trade.checklist.length > 0 && (
              <Section title={`Checklist  (${trade.checklist.filter(c => c.checked).length}/${trade.checklist.length})`}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {trade.checklist.map(item => (
                    <li key={item.id} className="print-keep" style={{ fontSize: 12, lineHeight: 1.7, marginBottom: 3 }}>
                      <span style={{ marginInlineEnd: 7 }}>{item.checked ? '☑' : '☐'}</span>
                      <span style={{ color: item.checked ? ink.text : ink.soft }}>{item.title}</span>
                      {item.desc && <div style={{ fontSize: 11, color: ink.faint, marginInlineStart: 20 }}>{item.desc}</div>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Multi timeframe analiz */}
            {trade.mtfAnalysis && trade.mtfAnalysis.length > 0 && (
              <Section title={tr('Multi Timeframe Analiz', 'Multi-Timeframe Analysis')}>
                {trade.mtfAnalysis.map(e => (
                  <div key={e.timeframe} className="print-keep" style={{ fontSize: 12, marginBottom: 7 }}>
                    <span style={{ fontWeight: 600 }}>{e.timeframe}</span>
                    <span style={{ color: ink.faint }}> ({tfLabel(e.timeframe)})</span>
                    <span style={{ marginInlineStart: 8, fontWeight: 500, color: e.bias === 'bullish' ? ink.win : e.bias === 'bearish' ? ink.loss : ink.soft }}>
                      {biasText(e.bias)}
                    </span>
                    {e.notes && <div style={{ color: ink.soft, marginTop: 2, lineHeight: 1.6 }}>{e.notes}</div>}
                  </div>
                ))}
              </Section>
            )}

            {/* İşlem öncesi açıklamalar */}
            {trade.preTradeNotes && (
              <Section title={t('reportPreNotes')}>
                <p style={{ fontSize: 12, color: ink.soft, whiteSpace: 'pre-wrap', lineHeight: 1.65, margin: 0 }}>{trade.preTradeNotes}</p>
              </Section>
            )}

            {/* İşlem öncesi fotoğraflar */}
            {pre.length > 0 && (
              <Section title={t('reportPrePhotos')}>
                <Photos list={pre} />
              </Section>
            )}

            {/* İşlem sonrası açıklamalar */}
            {trade.postTradeNotes && (
              <Section title={t('reportPostNotes')}>
                <p style={{ fontSize: 12, color: ink.soft, whiteSpace: 'pre-wrap', lineHeight: 1.65, margin: 0 }}>{trade.postTradeNotes}</p>
              </Section>
            )}

            {/* İşlem sonrası fotoğraflar */}
            {post.length > 0 && (
              <Section title={t('reportPostPhotos')}>
                <Photos list={post} />
              </Section>
            )}
          </div>
        );
      })}

      {ordered.length === 0 && (
        <div style={{ fontSize: 12, color: ink.faint }}>{t('emptyDesc')}</div>
      )}
    </div>
  );

  // Uygulama ağacının dışına basılır; @media print yalnızca bunu gösterir.
  return createPortal(report, document.body);
}

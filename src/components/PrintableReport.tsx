import React, { useEffect } from 'react';
import { Trade, Account } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { isWinTrade, isLossTrade, lossAmount, winAmount, tradePnL } from '../lib/tradeMath';
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

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <tr>
      <td style={{ padding: '3px 14px 3px 0', color: ink.faint, fontSize: 11, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{label}</td>
      <td style={{ padding: '3px 0', fontSize: 12, verticalAlign: 'top' }}>{value}</td>
    </tr>
  );

  return (
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
        const photos = [...(trade.preTradePhotos || []), ...(trade.postTradePhotos || [])];
        return (
          <div key={trade.id}
            className="print-break"
            style={{ paddingBottom: 18, marginBottom: 18, borderBottom: single ? 'none' : `1px solid ${ink.rule}` }}>

            {/* Satır başlığı */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{trade.symbol}</span>
                <span style={{ fontSize: 12, color: ink.soft, marginInlineStart: 8 }}>
                  {trade.type === 'Buy' ? t('buy') : t('sell')}
                  {trade.orderType ? ` · ${orderText(trade.orderType)}` : ''}
                  {trade.setup ? ` · ${trade.setup}` : ''}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: win ? ink.win : loss ? ink.loss : ink.soft, fontVariantNumeric: 'tabular-nums' }}>
                  {pnl === 0 ? '$0.00' : money(pnl)}
                </div>
                <div style={{ fontSize: 10, color: ink.faint }}>{resultText(trade.result)}</div>
              </div>
            </div>

            {/* Künye */}
            <table style={{ borderCollapse: 'collapse', marginBottom: photos.length || trade.preTradeNotes || trade.postTradeNotes ? 10 : 0 }}>
              <tbody>
                <Row label={t('dateTime')} value={fmtDateTime(trade.date)} />
                <Row label={t('risk')} value={`$${(trade.risk || 0).toLocaleString()}`} />
                <Row label={win ? t('reward') : loss ? t('lossAmountLabel') : t('rewardOrLossLabel')}
                  value={`$${(win ? winAmount(trade) : loss ? lossAmount(trade) : 0).toLocaleString()}`} />
                <Row label={t('rr')} value={trade.rr || '-'} />
              </tbody>
            </table>

            {/* Checklist */}
            {trade.checklist && trade.checklist.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: ink.faint, marginBottom: 5 }}>
                  Checklist ({trade.checklist.filter(c => c.checked).length}/{trade.checklist.length})
                </div>
                {trade.checklist.map(item => (
                  <div key={item.id} style={{ fontSize: 11, marginBottom: 2 }}>
                    <span style={{ marginInlineEnd: 6 }}>{item.checked ? '☑' : '☐'}</span>
                    <span style={{ color: item.checked ? ink.text : ink.soft }}>{item.title}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Multi timeframe analiz */}
            {trade.mtfAnalysis && trade.mtfAnalysis.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: ink.faint, marginBottom: 5 }}>
                  {tr('Multi Timeframe Analiz', 'Multi-Timeframe Analysis')}
                </div>
                {trade.mtfAnalysis.map(e => (
                  <div key={e.timeframe} style={{ fontSize: 11, marginBottom: 4 }}>
                    <b>{e.timeframe}</b>
                    <span style={{ color: ink.faint }}> ({tfLabel(e.timeframe)})</span>
                    <span style={{ marginInlineStart: 6, color: e.bias === 'bullish' ? ink.win : e.bias === 'bearish' ? ink.loss : ink.soft }}>
                      {biasText(e.bias)}
                    </span>
                    {e.notes && <div style={{ color: ink.soft, marginTop: 1 }}>{e.notes}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Notlar */}
            {(trade.preTradeNotes || trade.postTradeNotes) && (
              <div style={{ display: 'flex', gap: 20, marginBottom: photos.length ? 10 : 0 }}>
                {trade.preTradeNotes && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: ink.faint, marginBottom: 4 }}>{t('preTrade')}</div>
                    <div style={{ fontSize: 11, color: ink.soft, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{trade.preTradeNotes}</div>
                  </div>
                )}
                {trade.postTradeNotes && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: ink.faint, marginBottom: 4 }}>{t('postTrade')}</div>
                    <div style={{ fontSize: 11, color: ink.soft, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{trade.postTradeNotes}</div>
                  </div>
                )}
              </div>
            )}

            {/* Fotoğraflar */}
            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {photos.map((src, i) => (
                  <img key={i} src={src} alt=""
                    style={{ width: photos.length === 1 ? '100%' : 'calc(50% - 4px)', maxHeight: 260, objectFit: 'contain', border: `1px solid ${ink.rule}`, borderRadius: 4 }} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {ordered.length === 0 && (
        <div style={{ fontSize: 12, color: ink.faint }}>{t('emptyDesc')}</div>
      )}
    </div>
  );
}

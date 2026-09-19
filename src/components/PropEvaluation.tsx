import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Plus, X, Printer, Ban, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  PROP_CRITERIA, PROP_MIN_SCORE, bandFor, propPack, DetailBlock, PropCriterion,
} from '../lib/prop';

const MAX_FIRMS = 3;
const STORAGE_KEY = 'propEvaluation';

interface Firm {
  name: string;
  /** Madde id'si → seçilen seçeneğin sırası. */
  answers: Record<string, number>;
}

const emptyFirm = (n: number): Firm => ({ name: '', answers: {} });

/** **kalın** işaretlerini çizer; metinler veri dosyasında böyle yazılıyor. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} style={{ color: '#fff', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </>
  );
}

function Detail({ blocks }: { blocks: DetailBlock[] }) {
  return (
    <div className="space-y-3.5">
      {blocks.map((b, i) => {
        if ('h' in b) {
          return (
            <h4 key={i} className="text-[12px] font-semibold uppercase tracking-[0.12em] pt-1"
              style={{ color: '#a78bfa' }}>{b.h}</h4>
          );
        }
        if ('ul' in b) {
          return (
            <ul key={i} className="space-y-1.5">
              {b.ul.map((item, j) => (
                <li key={j} className="flex gap-2.5 text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>
                  <span><RichText text={item} /></span>
                </li>
              ))}
            </ul>
          );
        }
        if ('table' in b) {
          return (
            <div key={i} className="overflow-x-auto">
              <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse', minWidth: '420px' }}>
                <thead>
                  <tr>
                    {b.table.head.map((h, j) => (
                      <th key={j} className="text-start font-medium py-2 pe-4 whitespace-nowrap"
                        style={{ color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.table.rows.map((row, j) => (
                    <tr key={j}>
                      {row.map((cell, k) => (
                        <td key={k} className="py-2 pe-4 align-top"
                          style={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <RichText text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={i} className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <RichText text={b.p} />
          </p>
        );
      })}
    </div>
  );
}

export default function PropEvaluation() {
  const { language, t } = useLanguage();
  /** O dilin madde metinleri; dil değişince bileşen kendiliğinden yeniden çizilir. */
  const copy = propPack(language);
  const band = (score: number) => {
    const b = bandFor(score);
    return b.label[language] || b.label.en;
  };

  const [firms, setFirms] = useState<Firm[]>([emptyFirm(0)]);
  /** "Bende olamaz" işaretlenen seçenekler: `madde:seçenek`. */
  const [redLines, setRedLines] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);

  // Hesaba hiçbir şey yazmıyoruz; tarayıcıda tutmamızın tek sebebi sekme
  // yanlışlıkla kapandığında 12 maddenin baştan doldurulmaması.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved?.firms) && saved.firms.length > 0) setFirms(saved.firms.slice(0, MAX_FIRMS));
      if (Array.isArray(saved?.redLines)) setRedLines(saved.redLines);
    } catch { /* bozuk kayıt: boş formla devam */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ firms, redLines })); } catch { /* önemsiz */ }
  }, [firms, redLines]);

  const setAnswer = (firmIndex: number, criterionId: string, optionIndex: number) => {
    setFirms(prev => prev.map((f, i) =>
      i === firmIndex ? { ...f, answers: { ...f.answers, [criterionId]: optionIndex } } : f));
  };

  const setName = (firmIndex: number, name: string) => {
    setFirms(prev => prev.map((f, i) => (i === firmIndex ? { ...f, name } : f)));
  };

  const addFirm = () => setFirms(prev => (prev.length >= MAX_FIRMS ? prev : [...prev, emptyFirm(prev.length)]));
  const removeFirm = (i: number) => setFirms(prev => (prev.length === 1 ? prev : prev.filter((_, j) => j !== i)));

  const toggleRedLine = (key: string) =>
    setRedLines(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));

  const reset = () => {
    if (!window.confirm(t('propClearConfirm'))) return;
    setFirms([emptyFirm(0)]);
    setRedLines([]);
  };

  /** Puan, cevaplanan madde sayısı ve çiğnenen kırmızı çizgiler. */
  const results = useMemo(() => firms.map(firm => {
    let score = 0;
    let answered = 0;
    const broken: PropCriterion[] = [];
    for (const c of PROP_CRITERIA) {
      const pick = firm.answers[c.id];
      if (pick == null || c.points[pick] == null) continue;
      answered++;
      score += c.points[pick];
      if (redLines.includes(`${c.id}:${pick}`)) broken.push(c);
    }
    return { score: Math.round(score * 100) / 100, answered, broken };
  }), [firms, redLines]);

  const complete = results.every(r => r.answered === PROP_CRITERIA.length);

  /** İki firmanın ayrıştığı maddeler, farkı en büyük olandan başlayarak. */
  const gaps = useMemo(() => {
    if (firms.length < 2) return [];
    return PROP_CRITERIA.map(c => {
      const points = firms.map(f => {
        const pick = f.answers[c.id];
        return pick != null && c.points[pick] != null ? c.points[pick] : null;
      });
      const known = points.filter((p): p is number => p != null);
      if (known.length < 2) return null;
      const gap = Math.max(...known) - Math.min(...known);
      return gap > 0 ? { criterion: c, points, gap } : null;
    }).filter(Boolean).sort((a, b) => b!.gap - a!.gap).slice(0, 4) as
      { criterion: PropCriterion; points: (number | null)[]; gap: number }[];
  }, [firms]);

  const best = useMemo(() => {
    const usable = results
      .map((r, i) => ({ ...r, i }))
      .filter(r => r.answered > 0 && r.broken.length === 0);
    if (usable.length === 0) return null;
    return usable.reduce((a, b) => (b.score > a.score ? b : a));
  }, [results]);

  const firmLabel = (i: number) => firms[i].name.trim() || `${t('propFirm')} ${String.fromCharCode(65 + i)}`;

  const card: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '18px',
  };

  const cols = `minmax(0,1fr) repeat(${firms.length}, 62px) 34px`;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-display text-[24px] mb-3" style={{ letterSpacing: '-0.02em' }}>
          {t('propReviewTitle')}
        </h2>
        <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {t('propReviewIntro')}
        </p>
      </div>

      {/* ── Firmalar ── */}
      <div className="rounded-2xl p-5" style={card}>
        <div className="flex flex-wrap items-end gap-3">
          {firms.map((f, i) => (
            <div key={i} className="relative">
              <label className="block text-[11px] uppercase tracking-[0.14em] mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t('propFirm')} {String.fromCharCode(65 + i)}
              </label>
              <div className="flex items-center gap-1.5">
                <input value={f.name} onChange={e => setName(i, e.target.value)}
                  placeholder={t('propFirmName')}
                  className="px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '170px' }} />
                {firms.length > 1 && (
                  <button type="button" onClick={() => removeFirm(i)} title={t('propRemove')}
                    className="p-1.5 rounded-lg" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {firms.length < MAX_FIRMS && (
            <button type="button" onClick={addFirm}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
              <Plus className="w-4 h-4" />
              {firms.length === 1 ? t('propCompare') : t('propOneMore')}
            </button>
          )}
        </div>
      </div>

      {/* ── Maddeler ── */}
      <div className="space-y-4">
        {PROP_CRITERIA.map((c, index) => {
          const open = openId === c.id;
          return (
            <div key={c.id} className="rounded-2xl overflow-hidden" style={card}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex gap-3 min-w-0">
                    <span className="font-display flex-shrink-0" style={{ fontSize: '19px', color: 'rgba(255,255,255,0.2)', lineHeight: 1.3 }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[16px] font-medium" style={{ letterSpacing: '-0.01em' }}>
                        {copy[c.id].title}
                        <span className="ms-2 text-[12px] font-normal" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {c.max} {t('propPoints')}
                        </span>
                      </h3>
                      <p className="text-[13.5px] leading-relaxed mt-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        <RichText text={copy[c.id].short} />
                      </p>
                    </div>
                  </div>

                  <button type="button" onClick={() => setOpenId(open ? null : c.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium flex-shrink-0"
                    style={{
                      background: open ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${open ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.08)'}`,
                      color: open ? '#c4b5fd' : 'rgba(255,255,255,0.55)',
                    }}>
                    {t('propExplain')}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {open && (
                  <div className="mt-4 rounded-xl p-5"
                    style={{ background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(139,92,246,0.18)' }}>
                    <Detail blocks={copy[c.id].detail} />
                    <p className="text-[12px] mt-5 pt-3 leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.28)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {t('propInRulebook')} {c.keywords}
                    </p>
                  </div>
                )}
              </div>

              {/* Seçenekler: satırlar ortak, her firmanın kendi sütunu var. */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {firms.length > 1 && (
                  <div className="grid items-center px-5 py-2 text-[11px] uppercase tracking-wider"
                    style={{ gridTemplateColumns: cols, color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span />
                    {firms.map((_, i) => (
                      <span key={i} className="text-center truncate px-1" title={firmLabel(i)}>
                        {firms[i].name.trim() || String.fromCharCode(65 + i)}
                      </span>
                    ))}
                    <span />
                  </div>
                )}

                {copy[c.id].options.map((opt, oi) => {
                  const key = `${c.id}:${oi}`;
                  const red = redLines.includes(key);
                  return (
                    <div key={oi} className="grid items-center px-5 py-2.5"
                      style={{
                        gridTemplateColumns: cols,
                        background: red ? 'rgba(248,113,113,0.07)' : 'transparent',
                        borderTop: oi === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                      }}>
                      <span className="text-[13.5px] pe-3" style={{ color: red ? 'rgba(248,113,113,0.85)' : 'rgba(255,255,255,0.75)' }}>
                        {opt}
                        <span className="ms-2 font-mono text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {c.points[oi]}
                        </span>
                      </span>

                      {firms.map((f, fi) => {
                        const on = f.answers[c.id] === oi;
                        return (
                          <button key={fi} type="button" onClick={() => setAnswer(fi, c.id, oi)}
                            className="mx-auto w-5 h-5 rounded-full flex items-center justify-center"
                            title={firmLabel(fi)}
                            style={{
                              border: `1.5px solid ${on ? '#a78bfa' : 'rgba(255,255,255,0.22)'}`,
                              background: on ? '#a78bfa' : 'transparent',
                            }}>
                            {on && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#12131f' }} />}
                          </button>
                        );
                      })}

                      <button type="button" onClick={() => toggleRedLine(key)}
                        title={t('propRedLineTitle')}
                        className="mx-auto p-1 rounded-lg transition-opacity"
                        style={{ color: red ? '#f87171' : 'rgba(255,255,255,0.18)' }}>
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Sonuç ── */}
      <div className="rounded-2xl p-6" style={card}>
        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-5">
          <h3 className="font-display text-[20px]" style={{ letterSpacing: '-0.02em' }}>{t('propResult')}</h3>
          <div className="flex items-center gap-4">
            <button type="button" onClick={reset} className="flex items-center gap-1.5 text-[13px]"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              <RotateCcw className="w-3.5 h-3.5" />
              {t('propClear')}
            </button>
            <button type="button" onClick={() => setPrinting(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: '#8b5cf6', color: '#fff' }}>
              <Printer className="w-4 h-4" />
              {t('printPdf')}
            </button>
          </div>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(firms.length, 3)}, minmax(0,1fr))` }}>
          {firms.map((f, i) => {
            const r = results[i];
            const bandColor = bandFor(r.score).color;
            const blocked = r.broken.length > 0;
            return (
              <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[13px] mb-2 truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{firmLabel(i)}</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display" style={{ fontSize: '34px', lineHeight: 1, color: blocked ? '#f87171' : bandColor }}>
                    {r.score}
                  </span>
                  <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>/ 100</span>
                </div>
                <div className="font-mono text-[12.5px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {(r.score / 10).toFixed(1)} / 10
                </div>
                <div className="text-[13px] mt-2.5" style={{ color: blocked ? '#f87171' : bandColor }}>
                  {blocked ? t('propNotSuitable') : band(r.score)}
                </div>
                {blocked && (
                  <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {t('propYourRedLine')}{' '}
                    {r.broken.map(c => copy[c.id].title).join(', ')}
                  </p>
                )}
                {r.answered < PROP_CRITERIA.length && (
                  <p className="text-[12px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {r.answered} / {PROP_CRITERIA.length} {t('propAnswered')}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {firms.length > 1 && best && complete && (
          <p className="text-[14px] leading-relaxed mt-5 pt-4" style={{ color: 'rgba(255,255,255,0.55)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <strong style={{ color: '#fff' }}>{firmLabel(best.i)}</strong>{' '}
            {t('propLeads')} — {best.score} / 100.
            {gaps.length > 0 && ` ${t('propGapFrom')} ${gaps.map(g => copy[g.criterion.id].title).join(', ')}.`}
          </p>
        )}

        {gaps.length > 0 && (
          <div className="mt-5 space-y-2">
            {gaps.map(g => (
              <div key={g.criterion.id} className="flex items-center justify-between gap-4 text-[13px] py-1.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>{copy[g.criterion.id].title}</span>
                <span className="flex items-center gap-3 flex-shrink-0 font-mono">
                  {g.points.map((p, i) => (
                    <span key={i} style={{ color: p == null ? 'rgba(255,255,255,0.2)' : p === Math.max(...g.points.filter((x): x is number => x != null)) ? '#34d399' : 'rgba(255,255,255,0.45)' }}>
                      {p == null ? '—' : p}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[12.5px] leading-relaxed mt-6 pt-4" style={{ color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {t('propFloorNote').replace('{n}', String(PROP_MIN_SCORE))}
        </p>
      </div>

      {printing && (
        <PrintView firms={firms} results={results} redLines={redLines} onDone={() => setPrinting(false)} />
      )}
    </div>
  );
}

/**
 * Yazdırma görünümü. Ekranda görünmez; @media print kuralları #print-root'u
 * açar. Üç firmada A4 dikey dar geliyor, o zaman yatay veriyoruz.
 */
function PrintView({ firms, results, redLines, onDone }: {
  firms: Firm[];
  results: { score: number; answered: number; broken: PropCriterion[] }[];
  redLines: string[];
  onDone: () => void;
}) {
  const { language, t } = useLanguage();
  const copy = propPack(language);
  const bandLabel = (score: number) => {
    const b = bandFor(score);
    return b.label[language] || b.label.en;
  };
  const ink = { text: '#111', soft: '#555', rule: '#ddd' };

  useEffect(() => {
    const id = window.setTimeout(() => { window.print(); onDone(); }, 120);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firmLabel = (i: number) => firms[i].name.trim() || `${t('propFirm')} ${String.fromCharCode(65 + i)}`;

  const view = (
    <div id="print-root" style={{ display: 'none', fontFamily: 'Inter, system-ui, sans-serif', color: ink.text, background: '#fff' }}>
      {firms.length > 2 && <style>{'@page { size: A4 landscape; margin: 12mm; }'}</style>}

      <div style={{ borderBottom: `2px solid ${ink.text}`, paddingBottom: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
          <h1 style={{ fontSize: 17, margin: 0, fontWeight: 700 }}>
            {t('propReviewTitle')}
          </h1>
          <span style={{ fontSize: 11, color: ink.soft }}>
            {new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'medium' })}
          </span>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 18 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'start', padding: '6px 8px 6px 0', borderBottom: `1px solid ${ink.text}`, width: '46%' }}>
              {t('propCriterion')}
            </th>
            {firms.map((_, i) => (
              <th key={i} style={{ textAlign: 'start', padding: '6px 8px', borderBottom: `1px solid ${ink.text}` }}>
                {firmLabel(i)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PROP_CRITERIA.map((c, index) => (
            <tr key={c.id} className="print-keep">
              <td style={{ padding: '5px 8px 5px 0', borderBottom: `1px solid ${ink.rule}`, verticalAlign: 'top' }}>
                <span style={{ color: ink.soft }}>{String(index + 1).padStart(2, '0')}</span> {copy[c.id].title}
                <span style={{ color: ink.soft }}> ({c.max})</span>
              </td>
              {firms.map((f, fi) => {
                const pick = f.answers[c.id];
                const opt = pick != null ? copy[c.id].options[pick] : undefined;
                const red = pick != null && redLines.includes(`${c.id}:${pick}`);
                return (
                  <td key={fi} style={{ padding: '5px 8px', borderBottom: `1px solid ${ink.rule}`, verticalAlign: 'top' }}>
                    {opt ? (
                      <>
                        {opt} <strong>({c.points[pick as number]})</strong>
                        {red && <span style={{ color: '#b91c1c' }}> — {t('propRedLineShort')}</span>}
                      </>
                    ) : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td style={{ padding: '10px 8px 6px 0', fontWeight: 700, borderTop: `2px solid ${ink.text}` }}>
              {t('propTotal')}
            </td>
            {results.map((r, i) => (
              <td key={i} style={{ padding: '10px 8px 6px', fontWeight: 700, borderTop: `2px solid ${ink.text}` }}>
                {r.score} / 100 · {(r.score / 10).toFixed(1)}/10
                <div style={{ fontWeight: 400, color: ink.soft, fontSize: 10.5, marginTop: 2 }}>
                  {r.broken.length > 0 ? t('propNotSuitable') : bandLabel(r.score)}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <p style={{ fontSize: 10, color: ink.soft, lineHeight: 1.6, margin: 0 }}>
        {t('propPrintNote').replace('{n}', String(PROP_MIN_SCORE))}
      </p>
    </div>
  );

  return createPortal(view, document.body);
}

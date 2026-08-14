import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, Pencil, Check, Layers, TrendingUp, TrendingDown, Minus, RotateCcw } from 'lucide-react';
import { MTFEntry, MTFBias } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

interface MTFAnalysisProps {
  value: MTFEntry[];
  onChange: (entries: MTFEntry[]) => void;
  /** Sembol verilirse, bölüm açıldığında bu sembolün son analizi otomatik yüklenir. */
  symbol?: string;
  /** Mevcut bir işlem düzenlenirken otomatik doldurma istenmez. */
  autoFill?: boolean;
}

/** Monthly'den 1 dakikaya, üstten alta sıralı. */
export const MTF_TIMEFRAMES: { code: string; tr: string; en: string }[] = [
  { code: 'MN1', tr: 'Aylık', en: 'Monthly' },
  { code: 'W1', tr: 'Haftalık', en: 'Weekly' },
  { code: 'D1', tr: 'Günlük', en: 'Daily' },
  { code: 'H12', tr: '12 Saat', en: '12 Hour' },
  { code: 'H8', tr: '8 Saat', en: '8 Hour' },
  { code: 'H4', tr: '4 Saat', en: '4 Hour' },
  { code: 'H2', tr: '2 Saat', en: '2 Hour' },
  { code: 'H1', tr: '1 Saat', en: '1 Hour' },
  { code: 'M30', tr: '30 Dakika', en: '30 Minute' },
  { code: 'M15', tr: '15 Dakika', en: '15 Minute' },
  { code: 'M5', tr: '5 Dakika', en: '5 Minute' },
  { code: 'M3', tr: '3 Dakika', en: '3 Minute' },
  { code: 'M1', tr: '1 Dakika', en: '1 Minute' },
];

const TF_ORDER = MTF_TIMEFRAMES.map(tf => tf.code);

export const BIAS_META: Record<MTFBias, { color: string; bg: string; tr: string; en: string }> = {
  bullish: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', tr: 'Bullish', en: 'Bullish' },
  bearish: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', tr: 'Bearish', en: 'Bearish' },
  consolidation: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', tr: 'Konsolidasyon', en: 'Consolidation' },
};

const BIAS_ICON: Record<MTFBias, React.ReactNode> = {
  bullish: <TrendingUp className="w-3.5 h-3.5" />,
  bearish: <TrendingDown className="w-3.5 h-3.5" />,
  consolidation: <Minus className="w-3.5 h-3.5" />,
};

export function tfLabel(code: string, language: string): string {
  const tf = MTF_TIMEFRAMES.find(x => x.code === code);
  if (!tf) return code;
  return language === 'tr' ? tf.tr : tf.en;
}

const sortEntries = (entries: MTFEntry[]) =>
  [...entries].sort((a, b) => TF_ORDER.indexOf(a.timeframe) - TF_ORDER.indexOf(b.timeframe));

/** Kayıtlı analizlerin salt-okunur listesi — işlem detayında kullanılır. */
export function MTFAnalysisView({ entries }: { entries: MTFEntry[] }) {
  const { language } = useLanguage();
  if (!entries || entries.length === 0) return null;
  return (
    <div className="space-y-2">
      {sortEntries(entries).map(entry => {
        const meta = BIAS_META[entry.bias] || BIAS_META.consolidation;
        return (
          <div key={entry.timeframe} className="rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                {entry.timeframe}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {tfLabel(entry.timeframe, language)}
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                style={{ background: meta.bg, color: meta.color }}>
                {BIAS_ICON[entry.bias]}
                {language === 'tr' ? meta.tr : meta.en}
              </span>
            </div>
            {entry.notes && (
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{entry.notes}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MTFAnalysis({ value, onChange, symbol, autoFill = false }: MTFAnalysisProps) {
  const { language } = useLanguage();
  const { user } = useUser();
  const tr = (a: string, b: string) => (language === 'tr' ? a : b);

  const entries = value || [];
  const [open, setOpen] = useState(entries.length > 0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState<MTFEntry | null>(null);
  /** Düzenlenen satırın orijinal timeframe'i — yeni satırda null. */
  const [editingTf, setEditingTf] = useState<string | null>(null);
  const [prefilledFrom, setPrefilledFrom] = useState<string | null>(null);
  const [loadingPrefill, setLoadingPrefill] = useState(false);
  /** Kullanıcı elle bir şey değiştirdiyse otomatik doldurma bir daha ezmez. */
  const dirtyRef = useRef(false);
  /** Bölüm ilk açıldığında, yüklenecek analiz yoksa seçiciyi kendiliğinden aç. */
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    if (!open || autoOpenedRef.current || loadingPrefill) return;
    if (entries.length === 0) {
      autoOpenedRef.current = true;
      setPickerOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loadingPrefill, entries.length]);

  // Bölüm açıldığında (veya sembol değiştiğinde) bu sembolün en son analizini getir.
  useEffect(() => {
    if (!autoFill || !open || !symbol || !user || dirtyRef.current) return;
    let cancelled = false;
    (async () => {
      setLoadingPrefill(true);
      const { data } = await supabase
        .from('trades')
        .select('mtf_analysis')
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .not('mtf_analysis', 'is', null)
        .order('date', { ascending: false })
        .limit(1);
      if (cancelled) return;
      const last = data?.[0]?.mtf_analysis as MTFEntry[] | null | undefined;
      if (last && last.length > 0) {
        onChange(sortEntries(last));
        setPrefilledFrom(symbol);
      } else {
        onChange([]);
        setPrefilledFrom(null);
      }
      setLoadingPrefill(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFill, open, symbol, user?.id]);

  const commit = (next: MTFEntry[]) => {
    dirtyRef.current = true;
    onChange(sortEntries(next));
  };

  const startNew = (timeframe: string) => {
    setDraft({ timeframe, bias: 'bullish', notes: '' });
    setEditingTf(null);
    setPickerOpen(false);
  };

  const startEdit = (entry: MTFEntry) => {
    setDraft({ ...entry });
    setEditingTf(entry.timeframe);
    setPickerOpen(false);
  };

  const saveDraft = () => {
    if (!draft) return;
    const without = entries.filter(e => e.timeframe !== draft.timeframe && e.timeframe !== editingTf);
    commit([...without, draft]);
    setDraft(null);
    setEditingTf(null);
  };

  const removeEntry = (timeframe: string) => {
    commit(entries.filter(e => e.timeframe !== timeframe));
    if (editingTf === timeframe) { setDraft(null); setEditingTf(null); }
  };

  const clearAll = () => {
    commit([]);
    setDraft(null);
    setEditingTf(null);
    setPrefilledFrom(null);
  };

  const usedTfs = entries.map(e => e.timeframe);
  const availableTfs = MTF_TIMEFRAMES.filter(tf => !usedTfs.includes(tf.code) || tf.code === editingTf);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.16)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}>
        <Layers className="w-4 h-4" />
        {tr('Multi Timeframe Analiz Ekle', 'Add Multi-Timeframe Analysis')}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Otomatik yüklenen analiz bilgisi */}
      {loadingPrefill && (
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {tr('Son analiz aranıyor...', 'Looking up last analysis...')}
        </p>
      )}
      {!loadingPrefill && prefilledFrom && entries.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap px-3 py-2 rounded-xl"
          style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)' }}>
          <span className="text-xs" style={{ color: '#34d399' }}>
            {tr(
              `${prefilledFrom} için son analizin yüklendi — düzenleyebilirsin.`,
              `Loaded your last analysis for ${prefilledFrom} — edit as needed.`
            )}
          </span>
          <button type="button" onClick={clearAll}
            className="flex items-center gap-1 text-xs font-medium ms-auto"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}>
            <RotateCcw className="w-3 h-3" />
            {tr('Temizle', 'Clear')}
          </button>
        </div>
      )}

      {/* Kayıtlı satırlar */}
      {sortEntries(entries).map(entry => {
        const meta = BIAS_META[entry.bias] || BIAS_META.consolidation;
        const isEditing = editingTf === entry.timeframe;
        if (isEditing) return null;
        return (
          <div key={entry.timeframe} className="group rounded-xl p-3.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                {entry.timeframe}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {tfLabel(entry.timeframe, language)}
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                style={{ background: meta.bg, color: meta.color }}>
                {BIAS_ICON[entry.bias]}
                {language === 'tr' ? meta.tr : meta.en}
              </span>
              <div className="flex items-center gap-1 ms-auto">
                <button type="button" onClick={() => startEdit(entry)} title={tr('Düzenle', 'Edit')}
                  className="p-1.5 rounded-lg transition-all" style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#a78bfa'; (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => removeEntry(entry.timeframe)} title={tr('Sil', 'Delete')}
                  className="p-1.5 rounded-lg transition-all" style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {entry.notes && (
              <p className="text-sm mt-2 whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{entry.notes}</p>
            )}
          </div>
        );
      })}

      {/* Düzenleme / yeni kayıt kutusu */}
      {draft && (
        <div className="rounded-xl p-4 space-y-3"
          style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={draft.timeframe} onChange={e => setDraft({ ...draft, timeframe: e.target.value })}
              className="px-3 py-1.5 rounded-lg text-sm font-mono outline-none cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
              {availableTfs.map(tf => (
                <option key={tf.code} value={tf.code} style={{ background: '#1a1b2e', color: '#fff' }}>
                  {tf.code} — {language === 'tr' ? tf.tr : tf.en}
                </option>
              ))}
            </select>

            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(BIAS_META) as MTFBias[]).map(bias => {
                const meta = BIAS_META[bias];
                const active = draft.bias === bias;
                return (
                  <button key={bias} type="button" onClick={() => setDraft({ ...draft, bias })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={active
                      ? { background: meta.bg, color: meta.color, border: `1px solid ${meta.color}55` }
                      : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {BIAS_ICON[bias]}
                    {language === 'tr' ? meta.tr : meta.en}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} autoFocus
            placeholder={tr(
              `${draft.timeframe} analizini yaz — yapı, likidite, kilit seviyeler...`,
              `Write your ${draft.timeframe} analysis — structure, liquidity, key levels...`
            )}
            className="w-full outline-none text-sm"
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', borderRadius: '12px', padding: '12px', height: '110px', resize: 'vertical',
            }} />

          <div className="flex items-center gap-2">
            <button type="button" onClick={saveDraft}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#8b5cf6', color: '#fff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8b5cf6'; }}>
              <Check className="w-4 h-4" />
              {tr('Kaydet', 'Save')}
            </button>
            <button type="button" onClick={() => { setDraft(null); setEditingTf(null); }}
              className="px-4 py-2 rounded-xl text-sm transition-all"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}>
              {tr('Vazgeç', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Yeni timeframe seçici */}
      {!draft && availableTfs.length > 0 && (
        pickerOpen ? (
          <div className="rounded-xl p-3.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {tr('Timeframe seç', 'Pick a timeframe')}
              </span>
              <button type="button" onClick={() => setPickerOpen(false)}
                className="p-1 rounded-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTfs.map(tf => (
                <button key={tf.code} type="button" onClick={() => startNew(tf.code)}
                  title={language === 'tr' ? tf.tr : tf.en}
                  className="px-3 py-2 rounded-xl text-sm font-mono font-semibold transition-all"
                  style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.22)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.22)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; (e.currentTarget as HTMLElement).style.color = '#a78bfa'; }}>
                  {tf.code}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setPickerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.16)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'; }}>
            <Plus className="w-4 h-4" />
            {entries.length === 0
              ? tr('Timeframe Seç', 'Pick a Timeframe')
              : tr('Yeni Timeframe Ekle', 'Add Another Timeframe')}
          </button>
        )
      )}
    </div>
  );
}

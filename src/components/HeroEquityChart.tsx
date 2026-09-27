import React, { useEffect, useRef, useState } from 'react';

/**
 * Ana sayfanın ilk ekranındaki kümülatif kâr eğrisi.
 *
 * Önce recharts ile çiziliyordu. 15 noktalık bir süs eğrisi için sayfaya
 * ~700 KB kaynak (recharts ve beraberinde redux, immer, d3) yükleniyordu;
 * ana sayfaya gelen herkes bunu indirmek zorundaydı. Aynı görünüşü (yumuşak
 * "monotone" eğri, yeşil dolgu, kesikli yatay çizgiler, üstüne gelince bilgi
 * kutusu) birkaç düz SVG yoluyla çiziyoruz; recharts artık yalnızca
 * uygulamanın istatistik ekranı açılınca yükleniyor.
 */
type Point = { i: number; v: number };

/** d3'ün curveMonotoneX'i: eğri noktaların arasında taşıp sahte tepe yapmaz. */
function monotonePath(pts: { x: number; y: number }[]): string {
  const n = pts.length;
  if (n < 2) return '';
  const m: number[] = [];
  for (let k = 0; k < n - 1; k++) m.push((pts[k + 1].y - pts[k].y) / (pts[k + 1].x - pts[k].x));
  const t: number[] = new Array(n);
  t[0] = m[0];
  t[n - 1] = m[n - 2];
  for (let k = 1; k < n - 1; k++) {
    const h0 = pts[k].x - pts[k - 1].x;
    const h1 = pts[k + 1].x - pts[k].x;
    const s0 = m[k - 1], s1 = m[k];
    const p = (s0 * h1 + s1 * h0) / (h0 + h1);
    t[k] = (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
  }
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let k = 0; k < n - 1; k++) {
    const h = (pts[k + 1].x - pts[k].x) / 3;
    d += `C${pts[k].x + h},${pts[k].y + t[k] * h} ${pts[k + 1].x - h},${pts[k + 1].y - t[k + 1] * h} ${pts[k + 1].x},${pts[k + 1].y}`;
  }
  return d;
}

/** 1840 → 2000; eksen yuvarlak sayılarla bitsin. */
function niceMax(v: number): number {
  const step = Math.pow(10, Math.floor(Math.log10(v || 1))) / 2;
  return Math.ceil(v / step) * step;
}

export default function HeroEquityChart({ data, seriesLabel, tradeWord }: {
  data: Point[];
  /** Bilgi kutusundaki serinin adı ("Kümülatif PnL"). */
  seriesLabel: string;
  /** "İşlem" — kutunun başlığı "İşlem #8". */
  tradeWord: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const padL = 48, padR = 6, padT = 6, padB = 26;
  const max = niceMax(Math.max(...data.map(p => p.v)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(max * f));
  const x = (k: number) => padL + (k / (data.length - 1)) * Math.max(0, w - padL - padR);
  const y = (v: number) => padT + (1 - v / max) * Math.max(0, h - padT - padB);
  const pts = data.map((p, k) => ({ x: x(k), y: y(p.v) }));
  const line = monotonePath(pts);
  const bottom = h - padB;
  const area = pts.length ? `${line}L${pts[pts.length - 1].x},${bottom}L${pts[0].x},${bottom}Z` : '';
  // Dar ekranda eksen etiketleri birbirine girmesin.
  const every = w < 420 ? 2 : 1;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const k = Math.round(((px - padL) / Math.max(1, w - padL - padR)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, k)));
  };

  const tip = hover != null ? { p: pts[hover], d: data[hover] } : null;
  const tipLeft = tip ? Math.min(Math.max(tip.p.x + 12, 0), Math.max(0, w - 170)) : 0;
  const tipTop = tip ? Math.max(tip.p.y - 64, 0) : 0;

  return (
    <div ref={box} className="relative w-full h-full">
      {w > 0 && h > 0 && (
        <svg width={w} height={h} onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label={seriesLabel}>
          <defs>
            <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          {ticks.map(v => (
            <g key={v}>
              <line x1={padL} x2={w - padR} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <text x={padL - 8} y={y(v)} dy="0.32em" textAnchor="end" fontSize={11} fill="rgba(255,255,255,0.5)">${v}</text>
            </g>
          ))}
          {data.map((p, k) => (k % every === 0 || k === data.length - 1) && (
            <text key={p.i} x={x(k)} y={bottom + 16} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.5)">{p.i}</text>
          ))}
          <path d={area} fill="url(#heroGradient)" />
          <path d={line} fill="none" stroke="#10b981" strokeWidth={2} />
          {tip && (
            <>
              <line x1={tip.p.x} x2={tip.p.x} y1={padT} y2={bottom} stroke="rgba(255,255,255,0.15)" />
              <circle cx={tip.p.x} cy={tip.p.y} r={4} fill="#10b981" stroke="#0d0e1a" strokeWidth={2} />
            </>
          )}
        </svg>
      )}
      {tip && (
        <div className="absolute pointer-events-none px-3 py-2 text-[12px]"
          style={{ left: tipLeft, top: tipTop, background: '#12131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)' }}>{tradeWord} #{tip.d.i}</div>
          <div className="mt-0.5" style={{ color: '#10b981' }}>{seriesLabel} : ${tip.d.v}</div>
        </div>
      )}
    </div>
  );
}

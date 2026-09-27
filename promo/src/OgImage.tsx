import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Lock } from './Logo';
import { C, sans, serif } from './theme';

/**
 * Paylaşım önizlemesi (Open Graph) — 1200×630, tek kare.
 *
 * WhatsApp, X, LinkedIn, Telegram ve Instagram'da site bağlantısı
 * paylaşılınca görünen resim. Bu platformların botları JavaScript
 * çalıştırmıyor; dil seçemiyoruz, o yüzden İngilizce (sitenin varsayılanı).
 * Çıktı: ../public/og-image.png — `npx remotion still src/index.ts OgImage ../public/og-image.png`
 */
const EQUITY = [0, 180, 340, 260, 420, 610, 540, 780, 950, 890, 1120, 1340, 1280, 1560, 1840];

function monotone(pts: { x: number; y: number }[]): string {
  const n = pts.length;
  const m: number[] = [];
  for (let k = 0; k < n - 1; k++) m.push((pts[k + 1].y - pts[k].y) / (pts[k + 1].x - pts[k].x));
  const t: number[] = new Array(n);
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let k = 1; k < n - 1; k++) {
    const h0 = pts[k].x - pts[k - 1].x, h1 = pts[k + 1].x - pts[k].x;
    const p = (m[k - 1] * h1 + m[k] * h0) / (h0 + h1);
    t[k] = (Math.sign(m[k - 1]) + Math.sign(m[k])) * Math.min(Math.abs(m[k - 1]), Math.abs(m[k]), 0.5 * Math.abs(p)) || 0;
  }
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let k = 0; k < n - 1; k++) {
    const h = (pts[k + 1].x - pts[k].x) / 3;
    d += `C${pts[k].x + h},${pts[k].y + t[k] * h} ${pts[k + 1].x - h},${pts[k + 1].y - t[k + 1] * h} ${pts[k + 1].x},${pts[k + 1].y}`;
  }
  return d;
}

export const OgImage: React.FC = () => {
  // Eğri resmin alt yarısında, sağa doğru yükseliyor.
  const W = 1200, H = 630;
  // Eğri sağ yarıda ve alt yazı satırının üstünde kalsın; sonundaki nokta kesilmesin.
  const x0 = 420, x1 = W - 56, yTop = 300, yBot = 520;
  const pts = EQUITY.map((v, k) => ({
    x: x0 + (k / (EQUITY.length - 1)) * (x1 - x0),
    y: yBot - (v / 2000) * (yBot - yTop),
  }));
  const line = monotone(pts);
  const area = `${line}L${x1},${yBot + 20}L${x0},${yBot + 20}Z`;

  return (
    <AbsoluteFill style={{ background: '#0b0b12' }}>
      {/* Işıklar: mor marka rengi soldan, altın sağ üstten — sitenin zemini. */}
      <AbsoluteFill style={{ background: 'radial-gradient(900px 520px at 12% 0%, rgba(139,92,246,0.22), transparent 70%)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(700px 420px at 100% 10%, rgba(240,180,41,0.10), transparent 70%)' }} />

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="og-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={x0} x2={x1} y1={yBot - f * (yBot - yTop)} y2={yBot - f * (yBot - yTop)}
            stroke="rgba(255,255,255,0.05)" strokeDasharray="6 6" />
        ))}
        <path d={area} fill="url(#og-fill)" />
        <path d={line} fill="none" stroke="#10b981" strokeWidth={4} />
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={9} fill="#10b981" stroke="#0b0b12" strokeWidth={4} />
      </svg>

      <div style={{ position: 'absolute', left: 72, top: 64, right: 72 }}>
        <Lock style={{ width: 430, height: 'auto', color: C.text }} />
        <div style={{ marginTop: 52, fontFamily: serif, fontSize: 74, lineHeight: 1.02, color: C.text, letterSpacing: '-0.02em' }}>
          Whatever works is repeatable.
        </div>
        <div style={{ marginTop: 14, fontFamily: serif, fontStyle: 'italic', fontSize: 50, color: C.gold, letterSpacing: '-0.01em' }}>
          We make it visible.
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 72, bottom: 48, fontFamily: sans, fontSize: 22, fontWeight: 500,
        color: 'rgba(255,255,255,0.72)', letterSpacing: '0.01em', display: 'flex', gap: 18, alignItems: 'center',
      }}>
        <span>MetaTrader auto-sync</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span>Discipline analysis</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span>Prop limits</span>
      </div>
      <div style={{ position: 'absolute', right: 72, bottom: 48, fontFamily: sans, fontSize: 22, color: 'rgba(255,255,255,0.5)' }}>
        simpletradejournal.io
      </div>
    </AbsoluteFill>
  );
};

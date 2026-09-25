import React from 'react';
import { AbsoluteFill, Html5Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { FIS } from './cues';
import { C, mono, sans, money } from './theme';
import {
  Backdrop, Card, Endcard, Exit, Grain, Rise, Sfx, Vignette, Words,
  clamp, easeOut, useCount, useProgress,
} from './ui';

/**
 * FİŞ — "Aynı hatayı satın almayı bırak."
 *
 * Her prop trader'ın içinde bir fiş var: patlayan challenge'lar ve ödenen
 * ücretler. Yazıcı ekranın altında duruyor; fiş yukarı doğru çıkıyor, en eski
 * satır en üstte — gerçek bir fişin okunuş yönü.
 *
 * Firma adı ya da logosu yok: tek bir şirketi değil, bir alışkanlığı anlatıyoruz.
 * Fiyatlar sektörün tipik basamakları (10K $99, 25K $149, 50K $299, 100K $499).
 */

const SLOT_Y = 1440;          // yazıcının ağzı
const PAPER_W = 800;
const INK = '#1b1a18';
const PAPER = '#f1efe8';

type Line =
  | { kind: 'center'; text: string; at: number; h: number; bold?: boolean; size?: number }
  | { kind: 'row'; date: string; acct: string; price: number; at: number; h: number }
  | { kind: 'rule'; at: number; h: number }
  | { kind: 'cols'; at: number; h: number }
  | { kind: 'total'; label: string; value: string; at: number; h: number; big?: boolean }
  | { kind: 'gap'; at: number; h: number };

const ROWS: [string, string, number][] = [
  ['03.01', '10K', 99], ['24.01', '10K', 99], ['19.02', '25K', 149], ['11.03', '10K', 99],
  ['08.04', '50K', 299], ['02.05', '25K', 149], ['27.05', '10K', 99], ['16.06', '100K', 499],
];
const TOTAL = ROWS.reduce((s, r) => s + r[2], 0);   // 1,492

const H = FIS.header;
const LINES: Line[] = [
  { kind: 'gap', at: H - 0.1, h: 30 },
  { kind: 'center', text: '★  PROP CHALLENGE  ★', at: H, h: 58, bold: true, size: 36 },
  { kind: 'center', text: 'FİŞ NO 0008', at: H + 0.12, h: 44, size: 26 },
  { kind: 'rule', at: H + 0.24, h: 30 },
  { kind: 'cols', at: H + 0.36, h: 50 },
  ...ROWS.map(([date, acct, price], i) => ({ kind: 'row' as const, date, acct, price, at: FIS.rows[i], h: 56 })),
  { kind: 'rule', at: FIS.rule, h: 34 },
  { kind: 'total', label: 'TOPLAM', value: money(TOTAL), at: FIS.total, h: 92, big: true },
  { kind: 'total', label: 'ALINAN PAYOUT', value: '$0', at: FIS.payout, h: 54 },
  { kind: 'rule', at: FIS.rule2, h: 34 },
  { kind: 'center', text: 'TEŞEKKÜR EDERİZ', at: FIS.thanks, h: 48, size: 28 },
  { kind: 'center', text: 'YİNE BEKLERİZ :)', at: FIS.again, h: 60, size: 30, bold: true },
  { kind: 'gap', at: FIS.again + 0.25, h: 60 },
];

/** Kâğıt besleme: bir satır basılırken kâğıt o satırın boyu kadar yukarı kayar. */
const FEED = 0.13;

function LineView({ l }: { l: Line }) {
  const base: React.CSSProperties = { height: l.h, display: 'flex', alignItems: 'center', fontFamily: mono, color: INK };
  switch (l.kind) {
    case 'gap': return <div style={{ height: l.h }} />;
    case 'center':
      return <div style={{ ...base, justifyContent: 'center', fontSize: l.size ?? 28, fontWeight: l.bold ? 700 : 400, letterSpacing: '0.06em' }}>{l.text}</div>;
    case 'rule':
      return <div style={{ ...base }}><div style={{ flex: 1, borderTop: `3px dashed ${INK}`, opacity: 0.55 }} /></div>;
    case 'cols':
      return (
        <div style={{ ...base, fontSize: 22, opacity: 0.6, letterSpacing: '0.08em' }}>
          <span style={{ width: 118 }}>TARİH</span><span style={{ flex: 1 }}>HESAP</span>
          <span style={{ width: 120, textAlign: 'right' }}>ÜCRET</span><span style={{ width: 200, textAlign: 'right' }}>DURUM</span>
        </div>
      );
    case 'row':
      return (
        <div style={{ ...base, fontSize: 29 }}>
          <span style={{ width: 118, opacity: 0.7 }}>{l.date}</span>
          <span style={{ flex: 1 }}>{l.acct} CHALLENGE</span>
          <span style={{ width: 120, textAlign: 'right' }}>${l.price}</span>
          <span style={{ width: 200, textAlign: 'right', fontWeight: 700 }}>✗ PATLADI</span>
        </div>
      );
    case 'total':
      return (
        <div style={{ ...base, fontSize: l.big ? 54 : 29, fontWeight: l.big ? 700 : 400, justifyContent: 'space-between', letterSpacing: l.big ? '-0.01em' : '0.02em' }}>
          <span>{l.label}</span><span>{l.value}</span>
        </div>
      );
  }
}

function Receipt() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Basılmış satırlar ve kâğıdın ne kadar dışarı çıktığı.
  let fed = 0;
  const shown: Line[] = [];
  for (const l of LINES) {
    if (t < l.at) break;
    shown.push(l);
    fed += l.h * interpolate(t, [l.at, l.at + FEED], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  }

  // Koparma: kâğıt yukarı fırlıyor, hafifçe dönerek kadrajdan çıkıyor.
  const tear = interpolate(t, [FIS.tear, FIS.tear + 0.55], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const jerk = interpolate(t, [FIS.tear - 0.08, FIS.tear], [0, 1], clamp);

  // Toplam basılırken kamera fişe biraz yaklaşıyor.
  const zoom = interpolate(t, [FIS.pause, FIS.total + 0.4], [1, 1.06], { ...clamp, easing: easeOut });

  // Kâğıdın alt ucu yazıcının dudağının hemen altında: son basılan satır
  // (TOPLAM, "YİNE BEKLERİZ") tamamen görünsün. Önce 26 piksel içeride
  // kalıyordu ve en önemli satırın alt yarısı yazıcının içinde kesiliyordu.
  const bottom = SLOT_Y + 2;
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `50% ${SLOT_Y}px` }}>
      <div style={{
        position: 'absolute', left: (1080 - PAPER_W) / 2, width: PAPER_W,
        top: bottom - fed, height: fed,
        transform: `translateY(${-tear * 1900 - jerk * 14}px) rotate(${tear * -7}deg)`,
        transformOrigin: '50% 100%',
      }}>
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          background: `linear-gradient(90deg, #dcd9d0 0%, ${PAPER} 7%, #f7f5ef 50%, ${PAPER} 93%, #d8d5cc 100%)`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.2)',
          // Üst kenar tırtıklı: bir önceki fişten koparılmış.
          clipPath: zigzag(),
        }}>
          {/* Termal baskı: satırlar kâğıtla birlikte yukarı kayıyor. */}
          <div style={{ position: 'absolute', left: 44, right: 44, bottom: 0, opacity: 0.93 }}>
            {shown.map((l, i) => <LineView key={i} l={l} />)}
          </div>
          {/* Hafif ışık: kâğıt kıvrılıyor gibi. */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.12), transparent 18%, transparent 80%, rgba(0,0,0,0.18))' }} />
        </div>
      </div>
      <Printer />
    </AbsoluteFill>
  );
}

function zigzag() {
  const teeth = 32;
  const pts: string[] = [];
  for (let i = 0; i <= teeth; i++) pts.push(`${(i / teeth) * 100}% ${i % 2 ? 0 : 10}px`);
  return `polygon(${pts.join(', ')}, 100% 100%, 0% 100%)`;
}

function Printer() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const printing = t > 0.1 && t < FIS.again + 0.4 && !(t > FIS.pause && t < FIS.total);
  const led = printing ? (Math.floor(frame / 4) % 2 ? 1 : 0.35) : 0.25;
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: SLOT_Y - 8, bottom: -40 }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '44px 44px 0 0',
        background: 'linear-gradient(180deg, #1d1d22 0%, #111114 30%, #0a0a0c 100%)',
        boxShadow: '0 -20px 60px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.08)',
      }} />
      {/* Ağız */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: 10, height: 14, borderRadius: 7, background: '#020203', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.07)' }} />
      <div style={{ position: 'absolute', right: 70, top: 66, width: 14, height: 14, borderRadius: 7, background: C.amber, opacity: led, boxShadow: `0 0 ${18 * led}px ${C.amber}` }} />
      <div style={{ position: 'absolute', left: 70, top: 58, fontFamily: sans, fontSize: 22, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.18)' }}>THERMAL · 80MM</div>
    </div>
  );
}

// ─── Prop sayacı ──────────────────────────────────────────────────────────

/** Sitedeki kayıp sınırı rengi: uzaksa yeşil, yarıyı geçince sarı, dörtte üçte kırmızı. */
const lossColor = (ratio: number) => (ratio >= 0.75 ? C.red : ratio >= 0.5 ? C.amber : C.green);

function PropCell({ label, limit, left, note, kind }: { label: string; limit: number; left: number; note: string; kind: 'target' | 'loss' }) {
  const now = useCount(left, limit, FIS.propCount, FIS.propCountEnd);
  const used = limit - now;
  const ratio = used / limit;
  const color = kind === 'target' ? C.gold : lossColor(ratio);
  return (
    <div>
      <div style={{ fontSize: 24, letterSpacing: '0.14em', color: C.faint, fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 66, color, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{money(now)}</div>
        <div style={{ fontFamily: mono, fontSize: 24, color: C.faint }}>{note}</div>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.07)', marginTop: 16, overflow: 'hidden' }}>
        <div style={{ width: `${ratio * 100}%`, height: '100%', borderRadius: 4, background: color, boxShadow: `0 0 18px ${color}` }} />
      </div>
    </div>
  );
}

function PropScene() {
  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 360 }}>
      <Words text={'Sınıra ne kadar kaldığını\nher an bil.'} start={FIS.prop} size={80} stagger={0.08} accent={['her', 'an']} />
      <div style={{ height: 90 }} />
      <Rise start={FIS.propCard}>
        <Card style={{ width: 920, display: 'flex', flexDirection: 'column', gap: 50 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 34, fontWeight: 500, color: C.text }}>Instant 10K</div>
            <div style={{ fontSize: 22, letterSpacing: '0.16em', color: C.lilac, border: '1px solid rgba(167,139,250,0.35)', borderRadius: 999, padding: '8px 18px' }}>PROP</div>
          </div>
          <PropCell kind="target" label="HEDEFE KALAN" limit={1000} left={640} note="hedef $1,000" />
          <PropCell kind="loss" label="BUGÜNKÜ LİMİTE KALAN" limit={500} left={188} note="bugün −$312" />
          <PropCell kind="loss" label="TOPLAM KAYBA KALAN" limit={1000} left={780} note="taban $9,000" />
        </Card>
      </Rise>
    </AbsoluteFill>
  );
}

// ─── Kompozisyon ──────────────────────────────────────────────────────────

function Window({ from, to, children }: { from: number; to: number; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < Math.round(from * fps) || frame >= Math.round(to * fps)) return null;
  return <AbsoluteFill>{children}</AbsoluteFill>;
}

export function Fis({ music = true }: { music?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Fiş koparılınca oda kararıyor.
  const dark = interpolate(t, [FIS.tear + 0.2, FIS.black], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {music && <Html5Audio src={staticFile('music/fis.wav')} volume={0.9} />}
      <Backdrop glow={t < FIS.black ? 0.7 : t < FIS.prop ? 0.3 : 1} gold={t >= FIS.end ? 1 : 0} />

      <Window from={0} to={FIS.black}>
        {/* Üstten sert bir spot: fiş karanlık bir masada. */}
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 58%, rgba(255,250,235,0.10), transparent 70%)' }} />
        <Receipt />
        <AbsoluteFill style={{ background: `rgba(5,5,7,${dark})` }} />
      </Window>

      <Window from={FIS.line} to={FIS.prop}>
        <Exit at={FIS.prop - 0.35} dur={0.35}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Words text={'Aynı hatayı\nsatın almayı bırak.'} start={FIS.line} size={104} stagger={0.2} dur={0.7} accent={['bırak']} />
          </AbsoluteFill>
        </Exit>
      </Window>

      <Window from={FIS.prop} to={FIS.end}>
        <Exit at={FIS.end - 0.3} dur={0.3}><PropScene /></Exit>
      </Window>

      <Window from={FIS.end} to={FIS.duration}>
        <Endcard start={FIS.end} line="Prop hesabın için journal." stacked logoWidth={520} gap={80} />
      </Window>

      <Vignette />
      <Grain />
      <Sounds />
    </AbsoluteFill>
  );
}

function Sounds() {
  const out: React.ReactNode[] = [];
  LINES.forEach((l, i) => {
    if (l.kind === 'gap') return;
    const big = l.kind === 'total' && l.big;
    out.push(<Sfx key={`p${i}`} src="sfx/printer.wav" at={l.at} volume={big ? 0.9 : 0.6} />);
  });
  out.push(<Sfx key="boom" src="sfx/boom.wav" at={FIS.total} volume={0.9} />);
  out.push(<Sfx key="kasa" src="sfx/ding.wav" at={FIS.again + 0.05} volume={0.5} />);
  out.push(<Sfx key="tear" src="sfx/tear.wav" at={FIS.tear - 0.08} volume={0.9} />);
  out.push(<Sfx key="wh" src="sfx/whoosh.wav" at={FIS.tear} volume={0.45} />);
  out.push(<Sfx key="pc" src="sfx/thud.wav" at={FIS.propCard} volume={0.6} />);
  for (let k = 0; k < 20; k++) out.push(<Sfx key={`c${k}`} src="sfx/count.wav" at={FIS.propCount + k * 0.09} volume={0.4} />);
  out.push(<Sfx key="end-w" src="sfx/whoosh.wav" at={FIS.end - 0.35} volume={0.4} />);
  out.push(<Sfx key="end-d" src="sfx/ding.wav" at={FIS.end + 0.28} volume={0.4} />);
  return <>{out}</>;
}

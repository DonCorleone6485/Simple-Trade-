// ÜRETİLMİŞ DOSYA — scripts/make_mac_fa.py. Elle düzenleme; Mac.tsx'i düzenleyip betiği çalıştır.
import React from 'react';
import { AbsoluteFill, Html5Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { MAC } from './cues';
import { C, mono, faSans as sans, faSerif as serif, signed, money } from './theme';
import {
  Backdrop, Card, Endcard, Grain, Sfx, Vignette, Words,
  clamp, easeOut, useProgress,
} from './ui';

/**
 * MAÇ KASETİ — "Şampiyonlar kaybettikleri maçı izler. Amatörler bir sonrakine koşar."
 *
 * Journal'ı "sıkıcı bir tablo" olmaktan çıkarıp profesyonellerin yaptığı bir
 * şeye — maçtan sonra kaset izlemeye — çeviriyor. Görüntü dili spor
 * yayınlarındaki kaset incelemesi: geri sarma, duraklatma, ekrana kalemle
 * çizilen daireler. İncelenen "görüntü" ise trader'ın kendi journal'ı.
 *
 * Kliplerdeki her ekran sitede var: işlem detayı (grafik fotoğrafı, not,
 * duygular, gerçekleşen R), işlem listesi, takvim, Disiplin sayfasının
 * işaretleri, prop sayacı, haber bildirimi. Kalemle çizilenler antrenörün —
 * yani izleyenin — kendi notu; uygulamanın iddiası değil.
 */

const W = 1920;
const H = 1080;

// ─── Kaset zamanı ─────────────────────────────────────────────────────────

type Mode = 'off' | 'rew' | 'play' | 'pause' | 'stop';

/** Kasetin o anki durumu: oynuyor mu, sarılıyor mu, duruyor mu. */
function tapeMode(t: number): Mode {
  if (t < MAC.rewind) return 'off';
  if (t < MAC.play) return 'rew';
  if (t >= MAC.stop) return 'stop';
  for (const c of MAC.clips) {
    if (t >= c.start && t < c.play) return 'rew';
    if (t >= c.freeze && t < c.end) return 'pause';
  }
  return 'play';
}

/** Kaset sayacı: oynarken ileri, sararken hızla geri, dururken sabit. */
function tapeTime(t: number) {
  const steps = 240;
  let tc = 14 * 3600 + 2 * 60 + 40;
  const dt = t / steps;
  for (let i = 0; i < steps; i++) {
    const m = tapeMode(i * dt);
    tc += m === 'play' ? dt : m === 'rew' ? -dt * 14 : 0;
  }
  return tc;
}

const tc = (s: number, fps: number) => {
  const f = Math.floor((s % 1) * fps);
  const x = Math.floor(s);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(x / 3600))}:${p(Math.floor(x / 60) % 60)}:${p(x % 60)}:${p(f)}`;
};

// ─── Kaset üstü katman ────────────────────────────────────────────────────

function TapeOverlay() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const mode = tapeMode(t);
  const blink = Math.floor(frame / 12) % 2 === 0;
  const label = { off: '', rew: '◀◀  عقب', play: '▶  پخش', pause: '❚❚  مکث', stop: '■  توقف' }[mode];
  const color = mode === 'pause' ? C.gold : mode === 'rew' ? C.lilac : C.text;
  const intro = interpolate(t, [MAC.insert, MAC.insert + 0.3], [0, 1], clamp);
  const progress = Math.min(1, Math.max(0, (tapeTime(t) - (14 * 3600 + 2 * 60)) / 60));
  const chroma: React.CSSProperties = { textShadow: '2px 0 rgba(255,60,60,0.45), -2px 0 rgba(60,160,255,0.45)' };
  return (
    <AbsoluteFill style={{ opacity: intro, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', right: 70, top: 50, fontFamily: sans, fontWeight: 600, fontSize: 32, color: 'rgba(255,255,255,0.7)', ...chroma }}>
        هفته 38 · فیلم مسابقه
      </div>
      <div style={{ position: 'absolute', left: 70, top: 52, fontFamily: sans, fontWeight: 600, fontSize: 30, color, textAlign: 'left', ...chroma }}>
        <span style={{ opacity: mode === 'pause' && !blink ? 0.25 : 1 }}>{label}</span>
        <div style={{ fontFamily: mono, fontSize: 24, color: 'rgba(255,255,255,0.55)', marginTop: 10, direction: 'ltr' }}>{tc(tapeTime(t), fps)}</div>
      </div>
      {/* Kayıt ışığı */}
      <div style={{ position: 'absolute', right: 70, top: 108, display: 'flex', alignItems: 'center', gap: 12, fontFamily: sans, fontSize: 24, color: 'rgba(255,255,255,0.45)' }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: C.red, opacity: blink ? 1 : 0.2, boxShadow: `0 0 12px ${C.red}` }} />
        بازبینی
      </div>
      {/* Sarma çubuğu */}
      <div style={{ position: 'absolute', left: 70, right: 70, bottom: 54, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2 }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', background: 'rgba(255,255,255,0.6)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', right: `${progress * 100}%`, top: -7, width: 18, height: 18, borderRadius: 9, background: C.text, transform: 'translateX(9px)' }} />
      </div>
    </AbsoluteFill>
  );
}

/** Tarama çizgileri ve sararken kayan izleme bozulması. */
function TapeTexture() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const rew = tapeMode(t) === 'rew';
  const bandY = ((frame * 37) % (H + 200)) - 100;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0px, rgba(255,255,255,0.028) 1px, transparent 1px, transparent 4px)' }} />
      {rew && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: bandY, height: 70, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.18), rgba(255,255,255,0.05), transparent)', filter: 'blur(2px)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: (bandY + 480) % H, height: 30, background: 'rgba(255,255,255,0.08)', filter: 'blur(3px)' }} />
        </>
      )}
    </AbsoluteFill>
  );
}

/** Kasetin "görüntüsü": sararken yatay bulanık ve titrek, dururken hafif soluk. */
function Footage({ children }: { children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const mode = tapeMode(t);
  const jitter = mode === 'rew' ? Math.sin(frame * 2.7) * 14 : 0;
  const filter = mode === 'rew' ? 'blur(3px) saturate(0.6) brightness(1.15)'
    : mode === 'pause' ? 'saturate(0.8) contrast(1.06)' : 'none';
  return (
    <AbsoluteFill style={{ filter, transform: `translateX(${jitter}px) skewX(${mode === 'rew' ? -4 : 0}deg)` }}>
      {children}
    </AbsoluteFill>
  );
}

// ─── Kalem (telestrator) ──────────────────────────────────────────────────

/** Elle çizilmiş bir daire: tam kapanmayan, hafif eğri. */
function DrawCircle({ cx, cy, rx, ry, at, dur = 0.45, rot = -6 }: { cx: number; cy: number; rx: number; ry: number; at: number; dur?: number; rot?: number }) {
  const p = useProgress(at, at + dur, Easing.out(Easing.quad));
  const pts: string[] = [];
  const turns = 1.12;
  for (let i = 0; i <= 80; i++) {
    const a = (i / 80) * Math.PI * 2 * turns - Math.PI * 0.6;
    const wob = 1 + 0.04 * Math.sin(i * 0.9) + (i / 80) * 0.06;
    pts.push(`${i ? 'L' : 'M'}${(cx + Math.cos(a) * rx * wob).toFixed(1)} ${(cy + Math.sin(a) * ry * wob).toFixed(1)}`);
  }
  const len = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2) * turns * 1.1;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <path d={pts.join(' ')} fill="none" stroke={C.gold} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - p)}
        transform={`rotate(${rot} ${cx} ${cy})`}
        style={{ filter: 'drop-shadow(0 0 10px rgba(240,180,41,0.55))' }} />
    </svg>
  );
}

/** Elle çizilmiş ok. */
function DrawArrow({ d, head, at, dur = 0.4 }: { d: string; head: string; at: number; dur?: number }) {
  const p = useProgress(at, at + dur, Easing.out(Easing.quad));
  const ph = useProgress(at + dur * 0.85, at + dur + 0.12);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <g style={{ filter: 'drop-shadow(0 0 10px rgba(240,180,41,0.55))' }} fill="none" stroke={C.gold} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        <path d={head} opacity={ph} />
      </g>
    </svg>
  );
}

/** Antrenörün kalemle yazdığı kısa not. */
function Scribble({ text, x, y, at, size = 44, rot = -4 }: { text: string; x: number; y: number; at: number; size?: number; rot?: number }) {
  const p = useProgress(at, at + 0.35);
  return (
    <div style={{
      position: 'absolute', right: x, top: y, fontFamily: serif, fontWeight: 600, fontSize: size, color: C.gold,
      opacity: p, transform: `rotate(${rot}deg) translateY(${(1 - p) * 10}px)`, whiteSpace: 'nowrap',
      textShadow: '0 0 18px rgba(240,180,41,0.45), 0 2px 10px rgba(0,0,0,0.8)',
    }}>{text}</div>
  );
}

/** Antrenörün cümlesi: alt yazı. */
function Subtitle({ text, from, to }: { text: string; from: number; to: number }) {
  const inP = useProgress(from, from + 0.35);
  const outP = useProgress(to - 0.3, to);
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 108, textAlign: 'center', opacity: inP * (1 - outP),
      transform: `translateY(${(1 - inP) * 10}px)`,
    }}>
      <span style={{
        fontFamily: sans, fontWeight: 500, fontSize: 50, color: C.text, background: 'rgba(0,0,0,0.55)',
        padding: '10px 28px', borderRadius: 10, boxDecorationBreak: 'clone',
      }}>— {text}</span>
    </div>
  );
}

/** Kalem çizimlerini yatay aynalar: sağdan sola düzende daireler aynı öğelerin üstüne düşsün. */
function Mirror({ children }: { children: React.ReactNode }) {
  return <div style={{ position: 'absolute', inset: 0, transform: 'scaleX(-1)', pointerEvents: 'none' }}>{children}</div>;
}

// ─── Grafik ───────────────────────────────────────────────────────────────

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Kapanışları verilen bir yoldan mum üretir. */
function candlesFrom(path: number[], seed: number, vol: number) {
  const r = rng(seed);
  let prev = path[0];
  return path.map((c0) => {
    const c = c0 + (r() - 0.5) * vol;
    const o = prev;
    const h = Math.max(o, c) + r() * vol * 0.7;
    const l = Math.min(o, c) - r() * vol * 0.7;
    prev = c;
    return { o, h, l, c };
  });
}

function CandleChart({ candles, w, h, lo, hi, reveal = 1, children }: {
  candles: { o: number; h: number; l: number; c: number }[]; w: number; h: number; lo: number; hi: number; reveal?: number;
  children?: (y: (p: number) => number) => React.ReactNode;
}) {
  const y = (p: number) => ((hi - p) / (hi - lo)) * h;
  const cw = w / candles.length;
  const n = Math.floor(candles.length * reveal);
  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'hidden' }}>
      {[0.2, 0.4, 0.6, 0.8].map(f => <line key={f} x1={0} x2={w} y1={h * f} y2={h * f} stroke="rgba(255,255,255,0.05)" />)}
      {candles.slice(0, n).map((k, i) => {
        const col = k.c >= k.o ? C.green : C.red;
        const x = i * cw;
        return (
          <g key={i}>
            <line x1={x + cw / 2} x2={x + cw / 2} y1={y(k.h)} y2={y(k.l)} stroke={col} strokeWidth={2} />
            <rect x={x + cw * 0.2} width={cw * 0.6} y={y(Math.max(k.o, k.c))} height={Math.max(2, Math.abs(y(k.o) - y(k.c)))} fill={col} rx={2} />
          </g>
        );
      })}
      {children?.(y)}
    </svg>
  );
}

const Level = ({ y, w, color, label, dash = '10 8', op = 1, strike = false }: { y: number; w: number; color: string; label: string; dash?: string; op?: number; strike?: boolean }) => (
  <g opacity={op}>
    <line x1={0} x2={w} y1={y} y2={y} stroke={color} strokeWidth={2.5} strokeDasharray={dash} />
    <rect x={10} y={y - 36} width={label.length * 14.5 + 26} height={30} rx={6} fill={color} opacity={0.2} />
    <text x={23} y={y - 15} fill={color} fontFamily={mono} fontSize={21} textDecoration={strike ? 'line-through' : undefined}>{label}</text>
  </g>
);

// ─── Klip 1: işlem detayı ─────────────────────────────────────────────────

// Satış: giriş 4311, planlanan stop 4318,50; stop 4324'e çekilmiş ve orada
// patlamış. Risk $202,50 (0,27 lot), zarar $351 → −1,7R. Rakamlar birbirini tutuyor.
const C1 = (() => {
  const n = 42;
  const path = Array.from({ length: n }, (_, i) => {
    if (i < 14) return 4314 - i * 0.22 + Math.sin(i * 0.8) * 0.8;
    if (i < 18) return 4311 - (i - 14) * 0.3;
    return 4310 + Math.pow((i - 18) / (n - 19), 1.25) * 14.2;
  });
  return candlesFrom(path, 7, 1.8);
})();

function ClipTradeDetail({ c }: { c: typeof MAC.clips[number] }) {
  const reveal = useProgress(c.play - 0.1, c.freeze, Easing.linear);
  const cw = 860, ch = 500;
  return (
    <div style={{ position: 'absolute', right: 150, top: 190, display: 'flex', gap: 50 }}>
      <Card style={{ padding: 22, borderRadius: 24 }}>
        <div style={{ fontFamily: mono, fontSize: 20, color: C.faint, letterSpacing: 0, margin: '4px 6px 14px' }}>نمودار بعد از معامله</div>
        <div style={{ borderRadius: 14, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', direction: 'ltr' }}>
          <CandleChart candles={C1} w={cw} h={ch} lo={4301} hi={4328} reveal={0.35 + 0.65 * reveal}>
            {(y) => (
              <>
                <Level y={y(4318.5)} w={cw} color={C.red} label="SL 4318.50" op={0.55} strike />
                <Level y={y(4324)} w={cw} color={C.red} label="SL 4324.00" dash="none" />
                <Level y={y(4311)} w={cw} color="rgba(255,255,255,0.8)" label="SELL · 4311.00" dash="4 6" />
              </>
            )}
          </CandleChart>
        </div>
      </Card>
      <div style={{ width: 520, paddingTop: 12, fontFamily: sans }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 48, fontWeight: 600, color: C.text }}>XAUUSD</span>
          <span style={{ fontSize: 26, fontWeight: 500, color: C.red, background: 'rgba(248,113,113,0.1)', padding: '6px 16px', borderRadius: 10 }}>Sell</span>
        </div>
        <div style={{ fontSize: 26, color: C.faint, marginTop: 8 }}>17 سپتامبر · 14:02</div>
        <div style={{ display: 'flex', gap: 60, marginTop: 40 }}>
          <div>
            <div style={{ fontSize: 20, letterSpacing: 0, color: C.faint }}>ریسک</div>
            <div style={{ fontFamily: mono, fontSize: 38, color: C.text, marginTop: 8, direction: 'ltr', textAlign: 'right' }}>$202.50</div>
          </div>
          <div>
            <div style={{ fontSize: 20, letterSpacing: 0, color: C.faint }}>نتیجه</div>
            <div style={{ fontFamily: mono, fontSize: 38, color: C.red, marginTop: 8, direction: 'ltr', textAlign: 'right' }}>−$351.00</div>
          </div>
        </div>
        <div style={{ fontFamily: mono, fontSize: 120, color: C.red, letterSpacing: '-0.04em', marginTop: 26, lineHeight: 1, direction: 'ltr', textAlign: 'right' }}>−1.7R</div>
        <div style={{ fontSize: 20, letterSpacing: 0, color: C.faint, marginTop: 40 }}>یادداشت تو</div>
        <div style={{ fontFamily: serif, fontSize: 34, color: 'rgba(255,255,255,0.8)', marginTop: 10, lineHeight: 1.5 }}>
          «حد ضرر را کمی بازتر کردم، برمی‌گشت.»
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
          {['بیش از حد مطمئن', 'بی‌صبر'].map(e => (
            <span key={e} style={{ fontSize: 22, color: C.red, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 999, padding: '7px 18px' }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Klip 2: işlem listesi ────────────────────────────────────────────────

const LIST: [string, string, 'Buy' | 'Sell', string, number][] = [
  ['13:40', 'EURUSD', 'Buy', '+1.0R', 200],
  ['14:02', 'XAUUSD', 'Sell', '−1.0R', -200],
  ['14:06', 'XAUUSD', 'Buy', '−1.3R', -260],
  ['14:19', 'XAUUSD', 'Sell', '−1.0R', -200],
  ['14:27', 'XAUUSD', 'Buy', '−0.9R', -180],
];

function ListRow({ r, i, start }: { r: typeof LIST[number]; i: number; start: number }) {
  const p = useProgress(start + i * 0.22, start + i * 0.22 + 0.35);
  const [time, sym, side, R, pnl] = r;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 34, padding: '22px 26px', borderRadius: 16, opacity: p * (i === 0 ? 0.5 : 1), transform: `translateY(${(1 - p) * 14}px)`, fontFamily: sans }}>
      <span style={{ fontFamily: mono, fontSize: 28, color: C.faint, width: 100 }}>{time}</span>
      <span style={{ fontSize: 36, fontWeight: 500, color: C.text, width: 190 }}>{sym}</span>
      <span style={{ fontSize: 32, fontWeight: 500, color: side === 'Buy' ? C.green : C.red, width: 90 }}>{side}</span>
      <span style={{ fontFamily: mono, fontSize: 30, color: 'rgba(255,255,255,0.45)', width: 120, textAlign: 'left', direction: 'ltr' }}>{R}</span>
      <span style={{ marginInlineStart: 'auto', fontFamily: mono, fontSize: 36, fontWeight: 500, color: pnl >= 0 ? C.green : C.red }}><span style={{ direction: 'ltr', display: 'inline-block' }}>{signed(pnl)}.00</span></span>
    </div>
  );
}

function FlagMini({ title, desc, count, pnl, at, left, top }: { title: string; desc: string; count: number; pnl: number; at: number; left: number; top: number }) {
  const p = useProgress(at, at + 0.55);
  return (
    <div style={{ position: 'absolute', right: left, top, opacity: p, transform: `translateX(${(1 - p) * -40}px)` }}>
      <Card style={{ width: 560, padding: '30px 34px' }}>
        <div style={{ fontSize: 20, letterSpacing: 0, color: C.faint, fontWeight: 500 }}>انضباط · علامت‌خورده</div>
        <div style={{ display: 'flex', gap: 24, marginTop: 22, alignItems: 'flex-start' }}>
          <div style={{ fontFamily: mono, fontSize: 64, lineHeight: 1, color: C.amber, width: 84, textAlign: 'left' }}>{count}</div>
          <div>
            <div style={{ fontSize: 34, fontWeight: 500, color: C.text }}>{title}</div>
            <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.42)', marginTop: 8, lineHeight: 1.4 }}>{desc}</div>
          </div>
        </div>
        <div style={{ height: 1, background: C.line, margin: '24px 0 18px' }} />
        <div style={{ fontFamily: mono, fontSize: 56, color: C.red, textAlign: 'left', letterSpacing: '-0.03em', direction: 'ltr' }}>{signed(pnl)}</div>
      </Card>
    </div>
  );
}

function ClipList({ c }: { c: typeof MAC.clips[number] }) {
  return (
    <div style={{ position: 'absolute', right: 150, top: 180 }}>
      <Card style={{ width: 1000, padding: '34px 30px' }}>
        <div style={{ fontFamily: serif, fontSize: 44, color: C.text, padding: '0 26px 10px' }}>پنجشنبه، 17 سپتامبر</div>
        {LIST.map((r, i) => <ListRow key={i} r={r} i={i} start={c.play - 0.1} />)}
      </Card>
    </div>
  );
}

// ─── Klip 3: takvim ───────────────────────────────────────────────────────

// Eylül 2026 bir salı başlıyor. Hafta sonları boş; 17 Eylül: 11 işlem.
const DAYS: Record<number, [number, number]> = {
  1: [120, 3], 2: [-90, 2], 3: [210, 3], 4: [60, 2],
  7: [180, 3], 8: [-140, 4], 9: [95, 2], 10: [-60, 3], 11: [240, 3],
  14: [-110, 3], 15: [160, 2], 16: [-220, 5], 17: [-640, 11], 18: [-180, 7],
  21: [130, 3], 22: [70, 2], 23: [-80, 3], 24: [150, 2], 25: [90, 2],
};

function ClipCalendar({ c }: { c: typeof MAC.clips[number] }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cellW = 140, cellH = 108, gap = 10;
  const heads = ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه', 'یکشنبه'];
  const cells: React.ReactNode[] = [];
  const offset = 1; // 1 Eylül salı → pazartesi sütunu boş
  for (let i = 0; i < 35; i++) {
    const day = i - offset + 1;
    const st = DAYS[day];
    const p = interpolate(frame, [(c.play + i * 0.025) * fps, (c.play + i * 0.025 + 0.3) * fps], [0, 1], clamp);
    const inMonth = day >= 1 && day <= 30;
    const bg = !st ? 'rgba(255,255,255,0.025)' : st[0] >= 0 ? `rgba(52,211,153,${0.08 + Math.min(0.25, st[0] / 900)})` : `rgba(248,113,113,${0.08 + Math.min(0.35, -st[0] / 900)})`;
    const col = !st ? 'rgba(255,255,255,0.35)' : st[0] >= 0 ? C.green : C.red;
    cells.push(
      <div key={i} style={{ width: cellW, height: cellH, borderRadius: 16, background: inMonth ? bg : 'transparent', padding: 12, display: 'flex', flexDirection: 'column', opacity: p, fontFamily: sans }}>
        {inMonth && <span style={{ fontSize: 24, fontWeight: 600, color: col }}>{day}</span>}
        {st && (
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 600, color: col, direction: 'ltr', textAlign: 'right' }}>{signed(st[0])}</div>
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{st[1]} معامله</div>
          </div>
        )}
      </div>,
    );
  }
  return (
    <div style={{ position: 'absolute', right: 150, top: 140 }}>
      <Card style={{ padding: '30px 34px' }}>
        <div style={{ fontFamily: serif, fontSize: 44, color: C.text, marginBottom: 18 }}>سپتامبر 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${cellW}px)`, gap }}>
          {heads.map(h => <div key={h} style={{ fontSize: 22, color: C.faint, fontFamily: sans, paddingInlineStart: 12 }}>{h}</div>)}
          {cells}
        </div>
      </Card>
    </div>
  );
}

// ─── Boksör kareleri ──────────────────────────────────────────────────────

/**
 * Durağan bir kareyi sahneye çevirir: yavaş bir kamera hareketi (yakınlaşma
 * ve kayma). Kareler yapay zekâyla üretildi (Higgsfield, Nano Banana Pro);
 * hareketi kod veriyor. Gerçek video çekimi kredi istiyordu, bu yol istemiyor.
 */
function Still({ src, from, to, s0, s1, o0, o1, opacity = 1, fadeIn = 0.6, fadeOut = 0.4 }: {
  src: string; from: number; to: number; s0: number; s1: number;
  o0: [number, number]; o1: [number, number]; opacity?: number; fadeIn?: number; fadeOut?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p = interpolate(t, [from, to], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const sc = s0 + (s1 - s0) * p;
  const ox = o0[0] + (o1[0] - o0[0]) * p;
  const oy = o0[1] + (o1[1] - o0[1]) * p;
  const fi = Math.max(0.01, fadeIn), fo = Math.max(0.01, fadeOut);
  const a = interpolate(t, [from, from + fi, to - fo, to], [0, 1, 1, 0], clamp) * opacity;
  return (
    <AbsoluteFill style={{ opacity: a, overflow: 'hidden' }}>
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${sc})`, transformOrigin: `${ox}% ${oy}%` }} />
    </AbsoluteFill>
  );
}

/**
 * Hareketli çekim (Higgsfield, Kling 3.0): boksör karelerinden üretildi, o
 * yüzden yüz aynı kalıyor. Sesi kapalı — sesi müzik motoru veriyor.
 * `rate` 1'den küçükse ağır çekim: 5 saniyelik çekim daha uzun sahneye yayılıyor.
 */
function Clip({ src, from, to, rate = 1, fadeIn = 0.3, fadeOut = 0.3, scale = 1.02 }: {
  src: string; from: number; to: number; rate?: number; fadeIn?: number; fadeOut?: number; scale?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const a = interpolate(t, [from, from + Math.max(0.01, fadeIn), to - Math.max(0.01, fadeOut), to], [0, 1, 1, 0], clamp);
  return (
    <Sequence from={Math.round(from * fps)} durationInFrames={Math.round((to - from) * fps)} layout="none">
      <AbsoluteFill style={{ opacity: a, overflow: 'hidden' }}>
        <OffthreadVideo src={staticFile(src)} muted playbackRate={rate}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})` }} />
      </AbsoluteFill>
    </Sequence>
  );
}

// ─── Açılış görüntüsü ─────────────────────────────────────────────────────

/** Kaset takılırken ekrandaki kar. */
function Snow() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const op = interpolate(t, [MAC.insert, MAC.insert + 0.1, MAC.rewind, MAC.rewind + 0.3], [0, 0.5, 0.5, 0], clamp);
  if (op <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <svg width="100%" height="100%">
        <filter id={`snow-${frame}`}><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed={frame} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter={`url(#snow-${frame})`} />
      </svg>
    </AbsoluteFill>
  );
}

/** Kaset durunca eski televizyon kapanışı: görüntü bir çizgiye, sonra noktaya. */
function CrtOff({ children }: { children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sy = interpolate(t, [MAC.stop + 0.05, MAC.stop + 0.3], [1, 0.006], { ...clamp, easing: Easing.in(Easing.cubic) });
  const sx = interpolate(t, [MAC.stop + 0.3, MAC.stop + 0.55], [1, 0.002], { ...clamp, easing: Easing.in(Easing.cubic) });
  const glow = interpolate(t, [MAC.stop + 0.2, MAC.stop + 0.35, MAC.stop + 0.7], [0, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${sx}, ${sy})`, filter: glow > 0 ? `brightness(${1 + glow * 3})` : undefined }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── Montaj ───────────────────────────────────────────────────────────────

function MontageItem({ i, caption, children, scale = 1 }: { i: number; caption: string; children: React.ReactNode; scale?: number }) {
  const at = MAC.montage + i * MAC.beat * 4;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = frame - at * fps;
  const pop = interpolate(k, [0, 7], [1.06, 1], { ...clamp, easing: easeOut });
  const flash = interpolate(k, [0, 1, 6], [0.35, 0.35, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${pop})` }}>
        <div style={{ position: 'absolute', top: 150, left: 0, right: 0 }}>
          <Words text={caption} family={serif} weight={600} letterSpacing="0" start={at} size={72} stagger={0.05} dur={0.35} />
        </div>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 170 }}>
          {/* 1920 genişlikte kartlar küçük kalıyordu; her biri kendi boyuna göre büyütülüyor. */}
          <div style={{ transform: `scale(${scale})` }}>{children}</div>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(255,255,255,${flash})`, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
}

function M1({ at }: { at: number }) {
  const filled = useProgress(at + 0.9, at + 1.3);
  return (
    <Card style={{ width: 1100, padding: '26px 30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 34, fontFamily: sans, padding: '6px 10px' }}>
        <span style={{ fontFamily: mono, fontSize: 30, color: C.faint }}>09:14</span>
        <span style={{ fontSize: 40, fontWeight: 500, color: C.text }}>GBPUSD</span>
        <span style={{ fontSize: 34, fontWeight: 500, color: C.green }}>Buy</span>
        <span style={{ fontFamily: mono, fontSize: 32, color: 'rgba(255,255,255,0.45)', opacity: filled, direction: 'ltr' }}>+1.8R</span>
        <span style={{ marginInlineStart: 'auto', position: 'relative', height: 50, display: 'flex', alignItems: 'center' }}>
          <span style={{ opacity: 1 - filled, fontSize: 26, fontWeight: 500, color: C.amber, background: 'rgba(251,191,36,0.12)', borderRadius: 999, padding: '9px 22px' }}>ناتمام</span>
          <span style={{ position: 'absolute', left: 0, opacity: filled, fontFamily: mono, fontSize: 40, fontWeight: 500, color: C.green }}>+$364.50</span>
        </span>
      </div>
    </Card>
  );
}

function M2({ at }: { at: number }) {
  const rows: [number, string, number][] = [[14, 'بازگشت فوری', -1380], [6, 'افزایش ریسک', -2240], [29, 'معامله بیش از حد', -940]];
  return (
    <Card style={{ width: 1100, padding: '20px 34px' }}>
      {rows.map(([n, title, pnl], i) => {
        const p = useProgress(at + 0.2 + i * 0.18, at + 0.5 + i * 0.18);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 30, padding: '20px 0', borderTop: i ? `1px solid ${C.line}` : 'none', opacity: p, transform: `translateX(${(1 - p) * 30}px)`, fontFamily: sans }}>
            <span style={{ fontFamily: mono, fontSize: 44, color: C.amber, width: 70, textAlign: 'left' }}>{n}</span>
            <span style={{ fontSize: 38, fontWeight: 500, color: C.text }}>{title}</span>
            <span style={{ marginInlineStart: 'auto', fontFamily: mono, fontSize: 40, color: C.red, direction: 'ltr' }}>{signed(pnl)}</span>
          </div>
        );
      })}
    </Card>
  );
}

function M3({ at }: { at: number }) {
  const cells: [string, number, number, 'target' | 'loss', string][] = [
    ['تا هدف', 1000, 640, 'target', 'هدف ⁦$1,000⁩'],
    ['تا حد امروز', 500, 410, 'loss', 'امروز ⁦−$90⁩'],
    ['تا ضرر کل', 1000, 870, 'loss', 'کف ⁦$9,000⁩'],
  ];
  const p = useProgress(at + 0.2, at + 1.3, Easing.out(Easing.cubic));
  return (
    <Card style={{ width: 1500, display: 'flex', gap: 60, padding: '40px 50px' }}>
      {cells.map(([label, limit, left, kind, note]) => {
        const now = limit - (limit - left) * p;
        const ratio = (limit - now) / limit;
        const color = kind === 'target' ? C.gold : ratio >= 0.5 ? C.amber : C.green;
        return (
          <div key={label} style={{ flex: 1, fontFamily: sans }}>
            <div style={{ fontSize: 22, letterSpacing: 0, color: C.faint, fontWeight: 500 }}>{label}</div>
            <div style={{ fontFamily: mono, fontSize: 62, color, marginTop: 14, letterSpacing: '-0.03em', direction: 'ltr', textAlign: 'right' }}>{money(now)}</div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.07)', marginTop: 14, overflow: 'hidden' }}>
              <div style={{ width: `${ratio * 100}%`, height: '100%', background: color, borderRadius: 4, boxShadow: `0 0 16px ${color}` }} />
            </div>
            <div style={{ fontFamily: sans, fontSize: 22, color: C.faint, marginTop: 12 }}>{note}</div>
          </div>
        );
      })}
    </Card>
  );
}

function M4({ at }: { at: number }) {
  const p = useProgress(at + 0.15, at + 0.6, Easing.out(Easing.back(1.4)));
  return (
    <div style={{ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * -60}px)` }}>
      <div style={{
        width: 980, display: 'flex', gap: 28, alignItems: 'center', padding: '30px 36px', borderRadius: 28,
        background: 'rgba(40,40,46,0.88)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 90px rgba(0,0,0,0.6)', fontFamily: sans,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ width: 96, height: 96, borderRadius: 22, background: '#0b0b0e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 70, color: C.gold, lineHeight: 1 }}>J</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.5)' }}>Simple Trading Journal</span>
            <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.4)' }}>اکنون</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, color: C.text, marginTop: 6 }}>خبر مهم نزدیک است</div>
          <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
            <span style={{ color: C.red }}>●</span> Non-Farm Employment Change · 60 دقیقه دیگر
          </div>
        </div>
      </div>
    </div>
  );
}

const PHOTO_A = candlesFrom(Array.from({ length: 30 }, (_, i) => 1.2710 + Math.sin(i / 4) * 0.0012 - (i > 20 ? (i - 20) * 0.0002 : 0)), 21, 0.0009);
const PHOTO_B = candlesFrom(Array.from({ length: 30 }, (_, i) => 1.2700 + i * 0.00022 + Math.sin(i / 3) * 0.0006), 22, 0.0008);

function M5({ at }: { at: number }) {
  const p1 = useProgress(at + 0.1, at + 0.45);
  const p2 = useProgress(at + 0.3, at + 0.65);
  const pn = useProgress(at + 0.6, at + 1.0);
  const Frame = ({ label, candles, p, lo, hi }: { label: string; candles: ReturnType<typeof candlesFrom>; p: number; lo: number; hi: number }) => (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
      <div style={{ fontFamily: sans, fontSize: 22, color: C.faint, marginBottom: 10 }}>{label}</div>
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', direction: 'ltr' }}>
        <CandleChart candles={candles} w={600} h={300} lo={lo} hi={hi} />
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
      <div style={{ display: 'flex', gap: 40 }}>
        <Frame label="قبل از معامله" candles={PHOTO_A} p={p1} lo={1.2680} hi={1.2740} />
        <Frame label="بعد از معامله" candles={PHOTO_B} p={p2} lo={1.2685} hi={1.2775} />
      </div>
      <div style={{ opacity: pn, fontFamily: serif, fontSize: 38, color: 'rgba(255,255,255,0.8)' }}>
        «منتظر باز شدن لندن ماندم. به برنامه‌ام پایبند ماندم.»
      </div>
    </div>
  );
}

function M6({ at }: { at: number }) {
  const week: [string, number, number][] = [['دوشنبه', 240, 2], ['سه‌شنبه', 180, 2], ['چهارشنبه', -60, 1], ['پنجشنبه', 310, 2], ['جمعه', 150, 1]];
  return (
    <div style={{ display: 'flex', gap: 18 }}>
      {week.map(([d, pnl, n], i) => {
        const p = useProgress(at + 0.15 + i * 0.1, at + 0.45 + i * 0.1);
        const col = pnl >= 0 ? C.green : C.red;
        return (
          <div key={d} style={{
            width: 250, height: 230, borderRadius: 22, padding: 22, display: 'flex', flexDirection: 'column', fontFamily: sans,
            background: pnl >= 0 ? 'rgba(52,211,153,0.14)' : 'rgba(248,113,113,0.12)', opacity: p, transform: `translateY(${(1 - p) * 30}px)`,
          }}>
            <span style={{ fontSize: 30, fontWeight: 600, color: col }}>{d}</span>
            <span style={{ marginTop: 'auto', fontFamily: mono, fontSize: 44, fontWeight: 600, color: col, direction: 'ltr', textAlign: 'right' }}>{signed(pnl)}</span>
            <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{n} معامله</span>
          </div>
        );
      })}
    </div>
  );
}

function WeekCompare() {
  const s = MAC.week;
  const p = useProgress(s + 0.9, s + 2.0, Easing.out(Easing.cubic));
  const Bar = ({ label, pnl, n, color, max }: { label: string; pnl: number; n: number; color: string; max: number }) => (
    <div style={{ fontFamily: sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 34, fontWeight: 500, color: C.text }}>{label}</span>
        <span style={{ fontSize: 24, color: C.faint }}>{n} معامله</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 18 }}>
        <div style={{ flex: 1, height: 20, borderRadius: 10, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{ width: `${Math.max(1.5, (Math.abs(pnl) / max) * 100) * p}%`, height: '100%', background: color, borderRadius: 10, boxShadow: `0 0 26px ${color}` }} />
        </div>
        <span style={{ fontFamily: mono, fontSize: 58, color, width: 280, textAlign: 'left', letterSpacing: '-0.03em', direction: 'ltr' }}>{signed(pnl * p)}</span>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 150 }}>
      <Words text="سه هفته بعد." family={serif} weight={600} start={s + 0.05} size={84} stagger={0.1} letterSpacing="0" />
      <div style={{ height: 60 }} />
      <div style={{ opacity: useProgress(s + 0.5, s + 0.9) }}>
        <Card style={{ width: 1300, display: 'flex', flexDirection: 'column', gap: 44, padding: '44px 54px', background: 'rgba(12,12,16,0.74)', backdropFilter: 'blur(16px)' }}>
          <Bar label="معاملات مطابق قوانین" pnl={1860} n={31} color={C.green} max={1860} />
          <Bar label="معاملات علامت‌خورده" pnl={-120} n={2} color={C.red} max={1860} />
        </Card>
      </div>
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

const [K1, K2, K3] = MAC.clips;

export function MacFa({ music = true }: { music?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const champDim = interpolate(t, [MAC.hit2 - 0.05, MAC.hit2 + 0.35], [1, 0.4], clamp);
  const k = frame - Math.round(MAC.hit1 * fps);
  const k2 = frame - Math.round(MAC.hit2 * fps);
  const shake = (k >= 0 && k < 10 ? Math.sin(k * 2.4) * (10 - k) * 1.4 : 0) + (k2 >= 0 && k2 < 12 ? Math.sin(k2 * 2.4) * (12 - k2) * 1.8 : 0);
  const beats = Array.from({ length: 6 }, (_, i) => MAC.montage + i * MAC.beat * 4);

  return (
    <AbsoluteFill style={{ background: C.bg, direction: 'rtl' }}>
      {music && <Html5Audio src={staticFile('music/mac.wav')} volume={0.9} />}
      <Backdrop glow={t < MAC.stop ? 0.5 : t < MAC.montage ? 0.25 : 1} gold={t >= MAC.end ? 1 : 0} />

      {/* ── Kaset ── */}
      <Window from={0} to={MAC.stop + 0.8}>
        <CrtOff>
          <Footage>
            {/* Açılış: karanlık salonda kaybettiği maçı izleyen boksör. Kamera
                "Her maçtan sonra…"da geniş, "Kaseti açarlar"da televizyona yaklaşmış. */}
            <Window from={MAC.rewind} to={K1.start}>
              <Clip src="clips/boxer_tv.mp4" from={MAC.rewind} to={MAC.sub2 + 0.05} fadeIn={0.25} fadeOut={0.15} />
              {/* "Kaseti açarlar": aynı an, başka bir salon — gece journal'ını açan trader. */}
              <Clip src="clips/trader_night.mp4" from={MAC.sub2 - 0.1} to={K1.start} fadeIn={0.15} fadeOut={0.3} />
            </Window>
            <Window from={K1.start} to={K1.end}>
              <ClipTradeDetail c={K1} />
              <Mirror><DrawCircle cx={1278} cy={538} rx={200} ry={70} at={K1.draw} /></Mirror>
              <Mirror><DrawArrow d="M 700 430 C 684 400, 690 368, 702 338" head="M 680 360 L 703 334 L 724 360" at={K1.draw + 0.45} /></Mirror>
              <Scribble text="۱٫۷ برابرِ برنامه‌ات" x={1492} y={520} at={K1.data} size={40} />
            </Window>
            <Window from={K2.start} to={K2.end}>
              <ClipList c={K2} />
              <Mirror><DrawCircle cx={256} cy={452} rx={82} ry={112} at={K2.draw} rot={0} /></Mirror>
              <Mirror><DrawArrow d="M 158 404 C 92 414, 92 488, 158 500" head="M 134 482 L 160 500 L 134 518" at={K2.draw + 0.4} /></Mirror>
              <Scribble text="۴ دقیقه" x={24} y={528} at={K2.draw + 0.75} size={38} rot={6} />
              <FlagMini at={K2.data} left={1200} top={260} title="بازگشت فوری" desc="معاملات باز شده تا ۱۵ دقیقه پس از ضرر" count={14} pnl={-1380} />
            </Window>
            {/* Son klip, televizyon kapanırken de ekranda kalmalı: kapanış onu sıkıştırıyor. */}
            <Window from={K3.start} to={MAC.stop + 0.8}>
              <ClipCalendar c={K3} />
              <Mirror><DrawCircle cx={704} cy={571} rx={96} ry={72} at={K3.draw} /></Mirror>
              <Scribble text="→ ۱۱ معامله!" x={946} y={540} at={K3.draw + 0.5} size={46} rot={5} />
              <FlagMini at={K3.data} left={1316} top={330} title="معامله بیش از حد" desc="روزهایی با بیش از دو برابر معاملات معمول" count={29} pnl={-940} />
            </Window>
          </Footage>
          <Snow />
          <TapeTexture />
          <TapeOverlay />
          <Subtitle text="بعد از هر مسابقه همین کار را می‌کنند." from={MAC.sub1} to={MAC.sub2 - 0.1} />
          <Subtitle text="فیلم مسابقه را می‌گذارند." from={MAC.sub2} to={K1.start} />
          <Subtitle text="اینجا. حد ضررت را دورتر بردی." from={K1.sub} to={K1.end} />
          <Subtitle text="باختی. چهار دقیقه بعد دوباره وارد شدی." from={K2.sub} to={K2.end} />
          <Subtitle text="یازده معامله در یک روز." from={K3.sub} to={MAC.stop} />
        </CrtOff>
      </Window>

      {/* ── Dönüş ── */}
      {/* Kaset kapanınca: boksörün bakışı. Önce tek başına, sonra cümle
          gelirken geri çekiliyor; "Amatörler"de sert bir kesmeyle siyaha. */}
      <Window from={MAC.stop + 0.6} to={MAC.champ2}>
        <Clip src="clips/boxer_eyes.mp4" from={MAC.stop + 0.6} to={MAC.champ2} rate={0.97} fadeIn={0.5} fadeOut={0.01} />
        <AbsoluteFill style={{ background: `rgba(5,5,7,${interpolate(t, [MAC.champ1 - 0.1, MAC.champ1 + 0.5], [0.1, 0.66], clamp)})` }} />
      </Window>
      <Window from={MAC.champ1} to={MAC.montage}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `translate(${shake}px, ${shake * 0.4}px)`, opacity: interpolate(t, [MAC.montage - 0.35, MAC.montage], [1, 0], clamp) }}>
          <div style={{ opacity: champDim }}>
            <Words text={'قهرمان‌ها\nشکستشان را تماشا می‌کنند.'} family={serif} weight={600} letterSpacing="0" lineHeight={1.45} start={MAC.champ1} size={108} stagger={0.28} dur={0.6} accent={['تماشا']} />
          </div>
          <div style={{ height: 50 }} />
          <Words text={'آماتورها\nسراغ مسابقه‌ی بعدی می‌دوند.'} family={serif} weight={600} letterSpacing="0" lineHeight={1.45} start={MAC.champ2} size={108} stagger={0.28} dur={0.6} accentColor={C.red} accent={['می‌دوند']} />
        </AbsoluteFill>
      </Window>

      {/* ── Montaj ── */}
      {[
        ['هر معامله خودبه‌خود ثبت می‌شود.', M1, 1.4],
        ['هر عادت بد علامت می‌خورد.', M2, 1.2],
        ['حد مجازت همیشه جلوی چشمت است.', M3, 1.08],
        ['قبل از خبرهای قرمز خبرت می‌کند.', M4, 1.3],
        ['نمودار و یادداشتت، همه سر جایش.', M5, 1.2],
        ['هفته‌ات را در یک نگاه ببین.', M6, 1.3],
      ].map(([cap, Comp, sc], i) => (
        <Window key={i} from={beats[i]} to={i < 5 ? beats[i + 1] : MAC.week}>
          <MontageItem i={i} caption={cap as string} scale={sc as number}>
            {React.createElement(Comp as React.FC<{ at: number }>, { at: beats[i] })}
          </MontageItem>
        </Window>
      ))}

      {/* Üç hafta sonra: aynı boksör, bu kez ringe yürüyor. Önce bir an tam
          parlaklıkta — hikâyenin karşılığı — sonra karta yer açmak için
          kararıyor; logonun arkasında da çok hafif kalıyor. */}
      <Window from={MAC.week} to={MAC.duration}>
        {/* Ağır çekim: beş saniyelik yürüyüş, karşılaştırma ve kapanış boyunca sürüyor. */}
        <Clip src="clips/boxer_ring.mp4" from={MAC.week} to={MAC.duration} rate={0.5} fadeIn={0.35} fadeOut={1.2} />
        <AbsoluteFill style={{ background: `rgba(5,5,7,${interpolate(t, [MAC.week + 0.7, MAC.week + 1.2, MAC.end - 0.3, MAC.end + 0.4], [0.08, 0.64, 0.64, 0.86], clamp)})` }} />
      </Window>
      <Window from={MAC.week} to={MAC.end}>
        <WeekCompare />
      </Window>

      <Window from={MAC.end} to={MAC.duration}>
        <Endcard start={MAC.end} line="مبارزه‌ات را دوباره ببین." cta="رایگان شروع کنید" lineFamily={serif} ctaFamily={sans} logoWidth={1150} gap={64} />
      </Window>

      <Vignette strength={0.75} />
      <Grain opacity={0.1} />
      <Sounds />
    </AbsoluteFill>
  );
}

function Sounds() {
  const out: React.ReactNode[] = [];
  out.push(<Sfx key="hiss" src="sfx/hiss.wav" at={MAC.insert} volume={0.5} />);
  for (let h = 1; h < 7; h++) out.push(<Sfx key={`hiss${h}`} src="sfx/hiss.wav" at={MAC.insert + h * 4} volume={0.5} />);
  out.push(<Sfx key="ins" src="sfx/clack.wav" at={MAC.insert} volume={0.9} />);
  out.push(<Sfx key="rw" src="sfx/rewind.wav" at={MAC.rewind} volume={0.6} />);
  out.push(<Sfx key="pl" src="sfx/clack.wav" at={MAC.play - 0.05} volume={0.8} />);
  MAC.clips.forEach((c, i) => {
    out.push(<Sfx key={`rw${i}`} src="sfx/rewind.wav" at={c.start} volume={0.35} />);
    out.push(<Sfx key={`pl${i}`} src="sfx/clack.wav" at={c.play - 0.05} volume={0.6} />);
    out.push(<Sfx key={`fr${i}`} src="sfx/clack.wav" at={c.freeze - 0.03} volume={0.9} />);
    out.push(<Sfx key={`mk${i}`} src="sfx/marker.wav" at={c.draw} volume={0.9} />);
    out.push(<Sfx key={`mk2${i}`} src="sfx/marker.wav" at={c.draw + 0.45} volume={0.7} />);
    out.push(<Sfx key={`dt${i}`} src="sfx/thud.wav" at={c.data} volume={0.55} />);
  });
  out.push(<Sfx key="stop" src="sfx/tapestop.wav" at={MAC.stop} volume={0.8} />);
  out.push(<Sfx key="stopc" src="sfx/clack.wav" at={MAC.stop - 0.03} volume={0.9} />);
  for (let i = 0; i < 6; i++) out.push(<Sfx key={`mw${i}`} src="sfx/whoosh.wav" at={MAC.montage + i * MAC.beat * 4 - 0.2} volume={0.3} />);
  out.push(<Sfx key="ntf" src="sfx/ding.wav" at={MAC.montage + 3 * MAC.beat * 4 + 0.2} volume={0.45} />);
  out.push(<Sfx key="wk" src="sfx/thud.wav" at={MAC.week + 0.5} volume={0.5} />);
  out.push(<Sfx key="end-d" src="sfx/ding.wav" at={MAC.end + 0.28} volume={0.35} />);
  return <>{out}</>;
}

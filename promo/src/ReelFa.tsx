// ÜRETİLMİŞ DOSYA — scripts/make_reel_fa.py. Reel.tsx'i düzenleyip betiği çalıştır.
import React from 'react';
import { AbsoluteFill, Html5Audio, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { REEL, b } from './cues';
import { C, mono, sans, serif, signed, money, faSans, faSerif } from './theme';
import { Grain, LogoReveal, Sfx, Vignette, clamp } from './ui';

/**
 * SHOWREEL — 30 sn, 128 BPM. Hareket tasarımının vitrini; konu site.
 *
 * Her bölüm başka bir teknik gösteriyor: maske açılımları, kinetik tipografi,
 * 3B perspektif, dalga gecikmeli ızgaralar, eşleşen kesmeler (halka → çubuk),
 * zaman cetveli, kamera geri çekilmesiyle açılan duvar, merkeze çöküş.
 * Tüm zamanlama vuruş cinsinden: b(n). Müzik aynı ızgaradan üretiliyor.
 */

const W = 1920, H = 1080;
const eo = Easing.bezier(0.16, 1, 0.3, 1);      // sert çıkış
const eio = Easing.bezier(0.83, 0, 0.17, 1);    // keskin giriş-çıkış
const back = Easing.back(1.6);

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};
const pr = (t: number, a: number, z: number, e: (x: number) => number = eo) =>
  interpolate(t, [a, z], [0, 1], { ...clamp, easing: e });

function Window({ from, to, children }: { from: number; to: number; children: React.ReactNode }) {
  const t = useT();
  if (t < from || t >= to) return null;
  return <AbsoluteFill>{children}</AbsoluteFill>;
}

/** Vuruşta küçük bir nabız: 1 → 1+k → 1. */
const pulse = (t: number, k = 0.03) => {
  const x = (t % REEL.beat) / REEL.beat;
  return 1 + k * Math.exp(-x * 8);
};

// ─── Ortak parçalar ───────────────────────────────────────────────────────

/** Bölüm etiketi: "01 — OTOMATİK KAYIT". Numara altın, çizgi uzar, yazı maskeden çıkar. */
function Label({ n, text, at }: { n: string; text: string; at: number }) {
  const t = useT();
  const l = pr(t, at, at + b(1));
  const w = pr(t, at + b(0.25), at + b(1.25));
  return (
    <div style={{ position: 'absolute', right: 90, top: 76, display: 'flex', alignItems: 'center', gap: 22, fontFamily: faSans, direction: 'rtl' }}>
      <span style={{ fontFamily: mono, fontSize: 30, color: C.gold, opacity: l }}>{n}</span>
      <span style={{ width: 90 * l, height: 2, background: C.gold }} />
      <span style={{ overflow: 'hidden', display: 'inline-block' }}>
        <span style={{ display: 'inline-block', fontSize: 34, fontWeight: 700, letterSpacing: 0, color: C.text, transform: `translateY(${(1 - w) * 110}%)` }}>{text}</span>
      </span>
    </div>
  );
}

/** Harf harf maskeden yükselen başlık. */
function Rise({ text, at, size, step = 1 / 16, color = C.text, weight = 800, family = sans, spacing = '-0.045em' }: {
  text: string; at: number; size: number; step?: number; color?: string; weight?: number; family?: string; spacing?: string;
}) {
  const t = useT();
  return (
    <div style={{ display: 'flex', fontFamily: family, fontSize: size, fontWeight: weight, color, letterSpacing: spacing, lineHeight: 0.92 }}>
      {text.split('').map((ch, i) => {
        const p = pr(t, at + b(i * step), at + b(i * step + 0.75), eo);
        return (
          <span key={i} style={{ overflow: 'hidden', display: 'inline-block', paddingBottom: '0.06em' }}>
            <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 105}%) rotate(${(1 - p) * 8}deg)`, whiteSpace: 'pre' }}>{ch}</span>
          </span>
        );
      })}
    </div>
  );
}

/** Kısa RGB kayması — glitch. */
function Glitch({ at, dur = b(0.5), children }: { at: number; dur?: number; children: React.ReactNode }) {
  const t = useT();
  const on = t >= at && t < at + dur;
  const f = useCurrentFrame();
  const dx = on ? (random(`g${f}`) - 0.5) * 30 : 0;
  const slice = on ? random(`s${f}`) * 100 : 0;
  return (
    <AbsoluteFill>
      {on && <AbsoluteFill style={{ transform: `translateX(${dx}px)`, mixBlendMode: 'screen', filter: 'drop-shadow(0 0 0 #f00)', opacity: 0.7, clipPath: `inset(${slice}% 0 ${Math.max(0, 80 - slice)}% 0)` }}>{children}</AbsoluteFill>}
      <AbsoluteFill style={{ transform: on ? `translateX(${-dx * 0.4}px)` : undefined }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── 1. Açılış (0–8) ──────────────────────────────────────────────────────

function Intro() {
  const t = useT();
  const line = pr(t, 0, b(1), eio);
  const grid = pr(t, b(1), b(2.5), eo);
  const tilt = pr(t, b(1), b(3), eio);
  const words = t < b(6) ? 1 : 1 - pr(t, b(6), b(6.6), eio);
  const tag = pr(t, b(7), b(7.8));
  const typed = Math.floor('SHOWREEL · 2026'.length * pr(t, b(7), b(7.9), Easing.linear));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Izgara: tek çizgi ızgaraya açılıyor, sonra zemine yatıyor */}
      <AbsoluteFill style={{ perspective: 900 }}>
        <AbsoluteFill style={{ transform: `rotateX(${tilt * 62}deg) translateY(${tilt * 160}px) scale(${1 + tilt * 0.8})`, transformOrigin: '50% 60%' }}>
          {Array.from({ length: 21 }, (_, i) => {
            const k = i - 10;
            return <div key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: H / 2 + k * 70 * grid, height: 1, background: `rgba(240,180,41,${k === 0 ? 0.9 : 0.16 * grid})` }} />;
          })}
          {Array.from({ length: 29 }, (_, i) => {
            const k = i - 14;
            return <div key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: W / 2 + k * 70, width: 1, background: `rgba(167,139,250,${0.14 * grid})`, transform: `scaleY(${grid})` }} />;
          })}
        </AbsoluteFill>
      </AbsoluteFill>
      {/* Açılış çizgisi */}
      <div style={{ position: 'absolute', top: H / 2 - 1, left: W / 2 - (W / 2) * line, width: W * line, height: 2, background: C.gold, boxShadow: `0 0 30px ${C.gold}`, opacity: 1 - grid * 0.6 }} />

      {/* Kelimeler çarpıyor */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, opacity: words, transform: `scale(${pulse(t, 0.02) * (1 - (1 - words) * 0.3)})` }}>
        <Rise text="SIMPLE" at={b(2)} size={200} />
        <Rise text="TRADING" at={b(3)} size={200} color={C.lilac} />
        <Rise text="JOURNAL" at={b(4)} size={200} color={C.gold} />
      </AbsoluteFill>

      {/* Logo ve etiket */}
      {t >= b(6) && (
        <Glitch at={b(6)} dur={b(0.6)}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 }}>
            <LogoReveal start={b(6)} width={560} showWords={false} />
            <div style={{ fontFamily: mono, fontSize: 30, letterSpacing: '0.4em', color: C.dim, opacity: tag, height: 36 }}>
              {'SHOWREEL · 2026'.slice(0, typed)}<span style={{ opacity: Math.floor(t * 6) % 2 ? 1 : 0 }}>_</span>
            </div>
          </AbsoluteFill>
        </Glitch>
      )}
    </AbsoluteFill>
  );
}

// ─── 2. Kinetik tipografi (8–16) ──────────────────────────────────────────

function Kinetic() {
  const t = useT();
  const base = b(8);
  const which = Math.min(3, Math.floor((t - base) / b(2)));
  const bgs = [C.bg, C.gold, '#1a1030', C.bg];
  const fgs = [C.text, '#0a0a0c', C.text, C.gold];
  const at = base + which * b(2);
  const local = t - at;
  const k = local / b(2);
  const flash = interpolate(local, [0, b(0.15)], [0.6, 0], clamp);
  const word = ['ثبت کن', 'تحلیل کن', 'اصلاح کن', 'تکرار کن'][which];

  let content: React.ReactNode;
  if (which === 0) {
    // Soldan kayarak, hızla orantılı bulanıklık ve eğilme
    content = (
      <div style={{ display: 'flex', gap: '0.28em', direction: 'rtl' }}>
        {word.split(' ').map((ch, i) => {
          const p = pr(t, at + b(i * 0.06), at + b(i * 0.06 + 0.6), eo);
          const v = 1 - p;
          return <span key={i} style={{ display: 'inline-block', transform: `translateX(${-v * 900}px) skewX(${v * -30}deg)`, filter: `blur(${v * 14}px)`, opacity: Math.min(1, p * 3) }}>{ch}</span>;
        })}
      </div>
    );
  } else if (which === 1) {
    // Ortadan ikiye bölünmüş: üst sola, alt sağa kayıp birleşiyor
    const p = pr(t, at, at + b(0.9), eio);
    const half = (top: boolean) => (
      <div style={{ position: top ? 'relative' : 'absolute', inset: 0, clipPath: top ? 'inset(0 0 50% 0)' : 'inset(50% 0 0 0)', transform: `translateX(${(top ? -1 : 1) * (1 - p) * 1400}px)` }}>{word}</div>
    );
    content = <div style={{ position: 'relative' }}>{half(true)}{half(false)}</div>;
  } else if (which === 2) {
    // Dev boyuttan çarpma, dönerek oturma
    const p = pr(t, at, at + b(0.7), back);
    content = <div style={{ transform: `scale(${3.2 - 2.2 * p}) rotate(${(1 - p) * -10}deg)`, opacity: Math.min(1, p * 2) }}>{word}</div>;
  } else {
    // 3B harf çevirme + yankı: "tekrarla"
    content = (
      <div style={{ position: 'relative', perspective: 1200 }}>
        {[3, 2, 1].map(e => {
          const pe = pr(t, at + b(1 + e * 0.12), at + b(2), eo);
          return <div key={e} style={{ position: 'absolute', inset: 0, color: 'transparent', WebkitTextStroke: `2px ${C.gold}`, opacity: 0.5 * (1 - pe) * (t > at + b(1 + e * 0.12) ? 1 : 0), transform: `scale(${1 + pe * 0.35 * e})` }}>{word}</div>;
        })}
        <div style={{ display: 'flex', position: 'relative', gap: '0.28em', direction: 'rtl' }}>
          {word.split(' ').map((ch, i) => {
            const p = pr(t, at + b(i * 0.07), at + b(i * 0.07 + 0.55), eo);
            return <span key={i} style={{ display: 'inline-block', transform: `rotateX(${(1 - p) * -95}deg)`, transformOrigin: '50% 100%', opacity: p > 0.02 ? 1 : 0 }}>{ch}</span>;
          })}
        </div>
      </div>
    );
  }
  return (
    <AbsoluteFill style={{ background: bgs[which], alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: faSans, fontWeight: 900, fontSize: 230, letterSpacing: 0, direction: 'rtl', color: fgs[which], transform: `scale(${pulse(t, 0.025)}) translateY(${Math.sin(k * Math.PI) * -6}px)` }}>
        {content}
      </div>
      <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', fontFamily: mono, fontSize: 24, letterSpacing: '0.3em', color: fgs[which], opacity: 0.5 }}>
        0{which + 1} / 04
      </div>
      <AbsoluteFill style={{ background: '#fff', opacity: flash, mixBlendMode: 'overlay' }} />
    </AbsoluteFill>
  );
}

// ─── 3. Otomatik kayıt (16–24) ────────────────────────────────────────────

const CITY = Array.from({ length: 36 }, (_, i) => {
  const r = random(`c${i}`);
  const base = 0.35 + 0.35 * Math.sin(i / 5) + 0.25 * (i / 36);
  return { h: Math.max(0.08, base + (r - 0.5) * 0.25), up: r > 0.42 };
});

function AutoSync() {
  const t = useT();
  const s = b(16);
  const flat = pr(t, s + b(3.6), s + b(4.4), eio);
  const cam = pr(t, s, s + b(4), Easing.linear);
  const rows: [string, string, 'Buy' | 'Sell', string, string][] = [
    ['09:14', 'GBPUSD', 'Buy', '+1.8R', '+$364.50'],
    ['11:02', 'XAUUSD', 'Sell', '+2.4R', '+$486.00'],
    ['13:40', 'EURUSD', 'Buy', '−1.0R', '−$200.00'],
    ['15:21', 'USDJPY', 'Sell', '+1.2R', '+$240.00'],
  ];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Label n="۰۱" text="ثبت خودکار" at={s} />
      {/* Mum şehri: perspektifte yükselen sütunlar */}
      <AbsoluteFill style={{ perspective: 1300 }}>
        <div style={{
          position: 'absolute', left: W / 2 - 700 + flat * -110, top: 250 + flat * 90, width: 1400, height: 560,
          transform: `rotateX(${(1 - flat) * 58}deg) rotateZ(${(1 - flat) * -9 + cam * 4}deg) scale(${1 - flat * 0.42 + (1 - flat) * cam * 0.12})`,
          transformOrigin: flat > 0 ? '0% 50%' : '50% 80%',
          borderRadius: 24, background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {CITY.map((c, i) => {
            const g = pr(t, s + b(i * 0.08), s + b(i * 0.08 + 0.9), back);
            const col = c.up ? C.green : C.red;
            return (
              <div key={i} style={{
                position: 'absolute', bottom: 40, left: 40 + i * 37, width: 22,
                height: c.h * 440 * g, background: `linear-gradient(180deg, ${col}, ${col}66)`,
                borderRadius: 4, boxShadow: `0 0 ${20 * (1 - flat)}px ${col}55`,
              }} />
            );
          })}
        </div>
      </AbsoluteFill>
      {/* Journal satırları kameraya doğru uçuyor */}
      <AbsoluteFill style={{ perspective: 1000 }}>
        <div style={{ position: 'absolute', right: 110, top: 300, width: 760 }}>
          {rows.map((r, i) => {
            const at = s + b(4 + i);
            const p = pr(t, at, at + b(0.8), eo);
            if (t < at) return null;
            const win = r[4].startsWith('+');
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 26, padding: '24px 30px', marginBottom: 16, borderRadius: 18,
                background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: sans,
                transform: `translateZ(${(1 - p) * -900}px) rotateY(${(1 - p) * 35}deg)`, opacity: Math.min(1, p * 2),
                boxShadow: i === 3 ? `0 0 ${40 * (1 - pr(t, at + b(0.5), at + b(1.5)))}px rgba(240,180,41,0.4)` : undefined,
              }}>
                <span style={{ fontFamily: mono, fontSize: 24, color: C.faint }}>{r[0]}</span>
                <span style={{ fontSize: 32, fontWeight: 600, color: C.text, width: 150 }}>{r[1]}</span>
                <span style={{ fontSize: 28, fontWeight: 500, color: r[2] === 'Buy' ? C.green : C.red, width: 70 }}>{r[2]}</span>
                <span style={{ fontFamily: mono, fontSize: 26, color: C.dim }}>{r[3]}</span>
                <span style={{ marginLeft: 'auto', fontFamily: mono, fontSize: 32, color: win ? C.green : C.red }}>{r[4]}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', right: 90, bottom: 80, fontFamily: faSans, direction: 'rtl', fontSize: 36, color: C.dim, opacity: pr(t, s + b(4.5), s + b(5.5)) }}>
        از متاتریدر، <span style={{ color: C.gold }}>خودبه‌خود.</span>
      </div>
    </AbsoluteFill>
  );
}

// ─── 4. Disiplin (24–32) ──────────────────────────────────────────────────

function Discipline() {
  const t = useT();
  const s = b(24);
  const cols = 7, rows = 6, cell = 104, gap = 12;
  const gw = cols * cell + (cols - 1) * gap, gh = rows * cell + (rows - 1) * gap;
  const hot = { c: 4, r: 3 };
  const zoom = pr(t, s + b(4), s + b(5), eio);
  const inside = pr(t, s + b(4.8), s + b(5.6));
  const flags: [number, string, number][] = [[14, 'بازگشت فوری', -1380], [6, 'افزایش ریسک', -2240], [29, 'معامله بیش از حد', -940]];
  const count = interpolate(t, [s + b(5), s + b(6.5)], [0, -1380], { ...clamp, easing: eo });
  // Sıcak hücrenin ekrandaki merkezi — zoom oraya gidiyor
  const hx = W / 2 - gw / 2 + hot.c * (cell + gap) + cell / 2;
  const hy = H / 2 + 40 - gh / 2 + hot.r * (cell + gap) + cell / 2;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Label n="۰۲" text="تحلیل انضباط" at={s} />
      <AbsoluteFill style={{ transform: `scale(${1 + zoom * 16})`, transformOrigin: `${hx}px ${hy}px`, opacity: 1 - inside }}>
        <AbsoluteFill style={{ perspective: 1200 }}>
          <div style={{ position: 'absolute', left: W / 2 - gw / 2, top: H / 2 + 40 - gh / 2, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap }}>
            {Array.from({ length: cols * rows }, (_, i) => {
              const c = i % cols, r = Math.floor(i / cols);
              const d = Math.hypot(c - 3, r - 2.5);
              const p = pr(t, s + b(0.2) + d * 0.09, s + b(1.2) + d * 0.09, eo);
              const isHot = c === hot.c && r === hot.r;
              const v = random(`h${i}`);
              const weekend = c >= 5;
              const col = weekend ? 'rgba(255,255,255,0.03)' : v > 0.35 ? `rgba(52,211,153,${0.12 + v * 0.3})` : `rgba(248,113,113,${0.12 + (1 - v) * 0.3})`;
              const glow = isHot ? pr(t, s + b(3), s + b(3.5)) * pulse(t, 0.3) : 0;
              const dim = isHot ? 1 : 1 - 0.6 * pr(t, s + b(3), s + b(3.5));
              return (
                <div key={i} style={{
                  width: cell, height: cell, borderRadius: 16, opacity: dim,
                  background: isHot && glow > 0 ? `rgba(248,113,113,${0.35 + 0.4 * glow})` : col,
                  transform: `rotateY(${(1 - p) * 180}deg) scale(${0.6 + 0.4 * p})`,
                  border: isHot && glow > 0 ? `2px solid ${C.red}` : '1px solid rgba(255,255,255,0.04)',
                  boxShadow: isHot ? `0 0 ${60 * glow}px rgba(248,113,113,0.7)` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: mono, fontSize: 28, color: isHot ? '#fff' : 'rgba(255,255,255,0.35)', backfaceVisibility: 'hidden',
                }}>{weekend ? '' : isHot ? '9' : Math.ceil(v * 5)}</div>
              );
            })}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      {/* Hücrenin içi: dev sayaç ve işaretler */}
      <AbsoluteFill style={{ background: `rgba(120,30,30,${0.25 * inside})`, opacity: inside, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 36 }}>
        <div style={{ fontFamily: mono, fontSize: 210, color: C.red, letterSpacing: '-0.05em', transform: `scale(${pulse(t, 0.03)})`, textShadow: '0 0 80px rgba(248,113,113,0.5)' }}>{signed(count)}</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {flags.map(([n, title, pnl], i) => {
            const p = pr(t, s + b(5.6 + i * 0.35), s + b(6.3 + i * 0.35), back);
            return (
              <div key={i} style={{ fontFamily: faSans, direction: 'rtl', padding: '22px 30px', borderRadius: 18, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)', transform: `translateY(${(1 - p) * 60}px)`, opacity: Math.min(1, p * 2), display: 'flex', gap: 16, alignItems: 'baseline' }}>
                <span style={{ fontFamily: mono, fontSize: 36, color: C.amber }}>{n}</span>
                <span style={{ fontSize: 30, color: C.text, fontWeight: 500 }}>{title}</span>
                <span style={{ fontFamily: mono, fontSize: 28, color: C.red }}>{signed(pnl)}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── 5. Prop sayacı (32–40) ───────────────────────────────────────────────

function Prop() {
  const t = useT();
  const s = b(32);
  const morph = pr(t, s + b(4), s + b(5), eio);
  const items: [string, number, number, string][] = [
    ['تا هدف', 1000, 640, C.gold], ['تا حد امروز', 500, 188, C.amber], ['تا ضرر کل', 1000, 780, C.green],
  ];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Label n="۰۳" text="شمارنده‌ی پراپ" at={s} />
      <AbsoluteFill style={{ perspective: 1400 }}>
        {items.map(([label, limit, left, col], i) => {
          const at = s + b(i * 0.5);
          const inP = pr(t, at, at + b(1), back);
          const fill = pr(t, at + b(0.5), at + b(3), eo);
          const now = limit - (limit - left) * fill;
          const ratio = (limit - now) / limit;
          const cx = W / 2 + (i - 1) * 520;
          const R = 170, len = 2 * Math.PI * R;
          // Halka → çubuk: halka küçülüp kaybolurken aynı renkte çubuk uzuyor
          const ringScale = 1 - morph;
          const barY = 360 + i * 190;
          return (
            <React.Fragment key={i}>
              <div style={{
                position: 'absolute', left: cx - 200, top: 330, width: 400, height: 400,
                transform: `rotateY(${(1 - inP) * 90}deg) scale(${ringScale * inP + 0.0001}) rotateZ(${morph * 90}deg)`, opacity: 1 - morph * 0.9,
              }}>
                <svg width={400} height={400} viewBox="0 0 400 400">
                  <circle cx={200} cy={200} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={18} />
                  <circle cx={200} cy={200} r={R} fill="none" stroke={col} strokeWidth={18} strokeLinecap="round"
                    strokeDasharray={len} strokeDashoffset={len * (1 - ratio)} transform="rotate(-90 200 200)"
                    style={{ filter: `drop-shadow(0 0 14px ${col})` }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontFamily: mono, fontSize: 64, color: col, letterSpacing: '-0.04em' }}>{money(now)}</div>
                  <div style={{ fontFamily: faSans, fontSize: 22, letterSpacing: 0, color: C.faint, marginTop: 8 }}>{label}</div>
                </div>
              </div>
              {/* Uygulamadaki hâli */}
              <div style={{ position: 'absolute', left: 360, width: 1200, top: barY, opacity: morph, transform: `translateX(${(1 - morph) * -80}px)`, fontFamily: faSans, direction: 'rtl' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 28, letterSpacing: 0, color: C.faint }}>{label}</span>
                  <span style={{ fontFamily: mono, fontSize: 64, color: col, letterSpacing: '-0.03em' }}>{money(now)}</span>
                </div>
                <div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.07)', marginTop: 14, overflow: 'hidden' }}>
                  <div style={{ width: `${ratio * 100 * morph}%`, height: '100%', background: col, borderRadius: 6, boxShadow: `0 0 20px ${col}` }} />
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── 6. Seans ve haber (40–48) ────────────────────────────────────────────

function Sessions() {
  const t = useT();
  const s = b(40);
  const x0 = 160, span = 1600;
  const hx = (h: number) => x0 + (h / 24) * span;
  const sess: [string, number, number, string][] = [
    ['سیدنی', 21, 30, '#60a5fa'], ['توکیو', 0, 9, C.lilac], ['لندن', 7, 16, C.gold], ['نیویورک', 12, 21, C.green],
  ];
  const head = pr(t, s, s + b(8), Easing.linear);
  const news: [number, string][] = [[12.5, 'CPI'], [14, 'FOMC'], [18, 'NFP']];
  const toast = pr(t, s + b(5.5), s + b(6.3), back);
  const ruler = pr(t, s, s + b(1), eo);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Label n="۰۴" text="سشن‌ها و اخبار" at={s} />
      {/* 24 saatlik cetvel */}
      {Array.from({ length: 25 }, (_, h) => (
        <div key={h} style={{ position: 'absolute', left: hx(h), top: 780, width: 2, height: h % 6 === 0 ? 28 : 14, background: 'rgba(255,255,255,0.3)', transform: `scaleY(${ruler})`, transformOrigin: 'top' }}>
          {h % 3 === 0 && <div style={{ position: 'absolute', top: 36, left: -24, width: 50, textAlign: 'center', fontFamily: mono, fontSize: 20, color: C.faint, opacity: ruler }}>{String(h % 24).padStart(2, '0')}</div>}
        </div>
      ))}
      <div style={{ position: 'absolute', left: x0, top: 778, width: span * ruler, height: 2, background: 'rgba(255,255,255,0.3)' }} />
      {/* Seans bantları */}
      {sess.map(([name, a, z, col], i) => {
        const p = pr(t, s + b(0.5 + i * 0.5), s + b(1.5 + i * 0.5), eo);
        const segs: [number, number][] = z > 24 ? [[a, 24], [0, z - 24]] : [[a, z]];
        return segs.map(([sa, sz], k) => (
          <div key={`${i}-${k}`} style={{
            position: 'absolute', left: hx(sa), top: 330 + i * 100, height: 72, width: (hx(sz) - hx(sa)) * p, borderRadius: 14,
            background: `linear-gradient(90deg, ${col}55, ${col}22)`, border: `1px solid ${col}88`,
            display: 'flex', alignItems: 'center', paddingLeft: 20, fontFamily: faSans, fontWeight: 700, fontSize: 28, letterSpacing: 0, color: col, overflow: 'hidden', whiteSpace: 'nowrap',
          }}>{k === 0 ? name : ''}</div>
        ));
      })}
      {/* Oynatma çizgisi */}
      <div style={{ position: 'absolute', left: hx(head * 24), top: 300, width: 2, height: 500, background: C.text, opacity: 0.6, boxShadow: '0 0 12px #fff' }} />
      {/* Kırmızı haber iğneleri */}
      {news.map(([h, name], i) => {
        const p = pr(t, s + b(4 + i * 0.5), s + b(4.7 + i * 0.5), Easing.bounce);
        return (
          <div key={i} style={{ position: 'absolute', left: hx(h) - 36, top: 230 + (1 - p) * -300, width: 72, textAlign: 'center', opacity: p > 0 ? 1 : 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, margin: '0 auto', background: C.red, boxShadow: `0 0 30px ${C.red}`, fontFamily: sans, fontWeight: 800, color: '#fff', fontSize: 24, lineHeight: '40px' }}>!</div>
            <div style={{ width: 2, height: 560, background: `linear-gradient(180deg, ${C.red}, transparent)`, margin: '0 auto' }} />
            <div style={{ position: 'absolute', top: -34, left: 0, right: 0, fontFamily: mono, fontSize: 20, color: C.red }}>{name}</div>
          </div>
        );
      })}
      {/* Bildirim */}
      <div style={{ position: 'absolute', right: 110, top: 900 + (1 - toast) * 260, width: 620, opacity: Math.min(1, toast * 2) }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '22px 26px', borderRadius: 24, background: 'rgba(38,38,44,0.92)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', fontFamily: faSans, direction: 'rtl' }}>
          <div style={{ width: 70, height: 70, borderRadius: 16, background: '#0b0b0e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: 52, color: C.gold }}>J</div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 600, color: C.text }}>خبر مهم نزدیک است</div>
            <div style={{ fontSize: 24, color: C.dim, marginTop: 4 }}><span style={{ color: C.red }}>●</span> NFP · 60 دقیقه دیگر</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── 7. Duvar (48–56) ─────────────────────────────────────────────────────

function Tile({ i, t }: { i: number; t: number }) {
  // Her karo kendi küçük döngüsünü oynatıyor
  const loop = (t * 1.5 + i * 0.37) % 1;
  const kinds = ['candles', 'ring', 'heat', 'count', 'logo', 'bars', 'word', 'dots', 'wave'];
  const kind = kinds[i];
  const inner: React.ReactNode = (() => {
    switch (kind) {
      case 'candles': return <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>{Array.from({ length: 14 }, (_, k) => { const h = 40 + 140 * Math.abs(Math.sin(k * 0.7 + t * 2)); return <div key={k} style={{ width: 16, height: h, borderRadius: 3, background: k % 3 ? C.green : C.red }} />; })}</div>;
      case 'ring': { const R = 90, L = 2 * Math.PI * R; return <svg width={240} height={240}><circle cx={120} cy={120} r={R} stroke="rgba(255,255,255,0.08)" strokeWidth={14} fill="none" /><circle cx={120} cy={120} r={R} stroke={C.gold} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - loop)} transform="rotate(-90 120 120)" /></svg>; }
      case 'heat': return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 34px)', gap: 6 }}>{Array.from({ length: 24 }, (_, k) => { const on = Math.floor(loop * 24) === k; return <div key={k} style={{ width: 34, height: 34, borderRadius: 8, background: on ? C.red : random(`t${k}`) > 0.4 ? 'rgba(52,211,153,0.35)' : 'rgba(248,113,113,0.25)', boxShadow: on ? `0 0 20px ${C.red}` : undefined }} />; })}</div>;
      case 'count': return <div style={{ fontFamily: mono, fontSize: 84, color: C.green, letterSpacing: '-0.04em' }}>{signed(Math.round(loop * 1860))}</div>;
      case 'logo': return <LogoReveal start={b(48)} width={380} showWords={false} />;
      case 'bars': return <div style={{ width: 380 }}>{[C.gold, C.amber, C.green].map((c, k) => <div key={k} style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.07)', marginBottom: 22, overflow: 'hidden' }}><div style={{ width: `${(0.3 + 0.6 * ((loop + k * 0.3) % 1)) * 100}%`, height: '100%', background: c, borderRadius: 7 }} /></div>)}</div>;
      case 'word': return <div style={{ fontFamily: faSans, fontWeight: 900, fontSize: 88, letterSpacing: 0, color: C.text }}>{['ثبت', 'تحلیل', 'اصلاح'][Math.floor((t * 2 + i) % 3)]}</div>;
      case 'dots': return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 26px)', gap: 12 }}>{Array.from({ length: 28 }, (_, k) => <div key={k} style={{ width: 26, height: 26, borderRadius: 13, background: k < loop * 28 ? (random(`d${k}`) > 0.3 ? C.green : C.red) : 'rgba(255,255,255,0.08)' }} />)}</div>;
      default: return <svg width={420} height={200}><path d={`M 0 100 ${Array.from({ length: 42 }, (_, k) => `L ${k * 10} ${100 + 60 * Math.sin(k * 0.35 + t * 4)}`).join(' ')}`} stroke={C.lilac} strokeWidth={5} fill="none" /></svg>;
    }
  })();
  return inner;
}

function Wall() {
  const t = useT();
  const s = b(48);
  const tw = 560, th = 315, gap = 24;
  const zoomOut = pr(t, s, s + b(2.5), eio);
  const rot = pr(t, s + b(3.5), s + b(5), eio);
  const scale = 3.55 - 2.55 * zoomOut;
  const faces = ['ثبت کن', 'تحلیل کن', 'اصلاح کن', 'مرز', 'STJ', 'خبر', 'سشن', 'انضباط', 'تکرار کن'];
  return (
    <AbsoluteFill style={{ background: C.bg, perspective: 1800 }}>
      <AbsoluteFill style={{ transform: `scale(${scale}) rotateY(${rot * -18}deg) rotateX(${rot * 8}deg)` }}>
        {Array.from({ length: 9 }, (_, i) => {
          const c = i % 3, r = Math.floor(i / 3);
          const x = W / 2 + (c - 1) * (tw + gap) - tw / 2;
          const y = H / 2 + (r - 1) * (th + gap) - th / 2;
          const order = [4, 0, 2, 6, 8, 1, 3, 5, 7].indexOf(i);
          const flip = pr(t, s + b(5 + order * 0.25), s + b(5.6 + order * 0.25), eio);
          const gold = i === 4;
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, width: tw, height: th, transformStyle: 'preserve-3d', transform: `rotateY(${flip * 180}deg)` }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 22, background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden', overflow: 'hidden' }}>
                <Tile i={i} t={t} />
              </div>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 22, background: gold ? C.gold : '#101014', border: `1px solid ${gold ? C.gold : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', fontFamily: gold ? sans : faSans, fontWeight: gold ? 800 : 900, fontSize: gold ? 120 : 64, letterSpacing: gold ? '-0.04em' : 0, color: gold ? '#0a0a0c' : C.text }}>
                {faces[i]}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── 8. Final (56–64) ─────────────────────────────────────────────────────

function Finale() {
  const t = useT();
  const s = b(56);
  const collapse = pr(t, s, s + b(1), Easing.in(Easing.cubic));
  const flash = interpolate(t, [s + b(0.9), s + b(1), s + b(1.6)], [0, 1, 0], clamp);
  const line = pr(t, s + b(2.2), s + b(3.2), eio);
  const url = pr(t, s + b(3), s + b(3.8));
  const punch = interpolate(t, [b(60), b(60) + 0.05, b(60) + 0.5], [1, 1.035, 1], clamp);
  const out = pr(t, 29.2, 30, Easing.linear);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Duvar merkeze çöküyor */}
      {collapse < 1 && (
        <AbsoluteFill style={{ transform: `scale(${1 - collapse}) rotate(${collapse * 40}deg)`, filter: `blur(${collapse * 12}px)` }}>
          <Wall />
        </AbsoluteFill>
      )}
      {t >= s + b(1) && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34, transform: `scale(${punch})`, opacity: 1 - out }}>
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(240,180,41,0.14), transparent 70%)' }} />
          <LogoReveal start={s + b(1)} width={1200} />
          <div style={{ width: 1200 * line, height: 2, background: C.gold, boxShadow: `0 0 20px ${C.gold}` }} />
          <div style={{ display: 'flex', gap: 40, alignItems: 'baseline', opacity: url, transform: `translateY(${(1 - url) * 20}px)` }}>
            <span style={{ fontFamily: faSerif, fontWeight: 600, fontSize: 46, color: C.dim, direction: 'rtl' }}>انضباط، با سادگی.</span>
            <span style={{ fontFamily: mono, fontSize: 32, color: C.gold, letterSpacing: '0.06em' }}>simpletradejournal.io</span>
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: '#fff4d6', opacity: flash * 0.85 }} />
    </AbsoluteFill>
  );
}

// ─── Kompozisyon ──────────────────────────────────────────────────────────

export function ReelFa({ music = true }: { music?: boolean }) {
  const t = useT();
  const f = useCurrentFrame();
  // Bölüm geçişlerinde kamera sarsıntısı
  const hits = [8, 16, 24, 32, 40, 48, 56].map(b);
  const k = hits.reduce((acc, h) => (t >= h && t - h < 0.3 ? Math.max(acc, 1 - (t - h) / 0.3) : acc), 0);
  const sx = k * (random(`x${f}`) - 0.5) * 22, sy = k * (random(`y${f}`) - 0.5) * 14;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {music && <Html5Audio src={staticFile('music/reel.wav')} volume={0.9} />}
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <Window from={0} to={b(8)}><Intro /></Window>
        <Window from={b(8)} to={b(16)}><Kinetic /></Window>
        <Window from={b(16)} to={b(24)}><AutoSync /></Window>
        <Window from={b(24)} to={b(32)}><Discipline /></Window>
        <Window from={b(32)} to={b(40)}><Prop /></Window>
        <Window from={b(40)} to={b(48)}><Sessions /></Window>
        <Window from={b(48)} to={b(56)}><Wall /></Window>
        <Window from={b(56)} to={REEL.duration}><Finale /></Window>
      </AbsoluteFill>
      <Vignette strength={0.6} />
      <Grain opacity={0.08} />
      <Sfx src="sfx/ding.wav" at={b(45.5)} volume={0.5} />
      <Sfx src="sfx/whoosh.wav" at={b(47.6)} volume={0.35} />
      <Sfx src="sfx/whoosh_down.wav" at={b(55.8)} volume={0.4} />
    </AbsoluteFill>
  );
}

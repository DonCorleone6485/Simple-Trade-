import React from 'react';
import {
  AbsoluteFill, Html5Audio, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import { C, sans, serif } from './theme';
import { S, T, J, WORDS, GOLD } from './Logo';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Saniyeyi kareye çevirir. */
export const useSec = () => {
  const { fps } = useVideoConfig();
  return (s: number) => Math.round(s * fps);
};

/** 0→1 ilerleme: iki saniye arasında, yumuşak. */
export function useProgress(from: number, to: number, ease = easeOut) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame, [from * fps, to * fps], [0, 1], { ...clamp, easing: ease });
}

// ─── Arka plan ────────────────────────────────────────────────────────────

/**
 * Sitenin karanlığı: düz siyah değil, üstten süzülen mor bir ışık. Işık çok
 * yavaş kayıyor — durağan bir ekran fotoğraf gibi görünür, bu ise yaşıyor.
 */
export function Backdrop({ glow = 1, gold = 0 }: { glow?: number; gold?: number }) {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame / 140) * 6;
  const dy = Math.cos(frame / 170) * 4;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 80% 45% at ${50 + dx}% ${-4 + dy}%, rgba(139,92,246,${0.2 * glow}), transparent 70%)`,
      }} />
      {gold > 0 && (
        <AbsoluteFill style={{
          background: `radial-gradient(ellipse 70% 35% at ${50 - dx}% ${104 - dy}%, rgba(240,180,41,${0.1 * gold}), transparent 70%)`,
        }} />
      )}
    </AbsoluteFill>
  );
}

/** Köşeleri karartır; göz ortaya gider. */
export function Vignette({ strength = 0.7 }: { strength?: number }) {
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse 75% 65% at 50% 50%, transparent 55%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: 'none',
    }} />
  );
}

/**
 * Film greni. Dijital siyah fazla temiz görünür ve telefonda bantlaşır;
 * hafif bir gren hem sinematik bir doku veriyor hem bantlanmayı kırıyor.
 */
export function Grain({ opacity = 0.09 }: { opacity?: number }) {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 97;
  return (
    <AbsoluteFill style={{ mixBlendMode: 'overlay', opacity, pointerEvents: 'none' }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
}

// ─── Yazı ─────────────────────────────────────────────────────────────────

/**
 * Kelime kelime beliren satır. Her kelime aşağıdan, bulanıktan netleşerek
 * geliyor. "\n" satır kırar; `accent` içindeki kelimeler altın (ya da verilen
 * renk) olur.
 */
export function Words({
  text, start, size = 72, color = C.text, family = serif, weight = 400,
  stagger = 0.075, accent = [], accentColor = C.gold, lineHeight = 1.12,
  align = 'center', italic = false, letterSpacing = '-0.02em', dur = 0.55,
}: {
  text: string; start: number; size?: number; color?: string; family?: string; weight?: number;
  stagger?: number; accent?: string[]; accentColor?: string; lineHeight?: number;
  align?: 'center' | 'left'; italic?: boolean; letterSpacing?: string; dur?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = 0;
  const lines = text.split('\n');
  return (
    <div style={{ fontFamily: family, fontSize: size, color, fontWeight: weight, lineHeight, textAlign: align, letterSpacing, fontStyle: italic ? 'italic' : 'normal' }}>
      {lines.map((line, li) => (
        <div key={li}>
          {line.split(' ').map((w, wi) => {
            const t0 = (start + idx++ * stagger) * fps;
            const p = interpolate(frame, [t0, t0 + dur * fps], [0, 1], { ...clamp, easing: easeOut });
            const isAccent = accent.includes(w.replace(/[.,!?“”"]/g, ''));
            return (
              <span key={wi} style={{
                display: 'inline-block',
                opacity: p,
                transform: `translateY(${(1 - p) * size * 0.32}px)`,
                filter: `blur(${(1 - p) * 10}px)`,
                color: isAccent ? accentColor : undefined,
                marginRight: '0.26em',
              }}>{w}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Küçük, aralıklı büyük harfli etiket: "SEN", "JOURNAL'IN". */
export function Kicker({ text, start, color = C.faint, size = 26 }: { text: string; start: number; color?: string; size?: number }) {
  const p = useProgress(start, start + 0.5);
  return (
    <div style={{
      fontFamily: sans, fontSize: size, fontWeight: 500, letterSpacing: '0.26em',
      color, opacity: p, transform: `translateY(${(1 - p) * 10}px)`,
    }}>{text}</div>
  );
}

// ─── Uygulama kartı ───────────────────────────────────────────────────────

/** Sitedeki kartın aynısı: çok hafif bir cam, ince kenar. */
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 30,
      padding: '40px 44px',
      boxShadow: '0 40px 120px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
      fontFamily: sans,
      ...style,
    }}>{children}</div>
  );
}

/** Belirli bir anda aşağıdan kayarak gelen sarmalayıcı. */
export function Rise({ start, children, distance = 60, dur = 0.7, style }: {
  start: number; children: React.ReactNode; distance?: number; dur?: number; style?: React.CSSProperties;
}) {
  const p = useProgress(start, start + dur);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * distance}px) scale(${0.97 + 0.03 * p})`, ...style }}>
      {children}
    </div>
  );
}

/** Sahnenin çıkışı: bulanıklaşarak yukarı süzülür. */
export function Exit({ at, children, dur = 0.45 }: { at: number; children: React.ReactNode; dur?: number }) {
  const p = useProgress(at, at + dur, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{ opacity: 1 - p, filter: `blur(${p * 14}px)`, transform: `translateY(${-p * 50}px)` }}>
      {children}
    </AbsoluteFill>
  );
}

/** Sayan rakam. */
export function useCount(to: number, from: number, start: number, end: number) {
  const p = useProgress(start, end, Easing.out(Easing.cubic));
  return from + (to - from) * p;
}

// ─── Ses ──────────────────────────────────────────────────────────────────

/** Bir efekti tam saniyesine koyar. */
export function Sfx({ src, at, volume = 1 }: { src: string; at: number; volume?: number }) {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.round(at * fps)} layout="none">
      <Html5Audio src={staticFile(src)} volume={volume} />
    </Sequence>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────

/**
 * Kapanış: önce altın J düşer — markanın imzası — sonra S ve T yerine oturur,
 * en son isim belirir. Sitede statik duran işaretin sahnedeki hâli.
 */
export function LogoReveal({ start, width = 860, showWords = true }: { start: number; width?: number; showWords?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - start * fps;
  const jIn = spring({ frame: f, fps, config: { damping: 14, stiffness: 120, mass: 0.9 } });
  const stIn = spring({ frame: f - 9, fps, config: { damping: 20, stiffness: 110 } });
  const wIn = interpolate(f, [22, 42], [0, 1], { ...clamp, easing: easeOut });
  const glow = interpolate(f, [0, 12, 60], [0, 1, 0.35], clamp);
  const vbW = showWords ? 10043.5 : 2899;
  // SVG içindeki kaydırma viewBox birimiyle ölçülüyor; ekrandaki piksele göre
  // düşünmek için çeviriyoruz — yoksa J'nin "düşüşü" birkaç piksel kalıyordu.
  const u = vbW / width;
  return (
    <svg viewBox={`0 0 ${vbW} 1485`} style={{ width, overflow: 'visible' }}>
      <defs>
        <filter id="jglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="60" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g style={{ opacity: stIn, transform: `translateY(${(1 - stIn) * 40 * u}px)` }} fill={C.text}>
        <path d={S} /><path d={T} />
      </g>
      <g style={{ opacity: Math.min(1, jIn * 1.4), transform: `translateY(${(1 - jIn) * -260 * u}px)` }}>
        <path d={J} fill={GOLD} filter={glow > 0.4 ? 'url(#jglow)' : undefined} />
      </g>
      {showWords && (
        <g transform="translate(3344.5 972.1) scale(0.30938)" fill={C.text}
          style={{ opacity: wIn }} dangerouslySetInnerHTML={{ __html: WORDS }} />
      )}
    </svg>
  );
}

/** Yalnız isim: "Simple Trading Journal" — logodaki Georgia yazısının kendisi. */
export function Wordmark({ width, style }: { width: number; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 21653 1992" style={{ width, ...style }} fill={C.text}
      dangerouslySetInnerHTML={{ __html: WORDS }} />
  );
}

/**
 * Son kart: logo, tek satır söz, adres.
 *
 * Dikey videoda yatay kilit (işaret + isim yan yana) telefonda küçük kalıyor;
 * `stacked` işaretin kendisini büyütüp ismi altına alıyor.
 */
export function Endcard({ start, line, cta = 'Ücretsiz başla', url = 'simpletradejournal.io', logoWidth = 860, gap = 70, stacked = false }: {
  start: number; line?: string; cta?: string; url?: string; logoWidth?: number; gap?: number; stacked?: boolean;
}) {
  const p0 = useProgress(start + 0.55, start + 1.2);
  const p1 = useProgress(start + 1.0, start + 1.7);
  const p2 = useProgress(start + 1.4, start + 2.1);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap }}>
      {stacked ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44 }}>
          <LogoReveal start={start} width={logoWidth} showWords={false} />
          <div style={{ opacity: p0, transform: `translateY(${(1 - p0) * 14}px)` }}>
            <Wordmark width={logoWidth * 1.35} />
          </div>
        </div>
      ) : (
        <LogoReveal start={start} width={logoWidth} />
      )}
      {line && (
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * 16}px)`, fontFamily: serif, fontSize: 50, color: C.dim, letterSpacing: '-0.01em' }}>
          {line}
        </div>
      )}
      <div style={{ opacity: p2, transform: `translateY(${(1 - p2) * 16}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <div style={{
          fontFamily: sans, fontWeight: 600, fontSize: 40, color: '#0a0a0c',
          background: C.gold, borderRadius: 999, padding: '24px 56px',
          boxShadow: '0 0 0 1px rgba(240,180,41,0.5), 0 18px 60px rgba(240,180,41,0.28)',
        }}>{cta}</div>
        <div style={{ fontFamily: sans, fontSize: 32, color: C.faint, letterSpacing: '0.04em' }}>{url}</div>
      </div>
    </AbsoluteFill>
  );
}

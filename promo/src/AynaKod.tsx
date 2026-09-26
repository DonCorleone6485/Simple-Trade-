import React from 'react';
import { AbsoluteFill, Html5Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { AYNA } from './cues';
import { C, mono, sans, serif, signed } from './theme';
import {
  Backdrop, Card, Endcard, Exit, Grain, Kicker, Rise, Sfx, Vignette, Words,
  clamp, easeOut, useCount, useProgress,
} from './ui';

/**
 * AYNA — "Kendine yalan söyleyebilirsin. Journal'ına söyleyemezsin."
 *
 * Trader kendisi hakkında üç şey söylüyor; her birine journal'ın kendi
 * rakamıyla cevap veriyor. Cevapların hepsi sitede gerçekten olan ekranlar:
 * Disiplin sayfasındaki işaretlenen alışkanlıklar ve Isı Haritası. Etiketler
 * de sitedeki metinlerin aynısı — reklamda olmayan bir şeyi vaat etmiyoruz.
 */

const P = AYNA.pair;

const PAIRS = [
  {
    claim: '“Kaybettikten sonra\nhemen geri girmem.”',
    kind: 'flag' as const,
    title: 'Hemen geri girme',
    desc: 'Kaybettikten sonra 15 dakika içinde açılan işlemler',
    count: 14, pnl: -1380,
  },
  {
    claim: '“Riskimi asla\nbüyütmem.”',
    kind: 'flag' as const,
    title: 'Riski büyütme',
    desc: 'Kayıptan sonra riski bir buçuk katından fazla artırma',
    count: 6, pnl: -2240,
  },
  {
    claim: '“Cuma günleri\nbenim günüm.”',
    kind: 'heat' as const,
    title: '', desc: '', count: 9, pnl: -1240,
  },
];

// ─── Bir iddia ve cevabı ──────────────────────────────────────────────────

function ClaimBlock({ text, s0 }: { text: string; s0: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const strike = interpolate(frame, [(s0 + P.strike) * fps, (s0 + P.strike + 0.32) * fps], [0, 1], { ...clamp, easing: easeOut });
  const dimmed = interpolate(frame, [(s0 + P.strike + 0.1) * fps, (s0 + P.strike + 0.5) * fps], [1, 0.38], clamp);
  const lines = text.split('\n');
  return (
    <div style={{ position: 'relative', opacity: dimmed }}>
      <Words text={text} start={s0 + P.claim} size={86} stagger={0.09} />
      {/* Yalanın üstü çiziliyor: her satırda, soldan sağa. */}
      {lines.map((_, i) => (
        <div key={i} style={{
          position: 'absolute', left: '6%', right: '6%',
          top: `${(i + 0.56) * (100 / lines.length)}%`,
          height: 6, borderRadius: 3, background: C.red,
          transformOrigin: 'left center',
          transform: `scaleX(${interpolate(strike, [i * 0.35, i * 0.35 + 0.65], [0, 1], clamp)})`,
          boxShadow: '0 0 24px rgba(248,113,113,0.6)',
        }} />
      ))}
    </div>
  );
}

function FlagCard({ s0, title, desc, count, pnl }: { s0: number; title: string; desc: string; count: number; pnl: number }) {
  const n = useCount(count, 0, s0 + P.count, s0 + P.countEnd);
  const v = useCount(pnl, 0, s0 + P.count, s0 + P.countEnd);
  const landed = useProgress(s0 + P.countEnd - 0.05, s0 + P.countEnd + 0.4);
  return (
    <Card style={{ width: 920 }}>
      <div style={{ fontSize: 24, letterSpacing: '0.2em', color: C.faint, fontWeight: 500, marginBottom: 34 }}>
        İŞARETLENEN ALIŞKANLIKLAR
      </div>
      <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }}>
        <div style={{ fontFamily: mono, fontSize: 84, lineHeight: 1, color: C.amber, width: 120, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(n)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 44, fontWeight: 500, color: C.text, letterSpacing: '-0.01em' }}>{title}</div>
          <div style={{ fontSize: 29, color: 'rgba(255,255,255,0.42)', marginTop: 12, lineHeight: 1.4 }}>{desc}</div>
        </div>
      </div>
      <div style={{ height: 1, background: C.line, margin: '38px 0 30px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 28, color: C.faint }}>bu işlemlerin sonucu</div>
        <div style={{
          fontFamily: mono, fontSize: 76, color: C.red, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
          textShadow: `0 0 ${40 * landed}px rgba(248,113,113,${0.45 * landed})`,
        }}>
          {signed(v)}
        </div>
      </div>
    </Card>
  );
}

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const HOURS = ['00', '04', '08', '12', '16', '20'];
// İşlem sayıları ve yön — gerçekçi bir haftalık dağılım. Cuma 12–16 hücresi
// kötü haber: dokuz işlem, belirgin zarar.
const HEAT: [number, number][][] = [
  [[0, 0], [0, 0], [3, 1], [5, 1], [2, -1], [0, 0]],
  [[0, 0], [1, 1], [4, 1], [4, -1], [2, 1], [0, 0]],
  [[0, 0], [0, 0], [5, 1], [3, 1], [3, 1], [1, -1]],
  [[0, 0], [1, -1], [4, 1], [6, 1], [2, -1], [0, 0]],
  [[0, 0], [0, 0], [3, 1], [9, -9], [4, -1], [2, -1]],
  [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
];

function HeatCard({ s0, pnl }: { s0: number; pnl: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (s: number) => (s0 + s) * fps;
  const hot = interpolate(frame, [t(P.count), t(P.count + 0.35)], [0, 1], { ...clamp, easing: easeOut });
  const pulse = hot * (0.75 + 0.25 * Math.sin((frame - t(P.count)) / 4));
  const v = useCount(pnl, 0, s0 + P.count + 0.2, s0 + P.countEnd);
  const callout = useProgress(s0 + P.count + 0.15, s0 + P.count + 0.6);
  return (
    <Card style={{ width: 920, padding: '36px 40px' }}>
      <div style={{ fontSize: 24, letterSpacing: '0.2em', color: C.faint, fontWeight: 500, marginBottom: 26 }}>ISI HARİTASI</div>
      <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(6, 1fr)', gap: 8, alignItems: 'center' }}>
        <div />
        {HOURS.map(h => (
          <div key={h} style={{ fontSize: 22, color: C.faint, textAlign: 'center', fontFamily: mono }}>{h}:00</div>
        ))}
        {HEAT.map((row, di) => (
          <React.Fragment key={di}>
            <div style={{ fontSize: 26, color: di === 4 ? C.text : 'rgba(255,255,255,0.5)', fontWeight: 500, opacity: di === 4 ? 1 : 1 - 0.5 * hot }}>{DAYS[di]}</div>
            {row.map(([n, dir], hi) => {
              const isHot = di === 4 && hi === 3;
              // Hücreler sırayla doluyor: harita "yükleniyor", sonra suçlu yanıyor.
              const appear = interpolate(frame, [t(P.answer + 0.15 + (di * 6 + hi) * 0.012), t(P.answer + 0.45 + (di * 6 + hi) * 0.012)], [0, 1], clamp);
              const intensity = Math.min(1, Math.abs(dir) / 3);
              const base = n === 0 ? 'rgba(255,255,255,0.03)'
                : dir > 0 ? `rgba(52,211,153,${0.12 + intensity * 0.3})` : `rgba(248,113,113,${0.12 + intensity * 0.3})`;
              return (
                <div key={hi} style={{
                  height: 62, borderRadius: 14,
                  // Suçlu yandığında geri kalan harita geri çekiliyor — sitedeki
                  // hover dilinin aynısı: biri öne çıkınca diğerleri söner.
                  opacity: appear * (isHot ? 1 : 1 - 0.62 * hot),
                  background: isHot ? `rgba(248,113,113,${0.28 + 0.35 * pulse})` : base,
                  border: isHot ? `2px solid rgba(248,113,113,${0.3 + 0.7 * hot})` : '1px solid rgba(255,255,255,0.04)',
                  boxShadow: isHot ? `0 0 ${70 * pulse}px rgba(248,113,113,${0.7 * pulse})` : 'none',
                  transform: isHot ? `scale(${1 + 0.16 * hot})` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: mono, fontSize: 26,
                  color: n === 0 ? 'transparent' : isHot ? '#fff' : dir > 0 ? C.green : C.red,
                  zIndex: isHot ? 2 : 1, position: 'relative',
                }}>{n || ''}</div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ height: 1, background: C.line, margin: '32px 0 26px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: callout, transform: `translateY(${(1 - callout) * 12}px)` }}>
        <div style={{ fontSize: 30, color: C.text }}>Cuma <span style={{ color: C.faint, fontFamily: mono, fontSize: 26 }}>12:00–16:00</span></div>
        <div style={{ fontFamily: mono, fontSize: 70, color: C.red, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{signed(v)}</div>
      </div>
    </Card>
  );
}

function PairScene({ i }: { i: number }) {
  const s0 = AYNA.pairs[i];
  const d = PAIRS[i];
  return (
    <Exit at={s0 + P.exit}>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 420 }}>
        <Kicker text="SEN" start={s0 + 0.05} />
        <div style={{ height: 34 }} />
        <ClaimBlock text={d.claim} s0={s0} />
        <div style={{ height: 120 }} />
        <Kicker text="JOURNAL’IN" start={s0 + P.answer - 0.15} color={C.lilac} />
        <div style={{ height: 34 }} />
        <Rise start={s0 + P.answer}>
          {d.kind === 'flag'
            ? <FlagCard s0={s0} title={d.title} desc={d.desc} count={d.count} pnl={d.pnl} />
            : <HeatCard s0={s0} pnl={d.pnl} />}
        </Rise>
      </AbsoluteFill>
    </Exit>
  );
}

// ─── Karşılaştırma ────────────────────────────────────────────────────────

function Bar({ label, pnl, n, max, start, color }: { label: string; pnl: number; n: number; max: number; start: number; color: string }) {
  const p = useProgress(start, start + 1.2, Easing.out(Easing.cubic));
  const v = pnl * p;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 34, color: C.text, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 26, color: C.faint }}>{n} işlem</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 22 }}>
        <div style={{ flex: 1, height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{ width: `${(Math.abs(pnl) / max) * 100 * p}%`, height: '100%', borderRadius: 11, background: color, boxShadow: `0 0 30px ${color}` }} />
        </div>
        <div style={{ fontFamily: mono, fontSize: 60, color, width: 290, textAlign: 'right', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
          {signed(v)}
        </div>
      </div>
    </div>
  );
}

function CompareScene() {
  const s = AYNA.compare;
  const tail = useProgress(s + 3.0, s + 3.6);
  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 400 }}>
      <Words text={'Aynı trader.\nAynı strateji.'} start={s + 0.1} size={92} stagger={0.1} />
      <div style={{ height: 110 }} />
      <Rise start={s + 0.9}>
        <Card style={{ width: 920, display: 'flex', flexDirection: 'column', gap: 54 }}>
          <Bar label="Kurala uyan işlemler" pnl={2140} n={38} max={4860} start={AYNA.compareBars} color={C.green} />
          <Bar label="İşaretlenen işlemler" pnl={-4860} n={26} max={4860} start={AYNA.compareBars + 0.35} color={C.red} />
        </Card>
      </Rise>
      <div style={{ height: 90 }} />
      <div style={{ opacity: tail, transform: `translateY(${(1 - tail) * 14}px)`, fontFamily: serif, fontSize: 56, color: C.dim, fontStyle: 'italic' }}>
        Fark stratejide değil.
      </div>
    </AbsoluteFill>
  );
}

// ─── Final ────────────────────────────────────────────────────────────────

function Verdict() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hitF = AYNA.line2 * fps;
  // Darbe anında çok kısa bir sarsıntı ve parlama.
  const k = frame - hitF;
  const shake = k >= 0 && k < 10 ? Math.sin(k * 2.4) * (10 - k) * 1.3 : 0;
  const flash = interpolate(k, [0, 2, 14], [0, 0.35, 0], clamp);
  const line1Dim = interpolate(frame, [hitF, hitF + 12], [1, 0.42], clamp);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
      <div style={{ opacity: line1Dim }}>
        <Words text={'Kendine yalan\nsöyleyebilirsin.'} start={AYNA.line1} size={104} stagger={0.13} dur={0.7} />
      </div>
      <div style={{ height: 70 }} />
      <Words text={'Journal’ına\nsöyleyemezsin.'} start={AYNA.line2 - 0.04} size={104} stagger={0.05} dur={0.35}
        accent={['söyleyemezsin']} />
      <AbsoluteFill style={{ background: `rgba(240,180,41,${flash})`, mixBlendMode: 'screen', pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
}

// ─── Kompozisyon ──────────────────────────────────────────────────────────

export function AynaKod({ music = true }: { music?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);
  const inDrop = frame >= sec(AYNA.drop);
  const atEnd = frame >= sec(AYNA.end);

  // Kamera çok yavaş yaklaşıyor — izleyen fark etmez ama ekran canlı durur.
  const zoom = interpolate(frame, [0, sec(AYNA.drop)], [1, 1.045], clamp);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Müziksiz versiyon: Instagram/TikTok'ta uygulamanın içinden trend bir
          ses eklenebilsin diye yalnızca efektler kalıyor. */}
      {music && <Html5Audio src={staticFile('music/ayna.wav')} volume={0.9} />}

      {/* Susma anında arka plan ışığı da sönüyor: sadece yazı kalıyor. */}
      <Backdrop glow={inDrop && !atEnd ? 0.3 : 1} gold={atEnd ? 1 : 0} />

      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {[0, 1, 2].map(i => (
          <Window key={i} from={AYNA.pairs[i]} to={AYNA.pairs[i] + 5}><PairScene i={i} /></Window>
        ))}
        {/* Müzik susunca ekran da bir anda kararıyor — kesme sert olmalı. */}
        <Window from={AYNA.compare} to={AYNA.drop}><CompareScene /></Window>
      </AbsoluteFill>

      <Window from={AYNA.drop} to={AYNA.end + 0.2}>
        <Exit at={AYNA.end - 0.25} dur={0.4}><Verdict /></Exit>
      </Window>

      <Window from={AYNA.end} to={AYNA.duration}>
        <Endcard start={AYNA.end} line="Kendini olduğu gibi gör." stacked logoWidth={520} gap={80} />
      </Window>

      <Vignette />
      <Grain />

      <Sounds />
    </AbsoluteFill>
  );
}

/**
 * Sahneyi yalnızca kendi aralığında çizer. Sahneler mutlak saniyeyle
 * yazıldığı için Sequence'ın kare sıfırlamasına gerek yok — zaman çizelgesi
 * (cues.ts) ile kod arasında tek bir çeviri katmanı kalmasın.
 */
function Window({ from, to, children }: { from: number; to: number; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < Math.round(from * fps) || frame >= Math.round(to * fps)) return null;
  return <AbsoluteFill>{children}</AbsoluteFill>;
}

function Sounds() {
  const out: React.ReactNode[] = [];
  AYNA.pairs.forEach((s0, i) => {
    const words = PAIRS[i].claim.split(/\s+/).length;
    for (let w = 0; w < words; w++) out.push(<Sfx key={`w${i}-${w}`} src="sfx/tick.wav" at={s0 + P.claim + w * 0.09 + 0.05} volume={0.4} />);
    out.push(<Sfx key={`th${i}`} src="sfx/thud.wav" at={s0 + P.answer} volume={0.85} />);
    for (let k = 0; k < 14; k++) out.push(<Sfx key={`c${i}-${k}`} src="sfx/count.wav" at={s0 + P.count + k * 0.07} volume={0.55} />);
    out.push(<Sfx key={`st${i}`} src="sfx/strike.wav" at={s0 + P.strike} volume={0.8} />);
    out.push(<Sfx key={`wd${i}`} src="sfx/whoosh_down.wav" at={s0 + P.exit - 0.05} volume={0.35} />);
  });
  out.push(<Sfx key="cmp" src="sfx/thud.wav" at={AYNA.compare + 0.9} volume={0.7} />);
  for (let k = 0; k < 16; k++) out.push(<Sfx key={`cb${k}`} src="sfx/count.wav" at={AYNA.compareBars + k * 0.075} volume={0.45} />);
  ['Kendine', 'yalan', 'söyleyebilirsin.'].forEach((_, k) =>
    out.push(<Sfx key={`l1${k}`} src="sfx/tick.wav" at={AYNA.line1 + k * 0.13 + 0.05} volume={0.45} />));
  out.push(<Sfx key="end-w" src="sfx/whoosh.wav" at={AYNA.end - 0.35} volume={0.4} />);
  out.push(<Sfx key="end-d" src="sfx/ding.wav" at={AYNA.end + 0.28} volume={0.45} />);
  return <>{out}</>;
}

import React from 'react';
import { AbsoluteFill, Html5Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { HIC } from './cues';
import { C, mono, sans, serif } from './theme';
import { Backdrop, BgClip, Card, Endcard, Exit, Grain, Sfx, Vignette, Words, clamp, easeOut, easeInOut, useProgress } from './ui';

/**
 * HİÇBİR ŞEY YAPMA — "Journal'a tek tuşa bile basmadın."
 *
 * Journal tutmamanın bir numaralı sebebi zahmet. Bu video o bahaneyi
 * kaldırıyor: pozisyon açılıyor, journal'da aynı saniye "Tamamlanmadı"
 * satırı beliriyor; kapanınca aynı satır kendiliğinden doluyor. Son
 * hafta yaptığımız özelliğin — açık pozisyonun anında kaydı — tanıtımı.
 *
 * Rakamlar birbirini tutuyor: 0,27 lot altın (dolar başına $27), stop 7,50,
 * hedef 18,00 → risk $202,50, kazanç $486,00, 2,4R.
 */

const ENTRY = 4311.0;
const SL = 4318.5;
const TP = 4293.0;
const PER_DOLLAR = 27;                     // 0.27 lot × 100 ons
const WIN = (ENTRY - TP) * PER_DOLLAR;     // 486
const R = (ENTRY - TP) / (SL - ENTRY);     // 2.4

// ─── Fiyat ────────────────────────────────────────────────────────────────

const smooth01 = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };
const wobble = (t: number) => 0.55 * Math.sin(7.1 * t) + 0.35 * Math.sin(13.3 * t + 1) + 0.22 * Math.sin(23 * t + 2) + 0.4 * Math.sin(2.3 * t + 0.4);

/**
 * Fiyat yolu. Giriş anında tam 4311,00'da, hedefte tam 4293,00'te — sayılar
 * ekranda tutsun diye oynaklık o iki anda sıfıra iniyor. Arada gerçekçi bir
 * geri çekilme var: satış önce biraz ters gidiyor, sonra hedefe iniyor.
 */
function price(t: number) {
  const { click, tp } = HIC;
  const g = Math.min(1, Math.abs(t - click) / 0.45) * Math.min(1, Math.abs(t - tp) / 0.45);
  let path: number;
  if (t <= click) path = ENTRY + 2.2 * Math.sin(0.9 * t + 0.6) - 2.2 * Math.sin(0.9 * click + 0.6) + 1.2 * smooth01((click - t) / 3);
  else if (t <= tp) {
    const x = (t - click) / (tp - click);
    const e = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    path = ENTRY + (TP - ENTRY) * e + 5.2 * Math.sin(2 * Math.PI * x) * (1 - x) * (x < 0.5 ? 1 : 0.35);
  } else path = TP + 0.9 * (t - tp);
  // Yüksek frekanslı titreşim: her mumun gövdesi ve fitili buradan. Önce yalnız
  // yavaş dalga vardı ve mumlar grafikte nokta gibi, cansız görünüyordu.
  const hf = 0.95 * Math.sin(41 * t) + 0.65 * Math.sin(67 * t + 1.3) + 0.45 * Math.sin(29 * t + 0.7);
  return path + (wobble(t) * 1.5 + hf) * g;
}

// ─── Terminal ─────────────────────────────────────────────────────────────

const CANDLE = 0.22;      // bir mumun animasyon süresi
const VISIBLE = 34;
const CH_W = 800, CH_H = 330;
const P_HI = 4322, P_LO = 4289;
const py = (p: number) => ((P_HI - p) / (P_HI - P_LO)) * CH_H;

function ohlc(k: number, upTo: number) {
  const t0 = k * CANDLE;
  const t1 = Math.min((k + 1) * CANDLE, upTo);
  const o = price(t0);
  let h = o, l = o, c = o;
  for (let i = 1; i <= 8; i++) {
    const tt = t0 + ((t1 - t0) * i) / 8;
    const p = price(tt);
    h = Math.max(h, p); l = Math.min(l, p); c = p;
  }
  return { o, h, l, c };
}

function Chart({ t }: { t: number }) {
  const cur = Math.floor(t / CANDLE);
  const frac = (t / CANDLE) - cur;
  const cw = CH_W / VISIBLE;
  const opened = t >= HIC.click;
  const closed = t >= HIC.tp;
  const lineFade = closed ? interpolate(t, [HIC.tp + 0.35, HIC.tp + 0.9], [1, 0], clamp) : 1;
  const tpFlash = interpolate(t, [HIC.tp, HIC.tp + 0.08, HIC.tp + 0.6], [0, 1, 0], clamp);
  const now = price(t);

  const candles = [];
  for (let i = 0; i <= VISIBLE; i++) {
    const k = cur - VISIBLE + i;
    const { o, h, l, c } = ohlc(k, t);
    const x = (i - frac) * cw;
    const up = c >= o;
    const col = up ? C.green : C.red;
    candles.push(
      <g key={k}>
        <line x1={x + cw / 2} x2={x + cw / 2} y1={py(h)} y2={py(l)} stroke={col} strokeWidth={2} opacity={0.9} />
        <rect x={x + cw * 0.18} width={cw * 0.64} y={py(Math.max(o, c))} height={Math.max(2, Math.abs(py(o) - py(c)))} fill={col} rx={2} />
      </g>,
    );
  }

  const Level = ({ p, color, label, dash = '10 8', op = 1 }: { p: number; color: string; label: string; dash?: string; op?: number }) => (
    <g opacity={op}>
      <line x1={0} x2={CH_W} y1={py(p)} y2={py(p)} stroke={color} strokeWidth={2.5} strokeDasharray={dash} />
      <rect x={8} y={py(p) - 34} width={label.length * 14 + 24} height={28} rx={6} fill={color} opacity={0.18} />
      <text x={20} y={py(p) - 14} fill={color} fontFamily={mono} fontSize={20}>{label}</text>
    </g>
  );

  return (
    <svg width={CH_W} height={CH_H} style={{ overflow: 'hidden', display: 'block' }}>
      {[0.2, 0.4, 0.6, 0.8].map(f => (
        <line key={f} x1={0} x2={CH_W} y1={CH_H * f} y2={CH_H * f} stroke="rgba(255,255,255,0.05)" />
      ))}
      {candles}
      {opened && (
        <>
          <Level p={SL} color={C.red} label="SL 4318.50" op={lineFade} />
          <Level p={TP} color={C.green} label="TP 4293.00" op={Math.max(lineFade, tpFlash)} />
          <Level p={ENTRY} color="rgba(255,255,255,0.75)" label="SELL 0.27 · 4311.00" dash="4 6" op={lineFade} />
        </>
      )}
      {/* Anlık fiyat çizgisi */}
      <line x1={0} x2={CH_W} y1={py(now)} y2={py(now)} stroke="rgba(167,139,250,0.5)" strokeWidth={1.5} />
      {tpFlash > 0 && <rect x={0} y={py(TP) - 30} width={CH_W} height={60} fill={C.green} opacity={tpFlash * 0.25} />}
    </svg>
  );
}

function Terminal() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const now = price(t);
  const opened = t >= HIC.click && t < HIC.tp;
  const pnl = t >= HIC.tp ? WIN : (ENTRY - now) * PER_DOLLAR;
  const press = interpolate(t, [HIC.click - 0.05, HIC.click, HIC.click + 0.15], [1, 0.93, 1], clamp);
  const ripple = interpolate(t, [HIC.click, HIC.click + 0.5], [0, 1], clamp);
  const toast = interpolate(t, [HIC.tp + 0.1, HIC.tp + 0.4, HIC.verdict - 0.3, HIC.verdict], [0, 1, 1, 0], clamp);

  return (
    <Card style={{ width: 880, padding: '30px 40px 34px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ fontSize: 34, fontWeight: 600, color: C.text }}>XAUUSD</span>
          <span style={{ fontSize: 24, color: C.faint, fontFamily: mono }}>M5</span>
        </div>
        <span style={{ fontFamily: mono, fontSize: 38, color: C.text, fontVariantNumeric: 'tabular-nums' }}>{now.toFixed(2)}</span>
      </div>
      <div style={{ fontSize: 22, color: C.faint, letterSpacing: '0.18em', marginTop: 6 }}>METATRADER 5</div>
      <div style={{ marginTop: 22, borderRadius: 14, overflow: 'hidden', background: 'rgba(0,0,0,0.25)' }}>
        <Chart t={t} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 24 }}>
        <div style={{ position: 'relative', flex: 1, transform: `scale(${press})` }}>
          <div style={{ background: C.red, color: '#1a0a0a', fontWeight: 600, fontSize: 30, borderRadius: 14, padding: '18px 0', textAlign: 'center' }}>SELL</div>
          {ripple > 0 && ripple < 1 && (
            <div style={{ position: 'absolute', inset: -4, borderRadius: 18, border: `3px solid ${C.red}`, opacity: 1 - ripple, transform: `scale(${1 + ripple * 0.12})` }} />
          )}
        </div>
        <div style={{ fontFamily: mono, fontSize: 28, color: C.dim, width: 110, textAlign: 'center' }}>0.27</div>
        <div style={{ flex: 1, background: '#60a5fa', color: '#07121f', fontWeight: 600, fontSize: 30, borderRadius: 14, padding: '18px 0', textAlign: 'center' }}>BUY</div>
      </div>
      {/* Açık pozisyonun anlık kâr/zararı */}
      <div style={{ position: 'absolute', right: 40, top: 128, fontFamily: mono, fontSize: 26, opacity: opened ? 1 : 0, color: pnl >= 0 ? C.green : C.red }}>
        {pnl >= 0 ? '+' : '−'}${Math.abs(pnl).toFixed(2)}
      </div>
      {/* Hedef: pozisyon kapandı */}
      <div style={{
        position: 'absolute', left: '50%', top: 250, transform: `translate(-50%, ${(1 - toast) * 16}px)`, opacity: toast,
        // Mumların üstünde okunabilsin: saydam değil, koyu ve dolu.
        background: 'rgba(8,24,18,0.92)', border: '1px solid rgba(52,211,153,0.55)', color: C.green,
        boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 30px rgba(52,211,153,0.25)',
        fontFamily: mono, fontSize: 30, borderRadius: 999, padding: '14px 30px', whiteSpace: 'nowrap',
        backdropFilter: 'blur(6px)',
      }}>✓ TP · +${WIN.toFixed(2)}</div>
    </Card>
  );
}

/** İmleç: SELL'e gidiyor, tıklıyor, sonra çekiliyor — "eller serbest". */
function Cursor() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const go = interpolate(t, [HIC.cursor, HIC.click - 0.1], [0, 1], { ...clamp, easing: easeInOut });
  const away = interpolate(t, [HIC.click + 0.35, HIC.click + 1.1], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const x = 760 - 460 * go + 420 * away;
  const y = 1260 - 365 * go + 300 * away;
  const op = interpolate(t, [HIC.cursor - 0.3, HIC.cursor, HIC.click + 0.8, HIC.click + 1.1], [0, 1, 1, 0], clamp);
  const press = interpolate(t, [HIC.click - 0.05, HIC.click, HIC.click + 0.12], [1, 0.85, 1], clamp);
  return (
    <svg width={60} height={70} style={{ position: 'absolute', left: x, top: y, opacity: op, transform: `scale(${press})`, filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))' }}>
      <path d="M4 3 L4 52 L17 40 L26 62 L35 58 L26 37 L44 37 Z" fill="#fff" stroke="#111" strokeWidth={3} strokeLinejoin="round" />
    </svg>
  );
}

// ─── Journal ──────────────────────────────────────────────────────────────

function Row({ time, symbol, side, r, amount, pill, highlight = 0, dim = 1 }: {
  time: string; symbol: string; side: 'Buy' | 'Sell'; r?: string; amount?: string; pill?: string; highlight?: number; dim?: number;
}) {
  const win = amount?.startsWith('+');
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 22, padding: '20px 18px', borderRadius: 16, opacity: dim,
      background: highlight > 0 ? `rgba(240,180,41,${0.08 * highlight})` : undefined,
      border: `1px solid rgba(240,180,41,${0.35 * highlight})`,
      boxShadow: highlight > 0 ? `0 0 ${40 * highlight}px rgba(240,180,41,${0.15 * highlight})` : 'none',
    }}>
      <span style={{ fontFamily: mono, fontSize: 24, color: C.faint, width: 84 }}>{time}</span>
      <span style={{ fontSize: 32, fontWeight: 500, color: C.text, width: 160 }}>{symbol}</span>
      <span style={{ fontSize: 28, fontWeight: 500, color: side === 'Buy' ? C.green : C.red, width: 76 }}>{side}</span>
      <span style={{ fontFamily: mono, fontSize: 26, color: 'rgba(255,255,255,0.45)', width: 110, textAlign: 'right' }}>{r ?? ''}</span>
      <span style={{ marginLeft: 'auto', fontFamily: mono, fontSize: 32, fontWeight: 500, color: win ? C.green : C.red }}>
        {pill ? (
          <span style={{ fontFamily: sans, fontSize: 22, fontWeight: 500, color: C.amber, background: 'rgba(251,191,36,0.12)', borderRadius: 999, padding: '8px 18px' }}>{pill}</span>
        ) : amount}
      </span>
    </div>
  );
}

function Journal() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const inP = interpolate(t, [HIC.row, HIC.row + 0.5], [0, 1], { ...clamp, easing: easeOut });
  const glowIn = interpolate(t, [HIC.row, HIC.row + 0.3, HIC.row + 1.6], [0, 1, 0.25], clamp);
  const filled = t >= HIC.fill;
  const fillP = interpolate(t, [HIC.fill, HIC.fill + 0.8], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const glowFill = interpolate(t, [HIC.fill, HIC.fill + 0.25, HIC.fill + 1.8], [0, 1, 0.35], clamp);
  const rowH = 86;
  return (
    <Card style={{ width: 880, padding: '30px 26px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 18px 18px' }}>
        <div style={{ fontFamily: serif, fontSize: 40, color: C.text }}>Instant 10K</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, color: C.dim }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: C.green, boxShadow: `0 0 12px ${C.green}` }} />
          MetaTrader bağlı
        </div>
      </div>
      <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.55)', padding: '6px 18px 8px' }}>Bugün</div>
      {/* Yeni satır yukarıdan açılıyor, eskileri aşağı itiyor. */}
      <div style={{ height: rowH * inP, overflow: 'visible', opacity: inP, transform: `translateY(${(1 - inP) * -20}px)` }}>
        <Row time="14:02" symbol="XAUUSD" side="Sell"
          highlight={filled ? glowFill : glowIn}
          r={filled ? `+${(R * fillP).toFixed(1)}R` : undefined}
          amount={filled ? `+$${(WIN * fillP).toFixed(2)}` : undefined}
          pill={filled ? undefined : 'Tamamlanmadı'} />
      </div>
      <Row time="11:20" symbol="EURUSD" side="Buy" r="+1.1R" amount="+$220.00" dim={0.55} />
      <Row time="09:05" symbol="USDJPY" side="Sell" r="−1.0R" amount="−$200.00" dim={0.55} />
    </Card>
  );
}

/** Terminalden journal'a akan ışık: kayıt "kendiliğinden" gidiyor. */
function Sync({ at }: { at: number }) {
  const p = useProgress(at, at + 0.42, Easing.inOut(Easing.quad));
  if (p <= 0 || p >= 1) return null;
  return (
    <div style={{ position: 'absolute', left: 540 - 6, top: 1028 + p * 92, width: 12, height: 12, borderRadius: 6, background: C.gold, boxShadow: `0 0 24px 6px rgba(240,180,41,0.7)` }} />
  );
}

// ─── Kompozisyon ──────────────────────────────────────────────────────────

function Caption({ text, from, to, accent }: { text: string; from: number; to: number; accent?: string[] }) {
  const out = useProgress(to - 0.3, to, Easing.in(Easing.quad));
  return (
    <div style={{ position: 'absolute', top: 222, left: 0, right: 0, opacity: 1 - out, filter: `blur(${out * 8}px)` }}>
      <Words text={text} start={from} size={70} stagger={0.08} accent={accent} />
    </div>
  );
}

function Window({ from, to, children }: { from: number; to: number; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < Math.round(from * fps) || frame >= Math.round(to * fps)) return null;
  return <AbsoluteFill>{children}</AbsoluteFill>;
}

export function Hic({ music = true }: { music?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Hüküm anında sahne geri çekiliyor, yalnızca cümle kalıyor.
  const back = interpolate(t, [HIC.verdict - 0.2, HIC.verdict + 0.3], [0, 1], { ...clamp, easing: easeOut });
  const intro = interpolate(t, [0, 0.5], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {music && <Html5Audio src={staticFile('music/hic.wav')} volume={0.9} />}
      <Backdrop glow={1} gold={t >= HIC.end ? 1 : 0} />
      {/* "Tek tuşa bile basmadın": arkasına yaslanmış, kahvesini içen trader. */}
      <BgClip src="clips/hic_relaxed.mp4" from={HIC.verdict - 0.25} to={HIC.duration} rate={0.8}
        opacity={(t) => interpolate(t, [HIC.verdict, HIC.end - 0.2, HIC.end + 0.4], [0.36, 0.36, 0.12], clamp)} />
      {/* Oda aydınlık: beyaz yazı okunsun diye ortası koyulaşıyor. */}
      {t >= HIC.verdict - 0.25 && t < HIC.end && (
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 50%, rgba(5,5,7,0.55), transparent 75%)' }} />
      )}

      <Window from={0} to={HIC.end}>
        <Exit at={HIC.end - 0.3} dur={0.3}>
          <AbsoluteFill style={{ opacity: intro * (1 - 0.86 * back), filter: `blur(${back * 10}px)`, transform: `scale(${1 - back * 0.04})` }}>
            <AbsoluteFill style={{ alignItems: 'center' }}>
              <div style={{ position: 'absolute', top: 380 }}><Terminal /></div>
              {/* Bağlantı çizgisi */}
              <div style={{ position: 'absolute', left: 539, top: 1022, width: 2, height: 100, background: 'linear-gradient(180deg, rgba(240,180,41,0.0), rgba(240,180,41,0.35), rgba(240,180,41,0.0))' }} />
              <div style={{ position: 'absolute', top: 1110 }}><Journal /></div>
            </AbsoluteFill>
            <Sync at={HIC.sync1} />
            <Sync at={HIC.sync2} />
            <Cursor />
          </AbsoluteFill>

          <div style={{ opacity: 1 - back }}>
            <Caption text="Sen işlemine gir." from={HIC.cap1} to={HIC.cap2 - 0.05} />
            <Caption text="Biz yazalım." from={HIC.cap2} to={HIC.cap3 - 0.05} accent={['yazalım']} />
            <Caption text="Kapanınca biz tamamlayalım." from={HIC.cap3} to={HIC.verdict} accent={['tamamlayalım']} />
          </div>

          {t >= HIC.verdict - 0.1 && (
            <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Words text={'Journal’a tek tuşa\nbile basmadın.'} start={HIC.verdict} size={96} stagger={0.11} dur={0.6} accent={['basmadın']} />
            </AbsoluteFill>
          )}
        </Exit>
      </Window>

      <Window from={HIC.end} to={HIC.duration}>
        <Endcard start={HIC.end} line="MetaTrader 5 ile otomatik." stacked logoWidth={520} gap={80} />
      </Window>

      <Vignette />
      <Grain />
      <Sounds />
    </AbsoluteFill>
  );
}

function Sounds() {
  return (
    <>
      <Sfx src="sfx/click.wav" at={HIC.click - 0.02} volume={0.9} />
      <Sfx src="sfx/whoosh.wav" at={HIC.sync1 - 0.1} volume={0.25} />
      <Sfx src="sfx/thud.wav" at={HIC.row} volume={0.55} />
      <Sfx src="sfx/tick.wav" at={HIC.row + 0.05} volume={0.6} />
      <Sfx src="sfx/ding.wav" at={HIC.tp} volume={0.6} />
      <Sfx src="sfx/whoosh.wav" at={HIC.sync2 - 0.1} volume={0.25} />
      <Sfx src="sfx/thud.wav" at={HIC.fill} volume={0.5} />
      {Array.from({ length: 12 }, (_, k) => <Sfx key={k} src="sfx/count.wav" at={HIC.fill + k * 0.065} volume={0.4} />)}
      <Sfx src="sfx/whoosh.wav" at={HIC.end - 0.35} volume={0.35} />
      <Sfx src="sfx/ding.wav" at={HIC.end + 0.28} volume={0.35} />
    </>
  );
}

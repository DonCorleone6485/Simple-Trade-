import React from 'react';
import { AbsoluteFill, Html5Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { REKLAM } from './cues';
import { C, mono, sans, signed, money } from './theme';
import { Backdrop, Card, Endcard, Grain, Sfx, Vignette, clamp } from './ui';

/**
 * INSTAGRAM REKLAMI — 30 sn, dikey.
 *
 * Yapay zekâ sunucu (Seedance 2.0, dudaklar Türkçe seslendirmeye senkron)
 * kancayı söylüyor; sonra sesi devam ederken sitenin ekranları geliyor.
 * Sunucu bir anlatıcı — kendini müşteri gibi tanıtmıyor, uydurma bir
 * kullanıcı yorumu yok.
 *
 * Altyazılar kelime kelime yanıyor: Reels'i çoğu kişi sesi kapalı izliyor.
 */

const R = REKLAM;

// Seslendirme cümleleri, saniye cinsinden (ses dosyalarındaki sessizliklerden ölçüldü).
const CAPS: [number, number, string][] = [
  [0.0, 1.72, 'Prop hesabın yine mi patladı?'],
  [2.17, 3.44, 'Sorun stratejin değil.'],
  [3.81, 5.84, 'Sorun, aynı hatayı tekrarlaman.'],
  [R.vo1, R.vo1 + 1.41, 'Simple Trading Journal,'],
  [R.vo1 + 1.86, R.vo1 + 4.92, "MetaTrader'daki işlemlerini kendiliğinden kaydeder."],
  [R.vo2 + 0.18, R.vo2 + 1.58, 'Hatalarını işaretler.'],
  [R.vo3 + 0.21, R.vo3 + 3.1, 'Prop sınırına ne kadar kaldığını her an gösterir.'],
  [R.vo4 + 0.08, R.vo4 + 1.16, 'Ücretsiz başla.'],
  [R.vo5 + 0.17, R.vo5 + 1.08, 'Link profilde.'],
];

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};
const pr = (t: number, a: number, z: number, e = Easing.bezier(0.16, 1, 0.3, 1)) => interpolate(t, [a, z], [0, 1], { ...clamp, easing: e });

function Window({ from, to, children }: { from: number; to: number; children: React.ReactNode }) {
  const t = useT();
  if (t < from || t >= to) return null;
  return <AbsoluteFill>{children}</AbsoluteFill>;
}

/** Kelime kelime yanan altyazı: söylenen kelime altın, söylenmişler beyaz. */
function Captions() {
  const t = useT();
  const cur = CAPS.find(([a, z]) => t >= a - 0.05 && t < z + 0.35);
  if (!cur) return null;
  const [a, z, text] = cur;
  const words = text.split(' ');
  const pop = pr(t, a - 0.05, a + 0.15, Easing.out(Easing.back(2)));
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1230, textAlign: 'center', transform: `scale(${0.9 + 0.1 * pop})`, opacity: Math.min(1, pop * 2) }}>
      {words.map((w, i) => {
        const at = a + ((z - a) * i) / words.length;
        const said = t >= at;
        const now = said && t < a + ((z - a) * (i + 1)) / words.length;
        return (
          <span key={i} style={{
            display: 'inline-block', margin: '0 0.2em', fontFamily: sans, fontWeight: 800, fontSize: 68, lineHeight: 1.2,
            color: now ? C.gold : said ? '#fff' : 'rgba(255,255,255,0.55)',
            transform: `scale(${now ? 1.04 : 1})`,
            textShadow: '0 4px 0 rgba(0,0,0,0.55), 0 0 24px rgba(0,0,0,0.8), 0 0 4px #000',
            letterSpacing: '-0.02em',
          }}>{w}</span>
        );
      })}
    </div>
  );
}

/** Sunucu çekimi: kaynak saniyesinden başlayıp istenen hızda oynar. */
function Presenter({ from, to, startAt = 0, rate = 1, zoom = [1, 1.06] as [number, number] }: {
  from: number; to: number; startAt?: number; rate?: number; zoom?: [number, number];
}) {
  const t = useT();
  const { fps } = useVideoConfig();
  const z = interpolate(t, [from, to], zoom, clamp);
  return (
    <Sequence from={Math.round(from * fps)} durationInFrames={Math.round((to - from) * fps)} layout="none">
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <OffthreadVideo src={staticFile('clips/presenter.mp4')} muted playbackRate={rate} startFrom={Math.round(startAt * fps)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, transformOrigin: '50% 30%' }} />
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />
      </AbsoluteFill>
    </Sequence>
  );
}

function Kicker({ text, at }: { text: string; at: number }) {
  const t = useT();
  const p = pr(t, at, at + 0.4);
  return (
    <div style={{ position: 'absolute', top: 420, left: 0, right: 0, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
      <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 30, letterSpacing: '0.22em', color: C.lilac, border: '1px solid rgba(167,139,250,0.4)', borderRadius: 999, padding: '12px 28px' }}>{text}</span>
    </div>
  );
}

// ─── Ürün sahneleri ───────────────────────────────────────────────────────

function AutoRow() {
  const t = useT();
  const s = R.s1;
  const inP = pr(t, s + 0.3, s + 0.9);
  const fill = pr(t, s + 3.2, s + 4.2);
  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 560 }}>
      <Kicker text="OTOMATİK KAYIT" at={s + 0.1} />
      <div style={{ opacity: inP, transform: `translateY(${(1 - inP) * 60}px)` }}>
        <Card style={{ width: 940, padding: '34px 30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 20px' }}>
            <span style={{ fontSize: 40, fontWeight: 600, color: C.text }}>Instant 10K</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, color: C.dim }}>
              <span style={{ width: 14, height: 14, borderRadius: 7, background: C.green, boxShadow: `0 0 12px ${C.green}` }} />MetaTrader bağlı
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 22, padding: '26px 18px', borderRadius: 18,
            background: `rgba(240,180,41,${0.1 - 0.06 * fill})`, border: `1px solid rgba(240,180,41,${0.45 - 0.3 * fill})`,
          }}>
            <span style={{ fontFamily: mono, fontSize: 28, color: C.faint }}>14:02</span>
            <span style={{ fontSize: 38, fontWeight: 600, color: C.text }}>XAUUSD</span>
            <span style={{ fontSize: 32, fontWeight: 500, color: C.red }}>Sell</span>
            <span style={{ marginLeft: 'auto', position: 'relative', height: 56, display: 'flex', alignItems: 'center' }}>
              <span style={{ opacity: 1 - fill, fontSize: 26, fontWeight: 500, color: C.amber, background: 'rgba(251,191,36,0.12)', borderRadius: 999, padding: '10px 22px' }}>Tamamlanmadı</span>
              <span style={{ position: 'absolute', right: 0, opacity: fill, fontFamily: mono, fontSize: 42, color: C.green, whiteSpace: 'nowrap' }}>+$486.00 <span style={{ fontSize: 30, color: C.dim }}>+2.4R</span></span>
            </span>
          </div>
        </Card>
      </div>
    </AbsoluteFill>
  );
}

function Flags() {
  const t = useT();
  const s = R.s2;
  const rows: [number, string, number][] = [[14, 'Hemen geri girme', -1380], [6, 'Riski büyütme', -2240], [29, 'Aşırı işlem', -940]];
  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 560 }}>
      <Kicker text="DİSİPLİN ANALİZİ" at={s + 0.1} />
      <Card style={{ width: 940, padding: '26px 40px' }}>
        {rows.map(([n, title, pnl], i) => {
          const p = pr(t, s + 0.3 + i * 0.35, s + 0.8 + i * 0.35);
          const v = interpolate(t, [s + 0.4 + i * 0.35, s + 1.4 + i * 0.35], [0, pnl], { ...clamp, easing: Easing.out(Easing.cubic) });
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '26px 0', borderTop: i ? `1px solid ${C.line}` : 'none', opacity: p, transform: `translateX(${(1 - p) * 40}px)` }}>
              <span style={{ fontFamily: mono, fontSize: 52, color: C.amber, width: 80, textAlign: 'right' }}>{n}</span>
              <span style={{ fontSize: 38, fontWeight: 500, color: C.text }}>{title}</span>
              <span style={{ marginLeft: 'auto', fontFamily: mono, fontSize: 42, color: C.red }}>{signed(v)}</span>
            </div>
          );
        })}
      </Card>
    </AbsoluteFill>
  );
}

function PropScene() {
  const t = useT();
  const s = R.s3;
  const cells: [string, number, number, 'target' | 'loss', string][] = [
    ['HEDEFE KALAN', 1000, 640, 'target', 'hedef $1,000'],
    ['BUGÜNKÜ LİMİTE KALAN', 500, 188, 'loss', 'bugün −$312'],
    ['TOPLAM KAYBA KALAN', 1000, 780, 'loss', 'taban $9,000'],
  ];
  const p = pr(t, s + 0.5, s + 2.6, Easing.out(Easing.cubic));
  const inP = pr(t, s + 0.2, s + 0.8);
  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 560 }}>
      <Kicker text="PROP SAYACI" at={s + 0.1} />
      <div style={{ opacity: inP, transform: `translateY(${(1 - inP) * 60}px)` }}>
        <Card style={{ width: 940, display: 'flex', flexDirection: 'column', gap: 40, padding: '40px 44px' }}>
          {cells.map(([label, limit, left, kind, note]) => {
            const now = limit - (limit - left) * p;
            const ratio = (limit - now) / limit;
            const col = kind === 'target' ? C.gold : ratio >= 0.5 ? C.amber : C.green;
            return (
              <div key={label}>
                <div style={{ fontSize: 24, letterSpacing: '0.14em', color: C.faint, fontWeight: 500 }}>{label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}>
                  <span style={{ fontFamily: mono, fontSize: 62, color: col, letterSpacing: '-0.03em' }}>{money(now)}</span>
                  <span style={{ fontFamily: mono, fontSize: 24, color: C.faint }}>{note}</span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.07)', marginTop: 12, overflow: 'hidden' }}>
                  <div style={{ width: `${ratio * 100}%`, height: '100%', background: col, borderRadius: 5, boxShadow: `0 0 16px ${col}` }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </AbsoluteFill>
  );
}

function Cta() {
  const t = useT();
  const btn = pr(t, R.vo4, R.vo4 + 0.45, Easing.out(Easing.back(2.2)));
  const link = pr(t, R.vo5, R.vo5 + 0.4);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 760, flexDirection: 'column', gap: 26 }}>
      <div style={{ transform: `scale(${btn})`, opacity: Math.min(1, btn * 1.5), fontFamily: sans, fontWeight: 800, fontSize: 56, color: '#0a0a0c', background: C.gold, borderRadius: 999, padding: '28px 64px', boxShadow: '0 20px 60px rgba(240,180,41,0.45)' }}>
        Ücretsiz başla
      </div>
      <div style={{ opacity: link, transform: `translateY(${(1 - link) * 16}px)`, fontFamily: sans, fontWeight: 600, fontSize: 38, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
        simpletradejournal.io
      </div>
      <div style={{ opacity: link, fontFamily: sans, fontWeight: 800, fontSize: 64, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,0.55), 0 0 24px rgba(0,0,0,0.8)' }}>
        Link profilde ↓
      </div>
    </AbsoluteFill>
  );
}

// ─── Kompozisyon ──────────────────────────────────────────────────────────

export function Reklam({ music = true }: { music?: boolean }) {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {music && <Html5Audio src={staticFile('music/reklam.wav')} volume={0.3} />}
      <Sfx src="voice/hook.mp3" at={0} volume={1} />
      <Sfx src="voice/vo_a.wav" at={R.vo1} volume={1} />
      <Sfx src="voice/vo_b.wav" at={R.vo2} volume={1} />
      <Sfx src="voice/vo_c.wav" at={R.vo3} volume={1} />
      <Sfx src="voice/vo_d.wav" at={R.vo4} volume={1} />
      <Sfx src="voice/vo_e.wav" at={R.vo5} volume={1} />
      <Sfx src="sfx/whoosh.wav" at={R.s1 - 0.25} volume={0.35} />
      <Sfx src="sfx/thud.wav" at={R.s2} volume={0.4} />
      <Sfx src="sfx/thud.wav" at={R.s3} volume={0.4} />
      <Sfx src="sfx/ding.wav" at={R.s1 + 3.2} volume={0.35} />
      <Sfx src="sfx/whoosh.wav" at={R.end - 0.3} volume={0.35} />

      {/* Kanca: sunucu konuşuyor */}
      <Presenter from={0} to={R.s1} startAt={0} zoom={[1.0, 1.07]} />

      {/* Ürün: sunucunun sesi, sitenin ekranları */}
      <Window from={R.s1} to={R.cta}>
        <Backdrop glow={1} />
        <Window from={R.s1} to={R.s2}><AutoRow /></Window>
        <Window from={R.s2} to={R.s3}><Flags /></Window>
        <Window from={R.s3} to={R.cta}><PropScene /></Window>
      </Window>

      {/* Çağrı: sunucu gülümsüyor, başını sallıyor */}
      <Presenter from={R.cta} to={R.end} startAt={5.9} rate={0.55} zoom={[1.07, 1.12]} />
      <Window from={R.cta} to={R.end}><Cta /></Window>

      <Window from={R.end} to={R.duration}>
        <Backdrop glow={1} gold={1} />
        <Endcard start={R.end} line="Disiplin, basitlikle." stacked logoWidth={520} gap={80} />
      </Window>

      {/* Kapanışta buton ve adres yazıyı zaten taşıyor; altyazı tekrar etmesin. */}
      {t < R.cta && <Captions />}
      <Vignette strength={0.45} />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
}

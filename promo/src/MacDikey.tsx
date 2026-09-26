import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { MAC } from './cues';
import { C, mono, sans, serif } from './theme';
import { Endcard, Grain, Words, clamp } from './ui';
import { Mac, tapeMode, tapeTime, tc } from './Mac';

/**
 * MAÇ KASETİ — DİKEY (1080×1920, Reels / TikTok / Shorts).
 *
 * Sahneler yeniden çizilmiyor: yatay film (Mac, yazısız) bir "akıllı kamera"
 * ile dikey kadraja alınıyor. Kamera her sahnede önemli yere odaklanıyor ve
 * gerektiğinde kayıyor — kalem daireyi çizmeden hemen önce "−1.7R"ye, journal
 * rakamını gösterirken yandaki karta. Boşluk, aynı karenin bulanık hâliyle
 * doluyor. Yazılar (altyazı, slogan, logo) dikey ekrana göre ayrıca diziliyor.
 */

const VW = 1080;
const FY = 880;            // kadrajın ekrandaki dikey merkezi — altta altyazıya yer kalsın
const [K1, K2, K3] = MAC.clips;

type Key = [number, number, number, number]; // [zaman, kaynak x, kaynak y, ölçek]
const cut = 0.001;

/** Kamera: kaynaktaki hangi nokta, ne büyüklükte ekranın ortasına gelsin. */
const KEYS: Key[] = [
  [0, 900, 540, 1.78],
  [MAC.play, 900, 540, 1.78],
  [MAC.sub2 - 0.15, 1150, 470, 1.95],                 // televizyona doğru
  [MAC.sub2 - 0.1 + cut, 1260, 470, 1.78],            // kesme: trader
  [K1.start - 0.01, 1300, 470, 1.9],
  [K1.start, 600, 470, 1.12],                          // klip 1: grafik
  [K1.freeze, 600, 470, 1.12],
  [K1.draw - 0.05, 1395, 470, 1.22],                  // kalemden hemen önce "−1.7R"
  [K1.end - 0.01, 1395, 480, 1.25],
  [K2.start, 650, 500, 1.0],                           // klip 2: liste
  [K2.data - 0.35, 650, 500, 1.0],
  [K2.data + 0.1, 1480, 430, 1.2],                    // disiplin kartı
  [K2.end - 0.01, 1480, 430, 1.24],
  [K3.start, 705, 540, 0.9],                           // klip 3: takvim
  [K3.data - 0.35, 705, 540, 0.9],
  [K3.data + 0.1, 1596, 480, 1.15],
  [MAC.stop - 0.01, 1596, 480, 1.18],
  [MAC.stop, 960, 540, 0.56],                          // televizyon kapanışı: tüm kare
  [MAC.stop + 0.6, 960, 540, 0.56],
  [MAC.stop + 0.6 + cut, 1000, 480, 1.78],             // gözler
  [MAC.montage - 0.01, 1000, 470, 1.9],
  [MAC.montage, 960, 625, 0.62],                       // montaj: kartlar
  [MAC.week - 0.01, 960, 625, 0.62],
  [MAC.week, 960, 620, 0.78],                          // üç hafta sonra
  [MAC.end - 0.01, 960, 620, 0.78],
  [MAC.end, 960, 520, 1.78],                           // kapanış: ringe yürüyüş, tam ekran
  [MAC.duration, 960, 500, 1.9],
];

function camera(t: number) {
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1][0] <= t) i++;
  const [t0, x0, y0, s0] = KEYS[i];
  const [t1, x1, y1, s1] = KEYS[i + 1];
  const p = t1 - t0 < 0.01 ? 1 : interpolate(t, [t0, t1], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  return { x: x0 + (x1 - x0) * p, y: y0 + (y1 - y0) * p, s: s0 + (s1 - s0) * p };
}

function Framed({ x, y, s, cy = FY, children }: { x: number; y: number; s: number; cy?: number; children: React.ReactNode }) {
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${VW / 2 - x * s}px, ${cy - y * s}px) scale(${s})` }}>
      {children}
    </div>
  );
}

// ─── Yazılar ──────────────────────────────────────────────────────────────

const SUBS: [string, number, number][] = [
  ['Her maçtan sonra aynı şeyi yaparlar.', MAC.sub1, MAC.sub2 - 0.1],
  ['Kaseti açarlar.', MAC.sub2, K1.start],
  ['Burada. Stopu uzaklaştırdın.', K1.sub, K1.end],
  ['Kaybettin. Dört dakika sonra geri girdin.', K2.sub, K2.end],
  ['Bir günde on bir işlem.', K3.sub, MAC.stop],
];

function Subtitles({ t }: { t: number }) {
  const cur = SUBS.find(([, a, z]) => t >= a && t < z);
  if (!cur) return null;
  const [text, a, z] = cur;
  const op = interpolate(t, [a, a + 0.3, z - 0.3, z], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: 1380, textAlign: 'center', opacity: op, transform: `translateY(${(1 - Math.min(1, op * 1.5)) * 12}px)` }}>
      <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 58, lineHeight: 1.35, color: C.text, background: 'rgba(0,0,0,0.6)', padding: '8px 22px', borderRadius: 12, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}>— {text}</span>
    </div>
  );
}

function TapeTop({ t }: { t: number }) {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  if (t < MAC.insert || t >= MAC.stop + 0.3) return null;
  const mode = tapeMode(t);
  const blink = Math.floor(f / 12) % 2 === 0;
  const label = { off: '', rew: '◀◀  GERİ SAR', play: '▶  OYNAT', pause: '❚❚  DURAKLAT', stop: '■  DURDUR' }[mode];
  const color = mode === 'pause' ? C.gold : mode === 'rew' ? C.lilac : C.text;
  const progress = Math.min(1, Math.max(0, (tapeTime(t) - (14 * 3600 + 2 * 60)) / 60));
  const chroma = { textShadow: '2px 0 rgba(255,60,60,0.45), -2px 0 rgba(60,160,255,0.45)' };
  return (
    <>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 200, display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 30, ...chroma }}>
        <div style={{ color: 'rgba(255,255,255,0.75)', letterSpacing: '0.1em' }}>
          HAFTA 38 · MAÇ KASETİ
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, color: 'rgba(255,255,255,0.45)', marginTop: 12 }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: C.red, opacity: blink ? 1 : 0.2 }} />İNCELEME
          </div>
        </div>
        <div style={{ color, textAlign: 'right' }}>
          <span style={{ opacity: mode === 'pause' && !blink ? 0.25 : 1 }}>{label}</span>
          <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.55)', marginTop: 12 }}>{tc(tapeTime(t), fps)}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 1320, height: 4, background: 'rgba(255,255,255,0.14)', borderRadius: 2 }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', background: 'rgba(255,255,255,0.6)' }} />
      </div>
    </>
  );
}

const CAPS: [string, number][] = [
  ['Her işlem\nkendiliğinden kaydolur.', 0], ['Her alışkanlık\nişaretlenir.', 1], ['Sınırın her an\ngözünün önünde.', 2],
  ['Kırmızı haberden önce\nhaber verir.', 3], ['Grafiğin ve notun,\nhepsi yerinde.', 4], ['Haftanı tek bakışta gör.', 5],
];

function Overlays({ t }: { t: number }) {
  const beat4 = MAC.beat * 4;
  const cap = t >= MAC.montage && t < MAC.week ? CAPS[Math.min(5, Math.floor((t - MAC.montage) / beat4))] : null;
  const champOut = interpolate(t, [MAC.montage - 0.35, MAC.montage], [1, 0], clamp);
  const champDim = interpolate(t, [MAC.hit2 - 0.05, MAC.hit2 + 0.35], [1, 0.4], clamp);
  return (
    <>
      {t >= MAC.champ1 && t < MAC.montage && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 60, opacity: champOut }}>
          <div style={{ opacity: champDim }}>
            <Words text={'Şampiyonlar\nkaybettikleri\nmaçı izler.'} start={MAC.champ1} size={104} stagger={0.28} dur={0.6} accent={['izler']} />
          </div>
          <Words text={'Amatörler\nbir sonrakine\nkoşar.'} start={MAC.champ2} size={104} stagger={0.28} dur={0.6} accentColor={C.red} accent={['koşar']} />
        </AbsoluteFill>
      )}
      {cap && (
        <div key={cap[1]} style={{ position: 'absolute', top: 300, left: 60, right: 60 }}>
          <Words text={cap[0]} start={MAC.montage + cap[1] * beat4} size={72} stagger={0.05} dur={0.35} />
        </div>
      )}
      {t >= MAC.week && t < MAC.end && (
        <div style={{ position: 'absolute', top: 360, left: 0, right: 0 }}>
          <Words text="Üç hafta sonra." start={MAC.week + 0.05} size={92} stagger={0.1} />
        </div>
      )}
    </>
  );
}

// ─── Kompozisyon ──────────────────────────────────────────────────────────

export function MacDikey({ music = true }: { music?: boolean }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const cam = camera(t);
  const inChamp = t >= MAC.champ1 && t < MAC.montage;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      {/* Arka plan: aynı kare, kadrajı dolduracak kadar büyük ve bulanık. Sessiz kopya. */}
      <AbsoluteFill style={{ filter: 'blur(38px) brightness(0.45) saturate(1.2)', transform: 'scale(1.1)' }}>
        <Framed x={cam.x} y={cam.y} s={1.9} cy={960}>
          <Mac music={false} bare silent />
        </Framed>
      </AbsoluteFill>
      {/* Ön plan: akıllı kamera. Ses buradan geliyor. */}
      <AbsoluteFill style={{ opacity: inChamp ? 0.55 : 1 }}>
        <Framed x={cam.x} y={cam.y} s={cam.s} cy={cam.s >= 1.7 ? 960 : FY}>
          <Mac music={music} bare />
        </Framed>
      </AbsoluteFill>
      <TapeTop t={t} />
      <Subtitles t={t} />
      <Overlays t={t} />
      {t >= MAC.end && (
        <AbsoluteFill style={{ background: `rgba(5,5,7,${interpolate(t, [MAC.end, MAC.end + 0.6], [0, 0.55], clamp)})` }}>
          <Endcard start={MAC.end} line="Kasetini izle." stacked logoWidth={520} gap={80} />
        </AbsoluteFill>
      )}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
}

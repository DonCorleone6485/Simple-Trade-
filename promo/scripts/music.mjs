/**
 * Videoların müzikleri. Her parça kendi zaman çizelgesine göre yazılıyor
 * (src/cues.ts) — vuruşlar görüntüdeki anlarla aynı kareye düşsün diye.
 *
 * TELEFON HOPARLÖRÜ: izleyenlerin çoğu telefondan izliyor ve telefon 100 Hz'in
 * altını neredeyse hiç çalmıyor. O yüzden her alçak ses (kalp atışı, darbe)
 * bir de orta frekansta duyulan bir "gövde" taşıyor; yalnız alt bas olsaydı
 * telefonda müzik yok gibi gelirdi.
 *
 * Kullanım: node scripts/music.mjs [ayna|fis|hic|mac]
 */
import {
  buffer, add, biquad, osc, noise, decay, env, reseed, midi, smooth,
  reverb, normalize, saturate, fadeEdges, writeWav,
  kick, snare, tom, hat, pad, sub, pluck, riser, impact,
} from './dsp.mjs';
import { AYNA, FIS, HIC, MAC, REEL } from '../src/cues.ts';

const OUT = new URL('../public/music/', import.meta.url).pathname;
import { mkdirSync } from 'node:fs';
mkdirSync(OUT, { recursive: true });

/** Telefonda da duyulan kalp atışı: alçak vuruş + orta frekans "tok". */
function beat(buf, at, gain = 1) {
  const lp = biquad('lp', 200);
  const bp = biquad('bp', 320, 1.1);
  const hit = (t0, g) => {
    const o = osc('sine');
    const o2 = osc('sine');
    add(buf, at + t0, 0.55, (t) =>
      lp(o(52 + 45 * Math.exp(-t / 0.03)) * env(t, 0.005, 0.12)) * 1.0
      + o2(150 + 60 * Math.exp(-t / 0.02)) * env(t, 0.003, 0.05) * 0.35
      + bp(noise()) * env(t, 0.002, 0.018) * 0.5, g);
  };
  hit(0, gain);
  hit(0.2, gain * 0.62);
}

/** Zamana bağlı ana ses eğrisi. */
function master(buf, g) {
  for (let i = 0; i < buf.n; i++) {
    const k = g(i / 48000);
    buf.L[i] *= k; buf.R[i] *= k;
  }
}

/** Hızlanan tempo: başlangıç ve bitiş BPM'i arasında vuruş zamanları. */
function beatTimes(t0, t1, bpm0, bpm1) {
  const out = [];
  let t = t0;
  while (t < t1) {
    out.push(t);
    const x = (t - t0) / (t1 - t0);
    t += 60 / (bpm0 + (bpm1 - bpm0) * x);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────
// AYNA — Re minör. Gerilim üç iddia boyunca kalp atışıyla birikir,
// karşılaştırmada doruğa çıkar, "Kendine yalan söyleyebilirsin"de susar,
// "söyleyemezsin"de patlar, logoda Fa majöre — umuda — çözülür.
// ─────────────────────────────────────────────────────────────────────────
function ayna() {
  reseed(101);
  const C = AYNA;
  const b = buffer(C.duration + 0.5);

  // Kalp atışı: 64'ten 88'e hızlanarak, susma anına kadar.
  beatTimes(0.15, C.drop - 0.25, 64, 88).forEach((t, i) => beat(b, t, 0.9 + Math.min(0.3, i * 0.012)));

  // Pad akorları — süzgeç açıldıkça akorlar parlaklaşıyor, gerilim artıyor.
  const cut = (base) => (from) => (t) => 450 + 1300 * smooth(from + t, 0, C.drop) * base;
  const chords = [
    [0, 5, [50, 53, 57, 64]],          // Dm9
    [5, 5, [46, 50, 53, 57]],          // B♭maj7
    [10, 5, [43, 46, 50, 57]],         // Gm9
    [15, 4.5, [45, 52, 55, 61]],       // A7 — çözülmek isteyen akor
  ];
  chords.forEach(([at, dur, notes]) =>
    pad(b, at, dur, notes, { gain: 0.34, attack: at === 0 ? 1.8 : 0.4, release: 0.6, cutoff: cut(1)(at) }));

  // Alt bas: kulaklıkta hissedilsin.
  sub(b, 0, 15, 38, { gain: 0.16, attack: 2 });       // D2
  sub(b, 15, 4.3, 33, { gain: 0.18, attack: 0.3, release: 0.2 }); // A1

  // Her iddianın başında tek, alçak bir tel sesi — yeni bir "suçlama".
  C.pairs.forEach((p, i) => pluck(b, p + C.pair.claim, [62, 58, 55][i], { gain: 0.16, tau: 1.4, bright: 0.6 }));

  // Saat tıkırtısı: ikinci iddiadan itibaren, giderek belirginleşen.
  for (let t = 5; t < C.drop - 0.1; t += 60 / 76 / 2) hat(b, t, 0.05 + 0.1 * smooth(t, 5, C.drop), 0.3);

  // Karşılaştırmada yükselen gerilim.
  riser(b, C.riser, C.drop - C.riser, 0.32);

  // Susma: yalnızca çok ince, yüksek bir çınlama — kulakta kalan sessizlik.
  {
    const o = osc('sine');
    add(b, C.drop, C.line2 - C.drop, (t) => o(1760) * smooth(t, 0, 1.6) * 0.5, 0.025);
  }

  // "söyleyemezsin": darbe + koyu Re minör.
  impact(b, C.line2, 0.95);
  pad(b, C.line2, C.end - C.line2 - 0.3, [38, 45, 50, 53], { gain: 0.3, attack: 0.05, release: 1.2, cutoff: (t) => 1400 - 700 * Math.min(1, t / 2.5) });
  sub(b, C.line2, C.end - C.line2 - 0.3, 26, { gain: 0.22, attack: 0.02, release: 1 });

  // Logo: Fa majör ekli dokuzlu — ağırlık kalkıyor.
  pad(b, C.end, C.duration - C.end - 1.4, [53, 57, 60, 67], { gain: 0.3, attack: 0.9, release: 1.4, cutoff: () => 1600 });
  sub(b, C.end, C.duration - C.end - 1.4, 41, { gain: 0.14, attack: 0.9, release: 1.4 });
  [[0.35, 72], [0.95, 69], [1.55, 65], [2.3, 67]].forEach(([dt, m], i) =>
    pluck(b, C.end + dt, m, { gain: 0.13 - i * 0.012, tau: 1.8, pan: (i % 2 ? 0.35 : -0.35), bright: 0.8 }));

  reverb(b, { mix: 0.3, size: 0.86, damp: 0.35 });
  // Ana ses eğrisi: gerilim BİRİKSİN. Baştan tam seste başlayan bir parça
  // doruğa ulaşacak yer bırakmıyor; ilk dalga formu 19 saniye boyunca düz bir
  // bloktu. Fısıltıyla başlayıp susma anına doğru açılıyor.
  master(b, (t) => t < C.drop ? 0.32 + 0.68 * Math.pow(smooth(t, 0, C.drop), 1.3) : t < C.end ? 1 : 0.8);
  saturate(b, 1.15);
  fadeEdges(b, 0.01, 1.2);
  normalize(b, -1);
  writeWav(OUT + 'ayna.wav', b);
}


// ─────────────────────────────────────────────────────────────────────────
// FİŞ — La minör, mekanik. Yazıcı işledikçe ritim sıkışıyor; TOPLAM'dan önce
// her şey susuyor, rakam darbeyle geliyor. "Aynı hatayı satın almayı bırak"ta
// ağır bir durgunluk; prop sayacında ilk kez majör ve ileriye giden bir nabız.
// ─────────────────────────────────────────────────────────────────────────
function fis() {
  reseed(202);
  const C = FIS;
  const b = buffer(C.duration + 0.5);
  const spb = 60 / 120;

  // Mekanik bölüm: 16'lık tıkırtı, dörtlük tekme, alçakta ısrarcı bir bas.
  for (let t = 0.2; t < C.pause; t += spb / 4) {
    const i = Math.round((t - 0.2) / (spb / 4));
    hat(b, t, (i % 4 === 0 ? 0.16 : 0.07) * (0.5 + 0.5 * smooth(t, 0, C.pause)), (i % 2 ? 0.3 : -0.2));
  }
  for (let t = 0.95; t < C.pause; t += spb) kick(b, t, { gain: 0.55, f0: 120, f1: 45, tau: 0.22 });
  const bassLine = [45, 45, 45, 46];      // La La La Si♭ — kapanmayan bir halka
  let k = 0;
  for (let t = 0.95; t < C.pause - 0.1; t += spb / 2) {
    const m = bassLine[k++ % 4];
    const o = osc('saw'); const lp = biquad('lp', 380, 1.2); const o2 = osc('sine');
    add(b, t, spb / 2 - 0.02, (tt) => (lp(o(midi(m))) * 0.6 + o2(midi(m - 12)) * 0.5) * env(tt, 0.004, 0.16), 0.22);
  }
  pad(b, 0, C.pause - 0.05, [45, 48, 52, 58], { gain: 0.22, attack: 1.2, release: 0.05, cutoff: (t) => 500 + 1200 * smooth(t, 0, C.pause) });

  // TOPLAM: darbe ve karanlık bir la.
  impact(b, C.total, 0.8);
  sub(b, C.total, C.tear - C.total, 33, { gain: 0.2, attack: 0.02, release: 0.4 });
  pad(b, C.total, C.tear - C.total - 0.2, [33, 45, 52], { gain: 0.22, attack: 0.05, release: 0.5, cutoff: (t) => 1300 - 800 * Math.min(1, t / 2) });

  // "Aynı hatayı satın almayı bırak": ağır, alçak; "bırak"ta yumuşak darbe.
  pad(b, C.line - 0.1, C.prop - C.line - 0.2, [38, 45, 50, 53], { gain: 0.26, attack: 0.6, release: 0.5, cutoff: () => 850 });
  sub(b, C.line - 0.1, C.prop - C.line - 0.2, 26, { gain: 0.16, attack: 0.6 });
  kick(b, C.lineHit, { gain: 0.8, f0: 100, f1: 36, tau: 0.5 });

  // Prop sayacı: ilk majör, ileriye giden bir nabız — kontrol sende.
  const spb2 = 60 / 104;
  const prog = [[41, [53, 57, 60, 64]], [36, [52, 55, 60, 67]], [45, [52, 57, 60, 64]], [43, [50, 55, 59, 62]]]; // F C Am G
  const barLen = spb2 * 2;
  prog.forEach(([bass, ch], i) => {
    const t0 = C.prop + i * barLen;
    pad(b, t0, barLen, ch, { gain: 0.22, attack: i === 0 ? 0.4 : 0.08, release: 0.3, cutoff: () => 1500 });
    sub(b, t0, barLen, bass, { gain: 0.12, attack: 0.05, release: 0.2 });
    // Sekizlik arpej.
    for (let j = 0; j < 4; j++) pluck(b, t0 + j * spb2 / 2, ch[j] + 12, { gain: 0.09, tau: 0.5, pan: (j % 2 ? 0.4 : -0.4), bright: 0.7 });
    kick(b, t0, { gain: 0.45, f0: 110, f1: 45, tau: 0.25 });
    kick(b, t0 + spb2, { gain: 0.35, f0: 110, f1: 45, tau: 0.25 });
    for (let j = 0; j < 4; j++) hat(b, t0 + j * spb2 / 2 + spb2 / 4, 0.06, 0.25);
  });

  // Logo: Fa majör ekli dokuzlu.
  pad(b, C.end, C.duration - C.end - 1.2, [41, 53, 57, 60, 67], { gain: 0.28, attack: 0.5, release: 1.2, cutoff: () => 1700 });
  [[0.35, 72], [0.9, 69], [1.45, 65], [2.1, 67]].forEach(([dt, m], i) =>
    pluck(b, C.end + dt, m, { gain: 0.12, tau: 1.6, pan: (i % 2 ? 0.35 : -0.35), bright: 0.8 }));

  reverb(b, { mix: 0.24, size: 0.84, damp: 0.35 });
  master(b, (t) => (t < C.pause ? 0.45 + 0.55 * smooth(t, 0, C.pause) : 1));
  saturate(b, 1.15);
  fadeEdges(b, 0.01, 1.0);
  normalize(b, -1);
  writeWav(OUT + 'fis.wav', b);
}

// ─────────────────────────────────────────────────────────────────────────
// HİÇBİR ŞEY YAPMA — Do majör, sakin. Yumuşak bir lo-fi: sıcak elektrik
// piyano akorları, fırça gibi hi-hat, derinden bir vuruş. İşlem kapandığında
// zil; "tek tuş basmadın"da her şey bir nefes duruyor.
// ─────────────────────────────────────────────────────────────────────────
/** Elektrik piyano: hafif titreşimli sinüs + çan harmoniği. */
function keys(buf, at, m, dur, gain = 0.1, pan = 0) {
  const f = midi(m);
  const o1 = osc('sine'), o2 = osc('sine'), o3 = osc('sine');
  add(buf, at, dur + 1.2, (t) => {
    const trem = 1 + 0.12 * Math.sin(2 * Math.PI * 4.5 * t);
    const e = env(t, 0.006, dur * 0.9 + 0.3);
    return (o1(f) + o2(f * 2) * 0.22 * decay(t, 0.25) + o3(f * 3.98) * 0.08 * decay(t, 0.08)) * e * trem;
  }, gain, pan);
}

function hic() {
  reseed(303);
  const C = HIC;
  const b = buffer(C.duration + 0.5);
  const spb = 60 / 84;
  const bar = spb * 4;
  // Cmaj9 — Am9 — Fmaj9 — G6/9: dönüp duran, huzurlu bir döngü.
  const prog = [[36, [55, 59, 62, 64]], [45, [55, 60, 64, 71]], [41, [57, 60, 64, 67]], [43, [55, 59, 62, 64]]];
  const loopEnd = C.verdict;
  for (let bi = 0; bi * bar < loopEnd; bi++) {
    const [bass, ch] = prog[bi % 4];
    const t0 = 0.05 + bi * bar;
    // Akor: vuruşun hemen arkasından, tembel.
    ch.forEach((m, i) => keys(b, t0 + 0.02 + i * 0.012, m, bar * 0.8, 0.055, (i - 1.5) * 0.25));
    ch.forEach((m, i) => { if (t0 + spb * 2.5 < loopEnd) keys(b, t0 + spb * 2.5 + i * 0.01, m, spb * 1.2, 0.03, (i - 1.5) * 0.25); });
    sub(b, t0, Math.min(bar, loopEnd - t0), bass, { gain: 0.13, attack: 0.05, release: 0.3 });
    for (let j = 0; j < 4; j++) {
      const t = t0 + j * spb;
      if (t >= loopEnd) break;
      if (j === 0 || j === 2) kick(b, t, { gain: 0.32, f0: 95, f1: 45, tau: 0.2 });
      if (j === 1 || j === 3) snare(b, t, 0.08, 0.1);
      hat(b, t + spb / 2 + 0.03, 0.045, 0.3);   // hafif gecikmeli: sallanan his
      hat(b, t, 0.025, -0.3);
    }
  }
  // "Tek tuş basmadın": bir nefes — yalnızca tutulan bir akor.
  pad(b, C.verdict, C.end - C.verdict - 0.2, [48, 55, 60, 64, 67], { gain: 0.2, attack: 0.3, release: 0.4, cutoff: () => 1300 });
  // Logo: Do majör dokuzlu, açık ve sıcak.
  pad(b, C.end, C.duration - C.end - 1.1, [36, 48, 55, 62, 64], { gain: 0.24, attack: 0.5, release: 1.1, cutoff: () => 1600 });
  [[0.35, 76], [0.85, 74], [1.35, 71], [1.9, 72]].forEach(([dt, m], i) =>
    pluck(b, C.end + dt, m, { gain: 0.11, tau: 1.6, pan: (i % 2 ? 0.35 : -0.35), bright: 0.8 }));

  reverb(b, { mix: 0.28, size: 0.85, damp: 0.45 });
  saturate(b, 1.1);
  fadeEdges(b, 0.4, 1.0);
  normalize(b, -1);
  writeWav(OUT + 'hic.wav', b);
}

// ─────────────────────────────────────────────────────────────────────────
// MAÇ KASETİ — La minör → Do majör. Soyunma odasında gece: seyrek piyano ve
// kaset cızırtısı; kaset incelemesinde ağır, ısrarcı bir nabız; kaset
// durunca sessizlik ve iki büyük darbe; montajda tam bir marş; kapanışta
// Do majör — kazanılmış bir huzur.
// ─────────────────────────────────────────────────────────────────────────
function mac() {
  reseed(404);
  const C = MAC;
  const b = buffer(C.duration + 0.5);

  // Piyano motifi: soru soran, çözülmeyen dört nota.
  [[3.2, 57], [3.8, 64], [4.4, 72], [5.0, 71], [5.8, 57], [6.4, 64], [7.0, 69], [7.6, 67]].forEach(([t, m], i) =>
    pluck(b, t, m, { gain: 0.16, tau: 1.5, pan: (i % 2 ? 0.25 : -0.25), bright: 0.9 }));
  pad(b, 2.8, C.clips[0].start - 2.8, [45, 52, 57], { gain: 0.18, attack: 2.2, release: 0.6, cutoff: () => 700 });

  // Kaset incelemesi: 84 BPM, ağır bir nabız. Am — F — C — G.
  const spb = 60 / 84;
  const prog = [[45, [57, 60, 64]], [41, [57, 60, 65]], [48, [55, 60, 64]], [43, [55, 59, 62]]];
  const s0 = C.clips[0].play;
  for (let bi = 0; s0 + bi * spb * 4 < C.stop - 0.05; bi++) {
    const t0 = s0 + bi * spb * 4;
    const [bass, ch] = prog[bi % 4];
    const len = Math.min(spb * 4, C.stop - t0);
    pad(b, t0, len, ch, { gain: 0.2, attack: 0.3, release: 0.2, cutoff: (t) => 600 + 900 * smooth(t0 + t, s0, C.stop) });
    sub(b, t0, len, bass - 12, { gain: 0.14, attack: 0.05, release: 0.2 });
    for (let j = 0; j < 4; j++) {
      const t = t0 + j * spb;
      if (t >= C.stop) break;
      kick(b, t, { gain: j % 2 ? 0.3 : 0.5, f0: 110, f1: 42, tau: 0.25 });
      if (j % 2) snare(b, t, 0.1, 0.1);
      hat(b, t + spb / 2, 0.06, 0.3);
    }
  }
  // Her duraklatmada bir taiko: "işte burada".
  C.clips.forEach((c) => { tom(b, c.freeze, 0.7, 70); tom(b, c.freeze + 0.18, 0.4, 58); });

  // Montaja giden darbeler ve yükseliş.
  sub(b, C.champ1 - 0.4, C.montage - C.champ1, 33, { gain: 0.22, attack: 1.0, release: 0.3 });
  pad(b, C.champ1 - 0.4, C.montage - C.champ1, [45, 52, 57, 60], { gain: 0.16, attack: 1.2, release: 0.3, cutoff: (t) => 500 + 800 * smooth(t, 0, C.montage - C.champ1) });
  impact(b, C.hit1, 0.9);
  impact(b, C.hit2, 1.0);
  riser(b, C.riser, C.montage - C.riser, 0.35);

  // Montaj: 126 BPM marş. F — G — Am — C, dört vuruşta bir akor = bir kesme.
  const beat = C.beat;
  const mprog = [[41, [57, 60, 65, 69]], [43, [59, 62, 67, 71]], [45, [60, 64, 69, 72]], [48, [60, 64, 67, 72]]];
  for (let bi = 0; C.montage + bi * beat * 4 < C.end - 0.02; bi++) {
    const t0 = C.montage + bi * beat * 4;
    const [bass, ch] = mprog[bi % 4];
    const len = Math.min(beat * 4, C.end - t0);
    const lift = smooth(t0, C.montage, C.week);
    pad(b, t0, len, ch, { gain: 0.24, attack: 0.03, release: 0.15, cutoff: () => 1600 + 800 * lift });
    // Bas: sekizlik, oktavlı.
    for (let j = 0; j < 8; j++) {
      const t = t0 + j * beat / 2;
      if (t >= C.end) break;
      const o = osc('saw'); const lp = biquad('lp', 700, 1.1);
      const m = bass - 12 + (j % 2 ? 12 : 0);
      add(b, t, beat / 2 - 0.02, (tt) => lp(o(midi(m))) * env(tt, 0.004, 0.14), 0.16);
    }
    // On altılık arpej — parıltı.
    for (let j = 0; j < 16; j++) {
      const t = t0 + j * beat / 4;
      if (t >= C.end) break;
      pluck(b, t, ch[j % 4] + 12, { gain: 0.045 + 0.02 * lift, tau: 0.25, pan: (j % 2 ? 0.45 : -0.45), bright: 0.6 });
    }
    for (let j = 0; j < 4; j++) {
      const t = t0 + j * beat;
      if (t >= C.end) break;
      kick(b, t, { gain: 0.6, f0: 130, f1: 44, tau: 0.22 });
      if (j % 2) snare(b, t, 0.2, 0.05);
      hat(b, t + beat / 2, 0.09, 0.3);
      hat(b, t + beat / 4, 0.04, -0.3);
      hat(b, t + beat * 3 / 4, 0.04, -0.3);
    }
  }
  // Haftalık karşılaştırmadan önce tom dolgusu.
  [0, 1, 2, 3, 4, 5].forEach(i => tom(b, C.week - beat * 1.5 + i * beat / 4, 0.3 + i * 0.05, 120 - i * 10, (i % 2 ? 0.3 : -0.3)));

  // Kapanış: darbe ve Do majör dokuzlu.
  impact(b, C.end, 0.7);
  pad(b, C.end, C.duration - C.end - 1.6, [36, 48, 55, 62, 64, 67], { gain: 0.28, attack: 0.2, release: 1.6, cutoff: (t) => 2200 - 900 * Math.min(1, t / 3) });
  [[0.5, 72], [1.1, 76], [1.7, 74], [2.5, 79], [3.3, 76]].forEach(([dt, m], i) =>
    pluck(b, C.end + dt, m, { gain: 0.12, tau: 1.8, pan: (i % 2 ? 0.35 : -0.35), bright: 0.8 }));

  reverb(b, { mix: 0.24, size: 0.86, damp: 0.35 });
  // Duraklatmalarda müzik geri çekiliyor — antrenör konuşuyor.
  master(b, (t) => {
    let g = t < C.clips[0].start ? 0.55 + 0.45 * smooth(t, 0, C.clips[0].start) : 1;
    for (const c of C.clips) {
      if (t > c.freeze && t < c.end) g *= 1 - 0.5 * smooth(t, c.freeze, c.freeze + 0.25) * (1 - smooth(t, c.end - 0.6, c.end));
    }
    return g;
  });
  saturate(b, 1.15);
  fadeEdges(b, 0.01, 1.4);
  normalize(b, -1);
  writeWav(OUT + 'mac.wav', b);
}

// ─────────────────────────────────────────────────────────────────────────
// SHOWREEL — 128 BPM, Fa minör, elektronik. 64 vuruş = 30 sn.
// Giriş (0–8) filtreli ve yükselen; 8'de düşüş: dörtlük tekme, pompalayan
// pad ve bas; her 8 vuruşta bir darbe; 44–48 trampet yuvarlaması; 48'de
// ikinci düşüş; 56'da final darbesi, 60'ta son vuruş.
// ─────────────────────────────────────────────────────────────────────────
function clap(buf, at, gain = 0.5) {
  const bp = biquad('bp', 1500, 0.9);
  [0, 0.011, 0.022].forEach((d, i) => add(buf, at + d, 0.25, (t) => bp(noise()) * decay(t, i === 2 ? 0.09 : 0.012) * 2, gain * (i === 2 ? 1 : 0.6)));
}

function reel() {
  reseed(505);
  const bt = REEL.beat;
  const B = (n) => n * bt;
  const b = buffer(REEL.duration + 0.5);
  const drums = (n) => (n >= 8 && n < 44) || (n >= 48 && n < 60);
  // Akorlar: Fm — D♭ — A♭ — E♭ (her biri 4 vuruş)
  const prog = [[41, [53, 56, 60, 65]], [37, [53, 56, 61, 65]], [44, [56, 60, 63, 68]], [39, [55, 58, 63, 67]]];
  for (let bar = 0; bar < 16; bar++) {
    const t0 = B(bar * 4);
    const [bass, ch] = prog[bar % 4];
    const lift = bar < 2 ? smooth(t0, 0, B(8)) : 1;
    pad(b, t0, B(4), ch, { gain: 0.2 + 0.05 * lift, attack: bar === 0 ? 1.5 : 0.02, release: 0.1, cutoff: (t) => (bar < 2 ? 400 + 1400 * smooth(t0 + t, 0, B(8)) : 2200) });
    if (bar >= 2 && bar < 15) {
      // Bas: on altılıklar, oktav zıplamalı
      for (let j = 0; j < 16; j++) {
        const t = t0 + j * bt / 4;
        const m = bass - 12 + (j % 4 === 2 ? 12 : 0);
        const o = osc('saw'); const lp = biquad('lp', 600, 1.4);
        add(b, t, bt / 4 - 0.01, (tt) => lp(o(midi(m))) * env(tt, 0.003, 0.07), 0.2);
      }
    }
    // Arpej parıltısı
    if (bar >= 2 && bar < 15) for (let j = 0; j < 8; j++) pluck(b, t0 + j * bt / 2, ch[(j * 3) % 4] + 12, { gain: 0.05, tau: 0.22, pan: j % 2 ? 0.5 : -0.5, bright: 0.7 });
  }
  for (let n = 0; n < 64; n++) {
    const t = B(n);
    if (drums(n)) {
      kick(b, t, { gain: 0.75, f0: 150, f1: 46, tau: 0.2 });
      hat(b, t + bt / 2, 0.12, 0.3);
      hat(b, t + bt / 4, 0.05, -0.3); hat(b, t + 3 * bt / 4, 0.05, -0.3);
      if (n % 2) clap(b, t, 0.45);
    } else if (n < 8) {
      for (let k = 0; k < 4; k++) hat(b, t + k * bt / 4, 0.03 + 0.05 * (n / 8), 0.2);
      if (n >= 4) kick(b, t, { gain: 0.25 + 0.05 * (n - 4), f0: 120, f1: 50, tau: 0.12 });
    }
  }
  // Trampet yuvarlaması: 44–48, sıklaşarak
  for (let n = 44; n < 48; n += 0.25) snare(b, B(n), 0.12 + 0.3 * ((n - 44) / 4), 0);
  for (let n = 46; n < 48; n += 0.125) snare(b, B(n), 0.1 + 0.2 * ((n - 46) / 2), 0.2);
  riser(b, B(4), B(4), 0.3);
  riser(b, B(44), B(4), 0.35);
  [8, 16, 24, 32, 40, 48, 56].forEach((n) => impact(b, B(n), n === 48 || n === 56 ? 0.9 : 0.45));
  // Final: tek büyük akor ve son vuruş
  pad(b, B(56), B(8), [41, 53, 56, 60, 65], { gain: 0.26, attack: 0.02, release: 1.5, cutoff: (t) => 2600 - 1500 * Math.min(1, t / 3) });
  impact(b, B(60), 0.8);
  sub(b, B(56), B(6), 29, { gain: 0.18, attack: 0.02, release: 1.2 });

  reverb(b, { mix: 0.18, size: 0.8, damp: 0.4 });
  // Pompalama (sidechain): her tekmede ses kısılıp geri geliyor
  master(b, (t) => {
    const n = Math.floor(t / bt);
    if (!drums(n)) return t > B(62) ? Math.max(0, 1 - (t - B(62)) / (REEL.duration - B(62))) : 1;
    const x = (t - n * bt) / bt;
    return 0.55 + 0.45 * Math.min(1, x / 0.45);
  });
  saturate(b, 1.2);
  fadeEdges(b, 0.01, 0.4);
  normalize(b, -1);
  writeWav(OUT + 'reel.wav', b);
}

const which = process.argv[2] || 'all';
const jobs = { ayna, fis, hic, mac, reel };
for (const [name, fn] of Object.entries(jobs)) {
  if (which === 'all' || which === name) { fn(); console.log('müzik:', name); }
}

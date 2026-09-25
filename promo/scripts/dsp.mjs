/**
 * Küçük bir ses motoru.
 *
 * Tanıtım videolarının müziği ve efektleri burada sentezleniyor. Hazır müzik
 * kullanmıyoruz: telif derdi yok, ve her vuruş videodaki kareyle birebir
 * aynı ana konabiliyor.
 *
 * Her şey stereo Float32 tamponlarla çalışıyor; en sonda 16 bit WAV yazılıyor.
 */
import { writeFileSync } from 'node:fs';

export const SR = 48000;

/** Uzunluğu saniye olarak verilen boş stereo tampon. */
export function buffer(seconds) {
  const n = Math.ceil(seconds * SR);
  return { L: new Float32Array(n), R: new Float32Array(n), n };
}

// ── Rastgelelik: her çalıştırmada aynı sesi üretsin diye tohumlu ──
let seed = 1234567;
export function reseed(s) { seed = s >>> 0; }
export function rand() {
  seed ^= seed << 13; seed >>>= 0;
  seed ^= seed >> 17;
  seed ^= seed << 5; seed >>>= 0;
  return seed / 4294967296;
}
export const noise = () => rand() * 2 - 1;

// ── Biquad süzgeçler (RBJ cookbook) ──
export function biquad(type, freq, q = 0.707, gainDb = 0) {
  let b0, b1, b2, a0, a1, a2;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const set = (f) => {
    const w = 2 * Math.PI * Math.min(Math.max(f, 10), SR * 0.45) / SR;
    const cw = Math.cos(w), sw = Math.sin(w), alpha = sw / (2 * q);
    const A = Math.pow(10, gainDb / 40);
    switch (type) {
      case 'lp': b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = (1 - cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; break;
      case 'hp': b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; break;
      case 'bp': b0 = alpha; b1 = 0; b2 = -alpha; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; break;
      case 'peak': b0 = 1 + alpha * A; b1 = -2 * cw; b2 = 1 - alpha * A; a0 = 1 + alpha / A; a1 = -2 * cw; a2 = 1 - alpha / A; break;
    }
  };
  set(freq);
  const f = (x) => {
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
  f.set = set;
  return f;
}

// ── Zarflar ──
/** Üstel sönüm: t saniyede, tau yarı ömre yakın bir sabit. */
export const decay = (t, tau) => (t < 0 ? 0 : Math.exp(-t / tau));
/** Yumuşak atak + üstel sönüm. */
export const env = (t, attack, tau) =>
  t < 0 ? 0 : t < attack ? t / attack : Math.exp(-(t - attack) / tau);
/** Doğrusal geçiş, sınırlanmış. */
export const ramp = (t, t0, t1, v0, v1) =>
  t <= t0 ? v0 : t >= t1 ? v1 : v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
export const smooth = (t, t0, t1) => {
  const x = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  return x * x * (3 - 2 * x);
};

export const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

/**
 * Bir sesi tampona ekler. gen(t) → [l, r] ya da tek sayı. Başlangıç ve süre
 * saniye cinsinden; pan -1 (sol) ile 1 (sağ) arası.
 */
export function add(buf, start, dur, gen, gain = 1, pan = 0) {
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(buf.n, Math.floor((start + dur) * SR));
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4) * Math.SQRT2;
  const gr = gain * Math.sin((pan + 1) * Math.PI / 4) * Math.SQRT2;
  // Sesin kuyruğu süre bitince kesiliyor; son 12 ms'yi yumuşatmazsak kesildiği
  // yerde duyulur bir tık kalıyor (spektrogramda dikey çizgi olarak görünüyordu).
  const tail = Math.min(Math.floor(0.012 * SR), Math.floor((s1 - s0) / 4));
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    const left = s1 - i;
    const f = left < tail ? left / tail : 1;
    const v = gen(t, i / SR);
    if (Array.isArray(v)) { buf.L[i] += v[0] * gain * f; buf.R[i] += v[1] * gain * f; }
    else { buf.L[i] += v * gl * f; buf.R[i] += v * gr * f; }
  }
}

/** Bir tamponu başka birine ekler (yerleştirir). */
export function mixInto(dst, src, start = 0, gain = 1) {
  const off = Math.floor(start * SR);
  for (let i = 0; i < src.n; i++) {
    const j = i + off;
    if (j < 0 || j >= dst.n) continue;
    dst.L[j] += src.L[i] * gain;
    dst.R[j] += src.R[i] * gain;
  }
}

// ── Osilatörler ──
/** Faz biriktiren osilatör: frekans zamanla değişebilir. */
export function osc(shape = 'sine') {
  let ph = 0;
  return (freq) => {
    ph += freq / SR;
    ph -= Math.floor(ph);
    switch (shape) {
      case 'sine': return Math.sin(2 * Math.PI * ph);
      case 'saw': return 2 * ph - 1;
      case 'tri': return 1 - 4 * Math.abs(ph - 0.5);
      case 'square': return ph < 0.5 ? 1 : -1;
    }
  };
}

// ── Reverb: Schroeder/Freeverb tarzı, stereo ──
export function reverb(buf, { mix = 0.25, size = 0.84, damp = 0.3, pre = 0.012 } = {}) {
  const combsL = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map(d => Math.round(d * SR / 44100));
  const combsR = combsL.map(d => d + Math.round(23 * SR / 44100));
  const aps = [556, 441, 341, 225].map(d => Math.round(d * SR / 44100));
  const run = (input, combLens) => {
    const out = new Float32Array(input.length);
    const preN = Math.round(pre * SR);
    const combs = combLens.map(len => ({ b: new Float32Array(len), i: 0, f: 0 }));
    const apsS = aps.map(len => ({ b: new Float32Array(len), i: 0 }));
    for (let n = 0; n < input.length; n++) {
      const x = (n >= preN ? input[n - preN] : 0) * 0.015;
      let s = 0;
      for (const c of combs) {
        const y = c.b[c.i];
        c.f = y * (1 - damp) + c.f * damp;
        c.b[c.i] = x + c.f * size;
        c.i = (c.i + 1) % c.b.length;
        s += y;
      }
      for (const a of apsS) {
        const y = a.b[a.i];
        a.b[a.i] = s + y * 0.5;
        a.i = (a.i + 1) % a.b.length;
        s = y - s;
      }
      out[n] = s;
    }
    return out;
  };
  const wetL = run(buf.L, combsL);
  const wetR = run(buf.R, combsR);
  for (let i = 0; i < buf.n; i++) {
    buf.L[i] = buf.L[i] * (1 - mix * 0.5) + wetL[i] * mix * 3;
    buf.R[i] = buf.R[i] * (1 - mix * 0.5) + wetR[i] * mix * 3;
  }
  return buf;
}

/** Yumuşak kırpma: tepe noktalarını kulağa kaba gelmeden toparlar. */
export function saturate(buf, drive = 1) {
  for (let i = 0; i < buf.n; i++) {
    buf.L[i] = Math.tanh(buf.L[i] * drive) / Math.tanh(drive);
    buf.R[i] = Math.tanh(buf.R[i] * drive) / Math.tanh(drive);
  }
  return buf;
}

/** Tepe değeri verilen desibele getirir. */
export function normalize(buf, peakDb = -1) {
  let peak = 0;
  for (let i = 0; i < buf.n; i++) peak = Math.max(peak, Math.abs(buf.L[i]), Math.abs(buf.R[i]));
  if (peak === 0) return buf;
  const g = Math.pow(10, peakDb / 20) / peak;
  for (let i = 0; i < buf.n; i++) { buf.L[i] *= g; buf.R[i] *= g; }
  return buf;
}

/** Baş ve sondaki tık seslerini önlemek için kısa yumuşatma. */
export function fadeEdges(buf, inS = 0.003, outS = 0.02) {
  const a = Math.floor(inS * SR), b = Math.floor(outS * SR);
  for (let i = 0; i < a && i < buf.n; i++) { const g = i / a; buf.L[i] *= g; buf.R[i] *= g; }
  for (let i = 0; i < b && i < buf.n; i++) {
    const j = buf.n - 1 - i, g = i / b;
    buf.L[j] *= g; buf.R[j] *= g;
  }
  return buf;
}

export function writeWav(path, buf) {
  const n = buf.n;
  const data = Buffer.alloc(44 + n * 4);
  data.write('RIFF', 0); data.writeUInt32LE(36 + n * 4, 4); data.write('WAVE', 8);
  data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20);
  data.writeUInt16LE(2, 22); data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28);
  data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
  data.write('data', 36); data.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    const l = Math.max(-1, Math.min(1, buf.L[i]));
    const r = Math.max(-1, Math.min(1, buf.R[i]));
    data.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
    data.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
  }
  writeFileSync(path, data);
}

// ── Hazır çalgılar ──

/** Tekme davulu: perdesi hızla düşen sinüs + kısa tık. */
export function kick(buf, at, { gain = 1, f0 = 140, f1 = 42, tau = 0.28 } = {}) {
  const o = osc('sine');
  add(buf, at, tau * 5, (t) => {
    const f = f1 + (f0 - f1) * Math.exp(-t / 0.035);
    const click = t < 0.004 ? noise() * (1 - t / 0.004) * 0.4 : 0;
    return o(f) * decay(t, tau) + click;
  }, gain);
}

/** Kalp atışı: iki yumuşak, boğuk vuruş. */
export function heartbeat(buf, at, gain = 1) {
  const lp = biquad('lp', 180);
  const hit = (t0, g) => {
    const o = osc('sine');
    add(buf, at + t0, 0.5, (t) => lp(o(55 + 40 * Math.exp(-t / 0.03)) * env(t, 0.006, 0.11)), g);
  };
  hit(0, gain);
  hit(0.19, gain * 0.7);
}

/** Trampet: gürültü + ton. */
export function snare(buf, at, gain = 1, pan = 0) {
  const bp = biquad('bp', 2400, 0.7);
  const hp = biquad('hp', 900);
  const o = osc('tri');
  add(buf, at, 0.45, (t) => hp(bp(noise())) * 2.2 * decay(t, 0.09) + o(190 - 40 * t) * decay(t, 0.05) * 0.6, gain, pan);
}

/** Tom / taiko: derin, yuvarlak. */
export function tom(buf, at, gain = 1, f = 90, pan = 0) {
  const o = osc('sine');
  const lp = biquad('lp', 900);
  add(buf, at, 1.2, (t) => o(f * (1 + 0.6 * Math.exp(-t / 0.05))) * decay(t, 0.3) + lp(noise()) * decay(t, 0.02) * 0.5, gain, pan);
}

/** Kapalı hi-hat. */
export function hat(buf, at, gain = 0.3, pan = 0.2) {
  const hp = biquad('hp', 7500);
  add(buf, at, 0.08, (t) => hp(noise()) * decay(t, 0.018), gain, pan);
}

/**
 * Pad: frekans başına birkaç hafif akortsuz testere, alçak geçiren süzgeçten.
 * cutoff(t) zamanla açılıp kapanabilir; sinematik "nefes" buradan gelir.
 */
export function pad(buf, at, dur, notes, { gain = 0.15, attack = 1.5, release = 2, cutoff = () => 900, detune = 0.12, voices = 3 } = {}) {
  notes.forEach((m, ni) => {
    for (let v = 0; v < voices; v++) {
      const cents = (v - (voices - 1) / 2) * detune * 100 / Math.max(1, (voices - 1) / 2);
      const f = midi(m) * Math.pow(2, cents / 1200);
      const o = osc('saw');
      const lp = biquad('lp', 800, 0.9);
      const pan = ((ni + v) % 3 - 1) * 0.5;
      let k = 0;
      add(buf, at, dur + release, (t) => {
        if ((k++ & 63) === 0) lp.set(cutoff(t));
        const e = t < attack ? smoothstep(t / attack) : t < dur ? 1 : Math.max(0, 1 - (t - dur) / release);
        return lp(o(f)) * e;
      }, gain / (notes.length * voices) * 3, pan);
    }
  });
}
const smoothstep = (x) => x * x * (3 - 2 * x);

/** Alt bas: saf sinüs, çok alçakta. */
export function sub(buf, at, dur, m, { gain = 0.3, attack = 0.8, release = 1.5 } = {}) {
  const o = osc('sine');
  const f = midi(m);
  add(buf, at, dur + release, (t) => {
    const e = t < attack ? t / attack : t < dur ? 1 : Math.max(0, 1 - (t - dur) / release);
    return o(f) * e;
  }, gain);
}

/** Tel / piyano benzeri tınlama: harmonikli sinüs, hızlı sönüm. */
export function pluck(buf, at, m, { gain = 0.2, tau = 0.9, pan = 0, bright = 1 } = {}) {
  const f = midi(m);
  const os = [1, 2, 3, 4].map(() => osc('sine'));
  add(buf, at, tau * 5, (t) => {
    const e = env(t, 0.004, tau);
    return (os[0](f) + os[1](f * 2) * 0.35 * bright * decay(t, tau * 0.5)
      + os[2](f * 3) * 0.15 * bright * decay(t, tau * 0.3) + os[3](f * 4.01) * 0.06 * bright * decay(t, tau * 0.2)) * e;
  }, gain, pan);
}

/** Yükselen gerilim: gürültü + yükselen testere, süzgeç açılıyor. */
export function riser(buf, at, dur, gain = 0.4) {
  const bp = biquad('bp', 400, 1.2);
  const o = osc('saw');
  const lp = biquad('lp', 400);
  let k = 0;
  add(buf, at, dur, (t) => {
    const x = t / dur;
    if ((k++ & 31) === 0) { bp.set(300 + 5000 * x * x); lp.set(300 + 3000 * x * x); }
    const e = Math.pow(x, 2.2);
    return (bp(noise()) * 1.2 + lp(o(110 + 330 * x * x)) * 0.35) * e;
  }, gain);
}

/** Büyük sinematik darbe. */
export function impact(buf, at, gain = 1) {
  const o = osc('sine');
  const lp = biquad('lp', 1200);
  add(buf, at, 4, (t) => {
    const f = 30 + 70 * Math.exp(-t / 0.06);
    return o(f) * decay(t, 0.9) * 1.1 + lp(noise()) * decay(t, 0.12) * 0.9;
  }, gain);
  tom(buf, at, gain * 0.6, 60);
}

/** Sessiz, geniş bir nefes — geçişlerde. */
export function whoosh(buf, at, dur = 0.7, gain = 0.3, up = true) {
  const bp = biquad('bp', 500, 0.9);
  let k = 0;
  add(buf, at, dur, (t) => {
    const x = t / dur;
    if ((k++ & 31) === 0) bp.set(up ? 300 + 3500 * x : 3800 - 3500 * x);
    const e = Math.sin(Math.PI * x);
    return bp(noise()) * e * e * 2;
  }, gain);
}

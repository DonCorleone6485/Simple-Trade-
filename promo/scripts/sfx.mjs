/**
 * Kısa efektler — her biri ayrı bir dosya. Videoda <Audio> ile tam karesine
 * yerleştiriliyor.
 */
import {
  SR, buffer, add, biquad, osc, noise, decay, env, reseed, rand,
  reverb, normalize, fadeEdges, writeWav, whoosh, impact, riser, kick, midi,
} from './dsp.mjs';

const OUT = new URL('../public/sfx/', import.meta.url).pathname;
const save = (name, buf, peak = -3) => { fadeEdges(buf); normalize(buf, peak); writeWav(OUT + name + '.wav', buf); };

// Yazı belirirken hafif, kuru bir tık — klavye değil, kâğıda düşen harf.
{
  reseed(11);
  const b = buffer(0.08);
  const bp = biquad('bp', 3200, 1.4);
  const o = osc('sine');
  add(b, 0, 0.08, (t) => bp(noise()) * decay(t, 0.006) * 1.5 + o(2100) * decay(t, 0.01) * 0.15);
  save('tick', b, -12);
}

// Kart belirirken yumuşak, alçak bir "tok".
{
  reseed(12);
  const b = buffer(0.7);
  const o = osc('sine');
  const lp = biquad('lp', 600);
  add(b, 0, 0.7, (t) => o(48 + 50 * Math.exp(-t / 0.04)) * decay(t, 0.16) + lp(noise()) * decay(t, 0.015) * 0.4);
  reverb(b, { mix: 0.18 });
  save('thud', b, -4);
}

// Yalanın üstü çiziliyor: keskin, kısa bir sürtünme.
{
  reseed(13);
  const b = buffer(0.35);
  const bp = biquad('bp', 1800, 2);
  let k = 0;
  add(b, 0, 0.32, (t) => {
    if ((k++ & 15) === 0) bp.set(1500 + 5000 * (t / 0.32));
    const e = Math.sin(Math.PI * Math.min(1, t / 0.28));
    return bp(noise()) * e * 2.2 * (0.7 + 0.3 * Math.sin(t * 380));
  }, 1, 0.2);
  reverb(b, { mix: 0.12 });
  save('strike', b, -5);
}

// Geçiş nefesleri.
{ reseed(14); const b = buffer(0.9); whoosh(b, 0, 0.8, 1, true); reverb(b, { mix: 0.3 }); save('whoosh', b, -6); }
{ reseed(15); const b = buffer(0.9); whoosh(b, 0, 0.8, 1, false); reverb(b, { mix: 0.3 }); save('whoosh_down', b, -6); }

// Büyük darbe.
{ reseed(16); const b = buffer(4.5); impact(b, 0, 1); reverb(b, { mix: 0.35, size: 0.88 }); save('impact', b, -1); }

// Sayı sayarken ince tıklar — tek bir tık, videoda ardışık yerleştiriliyor.
{
  reseed(17);
  const b = buffer(0.05);
  const hp = biquad('hp', 4000);
  add(b, 0, 0.05, (t) => hp(noise()) * decay(t, 0.004));
  save('count', b, -16);
}

// Bildirim / hedef zili: iki notalı, çan tınılı. Hiçbir platformun sesi
// değil — kendi zilimiz.
{
  reseed(18);
  const b = buffer(2.2);
  const bell = (at, m, g) => {
    const f = midi(m);
    const parts = [[1, 1], [2.0, 0.5], [2.76, 0.25], [5.4, 0.12]];
    const os = parts.map(() => osc('sine'));
    add(b, at, 2, (t) => parts.reduce((s, [r, a], i) => s + os[i](f * r) * a * decay(t, 0.9 / r), 0) * env(t, 0.002, 1), g);
  };
  bell(0, 88, 0.5);      // E6
  bell(0.11, 93, 0.45);  // A6
  reverb(b, { mix: 0.3 });
  save('ding', b, -4);
}

// Fare tıkı.
{
  reseed(19);
  const b = buffer(0.12);
  const bp = biquad('bp', 2600, 1.2);
  add(b, 0, 0.03, (t) => bp(noise()) * decay(t, 0.004) * 2);
  add(b, 0.055, 0.03, (t) => bp(noise()) * decay(t, 0.003) * 1.2);
  save('click', b, -8);
}

// Termal yazıcı: bir satır. Motorun uğultusu + kafanın hızlı tıkırtısı.
{
  reseed(20);
  const b = buffer(0.42);
  const bp = biquad('bp', 1900, 1.1);
  const hum = osc('square');
  const lp = biquad('lp', 500);
  add(b, 0, 0.4, (t) => {
    const gate = (Math.sin(2 * Math.PI * 140 * t) > 0.2 ? 1 : 0.15);
    const e = Math.min(1, t / 0.02) * Math.min(1, (0.4 - t) / 0.04);
    return (bp(noise()) * gate * 1.4 + lp(hum(95)) * 0.25) * e;
  });
  save('printer', b, -6);
}

// Kâğıt kopartma.
{
  reseed(21);
  const b = buffer(0.7);
  const hp = biquad('hp', 1200);
  add(b, 0, 0.6, (t) => {
    const crackle = rand() < 0.08 ? 1 : 0.25;
    return hp(noise()) * crackle * Math.sin(Math.PI * t / 0.6) * 1.6;
  });
  reverb(b, { mix: 0.15 });
  save('tear', b, -4);
}

// Kaset geri sarma: yükselen ince vınlama.
{
  reseed(22);
  const b = buffer(1.3);
  const o = osc('saw');
  const bp = biquad('bp', 2000, 3);
  let k = 0;
  add(b, 0, 1.25, (t) => {
    const x = t / 1.25;
    if ((k++ & 31) === 0) bp.set(800 + 3500 * x);
    const f = 300 + 1500 * x + 60 * Math.sin(t * 90);
    return (bp(o(f)) * 0.8 + bp(noise()) * 0.5) * Math.min(1, t / 0.05) * Math.min(1, (1.25 - t) / 0.08);
  });
  save('rewind', b, -8);
}

// Kaset durdurma tuşu: mekanik "klak".
{
  reseed(23);
  const b = buffer(0.4);
  const bp = biquad('bp', 900, 1.5);
  const o = osc('sine');
  add(b, 0, 0.3, (t) => bp(noise()) * decay(t, 0.012) * 2.5 + o(160) * decay(t, 0.03) * 0.5);
  add(b, 0.06, 0.2, (t) => bp(noise()) * decay(t, 0.008) * 1.2);
  save('clack', b, -5);
}

// Kalemle ekrana çizim: keçeli kalem gıcırtısı.
{
  reseed(24);
  const b = buffer(0.6);
  const bp = biquad('bp', 3000, 4);
  add(b, 0, 0.55, (t) => {
    const e = Math.sin(Math.PI * t / 0.55);
    bp.set(2600 + 900 * Math.sin(t * 14));
    return bp(noise()) * e * 2.5;
  });
  save('marker', b, -12);
}

// Tek bir alçak darbe — müziğe değil, sahnedeki ana vurguya.
{ reseed(25); const b = buffer(1.2); kick(b, 0, { gain: 1, f0: 120, f1: 38, tau: 0.35 }); reverb(b, { mix: 0.2 }); save('boom', b, -3); }

// Kısa yükseliş — büyük bir anın hemen öncesi.
{ reseed(26); const b = buffer(2.1); riser(b, 0, 2, 1); save('riser2', b, -6); }

// Kaset durdurma: motor yavaşlıyor, ses perdeden düşüyor.
{
  reseed(27);
  const b = buffer(1.0);
  const o = osc('saw');
  const lp = biquad('lp', 2500);
  let k = 0;
  add(b, 0, 0.9, (t) => {
    const x = t / 0.9;
    if ((k++ & 31) === 0) lp.set(2500 * (1 - x) + 200);
    return (lp(o(420 * Math.pow(1 - x, 2) + 30)) * 0.7 + lp(noise()) * 0.3) * (1 - x);
  });
  save('tapestop', b, -6);
}

// Kaset cızırtısı: alçak, sürekli. Müziğin altına döşeniyor.
{
  reseed(28);
  const b = buffer(4);
  const hp = biquad('hp', 2500); const lp = biquad('lp', 9000);
  add(b, 0, 4, () => lp(hp(noise())));
  save('hiss', b, -24);
}

console.log('efektler hazır');

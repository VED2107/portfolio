/**
 * The shop's sound, synthesised in the browser: a slow lo-fi chord loop with vinyl crackle, soft
 * footsteps, and small, causal cues (a sleeve sliding out, a receipt printing). Nothing is
 * downloaded and nothing plays until the visitor turns sound on.
 *
 * Every cue fires on the same frame as the thing that caused it (Apple's harmony rule), and only
 * where it earns its place.
 */
import { sim } from "./runtime";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let music: GainNode | null = null;
/** Footsteps and cues get their own bus, so they stay audible whatever the music is doing. */
let sfx: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let loop: number | null = null;
let buf: Uint8Array<ArrayBuffer> | null = null;
let raf = 0;

const CHORDS = [
  [53, 57, 60, 64], // Fmaj7
  [52, 55, 59, 62], // Em7
  [50, 53, 57, 60], // Dm7
  [48, 52, 55, 59], // Cmaj7
];
const BPM = 76;
const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

function noiseBuffer(c: AudioContext, seconds: number) {
  const b = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  master.connect(comp).connect(ctx.destination);
  music = ctx.createGain();
  music.gain.value = 0;
  sfx = ctx.createGain();
  sfx.gain.value = 0;
  sfx.connect(master);
  analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  buf = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
  music.connect(analyser);
  music.connect(master);
  return ctx;
}

/** One bar of the loop: a warm pad, a soft kick on 1 and 3, a brushed hat, and crackle. */
function scheduleBar(c: AudioContext, when: number, bar: number) {
  const beat = 60 / BPM;
  const chord = CHORDS[bar % CHORDS.length];
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  lp.Q.value = 0.4;
  lp.connect(music!);
  for (const n of chord) {
    for (const det of [-6, 6]) {
      const o = c.createOscillator();
      o.type = "triangle";
      o.frequency.value = hz(n);
      o.detune.value = det;
      const g = c.createGain();
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(0.028, when + 0.4);
      g.gain.setValueAtTime(0.028, when + beat * 3.4);
      g.gain.linearRampToValueAtTime(0, when + beat * 4.1);
      o.connect(g).connect(lp);
      o.start(when);
      o.stop(when + beat * 4.2);
    }
  }
  // Bass: the root, an octave down.
  const b = c.createOscillator();
  b.type = "sine";
  b.frequency.value = hz(chord[0] - 24);
  const bg = c.createGain();
  bg.gain.setValueAtTime(0, when);
  bg.gain.linearRampToValueAtTime(0.16, when + 0.05);
  bg.gain.exponentialRampToValueAtTime(0.02, when + beat * 3.8);
  b.connect(bg).connect(music!);
  b.start(when);
  b.stop(when + beat * 4);

  for (let k = 0; k < 4; k++) {
    const t = when + k * beat;
    if (k % 2 === 0) {
      const o = c.createOscillator();
      o.frequency.setValueAtTime(110, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
      const g = c.createGain();
      g.gain.setValueAtTime(0.32, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g).connect(music!);
      o.start(t);
      o.stop(t + 0.32);
    }
    for (const off of [0.5, k === 3 ? 0.75 : -1]) {
      if (off < 0) continue;
      const s = c.createBufferSource();
      s.buffer = noiseBuffer(c, 0.06);
      const hp = c.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 7000;
      const g = c.createGain();
      g.gain.setValueAtTime(0.035, t + off * beat);
      g.gain.exponentialRampToValueAtTime(0.001, t + off * beat + 0.05);
      s.connect(hp).connect(g).connect(music!);
      s.start(t + off * beat);
    }
  }
  // Crackle: sparse clicks across the bar.
  for (let i = 0; i < 9; i++) {
    const t = when + Math.random() * beat * 4;
    const s = c.createBufferSource();
    s.buffer = noiseBuffer(c, 0.01);
    const g = c.createGain();
    g.gain.value = 0.02 + Math.random() * 0.03;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2500 + Math.random() * 3000;
    s.connect(bp).connect(g).connect(master!);
    s.start(t);
  }
}

function startLoop() {
  const c = ensure();
  if (loop !== null) return;
  const barLen = (60 / BPM) * 4;
  let next = c.currentTime + 0.1;
  let bar = 0;
  const tick = () => {
    while (next < c.currentTime + 1.5) {
      scheduleBar(c, next, bar++);
      next += barLen;
    }
  };
  tick();
  loop = window.setInterval(tick, 500);
  const meter = () => {
    if (analyser && buf) {
      analyser.getByteFrequencyData(buf);
      let s = 0;
      for (let i = 1; i < 24; i++) s += buf[i];
      sim.level = s / (23 * 255);
    }
    raf = requestAnimationFrame(meter);
  };
  raf = requestAnimationFrame(meter);
}

/**
 * Sound on or off. `withLoop` plays the synthesised lo-fi loop; when the SoundCloud radio is the
 * music instead, only the effects bus comes on here.
 */
export async function setSound(on: boolean, withLoop = true) {
  const c = ensure();
  if (c.state === "suspended") await c.resume().catch(() => {});
  master!.gain.setTargetAtTime(on ? 0.9 : 0, c.currentTime, 0.2);
  sfx!.gain.setTargetAtTime(on ? 1 : 0, c.currentTime, 0.05);
  music!.gain.setTargetAtTime(on && withLoop ? 0.55 : 0, c.currentTime, 0.25);
  if (on && withLoop) startLoop();
  if (!on || !withLoop) {
    window.setTimeout(() => {
      if (music && music.gain.value < 0.01) {
        if (loop !== null) window.clearInterval(loop);
        loop = null;
        cancelAnimationFrame(raf);
      }
    }, 1200);
  }
}

function enabled() {
  return !!ctx && !!sfx && sfx.gain.value > 0.05;
}

/** A short, filtered tick. Footsteps alternate pitch a little, like two shoes. */
export function cue(kind: "step" | "pull" | "flip" | "close" | "print" | "click" | "bump") {
  if (!enabled()) return;
  const c = ctx!;
  const t = c.currentTime;
  const out = c.createGain();
  out.gain.value = 1.4;
  out.connect(sfx!);
  const noise = (len: number, f: number, q: number, gain: number, at = t) => {
    const s = c.createBufferSource();
    s.buffer = noiseBuffer(c, len);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = f;
    bp.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, at);
    g.gain.exponentialRampToValueAtTime(0.0008, at + len);
    s.connect(bp).connect(g).connect(out);
    s.start(at);
  };
  switch (kind) {
    case "step":
      noise(0.07, 380 + Math.random() * 120, 1.2, 0.09);
      break;
    case "bump":
      noise(0.12, 160, 0.8, 0.18);
      break;
    case "pull":
      noise(0.28, 1800, 0.6, 0.06);
      noise(0.18, 900, 0.8, 0.05, t + 0.12);
      break;
    case "flip":
      noise(0.22, 2600, 0.5, 0.05);
      break;
    case "close":
      noise(0.16, 700, 0.7, 0.06);
      break;
    case "click": {
      const o = c.createOscillator();
      o.frequency.value = 1600;
      const g = c.createGain();
      g.gain.setValueAtTime(0.04, t);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.05);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.06);
      break;
    }
    case "print":
      for (let i = 0; i < 14; i++) noise(0.025, 3200, 2, 0.04, t + i * 0.045);
      break;
  }
}

/** The synth on the studio desk: one note, from a pentatonic scale so any mash sounds fine. */
export function note(i: number) {
  if (!enabled()) return;
  const c = ctx!;
  const t = c.currentTime;
  const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26];
  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.value = hz(60 + scale[i % scale.length]);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(3200, t);
  lp.frequency.exponentialRampToValueAtTime(600, t + 0.5);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0008, t + 0.9);
  o.connect(lp).connect(g).connect(sfx!);
  o.start(t);
  o.stop(t + 1);
}

/**
 * The gold record: a list of numbers played as a melody. Higher value, higher note, on a
 * pentatonic ladder. Returns the duration and calls `onStep` as each note sounds.
 */
export function playSeries(values: number[], onStep: (i: number) => void) {
  const c = ensure();
  const wasOn = enabled();
  if (!wasOn) {
    master!.gain.setTargetAtTime(0.8, c.currentTime, 0.05);
  }
  void c.resume();
  const max = Math.max(1, ...values);
  const ladder = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  const dur = 0.16;
  const t0 = c.currentTime + 0.1;
  values.forEach((v, i) => {
    const step = Math.round((v / max) * (ladder.length - 1));
    const t = t0 + i * dur;
    if (v > 0) {
      const o = c.createOscillator();
      o.type = "triangle";
      o.frequency.value = hz(57 + ladder[step]);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur * 2.2);
      o.connect(g).connect(master!);
      o.start(t);
      o.stop(t + dur * 2.4);
    }
  });
  const timers = values.map((_, i) => window.setTimeout(() => onStep(i), (0.1 + i * dur) * 1000));
  const total = 0.1 + values.length * dur;
  const end = window.setTimeout(() => {
    onStep(-1);
    // Sound was off before the visitor dropped the needle: put it back the way they had it.
    if (!wasOn && master && loop === null) master.gain.setTargetAtTime(0, c.currentTime, 0.2);
  }, total * 1000 + 300);
  return () => {
    timers.forEach(clearTimeout);
    clearTimeout(end);
  };
}

export function disposeAudio() {
  if (loop !== null) window.clearInterval(loop);
  loop = null;
  cancelAnimationFrame(raf);
  void ctx?.close();
  ctx = master = music = sfx = analyser = null;
}

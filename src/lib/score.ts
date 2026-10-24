"use client";

/**
 * The shop's score. Original cues, synthesised live with the Web Audio API: nothing is
 * downloaded, nothing is sampled, nothing is anyone else's recording. Written in the register
 * of big-screen scores: an endless rising Shepard tone, a pipe-organ drone, a clock that
 * keeps time. Off until the visitor presses play; it never starts by itself.
 */

/**
 * A cue is either synthesised (no src) or a licensed recording you supply: put the file in
 * public/score/ and add { id, title, note, src: "/score/file.mp3" } here. Files are only
 * fetched when that cue is played.
 */
export type Cue = { id: string; title: string; note: string; src?: string };

export const CUES: Cue[] = [
  // Supplied recording. Needs a licence from the rights holders before a public deploy.
  { id: "mystery-of-love", title: "Mystery of Love", note: "Sufjan Stevens · from Call Me By Your Name", src: "/score/mystery-of-love.mp3" },
  { id: "ascent", title: "Ascent", note: "Shepard tone · rises forever, never arrives" },
  { id: "tick", title: "Tick", note: "Organ drone over a clock, 1.25 s per beat" },
  { id: "shelf", title: "Night shelf", note: "Low strings, slow tide, for browsing" },
];

type Voice = { stop: () => void };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let current: Voice | null = null;
let cueIndex = 0;
let playing = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const onScore = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
export const scoreState = () => ({ playing, cue: CUES[cueIndex] });

function audio() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    // A touch of room: a short feedback delay, cheaper than a convolver and close enough.
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.31;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const wet = ctx.createGain();
    wet.gain.value = 0.28;
    master.connect(ctx.destination);
    master.connect(delay);
    delay.connect(fb).connect(delay);
    delay.connect(wet).connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return { c: ctx, out: master! };
}

/** Endless ascent: octave-spaced sines glide up while a bell curve fades them in and out. */
function ascent(c: AudioContext, out: AudioNode): Voice {
  const N = 9;
  const base = 27.5;
  const oscs = Array.from({ length: N }, () => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    g.gain.value = 0;
    o.connect(g).connect(out);
    o.start();
    return { o, g };
  });
  // A low pulse under it, like a held breath.
  const pulse = c.createOscillator();
  const pg = c.createGain();
  pulse.type = "triangle";
  pulse.frequency.value = 55;
  pg.gain.value = 0;
  pulse.connect(pg).connect(out);
  pulse.start();
  const t0 = c.currentTime;
  const PERIOD = 14; // seconds for one octave of rise
  const id = window.setInterval(() => {
    const t = c.currentTime;
    const phase = ((t - t0) / PERIOD) % 1;
    oscs.forEach(({ o, g }, k) => {
      const pos = (k + phase) / N; // 0..1 across the stack
      const f = base * 2 ** (k + phase);
      const amp = Math.exp(-((pos - 0.5) ** 2) / 0.045) * 0.11;
      o.frequency.setTargetAtTime(f, t, 0.05);
      g.gain.setTargetAtTime(amp, t, 0.08);
    });
    // The pulse quickens as the phrase climbs.
    const beat = (t - t0) % (0.9 - phase * 0.35);
    pg.gain.setTargetAtTime(beat < 0.08 ? 0.22 : 0.0, t, 0.02);
  }, 40);
  return {
    stop: () => {
      window.clearInterval(id);
      const t = c.currentTime;
      for (const { o, g } of oscs) {
        g.gain.setTargetAtTime(0, t, 0.3);
        o.stop(t + 1.5);
      }
      pg.gain.setTargetAtTime(0, t, 0.2);
      pulse.stop(t + 1.5);
    },
  };
}

/** A pipe-organ drone (additive, slow filter sweep) and a clock that never hurries. */
function tickCue(c: AudioContext, out: AudioNode): Voice {
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 600;
  filter.Q.value = 0.7;
  const organ = c.createGain();
  organ.gain.value = 0.0;
  organ.connect(filter).connect(out);
  // A minor, voiced like stops: 8', 4', a fifth, and a soft 2'.
  const freqs = [110, 220, 164.81, 261.63, 329.63, 440];
  const vols = [0.32, 0.18, 0.14, 0.1, 0.08, 0.04];
  const oscs = freqs.map((f, i) => {
    const o = c.createOscillator();
    o.type = i < 2 ? "sawtooth" : "triangle";
    o.frequency.value = f;
    o.detune.value = (i % 2 ? 1 : -1) * 3;
    const g = c.createGain();
    g.gain.value = vols[i] * 0.4;
    o.connect(g).connect(organ);
    o.start();
    return o;
  });
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.045;
  lfoGain.gain.value = 420;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();
  const t = c.currentTime;
  organ.gain.linearRampToValueAtTime(0.5, t + 6);

  const tick = (at: number, hi: boolean) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "square";
    o.frequency.value = hi ? 2200 : 1700;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.12, at + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
    o.connect(g).connect(out);
    o.start(at);
    o.stop(at + 0.05);
  };
  let n = 0;
  let next = c.currentTime + 0.4;
  const id = window.setInterval(() => {
    while (next < c.currentTime + 0.3) {
      tick(next, n % 4 === 0);
      n++;
      next += 1.25;
    }
  }, 100);
  return {
    stop: () => {
      window.clearInterval(id);
      const t = c.currentTime;
      organ.gain.setTargetAtTime(0, t, 0.4);
      for (const o of oscs) o.stop(t + 2);
      lfo.stop(t + 2);
    },
  };
}

/** Low strings: detuned saws through a slow filter, swelling like a tide. */
function shelf(c: AudioContext, out: AudioNode): Voice {
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 380;
  const g = c.createGain();
  g.gain.value = 0;
  g.connect(filter).connect(out);
  const chord = [73.42, 110, 146.83, 174.61, 220]; // D minor, open
  const oscs = chord.flatMap((f) =>
    [-7, 7].map((d) => {
      const o = c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.detune.value = d;
      const og = c.createGain();
      og.gain.value = 0.05;
      o.connect(og).connect(g);
      o.start();
      return o;
    }),
  );
  const tide = c.createOscillator();
  const tg = c.createGain();
  tide.frequency.value = 0.07;
  tg.gain.value = 0.18;
  tide.connect(tg).connect(g.gain);
  tide.start();
  const t = c.currentTime;
  g.gain.linearRampToValueAtTime(0.32, t + 5);
  return {
    stop: () => {
      const t = c.currentTime;
      g.gain.cancelScheduledValues(t);
      g.gain.setTargetAtTime(0, t, 0.5);
      for (const o of oscs) o.stop(t + 2.5);
      tide.stop(t + 2.5);
    },
  };
}

const MAKERS: Record<string, (c: AudioContext, out: AudioNode) => Voice> = { ascent, tick: tickCue, shelf };

/** A supplied recording: streamed through the same master gain, looped, faded in and out. */
function recording(c: AudioContext, out: AudioNode, src: string): Voice {
  const el = new Audio(src);
  el.loop = true;
  el.crossOrigin = "anonymous";
  el.preload = "auto";
  // Not shipped (no licence yet, or not deployed): skip to the next cue instead of silence.
  el.onerror = () => window.setTimeout(() => nextCue(), 0);
  const node = c.createMediaElementSource(el);
  node.connect(out);
  void el.play().catch(() => {});
  return {
    stop: () => {
      window.setTimeout(() => {
        el.pause();
        node.disconnect();
      }, 1200);
    },
  };
}

function start() {
  const { c, out } = audio();
  current?.stop();
  const cue = CUES[cueIndex];
  current = cue.src ? recording(c, out, cue.src) : MAKERS[cue.id](c, out);
  out.gain.cancelScheduledValues(c.currentTime);
  out.gain.setTargetAtTime(0.22, c.currentTime, 0.8);
}

export function toggleScore() {
  if (playing) {
    playing = false;
    if (ctx && master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    const v = current;
    current = null;
    window.setTimeout(() => v?.stop(), 900);
  } else {
    playing = true;
    start();
  }
  emit();
}

export function nextCue() {
  cueIndex = (cueIndex + 1) % CUES.length;
  if (playing) start();
  emit();
}

// The tab is hidden: the score waits for you rather than playing to an empty room.
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else if (playing) void ctx.resume();
  });
}

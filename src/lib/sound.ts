"use client";

/**
 * The shop's sound, off until the visitor turns it on. Every sound is synthesised on the spot
 * with the Web Audio API (no files to download): cardboard brushing cardboard, a plastic hinge,
 * a needle finding the groove. All of it sits well under the level of anything you'd notice.
 */
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let on = false;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    on = localStorage.getItem("ved-sound") === "on";
  } catch {}
}

export const soundOn = () => on;

export function setSound(next: boolean) {
  on = next;
  try {
    localStorage.setItem("ved-sound", next ? "on" : "off");
  } catch {}
  for (const l of listeners) l();
  if (next) play("needle");
}

export function onSoundChange(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export type Sound = "sleeve" | "case" | "needle" | "place" | "key" | "paper";

function audio() {
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  if (!noise) {
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

/** A filtered burst of noise: the sound of surfaces touching. */
function brush(c: AudioContext, out: AudioNode, at: number, dur: number, freq: number, q: number, vol: number) {
  const src = c.createBufferSource();
  src.buffer = noise;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vol, at + dur * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(f).connect(g).connect(out);
  src.start(at, Math.random() * 0.3);
  src.stop(at + dur + 0.02);
}

function tone(c: AudioContext, out: AudioNode, at: number, freq: number, dur: number, vol: number, type: OscillatorType = "sine") {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  o.frequency.exponentialRampToValueAtTime(freq * 0.6, at + dur);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vol, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(out);
  o.start(at);
  o.stop(at + dur + 0.02);
}

export function play(kind: Sound) {
  if (!on || typeof window === "undefined") return;
  try {
    const c = audio();
    const t = c.currentTime;
    const out = c.createGain();
    out.gain.value = 0.16;
    out.connect(c.destination);
    switch (kind) {
      case "sleeve": // cardboard sliding past cardboard
        brush(c, out, t, 0.22, 2600, 0.7, 0.55);
        break;
      case "paper":
        brush(c, out, t, 0.12, 5200, 1.2, 0.35);
        break;
      case "case": // a hinge, then the latch
        brush(c, out, t, 0.03, 3400, 3, 0.9);
        tone(c, out, t + 0.045, 1900, 0.04, 0.25, "square");
        break;
      case "place": // a record set down on the platter
        tone(c, out, t, 120, 0.18, 0.8);
        brush(c, out, t, 0.08, 900, 1, 0.3);
        break;
      case "needle": // the needle drops, then a few crackles
        tone(c, out, t, 180, 0.08, 0.5);
        for (let i = 0; i < 6; i++) brush(c, out, t + 0.06 + i * (0.05 + Math.random() * 0.08), 0.012, 4000 + Math.random() * 3000, 8, 0.5);
        break;
      case "key":
        tone(c, out, t, 1700, 0.025, 0.2, "square");
        break;
    }
  } catch {
    /* sound is seasoning; it never breaks anything */
  }
}

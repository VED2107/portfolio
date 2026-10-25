"use client";

/**
 * Our Song. One audio element for the whole site, routed through an analyser so the page can
 * move to it. Nothing plays until someone asks: the first play happens inside a click, which is
 * also where the AudioContext is created and resumed, so browsers allow the sound.
 */

export const SONG = { src: "/score/our-song.mp3", title: "Our Song" } as const;

let el: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let bins: Uint8Array<ArrayBuffer> | null = null;
let routed = false;

function emit() {
  window.dispatchEvent(new CustomEvent("ved:audio", { detail: { playing: isPlaying() } }));
}

function element() {
  if (el) return el;
  el = new Audio(SONG.src);
  el.preload = "none";
  el.addEventListener("play", emit);
  el.addEventListener("pause", emit);
  el.addEventListener("ended", emit);
  return el;
}

/** Route through Web Audio for the analyser. If that fails, the plain element still plays. */
function route(a: HTMLAudioElement) {
  if (routed) return;
  routed = true;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    const src = ctx.createMediaElementSource(a);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.82;
    bins = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    src.connect(analyser);
    analyser.connect(ctx.destination);
  } catch {
    ctx = null;
    analyser = null;
  }
}

export function play() {
  const a = element();
  route(a);
  void ctx?.resume();
  return a.play().catch(() => undefined);
}

export function pause() {
  el?.pause();
}

export function toggle() {
  if (isPlaying()) pause();
  else void play();
}

export function isPlaying() {
  return !!el && !el.paused && !el.ended;
}

export function progress() {
  return el && el.duration ? el.currentTime / el.duration : 0;
}

/** Fill `out` with 0..1 levels across the spectrum (low to high). Zeros when silent. */
export function levels(out: Float32Array) {
  if (!analyser || !bins || !isPlaying()) {
    out.fill(0);
    return out;
  }
  analyser.getByteFrequencyData(bins);
  const usable = Math.floor(bins.length * 0.7); // the top of the spectrum is mostly air
  for (let i = 0; i < out.length; i++) {
    out[i] = bins[Math.floor((i / out.length) * usable)] / 255;
  }
  return out;
}

/** Bend the speed like a hand on the record. 1 is 33⅓; the pitch follows, as on vinyl. */
export function scratch(rate: number) {
  if (!el) return;
  const r = Math.min(2, Math.max(0.5, Math.abs(rate) || 1));
  if (Math.abs(el.playbackRate - r) < 0.01) return;
  el.preservesPitch = false;
  el.playbackRate = r;
}

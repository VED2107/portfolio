/**
 * The shop radio: a public SoundCloud playlist played through SoundCloud's own embeddable widget
 * and its JavaScript control API (https://developers.soundcloud.com/docs/api/html5-widget). No
 * API key, no downloading: the uploader's stream, credited on screen with a link back.
 *
 * The widget is a hidden iframe created on the first user gesture (browsers refuse audio before
 * one). Because it's cross-origin there's no audio analyser, so the speakers follow the beat
 * clock instead of the waveform.
 */
import { sim } from "./runtime";

type Sound = { title?: string; permalink_url?: string; user?: { username?: string } };
type Widget = {
  bind(event: string, cb: () => void): void;
  play(): void;
  pause(): void;
  next(): void;
  setVolume(v: number): void;
  getCurrentSound(cb: (s: Sound | null) => void): void;
};
type SCGlobal = { Widget: ((el: HTMLIFrameElement) => Widget) & { Events: Record<string, string> } };

let widget: Widget | null = null;
let ready: Promise<Widget> | null = null;
let beat = 0;

export type NowPlaying = { title: string; artist: string; url: string } | null;
let listeners = new Set<(n: NowPlaying) => void>();

export function onNowPlaying(cb: (n: NowPlaying) => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function announce() {
  widget?.getCurrentSound((s) => {
    const n = s?.title ? { title: s.title, artist: s.user?.username ?? "", url: s.permalink_url ?? "https://soundcloud.com" } : null;
    listeners.forEach((l) => l(n));
  });
}

function loadScript() {
  return new Promise<SCGlobal>((resolve, reject) => {
    const w = window as unknown as { SC?: SCGlobal };
    if (w.SC) return resolve(w.SC);
    const s = document.createElement("script");
    s.src = "https://w.soundcloud.com/player/api.js";
    s.async = true;
    s.onload = () => (w.SC ? resolve(w.SC) : reject(new Error("SoundCloud widget API missing")));
    s.onerror = () => reject(new Error("SoundCloud widget API failed to load"));
    document.head.appendChild(s);
  });
}

function mount(url: string) {
  if (ready) return ready;
  ready = loadScript().then(
    (SC) =>
      new Promise<Widget>((resolve) => {
        const f = document.createElement("iframe");
        f.title = "Shop radio (SoundCloud)";
        f.allow = "autoplay; encrypted-media";
        f.setAttribute("aria-hidden", "true");
        f.tabIndex = -1;
        f.style.cssText = "position:fixed;width:1px;height:1px;left:-9999px;bottom:0;border:0;opacity:0;pointer-events:none";
        f.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&buying=false&sharing=false&download=false&show_artwork=false&show_comments=false&show_playcount=false&show_user=true&hide_related=true&visual=false`;
        document.body.appendChild(f);
        const w = SC.Widget(f);
        w.bind(SC.Widget.Events.READY, () => {
          widget = w;
          // Background level: footsteps and cues should sit clearly on top.
          w.setVolume(28);
          resolve(w);
        });
        w.bind(SC.Widget.Events.PLAY, announce);
        w.bind(SC.Widget.Events.FINISH, announce);
      }),
  );
  return ready;
}

/** Start or stop the radio. Resolves false if SoundCloud couldn't be reached, so the caller can fall back. */
export async function setRadio(url: string, on: boolean) {
  try {
    const w = await Promise.race([mount(url), new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), 20000))]);
    if (on) w.play();
    else w.pause();
    radioOn = on;
    if (on) pulse();
    return true;
  } catch {
    ready = null;
    return false;
  }
}

let radioOn = false;

/** Speakers bounce on a 4/4 clock while the radio plays (no waveform access across origins). */
function pulse() {
  cancelAnimationFrame(beat);
  const t0 = performance.now();
  const tick = (now: number) => {
    if (!radioOn) {
      sim.level = 0;
      return;
    }
    const b = ((now - t0) / 1000) * (84 / 60);
    sim.level = 0.18 + 0.32 * Math.pow(Math.max(0, Math.cos(b * Math.PI * 2)), 6);
    beat = requestAnimationFrame(tick);
  };
  beat = requestAnimationFrame(tick);
}

export function skipTrack() {
  widget?.next();
}

export function disposeRadio() {
  radioOn = false;
  cancelAnimationFrame(beat);
  widget?.pause();
  listeners = new Set();
}

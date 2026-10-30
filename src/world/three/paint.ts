/**
 * The paint shop: every material and procedural texture in the store, made once and shared.
 * Materials are cached by name, so forty shelf brackets cost one material, and everything here is
 * disposed together when the world unmounts.
 */
import * as THREE from "three";
import { coverSVG, sleeveOf } from "@/lib/covers";

const cache = new Map<string, THREE.Material>();
const textures: THREE.Texture[] = [];

export const PALETTE = {
  cream: "#fff3df",
  paper: "#f6e7cc",
  plaster: "#f3dfc0",
  wood: "#c98a55",
  woodDark: "#8a5332",
  walnut: "#5e3523",
  tangerine: "#ff7a1a",
  coral: "#ff5a5f",
  butter: "#ffd66b",
  teal: "#13a89e",
  tealDeep: "#0d6e69",
  violet: "#7357ff",
  raspberry: "#e0367a",
  midnight: "#1b1740",
  ink: "#2a1a3a",
  chrome: "#d9dde6",
} as const;

type Std = { color: string; roughness?: number; metalness?: number; emissive?: string; emissiveIntensity?: number; map?: THREE.Texture | null; transparent?: boolean; opacity?: number };

/** A shared MeshStandardMaterial. Same name, same material. */
export function mat(name: string, o: Std) {
  let m = cache.get(name) as THREE.MeshStandardMaterial | undefined;
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color: o.color,
      roughness: o.roughness ?? 0.7,
      metalness: o.metalness ?? 0,
      emissive: o.emissive ?? "#000000",
      emissiveIntensity: o.emissiveIntensity ?? 1,
      map: o.map ?? null,
      transparent: o.transparent ?? false,
      opacity: o.opacity ?? 1,
    });
    cache.set(name, m);
  }
  return m;
}

/** Lacquer: low roughness, a clear-coat sheen. For wood fronts, the jukebox, sleeves under glass. */
export function lacquer(name: string, color: string) {
  let m = cache.get(`lq:${name}`) as THREE.MeshPhysicalMaterial | undefined;
  if (!m) {
    m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.25 });
    cache.set(`lq:${name}`, m);
  }
  return m;
}

export function basic(name: string, o: { color: string; map?: THREE.Texture | null; transparent?: boolean; opacity?: number; blending?: THREE.Blending; depthWrite?: boolean; toneMapped?: boolean }) {
  let m = cache.get(`b:${name}`) as THREE.MeshBasicMaterial | undefined;
  if (!m) {
    m = new THREE.MeshBasicMaterial({
      color: o.color,
      map: o.map ?? null,
      transparent: o.transparent ?? false,
      opacity: o.opacity ?? 1,
      blending: o.blending ?? THREE.NormalBlending,
      depthWrite: o.depthWrite ?? true,
      toneMapped: o.toneMapped ?? true,
    });
    cache.set(`b:${name}`, m);
  }
  return m;
}

function canvas(w: number, h = w) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function track<T extends THREE.Texture>(t: T, repeat?: [number, number]) {
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  textures.push(t);
  return t;
}

/** Seeded noise for texture painting. */
function rand(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Oak planks with per-board tone, grain streaks and soft seams. */
export function planks(tint = "#c98a55", seed = 7) {
  const [c, g] = canvas(1024);
  const r = rand(seed);
  const rows = 8;
  const h = c.height / rows;
  const base = new THREE.Color(tint);
  for (let y = 0; y < rows; y++) {
    let x = -r() * 300;
    while (x < c.width) {
      const len = 260 + r() * 300;
      const tone = base.clone().offsetHSL((r() - 0.5) * 0.02, (r() - 0.5) * 0.08, (r() - 0.5) * 0.09);
      g.fillStyle = `#${tone.getHexString()}`;
      g.fillRect(x, y * h, len, h);
      for (let k = 0; k < 6; k++) {
        g.strokeStyle = `rgba(70,35,15,${0.02 + r() * 0.04})`;
        g.lineWidth = 1 + r() * 2;
        const yy = y * h + r() * h;
        g.beginPath();
        g.moveTo(x, yy);
        g.bezierCurveTo(x + len * 0.3, yy + (r() - 0.5) * 8, x + len * 0.7, yy + (r() - 0.5) * 8, x + len, yy);
        g.stroke();
      }
      g.fillStyle = "rgba(60,30,12,.35)";
      g.fillRect(x, y * h, 3, h);
      x += len;
    }
    g.fillStyle = "rgba(60,30,12,.3)";
    g.fillRect(0, y * h, c.width, 3);
  }
  return track(new THREE.CanvasTexture(c));
}

/** Checkerboard lino for the arcade, slightly worn. */
export function checker(a: string, b: string, n = 8) {
  const [c, g] = canvas(512);
  const s = c.width / n;
  const r = rand(3);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      g.fillStyle = (x + y) % 2 ? a : b;
      g.fillRect(x * s, y * s, s, s);
      g.fillStyle = `rgba(255,255,255,${r() * 0.05})`;
      g.fillRect(x * s, y * s, s, s);
    }
  return track(new THREE.CanvasTexture(c));
}

/** Low-pile carpet: colour plus fine speckle. */
export function carpet(color: string, seed = 11) {
  const [c, g] = canvas(256);
  g.fillStyle = color;
  g.fillRect(0, 0, 256, 256);
  const r = rand(seed);
  for (let i = 0; i < 4000; i++) {
    g.fillStyle = r() > 0.5 ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.07)";
    g.fillRect(r() * 256, r() * 256, 1.5, 1.5);
  }
  return track(new THREE.CanvasTexture(c));
}

/** A round rug with concentric bands, like a record seen from above. */
export function rug(colors: string[]) {
  const [c, g] = canvas(512);
  const n = colors.length;
  for (let k = 0; k < n; k++) {
    g.fillStyle = colors[k];
    g.beginPath();
    g.arc(256, 256, 256 - (k * 230) / n, 0, Math.PI * 2);
    g.fill();
  }
  const r = rand(5);
  for (let i = 0; i < 6000; i++) {
    g.fillStyle = r() > 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.06)";
    g.fillRect(r() * 512, r() * 512, 2, 2);
  }
  return track(new THREE.CanvasTexture(c));
}

/** Soft round shadow for anything that moves: the character, kicked records. */
export function blob() {
  const key = "blob";
  if (cache.has(key)) return cache.get(key) as THREE.MeshBasicMaterial;
  const [c, g] = canvas(128);
  const grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grd.addColorStop(0, "rgba(42,20,40,.55)");
  grd.addColorStop(0.55, "rgba(42,20,40,.22)");
  grd.addColorStop(1, "rgba(42,20,40,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const m = new THREE.MeshBasicMaterial({ map: track(new THREE.CanvasTexture(c)), transparent: true, depthWrite: false, toneMapped: false });
  cache.set(key, m);
  return m;
}

/** A soft pool of light on the floor under a lamp: additive, no real light needed. */
export function pool(color: string) {
  const key = `pool:${color}`;
  if (cache.has(key)) return cache.get(key) as THREE.MeshBasicMaterial;
  const [c, g] = canvas(128);
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,.9)");
  grd.addColorStop(0.5, "rgba(255,255,255,.3)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const m = new THREE.MeshBasicMaterial({ color, map: track(new THREE.CanvasTexture(c)), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5, toneMapped: false });
  cache.set(key, m);
  return m;
}

export function fontVar(name: "--font-display" | "--font-text" | "--font-mono", fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

/** Painted lettering: a sign, a room plate, a cabinet marquee. */
export function lettering(
  lines: { text: string; size: number; weight?: number; color: string; font?: "display" | "text" | "mono"; track?: number }[],
  o: { w: number; h: number; bg?: string; radius?: number; pad?: number; align?: CanvasTextAlign; border?: string },
) {
  const [c, g] = canvas(o.w, o.h);
  if (o.bg) {
    g.fillStyle = o.bg;
    g.beginPath();
    g.roundRect(0, 0, o.w, o.h, o.radius ?? 0);
    g.fill();
  }
  if (o.border) {
    g.strokeStyle = o.border;
    g.lineWidth = 8;
    g.beginPath();
    g.roundRect(10, 10, o.w - 20, o.h - 20, Math.max(0, (o.radius ?? 0) - 8));
    g.stroke();
  }
  const total = lines.reduce((a, l) => a + l.size * 1.12, 0);
  let y = (o.h - total) / 2;
  g.textAlign = o.align ?? "center";
  g.textBaseline = "top";
  const x = o.align === "left" ? (o.pad ?? 40) : o.w / 2;
  for (const l of lines) {
    const fam = l.font === "mono" ? fontVar("--font-mono", "ui-monospace, monospace") : l.font === "text" ? fontVar("--font-text", "system-ui, sans-serif") : fontVar("--font-display", "system-ui, sans-serif");
    g.font = `${l.weight ?? 700} ${l.size}px ${fam}`;
    g.fillStyle = l.color;
    if ("letterSpacing" in g) (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${l.track ?? 0}px`;
    g.fillText(l.text, x, y);
    y += l.size * 1.12;
  }
  return track(new THREE.CanvasTexture(c));
}

/** The front of a sleeve: the generated cover art, then the title and catalogue number in real type. */
export function sleeveTexture(slug: string, title: string, onReady: () => void) {
  const [c, g] = canvas(512);
  const s = sleeveOf(slug);
  g.fillStyle = s.bg;
  g.fillRect(0, 0, 512, 512);
  const tex = track(new THREE.CanvasTexture(c));
  const img = new Image();
  img.onload = () => {
    g.drawImage(img, 0, 0, 512, 512);
    // Title band along the bottom, like a printed obi strip.
    g.fillStyle = s.bg;
    g.globalAlpha = 0.92;
    g.fillRect(0, 420, 512, 92);
    g.globalAlpha = 1;
    g.fillStyle = s.ink;
    g.textBaseline = "middle";
    const fam = fontVar("--font-display", "system-ui, sans-serif");
    let size = 46;
    g.font = `800 ${size}px ${fam}`;
    while (g.measureText(title).width > 380 && size > 24) g.font = `800 ${(size -= 2)}px ${fam}`;
    g.fillText(title, 28, 466);
    g.font = `600 22px ${fontVar("--font-mono", "ui-monospace, monospace")}`;
    g.textAlign = "right";
    g.fillText(s.cat, 486, 466);
    tex.needsUpdate = true;
    onReady();
  };
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(coverSVG(slug, { grain: false }))}`;
  return tex;
}

/** A centre label for a disc. */
export function discLabel(color: string, ink: string, text: string) {
  const [c, g] = canvas(256);
  g.fillStyle = "#0d0b14";
  g.fillRect(0, 0, 256, 256);
  // Grooves.
  for (let r = 126; r > 60; r -= 2.2) {
    g.strokeStyle = `rgba(255,255,255,${0.02 + ((r * 13) % 7) / 180})`;
    g.lineWidth = 1;
    g.beginPath();
    g.arc(128, 128, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = color;
  g.beginPath();
  g.arc(128, 128, 52, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = ink;
  g.font = `700 15px ${fontVar("--font-mono", "ui-monospace, monospace")}`;
  g.textAlign = "center";
  g.fillText(text, 128, 114);
  g.beginPath();
  g.arc(128, 128, 4, 0, Math.PI * 2);
  g.fillStyle = "#0d0b14";
  g.fill();
  return track(new THREE.CanvasTexture(c));
}

export function disposePaint() {
  cache.forEach((m) => m.dispose());
  cache.clear();
  textures.forEach((t) => t.dispose());
  textures.length = 0;
}

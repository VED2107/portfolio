/**
 * Every surface in the rooms is painted here, on canvases, at load: no image downloads, and
 * sharp at any resolution the renderer asks for. Seeded, so the shop looks the same every visit.
 */
import * as THREE from "three";

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function finish(c: HTMLCanvasElement, repeat: [number, number], color = true, aniso = 8) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = aniso;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Oak floorboards: staggered planks, long grain, a little wear down the middle of each. */
export function floorboards(seed = 7) {
  const r = rng(seed);
  const W = 1536;
  const [c, g] = canvas(W, W);
  const [rc, rg] = canvas(W, W);
  const plankH = W / 8;
  for (let row = 0; row < 8; row++) {
    let x = -r() * 600;
    while (x < W) {
      const len = 500 + r() * 700;
      const tone = 0.82 + r() * 0.3;
      const base = [118 * tone, 76 * tone, 44 * tone];
      g.fillStyle = `rgb(${base.join(",")})`;
      g.fillRect(x, row * plankH, len, plankH);
      // Grain: thin wavy lines along the plank.
      for (let k = 0; k < 34; k++) {
        const y0 = row * plankH + r() * plankH;
        g.strokeStyle = `rgba(${r() < 0.5 ? "40,22,10" : "190,140,90"},${0.05 + r() * 0.09})`;
        g.lineWidth = 0.6 + r() * 1.8;
        g.beginPath();
        g.moveTo(x, y0);
        for (let px = 0; px <= len; px += 40) g.lineTo(x + px, y0 + Math.sin(px * 0.012 + k) * (2 + r() * 3));
        g.stroke();
      }
      // Seams.
      g.fillStyle = "rgba(20,10,4,0.75)";
      g.fillRect(x, row * plankH, 3, plankH);
      // Roughness: worn (smoother) along the walking line, dull at the edges.
      rg.fillStyle = `rgb(${150 + r() * 40},${150},${150})`;
      rg.fillRect(x, row * plankH, len, plankH);
      x += len;
    }
    g.fillStyle = "rgba(20,10,4,0.8)";
    g.fillRect(0, row * plankH, W, 3);
  }
  const wear = rg.createLinearGradient(0, 0, 0, W);
  wear.addColorStop(0, "rgba(0,0,0,0)");
  wear.addColorStop(0.5, "rgba(0,0,0,0.25)");
  wear.addColorStop(1, "rgba(0,0,0,0)");
  rg.fillStyle = wear;
  rg.fillRect(0, 0, W, W);
  return { map: finish(c, [3, 3]), roughness: finish(rc, [3, 3], false) };
}

/** Lime plaster: soft mottling and a few trowel marks. Tinted by the lights, not by the paint. */
export function plaster(seed = 3, tint = [214, 206, 188]) {
  const r = rng(seed);
  const W = 1024;
  const [c, g] = canvas(W, W);
  g.fillStyle = `rgb(${tint.join(",")})`;
  g.fillRect(0, 0, W, W);
  for (let i = 0; i < 1600; i++) {
    const x = r() * W;
    const y = r() * W;
    const rad = 10 + r() * 90;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    const d = r() < 0.5 ? "0,0,0" : "255,255,255";
    grd.addColorStop(0, `rgba(${d},${0.025 + r() * 0.03})`);
    grd.addColorStop(1, `rgba(${d},0)`);
    g.fillStyle = grd;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  return finish(c, [4, 2]);
}

/** Lobby carpet: a deco fan repeat in oxblood, teal and old gold. */
export function carpet() {
  const W = 1024;
  const [c, g] = canvas(W, W);
  g.fillStyle = "#3a0f16";
  g.fillRect(0, 0, W, W);
  const cell = W / 4;
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 5; j++) {
      const cx = i * cell + (j % 2 ? cell / 2 : 0);
      const cy = j * cell;
      for (let k = 6; k > 0; k--) {
        g.beginPath();
        g.arc(cx, cy, (k / 6) * cell * 0.55, Math.PI, 2 * Math.PI);
        g.strokeStyle = k % 2 ? "rgba(196,150,74,0.55)" : "rgba(28,74,72,0.8)";
        g.lineWidth = 6;
        g.stroke();
      }
    }
  // Pile: scattered flecks instead of per-pixel noise (a fraction of the cost, same look at distance).
  const r = rng(11);
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = r() < 0.5 ? "rgba(0,0,0,0.12)" : "rgba(255,230,200,0.06)";
    g.fillRect(r() * W, r() * W, 2, 2);
  }
  return finish(c, [10, 2]);
}

/** Wall fabric: a fine vertical rib, dark, catching light only at grazing angles. */
export function fabric(base = "#151821") {
  const W = 512;
  const [c, g] = canvas(W, W);
  g.fillStyle = base;
  g.fillRect(0, 0, W, W);
  for (let x = 0; x < W; x += 4) {
    g.fillStyle = `rgba(255,255,255,${x % 8 ? 0.025 : 0.05})`;
    g.fillRect(x, 0, 1.5, W);
  }
  return finish(c, [8, 2]);
}

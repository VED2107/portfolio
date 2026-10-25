/**
 * The pressing plant: draws everything the records are made of onto canvases. Grooves, the
 * centre label and the sleeve are 2D drawings mapped onto the 3D record; nothing is a bitmap
 * shipped with the site except the product screenshots that become the sleeve art.
 */

/** Record dimensions in scene units. Shared by the drawing and the hit-testing. */
export const DISC = { r: 1.5, label: 0.52, inner: 0.62, outer: 1.43, gap: 0.022 } as const;

export type Band = { outer: number; inner: number };

/**
 * Split the playable area into bands, outermost first, like the tracks on a real LP. Each
 * band's width follows its weight (a decision's length, or a week's contributions).
 */
export function bands(weights: number[], gap: number = DISC.gap): Band[] {
  const n = weights.length;
  if (!n) return [];
  const span = DISC.outer - DISC.inner - gap * (n - 1);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const out: Band[] = [];
  let r = DISC.outer;
  for (const w of weights) {
    const width = span * (w / total);
    out.push({ outer: r, inner: r - width });
    r -= width + gap;
  }
  return out;
}

export function bandAt(list: Band[], radius: number) {
  return list.findIndex((b) => radius <= b.outer && radius >= b.inner);
}

export function fontFamily(kind: "display" | "print" = "display") {
  const v = getComputedStyle(document.documentElement).getPropertyValue(kind === "display" ? "--font-display" : "--font-print").trim();
  return v ? `${v}, system-ui, sans-serif` : "system-ui, sans-serif";
}

/** Canvas text in the site's faces. Display type is set at its narrowest, like the page. */
function setFont(c: CanvasRenderingContext2D, weight: number, px: number, kind: "display" | "print" = "display", stretch: CanvasFontStretch = "ultra-condensed") {
  c.font = `${weight} ${px}px ${fontFamily(kind)}`;
  if ("fontStretch" in c) c.fontStretch = kind === "display" ? stretch : "normal";
}

/** Wait for the faces before drawing, or the first sleeve prints in the fallback font. */
export async function fontsReady() {
  try {
    await Promise.all([document.fonts.load(`900 100px ${fontFamily("display")}`), document.fonts.load(`500 40px ${fontFamily("print")}`)]);
  } catch {
    /* draw with whatever is available */
  }
}

function canvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return [c, c.getContext("2d")!] as const;
}

/**
 * Grooves. Returns a colour map and a roughness map. Track gaps are smooth, so they catch the
 * light as bright rings; inside a band, roughness follows the band's intensity (0..1), which is
 * how a year of commits becomes visible on the hero record.
 */
export function grooves(list: Band[], intensity: number[], size = 1024) {
  const [cm, c] = canvas(size);
  const [rm, r] = canvas(size);
  const px = size / 2 / DISC.r;
  const cx = size / 2;

  const ring = (ctx: CanvasRenderingContext2D, outer: number, inner: number, style: string) => {
    ctx.beginPath();
    ctx.arc(cx, cx, outer * px, 0, Math.PI * 2);
    ctx.arc(cx, cx, Math.max(0, inner) * px, 0, Math.PI * 2, true);
    ctx.fillStyle = style;
    ctx.fill("evenodd");
  };

  // Base: lead-in, run-out and the smooth land around the label.
  c.fillStyle = "#060607";
  c.fillRect(0, 0, size, size);
  r.fillStyle = "rgb(70,70,70)";
  r.fillRect(0, 0, size, size);
  ring(r, DISC.r, DISC.outer + 0.02, "rgb(95,95,95)");
  ring(c, DISC.r, DISC.r - 0.012, "#151518");

  list.forEach((b, i) => {
    const k = Math.max(0, Math.min(1, intensity[i] ?? 0.6));
    const tone = 6 + Math.round(k * 22);
    ring(c, b.outer, b.inner, `rgb(${tone},${tone},${tone + 3})`);
    const rough = 90 + Math.round(k * 130);
    ring(r, b.outer, b.inner, `rgb(${rough},${rough},${rough})`);
    // The groove itself: fine concentric lines, alternating, so the spin reads as vinyl.
    const step = 1.6 / px;
    let alt = false;
    for (let rad = b.outer; rad > b.inner; rad -= step) {
      r.beginPath();
      r.arc(cx, cx, rad * px, 0, Math.PI * 2);
      r.strokeStyle = alt ? `rgba(255,255,255,${0.1 + k * 0.12})` : "rgba(0,0,0,0.18)";
      r.lineWidth = 0.8;
      r.stroke();
      alt = !alt;
    }
  });

  return { color: cm, rough: rm };
}

/** The centre label: title, catalogue number, speed, and the run-out line round the edge. */
export function label(o: { title: string; cat: string; bg: string; ink: string; runout: string; side?: string }, size = 1024) {
  const [cv, c] = canvas(size);
  const cx = size / 2;
  const R = size / 2;
  c.fillStyle = o.bg;
  c.beginPath();
  c.arc(cx, cx, R, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = o.ink;
  c.textAlign = "center";
  c.textBaseline = "middle";

  // Title, shrunk to fit the label's width.
  let fs = 190;
  setFont(c, 900, fs);
  while (c.measureText(o.title.toUpperCase()).width > size * 0.72 && fs > 40) {
    fs -= 6;
    setFont(c, 900, fs);
  }
  c.fillText(o.title.toUpperCase(), cx, cx - size * 0.2);

  setFont(c, 700, 40, "display", "ultra-expanded");
  c.fillText(o.cat, cx, cx + size * 0.2);
  c.globalAlpha = 0.7;
  setFont(c, 600, 34, "display", "expanded");
  c.fillText(`33⅓ RPM${o.side ? `   ·   SIDE ${o.side}` : ""}`, cx, cx + size * 0.29);
  c.globalAlpha = 1;

  // Spindle hole.
  c.fillStyle = "#08080a";
  c.beginPath();
  c.arc(cx, cx, size * 0.035, 0, Math.PI * 2);
  c.fill();

  // Run-out text, set round the rim.
  setFont(c, 600, 28, "display", "expanded");
  c.fillStyle = o.ink;
  c.globalAlpha = 0.55;
  const text = `${o.runout}  ·  pressed by ved  ·  `.toUpperCase();
  const rr = R * 0.86;
  let a = -Math.PI / 2 - 1.2;
  for (const ch of text) {
    const w = c.measureText(ch).width;
    a += w / 2 / rr;
    c.save();
    c.translate(cx + rr * Math.cos(a), cx + rr * Math.sin(a));
    c.rotate(a + Math.PI / 2);
    c.fillText(ch, 0, 0);
    c.restore();
    a += w / 2 / rr;
  }
  c.globalAlpha = 1;
  return cv;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * The sleeve front: the product's own screenshot as the cover photograph, the title set large in
 * the sleeve's ink, the catalogue number. Square, like a 12-inch sleeve.
 */
export async function sleeve(o: { title: string; cat: string; bg: string; ink: string; img?: string; line?: string; bars?: number[] }, size = 1024) {
  const [cv, c] = canvas(size);
  c.fillStyle = o.bg;
  c.fillRect(0, 0, size, size);

  const m = 56;
  const photoH = Math.round(size * 0.6);
  if (o.bars?.length) {
    // The house sleeve's artwork is the year itself: one bar per week, in the label's blue.
    const boxW = size - m * 2;
    const peak = Math.max(1, ...o.bars);
    const w = boxW / o.bars.length;
    o.bars.forEach((v, i) => {
      const h = Math.max(4, (v / peak) * (photoH - 20));
      c.fillStyle = v ? "#e3a72f" : "rgba(255,255,255,0.12)";
      c.fillRect(m + i * w + 1, m + photoH - h, Math.max(1, w - 3), h);
    });
  } else if (o.img) {
    const img = await loadImage(o.img);
    if (img) {
      // Cover-crop the screenshot into the photo box, anchored top-left where interfaces start.
      const boxW = size - m * 2;
      const scale = Math.max(boxW / img.width, photoH / img.height);
      const sw = boxW / scale;
      const sh = photoH / scale;
      c.drawImage(img, 0, 0, sw, sh, m, m, boxW, photoH);
    }
  } else {
    c.fillStyle = o.ink;
    c.globalAlpha = 0.08;
    c.fillRect(m, m, size - m * 2, photoH);
    c.globalAlpha = 1;
  }

  c.fillStyle = o.ink;
  c.textBaseline = "alphabetic";
  c.textAlign = "left";
  setFont(c, 700, 30, "display", "ultra-expanded");
  c.fillText(o.cat, m, m + photoH + 70);
  c.textAlign = "right";
  c.fillText("VED RECORDS", size - m, m + photoH + 70);

  c.textAlign = "left";
  const title = o.title.toUpperCase();
  let fs = 230;
  setFont(c, 900, fs);
  while (c.measureText(title).width > size - m * 2 && fs > 60) {
    fs -= 6;
    setFont(c, 900, fs);
  }
  c.fillText(title, m - 4, size - m - (o.line ? 56 : 8));
  if (o.line) {
    c.globalAlpha = 0.75;
    setFont(c, 500, 32, "print");
    c.fillText(o.line, m, size - m);
    c.globalAlpha = 1;
  }
  return cv;
}

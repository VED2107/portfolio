/**
 * Sleeve art. Every record gets an original cover drawn from what the project actually does:
 * Atlas is an import graph, SwiftDrop a bitmap of verified blocks, Accounic a ledger that
 * balances. Pure functions that return SVG strings, so the same art is used by server-rendered
 * pages, the case-study overlay and (rasterised) the 3D sleeves on the wall.
 *
 * Covers carry no text by default: titles are set in real type beside them, and the 3D sleeves
 * paint their own lettering, because an SVG drawn into a canvas can't load web fonts.
 */

export type Sleeve = { bg: string; ink: string; accent: string; label: string; cat: string; runout: string };

/** The pressing: colour and catalogue number for each record. Packaging only, no new facts. */
export const SLEEVES: Record<string, Sleeve> = {
  "amr-drug-repurposing": { bg: "#13a89e", ink: "#fff8ec", accent: "#ffd66b", label: "#fff8ec", cat: "RV-07", runout: "a prediction, not a cure" },
  nova: { bg: "#1b1740", ink: "#fff1d6", accent: "#ff7a1a", label: "#ff7a1a", cat: "RV-09", runout: "only what the engine confirms" },
  "vinnys-atelier": { bg: "#ffd66b", ink: "#2a1a3a", accent: "#e0367a", label: "#e0367a", cat: "RV-03", runout: "only the webhook says paid" },
  accounic: { bg: "#f7ecd8", ink: "#16523f", accent: "#ff5a5f", label: "#16865c", cat: "RV-02", runout: "zero floats in the money path" },
  "snowbros-atlas": { bg: "#7357ff", ink: "#fff8ec", accent: "#ffb23e", label: "#ffb23e", cat: "RV-01", runout: "same code in, same findings out" },
  swiftdrop: { bg: "#ff5a5f", ink: "#fff8ec", accent: "#1b1740", label: "#1b1740", cat: "RV-06", runout: "resume, never restart" },
  "vinnys-vogue": { bg: "#a3245a", ink: "#ffe9d6", accent: "#ffcf6b", label: "#ffcf6b", cat: "RV-04", runout: "one lehenga left, two buyers" },
  "stc-academy": { bg: "#1f3f7a", ink: "#fff1d6", accent: "#ff7a1a", label: "#fff1d6", cat: "RV-05", runout: "two boards, one catalogue" },
  "ved-exe": { bg: "#ff7a1a", ink: "#1b1740", accent: "#fff1d6", label: "#1b1740", cat: "RV-08", runout: "the work is the interface" },
};

export const HOUSE: Sleeve = { bg: "#e9b949", ink: "#2a1a3a", accent: "#fff3d0", label: "#2a1a3a", cat: "RV-00", runout: "pressed from commits" };

/** Small deterministic PRNG, seeded by the slug, so a cover never changes between renders. */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

const f = (n: number) => Math.round(n * 10) / 10;

function motif(slug: string, s: Sleeve): string {
  const r = rng(slug);
  switch (slug) {
    case "snowbros-atlas": {
      // An import graph: nodes in rings, edges flowing one way, one cycle drawn in the accent.
      const nodes = Array.from({ length: 16 }, (_, k) => {
        const ring = k < 1 ? 0 : k < 6 ? 1 : 2;
        const a = (k * 2.399) % (Math.PI * 2);
        const rad = [0, 78, 142][ring];
        return [200 + Math.cos(a) * rad, 185 + Math.sin(a) * rad * 0.9] as const;
      });
      const edges: string[] = [];
      for (let k = 1; k < nodes.length; k++) {
        const to = k < 6 ? 0 : 1 + ((k * 7) % 5);
        edges.push(`<path d="M${f(nodes[k][0])} ${f(nodes[k][1])} L${f(nodes[to][0])} ${f(nodes[to][1])}" stroke="${s.ink}" stroke-opacity=".55" stroke-width="2.5"/>`);
      }
      const cyc = [6, 11, 3, 6].map((i) => `${f(nodes[i][0])} ${f(nodes[i][1])}`).join(" L");
      return `${edges.join("")}<path d="M${cyc}" fill="none" stroke="${s.accent}" stroke-width="6" stroke-linejoin="round"/>${nodes
        .map((n, k) => `<circle cx="${f(n[0])}" cy="${f(n[1])}" r="${k === 0 ? 20 : [6, 11, 3].includes(k) ? 12 : 8}" fill="${[6, 11, 3].includes(k) ? s.accent : s.ink}"/>`)
        .join("")}`;
    }
    case "swiftdrop": {
      // A bitmap of verified 1 MiB blocks, filling from the left, with one resend in flight.
      const cells: string[] = [];
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 10; x++) {
          const done = x + y * 0.35 < 6.5 + r() * 1.5;
          cells.push(`<rect x="${42 + x * 32}" y="${54 + y * 32}" width="26" height="26" rx="5" fill="${done ? s.ink : "none"}" stroke="${s.ink}" stroke-opacity="${done ? 1 : 0.45}" stroke-width="2"/>`);
        }
      cells.push(`<rect x="${42 + 7 * 32}" y="${54 + 2 * 32}" width="26" height="26" rx="5" fill="${s.accent}"/>`);
      return cells.join("") + `<path d="M40 336 H300 M276 318 L304 336 L276 354" fill="none" stroke="${s.accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case "accounic": {
      // A ledger: ruled lines, two columns, and a balance that settles to zero.
      const lines = Array.from({ length: 9 }, (_, k) => `<path d="M48 ${78 + k * 30} H352" stroke="${s.ink}" stroke-opacity=".18" stroke-width="2"/>`).join("");
      const left = Array.from({ length: 6 }, (_, k) => `<rect x="60" y="${86 + k * 30}" width="${f(40 + r() * 80)}" height="12" rx="6" fill="${s.ink}"/>`).join("");
      const right = Array.from({ length: 6 }, (_, k) => `<rect x="${f(340 - (30 + r() * 70))}" y="${86 + k * 30}" width="${f(30 + r() * 70)}" height="12" rx="6" fill="${k % 2 ? s.accent : s.ink}" fill-opacity="${k % 2 ? 1 : 0.7}"/>`).join("");
      return `${lines}<path d="M200 70 V330" stroke="${s.ink}" stroke-width="3"/>${left}${right}<circle cx="200" cy="300" r="34" fill="${s.label}"/><text x="200" y="314" text-anchor="middle" font-size="40" font-weight="700" fill="#fff" font-family="ui-monospace,monospace">0</text>`;
    }
    case "vinnys-atelier": {
      // A thermal receipt with a zig-zag tear and a barcode, settled by a single tick.
      const zig = Array.from({ length: 11 }, (_, k) => `${110 + k * 18} ${k % 2 ? 330 : 342}`).join(" L");
      const rows = Array.from({ length: 6 }, (_, k) => `<rect x="134" y="${108 + k * 24}" width="${f(60 + r() * 50)}" height="9" rx="4" fill="${s.ink}" fill-opacity=".75"/><rect x="${f(266 - 30)}" y="${108 + k * 24}" width="30" height="9" rx="4" fill="${s.ink}" fill-opacity=".75"/>`).join("");
      const bars = Array.from({ length: 26 }, (_, k) => `<rect x="${134 + k * 5}" y="270" width="${k % 3 ? 2 : 3.5}" height="34" fill="${s.ink}"/>`).join("");
      return `<path d="M110 60 H290 V342 L${zig} Z" fill="#fffaf0" transform="rotate(-6 200 200)"/><g transform="rotate(-6 200 200)">${rows}<rect x="134" y="250" width="132" height="2" fill="${s.ink}"/>${bars}</g><circle cx="300" cy="300" r="42" fill="${s.accent}"/><path d="M282 300 L296 314 L320 288" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case "amr-drug-repurposing": {
      // A molecule of fused rings, and four targets around it.
      const hex = (cx: number, cy: number, rad: number) =>
        Array.from({ length: 6 }, (_, k) => {
          const a = Math.PI / 6 + (k * Math.PI) / 3;
          return `${f(cx + Math.cos(a) * rad)} ${f(cy + Math.sin(a) * rad)}`;
        }).join(" L");
      const rings = [[170, 190], [222, 160], [222, 220], [274, 190]]
        .map(([x, y], k) => `<path d="M${hex(x, y, 30)} Z" fill="${k === 3 ? s.accent : "none"}" stroke="${s.ink}" stroke-width="5" stroke-linejoin="round"/>`)
        .join("");
      const targets = [[78, 92], [322, 86], [70, 310], [326, 316]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="26" fill="none" stroke="${s.ink}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="9" fill="${s.ink}"/>`)
        .join("");
      return `${targets}<path d="M110 190 H140 M304 190 H330" stroke="${s.ink}" stroke-width="5" stroke-linecap="round"/>${rings}`;
    }
    case "nova": {
      // An aperture, film perforations, and a playhead that only moves when the engine says so.
      const perf = Array.from({ length: 9 }, (_, k) => `<rect x="${32 + k * 40}" y="34" width="22" height="14" rx="3" fill="${s.ink}" fill-opacity=".85"/><rect x="${32 + k * 40}" y="352" width="22" height="14" rx="3" fill="${s.ink}" fill-opacity=".85"/>`).join("");
      const blades = Array.from({ length: 8 }, (_, k) => {
        const a = (k * Math.PI) / 4;
        return `<path d="M200 200 L${f(200 + Math.cos(a) * 118)} ${f(200 + Math.sin(a) * 118)} A118 118 0 0 1 ${f(200 + Math.cos(a + 0.785) * 118)} ${f(200 + Math.sin(a + 0.785) * 118)} Z" fill="${k % 2 ? s.accent : s.ink}" fill-opacity="${k % 2 ? 1 : 0.92}"/>`;
      }).join("");
      return `${perf}${blades}<circle cx="200" cy="200" r="38" fill="${s.bg}"/><path d="M188 182 L218 200 L188 218 Z" fill="${s.ink}"/>`;
    }
    case "vinnys-vogue": {
      // Arches of a mehrab, nested, in gold leaf.
      const arch = (w: number, h: number, y: number) => `<path d="M${200 - w} ${y} V${y - h + w} Q${200 - w} ${y - h} 200 ${y - h - w * 0.4} Q${200 + w} ${y - h} ${200 + w} ${y - h + w} V${y}" fill="none" stroke="${s.accent}" stroke-width="5"/>`;
      return `${arch(120, 220, 350)}${arch(88, 170, 350)}${arch(56, 120, 350)}<circle cx="200" cy="200" r="14" fill="${s.accent}"/>${Array.from({ length: 7 }, (_, k) => `<circle cx="${92 + k * 36}" cy="372" r="5" fill="${s.ink}"/>`).join("")}`;
    }
    case "stc-academy": {
      // Books on a shelf, two boards of spines, and a star for the competitive track.
      const spines = Array.from({ length: 11 }, (_, k) => {
        const h = 110 + r() * 70;
        return `<rect x="${52 + k * 27}" y="${f(300 - h)}" width="22" height="${f(h)}" rx="3" fill="${k % 4 === 1 ? s.accent : s.ink}" fill-opacity="${k % 4 === 1 ? 1 : 0.88}"/>`;
      }).join("");
      const star = Array.from({ length: 10 }, (_, k) => {
        const a = -Math.PI / 2 + (k * Math.PI) / 5;
        const rad = k % 2 ? 16 : 38;
        return `${f(300 + Math.cos(a) * rad)} ${f(96 + Math.sin(a) * rad)}`;
      }).join(" L");
      return `${spines}<rect x="40" y="300" width="320" height="10" rx="4" fill="${s.ink}"/><path d="M${star} Z" fill="${s.accent}"/>`;
    }
    case "ved-exe": {
      return `${[150, 118, 86].map((rad, k) => `<circle cx="200" cy="200" r="${rad}" fill="none" stroke="${s.ink}" stroke-width="${k === 0 ? 10 : 4}"/>`).join("")}<circle cx="200" cy="200" r="46" fill="${s.ink}"/><circle cx="200" cy="200" r="6" fill="${s.bg}"/><path d="M270 92 L330 60" stroke="${s.accent}" stroke-width="10" stroke-linecap="round"/>`;
    }
    default: {
      // The house record: grooves and a gold label.
      return `${Array.from({ length: 12 }, (_, k) => `<circle cx="200" cy="200" r="${60 + k * 11}" fill="none" stroke="${s.ink}" stroke-opacity="${0.15 + (k % 3) * 0.12}" stroke-width="3"/>`).join("")}<circle cx="200" cy="200" r="48" fill="${s.ink}"/>`;
    }
  }
}

/** A square sleeve. `grain` adds the printed-paper texture (skipped for the 3D raster, which has its own). */
export function coverSVG(slug: string, opts: { grain?: boolean } = {}) {
  const s = SLEEVES[slug] ?? HOUSE;
  const grain = opts.grain !== false;
  const id = `g${slug.replace(/[^a-z0-9]/gi, "")}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="presentation">${
    grain
      ? `<defs><filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .09 0"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>`
      : ""
  }<rect width="400" height="400" fill="${s.bg}"/>${motif(slug, s)}${grain ? `<rect width="400" height="400" filter="url(#${id})"/>` : ""}</svg>`;
}

export function sleeveOf(slug: string): Sleeve {
  return SLEEVES[slug] ?? HOUSE;
}

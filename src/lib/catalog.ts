/**
 * The shop's inventory. Every release and film is derived from the sourced facts in work.ts;
 * this file only decides how each one is packaged: catalogue number, label, sleeve art, sides.
 * Nothing here is a new fact.
 */
import { FILINGS, type Filing, type Img } from "./work";

export type Art = "atlas" | "accounic" | "atelier" | "vogue" | "stc" | "swiftdrop" | "amr" | "nova";

export type Genre = { id: string; label: string; short: string };

/** Crate dividers. A record sits behind exactly one. */
export const GENRES: Genre[] = [
  { id: "tools", label: "Developer tools & networking", short: "Tools" },
  { id: "money", label: "Money & retail", short: "Money & retail" },
  { id: "science", label: "Science & learning", short: "Science & learning" },
];

export type Track = { side: "A" | "B"; n: number; title: string; body: string };

export type Release = {
  slug: string;
  cat: string; // catalogue number, printed on spine, label and sticker
  title: string;
  label: "SNOWBROS" | "Self-released";
  year: string;
  format: "LP" | "EP";
  genre: string;
  field: string;
  short: string;
  role: string;
  status: string;
  credits: string[];
  hype: { value: string; label: string }[];
  tracks: Track[];
  links: { label: string; href: string }[];
  plate?: Img;
  art: Art;
  /** Sleeve colour and the ink printed on it. */
  sleeve: string;
  ink: string;
  /** Centre-label colour on the record. */
  disc: string;
  /** Etched in the run-out groove. Only visible up close. */
  runout: string;
};

const PACKAGING: Record<string, { art: Art; genre: string; sleeve: string; ink: string; disc: string; runout: string }> = {
  "snowbros-atlas": { art: "atlas", genre: "tools", sleeve: "#2f3bff", ink: "#f4f1ea", disc: "#f4f1ea", runout: "same code in · same findings out" },
  swiftdrop: { art: "swiftdrop", genre: "tools", sleeve: "#d8392b", ink: "#fff4ec", disc: "#16130f", runout: "resume · never restart" },
  accounic: { art: "accounic", genre: "money", sleeve: "#dfe6d6", ink: "#0f3d2a", disc: "#16865c", runout: "zero floats in the money path" },
  "vinnys-atelier": { art: "atelier", genre: "money", sleeve: "#c9a46a", ink: "#1c140b", disc: "#f6efe2", runout: "only the webhook says paid" },
  "vinnys-vogue": { art: "vogue", genre: "money", sleeve: "#5b1328", ink: "#f6e6dd", disc: "#a3355f", runout: "one lehenga left · two buyers" },
  "amr-drug-repurposing": { art: "amr", genre: "science", sleeve: "#e7efee", ink: "#0b3f45", disc: "#127c86", runout: "a prediction · not a cure" },
  nova: { art: "nova", genre: "tools", sleeve: "#0f1115", ink: "#e9ecf2", disc: "#e9ecf2", runout: "only what the engine confirms" },
  "stc-academy": { art: "stc", genre: "science", sleeve: "#14213d", ink: "#efe6cf", disc: "#efe6cf", runout: "two boards · one catalogue" },
};

/** Crate order, best by the door: the AMR campaign, SwiftDrop, Accounic and NOVA lead. */
const ORDER = ["amr-drug-repurposing", "swiftdrop", "accounic", "nova", "snowbros-atlas", "vinnys-atelier", "vinnys-vogue", "stc-academy"];

function toRelease(f: Filing): Release {
  const p = PACKAGING[f.slug];
  const half = Math.ceil(f.decisions.length / 2);
  return {
    slug: f.slug,
    cat: `VED ${f.no}`,
    title: f.title,
    label: /SNOWBROS/i.test(f.role) ? "SNOWBROS" : "Self-released",
    year: f.year,
    // Five or more decisions is a full album; fewer is an EP.
    format: f.decisions.length >= 5 ? "LP" : "EP",
    genre: p.genre,
    field: f.field,
    short: f.short,
    role: f.role,
    status: f.status,
    credits: f.stack,
    hype: f.facts.slice(0, 2),
    tracks: f.decisions.map((d, i) => ({ side: i < half ? "A" : "B", n: i < half ? i + 1 : i - half + 1, title: d.title, body: d.body })),
    links: f.links,
    plate: f.plate,
    art: p.art,
    sleeve: p.sleeve,
    ink: p.ink,
    disc: p.disc,
    runout: p.runout,
  };
}

export const RELEASES: Release[] = ORDER.map((s) => toRelease(FILINGS.find((f) => f.slug === s)!));

export const getRelease = (slug: string) => RELEASES.find((r) => r.slug === slug);

/** The front-window display: what is being built and shipped right now. */
export const NEW_RELEASES = ["amr-drug-repurposing", "nova", "swiftdrop"];

export * from "./backroom";

/* ------------------------------------------------------------------ credits */

/** How many pressings each technology appears on. Liner credits, not a logo cloud. */
export function equipment() {
  const count = new Map<string, number>();
  const norm = (s: string) => s.replace(/\s+\d[\d.]*$/, "").replace(/^Tailwind( CSS)?$/, "Tailwind CSS").trim();
  for (const f of FILINGS) for (const s of f.stack) count.set(norm(s), (count.get(norm(s)) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/* ------------------------------------------------------------------ barcode */

/**
 * Bars that actually encode the catalogue number and year: each digit becomes a bar pair whose
 * widths come from the digit, framed by guard bars. Not a scannable EAN; a faithful one.
 */
export function bars(code: string): number[] {
  const digits = code.replace(/\D/g, "").split("").map(Number);
  const out = [1, 1, 1];
  for (const d of digits) out.push(1 + (d % 3), 1 + Math.floor(d / 4), 1, 1 + ((d + 1) % 2));
  out.push(1, 1, 1);
  return out;
}

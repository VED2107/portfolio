/**
 * The back room's stock. Films are public repositories (their own descriptions, languages and
 * last push, from the GitHub snapshot); skills are cases whose chapters are the releases or
 * repositories they appear on. Regenerate the snapshot with `node scripts/github-snapshot.mjs`.
 */
import { ARCHIVE, FILINGS, type Img } from "./work";
import GH from "./github-snapshot.json";

export type Maturity = "Live" | "Open source" | "In production" | "Experiment";

export type Film = {
  id: string;
  kind: "film" | "skill";
  cat: string;
  title: string;
  edition: string;
  maturity?: Maturity;
  year: string;
  logline: string;
  chapters: { label: string; href?: string }[];
  features: string[];
  href: string;
  internal?: boolean;
  cover?: Img;
  /** Case plastic. */
  shell: "smoke" | "clear" | "steel";
  tone: string;
};

export type Shelf = { id: string; label: string; note: string; items: Film[] };

export const SNAPSHOT_DATE = GH.taken;

type Repo = (typeof GH.repos)[number];
const repo = (name: string) => GH.repos.find((r) => r.name === name) as Repo;
const gh = (name: string) => `https://github.com/${repo(name).repo}`;
const archive = (title: string) => ARCHIVE.find((a) => a.title === title)!;
const clean = (t: string) => t.replace(/^[^A-Za-z0-9]+/, "").trim();

/** A repository's languages, largest first. */
function langs(name: string, n = 4) {
  return Object.entries(repo(name).languages as Record<string, number>)
    .sort((x, y) => y[1] - x[1])
    .slice(0, n)
    .map(([label]) => ({ label }));
}
function pushed(name: string) {
  const d = new Date(repo(name).pushed);
  return `Last pushed ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`;
}

export const FILMS: Film[] = [
  {
    kind: "film",
    id: "snowbros",
    cat: "SNB 001",
    title: "SNOWBROS",
    edition: "Director's cut",
    maturity: "Live",
    year: "2026",
    logline: "The independent software studio I run. Client work and open source; most of the records out front were pressed under this label.",
    chapters: langs("snowbros"),
    features: [clean(repo("snowbros").description), pushed("snowbros")],
    href: repo("snowbros").homepage || "https://snowbros.me",
    cover: archive("SNOWBROS").preview,
    shell: "steel",
    tone: "#9fb3c8",
  },
  {
    kind: "film",
    id: "creative-engineering",
    cat: "SNB 002",
    title: "Creative Engineering",
    edition: "Featurette",
    maturity: "In production",
    year: "2026",
    logline: clean(repo("creative-engineering").description),
    chapters: langs("creative-engineering"),
    features: ["Published by snowbros-labs", pushed("creative-engineering")],
    href: gh("creative-engineering"),
    shell: "clear",
    tone: "#d9d2c3",
  },
  {
    kind: "film",
    id: "mentor",
    cat: "SNB 003",
    title: "Mentor",
    edition: "B-side",
    maturity: "Open source",
    year: "2026",
    logline: clean(repo("mentor-skill").description),
    chapters: ["Teach mode", "Build mode", "Capability orchestration"].map((label) => ({ label })),
    features: ["MIT licensed", pushed("mentor-skill")],
    href: gh("mentor-skill"),
    shell: "clear",
    tone: "#e8e1d0",
  },
  {
    kind: "film",
    id: "homebrew-tap",
    cat: "SNB 004",
    title: "Homebrew tap",
    edition: "Featurette",
    maturity: "Open source",
    year: "2026",
    logline: "The tap Snowbros Atlas installs from: brew install, and the binary for your machine arrives.",
    chapters: langs("homebrew-tap"),
    features: ["Part of the Atlas release pipeline", pushed("homebrew-tap")],
    href: gh("homebrew-tap"),
    shell: "clear",
    tone: "#f0b35a",
  },
  {
    kind: "film",
    id: "lunora",
    cat: "VED 920",
    title: "Lunora Studio",
    edition: "Collector's edition",
    maturity: "Live",
    year: "2026",
    logline: "Handmade bouquet e-commerce. Flowers fade; memories don't.",
    chapters: langs("lunora-studio"),
    features: [archive("Lunora Studio").stack, pushed("lunora-studio")],
    href: repo("lunora-studio").homepage || gh("lunora-studio"),
    cover: archive("Lunora Studio").preview,
    shell: "smoke",
    tone: "#d9b8c4",
  },
  {
    kind: "film",
    id: "cipher-clash",
    cat: "VED 940",
    title: "Cipher Clash",
    edition: "B-side",
    maturity: "Experiment",
    year: "2026",
    logline: `${archive("Cipher Clash").field}, built to learn what realtime state costs.`,
    chapters: langs("guesser"),
    features: [archive("Cipher Clash").stack, pushed("guesser")],
    href: gh("guesser"),
    shell: "smoke",
    tone: "#b7c4ff",
  },
  {
    kind: "film",
    id: "filmica",
    cat: "VED 950",
    title: "Filmica",
    edition: "Steelbook",
    maturity: "Experiment",
    year: "2026",
    logline: `${archive("Filmica").field}. The only actual film in the film room.`,
    chapters: langs("filmica"),
    features: [archive("Filmica").stack, pushed("filmica")],
    href: gh("filmica"),
    shell: "steel",
    tone: "#e2c48f",
  },
  {
    kind: "film",
    id: "making-of",
    cat: "VED 800",
    title: "The making of this shop",
    edition: "Featurette",
    maturity: "Live",
    year: "2026",
    logline: "Behind the scenes of the site you are standing in: one motion system, two rooms, a card catalogue, sleeves that keep their identity from wall to liner notes.",
    chapters: langs("portfolio"),
    features: ["Press ⌘K for the card catalogue", "Spin a record backwards"],
    href: "/work/ved-exe",
    internal: true,
    shell: "clear",
    tone: "#c9ccd1",
  },
];

/* ------------------------------------------------------------------ skills */

const SKIP_LANG = new Set(["HTML", "CSS", "Shell", "PowerShell", "CMake", "Inno Setup", "NSIS", "Dockerfile", "Objective-C", "C", "Jupyter Notebook"]);
const LANG_TONE: Record<string, string> = {
  TypeScript: "#3a6df0",
  Rust: "#c8643c",
  Dart: "#3fb6d8",
  Python: "#e3c54a",
  PLpgSQL: "#8aa2c8",
  Astro: "#ff7a45",
  JavaScript: "#efd84a",
  Kotlin: "#a77bf0",
  "C++": "#6b8fc8",
  Swift: "#f0703c",
  Ruby: "#c8463a",
};

/** Languages, by the bytes GitHub counts across the public repositories. */
function languageShelf(): Shelf {
  const bytes = new Map<string, number>();
  const where = new Map<string, string[]>();
  for (const r of GH.repos) {
    for (const [l, b] of Object.entries(r.languages as Record<string, number>)) {
      if (SKIP_LANG.has(l)) continue;
      bytes.set(l, (bytes.get(l) ?? 0) + b);
      where.set(l, [...(where.get(l) ?? []), r.name]);
    }
  }
  const items = [...bytes.entries()]
    .sort((x, y) => y[1] - x[1])
    .slice(0, 9)
    .map(([l, b], i): Film => {
      const repos = where.get(l)!;
      const kb = Math.round(b / 1024).toLocaleString("en-GB");
      return {
        kind: "skill",
        id: `lang-${l.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        cat: `LN ${String(i + 1).padStart(2, "0")}`,
        title: l === "PLpgSQL" ? "SQL" : l,
        edition: `${kb} KB · ${repos.length} ${repos.length === 1 ? "repo" : "repos"}`,
        year: GH.taken.slice(0, 4),
        logline: `${kb} KB of ${l} across ${repos.length} public ${repos.length === 1 ? "repository" : "repositories"}, as GitHub counted it on ${GH.taken}.`,
        chapters: repos.map((n) => ({ label: n, href: gh(n) })),
        features: [`Counted by GitHub's linguist on ${GH.taken}`],
        href: gh(repos[0]),
        shell: b > 1_000_000 ? "steel" : b > 200_000 ? "smoke" : "clear",
        tone: LANG_TONE[l] ?? "#9aa1ab",
      };
    });
  return { id: "languages", label: "Languages", note: "Bytes of code on GitHub, largest first.", items };
}

type SkillDef = { title: string; match: RegExp; tone: string };

const SKILL_SHELVES: { id: string; label: string; note: string; skills: SkillDef[] }[] = [
  {
    id: "interfaces",
    label: "Interfaces & apps",
    note: "Web, desktop and phone.",
    skills: [
      { title: "Next.js", match: /^Next\.js/, tone: "#e9ecf1" },
      { title: "React", match: /^React/, tone: "#7fd8f2" },
      { title: "Flutter", match: /^Flutter/, tone: "#5aa9f0" },
      { title: "Tauri", match: /^Tauri/, tone: "#f2b544" },
      { title: "Tailwind CSS", match: /^Tailwind/, tone: "#58c4c8" },
      { title: "Expo", match: /^Expo$/, tone: "#cfd3da" },
      { title: "GSAP", match: /^GSAP$/, tone: "#8ad04a" },
    ],
  },
  {
    id: "data",
    label: "Data & systems",
    note: "Where the money and the state live.",
    skills: [
      { title: "PostgreSQL", match: /^PostgreSQL$/, tone: "#4f7cb8" },
      { title: "Supabase", match: /^Supabase$/, tone: "#3ecf8e" },
      { title: "SQLite", match: /^SQLite$/, tone: "#8fb4d8" },
      { title: "Drizzle ORM", match: /^Drizzle/, tone: "#c5f74f" },
      { title: "Node.js", match: /^Node\.js$/, tone: "#6aa56a" },
      { title: "Docker", match: /^Docker$/, tone: "#3d8fe0" },
      { title: "libmpv", match: /^libmpv$/, tone: "#7e6bb8" },
    ],
  },
  {
    id: "craft",
    label: "Craft & tooling",
    note: "Parsers, language servers, and the tests that keep it honest.",
    skills: [
      { title: "Tree-sitter", match: /^Tree-sitter$/, tone: "#b9a27a" },
      { title: "Language servers", match: /^(LSP|VS Code API)$/, tone: "#3c8de0" },
      { title: "Vitest", match: /^Vitest$/, tone: "#a7d44c" },
      { title: "Playwright", match: /^Playwright$/, tone: "#d65a4a" },
      { title: "Razorpay", match: /^Razorpay$/, tone: "#3a5bd9" },
    ],
  },
  {
    id: "science",
    label: "Science",
    note: "Chemistry, models and docking.",
    skills: [
      { title: "RDKit", match: /^RDKit$/, tone: "#7fb6a8" },
      { title: "scikit-learn", match: /^scikit-learn$/, tone: "#f0a04a" },
      { title: "AutoDock Vina", match: /^AutoDock Vina$/, tone: "#5c8f9a" },
    ],
  },
];

function skill(d: SkillDef, n: number): Film {
  const on = FILINGS.filter((f) => f.stack.some((s) => d.match.test(s)));
  return {
    kind: "skill",
    id: `skill-${d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    cat: `SK ${String(n).padStart(3, "0")}`,
    title: d.title,
    edition: on.length === 1 ? "On 1 release" : `On ${on.length} releases`,
    year: "2026",
    logline: `Used on ${on.map((f) => f.title).join(", ")}.`,
    chapters: on.map((f) => ({ label: f.title, href: `/work/${f.slug}` })),
    features: on.map((f) => f.short).slice(0, 2),
    href: on[0] ? `/work/${on[0].slug}` : "/#records",
    internal: true,
    shell: on.length > 3 ? "steel" : on.length > 1 ? "smoke" : "clear",
    tone: d.tone,
  };
}

let sk = 0;
/** Skill shelves, in the order you pass them. */
export const SHELVES: Shelf[] = [
  languageShelf(),
  ...SKILL_SHELVES.map((sh) => ({ id: sh.id, label: sh.label, note: sh.note, items: sh.skills.map((d) => skill(d, ++sk)).filter((x) => x.chapters.length) })),
];

const STUDIO = /^(snowbros|creative-engineering|mentor|homebrew-tap)$/;
/** The film shelves proper: the studio and the experiments. */
export const FILM_SHELVES: Shelf[] = [
  { id: "studio", label: "The studio", note: "SNOWBROS and the tools it publishes.", items: FILMS.filter((f) => STUDIO.test(f.id)) },
  { id: "experiments", label: "Experiments & B-sides", note: "Shipped to learn something. Still on GitHub.", items: FILMS.filter((f) => !STUDIO.test(f.id)) },
];

export const ROOM_ITEMS: Film[] = [...FILM_SHELVES, ...SHELVES].flatMap((s) => s.items);

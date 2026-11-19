/**
 * The editorial layer. Every fact still comes from `work.ts` and `site.ts`; this file decides
 * order, headlines, credits, limits and where each claim came from. Nothing here is new evidence.
 */
import { DISCOGRAPHY, EDUCATION, HONORS, NOW, ROLES, SITE } from "./site";
import { ARCHIVE, FILINGS, getFiling, type Filing, type Img } from "./work";

export const STATUS = "Open to software engineering internships and entry-level full-stack roles. Taking select freelance work through SNOWBROS.";
/** The date STATUS and NOW were last confirmed. Shown next to them, always. */
export const CONFIRMED = NOW.updated;

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** How a project is told: its headline, the people involved, when, and what it can't claim. */
export type Story = {
  slug: string;
  headline: string;
  /** One plain-language line for the caption under the image. */
  benefit: string;
  category: string;
  /** Initials or a glyph for the small identity tile, and its colours. */
  mark: { text: string; bg: string; ink: string };
  team: string[];
  period: string;
  limits: string[];
  source: string;
};

export const STORIES: Record<string, Story> = {
  "amr-drug-repurposing": {
    slug: "amr-drug-repurposing",
    headline: "Making a complex research workflow traceable",
    benefit: "A screening pipeline where every score can be traced back to the run that produced it.",
    category: "Research software · Scientific computing",
    mark: { text: "AMR", bg: "#E3EAE6", ink: "#1F4A3C" },
    team: ["Ved Chauhan, software co-lead", "Yash Prajapati, software co-lead", "Pharmacy department, Shree S. K. Patel College (client)"],
    period: "2026 · client project through SNOWBROS",
    limits: [
      "A research prototype. Docking scores and model probabilities are leads for a laboratory, not clinical evidence, and nothing here says a medicine treats an infection.",
      "7,044 is the size of the docking campaign, 1,761 medicines against 4 targets. It is not a count of validated hits.",
      "Whether any candidate holds up is a question for wet-lab work, which sits outside this software.",
    ],
    source: "Counts from the project repository and its live overview, as of October 2026.",
  },
  nova: {
    slug: "nova",
    headline: "A quieter way to play your own media",
    benefit: "A desktop player that only shows what the playback engine has actually confirmed.",
    category: "Desktop software · Media",
    mark: { text: "N", bg: "#17181B", ink: "#E9ECF2" },
    team: ["Ved Chauhan, sole developer"],
    period: "Released Oct 2026 · v0.3.0",
    limits: [
      "Windows x64 was tested on one Windows 11 machine. Android is still a pre-release.",
      "The first installer bundles a libmpv build with GPL parts, so it ships under the GPL with its source. Later releases move to an LGPL engine built from source.",
    ],
    source: "Compatibility and seeking figures from NOVA's own test harness, recorded in the repository.",
  },
  "snowbros-atlas": {
    slug: "snowbros-atlas",
    headline: "Making problems between files visible",
    benefit: "Static analysis for the bugs that live between files, reported only when it can prove them.",
    category: "Developer tools · Open source",
    mark: { text: "At", bg: "#EDE6DA", ink: "#3D3322" },
    team: ["Ved Chauhan, author"],
    period: "First release Jul 2026 · v0.4",
    limits: [
      "JavaScript, TypeScript and Python only.",
      "Anything the resolver cannot prove is reported as unresolved instead of guessed, so some real problems stay unreported by design.",
      "Timings come from the README's own runs on axios (431 files) and a 500-file repository. Your machine will differ.",
    ],
    source: "Rules, timings and test counts from the Atlas README, v0.4.",
  },
  "stc-academy": {
    slug: "stc-academy",
    headline: "Bringing an academy's daily work into one place",
    benefit: "One site for parents to understand the courses, and one place for staff to run the day.",
    category: "Education · Web platform",
    mark: { text: "STC", bg: "#F3EFE2", ink: "#6B5A12" },
    team: ["Ved Chauhan, sole developer and system architect"],
    period: "Mar 2026 · live",
    limits: [
      "Only the public site is pictured. The admin command center holds real students' records, so it stays off this page.",
      "Usage figures are the academy's own and are not repeated here.",
    ],
    source: "Features from the repository and the live site, stc.vercel.app.",
  },
  "vinnys-atelier": {
    slug: "vinnys-atelier",
    headline: "A shop counter that keeps selling when the internet doesn't",
    benefit: "The keyboard-first till a working boutique bills on, online or off.",
    category: "Retail · Point of sale",
    mark: { text: "VA", bg: "#EFE4D2", ink: "#4A3315" },
    team: ["Ved Chauhan, sole developer", "Vinny's Fashion Hub (client, through SNOWBROS)"],
    period: "In daily use since Aug 2026",
    limits: [
      "The repository is private, so the evidence here is screenshots and the shop's own daily use, not public source.",
      "No sales figures are shown. They belong to the shop.",
    ],
    source: "Test counts and schema size from the project's CI and migrations, Aug 2026.",
  },
  accounic: {
    slug: "accounic",
    headline: "Letting the database decide who owes whom",
    benefit: "A multi-currency ledger where no app ever adds up a balance on its own.",
    category: "Finance · Cross-platform",
    mark: { text: "Ac", bg: "#E2EBDF", ink: "#0F3D2A" },
    team: ["Ved Chauhan, sole developer"],
    period: "2026 · v1.16.1",
    limits: [
      "The 82× speed-up is one benchmark workspace of 20,230 transactions on one machine.",
      "A real counterparty's name is redacted in the screenshots. It is their data.",
    ],
    source: "Benchmarks, workflows and the accounting model from the Accounic README.",
  },
  swiftdrop: {
    slug: "swiftdrop",
    headline: "Moving files across the room, not around the internet",
    benefit: "Phone to PC over your own Wi-Fi, verified block by block and resumable.",
    category: "Networking · Cross-platform",
    mark: { text: "SD", bg: "#F6E1DC", ink: "#7A1F12" },
    team: ["Ved Chauhan, sole developer"],
    period: "Oct 2026 · v1.1.0",
    limits: [
      "MB/s figures are loopback, the software's ceiling. On a real network the Wi-Fi radio is the limit.",
      "iPhone joins through the browser by QR. There is no native iOS app.",
    ],
    source: "Benchmarks committed as JSON in the repository's architecture record.",
  },
  "vinnys-vogue": {
    slug: "vinnys-vogue",
    headline: "A storefront organised the way weddings are",
    benefit: "Bridal and festive couture, browsed by occasion and run by the boutique itself.",
    category: "E-commerce",
    mark: { text: "VV", bg: "#F1E3E6", ink: "#5B1328" },
    team: ["Ved Chauhan, sole developer"],
    period: "Feb 2026 · live",
    limits: ["No traffic or sales figures are shown. They belong to the boutique."],
    source: "Features from the repository and the live store, vinnysvogue.in.",
  },
  "ved-exe": {
    slug: "ved-exe",
    headline: "Five portfolios later, a quiet one",
    benefit: "The site you're on, rebuilt so the work does the talking.",
    category: "Interface",
    mark: { text: "V", bg: "#F2F2EF", ink: "#242422" },
    team: ["Ved Chauhan, design and development"],
    period: "Nov 2026",
    limits: ["Project figures are as reported by each project's README or live product, dated where shown."],
    source: "This repository.",
  },
};

export function storyOf(slug: string): Story {
  const s = STORIES[slug];
  if (!s) throw new Error(`No story for ${slug}`);
  return s;
}

/** The four told on the homepage, in narrative order. */
export const SELECTED = ["amr-drug-repurposing", "nova", "snowbros-atlas", "stc-academy"] as const;
/** The pair that gives the page its one change of rhythm. */
export const PAIRED = ["vinnys-atelier", "accounic"] as const;
/** Case-study reading order, which also decides "next project". */
export const READING_ORDER = [...SELECTED, ...PAIRED, "swiftdrop", "vinnys-vogue", "ved-exe"];

export function nextAfter(slug: string) {
  const i = READING_ORDER.indexOf(slug);
  return getFiling(READING_ORDER[(i + 1) % READING_ORDER.length])!;
}

export function linksOf(f: Filing) {
  return {
    live: f.links.filter((l) => !l.href.includes("github.com")),
    source: f.links.filter((l) => l.href.includes("github.com")),
  };
}

/** The filings were written as patent claims; read them as plain sentences. */
export function plain(claim: string) {
  const s = claim.replace(/^The [\w-]+ of claim \d+, (wherein |further comprising )/, (_, how: string) => (how.startsWith("further") ? "It has " : ""));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* --------------------------------------------------------------------------- photos */

export type Photo = Img & { caption: string };

/** Real photographs only. Nothing staged for the site. */
export const PHOTOS = {
  portrait: {
    src: "/me/ved-portrait.webp",
    w: 960,
    h: 1280,
    alt: "Ved in a cream sweater, sitting in the back of a car with a hand at his ear, looking out of the window.",
    caption: "Ved S. Chauhan.",
  },
  dunes: {
    src: "/me/ved-dunes.webp",
    w: 960,
    h: 1280,
    alt: "Ved, seen from behind in a striped shirt, walking over rippled sand dunes towards an orange sunset.",
    caption: "Sunset on the dunes.",
  },
  dubai: {
    src: "/me/ved-dubai.webp",
    w: 1440,
    h: 1080,
    alt: "Ved in glasses and a grey sweatshirt at dusk in front of Dubai's Museum of the Future, its steel ring covered in Arabic calligraphy.",
    caption: "Dubai, in front of the Museum of the Future.",
  },
  window: {
    src: "/me/ved-window.webp",
    w: 1440,
    h: 1080,
    alt: "Ved in glasses, looking out of a car window in bright sunlight.",
    caption: "Looking out of the window.",
  },
  letter: {
    src: "/album/02-amr-letter-handed-over.webp",
    w: 960,
    h: 1280,
    alt: "Two students in university lanyards, Ved one of them, receiving letters of appreciation from two faculty members in front of the Ganpat University pharmacy college sign.",
    caption: "The AMR letters of appreciation being handed over at Shree S. K. Patel College, October 2026.",
  },
  conclave: {
    src: "/album/01-research-conclave-2026-on-stage.webp",
    w: 480,
    h: 333,
    alt: "Three frames of Ved on stage at Research Conclave 2026, accepting a first-rank trophy.",
    caption: "First rank at Research Conclave 2026, Ganpat University, for AI human activity recognition.",
  },
  bench: {
    src: "/album/03-arduino-edge-ai-bootcamp-bench.webp",
    w: 480,
    h: 320,
    alt: "Laptops on a lab bench running a gesture classifier, with an Arduino UNO Q board wired beside the keyboard.",
    caption: "Arduino Edge AI Bootcamp: an IMU gesture classifier running on the UNO Q.",
  },
  trophy: {
    src: "/awards/research-conclave-2026-2.webp",
    w: 1400,
    h: 1050,
    alt: "The Research Conclave 2026 certificate naming Ved Sureshbhai Chauhan as first prize winner, beside the first-rank trophy.",
    caption: "The certificate and the trophy.",
  },
} satisfies Record<string, Photo>;

/* --------------------------------------------------------------------------- experiments */

export type Experiment = {
  id: string;
  title: string;
  context: string;
  detail: string;
  role: string;
  href?: string;
  internal?: boolean;
  img?: Img;
  /** For builds without a screenshot: the repository path, set as type. */
  repo?: string;
  tone?: string;
};

export const EXPERIMENTS: Experiment[] = [
  {
    id: "snowbros",
    title: "SNOWBROS",
    context: "Studio site",
    detail: "The studio's own site. The name forms out of frost crystals above the line “Software that holds its shape.” Vite, TypeScript, canvas and GSAP.",
    role: "Design and development",
    href: "https://snowbros.me",
    img: { src: "/work/snowbros-home.webp", alt: "The SNOWBROS studio site: the name formed from frost crystals above the headline 'Software that holds its shape.'", w: 1440, h: 900 },
  },
  {
    id: "edge-ai",
    title: "Gestures on a microcontroller",
    context: "Arduino Edge AI Bootcamp",
    detail: "An IMU gesture classifier running on the Arduino UNO Q, watched for prediction confidence and inference latency.",
    role: "Bootcamp build",
    img: { src: PHOTOS.bench.src, alt: PHOTOS.bench.alt, w: PHOTOS.bench.w, h: PHOTOS.bench.h },
  },
  {
    id: "mentor",
    title: "Mentor",
    context: "Open-source AI skill, MIT",
    detail: "An orchestration skill for Claude Code that routes a task across ten capability modules, with a teach mode and a build mode.",
    role: "Author",
    href: "https://github.com/snowbros-labs/mentor-skill",
    repo: "snowbros-labs/mentor-skill",
    tone: "#E8E6F3",
  },
  {
    id: "lunora",
    title: "Lunora Studio",
    context: "Storefront for handmade bouquets",
    detail: "A small e-commerce site for a bouquet studio: “Flowers Fade. Memories Don't.” Next.js, Supabase, GSAP and shadcn/ui.",
    role: "Sole developer",
    href: "https://lunorastudio.vercel.app",
    img: { src: "/work/lunora-home.webp", alt: "Lunora Studio: 'Flowers Fade. Memories Don't.'", w: 1440, h: 900 },
  },
  {
    id: "cipher-clash",
    title: "Cipher Clash",
    context: "Realtime multiplayer game",
    detail: "A guessing game for phones, with rooms synced over Supabase Realtime. Expo, Zustand and a Turborepo monorepo.",
    role: "Sole developer",
    href: "https://github.com/VED2107/guesser",
    repo: "VED2107/guesser",
    tone: "#F4E6D8",
  },
  {
    id: "vogue",
    title: "Shop by occasion",
    context: "Vinny's Vogue catalogue",
    detail: "Collections arranged like a wedding: bridal, festive, haldi, reception, mehendi and sangeet.",
    role: "Sole developer",
    href: "/work/vinnys-vogue",
    internal: true,
    img: { src: "/work/vogue-scroll.webp", alt: "Collections by occasion and the Festive Grace collection.", w: 1440, h: 900 },
  },
  {
    id: "creative-engineering",
    title: "Creative Engineering",
    context: "Motion toolkit and AI skill",
    detail: "A TypeScript toolkit for scroll choreography and interactive 3D, packaged with a skill that teaches an agent to use it.",
    role: "Author",
    href: "https://github.com/snowbros-labs/creative-engineering",
    repo: "snowbros-labs/creative-engineering",
    tone: "#E1ECEA",
  },
  {
    id: "swiftdrop-site",
    title: "SwiftDrop's front door",
    context: "Product site",
    detail: "The download page for SwiftDrop, with the product's own transfer console as the hero.",
    role: "Design and development",
    href: "/work/swiftdrop",
    internal: true,
    img: { src: "/work/swiftdrop-site.webp", alt: "The SwiftDrop website: 'Send anything. Directly.' beside a transfer console.", w: 1440, h: 900 },
  },
  {
    id: "filmica",
    title: "Filmica",
    context: "Camera app with shader effects",
    detail: "A Flutter camera app whose film looks are GLSL shaders, with Supabase and Firebase behind it.",
    role: "Sole developer",
    href: "https://github.com/VED2107/filmica",
    repo: "VED2107/filmica",
    tone: "#EDE3EE",
  },
];

/* --------------------------------------------------------------------------- principles */

/** Three working habits, each tied to a decision you can read in full. */
export const PRINCIPLES = [
  {
    title: "Own the whole workflow",
    body: "From the schema to the signed installer. Vinny's Atelier runs from a PostgreSQL schema to a Windows till that keeps billing offline.",
    href: "/work/vinnys-atelier#a-till-that-keeps-selling-offline",
    link: "The offline till",
  },
  {
    title: "Make the important decisions explicit",
    body: "If a number could be misread, the code refuses it. In the AMR platform, labels that imply clinical benefit raise an error.",
    href: "/work/amr-drug-repurposing#a-percentage-always-says-what-it-means",
    link: "A percentage always says what it means",
  },
  {
    title: "Test what can break",
    body: "Atlas proves its cache can only save time: a warm run must be byte-identical to a cold one, or the tests fail.",
    href: "/work/snowbros-atlas#a-cache-that-cannot-change-the-answer",
    link: "A cache that cannot change the answer",
  },
];

export const ABOUT = {
  statement: "I started SNOWBROS to get production experience on my own terms: real clients, real data, real consequences when something breaks.",
  body: [
    "I ship production systems end to end: relational data models, typed APIs, React frontends, native binaries, and the CI that releases them. Most of it is full-stack TypeScript, Next.js and React in front, Node.js and PostgreSQL behind. Some of it is Rust, because a few problems deserve a compiler rather than a script.",
    "Now I want to bring that into a larger engineering team. I ship, I write tests, and I care about the parts that show up six months later.",
  ],
  principle: "Same input in, same result out. Accuracy over quantity.",
};

export { ARCHIVE, DISCOGRAPHY, EDUCATION, FILINGS, HONORS, NOW, ROLES, SITE, getFiling };
export type { Filing };

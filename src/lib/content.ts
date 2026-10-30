/**
 * One content source for both ways of visiting: the store and Quick View read the same records,
 * skills, releases and contact details from here. Every fact comes from `work.ts` and `site.ts`;
 * this file only arranges them.
 */
import { DISCOGRAPHY, EDUCATION, HONORS, NOW, ROLES, SITE, SKILLS } from "./site";
import { ALSO, ARCHIVE, FEATURED, FILINGS, getFiling, type Filing } from "./work";

export const STATUS = "Open to software engineering internships and entry-level full-stack roles. Taking select freelance work through SNOWBROS.";

/** The six records that face out on the wall, in the order the site has always led with. */
export const WALL = FEATURED.map((f) => f.slug);
/** The rest, in the browse crate. */
export const CRATE = [...ALSO, "ved-exe"];
export const ALL_RECORDS = [...WALL, ...CRATE];

export function proofOf(slug: string) {
  const f = getFiling(slug);
  const k = FEATURED.find((x) => x.slug === slug)?.proof ?? 0;
  return f?.facts[k];
}

export function linksOf(f: Filing) {
  const clean = f.links.filter((l) => !l.href.includes("snowbros.me/#"));
  return {
    live: clean.find((l) => !l.href.includes("github.com")),
    source: clean.find((l) => l.href.includes("github.com")),
    all: clean,
  };
}

/** Side A takes the first half of the decisions, side B the rest, like a real LP. */
export function trackNo(i: number, total: number) {
  const half = Math.ceil(total / 2);
  return i < half ? `A${i + 1}` : `B${i - half + 1}`;
}

/** Each tool, and the records it played on. Counted from the projects' own stacks. */
export function credits() {
  const norm = (s: string) => s.replace(/\s+\d[\d.]*$/, "").replace(/^Tailwind( CSS)?$/, "Tailwind CSS").trim();
  const map = new Map<string, string[]>();
  for (const f of FILINGS) {
    if (f.slug === "ved-exe") continue;
    for (const s of new Set(f.stack.map(norm))) map.set(s, [...(map.get(s) ?? []), f.slug]);
  }
  return map;
}

/** The studio's racks: the résumé's skill groups, each tool tagged with the records that used it. */
export function studio() {
  const used = credits();
  const norm = (s: string) => s.replace(/\s+\d[\d.]*$/, "").replace(/ App Router$/, "").replace(/^Tailwind( CSS)?$/, "Tailwind CSS").replace(/^three\.js$/, "three.js").trim();
  return SKILLS.map((g) => ({
    group: g.group,
    items: g.items.map((name) => {
      const hit = [...used.entries()].find(([k]) => k.toLowerCase() === norm(name).toLowerCase());
      return { name, records: hit ? hit[1] : [] };
    }),
  }));
}

export const ABOUT = {
  statement: "I started SNOWBROS to get production experience on my own terms: real clients, real data, real consequences when something breaks.",
  body: [
    "I ship production systems end to end: relational data models, typed APIs, React frontends, native binaries, and the CI that releases them. Most of it is full-stack TypeScript, Next.js and React in front, Node.js and PostgreSQL behind. Some of it is Rust, because a few problems deserve a compiler rather than a script.",
    "Now I want to bring that into a larger engineering team. I ship, I write tests, and I care about the parts that show up six months later.",
  ],
  rules: [
    ["One source of truth.", "Balances, stock and payments are decided in one place, usually the database, never by each client."],
    ["Tests before release.", "268 tests and Playwright gate the boutique till. Atlas ships with more than 340."],
    ["No claim I can't measure.", "Every number in this shop traces back to a README, a benchmark or a live product."],
  ] as [string, string][],
  principle: "Same input in, same result out. Accuracy over quantity.",
};

export { ARCHIVE, DISCOGRAPHY, EDUCATION, FILINGS, HONORS, NOW, ROLES, SITE, SKILLS, getFiling };
export type { Filing };

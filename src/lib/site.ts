export const SITE = {
  name: "VED.EXE",
  person: "Ved S. Chauhan",
  studio: "SNOWBROS",
  url: "https://ved.exe.snowbros.me",
  email: "vedchauhan2107@gmail.com",
  github: "https://github.com/VED2107",
  githubHandle: "VED2107",
  linkedin: "https://www.linkedin.com/in/ved-chauhan2107/",
  studioUrl: "https://snowbros.me",
  resume: "/Ved_Chauhan_RESUME.pdf",
} as const;

/** The home page is a filing; each section is a sheet. Order = reading order. */
export const SHEETS = [
  { id: "cover", label: "Cover" },
  { id: "filings", label: "Filings" },
  { id: "archive", label: "Other filings" },
  { id: "claims", label: "Claims" },
  { id: "field", label: "Field" },
  { id: "status", label: "Status" },
  { id: "correspondence", label: "Correspondence" },
] as const;

export type SheetId = (typeof SHEETS)[number]["id"];

/** NOW. Edit this block when the work changes; `updated` is shown on the page. */
export const NOW = {
  updated: "2026-09-30",
  rows: [
    {
      verb: "Building",
      what: "Snowbros Atlas",
      detail: "Growing the shared IR past JavaScript, TypeScript and Python.",
      href: "/work/snowbros-atlas",
    },
    {
      verb: "Exploring",
      what: "AI developer tooling",
      detail: "Mentor, an engineering orchestrator skill for Claude Code.",
      href: "https://github.com/snowbros-labs/mentor-skill",
    },
    {
      verb: "Learning",
      what: "Systems programming",
      detail: "Rust, parsers, language servers, incremental caches.",
    },
    {
      verb: "Studying",
      what: "B.Tech Computer Engineering",
      detail: "U.V. Patel College of Engineering. Graduating May 2028.",
    },
    {
      verb: "Running",
      what: "SNOWBROS",
      detail: "An independent software studio, since February 2026. Client work and open source.",
      href: "https://snowbros.me",
    },
  ],
} as const;

/** How he works, written as claims. Each one is backed by a filing. */
export const CLAIMS: { text: string; dependsOn?: number; evidence: string[] }[] = [
  {
    text: "Software whose output is a pure function of its input. Same code in, same result out.",
    evidence: ["snowbros-atlas"],
  },
  {
    text: "wherein money is an integer, never a float, from the database to the receipt.",
    dependsOn: 1,
    evidence: ["accounic", "vinnys-atelier"],
  },
  {
    text: "wherein the database decides and every client only displays what it decided.",
    dependsOn: 1,
    evidence: ["accounic"],
  },
  {
    text: "A finding is reported only with the evidence that proves it. What cannot be proven is labelled unresolved.",
    evidence: ["snowbros-atlas"],
  },
  {
    text: "An interface that respects the keyboard as much as the pointer.",
    evidence: ["vinnys-atelier", "ved-exe"],
  },
  {
    text: "Shipping is the start: CI on every push, releases a person approves, and apps that update themselves.",
    evidence: ["accounic", "snowbros-atlas"],
  },
  {
    text: "wherein the visual design is part of the specification, not a coat of paint.",
    dependsOn: 5,
    evidence: ["vinnys-vogue", "ved-exe"],
  },
];

/** Capability x filing chart. Every mark is backed by the named filing's stack. */
export const CAPABILITIES: { name: string; tools: string; filings: string[] }[] = [
  {
    name: "Product engineering",
    tools: "React, Next.js, TypeScript, Tailwind",
    filings: ["accounic", "vinnys-atelier", "vinnys-vogue", "stc-academy", "ved-exe"],
  },
  {
    name: "Data and backend",
    tools: "PostgreSQL, Supabase, RLS, RPCs, Drizzle",
    filings: ["accounic", "vinnys-atelier", "vinnys-vogue", "stc-academy"],
  },
  {
    name: "Systems and tooling",
    tools: "Rust, Tree-sitter, LSP, VS Code API",
    filings: ["snowbros-atlas"],
  },
  {
    name: "Cross-platform",
    tools: "Flutter, Tauri 2, Android, Windows",
    filings: ["accounic", "vinnys-atelier"],
  },
  {
    name: "Payments and money",
    tools: "Razorpay UPI, multi-currency, integer money",
    filings: ["accounic", "vinnys-atelier"],
  },
  {
    name: "Delivery",
    tools: "GitHub Actions, Playwright, SARIF, release pipelines",
    filings: ["snowbros-atlas", "accounic", "vinnys-atelier"],
  },
  {
    name: "Interface and motion",
    tools: "Design systems, typography, View Transitions",
    filings: ["vinnys-atelier", "vinnys-vogue", "ved-exe"],
  },
];

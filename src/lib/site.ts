export const SITE = {
  name: "Ved Chauhan",
  person: "Ved S. Chauhan",
  studio: "SNOWBROS",
  url: "https://ved.exe.snowbros.me",
  email: "vedchauhan2107@gmail.com",
  github: "https://github.com/VED2107",
  githubHandle: "VED2107",
  linkedin: "https://www.linkedin.com/in/ved-chauhan2107/",
  studioUrl: "https://snowbros.me",
  resume: "/Ved_Chauhan_RESUME.pdf",
  location: "Patan, Gujarat, India",
} as const;

/** NOW. Edit this block when the work changes; `updated` is shown on the page. */
export type NowRow = { verb: string; what: string; detail: string; href?: string };

export const NOW: { updated: string; rows: NowRow[] } = {
  updated: "2026-10-25",
  rows: [
    {
      verb: "Shipping",
      what: "NOVA 0.3.0",
      detail: "The Windows player, now on Android as a pre-release that updates itself.",
      href: "/work/nova",
    },
    {
      verb: "Building",
      what: "Snowbros Atlas",
      detail: "Growing the shared IR past JavaScript, TypeScript and Python.",
      href: "/work/snowbros-atlas",
    },
    {
      verb: "Running",
      what: "AMR docking campaign",
      detail: "7,044 AutoDock Vina jobs for a client, from a Postgres queue.",
      href: "/work/amr-drug-repurposing",
    },
    {
      verb: "Learning",
      what: "Systems and edge AI",
      detail: "Rust, parsers, language servers, and ML on microcontrollers.",
    },
  ],
};

/** Taken from the LinkedIn profile and posts. Dates are as published there. */
export type Honor = { title: string; by: string; when: string; detail: string; href?: string };

export const HONORS: Honor[] = [
  {
    title: "1st Rank, Research Conclave 2026",
    by: "Ganpat University",
    when: "Oct 2026",
    detail:
      "Emerging Researchers, Engineering & Technology (Non-Core) track, for “AI Human Activity Recognition for On-board BAS Experiments”. Next stop: a research event in Mumbai.",
  },
  {
    title: "Letter of Appreciation",
    by: "Shree S. K. Patel College of Pharmaceutical Education & Research",
    when: "Oct 2026",
    detail:
      "For the AMR Drug Repurposing platform, built with Yash Prajapati: the software behind the pharmacy department's computational screening research.",
    href: "/work/amr-drug-repurposing",
  },
  {
    title: "Arduino Edge AI Bootcamp",
    by: "Arduino",
    when: "Oct 2026",
    detail: "An IMU gesture classifier running on the Arduino UNO Q, watched for prediction confidence and inference latency.",
  },
  {
    title: "Solutions Architecture and Data Analytics job simulations",
    by: "AWS and Deloitte Australia",
    when: "Forage",
    detail: "Two virtual job simulations, completed and certified on Forage.",
  },
];

export const ROLES: { role: string; org: string; when?: string; href?: string }[] = [
  { role: "Founder & software engineer", org: "SNOWBROS", when: "Feb 2026 to now", href: "https://snowbros.me" },
  { role: "Student member", org: "IEEE GUNI Student Branch", when: "Jul 2024 to now" },
];

export const EDUCATION = {
  school: "U.V. Patel College of Engineering, Ganpat University",
  degree: "B.Tech, Computer Engineering",
  when: "2024 to 2028",
  coursework: "Data structures and algorithms, operating systems, database systems, software engineering, design and analysis of algorithms.",
} as const;

/** The discography: when each record came out, from the résumé. Oldest first. */
export const DISCOGRAPHY: { when: string; title: string; what: string; slug?: string; href?: string }[] = [
  { when: "Feb 2026", title: "SNOWBROS", what: "Founded the studio", href: "https://snowbros.me" },
  { when: "Feb 2026", title: "Vinny's Vogue", what: "Storefront for a bridal boutique", slug: "vinnys-vogue" },
  { when: "Mar 2026", title: "STC Academy", what: "Academy portal for 100+ people", slug: "stc-academy" },
  { when: "Jun 2026", title: "VED.EXE", what: "The terminal-era portfolio", slug: "ved-exe" },
  { when: "Jul 2026", title: "Mentor", what: "Open-source AI orchestration skill", href: "https://github.com/snowbros-labs/mentor-skill" },
  { when: "Jul 2026", title: "Snowbros Atlas", what: "Rust static analysis, on npm and crates.io", slug: "snowbros-atlas" },
  { when: "Aug 2026", title: "Vinny's Atelier", what: "The till a boutique runs on", slug: "vinnys-atelier" },
  { when: "2026", title: "Accounic", what: "Multi-currency ledger, v1.16", slug: "accounic" },
  { when: "Oct 2026", title: "SwiftDrop", what: "Phone to PC over Wi-Fi, v1.1.0", slug: "swiftdrop" },
  { when: "Oct 2026", title: "AMR Drug Repurposing", what: "7,044 docking jobs, a college's thanks", slug: "amr-drug-repurposing" },
  { when: "Oct 2026", title: "NOVA", what: "Media player, Windows and Android", slug: "nova" },
];

/** Skills as the résumé groups them. */
export const SKILLS: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["TypeScript", "JavaScript", "Rust", "SQL", "Python", "Dart"] },
  { group: "Frontend", items: ["React 19", "Next.js App Router", "Tailwind CSS", "Radix UI", "TanStack Query", "Zustand", "GSAP", "three.js"] },
  { group: "Backend & data", items: ["Node.js", "REST APIs", "Server Actions", "PostgreSQL", "SQLite", "Drizzle ORM", "Supabase", "Row-Level Security", "HMAC webhooks", "Razorpay UPI", "Offline sync"] },
  { group: "Systems & tooling", items: ["Tree-sitter", "Static analysis", "Import graphs", "LSP", "Tauri", "CLI design", "SARIF", "Incremental caching"] },
  { group: "Testing & DevOps", items: ["Vitest", "Playwright", "GitHub Actions", "Release pipelines", "npm & crates.io publishing", "Docker", "Vercel"] },
];

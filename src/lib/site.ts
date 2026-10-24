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

/** NOW. Edit this block when the work changes; `updated` is shown on the page. */
export type NowRow = { verb: string; what: string; detail: string; href?: string };

export const NOW: { updated: string; rows: NowRow[] } = {
  updated: "2026-10-09",
  rows: [
    {
      verb: "Building",
      what: "Snowbros Atlas",
      detail: "Growing the shared IR past JavaScript, TypeScript and Python.",
      href: "/work/snowbros-atlas",
    },
    {
      verb: "Shipping",
      what: "SwiftDrop",
      detail: "Phone-to-PC file transfer over local Wi-Fi. v1.1.0 for Windows and Android.",
      href: "/work/swiftdrop",
    },
    {
      verb: "Running",
      what: "AMR docking campaign",
      detail: "7,044 AutoDock Vina jobs for a client, from a Postgres queue.",
      href: "/work/amr-drug-repurposing",
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
};

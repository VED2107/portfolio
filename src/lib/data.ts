export const SITE = {
  name: "VED.EXE",
  title: "Ved Chauhan",
  roles: ["Full Stack Developer", "UI/UX Designer", "Creative Technologist"],
  email: "vedchauhan2107@gmail.com",
  github: "https://github.com/VED2107",
  linkedin: "https://www.linkedin.com/in/ved-chauhan2107/",
  instagram: "https://www.instagram.com/_v_e_d_2107",
  resume: "/Ved_Chauhan_RESUME.pdf",
} as const;

export const BOOT_SEQUENCE = [
  { text: "INITIALIZING VED.EXE...", delay: 0 },
  { text: "Loading developer modules...", delay: 400 },
  { text: "Mounting project database...", delay: 800 },
  { text: "Compiling creativity engine...", delay: 1200 },
  { text: "Injecting caffeine dependency...", delay: 1600 },
  { text: "Scanning for bugs...", delay: 2000 },
  { text: "> bugs found: 42", delay: 2300 },
  { text: "> bugs successfully deployed to production", delay: 2600 },
  { text: "Loading UI pixels...", delay: 3000 },
  { text: "System Ready.", delay: 3400 },
  { text: "", delay: 3800 },
];

export interface Project {
  title: string;
  description: string;
  longDescription: string;
  tech: string[];
  github?: string;
  live?: string;
  category: "fullstack" | "mobile" | "game" | "tool" | "ai";
  featured: boolean;
  image?: string;
  screenshots?: { label: string; src: string }[];
}

export const PROJECTS: Project[] = [
  {
    title: "Snowbros Atlas",
    description: "Deterministic multi-language static-analysis engine, in Rust",
    longDescription:
      "A deterministic engineering-intelligence platform for JavaScript, TypeScript, React, Next.js, and Python — written in Rust. As of v0.4.0 it is multi-language by architecture: every language lowers into one shared semantic IR, and a rule is either language-agnostic or scoped to a language family in one place — never an `if language ==` branch inside a detector. Tree-sitter frontends feed a semantic engine that builds whole-project symbol, import, and file graphs plus Next.js and React models, then reports problems it can prove — circular imports, dead files, server/client boundary leaks, React hook misuse, unused deps, hardcoded secrets, and the cross-language large-function rule — each with an evidence chain. Validated by dogfooding FastAPI with zero Python-specific false positives. Ships a built-in LSP and a first-party VS Code extension, SARIF/JSON/HTML/Markdown reports, and a guarded auto-fix engine. 23 rules, cross-platform (Windows/Linux/macOS), published to npm, Homebrew, crates.io, and the VS Code Marketplace.",
    tech: ["Rust", "Tree-sitter", "Python", "TypeScript", "LSP", "VS Code API"],
    github: "https://github.com/snowbros-labs/atlas",
    live: "https://snowbros.me/atlas",
    category: "tool",
    featured: true,
  },
  {
    title: "SNOWBROS",
    description: "Independent software engineering studio — business site",
    longDescription:
      "Official business site for SNOWBROS, an independent software engineering studio. Built on the latest Next.js 16 + React 19 stack with Tailwind CSS 4, showcasing studio services, work, and client engagement — production-grade from day one.",
    tech: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4"],
    github: "https://github.com/VED2107/snowbros",
    live: "https://snowbros.me",
    image: "/screenshots/snowbros-mockup.png",
    category: "fullstack",
    featured: true,
  },
  {
    title: "Vinnys Vogue",
    description: "Luxury bridal & festive wear e-commerce platform",
    longDescription:
      "Full-scale production e-commerce for Indian luxury fashion. Features role-based admin dashboard, atomic cart operations, real-time order tracking, Supabase Row Level Security, and a premium editorial UI. Handles product management, checkout flow, and multi-role authentication.",
    tech: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "PostgreSQL"],
    live: "https://www.vinnysvogue.in/",
    image: "/screenshots/vinnys-vogue.png",
    screenshots: [
      { label: "Dashboard", src: "/screenshots/vinnys-vogue-dash.png" },
      { label: "Landing", src: "/screenshots/vinnys-vogue-landing.png" },
    ],
    category: "fullstack",
    featured: true,
  },
  {
    title: "Lunora Studio",
    description: "Luxury handmade bouquet e-commerce platform",
    longDescription:
      "Full-scale luxury e-commerce for The Lunora Studio — handmade pipe-cleaner bouquets that never wilt. Features cinematic GSAP ScrollTrigger storytelling landing page, product catalog with variants & gallery, cart with guest-to-login merge, custom bouquet request workflow, WhatsApp/Instagram ordering mode toggle, Google OAuth, admin dashboard with revenue stats, order management pipeline, coupon engine, and CMS for homepage content.",
    tech: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "GSAP", "shadcn/ui"],
    github: "https://github.com/VED2107/lunora-studio",
    live: "https://lunorastudio.vercel.app",
    image: "/screenshots/lunora-studio.png",
    screenshots: [
      { label: "Landing", src: "/screenshots/lunora-studio-landing.png" },
      { label: "Shop", src: "/screenshots/lunora-studio-shop.png" },
    ],
    category: "fullstack",
    featured: true,
  },
  {
    title: "STC Academy",
    description: "Online education platform for Gujarat students",
    longDescription:
      "Educational platform supporting CBSE and GSEB board students from primary to HSC+JEE/NEET. Features dual-pathway course system, faculty mentorship profiles, small-batch enrollment, and course filtering by academic level. Built for scalability and clarity.",
    tech: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    live: "https://stc.vercel.app/",
    github: "https://github.com/VED2107/STC",
    image: "/screenshots/stc-academy.png",
    screenshots: [
      { label: "Dashboard", src: "/screenshots/stc-academy-dash.png" },
      { label: "Landing", src: "/screenshots/stc-academy-landing.png" },
    ],
    category: "fullstack",
    featured: true,
  },
  {
    title: "Cipher Clash",
    description: "Cross-platform multiplayer word-association game",
    longDescription:
      "Real-time multiplayer word game inspired by Codenames. Cross-platform via Expo (iOS/Android/Web). Features Supabase Realtime for live gameplay, Zustand state management, monorepo architecture with Turborepo, and a shared dark-mode-first design system.",
    tech: [
      "React Native",
      "Expo",
      "TypeScript",
      "Supabase",
      "Zustand",
      "Turborepo",
    ],
    github: "https://github.com/VED2107/guesser",
    image: "/screenshots/cipher-clash.png",
    category: "game",
    featured: true,
  },
  {
    title: "Filmica",
    description: "Flutter camera app with AI-powered shader effects",
    longDescription:
      "Mobile camera application built with Flutter featuring advanced photo/video filtering, AI agent integration, custom shader effects, and Supabase + Firebase backend. Includes agent-based workflows and store submission pipeline.",
    tech: ["Flutter", "Dart", "Supabase", "Firebase", "GLSL Shaders"],
    github: "https://github.com/VED2107/filmica",
    image: "/screenshots/filmica.png",
    category: "mobile",
    featured: false,
  },
];

export interface Skill {
  name: string;
  level: number;
  category: "frontend" | "backend" | "database" | "mobile" | "design" | "tools";
}

export const SKILLS: Skill[] = [
  { name: "React / Next.js", level: 90, category: "frontend" },
  { name: "TypeScript", level: 88, category: "frontend" },
  { name: "Tailwind CSS", level: 92, category: "frontend" },
  { name: "HTML / CSS", level: 95, category: "frontend" },
  { name: "Framer Motion", level: 75, category: "frontend" },
  { name: "GSAP", level: 70, category: "frontend" },
  { name: "Node.js", level: 80, category: "backend" },
  { name: "Rust", level: 70, category: "backend" },
  { name: "Supabase", level: 88, category: "backend" },
  { name: "REST APIs", level: 85, category: "backend" },
  { name: "Edge Functions", level: 72, category: "backend" },
  { name: "PostgreSQL", level: 80, category: "database" },
  { name: "Supabase RLS", level: 82, category: "database" },
  { name: "React Native", level: 70, category: "mobile" },
  { name: "Expo", level: 68, category: "mobile" },
  { name: "Flutter / Dart", level: 55, category: "mobile" },
  { name: "Figma", level: 78, category: "design" },
  { name: "UI/UX Design", level: 80, category: "design" },
  { name: "Git / GitHub", level: 88, category: "tools" },
  { name: "Vercel", level: 85, category: "tools" },
  { name: "Turborepo", level: 65, category: "tools" },
];

export const SKILL_CATEGORIES = [
  { key: "frontend" as const, label: "Frontend", color: "#00F5FF" },
  { key: "backend" as const, label: "Backend", color: "#FF00E5" },
  { key: "database" as const, label: "Database", color: "#FFE600" },
  { key: "mobile" as const, label: "Mobile", color: "#00FF88" },
  { key: "design" as const, label: "Design", color: "#FF4D4D" },
  { key: "tools" as const, label: "Tools", color: "#A78BFA" },
];

export interface Quest {
  title: string;
  organization: string;
  description: string;
  status: "completed" | "active" | "upcoming";
  type: "main" | "side";
  year: string;
}

export const QUESTS: Quest[] = [
  {
    title: "Secretary",
    organization: "IEEE GUNI Student Branch",
    description:
      "Leading the student branch, organizing technical events, managing team coordination, and driving student engagement across engineering departments.",
    status: "active",
    type: "main",
    year: "2025–Present",
  },
  {
    title: "Visual Lead",
    organization: "GDG On Campus — Ganpat University",
    description:
      "Directing all visual design and branding for Google Developer Groups on campus. Creating event graphics, social media content, and visual identity systems.",
    status: "active",
    type: "main",
    year: "2025–Present",
  },
  {
    title: "B.Tech Computer Engineering",
    organization: "Ganpat University",
    description:
      "Pursuing Computer Engineering with focus on full-stack development, system design, and creative technology. Building production-grade projects alongside academics.",
    status: "active",
    type: "main",
    year: "2024–2028",
  },
  {
    title: "Full Stack Developer Journey",
    organization: "Self-directed",
    description:
      "Shipping real products: e-commerce platforms, education systems, multiplayer games, and mobile apps. Every project production-grade, not toy demos.",
    status: "active",
    type: "side",
    year: "2024–Present",
  },
  {
    title: "Technical Symposium Participant",
    organization: "IEEE Events",
    description:
      "Participated in and contributed to technical symposiums, presenting work and engaging with the broader engineering community.",
    status: "completed",
    type: "side",
    year: "2025",
  },
];

export const ACHIEVEMENTS = [
  {
    title: "Studio Founder",
    description: "Shipped SNOWBROS — own software engineering studio",
    score: 9000,
    rank: "S",
  },
  {
    title: "Systems Engineer",
    description:
      "Shipped Snowbros Atlas — Rust static-analysis engine on npm, Homebrew & VS Code Marketplace",
    score: 9200,
    rank: "S",
  },
  {
    title: "IEEE Leadership",
    description: "Secretary of IEEE GUNI Student Branch",
    score: 9500,
    rank: "S",
  },
  {
    title: "Production Ship",
    description: "Shipped vinnysvogue.in to real users",
    score: 8800,
    rank: "S",
  },
  {
    title: "GDG Visual Lead",
    description: "Design lead for Google Developer Groups",
    score: 8200,
    rank: "A",
  },
  {
    title: "Cross-Platform",
    description: "Built apps across Web, Mobile, and Flutter",
    score: 7500,
    rank: "A",
  },
  {
    title: "Real-time Systems",
    description: "Multiplayer game with Supabase Realtime",
    score: 7000,
    rank: "A",
  },
  {
    title: "Tech Symposium",
    description: "IEEE Technical Symposium Contributor",
    score: 6500,
    rank: "B",
  },
];

export const TERMINAL_COMMANDS: Record<string, string> = {
  help: "Commands: about, skills, projects, github, mission, contact, socials, resume, hire, clear, sudo hire ved\n\nFun: matrix, rain, hack, godmode, stats, play, exit, rm -rf /\n\nTech: neofetch, vim, whoami, ping, git, curl, cat, ls, top, npm, sudo, cd, pwd\n\nExtreme Fun: play music, cinema",
  about:
    "Ved Chauhan — Full Stack Developer, UI/UX Designer, Creative Technologist. B.Tech CSE @ Ganpat University. Building production-grade systems that people actually use.",
  skills:
    "Frontend: React, Next.js, TypeScript, Tailwind, GSAP\nBackend: Node.js, Rust, Supabase, PostgreSQL\nMobile: React Native, Expo, Flutter\nDesign: Figma, UI/UX\nTools: Git, Vercel, Turborepo, Tree-sitter, LSP",
  projects:
    "1. Snowbros Atlas — Rust static-analysis engine [LIVE]\n2. SNOWBROS — Software studio site [LIVE]\n3. Vinnys Vogue — Luxury e-commerce [LIVE]\n4. Lunora Studio — Bouquet e-commerce [LIVE]\n5. STC Academy — Education platform [LIVE]\n6. Cipher Clash — Multiplayer word game\n7. Filmica — Flutter camera app",
  contact: "Email: vedchauhan2107@gmail.com\nLinkedIn: /in/ved-chauhan2107\nGitHub: /VED2107",
  socials:
    "GitHub: github.com/VED2107\nLinkedIn: linkedin.com/in/ved-chauhan2107\nInstagram: @_v_e_d_2107",
  github: "GitHub: github.com/VED2107\n> Repos: 10+ | Stars: ★ | Languages: TypeScript, Rust, Dart, JavaScript\n> Pinned: Snowbros Atlas, SNOWBROS, Vinnys Vogue, Lunora Studio, STC, Cipher Clash\n> Status: Building daily",
  mission: "MISSION CONTROL — ACTIVE\n> Commits this year: scanning...\n> Top languages: TypeScript, Rust, Dart, JavaScript\n> Contribution streak: consistent\n> Scroll up to #mission-control for full dashboard",
  resume: "◄ EJECTING DATA CARTRIDGE ►\n> Ved_Chauhan_RESUME.pdf\n> Software Engineer — Full-Stack Web Applications\n> Founder @ Snowbros | B.Tech CompE\n\n[■■■■■■■■■■] 100% — download started\n> Tip: also grab it from the RESUME button up top.",
  hire: "INITIATING HIRE PROTOCOL...\n> Candidate: Ved Chauhan\n> Status: Available for opportunities\n> Contact: vedchauhan2107@gmail.com",
  clear: "__CLEAR__",
  "sudo hire ved":
    "ACCESS GRANTED\n\n> BEST DECISION DETECTED\n> PROCESSING HIRE REQUEST...\n> SUCCESS: You've unlocked a legendary developer.\n> Email sent to: vedchauhan2107@gmail.com\n\n🎮 Achievement Unlocked: Smart Recruiter",
  neofetch:
    "        ██╗   ██╗███████╗██████╗\n        ██║   ██║██╔════╝██╔══██╗\n        ██║   ██║█████╗  ██║  ██║\n        ╚██╗ ██╔╝██╔══╝  ██║  ██║\n         ╚████╔╝ ███████╗██████╔╝\n          ╚═══╝  ╚══════╝╚═════╝\n\n  OS:      Ved.EXE v2.1.07\n  Host:    Gujarat, India\n  Kernel:  Caffeine-6.0-LTS\n  Uptime:  since 2004\n  Shell:   chai-powered-bash\n  DE:      VS Code + Figma\n  CPU:     Brain™ i9 (overclocked)\n  GPU:     Imagination RTX 4090\n  RAM:     128GB (80% used by Chrome)\n  Disk:    ∞ ideas, finite time",
  vim: "~\n~\n~\n~\n~  Welcome to Vim.\n~  You can never leave.\n~  :q? Nope.\n~  :wq? Nice try.\n~  :q!? STILL HERE.\n~\n~  Pro tip: just close the terminal tab.\n~  ...oh wait, you can't do that here either.",
  whoami: "You? A curious visitor.\nVed? A legend in the making.\n\n> root access: DENIED\n> cool points: +10 for trying",
  "ping ved":
    "PING ved.chauhan (127.0.0.1) 56 bytes of data.\n64 bytes from ved: talent=immeasurable ttl=∞ time=0.01ms\n64 bytes from ved: creativity=overflowing ttl=∞ time=0.02ms\n64 bytes from ved: ambition=unlimited ttl=∞ time=0.00ms\n64 bytes from ved: sleep=not_found ttl=∞ time=999ms\n\n--- ved.chauhan ping statistics ---\n4 packets sent, 4 received, 0% loss\nrtt min/avg/max = legendary/goated/immeasurable",
  "git blame":
    "Every. Single. Line.\n\n  commit abc1234 (Ved Chauhan, 3:47 AM)\n    + Refactored entire codebase\n    + Fueled by: chai × lo-fi beats\n    + Mood: unstoppable\n    + Regrets: none\n\n> Blame accepted. Credit also accepted.",
  "curl ved":
    "  % Total    % Received\n  100  ████████████████████  100%\n\n> Downloading ved_brain.tar.gz...\n> Extracting: creativity.js ✓\n> Extracting: ambition.ts ✓\n> Extracting: sleep_schedule.txt — FILE NOT FOUND\n> Extracting: portfolio_magic.tsx ✓\n\n> Download complete.\n> Warning: contents may cause inspiration.",
  "cat /etc/passwd": "root:x:0:0:root:/root:/bin/bash\nved:x:2107:2107:Ved Chauhan,Legend,∞:/home/ved:/bin/build-cool-stuff\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n\n> Nice try, hacker. No secrets here.\n> ...or are there? 👀",
  "ls -la":
    "total 2107\ndrwxr-xr-x  ved ved  4096  dreams.txt\ndrwxr-xr-x  ved ved  8192  world_domination_plan.md\n-rw-r--r--  ved ved  1337  secret_projects.enc\n-rw-r--r--  ved ved   420  spotify_wrapped_2025.json\n-rwx------  ved ved  9999  hire_me_please.sh\ndrwxr-xr-x  ved ved  2048  3am_ideas/\n-rw-r--r--  ved ved     0  sleep_schedule.txt  [EMPTY]\n-rw-r--r--  ved ved  ∞     ambition.log",
  top: "  PID  USER   %CPU  %MEM  COMMAND\n  001  ved    99.9  80.0  brain.exe\n  002  ved    87.3  45.2  creativity.service\n  003  ved    73.1  30.0  next-dev-server\n  004  ved    65.0  25.0  chrome (47 tabs)\n  005  ved    42.0  15.0  spotify-lofi-beats\n  006  ved    12.5   5.0  figma-designs\n  007  ved     2.1   0.5  sleep.daemon [SUSPENDED]\n  008  ved     0.0   0.0  social-life [NOT FOUND]\n\n> Load average: immeasurable\n> Uptime: too long, send help (and chai)",
  "rm -rf /": "> Nice try.\n> Deleting... just kidding.\n> This portfolio is backed up on 7 continents.",
  "rm -rf /*": "> Nice try.\n> Deleting... just kidding.\n> This portfolio is backed up on 7 continents.",
  exit: "> There is no escape.\n> You're in Ved's world now.",
  play: "═══ ARCADE ═══\n> Try these:\n>   play music — music visualizer\n>   cinema     — movie credits\n>   matrix     — enter the matrix\n>   hack       — breach the mainframe\n>   godmode    — ???",
  game: "═══ ARCADE ═══\n> Try these:\n>   play music — music visualizer\n>   cinema     — movie credits\n>   matrix     — enter the matrix\n>   hack       — breach the mainframe\n>   godmode    — ???",
  stats: "═══ DEV STATS ═══\n> Components:    18 hand-crafted\n> Lines of Code: ~4,500+\n> Animations:    30+ custom\n> Easter Eggs:   more than you've found\n> Coffee Cups:   ∞\n> Bugs:          none (copium)\n> Framework:     Next.js + GSAP + Framer Motion\n> Vibe:          immaculate",
  ls: "total 2107\ndrwxr-xr-x  ved ved  4096  dreams.txt\ndrwxr-xr-x  ved ved  8192  world_domination_plan.md\n-rw-r--r--  ved ved  1337  secret_projects.enc\n-rw-r--r--  ved ved   420  spotify_wrapped_2025.json\n-rwx------  ved ved  9999  hire_me_please.sh\ndrwxr-xr-x  ved ved  2048  3am_ideas/\n-rw-r--r--  ved ved     0  sleep_schedule.txt  [EMPTY]\n-rw-r--r--  ved ved  ∞     ambition.log",
  ping: "PING ved.chauhan (127.0.0.1) 56 bytes of data.\n64 bytes from ved: talent=immeasurable ttl=∞ time=0.01ms\n64 bytes from ved: creativity=overflowing ttl=∞ time=0.02ms\n64 bytes from ved: ambition=unlimited ttl=∞ time=0.00ms\n64 bytes from ved: sleep=not_found ttl=∞ time=999ms\n\n--- ved.chauhan ping statistics ---\n4 packets sent, 4 received, 0% loss\nrtt min/avg/max = legendary/goated/immeasurable",
  cat: "root:x:0:0:root:/root:/bin/bash\nved:x:2107:2107:Ved Chauhan,Legend,∞:/home/ved:/bin/build-cool-stuff\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n\n> Nice try, hacker. No secrets here.\n> ...or are there?",
  git: "Every. Single. Line.\n\n  commit abc1234 (Ved Chauhan, 3:47 AM)\n    + Refactored entire codebase\n    + Fueled by: chai x lo-fi beats\n    + Mood: unstoppable\n    + Regrets: none\n\n> Blame accepted. Credit also accepted.",
  curl: "  % Total    % Received\n  100  ████████████████████  100%\n\n> Downloading ved_brain.tar.gz...\n> Extracting: creativity.js ✓\n> Extracting: ambition.ts ✓\n> Extracting: sleep_schedule.txt — FILE NOT FOUND\n> Extracting: portfolio_magic.tsx ✓\n\n> Download complete.\n> Warning: contents may cause inspiration.",
  sudo: "ved is not in the sudoers file. This incident will be reported.\n\n> ...just kidding. Try 'sudo hire ved' instead.",
  cd: "> You're already in /home/ved/portfolio\n> There's nowhere better to be.",
  pwd: "/home/ved/portfolio\n> The greatest directory on earth.",
  echo: "> echo echo echo...\n> Ved's portfolio reverberates through the void.",
  man: "> No manual entry for this command.\n> Try 'help' — that's the only manual you need here.",
  grep: "> grep -r 'talent' /home/ved\n> /home/ved/*: match found in every file",
  npm: "> npm install ved-chauhan\n> added 1 package: legendary-developer\n> found 0 vulnerabilities (because Ved writes clean code)",
};

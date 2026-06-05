export const SITE = {
  name: "VED.EXE",
  title: "Ved Chauhan",
  roles: ["Full Stack Developer", "UI/UX Designer", "Creative Technologist"],
  email: "vedchauhan2107@gmail.com",
  github: "https://github.com/VED2107",
  linkedin: "https://www.linkedin.com/in/ved-chauhan2107/",
  instagram: "https://www.instagram.com/_v_e_d_2107",
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
  help: "Available commands: about, skills, projects, github, mission, contact, socials, resume, hire, clear, sudo hire ved",
  about:
    "Ved Chauhan — Full Stack Developer, UI/UX Designer, Creative Technologist. B.Tech CSE @ Ganpat University. Building production-grade systems that people actually use.",
  skills:
    "Frontend: React, Next.js, TypeScript, Tailwind, GSAP\nBackend: Node.js, Supabase, PostgreSQL\nMobile: React Native, Expo, Flutter\nDesign: Figma, UI/UX\nTools: Git, Vercel, Turborepo",
  projects:
    "1. Vinnys Vogue — Luxury e-commerce [LIVE]\n2. STC Academy — Education platform [LIVE]\n3. Cipher Clash — Multiplayer word game\n4. Filmica — Flutter camera app",
  contact: "Email: vedchauhan2107@gmail.com\nLinkedIn: /in/ved-chauhan2107\nGitHub: /VED2107",
  socials:
    "GitHub: github.com/VED2107\nLinkedIn: linkedin.com/in/ved-chauhan2107\nInstagram: @_v_e_d_2107",
  github: "GitHub: github.com/VED2107\n> Repos: 10+ | Stars: ★ | Languages: TypeScript, Dart, JavaScript\n> Pinned: Vinnys Vogue, STC, Cipher Clash, Filmica\n> Status: Building daily",
  mission: "MISSION CONTROL — ACTIVE\n> Commits this year: scanning...\n> Top languages: TypeScript, Dart, JavaScript\n> Contribution streak: consistent\n> Scroll up to #mission-control for full dashboard",
  resume: "[DOWNLOADING resume.pdf...]\n> Just kidding. Email me: vedchauhan2107@gmail.com",
  hire: "INITIATING HIRE PROTOCOL...\n> Candidate: Ved Chauhan\n> Status: Available for opportunities\n> Contact: vedchauhan2107@gmail.com",
  clear: "__CLEAR__",
  "sudo hire ved":
    "ACCESS GRANTED\n\n> BEST DECISION DETECTED\n> PROCESSING HIRE REQUEST...\n> SUCCESS: You've unlocked a legendary developer.\n> Email sent to: vedchauhan2107@gmail.com\n\n🎮 Achievement Unlocked: Smart Recruiter",
};

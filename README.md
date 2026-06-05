<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/GSAP-3-88CE02?style=for-the-badge&logo=greensock" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer" />
</p>

<h1 align="center">VED.EXE — Retro Gaming Developer Portfolio</h1>

<p align="center">
  A retro gaming / CRT terminal themed developer portfolio built with Next.js 16, React 19, and enough neon to light up a city block.
</p>

<p align="center">
  <a href="https://vedchauhan.dev">Live Demo</a> &bull;
  <a href="#-quick-start">Quick Start</a> &bull;
  <a href="#-make-it-yours">Customize</a> &bull;
  <a href="#-deploy">Deploy</a>
</p>

---

## Features

- **Retro CRT Aesthetic** — Scanline overlay, noise texture, pixel grid, neon glow effects
- **Boot Sequence** — Terminal-style loading screen with customizable messages
- **RPG-Themed Sections** — Player Profile, Quest Log, Skill Trees, Achievements
- **Mission Control** — Live GitHub stats dashboard (commits, languages, contribution graph)
- **Interactive Terminal** — Contact section with working terminal commands
- **Custom Cursor** — Neon crosshair cursor with hover effects
- **Smooth Scroll** — Lenis-powered butter-smooth scrolling
- **Sound Effects** — Optional UI sound system with toggle
- **Konami Code** — Hidden easter egg (try it!)
- **Time-of-Day** — Ambient effects that change based on local time
- **Page Transitions** — GSAP-powered wipe transitions
- **Scroll Progress** — Gradient progress bar at the top
- **OG Image** — Auto-generated retro-styled Open Graph image
- **SEO Ready** — Sitemap, robots.txt, full meta tags
- **Lazy Loading** — Sections load on demand for fast initial paint
- **Reduced Motion** — Respects `prefers-reduced-motion`
- **Responsive** — Looks good on all screen sizes

---

## Quick Start

### Prerequisites

- **Node.js** 18.17+
- **npm**, **pnpm**, **yarn**, or **bun**

### Setup

```bash
# Clone the repo
git clone https://github.com/VED2107/portfolio.git
cd portfolio

# Install dependencies
npm install

# Set up environment (optional — for live GitHub stats)
cp .env.example .env.local
# Edit .env.local and add your GitHub token

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the boot sequence.

### GitHub Token (Optional)

The Mission Control section shows live GitHub stats. To enable it:

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Generate a **classic** token with `read:user` scope
3. Add it to `.env.local`:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   ```

Without a token, Mission Control gracefully falls back to static display.

---

## Make It Yours

All personal data lives in **two files**. Edit these and you're done:

### 1. `src/lib/data.ts` — Your Content

| Export | What to Change |
|--------|---------------|
| `SITE` | Name, title, roles, email, social links |
| `BOOT_SEQUENCE` | Loading screen terminal messages |
| `PROJECTS` | Your projects (title, description, tech stack, links, screenshots) |
| `SKILLS` | Your skills with proficiency levels (0-100) |
| `QUESTS` | Experience, education, roles (RPG quest format) |
| `ACHIEVEMENTS` | Badges with scores and ranks (S/A/B/C) |
| `TERMINAL_COMMANDS` | Terminal responses in the contact section |

### 2. `src/lib/github.ts` — Your GitHub Username

```typescript
const USERNAME = "YOUR_GITHUB_USERNAME"; // Change this
```

### 3. Update Metadata

In `src/app/layout.tsx`, update:
- Site title and description
- `metadataBase` URL
- Open Graph / Twitter card info
- Author name

In `src/app/sitemap.ts` and `src/app/robots.ts`, update your domain URL.

### 4. Add Your Screenshots

Drop project screenshots in `public/screenshots/` and reference them in `data.ts`:

```typescript
{
  image: "/screenshots/my-project.png",
  screenshots: [
    { label: "Dashboard", src: "/screenshots/my-project-dash.png" },
  ],
}
```

### 5. Favicons

Replace the favicon files in `public/`:
- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png`
- `icon-192x192.png`
- `icon-512x512.png`

Use [realfavicongenerator.net](https://realfavicongenerator.net) to generate from your logo.

### 6. Colors (Optional)

Edit the CSS variables in `src/app/globals.css`:

```css
:root {
  --bg-primary: #050816;      /* Background */
  --color-primary: #00F5FF;   /* Cyan — main accent */
  --color-secondary: #FF00E5; /* Magenta — secondary accent */
  --color-accent: #FFE600;    /* Yellow — highlights */
  --color-success: #00FF88;   /* Green — status/success */
  --color-danger: #FF4D4D;    /* Red — errors/alerts */
}
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx             Root layout (fonts, metadata, global wrappers)
│   ├── page.tsx               Server component (fetches GitHub data)
│   ├── globals.css            Theme variables, animations, utilities
│   ├── api/og/route.tsx       Auto-generated OG image (Edge)
│   ├── sitemap.ts             Sitemap
│   └── robots.ts              Robots.txt
├── components/
│   ├── HomePage.tsx            Section orchestrator + lazy loading
│   ├── HeroSection.tsx         Landing hero
│   ├── PlayerProfile.tsx       About (RPG player card)
│   ├── QuestLog.tsx            Experience timeline
│   ├── ProjectsSection.tsx     Project showcase
│   ├── SkillsSection.tsx       Skill bars
│   ├── MissionControl.tsx      GitHub stats dashboard
│   ├── AchievementsSection.tsx Achievement badges
│   ├── ContactTerminal.tsx     Interactive terminal
│   ├── LoadingScreen.tsx       Boot sequence
│   └── ...                     Effects, overlays, utilities
└── lib/
    ├── data.ts                 All personal data
    └── github.ts               GitHub API integration
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Deploy

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/VED2107/portfolio)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Add `GITHUB_TOKEN` in Environment Variables (optional)
4. Deploy

### Other Platforms

Works anywhere Node.js runs. Build with `npm run build`, serve with `npm run start`.

---

## Tech Stack

| Tech | Purpose |
|------|---------|
| [Next.js 16](https://nextjs.org) | Framework (App Router, ISR, Edge Runtime) |
| [React 19](https://react.dev) | UI library |
| [TypeScript 5](https://typescriptlang.org) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling |
| [GSAP 3](https://gsap.com) | Page transitions, complex animations |
| [Framer Motion](https://motion.dev) | Component animations |
| [Lenis](https://lenis.darkroom.engineering) | Smooth scrolling |

---

## License

MIT — fork it, customize it, make it yours. A star would be nice though.

---

<p align="center">
  Built by <a href="https://github.com/VED2107">Ved Chauhan</a>
</p>

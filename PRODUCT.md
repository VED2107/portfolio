# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: engineers and tech leads evaluating Ved for roles or collaboration. They open a project, read the engineering, and decide whether he can be trusted with real systems. Secondary: founders and small businesses who land here from SNOWBROS and want to know if he can build their product.

## Product Purpose
VED.EXE is the personal site of Ved S. Chauhan, software engineer and founder of SNOWBROS, an independent software studio. It exists to show that he ships real, working software (developer tools, full-stack products, cross-platform apps) and to start conversations about work. Success: a visitor opens at least one case study, understands a real engineering decision in it, and knows how to reach him.

## Positioning
Most student/early-career portfolios list projects. Ved's projects are shipped and running for real users (a boutique's till, a published Rust CLI on crates.io/npm/Homebrew/VS Code Marketplace, a ledger with signed releases). The site presents them as products with engineering stories, not cards.

## Operating Context
Visitors arrive from GitHub, LinkedIn, the SNOWBROS site, or a resume link. Desktop for deep reading, phone for first impressions. Resume PDF at /Ved_Chauhan_RESUME.pdf. Live GitHub data via GraphQL when GITHUB_TOKEN is set; must degrade gracefully without it.

## Capabilities and Constraints
- Stack stays Next.js 16 App Router, React 19, TypeScript, Tailwind v4. GSAP + Lenis already installed.
- Project facts come only from repos and existing site data. Accounic and Vinny's Atelier are two separate case studies (confirmed): Accounic = multi-currency personal ledger (Next.js web + Flutter Android/Windows, one Supabase DB); Atelier = retail OS / POS for a working boutique (Razorpay UPI, Tauri 2, Drizzle, Playwright).
- Some repos are private (atelier). Link only to public repos and live URLs.

## Brand Commitments
- Name: VED.EXE. Studio: SNOWBROS. Person: Ved S. Chauhan.
- Voice: plain, precise, a little dry humour. Engineering claims stated exactly as the repos state them.
- Principle from his own profile: "Same input in, same result out. Accuracy over quantity." Deterministic, provable, fast.

## Evidence on Hand
- Screenshots in public/screenshots/ (Atelier till/reports/inventory, Vinnys Vogue, STC Academy, Lunora, SNOWBROS mockup, Cipher Clash, Filmica).
- Atlas README numbers: axios 431 files ~230 ms cold / ~76 ms warm; 500-file repo ~270 ms cold, ~34 ms after one-file change; 23 rules; zero Python-specific false positives on FastAPI.
- Accounic README: v1.16.1, four CI workflows, integer minor units, database computes every balance, FIFO settlement, forced RLS.
- Roles: IEEE GUNI Student Branch Secretary, GDG On Campus Ganpat University Visual Lead, B.Tech Computer Engineering at Ganpat University (2024-2028).
- Absent, never fabricate: client testimonials, user counts, revenue, employer history, invented metrics.

## Product Principles
1. Show the working thing before describing it.
2. Every number on the page is traceable to a repo or a live product.
3. Depth on demand: a scan reads in seconds, a case study rewards ten minutes.
4. The site is itself a shipped project and should hold up to an engineer opening devtools.

## Accessibility & Inclusion
WCAG 2.2 AA. Full keyboard operation including the command palette. prefers-reduced-motion honoured everywhere.

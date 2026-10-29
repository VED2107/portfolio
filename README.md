# VED Records

Personal portfolio of Ved S. Chauhan, software engineer and founder of SNOWBROS.
Live at https://ved.exe.snowbros.me.

The site is a record shop: projects are records, engineering decisions are tracks, and case
studies are liner notes. The 3D shop enhances complete HTML content. Keep its own creative
identity; it is distinct from the company site.

## Run and verify

Use Node.js 20.9 or newer and the committed npm lockfile.

```sh
npm ci
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

Next.js 16 App Router, React 19, TypeScript, GSAP and lazy-loaded three.js. Read the installed
Next.js documentation before changes, as required by AGENTS.md.

## Content

- `CODEBASE.md`: architecture and implementation map.
- `PRODUCT.md`: audience, evidence, constraints and project credits.
- `src/lib/site.ts`: contact, professional history, education and availability.
- `src/lib/work.ts`: projects, roles, status, screenshots and engineering decisions.
- `public/work/`: real project captures; `public/Ved_Chauhan_RESUME.pdf`: resume.

GitHub activity revalidates hourly and falls back to a committed snapshot. `GITHUB_TOKEN`
is optional and server-only; never commit it. See `.env.example`.

Public project claims need evidence. Preserve collaborative credits, prototype limitations,
and client confidentiality. No deployments or public profile edits without authorization.

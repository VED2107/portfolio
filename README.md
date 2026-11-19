# Ved Chauhan

Personal portfolio of Ved S. Chauhan, software engineer and founder of SNOWBROS.
Live at https://ved.snowbros.me.

A quiet, editorial site: a short introduction, large real product captures, case studies that
show decisions and limits, and a personal footer. Rebuilt from scratch in November 2026; see
`docs/REDESIGN.md` for the art direction, asset inventory, evidence map and motion system. The
previous 3D record shop lives in git history.

## Run and verify

Use Node.js 20.9 or newer and the committed npm lockfile.

```sh
npm ci
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

Next.js 16 App Router, React 19, TypeScript, Geist, CSS motion and the View Transitions API. Read the installed
Next.js documentation before changes, as required by AGENTS.md.

## Content

- `CODEBASE.md`: architecture and implementation map.
- `PRODUCT.md`: audience, evidence, constraints and project credits.
- `src/lib/site.ts`: contact, professional history, education and availability.
- `src/lib/work.ts`: projects, roles, status, screenshots and engineering decisions.
- `public/work/`: real project captures; `public/Ved_Chauhan_RESUME.pdf`: resume.

Tests: `npx vitest run` (content integrity) and `npx playwright test` (behaviour, production build).

Public project claims need evidence. Preserve collaborative credits, prototype limitations,
and client confidentiality. No deployments or public profile edits without authorization.

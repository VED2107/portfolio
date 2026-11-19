# Portfolio rebuild, November 2026

Built from `ved-chauhan/design-study/BUILD-PROMPT.md` and `STUDY.md`. The Recordverse (3D shop, walking, A/B sides, Quick View) is removed from the source tree and kept in git history, last at commit `a72f4b3` on `master`.

## Art direction

**Software, with the thinking left in.** A quiet, near-white shell (Geist, hairlines, one vermilion mark) so the real product captures carry the colour. Piet's grammar is followed: a small human detail, a large direct introduction, then very large work with two-line captions, an experiments strip, an editorial profile and a useful footer. The composition, copy and imagery are Ved's own.

What makes it Ved's rather than a copy:

- **Stages built only from real captures.** Each selected project is a composed stage: the product screenshot in a minimal window frame, plus a *loupe*, which is a tighter crop of the same capture so the proof can be read at a glance. Examples are AMR's 1,761-medicine library card and NOVA's title bar reporting what the engine decoded. Nothing is redrawn or mocked.
- **One diagnostic drawn, not invented.** Atlas's stage draws the import chain from the README's own sample run and labels it as such.
- **A personal mark.** A hand-weighted vermilion snowflake (SNOWBROS) pops out from behind the photo stack and closes the footer. It is original to this site; Piet's waving hand is not reused.
- **Engineering depth with limits.** Every case study ends with "Limits and open questions" and names the source of its numbers.

## Information architecture

| Route | Content |
|---|---|
| `/` | Intro and photo stack, 4 selected projects (AMR, NOVA, Atlas, STC), one paired row (Atelier, Accounic), quiet archive, working approach, experiments strip, footer |
| `/work/[slug]` | All 9 existing slugs kept. Identity, headline, summary, role/people/status cards, lead stage, section index, problem, product figures with lightbox, decisions, outcomes and their source, limits, next project |
| `/about` | Photo and statement, offset photo, story, one SNOWBROS experience entry, education and IEEE membership, recognition with photos, shipped timeline, availability |
| `/quick` | Permanent redirect to `/` |
| `/work`, `/profile` | Redirect to `/#work`, `/about` |
| `/resume`, `/cv` | The PDF, unchanged |

There is no `/play` page. Nine experiments fit the homepage strip.

## Asset inventory

| Asset | Size | Used for | Notes |
|---|---|---|---|
| `album/02-amr-letter-handed-over.webp` | 960×1280 | Front of photo stack, About lead | Real event photo. Two students; the alt text does not say which one is Ved |
| `album/01-research-conclave-2026-on-stage.webp` | 480×333 | Photo stack, About offset image | Low resolution, so it is capped at 480px wide |
| `album/03-arduino-edge-ai-bootcamp-bench.webp` | 480×320 | Photo stack, experiments strip | |
| `awards/research-conclave-2026-2.webp` | 1400×1050 | Recognition | Certificate and trophy |
| `awards/amr-letter-of-appreciation-2.webp` | 990×1400 | Recognition | |
| `awards/arduino-edge-ai-bootcamp-2.webp` | 652×480 | Recognition | |
| `work/amr-site.webp` | 1440×900 | AMR stage and loupe | |
| `work/nova-player.webp`, `nova-home.webp` | 960×600 | NOVA stage, title-bar loupe | Tears of Steel © Blender Foundation, CC BY 3.0, credited in the case study |
| `work/atlas-site.webp`, `atlas-report.webp` | 1440×900, 1240×2000 | Atlas stage, case figure | |
| `work/stc-home.webp`, `stc-scroll.webp` | 1440×900 | STC stage | Public pages only |
| `work/atelier*.webp` | 1920×1200 | Paired row, case figures | |
| `work/accounic-*.webp` | 1440×900 | Paired row, case figures | A counterparty's name is redacted in the original |
| `work/swiftdrop-site`, `vogue-*`, `lunora-home`, `snowbros-home` | 1440×900 | Archive, experiments | |

Deliberately **not** used:

- `pro.png`: its STC admin screenshot shows real students' names and phone numbers.
- `avatar.png`, `ref.png`, and the ChatGPT image: illustrations, not photographs.
- Every Piet screenshot: study material only.

## Content-evidence map

Every number on the site, and where it comes from. Each project page states its source in its Outcomes section.

| Claim | Where it appears | Source | Status |
|---|---|---|---|
| AMR: 7,044 docking jobs, 1,761 × 4 targets | AMR case, footer "Currently" | Repository, live overview, Oct 2026 | Shown as the **campaign size**, not as validated hits |
| AMR: 1,761 medicines checked against ClinicalTrials.gov | AMR case | Live overview | As reported |
| AMR: 0 results called a cure | AMR case | Interface rule in code | Negation; enforced in `content.test.ts` |
| NOVA: 55/55 samples, 100 ms seeking | NOVA case | NOVA test harness | Tested on one Windows 11 machine, as stated |
| Atlas: 23 rules, ~230 ms / ~34 ms, 340+ tests | Atlas case | Atlas README v0.4 | README's own runs |
| Accounic: 82×, 98 s → 1.2 s | Accounic case | Accounic README | One benchmark workspace |
| Atelier: 35 tables, 268 tests | Atelier case | CI and migrations, Aug 2026 | Repository is private |
| SwiftDrop: 232 → 314 MB/s | SwiftDrop case | Committed benchmark JSON | Loopback, as stated |
| STC: "100+ students, teachers and staff" | **Removed** | Unverified adoption figure | Restore only with a dated source |
| Availability line | Intro, footer, About | `NOW.updated` in `site.ts` (30 Oct 2026) | Date shown beside it |

## Motion system

All motion is CSS (transitions, keyframes, `linear()` easing) plus the View Transitions API. There is no animation library; `motion`, `three` and `@react-three/fiber` were removed.

| Token | Value | Use |
|---|---|---|
| `--ease-reveal` | `cubic-bezier(.22,1,.36,1)` | First paint, scroll reveal, incoming page |
| `--ease-ui` | `cubic-bezier(.2,.8,.2,1)` | Hover, arrows, theme, dialogs |
| `--ease-exit` | `cubic-bezier(.4,0,1,1)` | Outgoing page |
| `--spring` | `linear()` from stiffness 260, damping 26 | Photo stack only. 1.4% overshoot, settles by 600 ms |

| Element | Behaviour |
|---|---|
| First paint | Photo, headline lines, sub-line, actions and status rise 10px over 520 ms, 55 ms apart, finished by about 800 ms |
| Photo stack | Hover, or the real tap/keyboard button, fans the rear photos ±9–10° and 62–70px; the snowflake pops in |
| Project card | One-time 16px reveal near the viewport; image scales 1.012 and the arrow moves 4px on hover |
| Experiments | Native scroll, previous/next buttons, a 24 px/s linear drift on fine pointers only. Drift pauses on hover, focus, touch, wheel, a hidden tab and off-screen, and has a Pause/Play button. It turns around at the ends, so items are never duplicated |
| Dialogs | Native `<dialog>`; scale .98 → 1 over 210 ms; Escape closes; focus returns to the opener |
| Route change | Header stays put; the old page fades in 120 ms; the new one rises 8px over 320 ms |
| Theme | Colours settle together over 200 ms; the choice is restored before paint, so there is no flash |
| Reduced motion | Every transform, reveal, drift and view transition is off; content is never hidden |

## Verification

- `npm run lint`, `npx tsc --noEmit`, `npm run build`: clean.
- `npx vitest run`: content-integrity tests. Every project has a story, limits and a source; principle links resolve to real decision anchors; AMR is never presented as a treatment.
- `npx playwright test` (desktop 1440 and mobile 390, production build) covers:
  - structure and no overflow at 360/390/768/1024/1440;
  - redirects and the 404;
  - case-study chapters, and the lightbox and experiment dialogs with Escape and focus return;
  - drift stopping under reduced motion, and the pause button;
  - theme persistence before paint and the clipboard live region;
  - browser Back position and no-JavaScript rendering.

## Open items

- **Audio intro**: none. There is no real recording, so no audio control is shown.
- **Solo portrait**: there isn't one. The photo stack uses three real event photos. A single portrait would strengthen the About page.
- **Field metrics**: LCP, CLS and INP have only been checked in the local lab; there is no field data until deployment.
- **`pnpm-lock.yaml`**: stale after the dependency removal. The README names npm as the package manager. Delete or regenerate it before deploying, because some hosts prefer pnpm when that file exists.
- **Deployment**: not done; it needs separate authorization.

## Reference measurements (second pass, 19 Nov 2026)

Sampled live on piet.website at 1440×1000 with computed styles every 110 ms, then applied here.

| What | Measured on the reference | Applied |
|---|---|---|
| Type | Geist 500 everywhere; intro 52px, line-height 1.0, -0.03em; header 18px; section title 48px, -0.05em; mono labels 16px grey | Same metrics (`.t-intro`, header, `.t-h2`, `.exp-scroll`) |
| Feature image | 1377×1000 (nearly a full viewport), radius 8px, the product in a browser window floating on a blurred photograph | Stages at 1377/1000; window chrome with traffic lights and an address pill; 1 KB pre-blurred fields made from Ved's own photos (college lobby, his bench, the conclave hall) or the product's own frame |
| Paired images | 676×555 | Same ratio |
| First paint | Text rises 20px and fades over about 300 ms on a light spring; the photo settles from 1.25× | `enter-y` and `enter-scale` on `--spring-soft` |
| Scroll entrance | Each project rises 60px and fades, 70% done by about 300 ms, settled by about 900 ms | `[data-reveal]`: 60px, 950 ms, `cubic-bezier(.16,1,.3,1)` |
| Photo hover | Variant swap: front photo +13% and -10°, rear photo +10°, hand waves in about 56° with overshoot, settled by about 400 ms | Front 1.12× and -8°, rears ±10–14° fanned, snowflake waves in on `--spring-wave` (15% overshoot) |
| Edge | 8 fixed bands across the bottom 150px, blur 0.156 → 20px doubling, 12.5% mask steps | Identical, disabled on touch and small screens |
| Experiments | Equal-width items, varied heights, mono "Scroll →" label at left, title inset; about 53 px/s drift | Same layout; 40 px/s, with pause rules and reduced-motion stop |
| Project hover | No transform | Kept a 1.012 image scale and a 4px arrow nudge as feedback |

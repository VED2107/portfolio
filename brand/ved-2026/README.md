# Ved Chauhan: the "Open seal" mark

**VC, left open.** A ring opened by exactly 60° forms the C of Chauhan; inside it, a V drawn with the ring's own stroke. One vermilion point sits in the opening: the work going out into the world. Precise construction, one warm detail, the same restraint as the site.

Chosen by Ved on 20 Nov 2026 from three concepts (A "Held point", B "v, with a footnote", C "Open seal"); the concept files and `concepts.png` stay in this folder for reference.

## Files

| Path | Use |
|---|---|
| `final/ved-mark.svg` | Primary: ink `#0a0a0a`, point vermilion `#D94B2B` |
| `final/ved-mark-dark.svg` | On dark: `#f5f5f5`, point `#E8664A` |
| `final/ved-mark-black.svg` / `-white.svg` | One colour, for print, stamps, embossing |
| `final/ved-mark-small.svg` | Heavier cut for 16–32 px (stroke 32, point 16) |
| `web/` | favicon.ico/svg, 16/32/48 px, apple-touch, 192/512, maskable, manifest, head snippet |
| `final.py` | Generates every final SVG. Edit numbers here, never the SVGs |
| `build.py` | Generates the three concept marks and lockups (fonts outlined from Geist and Instrument Serif, both SIL OFL) |

In the site, `src/components/icons.tsx` exports `Mark`: ring and V use `currentColor`, the point uses `var(--accent)`, so it follows light and dark on its own.

## Construction (256 unit canvas)

- Ring: centre 128,128, outer radius 104, stroke 22, opening 60° centred on the right (cut edges at exactly 30° and 330°).
- V: stroke 22 measured perpendicular to the arm, arms at 70°, flat foot 22, spans y 79 to 177, centred on the ring.
- Point: radius 12, on the ring's centre line (r 93) at 0°, centred in the opening.
- Audit: 100/100 on `svg_audit.py` for both the primary and the small cut.

## Rules

- **Clear space:** one ring stroke (22 units at symbol scale) on every side; two around the point side.
- **Minimum size:** 16 px with `ved-mark-small.svg`; 40 px and up with the primary.
- **Colour:** ink plus one vermilion point. The point is the only accent; never recolour the ring or V in vermilion.
- **Never:** rotate the opening away from the right, close the ring, add effects (shadows, gradients, outlines), stretch, or place the two-colour version on a busy photo (use one-colour white instead).
- **Relationship to SNOWBROS:** the snowflake belongs to the studio; this mark is Ved's. They can appear together, never merged.

Trademark clearance has not been checked; run a professional search before registering.

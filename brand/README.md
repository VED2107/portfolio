# VED.EXE mark

**V, full stop.** The period of VED.EXE made into the mark: a heavy V and one square in the accent colour. The square is the same "." that sits in the wordmark and the header.

## Files (`logo/`)

| File | Use |
|---|---|
| `ved-symbol.svg` | Primary symbol, ink + cobalt, transparent |
| `ved-symbol-dark.svg` / `-blueprint.svg` | Symbol for the dark theme and the blueprint mode |
| `ved-symbol-black.svg` / `-white.svg` | One-colour, for print, stamps, embossing |
| `ved-wordmark.svg` (+ `-dark`, `-black`, `-white`) | VED.EXE in constructed letters (no font needed) |
| `ved-app-icon.svg` / `ved-maskable.svg` / `ved-favicon.svg` | Paper tile sources for the PNG icons in `public/` |
| `favicon.svg` | Tab icon that follows the OS light/dark setting |
| `gen.py` | Generates every file above. Edit the numbers here, never the SVGs by hand |

In the site, `src/components/Mark.tsx` draws the symbol inline: the V uses `currentColor`, the square uses `var(--accent)`, so it follows light, dark and blueprint on its own.

## Construction

- V arms at exactly 75°, arm width 56 on a 182 cap height, inner vertex 30 above the baseline, flat foot.
- Square: 46 × 46, sits on the baseline, 14 units clear of the right arm at its top edge.
- Wordmark: cap height 100, stems 26, horizontal bars 22 (middle bar 20: thinned horizontals), D chamfered at 45°, X arms at 60°. Square corners only.

## Colour

| | Ink | Square |
|---|---|---|
| Light (primary) | `#0e1116` | `#2f3bff` |
| Dark | `#e7e9ec` | `#8b94ff` |
| Blueprint | `#f2f5ff` | `#ffd66b` |
| One-colour | all ink, or all white | same as ink |

Backgrounds: paper `#eef0f1`, dark paper `#0f1114`. On photos, use the one-colour version.

## Rules

- **Clear space:** one square (46 units at symbol scale) on every side.
- **Minimum size:** symbol 16 px (favicon tile), wordmark 64 px wide.
- The square is always a square, always on the baseline, always the accent (or the ink colour in one-colour use).
- Don't: round the corners, add glow or gradients, recolour the V in the accent, set VED.EXE in a live font next to the symbol (the symbol already says V.), rotate or outline it.

## Open items

- Trademark / reverse-image search not done. "V." marks are simple; check before registering anything.
- Concept exploration kept in `concepts/` (A Convergence, B Notch, C V-dot, chosen).

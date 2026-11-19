/**
 * The thinking left in: short engineering notes pinned to each project stage, like review
 * comments on a screenshot. They appear on hover or focus, or all at once when the visitor turns
 * notes on in the header. Coordinates are percentages of each stage frame (the hero images in
 * public/hero, cropped by Stage.tsx); every note restates a fact already in work.ts. Desktop only; case studies carry the
 * same points as numbered callouts.
 */
type Note = { x: number; y: number; text: string; side: "l" | "r" };

export const NOTES: Record<string, Note[]> = {
  "amr-drug-repurposing": [
    { x: 15.5, y: 21, text: "“Research prototype” stays on every screen.", side: "r" },
    { x: 37, y: 52, text: "The question in plain words, before any number.", side: "r" },
    { x: 57.5, y: 64, text: "Every count is read from the database, with its source.", side: "l" },
  ],
  nova: [
    { x: 6, y: 33, text: "Continue survives crashes and renamed files.", side: "r" },
    { x: 41.5, y: 23, text: "Only what libmpv confirmed: codec, size, decoder.", side: "r" },
    { x: 51.5, y: 74.5, text: "Seeking lands within 100 ms, measured.", side: "r" },
  ],
  "snowbros-atlas": [
    { x: 37, y: 57, text: "Same code in, same findings out.", side: "r" },
    { x: 60, y: 69, text: "Every finding says how sure it is.", side: "r" },
  ],
  "stc-academy": [
    { x: 64, y: 47, text: "What a parent needs, on one page.", side: "r" },
    { x: 78, y: 66, text: "Board courses and exam tracks share one catalogue.", side: "r" },
  ],
  "vinnys-atelier": [
    { x: 78, y: 52, text: "Only a signed webhook can mark this paid.", side: "l" },
    { x: 56.5, y: 80, text: "Every action has a key.", side: "l" },
  ],
  accounic: [
    { x: 32, y: 36.5, text: "Computed by the database, not the app.", side: "r" },
    { x: 30, y: 73, text: "Each entry keeps the currency it was entered in.", side: "r" },
  ],
};

export function Notes({ slug }: { slug: string }) {
  const notes = NOTES[slug];
  if (!notes) return null;
  return (
    <ol className="notes" aria-label="Ved's notes on this screen">
      {notes.map((n, i) => (
        <li key={n.text} className={`note note-${n.side}`} style={{ left: `${n.x}%`, top: `${n.y}%`, "--n": i } as React.CSSProperties}>
          <span className="note-dot" aria-hidden />
          <span className="note-card">
            <span className="note-no" aria-hidden>
              {i + 1}
            </span>
            {n.text}
          </span>
        </li>
      ))}
    </ol>
  );
}

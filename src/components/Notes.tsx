/**
 * The thinking left in: short engineering notes pinned to each project stage, like review
 * comments on a screenshot. They appear on hover or focus, or all at once when the visitor turns
 * notes on in the header. Coordinates are percentages of the desktop stage composition in
 * Stage.tsx; every note restates a fact already in work.ts. Desktop only; case studies carry the
 * same points as numbered callouts.
 */
type Note = { x: number; y: number; text: string; side: "l" | "r" };

export const NOTES: Record<string, Note[]> = {
  "amr-drug-repurposing": [
    { x: 19.5, y: 15.4, text: "“Research prototype” stays on every screen.", side: "r" },
    { x: 22, y: 33, text: "The question in plain words, before any number.", side: "r" },
    { x: 62.5, y: 71, text: "Every count is read from the database, with its source.", side: "l" },
  ],
  nova: [
    { x: 12, y: 28.5, text: "Continue survives crashes and renamed files.", side: "r" },
    { x: 46, y: 64.5, text: "Seeking lands within 100 ms, measured.", side: "r" },
    { x: 22.5, y: 87.5, text: "Only what libmpv confirmed: codec, size, decoder.", side: "r" },
  ],
  "snowbros-atlas": [
    { x: 13, y: 32.5, text: "Same code in, same findings out.", side: "r" },
    { x: 20, y: 60, text: "Every finding says how sure it is.", side: "r" },
    { x: 92, y: 44, text: "Proof, not a guess: the whole import chain.", side: "l" },
  ],
  "stc-academy": [
    { x: 41, y: 41, text: "What a parent needs, on one page.", side: "r" },
    { x: 60, y: 81, text: "Board courses and exam tracks share one catalogue.", side: "l" },
  ],
  "vinnys-atelier": [
    { x: 38, y: 47, text: "Integer paise. No float touches a rupee.", side: "r" },
    { x: 81, y: 53, text: "Only a signed webhook can mark this paid.", side: "l" },
    { x: 57, y: 73.5, text: "Every action has a key.", side: "l" },
  ],
  accounic: [
    { x: 35.5, y: 31, text: "Computed by the database, not the app.", side: "r" },
    { x: 32, y: 66, text: "Each entry keeps the currency it was entered in.", side: "r" },
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

import { Fragment, type CSSProperties } from "react";

/**
 * Splits a heading into words, each in its own mask, so a heading can rise into view one word
 * at a time like type set on a press. The text stays real text for readers and search.
 */
export function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, k) => (
        <Fragment key={k}>
          <span className="w" style={{ "--w": k } as CSSProperties}>
            <span>{w}</span>
          </span>
          {k < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

/** A strip of type that runs along like a record label's banner. Duplicated once for the loop. */
export function Marquee({ items, tone = "mustard" }: { items: string[]; tone?: "mustard" | "oxblood" | "teal" }) {
  const run = (hidden: boolean) => (
    <span className="marquee-run" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <span key={t} className="marquee-item">
          {t}
          <span className="marquee-dot" aria-hidden>
            ●
          </span>
        </span>
      ))}
    </span>
  );
  return (
    <div className={`marquee marquee-${tone}`} role="marquee" aria-label={items.join(", ")}>
      <div className="marquee-skew">
        <div className="marquee-track">
          {run(true)}
          {run(true)}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NowRow } from "@/lib/site";
import type { Release } from "@/lib/catalog";
import { play } from "@/lib/sound";

/**
 * The counter turntable. What I'm working on right now is the record on the platter; the rest of
 * the queue stands in a rack beside it. Tap a record in the queue and it goes on the platter.
 * The platter only turns while you can see it.
 */
export function Deck({ rows, updated, lead }: { rows: NowRow[]; updated: string; lead: Release }) {
  const [on, setOn] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const row = rows[on];

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.dataset.live = "";
      else delete el.dataset.live;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const date = new Date(updated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div ref={ref} className="deck" aria-labelledby="deck-title">
      <h3 id="deck-title" className="pk ink-2">
        On the turntable now <span className="ink-3">· updated {date}</span>
      </h3>
      <div className="deck-plinth">
        <div className="deck-platter" aria-hidden>
          <div className="deck-disc" key={on} style={{ "--disc": lead.disc, "--sleeve": lead.sleeve } as React.CSSProperties}>
            <span className="deck-label">
              <b>{row.what}</b>
              <span>{row.verb}</span>
            </span>
          </div>
        </div>
        <span className="deck-arm" aria-hidden />
        <span className="deck-knob deck-knob-a" aria-hidden />
        <span className="deck-knob deck-knob-b" aria-hidden />
        <div className="deck-now" aria-live="polite">
          <p className="pk deck-now-verb">{row.verb}</p>
          <p className="deck-now-what display">
            {row.href ? (
              row.href.startsWith("/") ? (
                <Link href={row.href}>{row.what}</Link>
              ) : (
                <a href={row.href} target="_blank" rel="noreferrer">
                  {row.what}
                </a>
              )
            ) : (
              row.what
            )}
          </p>
          <p className="small">{row.detail}</p>
        </div>
      </div>
      <ol className="deck-queue" aria-label="The queue">
        {rows.map((r, i) => (
          <li key={r.what}>
            <button
              type="button"
              className="deck-sleeve"
              aria-pressed={i === on}
              onClick={() => {
                if (i === on) return;
                play("place");
                setOn(i);
              }}
            >
              <span className="pk">{r.verb}</span>
              <span className="deck-sleeve-what">{r.what}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import type { Callout, Img } from "@/lib/work";

/** A screenshot annotated like a patent drawing: numerals on the image, a legend beside it. Hover either to light both. */
export function CalloutImage({ img, callouts, priority = false }: { img: Img; callouts: Callout[]; priority?: boolean }) {
  const [lit, setLit] = useState<number | null>(null);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
      <div className="fig">
        <Image src={img.src} alt={img.alt} width={img.w} height={img.h} sizes="(min-width: 1024px) 60vw, 100vw" priority={priority} />
        {callouts.map((c) => (
          <span
            key={c.n}
            className="callout"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            data-lit={lit === c.n}
            onPointerEnter={() => setLit(c.n)}
            onPointerLeave={() => setLit(null)}
            aria-hidden
          >
            {c.n}
          </span>
        ))}
      </div>
      <ol className="grid gap-1 self-start" aria-label="Reference numerals">
        {callouts.map((c) => (
          <li
            key={c.n}
            className="grid grid-cols-[3rem_1fr] items-baseline gap-1 py-1 text-[0.93rem]"
            onPointerEnter={() => setLit(c.n)}
            onPointerLeave={() => setLit(null)}
          >
            <span className={`ref ${lit === c.n ? "ref-lit" : ""}`}>{c.n}</span>
            <span className={lit === c.n ? "accent" : "ink-2"} style={{ transition: "color 200ms ease" }}>
              {c.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

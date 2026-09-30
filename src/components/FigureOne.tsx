"use client";

import Image from "next/image";
import Link from "next/link";
import { ViewTransition, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Filing } from "@/lib/work";

type Plate = Pick<Filing, "slug" | "no" | "title" | "field"> & { plate: NonNullable<Filing["plate"]> };
type Line = { slug: string; x1: number; y1: number; x2: number; y2: number };

/**
 * FIG. 1. An exploded axonometric of shipped work: real screenshots as plates,
 * reference numerals on lead lines. Hover a numeral or a plate to lift it; click to open the filing.
 */
export function FigureOne({ plates }: { plates: Plate[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const raf = useRef(0);
  const intent = useRef<number | undefined>(undefined);

  // Plates stack bottom-up; the first filing sits on top.
  const stack = [...plates].reverse();

  const measure = useCallback(() => {
    const box = root.current?.getBoundingClientRect();
    if (!box) return;
    const next: Line[] = [];
    for (const p of plates) {
      const a = root.current!.querySelector<HTMLElement>(`[data-anchor="${p.slug}"]`)?.getBoundingClientRect();
      const t = root.current!.querySelector<HTMLElement>(`[data-target="${p.slug}"]`)?.getBoundingClientRect();
      if (!a || !t || t.width === 0) continue;
      next.push({ slug: p.slug, x1: a.left - box.left, y1: a.top - box.top, x2: t.left - box.left - 6, y2: t.top - box.top + t.height / 2 });
    }
    setLines(next);
  }, [plates]);

  // Track geometry while plates move (entrance, hover lift), then stop.
  const follow = useCallback(
    (ms: number) => {
      cancelAnimationFrame(raf.current);
      const end = performance.now() + ms;
      const tick = () => {
        measure();
        if (performance.now() < end) raf.current = requestAnimationFrame(tick);
      };
      tick();
    },
    [measure],
  );

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setReady(true);
      follow(1400);
    }, 120);
    const ro = new ResizeObserver(() => measure());
    if (root.current) ro.observe(root.current);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      cancelAnimationFrame(raf.current);
      window.clearTimeout(intent.current);
    };
  }, [follow, measure]);

  const light = (slug: string | null) => {
    window.clearTimeout(intent.current);
    setLit(slug);
    follow(360);
  };

  // Plates overlap, and thin slivers of the plate beneath peek out beside the one on top.
  // Commit a plate hover only once the pointer rests on it, so crossing a sliver doesn't flicker.
  const lightPlate = (slug: string) => {
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => light(slug), 90);
  };

  return (
    <div ref={root} className={`fig1 relative ${ready ? "is-ready" : ""}`} data-lit={lit ?? undefined} onPointerLeave={() => light(null)}>
      <div className="fig1-stage" aria-hidden>
        <div className="fig1-stack">
          {stack.map((p, i) => {
            return (
              <Link
                key={p.slug}
                href={`/work/${p.slug}`}
                transitionTypes={["nav-forward"]}
                tabIndex={-1}
                className="fig1-plate"
                data-on={lit === p.slug}
                data-dim={lit !== null && lit !== p.slug}
                style={{ "--k": i, "--lift": lit === p.slug ? "34px" : "0px", "--i": stack.length - 1 - i } as React.CSSProperties}
                onPointerEnter={() => lightPlate(p.slug)}
              >
                {/* The link keeps a fixed hit area; only this visual layer lifts, so the
                    pointer can never fall off a rising plate onto its neighbour. */}
                <span className="fig1-lift">
                  <ViewTransition name={`plate-${p.slug}`} share="plate">
                    <Image src={p.plate.src} alt="" width={p.plate.w} height={p.plate.h} sizes="(min-width: 1024px) 34vw, 70vw" priority={i >= stack.length - 2} className="fig1-img" />
                  </ViewTransition>
                  <span className="fig1-anchor" data-anchor={p.slug} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <svg className="fig1-lines draw is-drawn" aria-hidden width="100%" height="100%">
        {lines.map((l) => (
          <g key={l.slug} className={lit === l.slug ? "on" : ""}>
            <circle cx={l.x1} cy={l.y1} r={3} />
            <path d={`M ${l.x1} ${l.y1} C ${l.x1 + 40} ${l.y1}, ${l.x2 - 50} ${l.y2}, ${l.x2} ${l.y2}`} fill="none" />
          </g>
        ))}
      </svg>

      <ol className="fig1-labels">
        {plates.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/work/${p.slug}`}
              transitionTypes={["nav-forward"]}
              className="fig1-label"
              data-on={lit === p.slug}
              onPointerEnter={() => light(p.slug)}
              onFocus={() => light(p.slug)}
              onBlur={() => light(null)}
            >
              <span className="ref" data-target={p.slug}>
                {p.no}
              </span>
              <span className="fig1-title">{p.title}</span>
              <span className="fig1-field">{p.field}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

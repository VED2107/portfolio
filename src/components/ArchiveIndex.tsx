"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import type { ArchiveItem } from "@/lib/work";

type Row = ArchiveItem & { internal?: boolean; note?: string };

/** The index of other filings. On a fine pointer, a preview plate follows the cursor. */
export function ArchiveIndex({ rows }: { rows: Row[] }) {
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !preview.current) return;
    // Written straight to the transform; no React render per frame.
    preview.current.style.transform = `translate3d(${e.clientX + 24}px, ${e.clientY - 90}px, 0)`;
  };

  const current = active !== null ? rows[active]?.preview : undefined;

  return (
    <div onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
      <ul className="border-t border-[var(--ink)]">
        {rows.map((r, i) => {
          const inner = (
            <>
              <span className="archive-title">{r.title}</span>
              <span className="archive-field">{r.note ?? r.field}</span>
              <span className="archive-stack">{r.stack}</span>
              <span className="archive-go" aria-hidden>
                {r.internal ? <ArrowRight size={18} /> : <ArrowUpRight size={18} />}
              </span>
            </>
          );
          return (
            <li key={r.title}>
              {r.internal ? (
                <Link href={r.href} transitionTypes={["nav-forward"]} className="archive-row" data-on={active === i} onPointerEnter={() => setActive(i)}>
                  {inner}
                </Link>
              ) : (
                <a href={r.href} target="_blank" rel="noreferrer" className="archive-row" data-on={active === i} onPointerEnter={() => setActive(i)}>
                  {inner}
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
      <div ref={preview} className="archive-preview" data-show={Boolean(current)} aria-hidden>
        {rows.map((r, i) =>
          r.preview ? (
            <Image key={r.title} src={r.preview.src} alt="" width={r.preview.w} height={r.preview.h} sizes="320px" className="archive-preview-img" data-on={active === i} />
          ) : null,
        )}
      </div>
    </div>
  );
}

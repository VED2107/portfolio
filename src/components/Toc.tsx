"use client";
import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

/** Desktop: a sticky index that follows the reading position. Mobile: a contents disclosure. */
export function Toc({ items }: { items: TocItem[] }) {
  const [current, setCurrent] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setCurrent(seen[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  return (
    <aside className="toc" aria-label="On this page">
      <div className="toc-inner">
        <p className="t-meta" style={{ margin: 0 }}>
          On this page
        </p>
        <ol>
          {items.map((i) => (
            <li key={i.id}>
              <a href={`#${i.id}`} aria-current={current === i.id ? "true" : undefined}>
                {i.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}

export function TocMobile({ items }: { items: TocItem[] }) {
  return (
    <details className="toc-mobile">
      <summary>Contents</summary>
      <ol>
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              onClick={(e) => {
                (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open");
              }}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

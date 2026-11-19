"use client";
import { useEffect, useRef } from "react";

/**
 * The soft glass at the bottom of the viewport. It steps aside once the end of the page is on
 * screen, so the last line of the footer is never blurred. Pure CSS does the blur; this only
 * flips one attribute from an IntersectionObserver, with no scroll listener.
 */
export function EdgeBlur() {
  const edge = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const end = document.getElementById("page-end");
    const el = edge.current;
    if (!end || !el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-rest", e.isIntersecting), { rootMargin: "0px 0px 140px 0px" });
    io.observe(end);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={edge} className="edge" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <i key={i} />
      ))}
    </div>
  );
}

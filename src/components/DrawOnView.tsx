"use client";

import { useEffect, useRef } from "react";

/**
 * Draws a figure's lines once as it enters view, then holds still.
 * Strokes carry pathLength=1, so animating dashoffset 1 -> 0 draws each one end to end.
 * Uses the Web Animations API: interruptible, off the React render path, no library.
 */
export function DrawOnView({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        el.classList.add("is-drawn");
        if (reduce) return;
        el.querySelectorAll<SVGElement>("[pathLength]").forEach((path) => {
          const i = parseFloat(getComputedStyle(path).getPropertyValue("--i")) || 0;
          path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
            duration: 850,
            delay: i * 45,
            easing: "cubic-bezier(0.65, 0, 0.35, 1)",
            fill: "backwards",
          });
        });
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`draw ${className}`}>
      {children}
    </div>
  );
}

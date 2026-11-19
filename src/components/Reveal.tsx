"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Marks [data-reveal] elements once they come near the viewport, one time each. CSS does the
 * movement and only hides them when JavaScript is running and motion is allowed.
 */
export function Reveal() {
  const path = usePathname();
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])")];
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.setAttribute("data-in", ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  return null;
}

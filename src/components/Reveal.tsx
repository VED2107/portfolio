"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Marks every `.rv` element `.in` the first time it enters the viewport. The content is in the
 * HTML already; this only opts it into a short rise and fade. Re-runs on each route.
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>(".rv:not(.in)")];
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}

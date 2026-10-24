"use client";

import { useEffect, useRef } from "react";
import { setupGsap } from "@/lib/motion";
import { Q } from "@/lib/capability";

/**
 * Cursor states for physical objects. The native cursor stays; a small printed tag rides next
 * to it and says what the object will do (Pull, Dig, Turn, Open, Spin). Fine pointers only.
 */
export function CursorLabel() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia(Q.fine).matches) return;
    const gsap = setupGsap();
    const x = gsap.quickTo(el, "x", { duration: 0.12, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.12, ease: "power3.out" });
    let label = "";
    const move = (e: PointerEvent) => {
      x(e.clientX + 16);
      y(e.clientY + 18);
      const t = (e.target as HTMLElement)?.closest?.<HTMLElement>("[data-cursor]");
      const next = t?.dataset.cursor ?? "";
      if (next !== label) {
        label = next;
        el.textContent = next;
        el.dataset.on = next ? "1" : "0";
      }
    };
    const out = () => {
      label = "";
      el.dataset.on = "0";
    };
    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", out);
    return () => {
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", out);
    };
  }, []);
  return <div ref={ref} className="cursor-tag pk" aria-hidden data-on="0" />;
}

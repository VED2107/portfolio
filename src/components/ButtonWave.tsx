"use client";
import { useEffect } from "react";

/** The buttons that ripple. Links, cards and inputs never do. */
const BUTTONS = ".icon-btn, .ctrl, .notes-toggle, .sheet-close";

/**
 * The theme wave, in miniature: pressing a button sends a soft-edged ripple out from the exact
 * point of contact. Pointer only (keyboard presses stay instant), transform and opacity only, and
 * nothing at all with reduced motion. One delegated listener for the whole site.
 */
export function ButtonWave() {
  useEffect(() => {
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    function onDown(e: PointerEvent) {
      if (calm.matches || e.button !== 0) return;
      const btn = (e.target as Element | null)?.closest<HTMLElement>(BUTTONS);
      if (!btn || btn.matches(":disabled")) return;
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const size = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y)) * 2.4;
      const wave = document.createElement("span");
      wave.className = "btn-wave";
      wave.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px`;
      btn.appendChild(wave);
      const a = wave.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.15)", opacity: 0.26 },
          { transform: "translate(-50%, -50%) scale(1)", opacity: 0 },
        ],
        { duration: 720, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
      );
      a.finished.finally(() => wave.remove());
    }
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}

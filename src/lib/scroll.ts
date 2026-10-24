"use client";

/**
 * One scroll source for the whole page. Lenis drives it on fine pointers (desktop wheels and
 * trackpads); touch keeps the browser's own physics. Everything else asks this module to
 * scroll, lock or unlock, so no component talks to Lenis directly.
 */
import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function attachLenis(l: Lenis | null) {
  lenis = l;
}

export function scrollToTarget(target: string | number | HTMLElement, opts: { offset?: number; immediate?: boolean } = {}) {
  const offset = opts.offset ?? 0;
  if (lenis) {
    lenis.scrollTo(target, { offset, immediate: opts.immediate, duration: 1.1 });
    return;
  }
  let y = typeof target === "number" ? target : NaN;
  if (typeof target !== "number") {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (el) y = el.getBoundingClientRect().top + scrollY + offset;
  }
  if (Number.isFinite(y)) window.scrollTo({ top: y, behavior: opts.immediate || matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

let locks = 0;
export function lockScroll() {
  locks++;
  lenis?.stop();
  document.documentElement.style.overflow = "hidden";
}
export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks) return;
  lenis?.start();
  document.documentElement.style.overflow = "";
}

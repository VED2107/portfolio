"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const AISLES = [
  { id: "work", label: "Records" },
  { id: "discography", label: "Discography" },
  { id: "about", label: "About" },
  { id: "recognition", label: "Awards" },
  { id: "contact", label: "Contact" },
];

/**
 * The aisles. A single lit marker, like the strip light over a shelf, glides under the aisle
 * you are reading, in step with the scroll; point at another aisle and it slides over to it.
 */
export function AisleNav() {
  const pathname = usePathname();
  const nav = useRef<HTMLElement>(null);
  const mark = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = nav.current;
    const bar = mark.current;
    if (!root || !bar) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const links = [...root.querySelectorAll<HTMLAnchorElement>(".aisle")];

    // Measured on resize, never per frame.
    let spans: { x: number; w: number }[] = [];
    let tops: number[] = [];
    const measure = () => {
      spans = links.map((a) => ({ x: a.offsetLeft + 10, w: a.offsetWidth - 20 }));
      tops = AISLES.map((s) => {
        const el = document.getElementById(s.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : NaN;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    ro.observe(root);

    let hover = -1;
    const enter = (e: Event) => (hover = links.indexOf(e.currentTarget as HTMLAnchorElement));
    const leave = () => (hover = -1);
    links.forEach((a) => {
      a.addEventListener("pointerenter", enter);
      a.addEventListener("pointerleave", leave);
      a.addEventListener("focus", enter);
      a.addEventListener("blur", leave);
    });

    /** Where the reader is, as a fractional aisle index; -1 means the shop floor (no aisle). */
    const reading = () => {
      if (tops.every(Number.isNaN)) return pathname.startsWith("/work") ? 0 : -1;
      const y = window.scrollY + innerHeight * 0.35;
      if (y < tops[0]) return -1;
      for (let i = 0; i < tops.length - 1; i++) if (y < tops[i + 1]) return i + Math.max(0, (y - tops[i]) / (tops[i + 1] - tops[i]) - 0.75) * 4;
      return tops.length - 1;
    };

    let f = reading();
    let shownX = NaN;
    let shownW = NaN;
    let lit = -2;
    let visible: boolean | null = null;
    const tick = (_t: number, dt: number) => {
      const target = hover >= 0 ? hover : reading();
      const show = target >= 0;
      if (show !== visible) bar.toggleAttribute("data-on", (visible = show));
      if (!show) {
        if (lit !== -1) {
          links.forEach((a) => a.removeAttribute("aria-current"));
          lit = -1;
        }
        f = -1;
        return;
      }
      if (f < 0) f = target;
      f = reduced ? target : f + (target - f) * (1 - Math.exp(-(dt / 1000) * 10));
      const i = Math.min(spans.length - 2, Math.floor(f));
      const k = f - i;
      const x = Math.round(spans[i].x + (spans[i + 1].x - spans[i].x) * k);
      const w = Math.round(spans[i].w + (spans[i + 1].w - spans[i].w) * k);
      if (x !== shownX || w !== shownW) {
        bar.style.transform = `translateX(${(shownX = x)}px) scaleX(${(shownW = w) / 100})`;
      }
      const on = Math.round(f);
      if (on !== lit) {
        links.forEach((a, n) => (n === on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
        lit = on;
      }
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      links.forEach((a) => {
        a.removeEventListener("pointerenter", enter);
        a.removeEventListener("pointerleave", leave);
        a.removeEventListener("focus", enter);
        a.removeEventListener("blur", leave);
      });
    };
  }, [pathname]);

  return (
    <nav ref={nav} className="site-nav aisles" aria-label="Aisles">
      {AISLES.map((s) => (
        <Link key={s.id} href={`/#${s.id}`} className="aisle">
          {s.label}
        </Link>
      ))}
      <span ref={mark} className="aisle-mark" aria-hidden />
    </nav>
  );
}

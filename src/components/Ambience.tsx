"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import Lenis from "lenis";

/**
 * The room tone of the whole site, the things that are on every page and belong to none:
 * weighted scrolling, a warm lamp that follows the pointer, a tonearm in the margin that tracks
 * how far down the side you are, buttons that lean toward the cursor, marquees that run faster
 * when you scroll, and on a phone, a tick under the thumb.
 * Everything here animates transforms only, and all of it stands down for reduced motion.
 */
export function Ambience() {
  const pathname = usePathname();
  const lamp = useRef<HTMLDivElement>(null);
  const arm = useRef<SVGGElement>(null);
  const disc = useRef<SVGGElement>(null);
  const lenis = useRef<Lenis | null>(null);
  const marquees = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    // Weighted scrolling on wheels and trackpads; touch keeps the phone's own physics.
    if (!reduced && fine) {
      const l = new Lenis({
        autoRaf: false,
        anchors: { offset: -88 },
        duration: 1.1,
        prevent: (node) => !!node.closest("dialog, [data-lenis-prevent], .disco-track, .crate-scroll, .explore-panel"),
      });
      lenis.current = l;
      const raf = (t: number) => l.raf(t * 1000);
      gsap.ticker.add(raf);
      cleanups.push(() => {
        gsap.ticker.remove(raf);
        l.destroy();
        lenis.current = null;
      });
    }

    // The lamp: a pool of warm light that trails the pointer across the page.
    const el = lamp.current;
    if (el && fine && !reduced) {
      const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        x(e.clientX);
        y(e.clientY);
        el.dataset.on = "";
      };
      const out = () => delete el.dataset.on;
      window.addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", out);
      cleanups.push(() => {
        window.removeEventListener("pointermove", move);
        document.documentElement.removeEventListener("pointerleave", out);
      });
    }

    // Buttons lean toward the cursor, a few pixels, and settle back when it leaves.
    if (fine && !reduced) {
      const tos = new WeakMap<HTMLElement, { x: (v: number) => void; y: (v: number) => void }>();
      let active: HTMLElement | null = null;
      const get = (b: HTMLElement) => {
        let t = tos.get(b);
        if (!t) {
          t = { x: gsap.quickTo(b, "x", { duration: 0.4, ease: "power3.out" }), y: gsap.quickTo(b, "y", { duration: 0.4, ease: "power3.out" }) };
          tos.set(b, t);
        }
        return t;
      };
      const move = (e: PointerEvent) => {
        const b = (e.target as Element | null)?.closest?.<HTMLElement>(".btn, .icon-btn, .search-btn");
        if (active && active !== b) {
          const t = get(active);
          t.x(0);
          t.y(0);
        }
        active = b ?? null;
        if (!b) return;
        const r = b.getBoundingClientRect();
        const t = get(b);
        t.x(((e.clientX - r.left) / r.width - 0.5) * 10);
        t.y(((e.clientY - r.top) / r.height - 0.5) * 8);
      };
      document.addEventListener("pointermove", move, { passive: true });
      cleanups.push(() => document.removeEventListener("pointermove", move));
    }

    // A phone gets a short tick under the thumb on anything you can press.
    if (!fine && "vibrate" in navigator) {
      const tap = (e: PointerEvent) => {
        if (e.pointerType !== "touch") return;
        if ((e.target as Element | null)?.closest?.("a, button, summary, [role='button'], .station")) navigator.vibrate?.(8);
      };
      document.addEventListener("pointerdown", tap, { passive: true });
      cleanups.push(() => document.removeEventListener("pointerdown", tap));
    }

    // The tonearm gauge and the marquees: read the scroll once a frame, write transforms only,
    // and only when something changed. Page height is measured on resize, never per frame.
    let max = 1;
    const measure = () => (max = Math.max(1, document.documentElement.scrollHeight - innerHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    cleanups.push(() => ro.disconnect());

    const deck = arm.current?.closest("button") ?? null;
    let last = window.scrollY;
    let spin = 0;
    let vel = 0;
    let lastArm = NaN;
    let lastSkew = 0;
    let lastRate = 1;
    const tick = () => {
      const yNow = window.scrollY;
      const dv = yNow - last;
      last = yNow;
      vel += (dv - vel) * 0.15;
      if (Math.abs(vel) < 0.01) vel = 0;

      // The deck stays out of the shop floor; it slides in once you are reading the page.
      const away = yNow < innerHeight * 0.6;
      if (deck && deck.hasAttribute("data-away") !== away) deck.toggleAttribute("data-away", away);
      if (!away) {
        const angle = Math.round((-28 + Math.min(1, Math.max(0, yNow / max)) * 34) * 10) / 10;
        if (angle !== lastArm && arm.current) arm.current.style.transform = `rotate(${(lastArm = angle)}deg)`;
        if (!reduced && disc.current) disc.current.style.transform = `rotate(${(spin = (spin + 0.6 + Math.abs(dv) * 0.4) % 360)}deg)`;
      }

      if (reduced || !marquees.current.length) return;
      const skew = Math.round(Math.max(-8, Math.min(8, -vel * 0.25)) * 10) / 10;
      const rate = Math.round((vel < -0.5 ? -1 : 1) * (1 + Math.min(Math.abs(vel) / 20, 3) * 2) * 10) / 10;
      if (skew === lastSkew && rate === lastRate) return;
      lastSkew = skew;
      lastRate = rate;
      for (const m of marquees.current) {
        const anim = m.getAnimations()[0];
        if (anim) anim.playbackRate = rate;
        m.parentElement!.style.transform = skew ? `skewX(${skew}deg)` : "";
      }
    };
    gsap.ticker.add(tick);
    cleanups.push(() => gsap.ticker.remove(tick));

    return () => cleanups.forEach((c) => c());
  }, []);

  // A new page starts at the top, and Lenis must know the page got taller or shorter.
  useEffect(() => {
    lenis.current?.resize();
    marquees.current = [...document.querySelectorAll<HTMLElement>(".marquee-track")];
  }, [pathname]);

  return (
    <>
      <div ref={lamp} className="cursor-lamp" aria-hidden />
      <button
        type="button"
        className="tonearm"
        data-away=""
        aria-label="Back to the top"
        onClick={() => (lenis.current ? lenis.current.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }))}
      >
        <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden>
          <g ref={disc} className="tonearm-disc">
            <circle cx="34" cy="44" r="28" fill="var(--espresso)" />
            <circle cx="34" cy="44" r="22" fill="none" stroke="rgb(255 255 255 / 0.08)" />
            <circle cx="34" cy="44" r="16" fill="none" stroke="rgb(255 255 255 / 0.08)" />
            <circle cx="34" cy="44" r="9" fill="var(--accent)" />
            <rect x="31" y="38" width="6" height="2" rx="1" fill="var(--bg)" />
            <circle cx="34" cy="44" r="1.6" fill="var(--bg)" />
          </g>
          <g ref={arm} className="tonearm-arm">
            <circle cx="70" cy="12" r="5" fill="var(--mustard)" stroke="var(--espresso)" strokeWidth="1.5" />
            <path d="M70 12 L66 52 L56 60" fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="51" y="57" width="8" height="5" rx="1" fill="var(--ink)" transform="rotate(-38 55 59)" />
          </g>
        </svg>
      </button>
    </>
  );
}

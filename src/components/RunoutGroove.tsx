"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { isPlaying, scratch } from "@/lib/audio";

const ETCHED = "THANKS FOR LISTENING ✦ PRESSED IN AHMEDABAD ✦ VED RECORDS MMXXVI ✦ SIDE B ENDS HERE ✦ ";

/**
 * The last thing on a side: the run-out groove, where the pressing plant scratches its message
 * into the vinyl by hand. It turns at 33⅓ while the footer is in view and faster while you
 * scroll; grab it and spin it, and if Our Song is playing, the song follows your hand.
 */
export function RunoutGroove() {
  const disc = useRef<HTMLDivElement>(null);
  const plate = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = disc.current;
    const svg = plate.current;
    if (!el || !svg) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const RPM = 360 * (33.333 / 60); // degrees per second

    let angle = 0;
    let vel = RPM;
    let drag: { a: number; t: number; id: number } | null = null;
    let lastY = window.scrollY;
    let shown = NaN;

    const center = () => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    const at = (e: PointerEvent) => {
      const c = center();
      return (Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180) / Math.PI;
    };

    const tick = (_t: number, dtMs: number) => {
      const dt = Math.min(dtMs, 50) / 1000;
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      if (!drag) {
        // Coast back to 33⅓; scrolling gives it a push.
        vel += (RPM - vel) * (1 - Math.exp(-dt * 1.6)) + dy * 2;
        angle += vel * dt;
      }
      const a = Math.round(angle * 10) / 10;
      if (a !== shown) svg.style.transform = `rotate(${(shown = a)}deg)`;
    };

    const down = (e: PointerEvent) => {
      drag = { a: at(e), t: performance.now(), id: e.pointerId };
      el.setPointerCapture(e.pointerId);
      el.dataset.held = "";
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const a = at(e);
      let d = a - drag.a;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      const now = performance.now();
      const dt = Math.max(1, now - drag.t) / 1000;
      angle += d;
      vel = vel * 0.6 + (d / dt) * 0.4;
      drag = { a, t: now, id: drag.id };
      if (isPlaying()) scratch(vel / RPM);
    };
    const up = () => {
      if (!drag) return;
      drag = null;
      delete el.dataset.held;
      if (isPlaying()) scratch(1);
    };

    // Only turn while someone can see it.
    let on = false;
    const io = new IntersectionObserver(([entry]) => {
      const next = entry.isIntersecting && !reduced;
      if (next === on) return;
      on = next;
      if (on) {
        lastY = window.scrollY;
        gsap.ticker.add(tick);
      } else gsap.ticker.remove(tick);
    });
    io.observe(el);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      io.disconnect();
      gsap.ticker.remove(tick);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div ref={disc} className="runout" role="img" aria-label={`Run-out groove, etched: ${ETCHED.replaceAll("✦", ",")}`}>
      <svg ref={plate} viewBox="0 0 200 200" aria-hidden>
        <defs>
          <path id="runout-path" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
          <radialGradient id="runout-sheen" cx="35%" cy="30%" r="80%">
            <stop offset="0" stopColor="#3a3a3a" />
            <stop offset="0.5" stopColor="#141414" />
            <stop offset="1" stopColor="#0a0a0a" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="98" fill="url(#runout-sheen)" />
        {[92, 86, 80, 64, 60].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth="0.8" />
        ))}
        <text className="runout-text">
          <textPath href="#runout-path">{ETCHED}</textPath>
        </text>
        <circle cx="100" cy="100" r="40" fill="var(--oxblood)" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="var(--mustard)" strokeWidth="1.5" strokeDasharray="2 3" />
        <text x="100" y="94" textAnchor="middle" className="runout-label-big">
          VED
        </text>
        <text x="100" y="112" textAnchor="middle" className="runout-label-small">
          33⅓ · SIDE B
        </text>
        <circle cx="100" cy="100" r="3" fill="var(--bg)" />
      </svg>
      <span className="runout-sheen" aria-hidden />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Play } from "@phosphor-icons/react";
import { isPlaying, levels, play, scratch } from "@/lib/audio";
import { copyText, toast } from "@/lib/events";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Run `fn` every frame while the song plays and `el` is on screen. */
function useWhilePlaying(el: React.RefObject<HTMLElement | null>, fn: () => void, idle: () => void) {
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    let visible = false;
    let on = false;
    const sync = () => {
      const want = visible && isPlaying() && !reduced();
      if (want === on) return;
      on = want;
      if (on) gsap.ticker.add(fn);
      else {
        gsap.ticker.remove(fn);
        idle();
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(node);
    window.addEventListener("ved:audio", sync);
    return () => {
      io.disconnect();
      window.removeEventListener("ved:audio", sync);
      gsap.ticker.remove(fn);
    };
  }, [el, fn, idle]);
}

/* ------------------------------------------------------------------ hero button */

/** Starts Our Song and tells the room to lower the tonearm onto the house record. */
export function DropNeedle() {
  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={() => {
        void play();
        window.dispatchEvent(new CustomEvent("ved:needle"));
      }}
    >
      <Play aria-hidden weight="fill" />
      Drop the needle
    </button>
  );
}

/* ------------------------------------------------------------------ spectrum */

/**
 * The year on GitHub as bars. While Our Song plays, the same bars become its spectrum: each
 * week's bar breathes with one band of the music, so the data stays readable underneath.
 */
export function Spectrum({ weeks, peak }: { weeks: { start: string; count: number }[]; peak: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [fn] = useState(() => {
    const out = new Float32Array(weeks.length);
    return () => {
      const bars = box.current?.children;
      if (!bars) return;
      levels(out);
      for (let i = 0; i < bars.length; i++) {
        (bars[i] as HTMLElement).style.transform = `scaleY(${0.55 + out[i] * 0.9})`;
      }
    };
  });
  const [idle] = useState(() => () => {
    const bars = box.current?.children;
    if (bars) for (const b of bars) (b as HTMLElement).style.transform = "";
  });
  useWhilePlaying(box, fn, idle);

  return (
    <div ref={box} className="gh-chart" role="img" aria-label={`Weekly contributions over the last year, peaking at ${peak} in one week.`}>
      {weeks.map((w) => (
        <span key={w.start} style={{ height: `${Math.max(3, (w.count / peak) * 100)}%` }} data-zero={w.count === 0 ? "" : undefined} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ tilt */

/** A plaque that leans toward the pointer, like a framed record catching the light. */
export function Tilt({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      rx(-y * 8);
      ry(x * 10);
      el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
      el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    gsap.set(el, { transformPerspective: 900 });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ mixing desk */

export type Channel = { name: string; count: number; records: string[] };

/**
 * The stack as a mixing desk. Each tool is a channel; its fader sits at how many records it
 * played on. Hover or focus a channel to read the records; while the song plays, the meters run.
 */
export function MixingDesk({ channels }: { channels: Channel[] }) {
  const desk = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...channels.map((c) => c.count));

  const [fn] = useState(() => {
    const out = new Float32Array(channels.length);
    return () => {
      const meters = desk.current?.querySelectorAll<HTMLElement>(".ch-meter i");
      if (!meters) return;
      levels(out);
      meters.forEach((m, i) => (m.style.transform = `scaleY(${out[i % out.length]})`));
    };
  });
  const [idle] = useState(() => () => {
    desk.current?.querySelectorAll<HTMLElement>(".ch-meter i").forEach((m) => (m.style.transform = "scaleY(0)"));
  });
  useWhilePlaying(desk, fn, idle);

  const shown = active === null ? null : channels[active];

  return (
    <div className="desk" ref={desk}>
      <div className="desk-strips" role="list">
        {channels.map((c, i) => (
          <button
            key={c.name}
            type="button"
            role="listitem"
            className="ch"
            data-on={active === i || undefined}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            aria-label={`${c.name}: ${c.count} record${c.count === 1 ? "" : "s"}, ${c.records.join(", ")}`}
          >
            <span className="ch-meter" aria-hidden>
              <i />
            </span>
            <span className="ch-track" aria-hidden>
              <span className="ch-cap" style={{ bottom: `calc(${(c.count / max) * 100}% - 14px)` }} />
            </span>
            <span className="ch-count">{c.count}</span>
            <span className="ch-name">{c.name}</span>
          </button>
        ))}
      </div>
      <p className="desk-readout" aria-live="polite">
        {shown ? (
          <>
            <b>{shown.name}</b> played on {shown.records.join(", ")}.
          </>
        ) : (
          <>Hover a channel to see which records it played on.</>
        )}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ the scratch deck */

/**
 * A record you can grab. Drag to spin it; let go and it coasts back to 33⅓. If Our Song is on,
 * the speed of your hand bends the pitch. A click without a drag copies the email address.
 */
export function ScratchDeck({ email, label }: { email: string; label: string }) {
  const disc = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = disc.current;
    if (!el) return;
    const still = reduced();
    const RPM = 360 / 1.8; // degrees per second at 33⅓
    let angle = 0;
    let vel = still ? 0 : RPM;
    let dragging = false;
    let moved = 0;
    let last = 0;
    let lastT = 0;

    const centre = () => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    const at = (e: PointerEvent) => {
      const c = centre();
      return (Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180) / Math.PI;
    };

    const tick = (_t: number, dtMs: number) => {
      const dt = Math.min(dtMs / 1000, 0.05);
      if (!dragging) {
        const target = still ? 0 : RPM;
        vel += (target - vel) * Math.min(1, dt * 2.2);
        angle += vel * dt;
        if (isPlaying()) scratch(1);
      }
      el.style.transform = `rotate(${angle}deg)`;
    };
    gsap.ticker.add(tick);

    const down = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      last = at(e);
      lastT = performance.now();
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const a = at(e);
      let d = a - last;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      const now = performance.now();
      const dt = Math.max(1, now - lastT) / 1000;
      vel = d / dt;
      angle += d;
      moved += Math.abs(d);
      last = a;
      lastT = now;
      if (isPlaying()) scratch(vel / RPM);
    };
    const up = async () => {
      if (!dragging) return;
      dragging = false;
      if (moved < 4) toast((await copyText(email)) ? "Email address copied" : email);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      gsap.ticker.remove(tick);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [email]);

  return (
    <div className="scratch">
      <div className="scratch-platter" aria-hidden>
        <div ref={disc} className="vinyl scratch-disc">
          <div className="vinyl-label scratch-label">
            <b>{label}</b>
            <span>Grab to scratch</span>
          </div>
        </div>
      </div>
      <p className="small muted scratch-hint">Grab the record and spin it. With Our Song on, your hand bends the pitch. Tap it to copy my email.</p>
    </div>
  );
}

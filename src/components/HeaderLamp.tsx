"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { currentTheme, toggleTheme } from "@/lib/events";

const SEEN = "ved-lamp-pulled";

/**
 * The shop's light switch, hung from the sign bar: a little pendant with a pull cord that
 * dangles over the awning. Pull the bead down (or click it) and the lights change, wiping out
 * across the page from the bead. Until the first pull a paper tag on the cord says what it does.
 */
export function HeaderLamp() {
  const [dark, setDark] = useState<boolean | null>(null);
  const [hint, setHint] = useState(false);
  const cord = useRef<HTMLSpanElement>(null);
  const bead = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sync = () => setDark(currentTheme() === "dark");
    const tag = () => {
      try {
        setHint(!localStorage.getItem(SEEN));
      } catch {
        setHint(true);
      }
    };
    sync();
    tag();
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    window.addEventListener("ved:theme", sync);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("ved:theme", sync);
    };
  }, []);

  useEffect(() => {
    const b = bead.current;
    const c = cord.current;
    if (!b || !c) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let start: { y: number; id: number } | null = null;
    let pulled = 0;
    let moved = false;

    const flip = () => {
      const r = b.getBoundingClientRect();
      toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      setHint(false);
      try {
        localStorage.setItem(SEEN, "1");
      } catch {
        /* the tag just shows again next visit */
      }
    };
    // The pull lives on the lamp as --pull; the string grows by it and the bead rides down with it.
    const lamp = c.parentElement!;
    const stretch = (px: number) => gsap.set(lamp, { "--pull": `${px}px` });
    const spring = () => gsap.to(lamp, { "--pull": "0px", duration: reduced ? 0 : 0.9, ease: "elastic.out(1.1, 0.32)", overwrite: true });

    const down = (e: PointerEvent) => {
      start = { y: e.clientY, id: e.pointerId };
      pulled = 0;
      moved = false;
      b.setPointerCapture(e.pointerId);
      gsap.killTweensOf(lamp);
    };
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      pulled = Math.max(0, Math.min(44, e.clientY - start.y));
      if (pulled > 3) moved = true;
      stretch(pulled);
    };
    const up = () => {
      if (!start) return;
      start = null;
      if (moved && pulled > 18) flip();
      spring();
    };
    const click = (e: MouseEvent) => {
      // A drag already decided; a plain click (or Enter/Space) gives the cord a tug of its own.
      if (moved) {
        moved = false;
        e.preventDefault();
        return;
      }
      stretch(16);
      spring();
      flip();
    };
    b.addEventListener("pointerdown", down);
    b.addEventListener("pointermove", move);
    b.addEventListener("pointerup", up);
    b.addEventListener("pointercancel", up);
    b.addEventListener("click", click);
    return () => {
      b.removeEventListener("pointerdown", down);
      b.removeEventListener("pointermove", move);
      b.removeEventListener("pointerup", up);
      b.removeEventListener("pointercancel", up);
      b.removeEventListener("click", click);
    };
  }, []);

  return (
    <div className="hlamp" data-dark={dark || undefined}>
      <span className="hlamp-shade" aria-hidden>
        <svg viewBox="0 0 48 30" width="48" height="30">
          <path d="M24 0 V6" stroke="currentColor" strokeWidth="2" />
          <path d="M10 26 Q24 2 38 26 Z" fill="var(--oxblood)" stroke="var(--espresso)" strokeWidth="1.5" />
          <ellipse cx="24" cy="26" rx="14" ry="3" fill="var(--espresso)" />
          <circle className="hlamp-bulb" cx="24" cy="27" r="4.2" />
        </svg>
        <span className="hlamp-glow" />
      </span>
      <span ref={cord} className="hlamp-cord" aria-hidden>
        <span className="hlamp-string" />
      </span>
      <button
        ref={bead}
        type="button"
        className="hlamp-bead"
        aria-label={dark ? "Pull the cord: lights up" : "Pull the cord: lights down"}
        title="Pull the cord for the lights"
      >
        <span className="hlamp-ball" aria-hidden />
        {hint && (
          <span className="hlamp-tag" aria-hidden>
            pull me
          </span>
        )}
      </button>
    </div>
  );
}

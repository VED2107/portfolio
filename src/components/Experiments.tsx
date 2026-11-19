"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Experiment } from "@/lib/content";
import { ArrowLeft, ArrowRight, CloseIcon, PauseIcon, PlayIcon } from "./icons";

const SPEED = 24; // px per second

/** Width per item: the strip mixes proportions on purpose, like a pinboard. */
function widthOf(e: Experiment, i: number) {
  if (e.repo) return "clamp(230px, 22vw, 300px)";
  return i % 3 === 0 ? "clamp(300px, 34vw, 500px)" : "clamp(270px, 28vw, 420px)";
}

/**
 * A horizontal strip the visitor controls: native swipe and trackpad scroll, previous/next
 * buttons, and on a fine pointer a slow drift that the visitor can pause. The drift also stops on
 * hover, focus, pointer contact, a hidden tab, while off screen, and entirely with reduced motion.
 * Items are never duplicated, so screen readers meet each one once; the drift turns around at the ends.
 */
export function Experiments({ items, head }: { items: Experiment[]; head: React.ReactNode }) {
  const strip = useRef<HTMLUListElement>(null);
  const [playing, setPlaying] = useState(false);
  const [canDrift, setCanDrift] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [active, setActive] = useState<Experiment | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const hold = useRef(0); // reasons to pause: hover, focus, touch, hidden, offscreen
  const reasons = useRef(new Set<string>());
  const dir = useRef(1);

  const pause = useCallback((why: string, on: boolean) => {
    if (on) reasons.current.add(why);
    else reasons.current.delete(why);
    hold.current = reasons.current.size;
  }, []);

  // Decide whether drift is offered at all.
  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const ok = fine.matches && !calm.matches;
      setCanDrift(ok);
      setPlaying(ok);
    };
    update();
    fine.addEventListener("change", update);
    calm.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      calm.removeEventListener("change", update);
    };
  }, []);

  // Track the ends so the buttons can say when there's nothing further.
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const onScroll = () => setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Pause when the tab is hidden or the strip is off screen.
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const vis = () => pause("hidden", document.hidden);
    document.addEventListener("visibilitychange", vis);
    const io = new IntersectionObserver(([e]) => pause("offscreen", !e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => {
      document.removeEventListener("visibilitychange", vis);
      io.disconnect();
    };
  }, [pause]);

  // The drift itself: a constant speed, no easing, ping-pong at the ends.
  useEffect(() => {
    if (!playing || !canDrift) return;
    const el = strip.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    let carry = 0;
    const step = (t: number) => {
      const dt = Math.min(64, t - last);
      last = t;
      if (hold.current === 0) {
        carry += (SPEED * dt) / 1000;
        const px = Math.trunc(carry);
        if (px !== 0) {
          carry -= px;
          const max = el.scrollWidth - el.clientWidth;
          let next = el.scrollLeft + px * dir.current;
          if (next >= max) {
            next = max;
            dir.current = -1;
          } else if (next <= 0) {
            next = 0;
            dir.current = 1;
          }
          el.scrollLeft = next;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, canDrift]);

  function nudge(d: 1 | -1) {
    const el = strip.current;
    if (!el) return;
    dir.current = d;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: d * Math.max(280, el.clientWidth * 0.7), behavior: calm ? "auto" : "smooth" });
  }

  function open(e: Experiment, from: HTMLElement) {
    opener.current = from;
    setActive(e);
  }
  useEffect(() => {
    const d = dialog.current;
    if (active && d && !d.open) d.showModal();
  }, [active]);
  function close() {
    dialog.current?.close();
  }

  return (
    <>
      <div className="wrap exp-head">
        {head}
      <div className="exp-controls" role="group" aria-label="Experiments controls">
        <button type="button" className="ctrl" onClick={() => nudge(-1)} disabled={edges.start} aria-label="Previous experiments">
          <ArrowLeft />
        </button>
        <button type="button" className="ctrl" onClick={() => nudge(1)} disabled={edges.end} aria-label="Next experiments">
          <ArrowRight />
        </button>
        {canDrift && (
          <button type="button" className="ctrl ctrl-play" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing} aria-label={playing ? "Pause the moving strip" : "Play the moving strip"}>
            {playing ? <PauseIcon /> : <PlayIcon />}
            <span aria-hidden>{playing ? "Pause" : "Play"}</span>
          </button>
        )}
      </div>
      </div>

      <ul
        ref={strip}
        className="strip"
        data-snap={!playing}
        aria-label="Experiments and smaller builds"
        tabIndex={0}
        onPointerEnter={() => pause("hover", true)}
        onPointerLeave={() => pause("hover", false)}
        onPointerDown={() => pause("touch", true)}
        onPointerUp={() => window.setTimeout(() => pause("touch", false), 1200)}
        onWheel={() => {
          pause("wheel", true);
          window.setTimeout(() => pause("wheel", false), 1500);
        }}
        onFocus={() => pause("focus", true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) pause("focus", false);
        }}
      >
        {items.map((e, i) => (
          <li key={e.id} style={{ "--w": widthOf(e, i) } as React.CSSProperties}>
            <button type="button" className="exp" onClick={(ev) => open(e, ev.currentTarget)} aria-haspopup="dialog">
              <span className="exp-media">
                {e.img ? (
                  <Image src={e.img.src} alt={e.img.alt} fill sizes="(max-width: 760px) 80vw, 34vw" />
                ) : (
                  <span className="exp-type" style={{ "--tone": e.tone } as React.CSSProperties}>
                    <span>Repository</span>
                    <b>{e.repo}</b>
                  </span>
                )}
              </span>
              <span className="exp-cap">
                <b>{e.title}</b>
                <span>{e.context}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="sheet"
        aria-labelledby="exp-title"
        onClose={() => {
          setActive(null);
          opener.current?.focus();
        }}
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) close();
        }}
      >
        {active && (
          <>
            <button type="button" className="icon-btn sheet-close" onClick={close} aria-label="Close">
              <CloseIcon />
            </button>
            {active.img && (
              <Image src={active.img.src} alt={active.img.alt} width={active.img.w} height={active.img.h} sizes="880px" style={{ display: "block", width: "100%", height: "auto" }} />
            )}
            <div className="sheet-body">
              <p className="t-meta" style={{ margin: 0 }}>
                {active.context} · {active.role}
              </p>
              <h3 id="exp-title" className="t-h2">
                {active.title}
              </h3>
              <p className="t-body" style={{ margin: 0, maxWidth: "62ch" }}>
                {active.detail}
              </p>
              {active.href &&
                (active.internal ? (
                  <Link href={active.href} className="arrow-link" onClick={close}>
                    <span className="label">Read the case study</span> <span className="ar">→</span>
                  </Link>
                ) : (
                  <a href={active.href} className="arrow-link" rel="noopener">
                    <span className="label">{active.href.includes("github.com") ? "View the repository" : "Visit the site"}</span> <span className="ar up">↗</span>
                  </a>
                ))}
            </div>
          </>
        )}
      </dialog>
    </>
  );
}

"use client";

import Link from "next/link";
import { ViewTransition, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Flip } from "gsap/Flip";
import { RELEASES, getRelease, type Release } from "@/lib/catalog";
import { MATERIAL, STAGGER, setupGsap } from "@/lib/motion";
import { reduced } from "@/lib/capability";
import { returnSource, takeHandoff } from "@/lib/handoff";
import { addToBasket } from "@/lib/basket";
import { play } from "@/lib/sound";
import { toast } from "@/lib/events";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { Sleeve } from "./Sleeve";
import { Vinyl } from "./Vinyl";

/**
 * The listening booth. A release pulled from anywhere lands here: the same sleeve, carried by
 * Flip from wherever it was, with the record sliding out beside it. Everything a reviewer needs
 * is printed on it: what it is, what it's made of, the decisions as a track list. Spin the
 * record yourself; play it backwards and the run-out groove has something to say.
 */
export function Inspect() {
  const [slug, setSlug] = useState<string | null>(null);
  const [backmasked, setBackmasked] = useState(false);
  const r = slug ? getRelease(slug) : undefined;
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const entered = useRef<string | null>(null);
  const closing = useRef(false);

  const open = useCallback((s: string) => {
    if (!getRelease(s)) return;
    opener.current ??= document.activeElement as HTMLElement;
    setBackmasked(false);
    setSlug(s);
    addToBasket(s);
    if (history.state?.inspect) history.replaceState({ inspect: s }, "");
    else history.pushState({ inspect: s }, "");
  }, []);

  const finish = useCallback(() => {
    closing.current = false;
    entered.current = null;
    setSlug(null);
    const src = returnSource();
    if (src) src.style.visibility = "";
    opener.current?.focus?.({ preventScroll: true });
    opener.current = null;
  }, []);

  /** Put the record away: the sleeve flies back to its slot in the crate if it came from one. */
  const close = useCallback(
    (fromHistory = false) => {
      if (closing.current || !panel.current) return;
      closing.current = true;
      if (!fromHistory && history.state?.inspect) history.back();
      play("sleeve");
      const gsap = setupGsap();
      const sleeve = panel.current.querySelector<HTMLElement>(".booth-sleeve .sleeve");
      const src = document.querySelector<HTMLElement>(`.crate-record [data-flip-id="sleeve-${slug}"]`);
      const tl = gsap.timeline({ onComplete: finish });
      if (reduced()) {
        tl.to(panel.current, { autoAlpha: 0, duration: 0.2 });
        return;
      }
      tl.to(panel.current.querySelectorAll(".booth-info, .booth-vinyl"), { autoAlpha: 0, duration: 0.18, ease: MATERIAL.ui.ease }, 0);
      const r = src?.getBoundingClientRect();
      if (sleeve && src && r && r.bottom > 0 && r.top < innerHeight) {
        tl.add(Flip.fit(sleeve, src, { duration: MATERIAL.sleeve.duration * 0.8, ease: "power3.inOut" }) as gsap.core.Tween, 0.05);
      } else if (sleeve) {
        tl.to(sleeve, { y: 40, autoAlpha: 0, duration: 0.3, ease: MATERIAL.paper.ease }, 0.05);
      }
      tl.to(panel.current.querySelector(".booth-backdrop"), { autoAlpha: 0, duration: 0.3 }, 0.15);
    },
    [finish, slug],
  );

  // Open from anywhere: the crate, the window, the catalogue terminal.
  useEffect(() => {
    const on = (e: Event) => open((e as CustomEvent).detail.slug);
    const pop = () => {
      if (!history.state?.inspect && slug) close(true);
      else if (history.state?.inspect && history.state.inspect !== slug) setSlug(history.state.inspect);
    };
    addEventListener("ved:inspect", on);
    addEventListener("popstate", pop);
    return () => {
      removeEventListener("ved:inspect", on);
      removeEventListener("popstate", pop);
    };
  }, [open, close, slug]);

  useEffect(() => {
    if (!slug) return;
    lockScroll();
    return () => unlockScroll();
  }, [slug]);

  // Arrival. Runs before paint so the sleeve never flashes in its final place.
  useLayoutEffect(() => {
    if (!slug || !panel.current) return;
    const el = panel.current;
    const gsap = setupGsap();
    const sleeve = el.querySelector<HTMLElement>(".booth-sleeve .sleeve")!;
    const vinyl = el.querySelector<HTMLElement>(".booth-vinyl")!;
    const info = el.querySelectorAll(".booth-info > *");
    const first = entered.current === null;
    entered.current = slug;
    el.querySelector<HTMLElement>(".booth-close")?.focus({ preventScroll: true });

    if (reduced()) {
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
      return;
    }
    const h = takeHandoff(slug);
    const tl = gsap.timeline();
    if (first) tl.fromTo(el.querySelector(".booth-backdrop"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power1.out" }, 0);
    if (h) {
      h.source.style.visibility = "hidden";
      tl.add(Flip.from(h.state, { targets: sleeve, duration: MATERIAL.sleeve.duration, ease: MATERIAL.sleeve.ease, scale: true }), 0);
    } else {
      tl.from(sleeve, { y: first ? 60 : 0, x: first ? 0 : 30, autoAlpha: 0, duration: MATERIAL.sleeve.duration, ease: MATERIAL.sleeve.ease }, 0);
    }
    // Then the record slides out of the sleeve, heavy, and settles.
    tl.fromTo(vinyl, { xPercent: -46, rotate: -40 }, { xPercent: 0, rotate: 0, duration: MATERIAL.vinyl.duration, ease: MATERIAL.vinyl.ease }, h ? 0.35 : 0.2)
      .add(() => play("needle"), h ? 0.6 : 0.45)
      .from(info, { y: 18, autoAlpha: 0, duration: MATERIAL.paper.duration, stagger: STAGGER.tight, ease: MATERIAL.paper.ease }, 0.18);
    return () => {
      tl.kill();
    };
  }, [slug]);

  // The record turns: slowly by itself, faster under your hand, and backwards if you insist.
  useEffect(() => {
    if (!slug || !panel.current) return;
    const disc = panel.current.querySelector<HTMLElement>(".booth-vinyl .vinyl-disc");
    if (!disc) return;
    const gsap = setupGsap();
    const idle = reduced() ? 0 : 0.6;
    let angle = 0;
    let vel = idle;
    let held = false;
    let lastA = 0;
    let backwards = 0;
    let found = false;
    const center = () => {
      const b = disc.getBoundingClientRect();
      return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    };
    const at = (e: PointerEvent) => {
      const c = center();
      return (Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180) / Math.PI;
    };
    const down = (e: PointerEvent) => {
      held = true;
      lastA = at(e);
      vel = 0;
      disc.setPointerCapture(e.pointerId);
      disc.dataset.held = "";
    };
    const move = (e: PointerEvent) => {
      if (!held) return;
      const a = at(e);
      let d = a - lastA;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      lastA = a;
      angle += d;
      vel = d;
    };
    const up = () => {
      held = false;
      delete disc.dataset.held;
    };
    const frame = () => {
      if (!held) {
        vel += (idle - vel) * 0.02;
        angle += vel;
      }
      if (vel < -4) backwards += -vel;
      else backwards = Math.max(0, backwards - 2);
      if (!found && backwards > 900) {
        found = true;
        setBackmasked(true);
        play("needle");
        toast("Played backwards. The run-out groove is readable now.");
      }
      disc.style.transform = `rotate(${angle}deg)`;
    };
    disc.addEventListener("pointerdown", down);
    disc.addEventListener("pointermove", move);
    disc.addEventListener("pointerup", up);
    disc.addEventListener("pointercancel", up);
    gsap.ticker.add(frame);
    return () => {
      gsap.ticker.remove(frame);
      disc.removeEventListener("pointerdown", down);
      disc.removeEventListener("pointermove", move);
      disc.removeEventListener("pointerup", up);
      disc.removeEventListener("pointercancel", up);
    };
  }, [slug]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!slug) return;
      const i = RELEASES.findIndex((x) => x.slug === slug);
      play("paper");
      open(RELEASES[(i + dir + RELEASES.length) % RELEASES.length].slug);
    },
    [slug, open],
  );

  // Keys: Esc puts it back, arrows browse the crate, Tab stays in the booth.
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && !(e.target as HTMLElement).closest("summary")) {
      step(e.key === "ArrowRight" ? 1 : -1);
    } else if (e.key === "Tab" && panel.current) {
      const f = [...panel.current.querySelectorAll<HTMLElement>("a[href], button, summary")].filter((x) => x.offsetParent !== null);
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        f[f.length - 1]?.focus();
      } else if (!e.shiftKey && i === f.length - 1) {
        e.preventDefault();
        f[0]?.focus();
      }
    }
  };

  if (!r) return null;
  const live = r.links.find((l) => !l.href.includes("github.com"));
  const source = r.links.find((l) => l.href.includes("github.com"));
  const sides: ("A" | "B")[] = ["A", "B"];

  return (
    <div ref={panel} className="booth" role="dialog" aria-modal="true" aria-labelledby="booth-title" onKeyDown={onKey} data-backmasked={backmasked || undefined}>
      <div className="booth-backdrop" onClick={() => close()} aria-hidden />
      <div className="booth-body">
        <div className="booth-stage">
          <div className="booth-vinyl" data-cursor="Spin">
            <Vinyl r={r} />
          </div>
          <div className="booth-sleeve">
            <ViewTransition name={`cover-${r.slug}`} share="cover">
              <Sleeve r={r} flipId={`sleeve-${r.slug}`} sizes="(min-width: 1024px) 38vw, 80vw" />
            </ViewTransition>
          </div>
          <p className="booth-runout cat" aria-live="polite">
            {backmasked ? `Run-out, ${r.cat}-A: “${r.runout}”` : "Drag the record to spin it"}
          </p>
        </div>

        <div className="booth-info">
          <div className="booth-bar">
            <button type="button" className="booth-close" onClick={() => close()}>
              <span aria-hidden>←</span> Put it back
            </button>
            <span className="booth-nav">
              <button type="button" onClick={() => step(-1)} aria-label="Previous record in the crate">
                Prev
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next record in the crate">
                Next
              </button>
            </span>
          </div>
          <p className="cat ink-3">
            {r.cat} · {r.label} · {r.format} · {r.year}
          </p>
          <h2 id="booth-title" className="booth-title display">
            {r.title}
          </h2>
          <p className="lede">{r.short}</p>

          <dl className="booth-credits">
            <div>
              <dt className="pk ink-3">Produced</dt>
              <dd>{r.role}</dd>
            </div>
            <div>
              <dt className="pk ink-3">Status</dt>
              <dd>{r.status}</dd>
            </div>
            <div>
              <dt className="pk ink-3">Engineered with</dt>
              <dd>{r.credits.join(" · ")}</dd>
            </div>
          </dl>

          <div className="booth-tracks">
            {sides.map((side) => {
              const tracks = r.tracks.filter((t) => t.side === side);
              if (!tracks.length) return null;
              return (
                <div key={side} className="booth-side">
                  <p className="pk">Side {side}</p>
                  <ol>
                    {tracks.map((t) => (
                      <li key={t.title}>
                        <details onToggle={(e) => (e.currentTarget.open ? play("paper") : undefined)}>
                          <summary>
                            <span className="cat ink-3">
                              {t.side}
                              {t.n}
                            </span>
                            {t.title}
                          </summary>
                          <p className="small">{t.body}</p>
                        </details>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>

          <div className="booth-actions">
            <Link href={`/work/${r.slug}`} className="press" transitionTypes={["nav-forward"]} onClick={() => play("paper")}>
              Read the liner notes
            </Link>
            {live && (
              <a className="ink-link" href={live.href} target="_blank" rel="noreferrer">
                Play it live ↗
              </a>
            )}
            {source && (
              <a className="ink-link" href={source.href} target="_blank" rel="noreferrer">
                Source ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { Release };

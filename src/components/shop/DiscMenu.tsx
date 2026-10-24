"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { Film } from "@/lib/catalog";
import { MATERIAL, setupGsap } from "@/lib/motion";
import { fine, reduced } from "@/lib/capability";
import { play } from "@/lib/sound";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { takeCase } from "@/lib/handoff";
import { FilmCover } from "./FilmCover";

/**
 * The disc menu, as a menu screen should be: a main menu, chapters, special features. The disc
 * itself slides out of the case and catches the light as your pointer moves across it.
 */
export function DiscMenu({ film: f, onClose }: { film: Film; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  // Esc ejects wherever focus happens to be.
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [onClose]);

  useEffect(() => {
    opener.current = document.activeElement as HTMLElement;
    lockScroll();
    play("case");
    return () => {
      unlockScroll();
      opener.current?.focus?.({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    el.querySelector<HTMLElement>(".menu-first")?.focus({ preventScroll: true });
    const src = takeCase();
    if (reduced()) return;
    const gsap = setupGsap();
    const caseEl = el.querySelector<HTMLElement>(".menu-case")!;
    const from = (target: HTMLElement): gsap.TweenVars => {
      if (!src) return { y: 30, rotateY: -14, duration: MATERIAL.plastic.duration + 0.2, ease: MATERIAL.sleeve.ease };
      const t = target.getBoundingClientRect();
      const a = src.rect;
      return {
        x: a.left + a.width / 2 - (t.left + t.width / 2),
        y: a.top + a.height / 2 - (t.top + t.height / 2),
        scaleX: a.width / t.width,
        scaleY: a.height / t.height,
        rotateY: src.spine ? 78 : 0,
        transformPerspective: 1400,
        duration: MATERIAL.plastic.duration + 0.32,
        ease: MATERIAL.plastic.ease,
      };
    };
    const tl = gsap
      .timeline()
      // Opacity only: hiding the dialog with visibility would drop the focus we just put in it.
      .fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" })
      // The case comes off the shelf from exactly where it stood: a spine swings round to face
      // you on the way, a face-out case just travels. Plastic: quick, with a hinge's overshoot.
      .from(caseEl, from(caseEl), 0)
      .from(el.querySelector(".disc"), { xPercent: -52, rotate: -60, duration: MATERIAL.vinyl.duration, ease: MATERIAL.vinyl.ease }, 0.15)
      .from(el.querySelectorAll(".menu-list > *"), { x: 18, autoAlpha: 0, duration: MATERIAL.paper.duration, stagger: 0.04, ease: MATERIAL.paper.ease }, 0.2);
    return () => {
      tl.kill();
    };
  }, []);

  // Light catches the disc: pointer position becomes the angle of the rainbow band.
  useEffect(() => {
    const el = root.current;
    const disc = el?.querySelector<HTMLElement>(".disc");
    if (!el || !disc || !fine() || reduced()) return;
    const move = (e: PointerEvent) => {
      const b = disc.getBoundingClientRect();
      const a = (Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2)) * 180) / Math.PI;
      disc.style.setProperty("--a", `${a + 90}deg`);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    const items = [...(root.current?.querySelectorAll<HTMLElement>(".menu-item") ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
      play("key");
    } else if (e.key === "Tab") {
      e.preventDefault();
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length]?.focus();
    }
  };

  return (
    <div ref={root} className="discmenu" role="dialog" aria-modal="true" aria-labelledby="dm-title" onKeyDown={onKey}>
      <div className="discmenu-inner frame">
        <div className="menu-stage">
          <div className="disc" aria-hidden style={{ "--tone": f.tone } as React.CSSProperties}>
            <span className="disc-label">
              <span className="pk">{f.cat}</span>
              <span className="disc-title">{f.title}</span>
            </span>
          </div>
          <div className="menu-case">
            <FilmCover f={f} sizes="(min-width: 1024px) 34vw, 70vw" />
            <span className="case-plastic" aria-hidden />
          </div>
        </div>

        <div className="menu-panel">
          <p className="pk film-ink-3">
            {f.cat} · {f.edition} · {f.year}
          </p>
          <h2 id="dm-title" className="h2">
            {f.title}
          </h2>
          <p className="menu-logline">{f.logline}</p>
          <span className="cert pk" data-maturity={f.maturity ?? "Skill"}>
            {f.maturity ?? f.edition}
          </span>

          <ul className="menu-list" aria-label="Main menu">
            <li>
              {f.internal ? (
                <Link href={f.href} className="menu-item menu-first" transitionTypes={["nav-forward"]} onClick={() => play("needle")}>
                  {f.kind === "skill" ? "Play the lead release" : "Play feature"}
                  {f.kind === "skill" && <span className="film-ink-3">{f.chapters[0]?.label}</span>}
                </Link>
              ) : (
                <a href={f.href} className="menu-item menu-first" target="_blank" rel="noreferrer" onClick={() => play("needle")}>
                  Play feature <span className="film-ink-3">↗ {new URL(f.href).host}</span>
                </a>
              )}
            </li>
            <li className="menu-group">
              <p className="pk film-ink-3">{f.kind === "skill" ? "Appears on" : "Chapters"}</p>
              <ol>
                {f.chapters.map((c, i) => (
                  <li key={c.label} className="menu-chapter">
                    <span className="cat film-ink-3">{String(i + 1).padStart(2, "0")}</span>
                    {c.href ? (
                      <Link href={c.href} className="menu-chapter-link" transitionTypes={["nav-forward"]}>
                        {c.label}
                      </Link>
                    ) : (
                      c.label
                    )}
                  </li>
                ))}
              </ol>
            </li>
            <li className="menu-group">
              <p className="pk film-ink-3">{f.kind === "skill" ? "Liner excerpts" : "Special features"}</p>
              <ul>
                {f.features.map((x) => (
                  <li key={x} className="menu-chapter">
                    {x}
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <button type="button" className="menu-item" onClick={onClose}>
                Eject <span className="film-ink-3">Esc</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

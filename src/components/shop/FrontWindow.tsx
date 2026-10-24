"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { NOW, SITE } from "@/lib/site";
import { NEW_RELEASES, getRelease } from "@/lib/catalog";
import { DEPTH, MATERIAL, setupGsap } from "@/lib/motion";
import { fine, reduced } from "@/lib/capability";
import { openCatalog } from "@/lib/events";
import { pullOut } from "@/lib/handoff";
import { scrollToTarget } from "@/lib/scroll";
import { Sleeve } from "./Sleeve";
import { Vinyl } from "./Vinyl";
import { useShopHours } from "./useShopHours";

/**
 * The front window, just as the lights come on. The name in the shop's display face, what is
 * sold here in one sentence, and this month's new releases standing on the window shelf, one
 * of them already out of its sleeve.
 */
export function FrontWindow() {
  const root = useRef<HTMLElement>(null);
  const hours = useShopHours();
  const releases = NEW_RELEASES.map((s) => getRelease(s)!);
  const [front, ...back] = releases;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const gsap = setupGsap();
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      if (reduced()) {
        gsap.set(q("[data-enter]"), { autoAlpha: 1 });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: MATERIAL.sleeve.ease } });
      // The lights: the window brightens in two steps, like tubes warming up.
      tl.set(q("[data-enter]"), { autoAlpha: 1 })
        .fromTo(q(".lights"), { opacity: 0.86 }, { opacity: 0.35, duration: 0.14, ease: "steps(2)" })
        .to(q(".lights"), { opacity: 0.55, duration: 0.08 })
        .to(q(".lights"), { opacity: 0, duration: 0.6, ease: "power2.out" })
        .from(q(".fw-ved-ch"), { yPercent: 105, duration: MATERIAL.vinyl.duration, stagger: 0.07, ease: MATERIAL.vinyl.ease }, 0.15)
        .from(q(".fw-meta > *, .fw-lede, .fw-actions"), { y: 14, autoAlpha: 0, duration: MATERIAL.paper.duration, stagger: 0.05, ease: MATERIAL.paper.ease }, 0.45)
        .from(q(".fw-stand"), { y: 60, autoAlpha: 0, duration: MATERIAL.sleeve.duration, stagger: 0.09 }, 0.3)
        .from(q(".fw-front .vinyl"), { xPercent: -38, rotate: -50, duration: MATERIAL.vinyl.duration, ease: MATERIAL.vinyl.ease }, 0.75)
        .from(q(".fw-tag"), { y: -16, rotate: 0, autoAlpha: 0, duration: MATERIAL.paper.duration, stagger: 0.06, ease: MATERIAL.paper.ease }, 0.9);

      // The record on display turns with the scroll: faster scrolling, faster turn, then it settles.
      const disc = q(".fw-front .vinyl-disc")[0] as HTMLElement | undefined;
      if (disc) {
        let angle = 0;
        let vel = 0;
        let last = scrollY;
        let visible = true;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(el);
        const turn = () => {
          if (!visible) return;
          const y = scrollY;
          vel += (y - last) * 0.05;
          last = y;
          vel *= 0.92;
          angle += 0.12 + vel;
          disc.style.transform = `rotate(${angle}deg)`;
        };
        gsap.ticker.add(turn);
        return () => {
          gsap.ticker.remove(turn);
          io.disconnect();
        };
      }
    }, el);

    // Pointer light on the window display, fine pointers only.
    const stage = el.querySelector<HTMLElement>(".fw-display");
    let off = () => {};
    if (stage && fine() && !reduced()) {
      const rx = gsap.quickTo(stage, "rotationX", { duration: 0.8, ease: "power3.out" });
      const ry = gsap.quickTo(stage, "rotationY", { duration: 0.8, ease: "power3.out" });
      // The glass doesn't tilt with the display; only its reflection slides, the opposite way, slower.
      const sweep = el.querySelector<HTMLElement>(".fw-glass-sweep");
      const sx = sweep ? gsap.quickTo(sweep, "xPercent", { duration: 1.4, ease: "power3.out" }) : null;
      // Measure once per enter/scroll, never per pointer event.
      let b = stage.getBoundingClientRect();
      let stale = false;
      const measure = () => {
        b = stage.getBoundingClientRect();
        stale = false;
      };
      const dirty = () => (stale = true);
      el.addEventListener("pointerenter", measure);
      addEventListener("scroll", dirty, { passive: true });
      addEventListener("resize", dirty);
      const move = (e: PointerEvent) => {
        if (stale) measure();
        const x = (e.clientX - b.left) / b.width - 0.5;
        const y = (e.clientY - b.top) / b.height - 0.5;
        rx(-y * DEPTH.tilt);
        ry(x * DEPTH.tilt);
        sx?.(-x * 22);
        stage.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
        stage.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
      };
      const leave = () => {
        rx(0);
        ry(0);
        sx?.(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      off = () => {
        el.removeEventListener("pointerenter", measure);
        removeEventListener("scroll", dirty);
        removeEventListener("resize", dirty);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    }
    return () => {
      off();
      ctx.revert();
    };
  }, []);

  return (
    <section id="shop" ref={root} className="fw grain" aria-labelledby="fw-title">
      <div className="lights" aria-hidden />
      <div className="frame fw-grid">
        <div className="fw-copy">
          <p className="fw-meta pk" data-enter>
            <span>VED Records &amp; Film</span>
            <span>Est. 2024 · Ahmedabad</span>
            <span className="fw-sign" data-open={hours.open || undefined}>
              <i aria-hidden /> {hours.label}
            </span>
          </p>
          <h1 id="fw-title" className="fw-name">
            <span className="fw-ved display" aria-hidden data-enter>
              {"Ved".split("").map((c, i) => (
                <span className="fw-ved-mask" key={i}>
                  <span className="fw-ved-ch">{c}</span>
                </span>
              ))}
            </span>
            <span className="sr-only">Ved S. Chauhan</span>
            <span className="fw-full pk" aria-hidden>
              S. Chauhan — software engineer
            </span>
          </h1>
          <p className="fw-lede lede" data-enter>
            I build developer tools and the products people run their day on, and I run{" "}
            <a className="ink-link" href={SITE.studioUrl} target="_blank" rel="noreferrer">
              SNOWBROS
            </a>
            , an independent software studio. This shop only stocks what I made.
          </p>
          <div className="fw-actions" data-enter>
            <a
              href="#records"
              className="press"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget("#records");
              }}
            >
              Dig through the records
            </a>
            <button type="button" className="press" data-tone="paper" onClick={() => openCatalog()}>
              Search the catalogue <span className="kbd">/</span>
            </button>
          </div>
        </div>

        <div className="fw-display" aria-label="New releases in the window">
          {back.map((r, i) => (
            <button key={r.slug} type="button" className={`fw-stand fw-back fw-back-${i}`} onClick={(e) => pullOut(r.slug, e.currentTarget.querySelector<HTMLElement>(".sleeve"))} data-cursor="Pull" data-enter aria-label={`${r.title}, ${r.cat}. Pull it out.`}>
              <Sleeve r={r} sticker={false} flipId={`sleeve-${r.slug}`} sizes="(min-width: 1024px) 18vw, 40vw" />
            </button>
          ))}
          <button type="button" className="fw-stand fw-front" onClick={(e) => pullOut(front.slug, e.currentTarget.querySelector<HTMLElement>(".sleeve"))} data-cursor="Pull" data-enter aria-label={`New release: ${front.title}, ${front.cat}. Pull it out.`}>
            <Vinyl r={front} />
            <Sleeve r={front} flipId={`sleeve-${front.slug}`} sizes="(min-width: 1024px) 30vw, 72vw" priority />
          </button>
          {/* The sill the display stands on: the same timber as the shelves inside. */}
          <span className="fw-ledge" aria-hidden />
          {/* The shop window itself, between you and the stock: one broad reflection that slides as you move. */}
          <span className="fw-glass" aria-hidden>
            <span className="fw-glass-sweep" />
          </span>
        </div>
      </div>

      {/* The window shelf: price-tag labels for what is on the counter right now. */}
      <div className="fw-shelf">
        <ul className="frame fw-tags" aria-label="This month">
          {NOW.rows.slice(0, 3).map((n) => (
            <li key={n.what} className="fw-tag" data-enter>
              <span className="pk ink-3">{n.verb}</span>
              {n.href?.startsWith("/") ? (
                <Link href={n.href} className="fw-tag-what">
                  {n.what}
                </Link>
              ) : (
                <span className="fw-tag-what">{n.what}</span>
              )}
              <span className="fw-tag-detail">{n.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

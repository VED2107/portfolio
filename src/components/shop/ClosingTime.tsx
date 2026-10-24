"use client";

import { useEffect, useRef } from "react";
import { SITE } from "@/lib/site";
import { setupGsap } from "@/lib/motion";
import { reduced } from "@/lib/capability";
import { scrollToTarget } from "@/lib/scroll";

/**
 * Closing time. The shutter comes down over the shop's name as you reach the end, and the
 * manufacturing credits are printed underneath, like the small print on the back of a sleeve.
 */
export function ClosingTime() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const gsap = setupGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(".shutter", { yPercent: -100 }, { yPercent: -38, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom bottom", scrub: 0.5 } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={root} className="closing" aria-label="Closing time">
      <div className="closing-word-wrap">
        <p className="closing-word display" aria-hidden>
          Ved
        </p>
        <div className="shutter" aria-hidden>
          <span className="pk shutter-sign">Closed · back tomorrow at 9</span>
        </div>
      </div>
      <div className="frame closing-credits">
        <dl className="small-print">
          <div>
            <dt className="pk">Pressed</dt>
            <dd>Ahmedabad, India, by Ved S. Chauhan</dd>
          </div>
          <div>
            <dt className="pk">Matrix</dt>
            <dd className="cat">VED-2026-04 · fourth pressing of this site</dd>
          </div>
          <div>
            <dt className="pk">Cut on</dt>
            <dd>Next.js 16 · React 19 · GSAP · Lenis · Web Audio</dd>
          </div>
          <div>
            <dt className="pk">Fine print</dt>
            <dd>Every number is traceable to a repository or a live product. No testimonial was invented.</dd>
          </div>
        </dl>
        <div className="closing-row">
          <p className="small">© 2026 Ved S. Chauhan. Built under SNOWBROS.</p>
          <nav className="closing-links" aria-label="Elsewhere">
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <a href={SITE.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={SITE.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={SITE.resume} target="_blank" rel="noreferrer">
              Résumé
            </a>
          </nav>
          <button type="button" className="ink-link closing-top" onClick={() => scrollToTarget(0)}>
            Back to the front ↑
          </button>
        </div>
      </div>
    </footer>
  );
}

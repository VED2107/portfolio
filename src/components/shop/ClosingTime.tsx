"use client";

import { useEffect, useRef } from "react";
import { SITE } from "@/lib/site";
import { setupGsap } from "@/lib/motion";
import { reduced } from "@/lib/capability";
import { scrollToTarget } from "@/lib/scroll";
import { useShopHours } from "./useShopHours";

const JACKS = [
  { label: "Mail", value: SITE.email, href: `mailto:${SITE.email}` },
  { label: "GitHub", value: "VED2107", href: SITE.github },
  { label: "LinkedIn", value: "ved-chauhan2107", href: SITE.linkedin },
  { label: "Résumé", value: "PDF, one page", href: SITE.resume },
];

/**
 * Closing time. The shutter comes down over the shop's name as you reach the end, and the
 * manufacturing credits are printed underneath, like the small print on the back of a sleeve.
 */
export function ClosingTime() {
  const root = useRef<HTMLElement>(null);
  const hours = useShopHours();
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
      {/* The rear panel: inputs and outputs, silkscreened, and the maker's serial plate. */}
      <div className="frame rear">
        <ul className="jacks" aria-label="Contact">
          {JACKS.map((j) => (
            <li key={j.label}>
              <a className="jack" href={j.href} target={j.href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer">
                <span className="jack-socket" aria-hidden />
                <span className="jack-label">{j.label}</span>
                <span className="jack-value">{j.value}</span>
              </a>
            </li>
          ))}
        </ul>

        <dl className="plate">
          <div>
            <dt>Model</dt>
            <dd>VSC-24 · Records &amp; Film</dd>
          </div>
          <div>
            <dt>Pressed</dt>
            <dd>Ahmedabad, India, by Ved S. Chauhan</dd>
          </div>
          <div>
            <dt>Hours</dt>
            <dd>{hours.open ? "Open now · replies today" : "Closed · replies tomorrow from 9"}</dd>
          </div>
          <div>
            <dt>Cut on</dt>
            <dd>Next.js 16 · React 19 · GSAP · three.js · Web Audio</dd>
          </div>
          <div className="plate-wide">
            <dt>Caution</dt>
            <dd>Every number is traceable to a repository or a live product. Contains no invented testimonials.</dd>
          </div>
        </dl>

        <div className="rear-foot">
          <p className="cat">© 2026 Ved S. Chauhan · Serial VED-2107 · Built under SNOWBROS</p>
          <button type="button" className="sign-catalog rear-eject" onClick={() => scrollToTarget(0)}>
            Eject <span aria-hidden>▲</span>
            <span className="sr-only">back to the front of the shop</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

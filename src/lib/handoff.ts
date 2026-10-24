"use client";

/**
 * Flip handoff. When a sleeve leaves the crate for the inspection view, the crate records where
 * it was (GSAP Flip state) and hides it; the inspection view then animates its own sleeve, which
 * shares the same data-flip-id, from that exact place. To the eye it is one object travelling.
 */
import { Flip } from "gsap/Flip";
import { DEPTH, MATERIAL, setupGsap } from "./motion";
import { reduced } from "./capability";
import { inspect } from "./events";
import { play } from "./sound";

type Handoff = { state: Flip.FlipState; source: HTMLElement; slug: string };
let pending: Handoff | null = null;
let lastSource: HTMLElement | null = null;
let pulling = false;

export function handOff(slug: string, source: HTMLElement) {
  pending = { state: Flip.getState(source), source, slug };
  lastSource = source;
}

export function takeHandoff(slug: string) {
  const h = pending && pending.slug === slug ? pending : null;
  pending = null;
  return h;
}

/** Where the sleeve in the booth came from, without letting go of it. */
export const peekSource = () => lastSource;

/** The sleeve goes back where it came from: the crate shows it again, seated in its slot. */
export function returnSource() {
  const s = lastSource;
  lastSource = null;
  return s;
}

/**
 * Pull a sleeve out of wherever it stands, then hand it to the listening booth.
 *
 *  1. release   the sleeve breaks contact: it rises clear of its slot with a little friction
 *  2. pull      it keeps travelling up, faster, the contact shadow left behind
 *  3. transfer  the booth takes the same object over with Flip, from the lifted position
 *
 * Only the sleeve's own transform moves here (its button keeps its CSS hover transform), so no
 * two systems ever write the same property. `neighbours` (their sleeves) fall into shadow.
 */
export function pullOut(slug: string, sleeve: HTMLElement | null, neighbours: HTMLElement[] = []) {
  if (pulling) return;
  if (!sleeve || reduced()) {
    play("sleeve");
    inspect(slug);
    return;
  }
  pulling = true;
  const gsap = setupGsap();
  play("sleeve");
  const tl = gsap.timeline({
    onComplete: () => {
      handOff(slug, sleeve);
      inspect(slug);
      gsap.to(neighbours, { opacity: 1, duration: MATERIAL.sleeve.duration, ease: MATERIAL.sleeve.ease, clearProps: "opacity", delay: 0.2 });
      pulling = false;
    },
  });
  tl.to(sleeve, { y: -DEPTH.nudge * 1.4, duration: 0.12, ease: "power1.out" })
    .to(sleeve, { y: -DEPTH.pull, duration: 0.2, ease: "power2.in" })
    .to(neighbours, { opacity: 0.55, duration: 0.24, ease: MATERIAL.paper.ease }, 0);
}

/** Seat a returning sleeve back in its slot before anything flies to it. */
export function reseat(source: HTMLElement | null) {
  if (!source) return;
  setupGsap().set(source, { clearProps: "transform" });
}

/* ---- film cases: where the opened case was standing, so the disc menu can take it from there. */
type CaseFrom = { rect: DOMRect; spine: boolean };
let caseFrom: CaseFrom | null = null;
export function caseLeaves(el: HTMLElement, spine: boolean) {
  caseFrom = { rect: el.getBoundingClientRect(), spine };
}
export function takeCase() {
  const c = caseFrom;
  caseFrom = null;
  return c;
}

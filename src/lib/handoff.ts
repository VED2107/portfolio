"use client";

/**
 * Flip handoff. When a sleeve leaves the crate for the inspection view, the crate records where
 * it was (GSAP Flip state) and hides it; the inspection view then animates its own sleeve, which
 * shares the same data-flip-id, from that exact place. To the eye it is one object travelling.
 */
import { Flip } from "gsap/Flip";

type Handoff = { state: Flip.FlipState; source: HTMLElement; slug: string };
let pending: Handoff | null = null;
let lastSource: HTMLElement | null = null;

export function handOff(slug: string, source: HTMLElement) {
  pending = { state: Flip.getState(source), source, slug };
  lastSource = source;
}

export function takeHandoff(slug: string) {
  const h = pending && pending.slug === slug ? pending : null;
  pending = null;
  return h;
}

/** The sleeve goes back where it came from: the crate shows it again. */
export function returnSource() {
  const s = lastSource;
  lastSource = null;
  return s;
}

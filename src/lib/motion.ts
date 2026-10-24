"use client";

/**
 * One motion system for the whole shop. Every moving thing is a material, and the material
 * decides its duration and easing. Components never invent a curve; they ask for a material.
 * The same values exist as CSS custom properties in globals.css for cheap CSS-only states.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";

let registered = false;
export function setupGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger, Flip, SplitText);
  gsap.defaults({ ease: MATERIAL.paper.ease, duration: MATERIAL.paper.duration });
  registered = true;
  return gsap;
}

export const MATERIAL = {
  /** A record: heavy, smooth, settles late. */
  vinyl: { duration: 1.1, ease: "expo.out" },
  /** A cardboard sleeve sliding against its neighbours: firm, a little friction. */
  sleeve: { duration: 0.72, ease: "power4.out" },
  /** A paper insert or label: light and quick. */
  paper: { duration: 0.42, ease: "power2.out" },
  /** A plastic case: snappy, with the smallest overshoot of a hinge. */
  plastic: { duration: 0.38, ease: "back.out(1.35)" },
  /** Navigation and controls: nearly instant. */
  ui: { duration: 0.16, ease: "power2.out" },
  /** Large room changes: cinematic, still under control. */
  room: { duration: 1.25, ease: "expo.inOut" },
} as const;

export type Material = keyof typeof MATERIAL;

/** Spatial constants: how far things travel, how deep the shelf is. */
export const DEPTH = {
  perspective: 1400,
  /** A sleeve nudged by hover. */
  nudge: 10,
  /** A sleeve pulled clear of the crate. */
  pull: 64,
  /** Neighbours making room. */
  yield: 14,
  /** How far the pointer may tilt an object, degrees. */
  tilt: 6,
};

export const STAGGER = { tight: 0.035, list: 0.06, deal: 0.09 };

"use client";

/**
 * Behaviour tiers, read from the platform rather than guessed from the user agent.
 *  full     fine pointer, wide viewport: pointer light, perspective, the pinned crate dig
 *  compact  fine pointer, narrow viewport: same objects, simpler composition
 *  touch    coarse pointer: tap and swipe, native scroll, no hover assumptions
 *  reduced  prefers-reduced-motion: state changes and crossfades only
 */
import { useSyncExternalStore } from "react";

export const Q = {
  fine: "(hover: hover) and (pointer: fine)",
  wide: "(min-width: 1024px)",
  tall: "(min-height: 680px)",
  reduced: "(prefers-reduced-motion: reduce)",
};

export function useMedia(query: string, server = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => matchMedia(query).matches,
    () => server,
  );
}

export const useReducedMotion = () => useMedia(Q.reduced);
export const usePointerFine = () => useMedia(Q.fine);

export function reduced() {
  return typeof window !== "undefined" && matchMedia(Q.reduced).matches;
}
export function fine() {
  return typeof window !== "undefined" && matchMedia(Q.fine).matches;
}

"use client";

/**
 * What the 3D rooms need to know about the page, written by the DOM choreography and read by
 * the WebGL render loop. Plain mutable numbers: no React state, no events, nothing re-renders.
 */
export const sceneState = {
  /** Record rack turn, 0 = first sleeve facing you, 1 = last. */
  records: 0,
  /** Back room: 0 = curtains closed, 1 = end of the lobby wall. */
  cinema: 0,
  /** Share of the cinema scroll spent opening the curtains. */
  cinemaCurtain: 0.3,
  /** Pointer, -0.5..0.5 across the viewport, for a little head movement. */
  px: 0,
  py: 0,
};

if (typeof window !== "undefined") {
  addEventListener(
    "pointermove",
    (e) => {
      sceneState.px = e.clientX / innerWidth - 0.5;
      sceneState.py = e.clientY / innerHeight - 0.5;
    },
    { passive: true },
  );
}

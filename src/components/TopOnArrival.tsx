"use client";
import { useLayoutEffect } from "react";

/**
 * Puts the page where the navigation is going before the browser takes its "after" snapshot.
 *
 * React only flies a shared element (a record's sleeve) when it is on-screen on both sides of the
 * cut. Next scrolls to the top, or to the #hash, a moment after the new page commits, so the new
 * page would be measured at the old scroll offset with its sleeve out of view, and the morph
 * would silently drop. A layout effect runs inside the commit, before that snapshot, so doing the
 * same scroll here, a few ms early, keeps the sleeve in view. Next's own scroll then lands on the
 * same spot and nothing moves.
 */
// The first mount in a document is the initial load: leave that to the browser, which may be
// restoring a scroll position on reload. Only client navigations after it are ours to place.
let initialLoad = true;

export function TopOnArrival() {
  useLayoutEffect(() => {
    if (initialLoad) {
      initialLoad = false;
      return;
    }
    const id = decodeURIComponent(location.hash.slice(1));
    const el = id ? document.getElementById(id) : null;
    if (el) el.scrollIntoView({ behavior: "instant" });
    else if (!id) window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return null;
}

"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setupGsap } from "@/lib/motion";
import { Q } from "@/lib/capability";
import { attachLenis } from "@/lib/scroll";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Lenis on fine pointers only, driven by GSAP's ticker so ScrollTrigger and Lenis read the same
 * frame. Touch devices keep native momentum; reduced motion keeps native everything.
 */
export function SmoothScroll() {
  // Pins measure the page; fonts and images change it. Re-measure once both have settled,
  // so pinned rooms never overlap or leave gaps.
  useEffect(() => {
    setupGsap();
    let t = 0;
    const refresh = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    };
    document.fonts?.ready.then(refresh);
    addEventListener("load", refresh);
    return () => {
      window.clearTimeout(t);
      removeEventListener("load", refresh);
    };
  }, []);

  useEffect(() => {
    const gsap = setupGsap();
    if (!matchMedia(Q.fine).matches || matchMedia(Q.reduced).matches) return;

    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, anchors: { offset: -64 }, autoRaf: false });
    attachLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      attachLenis(null);
      lenis.destroy();
    };
  }, []);
  return null;
}

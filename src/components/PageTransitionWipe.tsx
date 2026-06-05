"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

export function PageTransitionWipe() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [transitioning, setTransitioning] = useState(false);

  const runTransition = useCallback(
    (targetId: string) => {
      if (transitioning || !overlayRef.current) return;
      setTransitioning(true);

      const overlay = overlayRef.current;
      const tl = gsap.timeline({
        onComplete: () => {
          const target = document.querySelector(targetId);
          if (target) {
            target.scrollIntoView({ behavior: "instant" });
          }
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => {
              overlay.style.visibility = "hidden";
              setTransitioning(false);
            },
          });
        },
      });

      overlay.style.visibility = "visible";
      overlay.style.opacity = "0";

      // CRT shutdown effect: bright line squeeze to center
      tl.to(overlay, {
        opacity: 1,
        duration: 0.15,
        ease: "power4.in",
      })
        .set(overlay, {
          background: "#fff",
        })
        .to(overlay, {
          opacity: 0.8,
          duration: 0.05,
        })
        .set(overlay, {
          background: "#050816",
        })
        .to(overlay, {
          opacity: 1,
          duration: 0.1,
        });
    },
    [transitioning]
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      e.preventDefault();
      runTransition(href);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [runTransition]);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-[9000] bg-[#050816]"
      style={{ visibility: "hidden", opacity: 0 }}
      aria-hidden="true"
    />
  );
}

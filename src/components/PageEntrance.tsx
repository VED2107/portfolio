"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function PageEntrance({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        {
          opacity: 0,
          filter: "brightness(3) saturate(0)",
        },
        {
          opacity: 1,
          filter: "brightness(1) saturate(1)",
          duration: 1.2,
          ease: "power2.out",
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

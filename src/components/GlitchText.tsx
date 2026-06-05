"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface GlitchTextProps {
  text: string;
  className?: string;
}

export function GlitchText({ text, className = "" }: GlitchTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const glitch = () => {
      const tl = gsap.timeline();
      tl.to(el, {
        skewX: () => gsap.utils.random(-2, 2),
        duration: 0.1,
        ease: "power4.inOut",
      })
        .to(el, {
          skewX: 0,
          duration: 0.1,
          ease: "power4.inOut",
        })
        .to(
          el.querySelectorAll(".glitch-layer"),
          {
            x: () => gsap.utils.random(-3, 3),
            duration: 0.1,
            stagger: 0.02,
          },
          0
        )
        .to(el.querySelectorAll(".glitch-layer"), {
          x: 0,
          duration: 0.1,
        });
    };

    const interval = setInterval(glitch, gsap.utils.random(3000, 6000));
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span
        className="glitch-layer absolute inset-0 text-[#00F5FF] opacity-70"
        style={{ clipPath: "inset(0 0 60% 0)" }}
        aria-hidden="true"
      >
        {text}
      </span>
      <span
        className="glitch-layer absolute inset-0 text-[#FF00E5] opacity-70"
        style={{ clipPath: "inset(60% 0 0 0)" }}
        aria-hidden="true"
      >
        {text}
      </span>
    </div>
  );
}

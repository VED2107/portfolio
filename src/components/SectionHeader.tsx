"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SectionHeaderProps {
  command: string;
  title: string;
  level?: number;
}

export function SectionHeader({ command, title, level }: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const cmd = ref.current!.querySelector(".cmd");
      const heading = ref.current!.querySelector("h2");
      const line = ref.current!.querySelector(".header-line");

      if (cmd) {
        gsap.fromTo(
          cmd,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: { trigger: ref.current, start: "top 85%" },
          }
        );
      }

      if (heading) {
        gsap.fromTo(
          heading,
          { opacity: 0, y: 20, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            delay: 0.15,
            ease: "power3.out",
            scrollTrigger: { trigger: ref.current, start: "top 85%" },
          }
        );
      }

      if (line) {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.8,
            delay: 0.3,
            ease: "power2.out",
            scrollTrigger: { trigger: ref.current, start: "top 85%" },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="mb-16">
      {level !== undefined && (
        <div className="mb-2 font-[family-name:var(--font-pixel)] text-[10px] text-[#A0A0A0]/30 tracking-widest">
          LEVEL {String(level).padStart(2, "0")}
        </div>
      )}
      <div className="cmd font-[family-name:var(--font-pixel)] text-xs text-[#FF00E5]" style={{ opacity: 0 }}>
        &gt; {command}
      </div>
      <h2
        className="mt-4 font-[family-name:var(--font-pixel)] text-2xl text-[#00F5FF] sm:text-3xl"
        style={{ opacity: 0 }}
      >
        {title}
      </h2>
      <div
        className="header-line mt-4 h-[1px] origin-left bg-gradient-to-r from-[#00F5FF]/40 via-[#FF00E5]/20 to-transparent"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

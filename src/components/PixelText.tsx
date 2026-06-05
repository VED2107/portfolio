"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PixelTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p";
  glitch?: boolean;
  delay?: number;
}

export function PixelText({
  text,
  className = "",
  as: Tag = "h2",
  glitch = false,
  delay = 0,
}: PixelTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay, ease: "power2.out" }
    );
  }, [delay]);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={`font-[family-name:var(--font-pixel)] ${glitch ? "glitch-hover" : ""} ${className}`}
      style={{ opacity: 0 }}
    >
      {text}
    </Tag>
  );
}

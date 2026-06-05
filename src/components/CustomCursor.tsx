"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    if (!cursor || !trail) return;

    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;

      if (particlesRef.current && Math.random() > 0.7) {
        const particle = document.createElement("div");
        particle.className = "cursor-particle";
        particle.style.left = `${mouseX + (Math.random() - 0.5) * 20}px`;
        particle.style.top = `${mouseY + (Math.random() - 0.5) * 20}px`;
        particlesRef.current.appendChild(particle);
        setTimeout(() => particle.remove(), 600);
      }
    };

    const animate = () => {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      trail.style.left = `${trailX}px`;
      trail.style.top = `${trailY}px`;
      requestAnimationFrame(animate);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[data-cursor-hover]")
      ) {
        setIsHovering(true);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[data-cursor-hover]")
      ) {
        setIsHovering(false);
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        .cursor-particle {
          position: fixed;
          width: 3px;
          height: 3px;
          background: #00f5ff;
          pointer-events: none;
          z-index: 99998;
          animation: particleFade 0.6s ease-out forwards;
        }
        @keyframes particleFade {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0) translateY(-20px);
          }
        }
        @media (pointer: coarse) {
          .custom-cursor,
          .cursor-trail,
          .cursor-particle {
            display: none !important;
          }
          * {
            cursor: auto !important;
          }
        }
      `}</style>
      <div ref={particlesRef} className="pointer-events-none fixed inset-0 z-[99998]" />
      <div
        ref={cursorRef}
        className="custom-cursor pointer-events-none fixed z-[99999] -translate-x-1/2 -translate-y-1/2"
        style={{ mixBlendMode: "difference" }}
      >
        <div
          className={`transition-all duration-150 ${
            isClicking
              ? "h-3 w-3 bg-[#FF00E5]"
              : isHovering
                ? "h-6 w-6 border-2 border-[#FF00E5] bg-[#FF00E5]/20"
                : "h-4 w-4 border-2 border-[#00F5FF] bg-[#00F5FF]/10"
          }`}
          style={{
            boxShadow: isHovering
              ? "0 0 15px #FF00E5, 0 0 30px #FF00E5"
              : "0 0 10px #00F5FF",
            imageRendering: "pixelated",
          }}
        />
      </div>
      <div
        ref={trailRef}
        className="cursor-trail pointer-events-none fixed z-[99998] h-8 w-8 -translate-x-1/2 -translate-y-1/2 border border-[#00F5FF]/30"
        style={{ transition: "width 0.3s, height 0.3s" }}
      />
    </>
  );
}

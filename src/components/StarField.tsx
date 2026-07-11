"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let isVisible = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 60 : 150;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initStars = () => {
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.05,
        opacity: Math.random() * 0.8 + 0.2,
      }));
    };

    const draw = () => {
      if (!isVisible) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const stars = starsRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const halfW = canvas.width / 2;
      const halfH = canvas.height / 2;
      const time = Date.now() * 0.001;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const parallaxX = (mx - halfW) * star.speed * 0.02;
        const parallaxY = (my - halfH) * star.speed * 0.02;

        const drawX = star.x + parallaxX;
        const drawY = star.y + parallaxY;

        ctx.fillStyle =
          star.size > 1.5
            ? `rgba(0, 245, 255, ${star.opacity})`
            : `rgba(255, 255, 255, ${star.opacity * 0.6})`;

        ctx.fillRect(
          (drawX + 0.5) | 0,
          (drawY + 0.5) | 0,
          Math.ceil(star.size),
          Math.ceil(star.size)
        );

        star.y += star.speed;
        star.opacity += Math.sin(time + star.x) * 0.005;
        if (star.opacity < 0.1) star.opacity = 0.1;
        else if (star.opacity > 1) star.opacity = 1;

        if (star.y > canvas.height) {
          star.y = -2;
          star.x = Math.random() * canvas.width;
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0 }
    );

    // Static one-frame render for reduced-motion users (no parallax, no scroll/twinkle).
    const drawStatic = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const star of starsRef.current) {
        ctx.fillStyle =
          star.size > 1.5
            ? `rgba(0, 245, 255, ${star.opacity})`
            : `rgba(255, 255, 255, ${star.opacity * 0.6})`;
        ctx.fillRect(
          (star.x + 0.5) | 0,
          (star.y + 0.5) | 0,
          Math.ceil(star.size),
          Math.ceil(star.size)
        );
      }
    };

    resize();
    initStars();

    if (prefersReducedMotion) {
      drawStatic();
      // Redraw static field on resize; skip the animation loop and mouse parallax entirely.
      const onResizeStatic = () => {
        resize();
        initStars();
        drawStatic();
      };
      window.addEventListener("resize", onResizeStatic);
      return () => window.removeEventListener("resize", onResizeStatic);
    }

    draw();
    observer.observe(canvas);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

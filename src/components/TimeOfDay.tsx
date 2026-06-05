"use client";

import { useEffect } from "react";

const TIME_THEMES = [
  { start: 5, end: 8, bg: "#050816", tint: "rgba(255, 140, 50, 0.03)" },
  { start: 8, end: 17, bg: "#050816", tint: "rgba(0, 245, 255, 0.02)" },
  { start: 17, end: 20, bg: "#050816", tint: "rgba(255, 100, 50, 0.04)" },
  { start: 20, end: 24, bg: "#030612", tint: "rgba(100, 50, 255, 0.03)" },
  { start: 0, end: 5, bg: "#020510", tint: "rgba(50, 20, 100, 0.04)" },
];

export function TimeOfDay() {
  useEffect(() => {
    const hour = new Date().getHours();
    const theme = TIME_THEMES.find(
      (t) => hour >= t.start && hour < t.end
    ) || TIME_THEMES[1];

    document.documentElement.style.setProperty("--bg-primary", theme.bg);

    const tintEl = document.createElement("div");
    tintEl.setAttribute("aria-hidden", "true");
    Object.assign(tintEl.style, {
      position: "fixed",
      inset: "0",
      background: `radial-gradient(ellipse at 50% 30%, ${theme.tint}, transparent 70%)`,
      pointerEvents: "none",
      zIndex: "1",
    });
    document.body.appendChild(tintEl);

    return () => tintEl.remove();
  }, []);

  return null;
}

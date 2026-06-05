"use client";

import { useEffect, useState, useCallback } from "react";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function KonamiCode() {
  const [index, setIndex] = useState(0);
  const [activated, setActivated] = useState(false);
  const [show, setShow] = useState(false);

  const reset = useCallback(() => {
    setShow(false);
    setTimeout(() => setActivated(false), 500);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (activated) return;

      if (e.key === KONAMI[index]) {
        const next = index + 1;
        if (next === KONAMI.length) {
          setActivated(true);
          setShow(true);
          setIndex(0);
          setTimeout(reset, 6000);
        } else {
          setIndex(next);
        }
      } else {
        setIndex(e.key === KONAMI[0] ? 1 : 0);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, activated, reset]);

  if (!activated) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-[#050816]/95 backdrop-blur-md transition-opacity duration-500 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={reset}
    >
      <div className="text-center">
        <div className="mb-6 font-[family-name:var(--font-pixel)] text-4xl text-[#FFE600] neon-text-yellow sm:text-6xl">
          ACHIEVEMENT
        </div>
        <div className="mb-4 font-[family-name:var(--font-pixel)] text-4xl text-[#FFE600] neon-text-yellow sm:text-6xl">
          UNLOCKED
        </div>
        <div className="mb-8 font-[family-name:var(--font-pixel)] text-sm text-[#00FF88]">
          SECRET KONAMI CODE ACTIVATED
        </div>
        <div className="mx-auto max-w-md space-y-3 font-[family-name:var(--font-body)] text-[#A0A0A0]">
          <p>You found the secret! Ved appreciates your curiosity.</p>
          <p className="text-[#00F5FF]">
            Fun fact: This portfolio has {Math.floor(Math.random() * 5000 + 3000)} lines of code
            and was built with obsessive attention to detail.
          </p>
        </div>
        <div className="mt-8 flex justify-center gap-4">
          {["#FF4D4D", "#FFE600", "#00FF88", "#00F5FF", "#FF00E5"].map(
            (color, i) => (
              <div
                key={color}
                className="h-4 w-4"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 12px ${color}`,
                  animation: `float ${2 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            )
          )}
        </div>
        <div className="mt-8 font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/40">
          CLICK ANYWHERE TO CLOSE
        </div>
      </div>
    </div>
  );
}

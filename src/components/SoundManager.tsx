"use client";

import { useState, useCallback, useEffect, useRef, createContext, useContext } from "react";

interface SoundContextType {
  enabled: boolean;
  toggle: () => void;
  play: (type: "hover" | "click" | "section" | "success") => void;
}

const SoundContext = createContext<SoundContextType>({
  enabled: false,
  toggle: () => {},
  play: () => {},
});

export const useSound = () => useContext(SoundContext);

const SOUNDS = {
  hover: { freq: 800, duration: 0.05, type: "square" as OscillatorType },
  click: { freq: 600, duration: 0.08, type: "square" as OscillatorType },
  section: { freq: 440, duration: 0.15, type: "triangle" as OscillatorType },
  success: { freq: 880, duration: 0.2, type: "sine" as OscillatorType },
};

export function SoundManager({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const play = useCallback(
    (type: keyof typeof SOUNDS) => {
      if (!enabled) return;
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const config = SOUNDS[type];

        osc.type = config.type;
        osc.frequency.setValueAtTime(config.freq, ctx.currentTime);

        if (type === "success") {
          osc.frequency.exponentialRampToValueAtTime(config.freq * 1.5, ctx.currentTime + config.duration);
        }

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + config.duration);
      } catch {}
    },
    [enabled, getCtx]
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (next) {
        const ctx = getCtx();
        if (ctx.state === "suspended") ctx.resume();
      }
      return next;
    });
  }, [getCtx]);

  useEffect(() => {
    if (!enabled) return;

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a") || target.closest("button") || target.closest("[data-cursor-hover]")) {
        play("hover");
      }
    };

    const handleClick = () => play("click");

    document.addEventListener("mouseover", handleHover);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mouseover", handleHover);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [enabled, play]);

  return (
    <SoundContext value={{ enabled, toggle, play }}>
      {children}
    </SoundContext>
  );
}

export function SoundToggle() {
  const { enabled, toggle } = useSound();

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center border border-white/10 bg-[#0a0f2e]/80 backdrop-blur-sm transition-all hover:border-[#00F5FF]/30 hover:bg-[#0a0f2e]"
      aria-label={enabled ? "Mute sounds" : "Enable sounds"}
      data-cursor-hover
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke={enabled ? "#00F5FF" : "#A0A0A0"}
        strokeWidth="2"
      >
        {enabled ? (
          <>
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </>
        ) : (
          <>
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </>
        )}
      </svg>
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-pixel)] text-[7px] text-[#A0A0A0]/60 opacity-0 transition-opacity group-hover:opacity-100">
        {enabled ? "SFX ON" : "SFX OFF"}
      </span>
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Pause, Play } from "@phosphor-icons/react";
import { isPlaying, toggle } from "@/lib/audio";
import { currentTheme, toggleTheme } from "@/lib/events";

/**
 * The last two things you do in a record shop: put one more record on, and turn the lights out
 * (or back on) on your way through the door. Same song and same switch as the rest of the shop.
 */
export function ClosingTime() {
  const [playing, setPlaying] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const sync = () => {
      setPlaying(isPlaying());
      setDark(currentTheme() === "dark");
    };
    sync();
    window.addEventListener("ved:audio", sync);
    window.addEventListener("ved:theme", sync);
    return () => {
      window.removeEventListener("ved:audio", sync);
      window.removeEventListener("ved:theme", sync);
    };
  }, []);

  return (
    <div className="closing">
      <button type="button" className="closing-btn" onClick={() => void toggle()} aria-pressed={playing}>
        <span className="closing-disc" data-spin={playing || undefined} aria-hidden />
        {playing ? <Pause aria-hidden weight="fill" /> : <Play aria-hidden weight="fill" />}
        {playing ? "Lift the needle" : "One more record"}
      </button>
      <button
        type="button"
        className="closing-btn closing-switch"
        onClick={(e) => toggleTheme({ x: e.clientX || innerWidth / 2, y: e.clientY || innerHeight - 80 })}
      >
        <Lightbulb aria-hidden weight={dark ? "regular" : "fill"} />
        {dark ? "Lights up" : "Lights out"}
      </button>
    </div>
  );
}

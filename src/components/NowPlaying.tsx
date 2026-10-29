"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Pause, Play } from "@phosphor-icons/react";
import { SONG, isPlaying, levels, progress, toggle } from "@/lib/audio";

/**
 * The shop's record player, always within reach: a small record that spins while the song
 * plays, five level bars, and how far through the side we are. Meters write transforms directly;
 * React only re-renders when play state flips.
 */
export function NowPlaying() {
  const [playing, setPlaying] = useState(false);
  const meters = useRef<HTMLSpanElement[]>([]);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const on = () => setPlaying(isPlaying());
    window.addEventListener("ved:audio", on);
    return () => window.removeEventListener("ved:audio", on);
  }, []);

  useEffect(() => {
    if (!playing) {
      meters.current.forEach((m) => m && (m.style.transform = "scaleY(0.15)"));
      return;
    }
    const out = new Float32Array(5);
    const tick = () => {
      levels(out);
      meters.current.forEach((m, i) => m && (m.style.transform = `scaleY(${0.15 + out[i] * 0.85})`));
      if (bar.current) bar.current.style.transform = `scaleX(${progress()})`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [playing]);

  return (
    <button type="button" className="now-playing" data-playing={playing || undefined} onClick={toggle} aria-label={`${playing ? "Pause" : "Play"} ${SONG.title}`} aria-pressed={playing}>
      <span className="np-disc" aria-hidden>
        <span className="np-icon">{playing ? <Pause weight="fill" /> : <Play weight="fill" />}</span>
      </span>
      <span className="np-text">
        <span className="np-title">{SONG.title}</span>
        <span className="np-sub">{playing ? "Now playing" : "Drop the needle"}</span>
      </span>
      <span className="np-meters" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} ref={(n) => void (n && (meters.current[i] = n))} />
        ))}
      </span>
      <span className="np-progress" aria-hidden>
        <span ref={bar} />
      </span>
    </button>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { currentTheme } from "@/lib/events";

const LAMP_HINT = "ved-lamp-hint";

/**
 * A hint, not a switch. A little pendant hangs from the sign bar with a paper tag on its cord;
 * the real light switch is the cord on the lamp inside the shop. Click the pendant and you are
 * walked back to the shop floor, where that lamp swings and its bead glows to show you.
 */
export function HeaderLamp() {
  const [dark, setDark] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const sync = () => setDark(currentTheme() === "dark");
    sync();
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    window.addEventListener("ved:theme", sync);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("ved:theme", sync);
    };
  }, []);

  const show = () => {
    if (pathname !== "/") {
      // The shop reads this when it opens and points at its lamp once the lights are up.
      try {
        sessionStorage.setItem(LAMP_HINT, "1");
      } catch {
        /* without storage the shop simply opens as usual */
      }
      router.push("/");
      return;
    }
    window.dispatchEvent(new CustomEvent("ved:top"));
    window.dispatchEvent(new CustomEvent("ved:lamp-hint"));
  };

  return (
    <button type="button" className="hlamp" data-dark={dark || undefined} onClick={show} aria-label="Where are the lights? Show me the lamp in the shop">
      <span className="hlamp-shade" aria-hidden>
        <svg viewBox="0 0 48 30" width="48" height="30">
          <path d="M10 26 Q24 2 38 26 Z" fill="var(--oxblood)" stroke="var(--espresso)" strokeWidth="1.5" />
          <ellipse cx="24" cy="26" rx="14" ry="3" fill="var(--espresso)" />
          <circle className="hlamp-bulb" cx="24" cy="27" r="4.2" />
        </svg>
        <span className="hlamp-glow" />
      </span>
      <span className="hlamp-cord" aria-hidden>
        <span className="hlamp-string" />
      </span>
      <span className="hlamp-bead" aria-hidden>
        <span className="hlamp-ball" />
        <span className="hlamp-tag">lights: pull the shop lamp</span>
      </span>
    </button>
  );
}

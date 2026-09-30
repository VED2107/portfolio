"use client";

import { useEffect, useRef, useState } from "react";
import { toggleBlueprint } from "@/lib/events";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/** Toasts, the Konami code, and a note for anyone who opens devtools. */
export function Secrets() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onToast = (e: Event) => {
      setMessage((e as CustomEvent).detail?.message ?? null);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setMessage(null), 3200);
    };
    window.addEventListener("ved:toast", onToast);

    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        toggleBlueprint();
      }
    };
    window.addEventListener("keydown", onKey);

    const w = window as unknown as { __vedSigned?: boolean };
    if (!w.__vedSigned) {
      w.__vedSigned = true;
      console.log(
        "%cVED.EXE%c\nYou opened devtools on a portfolio. Claim 8: you are the kind of person I like building with.\nSource: https://github.com/VED2107/portfolio  ·  Mail: vedchauhan2107@gmail.com\nPS: press / and type > help.",
        "font: 800 20px system-ui; letter-spacing: -0.02em",
        "font: 12px ui-monospace, monospace; color: #5b636e",
      );
    }

    return () => {
      window.removeEventListener("ved:toast", onToast);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div aria-live="polite" role="status">
      {message && <div className="toast">{message}</div>}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

/** Toasts, the tab that notices you've wandered off, and a note for anyone who opens devtools. */
export function Notices() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onToast = (e: Event) => {
      setMessage((e as CustomEvent).detail?.message ?? null);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setMessage(null), 3400);
    };
    addEventListener("ved:toast", onToast);

    let title = document.title;
    const onVis = () => {
      if (document.hidden) {
        title = document.title;
        document.title = "Still spinning… · VED";
      } else document.title = title;
    };
    document.addEventListener("visibilitychange", onVis);

    const w = window as unknown as { __vedSigned?: boolean };
    if (!w.__vedSigned) {
      w.__vedSigned = true;
      console.log(
        "%cVED Records & Film%c\nYou opened devtools in a record shop. Staff approve.\nThe catalogue terminal has a shell: press / and type > help.\nSource: https://github.com/VED2107/portfolio  ·  vedchauhan2107@gmail.com",
        "font: italic 600 22px Georgia, serif; letter-spacing: -0.02em",
        "font: 12px ui-monospace, monospace; color: #75695b",
      );
    }
    return () => {
      removeEventListener("ved:toast", onToast);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div aria-live="polite" role="status">
      {message && <div className="toast">{message}</div>}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

/** One polite status message at a time, announced to screen readers. */
export function Toast() {
  const [message, setMessage] = useState("");
  const [shown, setShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const on = (e: Event) => {
      setMessage((e as CustomEvent<{ message: string }>).detail.message);
      setShown(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setShown(false), 2600);
    };
    window.addEventListener("ved:toast", on);
    return () => {
      window.removeEventListener("ved:toast", on);
      clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="toast" role="status" aria-live="polite" data-hidden={shown ? undefined : ""}>
      {message}
    </div>
  );
}

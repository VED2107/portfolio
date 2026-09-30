"use client";

import { useRef, useState } from "react";
import { copyEmail } from "@/lib/events";

/** The address, set large. Clicking copies it and a RECEIVED stamp lands where you clicked. */
export function CopyEmail({ email }: { email: string }) {
  const [stamp, setStamp] = useState<{ x: number; y: number; k: number } | null>(null);
  const [status, setStatus] = useState("");
  const timer = useRef<number | undefined>(undefined);

  async function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    // Keyboard activation has no pointer position: stamp the middle.
    const x = e.clientX ? e.clientX - box.left : box.width / 2;
    const y = e.clientY ? e.clientY - box.top : box.height / 2;
    const ok = await copyEmail(email);
    setStatus(ok ? "Copied to clipboard." : "Copy blocked by the browser. Select the address instead.");
    setStamp({ x, y, k: Date.now() });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStamp(null), 1800);
  }

  return (
    <div className="relative">
      <button type="button" onClick={onClick} className="copy-email" aria-describedby="copy-hint">
        <span className="copy-email-text">{email}</span>
      </button>
      <p id="copy-hint" className="t-small mt-3">
        Click to copy. <span aria-live="polite">{status}</span>
      </p>
      {stamp && (
        <span key={stamp.k} className="stamp text-[1.1rem] sm:text-[1.5rem]" style={{ left: stamp.x - 70, top: stamp.y - 24 }} aria-hidden>
          RECEIVED
        </span>
      )}
    </div>
  );
}

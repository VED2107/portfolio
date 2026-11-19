"use client";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import { CheckIcon, CopyIcon } from "./icons";

export const MAILTO = `mailto:${SITE.email}`;
export const STUDIO_MAILTO = `mailto:${SITE.studioEmail}`;

/**
 * Copies the address. Success shows a check and "Copied"; if the clipboard refuses (permissions,
 * an insecure origin), it says so and selects the address so it can be copied by hand.
 */
export function CopyEmail({ label = "Copy email address", showAddress = false, className = "", address = SITE.email }: { label?: string; showAddress?: boolean; className?: string; address?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);
  const addr = useRef<HTMLSpanElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(address);
      setState("copied");
    } catch {
      setState("failed");
      const el = addr.current;
      if (el) {
        const r = document.createRange();
        r.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(r);
      }
    }
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  }

  return (
    <span className={`copy inline-flex items-center ${className}`}>
      {showAddress && (
        <a href={`mailto:${address}`} className="hd-link" style={{ color: "var(--ink)" }}>
          <span ref={addr}>{address}</span>
        </a>
      )}
      {!showAddress && (
        <span ref={addr} className="sr-only">
          {address}
        </span>
      )}
      <button type="button" className="icon-btn copy-btn" data-state={state} onClick={copy} aria-label={label}>
        <CopyIcon className="ic ic-copy" />
        <CheckIcon className="ic ic-done" />
      </button>
      <span className="copy-tip" data-show={state !== "idle"} aria-hidden>
        {state === "failed" ? "Press Ctrl+C to copy" : "Copied"}
      </span>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? "Email address copied" : state === "failed" ? "Couldn't copy. The address is selected; copy it manually." : ""}
      </span>
    </span>
  );
}

"use client";
import { useId, useMemo, useState } from "react";

/** FNV-1a, 64-bit. Small, deterministic, and enough to show the point. */
function fnv1a64(text: string) {
  let h = BigInt("0xcbf29ce484222325");
  const prime = BigInt("0x100000001b3");
  const mask = (BigInt(1) << BigInt(64)) - BigInt(1);
  for (const byte of new TextEncoder().encode(text)) {
    h ^= BigInt(byte);
    h = (h * prime) & mask;
  }
  return h.toString(16).padStart(16, "0");
}

/**
 * "Same input in, same result out", as something to try. Whatever is typed is hashed twice,
 * independently, and the two results are compared byte for byte, which is the property Atlas's
 * cache is tested for.
 */
export function SameInput() {
  const id = useId();
  const [text, setText] = useState("same input in");
  const [a, b] = useMemo(() => [fnv1a64(text), fnv1a64(String(text))], [text]);
  const same = a === b;
  return (
    <div className="same">
      <label htmlFor={id} className="t-meta same-label">
        Try it: type anything
      </label>
      <input id={id} className="same-input" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} autoComplete="off" maxLength={80} />
      <div className="same-runs" aria-live="polite">
        <div className="same-run">
          <span className="t-meta">Run 1</span>
          <code key={`a-${a}`}>{a}</code>
        </div>
        <div className="same-run">
          <span className="t-meta">Run 2</span>
          <code key={`b-${b}`}>{b}</code>
        </div>
        <p className="same-verdict">
          <span className="same-check" aria-hidden>
            {same ? "✓" : "✕"}
          </span>
          {same ? "Byte-identical. Every time." : "Mismatch"}
        </p>
      </div>
      <p className="t-small same-note">FNV-1a, 64-bit, computed in your browser. Atlas holds its warm cache to the same rule: identical to a cold run, or the tests fail.</p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { openPalette } from "@/lib/events";

// Projects and sheets you can jump to; the field types them to show what search is for.
const QUERIES = ["Snowbros Atlas", "Accounic", "Vinny's Atelier", "Vinny's Vogue", "STC Academy", "Other filings", "Claims", "Status", "Correspondence", "Résumé"];

/**
 * The header search, drawn as an index card: a FIND stamp, a field that types
 * real queries, and the shortcut. Clicking while a query is showing searches for it.
 */
export function SearchTrigger() {
  const [mod, setMod] = useState("Ctrl");
  const [text, setText] = useState("");
  const [word, setWord] = useState(0);

  useEffect(() => {
    // Platform is only knowable on the client; the server renders Ctrl.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setMod("⌘");
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const full = QUERIES[word];
    let i = 0;
    let dir = 1;
    let t: number;
    const step = () => {
      if (document.hidden) {
        t = window.setTimeout(step, 600);
        return;
      }
      i += dir;
      setText(full.slice(0, i));
      if (dir === 1 && i === full.length) {
        dir = -1;
        t = window.setTimeout(step, 1900);
      } else if (dir === -1 && i === 0) {
        setWord((w) => (w + 1) % QUERIES.length);
      } else {
        t = window.setTimeout(step, dir === 1 ? 70 + Math.random() * 60 : 28);
      }
    };
    t = window.setTimeout(step, 900);
    return () => window.clearTimeout(t);
  }, [word]);

  return (
    <button
      type="button"
      onClick={() => openPalette(text.length > 2 ? text : "")}
      className="search-card"
      aria-label="Search the filing and run commands"
      aria-keyshortcuts="Control+K Meta+K /"
    >
      <span className="search-stamp" aria-hidden>
        <MagnifyingGlass size={14} weight="bold" />
        <span className="hidden sm:inline">FIND</span>
      </span>
      <span className="search-field" aria-hidden>
        <span className="search-typed">{text || <span className="ink-3">Search the filing</span>}</span>
        <span className="caret" />
      </span>
      <span className="search-keys" aria-hidden>
        <span className="kbd">{mod}</span>
        <span className="kbd">K</span>
      </span>
    </button>
  );
}

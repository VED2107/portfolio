"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { copyText, setTheme, toast } from "@/lib/events";

export type PaletteItem = {
  group: "Sections" | "Projects" | "Links" | "Settings";
  label: string;
  hint?: string;
  /** Internal route, external URL, or an action id handled below. */
  href?: string;
  action?: "copy-email" | "theme-light" | "theme-dark" | "theme-system";
  keywords?: string;
};

/**
 * The command menu. ⌘K, Ctrl+K or / opens it. It opens and closes with no animation: something
 * reached for this often should feel instant. A native <dialog> gives focus trapping and Escape.
 */
export function CommandPalette({ items, email }: { items: PaletteItem[]; email: string }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const open = useCallback((q = "") => {
    const d = dialog.current;
    if (!d || d.open) return;
    setQuery(q);
    setActive(0);
    d.showModal();
    input.current?.focus();
  }, []);

  const close = useCallback(() => dialog.current?.close(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog.current?.open) close();
        else open();
      } else if (e.key === "/" && !typing && !dialog.current?.open) {
        e.preventDefault();
        open();
      }
    };
    const onOpen = (e: Event) => open((e as CustomEvent<{ query?: string }>).detail?.query ?? "");
    window.addEventListener("keydown", onKey);
    window.addEventListener("ved:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ved:palette", onOpen);
    };
  }, [open, close]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => `${i.label} ${i.hint ?? ""} ${i.keywords ?? ""} ${i.group}`.toLowerCase().includes(q));
  }, [items, query]);

  const run = useCallback(
    async (item: PaletteItem) => {
      close();
      if (item.action === "copy-email") {
        toast((await copyText(email)) ? "Email address copied" : email);
      } else if (item.action?.startsWith("theme-")) {
        setTheme(item.action.slice(6) as "light" | "dark" | "system");
      } else if (item.href?.startsWith("http") || item.href?.endsWith(".pdf")) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else if (item.href) {
        router.push(item.href);
      }
    },
    [close, email, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      run(results[active]);
    }
  };

  useEffect(() => {
    document.getElementById(`pal-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <dialog
      ref={dialog}
      className="palette"
      aria-label="Command menu"
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
    >
      <div className="palette-search">
        <MagnifyingGlass aria-hidden weight="bold" />
        <input
          ref={input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search projects, sections, links"
          aria-label="Search"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={results[active] ? `pal-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <div className="palette-list" id="palette-list" role="listbox" aria-label="Results">
        {results.length === 0 && <p className="palette-empty">Nothing matches “{query}”. Try a project name or a technology.</p>}
        {results.map((item, k) => {
          const head = k === 0 || results[k - 1].group !== item.group ? item.group : null;
          return (
            <div key={`${item.group}-${item.label}`}>
              {head && (
                <p className="palette-group" aria-hidden>
                  {head}
                </p>
              )}
              <button
                type="button"
                id={`pal-${k}`}
                role="option"
                aria-selected={k === active}
                className="palette-item"
                onMouseMove={() => setActive(k)}
                onClick={() => run(item)}
                tabIndex={-1}
              >
                <span>{item.label}</span>
                {item.hint && <span className="small muted">{item.hint}</span>}
              </button>
            </div>
          );
        })}
      </div>
    </dialog>
  );
}

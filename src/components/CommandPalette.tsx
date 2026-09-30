"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowElbowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Copy,
  Desktop,
  FilePdf,
  GithubLogo,
  LinkedinLogo,
  MagnifyingGlass,
  Moon,
  Stack,
  Sun,
  TerminalWindow,
} from "@phosphor-icons/react";
import { SHEETS, SITE } from "@/lib/site";
import { FILINGS, type Filing } from "@/lib/work";
import { copyEmail, setTheme, toast, toggleBlueprint } from "@/lib/events";

type Scope = "all" | "sheets" | "filings" | "reach" | "appearance";

type Item = {
  id: string;
  scope: Exclude<Scope, "all">;
  label: string;
  hint?: string;
  ref?: string;
  icon: React.ReactNode;
  keywords?: string;
  filing?: Filing;
  blurb?: string;
  external?: boolean;
  run: () => void;
};

const SCOPES: { id: Scope; label: string }[] = [
  { id: "all", label: "All" },
  { id: "filings", label: "Filings" },
  { id: "sheets", label: "Sheets" },
  { id: "reach", label: "Reach" },
  { id: "appearance", label: "Appearance" },
];

const SCOPE_TITLE: Record<Exclude<Scope, "all">, string> = {
  filings: "Open a filing",
  sheets: "Go to a sheet",
  reach: "Reach Ved",
  appearance: "Appearance",
};

const SHEET_BLURB: Record<string, string> = {
  cover: "Who this is, and FIG. 1: every shipped project as a plate you can lift.",
  filings: "Five products in production, each with its first figure and real numbers.",
  archive: "Studio work and experiments, with previews.",
  claims: "How I work, written as numbered claims, each backed by a filing.",
  field: "Capabilities charted against the projects that prove them.",
  status: "What I'm building and learning now, plus a year of GitHub activity.",
  correspondence: "The email address, and every other way to reach me.",
};

/** Hidden commands. Typed exactly after a >, never listed. */
const SHELL: Record<string, string> = {
  help: "whoami  ls  cat claims  sudo hire ved  sb analyze  blueprint  clear  exit",
  whoami: "visitor. curious enough to open a shell on a portfolio, which is a good sign.",
  ls: "snowbros-atlas/  accounic/  vinnys-atelier/  vinnys-vogue/  stc-academy/  ved-exe/\narchive/  claims.txt  resume.pdf",
  "cat claims": "1. Same code in, same result out.\n2. Money is an integer.\n3. The database decides; clients display.\n4. Evidence or silence.",
  "cat claims.txt": "1. Same code in, same result out.\n2. Money is an integer.\n3. The database decides; clients display.\n4. Evidence or silence.",
  "sudo hire ved": `[sudo] password for visitor: ********\nPermission granted. Opening a mail to ${SITE.email}.`,
  "rm -rf /": "refused: this filing is append-only. Settlements never edit history either.",
  exit: "There is no exit, only Esc.",
  vim: "You are now in vim. Press Esc. Then Esc again. This is fine.",
  "sb analyze": "Snowbros Atlas · analyze\n  files scanned: 1 portfolio\n✓ 0 finding(s)\n◆ health: 100/100 (it would say so if it weren't)",
};

function Highlight({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="pal-mark">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [active, setActive] = useState(0);
  const [shellOut, setShellOut] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setScope("all");
    setShellOut([]);
    returnFocus.current?.focus?.();
  }, []);

  const show = useCallback((q = "") => {
    returnFocus.current = document.activeElement as HTMLElement;
    setQuery(q);
    setActive(0);
    setOpen(true);
  }, []);

  // Cmd/Ctrl+K toggles; "/" opens when not typing; any button can open it through the event bus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.("input, textarea, [contenteditable='true']");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else show();
      } else if (!open && !typing && e.key === "/") {
        e.preventDefault();
        show();
      }
    };
    const onEvent = (e: Event) => show((e as CustomEvent).detail?.query ?? "");
    window.addEventListener("keydown", onKey);
    window.addEventListener("ved:palette", onEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ved:palette", onEvent);
    };
  }, [open, close, show]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const goSheet = useCallback(
    (id: string) => {
      if (pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
        history.replaceState(null, "", `#${id}`);
      } else {
        router.push(`/#${id}`, { transitionTypes: ["nav-back"] });
      }
    },
    [pathname, router],
  );

  const items: Item[] = useMemo(
    () => [
      ...FILINGS.map((f) => ({
        id: `filing-${f.slug}`,
        scope: "filings" as const,
        label: f.title,
        hint: f.field,
        ref: String(f.no),
        icon: <Stack size={16} aria-hidden />,
        keywords: `${f.stack.join(" ")} ${f.short} project work case study`,
        filing: f,
        run: () => router.push(`/work/${f.slug}`, { transitionTypes: ["nav-forward"] }),
      })),
      ...SHEETS.map((s, i) => ({
        id: `sheet-${s.id}`,
        scope: "sheets" as const,
        label: s.label,
        ref: `${i + 1}/${SHEETS.length}`,
        icon: <ArrowRight size={16} aria-hidden />,
        blurb: SHEET_BLURB[s.id],
        keywords:
          ({ cover: "home top start", correspondence: "contact email hire", field: "skills stack capabilities", status: "now github activity learning", claims: "about principles" } as Record<string, string>)[s.id] ?? "",
        run: () => goSheet(s.id),
      })),
      {
        id: "copy-email",
        scope: "reach",
        label: "Copy email address",
        hint: SITE.email,
        icon: <Copy size={16} aria-hidden />,
        blurb: "Copies the address to your clipboard. Nothing opens.",
        keywords: "contact mail hire",
        run: async () => toast((await copyEmail(SITE.email)) ? `Copied ${SITE.email}` : SITE.email),
      },
      {
        id: "github",
        scope: "reach",
        label: "GitHub",
        hint: "github.com/VED2107",
        icon: <GithubLogo size={16} aria-hidden />,
        blurb: "Public repositories, including this site.",
        external: true,
        keywords: "code repos source",
        run: () => window.open(SITE.github, "_blank", "noopener"),
      },
      {
        id: "linkedin",
        scope: "reach",
        label: "LinkedIn",
        hint: "in/ved-chauhan2107",
        icon: <LinkedinLogo size={16} aria-hidden />,
        external: true,
        run: () => window.open(SITE.linkedin, "_blank", "noopener"),
      },
      {
        id: "resume",
        scope: "reach",
        label: "Résumé",
        hint: "PDF",
        icon: <FilePdf size={16} aria-hidden />,
        blurb: "One page. Also at /resume.",
        external: true,
        keywords: "cv resume download pdf",
        run: () => window.open(SITE.resume, "_blank", "noopener"),
      },
      {
        id: "snowbros",
        scope: "reach",
        label: "SNOWBROS studio",
        hint: "snowbros.me",
        icon: <ArrowUpRight size={16} aria-hidden />,
        blurb: "The studio these filings are assigned to.",
        external: true,
        keywords: "studio company",
        run: () => window.open(SITE.studioUrl, "_blank", "noopener"),
      },
      { id: "theme-light", scope: "appearance", label: "Drafting white", hint: "light", icon: <Sun size={16} aria-hidden />, keywords: "theme light", run: () => setTheme("light") },
      { id: "theme-dark", scope: "appearance", label: "Carbon sheet", hint: "dark", icon: <Moon size={16} aria-hidden />, keywords: "theme dark night", run: () => setTheme("dark") },
      { id: "theme-system", scope: "appearance", label: "Match system", icon: <Desktop size={16} aria-hidden />, keywords: "theme auto", run: () => setTheme("system") },
    ],
    [goSheet, router],
  );

  const shell = query.startsWith(">");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (shell) return [];
    return items.filter(
      (it) => (scope === "all" || it.scope === scope) && (!q || `${it.label} ${it.hint ?? ""} ${it.keywords ?? ""} ${it.ref ?? ""}`.toLowerCase().includes(q)),
    );
  }, [items, q, scope, shell]);

  const current = filtered[active];

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function runShell() {
    const cmd = query.slice(1).trim().toLowerCase();
    if (!cmd) return;
    setQuery(">");
    if (cmd === "clear") return setShellOut([]);
    if (cmd === "blueprint") {
      toggleBlueprint();
      return setShellOut((o) => [...o, `> ${cmd}`, "developing…"]);
    }
    setShellOut((o) => [...o, `> ${cmd}`, SHELL[cmd] ?? `${cmd}: command not found. Try > help`]);
    if (cmd === "sudo hire ved") window.setTimeout(() => (window.location.href = `mailto:${SITE.email}?subject=Something%20to%20build`), 700);
  }

  function choose(it: Item | undefined) {
    if (!it) {
      if (q === "blueprint") {
        close();
        toggleBlueprint();
      }
      return;
    }
    close();
    it.run();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      if (shell && query !== ">") setQuery(">");
      else close();
    } else if (e.key === "Tab") {
      // Tab cycles the scope; focus stays in the field.
      e.preventDefault();
      if (shell) return;
      const i = SCOPES.findIndex((s) => s.id === scope);
      setScope(SCOPES[(i + (e.shiftKey ? SCOPES.length - 1 : 1)) % SCOPES.length].id);
      setActive(0);
    } else if (shell) {
      if (e.key === "Enter") {
        e.preventDefault();
        runShell();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (filtered.length ? (a + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (filtered.length ? (a - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(current);
    }
  }

  if (!open) return null;

  let lastScope = "";
  return (
    <>
      <div className="palette-backdrop" onClick={close} aria-hidden />
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search and commands" onKeyDown={onKeyDown}>
        {/* A filing search form: (21) is the code a patent office gives the application number. */}
        <div className="pal-field">
          <span className="pal-stamp" aria-hidden>
            {shell ? <TerminalWindow size={18} weight="bold" /> : <MagnifyingGlass size={18} weight="bold" />}
            <span>{shell ? "SH" : "FIND"}</span>
          </span>
          <label className="flex min-w-0 flex-1 flex-col justify-center">
            <span className="pal-code" aria-hidden>
              {shell ? "(00) Shell" : "(21) Query"}
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              className={`pal-input ${shell ? "is-shell" : ""}`}
              placeholder="A project, a technology, a sheet…"
              role="combobox"
              aria-label="Search the filing"
              aria-expanded="true"
              aria-controls="palette-list"
              aria-activedescendant={current ? `pi-${current.id}` : undefined}
              aria-autocomplete="list"
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <span className="pal-count" aria-live="polite">
            {shell ? ">_" : String(filtered.length).padStart(2, "0")}
            <span>{shell ? "shell" : filtered.length === 1 ? "match" : "matches"}</span>
          </span>
          <button type="button" className="kbd cursor-pointer" onClick={close} aria-label="Close">
            Esc
          </button>
        </div>

        {!shell && (
          <div className="pal-scopes" role="tablist" aria-label="Scope">
            {SCOPES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={scope === s.id}
                className="pal-scope"
                onClick={() => {
                  setScope(s.id);
                  setActive(0);
                  inputRef.current?.focus();
                }}
              >
                {s.label}
              </button>
            ))}
            <span className="t-small ml-auto hidden items-center gap-1.5 md:flex">
              <span className="kbd">Tab</span> switches
            </span>
          </div>
        )}

        {shell ? (
          <div className="pal-shell" aria-live="polite">
            <p className="ink-3">VED.EXE shell. Type a command and press Enter. Try help. Esc clears, again closes.</p>
            {shellOut.map((line, i) => (
              <pre key={i} className={`whitespace-pre-wrap ${line.startsWith(">") ? "accent mt-3" : "ink-2"}`}>
                {line}
              </pre>
            ))}
          </div>
        ) : (
          <div className="pal-body">
            <ul id="palette-list" ref={listRef} role="listbox" className="pal-list">
              {filtered.length === 0 && (
                <li className="px-5 py-10">
                  <p className="font-semibold">Nothing filed under &ldquo;{query}&rdquo;.</p>
                  <p className="t-small mt-1">Try a project, a technology like Rust or Supabase, or &ldquo;email&rdquo;.</p>
                </li>
              )}
              {filtered.map((it, i) => {
                const head = scope === "all" && it.scope !== lastScope ? SCOPE_TITLE[it.scope] : null;
                lastScope = it.scope;
                return (
                  <li key={it.id} role="presentation">
                    {head && <p className="pal-group">{head}</p>}
                    <div
                      id={`pi-${it.id}`}
                      role="option"
                      aria-selected={i === active}
                      className="pal-item"
                      onMouseMove={() => i !== active && setActive(i)}
                      onClick={() => choose(it)}
                    >
                      <span className="pal-icon">{it.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          <Highlight text={it.label} q={q} />
                        </span>
                        {it.hint && <span className="pal-hint block truncate">{it.hint}</span>}
                      </span>
                      {it.ref && <span className="pal-ref">{it.ref}</span>}
                      <span className="pal-enter" aria-hidden>
                        <ArrowElbowDownLeft size={14} weight="bold" />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Preview: a tiny drawing sheet for whatever is selected. */}
            <aside className="pal-preview" aria-hidden>
              {current && (
                <div className="pal-sheet" key={current.id}>
                  <p className="pal-sheet-head">
                    <span>{current.filing ? `Filing ${current.filing.no}` : current.scope === "sheets" ? `Sheet ${current.ref}` : SCOPE_TITLE[current.scope]}</span>
                    <span>FIG. P</span>
                  </p>
                  {current.filing ? (
                    <>
                      <div className="pal-plate">
                        {current.filing.plate ? (
                          <Image src={current.filing.plate.src} alt="" width={current.filing.plate.w} height={current.filing.plate.h} sizes="300px" />
                        ) : (
                          <span className="grid h-full place-items-center text-[2rem] font-extrabold tracking-[-0.03em] [font-stretch:125%]">
                            VED<span className="accent">.</span>EXE
                          </span>
                        )}
                      </div>
                      <p className="t-h3 mt-4">{current.filing.title}</p>
                      <p className="t-small mt-1.5 leading-snug">{current.filing.short}</p>
                      <p className="pal-stack">{current.filing.stack.slice(0, 5).join("  ·  ")}</p>
                    </>
                  ) : (
                    <>
                      <span className="pal-preview-icon">{current.icon}</span>
                      <p className="t-h3 mt-4">{current.label}</p>
                      {current.hint && <p className="t-small mt-1">{current.hint}</p>}
                      {current.blurb && <p className="t-small mt-3 leading-snug text-[var(--ink-2)]">{current.blurb}</p>}
                      {current.scope === "appearance" && (
                        <div className="mt-4 flex gap-1.5">
                          {(current.id === "theme-dark" ? ["#0f1114", "#e7e9ec", "#8b94ff"] : current.id === "theme-light" ? ["#eef0f1", "#0e1116", "#2f3bff"] : ["#eef0f1", "#0f1114", "#2f3bff"]).map((c) => (
                            <span key={c} className="h-8 w-8 border border-[var(--rule)]" style={{ background: c }} />
                          ))}
                        </div>
                      )}
                      {current.external && <p className="t-num ink-3 mt-4">Opens in a new tab</p>}
                    </>
                  )}
                </div>
              )}
            </aside>
          </div>
        )}

        <div className="pal-foot">
          <span className="flex items-center gap-1.5">
            <span className="kbd">↑</span>
            <span className="kbd">↓</span> move
          </span>
          <span className="flex items-center gap-1.5">
            <span className="kbd">↵</span> open
          </span>
          <span className="ml-auto hidden items-center gap-1.5 sm:flex">
            type <span className="kbd">&gt;</span> for a shell
          </span>
        </div>
      </div>
    </>
  );
}

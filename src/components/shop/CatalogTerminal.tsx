"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FILMS, RELEASES, ROOM_ITEMS, type Film, type Release } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { copyText, inspect, setTheme, toast } from "@/lib/events";
import { play, setSound, soundOn } from "@/lib/sound";
import { toggleScore } from "@/lib/score";
import { lockScroll, scrollToTarget, unlockScroll } from "@/lib/scroll";
import { ReleaseCover } from "./ReleaseCover";
import { FilmCover } from "./FilmCover";

type Scope = "all" | "records" | "film" | "aisles" | "reach" | "settings";
type Row = {
  id: string;
  scope: Exclude<Scope, "all">;
  code: string;
  label: string;
  hint?: string;
  keywords?: string;
  release?: Release;
  film?: Film;
  note?: string;
  run: () => void;
};

const SCOPES: { id: Scope; label: string }[] = [
  { id: "all", label: "All stock" },
  { id: "records", label: "Records" },
  { id: "film", label: "Film & skills" },
  { id: "aisles", label: "Aisles" },
  { id: "reach", label: "Reach" },
  { id: "settings", label: "Settings" },
];

const AISLE_ROWS = [
  { id: "shop", label: "Front window", note: "The name, what's sold here, new releases." },
  { id: "records", label: "Records", note: "Seven shipped products, in a crate." },
  { id: "film", label: "Film & special features", note: "The studio, experiments, the making-of." },
  { id: "counter", label: "Behind the counter", note: "About, staff picks, equipment." },
  { id: "checkout", label: "Checkout", note: "Special orders. The email writes itself." },
];

const SHELL: Record<string, string> = {
  help: "ls  whoami  play <cat no.>  needle  rewind  cat principles  sudo hire ved  score  clear  exit",
  whoami: "a customer who opens the terminal at the counter. staff appreciate you.",
  ls: RELEASES.map((r) => `${r.cat}  ${r.title}`).join("\n") + "\n" + FILMS.map((f) => `${f.cat}  ${f.title}`).join("\n"),
  "cat principles": "1. Same code in, same result out.\n2. Money is an integer.\n3. The database decides; clients display.\n4. Evidence or silence.",
  "sudo hire ved": `[sudo] password for customer: ********\nOrder placed. Opening a mail to ${SITE.email}.`,
  rewind: "Every record in this shop is pressed from the same master. Rewinding gives you the same song.",
  "rm -rf /": "refused. The stock ledger is append-only. Settlements never edit history either.",
  exit: "The shop closes at 11. Esc works sooner.",
  vim: "You are now in vim. Press Esc. Then Esc again. This is fine.",
};

function Hi({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="term-mark">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/**
 * The catalogue terminal at the counter. Every release, film, aisle and setting is a line in the
 * stock database; type to filter, arrows to move, Enter to fetch it. Prefix with ">" for the
 * shell. Opens instantly, with no animation, because it might be used a hundred times.
 */
export function CatalogTerminal() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [active, setActive] = useState(0);
  const [out, setOut] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const back = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setScope("all");
    setOut([]);
    back.current?.focus?.({ preventScroll: true });
  }, []);

  const show = useCallback((q = "") => {
    back.current = document.activeElement as HTMLElement;
    setQuery(q);
    setActive(0);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.("input, textarea, select, [contenteditable='true']");
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
    addEventListener("keydown", onKey);
    addEventListener("ved:catalog", onEvent);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("ved:catalog", onEvent);
    };
  }, [open, close, show]);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    lockScroll();
    return () => unlockScroll();
  }, [open]);

  const goAisle = useCallback(
    (id: string) => {
      if (pathname === "/") {
        scrollToTarget(id === "shop" ? 0 : `#${id}`, { immediate: false });
        history.replaceState(history.state, "", id === "shop" ? "/" : `#${id}`);
      } else router.push(id === "shop" ? "/" : `/#${id}`);
    },
    [pathname, router],
  );

  const pull = useCallback(
    (slug: string) => {
      if (pathname === "/") inspect(slug);
      else router.push(`/work/${slug}`, { transitionTypes: ["nav-forward"] });
    },
    [pathname, router],
  );

  const rows: Row[] = useMemo(
    () => [
      ...RELEASES.map((r) => ({
        id: `r-${r.slug}`,
        scope: "records" as const,
        code: r.cat,
        label: r.title,
        hint: `${r.field} · ${r.format} · ${r.year}`,
        keywords: `${r.credits.join(" ")} ${r.short} ${r.label} record project`,
        release: r,
        run: () => pull(r.slug),
      })),
      ...ROOM_ITEMS.map((f) => ({
        id: `f-${f.id}`,
        scope: "film" as const,
        code: f.cat,
        label: f.title,
        hint: f.maturity ? `${f.edition} · ${f.maturity}` : f.edition,
        keywords: `${f.chapters.map((c) => c.label).join(" ")} ${f.logline} ${f.kind} film experiment skill`,
        film: f,
        run: () => (f.internal ? router.push(f.href) : window.open(f.href, "_blank", "noopener")),
      })),
      ...AISLE_ROWS.map((a, i) => ({
        id: `a-${a.id}`,
        scope: "aisles" as const,
        code: i === 0 ? "FRONT" : `AISLE ${"ABCD"[i - 1]}`,
        label: a.label,
        note: a.note,
        keywords: "go section about contact work",
        run: () => goAisle(a.id),
      })),
      {
        id: "email",
        scope: "reach",
        code: "MAIL",
        label: "Copy email address",
        hint: SITE.email,
        note: "Copies the address. Nothing opens.",
        keywords: "contact hire",
        run: async () => toast((await copyText(SITE.email)) ? `Copied ${SITE.email}` : SITE.email),
      },
      { id: "github", scope: "reach", code: "LINK", label: "GitHub", hint: "github.com/VED2107", keywords: "code source repos", run: () => window.open(SITE.github, "_blank", "noopener") },
      { id: "linkedin", scope: "reach", code: "LINK", label: "LinkedIn", hint: "in/ved-chauhan2107", run: () => window.open(SITE.linkedin, "_blank", "noopener") },
      { id: "resume", scope: "reach", code: "PDF", label: "Résumé", hint: "One page", keywords: "cv resume", run: () => window.open(SITE.resume, "_blank", "noopener") },
      { id: "snowbros", scope: "reach", code: "LABEL", label: "SNOWBROS studio", hint: "snowbros.me", keywords: "studio company", run: () => window.open(SITE.studioUrl, "_blank", "noopener") },
      { id: "lights-on", scope: "settings", code: "LIGHT", label: "Lights on", hint: "light theme", keywords: "theme light day", run: () => setTheme("light") },
      { id: "lights-off", scope: "settings", code: "LIGHT", label: "After hours", hint: "dark theme", keywords: "theme dark night", run: () => setTheme("dark") },
      { id: "lights-auto", scope: "settings", code: "LIGHT", label: "Match my device", hint: "system theme", keywords: "theme auto", run: () => setTheme("system") },
      { id: "sound", scope: "settings", code: "AUDIO", label: soundOn() ? "Sound off" : "Sound on", hint: "interface sounds", keywords: "audio sfx", run: () => setSound(!soundOn()) },
      { id: "score", scope: "settings", code: "AUDIO", label: "Play or stop the score", hint: "original, synthesised", keywords: "music soundtrack", run: () => toggleScore() },
    ],
    [goAisle, pull, router],
  );

  const shell = query.startsWith(">");
  const q = query.trim().toLowerCase();
  const found = useMemo(
    () => (shell ? [] : rows.filter((r) => (scope === "all" || r.scope === scope) && (!q || `${r.code} ${r.label} ${r.hint ?? ""} ${r.keywords ?? ""}`.toLowerCase().includes(q)))),
    [rows, q, scope, shell],
  );
  const current = found[active];

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function runShell() {
    const cmd = query.slice(1).trim().toLowerCase();
    if (!cmd) return;
    setQuery(">");
    play("key");
    if (cmd === "clear") return setOut([]);
    const playMatch = cmd.match(/^play\s+(.+)$/);
    if (playMatch) {
      const want = playMatch[1].replace(/\s+/g, " ");
      const r = RELEASES.find((x) => x.cat.toLowerCase() === want || x.cat.toLowerCase().replace(" ", "") === want.replace(" ", "") || x.title.toLowerCase().includes(want));
      if (r) {
        setOut((o) => [...o, `> ${cmd}`, `cueing ${r.cat} ${r.title}…`]);
        window.setTimeout(() => {
          close();
          pull(r.slug);
        }, 450);
      } else setOut((o) => [...o, `> ${cmd}`, `${want}: not in stock. Try > ls`]);
      return;
    }
    if (cmd === "needle") {
      setSound(true);
      return setOut((o) => [...o, `> ${cmd}`, "needle down. interface sounds are on."]);
    }
    if (cmd === "score") {
      toggleScore();
      return setOut((o) => [...o, `> ${cmd}`, "score toggled. it is synthesised live, nothing downloaded."]);
    }
    setOut((o) => [...o, `> ${cmd}`, SHELL[cmd] ?? `${cmd}: not in stock. Try > help`]);
    if (cmd === "sudo hire ved") window.setTimeout(() => (window.location.href = `mailto:${SITE.email}?subject=Special%20order`), 800);
  }

  function choose(r?: Row) {
    if (!r) return;
    play("key");
    close();
    r.run();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      if (shell && query !== ">") setQuery(">");
      else close();
    } else if (e.key === "Tab") {
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
      setActive((a) => (found.length ? (a + 1) % found.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (found.length ? (a - 1 + found.length) % found.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(current);
    }
  }

  if (!open) return null;
  let last = "";

  return (
    <>
      <div className="cc-backdrop" onClick={close} aria-hidden />
      <div className="cc" role="dialog" aria-modal="true" aria-label="Card catalogue" onKeyDown={onKeyDown}>
        <div className="cc-cabinet">
          {/* The drawer front: brass label holder with the search card slotted into it. */}
          <div className="cc-front">
            <span className="cc-pull" aria-hidden />
            <label className="cc-search">
              <span className="cc-search-label pk">{shell ? "Stock shell" : "Card catalogue · find"}</span>
              <span className="cc-search-row">
                <span className="cc-prompt cat" aria-hidden>
                  {shell ? "$" : "?"}
                </span>
                <input
                  ref={input}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  className="cc-input"
                  placeholder="A title, VED 100, Rust, email…"
                  role="combobox"
                  aria-label="Search the catalogue"
                  aria-expanded="true"
                  aria-controls="cc-list"
                  aria-activedescendant={current ? `t-${current.id}` : undefined}
                  aria-autocomplete="list"
                  spellCheck={false}
                  autoComplete="off"
                />
              </span>
            </label>
            <button type="button" className="cc-esc pk" onClick={close}>
              Close <span className="kbd">Esc</span>
            </button>
          </div>

          {!shell && (
            <div className="cc-tabs" role="tablist" aria-label="Drawer">
              {SCOPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={scope === s.id}
                  className="cc-tab pk"
                  onClick={() => {
                    setScope(s.id);
                    setActive(0);
                    play("paper");
                    input.current?.focus();
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {shell ? (
            <div className="cc-shell" aria-live="polite">
              <p className="cc-dim">Typed on the back of a card. Try help. Esc clears, again closes.</p>
              {out.map((l, i) => (
                <pre key={i} className={l.startsWith(">") ? "cc-cmd" : "cc-dim"}>
                  {l}
                </pre>
              ))}
            </div>
          ) : (
            <div className="cc-body">
              {/* The drawer: index cards standing on edge. The selected one rises. */}
              <ul id="cc-list" ref={list} role="listbox" className="cc-drawer" aria-label="Results">
                {found.length === 0 && (
                  <li className="cc-empty">
                    <span className="pk">No card filed under</span>
                    <span className="cc-empty-q">&ldquo;{query}&rdquo;</span>
                    <span className="cc-dim">Try a technology like Rust or Supabase, a catalogue number like VED 100, or &ldquo;email&rdquo;.</span>
                  </li>
                )}
                {found.map((r, i) => {
                  const head = scope === "all" && r.scope !== last ? SCOPES.find((s) => s.id === r.scope)!.label : null;
                  last = r.scope;
                  const tone = r.release?.sleeve ?? r.film?.tone;
                  return (
                    <li key={r.id} role="presentation" className="cc-li">
                      {head && (
                        <p className="cc-guide pk" aria-hidden>
                          {head}
                        </p>
                      )}
                      <div
                        id={`t-${r.id}`}
                        role="option"
                        aria-selected={i === active}
                        className="cc-card"
                        style={tone ? ({ "--tone": tone } as React.CSSProperties) : undefined}
                        onMouseMove={() => i !== active && setActive(i)}
                        onClick={() => choose(r)}
                      >
                        <span className="cc-card-tab cat">{r.code}</span>
                        <span className="cc-card-title">
                          <Hi text={r.label} q={q} />
                        </span>
                        {r.hint && <span className="cc-card-hint">{r.hint}</span>}
                        {i === active && (r.release?.short || r.film?.logline || r.note) && (
                          <span className="cc-card-body">{r.release?.short ?? r.film?.logline ?? r.note}</span>
                        )}
                        <span className="cc-card-hole" aria-hidden />
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* What the card points to, pulled off the shelf. */}
              <aside className="cc-pulled" aria-hidden>
                {current?.release ? (
                  <div className="cc-object" key={current.id}>
                    <ReleaseCover r={current.release} sizes="280px" />
                    <p className="cat cc-dim">
                      {current.release.cat} · {current.release.label}
                    </p>
                    <p className="cc-credits">{current.release.credits.slice(0, 6).join(" · ")}</p>
                  </div>
                ) : current?.film ? (
                  <div className="cc-object cc-object-case" key={current.id}>
                    <FilmCover f={current.film} sizes="220px" />
                    <p className="cat cc-dim">
                      {current.film.cat} · {current.film.edition}
                    </p>
                  </div>
                ) : current ? (
                  <div className="cc-object cc-object-slip" key={current.id}>
                    <span className="pk">{current.code}</span>
                    <span className="cc-slip-title">{current.label}</span>
                    {current.hint && <span className="cc-dim">{current.hint}</span>}
                  </div>
                ) : null}
              </aside>
            </div>
          )}

          <div className="cc-foot cat">
            <span>↑↓ flip</span>
            <span>↵ fetch</span>
            <span className="cc-foot-wide">Tab next drawer</span>
            <span className="cc-foot-wide">&gt; shell</span>
          </div>
        </div>
      </div>
    </>
  );
}

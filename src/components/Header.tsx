"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MAILTO, CopyEmail } from "./CopyEmail";
import { MoonIcon, SunIcon } from "./icons";

const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });

/** One accurate clock, India Standard Time, because that is where Ved is. */
function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="clock" aria-label={now ? `Local time in India: ${now}` : undefined}>
      <span aria-hidden>{now ?? "--:--"}</span> IST
    </span>
  );
}

/** Shows every note on every project at once. Off, notes still appear on hover and focus.
 *  The state lives on <html data-notes>, set before paint by the boot script. */
function NotesToggle() {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    btn.current?.setAttribute("aria-pressed", String(document.documentElement.dataset.notes === "on"));
  }, []);
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.notes !== "on";
    if (next) root.dataset.notes = "on";
    else delete root.dataset.notes;
    btn.current?.setAttribute("aria-pressed", String(next));
    try {
      localStorage.setItem("notes", next ? "on" : "off");
    } catch {}
  }
  return (
    <button ref={btn} type="button" className="notes-toggle" aria-pressed="false" onClick={toggle} title="Show Ved's notes on every project">
      <span className="notes-switch" aria-hidden>
        <i />
      </span>
      Notes
    </button>
  );
}

function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    const next = dark ? "light" : "dark";
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!calm) root.classList.add("theme-settle");
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#171816" : "#fcfcfa");
    window.setTimeout(() => root.classList.remove("theme-settle"), 240);
  }
  return (
    <button type="button" className="icon-btn theme-btn" onClick={toggle} aria-label="Switch between light and dark theme">
      <SunIcon className="sun" />
      <MoonIcon className="moon" />
    </button>
  );
}

export function Header() {
  const path = usePathname();
  const at = (p: string) => (p === "/" ? path === "/" : path.startsWith(p)) || undefined;
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="hd-name" aria-current={path === "/" ? "page" : undefined}>
          <span className="full">Ved Chauhan</span>
          <span className="short">Ved</span>
        </Link>
        <div className="hd-mid">
          <CopyEmail showAddress />
        </div>
        <nav className="hd-right" aria-label="Main">
          <Link href="/#work" className="hd-link">
            Work
          </Link>
          <Link href="/about" className="hd-link" aria-current={at("/about") ? "page" : undefined}>
            About
          </Link>
          <a href={MAILTO} className="hd-link hd-mail-mobile">
            Email
          </a>
          <Clock />
          <NotesToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

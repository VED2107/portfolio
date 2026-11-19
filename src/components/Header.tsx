"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

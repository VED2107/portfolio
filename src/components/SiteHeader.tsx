"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MagnifyingGlass, Moon, Sun } from "@phosphor-icons/react";
import { currentTheme, openPalette, toggleTheme } from "@/lib/events";

const NAV = [
  { href: "/#work", label: "Records" },
  { href: "/#discography", label: "Discography" },
  { href: "/#about", label: "About" },
  { href: "/#recognition", label: "Awards" },
  { href: "/#contact", label: "Contact" },
];

/**
 * The shop front: a sign board ringed with marquee bulbs, the aisles, the search and the
 * lights, and a striped awning hanging over the street. Scroll down and the awning rolls up.
 */
export function SiteHeader() {
  const [theme, setThemeState] = useState<"light" | "dark" | null>(null);
  const [rolled, setRolled] = useState(false);

  useEffect(() => {
    const sync = () => setThemeState(currentTheme());
    sync();
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    window.addEventListener("ved:theme", sync);
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRolled(window.scrollY > 80));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("ved:theme", sync);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className="site-header" data-rolled={rolled || undefined}>
      <div className="frame site-header-inner">
        <Link href="/" className="sign" aria-label="VED Records, home">
          <span className="sign-board">
            <span className="sign-bulbs" aria-hidden />
            <span className="sign-name">Ved</span>
          </span>
          <span className="sign-sub">
            <span>Records &amp; Software</span>
            <span>Ahmedabad · est. 2024</span>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Aisles">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-tools">
          <button type="button" className="search-btn" onClick={() => openPalette()} aria-label="Open the command menu" aria-keyshortcuts="Control+K Meta+K /">
            <MagnifyingGlass aria-hidden weight="bold" width={18} height={18} />
            <span className="search-label">Search</span>
            <span className="menu-label">Menu</span>
            <span className="kbd" aria-hidden>
              /
            </span>
          </button>
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={theme === "dark" ? "Turn the lights up" : "Turn the lights down"}>
            {theme === "dark" ? <Sun aria-hidden weight="bold" /> : <Moon aria-hidden weight="bold" />}
          </button>
        </div>
      </div>
      <div className="awning" aria-hidden />
    </header>
  );
}

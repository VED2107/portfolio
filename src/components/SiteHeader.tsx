"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { openPalette } from "@/lib/events";
import { HeaderLamp } from "./HeaderLamp";

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
 * The lights are a pull cord, not a toggle: the same switch as the lamp in the shop.
 * On the home page the aisle you are standing in is marked, like a lit section sign.
 */
export function SiteHeader() {
  const [rolled, setRolled] = useState(false);
  const [aisle, setAisle] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRolled(window.scrollY > 80));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Which aisle is under the reader: the section crossing a line a third of the way down.
  useEffect(() => {
    const ids = NAV.map((n) => n.href.split("#")[1]);
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (pathname !== "/" || !els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setAisle(e.target.id);
      },
      { rootMargin: "-33% 0px -66% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const top = () => window.scrollY < innerHeight * 0.5 && setAisle(null);
    window.addEventListener("scroll", top, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", top);
    };
  }, [pathname]);

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
            <Link key={n.href} href={n.href} aria-current={pathname === "/" && aisle === n.href.split("#")[1] ? "true" : undefined}>
              <span className="nav-disc" aria-hidden />
              <span className="nav-label">{n.label}</span>
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
          <HeaderLamp />
        </div>
      </div>
      <div className="awning" aria-hidden />
    </header>
  );
}

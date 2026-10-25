"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { openPalette } from "@/lib/events";
import { HeaderLamp } from "./HeaderLamp";
import { AisleNav } from "./AisleNav";

/**
 * The shop front: a sign board ringed with marquee bulbs, the aisles, the search and the
 * lights, and a striped awning hanging over the street. Scroll down and the awning rolls up.
 * A lit marker glides under the aisle you are reading (AisleNav).
 * The lights are a pull cord, not a toggle: the same switch as the lamp in the shop.
 */
export function SiteHeader() {
  const [rolled, setRolled] = useState(false);

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
        <AisleNav />
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

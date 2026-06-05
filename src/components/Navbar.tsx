"use client";

import { useState, useEffect } from "react";
import { useRetroMode } from "@/components/EasterEggs";

const NAV_ITEMS = [
  { label: "Home", href: "#hero" },
  { label: "Profile", href: "#profile" },
  { label: "Quests", href: "#quests" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Missions", href: "#mission-control" },
  { label: "Scores", href: "#achievements" },
  { label: "Terminal", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { handleLogoClick } = useRetroMode();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050816]/90 shadow-[0_0_20px_rgba(0,245,255,0.1)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a
          href="#hero"
          className="font-[family-name:var(--font-pixel)] text-sm text-[#00F5FF] transition-all hover:text-[#FF00E5]"
          data-cursor-hover
          onClick={(e) => {
            e.preventDefault();
            handleLogoClick();
            document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          VED.EXE
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-[family-name:var(--font-body)] text-sm text-[#A0A0A0] transition-colors hover:text-[#00F5FF]"
              data-cursor-hover
            >
              {item.label}
            </a>
          ))}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
          data-cursor-hover
        >
          <span
            className={`block h-0.5 w-6 bg-[#00F5FF] transition-transform ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-[#00F5FF] transition-opacity ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-[#00F5FF] transition-transform ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#00F5FF]/10 bg-[#050816]/95 backdrop-blur-md md:hidden">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block px-6 py-3 font-[family-name:var(--font-body)] text-sm text-[#A0A0A0] transition-colors hover:bg-[#00F5FF]/5 hover:text-[#00F5FF]"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

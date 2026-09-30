"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SHEETS, SITE } from "@/lib/site";
import { FILINGS } from "@/lib/work";
import { Mark } from "./Mark";
import { SearchTrigger } from "./SearchTrigger";

/** The header strip of every sheet: title, where you are in the filing, and the palette. */
export function SiteStrip() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [sheet, setSheet] = useState(0);

  useEffect(() => {
    if (!onHome) return;
    const els = SHEETS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = SHEETS.findIndex((s) => s.id === e.target.id);
            if (i >= 0) setSheet(i);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [onHome]);

  const filing = pathname.startsWith("/work/") ? FILINGS.find((f) => pathname === `/work/${f.slug}`) : undefined;

  let where: React.ReactNode;
  if (onHome) {
    where = (
      <>
        <span className="ink-3">Sheet</span>{" "}
        <span key={sheet} className="tick inline-block text-[var(--ink)]">
          {sheet + 1}
        </span>
        <span className="ink-3"> of {SHEETS.length}</span>
        <span className="mx-2 text-[var(--rule)]" aria-hidden>
          /
        </span>
        <span className="text-[var(--ink)]">{SHEETS[sheet].label}</span>
      </>
    );
  } else if (filing) {
    where = (
      <>
        <span className="ink-3">Filing</span> <span className="text-[var(--ink)]">{filing.no}</span>
        <span className="mx-2 text-[var(--rule)]" aria-hidden>
          /
        </span>
        <span className="text-[var(--ink)]">{filing.title}</span>
      </>
    );
  } else {
    where = <span className="ink-3">Unfiled sheet</span>;
  }

  return (
    <header className="strip">
      <div className="frame flex h-full items-center justify-between gap-4">
        <Link
          href="/"
          transitionTypes={onHome ? undefined : ["nav-back"]}
          className="group flex items-center gap-2 no-underline"
          aria-label="VED.EXE, home"
        >
          <Mark className="h-[0.95rem] w-auto" />
          <span className="text-[1.05rem] font-extrabold tracking-[-0.02em] [font-stretch:125%]">
            VED<span className="transition-colors duration-200 group-hover:text-[var(--accent)]">.</span>EXE
          </span>
        </Link>

        <p className="t-num hidden min-w-0 truncate sm:block" aria-live="polite">
          {where}
        </p>

        <div className="flex items-center gap-2">
          <a href={SITE.resume} className="link hidden px-3 text-[0.9rem] md:inline-block" target="_blank" rel="noreferrer">
            Résumé
          </a>
          <SearchTrigger />
        </div>
      </div>
    </header>
  );
}

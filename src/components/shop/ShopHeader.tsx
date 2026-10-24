"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { openCatalog, currentTheme, setTheme } from "@/lib/events";
import { onSoundChange, play, setSound, soundOn } from "@/lib/sound";
import { Score } from "./Score";

const noop = () => () => {};
function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const m = matchMedia("(prefers-color-scheme: dark)");
  m.addEventListener("change", cb);
  return () => {
    mo.disconnect();
    m.removeEventListener("change", cb);
  };
}

export const AISLES = [
  { id: "records", label: "Records", aisle: "A" },
  { id: "film", label: "Film", aisle: "B" },
  { id: "counter", label: "Counter", aisle: "C" },
  { id: "checkout", label: "Checkout", aisle: "D" },
] as const;

/**
 * The shop directory. Name on the left, aisles in the middle, the catalogue terminal and the
 * shop's switches on the right. On phones the aisles move to a dock under your thumb.
 * Scrolling down tucks the sign away; any scroll up brings it back.
 */
export function ShopHeader() {
  const pathname = usePathname();
  const home = pathname === "/";
  const sound = useSyncExternalStore(onSoundChange, soundOn, () => false);
  const dark = useSyncExternalStore(subscribeTheme, () => currentTheme() === "dark", () => false);
  const mac = useSyncExternalStore(noop, () => /Mac|iPhone|iPad/.test(navigator.platform), () => false);
  const [seen, setHere] = useState<string | null>(null);
  const here = home ? seen : null;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let last = scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = scrollY;
        const el = ref.current;
        if (el) el.dataset.tucked = y > 240 && y > last + 2 ? "1" : y < last - 2 || y < 240 ? "0" : el.dataset.tucked;
        last = y;
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  // Which aisle you're standing in.
  useEffect(() => {
    if (!home) return;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setHere(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const a of [{ id: "shop" }, ...AISLES]) {
      const el = document.getElementById(a.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [home]);

  return (
    <>
      <header ref={ref} className="sign" data-tucked="0">
        <div className="frame sign-row">
          <Link href="/" className="sign-name" aria-label="VED Records & Film, home" transitionTypes={home ? undefined : ["nav-back"]}>
            <span className="sign-ved">Ved</span>
            <span className="pk sign-trade">
              Records
              <br />& Film
            </span>
          </Link>

          <nav className="sign-aisles" aria-label="Aisles">
            {AISLES.map((a) => (
              <Link key={a.id} href={`/#${a.id}`} className="sign-aisle" aria-current={here === a.id ? "location" : undefined}>
                <span className="cat" aria-hidden>
                  {a.aisle}
                </span>
                {a.label}
              </Link>
            ))}
          </nav>

          <div className="sign-tools">
            <button type="button" className="sign-catalog" onClick={() => openCatalog()} aria-keyshortcuts="Control+K Meta+K /">
              <span className="sign-catalog-label">Catalogue</span>
              <span className="kbd" aria-hidden>
                {mac ? "⌘K" : "Ctrl K"}
              </span>
            </button>
            <Score />
            <button
              type="button"
              className="sign-switch"
              aria-pressed={sound}
              onClick={() => {
                setSound(!sound);
              }}
              title="Interface sounds"
            >
              <span className="sign-switch-dot" aria-hidden />
              <span>Sound</span>
            </button>
            <button
              type="button"
              className="sign-switch"
              aria-pressed={!dark}
              onClick={() => {
                play("key");
                setTheme(dark ? "light" : "dark");
              }}
              title={dark ? "Turn the shop lights on" : "After hours"}
            >
              <span className="sign-switch-dot" aria-hidden />
              <span>Lights</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="dock" aria-label="Aisles">
        {AISLES.map((a) => (
          <Link key={a.id} href={`/#${a.id}`} className="dock-aisle" aria-current={here === a.id ? "location" : undefined}>
            <span className="cat" aria-hidden>
              {a.aisle}
            </span>
            {a.label}
          </Link>
        ))}
        <button type="button" className="dock-aisle dock-catalog" onClick={() => openCatalog()} aria-label="Open the catalogue">
          <span className="cat" aria-hidden>
            /
          </span>
          Find
        </button>
      </nav>
    </>
  );
}

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

/** The dial: the front window plus the aisles, each on its own frequency. */
const STATIONS = [
  { id: "shop", label: "Window", mhz: "88" },
  { id: "records", label: "Records", mhz: "92" },
  { id: "film", label: "Film", mhz: "98" },
  { id: "counter", label: "Counter", mhz: "104" },
  { id: "checkout", label: "Checkout", mhz: "108" },
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
  const needle = useRef<HTMLSpanElement>(null);
  useNeedle(needle, home);

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
    for (const a of STATIONS) {
      const el = document.getElementById(a.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [home]);

  return (
    <>
      <header ref={ref} className="sign" data-tucked="0">
        <div className="frame sign-row">
          {/* Maker's plate, top left of the faceplate. */}
          <Link href="/" className="sign-name" aria-label="VED Records & Film, home" transitionTypes={home ? undefined : ["nav-back"]}>
            <span className="sign-ved">Ved</span>
            <span className="sign-trade">
              Records &amp; Film
              <span className="sign-est">Model VSC-24</span>
            </span>
          </Link>

          {/* The tuning dial: the aisles are stations, the needle is where you are on the page. */}
          <nav className="dial" aria-label="Aisles">
            <span className="dial-scale" aria-hidden />
            <ol className="dial-stations">
              {STATIONS.map((a) => (
                <li key={a.id}>
                  <Link href={`/#${a.id}`} className="dial-station" aria-current={here === a.id ? "location" : undefined} onClick={() => play("key")}>
                    <span className="dial-mhz" aria-hidden>
                      {a.mhz}
                    </span>
                    <span className="dial-name">{a.label}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <span className="dial-needle" ref={needle} aria-hidden />
          </nav>

          <div className="sign-tools">
            <button type="button" className="sign-catalog" onClick={() => openCatalog()} aria-keyshortcuts="Control+K Meta+K /">
              <span className="sign-catalog-label">Search</span>
              <span className="kbd" aria-hidden>
                {mac ? "⌘K" : "Ctrl K"}
              </span>
            </button>
            <div className="rockers">
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

/**
 * The needle follows the scroll between stations: station positions are fixed on the dial, so
 * a long aisle doesn't hog the scale. Section tops are measured on layout change only; scroll
 * just interpolates and writes one transform.
 */
function useNeedle(ref: React.RefObject<HTMLSpanElement | null>, home: boolean) {
  useEffect(() => {
    const el = ref.current;
    const dial = el?.parentElement;
    if (!el || !dial) return;
    if (!home) {
      el.style.transform = "";
      return;
    }
    let tops: number[] = [];
    let marks: number[] = [];
    let raf = 0;
    const measure = () => {
      tops = STATIONS.map((a) => {
        const s = document.getElementById(a.id);
        return s ? s.getBoundingClientRect().top + scrollY : 0;
      });
      const d = dial.getBoundingClientRect();
      marks = [...dial.querySelectorAll<HTMLElement>(".dial-station")].map((m) => {
        const r = m.getBoundingClientRect();
        return r.left + r.width / 2 - d.left;
      });
      draw();
    };
    const draw = () => {
      if (!marks.length) return;
      const y = scrollY + innerHeight * 0.4;
      let i = 0;
      while (i < tops.length - 2 && y >= tops[i + 1]) i++;
      const t = Math.max(0, Math.min(1, (y - tops[i]) / Math.max(1, tops[i + 1] - tops[i])));
      el.style.transform = `translateX(${marks[i] + (marks[i + 1] - marks[i]) * t}px)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    ro.observe(dial);
    addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("scroll", onScroll);
    };
  }, [ref, home]);
}

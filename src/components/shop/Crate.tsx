"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GENRES, RELEASES, type Release } from "@/lib/catalog";
import { setupGsap } from "@/lib/motion";
import { Q } from "@/lib/capability";
import { pullOut } from "@/lib/handoff";
import { play } from "@/lib/sound";
import { scrollToTarget } from "@/lib/scroll";
import { Sleeve } from "./Sleeve";
import { RecordRoom } from "./RecordRoom";

type Mode = "stack" | "room" | "grid";

/**
 * The record collection.
 *
 * room   Fine pointer, wide and tall screen: walk into the record room (RecordRoom).
 * stack  Touch, narrow screens, and before any script runs. Each sleeve sticks and the next
 *        slides over it on native scroll, like flipping through a crate with your thumb.
 * grid   Reduced motion. Everything laid out, nothing moves.
 *
 * In every mode the strongest release is first, and the dividers take you to a genre.
 */
export function Crate() {
  const root = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<Mode>("stack");
  const walkTo = useRef<((slug: string) => void) | null>(null);
  const n = RELEASES.length;

  useEffect(() => {
    const pick = () => {
      if (matchMedia(Q.reduced).matches) return setMode("grid");
      setMode(matchMedia(Q.fine).matches && matchMedia(Q.wide).matches && matchMedia(Q.tall).matches ? "room" : "stack");
    };
    pick();
    const ms = [Q.reduced, Q.fine, Q.wide, Q.tall].map((q) => matchMedia(q));
    ms.forEach((m) => m.addEventListener("change", pick));
    return () => ms.forEach((m) => m.removeEventListener("change", pick));
  }, []);

  // stack: as the next sleeve slides over, the one beneath sinks back a touch and darkens.
  useEffect(() => {
    if (mode !== "stack" || !root.current) return;
    const gsap = setupGsap();
    const slots = [...root.current.querySelectorAll<HTMLElement>(".crate-slot")];
    const ctx = gsap.context(() => {
      slots.slice(0, -1).forEach((s, i) => {
        const st = { trigger: slots[i + 1], start: "top bottom", end: "top 30%", scrub: true };
        gsap.to(s.querySelector(".crate-record"), { scale: 0.93, y: -10, ease: "none", scrollTrigger: st });
        gsap.to(s.querySelector(".crate-shade"), { opacity: 0.4, ease: "none", scrollTrigger: { ...st } });
      });
    }, root);
    return () => ctx.revert();
  }, [mode]);

  const onApi = useCallback((fn: (slug: string) => void) => {
    walkTo.current = fn;
  }, []);

  const pull = (r: Release, el: HTMLElement) => {
    pullOut(r.slug, mode === "grid" ? null : el.querySelector<HTMLElement>(".sleeve"));
  };

  const genreOf = (r: Release) => GENRES.find((g) => g.id === r.genre)!;

  return (
    <section id="records" ref={root} className="records grain" aria-labelledby="records-title" data-mode={mode}>
      <header className="frame records-head">
        <p className="pk ink-3">Aisle A · Records</p>
        <h2 id="records-title" className="h1">
          The record
          <br />
          collection
        </h2>
        <p className="lede records-lede">
          {n} releases, every one shipped and running, the strongest by the door. Each is a product with its own sleeve; pull one out to hear what it does and read how it was made.
        </p>
        <nav className="dividers" aria-label="Crate dividers">
          {GENRES.map((g) => {
            const first = RELEASES.find((r) => r.genre === g.id)!;
            const count = RELEASES.filter((r) => r.genre === g.id).length;
            return (
              <button
                key={g.id}
                type="button"
                className="divider"
                onClick={() => {
                  play("paper");
                  if (mode === "room" && walkTo.current) walkTo.current(first.slug);
                  else scrollToTarget(`#rec-${first.slug}`, { offset: -80 });
                }}
              >
                <span className="divider-tab">{g.short}</span>
                <span className="cat ink-3">{count}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {mode === "room" ? (
        <>
          <div className="room-threshold" aria-hidden>
            <span className="room-threshold-shelf" />
            <span className="room-threshold-sign pk">Aisle A · {n} in stock</span>
          </div>
          <RecordRoom onApi={onApi} />
          <div className="room-exit" aria-hidden />
        </>
      ) : (
        <div className="crate-pin">
          <div className="frame crate-stage">
            <div className="crate-box">
              <ol className="crate-records">
                {RELEASES.map((r, i) => (
                  <li key={r.slug} id={`rec-${r.slug}`} className="crate-slot" data-i={i}>
                    <button type="button" className="crate-record" onClick={(e) => pull(r, e.currentTarget)} data-cursor="Pull" aria-label={`${r.title}, ${r.cat}, ${r.field}, ${r.year}. Pull it out.`}>
                      <Sleeve r={r} flipId={`sleeve-${r.slug}`} sizes="(min-width: 640px) 70vw, 92vw" />
                      <span className="crate-shade" aria-hidden />
                    </button>
                    <div className="crate-card">
                      <p className="cat ink-3">
                        {r.cat} · {r.format} · {r.year}
                      </p>
                      <p className="crate-card-title">{r.title}</p>
                      <p className="small">{r.short}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* The inventory slip: everything at a glance, for anyone in a hurry. */}
      <div className="frame inventory">
        <h3 className="pk">Inventory slip</h3>
        <table className="inventory-table">
          <thead>
            <tr>
              <th scope="col">Cat. no.</th>
              <th scope="col">Release</th>
              <th scope="col" className="inv-hide">
                Genre
              </th>
              <th scope="col" className="inv-hide">
                Label
              </th>
              <th scope="col">Year</th>
            </tr>
          </thead>
          <tbody>
            {RELEASES.map((r) => (
              <tr key={r.slug}>
                <td className="cat">{r.cat}</td>
                <td>
                  <Link href={`/work/${r.slug}`} className="inv-link" transitionTypes={["nav-forward"]}>
                    {r.title}
                  </Link>
                  <span className="inv-field small">{r.field}</span>
                </td>
                <td className="inv-hide small">{genreOf(r).short}</td>
                <td className="inv-hide small">{r.label}</td>
                <td className="cat">{r.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

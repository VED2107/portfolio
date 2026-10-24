"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RELEASES, GENRES, type Release } from "@/lib/catalog";
import { setupGsap } from "@/lib/motion";
import { inspect } from "@/lib/events";
import { handOff } from "@/lib/handoff";
import { play } from "@/lib/sound";
import { scrollToTarget } from "@/lib/scroll";
import { Sleeve } from "./Sleeve";
import { Vinyl } from "./Vinyl";

/**
 * The record room: a spinning display rack in the middle of the shop. Scrolling turns the rack
 * one sleeve at a time (it settles on each, the way a heavy stand does); the record facing you
 * is full size, its shelf talker beside it. The cinema moves you sideways; here the stock moves
 * and you stay put.
 */
export function RecordRoom({ onApi }: { onApi?: (go: (slug: string) => void) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [current, setCurrent] = useState(0);
  const n = RELEASES.length;

  const go = useCallback(
    (i: number) => {
      const st = trigger.current;
      if (st) scrollToTarget(st.start + ((st.end - st.start) * i) / (n - 1));
    },
    [n],
  );

  useEffect(() => {
    onApi?.((slug) => go(Math.max(0, RELEASES.findIndex((r) => r.slug === slug))));
  }, [onApi, go]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const gsap = setupGsap();
    const pin = el.querySelector<HTMLElement>(".spin-pin")!;
    const rack = el.querySelector<HTMLElement>(".spin-rack")!;
    const slots = [...el.querySelectorAll<HTMLElement>(".spin-slot")];
    const shades = slots.map((s) => s.querySelector<HTMLElement>(".crate-shade")!);
    const step = 360 / n;

    let target = 0;
    let pos = 0;
    let last = -1;
    let moved = 0;
    const st = ScrollTrigger.create({
      trigger: pin,
      start: "top top",
      end: () => `+=${(n - 1) * innerHeight * 0.55}`,
      pin: true,
      refreshPriority: 2,
      onUpdate: (self) => {
        target = self.progress * (n - 1);
        moved = performance.now();
      },
    });
    trigger.current = st;

    // Heavy stand: it eases toward the scroll and carries a little momentum.
    const frame = () => {
      // While you scroll, the rack follows; when you stop, it settles onto the nearest record.
      const want = performance.now() - moved > 160 ? Math.round(target) : target;
      pos += (want - pos) * 0.085;
      if (Math.abs(want - pos) < 0.0005) pos = want;
      rack.style.transform = `translateZ(calc(var(--r) * -1)) rotateY(${-pos * step}deg)`;
      for (let i = 0; i < n; i++) {
        let a = ((i - pos) * step) % 360;
        if (a > 180) a -= 360;
        if (a < -180) a += 360;
        const away = Math.min(1, Math.abs(a) / 120);
        shades[i].style.opacity = String(Math.min(0.8, away * 1.4));
        slots[i].style.opacity = String(Math.max(0, 1 - away) ** 1.4);
      }
      const idx = Math.round(pos);
      if (idx !== last) {
        last = idx;
        setCurrent(idx);
        if (st.isActive) play("sleeve");
      }
    };
    gsap.ticker.add(frame);
    return () => {
      gsap.ticker.remove(frame);
      st.kill();
      trigger.current = null;
      rack.style.transform = "";
      slots.forEach((x) => (x.style.opacity = ""));
    };
  }, [n]);

  const pull = (r: Release, i: number, el: HTMLElement) => {
    if (i !== current) return go(i);
    const s = el.querySelector<HTMLElement>(".sleeve");
    if (s) handOff(r.slug, s);
    play("sleeve");
    inspect(r.slug);
  };

  const cur = RELEASES[current];
  const genre = GENRES.find((g) => g.id === cur.genre)!;

  return (
    <div ref={root} className="spin">
      <div className="spin-pin">
        <div className="spin-scene" aria-hidden>
          <span className="spin-wall" />
          <span className="spin-racks" />
          <span className="spin-floor" />
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="spin-pendant" style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>

        <div className="frame spin-stage">
          <aside className="spin-talker" aria-live="polite">
            <span className="talker-clip" aria-hidden />
            <p className="cat spin-talker-cat">
              {cur.cat} · {cur.format} · {cur.year}
            </p>
            <h3 className="spin-talker-title display">{cur.title}</h3>
            <p className="pk spin-talker-genre">
              {genre.label} · {cur.label}
            </p>
            <p className="spin-talker-short">{cur.short}</p>
            <dl className="spin-talker-facts">
              {cur.hype.map((h, k) => (
                <div key={h.label} className="sticker" style={{ "--rot": `${k ? 2 : -3}deg` } as React.CSSProperties}>
                  <dd>
                    <b>{h.value}</b>
                  </dd>
                  <dt>
                    <span>{h.label}</span>
                  </dt>
                </div>
              ))}
            </dl>
            <button type="button" className="press" onClick={(e) => pull(cur, current, e.currentTarget.closest(".spin")!.querySelector<HTMLElement>(`.spin-slot[data-i="${current}"] .crate-record`)!)}>
              Pull it out
            </button>
            <p className="small spin-talker-hint">
              <span className="kbd">Scroll</span> turns the rack · {current + 1} of {n}
            </p>
          </aside>

          <div className="spin-stand">
            <div className="spin-rack">
              {RELEASES.map((r, i) => (
                <div key={r.slug} id={`rec-${r.slug}`} className="spin-slot" data-i={i} style={{ "--a": `${(360 / n) * i}deg` } as React.CSSProperties}>
                  <button
                    type="button"
                    className="crate-record"
                    onClick={(e) => pull(r, i, e.currentTarget)}
                    onFocus={() => i !== current && go(i)}
                    data-cursor={i === current ? "Pull" : "Turn"}
                    aria-label={`${r.title}, ${r.cat}, ${r.field}, ${r.year}. ${i === current ? "Pull it out." : "Turn the rack to it."}`}
                  >
                    <Vinyl r={r} className="spin-vinyl" />
                    <Sleeve r={r} flipId={`sleeve-${r.slug}`} sizes="(min-width: 1024px) 26vw, 60vw" />
                    <span className="crate-shade" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
            <span className="spin-post" aria-hidden />
            <span className="spin-base" aria-hidden />
          </div>

          <ol className="spin-index" aria-label="Turn to a record">
            {RELEASES.map((r, i) => (
              <li key={r.slug}>
                <button type="button" onClick={() => go(i)} aria-current={i === current ? "true" : undefined}>
                  <span className="cat">{r.cat}</span>
                  <span className="spin-index-title">{r.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FILM_SHELVES,
  SHELVES,
  SNAPSHOT_DATE,
  type Film,
  type Shelf,
} from "@/lib/catalog";
import { setupGsap } from "@/lib/motion";
import { Q } from "@/lib/capability";
import { play } from "@/lib/sound";
import { FilmCover } from "./FilmCover";
import { DiscMenu } from "./DiscMenu";
import { RoomScene } from "./RoomScene";
import { sceneState } from "@/lib/sceneState";
import { caseLeaves } from "@/lib/handoff";

type Mode = "flat" | "track";

/** Ink that reads on a spine of this colour. */
function inkOn(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#0c0e12" : "#f3f5f9";
}

/**
 * The marquee letterboard: black plastic letters on a backlit board. When the title changes,
 * the old letters come down and the new ones are hung, one at a time.
 */
function Letterboard({
  top,
  title,
  foot,
}: {
  top: string;
  title: string;
  foot: string;
}) {
  return (
    <div className="board" aria-hidden>
      <span className="board-bulbs" />
      <div className="board-face">
        <p className="board-row board-row-small">{top}</p>
        <p className="board-row board-row-big" key={title}>
          {title.split("").map((c, i) => (
            <span
              key={i}
              className="board-tile"
              style={{ "--i": i } as React.CSSProperties}
              data-space={c === " " || undefined}
            >
              {c}
            </span>
          ))}
        </p>
        <p className="board-row board-row-small">{foot}</p>
      </div>
    </div>
  );
}

type Open = (f: Film, el: HTMLElement, spine: boolean) => void;

function Spine({ f, onOpen, picked }: { f: Film; onOpen: Open; picked: boolean }) {
  return (
    <li className="fcase-slot" data-picked={picked || undefined}>
      <button
        type="button"
        className="fcase"
        data-shell={f.shell}
        style={
          {
            "--tone": f.tone,
            "--tone-ink": inkOn(f.tone),
          } as React.CSSProperties
        }
        onClick={(e) => onOpen(f, e.currentTarget, true)}
        data-cursor="Open"
        aria-label={`${f.title}. ${f.edition}. Open the case.`}
      >
        <span className="fcase-band pk">BD</span>
        <span className="fcase-title">{f.title}</span>
        <span className="fcase-cat cat">{f.cat}</span>
        <span className="case-plastic" aria-hidden />
      </button>
      <span className="stub" aria-hidden>
        <span className="pk">Admit one</span>
        <b>{f.title}</b>
        <span className="cat">{f.edition}</span>
      </span>
    </li>
  );
}

function Bay({
  s,
  faceOut,
  onOpen,
  picked,
}: {
  s: Shelf;
  faceOut?: boolean;
  onOpen: Open;
  picked: string | null;
}) {
  return (
    <section
      className={`fbay ${faceOut ? "fbay-faceout" : ""}`}
      data-label={s.label}
      aria-labelledby={`bay-${s.id}`}
    >
      <span className="fbay-spot" aria-hidden />
      <header className="fbay-sign">
        <span className="pk">
          {faceOut ? "Faced out" : `${s.items.length} cases`}
        </span>
        <h3 id={`bay-${s.id}`} className="fbay-title display">
          {s.label}
        </h3>
        <p className="fbay-note">{s.note}</p>
      </header>
      <ul className="fbay-row">
        {faceOut
          ? s.items.map((f) => (
              <li key={f.id} className="fface-slot" data-picked={picked === f.id || undefined}>
                <button
                  type="button"
                  className="fface"
                  onClick={(e) => onOpen(f, e.currentTarget, false)}
                  data-cursor="Open"
                  aria-label={`${f.title}. ${f.edition}. Open the case.`}
                >
                  <FilmCover f={f} sizes="240px" />
                  <span className="case-plastic" aria-hidden />
                </button>
                <span className="fface-tag">
                  <span className="cat">{f.cat}</span> {f.edition}
                </span>
              </li>
            ))
          : s.items.map((f) => <Spine key={f.id} f={f} onOpen={onOpen} picked={picked === f.id} />)}
      </ul>
      <span className="fbay-plank" aria-hidden />
    </section>
  );
}

/**
 * The back room, as one sequence. You arrive at closed velvet curtains; the first stretch of
 * scroll draws them apart and the house lights go down. Then the camera dollies sideways along
 * the lobby's wall of cases, under a marquee letterboard that spells out what you're passing.
 * Films are public repositories; the shelves between them are the skills, each case listing
 * where it was used. Phones get the lit board and the same shelves, one under another.
 */
export function FilmRoom() {
  const root = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<Mode>("flat");
  const [open, setOpen] = useState<Film | null>(null);
  const [bay, setBay] = useState("");
  // Bumped after a resize settles: the sequence is measured in pixels, so it is rebuilt.
  const [built, setBuilt] = useState(0);

  useEffect(() => {
    let t = 0;
    const on = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setBuilt((n) => n + 1), 250);
    };
    addEventListener("resize", on);
    return () => {
      window.clearTimeout(t);
      removeEventListener("resize", on);
    };
  }, []);

  useEffect(() => {
    const pick = () =>
      setMode(
        !matchMedia(Q.reduced).matches &&
          matchMedia(Q.fine).matches &&
          matchMedia(Q.wide).matches &&
          matchMedia(Q.tall).matches
          ? "track"
          : "flat",
      );
    pick();
    const ms = [Q.reduced, Q.fine, Q.wide, Q.tall].map((q) => matchMedia(q));
    ms.forEach((m) => m.addEventListener("change", pick));
    return () => ms.forEach((m) => m.removeEventListener("change", pick));
  }, []);

  useEffect(() => {
    if (mode !== "track" || !root.current) return;
    const gsap = setupGsap();
    const el = root.current;
    const pin = el.querySelector<HTMLElement>(".ftrack-pin")!;
    const wall = el.querySelector<HTMLElement>(".ftrack-wall")!;
    const front = el.querySelector<HTMLElement>(".ftrack-front")!;
    const carpet = el.querySelector<HTMLElement>(".ftrack-carpet")!;
    const bays = [...el.querySelectorAll<HTMLElement>(".fbay, .fexit")];
    const travel = () => Math.max(0, wall.scrollWidth - innerWidth);
    const curtainRun = () => innerHeight * 0.9;
    let last = "";
    let start = 0;
    let opened = false;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${curtainRun() + travel()}`,
          pin: true,
          scrub: 0.7,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          onRefresh: (self) => (start = self.start),
          onUpdate: (self) => {
            sceneState.cinema = self.progress;
            sceneState.cinemaCurtain = curtainRun() / (curtainRun() + travel() || 1);
            const now =
              self.progress * (curtainRun() + travel()) > curtainRun() * 0.6;
            if (now !== opened) {
              opened = now;
              play(now ? "needle" : "paper");
            }
          },
        },
      });
      // Durations are in pixels of scroll, so the scrub maps one-to-one onto distance.
      const C = curtainRun();
      const T = travel();
      // Act one: the curtains part (heavy fabric: slow to start), the house lights go down.
      tl.to(".curtain-l", { xPercent: -100, ease: "power2.in", duration: C }, 0)
        .to(".curtain-r", { xPercent: 100, ease: "power2.in", duration: C }, 0)
        .to(".houselights", { opacity: 0, duration: C * 0.8 }, 0)
        .to(".pelmet", { yPercent: -110, ease: "power2.in", duration: C * 0.45 }, C * 0.55)
        .fromTo(".board", { y: -40, opacity: 0.4 }, { y: 0, opacity: 1, duration: C * 0.6 }, C * 0.3)
        // Act two: the dolly along the wall, the ropes passing faster, the carpet slower.
        .to(wall, { x: -T, duration: T }, C)
        .to(front, { x: -T * 1.45, duration: T }, C)
        .to(carpet, { x: -T * 0.6, duration: T }, C);
    }, el);

    // Which bay is in front of you: read after the scrub has moved the wall, a few times a second.
    let tick = 0;
    const which = () => {
      if (++tick % 6) return;
      let label = "";
      if (opened) {
        const mid = innerWidth / 2;
        let bd = Infinity;
        for (const b of bays) {
          const r = b.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - mid);
          if (d < bd) {
            bd = d;
            label = b.dataset.label ?? "";
          }
        }
      }
      if (label !== last) {
        last = label;
        setBay(label);
      }
    };
    gsap.ticker.add(which);

    // Keyboard: tab to a case off-screen and the dolly brings it into view.
    const focus = (e: FocusEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>(".fbay, .fexit");
      if (!t) return;
      const x = t.offsetLeft + t.offsetWidth / 2 - innerWidth / 2;
      window.scrollTo({
        top: start + curtainRun() + Math.max(0, Math.min(travel(), x)),
        behavior: "auto",
      });
    };
    wall.addEventListener("focusin", focus);
    return () => {
      gsap.ticker.remove(which);
      wall.removeEventListener("focusin", focus);
      ctx.revert();
    };
  }, [mode, built]);

  // Walking down the passage: the walls close in and the light drops, tied to the scroll.
  useEffect(() => {
    const el = root.current?.querySelector<HTMLElement>(".passage");
    if (!el || matchMedia(Q.reduced).matches) return;
    const gsap = setupGsap();
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: "top 85%", end: "bottom bottom", scrub: 0.6 };
      gsap.fromTo(".passage-wall", { scaleX: 0 }, { scaleX: 1, ease: "power1.in", scrollTrigger: st });
      gsap.fromTo(".passage-dim", { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { ...st } });
      gsap.fromTo(".passage-sign", { y: -24, rotate: -2 }, { y: 0, rotate: 0, ease: "none", scrollTrigger: { ...st } });
    }, el);
    return () => ctx.revert();
  }, [mode]);

  // Touch has no hover: the first tap takes the case off the shelf, the second opens it.
  const [picked, setPicked] = useState<string | null>(null);
  const onOpen = useCallback<Open>(
    (f, el, spine) => {
      if (matchMedia("(hover: none), (pointer: coarse)").matches && picked !== f.id) {
        setPicked(f.id);
        play("case");
        return;
      }
      caseLeaves(el, spine);
      setPicked(null);
      play("case");
      setOpen(f);
    },
    [picked],
  );

  // Plastic catches the light where the pointer is: one delegated listener, the case's own
  // element gets two variables, nothing re-renders.
  useEffect(() => {
    const el = root.current;
    if (!el || !matchMedia(Q.fine).matches || matchMedia(Q.reduced).matches) return;
    let cur: HTMLElement | null = null;
    let box: DOMRect | null = null;
    const over = (e: PointerEvent) => {
      const c = (e.target as HTMLElement).closest<HTMLElement>(".fcase, .fface");
      if (c === cur) return;
      if (cur) {
        cur.style.removeProperty("--px");
        cur.style.removeProperty("--py");
      }
      cur = c;
      box = c?.getBoundingClientRect() ?? null;
    };
    const move = (e: PointerEvent) => {
      if (!cur || !box) return;
      cur.style.setProperty("--px", ((e.clientX - box.left) / box.width).toFixed(3));
      cur.style.setProperty("--py", ((e.clientY - box.top) / box.height).toFixed(3));
    };
    el.addEventListener("pointerover", over);
    el.addEventListener("pointermove", move, { passive: true });
    return () => {
      el.removeEventListener("pointerover", over);
      el.removeEventListener("pointermove", move);
    };
  }, [mode]);

  const [studio, experiments] = FILM_SHELVES;
  const [languages, ...skills] = SHELVES;
  const showing = mode === "track" ? bay || "The back room" : "Film & skills";

  return (
    <section
      id="film"
      ref={root}
      className="film"
      data-mode={mode}
      aria-labelledby="film-title"
    >
      <h2 id="film-title" className="sr-only">
        The back room: film, skills and special features
      </h2>
      {/* The way back: the shop narrows to a doorway, the warm light stays behind, a sign points on. */}
      <div className="passage" aria-hidden>
        <span className="passage-wall passage-wall-l" />
        <span className="passage-wall passage-wall-r" />
        <span className="passage-dim" />
        <div className="passage-sign">
          <span className="passage-wire" />
          <span className="pk">Staff &amp; visitors · this way</span>
          <b className="display">The back room</b>
          <span className="pk">Film · skills · B-sides</span>
        </div>
      </div>
      {/* The pin's own wrapper: GSAP wraps .ftrack-pin in a spacer, so React must never place siblings beside it. */}
      <div className="ftrack-anchor">
        <div className="ftrack-pin">
          <div className="ftrack-view" data-room="cinema">
            {mode === "track" && <RoomScene kind="cinema" />}
            <div className="ftrack-ceiling" aria-hidden />
            <div className="ftrack-carpet" aria-hidden />
            <Letterboard
              top="Aisle B · Now showing"
              title={showing}
              foot={`From public GitHub · ${SNAPSHOT_DATE}`}
            />
            <p className="ftrack-intro">
              The studio, the experiments, and the skills behind the records.
              Every skill case lists exactly where it was used. Open any case
              for its disc menu.
            </p>

            <div className="ftrack-wall">
              <Bay s={studio} faceOut onOpen={onOpen} picked={picked} />
              <Bay s={languages} onOpen={onOpen} picked={picked} />
              <Bay s={experiments} faceOut onOpen={onOpen} picked={picked} />
              {skills.map((s) => (
                <Bay key={s.id} s={s} onOpen={onOpen} picked={picked} />
              ))}
              <div className="fexit" data-label="Exit">
                <span className="fexit-sign">Exit</span>
                <span className="pk">To the counter</span>
              </div>
              <span className="filmstrip" aria-hidden />
            </div>

            <div className="ftrack-front" aria-hidden>
              {Array.from({ length: 16 }, (_, i) => (
                <span
                  key={i}
                  className="stanchion"
                  style={{ "--i": i } as React.CSSProperties}
                />
              ))}
            </div>

            {/* The curtains and the house lights: only drawn when there is a stage to open. */}
            {mode === "track" && (
              <div className="curtains" aria-hidden>
                <span className="houselights" />
                <span className="curtain curtain-l" />
                <span className="curtain curtain-r" />
                <span className="pelmet">
                  <span className="pelmet-word display">The back room</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {open && <DiscMenu film={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

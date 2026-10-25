"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Copy, Pause, Play } from "@phosphor-icons/react";
import type { RecordSpec, Shop, Station } from "./shop";
import { isPlaying, levels, play as playSong, toggle as toggleSong } from "@/lib/audio";
import { copyText, toast } from "@/lib/events";

export type ExplorerRecord = RecordSpec & {
  slug?: string;
  field?: string;
  short?: string;
  proof?: { value: string; label: string };
  live?: { label: string; href: string };
  tracks: { no: string; title: string; body?: string }[];
};

export type ExplorerProps = {
  records: ExplorerRecord[];
  honors: { title: string; by: string; when: string; detail: string }[];
  now: { verb: string; what: string; detail: string; href?: string }[];
  email: string;
  resume: string;
  links: { label: string; href: string }[];
  status: string;
  houseNote: string;
};

const STATIONS: { id: Station; label: string }[] = [
  { id: "floor", label: "Shop floor" },
  { id: "crates", label: "New releases" },
  { id: "booth", label: "Listening booth" },
  { id: "wall", label: "Awards wall" },
  { id: "board", label: "Notice board" },
  { id: "counter", label: "Counter" },
];

/**
 * The shop you can walk around. The 3D floor is the map; every station opens a panel with the
 * real content. Without WebGL, the intro and the station panels still work as a plain page.
 */
export function Explorer(props: ExplorerProps) {
  const { records, honors, now, email, resume, links, status, houseNote } = props;
  const canvas = useRef<HTMLCanvasElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const shop = useRef<Shop | null>(null);
  const [gl, setGl] = useState(false);
  const [station, setStation] = useState<Station>("floor");
  const [platter, setPlatter] = useState(-1);
  const [track, setTrack] = useState(0);
  const [award, setAward] = useState<number | undefined>(undefined);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const on = () => setPlaying(isPlaying());
    window.addEventListener("ved:audio", on);
    return () => window.removeEventListener("ved:audio", on);
  }, []);

  useEffect(() => {
    const c = canvas.current;
    const t = tip.current;
    if (!c || !t) return;
    let ok = false;
    try {
      ok = !!document.createElement("canvas").getContext("webgl2");
    } catch {
      ok = false;
    }
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!ok || saveData) return;

    let disposed = false;
    let cleanup = () => {};
    import("./shop").then(({ Shop }) => {
      if (disposed) return;
      const s = new Shop(
        c,
        records,
        { honors: honors.map((h) => h.title), now: now.map((n) => ({ verb: n.verb, what: n.what })) },
        {
          onHover(caption, x, y) {
            if (!caption) {
              t.hidden = true;
              return;
            }
            t.hidden = false;
            t.textContent = caption;
            t.style.transform = `translate(${x + 16}px, ${y + 18}px)`;
          },
          onStation(st, detail) {
            setStation(st);
            if (st === "wall") setAward(detail);
          },
          onPlatter: setPlatter,
          onTrack: setTrack,
        },
      );
      s.setTrackCaption((r, k) => {
        const tr = records[r]?.tracks[k];
        return tr ? `${tr.no}  ${tr.title}` : "";
      });
      const out = new Float32Array(4);
      s.level = () => (isPlaying() ? levels(out)[0] : 0);
      shop.current = s;
      setGl(true);

      const section = c.closest("section")!;
      let visible = false;
      const run = () => s.setRunning(visible && !document.hidden);
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        run();
      });
      io.observe(section);
      document.addEventListener("visibilitychange", run);
      const onNeedle = () => {
        s.goto("booth");
        setStation("booth");
        void s.play(0);
      };
      window.addEventListener("ved:needle", onNeedle);
      cleanup = () => {
        io.disconnect();
        document.removeEventListener("visibilitychange", run);
        window.removeEventListener("ved:needle", onNeedle);
        s.dispose();
        shop.current = null;
      };
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [records, honors, now]);

  const go = useCallback((st: Station) => {
    setStation(st);
    shop.current?.goto(st);
    if (st === "booth" && shop.current && platter < 0) void shop.current.play(0);
  }, [platter]);

  const pull = (i: number) => {
    setStation("booth");
    shop.current?.goto("booth");
    void shop.current?.play(i);
    if (!shop.current) setPlatter(i);
  };

  const rec = records[platter >= 0 ? platter : 0];

  return (
    <section className="explore" data-gl={gl || undefined} data-station={station} aria-labelledby="hero-title">
      <canvas ref={canvas} className="explore-canvas" aria-hidden />
      <div ref={tip} className="groove-tip" hidden role="presentation" />

      <div className="frame explore-ui">
        {/* the welcome mat */}
        <div className="explore-intro">
          <h1 id="hero-title" className="hero-sign">
            Ved Chauhan
          </h1>
          <p className="lede">
            Software engineer. This is my record shop: every project I&rsquo;ve shipped is pressed to vinyl. Pull one from the crates, drop the needle, read
            the awards wall.
          </p>
          <p className="hero-status small">
            <span className="dot" aria-hidden />
            <span>{status}</span>
          </p>
          <div className="actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                void playSong();
                window.dispatchEvent(new CustomEvent("ved:needle"));
              }}
            >
              <Play aria-hidden weight="fill" />
              Drop the needle
            </button>
            <button type="button" className="btn" onClick={() => go("crates")}>
              Browse the crates
            </button>
            <a href={resume} className="btn" target="_blank" rel="noreferrer">
              Résumé (PDF)
            </a>
          </div>
          {gl && <p className="small muted explore-hint">Click anything in the shop. Drag to look around.</p>}
        </div>

        {/* the station panel */}
        {station !== "floor" && (
          <aside className="explore-panel" aria-live="polite">
            <button type="button" className="back" onClick={() => go("floor")}>
              <ArrowLeft aria-hidden weight="bold" />
              Back to the floor
            </button>

            {station === "crates" && (
              <>
                <p className="cat">Aisle A · New releases</p>
                <h2 className="panel-title">Pull a record</h2>
                <ul className="crate-list">
                  {records.slice(1).map((r, k) => (
                    <li key={r.id}>
                      <button type="button" onClick={() => pull(k + 1)}>
                        <span className="crate-chip" style={{ background: r.sleeve, color: r.ink }}>
                          {r.cat.replace("VED ", "")}
                        </span>
                        <span>
                          <b>{r.title}</b>
                          <span className="small muted">{r.field}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {station === "booth" && rec && (
              <>
                <p className="cat">{rec.cat} · On the platter</p>
                <h2 className="panel-title">{rec.title}</h2>
                {rec.short ? <p>{rec.short}</p> : <p>{houseNote}</p>}
                {rec.proof && (
                  <p className="work-proof">
                    <span className="proof-value">{rec.proof.value}</span>
                    <span className="small">{rec.proof.label}</span>
                  </p>
                )}
                {platter === 0 && (
                  <button type="button" className="btn btn-primary" onClick={toggleSong} aria-pressed={playing} style={{ justifySelf: "start" }}>
                    {playing ? <Pause aria-hidden weight="fill" /> : <Play aria-hidden weight="fill" />}
                    {playing ? "Lift the needle" : "Play Our Song"}
                  </button>
                )}
                {platter > 0 && (
                  <ol className="booth-tracks">
                    {rec.tracks.map((t, k) => (
                      <li key={t.title} data-on={k === track || undefined}>
                        <button type="button" onClick={() => shop.current?.setTrack(k) ?? setTrack(k)} aria-current={k === track}>
                          <span className="track-no">{t.no}</span>
                          <span>{t.title}</span>
                        </button>
                        {k === track && t.body && <p className="small">{t.body}</p>}
                      </li>
                    ))}
                  </ol>
                )}
                {rec.slug && (
                  <div className="actions">
                    <Link href={`/work/${rec.slug}`} className="btn btn-primary">
                      Read the liner notes
                    </Link>
                    {rec.live && (
                      <a href={rec.live.href} className="btn" target="_blank" rel="noreferrer">
                        {rec.live.label}
                        <ArrowUpRight aria-hidden weight="bold" />
                      </a>
                    )}
                  </div>
                )}
                <button type="button" className="link small" onClick={() => go("crates")}>
                  Pick another record
                </button>
              </>
            )}

            {station === "wall" && (
              <>
                <p className="cat">Aisle C · Awards wall</p>
                <h2 className="panel-title">On the wall</h2>
                <ul className="award-list">
                  {honors.map((h, k) => (
                    <li key={h.title} data-on={award === k || undefined}>
                      <span className="cat">
                        {h.by}, {h.when}
                      </span>
                      <b>{h.title}</b>
                      <span className="small">{h.detail}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {station === "board" && (
              <>
                <p className="cat">Pinned by the door</p>
                <h2 className="panel-title">On now</h2>
                <ul className="award-list">
                  {now.map((n) => (
                    <li key={n.what}>
                      <span className="cat">{n.verb}</span>
                      <b>{n.href ? <Link href={n.href}>{n.what}</Link> : n.what}</b>
                      <span className="small">{n.detail}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {station === "counter" && (
              <>
                <p className="cat">The counter</p>
                <h2 className="panel-title">Request a record</h2>
                <p>Hiring for a software engineering internship or an entry-level full-stack role, or need a system built? Tell me what you need.</p>
                <a className="counter-mail" href={`mailto:${email}?subject=${encodeURIComponent("A record request")}`}>
                  {email}
                </a>
                <div className="actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={async () => toast((await copyText(email)) ? "Email address copied" : email)}
                  >
                    <Copy aria-hidden weight="bold" />
                    Copy email
                  </button>
                  <a href={resume} className="btn" target="_blank" rel="noreferrer">
                    Résumé (PDF)
                  </a>
                </div>
                <ul className="counter-links">
                  {links.map((l) => (
                    <li key={l.href}>
                      <a className="link" href={l.href} target="_blank" rel="noreferrer">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        )}

        {/* the aisles, reachable from the keyboard */}
        {gl && (
          <nav className="station-bar" aria-label="Walk to">
            {STATIONS.map((s) => (
              <button key={s.id} type="button" aria-current={station === s.id} onClick={() => go(s.id)}>
                {s.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      {!gl && (
        <div className="explore-fallback" aria-hidden>
          <div className="vinyl">
            <div className="vinyl-label" style={{ background: "#e3a72f", color: "#1d1712" }}>
              <b>VED</b>
              <span>VED 000</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

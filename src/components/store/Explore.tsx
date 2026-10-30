"use client";
/**
 * Explore mode: the store and everything floating over it. The 3D world is loaded only after the
 * front door has painted and only where WebGL exists; without it, the front door still reads as a
 * page and Quick View is one click away.
 */
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, MapTrifold, MusicNotes, SkipForward, SpeakerHigh, SpeakerSlash, SquaresFour, X } from "@phosphor-icons/react";
import type { WorldContent } from "@/world/World";
import { ROOMS, SPAWN } from "@/world/layout";
import { sim } from "@/world/runtime";
import { loadPrefs, savePrefs, send, useWorld, world } from "@/world/state";
import { close, goUse, unstuck } from "@/world/control";
import { setSound, disposeAudio } from "@/world/audio";
import { disposeRadio, onNowPlaying, setRadio, skipTrack, type NowPlaying } from "@/world/radio";
import { Panels, type StoreData } from "./Panels";

const World = dynamic(() => import("@/world/World"), { ssr: false });

type Props = StoreData & { world: WorldContent };

function webgl() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Explore(props: Props) {
  const { world: content, site, status, records } = props;
  const mode = useWorld((s) => s.mode);
  const near = useWorld((s) => s.near);
  const room = useWorld((s) => s.room);
  const sound = useWorld((s) => s.sound);
  const musicOn = useWorld((s) => s.music);
  const hint = useWorld((s) => s.hint);
  const touch = useWorld((s) => s.touch);
  const gl = useWorld((s) => s.gl);
  const [mount, setMount] = useState(false);
  const enterRef = useRef<HTMLButtonElement>(null);

  // Capabilities and preferences, once.
  useEffect(() => {
    // Dev only: lets browser tests drive the character directly.
    if (process.env.NODE_ENV !== "production") (window as unknown as { __sim?: typeof sim }).__sim = sim;
    loadPrefs();
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    const apply = () => {
      sim.calm = calm.matches;
      world.set({ touch: coarse.matches });
    };
    apply();
    calm.addEventListener("change", apply);
    coarse.addEventListener("change", apply);
    if (!webgl()) world.set({ gl: "unsupported" });
    else {
      // Let the front door paint first; then start the GPU work.
      const id = requestAnimationFrame(() => setMount(true));
      return () => cancelAnimationFrame(id);
    }
    return () => {
      calm.removeEventListener("change", apply);
      coarse.removeEventListener("change", apply);
    };
  }, []);

  useEffect(
    () => () => {
      disposeAudio();
      disposeRadio();
    },
    [],
  );

  const [playing, setPlaying] = useState<NowPlaying>(null);
  useEffect(() => onNowPlaying(setPlaying), []);
  const radio = site.radio;

  /** Effects (footsteps, sleeves, the receipt): our own small synthesised cues. */
  const effects = async (on: boolean) => {
    world.set({ sound: on });
    await setSound(on, false);
  };
  /** Music: the SoundCloud radio, and nothing else. */
  const songs = async (on: boolean) => {
    world.set({ music: on });
    if (radio) await setRadio(radio, on);
  };


  // Deep link: /?at=<slug> walks you in at that record.
  const enter = () => {
    if (!send({ type: "ENTER" })) return;
    // The click on "Walk in" is the gesture that lets music start; respect an earlier mute.
    if (!world.get().muted) void effects(true);
    if (!world.get().musicMuted) void songs(true);
    const at = new URLSearchParams(location.search).get("at");
    if (at && records.some((r) => r.slug === at)) {
      const onWall = sim.items.find((i) => i.ref === at && i.panel === "case");
      const it = onWall ?? sim.items.find((i) => i.id === "crate");
      if (it) {
        sim.warp = { at: it.stand, face: it.face };
        setTimeout(() => {
          if (onWall) goUse(onWall.id, { instant: true });
          else send({ type: "OPEN", panel: "case", id: "crate", ref: at });
        }, 60);
      }
    } else sim.warp = { at: SPAWN.at, face: SPAWN.face };
  };

  // Keyboard shortcuts that live outside the canvas: Enter on the front door.
  useEffect(() => {
    if (mode.kind === "intro" && gl === "ready") enterRef.current?.focus({ preventScroll: true });
  }, [mode.kind, gl]);

  const roomInfo = ROOMS.find((r) => r.id === room);
  const showPrompt = (mode.kind === "explore" || mode.kind === "travel") && near;

  return (
    <div className="store" data-mode={mode.kind}>
      <a href="#directory" className="skip">
        Skip to the store directory
      </a>
      {mount && gl !== "unsupported" && <World content={content} />}

      {/* ------------------------------------------------------------ the front door */}
      {mode.kind === "intro" && (
        <div className="intro">
          <section className="intro-card" aria-labelledby="door-title">
            <p className="cat">Ved Chauhan · Software engineer · {site.location}</p>
            <h1 id="door-title" className="display">
              Welcome to the <em>Recordverse.</em>
            </h1>
            <p>
              A record shop where every record is software I&rsquo;ve shipped. Walk in, pull one off the wall, and read how it was built. In a hurry? Quick
              View has all of it on one page.
            </p>
            <div className="intro-actions">
              {gl !== "unsupported" && gl !== "lost" && (
                <button ref={enterRef} type="button" className="btn btn-accent" onClick={enter} disabled={gl !== "ready"} aria-busy={gl === "loading"}>
                  {gl === "ready" ? "Walk in" : "Opening the shop…"}
                </button>
              )}
              <Link href="/quick" className="btn btn-primary">
                Quick View
              </Link>
              <a href={site.resume} className="btn" target="_blank" rel="noreferrer">
                Résumé (PDF)
              </a>
            </div>
            {gl === "loading" && mount && (
              <div className="loading-bar" role="progressbar" aria-label="Loading the store" aria-valuemin={0} aria-valuemax={100}>
                <i style={{ transform: "scaleX(0.6)" }} />
              </div>
            )}
            {gl === "unsupported" && <p className="small" style={{ marginTop: 14 }}>This browser can&rsquo;t draw the 3D shop, so Quick View is the way in. Everything is there.</p>}
            <p className="intro-status">
              <span className="dot" aria-hidden />
              <span>{status}</span>
            </p>
            <details className="intro-directory" id="directory">
              <summary>Store directory</summary>
              <ol>
                {records.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/work/${r.slug}`}>{r.title}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/quick#studio">Skills</Link>
                </li>
                <li>
                  <Link href="/quick#releases">Experience</Link>
                </li>
                <li>
                  <Link href="/quick#about">About</Link>
                </li>
                <li>
                  <Link href="/quick#contact">Contact</Link>
                </li>
              </ol>
            </details>
          </section>
        </div>
      )}

      {/* ------------------------------------------------------------ HUD */}
      {mode.kind !== "intro" && (
        <>
          <header className="hud-top">
            <div className="hud-brand hud-surface" style={{ "--room": roomInfo?.tint } as React.CSSProperties} aria-live="polite">
              <span className="room-dot" aria-hidden />
              <b>{roomInfo ? roomInfo.name : "The Recordverse"}</b>
              <span>{roomInfo ? `${roomInfo.no} · ${roomInfo.what}` : "Ved Chauhan"}</span>
            </div>
            <nav className="hud-actions" aria-label="Store controls">
              <button type="button" className="hud-btn hud-surface" onClick={() => (mode.kind === "map" ? close() : send({ type: "OPEN_MAP" }))} aria-pressed={mode.kind === "map"} aria-label="Map">
                <MapTrifold aria-hidden weight="bold" />
                <span className="hud-label">Map</span> {!touch && <span className="key">M</span>}
              </button>
              <button
                type="button"
                className="hud-btn hud-surface"
                aria-pressed={sound}
                aria-label={sound ? "Sound effects on. Turn them off" : "Sound effects off. Turn them on"}
                onClick={() => {
                  const on = !sound;
                  world.set({ muted: !on });
                  savePrefs();
                  void effects(on);
                }}
              >
                {sound ? <SpeakerHigh aria-hidden weight="bold" /> : <SpeakerSlash aria-hidden weight="bold" />}
                <span className="hud-label">Sound</span>
              </button>
              {radio && (
                <button
                  type="button"
                  className="hud-btn hud-surface"
                  aria-pressed={musicOn}
                  aria-label={musicOn ? "Music on. Turn it off" : "Music off. Turn it on"}
                  onClick={() => {
                    const on = !musicOn;
                    world.set({ musicMuted: !on });
                    savePrefs();
                    void songs(on);
                  }}
                >
                  <MusicNotes aria-hidden weight="bold" />
                  <span className="hud-label">Music</span>
                </button>
              )}
              {musicOn && playing && (
                <span className="hud-btn hud-surface now-playing">
                  <a href={playing.url} target="_blank" rel="noreferrer" title={`${playing.title} by ${playing.artist}, on SoundCloud`}>
                    <span className="eq" aria-hidden>
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="hud-label np-text">
                      {playing.title}
                      {playing.artist ? ` · ${playing.artist}` : ""}
                    </span>
                  </a>
                  <button type="button" onClick={skipTrack} aria-label="Next track">
                    <SkipForward aria-hidden weight="bold" />
                  </button>
                </span>
              )}
              <button type="button" className="hud-btn hud-surface" onClick={unstuck} title="Back to the door (R)" aria-label="Back to the door">
                <ArrowCounterClockwise aria-hidden weight="bold" />
              </button>
              <Link href="/quick" className="hud-btn hud-surface" aria-label="Quick View">
                <SquaresFour aria-hidden weight="bold" />
                <span className="hud-label">Quick View</span>
              </Link>
            </nav>
          </header>

          {showPrompt && (
            <div className="prompt-wrap">
              <button
                type="button"
                className="prompt"
                onClick={() => {
                  sim.use = true;
                }}
              >
                <span className="key">{touch ? "Tap" : "E"}</span>
                <span>
                  {near.verb} <b>{near.label}</b>
                </span>
              </button>
            </div>
          )}

          {hint && mode.kind === "explore" && (
            <aside className="hint-card hud-surface" aria-label="How to get around">
              <b>Getting around</b>
              <button
                type="button"
                className="hint-close"
                aria-label="Dismiss"
                onClick={() => {
                  world.set({ hint: false });
                  savePrefs();
                }}
              >
                <X aria-hidden weight="bold" />
              </button>
              {touch ? (
                <ul>
                  <li>Tap the floor to walk there.</li>
                  <li>Tap anything you like the look of to use it.</li>
                  <li>The Map button jumps to any room.</li>
                </ul>
              ) : (
                <ul>
                  <li>
                    <span className="keys">
                      <span className="key">W</span>
                      <span className="key">A</span>
                      <span className="key">S</span>
                      <span className="key">D</span>
                    </span>
                    walk (arrows work too)
                  </li>
                  <li>
                    <span className="keys">
                      <span className="key">E</span>
                    </span>
                    use what&rsquo;s in front of you
                  </li>
                  <li>
                    <span className="keys">
                      <span className="key">⇧</span>
                      <span className="key">␣</span>
                    </span>
                    hold Shift to run · Space to jump
                  </li>
                  <li>
                    <span className="keys">
                      <span className="key">M</span>
                    </span>
                    map · or click anywhere to walk
                  </li>
                </ul>
              )}
            </aside>
          )}

          {/* The whole store as plain buttons, for keyboards and screen readers. */}
          <nav className="sr-only" aria-label="Store directory">
            <ul>
              {ROOMS.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => goUse(r.opens, { instant: true })}>
                    Go to {r.name}: {r.what}
                  </button>
                </li>
              ))}
              {content.wall.map((slug) => (
                <li key={slug}>
                  <button type="button" onClick={() => goUse(`record-${slug}`, { instant: true })}>
                    Open the record {content.titles[slug]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}

      {gl === "lost" && (
        <div className="notice" role="alert">
          <b>The shop lights went out.</b>
          <p>The graphics context was lost, which can happen when a device is low on memory. Everything is still in Quick View.</p>
          <div className="intro-actions">
            <button type="button" className="btn btn-primary" onClick={() => location.reload()}>
              Reopen the shop
            </button>
            <Link href="/quick" className="btn">
              Quick View
            </Link>
          </div>
        </div>
      )}

      <Panels {...props} />
    </div>
  );
}

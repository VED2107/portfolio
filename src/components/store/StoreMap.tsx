"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { BOUNDS, ROOMS, type Interactable, type RoomId } from "@/world/layout";
import { sim } from "@/world/runtime";
import { useWorld } from "@/world/state";
import { goRoom, goUse } from "@/world/control";

const WIDTH = BOUNDS.x1 - BOUNDS.x0;
const DEPTH = BOUNDS.z1 - BOUNDS.z0;
const xPct = (x: number) => ((x - BOUNDS.x0) / WIDTH) * 100;
const zPct = (z: number) => ((z - BOUNDS.z0) / DEPTH) * 100;
const SHORT: Record<RoomId, string> = {
  records: "Record Wall", studio: "Studio", lounge: "Lounge",
  arcade: "Arcade", releases: "Releases", counter: "Counter",
};
const INKS: Record<RoomId, string> = {
  records: "var(--tangerine)", studio: "var(--violet)", lounge: "var(--teal)",
  arcade: "var(--raspberry)", releases: "var(--butter)", counter: "var(--coral)",
};
const TILTS = [-6, 4, -3, 8, -8, 5];

function contents(room: RoomId, items: Interactable[]) {
  switch (room) {
    case "records": return items.filter((item) => item.panel === "case").map((item) => item.label).join(", ") || "Records, project sleeves";
    case "studio": return "Mixing desk, synth";
    case "lounge": return "Photo album, lamp cord";
    case "arcade": return items.filter((item) => item.room === "arcade" && !item.hidden).map((item) => item.label).join(", ") || "Arcade cabinets";
    case "releases": return "Timeline, awards";
    case "counter": return "Receipt, contact";
  }
}

export function StoreMap() {
  const stamps = useWorld((s) => s.stamps);
  const [photo, setPhoto] = useState<string | null>(null);
  const [items, setItems] = useState<Interactable[]>([]);
  const captured = useRef(false);
  const pip = useRef<HTMLDivElement>(null);
  const heading = useRef<SVGGElement>(null);
  const route = useRef<SVGPolylineElement>(null);
  const filterId = `store-map-ink-${useId().replace(/:/g, "")}`;
  const visited = ROOMS.filter((room) => stamps.includes(room.id)).length;

  useEffect(() => {
    if (!captured.current) {
      captured.current = true;
      setPhoto(sim.snapshot?.() ?? null);
      setItems([...sim.items]);
    }
    let frame = 0;
    const tick = () => {
      if (pip.current) {
        pip.current.style.left = `${xPct(sim.player.x)}%`;
        pip.current.style.top = `${zPct(sim.player.z)}%`;
      }
      if (heading.current) heading.current.style.transform = `rotate(${180 - sim.yaw * 180 / Math.PI}deg)`;
      if (route.current) {
        const points = sim.path.length
          ? [[sim.player.x, sim.player.z], ...sim.path].map(([x, z]) => `${(x - BOUNDS.x0) * 50},${(z - BOUNDS.z0) * 50}`).join(" ")
          : "";
        route.current.setAttribute("points", points);
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="store-map">
      <h2 className="display">Store map</h2>
      <p>Pick a room or a pin and Pip walks you there.</p>
      <div className="store-map-paper">
        <header className="store-map-cartouche">
          <div><b>THE RECORDVERSE</b><span>Floor plan</span></div>
          <svg className="store-map-compass" viewBox="0 0 60 70" role="img" aria-label="North, toward the back wall">
            <text x="30" y="12" textAnchor="middle" fill="currentColor">N</text>
            <g transform="translate(30 42)" stroke="currentColor" strokeWidth="1.2">
              <circle r="15" fill="none" />
              <path d="M0-23 5-5 0 0-5-5Z" fill="currentColor" />
              <path d="M0 23 5 5 0 0-5 5ZM-23 0-5-5 0 0-5 5ZM23 0 5-5 0 0 5 5Z" fill="var(--paper)" />
            </g>
          </svg>
        </header>
        <div className="store-map-plan" data-photo={photo ? "true" : "false"}>
          {/* The snapshot is a generated data URL, already at the exact floor-plan bounds. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {photo && <img className="store-map-photo" src={photo} alt="The real record shop seen from above" width={1400} height={800} />}
          {ROOMS.map((room) => (
            <button key={room.id} type="button" className="store-map-room"
              aria-label={`Go to ${room.name}, ${room.what}`}
              aria-describedby={`${filterId}-${room.id}`}
              style={{
                "--room-ink": INKS[room.id],
                left: `${xPct(room.bounds.x0)}%`, top: `${zPct(room.bounds.z0)}%`,
                width: `${(room.bounds.x1 - room.bounds.x0) / WIDTH * 100}%`,
                height: `${(room.bounds.z1 - room.bounds.z0) / DEPTH * 100}%`,
              } as CSSProperties}
              onClick={() => goRoom(room.id)}>
              <span className="store-map-wash" aria-hidden="true" />
              <span className="store-map-label"><small>{room.no} / {room.what}</small><b>{room.name}</b></span>
              <span className="store-map-card" id={`${filterId}-${room.id}`}><b>{SHORT[room.id]}</b>{contents(room.id, items)}</span>
            </button>
          ))}
          <svg className="store-map-route" viewBox="0 0 1400 800" aria-hidden="true"><polyline ref={route} fill="none" /></svg>
          {items.filter((item) => !item.hidden || (item.id === "secret" && stamps.includes("lounge"))).map((item) => (
            <button key={item.id} type="button" className={`store-map-pin${item.id === "secret" ? " store-map-secret" : ""}`}
              style={{ left: `${xPct(item.at[0])}%`, top: `${zPct(item.at[1])}%`, "--room-ink": INKS[item.room] } as CSSProperties}
              aria-label={`${item.verb} ${item.label}`} title={`${item.verb} ${item.label}`} onClick={() => goUse(item.id)}>
              {item.id === "secret" ? "?" : item.panel === "case" ? (
                <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="var(--midnight)" /><circle cx="10" cy="10" r="5.5" fill="none" stroke="var(--paper)" strokeOpacity=".4" /><circle cx="10" cy="10" r="2.5" fill="var(--tangerine)" /><circle cx="10" cy="10" r=".7" fill="var(--paper)" /></svg>
              ) : <span className="store-map-dot" />}
            </button>
          ))}
          <div ref={pip} className="store-map-pip" role="img" aria-label="Pip, you are here">
            <span className="store-map-pulse" />
            <svg viewBox="0 0 40 48" aria-hidden="true">
              <g ref={heading} className="store-map-heading"><path d="M20 1 15 10 20 7 25 10Z" fill="var(--violet)" stroke="var(--paper)" strokeWidth="1" /></g>
              <circle cx="20" cy="26" r="13" fill="var(--butter)" stroke="var(--midnight)" strokeWidth="1.6" />
              <path d="M7 23C7 5 33 5 33 23Z" fill="var(--teal)" stroke="var(--midnight)" strokeWidth="1.6" />
              <path d="M7 21Q20 17 33 21" fill="none" stroke="var(--midnight)" strokeWidth="2" />
              <path d="M6 28V22C6 6 34 6 34 22V28" fill="none" stroke="var(--violet)" strokeWidth="3" />
              <rect x="4" y="23" width="5" height="10" rx="2" fill="var(--violet)" /><rect x="31" y="23" width="5" height="10" rx="2" fill="var(--violet)" />
              <g fill="var(--midnight)"><circle cx="15" cy="27" r="1.3" /><circle cx="25" cy="27" r="1.3" /></g>
              <path d="M16 32Q20 36 24 32" fill="none" stroke="var(--midnight)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <footer className="store-map-key">
          <div className="store-map-scale"><span style={{ width: `${2 / WIDTH * 100}%` }} /><small>2 m</small></div>
          <span>● Pins to explore · Pip is here</span>
        </footer>
      </div>
      <div className="store-map-passport">
        <div className="store-map-passport-title"><b>Your shop passport</b><span aria-live="polite">{visited} of 6 stamped</span></div>
        <svg className="store-map-filter" aria-hidden="true" width="0" height="0"><defs><filter id={filterId} x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".14" numOctaves="3" seed="9" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" /></filter></defs></svg>
        <ol className="store-map-stamps">
          {ROOMS.map((room, index) => <li key={room.id} className={stamps.includes(room.id) ? "is-stamped" : ""}
            aria-label={`${SHORT[room.id]}: ${stamps.includes(room.id) ? "visited" : "not yet visited"}`}
            style={{ "--room-ink": INKS[room.id], "--stamp-tilt": `${TILTS[index]}deg` } as CSSProperties}>
            <svg viewBox="0 0 100 100" aria-hidden="true"><g filter={stamps.includes(room.id) ? `url(#${filterId})` : undefined}><circle cx="50" cy="50" r="44" /><circle className="store-map-stamp-inner" cx="50" cy="50" r="38" /></g></svg>
            <span><b>{room.no}</b><small>{SHORT[room.id]}</small></span>
          </li>)}
        </ol>
        {visited === 6 && <p className="store-map-full" role="status">Full card. You&apos;ve seen the whole shop.</p>}
      </div>
    </section>
  );
}

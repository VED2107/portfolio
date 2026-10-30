/**
 * What the visitor is doing, as an explicit state machine. Only one thing at a time: walking,
 * travelling somewhere, or looking at something. Every change goes through `send`, which ignores
 * an event the current state can't accept, so a double press can't open two panels and a click
 * during a transition can't fight it.
 *
 * Per-frame values (where the character is, how fast it's going) never live here; they sit in
 * the world's mutable `sim` object. This store changes a few times a minute, not 60 times a second.
 */
import { useSyncExternalStore } from "react";
import type { Interactable, PanelId, Vec2 } from "./layout";

export type Mode =
  | { kind: "intro" }
  | { kind: "explore" }
  | { kind: "travel"; to: Vec2; then?: string }
  | { kind: "inspect"; id: string; panel: PanelId; ref?: string }
  | { kind: "map" };

export type WorldState = {
  mode: Mode;
  /** Interactable in reach, for the prompt. */
  near: Interactable | null;
  room: string | null;
  sound: boolean;
  /** The lamp cord: false is after hours. */
  lights: boolean;
  /** Rooms visited this visit and before, for the stamp card on the map. */
  stamps: string[];
  /** The visitor turned effects off once; don't start them again. */
  muted: boolean;
  /** SoundCloud radio playing. Separate from effects: either can be on without the other. */
  music: boolean;
  /** The visitor turned the music off once; don't start it for them again. */
  musicMuted: boolean;
  /** The onboarding card; gone once dismissed or once the visitor has walked a bit. */
  hint: boolean;
  /** Pointer or touch: decides which hints and controls to show. */
  touch: boolean;
  /** "loading" until the first frame renders; "lost" if the GPU context goes away. */
  gl: "loading" | "ready" | "lost" | "unsupported";
  progress: number;
};

export type WorldEvent =
  | { type: "ENTER" }
  | { type: "INTERACT"; target: Interactable }
  | { type: "TRAVEL"; to: Vec2; then?: string }
  | { type: "ARRIVE" }
  | { type: "CANCEL" }
  | { type: "CLOSE" }
  | { type: "OPEN_MAP" }
  | { type: "OPEN"; panel: PanelId; id: string; ref?: string };

/** The transition table. Returns the next mode, or null to ignore the event. */
export function transition(mode: Mode, e: WorldEvent): Mode | null {
  switch (e.type) {
    case "ENTER":
      return mode.kind === "intro" ? { kind: "explore" } : null;
    case "INTERACT":
      if (mode.kind !== "explore" && mode.kind !== "travel") return null;
      if (!e.target.panel) return null; // actions (lamp, synth) don't change mode
      return { kind: "inspect", id: e.target.id, panel: e.target.panel, ref: e.target.ref };
    case "OPEN":
      if (mode.kind === "intro") return null;
      return { kind: "inspect", id: e.id, panel: e.panel, ref: e.ref };
    case "TRAVEL":
      if (mode.kind === "intro" || mode.kind === "inspect") return null;
      return { kind: "travel", to: e.to, then: e.then };
    case "ARRIVE":
      return mode.kind === "travel" ? { kind: "explore" } : null;
    case "CANCEL":
      return mode.kind === "travel" ? { kind: "explore" } : null;
    case "CLOSE":
      return mode.kind === "inspect" || mode.kind === "map" ? { kind: "explore" } : null;
    case "OPEN_MAP":
      return mode.kind === "explore" || mode.kind === "travel" ? { kind: "map" } : null;
  }
}

type Listener = () => void;

function createStore(initial: WorldState) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set(patch: Partial<WorldState>) {
      let changed = false;
      for (const k in patch) if (!Object.is(state[k as keyof WorldState], patch[k as keyof WorldState])) changed = true;
      if (!changed) return;
      state = { ...state, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export const world = createStore({
  mode: { kind: "intro" },
  near: null,
  room: null,
  sound: false,
  muted: false,
  music: false,
  musicMuted: false,
  lights: true,
  stamps: [],
  hint: true,
  touch: false,
  gl: "loading",
  progress: 0,
});

/** Apply an event. Returns whether it was accepted. */
export function send(e: WorldEvent) {
  const next = transition(world.get().mode, e);
  if (!next) return false;
  world.set({ mode: next });
  return true;
}

export function useWorld<T>(select: (s: WorldState) => T): T {
  return useSyncExternalStore(world.subscribe, () => select(world.get()), () => select(world.get()));
}

/* ------------------------------------------------------------------ remembered preferences */

const PREFS = "recordverse:v1";

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS);
    if (!raw) return;
    const p = JSON.parse(raw) as Partial<Pick<WorldState, "stamps" | "hint" | "lights" | "muted" | "musicMuted">>;
    world.set({
      stamps: Array.isArray(p.stamps) ? p.stamps.filter((s) => typeof s === "string") : [],
      hint: p.hint !== false,
      lights: p.lights !== false,
      muted: p.muted === true,
      musicMuted: p.musicMuted === true,
    });
  } catch {
    /* private mode or blocked storage: start fresh */
  }
}

export function savePrefs() {
  try {
    const { stamps, hint, lights, muted, musicMuted } = world.get();
    localStorage.setItem(PREFS, JSON.stringify({ stamps, hint, lights, muted, musicMuted }));
  } catch {
    /* nothing to do: preferences are a convenience */
  }
}

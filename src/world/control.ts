/**
 * Intent: the only way the UI and the 3D objects ask the world to do something. Clicking a record,
 * pressing E, choosing a room on the map and the screen-reader directory all end up here, so they
 * all behave the same way and all go through the state machine.
 */
import { ROOMS, SPAWN, type Interactable, type Vec2 } from "./layout";
import { sim } from "./runtime";
import { findPath } from "./sim";
import { savePrefs, send, world } from "./state";
import { cue, note } from "./audio";

export function item(id: string) {
  return sim.items.find((i) => i.id === id);
}

function stamp(room: string) {
  const s = world.get().stamps;
  if (!s.includes(room)) {
    world.set({ stamps: [...s, room] });
    savePrefs();
  }
}

/** Use an object the character is standing at. */
export function interact(it: Interactable) {
  stamp(it.room);
  if (it.id === "lamp") {
    sim.yank = 1;
    world.set({ lights: !world.get().lights });
    savePrefs();
    cue("click");
    return;
  }
  if (it.id === "synth") {
    const k = Math.floor(Math.random() * 12);
    sim.keys[k] = 1;
    note(k);
    return;
  }
  if (!send({ type: "INTERACT", target: it })) return;
  sim.yaw = it.face;
  sim.path = [];
  sim.player.vx = sim.player.vz = 0;
  if (it.panel === "case") {
    sim.pulled = it.id;
    cue("pull");
  } else cue("click");
  if (it.panel === "counter") cue("print");
}

/**
 * Walk to an object and use it. Under reduced motion, or when asked from the screen-reader
 * directory (`instant`), step straight there: assistive tech shouldn't wait for an animation.
 */
export function goUse(id: string, opts: { instant?: boolean } = {}) {
  const it = item(id);
  if (!it) return;
  const mode = world.get().mode.kind;
  if (mode === "inspect" || mode === "map") send({ type: "CLOSE" });
  sim.pulled = null;
  const p = sim.player;
  if (Math.hypot(p.x - it.stand[0], p.z - it.stand[1]) < 0.7) {
    interact(it);
    return;
  }
  if (sim.calm || opts.instant) {
    sim.warp = { at: it.stand, face: it.face };
    // Warp lands on the next frame; use the object right after.
    requestAnimationFrame(() => requestAnimationFrame(() => interact(it)));
    return;
  }
  const path = findPath([p.x, p.z], it.stand);
  if (!path.length) return;
  sim.path = path;
  send({ type: "TRAVEL", to: it.stand, then: it.id });
}

/** Walk to a spot on the floor. */
export function goTo(to: Vec2) {
  const mode = world.get().mode.kind;
  if (mode === "inspect") return;
  if (mode === "map") send({ type: "CLOSE" });
  const p = sim.player;
  const path = findPath([p.x, p.z], to);
  if (!path.length) return;
  sim.path = path;
  if (world.get().mode.kind === "travel") world.set({ mode: { kind: "travel", to } });
  else send({ type: "TRAVEL", to });
}

export function goRoom(id: string) {
  const r = ROOMS.find((x) => x.id === id);
  if (r) goUse(r.opens);
}

export function close() {
  if (send({ type: "CLOSE" })) cue("close");
  sim.pulled = null;
}

/** Back to the door, facing the records. For anyone who wedges themselves somewhere odd. */
export function unstuck() {
  const mode = world.get().mode.kind;
  if (mode === "inspect" || mode === "map") send({ type: "CLOSE" });
  if (mode === "travel") send({ type: "CANCEL" });
  sim.path = [];
  sim.warp = { at: SPAWN.at, face: SPAWN.face };
}

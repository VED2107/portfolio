/**
 * The world's live numbers, mutated in place by the frame loop and read by the renderer. Never
 * React state: nothing here triggers a render. The frame loop owns the character and the camera;
 * the UI only ever asks it to do something through `send` or the `intent` fields below.
 */
import type { Interactable, Vec2 } from "./layout";
import { SPAWN } from "./layout";
import type { Body, Disc } from "./sim";

export const sim = {
  player: { x: SPAWN.at[0], z: SPAWN.at[1], vx: 0, vz: 0 } as Body,
  yaw: SPAWN.face,
  /** 0..1 how hard the character is walking; drives the gait. */
  stride: 0,
  phase: 0,
  /** Seconds since last input: idle behaviours wait for stillness. */
  idle: 0,
  /** The planned walk, when travelling. */
  path: [] as Vec2[],
  /** Keys held: x, z in screen terms (right, down). */
  stick: { x: 0, y: 0 },
  /** Height off the floor and vertical speed: Space jumps. Jumps don't clear furniture. */
  y: 0,
  vy: 0,
  jump: false,
  /** Landing impact 0..1, decays: a squash, not a head shake. */
  land: 0,
  /** Shift held: run. */
  run: false,
  /** A one-shot "use" request from the keyboard or the prompt button. */
  use: false,
  /** Bumped into something this frame (for a little squash). */
  bump: 0,
  hover: null as string | null,
  items: [] as Interactable[],
  discs: [] as Disc[],
  /** 0..1 audio level for the speakers, written by the audio engine. */
  level: 0,
  /** When a record is pulled for inspection, its id, so the sleeve slides out. */
  pulled: null as string | null,
  /** Render quality the governor settled on: 2 high (bloom, full DPR), 1 mid, 0 low (no bloom, DPR 1). */
  quality: 2,
  /** Reduced motion: no camera glide, no idle loops. */
  calm: false,
  /** Fraction of the screen a panel covers, and from where, so the camera can frame around it. */
  sheet: { frac: 0, side: "right" as "right" | "bottom" },
  /** Teleport request (unstuck, reduced-motion travel, deep links). */
  warp: null as { at: Vec2; face: number } | null,
  /** Lamp cord yank, for the swing. */
  yank: 0,
  /** Renders the real store from straight above for the map. Set by the world once it's running. */
  snapshot: null as null | (() => string | null),
  /** Synth keys lit, decays. */
  keys: new Float32Array(12),
};

export function resetSim() {
  sim.player = { x: SPAWN.at[0], z: SPAWN.at[1], vx: 0, vz: 0 };
  sim.yaw = SPAWN.face;
  sim.path = [];
  sim.stick = { x: 0, y: 0 };
  sim.use = false;
  sim.pulled = null;
  sim.hover = null;
  sim.warp = null;
}

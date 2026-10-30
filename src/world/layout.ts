/**
 * The building, as data. One coordinate system for everything: metres, y up, the floor at y = 0,
 * the shop spanning x -14..14 and z -8..8. The camera looks in from the front right (+x, +z), so
 * the back wall (z = -8) and the left wall (x = -14) are the two walls you see; the front and the
 * right side are cut away like a diorama.
 *
 * Rooms, walls, furniture footprints and interactables live here so the renderer, the collision
 * solver, the path finder and the map overlay all read the same numbers.
 */

export type Vec2 = readonly [number, number];

/** Axis-aligned box on the floor plan. */
export type Box = { x0: number; z0: number; x1: number; z1: number };

export const BOUNDS: Box = { x0: -14, z0: -8, x1: 14, z1: 8 };

export const WALL_H = 4.2;
export const PLAYER_RADIUS = 0.34;

export type RoomId = "records" | "studio" | "lounge" | "arcade" | "releases" | "counter";

export type Room = {
  id: RoomId;
  no: string;
  name: string;
  /** What you'll find there, in the words of the portfolio. */
  what: string;
  bounds: Box;
  /** Where the map sends you. */
  entry: Vec2;
  /** The interactable the map opens on arrival. */
  opens: string;
  tint: string;
};

export const ROOMS: Room[] = [
  { id: "records", no: "01", name: "The Record Wall", what: "Projects", bounds: { x0: -6, z0: -8, x1: 6, z1: 2.2 }, entry: [0, -1.2], opens: "crate", tint: "#ff7a1a" },
  { id: "studio", no: "02", name: "Production Studio", what: "Skills", bounds: { x0: -14, z0: -8, x1: -6, z1: -1.5 }, entry: [-9.4, -4.2], opens: "studio-desk", tint: "#7357ff" },
  { id: "lounge", no: "03", name: "Listening Lounge", what: "About", bounds: { x0: 6, z0: 0.4, x1: 14, z1: 8 }, entry: [9.2, 2.2], opens: "lounge", tint: "#13a89e" },
  { id: "arcade", no: "04", name: "Experimental Arcade", what: "Playground", bounds: { x0: -14, z0: -1.5, x1: -6, z1: 8 }, entry: [-10, 3.4], opens: "arcade-0", tint: "#e0367a" },
  { id: "releases", no: "05", name: "Hall of Releases", what: "Experience", bounds: { x0: 6, z0: -8, x1: 14, z1: 0.4 }, entry: [10, -4.4], opens: "releases", tint: "#f2b52c" },
  { id: "counter", no: "06", name: "Checkout Counter", what: "Contact", bounds: { x0: -6, z0: 2.2, x1: 6, z1: 8 }, entry: [3.7, 4.6], opens: "counter", tint: "#ff5a5f" },
];

export function roomAt(x: number, z: number): Room | undefined {
  return ROOMS.find((r) => x >= r.bounds.x0 && x < r.bounds.x1 && z >= r.bounds.z0 && z < r.bounds.z1);
}

/* ------------------------------------------------------------------ walls */

export type Wall = Box & { h: number; tone: "plaster" | "panel" | "glass" | "low" };

const T = 0.26; // partition thickness

export const WALLS: Wall[] = [
  // the studio: a partition with a doorway, and a low divider toward the arcade
  { x0: -6 - T / 2, z0: -8, x1: -6 + T / 2, z1: -5.3, h: 2.5, tone: "panel" },
  { x0: -6 - T / 2, z0: -3.3, x1: -6 + T / 2, z1: -1.5, h: 2.5, tone: "panel" },
  { x0: -14, z0: -1.5 - T / 2, x1: -10, z1: -1.5 + T / 2, h: 1.1, tone: "low" },
  { x0: -8, z0: -1.5 - T / 2, x1: -6 + T / 2, z1: -1.5 + T / 2, h: 1.1, tone: "low" },
  // the hall of releases: a gallery partition that carries the awards
  { x0: 6 - T / 2, z0: -8, x1: 6 + T / 2, z1: -4.6, h: 2.6, tone: "plaster" },
];

/* ------------------------------------------------------------------ furniture footprints */

export type Solid = Box & { id: string };

export const SOLIDS: Solid[] = [
  // records
  { id: "record-wall", x0: -5.4, z0: -8, x1: 5.4, z1: -7.25 },
  { id: "crate", x0: -1.7, z0: -4.15, x1: 1.7, z1: -2.85 },
  { id: "kiosk", x0: -2.35, z0: 5.05, x1: -1.45, z1: 5.95 },
  // studio
  { id: "desk", x0: -12.9, z0: -8, x1: -8.1, z1: -6.7 },
  { id: "rack", x0: -14, z0: -6.4, x1: -13.1, z1: -3.2 },
  { id: "speaker-l", x0: -13.75, z0: -2.95, x1: -13.05, z1: -2.25 },
  { id: "studio-couch", x0: -9.6, z0: -3.1, x1: -7.4, z1: -2.3 },
  // arcade: six cabinets along the left wall
  ...[0.2, 1.55, 2.9, 4.25, 5.6, 6.95].map((c, k) => ({ id: `cabinet-${k}`, x0: -14, z0: c - 0.55, x1: -12.85, z1: c + 0.55 })),
  // releases
  { id: "release-wall", x0: 6.3, z0: -8, x1: 14, z1: -7.35 },
  { id: "plinth", x0: 11.6, z0: -3.4, x1: 12.8, z1: -2.2 },
  // counter
  { id: "counter", x0: 2.1, z0: 2.55, x1: 5.3, z1: 3.45 },
  { id: "counter-stool", x0: 5.75, z0: 2.7, x1: 6.25, z1: 3.2 },
  // lounge
  { id: "sofa", x0: 12.7, z0: 1.9, x1: 13.85, z1: 5.7 },
  { id: "armchair", x0: 7.35, z0: 1.4, x1: 8.55, z1: 2.6 },
  { id: "coffee-table", x0: 9.55, z0: 3.35, x1: 11.05, z1: 4.55 },
  { id: "console", x0: 7.0, z0: 6.85, x1: 9.1, z1: 7.75 },
  { id: "lamp", x0: 12.65, z0: 0.95, x1: 13.15, z1: 1.45 },
  { id: "plant", x0: 13.2, z0: 6.6, x1: 13.9, z1: 7.3 },
];

/** Everything the player can't walk through. Walls first, then furniture. */
export const COLLIDERS: Box[] = [...WALLS, ...SOLIDS];

/* ------------------------------------------------------------------ interactables */

export type PanelId = "case" | "crate" | "studio" | "lounge" | "arcade" | "releases" | "honors" | "counter" | "map" | "secret";

export type Interactable = {
  id: string;
  room: RoomId;
  /** Shown after the key: "E  Pull NOVA". */
  verb: string;
  label: string;
  /** Centre of the object, floor plan. */
  at: Vec2;
  /** Where the character stands to use it, and which way it faces (radians, 0 = +z). */
  stand: Vec2;
  face: number;
  /** Reach, measured from `at`. */
  reach: number;
  /** What the camera frames while it's open, world space. */
  focus?: readonly [number, number, number];
  panel?: PanelId;
  /** For a record: the case study it opens. For an arcade cabinet: the archive index. */
  ref?: string;
  /** Not listed in the map or the screen-reader directory: it's found, not offered. */
  hidden?: boolean;
};

const BACK = -Math.PI; // facing the back wall
const LEFT = -Math.PI / 2; // facing the left wall

/** Six records face out on the wall; their slugs come from the content, in order. */
export const WALL_SLOTS = [-4.25, -2.55, -0.85, 0.85, 2.55, 4.25];
export const WALL_SLEEVE_Y = 1.75;

export function recordInteractables(slugs: string[], titles: Record<string, string>): Interactable[] {
  return slugs.slice(0, WALL_SLOTS.length).map((slug, k) => ({
    id: `record-${slug}`,
    room: "records",
    verb: "Pull",
    label: titles[slug] ?? slug,
    at: [WALL_SLOTS[k], -7.4],
    stand: [WALL_SLOTS[k], -6.35],
    face: BACK,
    reach: 1.25,
    focus: [WALL_SLOTS[k], WALL_SLEEVE_Y - 0.25, -7.3],
    panel: "case",
    ref: slug,
  }));
}

export const ARCADE_Z = [0.2, 1.55, 2.9, 4.25, 5.6, 6.95];

export function arcadeInteractables(titles: string[]): Interactable[] {
  return titles.slice(0, ARCADE_Z.length).map((title, k) => ({
    id: `arcade-${k}`,
    room: "arcade",
    verb: "Play",
    label: title,
    at: [-13.4, ARCADE_Z[k]],
    stand: [-12.2, ARCADE_Z[k]],
    face: LEFT,
    reach: 1.05,
    focus: [-13.4, 1.25, ARCADE_Z[k]],
    panel: "arcade",
    ref: String(k),
  }));
}

export const FIXED_INTERACTABLES: Interactable[] = [
  { id: "crate", room: "records", verb: "Flip through", label: "the crate", at: [0, -3.5], stand: [0, -2.15], face: BACK, reach: 1.7, focus: [0, 0.9, -3.5], panel: "crate" },
  { id: "kiosk", room: "counter", verb: "Read", label: "the store map", at: [-1.9, 5.5], stand: [-1.9, 6.45], face: BACK, reach: 1.2, focus: [-1.9, 1.2, 5.5], panel: "map" },
  { id: "studio-desk", room: "studio", verb: "Sit at", label: "the mixing desk", at: [-10.5, -7.3], stand: [-10.5, -6.05], face: BACK, reach: 1.6, focus: [-10.5, 1.3, -7.3], panel: "studio" },
  { id: "synth", room: "studio", verb: "Play", label: "the synth", at: [-8.7, -7.15], stand: [-8.7, -6.1], face: BACK, reach: 0.95 },
  { id: "honors", room: "releases", verb: "Read", label: "the awards", at: [6.35, -6.3], stand: [7.35, -6.3], face: LEFT, reach: 1.4, focus: [6.2, 1.6, -6.3], panel: "honors" },
  { id: "releases", room: "releases", verb: "Walk", label: "the timeline", at: [10.2, -7.5], stand: [10.2, -6.3], face: BACK, reach: 2.6, focus: [10.2, 1.6, -7.5], panel: "releases" },
  { id: "counter", room: "counter", verb: "Talk at", label: "the counter", at: [3.7, 3.0], stand: [3.7, 4.15], face: BACK, reach: 1.45, focus: [3.7, 1.1, 3.0], panel: "counter" },
  { id: "lounge", room: "lounge", verb: "Open", label: "the photo album", at: [10.3, 3.95], stand: [10.3, 5.2], face: BACK, reach: 1.5, focus: [10.3, 0.8, 3.95], panel: "lounge" },
  { id: "lamp", room: "lounge", verb: "Pull", label: "the lamp cord", at: [12.9, 1.2], stand: [12.0, 1.2], face: Math.PI / 2, reach: 1.0 },
  { id: "secret", room: "lounge", verb: "Drop the needle on", label: "the gold record", at: [8.05, 7.3], stand: [8.05, 6.2], face: 0, reach: 1.05, focus: [8.05, 0.9, 7.3], panel: "secret", hidden: true },
];

export const SPAWN: { at: Vec2; face: number } = { at: [0.6, 6.4], face: BACK };

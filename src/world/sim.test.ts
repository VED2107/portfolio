import { describe, expect, it } from "vitest";
import { COLLIDERS, FIXED_INTERACTABLES, ROOMS, SPAWN, arcadeInteractables, recordInteractables } from "./layout";
import { angleDelta, blocked, collide, findPath, nearest, step, type Body } from "./sim";
import { transition } from "./state";

const body = (x: number, z: number): Body => ({ x, z, vx: 0, vz: 0 });

describe("collision", () => {
  it("never lets the character end a step inside furniture", () => {
    const b = body(0, -1.5);
    // Walk hard into the crate for two seconds.
    for (let i = 0; i < 120; i++) step(b, 0, -1, 1 / 60);
    expect(blocked(b.x, b.z, 0.33)).toBe(false);
    expect(b.z).toBeGreaterThan(-2.85);
  });

  it("slides along a wall instead of stopping dead", () => {
    const b = body(0, -6.6);
    for (let i = 0; i < 30; i++) step(b, 0.7, -0.7, 1 / 60);
    expect(b.x).toBeGreaterThan(0.5);
  });

  it("keeps the character inside the shop", () => {
    const b = body(13.5, 7.5);
    for (let i = 0; i < 120; i++) step(b, 1, 1, 1 / 60);
    expect(b.x).toBeLessThanOrEqual(14);
    expect(b.z).toBeLessThanOrEqual(8);
  });

  it("pushes a body that starts inside a box back out", () => {
    const b = body(0, -3.5);
    collide(b);
    expect(blocked(b.x, b.z, 0.33)).toBe(false);
  });
});

describe("movement", () => {
  it("is deterministic", () => {
    const run = () => {
      const b = body(...SPAWN.at);
      for (let i = 0; i < 200; i++) step(b, Math.sin(i / 20), -1, 1 / 60);
      return [b.x, b.z];
    };
    expect(run()).toEqual(run());
  });

  it("eases to a stop rather than snapping", () => {
    const b = body(0, 5);
    for (let i = 0; i < 60; i++) step(b, 1, 0, 1 / 60);
    step(b, 0, 0, 1 / 60);
    expect(b.vx).toBeGreaterThan(0.5);
    for (let i = 0; i < 120; i++) step(b, 0, 0, 1 / 60);
    expect(b.vx).toBe(0);
  });

  it("takes the short way round when turning", () => {
    expect(angleDelta(3, -3)).toBeCloseTo(2 * Math.PI - 6);
    expect(Math.abs(angleDelta(0.1, -0.1))).toBeCloseTo(0.2);
  });
});

describe("path finding", () => {
  const stands = [
    ...FIXED_INTERACTABLES,
    ...recordInteractables(["a", "b", "c", "d", "e", "f"], {}),
    ...arcadeInteractables(["1", "2", "3", "4", "5", "6"]),
  ];

  it("every interactable's standing spot is walkable", () => {
    for (const it of stands) expect(blocked(it.stand[0], it.stand[1]), it.id).toBe(false);
  });

  it("every room entry is reachable from the door", () => {
    for (const r of ROOMS) {
      const path = findPath(SPAWN.at, r.entry);
      expect(path.length, r.id).toBeGreaterThan(0);
      const end = path[path.length - 1];
      expect(Math.hypot(end[0] - r.entry[0], end[1] - r.entry[1]), r.id).toBeLessThan(0.3);
    }
  });

  it("every interactable is reachable from the door", () => {
    for (const it of stands) {
      const path = findPath(SPAWN.at, it.stand);
      expect(path.length, it.id).toBeGreaterThan(0);
    }
  });

  it("walks round the studio partition, not through it", () => {
    const path = findPath([-3, -6], [-10, -6]);
    // Every leg must stay clear of the walls.
    let prev: readonly [number, number] = [-3, -6];
    for (const p of path) {
      for (let t = 0; t <= 1; t += 0.05) expect(blocked(prev[0] + (p[0] - prev[0]) * t, prev[1] + (p[1] - prev[1]) * t, 0.3)).toBe(false);
      prev = p;
    }
  });
});

describe("reach", () => {
  it("picks the record you're standing at, not its neighbour", () => {
    const recs = recordInteractables(["a", "b", "c", "d", "e", "f"], {});
    const got = nearest(recs, recs[2].stand[0], recs[2].stand[1], Math.PI);
    expect(got?.id).toBe("record-c");
  });

  it("offers nothing in the middle of the floor", () => {
    expect(nearest(FIXED_INTERACTABLES, 0, 1, 0)).toBeNull();
  });

  it("no collider overlaps a standing spot", () => {
    for (const it of FIXED_INTERACTABLES) for (const c of COLLIDERS) expect(it.stand[0] > c.x0 && it.stand[0] < c.x1 && it.stand[1] > c.z0 && it.stand[1] < c.z1, it.id).toBe(false);
  });
});

describe("state machine", () => {
  const rec = recordInteractables(["nova"], {})[0];

  it("only one panel at a time", () => {
    const open = transition({ kind: "explore" }, { type: "INTERACT", target: rec });
    expect(open).toMatchObject({ kind: "inspect", panel: "case", ref: "nova" });
    expect(transition(open!, { type: "INTERACT", target: rec })).toBeNull();
    expect(transition(open!, { type: "TRAVEL", to: [0, 0] })).toBeNull();
  });

  it("closing returns to exploring", () => {
    expect(transition({ kind: "inspect", id: "x", panel: "case" }, { type: "CLOSE" })).toEqual({ kind: "explore" });
    expect(transition({ kind: "explore" }, { type: "CLOSE" })).toBeNull();
  });

  it("nothing happens before the visitor enters", () => {
    expect(transition({ kind: "intro" }, { type: "INTERACT", target: rec })).toBeNull();
    expect(transition({ kind: "intro" }, { type: "OPEN_MAP" })).toBeNull();
    expect(transition({ kind: "intro" }, { type: "ENTER" })).toEqual({ kind: "explore" });
  });

  it("walking input cancels travel", () => {
    expect(transition({ kind: "travel", to: [1, 1] }, { type: "CANCEL" })).toEqual({ kind: "explore" });
  });
});

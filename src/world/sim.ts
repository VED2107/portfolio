/**
 * The rules of the floor, with no rendering in them: how the character moves, what it bumps into,
 * how it finds a way across the shop, and what it can reach. Pure functions over plain numbers so
 * the same input always gives the same step, and so they can be tested without a GPU.
 */
import { BOUNDS, COLLIDERS, PLAYER_RADIUS, type Box, type Interactable, type Vec2 } from "./layout";

export type Body = { x: number; z: number; vx: number; vz: number };

/* ------------------------------------------------------------------ collision */

/** Push a circle out of one box. Returns true if it touched. */
function pushOut(b: { x: number; z: number }, r: number, box: Box) {
  const cx = Math.max(box.x0, Math.min(b.x, box.x1));
  const cz = Math.max(box.z0, Math.min(b.z, box.z1));
  const dx = b.x - cx;
  const dz = b.z - cz;
  const d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return null;
  if (d2 > 1e-9) {
    const d = Math.sqrt(d2);
    const k = (r - d) / d;
    b.x += dx * k;
    b.z += dz * k;
    return { nx: dx / d, nz: dz / d };
  }
  // Centre inside the box: leave by the nearest face.
  const exits = [
    { d: b.x - box.x0, nx: -1, nz: 0 },
    { d: box.x1 - b.x, nx: 1, nz: 0 },
    { d: b.z - box.z0, nx: 0, nz: -1 },
    { d: box.z1 - b.z, nx: 0, nz: 1 },
  ].sort((a, c) => a.d - c.d)[0];
  b.x += exits.nx * (exits.d + r);
  b.z += exits.nz * (exits.d + r);
  return { nx: exits.nx, nz: exits.nz };
}

/**
 * Resolve a body against every collider and the shop's edges. Velocity loses only its component
 * into the surface, so the character slides along a shelf instead of sticking to it.
 */
export function collide(b: Body, r = PLAYER_RADIUS, boxes: readonly Box[] = COLLIDERS) {
  let hit = false;
  for (let pass = 0; pass < 3; pass++) {
    let any = false;
    for (const box of boxes) {
      const n = pushOut(b, r, box);
      if (!n) continue;
      any = hit = true;
      const into = b.vx * n.nx + b.vz * n.nz;
      if (into < 0) {
        b.vx -= into * n.nx;
        b.vz -= into * n.nz;
      }
    }
    if (!any) break;
  }
  const minX = BOUNDS.x0 + r, maxX = BOUNDS.x1 - r, minZ = BOUNDS.z0 + r, maxZ = BOUNDS.z1 - r;
  if (b.x < minX) { b.x = minX; b.vx = Math.max(0, b.vx); hit = true; }
  if (b.x > maxX) { b.x = maxX; b.vx = Math.min(0, b.vx); hit = true; }
  if (b.z < minZ) { b.z = minZ; b.vz = Math.max(0, b.vz); hit = true; }
  if (b.z > maxZ) { b.z = maxZ; b.vz = Math.min(0, b.vz); hit = true; }
  return hit;
}

export function blocked(x: number, z: number, r = PLAYER_RADIUS, boxes: readonly Box[] = COLLIDERS) {
  if (x < BOUNDS.x0 + r || x > BOUNDS.x1 - r || z < BOUNDS.z0 + r || z > BOUNDS.z1 - r) return true;
  for (const b of boxes) {
    const cx = Math.max(b.x0, Math.min(x, b.x1));
    const cz = Math.max(b.z0, Math.min(z, b.z1));
    if ((x - cx) ** 2 + (z - cz) ** 2 < r * r) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ movement */

export const MOVE = {
  /** m/s at a full stick. */
  speed: 3.8,
  /** How fast velocity reaches the stick: higher is snappier. Exponential, so frame-rate independent. */
  accel: 11,
  /** How fast it bleeds off with no input. A little slower than accel: you glide to a stop. */
  decel: 9,
};

/**
 * One fixed step of the character. `ix, iz` is the wanted direction in world space, length 0..1.
 * Velocity eases toward it exponentially (no jerk at start or stop), then the body moves and
 * collides.
 */
export function step(b: Body, ix: number, iz: number, dt: number, speed = MOVE.speed) {
  const len = Math.hypot(ix, iz);
  if (len > 1) {
    ix /= len;
    iz /= len;
  }
  const tx = ix * speed;
  const tz = iz * speed;
  const k = 1 - Math.exp(-(len > 0.01 ? MOVE.accel : MOVE.decel) * dt);
  b.vx += (tx - b.vx) * k;
  b.vz += (tz - b.vz) * k;
  if (Math.abs(b.vx) < 1e-4) b.vx = 0;
  if (Math.abs(b.vz) < 1e-4) b.vz = 0;
  b.x += b.vx * dt;
  b.z += b.vz * dt;
  return collide(b);
}

/** Shortest signed angle from a to b. */
export function angleDelta(a: number, b: number) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/* ------------------------------------------------------------------ path finding */

export const CELL = 0.25;
const COLS = Math.round((BOUNDS.x1 - BOUNDS.x0) / CELL);
const ROWS = Math.round((BOUNDS.z1 - BOUNDS.z0) / CELL);

let grid: Uint8Array | null = null;

/** Walkable cells, with a little extra clearance so paths don't scrape the furniture. */
export function navGrid() {
  if (grid) return grid;
  grid = new Uint8Array(COLS * ROWS);
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const [x, z] = cellCentre(c, r);
      grid[r * COLS + c] = blocked(x, z, PLAYER_RADIUS + 0.08) ? 0 : 1;
    }
  return grid;
}

function cellCentre(c: number, r: number): [number, number] {
  return [BOUNDS.x0 + (c + 0.5) * CELL, BOUNDS.z0 + (r + 0.5) * CELL];
}

function cellOf(x: number, z: number): [number, number] {
  return [
    Math.max(0, Math.min(COLS - 1, Math.floor((x - BOUNDS.x0) / CELL))),
    Math.max(0, Math.min(ROWS - 1, Math.floor((z - BOUNDS.z0) / CELL))),
  ];
}

/** The nearest walkable cell to a point, searching outward ring by ring. */
function nearestOpen(c: number, r: number): [number, number] | null {
  const g = navGrid();
  for (let ring = 0; ring < 24; ring++)
    for (let dr = -ring; dr <= ring; dr++)
      for (let dc = -ring; dc <= ring; dc++) {
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== ring) continue;
        const cc = c + dc, rr = r + dr;
        if (cc >= 0 && rr >= 0 && cc < COLS && rr < ROWS && g[rr * COLS + cc]) return [cc, rr];
      }
  return null;
}

/** Clear straight line between two points, sampled at a quarter cell. */
function lineClear(a: Vec2, b: Vec2) {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.ceil(d / (CELL * 0.5));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    if (blocked(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, PLAYER_RADIUS + 0.04)) return false;
  }
  return true;
}

/**
 * A* over the floor grid with 8-way moves (no corner cutting), then string-pulled so the walk is
 * a few straight legs instead of a staircase. Returns waypoints after `from`, ending at `to` (or
 * the nearest reachable point to it). Empty if nothing is reachable.
 */
export function findPath(from: Vec2, to: Vec2): Vec2[] {
  const g = navGrid();
  const s0 = cellOf(from[0], from[1]);
  const start = g[s0[1] * COLS + s0[0]] ? s0 : nearestOpen(s0[0], s0[1]);
  const t0 = cellOf(to[0], to[1]);
  const goalOpen = !!g[t0[1] * COLS + t0[0]];
  const goal = goalOpen ? t0 : nearestOpen(t0[0], t0[1]);
  if (!start || !goal) return [];

  const N = COLS * ROWS;
  const gScore = new Float32Array(N).fill(Infinity);
  const came = new Int32Array(N).fill(-1);
  const closed = new Uint8Array(N);
  const si = start[1] * COLS + start[0];
  const gi = goal[1] * COLS + goal[0];
  gScore[si] = 0;
  // Binary heap of [f, index].
  const heap: [number, number][] = [[0, si]];
  const push = (f: number, i: number) => {
    heap.push([f, i]);
    let k = heap.length - 1;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (heap[p][0] <= heap[k][0]) break;
      [heap[p], heap[k]] = [heap[k], heap[p]];
      k = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let k = 0;
      for (;;) {
        const l = k * 2 + 1, r = l + 1;
        let m = k;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === k) break;
        [heap[m], heap[k]] = [heap[k], heap[m]];
        k = m;
      }
    }
    return top;
  };
  const h = (i: number) => {
    const dx = Math.abs((i % COLS) - goal[0]);
    const dz = Math.abs(Math.floor(i / COLS) - goal[1]);
    return Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz);
  };

  let found = false;
  while (heap.length) {
    const [, i] = pop();
    if (closed[i]) continue;
    if (i === gi) {
      found = true;
      break;
    }
    closed[i] = 1;
    const c = i % COLS, r = Math.floor(i / COLS);
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const cc = c + dc, rr = r + dr;
        if (cc < 0 || rr < 0 || cc >= COLS || rr >= ROWS) continue;
        const j = rr * COLS + cc;
        if (!g[j] || closed[j]) continue;
        if (dr && dc && (!g[r * COLS + cc] || !g[rr * COLS + c])) continue; // no corner cutting
        const ng = gScore[i] + (dr && dc ? Math.SQRT2 : 1);
        if (ng < gScore[j]) {
          gScore[j] = ng;
          came[j] = i;
          push(ng + h(j), j);
        }
      }
  }
  if (!found) return [];

  const cells: Vec2[] = [];
  for (let i = gi; i !== -1 && i !== si; i = came[i]) cells.push(cellCentre(i % COLS, Math.floor(i / COLS)));
  cells.reverse();
  // End exactly where asked when that spot is walkable.
  if (goalOpen && !blocked(to[0], to[1])) cells.push(to);

  // String pulling: from each anchor, jump to the farthest waypoint in clear sight.
  const out: Vec2[] = [];
  let anchor: Vec2 = from;
  let k = 0;
  while (k < cells.length) {
    let far = k;
    for (let j = cells.length - 1; j > k; j--)
      if (lineClear(anchor, cells[j])) {
        far = j;
        break;
      }
    out.push(cells[far]);
    anchor = cells[far];
    k = far + 1;
  }
  return out;
}

/* ------------------------------------------------------------------ reach */

/**
 * The interactable the character can use right now: within reach, and in front of it rather than
 * behind. Distance wins; facing breaks near-ties so turning toward a record selects it.
 */
export function nearest(items: readonly Interactable[], x: number, z: number, yaw: number) {
  let best: Interactable | null = null;
  let score = Infinity;
  const fx = Math.sin(yaw), fz = Math.cos(yaw);
  for (const it of items) {
    const dx = it.at[0] - x, dz = it.at[1] - z;
    const d = Math.hypot(dx, dz);
    if (d > it.reach + PLAYER_RADIUS) continue;
    const facing = d > 1e-3 ? (dx * fx + dz * fz) / d : 1;
    const s = d - facing * 0.45;
    if (s < score) {
      score = s;
      best = it;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ loose records on the arcade floor */

export type Disc = Body & { r: number; spin: number; angle: number };

/** Records you can kick around. Player shoves them; they bounce off walls and each other. */
export function stepDiscs(discs: Disc[], player: Body, dt: number) {
  for (const d of discs) {
    // The character pushes with its own velocity plus a little extra, so a walk-in nudges and a run-in kicks.
    const dx = d.x - player.x, dz = d.z - player.z;
    const dist = Math.hypot(dx, dz);
    const min = d.r + PLAYER_RADIUS;
    if (dist < min && dist > 1e-4) {
      const nx = dx / dist, nz = dz / dist;
      d.x = player.x + nx * min;
      d.z = player.z + nz * min;
      const pv = Math.max(0, player.vx * nx + player.vz * nz);
      const rel = (d.vx * nx + d.vz * nz);
      if (rel < pv * 1.6) {
        d.vx += (pv * 1.6 - rel) * nx;
        d.vz += (pv * 1.6 - rel) * nz;
        d.spin += (player.vx * nz - player.vz * nx) * 1.5;
      }
    }
  }
  for (let i = 0; i < discs.length; i++)
    for (let j = i + 1; j < discs.length; j++) {
      const a = discs[i], b = discs[j];
      const dx = b.x - a.x, dz = b.z - a.z;
      const dist = Math.hypot(dx, dz);
      const min = a.r + b.r;
      if (dist >= min || dist < 1e-4) continue;
      const nx = dx / dist, nz = dz / dist;
      const push = (min - dist) / 2;
      a.x -= nx * push; a.z -= nz * push;
      b.x += nx * push; b.z += nz * push;
      const rel = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
      if (rel < 0) {
        const j2 = -rel * 0.9;
        a.vx -= j2 * nx; a.vz -= j2 * nz;
        b.vx += j2 * nx; b.vz += j2 * nz;
      }
    }
  const friction = Math.exp(-2.2 * dt);
  for (const d of discs) {
    d.x += d.vx * dt;
    d.z += d.vz * dt;
    const before = { vx: d.vx, vz: d.vz };
    collide(d, d.r);
    // Bounce instead of slide: restore the reflected component, a little softer.
    if (before.vx !== d.vx) d.vx = -before.vx * 0.6;
    if (before.vz !== d.vz) d.vz = -before.vz * 0.6;
    d.vx *= friction;
    d.vz *= friction;
    d.spin *= friction;
    d.angle += d.spin * dt;
  }
}

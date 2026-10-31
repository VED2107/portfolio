"use client";
/**
 * The frame loop's owner. Reads input, steps the character at a fixed rate, follows a planned
 * path when travelling, works out what's in reach, and moves the camera. Character and camera
 * motion belong here and nowhere else: UI springs never touch a world transform, and this never
 * touches the DOM beyond a couple of store updates when something actually changes.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { BOUNDS, roomAt } from "../layout";
import { sim } from "../runtime";
import { angleDelta, collide, nearest, step, stepDiscs, MOVE } from "../sim";
import { send, world } from "../state";
import { close, goTo, interact, item, unstuck } from "../control";
import { cue } from "../audio";

export const CAM = { yaw: Math.PI / 4, pitch: THREE.MathUtils.degToRad(40), fov: 30 };
const FWD = { x: -Math.sin(CAM.yaw), z: -Math.cos(CAM.yaw) };
const RIGHT = { x: Math.cos(CAM.yaw), z: -Math.sin(CAM.yaw) };
const FIXED = 1 / 120;
/** Scratch vectors for the camera, reused every frame so the loop never allocates. */
const V = { want: new THREE.Vector3(), dir: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3() };

function typing(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

/** Keyboard: held keys become a stick; Shift runs; Space jumps; E / Enter use; M map; Esc back; R back to the door. */
function useKeys() {
  useEffect(() => {
    const held = new Set<string>();
    const update = () => {
      sim.stick.x = (held.has("d") || held.has("arrowright") ? 1 : 0) - (held.has("a") || held.has("arrowleft") ? 1 : 0);
      sim.stick.y = (held.has("s") || held.has("arrowdown") ? 1 : 0) - (held.has("w") || held.has("arrowup") ? 1 : 0);
    };
    const MOVE_KEYS = ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
      const k = e.key.toLowerCase();
      const mode = world.get().mode.kind;
      if (mode === "intro") return;
      // While a panel or the map is open, the keyboard belongs to it (Escape is handled there too).
      if (mode === "inspect" || mode === "map") return;
      const onControl = (e.target as HTMLElement | null)?.closest?.("button, a");
      if (MOVE_KEYS.includes(k)) {
        e.preventDefault();
        held.add(k);
        update();
        if (world.get().hint) world.set({ hint: false });
      } else if (k === "shift") {
        sim.run = true;
      } else if (k === " " && !onControl) {
        e.preventDefault();
        if (!e.repeat) sim.jump = true;
      } else if ((k === "e" || (k === "enter" && !onControl)) && !e.repeat) {
        e.preventDefault();
        sim.use = true;
      } else if (k === "m" && !e.repeat) {
        send({ type: "OPEN_MAP" });
      } else if (k === "r" && !e.repeat) {
        unstuck();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Shift") sim.run = false;
      held.delete(e.key.toLowerCase());
      update();
    };
    // Releasing focus (alt-tab, a dialog) must not leave a key stuck down.
    const clear = () => {
      sim.run = false;
      held.clear();
      update();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
    };
  }, []);
}

export function Director() {
  useKeys();
  const { camera, size } = useThree();
  const acc = useRef(0);
  const tgt = useRef(new THREE.Vector3(0, 0.6, 0.5));
  const dist = useRef(46);
  const shift = useRef(new THREE.Vector2());
  const stall = useRef(0);
  const lastStep = useRef(0);
  const look = useRef(new THREE.Vector3());
  const prev = useRef({ x: sim.player.x, z: sim.player.z });

  // Priority -1: step the world before anything draws from it, so the character and the camera
  // read the same frame's position.
  useFrame((_, rawDt) => {
    // A long frame (tab switch, a hitch) is clamped so nothing teleports through a wall.
    const dt = Math.min(rawDt, 1 / 20);
    const state = world.get();
    const mode = state.mode;
    const p = sim.player;

    if (sim.warp) {
      p.x = sim.warp.at[0];
      p.z = sim.warp.at[1];
      p.vx = p.vz = 0;
      sim.yaw = sim.warp.face;
      sim.warp = null;
      collide(p);
      prev.current.x = p.x;
      prev.current.z = p.z;
      tgt.current.set(p.x, 0.9, p.z);
    }

    /* ---------------------------------------------------------- input to intent */
    let ix = 0, iz = 0, speed = MOVE.speed * (sim.run ? 1.7 : 1);
    const stick = sim.stick.x !== 0 || sim.stick.y !== 0;
    if (mode.kind === "explore" || mode.kind === "travel") {
      if (stick) {
        if (mode.kind === "travel") {
          send({ type: "CANCEL" });
          sim.path = [];
        }
        ix = RIGHT.x * sim.stick.x - FWD.x * sim.stick.y;
        iz = RIGHT.z * sim.stick.x - FWD.z * sim.stick.y;
      } else if (mode.kind === "travel" && sim.path.length) {
        const [wx, wz] = sim.path[0];
        const dx = wx - p.x, dz = wz - p.z;
        const d = Math.hypot(dx, dz);
        const last = sim.path.length === 1;
        if (d < (last ? 0.06 : 0.22)) {
          sim.path.shift();
        } else {
          ix = dx / d;
          iz = dz / d;
          // Arrive: slow over the last metre instead of stopping dead.
          if (last) speed *= Math.min(1, 0.25 + d / 1.1);
        }
        // Don't walk into a wall forever.
        const moving = Math.hypot(p.vx, p.vz);
        stall.current = moving < 0.15 ? stall.current + dt : 0;
        if (stall.current > 1.2) {
          stall.current = 0;
          sim.path = [];
          send({ type: "CANCEL" });
        }
      } else if (mode.kind === "travel") {
        // Arrived.
        const then = mode.then ? item(mode.then) : undefined;
        send({ type: "ARRIVE" });
        if (then) {
          sim.yaw = then.face;
          interact(then);
        }
      }
    }

    /* ---------------------------------------------------------- fixed-step body */
    acc.current += dt;
    let hit = false;
    while (acc.current >= FIXED) {
      prev.current.x = p.x;
      prev.current.z = p.z;
      hit = step(p, ix, iz, FIXED, speed) || hit;
      if (sim.discs.length) stepDiscs(sim.discs, p, FIXED);
      acc.current -= FIXED;
    }
    // Draw between the last two steps by how far into the next one this frame is.
    const alpha = acc.current / FIXED;
    sim.view.x = prev.current.x + (p.x - prev.current.x) * alpha;
    sim.view.z = prev.current.z + (p.z - prev.current.z) * alpha;
    // Jump: a quick, slightly floaty arc. Gravity is stronger on the way down so it lands crisp.
    const canMove = mode.kind === "explore" || mode.kind === "travel";
    if (sim.jump) {
      if (canMove && sim.y <= 0.001) {
        sim.vy = 6.4;
        cue("step");
      }
      sim.jump = false;
    }
    if (sim.y > 0 || sim.vy > 0) {
      sim.vy -= (sim.vy > 0 ? 20 : 30) * dt;
      sim.y += sim.vy * dt;
      if (sim.y <= 0) {
        if (sim.vy < -3) {
          sim.land = Math.min(1, -sim.vy / 9);
          cue("step");
        }
        sim.y = 0;
        sim.vy = 0;
      }
    }

    const v = Math.hypot(p.vx, p.vz);
    if (hit && v < 0.4 && stick) sim.bump = Math.min(1, sim.bump + dt * 6);
    else sim.bump = Math.max(0, sim.bump - dt * 5);

    // Turn toward travel, a quick but sprung turn rather than a snap.
    if (v > 0.25) sim.yaw += angleDelta(sim.yaw, Math.atan2(p.vx, p.vz)) * (1 - Math.exp(-14 * dt));
    else if (mode.kind === "inspect") {
      const it = item(mode.id);
      if (it) sim.yaw += angleDelta(sim.yaw, it.face) * (1 - Math.exp(-10 * dt));
    }

    sim.land = Math.max(0, sim.land - dt * 5);
    // Running lengthens the stride more than it quickens the cadence, so legs never strobe.
    const pace = v / MOVE.speed;
    sim.stride += (Math.min(1.4, pace) - sim.stride) * (1 - Math.exp(-10 * dt));
    sim.phase += (v * dt * 6.2) / (1 + 0.55 * Math.max(0, pace - 1));
    if (v > 0.5 && sim.y === 0 && Math.floor(sim.phase / Math.PI) !== lastStep.current) {
      lastStep.current = Math.floor(sim.phase / Math.PI);
      cue("step");
    }
    sim.idle = v > 0.1 || stick ? 0 : sim.idle + dt;

    /* ---------------------------------------------------------- reach and room */
    if (mode.kind === "explore" || mode.kind === "travel") {
      const n = nearest(sim.items, p.x, p.z, sim.yaw);
      if (state.near?.id !== n?.id) world.set({ near: n });
      if (sim.use) {
        sim.use = false;
        if (n) interact(n);
      }
    } else {
      sim.use = false;
      if (mode.kind !== "inspect" && state.near) world.set({ near: null });
    }
    const room = roomAt(p.x, p.z)?.id ?? null;
    if (room !== state.room) world.set({ room });
    for (let i = 0; i < sim.keys.length; i++) sim.keys[i] = Math.max(0, sim.keys[i] - dt * 2.5);
    sim.yank = Math.max(0, sim.yank - dt * 0.8);

    /* ---------------------------------------------------------- camera */
    const aspect = size.width / Math.max(1, size.height);
    const halfV = Math.tan(THREE.MathUtils.degToRad(CAM.fov / 2));
    // Keep at least ~11 m of floor across on a narrow phone, ~17 m on a desktop.
    const fit = (w: number) => w / (2 * halfV * aspect);
    const want = V.want.set(sim.view.x + p.vx * 0.28, 0.85, sim.view.z + p.vz * 0.28);
    let d = Math.max(17.5, fit(aspect < 1 ? 10.5 : 16));
    let rate = 4.2;
    let sx = 0, sy = 0;
    if (mode.kind === "intro") {
      want.set(0.4, 0.2, 0.2);
      rate = 1.6;
      if (aspect < 1) {
        // Phone: the front-door card covers the lower half, so hold the shop in the upper half.
        d = fit(30);
        sy = -0.26 * 2 * d * halfV;
      } else d = Math.max(44, fit(33));
    } else if (mode.kind === "map") {
      want.set(0, 0, 0);
      d = Math.max(42, fit(31));
      rate = 3;
    } else if (mode.kind === "inspect") {
      const it = item(mode.id);
      if (it?.focus) {
        want.set(it.focus[0], it.focus[1], it.focus[2]);
        d = Math.max(mode.panel === "case" ? 10.5 : 12.5, fit(aspect < 1 ? 7 : 9));
        rate = 3.4;
        // Frame the object in the part of the screen the panel leaves free.
        const visH = 2 * d * halfV;
        if (sim.sheet.side === "right") sx = (sim.sheet.frac / 2) * visH * aspect;
        else sy = -(sim.sheet.frac / 2) * visH;
      }
    }
    // Clamp the follow target so the camera never shows more void than store.
    if (mode.kind === "explore" || mode.kind === "travel") {
      want.x = THREE.MathUtils.clamp(want.x, BOUNDS.x0 + 4, BOUNDS.x1 - 4);
      want.z = THREE.MathUtils.clamp(want.z, BOUNDS.z0 + 2.5, BOUNDS.z1 - 2);
    }
    const k = sim.calm ? 1 : 1 - Math.exp(-rate * dt);
    tgt.current.lerp(want, k);
    dist.current += (d - dist.current) * k;
    shift.current.x += (sx - shift.current.x) * k;
    shift.current.y += (sy - shift.current.y) * k;

    const cp = Math.cos(CAM.pitch), sp = Math.sin(CAM.pitch);
    const dir = V.dir.set(Math.sin(CAM.yaw) * cp, sp, Math.cos(CAM.yaw) * cp);
    // Screen-space shift: along camera right and camera up.
    const right = V.right.set(RIGHT.x, 0, RIGHT.z);
    const up = V.up.crossVectors(dir, right).normalize();
    look.current.copy(tgt.current).addScaledVector(right, shift.current.x).addScaledVector(up, shift.current.y);
    camera.position.copy(look.current).addScaledVector(dir, dist.current);
    camera.lookAt(look.current);
  }, -1);

  // Escape from a canvas-focused state (the panels handle their own).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && world.get().mode.kind === "map") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}

/** The floor as a click target: click or tap anywhere open to walk there. */
export function FloorTarget() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.001, 0]}
      onClick={(e) => {
        e.stopPropagation();
        goTo([e.point.x, e.point.z]);
        if (world.get().hint) world.set({ hint: false });
      }}
    >
      <planeGeometry args={[BOUNDS.x1 - BOUNDS.x0, BOUNDS.z1 - BOUNDS.z0]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

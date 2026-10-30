"use client";
/** Pip: a pocket-sized record collector. 45 meshes; only three shadow casters. */
import { useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useFrame } from "@react-three/fiber";
import { sim } from "../runtime";
import { world } from "../state";
import { angleDelta, MOVE } from "../sim";
import { capsule, cyl, dome, lathe, plane, rbox, sphere, torus } from "./shapes";
import { PALETTE as P, blob } from "./paint";

const SIDES = [-1, 1] as const;
const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;

/** Bake repeated detail into one mesh. All inputs are clones of shared shapes. */
function joined(parts: THREE.BufferGeometry[]) {
  const g = mergeGeometries(parts);
  for (const part of parts) part.dispose();
  if (!g) throw new Error("Pip detail geometry could not be merged");
  return g;
}

function makeAssets() {
  // Data texture: no colour-space conversion, just shallow knitted stitches.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#888";
  ctx.fillRect(0, 0, 64, 64);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  for (let y = -8; y < 72; y += 8) {
    for (let x = 0; x < 64; x += 8) {
      ctx.strokeStyle = "#bbb";
      ctx.beginPath(); ctx.moveTo(x + 1, y); ctx.lineTo(x + 4, y + 6); ctx.lineTo(x + 7, y); ctx.stroke();
      ctx.strokeStyle = "#555";
      ctx.beginPath(); ctx.moveTo(x + 4, y + 2); ctx.lineTo(x + 4, y + 7); ctx.stroke();
    }
  }
  const knit = new THREE.CanvasTexture(canvas);
  knit.wrapS = knit.wrapT = THREE.RepeatWrapping;
  knit.repeat.set(5, 3);
  const fabric = (color: string, sheenColor: string) => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.82, sheen: 0.6, sheenColor, sheenRoughness: 0.65,
  });
  const jacket = fabric(P.tangerine, "#ffbc75");
  const rib = fabric("#c95219", "#ff9a50");
  rib.bumpMap = knit; rib.bumpScale = 0.004;
  const hat = fabric(P.teal, "#76ddd0");
  hat.bumpMap = knit; hat.bumpScale = 0.008;
  const cuff = fabric(P.tealDeep, "#43c7bb");
  cuff.bumpMap = knit; cuff.bumpScale = 0.006;
  const skin = new THREE.MeshPhysicalMaterial({ color: "#bb8058", roughness: 0.6, sheen: 0.18, sheenColor: "#f6bc91" });
  const cans = new THREE.MeshPhysicalMaterial({ color: P.violet, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.18 });
  const sole = new THREE.MeshPhysicalMaterial({ color: P.coral, roughness: 0.43, clearcoat: 0.65 });
  const dark = new THREE.MeshPhysicalMaterial({ color: "#160f28", roughness: 0.2, clearcoat: 1 });
  const cream = fabric(P.cream, "#ffffff");
  const butter = fabric(P.butter, "#fff0b5");
  const pad = fabric(P.coral, "#ffa4a3");
  const chrome = new THREE.MeshPhysicalMaterial({ color: P.chrome, metalness: 0.9, roughness: 0.22 });
  const white = new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.12 });
  const led = new THREE.MeshPhysicalMaterial({ color: P.butter, emissive: P.coral, emissiveIntensity: 0, toneMapped: false });

  return {
    jacket, rib, hat, cuff, skin, cans, sole, dark, cream, butter, pad, chrome, white, led,
    pants: fabric(P.midnight, "#61558e"),
    shadow: blob(),
    body: lathe("pip-hero-body", [[0, 0], [0.14, 0], [0.2, 0.035], [0.225, 0.15], [0.22, 0.25], [0.17, 0.34], [0.1, 0.37], [0, 0.37]]),
    sleeve: lathe("pip-hero-sleeve", [[0, -0.235], [0.055, -0.235], [0.062, -0.18], [0.076, -0.065], [0.068, 0], [0, 0.025]]),
    cup: lathe("pip-hero-cup", [[0, -0.035], [0.083, -0.035], [0.103, -0.022], [0.108, -0.01], [0.108, 0.027], [0.094, 0.043], [0, 0.043]], 32),
    hand: joined([
      sphere(0.053).clone().scale(0.9, 1.12, 0.85),
      sphere(0.025).clone().translate(0, 0.02, 0.038),
    ]),
    ribs: joined([0, 1, 2, 3].map(i => torus(0.251, 0.012).clone().rotateX(Math.PI / 2).translate(0, i * 0.017, 0))),
    glints: joined(SIDES.map(side => sphere(0.009, 10, 8).clone().translate(side * 0.079 - 0.007, 0.013, 0.025))),
    brows: joined(SIDES.map(side => capsule(0.009, 0.032).clone().rotateZ(side * 1.35).translate(side * 0.079, 0, 0))),
    sliders: joined(SIDES.map(side => rbox(0.023, 0.1, 0.033, 0.008).clone().rotateZ(-side * 0.25).translate(side * 0.281, 0.073, 0))),
    laces: joined([-0.023, 0, 0.023].map(z => capsule(0.005, 0.065).clone().rotateZ(Math.PI / 2).rotateX(-0.25).translate(0, 0, z))),
    motif: joined([
      torus(0.021, 0.005).clone(),
      sphere(0.006, 10, 8).clone().translate(0, 0, 0.002),
    ]),
  };
}

// Shared, lazily created on the client. R3F must not dispose these on remount.
let assets: ReturnType<typeof makeAssets> | undefined;
function getAssets() { return assets ??= makeAssets(); }

/** Exact critically damped spring for a fixed target: stable even after a long frame. */
function spring(a: Float64Array, i: number, target: number, frequency: number, dt: number) {
  const x = a[i] - target;
  const c = a[i + 1] + frequency * x;
  const e = Math.exp(-frequency * dt);
  a[i] = target + (x + c * dt) * e;
  a[i + 1] = (a[i + 1] - frequency * c * dt) * e;
  return a[i];
}

export function Character() {
  const a = getAssets();
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const hips = useRef<THREE.Group>(null);
  const shoulders = useRef<THREE.Group>(null);
  const legs = useRef<(THREE.Group | null)[]>([]);
  const shins = useRef<(THREE.Group | null)[]>([]);
  const feet = useRef<(THREE.Group | null)[]>([]);
  const arms = useRef<(THREE.Group | null)[]>([]);
  const pack = useRef<THREE.Group>(null);
  const pom = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const brows = useRef<THREE.Mesh>(null);
  const smile = useRef<THREE.Mesh>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const motion = useRef({
    springs: new Float64Array(14), vx: 0, vz: 0, yaw: 0, ready: false,
    lookIn: 4.8, lookTime: 0, lookSide: 1, adjustIn: 10.4, adjustTime: 0,
    blinkIn: 3.1,
  });

  useFrame(({ clock }, dt) => {
    if (!root.current || !body.current || !head.current || !hips.current || !shoulders.current) return;
    const m = motion.current;
    const p = sim.player;
    const state = world.get();
    const t = clock.elapsedTime;
    // Airborne: legs tuck and stop walking, arms lift; landing squashes.
    const air = clamp(sim.y * 3, 0, 1);
    const s = sim.stride * (1 - air);
    const phase = sim.phase;
    const calm = sim.calm;
    const inspect = state.mode.kind === "inspect";
    const idle = !calm && sim.idle > 0.6 && !inspect ? clamp((sim.idle - 0.6) * 2, 0, 1) : 0;
    const step = Math.max(dt, 0.0001);
    if (!m.ready) { m.vx = p.vx; m.vz = p.vz; m.yaw = sim.yaw; m.ready = true; }
    const ax = clamp((p.vx - m.vx) / step, -16, 16);
    const az = clamp((p.vz - m.vz) / step, -16, 16);
    const turn = clamp(angleDelta(m.yaw, sim.yaw) / step, -8, 8);
    m.vx = p.vx; m.vz = p.vz; m.yaw = sim.yaw;
    const sy = Math.sin(sim.yaw), cy = Math.cos(sim.yaw);
    const accel = ax * sy + az * cy;
    const lateral = ax * cy - az * sy;
    const speed = (p.vx * sy + p.vz * cy) / MOVE.speed;
    const lean = spring(m.springs, 0, calm ? 0 : clamp(speed * 0.07 + accel * 0.009, -0.16, 0.2), 10, dt);
    const sway = Math.sin(phase) * s;
    const bob = (1 - Math.cos(phase * 2)) * 0.012 * s;
    const footfall = Math.max(0, Math.cos(phase * 2)) ** 12 * s * 0.018;
    const bump = calm ? 0 : sim.bump;
    const breathe = Math.sin(t * 2.1) * 0.006 * idle;
    const beatPhase = t * TAU * 76 / 60;
    const pulse = Math.max(0, Math.cos(beatPhase)) ** 10;
    const beat = state.music && !calm ? pulse * (0.025 + sim.level * 0.025) * idle : 0;

    // Only idle time advances the gesture schedule; movement/inspection cancels extras.
    if (idle > 0) {
      m.lookIn -= dt; m.adjustIn -= dt;
      if (m.lookIn <= 0) { m.lookTime = 1.8; m.lookSide *= -1; m.lookIn = 4 + Math.random() * 3; }
      if (m.adjustIn <= 0) { m.adjustTime = 1.05; m.adjustIn = 9 + Math.random() * 5; }
    } else { m.lookTime = 0; m.adjustTime = 0; }
    m.lookTime = Math.max(0, m.lookTime - dt);
    m.adjustTime = Math.max(0, m.adjustTime - dt);
    const glance = Math.sin(Math.PI * m.lookTime / 1.8) * 0.4 * m.lookSide * idle;
    const adjust = Math.sin(Math.PI * m.adjustTime / 1.05) ** 2 * idle;
    let want = glance;
    if (state.near) want = clamp(angleDelta(sim.yaw, Math.atan2(state.near.at[0] - p.x, state.near.at[1] - p.z)), -0.65, 0.65);
    const headYaw = spring(m.springs, 2, want - (calm ? 0 : turn * 0.035), 9, dt);
    const headPitch = spring(m.springs, 4, inspect ? 0.13 : -lean * 0.65 - beat, 11, dt);
    const packSwing = spring(m.springs, 6, calm ? 0 : -accel * 0.018 - lean * 0.5 + Math.sin(phase * 2) * s * 0.04, 8, dt);
    const pomSwing = spring(m.springs, 8, calm ? 0 : accel * 0.022 + sway * 0.08, 7, dt);
    const sideSwing = spring(m.springs, 10, calm ? 0 : -lateral * 0.012 - turn * 0.018, 8, dt);
    const pose = spring(m.springs, 12, inspect ? 1 : 0, 14, dt);

    root.current.position.set(p.x, sim.y, p.z);
    root.current.rotation.y = sim.yaw;
    hips.current.position.set(sway * 0.009, bob - footfall, 0);
    hips.current.rotation.z = -sway * 0.035;
    body.current.position.y = 0.3 + breathe;
    body.current.rotation.set(lean, sway * 0.035, -sway * 0.025);
    const squash = footfall + bump * 0.09 + (calm ? 0 : sim.land * 0.14) - air * 0.05;
    body.current.scale.set(1 + squash * 0.5, 1 - squash + breathe * 0.5, 1 + squash * 0.5);
    shoulders.current.rotation.y = -sway * 0.09;

    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const gait = Math.cos(phase + i * Math.PI);
      // Two-link IK: a level stance foot, a lifted swing foot, no independent gait clock.
      const footZ = -gait * 0.095 * s;
      const lift = Math.max(0, Math.sin(phase + i * Math.PI)) ** 2 * 0.055 * s;
      const down = 0.22 - lift;
      const distance = Math.min(0.239, Math.hypot(down, footZ));
      const knee = 2 * Math.acos(distance / 0.24);
      const hip = Math.atan2(-footZ, down) - knee * 0.5;
      legs.current[i]!.rotation.x = hip - air * 0.45;
      shins.current[i]!.rotation.x = knee + air * 0.9;
      feet.current[i]!.rotation.x = -hip - knee + gait * s * 0.12;
      const arm = arms.current[i]!;
      arm.rotation.set(-gait * s * 0.5 * (1 - pose) - pose * 1.15 - (i === 1 ? adjust * 2.55 : 0) - air * 0.5, 0,
        side * (0.12 + pose * 0.2 + air * 0.5 + (i === 1 ? adjust * 0.32 : 0)));
    }
    head.current.rotation.set(headPitch, headYaw + Math.sin(t * 38) * bump * 0.09, inspect ? -0.08 : sideSwing * 0.3);
    pack.current!.rotation.set(packSwing, sideSwing * 0.5, sideSwing);
    pom.current!.rotation.set(pomSwing, 0, sideSwing * 1.6);
    brows.current!.position.y = 0.092 + (state.near ? 0.022 : 0);
    brows.current!.rotation.z = inspect ? -0.08 : 0;
    smile.current!.visible = !inspect;
    mouth.current!.visible = inspect;
    m.blinkIn -= dt;
    if (m.blinkIn < 0) m.blinkIn = 2.8 + Math.random() * 3;
    eyes.current!.scale.y = !calm && m.blinkIn < 0.11 ? 0.12 : 1;
    a.led.emissiveIntensity = state.music ? (calm ? 0.35 : 0.25 + pulse * (2 + sim.level * 2)) : 0;
    // The shadow stays on the floor and shrinks as Pip leaves it.
    const shadowScale = (1 - bob * 2) / (1 + sim.y * 0.9);
    shadow.current!.scale.set(shadowScale, shadowScale, 1);
    shadow.current!.position.y = 0.04 - sim.y;
  });

  return (
    <group ref={root} dispose={null}>
      <mesh ref={shadow} geometry={plane(1, 1)} material={a.shadow} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1} />
      <group ref={hips}>
        {SIDES.map((side, i) => (
          <group key={side} ref={g => { legs.current[i] = g; }} position={[side * 0.105, 0.27, 0]}>
            <mesh geometry={capsule(0.064, 0.055)} material={a.pants} position={[0, -0.06, 0]} />
            <group ref={g => { shins.current[i] = g; }} position={[0, -0.12, 0]}>
              <mesh geometry={capsule(0.057, 0.055)} material={a.pants} position={[0, -0.06, 0]} />
              <group ref={g => { feet.current[i] = g; }} position={[0, -0.12, 0]}>
                <mesh geometry={rbox(0.15, 0.075, 0.215, 0.03)} material={a.cream} position={[0, 0.018, 0.038]} />
                <mesh geometry={rbox(0.158, 0.027, 0.225, 0.012)} material={a.sole} position={[0, -0.018, 0.038]} />
                <mesh geometry={a.laces} material={a.butter} position={[0, 0.057, 0.054]} />
              </group>
            </group>
          </group>
        ))}
        <group ref={body} position={[0, 0.3, 0]}>
          <mesh geometry={a.body} material={a.jacket} castShadow />
          <mesh geometry={torus(0.108, 0.025)} material={a.rib} position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={cyl(0.192, 0.181, 0.045)} material={a.rib} position={[0, 0.027, 0]} scale={[1, 1, 0.95]} />
          <mesh geometry={rbox(0.012, 0.265, 0.012, 0.004)} material={a.chrome} position={[0, 0.19, 0.22]} rotation={[-0.07, 0, 0]} />
          <mesh geometry={cyl(0.037, 0.037, 0.01)} material={a.butter} position={[-0.105, 0.265, 0.192]} rotation={[Math.PI / 2, 0, -0.2]} />
          <mesh geometry={a.motif} material={a.dark} position={[-0.105, 0.265, 0.2]} />
          <group ref={shoulders}>
            {SIDES.map((side, i) => (
              <group key={side} ref={g => { arms.current[i] = g; }} position={[side * 0.205, 0.305, 0]}>
                <mesh geometry={a.sleeve} material={a.jacket} />
                <mesh geometry={cyl(0.06, 0.056, 0.038)} material={a.rib} position={[0, -0.228, 0]} />
                <mesh geometry={a.hand} material={a.skin} position={[0, -0.283, 0.006]} />
              </group>
            ))}
          </group>
          <group ref={pack} position={[0, 0.31, -0.195]}>
            <mesh geometry={rbox(0.335, 0.32, 0.08, 0.025)} material={a.butter} position={[0, -0.12, -0.025]} castShadow />
            <mesh geometry={cyl(0.132, 0.132, 0.014, 40)} material={a.dark} position={[0.018, 0.043, -0.032]} rotation={[Math.PI / 2, 0, 0]} />
            <mesh geometry={cyl(0.042, 0.042, 0.017)} material={a.sole} position={[0.018, 0.043, -0.033]} rotation={[Math.PI / 2, 0, 0]} />
          </group>
          <group ref={head} position={[0, 0.535, 0]}>
            <mesh geometry={sphere(0.265, 32, 24)} material={a.skin} scale={[1, 1.03, 0.94]} castShadow />
            <group ref={eyes} position={[0, 0.012, 0.235]}>
              {SIDES.map(side => <mesh key={side} geometry={capsule(0.023, 0.028)} material={a.dark} position={[side * 0.079, 0, 0]} />)}
              <mesh geometry={a.glints} material={a.white} />
            </group>
            <mesh ref={brows} geometry={a.brows} material={a.dark} position={[0, 0.092, 0.226]} />
            <mesh ref={smile} geometry={torus(0.033, 0.008, Math.PI)} material={a.dark} position={[0, -0.069, 0.242]} rotation={[0, 0, Math.PI]} />
            <mesh ref={mouth} geometry={torus(0.021, 0.008)} material={a.dark} position={[0, -0.083, 0.242]} scale={[0.8, 1, 1]} visible={false} />
            <mesh geometry={dome(0.267, 32)} material={a.hat} position={[0, 0.09, -0.008]} scale={[1, 0.92, 1]} />
            <mesh geometry={a.ribs} material={a.cuff} position={[0, 0.062, -0.008]} />
            <group ref={pom} position={[0, 0.307, -0.025]}>
              <mesh geometry={sphere(0.064, 20, 14)} material={a.butter} position={[0, 0.055, 0]} scale={[1.05, 1, 1]} />
            </group>
            <mesh geometry={torus(0.287, 0.024, Math.PI)} material={a.cans} position={[0, 0.025, 0]} />
            <mesh geometry={torus(0.27, 0.015, Math.PI)} material={a.pad} position={[0, 0.023, 0]} />
            <mesh geometry={a.sliders} material={a.chrome} />
            {SIDES.map(side => (
              <group key={side} position={[side * 0.293, 0.005, 0]} rotation={[0, 0, -side * Math.PI / 2]}>
                <mesh geometry={a.cup} material={a.cans} />
                <mesh geometry={cyl(0.091, 0.091, 0.028)} material={a.pad} position={[0, -0.036, 0]} />
                <mesh geometry={sphere(0.008, 10, 8)} material={a.led} position={[0.043, 0.043, 0.055]} />
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}



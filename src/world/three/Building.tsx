"use client";
/**
 * The building: a diorama slab you can see the layers of, floors that change with the room, the
 * two walls the camera looks at, partitions, windows onto a golden-hour sky, and the sign.
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { BOUNDS, ROOMS, WALLS, WALL_H } from "../layout";
import { sim } from "../runtime";
import { world } from "../state";
import { Block, Footprint, plane, sphere } from "./shapes";
import { PALETTE as P, basic, carpet, checker, lacquer, lettering, mat, planks, rug } from "./paint";

const W = 0.3; // outer wall thickness

/* ------------------------------------------------------------------ sky through the windows */

const SKY_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const SKY_FRAG = /* glsl */ `
uniform float uNight;
uniform float uTime;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec3 dayTop = vec3(1.0, 0.62, 0.38);
  vec3 dayLow = vec3(1.0, 0.86, 0.55);
  vec3 nightTop = vec3(0.07, 0.06, 0.2);
  vec3 nightLow = vec3(0.32, 0.16, 0.42);
  vec3 col = mix(mix(dayLow, dayTop, vUv.y), mix(nightLow, nightTop, vUv.y), uNight);
  // a low sun by day, a moon by night
  float d = length((vUv - vec2(0.68, 0.32)) * vec2(1.0, 1.4));
  col += (1.0 - uNight) * vec3(1.0, 0.95, 0.75) * smoothstep(0.17, 0.15, d);
  col += uNight * vec3(0.95, 0.9, 1.0) * smoothstep(0.1, 0.085, d);
  vec2 g = floor(vUv * vec2(40.0, 60.0));
  float s = step(0.985, hash(g)) * uNight * (0.6 + 0.4 * sin(uTime * 2.0 + hash(g) * 30.0));
  col += vec3(s);
  // city skyline silhouette
  float x = vUv.x * 9.0;
  float h = 0.12 + 0.12 * step(0.5, fract(sin(floor(x) * 12.9) * 43.7)) + 0.06 * fract(sin(floor(x) * 4.1) * 13.3);
  vec3 town = mix(vec3(0.85, 0.42, 0.36), vec3(0.12, 0.08, 0.22), uNight);
  col = mix(col, town, step(vUv.y, h));
  float lit = step(vUv.y, h - 0.02) * step(0.7, hash(floor(vUv * vec2(60.0, 30.0)))) * uNight;
  col += lit * vec3(1.0, 0.75, 0.4) * 0.7;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export const skyUniforms = { uNight: { value: 0 }, uTime: { value: 0 } };

function useSky() {
  return useMemo(() => new THREE.ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, uniforms: skyUniforms }), []);
}

/** An arched window in a wall. `axis` "x" runs along the back wall, "z" along the left wall. */
function Window({ at, axis, w = 1.7, h = 1.9, y = 2.15, sky }: { at: [number, number]; axis: "x" | "z"; w?: number; h?: number; y?: number; sky: THREE.Material }) {
  const frame = lacquer("window-frame", P.cream);
  const rot: [number, number, number] = axis === "x" ? [0, 0, 0] : [0, Math.PI / 2, 0];
  const [x, z] = at;
  return (
    <group position={[x, y, z]} rotation={rot}>
      <mesh geometry={plane(w, h)} material={sky} position={[0, h / 2, 0.01]} />
      {/* frame: sill, sides, top, mullion */}
      <Block size={[w + 0.3, 0.12, 0.26]} m={frame} position={[0, -0.08, 0.06]} />
      <Block size={[w + 0.2, 0.12, 0.14]} m={frame} position={[0, h, 0.04]} />
      <Block size={[0.12, h, 0.14]} m={frame} position={[-w / 2 - 0.04, 0, 0.04]} />
      <Block size={[0.12, h, 0.14]} m={frame} position={[w / 2 + 0.04, 0, 0.04]} />
      <Block size={[0.06, h, 0.08]} m={frame} position={[0, 0, 0.04]} />
      <Block size={[w, 0.06, 0.08]} m={frame} position={[0, h * 0.58, 0.04]} />
    </group>
  );
}

/* ------------------------------------------------------------------ the sign */

const BULBS = 46;

function StoreSign() {
  const tex = useMemo(
    () =>
      lettering(
        [
          { text: "THE", size: 54, weight: 700, color: P.cream, track: 22, font: "mono" },
          { text: "Recordverse", size: 168, weight: 800, color: P.butter, track: -4 },
          { text: "RECORDS · TAPES · SOFTWARE  —  VED CHAUHAN, PROP.", size: 40, weight: 600, color: P.cream, track: 6, font: "mono" },
        ],
        { w: 1400, h: 440, bg: P.midnight, radius: 60, border: P.tangerine },
      ),
    [],
  );
  const bulbs = useRef<THREE.InstancedMesh>(null);
  const pos = useMemo(() => {
    const out: [number, number][] = [];
    const w = 6.3, h = 1.98;
    const per = 2 * (w + h);
    for (let i = 0; i < BULBS; i++) {
      let d = (i / BULBS) * per;
      if (d < w) out.push([-w / 2 + d, h / 2]);
      else if ((d -= w) < h) out.push([w / 2, h / 2 - d]);
      else if ((d -= h) < w) out.push([w / 2 - d, -h / 2]);
      else out.push([-w / 2, -h / 2 + (d - w)]);
    }
    return out;
  }, []);
  const color = useMemo(() => new THREE.Color(), []);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const last = useRef(-1);
  useFrame(({ clock }) => {
    const b = bulbs.current;
    if (!b) return;
    // A slow chase, stepped at ~8 Hz like real relays, not smoothly interpolated.
    const step = sim.calm ? 0 : Math.floor(clock.elapsedTime * 8);
    if (step === last.current) return;
    if (last.current < 0) pos.forEach(([x, y], i) => b.setMatrixAt(i, m4.makeTranslation(x, y, 0.08)));
    last.current = step;
    const night = !world.get().lights;
    for (let i = 0; i < BULBS; i++) {
      const on = sim.calm || (i + step) % 4 !== 0;
      color.set(on ? (night ? "#ffd68a" : "#ffe7b0") : "#6a4a2a").multiplyScalar(on ? (night ? 2.4 : 1.4) : 1);
      b.setColorAt(i, color);
    }
    b.instanceMatrix.needsUpdate = true;
    if (b.instanceColor) b.instanceColor.needsUpdate = true;
  });
  return (
    <group position={[0, 3.25, -7.96]}>
      <Block size={[6.7, 2.36, 0.12]} r={0.1} m={lacquer("sign-back", P.tangerine)} position={[0, -1.18, -0.02]} />
      <mesh geometry={plane(6.1, 1.92)} position={[0, 0, 0.06]}>
        <meshStandardMaterial map={tex} roughness={0.5} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.16} />
      </mesh>
      <instancedMesh ref={bulbs} args={[sphere(0.055, 10, 8), basic("bulb", { color: "#ffffff", toneMapped: false }), BULBS]} />
    </group>
  );
}

/** A room name stencilled on the floor, like a painted shop-floor marking. */
function FloorName({ text, tint, at }: { text: string; tint: string; at: [number, number] }) {
  const tex = useMemo(() => lettering([{ text, size: 64, weight: 800, color: tint, track: 6, font: "mono" }], { w: 1024, h: 128 }), [text, tint]);
  return (
    <mesh geometry={plane(4, 0.5)} rotation={[-Math.PI / 2, 0, 0]} position={[at[0], 0.03, at[1]]}>
      <meshBasicMaterial map={tex} transparent opacity={0.85} depthWrite={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ the building */

export function Building() {
  const sky = useSky();
  const tex = useMemo(() => {
    const oak = planks("#d39a62", 7);
    oak.repeat.set(4, 4.6);
    oak.wrapS = oak.wrapT = THREE.RepeatWrapping;
    const dark = planks("#9a5c38", 13);
    dark.repeat.set(3, 3);
    dark.wrapS = dark.wrapT = THREE.RepeatWrapping;
    const check = checker("#fff0dd", "#e0367a", 8);
    check.repeat.set(2, 2.4);
    check.wrapS = check.wrapT = THREE.RepeatWrapping;
    const pile = carpet("#4c3aa8");
    pile.repeat.set(4, 3);
    pile.wrapS = pile.wrapT = THREE.RepeatWrapping;
    const round = rug(["#13a89e", "#fff3df", "#ff7a1a", "#fff3df", "#e0367a", "#ffd66b"]);
    return { oak, dark, check, pile, round };
  }, []);

  useFrame((_, dt) => {
    const target = world.get().lights ? 0 : 1;
    skyUniforms.uNight.value += (target - skyUniforms.uNight.value) * (1 - Math.exp(-3 * dt));
    if (!sim.calm) skyUniforms.uTime.value += dt;
  });

  const plaster = mat("plaster", { color: P.plaster, roughness: 0.92 });
  const room = Object.fromEntries(ROOMS.map((r) => [r.id, r]));
  const floor = (box: { x0: number; z0: number; x1: number; z1: number }, m: THREE.Material, y = 0.012) => (
    <mesh geometry={plane(box.x1 - box.x0, box.z1 - box.z0)} material={m} rotation={[-Math.PI / 2, 0, 0]} position={[(box.x0 + box.x1) / 2, y, (box.z0 + box.z1) / 2]} receiveShadow />
  );

  return (
    <group>
      {/* the slab: wood edge, cream base, a tangerine pinstripe, like a cake you can see into */}
      <Block size={[BOUNDS.x1 - BOUNDS.x0 + W * 2 + 0.2, 0.16, BOUNDS.z1 - BOUNDS.z0 + W * 2 + 0.2]} r={0.06} m={mat("slab-top", { color: P.walnut, roughness: 0.6 })} position={[0, -0.2, 0]} cast={false} />
      <Block size={[BOUNDS.x1 - BOUNDS.x0 + W * 2, 0.5, BOUNDS.z1 - BOUNDS.z0 + W * 2]} r={0.04} m={mat("slab-mid", { color: P.cream, roughness: 0.9 })} position={[0, -0.66, 0]} cast={false} />
      <Block size={[BOUNDS.x1 - BOUNDS.x0 + W * 2 + 0.06, 0.08, BOUNDS.z1 - BOUNDS.z0 + W * 2 + 0.06]} r={0.03} m={mat("slab-stripe", { color: P.tangerine })} position={[0, -0.5, 0]} cast={false} />
      <Block size={[BOUNDS.x1 - BOUNDS.x0 + W * 2 - 0.2, 0.3, BOUNDS.z1 - BOUNDS.z0 + W * 2 - 0.2]} r={0.04} m={mat("slab-foot", { color: P.midnight })} position={[0, -0.96, 0]} cast={false} />

      {/* floors, one per room */}
      <mesh geometry={plane(BOUNDS.x1 - BOUNDS.x0, BOUNDS.z1 - BOUNDS.z0)} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial map={tex.oak} roughness={0.55} />
      </mesh>
      {floor(room.studio.bounds, mat("studio-floor", { color: "#ffffff", map: tex.pile, roughness: 1 }))}
      {floor(room.arcade.bounds, mat("arcade-floor", { color: "#ffffff", map: tex.check, roughness: 0.45 }))}
      {floor(room.releases.bounds, mat("releases-floor", { color: "#ffffff", map: tex.dark, roughness: 0.4 }))}
      <mesh geometry={new THREE.CircleGeometry(2.6, 48)} rotation={[-Math.PI / 2, 0, 0]} position={[10.4, 0.024, 4.2]} receiveShadow>
        <meshStandardMaterial map={tex.round} roughness={1} />
      </mesh>
      {/* welcome mat */}
      <Block size={[2.4, 0.03, 1.2]} r={0.015} m={mat("mat", { color: P.tangerine, roughness: 1 })} position={[0.6, 0.004, 7.15]} cast={false} />

      {/* back wall, painted per room, with a wainscot and a picture rail */}
      <Block size={[BOUNDS.x1 - BOUNDS.x0 + W * 2, WALL_H, W]} r={0.02} m={plaster} position={[0, 0, BOUNDS.z0 - W / 2]} cast={false} />
      <Block size={[8, WALL_H - 0.02, 0.02]} r={0.005} m={mat("paint-studio", { color: "#cfc4ff", roughness: 0.9 })} position={[-10, 0, BOUNDS.z0 + 0.012]} cast={false} />
      <Block size={[8, WALL_H - 0.02, 0.02]} r={0.005} m={mat("paint-releases", { color: "#ffe2a3", roughness: 0.9 })} position={[10, 0, BOUNDS.z0 + 0.012]} cast={false} />
      <Block size={[BOUNDS.x1 - BOUNDS.x0, 1.05, 0.08]} r={0.02} m={lacquer("wainscot", P.tealDeep)} position={[0, 0, BOUNDS.z0 + 0.04]} cast={false} />
      <Block size={[BOUNDS.x1 - BOUNDS.x0, 0.07, 0.12]} r={0.02} m={lacquer("rail", P.cream)} position={[0, 1.05, BOUNDS.z0 + 0.06]} cast={false} />
      <Block size={[BOUNDS.x1 - BOUNDS.x0 + W * 2, 0.18, 0.16]} r={0.03} m={lacquer("cornice", P.tangerine)} position={[0, WALL_H - 0.18, BOUNDS.z0 + 0.02]} cast={false} />

      {/* left wall */}
      <Block size={[W, WALL_H, BOUNDS.z1 - BOUNDS.z0 + W]} r={0.02} m={plaster} position={[BOUNDS.x0 - W / 2, 0, W / 2]} cast={false} />
      <Block size={[0.02, WALL_H - 0.02, 9.5]} r={0.005} m={mat("paint-arcade", { color: "#ffc6d9", roughness: 0.9 })} position={[BOUNDS.x0 + 0.012, 0, 3.25]} cast={false} />
      <Block size={[0.02, WALL_H - 0.02, 6.5]} r={0.005} m={mat("paint-studio", { color: "#cfc4ff", roughness: 0.9 })} position={[BOUNDS.x0 + 0.012, 0, -4.75]} cast={false} />
      <Block size={[0.08, 1.05, BOUNDS.z1 - BOUNDS.z0]} r={0.02} m={lacquer("wainscot", P.tealDeep)} position={[BOUNDS.x0 + 0.04, 0, 0]} cast={false} />
      <Block size={[0.12, 0.07, BOUNDS.z1 - BOUNDS.z0]} r={0.02} m={lacquer("rail", P.cream)} position={[BOUNDS.x0 + 0.06, 1.05, 0]} cast={false} />
      <Block size={[0.16, 0.18, BOUNDS.z1 - BOUNDS.z0 + W]} r={0.03} m={lacquer("cornice", P.tangerine)} position={[BOUNDS.x0 + 0.02, WALL_H - 0.18, W / 2]} cast={false} />

      {/* a low curb along the open front and right, so the cut-away still reads as a room */}
      <Block size={[BOUNDS.x1 - BOUNDS.x0 + W, 0.22, 0.14]} r={0.05} m={lacquer("curb", P.cream)} position={[W / 2, 0, BOUNDS.z1 + 0.07]} />
      <Block size={[0.14, 0.22, BOUNDS.z1 - BOUNDS.z0 + W]} r={0.05} m={lacquer("curb", P.cream)} position={[BOUNDS.x1 + 0.07, 0, W / 2 - W]} />

      {/* windows */}
      <Window at={[BOUNDS.x0 + 0.02, 2.9]} axis="z" sky={sky} />
      <Window at={[BOUNDS.x0 + 0.02, 5.75]} axis="z" sky={sky} />
      <Window at={[BOUNDS.x0 + 0.02, -4.75]} axis="z" w={2.2} sky={sky} />
      <Window at={[12.1, BOUNDS.z0 + 0.02]} axis="x" w={2.4} h={1.6} y={2.3} sky={sky} />

      {/* partitions */}
      {WALLS.map((w, k) => (
        <group key={k}>
          <Footprint box={w} h={w.h} m={w.tone === "low" ? lacquer("low-wall", P.violet) : w.tone === "plaster" ? mat("partition-plaster", { color: "#fff0d8", roughness: 0.85 }) : lacquer("panel-wall", "#efe1c8")} />
          <Footprint box={{ x0: w.x0 - 0.04, z0: w.z0, x1: w.x1 + 0.04, z1: w.z1 }} y0={w.h} h={0.08} m={lacquer("cap", w.tone === "low" ? P.butter : P.tangerine)} />
        </group>
      ))}
      {/* the studio door frame */}
      <Block size={[0.4, 0.3, 2.3]} r={0.05} m={lacquer("lintel", P.violet)} position={[-6, 2.3, -4.3]} />

      <StoreSign />
      <FloorName text="02 · PRODUCTION STUDIO" tint="#5b46d6" at={[-10.2, -2.0]} />
      <FloorName text="05 · HALL OF RELEASES" tint="#b07a00" at={[10.2, -1.2]} />
      {/* The open-front rooms are named on the floor, not overhead, so nothing hangs between camera and visitor. */}
      <FloorName text="06 · CHECKOUT" tint={P.coral} at={[3.7, 5.6]} />
      <FloorName text="03 · LISTENING LOUNGE" tint={P.teal} at={[10.4, 1.0]} />
      <FloorName text="04 · ARCADE" tint={P.raspberry} at={[-8.4, 7.3]} />
    </group>
  );
}

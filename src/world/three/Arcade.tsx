"use client";
/**
 * 04 — The Experimental Arcade. Six cabinets, one per experiment, each with an animated screen
 * and a marquee. On the checkerboard: loose records you can kick about, the one genuinely
 * physical toy in the shop.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ARCADE_Z } from "../layout";
import { sim } from "../runtime";
import { Block, cyl, plane } from "./shapes";
import { PALETTE as P, blob, discLabel, lacquer, lettering } from "./paint";
import { ease, handles, wants } from "./attention";

const BODY = [P.raspberry, P.violet, P.teal, P.tangerine, P.coral, P.midnight];

const SCREEN_FRAG = /* glsl */ `
uniform float uTime; uniform vec3 uTint; uniform float uOn; uniform float uKind;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  float scan = 0.85 + 0.15 * sin(uv.y * 160.0);
  vec3 col = vec3(0.04, 0.03, 0.1);
  float t = uTime * (0.6 + uOn * 1.4);
  if (uKind < 0.5) {         // starfield tunnel
    vec2 p = uv - 0.5; float a = atan(p.y, p.x); float r = length(p);
    float s = step(0.92, fract(sin(floor(a * 12.0) * 43.1) * 91.7 + r * 3.0 - t * 0.6));
    col += uTint * s * r * 2.0;
  } else if (uKind < 1.5) {  // bouncing blocks
    vec2 g = floor(uv * vec2(8.0, 6.0));
    float on = step(0.7, fract(sin(dot(g, vec2(12.9, 78.2)) + floor(t * 2.0)) * 43758.5));
    col += uTint * on * 0.9;
  } else if (uKind < 2.5) {  // waveform
    float y = 0.5 + 0.25 * sin(uv.x * 18.0 + t * 3.0) * sin(uv.x * 3.0 - t);
    col += uTint * smoothstep(0.02, 0.0, abs(uv.y - y));
  } else {                   // concentric rings
    float r = length(uv - 0.5);
    col += uTint * step(0.5, fract(r * 10.0 - t)) * 0.6;
  }
  col *= scan * (0.7 + 0.3 * uOn);
  gl_FragColor = vec4(col, 1.0);
}`;

function Cabinet({ k, title, z }: { k: number; title: string; z: number }) {
  const id = `arcade-${k}`;
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: SCREEN_FRAG,
        uniforms: { uTime: { value: k * 3.1 }, uTint: { value: new THREE.Color([P.butter, P.coral, P.teal, P.tangerine, "#b9b2ff", P.butter][k]) }, uOn: { value: 0 }, uKind: { value: k % 4 } },
        toneMapped: false,
      }),
    [k],
  );
  const marquee = useMemo(() => {
    const short = title.length > 16 ? `${title.slice(0, 15)}…` : title;
    return lettering([{ text: short.toUpperCase(), size: 44, color: P.butter, font: "display", track: 2 }], { w: 512, h: 128, bg: BODY[k] === P.midnight ? "#2b2558" : "#1b1740", radius: 16 });
  }, [title, k]);
  const a = useRef(0);
  const root = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    a.current = ease(a.current, wants(id), 8, dt);
    mat.uniforms.uOn.value = a.current;
    if (!sim.calm) mat.uniforms.uTime.value += dt;
    if (root.current) root.current.position.x = -13.45 + a.current * 0.05;
  });
  useEffect(() => () => mat.dispose(), [mat]);
  const body = lacquer(`cab-${k}`, BODY[k]);
  return (
    <group ref={root} position={[-13.45, 0, z]} rotation={[0, Math.PI / 2, 0]} {...handles(id)}>
      <Block size={[1.05, 1.0, 0.9]} r={0.05} m={body} position={[0, 0, -0.05]} />
      <Block size={[1.05, 0.95, 0.6]} r={0.05} m={body} position={[0, 1.0, -0.2]} />
      {/* control deck */}
      <Block size={[1.0, 0.1, 0.45]} r={0.04} m={lacquer("deck", P.cream)} position={[0, 0.98, 0.18]} rotation={[0.2, 0, 0]} />
      <mesh geometry={cyl(0.02, 0.02, 0.16, 8)} material={lacquer("stick", P.midnight)} position={[-0.25, 1.14, 0.2]} />
      <mesh geometry={cyl(0.05, 0.05, 0.03, 12)} material={lacquer("stick-ball", P.coral)} position={[-0.25, 1.22, 0.2]} />
      {[0, 1, 2].map((b) => (
        <mesh key={b} geometry={cyl(0.04, 0.04, 0.04, 14)} material={lacquer(`btn-${b}`, [P.butter, P.teal, P.coral][b])} position={[0.05 + b * 0.13, 1.08, 0.2 - (b % 2) * 0.04]} />
      ))}
      <mesh geometry={plane(0.82, 0.62)} material={mat} position={[0, 1.5, 0.105]} rotation={[-0.12, 0, 0]} />
      <Block size={[1.12, 0.32, 0.5]} r={0.05} m={body} position={[0, 1.95, -0.2]} />
      <mesh geometry={plane(1.02, 0.26)} position={[0, 2.11, 0.055]}>
        <meshBasicMaterial map={marquee} toneMapped={false} />
      </mesh>
    </group>
  );
}

const DISC_COLORS = [P.butter, P.coral, P.teal, P.violet, P.tangerine, P.raspberry, P.cream];

function LooseRecords() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const labels = useMemo(() => DISC_COLORS.map((c, k) => discLabel(c, P.ink, ["KICK", "ME", "PLAY", "SPIN", "PUSH", "ROLL", "HI"][k])), []);
  useEffect(() => {
    sim.discs = DISC_COLORS.map((_, k) => ({ x: -9.5 + (k % 4) * 1.1, z: 1.6 + Math.floor(k / 4) * 1.3 + (k % 2) * 0.3, vx: 0, vz: 0, r: 0.36, spin: 0, angle: k }));
    return () => {
      sim.discs = [];
    };
  }, []);
  useFrame(() => {
    sim.discs.forEach((d, k) => {
      const g = refs.current[k];
      if (!g) return;
      g.position.set(d.x, 0, d.z);
      g.rotation.y = d.angle;
    });
  });
  return (
    <>
      {DISC_COLORS.map((_, k) => (
        <group key={k} ref={(el) => void (refs.current[k] = el)}>
          <mesh geometry={plane(1.0, 1.0)} material={blob()} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} />
          <mesh geometry={cyl(0.36, 0.36, 0.025, 36)} position={[0, 0.058, 0]}>
            <meshStandardMaterial map={labels[k]} roughness={0.25} metalness={0.2} />
          </mesh>
        </group>
      ))}
    </>
  );
}

export function Arcade({ titles }: { titles: string[] }) {
  const sign = useMemo(
    () => lettering([{ text: "INSERT CURIOSITY", size: 64, color: P.butter, font: "display", track: 3 }, { text: "experiments · prototypes · toys", size: 34, color: P.cream, font: "mono" }], { w: 900, h: 220, bg: P.raspberry, radius: 30 }),
    [],
  );
  return (
    <group>
      {titles.slice(0, ARCADE_Z.length).map((t, k) => (
        <Cabinet key={t} k={k} title={t} z={ARCADE_Z[k]} />
      ))}
      <mesh geometry={plane(3.2, 0.78)} position={[-13.98, 3.25, 3.6]} rotation={[0, Math.PI / 2, 0]}>
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      <LooseRecords />
    </group>
  );
}

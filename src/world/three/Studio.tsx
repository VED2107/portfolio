"use client";
/**
 * 02 — The Production Studio. A desk of three screens, a synth you can play, monitor speakers
 * that breathe with the music, and a rack of modules, one per skill group, LEDs ticking over.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { sim } from "../runtime";
import { Block, cyl, plane, rbox, sphere } from "./shapes";
import { PALETTE as P, basic, lacquer, lettering, mat } from "./paint";
import { ease, handles, wants } from "./attention";

const GROUPS = ["LANGUAGES", "FRONTEND", "BACKEND & DATA", "SYSTEMS", "TEST & DEVOPS"];
const GROUP_TINT = [P.tangerine, P.coral, P.teal, P.violet, P.butter];

/** The middle screen: a waveform redrawn ten times a second from the music level. */
function useScope() {
  const { tex, draw } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 384;
    c.height = 224;
    const g = c.getContext("2d")!;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    const draw = (time: number, level: number) => {
      g.fillStyle = "#14102e";
      g.fillRect(0, 0, 384, 224);
      g.strokeStyle = "rgba(255,255,255,.07)";
      for (let x = 0; x < 384; x += 32) g.strokeRect(x, 0, 32, 224);
      g.lineWidth = 4;
      g.strokeStyle = P.butter;
      g.beginPath();
      for (let x = 0; x <= 384; x += 4) {
        const amp = 18 + level * 70;
        const y = 112 + Math.sin(x / 22 + time * 3) * amp * Math.sin(x / 97 + time) + Math.sin(x / 7 + time * 9) * level * 10;
        if (x === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
      g.fillStyle = P.coral;
      g.font = "700 20px ui-monospace, monospace";
      g.fillText(level > 0.02 ? "● REC  76 BPM" : "○ IDLE  76 BPM", 16, 30);
      t.needsUpdate = true;
    };
    draw(0, 0);
    return { tex: t, draw };
  }, []);
  return { tex, draw };
}

function Screen({ x, tex, tilt = 0 }: { x: number; tex: THREE.Texture; tilt?: number }) {
  return (
    <group position={[x, 1.02, -7.65]} rotation={[0, tilt, 0]}>
      <mesh geometry={cyl(0.04, 0.12, 0.3, 12)} material={lacquer("stand", P.midnight)} position={[0, 0.15, 0]} />
      <Block size={[1.22, 0.78, 0.08]} r={0.04} m={lacquer("bezel", P.midnight)} position={[0, 0.3, 0]} />
      <mesh geometry={plane(1.1, 0.66)} position={[0, 0.69, 0.045]}>
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Speaker({ x, z, y = 0, s = 1 }: { x: number; z: number; y?: number; s?: number }) {
  const cone = useRef<THREE.Mesh>(null);
  useFrame(() => {
    // The woofer pumps with the audio level; silent, it sits still.
    if (cone.current) cone.current.scale.setScalar(1 + sim.level * 0.18);
  });
  return (
    <group position={[x, y, z]} scale={s}>
      <Block size={[0.62, 0.95, 0.55]} r={0.06} m={lacquer("speaker", P.walnut)} />
      <mesh geometry={cyl(0.2, 0.2, 0.04, 28)} material={mat("grille", { color: "#2a1f2c", roughness: 0.9 })} position={[0, 0.36, 0.28]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh ref={cone} geometry={sphere(0.13, 18, 10)} material={mat("cone", { color: P.cream, roughness: 0.6 })} position={[0, 0.36, 0.27]} scale={[1, 1, 0.35]} />
      <mesh geometry={cyl(0.07, 0.07, 0.04, 18)} material={lacquer("tweeter", P.butter)} position={[0, 0.74, 0.28]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

function Synth() {
  const keys = useRef<THREE.InstancedMesh>(null);
  const col = useMemo(() => new THREE.Color(), []);
  useEffect(() => {
    const m = keys.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < 12; i++) {
      o.position.set(-0.47 + i * 0.086, 0, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame(() => {
    const m = keys.current;
    if (!m) return;
    for (let i = 0; i < 12; i++) m.setColorAt(i, col.set(P.cream).lerp(new THREE.Color(GROUP_TINT[i % 5]), sim.keys[i]));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <group position={[-8.7, 0.97, -7.25]} rotation={[0.18, 0, 0]} {...handles("synth")}>
      <Block size={[1.15, 0.1, 0.42]} r={0.04} m={lacquer("synth", P.coral)} />
      <instancedMesh ref={keys} args={[rbox(0.075, 0.04, 0.2, 0.01), mat("key", { color: "#ffffff", roughness: 0.4 }), 12]} position={[0, 0.11, 0.08]} />
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} geometry={cyl(0.03, 0.03, 0.05, 12)} material={lacquer("knob", P.midnight)} position={[-0.42 + k * 0.12, 0.13, -0.12]} />
      ))}
    </group>
  );
}

/** A rack module per skill group: a lettered face plate and a row of LEDs that tick over. */
function Rack() {
  const leds = useRef<THREE.InstancedMesh>(null);
  const plates = useMemo(
    () => GROUPS.map((g, k) => lettering([{ text: g, size: 44, color: GROUP_TINT[k], font: "mono", track: 4 }], { w: 512, h: 96, bg: "#1b1740", radius: 12, align: "left", pad: 24 })),
    [],
  );
  const col = useMemo(() => new THREE.Color(), []);
  const N = 5 * 8;
  const last = useRef(-1);
  useEffect(() => {
    const m = leds.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < N; i++) {
      o.position.set(0.02, 0.24 + Math.floor(i / 8) * 0.52, -0.3 + (i % 8) * 0.085);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [N]);
  useFrame(({ clock }) => {
    const m = leds.current;
    if (!m) return;
    const s = sim.calm ? 0 : Math.floor(clock.elapsedTime * 5);
    if (s === last.current) return;
    last.current = s;
    for (let i = 0; i < N; i++) {
      const row = Math.floor(i / 8), k = i % 8;
      const on = sim.calm ? k < 4 : ((k * 7 + row * 3 + s) % 11) < 4 + sim.level * 8;
      m.setColorAt(i, col.set(on ? GROUP_TINT[row] : "#3a2f4a").multiplyScalar(on ? 1.6 : 1));
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <group position={[-13.55, 0, -4.8]}>
      <Block size={[0.9, 2.75, 3.2]} r={0.05} m={lacquer("rack", P.midnight)} />
      {plates.map((t, k) => (
        <group key={k} position={[0.455, 0.42 + k * 0.52, 0]}>
          <Block size={[0.04, 0.44, 3.0]} r={0.015} m={mat("rack-face", { color: "#2b2558", roughness: 0.5 })} position={[0, -0.22, 0]} />
          <mesh geometry={plane(1.2, 0.225)} rotation={[0, Math.PI / 2, 0]} position={[0.025, 0.05, 0.75]}>
            <meshBasicMaterial map={t} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={leds} args={[sphere(0.025, 8, 6), basic("led", { color: "#ffffff", toneMapped: false }), N]} position={[0.46, 0, -0.6]} />
    </group>
  );
}

export function Studio() {
  const scope = useScope();
  const code = useMemo(
    () =>
      lettering(
        [
          { text: "const store = place();", size: 30, color: P.butter, font: "mono" },
          { text: "store.walk(visitor);", size: 30, color: "#b9b2ff", font: "mono" },
          { text: "// same input, same result", size: 30, color: "#8a84b8", font: "mono" },
          { text: "await ship();", size: 30, color: P.coral, font: "mono" },
        ],
        { w: 384, h: 224, bg: "#14102e", align: "left", pad: 22 },
      ),
    [],
  );
  const stack = useMemo(
    () =>
      lettering(
        [
          { text: "TS · RUST · SQL", size: 34, color: P.teal, font: "mono" },
          { text: "PY · DART · JS", size: 34, color: P.teal, font: "mono" },
          { text: "▲ 5 groups on the rack", size: 24, color: "#8a84b8", font: "mono" },
        ],
        { w: 384, h: 224, bg: "#14102e" },
      ),
    [],
  );
  const desk = useRef<THREE.Group>(null);
  const a = useRef(0);
  const last = useRef(0);
  useFrame(({ clock }, dt) => {
    a.current = ease(a.current, wants("studio-desk"), 8, dt);
    const t = clock.elapsedTime;
    if (t - last.current > 0.1 && !sim.calm) {
      last.current = t;
      scope.draw(t, sim.level);
    }
    if (desk.current) desk.current.position.y = a.current * 0.02;
  });

  return (
    <group>
      <group ref={desk} {...handles("studio-desk")}>
        {/* desk: walnut top on tangerine hairpin legs */}
        <Block size={[4.7, 0.08, 1.25]} r={0.04} m={lacquer("desk-top", "#a8673e")} position={[-10.5, 0.88, -7.35]} />
        {[-12.7, -8.3].map((x) => [-7.85, -6.85].map((z) => <mesh key={`${x}${z}`} geometry={cyl(0.035, 0.035, 0.88, 8)} material={lacquer("hairpin", P.tangerine)} position={[x, 0.44, z]} castShadow />))}
        <Screen x={-11.75} tex={code} tilt={0.28} />
        <Screen x={-10.5} tex={scope.tex} />
        <Screen x={-9.25} tex={stack} tilt={-0.28} />
        <Block size={[0.9, 0.035, 0.3]} r={0.015} m={lacquer("keyboard", P.cream)} position={[-10.5, 0.96, -6.95]} />
        <Speaker x={-12.85} z={-7.45} y={0.92} s={0.55} />
      </group>
      <Synth />
      {/* the stool */}
      <group position={[-10.5, 0, -6.15]}>
        <mesh geometry={cyl(0.28, 0.28, 0.1, 24)} material={lacquer("stool", P.violet)} position={[0, 0.62, 0]} castShadow />
        <mesh geometry={cyl(0.04, 0.04, 0.6, 10)} material={lacquer("chrome", P.chrome)} position={[0, 0.3, 0]} />
        <mesh geometry={cyl(0.25, 0.25, 0.03, 20)} material={lacquer("chrome", P.chrome)} position={[0, 0.015, 0]} />
      </group>
      <Speaker x={-13.4} z={-2.6} />
      <Rack />
      {/* a couch for the producer's clients, facing the desk */}
      <group position={[-8.5, 0, -2.7]}>
        <Block size={[2.2, 0.38, 0.8]} r={0.12} m={mat("couch", { color: "#5b46d6", roughness: 0.9 })} position={[0, 0.1, 0]} />
        <Block size={[2.2, 0.55, 0.22]} r={0.1} m={mat("couch", { color: "#5b46d6", roughness: 0.9 })} position={[0, 0.3, 0.32]} />
        <Block size={[0.6, 0.32, 0.5]} r={0.12} m={mat("cushion", { color: P.butter, roughness: 0.95 })} position={[-0.55, 0.48, -0.05]} />
      </group>
      {/* cables coiled on the floor */}
      <mesh geometry={new THREE.TorusGeometry(0.32, 0.025, 6, 32)} material={mat("cable", { color: "#1a1222" })} rotation={[-Math.PI / 2, 0, 0]} position={[-12.4, 0.03, -6.2]} />
    </group>
  );
}

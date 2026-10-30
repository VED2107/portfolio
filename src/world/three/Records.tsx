"use client";
/**
 * 01 — The Record Wall. Six records face out under their own spotlights, a bin of spines below
 * them, the browse crate in the middle of the floor, and the store map by the door.
 *
 * The signature move: walk up to a record and it lifts off the ledge, its disc rising out of the
 * sleeve. Pull it and it slides toward you as the case study opens.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ROOMS, WALL_SLEEVE_Y, WALL_SLOTS } from "../layout";
import { sim } from "../runtime";
import { sleeveOf } from "@/lib/covers";
import { Block, cyl, plane, rbox } from "./shapes";
import { PALETTE as P, basic, discLabel, lacquer, lettering, mat, pool, sleeveTexture } from "./paint";
import { ease, handles, wants } from "./attention";

const SLEEVE = 1.3;

function Sleeve({ id, slug, title, x, y, z, rotY = 0, size = SLEEVE, invalidate, use = id }: { id: string; slug: string; title: string; x: number; y: number; z: number; rotY?: number; size?: number; invalidate: () => void; use?: string }) {
  const s = sleeveOf(slug);
  const tex = useMemo(() => sleeveTexture(slug, title, invalidate), [slug, title, invalidate]);
  const label = useMemo(() => discLabel(s.label, s.ink === "#1b1740" ? "#fff3df" : s.bg, s.cat), [s]);
  const root = useRef<THREE.Group>(null);
  const disc = useRef<THREE.Group>(null);
  const a = useRef(0);
  useFrame((_, dt) => {
    const g = root.current, d = disc.current;
    if (!g || !d) return;
    const pulled = sim.pulled === id;
    a.current = ease(a.current, pulled ? 1 : wants(id), sim.calm ? 30 : 9, dt);
    const t = a.current;
    // Lift off the ledge and lean out toward the visitor; pulled, it comes right off the wall.
    g.position.set(x, y + t * 0.12 + (pulled ? 0.1 : 0), z + t * (pulled ? 0.55 : 0.16));
    g.rotation.set(-t * 0.12, rotY, 0);
    d.position.y = size * 0.08 + t * size * 0.32;
    if (!sim.calm) d.rotation.z -= dt * (0.4 + t * 2.4);
  });
  return (
    <group ref={root} position={[x, y, z]} rotation={[0, rotY, 0]} {...handles(use)}>
      {/* the disc, half in the sleeve */}
      <group ref={disc} position={[0, size * 0.08, -0.03]}>
        <mesh geometry={cyl(size * 0.47, size * 0.47, 0.012, 48)} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial map={label} roughness={0.25} metalness={0.2} />
        </mesh>
      </group>
      <mesh geometry={rbox(size, size, 0.035, 0.012)} material={mat(`sleeve-edge-${slug}`, { color: s.bg, roughness: 0.6 })} castShadow />
      <mesh geometry={plane(size * 0.985, size * 0.985)} position={[0, 0, 0.0185]}>
        <meshStandardMaterial map={tex} roughness={0.55} />
      </mesh>
    </group>
  );
}

/** A bin of record spines: one instanced mesh, a hundred-odd records. */
function Spines({ x0, x1, z, y, n, seed = 1 }: { x0: number; x1: number; z: number; y: number; n: number; seed?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const colors = [P.tangerine, P.coral, P.butter, P.teal, P.violet, P.raspberry, P.midnight, P.cream, "#2f8f6f", "#f0a3b8"];
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    let r = seed * 9301;
    const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      o.position.set(x0 + (x1 - x0) * t, y + 0.29 + rnd() * 0.03, z + (rnd() - 0.5) * 0.04);
      o.rotation.set((rnd() - 0.5) * 0.12, 0, (rnd() - 0.5) * 0.18);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(colors[Math.floor(rnd() * colors.length)]));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [x0, x1, z, y, n, seed]);
  return <instancedMesh ref={ref} args={[rbox(0.035, 0.6, 0.62, 0.008), mat("spine", { color: "#ffffff", roughness: 0.55 }), n]} castShadow />;
}

/** Spotlight: an emissive can, a soft cone and a pool on the ledge. No real light needed. */
function Spot({ x }: { x: number }) {
  const cone = useMemo(() => {
    const g = new THREE.ConeGeometry(0.75, 1.5, 24, 1, true);
    g.translate(0, -0.75, 0);
    return g;
  }, []);
  return (
    <group position={[x, 3.05, -7.55]}>
      <mesh geometry={cyl(0.09, 0.13, 0.22, 16)} material={lacquer("spot-can", P.midnight)} rotation={[0.5, 0, 0]} />
      <mesh geometry={cone} rotation={[0.42, 0, 0]} position={[0, -0.08, 0.05]} material={basic("spot-cone", { color: "#ffe2a8", transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })} />
    </group>
  );
}

function Kiosk() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 640;
    c.height = 400;
    const g = c.getContext("2d")!;
    g.fillStyle = P.cream;
    g.fillRect(0, 0, 640, 400);
    const sx = (x: number) => 40 + ((x + 14) / 28) * 560;
    const sz = (z: number) => 50 + ((z + 8) / 16) * 300;
    for (const r of ROOMS) {
      g.fillStyle = r.tint;
      g.globalAlpha = 0.85;
      g.beginPath();
      g.roundRect(sx(r.bounds.x0) + 3, sz(r.bounds.z0) + 3, sx(r.bounds.x1) - sx(r.bounds.x0) - 6, sz(r.bounds.z1) - sz(r.bounds.z0) - 6, 10);
      g.fill();
      g.globalAlpha = 1;
      g.fillStyle = "#fff";
      g.font = "700 26px ui-monospace, monospace";
      g.fillText(r.no, sx(r.bounds.x0) + 14, sz(r.bounds.z0) + 34);
    }
    g.fillStyle = P.ink;
    g.font = "800 28px system-ui, sans-serif";
    g.fillText("YOU ARE HERE", sx(-1.9) - 80, sz(6.6) + 30);
    g.beginPath();
    g.arc(sx(-1.9), sz(6.1), 9, 0, Math.PI * 2);
    g.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const top = useRef<THREE.Group>(null);
  const a = useRef(0);
  useFrame((_, dt) => {
    a.current = ease(a.current, wants("kiosk"), 8, dt);
    if (top.current) top.current.rotation.x = -0.75 + a.current * 0.2;
  });
  return (
    <group position={[-1.9, 0, 5.5]} {...handles("kiosk")}>
      <Block size={[0.7, 0.1, 0.7]} r={0.04} m={lacquer("kiosk-foot", P.midnight)} />
      <mesh geometry={cyl(0.07, 0.07, 1.05, 12)} material={lacquer("chrome", P.chrome)} position={[0, 0.6, 0]} castShadow />
      <group ref={top} position={[0, 1.15, 0]} rotation={[-0.75, 0, 0]}>
        <Block size={[1.15, 0.08, 0.78]} r={0.03} m={lacquer("kiosk-top", P.tangerine)} position={[0, -0.04, 0]} />
        <mesh geometry={plane(1.04, 0.66)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
          <meshStandardMaterial map={tex} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

export function RecordsArea({ wall, crate, titles, invalidate }: { wall: string[]; crate: string[]; titles: Record<string, string>; invalidate: () => void }) {
  const crateCard = useMemo(
    () => lettering([{ text: "BACK CATALOGUE", size: 46, color: P.cream, font: "mono", track: 6 }, { text: "flip through", size: 64, color: P.butter }], { w: 640, h: 220, bg: P.midnight, radius: 30 }),
    [],
  );
  const crateRef = useRef<THREE.Group>(null);
  const a = useRef(0);
  useFrame((_, dt) => {
    a.current = ease(a.current, wants("crate"), 8, dt);
    const g = crateRef.current;
    if (!g) return;
    g.children.forEach((c, k) => {
      c.rotation.x = -0.22 - a.current * (0.5 - k * 0.12);
    });
  });
  return (
    <group>
      {/* the wall unit: a walnut cabinet of bins, a ledge rail per record */}
      <Block size={[10.8, 0.95, 0.75]} r={0.05} m={lacquer("cabinet", P.walnut)} position={[0, 0, -7.62]} />
      <Block size={[10.9, 0.06, 0.8]} r={0.02} m={lacquer("cabinet-top", P.cream)} position={[0, 0.95, -7.62]} />
      {WALL_SLOTS.map((x, k) => (
        <group key={x}>
          <Block size={[1.55, 0.6, 0.06]} r={0.02} m={lacquer(`bin-${k % 2}`, k % 2 ? P.tangerine : P.coral)} position={[x, 0.18, -7.22]} />
          <Block size={[1.55, 0.06, 0.18]} r={0.02} m={lacquer("ledge", P.cream)} position={[x, WALL_SLEEVE_Y - SLEEVE / 2 - 0.08, -7.86]} />
          <Spot x={x} />
          <mesh geometry={plane(1.6, 1.1)} material={pool("#ffd9a0")} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.962, -7.55]} />
        </group>
      ))}
      <Spines x0={-5.3} x1={5.3} z={-7.6} y={0.6} n={120} />
      {wall.map((slug, k) => (
        <Sleeve key={slug} id={`record-${slug}`} slug={slug} title={titles[slug] ?? slug} x={WALL_SLOTS[k]} y={WALL_SLEEVE_Y} z={-7.82} invalidate={invalidate} />
      ))}

      {/* the browse crate */}
      <group position={[0, 0, -3.5]} {...handles("crate")}>
        {[-1.4, 1.4].map((x) => [-0.5, 0.5].map((z) => <mesh key={`${x}${z}`} geometry={cyl(0.05, 0.05, 0.3, 8)} material={lacquer("chrome", P.chrome)} position={[x, 0.15, z]} />))}
        <Block size={[3.3, 0.55, 1.25]} r={0.05} m={lacquer("crate", "#d9a066")} position={[0, 0.3, 0]} />
        <Block size={[3.1, 0.05, 1.05]} r={0.02} m={mat("crate-in", { color: "#7b4a2a" })} position={[0, 0.82, 0]} cast={false} />
        <mesh geometry={plane(1.25, 0.43)} position={[0, 0.58, 0.63]}>
          <meshStandardMaterial map={crateCard} roughness={0.6} />
        </mesh>
        <group ref={crateRef} position={[0, 0.84, 0]}>
          {crate.map((slug, k) => (
            <group key={slug} position={[-0.95 + k * 0.95, 0, 0.32 - k * 0.04]} rotation={[-0.22, 0, (k - 1) * 0.05]}>
              <Sleeve id={`crate-${slug}`} slug={slug} title={titles[slug] ?? slug} x={0} y={0.45} z={0} size={0.9} invalidate={invalidate} use="crate" />
            </group>
          ))}
        </group>
        <Spines x0={-1.5} x1={1.5} z={-0.25} y={0.55} n={34} seed={4} />
      </group>

      <Kiosk />
    </group>
  );
}

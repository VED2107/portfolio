"use client";
/**
 * 05 — The Hall of Releases. A brass timeline of framed pressings, the awards on the
 * partition, and one gold record on a little lacquered pedestal.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { sleeveOf } from "@/lib/covers";
import { sim } from "../runtime";
import { Block, cyl, plane, torus } from "./shapes";
import { PALETTE as P, discLabel, lacquer, lettering, mat } from "./paint";
import { ease, handles, wants } from "./attention";

type Release = { when: string; title: string; slug?: string };
type Honor = { title: string; by: string; when: string; photo?: string };

function Timeline({ releases }: { releases: Release[] }) {
  const frames = useRef<THREE.Group>(null);
  const ticks = useRef<THREE.InstancedMesh>(null);
  const a = useRef(0);
  const face = mat("release-frame", { color: P.cream, emissive: P.butter, emissiveIntensity: 0, roughness: 0.4 });
  const labels = useMemo(() => releases.map((r, k) => ({
    disc: discLabel(r.slug ? sleeveOf(r.slug).label : k % 2 ? P.coral : P.butter, P.ink, String(k + 1).padStart(2, "0")),
    tag: lettering([
      { text: r.when, size: 34, color: P.walnut, font: "mono" },
      { text: r.title, size: Math.min(28, 690 / Math.max(1, r.title.length)), color: P.ink },
    ], { w: 512, h: 144, bg: P.paper, radius: 12 }),
  })), [releases]);
  const step = releases.length > 1 ? 6.8 / (releases.length - 1) : 0;
  const width = Math.min(0.55, releases.length > 1 ? step * 0.86 : 0.55);
  useEffect(() => {
    const m = ticks.current;
    if (!m) return;
    const o = new THREE.Object3D();
    releases.forEach((_, k) => {
      o.position.set(releases.length === 1 ? 10.1 : 6.7 + step * k, 0.03, -6.9);
      o.updateMatrix();
      m.setMatrixAt(k, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [releases, step]);
  useFrame((_, dt) => {
    a.current = ease(a.current, wants("releases"), 8, dt);
    if (frames.current) frames.current.position.y = a.current * 0.03;
    face.emissiveIntensity = a.current * 0.13;
  });
  return (
    <group {...handles("releases")}>
      <Block size={[7, 0.055, 0.055]} r={0.025} m={mat("timeline-brass", { color: "#d5ad57", metalness: 0.75, roughness: 0.3 })} position={[10.1, 1.22, -7.6]} />
      <group ref={frames}>
        {releases.map((r, k) => {
          const x = releases.length === 1 ? 10.1 : 6.7 + k * step, y = k % 2 ? 2.55 : 1.85;
          return (
            <group key={`${r.when}-${k}`}>
              <Block size={[0.018, y - 1.25, 0.018]} r={0.006} m={lacquer("timeline-stem", P.butter)} position={[x, 1.25, -7.69]} />
              <Block size={[width, 0.55, 0.085]} r={0.025} m={face} position={[x, y - 0.275, -7.62]} />
              <Block size={[width * 0.87, 0.48, 0.015]} r={0.01} m={lacquer("release-mount", P.walnut)} position={[x, y - 0.24, -7.57]} />
              <mesh geometry={cyl(width * 0.38, width * 0.38, 0.018, 40)} rotation={[Math.PI / 2, 0, 0]} position={[x, y, -7.55]}>
                <meshStandardMaterial map={labels[k].disc} roughness={0.3} metalness={0.15} />
              </mesh>
              <mesh geometry={plane(Math.min(0.59, width * 1.07), 0.17)} position={[x, 1.08, -7.55]}>
                <meshBasicMaterial map={labels[k].tag} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
      </group>
      {/* The painted route is flat enough to walk across. */}
      <Block size={[7, 0.008, 0.055]} r={0.003} m={lacquer("timeline-floor", P.butter)} position={[10.1, 0.016, -6.9]} cast={false} />
      <instancedMesh ref={ticks} args={[cyl(0.035, 0.035, 0.008, 12), lacquer("timeline-dot", P.tangerine), releases.length]} />
    </group>
  );
}

function Honors({ honors }: { honors: Honor[] }) {
  const root = useRef<THREE.Group>(null);
  const a = useRef(0);
  const tags = useMemo(() => honors.map((h) => lettering([
    { text: h.title, size: Math.min(34, 730 / Math.max(1, h.title.length)), color: P.cream },
    { text: h.by, size: Math.min(26, 700 / Math.max(1, h.by.length)), color: P.butter, font: "text" },
    { text: h.when, size: 25, color: P.paper, font: "mono" },
  ], { w: 512, h: 180 })), [honors]);
  // Real photos from the event, where there is one: framed above the name plate instead of a medal.
  const photos = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return honors.map((h) => {
      if (!h.photo) return null;
      const t = loader.load(h.photo);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    });
  }, [honors]);
  useEffect(() => () => photos.forEach((t) => t?.dispose()), [photos]);
  const step = honors.length > 1 ? 2 / (honors.length - 1) : 0;
  const width = Math.min(0.57, honors.length > 1 ? step * 0.9 : 0.57);
  useFrame((_, dt) => {
    a.current = ease(a.current, wants("honors"), 8, dt);
    if (root.current) root.current.position.x = 6.15 + a.current * 0.015;
  });
  return (
    <group ref={root} position={[6.15, 0, 0]} rotation={[0, Math.PI / 2, 0]} {...handles("honors")}>
      {honors.map((h, k) => (
        <group key={`${h.title}-${k}`} position={[honors.length === 1 ? 6.3 : 7.3 - k * step, 1.6, 0]}>
          <Block size={[width, 0.9, 0.065]} r={0.035} m={lacquer("honor-board", P.walnut)} position={[0, -0.45, 0]} />
          {photos[k] ? (
            <group position={[0, 0.2, 0.04]}>
              <Block size={[width * 0.98, width * 0.78, 0.03]} r={0.01} m={lacquer("photo-mat", "#fffdf7")} position={[0, -width * 0.39, 0]} cast={false} />
              <mesh geometry={plane(width * 0.86, width * 0.66)} position={[0, 0, 0.032]}>
                <meshStandardMaterial map={photos[k]} roughness={0.55} />
              </mesh>
            </group>
          ) : (
            <mesh geometry={cyl(width * 0.34, width * 0.34, 0.025, 40)} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.15, 0.05]} material={mat(`honor-metal-${k}`, { color: ["#e9b949", "#dfe3ea", "#c0c6d0", "#c0c6d0"][Math.min(k, 3)], metalness: 0.8, roughness: 0.25 })} />
          )}
          <mesh geometry={plane(width * 0.9, 0.25)} position={[0, -0.22, 0.035]}>
            <meshBasicMaterial map={tags[k]} transparent toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Releases({ releases, honors }: { releases: Release[]; honors: Honor[] }) {
  const record = useRef<THREE.Group>(null);
  const plate = useMemo(() => lettering([{ text: "1st Rank · Research Conclave 2026", size: 30, color: P.walnut }], { w: 768, h: 100, bg: P.paper, radius: 10 }), []);
  useFrame((_, dt) => {
    if (record.current && !sim.calm) record.current.rotation.y += dt * 0.18;
  });
  const gold = mat("trophy-gold", { color: "#e9b949", metalness: 0.8, roughness: 0.25 });
  return (
    <group>
      <Timeline releases={releases} />
      <Honors honors={honors} />
      <group position={[12.2, 0, -2.8]}>
        <Block size={[1.12, 0.15, 1.12]} r={0.06} m={lacquer("plinth-foot", P.walnut)} />
        <Block size={[0.96, 0.9, 0.96]} r={0.07} m={lacquer("plinth-cream", P.cream)} position={[0, 0.15, 0]} />
        <Block size={[1.04, 0.11, 1.04]} r={0.04} m={lacquer("plinth-band", P.tangerine)} position={[0, 0.87, 0]} />
        <Block size={[1.12, 0.1, 1.12]} r={0.05} m={lacquer("plinth-cream", P.cream)} position={[0, 1.02, 0]} />
        <Block size={[0.38, 0.1, 0.35]} m={gold} position={[0, 1.12, 0]} />
        <group ref={record} position={[0, 1.68, 0]}>
          <mesh geometry={cyl(0.48, 0.48, 0.055, 48)} rotation={[Math.PI / 2, 0, 0]} material={gold} castShadow />
          {[0.24, 0.34, 0.43].map((r) => <mesh key={r} geometry={torus(r, 0.004)} material={gold} position={[0, 0, 0.03]} />)}
          <mesh geometry={cyl(0.13, 0.13, 0.06, 24)} rotation={[Math.PI / 2, 0, 0]} material={lacquer("trophy-label", P.cream)} />
        </group>
        <mesh geometry={plane(0.88, 0.13)} position={[0, 0.57, 0.486]}>
          <meshBasicMaterial map={plate} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

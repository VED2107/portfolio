"use client";
/**
 * 03 — The Listening Lounge. Soft seats, an album to leaf through, and a gold pressing
 * quietly turning on the console. Pull the lamp cord to stay after hours.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { sim } from "../runtime";
import { world } from "../state";
import { Block, cyl, dome, plane, sphere, torus } from "./shapes";
import { PALETTE as P, lacquer, lettering, mat, pool } from "./paint";
import { ease, handles, wants } from "./attention";

function AlbumTable() {
  const cover = useRef<THREE.Group>(null);
  const a = useRef(0);
  const title = useMemo(() => lettering([{ text: "VED · ALBUM", size: 46, color: P.butter, track: 2 }], { w: 512, h: 512, bg: P.midnight, radius: 24, border: P.butter }), []);
  const pages = useMemo(() => lettering([
    { text: "A SIDE / LIFE", size: 30, color: P.walnut, font: "mono" },
    { text: "places · people · records", size: 22, color: P.teal, font: "text" },
  ], { w: 512, h: 512, bg: P.paper, border: P.coral, radius: 12 }), []);
  useFrame((_, dt) => {
    a.current = ease(a.current, wants("lounge"), 8, dt);
    if (cover.current) cover.current.rotation.z = a.current * 0.32;
  });
  return (
    <group position={[10.3, 0, 3.95]} {...handles("lounge")}>
      <mesh geometry={cyl(0.29, 0.36, 0.06)} material={lacquer("coffee-foot", P.walnut)} position={[0, 0.03, 0]} castShadow />
      <mesh geometry={cyl(0.12, 0.18, 0.5)} material={lacquer("coffee-stem", P.walnut)} position={[0, 0.28, 0]} castShadow />
      <mesh geometry={cyl(0.57, 0.55, 0.1, 48)} material={lacquer("coffee-top", P.walnut)} position={[0, 0.57, 0]} castShadow receiveShadow />
      <group position={[-0.28, 0.62, -0.03]}>
        <Block size={[0.46, 0.025, 0.48]} r={0.012} m={lacquer("album-spine", P.midnight)} position={[0.23, 0, 0]} />
        <Block size={[0.43, 0.045, 0.45]} r={0.008} m={mat("album-pages", { color: P.paper, roughness: 0.95 })} position={[0.23, 0.025, 0]} />
        <mesh geometry={plane(0.42, 0.44)} rotation={[-Math.PI / 2, 0, 0]} position={[0.23, 0.071, 0]}>
          <meshBasicMaterial map={pages} toneMapped={false} />
        </mesh>
        <group ref={cover} position={[0, 0.075, 0]}>
          <Block size={[0.46, 0.018, 0.48]} r={0.008} m={lacquer("album-spine", P.midnight)} position={[0.23, 0, 0]} />
          <mesh geometry={plane(0.44, 0.46)} rotation={[-Math.PI / 2, 0, 0]} position={[0.23, 0.019, 0]}>
            <meshBasicMaterial map={title} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <mesh geometry={cyl(0.085, 0.07, 0.16)} material={lacquer("lounge-mug", P.coral)} position={[0.32, 0.7, 0.2]} castShadow />
      <mesh geometry={cyl(0.072, 0.072, 0.005)} material={mat("lounge-coffee", { color: "#392217", roughness: 0.35 })} position={[0.32, 0.782, 0.2]} />
      <mesh geometry={torus(0.05, 0.014)} material={lacquer("lounge-mug", P.coral)} position={[0.42, 0.71, 0.2]} />
    </group>
  );
}

function Lamp() {
  const cord = useRef<THREE.Group>(null);
  const a = useRef(0);
  const shade = mat("lounge-lamp-shade", { color: P.butter, roughness: 0.45, emissive: "#ffcf8a", emissiveIntensity: 0.25 });
  const light = pool("#ffcf8a");
  useFrame(({ clock }, dt) => {
    a.current = ease(a.current, wants("lamp"), 8, dt);
    shade.emissiveIntensity = (world.get().lights ? 0.25 : 1.15) + a.current * 0.12;
    light.opacity = world.get().lights ? 0.12 : 0.6;
    if (cord.current) {
      cord.current.rotation.z = sim.calm ? 0 : Math.sin(clock.elapsedTime * 9) * sim.yank * 0.5;
      cord.current.position.y = 1.91 - a.current * 0.015;
    }
  });
  return (
    <group position={[12.9, 0, 1.2]} {...handles("lamp")}>
      <mesh geometry={plane(0.49, 0.49)} material={light} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} />
      <mesh geometry={cyl(0.21, 0.23, 0.065)} material={lacquer("lamp-base", P.tealDeep)} position={[0, 0.033, 0]} castShadow />
      <mesh geometry={cyl(0.025, 0.035, 1.92, 16)} material={mat("lamp-brass", { color: "#d5ad57", metalness: 0.7, roughness: 0.3 })} position={[0, 1.02, 0]} />
      <mesh geometry={dome(0.23)} material={shade} position={[0, 2, 0]} castShadow />
      <mesh geometry={cyl(0.215, 0.215, 0.012)} material={mat("lamp-diffuser", { color: P.cream, emissive: "#ffcf8a", emissiveIntensity: 0.8 })} position={[0, 1.998, 0]} />
      <group ref={cord} position={[-0.06, 1.91, 0.1]}>
        <mesh geometry={cyl(0.006, 0.006, 0.26, 8)} material={mat("lamp-string", { color: P.paper })} position={[0, -0.13, 0]} />
        <mesh geometry={sphere(0.025, 12, 8)} material={lacquer("lamp-bead", P.tangerine)} position={[0, -0.27, 0]} />
      </group>
    </group>
  );
}

function Speaker({ x }: { x: number }) {
  const cone = useRef<THREE.Group>(null);
  useFrame(() => {
    if (cone.current) cone.current.scale.setScalar(1 + (sim.calm ? 0 : sim.level * 0.18));
  });
  return (
    <group position={[x, 0.77, 7.3]} rotation={[0, Math.PI, 0]}>
      <Block size={[0.36, 0.53, 0.36]} r={0.035} m={lacquer("lounge-speaker", P.walnut)} />
      <mesh geometry={cyl(0.13, 0.13, 0.015)} material={mat("lounge-grille", { color: P.midnight, roughness: 0.95 })} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.19, 0.185]} />
      <group ref={cone} position={[0, 0.19, 0.198]}>
        <mesh geometry={sphere(0.09, 16, 10)} material={mat("lounge-cone", { color: P.paper, roughness: 0.9 })} scale={[1, 1, 0.3]} />
      </group>
      <mesh geometry={cyl(0.045, 0.045, 0.02, 16)} material={lacquer("lounge-tweeter", P.butter)} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.41, 0.185]} />
    </group>
  );
}

function Console() {
  const record = useRef<THREE.Group>(null);
  const a = useRef(0);
  const gold = mat("secret-gold", { color: "#e9b949", metalness: 0.8, roughness: 0.25, emissive: "#e9b949", emissiveIntensity: 0 });
  useFrame((_, dt) => {
    a.current = ease(a.current, wants("secret"), 8, dt);
    gold.emissiveIntensity = a.current * 0.16;
    if (record.current) {
      record.current.position.y = 0.942 + a.current * 0.035;
      if (!sim.calm) record.current.rotation.y += dt * (100 / 3) * Math.PI * 2 / 60;
    }
  });
  return (
    <group {...handles("secret")}>
      <Block size={[2.04, 0.53, 0.84]} r={0.055} m={lacquer("console-walnut", P.walnut)} position={[8.05, 0.2, 7.3]} />
      <Block size={[2.1, 0.04, 0.9]} r={0.02} m={lacquer("console-top", P.woodDark)} position={[8.05, 0.73, 7.3]} />
      {[7.55, 8.55].map((x) => <Block key={x} size={[0.91, 0.39, 0.025]} r={0.02} m={lacquer("console-door", P.woodDark)} position={[x, 0.27, 6.865]} />)}
      {[7.94, 8.16].map((x) => <mesh key={x} geometry={sphere(0.025, 10, 6)} material={lacquer("console-knob", P.butter)} position={[x, 0.49, 6.875]} />)}
      <Speaker x={7.25} />
      <Speaker x={8.85} />
      <Block size={[1.05, 0.11, 0.7]} r={0.04} m={lacquer("lounge-turntable", P.cream)} position={[8.05, 0.77, 7.3]} />
      <mesh geometry={cyl(0.285, 0.285, 0.045, 40)} material={lacquer("lounge-platter", P.midnight)} position={[7.95, 0.903, 7.3]} />
      <group ref={record} position={[7.95, 0.942, 7.3]}>
        <mesh geometry={cyl(0.27, 0.27, 0.018, 48)} material={gold} castShadow />
        <mesh geometry={cyl(0.085, 0.085, 0.022, 24)} material={lacquer("secret-label", P.raspberry)} />
        <mesh geometry={sphere(0.014, 10, 6)} material={lacquer("secret-mark", P.cream)} position={[0.04, 0.015, 0]} scale={[1, 0.2, 1]} />
        <mesh geometry={cyl(0.009, 0.009, 0.04, 10)} material={gold} position={[0, 0.02, 0]} />
      </group>
      <group position={[8.43, 0.9, 7.48]}>
        <mesh geometry={cyl(0.045, 0.05, 0.08, 16)} material={lacquer("tonearm-pivot", P.midnight)} position={[0, 0.04, 0]} />
        <Block size={[0.025, 0.025, 0.37]} r={0.01} m={mat("lounge-tonearm", { color: P.chrome, metalness: 0.8, roughness: 0.25 })} position={[-0.06, 0.075, -0.14]} rotation={[0, 0.32, 0]} />
        <Block size={[0.06, 0.035, 0.09]} r={0.01} m={lacquer("tonearm-head", P.coral)} position={[-0.12, 0.06, -0.3]} />
      </group>
    </group>
  );
}

export function Lounge() {
  const legs = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const o = new THREE.Object3D();
    const points = [[12.87, 2.12], [13.67, 2.12], [12.87, 5.48], [13.67, 5.48], [7.48, 1.55], [8.03, 1.55], [7.48, 2.44], [8.03, 2.44], [7.16, 6.99], [8.94, 6.99], [7.16, 7.61], [8.94, 7.61]];
    points.forEach(([x, z], k) => {
      o.position.set(x, 0.1, z);
      o.updateMatrix();
      legs.current?.setMatrixAt(k, o.matrix);
    });
    if (legs.current) legs.current.instanceMatrix.needsUpdate = true;
  }, []);
  const teal = mat("lounge-fabric", { color: P.teal, roughness: 0.98 });
  const orange = mat("armchair-fabric", { color: P.tangerine, roughness: 0.95 });
  return (
    <group>
      <instancedMesh ref={legs} args={[cyl(0.045, 0.06, 0.2, 12), lacquer("lounge-feet", P.cream), 12]} castShadow />
      {/* The long sofa looks across the room, toward -x. */}
      <Block size={[1.1, 0.32, 3.74]} r={0.14} m={teal} position={[13.275, 0.2, 3.8]} />
      <Block size={[0.25, 0.8, 3.74]} r={0.12} m={teal} position={[13.7, 0.38, 3.8]} />
      {[2.08, 5.52].map((z) => <Block key={z} size={[1.1, 0.5, 0.3]} r={0.13} m={teal} position={[13.275, 0.38, z]} />)}
      {[2.7, 3.8, 4.9].map((z) => <Block key={z} size={[0.83, 0.16, 1.03]} r={0.08} m={teal} position={[13.16, 0.52, z]} />)}
      {[2.75, 4.85].map((z, k) => <Block key={z} size={[0.24, 0.43, 0.57]} r={0.1} m={mat(`lounge-cushion-${k}`, { color: k ? P.coral : P.butter, roughness: 0.98 })} position={[13.38, 0.67, z]} rotation={[0, 0, -0.12]} />)}
      <group position={[7.77, 0, 2]}>
        <Block size={[0.8, 0.32, 1.16]} r={0.12} m={orange} position={[0, 0.2, 0]} />
        <Block size={[0.8, 0.7, 0.23]} r={0.1} m={orange} position={[0, 0.38, -0.46]} />
        {[-0.32, 0.32].map((x) => <Block key={x} size={[0.16, 0.38, 1.12]} r={0.07} m={orange} position={[x, 0.38, 0]} />)}
        <Block size={[0.46, 0.13, 0.78]} r={0.06} m={mat("chair-pad", { color: P.butter, roughness: 0.95 })} position={[0, 0.53, 0.09]} />
      </group>
      {/* The side table shares the armchair's collision rectangle. */}
      <group position={[8.36, 0, 2.15]}>
        <mesh geometry={cyl(0.04, 0.08, 0.4, 12)} material={lacquer("side-stem", P.walnut)} position={[0, 0.2, 0]} />
        <mesh geometry={cyl(0.18, 0.18, 0.04)} material={lacquer("side-top", P.walnut)} position={[0, 0.42, 0]} />
        {[P.violet, P.coral, P.teal].map((c, k) => <Block key={c} size={[0.25, 0.025, 0.25]} r={0.006} m={lacquer(`side-record-${k}`, c)} position={[0, 0.44 + k * 0.025, 0]} rotation={[0, k * 0.09, 0]} />)}
      </group>
      <AlbumTable />
      <Lamp />
      <Console />
      <group position={[13.55, 0, 6.95]}>
        <mesh geometry={cyl(0.28, 0.2, 0.43)} material={mat("lounge-pot", { color: "#cf704b", roughness: 0.85 })} position={[0, 0.215, 0]} castShadow />
        <mesh geometry={cyl(0.26, 0.26, 0.015)} material={mat("plant-soil", { color: P.walnut })} position={[0, 0.43, 0]} />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <group key={k} rotation={[0, k * Math.PI / 3, 0]}>
            <mesh geometry={sphere(0.1, 16, 10)} material={mat(`plant-leaf-${k % 2}`, { color: k % 2 ? "#397b4f" : "#67a65b", roughness: 0.85 })} position={[0.12, 0.75 + k % 2 * 0.12, 0]} scale={[1.1, 3.7, 0.7]} rotation={[0, 0, -0.3]} castShadow />
          </group>
        ))}
      </group>
    </group>
  );
}

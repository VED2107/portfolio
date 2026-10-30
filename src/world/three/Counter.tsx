"use client";
/**
 * 06 — The Checkout Counter. Coral lacquer, tiny tapes, a friendly old till and a
 * receipt that offers a little more paper when someone comes to talk.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Block, cyl, dome, plane, rbox, torus } from "./shapes";
import { PALETTE as P, lacquer, lettering, mat } from "./paint";
import { ease, handles, wants } from "./attention";

function Tapes() {
  const tapes = useRef<THREE.InstancedMesh>(null);
  const labels = useRef<THREE.InstancedMesh>(null);
  const reels = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const o = new THREE.Object3D(), col = new THREE.Color();
    for (let k = 0; k < 6; k++) {
      const x = -0.4 + k * 0.16;
      o.position.set(x, 0.13, 0);
      o.updateMatrix();
      tapes.current?.setMatrixAt(k, o.matrix);
      tapes.current?.setColorAt(k, col.set([P.tangerine, P.teal, P.violet, P.coral, P.butter, P.raspberry][k]));
      o.position.set(x, 0.15, 0.043);
      o.updateMatrix();
      labels.current?.setMatrixAt(k, o.matrix);
      for (let j = 0; j < 2; j++) {
        o.position.set(x - 0.028 + j * 0.056, 0.14, 0.052);
        o.rotation.x = Math.PI / 2;
        o.updateMatrix();
        reels.current?.setMatrixAt(k * 2 + j, o.matrix);
        o.rotation.x = 0;
      }
    }
    for (const m of [tapes.current, labels.current, reels.current]) {
      if (m) m.instanceMatrix.needsUpdate = true;
      if (m?.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }, []);
  return (
    <group position={[2.75, 1.13, 3.16]}>
      <Block size={[1.04, 0.055, 0.28]} r={0.015} m={lacquer("tape-tray", P.walnut)} />
      <instancedMesh ref={tapes} args={[rbox(0.14, 0.19, 0.075, 0.015), mat("tape-shell", { color: "#ffffff", roughness: 0.4 }), 6]} castShadow />
      <instancedMesh ref={labels} args={[rbox(0.115, 0.09, 0.012, 0.005), mat("tape-label", { color: P.paper }), 6]} />
      <instancedMesh ref={reels} args={[cyl(0.018, 0.018, 0.012, 10), lacquer("tape-reel", P.midnight), 12]} />
    </group>
  );
}

function Register() {
  const keys = useRef<THREE.InstancedMesh>(null);
  const receipt = useRef<THREE.Group>(null);
  const a = useRef(0);
  const curl = useMemo(() => new THREE.CylinderGeometry(0.065, 0.065, 0.2, 24, 1, true, 0, Math.PI), []);
  useEffect(() => () => curl.dispose(), [curl]);
  const hello = useMemo(() => lettering([{ text: "HELLO", size: 60, color: P.butter, font: "mono", track: 8 }], { w: 384, h: 112, bg: P.midnight, radius: 16 }), []);
  const paper = useMemo(() => lettering([
    { text: "RECORDVERSE", size: 24, color: P.ink, font: "mono" },
    { text: "1 × good conversation", size: 16, color: P.walnut, font: "mono" },
    { text: "--------------------", size: 16, color: P.walnut, font: "mono" },
    { text: "THANK YOU", size: 24, color: P.ink, font: "mono" },
  ], { w: 256, h: 384, bg: P.paper }), []);
  useEffect(() => {
    const o = new THREE.Object3D(), c = new THREE.Color();
    for (let k = 0; k < 15; k++) {
      o.position.set(-0.24 + k % 5 * 0.12, 0, -0.1 + Math.floor(k / 5) * 0.1);
      o.updateMatrix();
      keys.current?.setMatrixAt(k, o.matrix);
      keys.current?.setColorAt(k, c.set(k === 14 ? P.coral : k % 5 === 4 ? P.butter : P.cream));
    }
    if (keys.current) keys.current.instanceMatrix.needsUpdate = true;
    if (keys.current?.instanceColor) keys.current.instanceColor.needsUpdate = true;
  }, []);
  useFrame((_, dt) => {
    a.current = ease(a.current, wants("counter"), 8, dt);
    if (receipt.current) receipt.current.scale.y = 1 + a.current * 0.8;
  });
  return (
    <group position={[4.55, 1.13, 2.99]}>
      <Block size={[0.98, 0.16, 0.65]} r={0.05} m={lacquer("till-base", P.midnight)} />
      <Block size={[0.87, 0.35, 0.52]} r={0.06} m={lacquer("till-body", P.teal)} position={[0, 0.16, -0.025]} />
      <Block size={[0.25, 0.025, 0.025]} r={0.01} m={lacquer("till-handle", P.chrome)} position={[0, 0.07, 0.333]} />
      <group position={[0, 0.44, 0.12]} rotation={[0.28, 0, 0]}>
        <Block size={[0.76, 0.055, 0.37]} r={0.025} m={lacquer("till-bank", P.walnut)} position={[0, -0.055, 0]} />
        <instancedMesh ref={keys} args={[rbox(0.085, 0.045, 0.065, 0.015), mat("till-key", { color: "#ffffff", roughness: 0.4 }), 15]} castShadow />
      </group>
      <Block size={[0.055, 0.27, 0.055]} m={lacquer("till-stem", P.chrome)} position={[0.18, 0.49, -0.19]} />
      <Block size={[0.55, 0.22, 0.075]} r={0.03} m={lacquer("till-body", P.teal)} position={[0.18, 0.7, -0.19]} />
      <mesh geometry={plane(0.47, 0.14)} position={[0.18, 0.81, -0.149]}>
        <meshBasicMaterial map={hello} toneMapped={false} />
      </mesh>
      <Block size={[0.28, 0.025, 0.075]} r={0.01} m={lacquer("receipt-slot", P.midnight)} position={[-0.25, 0.5, -0.16]} />
      <group ref={receipt} position={[-0.25, 0.52, -0.16]}>
        <mesh geometry={plane(0.2, 0.29)} position={[0, 0.145, 0]} rotation={[-0.12, 0, 0]}>
          <meshStandardMaterial map={paper} side={THREE.DoubleSide} roughness={0.95} />
        </mesh>
        <mesh geometry={curl} rotation={[0, 0, Math.PI / 2]} position={[0, 0.288, -0.1]}>
          <meshStandardMaterial map={paper} side={THREE.DoubleSide} roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}

export function Counter() {
  const bell = useRef<THREE.Group>(null);
  const a = useRef(0);
  const sign = useMemo(() => lettering([
    { text: "OPEN TO WORK", size: 44, color: P.butter, track: 2 },
    { text: "ask inside", size: 36, color: P.cream, font: "text" },
  ], { w: 512, h: 240, bg: "#23443e", radius: 12 }), []);
  useFrame((_, dt) => {
    a.current = ease(a.current, wants("counter"), 8, dt);
    if (bell.current) bell.current.position.y = 1.13 + a.current * 0.015;
  });
  const brass = mat("bell-brass", { color: "#e9b949", metalness: 0.8, roughness: 0.24 });
  return (
    <group>
      <group {...handles("counter")}>
        <Block size={[3.08, 0.13, 0.8]} r={0.025} m={lacquer("counter-kick", P.walnut)} position={[3.7, 0, 3]} />
        <Block size={[3.08, 0.9, 0.8]} r={0.07} m={lacquer("counter-front", P.coral)} position={[3.7, 0.13, 3]} />
        <Block size={[3.2, 0.1, 0.9]} r={0.045} m={lacquer("counter-top", P.cream)} position={[3.7, 1.03, 3]} />
        <Block size={[2.88, 0.025, 0.018]} r={0.008} m={lacquer("counter-trim", P.butter)} position={[3.7, 0.85, 3.408]} />
        <Tapes />
        <Register />
        <group ref={bell} position={[3.72, 1.13, 3.2]}>
          <mesh geometry={cyl(0.14, 0.16, 0.035)} material={lacquer("bell-foot", P.midnight)} position={[0, 0.018, 0]} />
          <mesh geometry={dome(0.12)} material={brass} position={[0, 0.035, 0]} castShadow />
          <mesh geometry={cyl(0.025, 0.018, 0.055, 12)} material={brass} position={[0, 0.17, 0]} />
        </group>
        {/* A standing chalkboard stays on the top, clear of the visitor's path. */}
        <group position={[2.78, 1.13, 2.77]}>
          <Block size={[0.77, 0.035, 0.26]} r={0.015} m={lacquer("chalk-frame", P.walnut)} />
          <Block size={[0.75, 0.47, 0.055]} r={0.025} m={lacquer("chalk-frame", P.walnut)} position={[0, 0.035, 0]} />
          <mesh geometry={plane(0.67, 0.37)} position={[0, 0.27, 0.03]}>
            <meshBasicMaterial map={sign} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <group position={[6, 0, 2.95]}>
        <mesh geometry={cyl(0.24, 0.24, 0.1)} material={lacquer("counter-seat", P.tangerine)} position={[0, 0.65, 0]} castShadow />
        <mesh geometry={cyl(0.035, 0.045, 0.6, 12)} material={lacquer("counter-stool-pole", P.chrome)} position={[0, 0.3, 0]} />
        <mesh geometry={cyl(0.23, 0.24, 0.035)} material={lacquer("counter-stool-pole", P.chrome)} position={[0, 0.018, 0]} />
        <mesh geometry={torus(0.16, 0.018)} material={brass} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.23, 0]} />
      </group>
    </group>
  );
}

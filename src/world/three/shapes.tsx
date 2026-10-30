"use client";
/**
 * Small shape vocabulary for the store. Everything is a softened box, a rounded cylinder or a
 * lathe: the toy-like, slightly chunky silhouette the whole world shares. Geometries are cached
 * by their dimensions so repeated furniture costs one buffer.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ThreeElements } from "@react-three/fiber";

const geos = new Map<string, THREE.BufferGeometry>();

export function rbox(w: number, h: number, d: number, r = 0.04, seg = 2) {
  const key = `rb:${w}:${h}:${d}:${r}:${seg}`;
  let g = geos.get(key);
  if (!g) {
    g = new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2));
    geos.set(key, g);
  }
  return g;
}

export function cyl(rt: number, rb: number, h: number, seg = 24) {
  const key = `cy:${rt}:${rb}:${h}:${seg}`;
  let g = geos.get(key);
  if (!g) {
    g = new THREE.CylinderGeometry(rt, rb, h, seg);
    geos.set(key, g);
  }
  return g;
}

export function sphere(r: number, w = 20, h = 14) {
  const key = `sp:${r}:${w}:${h}`;
  let g = geos.get(key);
  if (!g) {
    g = new THREE.SphereGeometry(r, w, h);
    geos.set(key, g);
  }
  return g;
}

/** The top half of a sphere: a beanie, a lamp shade, a dome. */
export function dome(r: number, seg = 28) {
  const key = `do:${r}:${seg}`;
  let g = geos.get(key);
  if (!g) {
    g = new THREE.SphereGeometry(r, seg, Math.round(seg / 2), 0, Math.PI * 2, 0, Math.PI / 2);
    geos.set(key, g);
  }
  return g;
}

export function plane(w: number, h: number) {
  const key = `pl:${w}:${h}`;
  let g = geos.get(key);
  if (!g) {
    g = new THREE.PlaneGeometry(w, h);
    geos.set(key, g);
  }
  return g;
}

export function capsule(r: number, len: number) {
  const key = `ca:${r}:${len}`;
  let g = geos.get(key);
  if (!g) {
    g = new THREE.CapsuleGeometry(r, len, 6, 14);
    geos.set(key, g);
  }
  return g;
}

export function torus(r: number, tube: number, arc = Math.PI * 2) {
  const key = `to:${r}:${tube}:${arc}`;
  let g = geos.get(key);
  if (!g) {
    g = new THREE.TorusGeometry(r, tube, 10, 28, arc);
    geos.set(key, g);
  }
  return g;
}

export function lathe(key: string, pts: [number, number][], seg = 28) {
  let g = geos.get(`la:${key}`);
  if (!g) {
    g = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
    geos.set(`la:${key}`, g);
  }
  return g;
}

export function disposeShapes() {
  geos.forEach((g) => g.dispose());
  geos.clear();
}

type MeshProps = Omit<ThreeElements["mesh"], "geometry" | "material"> & { m: THREE.Material; cast?: boolean; receive?: boolean };

/** A rounded box sitting on its base: `y` is where its bottom is, not its centre. */
export function Block({ size, r = 0.04, m, cast = true, receive = true, position = [0, 0, 0], ...rest }: MeshProps & { size: [number, number, number]; r?: number; position?: [number, number, number] }) {
  const [w, h, d] = size;
  return <mesh geometry={rbox(w, h, d, r)} material={m} position={[position[0], position[1] + h / 2, position[2]]} castShadow={cast} receiveShadow={receive} {...rest} />;
}

/** A box from a floor-plan rectangle. */
export function Footprint({ box, y0 = 0, h, r = 0.03, m, cast = true }: { box: { x0: number; z0: number; x1: number; z1: number }; y0?: number; h: number; r?: number; m: THREE.Material; cast?: boolean }) {
  const w = box.x1 - box.x0, d = box.z1 - box.z0;
  return <mesh geometry={rbox(w, h, d, r)} material={m} position={[(box.x0 + box.x1) / 2, y0 + h / 2, (box.z0 + box.z1) / 2]} castShadow={cast} receiveShadow />;
}

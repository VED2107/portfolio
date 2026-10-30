"use client";

/** The street is scenery: no collision, interaction, or shared store resources are mutated. */
import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { rbox } from "./shapes";
import { PALETTE as P, lettering } from "./paint";
import { world } from "../state";
import { sim } from "../runtime";

type V = [number, number, number];
type Owned = { dispose(): void };
const HALF = Math.PI / 2;
const DAY = "#ffd2a6", NIGHT = "#3b2a5a";

const vertexShader = /* glsl */ `
varying vec3 vDirection;
void main() {
  vDirection = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const fragmentShader = /* glsl */ `
uniform float uNight;
uniform vec3 uDayHorizon;
uniform vec3 uDayMiddle;
uniform vec3 uDayTop;
uniform vec3 uNightHorizon;
uniform vec3 uNightTop;
varying vec3 vDirection;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec3 d = normalize(vDirection);
  float h = max(d.y, 0.0);
  vec3 day = mix(uDayHorizon, uDayMiddle, smoothstep(0.0, 0.43, h));
  day = mix(day, uDayTop, smoothstep(0.43, 1.0, h));
  vec3 night = mix(uNightHorizon, uNightTop, smoothstep(0.0, 0.85, h));
  vec2 uv = vec2(atan(d.z, d.x) / 6.2831853 + 0.5, asin(clamp(d.y, -1.0, 1.0)) / 3.1415927 + 0.5);
  vec2 grid = uv * vec2(420.0, 210.0);
  vec2 cell = floor(grid);
  float star = step(0.993, hash(cell)) * (1.0 - smoothstep(0.025, 0.15, length(fract(grid) - 0.5)));
  vec3 color = mix(day, night, uNight) + vec3(0.9, 0.84, 1.0) * star * uNight * smoothstep(0.04, 0.18, h);
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}`;

function makeExterior() {
  const root = new THREE.Group();
  root.name = "Recordverse · sunny town corner";
  const owned = new Set<Owned>();
  const own = <T extends Owned,>(item: T): T => { owned.add(item); return item; };
  let seed = 2731;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const transform = new THREE.Object3D();
  const color = new THREE.Color();

  // Local materials match paint.ts's lacquer recipe, but have independent lifetimes.
  const candy = own(new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.25 }));
  const matte = own(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86 }));
  const cream = own(new THREE.MeshPhysicalMaterial({ color: P.cream, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.25 }));
  const ink = own(new THREE.MeshPhysicalMaterial({ color: P.midnight, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.25 }));
  const butter = own(new THREE.MeshStandardMaterial({ color: P.butter, roughness: 0.85 }));
  const bulbs = own(new THREE.MeshStandardMaterial({ color: "#ffe7bc", emissive: "#ffcf8a", emissiveIntensity: 0.35, toneMapped: false, roughness: 0.25 }));
  const glass = own(new THREE.MeshStandardMaterial({ color: "#9fb6d6", emissive: "#ffcf8a", emissiveIntensity: 0, roughness: 0.3, toneMapped: false }));

  type Batch = { material: THREE.Material; cast: boolean; receive: boolean; parts: THREE.BufferGeometry[] };
  const batches = new Map<string, Batch>();
  function part(g: THREE.BufferGeometry, material: THREE.Material, at: V, scale: V = [1, 1, 1], rot: V = [0, 0, 0], tint?: string, cast = false, receive = false) {
    // A non-indexed vocabulary lets rounded boxes, tubes and spheres share one draw call.
    const p = g.index ? g.toNonIndexed() : g.clone();
    transform.position.set(...at); transform.scale.set(...scale); transform.rotation.set(...rot); transform.updateMatrix();
    p.applyMatrix4(transform.matrix);
    if (tint) {
      color.set(tint);
      const values = new Float32Array(p.getAttribute("position").count * 3);
      for (let i = 0; i < values.length; i += 3) { values[i] = color.r; values[i + 1] = color.g; values[i + 2] = color.b; }
      p.setAttribute("color", new THREE.BufferAttribute(values, 3));
    }
    const key = `${material.uuid}:${cast}:${receive}`;
    if (!batches.has(key)) batches.set(key, { material, cast, receive, parts: [] });
    batches.get(key)!.parts.push(p);
  }
  function box(size: V, at: V, material: THREE.Material = candy, tint?: string, rot: V = [0, 0, 0], cast = false) {
    // shapes.tsx owns the cached original; merging only consumes private copies.
    part(rbox(...size, Math.min(0.12, ...size.map((n) => n * 0.2))), material, at, [1, 1, 1], rot, tint, cast);
  }
  const ball = own(new THREE.SphereGeometry(1, 16, 12));
  const cylinder = own(new THREE.CylinderGeometry(1, 1, 1, 16));
  const quad = own(new THREE.PlaneGeometry(1, 1));
  function sphere(at: V, scale: V, tint: string, cast = false) { part(ball, candy, at, scale, [0, 0, (random() - 0.5) * 0.16], tint, cast); }
  function rod(a: V, b: V, radius: number, material: THREE.Material, tint?: string, cast = false) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const middle = start.clone().add(end).multiplyScalar(0.5);
    const rotation = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize()));
    part(cylinder, material, [middle.x, middle.y, middle.z], [radius, new THREE.Vector3(...a).distanceTo(new THREE.Vector3(...b)), radius], [rotation.x, rotation.y, rotation.z], tint, cast);
  }
  function texture(draw: (g: CanvasRenderingContext2D) => void) {
    const c = document.createElement("canvas"); c.width = c.height = 512;
    const g = c.getContext("2d");
    if (!g) throw new Error("Exterior requires a 2D canvas context");
    draw(g);
    const t = own(new THREE.CanvasTexture(c)); t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
    return t;
  }
  const paving = texture((g) => {
    g.fillStyle = "#aaa395"; g.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const v = Math.floor(random() * 15);
      g.fillStyle = `rgb(${218 + v},${211 + v},${194 + v})`;
      g.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
      g.fillStyle = "rgba(255,255,255,.19)"; g.fillRect(x * 64 + 2, y * 64 + 2, 60, 2);
    }
  });
  const asphalt = texture((g) => {
    g.fillStyle = "#3b3346"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 15000; i++) {
      g.fillStyle = random() > 0.5 ? "rgba(255,240,223,.07)" : "rgba(0,0,0,.1)";
      g.fillRect(random() * 512, random() * 512, 1, 1);
    }
  });
  const pavingMat = own(new THREE.MeshStandardMaterial({ map: paving, roughness: 0.9 }));
  const asphaltMat = own(new THREE.MeshStandardMaterial({ map: asphalt, roughness: 0.96 }));
  const groundMat = own(new THREE.MeshStandardMaterial({ color: "#4a3f5c", roughness: 1 }));
  function ground(x0: number, x1: number, z0: number, z1: number, y: number, material: THREE.Material, tile = 1) {
    const g = quad.clone();
    // World-aligned UVs preserve square pavers across the L without per-strip materials.
    const uv = g.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (x0 + uv.getX(i) * (x1 - x0)) / tile, (z0 + uv.getY(i) * (z1 - z0)) / tile);
    part(g, material, [(x0 + x1) / 2, y, (z0 + z1) / 2], [x1 - x0, z1 - z0, 1], [-HALF, 0, 0], undefined, false, true);
    g.dispose();
  }
  ground(-100, 100, -100, 100, -0.34, groundMat);
  ground(-18, 22, 8.6, 12.6, -0.12, pavingMat, 6.4);
  ground(14.6, 18.6, -14, 8.6, -0.12, pavingMat, 6.4);
  ground(-60, 60, 12.8, 26, -0.32, asphaltMat, 5);
  // Split the crossing rectangles so their intersection never z-fights.
  ground(18.8, 32, -60, 12.8, -0.32, asphaltMat, 5);
  ground(18.8, 32, 26, 60, -0.32, asphaltMat, 5);
  box([40.2, 0.2, 0.2], [2, -0.22, 12.7], cream);
  box([0.2, 0.2, 26.8], [18.7, -0.22, -0.6], cream);
  for (let z = 13.4; z < 26; z += 1.35) ground(2, 6, z, z + 0.65, -0.307, butter);
  for (let x = -57; x < 60; x += 6) if (x + 2.8 < 2 || x > 6) ground(x, x + 2.8, 19.2, 19.35, -0.306, butter);
  for (let z = -55; z < 60; z += 6) if (z < 11 || z > 27) ground(25.3, 25.45, z, z + 2.8, -0.306, butter);
  part(cylinder, matte, [11, -0.31, 16.2], [0.66, 0.025, 0.66], [0, 0, 0], "#686074");
  for (let i = -3; i <= 3; i++) box([0.85, 0.014, 0.025], [11, -0.291, 16.2 + i * 0.13], ink);

  // Seven neighbours; all near faces remain at least 0.6m outside the store walls.
  const buildings = [
    { x: -21, z: -18, w: 10, d: 9, h: 14, c: "#c9b8ff" },
    { x: -10.5, z: -13.5, w: 8, d: 8, h: 9, c: "#f5b5a3" },
    { x: -1.5, z: -13, w: 8, d: 7, h: 7, c: "#9fd8cf" },
    { x: 7.5, z: -13, w: 8, d: 7, h: 6, c: "#ffd88a" },
    { x: 16.5, z: -15, w: 8, d: 8, h: 8, c: "#8fc7e8" },
    { x: -19.5, z: -6, w: 8, d: 8, h: 10, c: "#f08fb2" },
    { x: -19.5, z: 3.5, w: 8, d: 9, h: 6.5, c: "#9fd8cf" },
  ];
  const windows: { at: V; rot: V }[] = [];
  buildings.forEach((b, index) => {
    box([b.w, b.h, b.d], [b.x, b.h / 2 - 0.3, b.z], candy, b.c);
    box([b.w + 0.2, 0.32, b.d + 0.2], [b.x, b.h - 0.2, b.z], cream);
    box([b.w + 0.1, 0.25, b.d + 0.1], [b.x, 0.05, b.z], cream);
    for (let y = 1.7; y < b.h - 1; y += 2.15) {
      for (let x = -b.w / 2 + 1.3; x < b.w / 2 - 0.6; x += 1.8) windows.push({ at: [b.x + x, y, b.z + b.d / 2 + 0.04], rot: [0, 0, 0] });
      for (let z = -b.d / 2 + 1.3; z < b.d / 2 - 0.6; z += 1.8) windows.push({ at: [b.x + b.w / 2 + 0.04, y, b.z + z], rot: [0, HALF, 0] });
    }
    for (let k = 0; k < 2; k++) {
      const x = b.x - b.w / 2 + 1.6 + k * 3.3, z = b.z + b.d / 2 + 0.3;
      box([1.1, 0.55, 0.48], [x, 1 + k * 2.15, z], cream);
      for (let s = 0; s < 4; s++) box([0.78, 0.035, 0.04], [x, 0.85 + k * 2.15 + s * 0.09, z + 0.25], ink);
    }
    // Painted eyebrow awnings and deep entrance doors give the blocks a street address.
    box([1.45, 1.6, 0.12], [b.x, 0.6, b.z + b.d / 2 + 0.06], candy, P.midnight);
    box([2.1, 0.18, 0.85], [b.x, 1.65, b.z + b.d / 2 + 0.35], candy, index % 2 ? P.tangerine : P.teal);
    if (index === 0 || index === 4) {
      const y = b.h + 0.65;
      for (const dx of [-0.55, 0.55]) rod([b.x + dx, b.h, b.z], [b.x + dx, y, b.z], 0.06, ink);
      part(cylinder, candy, [b.x, y + 0.65, b.z], [0.95, 1.3, 0.95], [0, 0, 0], P.midnight);
      sphere([b.x, y + 1.3, b.z], [0.98, 0.17, 0.98], P.midnight);
      for (let k = 0; k < 3; k++) part(cylinder, cream, [b.x, y + 0.23 + k * 0.35, b.z], [0.96, 0.045, 0.96]);
    }
  });
  // Two instanced draw calls for every frame and pane, regardless of time of day.
  function windowInstances(panes: boolean) {
    const g = own(rbox(panes ? 0.83 : 1.1, panes ? 1.03 : 1.3, panes ? 0.045 : 0.12, 0.07).clone());
    const mesh = own(new THREE.InstancedMesh(g, panes ? glass : cream, windows.length));
    windows.forEach((p, i) => {
      transform.position.set(...p.at); transform.rotation.set(...p.rot); transform.scale.set(1, 1, 1);
      if (panes) transform.position.add(new THREE.Vector3(0, 0, 0.085).applyEuler(transform.rotation));
      transform.updateMatrix(); mesh.setMatrixAt(i, transform.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); root.add(mesh);
  }
  windowInstances(false); windowInstances(true);

  // A sagging rooftop washing-line of festival pennants, each colour in the lacquer batch.
  const flagPoints = Array.from({ length: 25 }, (_, i) => new THREE.Vector3(-14 + i / 24 * 7, 9.8 - Math.sin(i / 24 * Math.PI) * 0.55, -12));
  const wire = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(flagPoints), 32, 0.025, 6, false);
  part(wire, ink, [0, 0, 0]); wire.dispose();
  for (const x of [-14, -7]) rod([x, 9, -12], [x, 10, -12], 0.045, ink);
  for (let i = 0; i < 12; i++) {
    const x = -13.8 + i * 0.59, y = 9.8 - Math.sin((x + 14) / 7 * Math.PI) * 0.55;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0.45, 0, 0, 0.22, -0.65, 0, 0.45, 0, 0, 0, 0, 0, 0.22, -0.65, 0], 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 1, 1, 1, 0.5, 0, 1, 1, 0, 1, 0.5, 0], 2)); g.computeVertexNormals();
    part(g, candy, [x, y, -12], [1, 1, 1], [0, 0, 0], [P.tangerine, P.butter, P.teal, P.raspberry][i % 4]); g.dispose();
  }

  // Curved swan-neck street lamps. Only these and the trees enter shadow passes.
  for (const [x, z] of [[-6, 11.5], [9, 11.5], [17.5, -2]]) {
    box([0.42, 0.2, 0.42], [x, -0.02, z], ink, undefined, [0, 0, 0], true);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 3.7, z),
      new THREE.Vector3(x + 0.2, 4.35, z), new THREE.Vector3(x + 0.85, 4.45, z), new THREE.Vector3(x + 1.02, 4.12, z),
    ]);
    const tube = new THREE.TubeGeometry(curve, 28, 0.065, 8, false);
    part(tube, ink, [0, 0, 0], [1, 1, 1], [0, 0, 0], undefined, true); tube.dispose();
    part(ball, bulbs, [x + 1.02, 3.96, z], [0.26, 0.31, 0.26], [0, 0, 0], undefined, true);
  }
  for (const [x, z] of [[-12, 11], [-7.8, 11.2], [17, 6]]) {
    part(cylinder, candy, [x, 0.18, z], [0.67, 0.6, 0.67], [0, 0, 0], P.coral, true);
    part(cylinder, matte, [x, 0.49, z], [0.57, 0.03, 0.57], [0, 0, 0], P.walnut, true);
    rod([x, 0.5, z], [x + 0.12, 2.7, z], 0.16, candy, P.woodDark, true);
    for (let k = 0; k < 4; k++) sphere([x + Math.sin(k * 2.4) * 0.28, 2.2 + k * 0.38, z + Math.cos(k * 2.4) * 0.15], [1.05 - k * 0.15, 0.61, 0.84 - k * 0.1], k % 2 ? "#83b66f" : "#398f74", true);
  }
  // Bench faces the shop (-z); its backrest sits toward the curb (+z).
  for (let k = 0; k < 4; k++) {
    box([2.35, 0.1, 0.14], [12.5, 0.48, 11.12 + k * 0.18], candy, P.wood);
    if (k < 3) box([2.35, 0.14, 0.1], [12.5, 0.78 + k * 0.18, 11.72], candy, P.wood);
  }
  for (const x of [11.6, 13.4]) {
    for (const z of [11.2, 11.7]) rod([x, -0.12, z], [x, 0.5, z], 0.055, ink);
    rod([x, 0.4, 11.72], [x, 1.28, 11.72], 0.05, ink);
  }
  part(cylinder, candy, [-2, 0.6, 11.2], [0.36, 1.44, 0.36], [0, 0, 0], "#e74052");
  sphere([-2, 1.34, 11.2], [0.42, 0.18, 0.42], "#e74052");
  box([0.39, 0.09, 0.055], [-2, 1.05, 11.56], ink);
  box([0.22, 0.23, 0.025], [-2, 0.73, 11.57], cream);

  // Tiny Vespa-like silhouette, parked parallel to the curb, outside the crossing.
  for (const x of [5.85, 7.2]) {
    part(cylinder, ink, [x, 0.03, 14], [0.31, 0.18, 0.31], [HALF, 0, 0]);
    part(cylinder, cream, [x, 0.03, 14.105], [0.16, 0.03, 0.16], [HALF, 0, 0]);
  }
  sphere([6, 0.44, 14], [0.64, 0.43, 0.31], "#9fd8cf");
  box([1.25, 0.13, 0.49], [6.48, 0.18, 14], candy, "#9fd8cf");
  box([0.78, 0.15, 0.5], [6.12, 0.82, 14], ink);
  box([0.2, 0.93, 0.52], [7.05, 0.62, 14], candy, "#9fd8cf", [0, 0, -0.18]);
  rod([7.17, 0.22, 14], [6.98, 1.24, 14], 0.045, ink);
  rod([6.98, 1.24, 13.7], [6.98, 1.24, 14.3], 0.055, ink);
  rod([6.98, 1.24, 14.25], [6.87, 1.63, 14.3], 0.023, ink);
  sphere([6.87, 1.66, 14.3], [0.14, 0.11, 0.055], P.chrome);
  part(ball, bulbs, [7.18, 1.02, 14], [0.13, 0.16, 0.19]);
  rod([6.4, -0.31, 14.3], [6.5, 0.26, 14], 0.025, ink);

  // Two separate print materials are the only non-batched street detail draws.
  const walkPrint = own(lettering([
    { text: "THE RECORDVERSE", size: 58, weight: 900, color: P.butter },
    { text: "· WALK IN ·", size: 70, weight: 800, color: P.cream },
  ], { w: 800, h: 440, bg: P.midnight, radius: 26, border: P.tangerine }));
  const walkMat = own(new THREE.MeshStandardMaterial({ map: walkPrint, roughness: 0.6 }));
  for (const signSide of [-1, 1]) {
    const tilt = signSide * 0.18;
    box([1.42, 1.32, 0.12], [0.6, 0.65, 10.3 + signSide * 0.2], candy, P.tangerine, [tilt, 0, 0]);
    for (const x of [0.02, 1.18]) rod([x, -0.12, 10.3 + signSide * 0.4], [x, 1.4, 10.3], 0.045, ink);
  }
  part(quad, walkMat, [0.6, 0.66, 9.69], [1.25, 0.96, 1], [0.18, 0, 0]);
  rod([16.4, -0.12, 10.4], [16.4, 1.7, 10.4], 0.065, ink);
  box([1.48, 0.8, 0.22], [16.4, 1.65, 10.4], ink);
  const openPrint = own(lettering([{ text: "OPEN", size: 148, weight: 900, color: P.tangerine, track: 8 }], { w: 640, h: 300, bg: P.midnight, radius: 25, border: P.tangerine }));
  const neon = own(new THREE.MeshBasicMaterial({ map: openPrint, color: new THREE.Color("#ffffff").multiplyScalar(2), toneMapped: false }));
  part(quad, neon, [16.4, 1.65, 10.516], [1.36, 0.68, 1]);

  // A single unlit, fog-free sky draw, with all colours supplied in linear space.
  const sky = own(new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
    vertexShader, fragmentShader,
    uniforms: {
      uNight: { value: world.get().lights ? 0 : 1 },
      uDayHorizon: { value: new THREE.Color(DAY) }, uDayMiddle: { value: new THREE.Color("#b9a6ff") }, uDayTop: { value: new THREE.Color("#2b2a78") },
      uNightHorizon: { value: new THREE.Color(NIGHT) }, uNightTop: { value: new THREE.Color("#120f33") },
    },
  }));
  const skyMesh = new THREE.Mesh(own(new THREE.SphereGeometry(90, 48, 32)), sky);
  skyMesh.renderOrder = -100; skyMesh.frustumCulled = false; root.add(skyMesh);
  const cloudMaterial = own(new THREE.MeshBasicMaterial({ color: "#fff3df", transparent: true, opacity: 0.78, depthWrite: false }));
  const cloudParts: THREE.BufferGeometry[] = [];
  for (const [x, y, z] of [[-35, 28, -35], [5, 34, -42], [37, 27, -18], [-40, 31, 12]]) {
    for (let i = 0; i < 5; i++) {
      const p = ball.clone(); p.scale(2.4 + random(), 0.85 + random() * 0.6, 1.4);
      p.translate(x + (i - 2) * 2.1, y + Math.sin(i * 1.8) * 0.55, z); cloudParts.push(p);
    }
  }
  const cloudGeometry = mergeGeometries(cloudParts, false); cloudParts.forEach((p) => p.dispose());
  if (!cloudGeometry) throw new Error("Exterior cloud geometry could not be merged");
  const clouds = new THREE.Mesh(own(cloudGeometry), cloudMaterial); root.add(clouds);

  for (const { material, parts, cast, receive } of batches.values()) {
    const g = mergeGeometries(parts, false); parts.forEach((p) => p.dispose());
    if (!g) throw new Error("Exterior geometry could not be merged");
    const mesh = new THREE.Mesh(own(g), material); mesh.castShadow = cast; mesh.receiveShadow = receive; root.add(mesh);
  }
  const fog = new THREE.Fog(world.get().lights ? DAY : NIGHT, 45, 110);
  return { root, owned, sky, clouds, cloudMaterial, glass, bulbs, fog, day: new THREE.Color(DAY), night: new THREE.Color(NIGHT), dayGlass: new THREE.Color("#9fb6d6"), nightGlass: new THREE.Color("#ffcf8a"), drift: 0 };
}

export function Exterior() {
  const exterior = useMemo(makeExterior, []);
  const scene = useThree((state) => state.scene);
  useEffect(() => {
    scene.fog = exterior.fog;
    return () => {
      scene.fog = null;
      exterior.owned.forEach((resource) => resource.dispose());
    };
  }, [scene, exterior]);
  useFrame((_, delta) => {
    const e = exterior;
    const uniform = e.sky.uniforms.uNight;
    uniform.value = THREE.MathUtils.damp(uniform.value as number, world.get().lights ? 0 : 1, 3, delta);
    const night = uniform.value as number;
    e.fog.color.copy(e.day).lerp(e.night, night);
    e.glass.color.copy(e.dayGlass).lerp(e.nightGlass, night);
    e.glass.emissiveIntensity = night * 1.6;
    e.bulbs.emissiveIntensity = 0.35 + night * 2.3;
    e.cloudMaterial.opacity = 0.78 - night * 0.58;
    if (!sim.calm) e.drift += Math.min(delta, 0.1) * 0.008;
    e.clouds.position.x = Math.sin(e.drift) * 3;
  });
  return <primitive object={exterior.root} dispose={null} />;
}

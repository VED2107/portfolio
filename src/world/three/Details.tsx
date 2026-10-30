"use client";

/** Second-pass storytelling. Private resources, no interaction, no new collision footprints. */
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ARCADE_Z, FIXED_INTERACTABLES, SOLIDS, WALLS, WALL_SLOTS } from "../layout";
import { sim } from "../runtime";
import { PALETTE as P } from "./paint";
import { rbox } from "./shapes";

type V = [number, number, number];
type Owned = { dispose(): void };
const HALF = Math.PI / 2;

function makeDetails() {
  const root = new THREE.Group();
  root.name = "Recordverse · small stories";
  const owned = new Set<Owned>();
  const own = <T extends Owned,>(resource: T): T => { owned.add(resource); return resource; };
  const transform = new THREE.Object3D();
  const color = new THREE.Color();
  const candy = own(new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.48, clearcoat: 0.45, clearcoatRoughness: 0.3 }));
  const brass = own(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.72 }));
  // FrontSide glass costs one pass, unlike transparent DoubleSide materials.
  const glass = own(new THREE.MeshStandardMaterial({ color: "#b8e2d7", transparent: true, opacity: 0.27, depthWrite: false, roughness: 0.18 }));
  const ball = own(new THREE.SphereGeometry(1, 16, 12));
  const cylinder = own(new THREE.CylinderGeometry(1, 1, 1, 20));
  const quad = own(new THREE.PlaneGeometry(1, 1));

  type Batch = { parent: THREE.Group; material: THREE.Material; shadow: boolean; parts: THREE.BufferGeometry[] };
  const batches = new Map<string, Batch>();
  function part(shape: THREE.BufferGeometry, at: V, scale: V, tint: string = P.cream, rotation: V = [0, 0, 0], material: THREE.Material = candy, parent = root, shadow = false) {
    const geometry = shape.index ? shape.toNonIndexed() : shape.clone();
    // All batch members have exactly the same attributes (including atlas quads).
    geometry.deleteAttribute("tangent");
    transform.position.set(...at); transform.rotation.set(...rotation); transform.scale.set(...scale); transform.updateMatrix();
    geometry.applyMatrix4(transform.matrix);
    color.set(tint);
    const values = new Float32Array(geometry.getAttribute("position").count * 3);
    for (let i = 0; i < values.length; i += 3) {
      values[i] = color.r; values[i + 1] = color.g; values[i + 2] = color.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(values, 3));
    const key = `${material.uuid}:${parent.uuid}:${shadow}`;
    if (!batches.has(key)) batches.set(key, { parent, material, shadow, parts: [] });
    batches.get(key)!.parts.push(geometry);
  }
  function block(size: V, at: V, tint: string, rotation: V = [0, 0, 0], parent = root, shadow = false) {
    // Clone cached vocabulary only; shared shapes.tsx buffers are never disposed here.
    part(rbox(...size, Math.min(0.055, ...size.map((n) => n * 0.22))), at, [1, 1, 1], tint, rotation, candy, parent, shadow);
  }
  function sphere(at: V, size: V, tint: string, parent = root, shadow = false, rotation: V = [0, 0, 0]) {
    part(ball, at, size, tint, rotation, candy, parent, shadow);
  }
  function disc(at: V, radius: number, height: number, tint: string, material: THREE.Material = candy, parent = root) {
    part(cylinder, at, [radius, height, radius], tint, [0, 0, 0], material, parent);
  }
  function tube(points: V[], radius: number, tint: string, material: THREE.Material = candy, parent = root, shadow = false) {
    const geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 28, radius, 8, false);
    part(geometry, [0, 0, 0], [1, 1, 1], tint, [0, 0, 0], material, parent, shadow);
    geometry.dispose();
  }
  function ring(at: V, radius: number, thickness: number, tint: string, rotation: V = [0, 0, 0], material: THREE.Material = candy) {
    const geometry = new THREE.TorusGeometry(radius, thickness, 8, 28);
    part(geometry, at, [1, 1, 1], tint, rotation, material); geometry.dispose();
  }

  // Explicit footprint checks also cover the full radius of each floor-mounted stanchion.
  const stands = [...FIXED_INTERACTABLES.map((i) => i.stand), ...WALL_SLOTS.map((x) => [x, -6.35] as const), ...ARCADE_Z.map((z) => [-12.2, z] as const)];
  function support(id: string, x: number, z: number, rx: number, rz: number) {
    const solid = SOLIDS.find((s) => s.id === id);
    if (!solid || x - rx < solid.x0 || x + rx > solid.x1 || z - rz < solid.z0 || z + rz > solid.z1) {
      throw new Error(`Details escaped ${id} at ${x}, ${z}`);
    }
  }
  function wallFloor(x: number, z: number, radius: number) {
    const close = WALLS.some((w) => x - radius >= w.x1 && x + radius - w.x1 <= 0.5 && z - radius >= w.z0 && z + radius <= w.z1);
    if (!close || stands.some(([sx, sz]) => Math.hypot(sx - x, sz - z) - radius < 1)) {
      throw new Error(`Details stanchion has insufficient clearance at ${x}, ${z}`);
    }
  }

  // One lettering atlas and one merged print mesh for every card, sticker and sign.
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 2048;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Details requires a 2D canvas context");
  const pen: CanvasRenderingContext2D = context;
  const atlas = own(new THREE.CanvasTexture(canvas)); atlas.colorSpace = THREE.SRGBColorSpace; atlas.anisotropy = 4;
  const print = own(new THREE.MeshStandardMaterial({ map: atlas, roughness: 0.92 }));
  let tile = 0;
  function label(lines: string[], bg: string, ink: string, handwritten = false, embellish?: (g: CanvasRenderingContext2D) => void) {
    const id = tile++;
    if (id >= 16) throw new Error("Details lettering atlas is full");
    pen.save(); pen.translate(id % 4 * 512, Math.floor(id / 4) * 512);
    pen.fillStyle = bg; pen.fillRect(0, 0, 512, 512);
    pen.strokeStyle = ink; pen.globalAlpha = 0.35; pen.lineWidth = 5; pen.strokeRect(18, 18, 476, 476); pen.globalAlpha = 1;
    pen.fillStyle = ink; pen.textAlign = "center"; pen.textBaseline = "middle";
    const height = 380 / lines.length;
    lines.forEach((text, i) => {
      let size = Math.min(96, height * 0.67);
      const font = () => `${handwritten ? "italic 700" : "800"} ${size}px ${handwritten ? '"Comic Sans MS", cursive' : 'ui-monospace, monospace'}`;
      pen.font = font();
      while (pen.measureText(text).width > 448 && size > 12) { size -= 2; pen.font = font(); }
      pen.save(); pen.translate(256, 66 + height * (i + 0.5));
      if (handwritten) pen.rotate(i % 2 ? 0.035 : -0.025);
      pen.fillText(text, 0, 0); pen.restore();
    });
    embellish?.(pen); pen.restore();
    return id;
  }
  function card(id: number, at: V, width: number, height: number, rotation: V = [0, 0, 0]) {
    const geometry = quad.clone(); const uv = geometry.getAttribute("uv");
    // Half-texel inset prevents adjacent tile colours bleeding into the card edges.
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (id % 4 * 512 + 1 + uv.getX(i) * 510) / 2048,
        1 - (Math.floor(id / 4) * 512 + 511 - uv.getY(i) * 510) / 2048);
    }
    part(geometry, at, [width, height, 1], "#ffffff", rotation, print); geometry.dispose();
  }

  // Records: clips hang just under the sleeve ledges, leaving the cover faces visible.
  const pick = label(["STAFF", "PICK", "33⅓ / forever"], P.butter, P.ink, true);
  const price = label(["nice find!", "₹ 499", "PLAY BOTH SIDES"], P.paper, P.tealDeep, true);
  for (const [i, x] of [-4.25, -0.85, 2.55].entries()) {
    card(i === 1 ? price : pick, [x + 0.49, 1.19, -7.756], 0.32, 0.20, [0, 0, i % 2 ? 0.05 : -0.06]);
    block([0.055, 0.11, 0.045], [x + 0.49, 1.105, -7.771], P.midnight);
  }
  for (const end of [-1, 1]) {
    const x = end * 5.12, z = -7.57;
    support("record-wall", x, z, 0.235, 0.29);
    // Sleeves turn sideways at the cabinet ends; the outermost wall sleeve ends at |x|=4.9.
    for (let k = 0; k < 5; k++) {
      block([0.035, 0.45, 0.39], [x - 0.09 + k * 0.045, 1.255, z], [P.teal, P.coral, P.butter, P.violet, P.paper][k], [0.10, 0, -0.12]);
      block([0.04, 0.055, 0.31], [x - 0.09 + k * 0.045, 1.38, z + 0.01], P.cream, [0.10, 0, -0.12]);
    }
    for (const dx of [-0.19, 0.19]) tube([[x + dx, 1.025, z + 0.26], [x + dx, 1.025, z - 0.24], [x + dx, 1.38, z - 0.24]], 0.018, P.midnight, brass);
    for (const dz of [-0.24, 0.26]) block([0.42, 0.027, 0.027], [x, 1.028, z + dz], P.midnight);
  }

  // Counter: Counter.tsx puts the true top at 1.13, with tapes left and till right.
  const top = 1.13;
  support("counter", 3.38, 2.79, 0.14, 0.14);
  const jar = own(new THREE.CylinderGeometry(0.112, 0.12, 0.28, 24, 1, true));
  part(jar, [3.38, top + 0.14, 2.79], [1, 1, 1], "#ffffff", [0, 0, 0], glass);
  ring([3.38, top + 0.28, 2.79], 0.113, 0.013, P.cream, [HALF, 0, 0]);
  disc([3.38, top + 0.009, 2.79], 0.118, 0.018, P.tealDeep);
  for (let i = 0; i < 7; i++) disc([3.38 + Math.sin(i * 2.4) * 0.055, top + 0.027 + i % 3 * 0.018, 2.79 + Math.cos(i * 2.4) * 0.049], 0.033, 0.014, P.butter, brass);
  const tip = label(["TIPS", "FOR TUNES", "♡"], P.paper, P.tealDeep, true);
  card(tip, [3.38, top + 0.15, 2.906], 0.17, 0.13);

  support("counter", 5.16, 3.24, 0.12, 0.12);
  const pot = own(new THREE.CylinderGeometry(0.095, 0.073, 0.16, 20));
  part(pot, [5.16, top + 0.08, 3.24], [1, 1, 1], P.teal);
  disc([5.16, top + 0.164, 3.24], 0.084, 0.014, P.walnut);
  for (let k = 0; k < 7; k++) {
    const a = k * 2.4;
    sphere([5.16 + Math.sin(a) * 0.046, top + 0.20 + k % 2 * 0.018, 3.24 + Math.cos(a) * 0.046], [0.034, 0.095, 0.03], k % 2 ? "#397b4f" : "#8cba78", root, false, [Math.cos(a) * 0.55, 0, -Math.sin(a) * 0.55]);
  }
  const flyers = label(["WALK-INS", "WELCOME", "GOOD MUSIC", "GOOD COMPANY"], P.butter, P.midnight);
  support("counter", 3.83, 2.79, 0.17, 0.20);
  for (let k = 0; k < 5; k++) block([0.33, 0.012, 0.37], [3.83 + k % 2 * 0.008, top + 0.006 + k * 0.012, 2.79], k % 2 ? P.paper : P.butter);
  card(flyers, [3.83, top + 0.061, 2.79], 0.32, 0.36, [-HALF, 0, 0]);
  const stickers = label([], P.paper, P.ink, false, (g) => {
    [P.coral, P.teal, P.violet, P.tangerine, P.butter, P.raspberry].forEach((tint, k) => {
      const x = 145 + k % 2 * 220, y = 100 + Math.floor(k / 2) * 154;
      g.fillStyle = tint; g.beginPath(); g.arc(x, y, 63, 0, Math.PI * 2); g.fill();
      g.fillStyle = P.cream; g.font = "800 46px monospace"; g.fillText(k % 2 ? "★" : "33", x, y);
    });
  });
  support("counter", 3.40, 3.25, 0.075, 0.13);
  card(stickers, [3.40, top + 0.004, 3.25], 0.15, 0.26, [-HALF, 0, 0]);

  // Studio: the front-left desk pocket is free of keyboard, synth and speaker.
  support("desk", -11.69, -7.05, 0.36, 0.23);
  block([0.70, 0.08, 0.44], [-11.69, 1.0, -7.05], P.teal);
  disc([-11.78, 1.055, -7.05], 0.183, 0.024, P.midnight);
  const vinyl = new THREE.Group(); vinyl.position.set(-11.78, 1.078, -7.05); root.add(vinyl);
  disc([0, 0, 0], 0.175, 0.012, "#201929", candy, vinyl);
  disc([0, 0.008, 0], 0.065, 0.006, P.coral, candy, vinyl);
  sphere([0.025, 0.014, 0.018], [0.012, 0.003, 0.012], P.cream, vinyl);
  tube([[-11.42, 1.09, -7.16], [-11.43, 1.12, -7.0], [-11.60, 1.10, -6.98]], 0.013, P.chrome, brass);
  block([0.05, 0.035, 0.065], [-11.60, 1.09, -6.98], P.midnight);

  support("desk", -12.50, -6.78, 0.19, 0.065);
  block([0.08, 0.06, 0.14], [-12.50, 0.91, -6.80], P.butter);
  tube([[-12.67, 0.61, -6.78], [-12.66, 0.83, -6.78], [-12.50, 0.92, -6.78], [-12.34, 0.83, -6.78], [-12.33, 0.61, -6.78]], 0.031, P.midnight);
  for (const x of [-12.67, -12.33]) {
    sphere([x, 0.61, -6.78], [0.065, 0.10, 0.06], P.violet);
    sphere([x, 0.61, -6.73], [0.047, 0.073, 0.018], P.midnight);
  }
  support("desk", -9.66, -6.98, 0.18, 0.11);
  disc([-9.66, 1.065, -6.98], 0.105, 0.21, P.coral);
  disc([-9.66, 1.172, -6.98], 0.085, 0.006, P.walnut);
  ring([-9.53, 1.065, -6.98], 0.066, 0.019, P.coral);
  const note1 = label(["SAVE", "THEN", "SHIP!"], P.butter, P.ink, true);
  const note2 = label(["SIDE B", "is better", "♡"], "#ffc6d9", P.ink, true);
  card(note1, [-10.99, 2.06, -7.602], 0.17, 0.18, [0, 0, -0.08]);
  card(note2, [-10.75, 2.07, -7.602], 0.17, 0.16, [0, 0, 0.07]);
  const steam = Array.from({ length: 3 }, (_, i) => {
    const material = own(new THREE.MeshBasicMaterial({ color: P.cream, transparent: true, opacity: 0.12 - i * 0.035, depthWrite: false }));
    const mesh = new THREE.Mesh(ball, material);
    mesh.position.set(-9.66, 1.25 + i * 0.11, -6.98); mesh.scale.set(0.033 + i * 0.009, 0.07, 0.033 + i * 0.009); root.add(mesh);
    return { mesh, material };
  });

  // Lounge: the books occupy the table's back arc, clear of the album's hinged sweep.
  support("coffee-table", 10.30, 3.55, 0.22, 0.10);
  for (let i = 0; i < 3; i++) {
    const y = 0.62 + i * 0.078;
    block([0.40, 0.068, 0.18], [10.30, y + 0.034, 3.55], [P.teal, P.coral, P.violet][i], [0, i * 0.035, 0], root, true);
    block([0.36, 0.042, 0.181], [10.31, y + 0.034, 3.55], P.paper, [0, i * 0.035, 0], root, true);
  }
  const book = label(["SOUND", "& SPACE"], P.violet, P.butter);
  card(book, [10.30, 0.845, 3.55], 0.39, 0.17, [-HALF, 0, 0.07]);
  support("sofa", 13.18, 5.51, 0.40, 0.18);
  // Chunky softened folds make the throw read as fabric from the fixed camera.
  block([0.77, 0.07, 0.32], [13.18, 0.912, 5.51], P.butter);
  for (let i = 0; i < 4; i++) {
    block([0.11, 0.38 - i % 2 * 0.035, 0.09], [12.82 + i * 0.038, 0.735, 5.40 + i * 0.065], i % 2 ? "#efbb59" : P.butter, [0, 0, 0.10]);
    block([0.72, 0.013, 0.023], [13.18, 0.954, 5.40 + i * 0.065], i % 2 ? P.coral : P.paper);
  }
  const cat = new THREE.Group(); cat.position.set(7.77, 0.665, 2.10); root.add(cat);
  support("armchair", 7.77, 2.10, 0.24, 0.31);
  sphere([-0.025, 0.105, -0.015], [0.205, 0.11, 0.25], "#d48642", cat, true);
  sphere([0.085, 0.125, 0.16], [0.12, 0.10, 0.115], "#eaa25a", cat, true);
  sphere([0.085, 0.087, 0.235], [0.078, 0.046, 0.037], P.paper, cat, true);
  const ear = own(new THREE.ConeGeometry(0.046, 0.09, 3));
  for (const x of [0.015, 0.15]) {
    part(ear, [x, 0.225, 0.15], [1, 1, 0.6], "#d48642", [0, 0.3, x < 0.1 ? 0.2 : -0.2], candy, cat, true);
    sphere([x, 0.219, 0.169], [0.019, 0.027, 0.008], "#eeb2a0", cat, true);
    tube([[x - 0.025, 0.14, 0.246], [x - 0.012, 0.133, 0.254], [x, 0.14, 0.249]], 0.006, P.walnut, candy, cat, true);
  }
  sphere([0.085, 0.108, 0.273], [0.014, 0.01, 0.008], P.walnut, cat, true);
  tube([[0.11, 0.074, -0.19], [-0.17, 0.07, -0.15], [-0.19, 0.069, 0.10], [-0.08, 0.065, 0.22], [0.025, 0.069, 0.19]], 0.039, "#eaa25a", candy, cat, true);
  for (let i = 0; i < 3; i++) sphere([-0.08 + i * 0.058, 0.211, -0.07], [0.017, 0.009, 0.10], "#a45e32", cat, true, [0, -0.2, 0]);

  // Arcade: the 1m-wide gap between window frames is z=3.9..4.75.
  // Existing INSERT CURIOSITY sign ends at z=5.2, y=3.64; this board sits below it.
  const scores = label(["HI-SCORES", "VED 999,999", "PIP 420,000", "??? 000,000"], P.midnight, P.butter);
  block([0.055, 0.56, 0.79], [-13.932, 2.60, 4.33], P.raspberry);
  card(scores, [-13.901, 2.60, 4.33], 0.72, 0.49, [0, HALF, 0]);
  support("cabinet-1", -13.65, 1.55, 0.17, 0.17);
  const bowl = own(new THREE.LatheGeometry([[0, 0], [0.11, 0], [0.16, 0.075], [0.17, 0.11], [0.142, 0.11], [0.11, 0.035], [0, 0.035]].map(([x, y]) => new THREE.Vector2(x, y)), 24));
  part(bowl, [-13.65, 2.27, 1.55], [1, 1, 1], P.butter);
  for (let i = 0; i < 9; i++) disc([-13.65 + Math.sin(i * 2.4) * 0.08, 2.32 + i % 3 * 0.017, 1.55 + Math.cos(i * 2.4) * 0.07], 0.036, 0.012, P.butter, brass);
  const nice = label(["PLAY NICE", "★ ★ ★"], P.butter, P.midnight);
  card(nice, [-10.9, 0.035, 5.9], 1.08, 0.46, [-HALF, 0, -0.12]);

  // Releases: both bases and the sagging rope hug the partition, behind the standing lane.
  for (const z of [-7.2, -5.4]) {
    wallFloor(6.28, z, 0.12);
    disc([6.28, 0.035, z], 0.12, 0.07, "#d5ad57", brass);
    part(cylinder, [6.28, 0.46, z], [0.025, 0.82, 0.025], "#d5ad57", [0, 0, 0], brass);
    sphere([6.28, 0.91, z], [0.062, 0.062, 0.062], P.butter);
  }
  tube([[6.28, 0.88, -7.2], [6.28, 0.67, -6.75], [6.28, 0.61, -6.3], [6.28, 0.67, -5.85], [6.28, 0.88, -5.4]], 0.033, "#9f3159");
  support("plinth", 12.2, -2.40, 0.23, 0.09);
  const showing = label(["NOW", "SHOWING", "33⅓ / VOL. 01"], P.midnight, P.butter);
  block([0.45, 0.027, 0.16], [12.2, 1.134, -2.40], P.walnut);
  block([0.45, 0.24, 0.035], [12.2, 1.265, -2.40], P.walnut, [-0.13, 0, 0]);
  card(showing, [12.2, 1.267, -2.373], 0.415, 0.215, [-0.13, 0, 0]);
  // Optional studio photos deliberately omitted: Dressing's acoustic tiles occupy that strip.

  // Floor wear is paint only. The transparent planes are the explicit floor-decal exception.
  const wearCanvas = document.createElement("canvas"); wearCanvas.width = wearCanvas.height = 256;
  const wearPen = wearCanvas.getContext("2d");
  if (!wearPen) throw new Error("Details wear requires a 2D canvas context");
  for (let i = 0; i < 22; i++) {
    wearPen.strokeStyle = `rgba(75,42,45,${0.035 + i % 3 * 0.012})`; wearPen.lineWidth = 2 + i % 4;
    wearPen.beginPath(); wearPen.ellipse(65 + i % 5 * 28, 42 + i % 7 * 24, 10 + i % 4 * 4, 3, i * 0.31, 0.1, 2.5); wearPen.stroke();
  }
  const wearTex = own(new THREE.CanvasTexture(wearCanvas)); wearTex.colorSpace = THREE.SRGBColorSpace;
  const wear = own(new THREE.MeshBasicMaterial({ map: wearTex, transparent: true, opacity: 0.40, depthWrite: false }));
  for (const [x, z, w, d] of [[-3.7, -6.65, 1.6, 0.64], [0.5, -6.65, 1.5, 0.64], [3.6, -6.65, 1.4, 0.64], [3.7, 4.17, 1.4, 0.64]]) {
    part(quad, [x, 0.033, z], [w, d, 1], "#ffffff", [-HALF, 0, 0], wear);
  }

  // One Points object, deterministic seed, soft fragment mask; positions never re-upload.
  let seed = 941;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  const positions = new Float32Array(120 * 3);
  for (let i = 0; i < 120; i++) {
    positions[i * 3] = -4.6 + random() * 9.2;
    positions[i * 3 + 1] = 0.8 + random() * 2.6;
    positions[i * 3 + 2] = -6.7 + random() * 5.0;
  }
  const dustGeometry = own(new THREE.BufferGeometry()); dustGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const dustMaterial = own(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `uniform float uTime;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * .13 + position.z) * .11;
        p.y += sin(uTime * .17 + position.x * 1.7) * .08;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(36. / max(1., -mv.z), 1., 3.);
      }`,
    fragmentShader: `void main() {
      float a = 1. - smoothstep(.08, .5, length(gl_PointCoord - .5));
      gl_FragColor = vec4(1., .81, .53, a * .13);
      #include <colorspace_fragment>
    }`,
  }));
  const dust = new THREE.Points(dustGeometry, dustMaterial); dustGeometry.computeBoundingSphere();
  if (dustGeometry.boundingSphere) dustGeometry.boundingSphere.radius += 0.2;
  root.add(dust);

  for (const batch of batches.values()) {
    const geometry = mergeGeometries(batch.parts, false);
    batch.parts.forEach((p) => p.dispose());
    if (!geometry) throw new Error("Details geometry could not be merged");
    const mesh = new THREE.Mesh(own(geometry), batch.material); mesh.castShadow = batch.shadow;
    batch.parent.add(mesh);
  }
  atlas.needsUpdate = true;
  // 12 base-pass draws: solids, brass, glass, print atlas, books, cat, vinyl,
  // wear, dust and three steam spheres. Only books + cat enter shadow passes.
  return { root, owned, cat, vinyl, steam, dustMaterial, time: 0 };
}

export function Details() {
  const details = useMemo(makeDetails, []);
  useEffect(() => () => { details.owned.forEach((resource) => resource.dispose()); }, [details]);
  useFrame((_, delta) => {
    if (sim.calm) return;
    details.time += Math.min(delta, 0.1);
    const t = details.time;
    details.cat.scale.y = 1 + (0.5 + Math.sin(t * 1.15) * 0.5) * 0.03;
    details.vinyl.rotation.y = t * 0.55;
    details.dustMaterial.uniforms.uTime.value = t;
    for (let i = 0; i < details.steam.length; i++) {
      const { mesh, material } = details.steam[i];
      const phase = (t * 0.24 + i / 3) % 1;
      mesh.position.y = 1.23 + phase * 0.36;
      mesh.position.x = -9.66 + Math.sin(phase * Math.PI * 2 + i) * 0.023;
      material.opacity = Math.sin(phase * Math.PI) * 0.12;
    }
  });
  return <primitive object={details.root} dispose={null} />;
}

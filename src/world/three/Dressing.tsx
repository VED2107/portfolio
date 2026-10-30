"use client";

/** Set dressing only. All coordinates share layout.ts; nothing here owns interaction or collision. */
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ARCADE_Z, BOUNDS, FIXED_INTERACTABLES, ROOMS, SOLIDS, SPAWN, WALLS, WALL_SLOTS } from "../layout";
import { sim } from "../runtime";
import { cyl, lathe, plane, rbox, sphere } from "./shapes";
import { PALETTE as P, basic, lacquer, lettering, mat } from "./paint";

type Point = [number, number, number];
type Placement = { at: Point; rot?: Point; scale?: Point; color?: string };
const HALF_PI = Math.PI / 2;
const PLANT_RADIUS = 0.34;
const PLANTS: [number, number][] = [[-5.4, -1], [5.5, -0.8], [-11, 7.5], [13.6, -0.6]];

/** Paint-owned textures/materials are released by paint.ts; only locally owned resources go here. */
function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("Dressing requires a 2D canvas context");
  draw(g);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Bottom of the texture is the contact edge; reuse it for both floor and upright quads. */
function contactGradient() {
  return canvasTexture(8, 128, (g) => {
    const fade = g.createLinearGradient(0, 128, 0, 0);
    fade.addColorStop(0, "rgba(255,255,255,1)");
    fade.addColorStop(0.18, "rgba(255,255,255,.58)");
    fade.addColorStop(0.55, "rgba(255,255,255,.13)");
    fade.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = fade;
    g.fillRect(0, 0, 8, 128);
  });
}

function verifyPlants() {
  const stands = [
    ...FIXED_INTERACTABLES.map((item) => item.stand),
    ...WALL_SLOTS.map((x) => [x, -6.35] as const),
    ...ARCADE_Z.map((z) => [-12.2, z] as const),
  ];
  for (const [x, z] of PLANTS) {
    const inBounds = x - PLANT_RADIUS > BOUNDS.x0 && x + PLANT_RADIUS < BOUNDS.x1
      && z - PLANT_RADIUS > BOUNDS.z0 && z + PLANT_RADIUS < BOUNDS.z1;
    const blocked = [...WALLS, ...SOLIDS].some((box) => Math.hypot(
      x - THREE.MathUtils.clamp(x, box.x0, box.x1),
      z - THREE.MathUtils.clamp(z, box.z0, box.z1),
    ) < PLANT_RADIUS);
    // Keep the entire crown outside the interaction standing clearance.
    const nearStand = stands.some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 0.9 + PLANT_RADIUS);
    // Main aisles and the studio doorway remain open; these are peripheral floor pockets.
    const inAisle = (Math.abs(x) < 1.5 && z > -2.85)
      || (x > -7.1 && x < -4.8 && z > -5.3 && z < -3.3);
    const atEntry = [SPAWN.at, ...ROOMS.map((room) => room.entry)]
      .some(([ex, ez]) => Math.hypot(x - ex, z - ez) < 0.9 + PLANT_RADIUS);
    if (!inBounds || blocked || nearStand || inAisle || atEntry) {
      throw new Error(`Dressing plant has insufficient clearance at ${x}, ${z}`);
    }
  }
}

function makeDressing() {
  verifyPlants();
  const root = new THREE.Group();
  root.name = "Handcrafted shop dressing";
  const owned: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(resource: T): T => { owned.push(resource); return resource; };
  const object = new THREE.Object3D();
  const color = new THREE.Color();
  function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, at: Point, rot?: Point, cast = false) {
    const result = new THREE.Mesh(geometry, material);
    result.position.set(...at);
    if (rot) result.rotation.set(...rot);
    result.castShadow = cast;
    root.add(result);
    return result;
  }
  function instances(geometry: THREE.BufferGeometry, material: THREE.Material, placements: Placement[], cast = false) {
    const result = new THREE.InstancedMesh(geometry, material, placements.length);
    // Instance buffers belong to this component, even though their shape/material may be shared.
    own(result);
    placements.forEach((p, i) => {
      object.position.set(...p.at);
      object.rotation.set(...(p.rot ?? [0, 0, 0]));
      object.scale.set(...(p.scale ?? [1, 1, 1]));
      object.updateMatrix();
      result.setMatrixAt(i, object.matrix);
      if (p.color) result.setColorAt(i, color.set(p.color));
    });
    result.instanceMatrix.needsUpdate = true;
    if (result.instanceColor) result.instanceColor.needsUpdate = true;
    result.computeBoundingSphere();
    result.castShadow = cast;
    root.add(result);
    return result;
  }
  function merged(parts: THREE.BufferGeometry[]) {
    const result = mergeGeometries(parts, false);
    parts.forEach((part) => part.dispose());
    if (!result) throw new Error("Dressing geometry could not be merged");
    return own(result);
  }
  function quad(w: number, h: number, at: Point, rot: Point = [0, 0, 0]) {
    object.position.set(...at);
    object.rotation.set(...rot);
    object.scale.set(1, 1, 1);
    object.updateMatrix();
    return new THREE.PlaneGeometry(w, h).applyMatrix4(object.matrix);
  }

  // 1 draw: continuous contact shadows, including both long faces of EVERY partition.
  const ao = own(new THREE.MeshBasicMaterial({
    map: own(contactGradient()), color: "#2a1530", opacity: 0.35,
    transparent: true, depthWrite: false, toneMapped: false,
    // Normal alpha compositing gives a tinted, multiply-looking shadow without whitening wood.
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  }));
  const contacts = [
    quad(27.8, 0.48, [0, 0.026, -7.678], [-HALF_PI, 0, Math.PI]),
    quad(15.8, 0.48, [-13.67, 0.026, 0], [-HALF_PI, 0, -HALF_PI]),
    // Wainscot projects 0.08m beyond the architectural inner face.
    quad(27.8, 0.6, [0, 0.3, -7.918]),
    quad(15.8, 0.6, [-13.918, 0.3, 0], [0, HALF_PI, 0]),
  ];
  for (const wall of WALLS) {
    const vertical = wall.z1 - wall.z0 > wall.x1 - wall.x0;
    const length = vertical ? wall.z1 - wall.z0 : wall.x1 - wall.x0;
    const cx = (wall.x0 + wall.x1) / 2, cz = (wall.z0 + wall.z1) / 2;
    for (const side of [-1, 1]) {
      const edge = vertical ? (side < 0 ? wall.x0 : wall.x1) : (side < 0 ? wall.z0 : wall.z1);
      if (vertical) {
        contacts.push(quad(length, 0.38, [edge + side * 0.19, 0.027, cz], [-HALF_PI, 0, -side * HALF_PI]));
        contacts.push(quad(length, 0.6, [edge + side * 0.003, 0.3, cz], [0, side * HALF_PI, 0]));
      } else {
        contacts.push(quad(length, 0.38, [cx, 0.027, edge + side * 0.19], [-HALF_PI, 0, side > 0 ? Math.PI : 0]));
        contacts.push(quad(length, 0.6, [cx, 0.3, edge + side * 0.003], [0, side < 0 ? Math.PI : 0, 0]));
      }
    }
  }
  mesh(merged(contacts), ao, [0, 0, 0]);

  // Fine letterpress-like stripes, with actual transparent cutout around the releases window.
  const wallpaper = own(canvasTexture(1600, 576, (g) => {
    g.fillStyle = P.cream;
    g.fillRect(0, 0, 1600, 576);
    for (let x = 0; x < 1600; x += 25) {
      g.fillStyle = "#f5dfac";
      g.fillRect(x, 0, 3, 576);
      g.fillStyle = "rgba(166,124,62,.12)";
      g.fillRect(x + 5, 0, 1, 576);
    }
    g.fillStyle = "#d6b773";
    for (let y = 30; y < 576; y += 70) for (let x = 30 + (y % 140 ? 30 : 0); x < 1600; x += 100) {
      g.beginPath();
      g.moveTo(x, y - 4); g.lineTo(x + 1.3, y - 1.3); g.lineTo(x + 4, y);
      g.lineTo(x + 1.3, y + 1.3); g.lineTo(x, y + 4); g.lineTo(x - 1.3, y + 1.3);
      g.lineTo(x - 4, y); g.lineTo(x - 1.3, y - 1.3); g.closePath(); g.fill();
    }
    // World-space window plus its cream frame/sill, not just the glass.
    g.clearRect((10.72 - 6) * 200, 0, (13.48 - 10.72) * 200, (4 - 2.18) * 200);
  }));
  const paper = own(new THREE.MeshStandardMaterial({ map: wallpaper, transparent: true, alphaTest: 0.02, roughness: 0.95 }));
  // Preserve the requested wall anchor; offset its geometry past Building's 0.022m paint face.
  const paperGeo = own(new THREE.PlaneGeometry(8, 2.88).translate(0, 0, 0.015));
  mesh(paperGeo, paper, [10, 2.56, -7.985]);

  // Scalloped fabric frieze. Leave window/frame spans clear, including their top rails.
  const frieze = own(canvasTexture(1024, 64, (g) => {
    for (let x = 0; x < 1024; x += 32) {
      g.fillStyle = (x / 32) % 2 ? P.cream : P.raspberry;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 32, 0); g.lineTo(x + 32, 40);
      g.arc(x + 16, 40, 16, 0, Math.PI); g.closePath(); g.fill();
    }
  }));
  const friezeMat = own(new THREE.MeshStandardMaterial({ map: frieze, transparent: true, alphaTest: 0.03, roughness: 1 }));
  const friezeParts = [[-1.5, 1.9], [3.9, 4.75], [6.75, 8]].map(([a, b]) => {
    const geometry = quad(b - a, 0.17, [-13.968, 3.935, (a + b) / 2], [0, HALF_PI, 0]);
    const positions = geometry.getAttribute("position"), uv = geometry.getAttribute("uv");
    // Continue the same fabric repeat across the gaps instead of shrinking scallops per segment.
    for (let i = 0; i < positions.count; i++) uv.setX(i, (8 - positions.getZ(i)) / 9.5);
    return geometry;
  });
  mesh(merged(friezeParts), friezeMat, [0, 0, 0]);

  // Rounded four-sided ridges read as acoustic wedges, rather than a flat printed pattern.
  const wedge = lathe("dressing-foam", [[0.238, 0], [0.238, 0.025], [0.19, 0.06], [0.045, 0.15], [0.014, 0.155], [0, 0.153]], 4);
  const foam: Placement[] = [];
  for (let row = 0; row < 6; row++) for (let col = 0; col < 15; col++) {
    const x = -13.42 + col * 0.34, y = 1.59 + row * 0.35;
    // Full tile clearance above the monitors; the staggered lower edge feels installed by hand.
    if (x > -12.2 && x < -8.8 && y < 2.27) continue;
    foam.push({ at: [x, y, -7.965], rot: [HALF_PI, Math.PI / 4 + (row % 2) * HALF_PI, 0], color: (row + col) % 2 ? "#5b46d6" : "#4a37c0" });
  }
  instances(wedge, mat("dressing-foam", { color: "#ffffff", roughness: 1 }), foam);

  const posterSpecs = [
    { z: -7.02, bg: P.butter, ink: P.ink, lines: ["SAME INPUT IN", "·", "SAME RESULT OUT"] },
    { z: -5.94, bg: P.violet, ink: P.cream, lines: ["SHIP", "· TEST ·", "REPEAT"] },
    { z: -2.87, bg: P.coral, ink: P.cream, lines: ["LIVE AT", "33⅓", "RPM"] },
    { z: -2.06, bg: P.teal, ink: P.cream, lines: ["PATAN, GUJARAT", "·", "EST. 2026"] },
  ];
  // Frames sit entirely outside the panel face at x=-5.87; front normal points toward +x.
  instances(rbox(0.68, 0.9, 0.036, 0.018), lacquer("dressing-poster-frame", P.walnut),
    posterSpecs.map((p) => ({ at: [-5.848, 1.85, p.z], rot: [0, HALF_PI, 0] })));
  for (const [i, poster] of posterSpecs.entries()) {
    const texture = lettering(poster.lines.map((text, row) => ({
      text, size: i === 2 && row === 1 ? 132 : text.length > 10 ? 37 : 68,
      color: poster.ink, weight: 900, track: text.length > 10 ? 0 : 2,
    })), { w: 512, h: 700, bg: poster.bg, border: poster.ink, pad: 24 });
    // Printmaking details: eccentric record rings, registration bars and a cream paper margin.
    const g = (texture.image as HTMLCanvasElement).getContext("2d")!;
    g.strokeStyle = poster.ink; g.globalAlpha = 0.32; g.lineWidth = 3;
    for (let radius = 30; radius <= 58; radius += 9) {
      g.beginPath(); g.arc(256, 105, radius, 0, Math.PI * 2); g.stroke();
    }
    g.globalAlpha = 1;
    g.fillStyle = poster.ink; g.fillRect(48, 593, 416, 5); g.fillRect(48, 608, 170, 3);
    texture.needsUpdate = true;
    mesh(plane(0.614, 0.828), basic(`dressing-poster-${i}`, { color: "#ffffff", map: texture }), [-5.828, 1.85, poster.z], [0, HALF_PI, 0]);
  }

  // True catenary spans between six hooks; a dark wire disappears naturally behind the store sign.
  const bulbPlacements: Placement[] = [], sockets: Placement[] = [], wireParts: THREE.BufferGeometry[] = [];
  const stringPoint = (t: number, left: boolean): THREE.Vector3 => {
    const spans = left ? 3 : 5, u = t * spans, span = Math.min(spans - 1, Math.floor(u));
    const local = u - span;
    const sag = 0.22 * (Math.cosh(1) - Math.cosh((local - 0.5) * 2)) / (Math.cosh(1) - 1);
    return left ? new THREE.Vector3(-13.78, 3.82 - sag, -7.7 + t * 15.1)
      : new THREE.Vector3(-13.5 + t * 27, 3.82 - sag, -7.94);
  };
  for (const left of [false, true]) {
    const count = left ? 23 : 40;
    const points = Array.from({ length: 161 }, (_, i) => stringPoint(i / 160, left));
    wireParts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 160, 0.009, 5, false));
    for (let i = 0; i < count; i++) {
      const point = stringPoint((i + 0.5) / count, left);
      sockets.push({ at: [point.x, point.y - 0.026, point.z] });
      bulbPlacements.push({ at: [point.x, point.y - 0.071, point.z], scale: [0.85, 1.18, 0.85] });
    }
    for (let i = 0; i <= (left ? 3 : 5); i++) {
      const point = stringPoint(i / (left ? 3 : 5), left);
      sockets.push({ at: [point.x, point.y + 0.033, point.z], scale: [0.6, 2.2, 0.6] });
    }
  }

  // No pendant lamps: the diorama has no ceiling to hang them from.
  mesh(merged(wireParts), mat("dressing-wire", { color: P.walnut, roughness: 0.9 }), [0, 0, 0]);
  instances(cyl(0.027, 0.025, 0.048, 8), lacquer("dressing-sockets", P.midnight), sockets);
  const bulbs = instances(sphere(0.044, 10, 8), basic("dressing-bulbs", { color: "#ffffff", toneMapped: false }), bulbPlacements);
  const warm = new THREE.Color("#ffd68a").multiplyScalar(2);
  for (let i = 0; i < bulbs.count; i++) bulbs.setColorAt(i, warm);
  if (bulbs.instanceColor) { bulbs.instanceColor.setUsage(THREE.DynamicDrawUsage); bulbs.instanceColor.needsUpdate = true; }

  // Open, thick-lipped clay pots: the inward return is visible from the diorama camera.
  const pot = lathe("dressing-terracotta", [[0, 0.018], [0.16, 0.018], [0.175, 0.045], [0.225, 0.36], [0.245, 0.365], [0.245, 0.415], [0.208, 0.415], [0.201, 0.37], [0.158, 0.06]], 24);
  instances(pot, mat("dressing-clay", { color: "#cf7958", roughness: 0.94 }), PLANTS.map(([x, z], i) => ({ at: [x, 0.016, z], rot: [0, i * 0.73, 0] })), true);
  instances(cyl(0.199, 0.199, 0.014, 20), mat("dressing-soil", { color: P.walnut, roughness: 1 }), PLANTS.map(([x, z]) => ({ at: [x, 0.387, z] })));
  const leaves: Placement[] = [];
  for (const [i, [x, z]] of PLANTS.entries()) for (let k = 0; k < 9; k++) {
    const angle = k * 2.39996 + i * 0.73, height = 0.22 + (k % 3) * 0.045;
    leaves.push({ at: [x + Math.cos(angle) * 0.105, 0.63 + (k % 3) * 0.09, z + Math.sin(angle) * 0.105],
      rot: [Math.sin(angle) * 0.28, angle, Math.cos(angle) * 0.28],
      scale: [0.085, height, 0.045], color: k % 2 ? "#397b4f" : "#74a867" });
  }
  instances(sphere(1, 12, 8), mat("dressing-leaf", { color: "#ffffff", roughness: 0.88 }), leaves, true);

  // Six short pieces of painter's tape form three quiet chevrons toward the crate.
  const arrows: Placement[] = [];
  for (const z of [5.2, 3.8, 2.4]) for (const side of [-1, 1]) {
    arrows.push({ at: [0.3 + side * 0.11, 0.034, z], rot: [-HALF_PI, 0, side * Math.PI / 4] });
  }
  instances(plane(0.052, 0.32), basic("dressing-tape", { color: P.butter, transparent: true, opacity: 0.7, depthWrite: false }), arrows);

  // 20 base-pass draw calls: AO 1, paper 1, frieze 1, foam 1, frames 1, prints 4,
  // shades 3, wire 1, sockets 1, bulbs 1, pools 1, pots 1, soil 1, leaves 1, tape 1 = 20.
  return { root, bulbs, warm, color: new THREE.Color(), owned, lastTick: -1, wasCalm: false };
}

export function Dressing() {
  const dressing = useMemo(makeDressing, []);
  useEffect(() => () => {
    dressing.owned.forEach((resource) => resource.dispose());
  }, [dressing]);
  useFrame(({ clock }) => {
    const { bulbs, warm, color } = dressing;
    if (sim.calm) {
      // Restore steady light once if reduced motion is enabled during a twinkle.
      if (!dressing.wasCalm) {
        for (let i = 0; i < bulbs.count; i++) bulbs.setColorAt(i, warm);
        if (bulbs.instanceColor) bulbs.instanceColor.needsUpdate = true;
        dressing.wasCalm = true;
        dressing.lastTick = -1;
      }
      return;
    }
    dressing.wasCalm = false;
    const tick = Math.floor(clock.elapsedTime * 6);
    if (tick === dressing.lastTick) return;
    dressing.lastTick = tick;
    for (let i = 0; i < bulbs.count; i++) {
      // The three pendant bulbs remain steady; string lights drift gently, never flash off.
      const intensity = i >= bulbs.count - 3 ? 1 : 0.93 + 0.07 * Math.sin(tick * 0.19 + i * 1.71);
      bulbs.setColorAt(i, color.copy(warm).multiplyScalar(intensity));
    }
    if (bulbs.instanceColor) bulbs.instanceColor.needsUpdate = true;
  });
  return <primitive object={dressing.root} dispose={null} />;
}

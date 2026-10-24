/**
 * The back-room lobby, behind the DOM wall of cases. A long corridor in metres: deco carpet,
 * ribbed fabric walls in midnight navy, brass trims, amber sconces washing up the wall, and
 * recessed downlights with visible cones in the dust. The camera dollies along it exactly as
 * the case wall scrolls past, so the room and the shelves travel together.
 */
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { carpet, fabric } from "./textures";

const LENGTH = 40;

function glowTexture(inner: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildCinema(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

  scene.background = new THREE.Color("#07080c");
  scene.fog = new THREE.Fog("#090b12", 6, 22);

  const backZ = -5;
  const span = LENGTH + 20;

  // ---- carpet
  const carpetTex = keep(carpet());
  carpetTex.repeat.set(span / 4, 3);
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(span, 12)), keep(new THREE.MeshStandardMaterial({ map: carpetTex, roughness: 0.95 })));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(LENGTH / 2, 0, -1);
  floor.receiveShadow = true;
  scene.add(floor);

  // ---- the long wall: ribbed navy fabric, brass trims, a black skirting
  const fabricTex = keep(fabric("#141a2b"));
  fabricTex.repeat.set(span / 2, 2);
  const wall = new THREE.Mesh(keep(new THREE.PlaneGeometry(span, 5)), keep(new THREE.MeshStandardMaterial({ map: fabricTex, roughness: 0.85 })));
  wall.position.set(LENGTH / 2, 2.5, backZ);
  wall.receiveShadow = true;
  scene.add(wall);
  const brass = keep(new THREE.MeshStandardMaterial({ color: "#c9a457", roughness: 0.28, metalness: 0.9 }));
  const skirting = new THREE.Mesh(keep(new THREE.BoxGeometry(span, 0.22, 0.05)), keep(new THREE.MeshStandardMaterial({ color: "#050507", roughness: 0.4 })));
  skirting.position.set(LENGTH / 2, 0.11, backZ + 0.03);
  scene.add(skirting);
  const capRail = new THREE.Mesh(keep(new THREE.BoxGeometry(span, 0.04, 0.06)), brass);
  capRail.position.set(LENGTH / 2, 3.35, backZ + 0.04);
  scene.add(capRail);

  // ---- bays every 4 m: a brass trim, an amber sconce washing up the fabric
  const trimGeo = keep(new THREE.BoxGeometry(0.035, 3.2, 0.05));
  const sconceGeo = keep(new THREE.CylinderGeometry(0.16, 0.1, 0.32, 24, 1, true, 0, Math.PI));
  const sconceMat = keep(new THREE.MeshStandardMaterial({ color: "#2a1c0c", emissive: "#ffb35c", emissiveIntensity: 1.6, side: THREE.DoubleSide }));
  const washTex = keep(glowTexture("rgba(255,170,90,0.75)"));
  const washMat = keep(new THREE.MeshBasicMaterial({ map: washTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  const washGeo = keep(new THREE.PlaneGeometry(2.2, 3.2));
  for (let x = -6; x <= LENGTH + 6; x += 4) {
    const trim = new THREE.Mesh(trimGeo, brass);
    trim.position.set(x, 1.7, backZ + 0.03);
    scene.add(trim);
    const sx = x + 2;
    const sconce = new THREE.Mesh(sconceGeo, sconceMat);
    sconce.rotation.y = Math.PI;
    sconce.position.set(sx, 2.55, backZ + 0.05);
    scene.add(sconce);
    const wash = new THREE.Mesh(washGeo, washMat);
    wash.position.set(sx, 2.9, backZ + 0.06);
    scene.add(wash);
  }

  // ---- ceiling, recessed downlights, cones in the haze
  const ceiling = new THREE.Mesh(keep(new THREE.PlaneGeometry(span, 12)), keep(new THREE.MeshStandardMaterial({ color: "#06070a", roughness: 1 })));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(LENGTH / 2, 4, -1);
  scene.add(ceiling);
  const discGeo = keep(new THREE.CircleGeometry(0.12, 24));
  const discMat = keep(new THREE.MeshBasicMaterial({ color: "#f4f1ff" }));
  const coneGeo = keep(new THREE.ConeGeometry(1.15, 4, 40, 1, true));
  const coneMat = keep(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { color: { value: new THREE.Color("#b9c6ff") } },
      vertexShader: "varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = position.y; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }",
      fragmentShader: "uniform vec3 color; varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float h = clamp((vY+2.0)/4.0,0.0,1.0); float rim = pow(abs(dot(vN,vV)),1.6); gl_FragColor = vec4(color, 0.07*h*rim); }",
    }),
  );
  for (let x = -4; x <= LENGTH + 4; x += 4) {
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(x, 3.99, -2.2);
    scene.add(disc);
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(x, 2, -2.2);
    scene.add(cone);
  }

  // Real light: a pool that travels with you, plus cold fill and the sconces' warmth.
  const pool = new THREE.SpotLight("#d9e0ff", 34, 10, 0.55, 0.8, 1.4);
  pool.castShadow = true;
  pool.shadow.mapSize.set(1024, 1024);
  pool.shadow.radius = 5;
  scene.add(pool, pool.target);
  const warmA = new THREE.PointLight("#ffa55a", 5, 5, 1.8);
  const warmB = new THREE.PointLight("#ffa55a", 5, 5, 1.8);
  scene.add(warmA, warmB);
  scene.add(new THREE.HemisphereLight("#33406a", "#1a0a10", 0.45));

  camera.fov = 42;
  camera.near = 0.1;
  camera.far = 45;
  const look = new THREE.Vector3();
  let cx = 0;
  let cy = 1.6;
  return {
    update(dt: number) {
      const cur = sceneState.cinemaCurtain;
      const p = Math.max(0, (sceneState.cinema - cur) / (1 - cur));
      const tx = p * LENGTH + sceneState.px * 0.4;
      const ty = 1.6 - sceneState.py * 0.15;
      const k = 1 - Math.exp(-dt * 4);
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      camera.position.set(cx, cy, 4.6);
      look.set(cx + 0.4, 1.7, backZ);
      camera.lookAt(look);
      const near = Math.round((cx - 2) / 4) * 4 + 2;
      pool.position.set(Math.round(cx / 4) * 4, 3.9, -2.2);
      pool.target.position.set(pool.position.x, 0, -2.6);
      warmA.position.set(near, 2.6, backZ + 0.5);
      warmB.position.set(near + 4, 2.6, backZ + 0.5);
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };
}

/**
 * The record room, built in metres. You stand by the door looking at the back wall; the
 * spinning rack (DOM, in front of this canvas) stands in the middle of the floor. Around it:
 * oak boards, a green-painted dado, wall racks packed spine-out with real record spines, five
 * tungsten pendants, and at the back an archway where the colder light of the back room leaks
 * through a curtain gap. The camera breathes with the rack and your head.
 */
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { floorboards, plaster, rng } from "./textures";

const SPINES = ["#5a2a22", "#8a7556", "#2e3550", "#b9ad95", "#3f5a58", "#6d3a44", "#cfc6b4", "#4a3020", "#7a5b3a", "#2b2826", "#a8452e", "#d7c37a", "#22262c", "#e6e0d0", "#56406a"];

export function buildRecords(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
  const r = rng(21);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

  scene.background = new THREE.Color("#1b130d");
  scene.fog = new THREE.Fog("#1a110b", 7, 19);

  // ---- floor
  const fb = floorboards();
  keep(fb.map);
  keep(fb.roughness);
  const floorMat = keep(new THREE.MeshStandardMaterial({ map: fb.map, roughnessMap: fb.roughness, roughness: 0.62, metalness: 0 }));
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(30, 22)), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -2;
  floor.receiveShadow = true;
  scene.add(floor);

  // ---- back wall: plaster above, green dado below, a picture rail between
  const plasterTex = keep(plaster(3, [212, 202, 182]));
  const wallMat = keep(new THREE.MeshStandardMaterial({ map: plasterTex, roughness: 0.95 }));
  const backZ = -6.5;
  const back = new THREE.Mesh(keep(new THREE.PlaneGeometry(30, 5)), wallMat);
  back.position.set(0, 2.5, backZ);
  back.receiveShadow = true;
  scene.add(back);

  const dadoMat = keep(new THREE.MeshStandardMaterial({ color: "#1f1b18", roughness: 0.5, metalness: 0.05 }));
  const dado = new THREE.Mesh(keep(new THREE.BoxGeometry(30, 1.05, 0.06)), dadoMat);
  dado.position.set(0, 0.525, backZ + 0.03);
  dado.receiveShadow = true;
  scene.add(dado);
  const railMat = keep(new THREE.MeshStandardMaterial({ color: "#c9a457", roughness: 0.35, metalness: 0.7 }));
  const rail = new THREE.Mesh(keep(new THREE.BoxGeometry(30, 0.05, 0.09)), railMat);
  rail.position.set(0, 1.07, backZ + 0.05);
  scene.add(rail);

  // ---- the archway to the back room, centre back: dark, a curtain gap, cold light beyond
  const archGroup = new THREE.Group();
  const archW = 2.1;
  const archH = 3.0;
  const frameMat = keep(new THREE.MeshStandardMaterial({ color: "#1f1b18", roughness: 0.5 }));
  const jambGeo = keep(new THREE.BoxGeometry(0.22, archH, 0.3));
  for (const s of [-1, 1]) {
    const j = new THREE.Mesh(jambGeo, frameMat);
    j.position.set((s * (archW + 0.22)) / 2, archH / 2, 0);
    j.castShadow = true;
    archGroup.add(j);
  }
  const head = new THREE.Mesh(keep(new THREE.BoxGeometry(archW + 0.44, 0.3, 0.3)), frameMat);
  head.position.set(0, archH + 0.15, 0);
  archGroup.add(head);
  // Velvet beyond the opening, nearly black, with a slit of cold light.
  const velvet = keep(new THREE.MeshStandardMaterial({ color: "#3a0b14", roughness: 0.9 }));
  const curtain = new THREE.Mesh(keep(new THREE.PlaneGeometry(archW, archH)), velvet);
  curtain.position.set(0, archH / 2, -0.4);
  archGroup.add(curtain);
  const slit = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.06, archH * 0.96)), keep(new THREE.MeshBasicMaterial({ color: "#9fb4ff", transparent: true, opacity: 0.55 })));
  slit.position.set(0.15, archH / 2, -0.38);
  archGroup.add(slit);
  const sign = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.4, 0.26)), keep(new THREE.MeshBasicMaterial({ color: "#f3e6c8" })));
  sign.position.set(0, archH + 0.15, 0.16);
  archGroup.add(sign);
  archGroup.position.set(0, 0, backZ + 0.02);
  scene.add(archGroup);
  // The back room's colder light, leaking out through the curtain gap onto the frame only.
  const coldLeak = new THREE.SpotLight("#8aa2ff", 6, 3, 0.5, 1, 2);
  coldLeak.position.set(0.15, 2.6, backZ - 0.3);
  coldLeak.target.position.set(0.15, 0.8, backZ + 1.2);
  scene.add(coldLeak, coldLeak.target);

  // ---- wall racks, spine-out, either side of the arch: thousands of real records
  const shelfMat = keep(new THREE.MeshStandardMaterial({ color: "#5a3a20", roughness: 0.6 }));
  const spineGeo = keep(new THREE.BoxGeometry(1, 1, 1));
  const spineMat = keep(new THREE.MeshStandardMaterial({ roughness: 0.78, metalness: 0 }));
  const shelvesY = [1.25, 1.85, 2.45];
  const runs: [number, number][] = [
    [-11, -1.8],
    [1.8, 11],
  ];
  const mats: THREE.Matrix4[] = [];
  const cols: THREE.Color[] = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  for (const [x0, x1] of runs) {
    // Uprights and boards.
    for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 5) {
      const up = new THREE.Mesh(keep(new THREE.BoxGeometry(0.05, 1.9, 0.38)), shelfMat);
      up.position.set(x, 1.15 + 0.95, backZ + 0.22);
      up.castShadow = true;
      scene.add(up);
    }
    for (const y of shelvesY) {
      const board = new THREE.Mesh(keep(new THREE.BoxGeometry(x1 - x0, 0.035, 0.4)), shelfMat);
      board.position.set((x0 + x1) / 2, y - 0.02, backZ + 0.22);
      board.receiveShadow = true;
      board.castShadow = true;
      scene.add(board);
      // Pack the shelf: spines of uneven thickness, a few leaning, the odd gap.
      let x = x0 + 0.03;
      while (x < x1 - 0.03) {
        const t = 0.006 + r() * 0.016;
        if (r() < 0.012) {
          x += 0.12 + r() * 0.2;
          continue;
        }
        const lean = r() < 0.04 ? (r() - 0.5) * 0.5 : (r() - 0.5) * 0.03;
        e.set(0, 0, lean);
        q.setFromEuler(e);
        m.compose(new THREE.Vector3(x + t / 2, y + 0.155, backZ + 0.24), q, new THREE.Vector3(t, 0.31, 0.31));
        mats.push(m.clone());
        const c = new THREE.Color(SPINES[Math.floor(r() * SPINES.length)]);
        c.offsetHSL(0, (r() - 0.5) * 0.05, (r() - 0.5) * 0.08);
        cols.push(c);
        x += t + 0.0015;
      }
    }
  }
  const spines = new THREE.InstancedMesh(spineGeo, spineMat, mats.length);
  mats.forEach((mm, i) => {
    spines.setMatrixAt(i, mm);
    spines.setColorAt(i, cols[i]);
  });
  spines.castShadow = false;
  spines.receiveShadow = true;
  scene.add(spines);

  // ---- ceiling and pendants: the only light in the room is tungsten
  const ceiling = new THREE.Mesh(keep(new THREE.PlaneGeometry(30, 22)), keep(new THREE.MeshStandardMaterial({ color: "#3a2a1d", roughness: 1 })));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 3.8, -2);
  scene.add(ceiling);

  // Timber joists across the ceiling, picking up the warm bounce from the floor.
  const joistMat = keep(new THREE.MeshStandardMaterial({ color: "#6b4a2e", roughness: 0.8 }));
  const joistGeo = keep(new THREE.BoxGeometry(30, 0.22, 0.14));
  for (let z = -6; z <= 4; z += 1.6) {
    const j = new THREE.Mesh(joistGeo, joistMat);
    j.position.set(0, 3.69, z);
    scene.add(j);
  }

  const shadeGeo = keep(new THREE.LatheGeometry([new THREE.Vector2(0.02, 0), new THREE.Vector2(0.09, 0.02), new THREE.Vector2(0.22, 0.2), new THREE.Vector2(0.24, 0.24)].map((v) => new THREE.Vector2(v.x, -v.y)), 40));
  const shadeMat = keep(new THREE.MeshStandardMaterial({ color: "#141211", roughness: 0.38, metalness: 0.35, side: THREE.DoubleSide }));
  const bulbMat = keep(new THREE.MeshBasicMaterial({ color: "#ffd9a0" }));
  const bulbGeo = keep(new THREE.SphereGeometry(0.06, 20, 12));
  const cordMat = keep(new THREE.MeshBasicMaterial({ color: "#0d0907" }));
  const pendants = [-6, -3, 0, 3, 6];
  pendants.forEach((x, i) => {
    const drop = 0.9 + Math.abs(x) * 0.06;
    const y = 3.8 - drop;
    const z = -3.2 + (i % 2) * 0.6;
    const cord = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.006, 0.006, drop, 6)), cordMat);
    cord.position.set(x, 3.8 - drop / 2, z);
    scene.add(cord);
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.set(x, y, z);
    scene.add(shade);
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(x, y - 0.17, z);
    scene.add(bulb);
    const spot = new THREE.SpotLight("#ffb873", 26, 12, 0.78, 0.75, 1.6);
    spot.position.set(x, y - 0.12, z);
    spot.target.position.set(x * 0.9, 0, z - 1.4);
    if (x === 0) {
      spot.castShadow = true;
      spot.shadow.mapSize.set(1024, 1024);
      spot.shadow.bias = -0.0005;
      spot.shadow.radius = 6;
    }
    scene.add(spot, spot.target);
  });

  // Wall-washers: the racks and plaster glow warm from above, the way a shop wall is lit.
  for (const x of [-7.5, -4.2, 4.2, 7.5]) {
    const wash = new THREE.SpotLight("#ffc48a", 22, 7, 0.62, 0.9, 1.5);
    wash.position.set(x, 3.7, backZ + 1.8);
    wash.target.position.set(x, 1.7, backZ);
    scene.add(wash, wash.target);
  }
  // A small brass picture light over the arch sign.
  const picture = new THREE.SpotLight("#ffe2b0", 10, 3, 0.7, 0.6, 1.5);
  picture.position.set(0, 3.7, backZ + 0.7);
  picture.target.position.set(0, 3.0, backZ);
  scene.add(picture, picture.target);

  const hemi = new THREE.HemisphereLight("#ffd7a8", "#8a5a34", 0.8);
  scene.add(hemi);

  // ---- camera: by the door, eye height, looking past the rack at the arch
  camera.fov = 34;
  camera.near = 0.1;
  camera.far = 40;
  const look = new THREE.Vector3();
  let cx = 0;
  let cy = 0;
  return {
    update(dt: number) {
      const p = sceneState.records;
      const tx = (p - 0.5) * 1.6 + sceneState.px * 0.35;
      const ty = 1.62 - sceneState.py * 0.18;
      const k = 1 - Math.exp(-dt * 3.5);
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      camera.position.set(cx, cy, 5.2);
      look.set(cx * 0.35, 1.5, backZ);
      camera.lookAt(look);
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
      spines.dispose();
    },
  };
}

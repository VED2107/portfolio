"use client";
/**
 * The canvas. One renderer, one frame loop (R3F's), lights, and the rooms. Quality adapts:
 * device pixel ratio is capped by device class and stepped down if frames run long; the
 * environment's shadows are rendered once into a static map rather than every frame.
 */
import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FIXED_INTERACTABLES, arcadeInteractables, recordInteractables } from "./layout";
import { sim } from "./runtime";
import { world } from "./state";
import { Building } from "./three/Building";
import { RecordsArea } from "./three/Records";
import { Character } from "./three/Character";
import { CAM, Director, FloorTarget } from "./three/Director";
import { Studio } from "./three/Studio";
import { Arcade } from "./three/Arcade";
import { Releases } from "./three/Releases";
import { Counter } from "./three/Counter";
import { Lounge } from "./three/Lounge";
import { disposePaint } from "./three/paint";
import { Post } from "./three/Post";
import { Dressing } from "./three/Dressing";
import { Exterior } from "./three/Exterior";
import { Details } from "./three/Details";
import { disposeShapes } from "./three/shapes";

export type WorldContent = {
  wall: string[];
  crate: string[];
  titles: Record<string, string>;
  arcade: string[];
  releases: { when: string; title: string; slug?: string }[];
  honors: { title: string; by: string; when: string; photo?: string }[];
};

function Lights() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const glow = useRef<THREE.PointLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const { gl, scene } = useThree();
  const night = useRef(world.get().lights ? 0 : 1);

  // The night outside the diorama, drawn into the scene so the grade and grain treat it like everything else.
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 512;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, "#3a2f7a");
    grd.addColorStop(0.55, "#221c52");
    grd.addColorStop(1, "#3b1a45");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    scene.background = t;
    return () => {
      scene.background = null;
      t.dispose();
    };
  }, [scene]);

  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.42;
    pm.dispose();
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene]);

  useFrame((_, dt) => {
    const target = world.get().lights ? 0 : 1;
    night.current += (target - night.current) * (1 - Math.exp(-3 * dt));
    const n = night.current;
    if (sun.current) sun.current.intensity = THREE.MathUtils.lerp(2.3, 0.35, n);
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.lerp(1.0, 0.36, n);
    if (fill.current) fill.current.intensity = THREE.MathUtils.lerp(0.55, 0.3, n);
    if (lamp.current) lamp.current.intensity = THREE.MathUtils.lerp(6, 16, n);
    if (glow.current) glow.current.intensity = THREE.MathUtils.lerp(4, 14, n) * (0.92 + sim.level * 0.3);
    scene.environmentIntensity = THREE.MathUtils.lerp(0.42, 0.16, n);
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#fff1dc", "#6a4f8f", 1.25]} />
      <directionalLight
        ref={sun}
        position={[-11, 16, 9]}
        intensity={2.3}
        color="#ffe2bd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={4}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-17}
        shadow-camera-right={17}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={45}
      />
      {/* a cool fill from the open side models the forms the warm key leaves flat */}
      <directionalLight ref={fill} position={[14, 7, 12]} intensity={0.55} color="#b9c4ff" />
      {/* the lounge lamp and the sign: the only two real point lights */}
      <pointLight ref={lamp} position={[12.4, 2.3, 1.6]} color="#ffb877" intensity={6} distance={7} decay={1.6} />
      <pointLight ref={glow} position={[0, 3.2, -6.4]} color="#ffcf8a" intensity={4} distance={8} decay={1.8} />
    </>
  );
}

/**
 * Shadows: render the shadow map for the first second (while textures land) and whenever the
 * lights change, then leave it. Anything that moves uses a soft blob shadow instead.
 */
function StaticShadows() {
  const { gl } = useThree();
  const frames = useRef(0);
  const lights = useRef(world.get().lights);
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
  }, [gl]);
  useFrame(() => {
    frames.current++;
    const l = world.get().lights;
    if (frames.current < 60 || l !== lights.current) gl.shadowMap.needsUpdate = true;
    lights.current = l;
  });
  return null;
}

/**
 * Quality governor. Measures frame time in one-second windows and steps down through three
 * levels when frames run long (p > 22 ms twice in a row): DPR first, then bloom. Steps back up only
 * after six comfortable windows in a row, so it never oscillates.
 */
const LEVELS = (max: number) => [
  { dpr: 1, bloom: false },
  { dpr: Math.min(max, 1.25), bloom: true },
  { dpr: max, bloom: true },
];

function Governor({ max, start }: { max: number; start: number }) {
  const { setDpr, gl } = useThree();
  const win = useRef({ t: 0, n: 0, worst: 0, slow: 0, good: 0, level: start });
  useEffect(() => {
    const l = LEVELS(max)[start];
    setDpr(l.dpr);
    sim.quality = start;
  }, [max, start, setDpr]);
  useFrame((_, dt) => {
    const w = win.current;
    w.t += dt;
    w.n++;
    w.worst = Math.max(w.worst, dt);
    if (w.t < 1) return;
    const avg = w.t / w.n;
    const frames = w.n;
    w.t = w.n = 0;
    w.worst = 0;
    if (!document.hidden) {
      if (avg > 1 / 45) {
        w.good = 0;
        if (++w.slow >= 2 && w.level > 0) {
          w.level--;
          w.slow = 0;
        }
      } else if (avg < 1 / 57) {
        w.slow = 0;
        if (++w.good >= 6 && w.level < 2) {
          w.level++;
          w.good = 0;
        }
      }
      const l = LEVELS(max)[w.level];
      if (sim.quality !== w.level) {
        sim.quality = w.level;
        setDpr(l.dpr);
      }
    }
    gl.info.autoReset = false;
    (window as unknown as { __rv?: object }).__rv = { fps: Math.round(1 / avg), level: w.level, dpr: gl.getPixelRatio(), calls: Math.round(gl.info.render.calls / frames), tris: Math.round(gl.info.render.triangles / frames), geos: gl.info.memory.geometries, tex: gl.info.memory.textures };
    gl.info.reset();
  });
  return null;
}

/**
 * The map is a photograph of the shop: an orthographic camera straight above the floor plan,
 * rendered once into an offscreen target on request, then cached as an image.
 */
function MapCamera() {
  const { gl, scene } = useThree();
  useEffect(() => {
    let cached: string | null = null;
    sim.snapshot = () => {
      if (cached) return cached;
      const W = 1400, H = 800; // 28 × 16 m at 50 px per metre
      const cam = new THREE.OrthographicCamera(-14, 14, 8, -8, 0.1, 60);
      cam.position.set(0, 30, 0);
      cam.up.set(0, 0, -1);
      cam.lookAt(0, 0, 0);
      const target = new THREE.WebGLRenderTarget(W, H, { samples: 4 });
      // Offscreen targets skip the canvas's output conversion unless told their colour space.
      target.texture.colorSpace = THREE.SRGBColorSpace;
      const bg = scene.background;
      scene.background = new THREE.Color("#f6e7cc");
      const prev = gl.getRenderTarget();
      gl.setRenderTarget(target);
      gl.render(scene, cam);
      const px = new Uint8Array(W * H * 4);
      gl.readRenderTargetPixels(target, 0, 0, W, H, px);
      gl.setRenderTarget(prev);
      scene.background = bg;
      target.dispose();
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const g = c.getContext("2d")!;
      const img = g.createImageData(W, H);
      // GL rows run bottom-up; flip them.
      for (let y = 0; y < H; y++) img.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
      g.putImageData(img, 0, 0);
      cached = c.toDataURL("image/webp", 0.85);
      return cached;
    };
    // Take the photo while the visitor is still reading the front door, so the map opens instantly.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const timer = window.setTimeout(() => idle(() => sim.snapshot?.()), 4000);
    return () => {
      window.clearTimeout(timer);
      sim.snapshot = null;
    };
  }, [gl, scene]);
  return null;
}

/**
 * Before the door opens: compile every shader and upload every texture the shop uses, so walking
 * into a room for the first time never stalls on the GPU. Then say we're ready.
 */
function Ready() {
  const { gl, scene, camera } = useThree();
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      for (const mat of Array.isArray(m) ? m : m ? [m] : [])
        for (const v of Object.values(mat)) if (v instanceof THREE.Texture) gl.initTexture(v);
    });
    const compile = (gl as THREE.WebGLRenderer & { compileAsync?: (s: THREE.Object3D, c: THREE.Camera) => Promise<unknown> }).compileAsync;
    const finish = () => world.set({ gl: "ready", progress: 1 });
    if (compile) compile.call(gl, scene, camera).then(finish, finish);
    else {
      gl.compile(scene, camera);
      finish();
    }
  });
  return null;
}

export default function World({ content }: { content: WorldContent }) {
  const items = useMemo(
    () => [...recordInteractables(content.wall, content.titles), ...arcadeInteractables(content.arcade), ...FIXED_INTERACTABLES],
    [content],
  );
  useEffect(() => {
    sim.items = items;
  }, [items]);

  const mobile = typeof window !== "undefined" && matchMedia("(pointer: coarse)").matches;
  const maxDpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, mobile ? 1.5 : 2);
  // Phones start in the middle and earn their way up; desktops start at the top.
  const startLevel = mobile ? 1 : 2;

  // Sleeve art lands asynchronously; ask for a re-render of the shadow map when it does.
  const invalidate = useCallback(() => {}, []);

  useEffect(() => () => {
    disposePaint();
    disposeShapes();
  }, []);

  return (
    <Canvas
      className="world-canvas"
      shadows={{ type: THREE.PCFSoftShadowMap }}
      dpr={mobile ? 1.25 : maxDpr}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
      camera={{ fov: CAM.fov, near: 2, far: 220, position: [30, 30, 30] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.92;
        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          world.set({ gl: "lost" });
        });
        canvas.addEventListener("webglcontextrestored", () => world.set({ gl: "ready" }));
      }}
      onPointerMissed={() => {
        sim.hover = null;
      }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <Lights />
        <StaticShadows />
        <Governor max={maxDpr} start={startLevel} />
        <Building />
        <RecordsArea wall={content.wall} crate={content.crate} titles={content.titles} invalidate={invalidate} />
        <Studio />
        <Arcade titles={content.arcade} />
        <Releases releases={content.releases} honors={content.honors} /> <Counter /> <Lounge />
        <Exterior />
        <Dressing />
        <Details />
        <Character />
        <FloorTarget />
        <Director />
        <Post />
        <MapCamera />
        <Ready />
      </Suspense>
    </Canvas>
  );
}

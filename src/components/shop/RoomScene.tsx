"use client";

import { useEffect, useRef } from "react";
import { setupGsap } from "@/lib/motion";

type Kind = "records" | "cinema";

/**
 * A real 3D room behind the DOM objects. three.js loads only when the room is about to come
 * into view, renders only while it's on screen, caps the pixel ratio, and disposes everything
 * on the way out. Until it's ready (or if WebGL isn't there), the CSS-painted room shows.
 */
export function RoomScene({ kind }: { kind: Kind }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dead = false;
    let teardown = () => {};

    // Give the main thread back between heavy steps so scrolling never waits on the build.
    const idle = () =>
      new Promise<void>((res) => ("requestIdleCallback" in window ? requestIdleCallback(() => res(), { timeout: 400 }) : setTimeout(res, 16)));

    const start = async () => {
      const THREE = await import("three");
      await idle();
      const { buildRecords } = kind === "records" ? await import("./scene/records") : { buildRecords: null };
      const { buildCinema } = kind === "cinema" ? await import("./scene/cinema") : { buildCinema: null };
      if (dead) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      } catch {
        return; // No WebGL: the painted room stays.
      }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = kind === "records" ? 1.05 : 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      const canvas = renderer.domElement;
      canvas.className = "room-gl-canvas";
      canvas.setAttribute("aria-hidden", "true");
      el.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
      await idle();
      const room = buildRecords ? buildRecords(scene, camera) : buildCinema!(scene, camera);
      await idle();
      // Upload textures to the GPU one per idle slice, so the first frame doesn't pay for them.
      const maps = new Set<import("three").Texture>();
      scene.traverse((o) => {
        const mat = (o as import("three").Mesh).material as import("three").MeshStandardMaterial | undefined;
        for (const t of [mat?.map, mat?.roughnessMap]) if (t) maps.add(t);
      });
      for (const t of maps) {
        renderer.initTexture(t);
        await idle();
        if (dead) break;
      }
      // Compile shaders off the critical path (parallel where the driver allows it).
      try {
        await renderer.compileAsync(scene, camera);
      } catch {}
      if (dead) {
        room.dispose();
        renderer.dispose();
        return;
      }

      const size = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(el);

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);

      const gsap = setupGsap();
      let last = performance.now();
      let first = true;
      const frame = () => {
        const now = performance.now();
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        if (!visible || document.hidden) return;
        room.update(dt);
        renderer.render(scene, camera);
        if (first) {
          first = false;
          el.dataset.ready = "1";
          el.closest<HTMLElement>("[data-room]")?.setAttribute("data-gl", "1");
        }
      };
      gsap.ticker.add(frame);

      const lost = (e: Event) => {
        e.preventDefault();
        el.dataset.ready = "0";
        el.closest<HTMLElement>("[data-room]")?.removeAttribute("data-gl");
      };
      canvas.addEventListener("webglcontextlost", lost);

      teardown = () => {
        gsap.ticker.remove(frame);
        ro.disconnect();
        io.disconnect();
        canvas.removeEventListener("webglcontextlost", lost);
        room.dispose();
        scene.traverse((o) => {
          const m = o as import("three").Mesh;
          m.geometry?.dispose?.();
        });
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
        el.closest<HTMLElement>("[data-room]")?.removeAttribute("data-gl");
        delete el.dataset.ready;
      };
    };

    // Load as the room approaches, not before.
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        start();
      },
      { rootMargin: "250% 0px" },
    );
    near.observe(el);

    return () => {
      dead = true;
      near.disconnect();
      teardown();
    };
  }, [kind]);

  return <div ref={host} className="room-gl" aria-hidden />;
}

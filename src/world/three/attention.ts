import { sim } from "../runtime";
import { world } from "../state";
import { goUse } from "../control";
import type { ThreeEvent } from "@react-three/fiber";

/**
 * How much an object should respond right now, 0..1: in reach, hovered, or open. Read inside
 * useFrame; never causes a render.
 */
export function wants(id: string) {
  const near = world.get().near?.id === id;
  const mode = world.get().mode;
  const open = mode.kind === "inspect" && mode.id === id;
  return open ? 1 : near ? 0.75 : sim.hover === id ? 0.5 : 0;
}

/** Critically damped ease toward a target, frame-rate independent. */
export function ease(cur: number, to: number, rate: number, dt: number) {
  return cur + (to - cur) * (1 - Math.exp(-rate * dt));
}

/** Pointer handlers that make an object a way in: hover shows the hand, click walks there and uses it. */
export function handles(id: string) {
  return {
    onPointerOver(e: ThreeEvent<PointerEvent>) {
      e.stopPropagation();
      sim.hover = id;
      document.body.style.cursor = "pointer";
    },
    onPointerOut() {
      if (sim.hover === id) sim.hover = null;
      document.body.style.cursor = "";
    },
    onClick(e: ThreeEvent<MouseEvent>) {
      e.stopPropagation();
      goUse(id);
    },
  };
}

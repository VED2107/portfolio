"use client";
/**
 * The panel every station opens. A dialog with real focus management: focus moves in, Tab stays
 * in, Escape and the close button leave, and focus returns where it was.
 *
 * Desktop: a sheet from the right that leaves the store visible beside it (the camera frames the
 * object in the free space). Phone: a bottom sheet you can fling away; the release velocity is
 * projected forward to decide close-or-stay, so a quick flick closes it even from a short drag.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useDragControls, useReducedMotion, type PanInfo } from "motion/react";
import { X } from "@phosphor-icons/react";
import { sim } from "@/world/runtime";

/** Apple's projection: where a flick would come to rest. */
const project = (v: number, rate = 0.998) => ((v / 1000) * rate) / (1 - rate);

function useSide() {
  const [side, setSide] = useState<"right" | "bottom">("right");
  useLayoutEffect(() => {
    const mq = matchMedia("(max-width: 760px)");
    const on = () => setSide(mq.matches ? "bottom" : "right");
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return side;
}

export function Sheet({ label, kicker, wide, onClose, children, tint }: { label: string; kicker: string; wide?: boolean; onClose: () => void; children: React.ReactNode; tint?: string }) {
  const side = useSide();
  const ref = useRef<HTMLDivElement>(null);
  const calm = useReducedMotion();
  const drag = useDragControls();

  // Tell the camera how much screen the sheet takes, so it frames the object beside it.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    sim.sheet = side === "right" ? { side, frac: Math.min(0.7, (r.width + 24) / innerWidth) } : { side, frac: Math.min(0.9, r.height / innerHeight) };
    return () => {
      sim.sheet = { side: "right", frac: 0 };
    };
  }, [side, wide]);

  // Focus in, trap, Escape, restore.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const before = document.activeElement as HTMLElement | null;
    (el.querySelector<HTMLElement>("[data-autofocus]") ?? el).focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const f = [...el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, select, summary, [tabindex]:not([tabindex="-1"])')].filter((n) => n.offsetParent !== null || n === document.activeElement);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("keydown", onKey);
      if (before && document.contains(before)) before.focus({ preventScroll: true });
    };
  }, [onClose]);

  const offscreen = side === "right" ? { x: "105%" } : { y: "100%" };
  const spring = { type: "spring" as const, bounce: 0, duration: 0.44 };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const h = ref.current?.offsetHeight ?? 600;
    const rest = info.offset.y + project(info.velocity.y);
    if (rest > h * 0.4) onClose();
  };

  return (
    <>
      <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} aria-hidden />
      <motion.div
        ref={ref}
        className="sheet"
        data-side={side}
        data-wide={wide || undefined}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        style={{ "--accent-ink": tint } as React.CSSProperties}
        initial={calm ? { opacity: 0 } : offscreen}
        animate={calm ? { opacity: 1 } : { x: 0, y: 0 }}
        exit={calm ? { opacity: 0, transition: { duration: 0.15 } } : { ...offscreen, transition: { ...spring, duration: 0.36 } }}
        transition={calm ? { duration: 0.18 } : spring}
        drag={side === "bottom" && !calm ? "y" : false}
        dragListener={false}
        dragControls={drag}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.04, bottom: 0.9 }}
        dragSnapToOrigin
        onDragEnd={onDragEnd}
      >
        <div className="sheet-grip" onPointerDown={(e) => drag.start(e)} aria-hidden>
          <i />
        </div>
        <div className="sheet-head" onPointerDown={(e) => side === "bottom" && drag.start(e)}>
          <span className="cat">{kicker}</span>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Close and keep exploring" data-autofocus>
            <X aria-hidden weight="bold" width={18} height={18} />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </motion.div>
    </>
  );
}

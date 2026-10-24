"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Draggable } from "gsap/Draggable";
import { MATERIAL, setupGsap } from "@/lib/motion";
import { reduced } from "@/lib/capability";
import { play } from "@/lib/sound";

type Step = "idle" | "reading" | "webhook" | "approved";

const SCREEN: Record<Step, [string, string]> = {
  idle: ["Tap, insert", "or swipe"],
  reading: ["Reading card", "hold still…"],
  webhook: ["Waiting for", "the webhook…"],
  approved: ["Approved", "₹0.00"],
};

/**
 * The card terminal on the counter, just for fun. Drag the card onto it (or press it) and it
 * pays the way Vinny's Atelier does: the till never decides a bill is paid; it waits for a
 * signed webhook to say so. Then it prints you a receipt for nothing at all.
 */
export function PayTerminal() {
  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLButtonElement>(null);
  const term = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("idle");
  const busy = useRef(false);

  const pay = useCallback(() => {
    if (busy.current || !card.current || !term.current) return;
    busy.current = true;
    const gsap = setupGsap();
    const c = card.current;
    const t = term.current;
    // Lay the card on the terminal's reader, wherever it was dropped.
    const cb = c.getBoundingClientRect();
    const tb = t.getBoundingClientRect();
    const dx = tb.left + tb.width / 2 - (cb.left + cb.width / 2) + Number(gsap.getProperty(c, "x"));
    const dy = tb.top + tb.height * 0.62 - (cb.top + cb.height / 2) + Number(gsap.getProperty(c, "y"));
    const fast = reduced();
    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false;
      },
    });
    tl.to(c, { x: dx, y: dy, rotate: -8, duration: fast ? 0 : MATERIAL.sleeve.duration * 0.6, ease: MATERIAL.sleeve.ease })
      .add(() => {
        setStep("reading");
        play("key");
      })
      .to(c, { y: dy - 6, duration: 0.12, yoyo: true, repeat: fast ? 0 : 3, ease: "sine.inOut" })
      .add(() => setStep("webhook"), "+=0.5")
      .add(() => {
        setStep("approved");
        play("key");
        window.setTimeout(() => play("key"), 110);
      }, "+=1.1")
      .add(() => play("paper"))
      .fromTo(root.current!.querySelector(".pay-slip"), { yPercent: 100 }, { yPercent: 0, duration: fast ? 0 : 0.9, ease: "steps(9)" }, "<")
      .to(c, { x: 0, y: 0, rotate: 0, duration: fast ? 0 : MATERIAL.sleeve.duration, ease: MATERIAL.sleeve.ease }, "+=1.6")
      .add(() => setStep("idle"), "+=2.2")
      .to(root.current!.querySelector(".pay-slip"), { yPercent: 100, duration: fast ? 0 : 0.4, ease: MATERIAL.paper.ease }, "<");
  }, []);

  // Drag the card. Drop it on the terminal and it pays; anywhere else it springs back.
  useEffect(() => {
    const c = card.current;
    const t = term.current;
    if (!c || !t) return;
    const gsap = setupGsap();
    gsap.registerPlugin(Draggable);
    const [d] = Draggable.create(c, {
      type: "x,y",
      bounds: root.current!,
      zIndexBoost: false,
      allowNativeTouchScrolling: false,
      onPress: () => play("key"),
      onDragStart: () => gsap.to(c, { rotate: -4, scale: 1.04, duration: MATERIAL.ui.duration }),
      onRelease: function () {
        gsap.to(c, { scale: 1, duration: MATERIAL.ui.duration });
        if (busy.current) return;
        if (this.hitTest(t, "30%")) pay();
        else gsap.to(c, { x: 0, y: 0, rotate: 0, duration: MATERIAL.plastic.duration + 0.2, ease: MATERIAL.plastic.ease });
      },
      onClick: () => pay(),
    });
    return () => {
      d.kill();
    };
  }, [pay]);

  const [a, b] = SCREEN[step];

  return (
    <div ref={root} className="pay" data-step={step}>
      <button
        ref={card}
        type="button"
        className="pay-card"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pay();
          }
        }}
        aria-label="Pay with the shop card. Drag it onto the terminal, or press Enter."
        data-cursor="Drag"
      >
        <span className="pay-card-chip" aria-hidden />
        <span className="pay-card-brand pk" aria-hidden>
          VED · Staff
        </span>
        <span className="pay-card-no cat" aria-hidden>
          •••• 2107
        </span>
        <span className="pay-card-name pk" aria-hidden>
          You, the visitor
        </span>
      </button>

      <div ref={term} className="pay-term">
        <div className="pay-slip" aria-hidden>
          <span>VED RECORDS</span>
          <span>CARD •••• 2107</span>
          <span>TOTAL ₹0.00</span>
          <span>PAID · WEBHOOK ✓</span>
        </div>
        <div className="pay-screen" role="status" aria-live="polite">
          <span>{a}</span>
          <span>{b}</span>
        </div>
        <span className="pay-keys" aria-hidden />
        <span className="pay-reader pk" aria-hidden>
          Tap here
        </span>
      </div>
      <p className="pay-note small">Drag the card to the terminal. It only says paid when the webhook does.</p>
    </div>
  );
}

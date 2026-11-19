"use client";
import Image from "next/image";
import { useState } from "react";
import { PHOTOS } from "@/lib/content";
import { Flake } from "./icons";

const CARDS = [
  { p: PHOTOS.letter, pos: "50% 30%" },
  { p: PHOTOS.conclave, pos: "30% 40%" },
  { p: PHOTOS.bench, pos: "20% 50%" },
];

/**
 * Three real photographs, mostly one at rest. Hover fans them out on a spring; touch and keyboard
 * get the same fan through a real button. Reduced motion keeps them still.
 */
export function PhotoStack() {
  const [open, setOpen] = useState(false);
  return (
    <div className="stack enter" style={{ "--i": 0 } as React.CSSProperties} data-open={open}>
      {CARDS.map(({ p, pos }, i) => (
        <div key={p.src} className={`stack-card c${i}`} aria-hidden={i > 0 && !open ? true : undefined}>
          <Image src={p.src} alt={p.alt} width={p.w} height={p.h} sizes="140px" priority={i === 0} style={{ objectPosition: pos }} />
        </div>
      ))}
      <Flake className="stack-mark" />
      <button type="button" className="stack-toggle" aria-pressed={open} aria-label={open ? "Stack the photos" : "Fan out the photos"} onClick={() => setOpen((o) => !o)} />
    </div>
  );
}

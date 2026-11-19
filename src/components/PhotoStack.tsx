import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { PHOTOS } from "@/lib/content";
import { Flake } from "./icons";

const CARDS = [
  { p: PHOTOS.portrait, pos: "60% 40%" },
  { p: PHOTOS.dunes, pos: "35% 60%" },
  { p: PHOTOS.dubai, pos: "55% 70%" },
];

/**
 * Three real photographs, mostly one at rest. The stack is the way to the About page, as on the
 * reference: hover or keyboard focus fans the photos and waves the snowflake in, and following
 * the link carries the front photo into the About page's lead photo (a shared view transition).
 */
export function PhotoStack() {
  return (
    <Link href="/about" className="stack enter" style={{ "--i": 0 } as React.CSSProperties} aria-label="About Ved">
      {CARDS.map(({ p, pos }, i) => (
        <span key={p.src} className={`stack-card c${i}`} aria-hidden>
          {i === 0 ? (
            <ViewTransition name="ved-photo" share="photo-morph">
              <Image src={p.src} alt="" width={p.w} height={p.h} sizes="140px" priority style={{ objectPosition: pos }} />
            </ViewTransition>
          ) : (
            <Image src={p.src} alt="" width={p.w} height={p.h} sizes="140px" style={{ objectPosition: pos }} />
          )}
        </span>
      ))}
      <Flake className="stack-mark" />
      <span className="stack-tag" aria-hidden>
        About me <span>↗</span>
      </span>
    </Link>
  );
}

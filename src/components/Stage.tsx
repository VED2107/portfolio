/**
 * Project stages. Each is a finished hero image: the real product screenshot in a window,
 * floating over a soft photographic scene (composed with an image model from the actual
 * captures in public/work, then checked so every number and label matches the original).
 * Source files and the prompt live in ved-chauhan/image-kit.
 */
import Image from "next/image";
import type { CSSProperties } from "react";

/** Every hero is 1536 x 1024; the stage crops it to its own frame with object-fit: cover. */
export const HERO: Record<string, string> = {
  "amr-drug-repurposing": "/hero/amr-drug-repurposing.webp",
  nova: "/hero/nova.webp",
  "snowbros-atlas": "/hero/snowbros-atlas.webp",
  "stc-academy": "/hero/stc-academy.webp",
  "vinnys-atelier": "/hero/vinnys-atelier.webp",
  accounic: "/hero/accounic.webp",
  swiftdrop: "/hero/swiftdrop.webp",
  "vinnys-vogue": "/hero/vinnys-vogue.webp",
};

/** The Atlas finding from the README, drawn as the chain it reports (used in the case study). */
export function Chain({ box, compact }: { box?: CSSProperties; compact?: boolean }) {
  return (
    <div className="chain" style={box} aria-hidden>
      <p className="chain-tag" style={{ margin: "0 0 12px" }}>
        High · next/server-only-in-client · certain
      </p>
      <div className="chain-row">
        <span className="chain-node">src/components/Dashboard.tsx</span>
        {!compact && <span style={{ color: "var(--ink-2)" }}>client</span>}
      </div>
      <div className="chain-edge" />
      <div className="chain-row">
        <span className="chain-node">lib/metrics.ts</span>
      </div>
      <div className="chain-edge bad" />
      <div className="chain-row">
        <span className="chain-node bad">lib/db.ts</span>
        <span style={{ color: "var(--accent-ink)" }}>&quot;server-only&quot;</span>
      </div>
      <p className="chain-src">From the sample run in the Atlas README</p>
    </div>
  );
}

export function StageArt({ slug, priority, sizes = "(max-width: 760px) 100vw, 92vw" }: { slug: string; priority?: boolean; sizes?: string }) {
  const src = HERO[slug];
  if (!src) return null;
  return <Image className="stage-hero" src={src} alt="" fill sizes={sizes} priority={priority} quality={90} />;
}

export const STAGE_CLASS: Record<string, string> = Object.fromEntries(Object.keys(HERO).map((k) => [k, "stage-hero-frame"]));

/** Plain-language description of what each image shows, for people who can't see it. */
export const STAGE_ALT: Record<string, string> = {
  "amr-drug-repurposing":
    "The AMR Drug Repurposing overview, 'Old medicines, new questions', in a browser window over a softly blurred pharmacy lab: 20K molecular structures, 1,761 approved medicines checked, 1,019 repurposing candidates and 39,548 linked clinical studies.",
  nova: "NOVA playing Tears of Steel with subtitles, its Home screen behind it, floating over a lamp-lit living room at night. The title bar reports H264, 1280×534, hardware decoding.",
  "snowbros-atlas": "An Atlas HTML report in a dark window over a blurred late-night desk: health 93 overall, 66 architecture, 100 for dependencies, environment, imports and performance, 90 security, then a finding with its confidence.",
  "stc-academy": "The STC Academy home page, 'Cultivating the Intellect of Tomorrow', with its academic pathways page overlapping it, over a softly lit classroom.",
  "vinnys-atelier": "The Vinny's Atelier till over a blurred boutique: a new invoice with three garments, a 10% discount, a net amount of ₹807.30 and a Razorpay dynamic QR selected.",
  accounic: "Accounic's web dashboard over a calm home desk: net position, receivable, payable and settled totals, and cash in hand per currency.",
  swiftdrop: "The SwiftDrop site, 'Send anything. Directly.', with its transfer console at 32.0 MB/s from an iPhone to a PC, over a sunlit living room.",
  "vinnys-vogue": "The Vinny's Vogue storefront, 'Where Fashion Meets Elegance', over softly blurred maroon and gold bridal fabric.",
};

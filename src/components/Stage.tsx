/**
 * Art-directed project stages. Every pixel inside is a real capture of the product; a "loupe" is
 * a tighter crop of the same capture so a detail stays legible. Desktop and mobile are composed
 * separately rather than shrinking one picture.
 */
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { Img } from "@/lib/work";

type Box = { left?: string; top?: string; right?: string; bottom?: string; width: string };

const AMR: Img = { src: "/work/amr-site.webp", alt: "", w: 1440, h: 900 };
const NOVA: Img = { src: "/work/nova-player.webp", alt: "", w: 960, h: 600 };
const NOVA_HOME: Img = { src: "/work/nova-home.webp", alt: "", w: 960, h: 600 };
const ATLAS: Img = { src: "/work/atlas-site.webp", alt: "", w: 1440, h: 900 };
const STC: Img = { src: "/work/stc-home.webp", alt: "", w: 1440, h: 900 };
const STC_PATHS: Img = { src: "/work/stc-scroll.webp", alt: "", w: 1440, h: 900 };
const ATELIER: Img = { src: "/work/atelier.webp", alt: "", w: 1920, h: 1200 };
const ACCOUNIC: Img = { src: "/work/accounic-dash.webp", alt: "", w: 1440, h: 900 };

/** A capture in a minimal window frame. `bar` is the address shown, or false for a native app. */
function Shot({ img, box, bar, dark, priority, sizes, z }: { img: Img; box: Box; bar?: string | false; dark?: boolean; priority?: boolean; sizes: string; z?: number }) {
  const chrome = bar !== false;
  const style: CSSProperties = { ...box, aspectRatio: chrome ? undefined : `${img.w} / ${img.h}`, zIndex: z };
  return (
    <div className={`shot${dark ? " dark" : ""}`} style={style}>
      {chrome && (
        <div className="chrome" aria-hidden>
          <i />
          <i />
          <i />
          {bar && <span>{bar}</span>}
        </div>
      )}
      <div className={`viewport${chrome ? "" : " full"}`} style={chrome ? { position: "relative", inset: "auto", aspectRatio: `${img.w} / ${img.h}` } : undefined}>
        <Image src={img.src} alt="" fill sizes={sizes} priority={priority} quality={90} style={{ objectFit: "cover", objectPosition: "top left" }} />
      </div>
    </div>
  );
}

/** A tighter crop of a capture. `r` is the region in fractions of the image: x, y, w, h. */
function Loupe({ img, r, box, label, z = 3 }: { img: Img; r: [number, number, number, number]; box: Box; label?: ReactNode; z?: number }) {
  const [x, y, w, h] = r;
  return (
    <div className="loupe" style={{ ...box, aspectRatio: `${w * img.w} / ${h * img.h}`, zIndex: z }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a crop needs the raw image positioned beyond its box */}
      <img src={img.src} alt="" loading="lazy" decoding="async" style={{ width: `${100 / w}%`, left: `${(-x / w) * 100}%`, top: `${(-y / h) * 100}%` }} />
      {label}
    </div>
  );
}

/** The Atlas finding from the README, drawn as the chain it reports. */
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
      <p style={{ margin: "14px 0 0", fontSize: 10.5, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-3)" }}>From the sample run in the Atlas README</p>
    </div>
  );
}

const DESK = "(max-width: 760px) 100vw, 70vw";

export function StageArt({ slug, priority }: { slug: string; priority?: boolean }) {
  switch (slug) {
    case "amr-drug-repurposing":
      return (
        <>
          <div className="only-desktop">
            <Shot img={AMR} bar="amr-drug-repurposing.vercel.app" box={{ left: "6%", top: "9%", width: "66%" }} sizes={DESK} priority={priority} />
            <Loupe img={AMR} r={[0.555, 0.515, 0.405, 0.375]} box={{ right: "5%", bottom: "9%", width: "37%" }} />
          </div>
          <div className="only-mobile">
            <Loupe img={AMR} r={[0.02, 0.17, 0.46, 0.36]} box={{ left: "6%", top: "6%", width: "88%" }} z={2} />
            <Loupe img={AMR} r={[0.555, 0.515, 0.405, 0.375]} box={{ right: "6%", bottom: "6%", width: "88%" }} />
          </div>
        </>
      );
    case "nova":
      return (
        <>
          <div className="only-desktop">
            <Shot img={NOVA_HOME} bar={false} box={{ left: "5%", top: "13%", width: "40%" }} sizes="30vw" z={1} />
            <Shot img={NOVA} bar={false} dark box={{ right: "5%", top: "8%", width: "62%" }} sizes={DESK} priority={priority} z={2} />
            <Loupe img={NOVA} r={[0.0, 0.0, 0.3, 0.07]} box={{ left: "8%", bottom: "10%", width: "33%" }} />
          </div>
          <div className="only-mobile">
            <Shot img={NOVA} bar={false} dark box={{ left: "5%", top: "9%", width: "90%" }} sizes="(max-width: 760px) 90vw, 1px" priority={priority} />
            <Loupe img={NOVA} r={[0.0, 0.0, 0.3, 0.07]} box={{ left: "5%", bottom: "11%", width: "84%" }} />
          </div>
        </>
      );
    case "snowbros-atlas":
      return (
        <>
          <div className="only-desktop">
            <Shot img={ATLAS} bar="" dark box={{ left: "6%", top: "9%", width: "60%" }} sizes={DESK} priority={priority} />
            <Chain box={{ right: "5%", top: "50%", translate: "0 -50%" }} />
          </div>
          <div className="only-mobile">
            <Loupe img={ATLAS} r={[0, 0.03, 0.62, 0.6]} box={{ left: "6%", top: "6%", width: "88%" }} z={1} />
            <Chain compact box={{ left: "6%", bottom: "6%", right: "6%" }} />
          </div>
        </>
      );
    case "stc-academy":
      return (
        <>
          <div className="only-desktop">
            <Shot img={STC} bar="stc.vercel.app" box={{ left: "6%", top: "9%", width: "62%" }} sizes={DESK} priority={priority} z={1} />
            <Shot img={STC_PATHS} bar="stc.vercel.app" box={{ right: "5%", bottom: "-6%", width: "40%" }} sizes="30vw" z={2} />
          </div>
          <div className="only-mobile">
            <Loupe img={STC} r={[0.16, 0.28, 0.68, 0.52]} box={{ left: "6%", top: "6%", width: "88%" }} z={1} />
            <Loupe img={STC_PATHS} r={[0.02, 0.24, 0.66, 0.5]} box={{ left: "6%", bottom: "6%", width: "88%" }} />
          </div>
        </>
      );
    case "vinnys-atelier":
      return <Shot img={ATELIER} bar="Vinny's Atelier · till" box={{ left: "7%", top: "11%", width: "86%" }} sizes="(max-width: 760px) 100vw, 45vw" />;
    case "accounic":
      return <Shot img={ACCOUNIC} bar="accounic · web" box={{ left: "7%", top: "11%", width: "86%" }} sizes="(max-width: 760px) 100vw, 45vw" />;
    default:
      return null;
  }
}

export const STAGE_CLASS: Record<string, string> = {
  "amr-drug-repurposing": "stage-amr",
  nova: "stage-nova",
  "snowbros-atlas": "stage-atlas",
  "stc-academy": "stage-stc",
  "vinnys-atelier": "stage-atelier",
  accounic: "stage-accounic",
};

/** Plain-language description of what each composition shows, for people who can't see it. */
export const STAGE_ALT: Record<string, string> = {
  "amr-drug-repurposing":
    "The AMR Drug Repurposing overview, 'Old medicines, new questions', with a close-up of its approved-medicine library: 1,761 medicines checked, 1,019 repurposing candidates and 39,548 linked clinical studies.",
  nova: "NOVA playing Tears of Steel with subtitles, beside its Home screen, with a close-up of the title bar reporting what the engine decoded: H264, 1280×534, hardware decoding.",
  "snowbros-atlas":
    "An Atlas HTML report with health scores, beside a drawing of one finding: a client component, Dashboard.tsx, imports lib/metrics.ts, which imports the server-only lib/db.ts.",
  "stc-academy": "The STC Academy home page, 'Cultivating the Intellect of Tomorrow', with its academic pathways section beside it.",
  "vinnys-atelier": "The Vinny's Atelier till: a new invoice with three garments, a 10% discount and a Razorpay dynamic QR selected.",
  accounic: "Accounic's web dashboard: net position, receivable, payable and settled totals, and cash in hand per currency.",
};

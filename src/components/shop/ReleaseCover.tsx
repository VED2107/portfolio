import Image from "next/image";
import type { Release } from "@/lib/catalog";

/**
 * Sleeve art. Every release gets its own cover, composed from its real screenshot and its real
 * numbers, so it can be recognised from across the shop. The packaging around it (catalogue
 * number, label mark, gloss) is shared, which is what makes it one collection.
 */
export function ReleaseCover({ r, sizes = "(min-width: 1024px) 34vw, 86vw", priority = false }: { r: Release; sizes?: string; priority?: boolean }) {
  return (
    <div className={`cover cover-${r.art}`} style={{ "--sleeve": r.sleeve, "--sleeve-ink": r.ink, "--disc": r.disc } as React.CSSProperties}>
      <Art r={r} sizes={sizes} priority={priority} />
      <span className="cover-cat cat" aria-hidden>
        {r.cat}
      </span>
      {r.label === "SNOWBROS" && <LabelMark />}
      <span className="cover-gloss" aria-hidden />
    </div>
  );
}

function Shot({ r, sizes, priority, className }: { r: Release; sizes: string; priority: boolean; className: string }) {
  if (!r.plate) return null;
  return <Image className={className} src={r.plate.src} alt="" width={r.plate.w} height={r.plate.h} sizes={sizes} priority={priority} quality={75} />;
}

/** SNOWBROS releases carry the label's roundel, like an imprint in the corner of a sleeve. */
export function LabelMark() {
  return (
    <span className="labelmark" aria-hidden>
      <svg viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path id="lm" d="M20,20 m-13,0 a13,13 0 1,1 26,0 a13,13 0 1,1 -26,0" fill="none" />
        <text fontSize="5.4" letterSpacing="1.6" fill="currentColor" fontFamily="var(--f-sans)" fontWeight="700">
          <textPath href="#lm">SNOWBROS · SNOWBROS ·</textPath>
        </text>
        <path d="M20 13v14M13.9 16.5l12.2 7M13.9 23.5l12.2-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Art({ r, sizes, priority }: { r: Release; sizes: string; priority: boolean }) {
  const p = { r, sizes, priority };
  switch (r.art) {
    case "atlas":
      // Swiss: the name stacked as a column, the report printed in one ink, the import chain drawn over it.
      return (
        <>
          <span className="atlas-word" aria-hidden>
            ATLAS
          </span>
          <span className="atlas-plate">
            <Shot {...p} className="atlas-shot" />
          </span>
          <svg className="atlas-chain" viewBox="0 0 100 100" aria-hidden preserveAspectRatio="none">
            <polyline points="8,30 26,30 26,52 46,52 46,74 64,74" />
            <circle cx="8" cy="30" r="1.6" />
            <circle cx="26" cy="52" r="1.6" />
            <circle cx="46" cy="74" r="1.6" />
            <circle cx="64" cy="74" r="2.4" />
          </svg>
          <span className="atlas-tag" aria-hidden>
            Evidence
            <br />
            or silence
          </span>
        </>
      );
    case "swiftdrop":
      // Speed: the measured throughput, set huge, with the site sliding through as a band.
      return (
        <>
          <span className="swift-lines" aria-hidden />
          <span className="swift-num" aria-hidden>
            314
            <small>MB/s</small>
          </span>
          <span className="swift-band">
            <Shot {...p} className="swift-shot" />
          </span>
          <span className="swift-title" aria-hidden>
            Swift
            <br />
            Drop
          </span>
        </>
      );
    case "accounic":
      // A ledger page: ruled lines, a red margin, the dashboard pasted in like a statement.
      return (
        <>
          <span className="ledger-rules" aria-hidden />
          <span className="ledger-title" aria-hidden>
            Accounic
          </span>
          <span className="ledger-paste">
            <Shot {...p} className="ledger-shot" />
          </span>
          <span className="ledger-zero" aria-hidden>
            <b>0.00</b>
            <span>floats in the money path</span>
          </span>
        </>
      );
    case "atelier":
      // Kraft paper, a till receipt torn off, a garment price tag on a string.
      return (
        <>
          <span className="kraft" aria-hidden />
          <span className="receipt">
            <Shot {...p} className="receipt-shot" />
          </span>
          <span className="tag" aria-hidden>
            <i />
            <b>Atelier</b>
            <span>Vinny&rsquo;s · paise</span>
          </span>
        </>
      );
    case "vogue":
      // Fashion editorial: full-bleed image in one ink, the name in a bridal italic.
      return (
        <>
          <span className="vogue-bleed">
            <Shot {...p} className="vogue-shot" />
          </span>
          <span className="vogue-name" aria-hidden>
            <small>Vinny&rsquo;s</small>
            Vogue
          </span>
          <span className="vogue-line pk" aria-hidden>
            Bridal · Festive · Couture
          </span>
        </>
      );
    case "amr":
      // A journal plate: a hexagon field, the count of medicines, the overview as Plate 7.
      return (
        <>
          <span className="amr-hex" aria-hidden />
          <span className="amr-count" aria-hidden>
            1,761
            <small>medicines × 4 targets</small>
          </span>
          <span className="amr-plate">
            <Shot {...p} className="amr-shot" />
            <span className="pk">Plate 700</span>
          </span>
          <span className="amr-title pk" aria-hidden>
            AMR Drug Repurposing
          </span>
        </>
      );
    case "nova":
      // The player as artwork: a frame of black, the seek bar with an A–B loop, a timecode exact to the frame.
      return (
        <>
          <span className="nova-glow" aria-hidden />
          <span className="nova-word" aria-hidden>
            NOVA
          </span>
          <span className="nova-bar" aria-hidden>
            <span className="nova-loop" />
            <span className="nova-head" />
            <b className="nova-a">A</b>
            <b className="nova-b">B</b>
          </span>
          <span className="nova-tc cat" aria-hidden>
            00:42:17:08
          </span>
          <span className="nova-line pk" aria-hidden>
            No account · no telemetry · works offline
          </span>
        </>
      );
    case "stc":
      return (
        <>
          <span className="stc-ground">
            <Shot {...p} className="stc-shot" />
          </span>
          <span className="stc-crest" aria-hidden>
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" />
              <circle cx="50" cy="50" r="39" />
              <path id="stc-ring" d="M50,50 m-42.5,0 a42.5,42.5 0 1,1 85,0 a42.5,42.5 0 1,1 -85,0" fill="none" stroke="none" />
              <text fontSize="5.2" letterSpacing="2.1">
                <textPath href="#stc-ring">CBSE · GSEB · JEE · NEET · PRIMARY TO ENTRANCE ·</textPath>
              </text>
            </svg>
            <b>STC</b>
          </span>
          <span className="stc-title" aria-hidden>
            Academy
          </span>
        </>
      );
  }
}

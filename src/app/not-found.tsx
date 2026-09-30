import { Action } from "@/components/Action";
import { DrawOnView } from "@/components/DrawOnView";

export const metadata = { title: "FIG. 404" };

export default function NotFound() {
  return (
    <main id="main" className="sheet-inner min-h-[calc(100dvh-var(--header-h))] content-center gap-y-12 py-16">
      <div className="col-span-12 lg:col-span-5">
        <p className="ref text-[0.9rem]">404</p>
        <h1 className="t-display mt-3 text-[clamp(3rem,1.5rem+5vw,6rem)]">No such sheet.</h1>
        <p className="t-lede mt-6 max-w-[34ch]">This page isn&rsquo;t in the filing. It may have been withdrawn, or it was never drawn in the first place.</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Action href="/" dir="left" transitionTypes={["nav-back"]}>
            Back to the cover
          </Action>
          <p className="t-small flex items-center gap-1.5">
            or press <span className="kbd">/</span> and search
          </p>
        </div>
      </div>
      <figure className="col-span-12 lg:col-span-6 lg:col-start-7">
        <div className="fig bg-[var(--paper-3)] p-8">
          <DrawOnView className="drawing">
            <svg viewBox="0 0 600 420" role="img" aria-label="An empty drawing plate with its lead line pointing at nothing.">
              <path d="M 120 220 L 300 120 L 480 220 L 300 320 Z" pathLength={1} className="d-line" strokeDasharray="6 6" style={{ "--i": 0 } as React.CSSProperties} />
              <path d="M 120 250 L 300 150 L 480 250" pathLength={1} className="d-line" opacity={0.35} style={{ "--i": 1 } as React.CSSProperties} />
              <path d="M 300 220 C 360 220, 400 90, 500 80" pathLength={1} className="d-line" style={{ "--i": 2 } as React.CSSProperties} />
              <circle cx={300} cy={220} r={3.5} className="d-dot draw-fade" />
              <text x={510} y={76} className="d-num draw-fade">
                404
              </text>
              <text x={510} y={94} className="d-note draw-fade">
                intentionally blank
              </text>
            </svg>
          </DrawOnView>
        </div>
        <figcaption className="fig-caption">
          <b>FIG. 404</b>
          <span>A plate with nothing on it. The lead line still points, out of habit.</span>
        </figcaption>
      </figure>
    </main>
  );
}

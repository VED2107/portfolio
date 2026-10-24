import type { Release } from "@/lib/catalog";

/**
 * A record. Grooves, a centre label printed with the release's own credits, and the run-out
 * groove etched with a line you can only read up close. Purely visual: whatever spins it
 * (scroll, pointer, a hand) sets its transform.
 */
export function Vinyl({ r, side = "A", className = "" }: { r: Release; side?: "A" | "B"; className?: string }) {
  return (
    <div className={`vinyl ${className}`} style={{ "--disc": r.disc, "--sleeve": r.sleeve } as React.CSSProperties} aria-hidden>
      <div className="vinyl-disc">
        <svg className="vinyl-runout" viewBox="0 0 200 200">
          <path id={`ro-${r.slug}-${side}`} d="M100,100 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0" fill="none" />
          <text fontSize="3.6" letterSpacing="0.6">
            <textPath href={`#ro-${r.slug}-${side}`}>
              {r.cat.replace(" ", "-")}-{side} · {r.runout} · pressed by V.S.C.
            </textPath>
          </text>
        </svg>
        <div className="vinyl-label">
          <span className="vinyl-label-top">{r.label === "SNOWBROS" ? "SNOWBROS" : "VED"}</span>
          <span className="vinyl-label-title">{r.title}</span>
          <span className="vinyl-label-meta">
            {r.cat} · SIDE {side} · 33⅓
          </span>
          <span className="vinyl-hole" />
        </div>
      </div>
      <span className="vinyl-sheen" />
    </div>
  );
}

import { DrawOnView } from "./DrawOnView";

/*
 * Patent-style line drawings of real architecture. Labels come straight from the
 * projects' READMEs. Every stroke carries pathLength=1 so it can draw itself once.
 */

type Box = { x: number; y: number; w: number; h: number; name: string; note?: string; n: number; solid?: boolean; hatch?: boolean };

function Crate({ b, i }: { b: Box; i: number }) {
  return (
    <g style={{ "--i": i } as React.CSSProperties}>
      {b.hatch && <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="url(#hatch)" className="draw-fade" />}
      <rect x={b.x} y={b.y} width={b.w} height={b.h} pathLength={1} className={b.solid ? "d-solid" : "d-line"} />
      <text x={b.x + 12} y={b.y + 18} className="d-num draw-fade">
        {b.n}
      </text>
      <text x={b.x + b.w / 2} y={b.y + b.h / 2 + (b.note ? 0 : 5)} textAnchor="middle" className={`d-name draw-fade ${b.solid ? "d-inv" : ""}`}>
        {b.name}
      </text>
      {b.note && (
        <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 18} textAnchor="middle" className={`d-note draw-fade ${b.solid ? "d-inv" : ""}`}>
          {b.note}
        </text>
      )}
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="7" className="d-hatch" />
      </pattern>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" className="d-arrowhead" />
      </marker>
    </defs>
  );
}

function AtlasCrates() {
  const W = 860;
  const col = (n: number, i: number, gap = 16) => {
    const w = (W - 80 - gap * (n - 1)) / n;
    return { x: 40 + i * (w + gap), w };
  };
  const rows: Box[] = [
    { ...col(2, 0), y: 30, h: 58, name: "snowbros (cli)", note: "sb · snowbros", n: 110, solid: true },
    { ...col(2, 1), y: 30, h: 58, name: "snowbros_lsp", note: "sb lsp · editors", n: 112, solid: true },
    { ...col(1, 0), y: 112, h: 58, name: "snowbros_engine", note: "one analyze() entry point", n: 114 },
    { ...col(2, 0), y: 194, h: 58, name: "snowbros_rules", note: "registry · metadata", n: 116 },
    { ...col(2, 1), y: 194, h: 58, name: "snowbros_output", note: "terminal · json · sarif · html", n: 118 },
    { ...col(3, 0), y: 276, h: 58, name: "snowbros_graph", note: "cycles · reachability", n: 120 },
    { ...col(3, 1), y: 276, h: 58, name: "snowbros_resolver", note: "tsconfig · aliases", n: 122 },
    { ...col(3, 2), y: 276, h: 58, name: "snowbros_cache", note: "xxh3 · incremental", n: 124 },
    { ...col(3, 0), y: 358, h: 58, name: "snowbros_scanner", note: "file walk", n: 126 },
    { ...col(3, 1), y: 358, h: 58, name: "snowbros_parser", note: "Tree-sitter · facts", n: 128 },
    { ...col(3, 2), y: 358, h: 58, name: "snowbros_framework", note: "detection", n: 130 },
    { ...col(1, 0), y: 440, h: 58, name: "snowbros_core", note: "Diagnostic · Severity · Confidence · Span · Config", n: 132, hatch: true },
  ];
  return (
    <svg viewBox={`0 0 ${W} 530`} role="img" aria-label="Snowbros Atlas crate architecture: core at the base; scanner, parser and framework detection; graph, resolver and cache; rules and output; the engine; and the CLI and language server on top.">
      <Defs />
      <line x1={W - 16} y1={496} x2={W - 16} y2={40} pathLength={1} className="d-line" markerEnd="url(#arrow)" style={{ "--i": 12 } as React.CSSProperties} />
      {rows.map((b, i) => (
        <Crate key={b.n} b={b} i={i} />
      ))}
    </svg>
  );
}

function AccounicArch() {
  const clients = [
    { x: 40, name: "Next.js web", note: "+ service role, admin only", n: 210 },
    { x: 320, name: "Flutter Android", note: "real + demo", n: 212 },
    { x: 600, name: "Flutter Windows", note: "real + demo", n: 214 },
  ];
  return (
    <svg viewBox="0 0 860 470" role="img" aria-label="Accounic architecture: one PostgreSQL and Supabase database holding profiles, people, transactions and settlements, with RLS for tenant isolation, views as the balance engine and RPCs for validated writes. Three clients connect with the anon key and the user's JWT: a Next.js web app, a Flutter Android app and a Flutter Windows app.">
      <Defs />
      {/* Database: a drafted cylinder */}
      <g style={{ "--i": 0 } as React.CSSProperties}>
        <path d="M 250 60 A 180 26 0 0 0 610 60 A 180 26 0 0 0 250 60 Z" pathLength={1} className="d-line" />
        <path d="M 250 60 L 250 230 A 180 26 0 0 0 610 230 L 610 60" pathLength={1} className="d-line" />
        <path d="M 250 60 A 180 26 0 0 0 610 60 L 610 230 A 180 26 0 0 1 250 230 Z" fill="url(#hatch)" className="draw-fade" opacity={0.35} />
      </g>
      <text x={430} y={118} textAnchor="middle" className="d-name draw-fade">
        PostgreSQL / Supabase
      </text>
      <text x={430} y={146} textAnchor="middle" className="d-note draw-fade">
        profiles · people
      </text>
      <text x={430} y={166} textAnchor="middle" className="d-note draw-fade">
        transactions · settlements
      </text>
      <text x={262} y={52} className="d-num draw-fade">
        200
      </text>

      {/* Callouts on the database */}
      {[
        { y: 100, label: "RLS: tenant isolation", n: 202 },
        { y: 150, label: "views: balance engine", n: 204 },
        { y: 200, label: "RPCs: validated writes", n: 206 },
      ].map((c, i) => (
        <g key={c.n} style={{ "--i": 1 + i } as React.CSSProperties}>
          <path d={`M 610 ${c.y} C 650 ${c.y}, 640 ${c.y}, 676 ${c.y}`} pathLength={1} className="d-line" />
          <circle cx={610} cy={c.y} r={3} className="d-dot draw-fade" />
          <text x={684} y={c.y - 4} className="d-num draw-fade">
            {c.n}
          </text>
          <text x={684} y={c.y + 14} className="d-note d-left draw-fade">
            {c.label}
          </text>
        </g>
      ))}

      {/* Connection bus */}
      <g style={{ "--i": 4 } as React.CSSProperties}>
        <line x1={430} y1={258} x2={430} y2={322} pathLength={1} className="d-line" markerStart="url(#arrow)" />
        <line x1={150} y1={322} x2={710} y2={322} pathLength={1} className="d-line" />
      </g>
      <text x={444} y={296} className="d-note d-left draw-fade">
        anon key + user JWT
      </text>

      {clients.map((c, i) => (
        <g key={c.n} style={{ "--i": 5 + i } as React.CSSProperties}>
          <line x1={c.x + 110} y1={322} x2={c.x + 110} y2={360} pathLength={1} className="d-line" markerEnd="url(#arrow)" />
          <rect x={c.x} y={362} width={220} height={70} pathLength={1} className="d-line" />
          <text x={c.x + 12} y={380} className="d-num draw-fade">
            {c.n}
          </text>
          <text x={c.x + 110} y={400} textAnchor="middle" className="d-name draw-fade">
            {c.name}
          </text>
          <text x={c.x + 110} y={420} textAnchor="middle" className="d-note draw-fade">
            {c.note}
          </text>
        </g>
      ))}
    </svg>
  );
}

function VedSheet() {
  return (
    <svg viewBox="0 0 980 520" role="img" aria-label="Anatomy of a VED.EXE sheet: a header strip with the sheet counter, a gutter with line numbers, a figure with an exploded stack of plates and reference numerals, and a column of numbered claims.">
      <Defs />
      <rect x={120} y={20} width={560} height={480} pathLength={1} className="d-line" style={{ "--i": 0 } as React.CSSProperties} />
      <line x1={120} y1={58} x2={680} y2={58} pathLength={1} className="d-line" style={{ "--i": 1 } as React.CSSProperties} />
      <line x1={156} y1={58} x2={156} y2={500} pathLength={1} className="d-line" style={{ "--i": 2 } as React.CSSProperties} />
      {[120, 200, 280, 360, 440].map((y, i) => (
        <line key={y} x1={148} y1={y} x2={156} y2={y} pathLength={1} className="d-line" style={{ "--i": 3 + i * 0.3 } as React.CSSProperties} />
      ))}
      {/* the figure: three plates in axonometric */}
      {[0, 1, 2].map((k) => (
        <path
          key={k}
          d={`M ${250} ${250 - k * 34} L ${360} ${190 - k * 34} L ${470} ${250 - k * 34} L ${360} ${310 - k * 34} Z`}
          pathLength={1}
          className="d-line"
          fill="var(--paper-3)"
          style={{ "--i": 4 + k } as React.CSSProperties}
        />
      ))}
      {/* claims */}
      {[120, 150, 180, 330, 360, 390, 420, 450].map((y, i) => (
        <line key={y} x1={500} y1={y} x2={500 + (i % 3 === 2 ? 110 : 160)} y2={y} pathLength={1} className="d-line" style={{ "--i": 6 + i * 0.3 } as React.CSSProperties} />
      ))}
      {[
        { x1: 400, y1: 40, x2: 740, y2: 40, n: 602, label: "Header strip, sheet counter" },
        { x1: 156, y1: 280, x2: 60, y2: 280, n: 604, label: "Gutter", left: true },
        { x1: 430, y1: 160, x2: 740, y2: 200, n: 606, label: "Figure, plates" },
        { x1: 620, y1: 390, x2: 740, y2: 390, n: 608, label: "Claims" },
      ].map((c, i) => (
        <g key={c.n} style={{ "--i": 9 + i } as React.CSSProperties}>
          <path d={`M ${c.x1} ${c.y1} L ${c.x2} ${c.y2}`} pathLength={1} className="d-line" />
          <circle cx={c.x1} cy={c.y1} r={3} className="d-dot draw-fade" />
          <text x={c.left ? c.x2 - 8 : c.x2 + 8} y={c.y2 - 3} textAnchor={c.left ? "end" : "start"} className="d-num draw-fade">
            {c.n}
          </text>
          <text x={c.left ? c.x2 - 8 : c.x2 + 8} y={c.y2 + 14} textAnchor={c.left ? "end" : "start"} className="d-note d-left draw-fade">
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Drawing({ drawing }: { drawing: "atlas-crates" | "accounic-arch" | "ved-sheet" }) {
  return (
    <DrawOnView className="drawing">
      {drawing === "atlas-crates" && <AtlasCrates />}
      {drawing === "accounic-arch" && <AccounicArch />}
      {drawing === "ved-sheet" && <VedSheet />}
    </DrawOnView>
  );
}

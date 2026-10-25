import { ImageResponse } from "next/og";
import { getFiling } from "@/lib/work";

export const runtime = "edge";

// Share card: the name or the project, one line about it, and the proof number.
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  const f = slug ? getFiling(slug) : undefined;
  const title = f ? f.title : "Ved Chauhan";
  const line = f ? f.short : "Software engineer and founder of SNOWBROS. Software people depend on every day, shipped and running.";
  const fact = f?.facts[0];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#efe6d4", color: "#1d1712", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#5f5244" }}>{f ? "Ved Chauhan · Case study" : "ved.exe.snowbros.me"}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: title.length > 14 ? 104 : 150, fontWeight: 800, letterSpacing: -6, lineHeight: 0.9 }}>{title}</div>
          <div style={{ fontSize: 36, lineHeight: 1.3, marginTop: 36, maxWidth: 940 }}>{line}</div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
          {fact ? (
            <>
              <span style={{ fontSize: 64, fontWeight: 800, color: "#9b2316", letterSpacing: -2 }}>{fact.value}</span>
              <span style={{ fontSize: 26, color: "#5f5244" }}>{fact.label}</span>
            </>
          ) : (
            <span style={{ fontSize: 30, fontWeight: 700, color: "#9b2316" }}>Open to software engineering roles</span>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

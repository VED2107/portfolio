import { ImageResponse } from "next/og";
import { getFiling } from "@/lib/work";

export const runtime = "edge";

// A cover sheet as an image: title, abstract, filing number. Drafting white, graphite, one cobalt.
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  const f = slug ? getFiling(slug) : undefined;
  const title = f ? f.title : "VED.EXE";
  const line = f ? f.short : "Software engineer building developer tools and full-stack products.";
  const ref = f ? `Filing ${f.no}` : "Ved S. Chauhan · SNOWBROS";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#eef0f1", color: "#0e1116", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", border: "2px solid #0e1116", padding: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#5b636e" }}>
            <span>(54)</span>
            <span>{ref}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: title.length > 12 ? 92 : 128, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>{title}</div>
            <div style={{ marginTop: 28, fontSize: 34, lineHeight: 1.3, color: "#353c46", maxWidth: 900 }}>{line}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24 }}>
            <svg width="38" height="32" viewBox="0 0 218 182">
              <path d="M0 0 L56 0 L96.73 152 L137.46 0 L193.46 0 L144.69 182 L48.77 182 Z" fill="#0e1116" />
              <rect x="171.02" y="136" width="46" height="46" fill="#2f3bff" />
            </svg>
            <span>ved.exe.snowbros.me</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

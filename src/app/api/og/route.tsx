import { ImageResponse } from "next/og";
import { getRelease } from "@/lib/catalog";

export const runtime = "edge";

// Share card: a record sleeve on the shop's paper, catalogue number and sticker included.
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  const r = slug ? getRelease(slug) : undefined;
  const title = r ? r.title : "Ved";
  const line = r ? r.short : "Software engineer. Developer tools and the products people run their day on. Founder of SNOWBROS.";
  const cat = r ? `${r.cat} · ${r.format} · ${r.year}` : "VED Records & Film · Ahmedabad";
  const sleeve = r?.sleeve ?? "#17130e";
  const ink = r?.ink ?? "#ece6da";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ece6da", color: "#17130e", padding: 56, fontFamily: "serif" }}>
        <div style={{ display: "flex", width: 518, height: 518, background: sleeve, color: ink, padding: 36, flexDirection: "column", justifyContent: "space-between", boxShadow: "0 30px 50px -30px rgba(0,0,0,.6)" }}>
          <span style={{ fontSize: 18, fontFamily: "monospace" }}>{r?.cat ?? "VED 000"}</span>
          <span style={{ fontSize: title.length > 10 ? 64 : 110, lineHeight: 0.9, letterSpacing: -3, fontStyle: "italic" }}>{title}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", marginLeft: 56, flex: 1, paddingTop: 12, paddingBottom: 12 }}>
          <span style={{ fontSize: 22, fontFamily: "monospace", color: "#75695b" }}>{cat}</span>
          <span style={{ fontSize: 40, lineHeight: 1.2 }}>{line}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 54, fontStyle: "italic", letterSpacing: -2 }}>Ved</span>
            <span style={{ fontSize: 18, fontFamily: "sans-serif", letterSpacing: 2 }}>RECORDS &amp; FILM</span>
            <span style={{ marginLeft: "auto", background: "#ff4a1c", color: "#1a0a04", padding: "8px 14px", fontSize: 18, fontFamily: "sans-serif", fontWeight: 800 }}>ved.exe.snowbros.me</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

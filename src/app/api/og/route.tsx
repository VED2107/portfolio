import { ImageResponse } from "next/og";
import { STORIES } from "@/lib/content";
import { getFiling } from "@/lib/work";

export const runtime = "edge";

// Share card in the site's own language: near-white, one ink, one vermilion mark, big quiet type.
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  const f = slug ? getFiling(slug) : undefined;
  const story = slug ? STORIES[slug] : undefined;
  const kicker = f ? f.title : "Ved Chauhan";
  const title = story ? story.headline : "I build software for real people, real work, and the details that matter.";
  const foot = f ? story?.category ?? f.field : "Software engineer · Founder of SNOWBROS · Patan, Gujarat, India";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fcfcfa", color: "#242422", padding: "72px 80px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28, color: "#62625d" }}>
          <span style={{ color: "#242422" }}>{kicker}</span>
          <span style={{ display: "flex", width: 18, height: 18, borderRadius: 9, background: "#d94b2b" }} />
        </div>
        <div style={{ display: "flex", fontSize: title.length > 60 ? 64 : 76, lineHeight: 1.06, letterSpacing: -3, fontWeight: 500, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#62625d", borderTop: "1px solid #ddddd7", paddingTop: 24 }}>
          <span>{foot}</span>
          <span>ved.snowbros.me</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

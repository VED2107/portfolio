import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050816",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0, 245, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%)",
            top: 50,
            left: 100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,0,229,0.06) 0%, transparent 70%)",
            bottom: 50,
            right: 150,
          }}
        />

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "#00F5FF",
              textShadow: "0 0 40px rgba(0,245,255,0.5), 0 0 80px rgba(0,245,255,0.3)",
              letterSpacing: 8,
            }}
          >
            VED
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "#FF00E5",
              textShadow: "0 0 40px rgba(255,0,229,0.5)",
            }}
          >
            .
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "#FF00E5",
              textShadow: "0 0 40px rgba(255,0,229,0.5), 0 0 80px rgba(255,0,229,0.3)",
              letterSpacing: 8,
            }}
          >
            EXE
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#A0A0A0",
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Full Stack Developer & Creative Technologist
        </div>

        {/* Status bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 32,
            fontSize: 14,
            color: "#00FF88",
            letterSpacing: 4,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              backgroundColor: "#00FF88",
              boxShadow: "0 0 10px #00FF88",
            }}
          />
          SYSTEM ONLINE
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            display: "flex",
            gap: 40,
            fontSize: 12,
            color: "rgba(160,160,160,0.4)",
            letterSpacing: 2,
          }}
        >
          <span>VED.EXE v2.1.07</span>
          <span>vedchauhan2107@gmail.com</span>
          <span>github.com/VED2107</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

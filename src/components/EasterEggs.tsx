"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Matrix Rain ───
export function MatrixRain({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "アイウエオカキクケコサシスセソタチツテトVED2107ナニヌネノ01".split("");
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(5, 8, 22, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.95 ? "#00F5FF" : "#00FF88";
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 40);
    const timeout = setTimeout(onDone, 6000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[10000] cursor-pointer" onClick={onDone}>
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-[family-name:var(--font-pixel)] text-[10px] text-[#00FF88]/60">
        CLICK TO EXIT THE MATRIX
      </div>
    </div>
  );
}

// ─── Rain Effect ───
export function RainEffect({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Drop { x: number; y: number; len: number; speed: number; opacity: number; }
    const drops: Drop[] = [];
    for (let i = 0; i < 300; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: Math.random() * 20 + 10,
        speed: Math.random() * 6 + 4,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    let frame: number;
    const draw = () => {
      ctx.fillStyle = "rgba(5, 8, 22, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const d of drops) {
        ctx.strokeStyle = `rgba(0, 245, 255, ${d.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + 1, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;
        if (d.y > canvas.height) { d.y = -d.len; d.x = Math.random() * canvas.width; }
      }
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    const timeout = setTimeout(onDone, 8000);
    return () => { cancelAnimationFrame(frame); clearTimeout(timeout); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[10000] cursor-pointer" onClick={onDone}>
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="font-[family-name:var(--font-pixel)] text-2xl text-[#00F5FF]/60 sm:text-4xl"
          style={{ textShadow: "0 0 20px rgba(0,245,255,0.4)" }}>
          RAIN MODE
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-[family-name:var(--font-pixel)] text-[10px] text-[#00F5FF]/40">
        CLICK TO STOP THE RAIN
      </div>
    </div>
  );
}

// ─── Hack Mode ───
const HACK_LINES = [
  "> Initializing breach protocol...",
  "> Scanning ports: 22, 80, 443, 8080...",
  "> Port 443 OPEN — SSL handshake intercepted",
  "> Decrypting AES-256 cipher...",
  "> Bypassing firewall [##########] 100%",
  "> Injecting payload into kernel...",
  "> Extracting user database...",
  "> Found 1 user: ved_chauhan (admin)",
  "> Cracking password: **********",
  "> Password: its_not_that_easy_lol",
  "> Downloading secret files...",
  "> [SECRET_FILE_1]: ved_is_actually_really_cool.txt",
  "> [SECRET_FILE_2]: hire_this_guy_immediately.pdf",
  "> ACCESS GRANTED — Welcome, hacker.",
  "",
  "> Just kidding. But thanks for trying.",
  "> Type 'help' for real commands.",
];

export function HackMode({ onDone }: { onDone: () => void }) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < HACK_LINES.length) {
        setVisibleLines((prev) => [...prev, HACK_LINES[i]]);
        setProgress(Math.round(((i + 1) / HACK_LINES.length) * 100));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onDone, 3000);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#050816]/98 backdrop-blur-sm cursor-pointer" onClick={onDone}>
      <div className="w-full max-w-2xl p-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 w-2 bg-[#FF4D4D]" style={{ animation: "blink 0.5s infinite" }} />
          <span className="font-[family-name:var(--font-pixel)] text-xs text-[#FF4D4D]">HACK MODE ACTIVE</span>
          <span className="ml-auto font-[family-name:var(--font-pixel)] text-[10px] text-[#00FF88]">{progress}%</span>
        </div>
        <div className="mb-4 h-1 w-full bg-[#0a0f2e] overflow-hidden">
          <div className="h-full bg-[#00FF88] transition-all duration-300" style={{ width: `${progress}%`, boxShadow: "0 0 10px #00FF88" }} />
        </div>
        <div className="h-80 overflow-y-auto font-[family-name:var(--font-body)] text-sm">
          {visibleLines.map((line, i) => (
            <div key={i} className={`mb-1 ${
              line.includes("ACCESS GRANTED") ? "text-[#00FF88] font-bold"
              : line.includes("Just kidding") ? "text-[#FFE600]"
              : line.includes("OPEN") || line.includes("100%") ? "text-[#00F5FF]"
              : "text-[#00FF88]/80"
            }`}>{line}</div>
          ))}
          <span className="inline-block h-4 w-2 bg-[#00FF88]" style={{ animation: "blink 1s infinite" }} />
        </div>
        <div className="mt-4 font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/40">CLICK ANYWHERE TO ABORT</div>
      </div>
    </div>
  );
}

// ─── Retro CRT Green Mode (logo triple-click) ───
export function useRetroMode() {
  const [active, setActive] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleLogoClick = useCallback(() => {
    clickCount.current++;
    if (clickCount.current === 3) {
      clickCount.current = 0;
      setActive((prev) => !prev);
      if (clickTimer.current) clearTimeout(clickTimer.current);
    } else {
      if (clickTimer.current) clearTimeout(clickTimer.current);
      clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 500);
    }
  }, []);

  useEffect(() => {
    if (active) {
      document.documentElement.style.filter = "hue-rotate(80deg) saturate(2) brightness(0.8)";
      document.documentElement.style.transition = "filter 0.5s";
    } else {
      document.documentElement.style.filter = "";
    }
    return () => { document.documentElement.style.filter = ""; };
  }, [active]);

  return { retroActive: active, handleLogoClick };
}

// ─── God Mode Particle Explosion ───
export function GodModeExplosion({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const colors = ["#00F5FF", "#FF00E5", "#FFE600", "#00FF88", "#FF4D4D"];

    interface Particle { x: number; y: number; vx: number; vy: number; color: string; size: number; life: number; }
    const particles: Particle[] = [];
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      particles.push({ x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color: colors[Math.floor(Math.random() * colors.length)], size: Math.random() * 4 + 2, life: 1 });
    }

    let frame: number;
    const animate = () => {
      ctx.fillStyle = "rgba(5, 8, 22, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.008;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      if (alive) { frame = requestAnimationFrame(animate); } else { onDone(); }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="font-[family-name:var(--font-pixel)] text-4xl text-[#FFE600] neon-text-yellow sm:text-6xl" style={{ animation: "float 2s ease-in-out infinite" }}>GOD MODE</div>
          <div className="mt-2 font-[family-name:var(--font-pixel)] text-sm text-[#00FF88]">ACTIVATED</div>
        </div>
      </div>
    </div>
  );
}

// ─── Music Player with Real Audio + Visualizer ───
export function MusicPlayer({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const audio = new Audio("/Rasputin.wav");
    audioRef.current = audio;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audio);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    audio.play().catch(() => {});

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const colors = ["#00F5FF", "#FF00E5", "#FFE600", "#00FF88"];

    let frame: number;
    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgba(5, 8, 22, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Average bass for pulse
      let bass = 0;
      for (let i = 0; i < 6; i++) bass += dataArray[i];
      bass = (bass / 6) / 255;

      // ── Full-width bars from bottom ──
      const barCount = 64;
      const barW = canvas.width / barCount;
      for (let i = 0; i < barCount; i++) {
        const idx = Math.floor((i / barCount) * bufferLength * 0.7);
        const val = dataArray[idx] / 255;
        const h = val * canvas.height * 0.5;
        const color = colors[i % colors.length];
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.4 + val * 0.6;
        ctx.fillRect(i * barW + 1, canvas.height - h, barW - 2, h);
        // Mirror on top (faint)
        ctx.globalAlpha = 0.1 + val * 0.2;
        ctx.fillRect(i * barW + 1, 0, barW - 2, h * 0.3);
      }
      ctx.globalAlpha = 1;

      // ── Center circle pulse ──
      const radius = 60 + bass * 40;
      ctx.beginPath();
      ctx.arc(cx, cy * 0.6, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 245, 255, ${0.3 + bass * 0.7})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Second ring
      ctx.beginPath();
      ctx.arc(cx, cy * 0.6, radius + 15, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 0, 229, ${0.2 + bass * 0.5})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Third ring
      ctx.beginPath();
      ctx.arc(cx, cy * 0.6, radius + 28, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 230, 0, ${0.1 + bass * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    audio.addEventListener("ended", onDone);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", onDone);
      cancelAnimationFrame(frame);
      audioCtx.close();
    };
  }, [onDone]);

  const handleStop = () => {
    if (audioRef.current) audioRef.current.pause();
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[10000] cursor-pointer" onClick={handleStop}>
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center">
        <div className="font-[family-name:var(--font-pixel)] text-xl text-[#FF00E5] sm:text-3xl" style={{ textShadow: "0 0 20px rgba(255,0,229,0.5)" }}>NOW PLAYING</div>
        <div className="mt-2 font-[family-name:var(--font-pixel)] text-xs text-[#00F5FF]">Rasputin — Boney M.</div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-[family-name:var(--font-pixel)] text-[10px] text-[#A0A0A0]/40">CLICK TO STOP</div>
    </div>
  );
}

// ─── Cinema Credits ───
const CREDITS = [
  { role: "", name: "VED.EXE" },
  { role: "", name: "A Ved Chauhan Production" },
  { role: "", name: "" },
  { role: "Directed by", name: "Ved Chauhan" },
  { role: "Produced by", name: "Caffeine & Ambition" },
  { role: "Written by", name: "TypeScript" },
  { role: "", name: "" },
  { role: "STARRING", name: "" },
  { role: "", name: "" },
  { role: "Lead Framework", name: "Next.js" },
  { role: "Animation Director", name: "GSAP & Framer Motion" },
  { role: "Art Direction", name: "Tailwind CSS" },
  { role: "Visual Effects", name: "Canvas API" },
  { role: "Sound Design", name: "Web Audio API" },
  { role: "Typography", name: "Press Start 2P & Space Grotesk" },
  { role: "", name: "" },
  { role: "SUPPORTING CAST", name: "" },
  { role: "", name: "" },
  { role: "Backend", name: "Node.js & Supabase" },
  { role: "Mobile Unit", name: "React Native & Flutter" },
  { role: "Design Studio", name: "Figma" },
  { role: "Deployment", name: "Vercel" },
  { role: "Version Control", name: "Git (3am commits)" },
  { role: "", name: "" },
  { role: "SPECIAL THANKS", name: "" },
  { role: "", name: "" },
  { role: "", name: "Stack Overflow" },
  { role: "", name: "Chai" },
  { role: "", name: "Lo-fi Hip Hop Radio" },
  { role: "", name: "Sleep (barely)" },
  { role: "", name: "You, for watching this" },
  { role: "", name: "" },
  { role: "", name: "No bugs were harmed in the making" },
  { role: "", name: "of this portfolio." },
  { role: "", name: "(that is a lie)" },
  { role: "", name: "" },
  { role: "", name: "vedchauhan.dev" },
];

export function CinemaCredits({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(onDone, 22000);
    return () => clearTimeout(timeout);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[10000] cursor-pointer overflow-hidden bg-[#000]" onClick={onDone}>
      <div
        className="absolute left-1/2 w-full max-w-lg text-center"
        style={{ transform: "translateX(-50%)", animation: "credits-scroll 20s linear forwards", top: "100%" }}
      >
        {CREDITS.map((c, i) => (
          <div key={i} className="mb-4">
            {c.role && (
              <div className="font-[family-name:var(--font-body)] text-sm text-[#A0A0A0]/60 uppercase tracking-widest">{c.role}</div>
            )}
            {c.name && (
              <div className={`font-[family-name:var(--font-pixel)] ${
                i === 0 ? "text-3xl text-[#FFE600] neon-text-yellow"
                : c.role === "STARRING" || c.role === "SPECIAL THANKS" || c.role === "SUPPORTING CAST" ? "text-lg text-[#FF00E5]"
                : "text-sm text-white"
              }`}>{c.name}</div>
            )}
          </div>
        ))}
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-[family-name:var(--font-pixel)] text-[10px] text-[#A0A0A0]/30">CLICK TO SKIP</div>
    </div>
  );
}

// ─── DJ Mode ───
export function DJMode({ onDone, audioCtx }: { onDone: () => void; audioCtx: AudioContext }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dropped, setDropped] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (audioCtx.state === "suspended") audioCtx.resume();

    let angle = 0;
    let bassHit = false;
    let bassTime = 0;
    let running = true;

    const dropTimeout = setTimeout(() => {
      if (!running) return;
      setDropped(true);
      bassHit = true;
      bassTime = Date.now();
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(80, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.5);
      } catch {}

      for (let b = 1; b <= 4; b++) {
        setTimeout(() => {
          if (!running) return;
          try {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = "square";
            o.frequency.setValueAtTime(60, audioCtx.currentTime);
            o.frequency.exponentialRampToValueAtTime(25, audioCtx.currentTime + 0.3);
            g.gain.setValueAtTime(0.1, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            o.connect(g); g.connect(audioCtx.destination);
            o.start(); o.stop(audioCtx.currentTime + 0.3);
          } catch {}
        }, b * 400);
      }
    }, 3000);

    let frame: number;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.2;

    const draw = () => {
      if (!running) return;
      ctx.fillStyle = "rgba(5, 8, 22, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const shake = bassHit && (Date.now() - bassTime < 500) ? (Math.random() - 0.5) * 10 : 0;

      ctx.save();
      ctx.translate(cx + shake, cy + shake);
      ctx.rotate(angle);
      angle += 0.03;

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0f2e";
      ctx.fill();
      ctx.strokeStyle = "#FF00E5";
      ctx.lineWidth = 2;
      ctx.stroke();

      for (let r = 20; r < radius; r += 12) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 245, 255, ${0.1 + (r / radius) * 0.15})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#FFE600";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius * 0.7, -radius * 0.7);
      ctx.strokeStyle = "#A0A0A0";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    const endTimeout = setTimeout(onDone, 9000);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      clearTimeout(dropTimeout);
      clearTimeout(endTimeout);
    };
  }, [onDone, audioCtx]);

  return (
    <div className="fixed inset-0 z-[10000] cursor-pointer" onClick={onDone}>
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center">
        {!dropped ? (
          <div className="font-[family-name:var(--font-pixel)] text-2xl text-[#FFE600] sm:text-4xl"
            style={{ animation: "blink 0.5s infinite", textShadow: "0 0 20px rgba(255,230,0,0.5)" }}>
            WAIT FOR IT...
          </div>
        ) : (
          <div className="font-[family-name:var(--font-pixel)] text-3xl text-[#FF00E5] sm:text-5xl"
            style={{ textShadow: "0 0 30px rgba(255,0,229,0.6)", animation: "float 0.3s ease-in-out infinite" }}>
            DROP THE BASS
          </div>
        )}
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-[family-name:var(--font-pixel)] text-[10px] text-[#A0A0A0]/40">CLICK TO EXIT</div>
    </div>
  );
}

// ─── Rickroll ───
const RICK_ART = [
  "    ##################",
  "  ##                ##",
  "  ##  ####    ####  ##",
  "  ##  ####    ####  ##",
  "  ##        #       ##",
  "  ##      ####      ##",
  "  ##                ##",
  "    ##  ########  ##",
  "      ############",
];

const RICK_LINES = [
  "You know the rules...",
  "...and so do I.",
  "",
  "You just got Ved-rolled.",
  "",
  "This portfolio will never:",
  "  - Give you up",
  "  - Let you down",
  "  - Run around and desert you",
  "",
  "Achievement Unlocked: Classic Internet Moment",
  "",
  "Now go hire Ved before someone else does.",
];

export function Rickroll({ onDone }: { onDone: () => void }) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const allLines = [...RICK_ART, "", ...RICK_LINES];
    let i = 0;
    const interval = setInterval(() => {
      if (!mountedRef.current) return;
      if (i < allLines.length) {
        const line = allLines[i];
        setVisibleLines((prev) => [...prev, line]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => { if (mountedRef.current) onDone(); }, 4000);
      }
    }, 250);
    return () => { mountedRef.current = false; clearInterval(interval); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#050816]/98 backdrop-blur-sm cursor-pointer" onClick={onDone}>
      <div className="w-full max-w-lg p-8 text-center">
        {visibleLines.map((line, i) => (
          <div key={i} className={`mb-1 font-[family-name:var(--font-body)] text-sm whitespace-pre ${
            i < RICK_ART.length ? "text-[#FF00E5] font-mono"
            : line.includes("Achievement") ? "text-[#FFE600]"
            : line.includes("Ved-rolled") || line.includes("hire Ved") ? "text-[#00FF88]"
            : "text-[#00F5FF]"
          }`}>{line || " "}</div>
        ))}
        <span className="inline-block h-4 w-2 bg-[#00F5FF]" style={{ animation: "blink 1s infinite" }} />
        <div className="mt-8 font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/40">CLICK ANYWHERE TO CLOSE</div>
      </div>
    </div>
  );
}

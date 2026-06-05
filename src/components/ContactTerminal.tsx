"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TERMINAL_COMMANDS, SITE } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";
import { useSound } from "@/components/SoundManager";
import { MatrixRain, RainEffect, HackMode, GodModeExplosion, MusicPlayer, CinemaCredits } from "@/components/EasterEggs";

gsap.registerPlugin(ScrollTrigger);

interface TerminalLine {
  type: "input" | "output" | "system";
  text: string;
}

export function ContactTerminal() {
  const sectionRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "system", text: "═══════════════════════════════════════" },
    { type: "system", text: "  VED.EXE Communication Terminal v2.1.07" },
    { type: "system", text: "═══════════════════════════════════════" },
    { type: "output", text: "" },
    { type: "output", text: 'Welcome. Type "help" for available commands.' },
    { type: "output", text: 'Try: contact, projects, hire, sudo hire ved' },
    { type: "output", text: "" },
  ]);
  const { play } = useSound();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [easterEgg, setEasterEgg] = useState<"matrix" | "rain" | "hack" | "godmode" | "music" | "cinema" | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dismissEgg = useCallback(() => setEasterEgg(null), []);

  const isInitialMount = useRef(true);
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        terminalRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    setHistory((prev) => [input, ...prev]);
    setHistoryIndex(-1);

    const newLines: TerminalLine[] = [
      ...lines,
      { type: "input", text: `ved@portfolio:~ $ ${input}` },
    ];

    const OVERLAY_CMDS: Record<string, { msg: string; egg: typeof easterEgg }> = {
      "matrix":      { msg: "> ENTERING THE MATRIX...", egg: "matrix" },
      "rain":        { msg: "> It's raining in Ved's world...", egg: "rain" },
      "hack":        { msg: "> INITIATING BREACH PROTOCOL...", egg: "hack" },
      "godmode":     { msg: "███ GOD MODE ACTIVATED ███", egg: "godmode" },
      "god mode":    { msg: "███ GOD MODE ACTIVATED ███", egg: "godmode" },
      "ved is god":  { msg: "███ GOD MODE ACTIVATED ███", egg: "godmode" },
      "play music":  { msg: "> Loading chiptune playlist...", egg: "music" },
      "cinema":      { msg: "> Rolling credits...", egg: "cinema" },
      "credits":     { msg: "> Rolling credits...", egg: "cinema" },
    };

    if (cmd === "clear") {
      setLines([
        { type: "output", text: "Terminal cleared." },
        { type: "output", text: 'Type "help" for available commands.' },
      ]);
    } else if (OVERLAY_CMDS[cmd]) {
      play("success");
      const ov = OVERLAY_CMDS[cmd];
      newLines.push({ type: ov.msg.includes("███") ? "system" : "output", text: ov.msg });
      setLines(newLines);
      setEasterEgg(ov.egg);
    } else {
      const response = TERMINAL_COMMANDS[cmd];
      if (response) {
        play("success");
        response.split("\n").forEach((line) => {
          newLines.push({ type: "output", text: line });
        });
      } else {
        play("error");
        newLines.push({
          type: "output",
          text: `bash: ${cmd}: command not found`,
        });
        newLines.push({
          type: "output",
          text: 'Type "help" for available commands.',
        });
      }
      setLines(newLines);
    }

    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const getLineColor = (line: TerminalLine) => {
    if (line.type === "input") return "text-[#00F5FF]";
    if (line.type === "system") return "text-[#FF00E5]/60";
    if (line.text.includes("ACCESS GRANTED") || line.text.includes("Achievement") || line.text.includes("SUCCESS"))
      return "text-[#00FF88]";
    if (line.text.includes("BEST DECISION") || line.text.includes("legendary"))
      return "text-[#FFE600]";
    if (line.text.includes("command not found"))
      return "text-[#FF4D4D]";
    return "text-[#A0A0A0]";
  };

  return (
    <>
    <section ref={sectionRef} id="contact" className="relative px-6 py-32">
      <div className="mx-auto max-w-4xl">
        <SectionHeader command="COMM_TERMINAL.init()" title="COMMUNICATION TERMINAL" level={7} />

        <div
          ref={terminalRef}
          className="pixel-border overflow-hidden bg-[#030712]"
          style={{ opacity: 0, boxShadow: "0 0 40px rgba(0,245,255,0.05)" }}
        >
          {/* Terminal header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0a0f2e]/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#FF4D4D]" />
              <div className="h-2.5 w-2.5 rounded-sm bg-[#FFE600]" />
              <div className="h-2.5 w-2.5 rounded-sm bg-[#00FF88]" />
            </div>
            <span className="font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/60">
              ved@portfolio — bash — 80×24
            </span>
            <div className="flex gap-2 font-[family-name:var(--font-pixel)] text-[7px] text-[#A0A0A0]/30">
              <span>UTF-8</span>
              <span>LF</span>
            </div>
          </div>

          {/* Terminal body */}
          <div
            ref={terminalBodyRef}
            className="h-80 overflow-y-auto p-4 font-[family-name:var(--font-body)] text-sm"
            onClick={() => inputRef.current?.focus({ preventScroll: true })}
          >
            {lines.map((line, i) => (
              <div key={i} className={`mb-0.5 ${getLineColor(line)}`}>
                {line.type === "system" ? (
                  <span className="font-[family-name:var(--font-pixel)] text-[10px]">
                    {line.text}
                  </span>
                ) : (
                  line.text
                )}
              </div>
            ))}
            <div ref={bottomRef} />

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <span className="text-[#00FF88] font-[family-name:var(--font-body)] text-sm">
                ved@portfolio:~
              </span>
              <span className="text-white">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 border-none bg-transparent font-[family-name:var(--font-body)] text-sm text-white outline-none placeholder:text-[#A0A0A0]/30"
                placeholder="type a command..."
                autoComplete="off"
                spellCheck={false}
                tabIndex={-1}
                onFocus={(e) => e.target.setAttribute("tabindex", "0")}
              />
            </form>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {[
            { label: "GitHub", url: SITE.github, color: "#A0A0A0" },
            { label: "LinkedIn", url: SITE.linkedin, color: "#00F5FF" },
            { label: "Instagram", url: SITE.instagram, color: "#FF00E5" },
            { label: "Email", url: `mailto:${SITE.email}`, color: "#FFE600" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target={link.url.startsWith("mailto") ? undefined : "_blank"}
              rel={link.url.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className="group relative overflow-hidden border border-white/10 bg-[#0a0f2e]/40 px-5 py-2.5 font-[family-name:var(--font-pixel)] text-[10px] text-[#A0A0A0] transition-all duration-300 hover:text-white"
              style={
                {
                  "--link-color": link.color,
                } as React.CSSProperties
              }
              data-cursor-hover
            >
              <span className="relative z-10">{link.label.toUpperCase()}</span>
              <div
                className="absolute inset-0 -translate-y-full transition-transform duration-300 group-hover:translate-y-0"
                style={{ backgroundColor: `${link.color}15`, borderColor: `${link.color}40` }}
              />
            </a>
          ))}
        </div>

        {/* Direct email CTA */}
        <div className="mt-8 text-center">
          <p className="font-[family-name:var(--font-body)] text-sm text-[#A0A0A0]/60">
            Or just email me directly at{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="text-[#00F5FF] transition-colors hover:text-[#FF00E5]"
              data-cursor-hover
            >
              {SITE.email}
            </a>
          </p>
        </div>
      </div>

    </section>
    {easterEgg === "matrix" && <MatrixRain onDone={dismissEgg} />}
    {easterEgg === "rain" && <RainEffect onDone={dismissEgg} />}
    {easterEgg === "hack" && <HackMode onDone={dismissEgg} />}
    {easterEgg === "godmode" && <GodModeExplosion onDone={dismissEgg} />}
    {easterEgg === "music" && <MusicPlayer onDone={dismissEgg} />}
    {easterEgg === "cinema" && <CinemaCredits onDone={dismissEgg} />}
    </>
  );
}

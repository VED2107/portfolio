"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHeader } from "@/components/SectionHeader";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { label: "LEVEL", value: "Sophomore", color: "#00F5FF", icon: "▲" },
  { label: "CLASS", value: "Full Stack Engineer", color: "#FF00E5", icon: "◆" },
  { label: "GUILD", value: "IEEE × GDG", color: "#FFE600", icon: "★" },
  { label: "REGION", value: "Gujarat, India", color: "#00FF88", icon: "◉" },
];

const SKILL_TREE = [
  { name: "Frontend", xp: 90, color: "#00F5FF" },
  { name: "Backend", xp: 80, color: "#FF00E5" },
  { name: "UI/UX", xp: 80, color: "#FFE600" },
  { name: "Mobile", xp: 65, color: "#00FF88" },
  { name: "Problem Solving", xp: 85, color: "#FF4D4D" },
  { name: "Leadership", xp: 88, color: "#A78BFA" },
];

export function PlayerProfile() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // GSAP JS tweens ignore the CSS prefers-reduced-motion query, so honor it
      // explicitly: snap everything to its final state and skip the animations.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([cardRef.current, skillsRef.current], { opacity: 1, x: 0, rotateY: 0 });
        gsap.utils.toArray<HTMLElement>(".stat-card").forEach((c) =>
          gsap.set(c, { opacity: 1, y: 0, scale: 1 })
        );
        gsap.utils.toArray<HTMLElement>(".skill-bar-fill").forEach((b) =>
          gsap.set(b, { width: b.dataset.width })
        );
        return;
      }

      gsap.fromTo(
        cardRef.current,
        { opacity: 0, x: -60, rotateY: 10 },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );

      gsap.fromTo(
        skillsRef.current,
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );

      gsap.utils.toArray<HTMLElement>(".skill-bar-fill").forEach((bar, i) => {
        gsap.fromTo(
          bar,
          { width: "0%" },
          {
            width: bar.dataset.width,
            duration: 1.2,
            delay: i * 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
            },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>(".stat-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 20, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            delay: 0.3 + i * 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="profile"
      className="relative px-6 py-32"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader command="PLAYER_DATA.load()" title="PLAYER PROFILE" level={1} />

        <div className="grid gap-8 lg:grid-cols-2" style={{ perspective: "1200px" }}>
          {/* Character Card */}
          <div
            ref={cardRef}
            className="pixel-border bg-[#0a0f2e]/80 p-8"
            style={{ opacity: 0, transformStyle: "preserve-3d" }}
          >
            {/* Card header stripe */}
            <div className="mb-6 h-[2px] w-full bg-gradient-to-r from-[#00F5FF] via-[#FF00E5] to-[#FFE600]" />

            <div className="mb-6 flex items-center gap-4">
              {/* Live avatar */}
              <div className="relative shrink-0">
                <div
                  className="relative h-28 w-28 overflow-hidden border-2 border-[#00F5FF] bg-[#050816]"
                  style={{
                    animation: "avatar-breathe 3s ease-in-out infinite",
                  }}
                >
                  <Image
                    src="/avatar.png"
                    alt="Ved Chauhan"
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                    priority
                  />
                  {/* Scan line sweep */}
                  <div
                    className="pointer-events-none absolute inset-x-0 h-[3px]"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(0,245,255,0.5), transparent)",
                      filter: "blur(1px)",
                      animation: "avatar-scan 3s linear infinite",
                    }}
                  />
                  {/* Glitch flash */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: "linear-gradient(90deg, rgba(0,245,255,0.3) 33%, rgba(255,0,229,0.3) 66%, transparent)",
                      mixBlendMode: "screen",
                      animation: "avatar-glitch-flash 6s step-end infinite",
                    }}
                  />
                </div>
                {/* Online pulse indicator */}
                <div className="absolute -bottom-1 -right-1 h-5 w-5 border border-[#00FF88] bg-[#050816]">
                  <div className="flex h-full w-full items-center justify-center">
                    <div
                      className="h-2.5 w-2.5 bg-[#00FF88]"
                      style={{ animation: "status-pulse 2s ease-in-out infinite" }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-pixel)] text-base text-white">
                  VED CHAUHAN
                </h3>
                <p className="mt-1 font-[family-name:var(--font-body)] text-sm text-[#00F5FF]">
                  @VED2107
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <div className="h-1 w-1 bg-[#00FF88]" style={{ boxShadow: "0 0 4px #00FF88" }} />
                  <span className="font-[family-name:var(--font-pixel)] text-[7px] text-[#00FF88]">
                    ONLINE
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="stat-card group border border-white/5 bg-[#050816]/50 p-3 transition-all duration-300 hover:border-[color:var(--stat-color)]/20"
                  style={{ "--stat-color": stat.color, opacity: 0 } as React.CSSProperties}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-[family-name:var(--font-pixel)] text-[8px]"
                      style={{ color: stat.color }}
                      aria-hidden="true"
                    >
                      {stat.icon}
                    </span>
                    <span
                      className="font-[family-name:var(--font-pixel)] text-[8px]"
                      style={{ color: stat.color }}
                    >
                      {stat.label}
                    </span>
                  </div>
                  <div className="mt-1.5 font-[family-name:var(--font-body)] text-xs text-white">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[#A0A0A0]">
              Full-stack developer focused on building real-world, production-ready
              systems. Passionate about the intersection of engineering, scalability,
              and design. Not building toy demos — shipping products people use.
            </div>

            {/* Card footer */}
            <div className="mt-4 flex justify-between font-[family-name:var(--font-pixel)] text-[7px] text-[#A0A0A0]/30">
              <span>ID: VED-2107</span>
              <span>EXP: 47,500</span>
            </div>
          </div>

          {/* Skill Tree */}
          <div ref={skillsRef} className="space-y-5" style={{ opacity: 0 }}>
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-pixel)] text-xs text-[#FFE600]">
                SKILL TREE
              </span>
              <span className="font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/40">
                6 SKILLS UNLOCKED
              </span>
            </div>
            {SKILL_TREE.map((skill) => (
              <div key={skill.name} className="group">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 transition-all duration-300 group-hover:scale-150"
                      style={{
                        backgroundColor: skill.color,
                        boxShadow: `0 0 6px ${skill.color}40`,
                      }}
                    />
                    <span className="font-[family-name:var(--font-body)] text-sm text-white">
                      {skill.name}
                    </span>
                  </div>
                  <span
                    className="font-[family-name:var(--font-pixel)] text-[10px]"
                    style={{ color: skill.color }}
                  >
                    {skill.xp}/100 XP
                  </span>
                </div>
                <div
                  className="h-3 w-full bg-[#0a0f2e] border border-white/5 overflow-hidden"
                  role="progressbar"
                  aria-label={`${skill.name} proficiency`}
                  aria-valuenow={skill.xp}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="skill-bar-fill h-full transition-shadow duration-300 group-hover:shadow-lg"
                    data-width={`${skill.xp}%`}
                    style={{
                      background: `linear-gradient(90deg, ${skill.color}CC, ${skill.color})`,
                      boxShadow: `0 0 10px ${skill.color}30`,
                      width: "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

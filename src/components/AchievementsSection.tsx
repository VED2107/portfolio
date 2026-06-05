"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ACHIEVEMENTS } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";

gsap.registerPlugin(ScrollTrigger);

const RANK_COLORS: Record<string, string> = {
  S: "#FFE600",
  A: "#00F5FF",
  B: "#00FF88",
  C: "#A0A0A0",
};

function AnimatedScore({ target, color }: { target: number; color: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: "top 85%",
      onEnter: () => {
        if (animated.current) return;
        animated.current = true;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => setValue(Math.round(obj.val)),
        });
      },
    });

    return () => trigger.kill();
  }, [target]);

  return (
    <span
      ref={ref}
      className="text-right font-[family-name:var(--font-pixel)] text-xs tabular-nums"
      style={{ color }}
    >
      {value.toLocaleString()}
    </span>
  );
}

function AnimatedTotal({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: "top 90%",
      onEnter: () => {
        if (animated.current) return;
        animated.current = true;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          delay: 0.5,
          onUpdate: () => setValue(Math.round(obj.val)),
        });
      },
    });

    return () => trigger.kill();
  }, [target]);

  return (
    <span ref={ref} className="font-[family-name:var(--font-pixel)] text-sm text-[#FFE600] neon-text-yellow tabular-nums">
      {value.toLocaleString()}
    </span>
  );
}

export function AchievementsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".achievement-row").forEach((row, i) => {
        gsap.fromTo(
          row,
          { opacity: 0, x: -30, filter: "blur(4px)" },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 0.6,
            delay: i * 0.12,
            ease: "power2.out",
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

  const totalScore = ACHIEVEMENTS.reduce((s, a) => s + a.score, 0);

  return (
    <section ref={sectionRef} id="achievements" className="relative px-6 py-32">
      <div className="mx-auto max-w-4xl">
        <SectionHeader command="LEADERBOARD.display()" title="HIGH SCORES" level={6} />

        <div className="pixel-border bg-[#0a0f2e]/60 p-2">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_1fr_80px] gap-4 border-b border-white/10 px-6 py-3 font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0] sm:grid-cols-[80px_1fr_1fr_100px]">
            <span>RANK</span>
            <span>ACHIEVEMENT</span>
            <span className="hidden sm:block">DESCRIPTION</span>
            <span className="text-right">SCORE</span>
          </div>

          {/* Rows */}
          {ACHIEVEMENTS.map((achievement, i) => {
            const rankColor = RANK_COLORS[achievement.rank] || "#A0A0A0";
            return (
              <div
                key={achievement.title}
                className="achievement-row group grid grid-cols-[60px_1fr_1fr_80px] items-center gap-4 border-b border-white/5 px-6 py-4 transition-all duration-300 hover:bg-white/[0.03] sm:grid-cols-[80px_1fr_1fr_100px]"
                style={{ opacity: 0 }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="font-[family-name:var(--font-pixel)] text-lg transition-transform duration-300 group-hover:scale-125"
                    style={{
                      color: rankColor,
                      textShadow: `0 0 12px ${rankColor}60`,
                    }}
                  >
                    {achievement.rank}
                  </span>
                  <span className="font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/50">
                    #{i + 1}
                  </span>
                </div>
                <span className="font-[family-name:var(--font-pixel)] text-[10px] text-white sm:text-xs">
                  {achievement.title}
                </span>
                <span className="hidden font-[family-name:var(--font-body)] text-xs text-[#A0A0A0] sm:block">
                  {achievement.description}
                </span>
                <AnimatedScore target={achievement.score} color={rankColor} />
              </div>
            );
          })}

          {/* Total */}
          <div className="flex items-center justify-between px-6 py-4">
            <span className="font-[family-name:var(--font-pixel)] text-[10px] text-[#A0A0A0]">
              TOTAL SCORE
            </span>
            <AnimatedTotal target={totalScore} />
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { QUESTS } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";

gsap.registerPlugin(ScrollTrigger);

const STATUS_CONFIG = {
  completed: { color: "#00FF88", label: "COMPLETED", icon: "✓" },
  active: { color: "#00F5FF", label: "IN PROGRESS", icon: "►" },
  upcoming: { color: "#FFE600", label: "UPCOMING", icon: "○" },
};

export function QuestLog() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".quest-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            delay: i * 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const mainQuests = QUESTS.filter((q) => q.type === "main");
  const sideQuests = QUESTS.filter((q) => q.type === "side");

  return (
    <section ref={sectionRef} id="quests" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader command="QUEST_LOG.open()" title="QUEST LOG" level={2} />

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Main Quests */}
          <div>
            <h3 className="mb-8 font-[family-name:var(--font-pixel)] text-sm text-[#FFE600]">
              MAIN QUESTS
            </h3>
            <div className="space-y-4">
              {mainQuests.map((quest) => {
                const config = STATUS_CONFIG[quest.status];
                return (
                  <div
                    key={quest.title}
                    className="quest-card border border-white/5 bg-[#0a0f2e]/60 p-6 transition-all duration-300 hover:border-[#00F5FF]/30 hover:bg-[#0a0f2e]/80"
                    style={{ opacity: 0 }}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span style={{ color: config.color }}>{config.icon}</span>
                          <h4 className="font-[family-name:var(--font-pixel)] text-xs text-white">
                            {quest.title}
                          </h4>
                        </div>
                        <p className="mt-1 font-[family-name:var(--font-body)] text-sm text-[#00F5FF]">
                          {quest.organization}
                        </p>
                      </div>
                      <span
                        className="font-[family-name:var(--font-pixel)] text-[8px]"
                        style={{ color: config.color }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="font-[family-name:var(--font-body)] text-sm leading-relaxed text-[#A0A0A0]">
                      {quest.description}
                    </p>
                    <div className="mt-3 font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/50">
                      {quest.year}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Quests */}
          <div>
            <h3 className="mb-8 font-[family-name:var(--font-pixel)] text-sm text-[#00FF88]">
              SIDE QUESTS
            </h3>
            <div className="space-y-4">
              {sideQuests.map((quest) => {
                const config = STATUS_CONFIG[quest.status];
                return (
                  <div
                    key={quest.title}
                    className="quest-card border border-white/5 bg-[#0a0f2e]/40 p-6 transition-all duration-300 hover:border-[#00FF88]/30"
                    style={{ opacity: 0 }}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{ color: config.color }}>{config.icon}</span>
                        <h4 className="font-[family-name:var(--font-pixel)] text-xs text-white">
                          {quest.title}
                        </h4>
                      </div>
                      <span
                        className="font-[family-name:var(--font-pixel)] text-[8px]"
                        style={{ color: config.color }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="font-[family-name:var(--font-body)] text-sm leading-relaxed text-[#A0A0A0]">
                      {quest.description}
                    </p>
                    <div className="mt-3 font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/50">
                      {quest.year}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SKILLS, SKILL_CATEGORIES } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";

gsap.registerPlugin(ScrollTrigger);

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>("frontend");

  const filteredSkills = SKILLS.filter((s) => s.category === activeCategory);
  const activeColor =
    SKILL_CATEGORIES.find((c) => c.key === activeCategory)?.color || "#00F5FF";

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".skill-node").forEach((node, i) => {
        gsap.fromTo(
          node,
          { opacity: 0, scale: 0.5 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            delay: i * 0.08,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [activeCategory]);

  return (
    <section ref={sectionRef} id="skills" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader command="SKILL_TREE.render()" title="SKILL TREE" level={4} />

        {/* Category tabs */}
        <div className="mb-12 flex flex-wrap gap-3">
          {SKILL_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`cursor-pointer border px-4 py-2 font-[family-name:var(--font-pixel)] text-[10px] transition-all ${
                activeCategory === cat.key
                  ? ""
                  : "border-white/10 text-[#A0A0A0] hover:border-white/30"
              }`}
              style={
                activeCategory === cat.key
                  ? {
                      borderColor: cat.color,
                      color: cat.color,
                      backgroundColor: `${cat.color}15`,
                    }
                  : undefined
              }
              data-cursor-hover
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Skill nodes */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.name}
              className="skill-node group relative flex flex-col items-center border border-white/5 bg-[#0a0f2e]/60 p-6 text-center transition-all duration-300 hover:border-[color:var(--skill-color)]/30"
              style={{ "--skill-color": activeColor, opacity: 0 } as React.CSSProperties}
              data-cursor-hover
            >
              {/* Level ring */}
              <div className="relative mb-4 h-16 w-16">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#1a1a3e"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={activeColor}
                    strokeWidth="6"
                    strokeLinecap="butt"
                    strokeDasharray={`${(skill.level / 100) * 264} 264`}
                    style={{
                      filter: `drop-shadow(0 0 6px ${activeColor}60)`,
                    }}
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-pixel)] text-[10px]"
                  style={{ color: activeColor }}
                >
                  {skill.level}
                </span>
              </div>

              <span className="font-[family-name:var(--font-body)] text-sm text-white">
                {skill.name}
              </span>

              {/* Glow on hover */}
              <div
                className="absolute inset-0 -z-10 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle, ${activeColor}08 0%, transparent 70%)`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

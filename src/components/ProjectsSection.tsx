"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS, type Project } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = [
  { key: "all", label: "ALL" },
  { key: "fullstack", label: "FULL STACK" },
  { key: "mobile", label: "MOBILE" },
  { key: "game", label: "GAMES" },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeShot, setActiveShot] = useState(0);

  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 50, rotateX: 5 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          delay: index * 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 88%",
          },
        }
      );
    });
    return () => ctx.revert();
  }, [index]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      gsap.to(card, {
        rotateX,
        rotateY,
        duration: 0.3,
        ease: "power2.out",
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power2.out",
    });
  }, []);

  const categoryColors: Record<string, string> = {
    fullstack: "#00F5FF",
    mobile: "#00FF88",
    game: "#FF00E5",
    tool: "#FFE600",
    ai: "#A78BFA",
  };

  const color = categoryColors[project.category] || "#00F5FF";

  return (
    <div
      ref={cardRef}
      className="group relative border border-white/5 bg-[#0a0f2e]/60 transition-colors duration-300 hover:border-[color:var(--card-color)]/30"
      style={
        {
          "--card-color": color,
          opacity: 0,
        } as React.CSSProperties
      }
      data-cursor-hover
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top accent line */}
      <div
        className="h-[2px] w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* Cartridge header */}
      <div
        className="flex items-center justify-between border-b border-white/5 px-6 py-3"
        style={{ borderBottomColor: `${color}15` }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5" style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }} />
            <div className="h-1.5 w-1.5 bg-white/10" />
            <div className="h-1.5 w-1.5 bg-white/10" />
          </div>
          <span
            className="font-[family-name:var(--font-pixel)] text-[8px] uppercase"
            style={{ color }}
          >
            {project.category}
          </span>
        </div>
        {project.featured && (
          <span className="border border-[#FFE600]/20 bg-[#FFE600]/5 px-2 py-0.5 font-[family-name:var(--font-pixel)] text-[7px] text-[#FFE600]">
            FEATURED
          </span>
        )}
      </div>

      {(project.screenshots || project.image) && (
        <div className="relative h-44 overflow-hidden border-b border-white/5 bg-[#050816]" style={{ transformStyle: "flat" }}>
          {project.screenshots ? (
            <>
              {project.screenshots.map((shot, i) => (
                <img
                  key={shot.label}
                  src={shot.src}
                  alt={`${project.title} — ${shot.label}`}
                  className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-500 ${
                    activeShot === i
                      ? "opacity-70 group-hover:opacity-95 scale-100 group-hover:scale-105"
                      : "opacity-0 scale-95"
                  }`}
                  loading="lazy"
                />
              ))}
              <div className="absolute bottom-3 right-3 z-20 flex gap-1.5" style={{ pointerEvents: "auto" }}>
                {project.screenshots.map((shot, i) => (
                  <button
                    key={shot.label}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveShot(i); }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`px-3 py-1 font-[family-name:var(--font-pixel)] text-[8px] transition-all cursor-pointer ${
                      activeShot === i
                        ? "bg-[#00F5FF]/25 text-[#00F5FF] border border-[#00F5FF]/50 shadow-[0_0_8px_rgba(0,245,255,0.2)]"
                        : "bg-[#050816]/90 text-[#A0A0A0]/70 border border-white/15 hover:text-white hover:border-white/30"
                    }`}
                    data-cursor-hover
                  >
                    {shot.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </>
          ) : project.image ? (
            <img
              src={project.image}
              alt={`Screenshot of ${project.title}`}
              className="h-full w-full object-cover object-top opacity-60 transition-all duration-500 group-hover:opacity-90 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f2e] via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      <div className="p-6">
        <h3 className="mb-2 font-[family-name:var(--font-pixel)] text-sm text-white transition-colors group-hover:text-[color:var(--card-color)]">
          {project.title}
        </h3>
        <p className="mb-4 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[#A0A0A0]">
          {isExpanded ? project.longDescription : project.description}
        </p>

        {project.longDescription !== project.description && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mb-4 font-[family-name:var(--font-pixel)] text-[8px] text-[#00F5FF] transition-colors hover:text-[#FF00E5]"
          >
            {isExpanded ? "[-] COLLAPSE" : "[+] READ MORE"}
          </button>
        )}

        {/* Tech stack */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="border border-white/5 bg-[#050816]/60 px-2 py-1 font-[family-name:var(--font-body)] text-[10px] text-[#A0A0A0] transition-colors group-hover:border-white/10"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-3">
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 border border-[#00FF88]/30 bg-[#00FF88]/10 px-4 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-[#00FF88] transition-all hover:bg-[#00FF88]/20 hover:shadow-[0_0_15px_rgba(0,255,136,0.15)]"
              data-cursor-hover
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00FF88]" style={{ boxShadow: "0 0 4px #00FF88" }} />
              LIVE
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 border border-white/10 bg-white/5 px-4 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0] transition-all hover:border-white/30 hover:text-white"
              data-cursor-hover
            >
              SOURCE
            </a>
          )}
        </div>
      </div>

      {/* Glow effect on hover */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${color}08 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === filter);

  return (
    <section ref={sectionRef} id="projects" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader command="PROJECTS.loadAll()" title="PROJECT ARCHIVE" level={3} />

        {/* Filter bar */}
        <div className="mb-12 flex flex-wrap items-center gap-3">
          <span className="font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/40 mr-2">
            FILTER:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`border px-4 py-2 font-[family-name:var(--font-pixel)] text-[10px] transition-all duration-200 ${
                filter === cat.key
                  ? "border-[#00F5FF] bg-[#00F5FF]/10 text-[#00F5FF] shadow-[0_0_10px_rgba(0,245,255,0.15)]"
                  : "border-white/10 text-[#A0A0A0] hover:border-white/20 hover:text-white"
              }`}
              data-cursor-hover
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2" style={{ perspective: "1200px" }}>
          {filtered.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center font-[family-name:var(--font-pixel)] text-xs text-[#A0A0A0]/50">
            NO PROJECTS IN THIS CATEGORY... YET
          </div>
        )}
      </div>
    </section>
  );
}

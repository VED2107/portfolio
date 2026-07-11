"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHeader } from "@/components/SectionHeader";
import type { GitHubData } from "@/lib/github";

gsap.registerPlugin(ScrollTrigger);

const LEVEL_COLORS = ["#0a0f2e", "#00F5FF20", "#00F5FF50", "#00F5FF90", "#00F5FF"];

const StarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2l2.9 6.9 7.1.6-5.4 4.6 1.7 7.3L12 17.6 5.7 21.4l1.7-7.3L2 9.5l7.1-.6z" />
  </svg>
);

const ForkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v2.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878zm3.75 7.378a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm3-8.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" />
  </svg>
);

// Arcade-style score rollup — counts to the value once the element scrolls into
// view. Respects prefers-reduced-motion by rendering the final number instantly.
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = value.toLocaleString();
      return;
    }

    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        const duration = 1200;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          el.textContent = Math.round(value * eased).toLocaleString();
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return <span ref={ref}>0</span>;
}

function getWeeks(days: GitHubData["contributions"]) {
  const weeks: GitHubData["contributions"][] = [];
  let week: GitHubData["contributions"] = [];
  const firstDay = days[0];
  if (firstDay) {
    const dow = new Date(firstDay.date).getDay();
    for (let i = 0; i < dow; i++) week.push({ date: "", count: 0, level: -1 });
  }
  for (const day of days) {
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) weeks.push(week);
  return weeks;
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="border border-white/5 bg-[#050816]/60 p-3 transition-all hover:border-[color:var(--c)]/20" style={{ "--c": color } as React.CSSProperties}>
      <div className="font-[family-name:var(--font-pixel)] text-[8px]" style={{ color }}>{label}</div>
      <div className="mt-1 font-[family-name:var(--font-pixel)] text-sm text-white [font-variant-numeric:tabular-nums]">{typeof value === "number" ? <CountUp value={value} /> : value}</div>
    </div>
  );
}

export function MissionControl({ data }: { data: GitHubData | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".mc-panel").forEach((panel, i) => {
        gsap.fromTo(panel, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.6, delay: i * 0.1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [data]);

  if (!data) {
    return (
      <section ref={sectionRef} id="mission-control" className="relative px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <SectionHeader command="MISSION_CONTROL.scan()" title="MISSION CONTROL" level={5} />
          <div className="pixel-border bg-[#0a0f2e]/60 p-8 text-center">
            <div className="font-[family-name:var(--font-pixel)] text-xs text-[#FF4D4D]">
              SIGNAL LOST — GITHUB UPLINK OFFLINE
            </div>
            <div className="mt-2 font-[family-name:var(--font-body)] text-sm text-[#A0A0A0]">
              Set GITHUB_TOKEN env variable to establish connection
            </div>
          </div>
        </div>
      </section>
    );
  }

  const { stats, pinnedRepos, languages, contributions } = data;
  const weeks = getWeeks(contributions);

  return (
    <section ref={sectionRef} id="mission-control" className="relative px-6 py-32">
      <div ref={contentRef} className="mx-auto max-w-6xl">
        <SectionHeader command="MISSION_CONTROL.scan()" title="MISSION CONTROL" level={5} />

        {/* Stats Grid */}
        <div className="mc-panel mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4" style={{ opacity: 0 }}>
          <StatBox label="COMMITS" value={stats.totalCommits} color="#00F5FF" />
          <StatBox label="TOTAL STARS" value={stats.totalStars} color="#FFE600" />
          <StatBox label="REPOSITORIES" value={stats.publicRepos} color="#FF00E5" />
          <StatBox label="CONTRIBUTIONS" value={stats.totalContributions} color="#00FF88" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Contribution Heatmap + Languages */}
          <div className="lg:col-span-2 space-y-6">
            {/* Heatmap */}
            <div className="mc-panel pixel-border bg-[#0a0f2e]/60 p-4" style={{ opacity: 0 }}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-[#00FF88]" style={{ boxShadow: "0 0 6px #00FF88" }} />
                  <span className="font-[family-name:var(--font-pixel)] text-[9px] text-[#00FF88]">ACTIVITY GRID</span>
                </div>
                <span className="font-[family-name:var(--font-pixel)] text-[9px] text-[#A0A0A0]">
                  {stats.totalContributions.toLocaleString()} THIS YEAR
                </span>
              </div>

              <div className="overflow-x-auto">
                <div
                  className="min-w-[680px]"
                  role="img"
                  aria-label={`GitHub contribution activity grid: ${stats.totalContributions.toLocaleString()} contributions in the last year`}
                >
                  <div className="flex gap-[3px]">
                    <div className="flex flex-col gap-[3px] pr-1">
                      {["", "M", "", "W", "", "F", ""].map((d, i) => (
                        <span key={i} className="flex h-[10px] w-4 items-center font-[family-name:var(--font-pixel)] text-[6px] text-[#A0A0A0]/30">{d}</span>
                      ))}
                    </div>
                    {weeks.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-[3px]">
                        {week.map((day, di) => (
                          <div
                            key={`${wi}-${di}`}
                            className="group relative h-[10px] w-[10px] transition-transform hover:scale-150"
                            title={day.date && day.count > 0 ? `${day.count} contributions on ${day.date}` : undefined}
                            style={{
                              backgroundColor: day.level < 0 ? "transparent" : LEVEL_COLORS[day.level],
                              border: day.level < 0 ? "none" : "1px solid rgba(255,255,255,0.03)",
                              imageRendering: "pixelated",
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-1.5">
                <span className="font-[family-name:var(--font-pixel)] text-[6px] text-[#A0A0A0]/40">LESS</span>
                {LEVEL_COLORS.map((c, i) => (
                  <div key={i} className="h-[8px] w-[8px]" style={{ backgroundColor: c, border: "1px solid rgba(255,255,255,0.03)" }} />
                ))}
                <span className="font-[family-name:var(--font-pixel)] text-[6px] text-[#A0A0A0]/40">MORE</span>
              </div>
            </div>

            {/* Language Distribution */}
            <div className="mc-panel pixel-border bg-[#0a0f2e]/60 p-4" style={{ opacity: 0 }}>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2 w-2 bg-[#FF00E5]" style={{ boxShadow: "0 0 6px #FF00E5" }} />
                <span className="font-[family-name:var(--font-pixel)] text-[9px] text-[#FF00E5]">LANGUAGE DISTRIBUTION</span>
              </div>

              <div className="mb-3 flex h-2 gap-[2px]">
                {languages.map((lang) => (
                  <div
                    key={lang.name}
                    className="h-full transition-all first:rounded-l-sm last:rounded-r-sm hover:brightness-125"
                    style={{ flex: lang.percentage, backgroundColor: lang.color }}
                    title={`${lang.name}: ${lang.percentage}%`}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {languages.map((lang) => (
                  <div key={lang.name} className="flex items-center gap-1.5">
                    <div className="h-2 w-2" style={{ backgroundColor: lang.color }} />
                    <span className="font-[family-name:var(--font-body)] text-[11px] text-[#A0A0A0]">{lang.name}</span>
                    <span className="font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/50">{lang.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Pinned Repos + Extra Stats */}
          <div className="space-y-6">
            {/* Pinned Repos */}
            <div className="mc-panel pixel-border bg-[#0a0f2e]/60 p-4" style={{ opacity: 0 }}>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2 w-2 bg-[#FFE600]" style={{ boxShadow: "0 0 6px #FFE600" }} />
                <span className="font-[family-name:var(--font-pixel)] text-[9px] text-[#FFE600]">PINNED REPOS</span>
              </div>

              <div className="space-y-2.5">
                {pinnedRepos.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-white/5 bg-[#050816]/40 p-3 transition-all hover:border-[#00F5FF]/20 hover:bg-[#050816]/70"
                    data-cursor-hover
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-[family-name:var(--font-pixel)] text-[9px] text-[#00F5FF]">{repo.name}</span>
                      {repo.stars > 0 && (
                        <span className="flex items-center gap-1 font-[family-name:var(--font-pixel)] text-[8px] text-[#FFE600]">
                          <StarIcon className="h-2.5 w-2.5" /> {repo.stars}
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="mt-1 font-[family-name:var(--font-body)] text-[10px] leading-relaxed text-[#A0A0A0]/70 line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-3">
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: repo.language.color }} />
                          <span className="font-[family-name:var(--font-body)] text-[9px] text-[#A0A0A0]/60">{repo.language.name}</span>
                        </div>
                      )}
                      {repo.forks > 0 && (
                        <span className="flex items-center gap-1 font-[family-name:var(--font-body)] text-[9px] text-[#A0A0A0]/40">
                          <ForkIcon className="h-2.5 w-2.5" /> {repo.forks}
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Extra Stats */}
            <div className="mc-panel pixel-border bg-[#0a0f2e]/60 p-4" style={{ opacity: 0 }}>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2 w-2 bg-[#00F5FF]" style={{ boxShadow: "0 0 6px #00F5FF" }} />
                <span className="font-[family-name:var(--font-pixel)] text-[9px] text-[#00F5FF]">SYSTEM DIAGNOSTICS</span>
              </div>

              <div className="space-y-2">
                {[
                  { label: "PULL REQUESTS", value: stats.totalPRs, color: "#FF00E5" },
                  { label: "ISSUES", value: stats.totalIssues, color: "#FFE600" },
                  { label: "FOLLOWERS", value: stats.followers, color: "#00FF88" },
                  { label: "FOLLOWING", value: stats.following, color: "#A0A0A0" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between border-b border-white/5 pb-1.5 last:border-0">
                    <span className="font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/60">{item.label}</span>
                    <span className="font-[family-name:var(--font-pixel)] text-[10px]" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 border-t border-white/5 pt-2 font-[family-name:var(--font-pixel)] text-[7px] text-[#A0A0A0]/30">
                LAST SYNC: {new Date(data.fetchedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

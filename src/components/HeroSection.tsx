"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE } from "@/lib/data";
import { GlitchText } from "@/components/GlitchText";
import { MagneticButton } from "@/components/MagneticButton";

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const skylineRef = useRef<HTMLDivElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [typedRole, setTypedRole] = useState("");

  useEffect(() => {
    // Don't cycle roles for users who prefer reduced motion — the typing effect
    // below renders the current role statically instead.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % SITE.roles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const role = SITE.roles[roleIndex];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTypedRole(role);
      return;
    }
    let i = 0;
    setTypedRole("");
    const type = setInterval(() => {
      if (i <= role.length) {
        setTypedRole(role.slice(0, i));
        i++;
      } else {
        clearInterval(type);
      }
    }, 50);
    return () => clearInterval(type);
  }, [roleIndex]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        statusRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, scale: 0.5, y: 60, filter: "blur(10px)" },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.4,
            ease: "elastic.out(1, 0.8)",
          },
          0.2
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          0.8
        )
        .fromTo(
          buttonsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          1.2
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          y: -200,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
      if (orb2Ref.current) {
        gsap.to(orb2Ref.current, {
          y: -120,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }
      if (orb3Ref.current) {
        gsap.to(orb3Ref.current, {
          y: -80,
          x: 40,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 2,
          },
        });
      }
      if (skylineRef.current) {
        gsap.to(skylineRef.current, {
          y: 60,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="pixel-grid relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Animated gradient orbs with parallax */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          ref={orb1Ref}
          className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-[#00F5FF]/[0.04] blur-[150px] will-change-transform"
          style={{ animation: "float 8s ease-in-out infinite" }}
        />
        <div
          ref={orb2Ref}
          className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-[#FF00E5]/[0.04] blur-[130px] will-change-transform"
          style={{
            animation: "float 6s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />
        <div
          ref={orb3Ref}
          className="absolute bottom-1/4 left-1/3 h-[300px] w-[300px] rounded-full bg-[#FFE600]/[0.02] blur-[100px] will-change-transform"
          style={{
            animation: "float 10s ease-in-out infinite",
            animationDelay: "4s",
          }}
        />
      </div>

      {/* Pixel skyline silhouette with parallax */}
      <div ref={skylineRef} className="absolute bottom-0 left-0 right-0 h-32 opacity-10 will-change-transform" aria-hidden="true">
        <svg
          viewBox="0 0 1440 128"
          className="h-full w-full"
          preserveAspectRatio="none"
          fill="#00F5FF"
        >
          <path d="M0,128 L0,80 L40,80 L40,60 L60,60 L60,40 L80,40 L80,70 L120,70 L120,50 L140,50 L140,30 L160,30 L160,50 L180,50 L180,80 L220,80 L220,45 L240,45 L240,25 L280,25 L280,45 L300,45 L300,60 L340,60 L340,35 L380,35 L380,55 L400,55 L400,20 L420,20 L420,40 L460,40 L460,70 L500,70 L500,50 L520,50 L520,30 L560,30 L560,55 L580,55 L580,75 L620,75 L620,40 L660,40 L660,60 L680,60 L680,25 L720,25 L720,50 L760,50 L760,70 L780,70 L780,45 L820,45 L820,65 L840,65 L840,35 L880,35 L880,55 L900,55 L900,20 L940,20 L940,45 L960,45 L960,75 L1000,75 L1000,50 L1040,50 L1040,30 L1080,30 L1080,55 L1100,55 L1100,70 L1140,70 L1140,40 L1180,40 L1180,60 L1200,60 L1200,25 L1240,25 L1240,50 L1280,50 L1280,70 L1300,70 L1300,45 L1340,45 L1340,65 L1380,65 L1380,80 L1420,80 L1420,55 L1440,55 L1440,128 Z" />
        </svg>
      </div>

      <div className="relative z-10 text-center">
        <div
          ref={statusRef}
          className="mb-6 font-[family-name:var(--font-pixel)] text-[10px] text-[#00F5FF]/60"
          style={{ opacity: 0 }}
        >
          <span className="inline-block h-2 w-2 bg-[#00FF88] mr-2" style={{ boxShadow: "0 0 6px #00FF88" }} />
          SYSTEM ONLINE — ALL MODULES LOADED
        </div>

        <div ref={titleRef} style={{ opacity: 0 }}>
          <h1 className="mb-8 font-[family-name:var(--font-pixel)] text-5xl leading-tight text-white sm:text-6xl md:text-8xl">
            <GlitchText
              text="VED"
              className="neon-text"
            />
            <span className="text-[#FF00E5] mx-1">.</span>
            <GlitchText
              text="EXE"
              className="neon-text-pink"
            />
          </h1>
        </div>

        <div ref={subtitleRef} className="space-y-4" style={{ opacity: 0 }}>
          <div className="flex items-center justify-center gap-2 font-[family-name:var(--font-pixel)] text-xs text-[#A0A0A0] sm:text-sm">
            <span className="text-[#FF00E5]">//</span>
            <span className="min-w-[200px] text-left">
              {typedRole}
              <span className="inline-block w-2 h-4 bg-[#00F5FF] ml-0.5 align-middle" style={{ animation: "blink 1s infinite" }} />
            </span>
          </div>

          <p className="mx-auto max-w-xl font-[family-name:var(--font-body)] text-base leading-relaxed text-[#A0A0A0]/80 sm:text-lg">
            Building real-world, production-ready systems at the intersection of
            engineering, scalability, and design.
          </p>
        </div>

        <div ref={buttonsRef} className="mx-auto mt-10 flex w-full max-w-xs flex-col items-center justify-center gap-3 px-6 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4 sm:px-0" style={{ opacity: 0 }}>
          <MagneticButton
            href="#projects"
            className="group relative w-full overflow-hidden pixel-border bg-[#00F5FF]/10 px-8 py-3 text-center font-[family-name:var(--font-pixel)] text-xs text-[#00F5FF] transition-all hover:bg-[#00F5FF]/20 hover:shadow-[0_0_30px_rgba(0,245,255,0.3)] sm:w-auto"
            strength={0.35}
            data-cursor-hover
          >
            <span className="relative z-10">VIEW PROJECTS</span>
            <div className="absolute inset-0 -translate-x-full bg-[#00F5FF]/10 transition-transform duration-300 group-hover:translate-x-0" />
          </MagneticButton>
          <MagneticButton
            href="#contact"
            className="group relative w-full overflow-hidden border border-[#FF00E5]/50 bg-transparent px-8 py-3 text-center font-[family-name:var(--font-pixel)] text-xs text-[#FF00E5] transition-all hover:border-[#FF00E5] hover:bg-[#FF00E5]/10 sm:w-auto"
            strength={0.35}
            data-cursor-hover
          >
            <span className="relative z-10">CONTACT</span>
            <div className="absolute inset-0 -translate-x-full bg-[#FF00E5]/10 transition-transform duration-300 group-hover:translate-x-0" />
          </MagneticButton>
          <MagneticButton
            href={SITE.resume}
            download="Ved_Chauhan_RESUME.pdf"
            className="group relative w-full overflow-hidden border border-[#00FF88]/50 bg-transparent px-8 py-3 text-center font-[family-name:var(--font-pixel)] text-xs text-[#00FF88] transition-all hover:border-[#00FF88] hover:bg-[#00FF88]/10 sm:w-auto"
            strength={0.35}
            data-cursor-hover
            aria-label="Download résumé (PDF)"
          >
            <span className="relative z-10">RÉSUMÉ</span>
            <div className="absolute inset-0 -translate-x-full bg-[#00FF88]/10 transition-transform duration-300 group-hover:translate-x-0" />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}

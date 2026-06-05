"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { SectionTransition } from "@/components/SectionTransition";
import { StarField } from "@/components/StarField";
import { PageEntrance } from "@/components/PageEntrance";
import { KonamiCode } from "@/components/KonamiCode";
import { MissionControl } from "@/components/MissionControl";
import type { GitHubData } from "@/lib/github";

const PlayerProfile = lazy(() => import("@/components/PlayerProfile").then(m => ({ default: m.PlayerProfile })));
const QuestLog = lazy(() => import("@/components/QuestLog").then(m => ({ default: m.QuestLog })));
const ProjectsSection = lazy(() => import("@/components/ProjectsSection").then(m => ({ default: m.ProjectsSection })));
const SkillsSection = lazy(() => import("@/components/SkillsSection").then(m => ({ default: m.SkillsSection })));
const AchievementsSection = lazy(() => import("@/components/AchievementsSection").then(m => ({ default: m.AchievementsSection })));
const ContactTerminal = lazy(() => import("@/components/ContactTerminal").then(m => ({ default: m.ContactTerminal })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

export function HomePage({ githubData }: { githubData: GitHubData | null }) {
  const [loaded, setLoaded] = useState(false);

  const handleLoadComplete = useCallback(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      const scrollToTop = () => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      };
      scrollToTop();
      requestAnimationFrame(scrollToTop);
      requestAnimationFrame(() => requestAnimationFrame(scrollToTop));
      const timeout = setTimeout(scrollToTop, 100);
      return () => clearTimeout(timeout);
    }
  }, [loaded]);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}

      {loaded && (
        <PageEntrance>
          <main className="relative">
            <StarField />
            <KonamiCode />
            <Navbar />
            <HeroSection />
            <Suspense>
              <SectionTransition />
              <PlayerProfile />
              <SectionTransition />
              <QuestLog />
              <SectionTransition />
              <ProjectsSection />
              <SectionTransition />
              <SkillsSection />
              <SectionTransition />
              <MissionControl data={githubData} />
              <SectionTransition />
              <AchievementsSection />
              <SectionTransition />
              <ContactTerminal />
              <Footer />
            </Suspense>
          </main>
        </PageEntrance>
      )}
    </>
  );
}

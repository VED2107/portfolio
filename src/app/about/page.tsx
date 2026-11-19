import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { MAILTO } from "@/components/CopyEmail";
import { ABOUT, CONFIRMED, DISCOGRAPHY, EDUCATION, HONORS, PHOTOS, SITE, STATUS, formatDate } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "Ved S. Chauhan: computer engineering student at Ganpat University, founder of SNOWBROS, and the person behind its software.",
  alternates: { canonical: "/about" },
};

const HONOR_PHOTO: Record<string, { src: string; w: number; h: number; alt: string } | undefined> = {
  "research-conclave-2026": { src: PHOTOS.trophy.src, w: PHOTOS.trophy.w, h: PHOTOS.trophy.h, alt: PHOTOS.trophy.alt },
  "amr-letter-of-appreciation": { src: "/awards/amr-letter-of-appreciation-2.webp", w: 990, h: 1400, alt: "The letter of appreciation from Shree S. K. Patel College for the AMR Drug Repurposing platform." },
  "arduino-edge-ai-bootcamp": { src: "/awards/arduino-edge-ai-bootcamp-2.webp", w: 652, h: 480, alt: "The Arduino Edge AI Bootcamp, with the UNO Q gesture classifier running." },
};

export default function About() {
  return (
    <main id="main">
      <section className="wrap about-top" aria-labelledby="about-h">
        <figure className="about-photo enter" style={{ "--i": 0, margin: 0 } as React.CSSProperties}>
          <ViewTransition name="ved-photo" share="photo-morph">
            <Image src={PHOTOS.portrait.src} alt={PHOTOS.portrait.alt} width={PHOTOS.portrait.w} height={PHOTOS.portrait.h} priority sizes="(max-width: 860px) 380px, 30vw" />
          </ViewTransition>
        </figure>
        <div className="about-intro">
          <h1 id="about-h" className="t-display enter" style={{ "--i": 1 } as React.CSSProperties}>
            Based in Patan, Gujarat. Studying computer engineering at Ganpat University. Running SNOWBROS on the side, and sometimes the other way <em className="serif">round</em>.
          </h1>
        </div>
      </section>

      <section className="wrap about-float" aria-label="Dubai">
        <figure data-reveal>
          <Image src={PHOTOS.dubai.src} alt={PHOTOS.dubai.alt} width={PHOTOS.dubai.w} height={PHOTOS.dubai.h} sizes="(max-width: 860px) 100vw, 40vw" />
          <figcaption className="photo-cap">{PHOTOS.dubai.caption}</figcaption>
        </figure>
      </section>

      <section className="wrap section" aria-labelledby="story-h" style={{ paddingTop: "clamp(48px, 6vw, 96px)" }}>
        <div className="inset" data-reveal>
          <h2 id="story-h" className="t-h2" style={{ maxWidth: "22ch" }}>
            I build for people who will notice when it breaks, and I would rather they <em className="serif">never</em> have to.
          </h2>
          <div className="t-lead prose about-story" style={{ marginTop: 36 }}>
            <p>
              I study computer engineering at U.V. Patel College of Engineering, Ganpat University, class of 2028. The coursework is the foundation: data structures, operating systems, databases, algorithms. Almost everything on this site was built alongside it.
            </p>
            <p>
              {ABOUT.statement.replace("I started SNOWBROS", "In February 2026 I started SNOWBROS")} The first clients were a family bridal boutique, then a tuition academy teaching two boards and two entrance exams. The boutique now bills its customers on a till I built, online or off.
            </p>
            <p>
              Alongside client work I build my own products. Atlas is a static analyzer in Rust, published to npm and crates.io. NOVA is a media player that only shows what its engine confirms. SwiftDrop moves files across a room instead of around the internet.
            </p>
            <p>
              In October 2026 two things landed in the same month. The research software I co-led with Yash Prajapati for a pharmacy college earned a letter of appreciation, and an AI project on human activity recognition took first rank at Ganpat University&apos;s Research Conclave.
            </p>
            <p>{ABOUT.body[1]}</p>
            <p>
              The rule I keep coming back to is my own: <strong>{ABOUT.principle}</strong> It is why every number on this site comes with its source.
            </p>
            <p>Away from the keyboard, I travel when I can. The pictures on this page are mine.</p>
          </div>
        </div>
      </section>

      <section className="wrap about-wide" aria-label="Sunset on the dunes">
        <figure data-reveal>
          <Image src={PHOTOS.dunes.src} alt={PHOTOS.dunes.alt} width={PHOTOS.dunes.w} height={PHOTOS.dunes.h} sizes="(max-width: 860px) 100vw, 46vw" />
          <figcaption className="photo-cap">{PHOTOS.dunes.caption}</figcaption>
        </figure>
        <figure data-reveal style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
          <Image src={PHOTOS.letter.src} alt={PHOTOS.letter.alt} width={PHOTOS.letter.w} height={PHOTOS.letter.h} sizes="(max-width: 860px) 100vw, 46vw" />
          <figcaption className="photo-cap">{PHOTOS.letter.caption}</figcaption>
        </figure>
      </section>

      <section className="wrap" aria-labelledby="exp-h">
        <div className="inset">
          <h2 id="exp-h" className="t-meta" style={{ marginBottom: 16 }}>
            Experience
          </h2>
          <div className="rows" data-reveal>
            <div className="row">
              <span className="row-title">Founder and software engineer, SNOWBROS</span>
              <span className="row-sub">
                An independent software studio. Client work and products, end to end: data models, APIs, interfaces, native apps and their release pipelines.{" "}
                <a href={SITE.studioUrl} className="link" rel="noopener">
                  snowbros.me
                </a>
              </span>
              <span className="t-meta">Feb 2026 – now</span>
            </div>
          </div>

          <h2 className="t-meta" style={{ margin: "56px 0 16px" }}>
            Education
          </h2>
          <div className="rows" data-reveal>
            <div className="row">
              <span className="row-title">{EDUCATION.degree}</span>
              <span className="row-sub">
                {EDUCATION.school}. {EDUCATION.coursework}
              </span>
              <span className="t-meta">{EDUCATION.when.replace(" to ", " – ")}</span>
            </div>
            <div className="row">
              <span className="row-title">Student member, IEEE GUNI Student Branch</span>
              <span className="row-sub">A membership, not a position.</span>
              <span className="t-meta">Jul 2024 – now</span>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap section" aria-labelledby="rec-h">
        <div className="inset">
          <h2 id="rec-h" className="t-h2" style={{ marginBottom: 32 }}>
            Recognition
          </h2>
          <div className="honors">
            {HONORS.map((h) => {
              const ph = HONOR_PHOTO[h.id];
              return (
                <div key={h.id} className="honor" data-reveal>
                  <div>
                    <p className="t-meta" style={{ margin: "0 0 8px" }}>
                      {h.by} · {h.when}
                    </p>
                    <h3 className="t-h3">{h.title}</h3>
                    <p className="t-body" style={{ margin: "8px 0 0" }}>
                      {h.detail}{" "}
                      {h.href && (
                        <Link href={h.href} className="link">
                          Read the case study
                        </Link>
                      )}
                    </p>
                  </div>
                  {ph && (
                    <div className="honor-img">
                      <Image src={ph.src} alt={ph.alt} width={ph.w} height={ph.h} sizes="220px" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="wrap" aria-labelledby="ship-h">
        <div className="inset">
          <h2 id="ship-h" className="t-meta" style={{ marginBottom: 16 }}>
            Shipped, in order
          </h2>
          <ol className="rows" style={{ listStyle: "none", padding: 0, margin: 0 }} data-reveal>
            {DISCOGRAPHY.map((d) => (
              <li key={d.title + d.when} className="row">
                <span className="row-title">
                  {d.slug ? (
                    <Link href={`/work/${d.slug}`} className="link">
                      {d.title === "VED.EXE" ? "An earlier portfolio" : d.title}
                    </Link>
                  ) : d.href ? (
                    <a href={d.href} className="link" rel="noopener">
                      {d.title}
                    </a>
                  ) : (
                    d.title
                  )}
                </span>
                <span className="row-sub">{d.title === "VED.EXE" ? "The terminal-era version of this site" : d.what}</span>
                <span className="t-meta">{d.when}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap section" aria-labelledby="avail-h">
        <div className="inset" data-reveal>
          <h2 id="avail-h" className="t-h2" style={{ maxWidth: "22ch" }}>
            Available for work.
          </h2>
          <p className="t-lead" style={{ marginTop: 16, maxWidth: "56ch" }}>
            {STATUS} <span style={{ color: "var(--ink-3)" }}>Confirmed {formatDate(CONFIRMED)}.</span>
          </p>
          <div className="intro-actions">
            <a href={MAILTO} className="arrow-link">
              <span className="label">{SITE.email}</span> <span className="ar">→</span>
            </a>
            <a href={SITE.resume} className="arrow-link">
              <span className="label">Résumé, PDF</span> <span className="ar down">↓</span>
            </a>
            <a href={SITE.linkedin} className="arrow-link" rel="noopener">
              <span className="label">LinkedIn</span> <span className="ar up">↗</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

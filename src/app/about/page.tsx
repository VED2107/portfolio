import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
          <Image src={PHOTOS.letter.src} alt={PHOTOS.letter.alt} width={PHOTOS.letter.w} height={PHOTOS.letter.h} priority sizes="(max-width: 860px) 380px, 34vw" />
        </figure>
        <div>
          <h1 id="about-h" className="t-display enter" style={{ "--i": 1, maxWidth: "19ch" } as React.CSSProperties}>
            From Patan, Gujarat. Studying computer engineering, building SNOWBROS, shipping what clients actually use.
          </h1>
          <p className="photo-cap enter" style={{ "--i": 2, marginTop: 28 } as React.CSSProperties}>
            Pictured: {PHOTOS.letter.caption}
          </p>
        </div>
      </section>

      <section className="wrap about-float" aria-label="Research Conclave 2026">
        <figure data-reveal>
          <Image src={PHOTOS.conclave.src} alt={PHOTOS.conclave.alt} width={PHOTOS.conclave.w} height={PHOTOS.conclave.h} sizes="(max-width: 860px) 100vw, 34vw" />
          <figcaption className="photo-cap">{PHOTOS.conclave.caption}</figcaption>
        </figure>
      </section>

      <section className="wrap section" aria-labelledby="story-h" style={{ paddingTop: "clamp(48px, 6vw, 96px)" }}>
        <div className="inset" data-reveal>
          <h2 id="story-h" className="t-h2" style={{ maxWidth: "24ch" }}>
            {ABOUT.statement}
          </h2>
          <div className="t-lead prose" style={{ marginTop: 32 }}>
            {ABOUT.body.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
            <p>
              The studio is how that happens. SNOWBROS is where a boutique&apos;s till, an academy&apos;s portal and a pharmacy college&apos;s research software got built, mostly by me, with credit given where it&apos;s shared: the AMR platform was co-led with Yash Prajapati.
            </p>
            <p>
              The rule I keep coming back to is my own: <strong>{ABOUT.principle}</strong> It is why the numbers on this site come with their source.
            </p>
          </div>
        </div>
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

import Image from "next/image";
import Link from "next/link";
import { Experiments } from "@/components/Experiments";
import { Feature } from "@/components/Feature";
import { PhotoStack } from "@/components/PhotoStack";
import { SameInput } from "@/components/SameInput";
import { ARCHIVE, EXPERIMENTS, PAIRED, PRINCIPLES, SELECTED, SITE, getFiling, storyOf } from "@/lib/content";

const ARCHIVE_ROWS = [
  ...["swiftdrop", "vinnys-vogue"].map((slug) => {
    const f = getFiling(slug)!;
    return { title: f.title, field: storyOf(slug).benefit, year: f.year, href: `/work/${slug}`, internal: true, preview: f.plate };
  }),
  ...ARCHIVE.filter((a) => a.title === "SNOWBROS" || a.title === "Lunora Studio").map((a) => ({ title: a.title, field: a.field, year: a.year, href: a.href, internal: false, preview: a.preview })),
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.person,
    url: SITE.url,
    jobTitle: "Software engineer",
    worksFor: { "@type": "Organization", name: SITE.studio, url: SITE.studioUrl },
    address: { "@type": "PostalAddress", addressLocality: "Patan", addressRegion: "Gujarat", addressCountry: "IN" },
    sameAs: [SITE.github, SITE.linkedin],
  };

  return (
    <main id="main">
      {/* ---------------------------------------------------------------- intro */}
      <section className="wrap intro" aria-labelledby="hello">
        <div className="inset">
          <PhotoStack />
          <h1 id="hello" className="t-intro">
            <span className="mask">
              <span className="rise" style={{ "--i": 1 } as React.CSSProperties}>
                Hey, I&apos;m Ved.
              </span>
            </span>
            <span className="mask">
              <span className="rise" style={{ "--i": 2 } as React.CSSProperties}>
                I build software for real people, real work, and the details that <em className="serif">matter</em>.{" "}
                <span className="soft">Engineer and founder of SNOWBROS, in Gujarat, India.</span>
              </span>
            </span>
          </h1>
          <div className="intro-actions enter" style={{ "--i": 3 } as React.CSSProperties}>
            <a href="#work" className="arrow-link">
              <span className="label">Selected work</span> <span className="ar down">↓</span>
            </a>
            <Link href="/about" className="arrow-link">
              <span className="label">About me</span> <span className="ar up">↗</span>
            </Link>
            <a href={SITE.resume} className="arrow-link">
              <span className="label">Résumé</span> <span className="ar down">↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- selected work */}
      <section id="work" className="wrap" aria-labelledby="work-title" style={{ scrollMarginTop: 72 }}>
        <h2 id="work-title" className="chapter-mark">
          <span className="chapter-no">01</span> Selected work
        </h2>
        <div className="work">
          {SELECTED.map((slug, i) => (
            <Feature key={slug} slug={slug} priority={i === 0} index={i} total={SELECTED.length + PAIRED.length} />
          ))}
          <div className="pair">
            {PAIRED.map((slug, i) => (
              <Feature key={slug} slug={slug} index={SELECTED.length + i} total={SELECTED.length + PAIRED.length} />
            ))}
          </div>
        </div>

        {/* A quieter archive: real work that doesn't need a full composition here. */}
        <div style={{ marginTop: "clamp(72px, 9vw, 128px)" }} data-reveal>
          <div className="inset" style={{ marginBottom: 28 }}>
            <h3 className="t-h3">Also shipped</h3>
            <p className="t-small" style={{ margin: "6px 0 0" }}>
              Smaller client builds and products, all live or public.
            </p>
          </div>
          <ul className="archive" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {ARCHIVE_ROWS.map((r) => {
              const inner = (
                <>
                  <span className={`archive-thumb${r.preview ? "" : " blank"}`} aria-hidden>
                    {r.preview ? <Image src={r.preview.src} alt="" width={184} height={115} sizes="92px" /> : "—"}
                  </span>
                  <span className="archive-title">
                    {r.title} {!r.internal && <span aria-hidden style={{ color: "var(--ink-3)" }}>↗</span>}
                  </span>
                  <span className="archive-field">{r.field}</span>
                  <span className="t-meta">{r.year}</span>
                </>
              );
              return (
                <li key={r.title}>
                  {r.internal ? (
                    <Link href={r.href} className="archive-row">
                      {inner}
                    </Link>
                  ) : (
                    <a href={r.href} className="archive-row" rel="noopener">
                      {inner}
                      <span className="sr-only">(opens the live site)</span>
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------------- approach */}
      <section className="approach section" style={{ marginTop: "clamp(96px, 12vw, 176px)" }} aria-labelledby="approach-title">
        <div className="wrap">
          <div className="approach-top">
            <div data-reveal>
              <p className="chapter-mark" style={{ marginBottom: 28 }}>
                <span className="chapter-no">02</span> Method
              </p>
              <h2 id="approach-title" className="t-display">
                Same input in, same <em className="serif">result</em> out. <span style={{ color: "var(--ink-2)" }}>Accuracy over quantity.</span>
              </h2>
            </div>
            <div data-reveal style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
              <SameInput />
            </div>
          </div>
          <div className="principles">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="principle" data-reveal>
                <h3 className="t-h3">{p.title}</h3>
                <p className="t-body" style={{ margin: "10px 0 8px" }}>
                  {p.body}
                </p>
                <Link href={p.href} className="arrow-link" style={{ fontSize: 16 }}>
                  <span className="label">{p.link}</span> <span className="ar">→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- experiments */}
      <section id="experiments" className="section" aria-labelledby="exp-title-h" style={{ scrollMarginTop: 72 }}>
        <Experiments
          items={EXPERIMENTS}
          head={
            <div className="exp-title">
              <p className="chapter-mark exp-chapter">
                <span className="chapter-no">03</span> Lab
              </p>
              <p className="exp-scroll" aria-hidden>
                Scroll <span>→</span>
              </p>
              <h2 id="exp-title-h" className="t-h2">
                Side builds, studio sites, a microcontroller, et <em className="serif">cetera</em>.
              </h2>
            </div>
          }
        />
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}

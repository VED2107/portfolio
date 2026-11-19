import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chain, STAGE_ALT, STAGE_CLASS, StageArt } from "@/components/Stage";
import { Toc, TocMobile, type TocItem } from "@/components/Toc";
import { Zoom } from "@/components/Zoom";
import { MAILTO } from "@/components/CopyEmail";
import { FILINGS, SITE, getFiling, linksOf, nextAfter, plain, slugify, storyOf } from "@/lib/content";
import type { Figure } from "@/lib/work";

export function generateStaticParams() {
  return FILINGS.map((f) => ({ slug: f.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const f = getFiling(slug);
  if (!f) notFound();
  const s = storyOf(slug);
  const image = `/api/og?slug=${encodeURIComponent(f.slug)}`;
  return {
    title: `${f.title}: ${s.headline}`,
    description: f.short,
    alternates: { canonical: `/work/${f.slug}` },
    openGraph: { type: "article", url: `/work/${f.slug}`, title: `${f.title}: ${s.headline}`, description: f.short, images: [{ url: image, width: 1200, height: 630, alt: f.title }] },
    twitter: { card: "summary_large_image", title: f.title, description: f.short, images: [image] },
  };
}

/** Accounic: one schema, three clients. Drawn from the README's description, nothing added. */
function AccounicArch() {
  const clients = ["Web · Next.js", "Android · Flutter", "Windows · Flutter"];
  return (
    <div className="arch" aria-hidden>
      <svg viewBox="0 0 900 360" role="presentation" fontFamily="var(--font-mono)" fontSize="15">
        {clients.map((c, i) => (
          <g key={c} transform={`translate(${40 + i * 290} 30)`}>
            <rect width="240" height="56" rx="10" fill="var(--canvas)" stroke="var(--line)" />
            <text x="120" y="34" textAnchor="middle" fill="var(--ink)">
              {c}
            </text>
            <path d={`M120 56 V 128`} stroke="var(--ink-3)" strokeDasharray="4 5" />
          </g>
        ))}
        <text x="450" y="128" textAnchor="middle" fill="var(--ink-2)" fontSize="13">
          user&apos;s JWT · validated RPCs · read-only views
        </text>
        <rect x="40" y="160" width="820" height="170" rx="14" fill="var(--canvas)" stroke="var(--ink)" />
        <text x="70" y="198" fill="var(--ink)" fontSize="16">
          PostgreSQL · Supabase
        </text>
        {["person_balances", "owner_summary", "FIFO settlement", "integer minor units", "forced row-level security"].map((t, i) => (
          <g key={t} transform={`translate(${70 + (i % 3) * 262} ${222 + Math.floor(i / 3) * 52})`}>
            <rect width="244" height="38" rx="8" fill="var(--panel)" />
            <text x="14" y="25" fill="var(--ink-2)" fontSize="14">
              {t}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function FigureBlock({ fig }: { fig: Figure }) {
  if (fig.kind === "image") return <Zoom img={fig.img} caption={fig.caption} callouts={fig.callouts} />;
  if (fig.kind === "code")
    return (
      <div className="inset">
      <figure className="wide-figure">
        <div className="code-head">
          <span className="t-meta">{fig.title}</span>
          <span className="t-meta" style={{ color: "var(--ink-3)" }}>
            {fig.lang}
          </span>
        </div>
        <pre className="code" tabIndex={0} aria-label={`${fig.title}, code`}>
          {fig.code}
        </pre>
        <figcaption>{fig.caption}</figcaption>
      </figure>
      </div>
    );
  return (
    <figure className="wide-figure">
      {fig.drawing === "accounic-arch" ? (
        <AccounicArch />
      ) : (
        <div className="stage stage-atlas" style={{ aspectRatio: "auto", padding: "clamp(24px, 5vw, 64px)", display: "grid", placeItems: "center" }}>
          <Chain box={{ position: "relative" }} />
        </div>
      )}
      <figcaption>{fig.caption}</figcaption>
    </figure>
  );
}

export default async function WorkPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const f = getFiling(slug);
  if (!f) notFound();
  const s = storyOf(slug);
  const next = nextAfter(slug);
  const ns = storyOf(next.slug);
  const { live, source } = linksOf(f);
  const art = Boolean(STAGE_CLASS[slug]);
  const figures = f.figures.filter((x) => !(art && x.kind === "image" && x.img.src === f.plate?.src && x.callouts === undefined));

  const toc: TocItem[] = [
    { id: "problem", label: "The problem" },
    ...(figures.length ? [{ id: "evidence", label: "The product" }] : []),
    { id: "decisions", label: "Decisions" },
    { id: "outcomes", label: "Outcomes" },
    { id: "limits", label: "Limits and open questions" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: f.title,
    headline: s.headline,
    description: f.short,
    author: { "@type": "Person", name: SITE.person, url: SITE.url },
    url: `${SITE.url}/work/${f.slug}`,
  };

  return (
    <main id="main">
      <article>
        {/* ------------------------------------------------------------ opening */}
        <header className="wrap case-open">
          <div className="inset">
            <div className="ident enter" style={{ "--i": 0 } as React.CSSProperties}>
              <span className="ident-mark" style={{ background: s.mark.bg, color: s.mark.ink }} aria-hidden>
                {s.mark.text}
              </span>
              <span className="ident-text">
                <span style={{ color: "var(--ink)" }}>{f.title}</span>
                <span>{s.category}</span>
              </span>
            </div>
            <h1 className="t-display enter" style={{ "--i": 1, maxWidth: "20ch" } as React.CSSProperties}>
              {s.headline}
            </h1>
            <p className="t-lead enter" style={{ "--i": 2, marginTop: 28, maxWidth: "62ch" } as React.CSSProperties}>
              {f.abstract}
            </p>
            <div className="facts-grid enter" style={{ "--i": 3 } as React.CSSProperties}>
              <div className="fact-card">
                <span className="t-meta">Role</span>
                <span>{f.role}</span>
              </div>
              <div className="fact-card">
                <span className="t-meta">People</span>
                <ul>
                  {s.team.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="fact-card">
                <span className="t-meta">When · status</span>
                <span>{s.period}</span>
                <span className="t-small">{f.status}</span>
              </div>
            </div>
            {(live.length > 0 || source.length > 0) && (
              <div className="case-links enter" style={{ "--i": 4 } as React.CSSProperties}>
                {[...live, ...source].map((l) => (
                  <a key={l.href} href={l.href} className="arrow-link" rel="noopener">
                    <span className="label">{l.label}</span> <span className="ar up">↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* ------------------------------------------------------------ lead image */}
        {art ? (
          <div className="wrap case-hero">
            <div className={`stage ${STAGE_CLASS[slug]}`} role="img" aria-label={STAGE_ALT[slug]}>
              <div className="stage-inner">
                <StageArt slug={slug} priority />
              </div>
            </div>
          </div>
        ) : f.plate ? (
          <div className="wrap case-hero">
            <div className="stage" style={{ aspectRatio: "auto", padding: "clamp(16px, 5vw, 72px)" }}>
              <Image src={f.plate.src} alt={f.plate.alt} width={f.plate.w} height={f.plate.h} priority sizes="(max-width: 1440px) 92vw, 1300px" quality={90} style={{ display: "block", width: "100%", height: "auto", borderRadius: 8, boxShadow: "var(--shadow-shot)" }} />
            </div>
          </div>
        ) : null}

        {/* ------------------------------------------------------------ body */}
        <div className="wrap case-layout">
          <div className="case-main">
            <Toc items={toc} />
            <div className="inset">
              <TocMobile items={toc} />
              <section id="problem" className="chapter" style={{ paddingTop: 40 }} aria-labelledby="problem-h">
                <h2 id="problem-h" className="t-h2">
                  The problem
                </h2>
                <div className="t-body prose">
                  <p>{f.background}</p>
                  <p>{f.short}</p>
                </div>
              </section>
            </div>

            {figures.length > 0 && (
              <section id="evidence" className="chapter" aria-labelledby="evidence-h">
                <div className="inset">
                  <h2 id="evidence-h" className="t-h2">
                    The product
                  </h2>
                  <p className="t-body" style={{ margin: 0 }}>
                    Real captures and the code that matters, captioned. Screens open full size.
                  </p>
                </div>
                {figures.map((fig, i) => (
                  <FigureBlock key={i} fig={fig} />
                ))}
              </section>
            )}

            <div className="inset">
              <section id="decisions" className="chapter" aria-labelledby="decisions-h">
                <h2 id="decisions-h" className="t-h2">
                  Decisions
                </h2>
                <p className="t-body" style={{ margin: 0 }}>
                  The choices that shaped it, and what each one costs.
                </p>
                {f.decisions.map((d, i) => (
                  <div key={d.title} id={slugify(d.title)} className="decision" style={{ scrollMarginTop: 96 }}>
                    <span className="decision-no">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="t-h3">{d.title}</h3>
                      <p className="t-body" style={{ margin: 0 }}>
                        {d.body}
                      </p>
                      {d.code && (
                        <details className="more">
                          <summary>
                            Show the output <span aria-hidden>↓</span>
                          </summary>
                          <pre className="code" tabIndex={0}>
                            {d.code.code}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </section>

              <section id="outcomes" className="chapter" aria-labelledby="outcomes-h">
                <h2 id="outcomes-h" className="t-h2">
                  Outcomes
                </h2>
                <dl className="outcomes" style={{ margin: 0 }}>
                  {f.facts.map((x) => (
                    <div key={x.label} className="outcome">
                      <dt className="outcome-v">{x.value}</dt>
                      <dd className="outcome-l" style={{ margin: 0 }}>
                        {x.label}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="source-note">Source: {s.source}</p>
                <h3 className="t-h3" style={{ marginTop: 48 }}>
                  What it holds to
                </h3>
                <ul className="limits t-body" style={{ marginTop: 16 }}>
                  {f.claims.map((c) => (
                    <li key={c}>{plain(c)}</li>
                  ))}
                </ul>
              </section>

              <section id="limits" className="chapter" aria-labelledby="limits-h">
                <h2 id="limits-h" className="t-h2">
                  Limits and open questions
                </h2>
                <ul className="limits t-body">
                  {s.limits.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
                <p className="t-body" style={{ marginTop: 32 }}>
                  Questions about this one?{" "}
                  <a href={`${MAILTO}&subject=${encodeURIComponent(f.title)}`} className="link">
                    Write to me
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ next */}
        <nav className="wrap case-next" aria-label="Next project">
          <Link href={`/work/${next.slug}`} className="feature-link next-link">
            <span className="t-meta">Next project</span>
            {STAGE_CLASS[next.slug] ? (
              <div className={`stage ${STAGE_CLASS[next.slug]}`} aria-hidden>
                <div className="stage-inner">
                  <StageArt slug={next.slug} />
                </div>
              </div>
            ) : null}
            <div className="caption">
              <span className="caption-title">
                {next.title} <span className="ar" aria-hidden>→</span>
              </span>
              <span className="caption-benefit">{ns.headline}.</span>
            </div>
          </Link>
        </nav>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}

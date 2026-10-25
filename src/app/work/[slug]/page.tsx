import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { ViewTransition } from "react";
import { Words } from "@/components/Words";
import { FILINGS, ORDER, PRESSING, getFiling } from "@/lib/work";

/** The filings were written as patent claims; read them as plain sentences here. */
function plain(claim: string) {
  const s = claim.replace(/^The [\w-]+ of claim \d+, (wherein |further comprising )/, (_, how: string) => (how.startsWith("further") ? "It has " : ""));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateStaticParams() {
  return FILINGS.map((f) => ({ slug: f.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const f = getFiling(slug);
  if (!f) return {};
  return {
    title: f.title,
    description: f.short,
    openGraph: { title: `${f.title} · Ved Chauhan`, description: f.short, images: [{ url: `/api/og?slug=${f.slug}`, width: 1200, height: 630 }] },
  };
}

/**
 * A case study: what it is, the proof, the problem, the pictures, the decisions that made it
 * work, and what holds true about it. Then the next project.
 */
export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const f = getFiling(slug);
  if (!f) notFound();

  const p = PRESSING[slug];
  const i = ORDER.indexOf(slug);
  const next = getFiling(ORDER[(i + 1) % ORDER.length]);
  const links = f.links.filter((l) => !l.href.includes("snowbros.me/#"));
  // The plate already opens the page; don't show the same screenshot twice.
  const figures = f.figures.filter((fig) => fig.kind !== "drawing" && !(fig.kind === "image" && fig.img.src === f.plate?.src));

  return (
    <main id="main" className="case">
      <div className="frame">
        <Link href="/#work" className="back">
          <ArrowLeft aria-hidden weight="bold" />
          Back to the records
        </Link>

        <div className="case-top">
        <header className="case-head">
          {p && <p className="cat rv">{p.cat} · Liner notes</p>}
          <h1 className="case-title rv kin">
            <ViewTransition name={`title-${f.slug}`} share="morph">
              <span className="case-title-text">
                <Words text={f.title} />
              </span>
            </ViewTransition>
          </h1>
          <p className="lede rv" style={{ "--i": 1, maxWidth: "46ch" } as React.CSSProperties}>
            {f.short}
          </p>
          {links.length > 0 && (
            <div className="actions rv" style={{ "--i": 2 } as React.CSSProperties}>
              {links.map((l, k) => (
                <a key={l.href} href={l.href} className={k === 0 ? "btn btn-primary" : "btn"} target="_blank" rel="noreferrer">
                  {l.label}
                  <ArrowUpRight aria-hidden weight="bold" />
                </a>
              ))}
            </div>
          )}
        </header>
        {p && (
          <div className="case-cover" aria-hidden>
            <ViewTransition name={`sleeve-${f.slug}`} share="morph">
            <div className="sleeve-flat" style={{ background: p.sleeve, color: p.ink }}>
              {f.plate ? (
                <Image src={f.plate.src} alt="" width={f.plate.w} height={f.plate.h} sizes="(min-width: 860px) 32vw, 80vw" />
              ) : (
                <span className="crate-art-type">{f.title.slice(0, 1)}</span>
              )}
              <span className="sleeve-flat-title">{f.title}</span>
            </div>
            </ViewTransition>
            <div className="vinyl">
              <div className="vinyl-label" style={{ background: p.label, color: p.labelInk }}>
                <b>{f.title}</b>
                <span>{p.cat}</span>
              </div>
            </div>
          </div>
        )}
        </div>

        <dl className="case-meta rv" style={{ "--i": 3 } as React.CSSProperties}>
          {[
            { k: "Role", v: f.role },
            { k: "Field", v: `${f.field}, ${f.year}` },
            { k: "Status", v: f.status },
            { k: "Built with", v: f.stack.join(", ") },
          ].map((x) => (
            <div key={x.k}>
              <dt>{x.k}</dt>
              <dd>{x.v}</dd>
            </div>
          ))}
        </dl>

        {f.plate && (
          <div className="shot case-plate rv">
            <Image src={f.plate.src} alt={f.plate.alt} width={f.plate.w} height={f.plate.h} sizes="(min-width: 1440px) 1360px, 94vw" loading="eager" fetchPriority="high" quality={90} />
          </div>
        )}
      </div>

      {f.facts.length > 0 && (
        <section className="frame section" aria-label="In numbers">
          <div className="case-facts">
            {f.facts.map((x, k) => (
              <div key={x.label} className="rv" style={{ "--i": k } as React.CSSProperties}>
                <p className="proof-value num">{x.value}</p>
                <p className="small">{x.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="frame section case-overview" aria-labelledby="overview-title">
        <div>
          <h2 id="overview-title" className="h2 rv" style={{ marginBottom: 32 }}>
            Overview
          </h2>
          <p className="statement rv" style={{ "--i": 1 } as React.CSSProperties}>
            {f.abstract}
          </p>
        </div>
        <div className="prose rv" style={{ "--i": 2, paddingTop: 8 } as React.CSSProperties}>
          <h3 className="small muted" style={{ fontWeight: 550, marginBottom: 10 }}>
            The problem
          </h3>
          <p>{f.background}</p>
        </div>
      </section>

      {figures.length > 0 && (
        <section className="frame section figures" aria-label="Screens and code">
          {figures.map((fig, k) =>
            fig.kind === "image" ? (
              <figure key={k} className="figure rv">
                <div className="shot">
                  <Image src={fig.img.src} alt={fig.img.alt} width={fig.img.w} height={fig.img.h} sizes="(min-width: 1440px) 1360px, 94vw" quality={90} />
                </div>
                <figcaption className="small muted">{fig.caption}</figcaption>
              </figure>
            ) : fig.kind === "code" ? (
              <figure key={k} className="figure rv">
                <p className="code-title">{fig.title}</p>
                <pre className="code" tabIndex={0}>
                  <code>{fig.code}</code>
                </pre>
                <figcaption className="small muted">{fig.caption}</figcaption>
              </figure>
            ) : null,
          )}
        </section>
      )}

      <section className="frame section" aria-labelledby="decisions-title">
        <div className="section-head">
          <h2 id="decisions-title" className="h2 rv">
            Decisions
          </h2>
          <p className="muted rv" style={{ "--i": 1 } as React.CSSProperties}>
            The engineering choices that made it work, in the order they matter.
          </p>
        </div>
        <div className="decisions">
          {f.decisions.map((d, k) => (
            <article key={d.title} className="decision rv" style={{ "--i": k % 2 } as React.CSSProperties}>
              <h3>{d.title}</h3>
              <p>{d.body}</p>
              {d.code && (
                <pre className="code" tabIndex={0}>
                  <code>{d.code.code}</code>
                </pre>
              )}
            </article>
          ))}
        </div>
      </section>

      {f.claims.length > 0 && (
        <section className="frame section" aria-labelledby="holds-title">
          <div className="holds rv">
            <h2 id="holds-title" className="h3">
              What holds true
            </h2>
            <ul>
              {f.claims.map((c) => (
                <li key={c}>
                  <CheckCircle aria-hidden weight="fill" />
                  <span>{plain(c)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {next && next.slug !== slug && (
        <nav className="frame" aria-label="Next project">
          <Link href={`/work/${next.slug}`} className="next-project">
            <div>
              <p className="small muted">Next project</p>
              <p className="h2" style={{ marginTop: 12 }}>
                {next.title}
              </p>
              <p style={{ marginTop: 16, maxWidth: "40ch" }}>{next.short}</p>
            </div>
            {next.plate ? (
              <div className="shot">
                <Image src={next.plate.src} alt="" width={next.plate.w} height={next.plate.h} sizes="(min-width: 720px) 45vw, 92vw" />
              </div>
            ) : (
              <span />
            )}
          </Link>
        </nav>
      )}
    </main>
  );
}

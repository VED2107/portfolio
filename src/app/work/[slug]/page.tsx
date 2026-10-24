import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { FILINGS, getFiling } from "@/lib/work";
import { FILMS, RELEASES, getRelease } from "@/lib/catalog";
import { Sleeve } from "@/components/shop/Sleeve";
import { Vinyl } from "@/components/shop/Vinyl";
import { FilmCover } from "@/components/shop/FilmCover";

export function generateStaticParams() {
  return FILINGS.map((f) => ({ slug: f.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const f = getFiling(slug);
  if (!f) return {};
  return {
    title: `${f.title}, liner notes`,
    description: f.short,
    openGraph: { title: `${f.title} · VED Records & Film`, description: f.short, images: [{ url: `/api/og?slug=${f.slug}`, width: 1200, height: 630 }] },
  };
}

/**
 * Liner notes. The sleeve you pulled out of the crate arrives here as the same object (a shared
 * view transition), and opens into what a good gatefold has: credits, the notes, the inserts,
 * and the track list, which here is the list of engineering decisions.
 */
export default async function LinerNotes({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const f = getFiling(slug);
  if (!f) notFound();
  const r = getRelease(slug);
  const film = slug === "ved-exe" ? FILMS.find((x) => x.id === "making-of") : undefined;
  const i = RELEASES.findIndex((x) => x.slug === slug);
  const next = RELEASES[(i + 1) % RELEASES.length];
  const live = f.links.find((l) => !l.href.includes("github.com"));
  const source = f.links.find((l) => l.href.includes("github.com"));
  const half = Math.ceil(f.decisions.length / 2);
  const cat = r?.cat ?? film?.cat ?? `VED ${f.no}`;

  return (
    <ViewTransition enter={{ "nav-forward": "page", "nav-back": "page", default: "none" }} exit={{ "nav-forward": "page", "nav-back": "page", default: "none" }} default="none">
      <main id="main" className="notes grain">
        <div className="frame notes-top">
          <Link href={r ? `/#rec-${r.slug}` : "/#film"} className="notes-back pk" transitionTypes={["nav-back"]}>
            ← Back to the {r ? "crate" : "film shelf"}
          </Link>
        </div>

        <header className="frame notes-head">
          <div className="notes-object">
            {r ? (
              <>
                <Vinyl r={r} className="notes-vinyl" />
                <ViewTransition name={`cover-${r.slug}`} share="cover">
                  <Sleeve r={r} sizes="(min-width: 1024px) 40vw, 90vw" priority />
                </ViewTransition>
              </>
            ) : film ? (
              <div className="notes-case">
                <FilmCover f={film} sizes="(min-width: 1024px) 34vw, 80vw" />
                <span className="case-plastic" aria-hidden />
              </div>
            ) : null}
          </div>
          <div className="notes-id">
            <p className="cat ink-3">
              {cat} · {r ? `${r.label} · ${r.format}` : "Featurette"} · {f.year}
            </p>
            <h1 className="notes-title display">{f.title}</h1>
            <p className="lede notes-short">{f.short}</p>
            <dl className="notes-credits">
              {[
                { k: "Produced", v: f.role },
                { k: "Field", v: f.field },
                { k: "Status", v: f.status },
                { k: "Engineered with", v: f.stack.join(" · ") },
              ].map((x) => (
                <div key={x.k}>
                  <dt className="pk ink-3">{x.k}</dt>
                  <dd>{x.v}</dd>
                </div>
              ))}
            </dl>
            <div className="notes-links">
              {live && (
                <a className="press" href={live.href} target="_blank" rel="noreferrer">
                  Play it live ↗
                </a>
              )}
              {source && (
                <a className="ink-link" href={source.href} target="_blank" rel="noreferrer">
                  Source on GitHub ↗
                </a>
              )}
            </div>
          </div>
        </header>

        {f.facts.length > 0 && (
          <section className="frame pressing" aria-label="Pressing data">
            {f.facts.map((x, k) => (
              <div key={x.label} className="pressing-cell">
                <p className="pressing-value" style={{ "--rot": `${[-2, 1.5, -1, 2][k % 4]}deg` } as React.CSSProperties}>
                  {x.value}
                </p>
                <p className="small">{x.label}</p>
              </div>
            ))}
          </section>
        )}

        <section className="frame notes-body" aria-labelledby="notes-title">
          <h2 id="notes-title" className="pk ink-3">
            Liner notes
          </h2>
          <p className="notes-abstract display">{f.abstract}</p>
          <p className="notes-text">{f.background}</p>
        </section>

        {f.figures.length > 0 && (
          <section className="frame inserts" aria-label="Inserts">
            {f.figures.map((fig, k) =>
              fig.kind === "image" ? (
                <figure key={k} className="insert" style={{ "--rot": `${k % 2 ? 0.6 : -0.8}deg` } as React.CSSProperties}>
                  <Image src={fig.img.src} alt={fig.img.alt} width={fig.img.w} height={fig.img.h} sizes="(min-width: 1024px) 60vw, 94vw" quality={80} />
                  <figcaption className="small">
                    <span className="cat ink-3">Insert {k + 1}</span> {fig.caption}
                  </figcaption>
                </figure>
              ) : fig.kind === "code" ? (
                <figure key={k} className="insert insert-print">
                  <p className="pk ink-3">{fig.title}</p>
                  <pre>
                    <code>{fig.code}</code>
                  </pre>
                  <figcaption className="small">{fig.caption}</figcaption>
                </figure>
              ) : null,
            )}
          </section>
        )}

        <section className="frame tracklist" aria-labelledby="tracks-title">
          <h2 id="tracks-title" className="h2">
            Track list
          </h2>
          <p className="small tracklist-note">The decisions that made it work, in the order they matter.</p>
          <div className="tracklist-sides">
            {(["A", "B"] as const).map((side) => {
              const list = side === "A" ? f.decisions.slice(0, half) : f.decisions.slice(half);
              if (!list.length) return null;
              return (
                <ol key={side} className="tracklist-side">
                  <li className="pk tracklist-side-label" aria-hidden>
                    Side {side}
                  </li>
                  {list.map((d, k) => (
                    <li key={d.title} className="track">
                      <h3 className="track-title">
                        <span className="cat ink-3">
                          {side}
                          {k + 1}
                        </span>{" "}
                        {d.title}
                      </h3>
                      <p className="track-body">{d.body}</p>
                      {d.code && (
                        <pre className="track-code">
                          <code>{d.code.code}</code>
                        </pre>
                      )}
                    </li>
                  ))}
                </ol>
              );
            })}
          </div>
        </section>

        {f.claims.length > 0 && (
          <section className="frame pressing-notes" aria-labelledby="pn-title">
            <h2 id="pn-title" className="pk ink-3">
              Pressing notes
            </h2>
            <ul>
              {f.claims.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {next && next.slug !== slug && (
          <nav className="frame next-in-crate" aria-label="Next release">
            <Link href={`/work/${next.slug}`} className="next-link" transitionTypes={["nav-forward"]}>
              <span className="next-cover">
                <Sleeve r={next} sticker={false} sizes="160px" />
              </span>
              <span>
                <span className="pk ink-3">Next in the crate · {next.cat}</span>
                <span className="next-title display">{next.title}</span>
              </span>
            </Link>
          </nav>
        )}
      </main>
    </ViewTransition>
  );
}

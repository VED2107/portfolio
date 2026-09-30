import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { FILINGS, getFiling } from "@/lib/work";
import { FigureView, CodeBlock } from "@/components/FigureView";
import { Drawing } from "@/components/Drawings";

export function generateStaticParams() {
  return FILINGS.map((f) => ({ slug: f.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const f = getFiling(slug);
  if (!f) return {};
  return {
    title: `${f.title}, filing ${f.no}`,
    description: f.short,
    openGraph: { title: `${f.title} · VED.EXE`, description: f.short, images: [{ url: `/api/og?slug=${f.slug}`, width: 1200, height: 630 }] },
  };
}

const para = (n: number) => `[${String(n).padStart(4, "0")}]`;

export default async function FilingPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const f = getFiling(slug);
  if (!f) notFound();

  const i = FILINGS.indexOf(f);
  const next = FILINGS[(i + 1) % FILINGS.length];
  let p = 0;

  return (
    <ViewTransition
      enter={{ "nav-forward": "page-swap", "nav-back": "page-swap", default: "none" }}
      exit={{ "nav-forward": "page-swap", "nav-back": "page-swap", default: "none" }}
      default="none"
    >
      <main id="main">
        {/* Cover sheet of the filing */}
        <section aria-labelledby="filing-title" className="pt-10 lg:pt-16">
          <div className="sheet-inner gap-y-8">
            <div className="col-span-12">
              <Link href="/#filings" transitionTypes={["nav-back"]} className="t-small inline-flex items-center gap-2 no-underline hover:text-[var(--ink)]">
                <ArrowLeft size={14} aria-hidden /> All filings
              </Link>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <p className="flex items-baseline gap-3">
                <span className="ref text-[0.9rem]">{f.no}</span>
                <span className="t-small">{f.field}</span>
              </p>
              <h1 id="filing-title" className="t-display mt-3 text-[clamp(2.6rem,1rem+6vw,6rem)]">
                {f.title}
              </h1>
              <p className="t-lede mt-6 max-w-[40ch]">{f.short}</p>
            </div>
            <dl className="col-span-12 grid content-end gap-0 self-end border-t border-[var(--ink)] text-[0.95rem] lg:col-span-4">
              {[
                { k: "Role", v: f.role },
                { k: "Year", v: f.year },
                { k: "Status", v: f.status },
                { k: "Stack", v: f.stack.join(", ") },
              ].map((r) => (
                <div key={r.k} className="grid grid-cols-[5rem_1fr] gap-3 border-b border-[var(--rule-soft)] py-2.5">
                  <dt className="ink-3">{r.k}</dt>
                  <dd>{r.v}</dd>
                </div>
              ))}
              {f.links.length > 0 && (
                <div className="flex flex-wrap gap-x-5 gap-y-2 pt-4">
                  {f.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="link inline-flex items-center gap-1 font-semibold">
                      {l.label} <ArrowUpRight size={14} aria-hidden />
                    </a>
                  ))}
                </div>
              )}
            </dl>
          </div>

          <div className="sheet-inner mt-12">
            <div className="col-span-12">
              {f.plate ? (
                <div className="fig">
                  <ViewTransition name={`plate-${f.slug}`} share="plate">
                    <Image src={f.plate.src} alt={f.plate.alt} width={f.plate.w} height={f.plate.h} sizes="(min-width: 1440px) 1340px, 100vw" priority quality={90} className="max-h-[78vh] w-full object-cover object-top" />
                  </ViewTransition>
                </div>
              ) : (
                <div className="fig bg-[var(--paper-3)] p-6 sm:p-12">
                  <div className="mx-auto max-w-3xl">
                    <Drawing drawing="ved-sheet" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {f.facts.length > 0 && (
            <div className="sheet-inner mt-10">
              <dl className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-[var(--rule)] pt-6 lg:grid-cols-4">
                {f.facts.map((x) => (
                  <div key={x.label} className="flex flex-col-reverse justify-end gap-1.5">
                    <dt className="t-small max-w-[24ch]">{x.label}</dt>
                    <dd className="text-[clamp(2rem,1.4rem+2vw,3.25rem)] font-extrabold leading-none tracking-[-0.03em] [font-stretch:118%]">{x.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        {/* Specification */}
        <section className="sheet mt-16" aria-label="Specification">
          <div className="sheet-inner gap-y-14">
            <div className="col-span-12 lg:col-span-8 lg:col-start-3">
              <p className="t-num ink-3">(57) Abstract</p>
              <p className="mt-4 text-[clamp(1.3rem,1.05rem+1vw,1.85rem)] leading-[1.35] tracking-[-0.012em] text-pretty">{f.abstract}</p>
            </div>

            <div className="col-span-12 grid grid-cols-subgrid gap-y-4">
              <h2 className="t-h2 col-span-12 lg:col-span-2">Background</h2>
              <div className="col-span-12 lg:col-span-7 lg:col-start-3">
                <Para n={++p}>{f.background}</Para>
              </div>
            </div>

            <div className="col-span-12 grid grid-cols-subgrid gap-y-4">
              <h2 className="t-h2 col-span-12 lg:col-span-2">Drawings</h2>
              <ol className="col-span-12 grid gap-2 lg:col-span-7 lg:col-start-3">
                {f.figures.map((fig, k) => (
                  <li key={k} className="grid grid-cols-[4.5rem_1fr] gap-2">
                    <a href={`#fig-${k + 1}`} className="link font-semibold [font-stretch:110%]">
                      FIG. {k + 1}
                    </a>
                    <span className="ink-2">{fig.caption}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Figures */}
        <section aria-label="Figures" className="grid gap-16 pb-8 lg:gap-24">
          {f.figures.map((fig, k) => {
            const narrow = fig.kind === "image" && fig.img.h > fig.img.w; // tall report stays readable
            return (
              <div key={k} id={`fig-${k + 1}`} className="sheet-inner scroll-mt-24">
                <div className={narrow ? "col-span-12 lg:col-span-8 lg:col-start-3" : "col-span-12 lg:col-span-10 lg:col-start-2"}>
                  <FigureView figure={fig} n={k + 1} />
                </div>
              </div>
            );
          })}
        </section>

        {/* Detailed description */}
        <section className="sheet" aria-labelledby="dd-title">
          <div className="sheet-inner gap-y-4">
            <h2 id="dd-title" className="t-h2 col-span-12 lg:col-span-8 lg:col-start-3">
              Detailed description
            </h2>
            <div className="col-span-12 mt-8 grid min-w-0 gap-14 lg:col-span-8 lg:col-start-3">
              {f.decisions.map((d) => (
                <article key={d.title} className="min-w-0">
                  <h3 className="t-h3">{d.title}</h3>
                  <div className="mt-3">
                    <Para n={++p}>{d.body}</Para>
                  </div>
                  {d.code && (
                    <div className="mt-5">
                      <CodeBlock code={d.code.code} />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Claims */}
        <section className="sheet" aria-labelledby="claims-title">
          <div className="sheet-inner">
            <div className="col-span-12 lg:col-span-8 lg:col-start-3">
              <h2 id="claims-title" className="t-h2">
                What is claimed is:
              </h2>
              <ol className="mt-8 grid gap-6">
                {f.claims.map((c, k) => (
                  <li key={k} className="grid grid-cols-[2.25rem_1fr] gap-3">
                    <span className="t-h3 ink-3 text-right">{k + 1}.</span>
                    <p className="t-h3 font-medium [font-stretch:100%]">{c}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Next filing */}
        <nav aria-label="Next filing" className="border-t border-[var(--ink)]">
          <Link href={`/work/${next.slug}`} transitionTypes={["nav-forward"]} className="next-filing group block no-underline">
            <div className="sheet-inner items-end gap-y-3 py-14 lg:py-20">
              <p className="col-span-12 t-small lg:col-span-2">Next filing</p>
              <p className="col-span-12 lg:col-span-9">
                <span className="ref mr-4 text-[0.9rem]">{next.no}</span>
                <span className="t-display text-[clamp(2.4rem,1rem+5vw,5rem)] transition-colors duration-200 group-hover:text-[var(--accent)]">{next.title}</span>
              </p>
              <ArrowRight size={36} className="col-span-12 transition-transform duration-200 group-hover:translate-x-1.5 lg:col-span-1 lg:justify-self-end" aria-hidden />
            </div>
          </Link>
        </nav>
      </main>
    </ViewTransition>
  );
}

function Para({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="t-body relative text-[1.08rem] leading-[1.7]">
      <span className="t-num ink-3 absolute -left-[4.5rem] top-[0.3rem] hidden lg:inline" aria-hidden>
        {para(n)}
      </span>
      {children}
    </p>
  );
}

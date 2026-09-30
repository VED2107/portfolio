import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Action } from "@/components/Action";
import { fetchActivity } from "@/lib/github";
import { CAPABILITIES, CLAIMS, NOW, SITE } from "@/lib/site";
import { ARCHIVE, FILINGS, filingNo, type Filing } from "@/lib/work";
import { FigureOne } from "@/components/FigureOne";
import { FigureView } from "@/components/FigureView";
import { ArchiveIndex } from "@/components/ArchiveIndex";
import { CopyEmail } from "@/components/CopyEmail";
import { Activity } from "@/components/Activity";

export const revalidate = 3600;

const FLAGSHIPS = FILINGS.filter((f) => f.plate && f.slug !== "ved-exe");

export default async function Home() {
  const activity = await fetchActivity();

  return (
    <main id="main">
      <Cover />
      <Filings />
      <Archive />
      <Claims />
      <Field />
      <Status activity={activity} />
      <Correspondence />
      <Footer />
    </main>
  );
}

/* ---------------- Sheet 1: cover ---------------- */

function Cover() {
  const plates = FLAGSHIPS.map((f) => ({ slug: f.slug, no: f.no, title: f.title, field: f.field, plate: f.plate! }));
  return (
    <section id="cover" aria-labelledby="cover-title" className="relative">
      <div className="sheet-inner min-h-[calc(100dvh-var(--header-h))] content-center gap-y-10 py-10 lg:py-6">
        <div className="col-span-12 flex flex-col justify-center lg:col-span-5">
          <p className="t-num ink-3 enter" style={{ "--i": 0 } as React.CSSProperties}>
            (54)
          </p>
          <h1 id="cover-title" className="t-display enter mt-3 lg:text-[clamp(3.5rem,calc(6vw+0.25rem),6rem)]" style={{ "--i": 1 } as React.CSSProperties}>
            VED<span className="accent">.</span>EXE
          </h1>
          <p className="t-lede enter mt-6 max-w-[30ch]" style={{ "--i": 2 } as React.CSSProperties}>
            Software engineer building developer tools and full-stack products. Everything on this sheet is shipped and running.
          </p>

          <dl className="enter mt-8 grid max-w-md border-t border-[var(--ink)] text-[0.95rem]" style={{ "--i": 3 } as React.CSSProperties}>
            {[
              { code: "(72)", k: "Inventor", v: <>Ved S. Chauhan</> },
              {
                code: "(73)",
                k: "Assignee",
                v: (
                  <a className="link" href={SITE.studioUrl} target="_blank" rel="noreferrer">
                    SNOWBROS
                  </a>
                ),
              },
              { code: "(51)", k: "Field", v: <>Full-stack, backend and developer tools. TypeScript and Rust.</> },
            ].map((r) => (
              <div key={r.code} className="grid grid-cols-[2.75rem_5.5rem_1fr] items-baseline gap-2 border-b border-[var(--rule-soft)] py-2.5">
                <dt className="contents">
                  <span className="t-num ink-3">{r.code}</span>
                  <span className="ink-3">{r.k}</span>
                </dt>
                <dd>{r.v}</dd>
              </div>
            ))}
          </dl>

          <div className="enter mt-8 flex flex-wrap items-center gap-x-5 gap-y-3" style={{ "--i": 4 } as React.CSSProperties}>
            <Action href="#filings" dir="down">
              Read the filings
            </Action>
            <p className="t-small flex items-center gap-1.5">
              or press <span className="kbd">/</span> to go anywhere
            </p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <FigureOne plates={plates} />
          <p className="fig-caption lg:-mt-2">
            <b>FIG. 1</b>
            <span>Exploded view of shipped work. Hover a numeral to lift its plate; open it to read the filing.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Sheet 2: filings ---------------- */

function Filings() {
  return (
    <section id="filings" aria-labelledby="filings-title" className="sheet pb-0">
      <div className="sheet-inner">
        <h2 id="filings-title" className="t-h2 col-span-12 max-w-[22ch] lg:col-span-8">
          Five filings. All of them running somewhere right now.
        </h2>
      </div>
      <div className="mt-12 lg:mt-16">
        {FLAGSHIPS.map((f, i) => (
          <FilingSheet key={f.slug} f={f} index={i} />
        ))}
      </div>
    </section>
  );
}

function FilingSheet({ f, index }: { f: Filing; index: number }) {
  const lead = f.figures[0];
  return (
    <article className="stack-sheet" aria-labelledby={`f-${f.slug}`} style={{ zIndex: index + 1 }}>
      <div className="stack-body flex min-h-[inherit] flex-col justify-center border-t border-[var(--ink)] bg-[var(--paper)] py-10 lg:py-12">
        <div className="sheet-inner items-center gap-y-8">
          <div className="col-span-12 lg:col-span-5">
            <p className="flex items-baseline gap-3">
              <span className="ref text-[0.85rem]">{f.no}</span>
              <span className="t-small">{f.field}</span>
            </p>
            <h3 id={`f-${f.slug}`} className="t-h1 mt-3">
              <Link href={`/work/${f.slug}`} transitionTypes={["nav-forward"]} className="no-underline transition-colors duration-200 hover:text-[var(--accent)]">
                {f.title}
              </Link>
            </h3>
            <p className="t-lede mt-4 max-w-[34ch]">{f.short}</p>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[var(--rule)] pt-5">
              {f.facts.slice(0, 2).map((x) => (
                <div key={x.label} className="flex flex-col-reverse justify-end gap-1">
                  <dt className="t-small max-w-[22ch]">{x.label}</dt>
                  <dd className="text-[clamp(1.9rem,1.3rem+1.6vw,2.6rem)] font-extrabold leading-none tracking-[-0.03em] [font-stretch:118%]">{x.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Action href={`/work/${f.slug}`} transitionTypes={["nav-forward"]}>
                Open filing {f.no}
              </Action>
              <span className="t-small max-w-[28ch]">{f.status}</span>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <FigureView figure={lead} n={index + 2} />
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Sheet 3: other filings ---------------- */

function Archive() {
  const rows = [
    {
      title: "VED.EXE",
      field: "Interface",
      note: "This site. You are here.",
      stack: "Next.js 16, React 19, View Transitions",
      year: "2026",
      href: "/work/ved-exe",
      internal: true,
    },
    ...ARCHIVE,
  ];
  return (
    <section id="archive" aria-labelledby="archive-title" className="sheet">
      <div className="sheet-inner gap-y-10">
        <div className="col-span-12 lg:col-span-4">
          <h2 id="archive-title" className="t-h2">
            Other filings
          </h2>
          <p className="t-body mt-4 max-w-[34ch]">Studio work, experiments and the things that taught me the things above.</p>
        </div>
        <div className="col-span-12 lg:col-span-8">
          <ArchiveIndex rows={rows} />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Sheet 4: claims ---------------- */

function Claims() {
  return (
    <section id="claims" aria-labelledby="claims-title" className="sheet">
      <div className="sheet-inner gap-y-12">
        <div className="col-span-12 lg:col-span-7 lg:col-start-3">
          <p className="t-num ink-3">(57) Abstract</p>
          <p className="mt-4 text-[clamp(1.35rem,1.1rem+1vw,1.9rem)] leading-[1.35] tracking-[-0.012em] text-pretty">
            I&rsquo;m Ved, a software engineer in Ahmedabad. I study computer engineering at U.V. Patel College of Engineering and run SNOWBROS, a small software
            studio. I ship systems end to end, from the schema and its access rules to the native binary and the pipeline that releases it. I like software that can
            explain itself: a balance you can trace, a finding that shows its evidence, a till that never loses a paisa.
          </p>
        </div>

        <div className="col-span-12 lg:col-span-10 lg:col-start-3">
          <h2 id="claims-title" className="t-h2">
            What is claimed is:
          </h2>
          <ol className="mt-8 grid gap-7">
            {CLAIMS.map((c, i) => (
              <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-x-3 lg:-ml-[3.25rem] lg:grid-cols-[2.5rem_minmax(0,46rem)_1fr] lg:gap-x-5">
                <span className="t-h3 ink-3 text-right tabular-nums">{i + 1}.</span>
                <p className="t-h3 font-medium [font-stretch:100%]">
                  {c.dependsOn ? (
                    <>
                      <span className="ink-3">The practice of claim {c.dependsOn}, </span>
                      {c.text}
                    </>
                  ) : (
                    c.text
                  )}
                </p>
                <p className="col-start-2 mt-1 flex flex-wrap items-baseline gap-x-3 lg:col-start-3 lg:mt-0">
                  <span className="t-small">See</span>
                  {c.evidence.map((slug) => (
                    <Link key={slug} href={`/work/${slug}`} transitionTypes={["nav-forward"]} className="ref underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]">
                      {filingNo(slug)}
                    </Link>
                  ))}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Sheet 5: field ---------------- */

function Field() {
  const cols = FILINGS;
  return (
    <section id="field" aria-labelledby="field-title" className="sheet bg-[var(--paper-2)]">
      <div className="sheet-inner gap-y-10">
        <div className="col-span-12 lg:col-span-7">
          <h2 id="field-title" className="t-h2">
            Field of the invention
          </h2>
          <p className="t-body mt-4">What I can build, and the filing that proves each one. A mark means that project ships that capability in production.</p>
        </div>

        <div className="col-span-12 overflow-x-auto">
          <table className="field-chart w-full min-w-0 border-collapse text-left">
            <caption className="sr-only">Capabilities by filing</caption>
            <thead>
              <tr>
                <th scope="col" className="pb-3 font-normal">
                  <span className="sr-only">Capability</span>
                </th>
                {cols.map((f) => (
                  <th key={f.slug} scope="col" className="field-col hidden pb-3 text-center font-normal md:table-cell">
                    <Link href={`/work/${f.slug}`} transitionTypes={["nav-forward"]} className="group inline-flex flex-col items-center gap-1 no-underline">
                      <span className="ref group-hover:text-[var(--accent)]">{f.no}</span>
                      <span className="t-small max-w-[9ch] leading-tight group-hover:text-[var(--ink)]">{f.title}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAPABILITIES.map((c) => (
                <tr key={c.name} className="field-row border-t border-[var(--rule)]">
                  <th scope="row" className="py-4 pr-6 align-top font-normal">
                    <span className="t-h3 block">{c.name}</span>
                    <span className="t-small block">{c.tools}</span>
                    <span className="mt-2 flex flex-wrap gap-x-3 md:hidden">
                      {c.filings.map((s) => (
                        <Link key={s} href={`/work/${s}`} className="ref underline decoration-[var(--rule)] underline-offset-4">
                          {filingNo(s)}
                        </Link>
                      ))}
                    </span>
                  </th>
                  {cols.map((f) => (
                    <td key={f.slug} className="hidden text-center align-middle md:table-cell">
                      {c.filings.includes(f.slug) ? (
                        <span className="field-mark" role="img" aria-label={`${f.title} ships ${c.name.toLowerCase()}`} />
                      ) : (
                        <span className="sr-only">not in {f.title}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Sheet 6: status ---------------- */

function Status({ activity }: { activity: Awaited<ReturnType<typeof fetchActivity>> }) {
  const updated = new Date(NOW.updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <section id="status" aria-labelledby="status-title" className="sheet">
      <div className="sheet-inner gap-y-14">
        <div className="col-span-12 lg:col-span-5">
          <h2 id="status-title" className="t-h2">
            Status: in progress
          </h2>
          <p className="t-small mt-3">Updated {updated}</p>
          <ul className="mt-8 border-t border-[var(--ink)]">
            {NOW.rows.map((r) => {
              const body = (
                <>
                  <span className="t-small pt-1">{r.verb}</span>
                  <span>
                    <span className="t-h3 block">{r.what}</span>
                    <span className="t-small mt-1 block">{r.detail}</span>
                  </span>
                </>
              );
              return (
                <li key={r.verb} className="border-b border-[var(--rule-soft)]">
                  {"href" in r && r.href ? (
                    r.href.startsWith("/") ? (
                      <Link href={r.href} transitionTypes={["nav-forward"]} className="now-row">
                        {body}
                        <ArrowRight size={16} className="now-go" aria-hidden />
                      </Link>
                    ) : (
                      <a href={r.href} target="_blank" rel="noreferrer" className="now-row">
                        {body}
                        <ArrowUpRight size={16} className="now-go" aria-hidden />
                      </a>
                    )
                  ) : (
                    <div className="now-row">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <h3 className="t-h2">Build activity</h3>
          <p className="t-small mt-3">
            From GitHub, refreshed hourly.{" "}
            <a className="link" href={SITE.github} target="_blank" rel="noreferrer">
              github.com/{SITE.githubHandle}
            </a>
          </p>
          <div className="mt-8">
            <Activity data={activity} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Sheet 7: correspondence ---------------- */

function Correspondence() {
  return (
    <section id="correspondence" aria-labelledby="corr-title" className="sheet border-t-[var(--ink)]">
      <div className="sheet-inner gap-y-12">
        <div className="col-span-12 lg:col-span-10">
          <h2 id="corr-title" className="t-display max-w-[12ch] text-[clamp(2.8rem,1rem+6.2vw,6rem)]">
            Have something to build?
          </h2>
          <p className="t-lede mt-6 max-w-[44ch]">A product, a tool, a role, or an idea that shouldn&rsquo;t work yet. Tell me what it should do and who it is for.</p>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <CopyEmail email={SITE.email} />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Action href={`mailto:${SITE.email}?subject=Something%20to%20build`}>Start a conversation</Action>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <p className="t-num ink-3">Correspondence</p>
          <ul className="mt-3 grid border-t border-[var(--rule)]">
            {[
              { l: "GitHub", h: SITE.github, d: "github.com/VED2107" },
              { l: "LinkedIn", h: SITE.linkedin, d: "in/ved-chauhan2107" },
              { l: "SNOWBROS", h: SITE.studioUrl, d: "snowbros.me" },
              { l: "Résumé", h: SITE.resume, d: "PDF" },
            ].map((x) => (
              <li key={x.l}>
                <a href={x.h} target="_blank" rel="noreferrer" className="group flex items-baseline justify-between gap-4 border-b border-[var(--rule-soft)] py-3 no-underline">
                  <span className="font-semibold transition-colors duration-200 group-hover:text-[var(--accent)]">{x.l}</span>
                  <span className="t-small flex items-center gap-1.5">
                    {x.d} <ArrowUpRight size={13} aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--ink)]">
      <div className="frame flex flex-wrap items-center justify-between gap-4 py-6 t-small">
        <p>© 2026 Ved S. Chauhan. Filed under SNOWBROS.</p>
        <p className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 sm:flex">
            <span className="kbd">/</span> commands
          </span>
          <a href="#cover" className="link">
            Back to the cover
          </a>
        </p>
      </div>
    </footer>
  );
}

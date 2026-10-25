import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { DISCOGRAPHY, EDUCATION, HONORS, NOW, ROLES, SITE, SKILLS } from "@/lib/site";
import { ALSO, ARCHIVE, FEATURED, PRESSING, credits, getFiling, trackNo, type Filing } from "@/lib/work";
import { fetchActivity, type Activity } from "@/lib/github";
import SNAPSHOT from "@/lib/github-snapshot.json";
import { Explorer, type ExplorerRecord } from "@/components/shop/Explorer";
import { MixingDesk, ScratchDeck, Spectrum, Tilt } from "@/components/Interactive";

// The GitHub data is live; revalidate hourly, like the fetch inside fetchActivity.
export const revalidate = 3600;

const fmtDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const fmtWeek = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

function external(f: Filing) {
  return {
    live: f.links.find((l) => !l.href.includes("github.com") && !l.href.includes("snowbros.me/#")),
    source: f.links.find((l) => l.href.includes("github.com")),
  };
}

/** Live data when GitHub answers, the committed snapshot when it doesn't. */
function recentRepos(activity: Activity | null) {
  if (activity?.recent.length) {
    return { from: "live" as const, repos: activity.recent.map((r) => ({ name: r.name, url: r.url, language: r.language, pushed: r.pushedAt })) };
  }
  return {
    from: "snapshot" as const,
    repos: SNAPSHOT.repos.slice(0, 5).map((r) => ({ name: r.name, url: `https://github.com/${r.repo}`, language: r.language, pushed: r.pushed })),
  };
}

const STATUS = "Open to software engineering internships and entry-level full-stack roles. Taking select freelance work through SNOWBROS.";

export default async function Home() {
  const activity = await fetchActivity();
  const gh = recentRepos(activity);
  const featured = FEATURED.map(({ slug, proof }) => ({ f: getFiling(slug)!, proof, p: PRESSING[slug] }));
  const also = ALSO.map((x) => getFiling(x)!);
  const channels = credits(14);
  const weeks = activity?.year?.weeks ?? [];
  const peak = Math.max(1, ...weeks.map((w) => w.count));
  const total = activity?.year?.total;

  // The house record: a year of commits pressed into one groove per week, when GitHub answers.
  const house: ExplorerRecord = {
    id: "house",
    title: "VED",
    cat: "VED 000",
    sleeve: "#1d1712",
    ink: "#f3ead8",
    label: "#e3a72f",
    labelInk: "#1d1712",
    runout: total ? `${total} contributions in one year` : "selected works",
    bars: weeks.length ? weeks.map((w) => w.count) : undefined,
    line: weeks.length ? "Selected works, pressed from a year of commits" : "Selected works",
    weights: weeks.length ? weeks.map(() => 1) : featured.map(() => 1),
    intensity: weeks.length ? weeks.map((w) => Math.sqrt(w.count / peak)) : featured.map(() => 0.6),
    tracks: weeks.length
      ? weeks.map((w) => ({ no: "", title: `Week of ${fmtWeek.format(new Date(w.start))}: ${w.count} contribution${w.count === 1 ? "" : "s"}` }))
      : featured.map(({ f }, k) => ({ no: trackNo(k, featured.length), title: f.title })),
  };

  const records: ExplorerRecord[] = [
    house,
    ...featured.map(({ f, p, proof }) => ({
      id: f.slug,
      slug: f.slug,
      title: f.title,
      cat: p.cat,
      sleeve: p.sleeve,
      ink: p.ink,
      label: p.label,
      labelInk: p.labelInk,
      runout: p.runout,
      img: f.plate?.src,
      line: f.field,
      field: f.field,
      short: f.short,
      proof: f.facts[proof],
      live: external(f).live ?? external(f).source,
      weights: f.decisions.map((d) => Math.max(0.6, d.body.length / 300)),
      intensity: f.decisions.map((_, k) => 0.45 + 0.4 * ((k % 3) / 2)),
      tracks: f.decisions.map((d, k) => ({ no: trackNo(k, f.decisions.length), title: d.title, body: d.body })),
    })),
  ];

  const paint = ["#9b2316", "#e3a72f", "#1f6f6a", "#d0661f", "#1d1712", "#5b1328", "#c9a46a"];
  const bin = [
    ...also.map((f) => ({
      title: f.title,
      cat: PRESSING[f.slug]?.cat ?? "",
      what: f.field,
      stack: f.stack.slice(0, 4).join(", "),
      href: `/work/${f.slug}`,
      img: f.plate?.src,
      bg: PRESSING[f.slug]?.sleeve ?? "#1d1712",
      ink: PRESSING[f.slug]?.ink ?? "#f3ead8",
    })),
    ...ARCHIVE.map((a, k) => ({
      title: a.title,
      cat: `VED ${(k + 1) * 10 + 900}`,
      what: a.field,
      stack: a.stack,
      href: a.href,
      img: a.preview?.src,
      bg: paint[k % paint.length],
      ink: ["#e3a72f", "#c9a46a"].includes(paint[k % paint.length]) ? "#1d1712" : "#f3ead8",
    })),
  ];

  return (
    <main id="main">
      {/* ------------------------------------------------------------ the shop floor */}
      <Explorer
        records={records}
        honors={HONORS}
        now={NOW.rows}
        email={SITE.email}
        resume={SITE.resume}
        links={[
          { label: "GitHub", href: SITE.github },
          { label: "LinkedIn", href: SITE.linkedin },
          { label: "SNOWBROS studio", href: SITE.studioUrl },
        ]}
        status={STATUS}
        houseNote={
          total
            ? `My last year on GitHub, ${total.toLocaleString("en-IN")} contributions pressed into ${weeks.length} grooves, one per week. The shinier the groove, the busier the week. Hover one to read it.`
            : "The house compilation: one track per record in the crates."
        }
      />

      {/* ------------------------------------------------------------ the records */}
      <section id="work" className="records" aria-labelledby="records-title">
        <div className="frame section-head records-head">
          <h2 id="records-title" className="h2 rv">
            The records
          </h2>
          <p className="muted rv" style={s(1)}>
            Six products, shipped and in use. Each one is pressed with its engineering decisions as the tracks. Open a track to read it.
          </p>
        </div>
        {featured.map(({ f, proof, p }, k) => {
          const { live, source } = external(f);
          const fact = f.facts[proof];
          const out = live ?? source;
          return (
            <article
              key={f.slug}
              className="record"
              data-side={k % 2 ? "right" : "left"}
              style={{ "--sleeve": p.sleeve, "--sleeve-ink": p.ink, "--label": p.label, "--label-ink": p.labelInk } as React.CSSProperties}
              aria-labelledby={`r-${f.slug}`}
            >
              <div className="frame record-inner">
                <div className="record-art rv">
                  <Tilt className="record-stage">
                    <Link href={`/work/${f.slug}`} className="record-sleeve" tabIndex={-1} aria-hidden>
                      {f.plate && <Image src={f.plate.src} alt="" width={f.plate.w} height={f.plate.h} sizes="(min-width: 960px) 34vw, 80vw" quality={75} />}
                      <span className="record-sleeve-title">{f.title}</span>
                      <span className="cat">{p.cat}</span>
                    </Link>
                    <div className="vinyl record-vinyl" aria-hidden>
                      <div className="vinyl-label">
                        <b>{f.title}</b>
                        <span>{p.cat}</span>
                      </div>
                    </div>
                  </Tilt>
                </div>
                <div className="record-copy">
                  <p className="cat rv">
                    {p.cat} · {f.field} · {f.year}
                  </p>
                  <h3 id={`r-${f.slug}`} className="record-title rv" style={s(1)}>
                    <Link href={`/work/${f.slug}`}>{f.title}</Link>
                  </h3>
                  <p className="rv" style={s(2)}>
                    {f.short}
                  </p>
                  {fact && (
                    <p className="work-proof rv" style={s(3)}>
                      <span className="proof-value">{fact.value}</span>
                      <span className="small">{fact.label}</span>
                    </p>
                  )}
                  <div className="tracks rv" style={s(4)}>
                    {f.decisions.map((d, t) => (
                      <details key={d.title} name={`tracks-${f.slug}`} open={t === 0}>
                        <summary>
                          <span className="track-no">{trackNo(t, f.decisions.length)}</span>
                          <span>{d.title}</span>
                        </summary>
                        <p className="small">{d.body}</p>
                      </details>
                    ))}
                  </div>
                  <div className="actions rv" style={s(5)}>
                    <Link href={`/work/${f.slug}`} className="btn btn-primary">
                      Read the liner notes
                    </Link>
                    {out && (
                      <a href={out.href} className="btn" target="_blank" rel="noreferrer">
                        {live ? live.label : "Source"}
                        <ArrowUpRight aria-hidden weight="bold" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* ------------------------------------------------------------ discography */}
      <section id="discography" className="disco" aria-labelledby="disco-title">
        <div className="frame">
          <div className="section-head">
            <h2 id="disco-title" className="h2 rv">
              Discography
            </h2>
            <p className="rv" style={s(1)}>
              Every release since the studio opened, in the order it came out. Scroll along the groove.
            </p>
          </div>
        </div>
        <ol className="disco-track rv" style={s(2)}>
          {DISCOGRAPHY.map((d, k) => {
            const p = d.slug ? PRESSING[d.slug] : undefined;
            const inner = (
              <>
                <span className="disco-disc" aria-hidden>
                  <span style={{ background: p?.label ?? ["#e3a72f", "#d0661f", "#c9a46a", "#f3ead8"][k % 4], color: p?.labelInk ?? "#1d1712" }}>{d.title.slice(0, 1)}</span>
                </span>
                <span className="disco-when">{d.when}</span>
                <b>{d.title}</b>
                <span className="small">{d.what}</span>
              </>
            );
            return (
              <li key={d.title + d.when}>
                {d.slug ? (
                  <Link href={`/work/${d.slug}`} className="disco-item">
                    {inner}
                  </Link>
                ) : (
                  <a href={d.href} className="disco-item" target="_blank" rel="noreferrer">
                    {inner}
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* ------------------------------------------------------------ the crate */}
      <section id="catalogue" className="frame section" aria-labelledby="more-title">
        <div className="section-head">
          <h2 id="more-title" className="h2 rv">
            The back catalogue
          </h2>
          <p className="muted rv" style={s(1)}>
            Two storefronts built for clients, then the singles: the studio site, a florist, an AI skill, a motion toolkit, a game, a camera app.
          </p>
        </div>
        <div className="crate rv" style={s(2)}>
          <ul className="crate-row" aria-label="Records in the crate">
            {bin.map((r, k) => (
              <li key={r.title} className="crate-slot" style={{ zIndex: bin.length - k }}>
                <a href={r.href} className="crate-sleeve" style={{ background: r.bg, color: r.ink }} {...(r.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                  {r.img ? (
                    <Image src={r.img} alt="" width={720} height={450} sizes="280px" className="crate-art" />
                  ) : (
                    <span className="crate-art crate-art-type" aria-hidden>
                      {r.title.slice(0, 1)}
                    </span>
                  )}
                  <span className="cat">{r.cat}</span>
                  <span className="crate-title">{r.title}</span>
                  <span className="crate-what">{r.what}</span>
                  <span className="crate-stack">{r.stack}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="small muted crate-hint">Flip through the crate. Every sleeve opens the record.</p>
        </div>
      </section>

      {/* ------------------------------------------------------------ about */}
      <section id="about" className="about" aria-labelledby="about-title">
        <div className="frame about-grid">
          <div className="about-copy">
            <h2 id="about-title" className="h2 rv">
              Behind the counter
            </h2>
            <p className="statement rv" style={s(1)}>
              I started SNOWBROS to get production experience on my own terms: real clients, real data, real consequences when something breaks.
            </p>
            <div className="prose gatefold rv" style={s(2)}>
              <p>
                I ship production systems end to end: relational data models, typed APIs, React frontends, native binaries, and the CI that releases them.
                Most of it is full-stack TypeScript, Next.js and React in front, Node.js and PostgreSQL behind. Some of it is Rust, because a few problems
                deserve a compiler rather than a script.
              </p>
              <p>
                Now I want to bring that into a larger engineering team. I ship, I write tests, and I care about the parts that show up six months later.
              </p>
            </div>
            <div className="house-rules">
              <p className="cat rv">House rules</p>
              <ul>
                {[
                  ["One source of truth.", "Balances, stock and payments are decided in one place, usually the database, never by each client."],
                  ["Tests before release.", "268 tests and Playwright gate the boutique till. Atlas ships with more than 340."],
                  ["No claim I can't measure.", "Every number in this shop traces back to a README, a benchmark or a live product."],
                ].map(([t, d], k) => (
                  <li key={t} className="rule rv" style={s(k)}>
                    <b>{t}</b>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rv" style={s(2)}>
            <Tilt className="badge">
              <span className="badge-clip" aria-hidden />
              <span className="badge-head">
                <span>Hello</span>
                <span className="small">my name is</span>
              </span>
              <span className="badge-name">Ved</span>
              <span className="badge-role">Owner · Software engineer</span>
              <dl className="badge-facts">
                <div>
                  <dt>Studying</dt>
                  <dd>
                    {EDUCATION.degree}, {EDUCATION.school}. {EDUCATION.when}.
                  </dd>
                </div>
                {ROLES.map((r) => (
                  <div key={r.org}>
                    <dt>{r.role}</dt>
                    <dd>
                      {r.href ? (
                        <a className="link" href={r.href} target="_blank" rel="noreferrer">
                          {r.org}
                        </a>
                      ) : (
                        r.org
                      )}
                      {r.when ? `, ${r.when}` : ""}
                    </dd>
                  </div>
                ))}
                <div>
                  <dt>Based in</dt>
                  <dd>{SITE.location}. On-site, hybrid or remote.</dd>
                </div>
              </dl>
              <span className="badge-barcode" aria-hidden>
                {Array.from({ length: 34 }, (_, k) => (
                  <i key={k} style={{ width: 1 + ((k * 7) % 4) }} />
                ))}
              </span>
            </Tilt>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ recognition */}
      <section id="recognition" className="frame section" aria-labelledby="rec-title">
        <div className="section-head">
          <h2 id="rec-title" className="h2 rv">
            Awards wall
          </h2>
          <p className="muted rv" style={s(1)}>
            Research, a college&rsquo;s thanks for software it used, and what I finished learning this year. Lean in; the discs catch the light.
          </p>
        </div>
        <ul className="wall">
          {HONORS.map((h, k) => {
            const metal = ["gold", "platinum", "silver", "silver"][k] ?? "silver";
            return (
              <li key={h.title} className="rv" style={s(k)}>
                <Tilt className={`plaque plaque-${metal}`}>
                  <span className={`award-disc award-${metal}`} aria-hidden>
                    <span className="award-label">
                      <b>{["1st", "Thanks", "Edge AI", "Forage"][k]}</b>
                    </span>
                  </span>
                  <span className="plaque-text">
                    <span className="cat">
                      {h.by}, {h.when}
                    </span>
                    <h3>{h.title}</h3>
                    <span className="small">{h.detail}</span>
                    {h.href && (
                      <Link href={h.href} className="link small" style={{ justifySelf: "start" }}>
                        Read about the platform
                      </Link>
                    )}
                  </span>
                </Tilt>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ------------------------------------------------------------ the mixing desk */}
      <section id="stack" className="console" aria-labelledby="stack-title">
        <div className="frame">
          <div className="section-head">
            <h2 id="stack-title" className="h2 rv">
              The mixing desk
            </h2>
            <p className="rv" style={s(1)}>
              Every tool I ship with is a channel. Its fader sits at how many records it played on. Play Our Song and the meters run.
            </p>
          </div>
          <div className="rv" style={s(2)}>
            <MixingDesk channels={channels} />
          </div>
          <div className="credits">
            {SKILLS.map((g, k) => (
              <div key={g.group} className="credit rv" style={s(k)}>
                <p className="cat">{g.group}</p>
                <p>{g.items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ pressed from commits */}
      <section className="frame section split" aria-labelledby="gh-title">
        <div>
          <h2 id="gh-title" className="h2 rv">
            Pressed from commits
          </h2>
          <p className="muted rv" style={{ ...s(1), marginTop: 20, maxWidth: "36ch" }}>
            The same year that&rsquo;s pressed into the house record&rsquo;s grooves. With the song on, every week moves with one band of it.
          </p>
        </div>
        <div className="gh">
          {activity?.year && (
            <>
              <div className="gh-total rv">
                <b>{activity.year.total.toLocaleString("en-IN")}</b>
                <span className="muted">contributions in the last year, {activity.year.commits.toLocaleString("en-IN")} of them commits</span>
              </div>
              <div className="rv" style={s(1)}>
                <Spectrum weeks={weeks} peak={peak} />
              </div>
            </>
          )}
          <ul className="gh-repos rv" style={s(2)} aria-label="Most recently pushed repositories">
            {gh.repos.map((r) => (
              <li key={r.name}>
                <span>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.name}
                  </a>
                  {r.language && <span className="small muted"> {r.language}</span>}
                </span>
                <span className="small muted num">{fmtDay.format(new Date(r.pushed))}</span>
              </li>
            ))}
          </ul>
          <p className="small muted">
            {gh.from === "live" ? "Read from the GitHub API, refreshed hourly." : `GitHub didn't answer, so this is the snapshot taken ${fmtDay.format(new Date(SNAPSHOT.taken))}.`}{" "}
            <a className="link" href={SITE.github} target="_blank" rel="noreferrer">
              All repositories
            </a>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ singles: on now */}
      <section className="frame section" aria-labelledby="now-title">
        <div className="section-head">
          <h2 id="now-title" className="h2 rv">
            On the turntable now
          </h2>
          <p className="muted rv" style={s(1)}>
            What I&rsquo;m building, shipping and learning, updated {fmtDay.format(new Date(NOW.updated))}.
          </p>
        </div>
        <ul className="singles">
          {NOW.rows.map((r, k) => {
            const inner = (
              <>
                <span className="single-disc" aria-hidden>
                  <span style={{ background: ["#9b2316", "#e3a72f", "#1f6f6a", "#d0661f"][k % 4] }} />
                </span>
                <span className="cat">{r.verb}</span>
                <b>{r.what}</b>
                <span className="small">{r.detail}</span>
              </>
            );
            return (
              <li key={r.what} className="rv" style={{ ...s(k), display: "grid" }}>
                {r.href ? (
                  <Link href={r.href} className="single">
                    {inner}
                  </Link>
                ) : (
                  <div className="single">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ------------------------------------------------------------ contact */}
      <section id="contact" className="contact" aria-labelledby="contact-title">
        <div className="frame contact-grid">
          <div>
            <h2 id="contact-title" className="h2 rv">
              Request a record
            </h2>
            <a className="contact-mail rv" style={s(1)} href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
            <div className="contact-paths">
              <div className="rv">
                <h3>Hiring</h3>
                <p>
                  Software engineering internships and entry-level full-stack roles, on-site, hybrid or remote.{" "}
                  <a className="link" href={SITE.resume} target="_blank" rel="noreferrer">
                    My résumé
                  </a>{" "}
                  has the short version.
                </p>
              </div>
              <div className="rv" style={s(1)}>
                <h3>Building something</h3>
                <p>
                  Founders and businesses with a system that needs building or fixing: I take on select freelance and contract work through{" "}
                  <a className="link" href={SITE.studioUrl} target="_blank" rel="noreferrer">
                    SNOWBROS
                  </a>
                  .
                </p>
              </div>
            </div>
            <p className="small muted rv" style={{ marginTop: 40, display: "flex", gap: 10, alignItems: "center" }}>
              <CheckCircle aria-hidden weight="fill" width={18} height={18} />
              Replies within a day, usually sooner.
            </p>
          </div>
          <div className="rv" style={s(2)}>
            <ScratchDeck email={SITE.email} label="VED" />
          </div>
        </div>
      </section>
    </main>
  );
}

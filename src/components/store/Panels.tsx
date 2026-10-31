"use client";
/**
 * What each station opens. Every panel is readable HTML; the store only decides which one is
 * showing. Panels that point at a record open its case study in the same sheet, so the visitor
 * never loses their place on the floor.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ArrowUpRight, Copy, EnvelopeSimple, Play, Stop } from "@phosphor-icons/react";
import { CaseStudy, Cover } from "@/components/CaseStudy";
import { Sheet } from "./Sheet";
import { StoreMap } from "./StoreMap";
import { send, useWorld } from "@/world/state";
import { close } from "@/world/control";
import { cue, playSeries } from "@/world/audio";
import { sleeveOf } from "@/lib/covers";
import type { Filing } from "@/lib/work";
import type { ArchiveItem } from "@/lib/work";
import type { DISCOGRAPHY, EDUCATION, HONORS, ROLES, SITE } from "@/lib/site";
import type { ABOUT, studio } from "@/lib/content";

export type StoreData = {
  records: Filing[];
  proofs: Record<string, { value: string; label: string } | null>;
  archive: ArchiveItem[];
  discography: typeof DISCOGRAPHY;
  honors: typeof HONORS;
  studio: ReturnType<typeof studio>;
  about: typeof ABOUT;
  education: typeof EDUCATION;
  roles: typeof ROLES;
  site: typeof SITE;
  status: string;
  /** Photos found in public/awards and public/album at build time. */
  photos?: { awards: Record<string, { src: string; alt: string }[]>; album: { src: string; alt: string }[] };
  /** The gold record's grooves: public repositories, oldest push first. */
  pressing?: { name: string; size: number; language: string | null }[];
};

const TINT: Record<string, string> = {
  case: "var(--tangerine-ink)",
  crate: "var(--tangerine-ink)",
  studio: "var(--violet-ink)",
  lounge: "var(--teal-ink)",
  arcade: "var(--raspberry-ink)",
  releases: "var(--tangerine-ink)",
  honors: "var(--tangerine-ink)",
  counter: "var(--coral-ink)",
  map: "var(--ink-3)",
  secret: "var(--tangerine-ink)",
};

function openCase(slug: string, from: string) {
  send({ type: "OPEN", panel: "case", id: from, ref: slug });
  cue("pull");
}

/* ------------------------------------------------------------------ panels */

function Crate({ data }: { data: StoreData }) {
  const crate = data.records.slice(6);
  return (
    <>
      <h2 className="display">The back catalogue</h2>
      <p>Two storefronts built for clients, and the record you&rsquo;re standing in. Pick one to flip it over.</p>
      <ul className="list">
        {crate.map((f) => (
          <li key={f.slug}>
            <button type="button" className="row-btn" onClick={() => openCase(f.slug, "crate")}>
              <span className="art">
                <Cover slug={f.slug} />
              </span>
              <span>
                <b>{f.title}</b>
                <small>
                  {sleeveOf(f.slug).cat} · {f.field}
                </small>
              </span>
              <ArrowUpRight aria-hidden weight="bold" />
            </button>
          </li>
        ))}
      </ul>
      <p className="cat" style={{ marginTop: 24 }}>
        On the wall
      </p>
      <ul className="list">
        {data.records.slice(0, 6).map((f) => (
          <li key={f.slug}>
            <button type="button" className="row-btn" onClick={() => openCase(f.slug, "crate")}>
              <span className="art">
                <Cover slug={f.slug} />
              </span>
              <span>
                <b>{f.title}</b>
                <small>{f.field}</small>
              </span>
              <ArrowUpRight aria-hidden weight="bold" />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function Studio({ data }: { data: StoreData }) {
  const [jack, setJack] = useState<string | null>(null);
  const titles = useMemo(() => Object.fromEntries(data.records.map((r) => [r.slug, r.title])), [data.records]);
  const tints = ["var(--tangerine)", "var(--coral)", "var(--teal)", "var(--violet)", "var(--butter)"];
  const hit = data.studio.flatMap((g) => g.items).find((i) => i.name === jack);
  return (
    <>
      <h2 className="display">The production studio</h2>
      <p>The tools I build with, grouped the way my résumé groups them. Patch a cable into any tool to see which records it played on.</p>
      <div className="bay">
        {data.studio.map((g, k) => (
          <section key={g.group} className="module" style={{ "--tint": tints[k % tints.length] } as React.CSSProperties} aria-label={g.group}>
            <h3>
              <i aria-hidden />
              {g.group}
            </h3>
            <ul>
              {g.items.map((it) =>
                it.records.length ? (
                  <li key={it.name}>
                    <button type="button" className="jack" aria-pressed={jack === it.name} onClick={() => setJack(jack === it.name ? null : it.name)}>
                      {it.name} <sup>{it.records.length}</sup>
                    </button>
                  </li>
                ) : (
                  <li key={it.name}>
                    <span className="jack">{it.name}</span>
                  </li>
                ),
              )}
            </ul>
          </section>
        ))}
      </div>
      <div className="patched" aria-live="polite">
        {hit ? (
          <>
            <b>{hit.name}</b> shipped on {hit.records.length} record{hit.records.length === 1 ? "" : "s"}:{" "}
            {hit.records.map((slug, k) => (
              <span key={slug}>
                {k > 0 && ", "}
                <button type="button" className="link" style={{ background: "none", border: 0, padding: 0, font: "inherit", cursor: "pointer" }} onClick={() => openCase(slug, "studio-desk")}>
                  {titles[slug] ?? slug}
                </button>
              </span>
            ))}
            .
          </>
        ) : (
          <span className="muted">Numbers beside a tool count the shipped projects whose stack lists it. Tools without one are on the résumé but not yet on a record here.</span>
        )}
      </div>
    </>
  );
}

function Lounge({ data }: { data: StoreData }) {
  const a = data.about;
  return (
    <>
      <h2 className="display">Hello, I&rsquo;m Ved.</h2>
      <p style={{ fontSize: "var(--step-1)", lineHeight: 1.4 }}>{a.statement}</p>
      <div className="prose">
        {a.body.map((p) => (
          <p key={p.slice(0, 20)}>{p}</p>
        ))}
        {!!data.photos?.album.length && (
          <>
            <h3>The photo album</h3>
            <ul className="album">
              {data.photos.album.map((p, k) => (
                <li key={p.src} style={{ "--tilt": `${((k * 37) % 7) - 3}deg` } as React.CSSProperties}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.alt} loading="lazy" />
                  <span>{p.alt}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <h3>House rules</h3>
        <ul className="plaques">
          {a.rules.map(([t, d]) => (
            <li key={t} className="plaque" style={{ gridTemplateColumns: "1fr" }}>
              <span>
                <b>{t}</b>
                <p>{d}</p>
              </span>
            </li>
          ))}
        </ul>
        <h3>The short version</h3>
        <p>
          {data.education.degree}, {data.education.school}, {data.education.when}.{" "}
          {data.roles.map((r) => `${r.role}, ${r.org}${r.when ? ` (${r.when})` : ""}`).join(". ")}. Based in {data.site.location}; on-site, hybrid or remote.
        </p>
        <p className="runout">{a.principle}</p>
      </div>
    </>
  );
}

function Arcade({ data, focus }: { data: StoreData; focus?: number }) {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest" });
  }, [focus]);
  return (
    <>
      <h2 className="display">The experimental arcade</h2>
      <p>Side projects, prototypes and tools. Smaller than the records, built because I wanted to know how. (The loose records on the floor can be kicked.)</p>
      <ul className="list">
        {data.archive.map((a, k) => (
          <li key={a.title} ref={k === focus ? ref : undefined}>
            <a href={a.href} className="row-btn" target="_blank" rel="noreferrer" style={k === focus ? { background: "var(--paper-2)", borderWidth: 2.5 } : undefined}>
              <span className="art" style={{ display: "grid", placeItems: "center", background: ["var(--raspberry)", "var(--violet)", "var(--teal)", "var(--tangerine)", "var(--coral)", "var(--midnight)"][k % 6], color: "#fff6e8", font: "800 1.6rem/1 var(--font-display)" }}>
                {a.title.slice(0, 1)}
              </span>
              <span>
                <b>{a.title}</b>
                <small>
                  {a.field} · {a.stack}
                </small>
              </span>
              <ArrowUpRight aria-hidden weight="bold" />
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

function Releases({ data }: { data: StoreData }) {
  return (
    <>
      <h2 className="display">The hall of releases</h2>
      <p>Everything since the studio opened, in the order it came out. The framed ones are records you can open.</p>
      <ol className="timeline">
        {data.discography.map((d) => (
          <li key={d.title + d.when} style={{ "--tint": d.slug ? sleeveOf(d.slug).label : "var(--butter)" } as React.CSSProperties}>
            <span className="when">{d.when}</span>
            {d.slug ? (
              <b>
                <button type="button" className="link" style={{ background: "none", border: 0, padding: 0, font: "inherit", cursor: "pointer", color: "inherit", textAlign: "left" }} onClick={() => openCase(d.slug!, "releases")}>
                  {d.title}
                </button>
              </b>
            ) : (
              <b>
                <a className="link" href={d.href} target="_blank" rel="noreferrer">
                  {d.title}
                </a>
              </b>
            )}
            <span>{d.what}</span>
          </li>
        ))}
      </ol>
    </>
  );
}

function Honors({ data }: { data: StoreData }) {
  const metals = ["#e9b949", "#dfe3ea", "#c0c6d0", "#c0c6d0"];
  return (
    <>
      <h2 className="display">On the wall</h2>
      <p>Research, a college&rsquo;s thanks for software it used, and what I finished learning this year.</p>
      <ul className="plaques">
        {data.honors.map((h, k) => (
          <li key={h.title} className="plaque" data-photo={data.photos?.awards[h.id]?.length ? "" : undefined}>
            {data.photos?.awards[h.id]?.length ? (
              <span className="plaque-photos">
                {data.photos.awards[h.id].map((p, n) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.src} className="plaque-photo" src={p.src} alt={`${h.title}, photo ${n + 1}`} loading="lazy" />
                ))}
              </span>
            ) : (
              <span className="medal" style={{ "--metal": metals[k] ?? metals[3] } as React.CSSProperties} aria-hidden />
            )}
            <span>
              <span className="cat">
                {h.by}, {h.when}
              </span>
              <b>{h.title}</b>
              <p>{h.detail}</p>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

function Counter({ data }: { data: StoreData }) {
  const [why, setWhy] = useState("Hiring");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const email = data.site.email;
  const subject = why === "Hiring" ? "A role for you" : why === "Building" ? "Something to build" : "Hello from the Recordverse";
  const href = `mailto:${email}?cc=${data.site.emailCc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(note)}`;
  const bars = useMemo(() => Array.from({ length: 38 }, (_, k) => 1 + ((k * 7 + 3) % 4)), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <>
      <h2 className="display">Checkout</h2>
      <p>Hiring for an internship or an entry-level full-stack role, or have a system that needs building? Here&rsquo;s your receipt, and the way to reach me.</p>
      <div className="receipt" aria-label="Receipt">
        <h3>The Recordverse</h3>
        <p className="center">Patan, Gujarat · open daily</p>
        <hr />
        <div className="line">
          <span>1 × Software engineer</span>
          <span>Ved S. Chauhan</span>
        </div>
        <div className="line">
          <span>Studio</span>
          <span>SNOWBROS, founder</span>
        </div>
        <div className="line">
          <span>Studying</span>
          <span>B.Tech CE, 2024–28</span>
        </div>
        <hr />
        {data.records.slice(0, 6).map((r) => (
          <div className="line" key={r.slug}>
            <span>{r.title}</span>
            <span>shipped</span>
          </div>
        ))}
        <hr />
        <div className="line total">
          <span>STATUS</span>
          <span>OPEN TO WORK</span>
        </div>
        <p className="center" style={{ marginTop: 8 }}>
          {data.status}
        </p>
        <div className="barcode" aria-hidden>
          {bars.map((w, k) => (
            <i key={k} style={{ width: w }} />
          ))}
        </div>
        <p className="center">thank you, come again</p>
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          location.href = href;
        }}
      >
        <fieldset>
          <legend>What brings you to the counter?</legend>
          <div className="choices">
            {["Hiring", "Building", "Saying hi"].map((c) => (
              <label key={c}>
                <input type="radio" name="why" value={c} checked={why === c} onChange={() => setWhy(c)} />
                <span>{c === "Building" ? "Something to build" : c}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="note">A line or two (optional)</label>
          <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Who you are, and what you have in mind." />
        </div>
        <div className="case-actions" style={{ marginTop: 0 }}>
          <button type="submit" className="btn btn-primary">
            <EnvelopeSimple aria-hidden weight="bold" />
            Write the email
          </button>
          <button type="button" className="btn" onClick={copy} aria-live="polite">
            <Copy aria-hidden weight="bold" />
            {copied ? "Copied" : email}
          </button>
          <a href={data.site.resume} className="btn" target="_blank" rel="noreferrer">
            Résumé (PDF)
          </a>
        </div>
        <p className="small muted" style={{ margin: 0 }}>
          Opens your mail app with the message filled in. Nothing is sent from this page.
        </p>
      </form>
      <ul className="stack" style={{ marginTop: 18 }}>
        {[
          { label: "GitHub", href: data.site.github },
          { label: "LinkedIn", href: data.site.linkedin },
          { label: "SNOWBROS", href: data.site.studioUrl },
          { label: "SNOWBROS on LinkedIn", href: data.site.studioLinkedin },
        ].map((l) => (
          <li key={l.href}>
            <a className="chip" href={l.href} target="_blank" rel="noreferrer" style={{ textDecoration: "none", minHeight: 36 }}>
              {l.label}
              <ArrowUpRight aria-hidden weight="bold" width={14} height={14} />
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

function MapPanel() {
  return <StoreMap />;
}

function Secret({ data }: { data: StoreData }) {
  const repos = data.pressing ?? [];
  const [at, setAt] = useState(-1);
  const stop = useRef<(() => void) | null>(null);
  useEffect(
    () => () => {
      stop.current?.();
    },
    [],
  );
  const values = repos.map((r) => Math.log10(Math.max(10, r.size)));
  const rings = repos.length;
  return (
    <>
      <h2 className="display">The gold record</h2>
      <p>
        You found the one record that isn&rsquo;t for sale. It&rsquo;s pressed from my public GitHub: one groove per repository, oldest push on the outside, and the
        groove&rsquo;s weight is how much code is in it. Drop the needle and each groove plays as a note.
      </p>
      <svg className="groove-art" viewBox="0 0 300 300" role="img" aria-label={`${rings} grooves, one per public repository`}>
        <circle cx="150" cy="150" r="146" fill="#14101f" />
        {repos.map((r, k) => (
          <circle key={r.name} cx="150" cy="150" r={140 - k * (88 / Math.max(1, rings))} fill="none" stroke={k === at ? "#ffd66b" : "#e9b949"} strokeOpacity={k === at ? 1 : 0.35} strokeWidth={k === at ? 4 : 0.8 + values[k] * 0.45} />
        ))}
        <circle cx="150" cy="150" r="44" fill="#e9b949" />
        <text x="150" y="146" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fontWeight="700" fill="#231a33">
          RV-00
        </text>
        <text x="150" y="162" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#231a33">
          {at >= 0 ? repos[at]?.name : "pressed from commits"}
        </text>
      </svg>
      <div className="case-actions" style={{ justifyContent: "center" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            if (at >= 0) {
              stop.current?.();
              setAt(-1);
              return;
            }
            stop.current = playSeries(values, (i) => setAt(i));
          }}
          aria-pressed={at >= 0}
        >
          {at >= 0 ? <Stop aria-hidden weight="fill" /> : <Play aria-hidden weight="fill" />}
          {at >= 0 ? "Lift the needle" : "Drop the needle"}
        </button>
      </div>
      <p className="small muted" aria-live="polite" style={{ textAlign: "center" }}>
        {at >= 0 && repos[at] ? `${repos[at].name}${repos[at].language ? `, ${repos[at].language}` : ""}` : `${rings} repositories, from the committed GitHub snapshot.`}
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ the switch */

export function Panels(data: StoreData) {
  const mode = useWorld((s) => s.mode);
  const bySlug = useMemo(() => Object.fromEntries(data.records.map((r) => [r.slug, r])), [data.records]);
  const pushed = useRef(false);

  const panel = mode.kind === "inspect" ? mode.panel : mode.kind === "map" ? "map" : null;
  const ref = mode.kind === "inspect" ? mode.ref : undefined;
  const filing = panel === "case" && ref ? bySlug[ref] : undefined;

  // A case study has its own address while it's open; Back closes it.
  useEffect(() => {
    if (!filing) return;
    const url = `/work/${filing.slug}`;
    if (location.pathname !== url) {
      history.pushState({ rv: true }, "", url);
      pushed.current = true;
    }
    document.title = `${filing.title} · Ved Chauhan`;
    const onPop = () => {
      pushed.current = false;
      close();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.title = "Ved Chauhan · The Recordverse";
    };
  }, [filing]);

  const onClose = () => {
    if (pushed.current) {
      pushed.current = false;
      history.back();
    }
    close();
  };

  const kicker = (() => {
    if (filing) return `01 · The Record Wall · ${sleeveOf(filing.slug).cat}`;
    const room = { crate: "01 · The Record Wall", studio: "02 · Production Studio", lounge: "03 · Listening Lounge", arcade: "04 · Experimental Arcade", releases: "05 · Hall of Releases", honors: "05 · Hall of Releases", counter: "06 · Checkout Counter", map: "Store map", secret: "03 · Listening Lounge · ???" } as Record<string, string>;
    return room[panel ?? ""] ?? "";
  })();

  return (
    <AnimatePresence>
      {panel && (
        <Sheet key={`${panel}-${ref ?? ""}`} label={filing ? filing.title : kicker} kicker={kicker} wide={panel === "case"} onClose={onClose} tint={TINT[panel]}>
          {filing && <CaseStudy f={filing} proof={data.proofs[filing.slug]} />}
          {panel === "crate" && <Crate data={data} />}
          {panel === "studio" && <Studio data={data} />}
          {panel === "lounge" && <Lounge data={data} />}
          {panel === "arcade" && <Arcade data={data} focus={ref ? Number(ref) : undefined} />}
          {panel === "releases" && <Releases data={data} />}
          {panel === "honors" && <Honors data={data} />}
          {panel === "counter" && <Counter data={data} />}
          {panel === "map" && <MapPanel />}
          {panel === "secret" && <Secret data={data} />}
          {panel !== "case" && panel !== "map" && (
            <p className="small muted" style={{ marginTop: 28 }}>
              <Link className="link" href="/quick">
                See everything on one page in Quick View
              </Link>
            </p>
          )}
        </Sheet>
      )}
    </AnimatePresence>
  );
}

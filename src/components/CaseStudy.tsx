"use client";
/**
 * A record's two sides. A-side, the experience: what it is, the proof, the problem, the screens.
 * B-side, behind the build: my part, the stack, the engineering decisions as a tracklist, and
 * what holds true. The sleeve flips with the side, so the metaphor carries the navigation, but
 * the tabs are plain buttons and both sides are real HTML.
 */
import Image from "next/image";
import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, GithubLogo } from "@phosphor-icons/react";
import { coverSVG, sleeveOf } from "@/lib/covers";
import type { Filing } from "@/lib/work";

function trackNo(i: number, total: number) {
  const half = Math.ceil(total / 2);
  return i < half ? `A${i + 1}` : `B${i - half + 1}`;
}

/** The filings were written as patent claims; read them as plain sentences. */
function plain(claim: string) {
  const s = claim.replace(/^The [\w-]+ of claim \d+, (wherein |further comprising )/, (_, how: string) => (how.startsWith("further") ? "It has " : ""));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function Cover({ slug, label }: { slug: string; label?: string }) {
  return <span role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} dangerouslySetInnerHTML={{ __html: coverSVG(slug) }} style={{ display: "contents" }} />;
}

export function CaseStudy({ f, proof, headingLevel = 2, side: initial = "a" }: { f: Filing; proof?: { value: string; label: string } | null; headingLevel?: 1 | 2; side?: "a" | "b" }) {
  const [side, setSide] = useState<"a" | "b">(initial);
  const calm = useReducedMotion();
  const id = useId();
  const s = sleeveOf(f.slug);
  const links = f.links.filter((l) => !l.href.includes("snowbros.me/#"));
  const live = links.filter((l) => !l.href.includes("github.com"));
  const source = links.filter((l) => l.href.includes("github.com"));
  const images = f.figures.filter((x) => x.kind === "image");
  const codes = f.figures.filter((x) => x.kind === "code");
  const H = headingLevel === 1 ? "h1" : "h2";
  const spring = calm ? { duration: 0 } : { type: "spring" as const, bounce: 0.12, duration: 0.6 };

  const tab = (k: "a" | "b") => ({
    role: "tab",
    id: `${id}-${k}`,
    "aria-selected": side === k,
    "aria-controls": `${id}-${k}-panel`,
    tabIndex: side === k ? 0 : -1,
    onClick: () => setSide(k),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const next = side === "a" ? "b" : "a";
        setSide(next);
        document.getElementById(`${id}-${next}`)?.focus();
      }
    },
  });

  return (
    <article className="case" style={{ "--sleeve": s.bg, "--sleeve-ink": s.ink } as React.CSSProperties}>
      <div className="case-top">
        <button type="button" className="flipper" onClick={() => setSide(side === "a" ? "b" : "a")} aria-label={`Flip the sleeve to side ${side === "a" ? "B" : "A"}`} style={{ border: 0, padding: 0, background: "none", cursor: "pointer" }}>
          <motion.span className="flipper-card" animate={{ rotateY: side === "a" ? 0 : 180 }} transition={spring} style={{ display: "block" }}>
            <span className="flipper-face">
              <Cover slug={f.slug} />
            </span>
            <span className="flipper-face flipper-back" aria-hidden>
              <b>{s.cat} · Side B</b>
              {f.decisions.map((d, k) => (
                <span key={d.title}>
                  {trackNo(k, f.decisions.length)} {d.title}
                </span>
              ))}
            </span>
          </motion.span>
        </button>
        <div>
          <p className="cat">
            {s.cat} · {f.field} · {f.year}
          </p>
          <H className="case-title display">{f.title}</H>
          <p className="case-short">{f.short}</p>
        </div>
      </div>

      <div className="sides" role="tablist" aria-label="Sides of the record">
        <motion.span className="sides-thumb" aria-hidden animate={{ x: side === "a" ? "0%" : "calc(100% + 4px)" }} transition={calm ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.35 }} />
        <button type="button" {...tab("a")}>
          <span>A-SIDE</span>The experience
        </button>
        <button type="button" {...tab("b")}>
          <span>B-SIDE</span>Behind the build
        </button>
      </div>

      <div role="tabpanel" id={`${id}-a-panel`} aria-labelledby={`${id}-a`} hidden={side !== "a"} className="prose">
        {(proof || f.facts.length > 0) && (
          <ul className="facts">
            {(proof ? [proof, ...f.facts.filter((x) => x.value !== proof.value)] : f.facts).slice(0, 4).map((x) => (
              <li key={x.label}>
                <b>{x.value}</b>
                <span>{x.label}</span>
              </li>
            ))}
          </ul>
        )}
        <p>{f.abstract}</p>
        <h3>The problem</h3>
        <p>{f.background}</p>
        {images.map((fig, k) =>
          fig.kind === "image" ? (
            <figure key={fig.img.src + k} className="figure">
              <Image src={fig.img.src} alt={fig.img.alt} width={fig.img.w} height={fig.img.h} sizes="(min-width: 900px) 700px, 92vw" loading={k === 0 ? "eager" : "lazy"} />
              <figcaption>{fig.caption}</figcaption>
            </figure>
          ) : null,
        )}
        <p className="cat" style={{ marginTop: 18 }}>
          Status
        </p>
        <p>{f.status}</p>
        {live.length > 0 && (
          <div className="case-actions">
            {live.map((l) => (
              <a key={l.href} href={l.href} className="btn btn-primary" target="_blank" rel="noreferrer">
                {l.label}
                <ArrowUpRight aria-hidden weight="bold" />
              </a>
            ))}
            <button type="button" className="btn" onClick={() => setSide("b")}>
              Flip to the B-side
            </button>
          </div>
        )}
        {!live.length && (
          <div className="case-actions">
            <button type="button" className="btn btn-primary" onClick={() => setSide("b")}>
              Flip to the B-side
            </button>
          </div>
        )}
      </div>

      <div role="tabpanel" id={`${id}-b-panel`} aria-labelledby={`${id}-b`} hidden={side !== "b"} className="prose">
        <p className="cat" style={{ marginTop: 18 }}>
          My part
        </p>
        <p>{f.role}</p>
        <p className="cat">Stack</p>
        <ul className="stack">
          {f.stack.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
        <h3>Tracklist: the decisions that made it work</h3>
        <ol className="tracklist">
          {f.decisions.map((d, k) => (
            <li key={d.title}>
              <details open={k === 0}>
                <summary>
                  <span className="no">{trackNo(k, f.decisions.length)}</span>
                  <span>{d.title}</span>
                </summary>
                <p>{d.body}</p>
                {d.code && <pre className="code">{d.code.code}</pre>}
              </details>
            </li>
          ))}
        </ol>
        {codes.map((fig) =>
          fig.kind === "code" ? (
            <figure key={fig.title} className="figure">
              <span className="code-title cat">{fig.title}</span>
              <pre className="code">{fig.code}</pre>
              <figcaption>{fig.caption}</figcaption>
            </figure>
          ) : null,
        )}
        <h3>What holds true</h3>
        <ul>
          {f.claims.map((c) => (
            <li key={c}>{plain(c)}</li>
          ))}
        </ul>
        <div className="case-actions">
          {source.map((l) => (
            <a key={l.href} href={l.href} className="btn btn-primary" target="_blank" rel="noreferrer">
              <GithubLogo aria-hidden weight="bold" />
              {l.label}
            </a>
          ))}
          {live.map((l) => (
            <a key={l.href} href={l.href} className="btn" target="_blank" rel="noreferrer">
              {l.label}
              <ArrowUpRight aria-hidden weight="bold" />
            </a>
          ))}
          <button type="button" className="btn" onClick={() => setSide("a")}>
            Back to the A-side
          </button>
        </div>
      </div>
      <p className="runout">Run-out groove: {s.runout}</p>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Cover } from "@/components/CaseStudy";
import { QuickFooter, QuickHeader } from "@/components/QuickChrome";
import { VedMark } from "@/components/VedMark";
import { ABOUT, ALL_RECORDS, ARCHIVE, DISCOGRAPHY, EDUCATION, HONORS, NOW, ROLES, SITE, STATUS, getFiling, proofOf, studio } from "@/lib/content";
import { sleeveOf } from "@/lib/covers";
import { album, awardPhotos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Quick View",
  description: ABOUT.statement,
  alternates: { canonical: "/quick" },
};

const tints = ["var(--tangerine)", "var(--coral)", "var(--teal)", "var(--violet)", "var(--butter)"];
const contactLinks = [
  { label: "GitHub", href: SITE.github },
  { label: "LinkedIn", href: SITE.linkedin },
  { label: "SNOWBROS", href: SITE.studioUrl },
  { label: "SNOWBROS LinkedIn", href: SITE.studioLinkedin },
  { label: "Résumé", href: SITE.resume },
];

export default function QuickView() {
  return (
    <>
      <QuickHeader inQuickView />
      <main id="main">
        <div className="wrap qv-hero">
          <div>
            <div className="cat">Software engineer · Founder, SNOWBROS · {SITE.location}</div>
            <h1 className="display">Ved Chauhan</h1>
            <p>{ABOUT.statement}</p>
            <p className="flex items-start gap-3"><span className="dot" aria-hidden="true" />{STATUS}</p>
            <div className="intro-actions">
              <a href={`mailto:${SITE.email}?cc=${SITE.emailCc}`} className="btn btn-primary">{SITE.email}</a>
              <a href={SITE.resume} className="btn" target="_blank" rel="noreferrer">Résumé PDF</a>
              <a href={SITE.github} className="btn" target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>
          <aside className="now-card" aria-labelledby="now-title">
            <div className="now-card-head">
              <VedMark size={44} spinning />
              <div>
                <h2 id="now-title" className="cat">Now spinning</h2>
                <span className="muted">Updated <time dateTime={NOW.updated}>{new Date(NOW.updated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time></span>
              </div>
            </div>
            <ol>
              {NOW.rows.map((row, i) => (
                <li key={row.what}>
                  <span className="now-track">{String.fromCharCode(65 + Math.floor(i / 3))}{(i % 3) + 1}</span>
                  <div>
                    <span className="cat">{row.verb}</span>
                    <b>{row.href ? <Link href={row.href} className="link">{row.what}</Link> : row.what}</b>
                    <p>{row.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>

        <section id="work" className="qv-section" aria-labelledby="work-title">
          <div className="wrap">
            <div className="qv-section-head"><h2 id="work-title" className="display">The records</h2></div>
            <ul className="records">
              {ALL_RECORDS.map((slug) => {
                const f = getFiling(slug);
                if (!f) return null;
                const sleeve = sleeveOf(slug);
                const proof = proofOf(slug);
                return (
                  <li key={slug}>
                    <Link href={`/work/${slug}`} className="record-card">
                      <div className="sleeve" style={{ "--label": sleeve.label } as CSSProperties}>
                        <span className="disc" aria-hidden="true" />
                        <Cover slug={slug} />
                      </div>
                      <div>
                        <div className="meta cat"><span>{sleeve.cat}</span><span>{f.field} · {f.year}</span></div>
                        <h3>{f.title}</h3>
                        <p>{f.short}</p>
                        {proof && <div className="proof"><b>{proof.value}</b><span>{proof.label}</span></div>}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section id="studio" className="qv-section" aria-labelledby="studio-title">
          <div className="wrap">
            <div className="qv-section-head"><h2 id="studio-title" className="display">The production studio</h2></div>
            <div className="bay">
              {studio().map((group, i) => (
                <div key={group.group} className="module" style={{ "--tint": tints[i % tints.length] } as CSSProperties}>
                  <h3><i aria-hidden="true" />{group.group}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.name}><span className="jack">{item.name}{item.records.length > 0 && <sup aria-label={`${item.records.length} records`}>{item.records.length}</sup>}</span></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="releases" className="qv-section" aria-labelledby="releases-title">
          <div className="wrap">
            <div className="qv-section-head"><h2 id="releases-title" className="display">Hall of releases</h2></div>
            <div className="grid-2">
              <div>
                <h3>Discography</h3>
                <ol className="timeline">
                  {DISCOGRAPHY.map((release) => (
                    <li key={release.title + release.when} style={{ "--tint": release.slug ? sleeveOf(release.slug).label : "var(--butter)" } as CSSProperties}>
                      <span className="when">{release.when}</span>
                      <b>{release.slug ? <Link href={`/work/${release.slug}`} className="link">{release.title}</Link> : <a href={release.href} className="link" target="_blank" rel="noreferrer">{release.title}</a>}</b>
                      <span>{release.what}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3>On the wall</h3>
                <ul className="plaques">
                  {HONORS.map((honor, i) => (
                    <li key={honor.title} className="plaque" data-photo={awardPhotos(honor.id).length ? "" : undefined}>
                      {awardPhotos(honor.id).length ? (
                        <span className="plaque-photos">
                          {awardPhotos(honor.id).map((p, n) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={p.src} className="plaque-photo" src={p.src} alt={`${honor.title}, photo ${n + 1}`} loading="lazy" />
                          ))}
                        </span>
                      ) : (
                        <span className="medal" style={{ "--metal": i === 0 ? "#e9b949" : i === 1 ? "#dfe3ea" : "#c0c6d0" } as CSSProperties} aria-hidden="true" />
                      )}
                      <div>
                        <span className="cat">{honor.by}, {honor.when}</span>
                        <b>{honor.href ? <Link href={honor.href} className="link">{honor.title}</Link> : honor.title}</b>
                        <p>{honor.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="qv-section" aria-labelledby="about-title">
          <div className="wrap">
            <div className="qv-section-head"><h2 id="about-title" className="display">Hello, I&apos;m Ved.</h2></div>
            <div className="grid-2">
              <div className="prose">
                <p className="statement">{ABOUT.statement}</p>
                {ABOUT.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {album().length > 0 && (
                  <ul className="album" aria-label="Photo album">
                    {album().map((p, k) => (
                      <li key={p.src} style={{ "--tilt": `${((k * 37) % 7) - 3}deg` } as CSSProperties}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.src} alt={p.alt} loading="lazy" />
                        <span>{p.alt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3>House rules</h3>
                <ul className="plaques">
                  {ABOUT.rules.map(([title, detail]) => <li key={title} className="plaque" data-photo=""><span><b>{title}</b><p>{detail}</p></span></li>)}
                </ul>
                <h3>Education</h3>
                <p>{EDUCATION.degree} · {EDUCATION.school} · {EDUCATION.when}</p>
                <p className="muted">{EDUCATION.coursework}</p>
                <h3>Roles</h3>
                {ROLES.map((role) => <p key={role.org}>{role.role} · {role.href ? <a href={role.href} className="link" target="_blank" rel="noreferrer">{role.org}</a> : role.org}{role.when && ` · ${role.when}`}</p>)}
              </div>
            </div>
            <p className="runout">{ABOUT.principle}</p>
          </div>
        </section>

        <section id="playground" className="qv-section" aria-labelledby="playground-title">
          <div className="wrap">
            <div className="qv-section-head"><h2 id="playground-title" className="display">The experimental arcade</h2></div>
            <ul className="archive">
              {ARCHIVE.map((item) => <li key={item.title}><a href={item.href} target="_blank" rel="noreferrer"><b>{item.title}</b><span>{item.field}</span><span className="muted">{item.stack}</span></a></li>)}
            </ul>
          </div>
        </section>

        <section id="contact" className="qv-section" aria-labelledby="contact-title">
          <div className="wrap">
            <div className="qv-section-head"><h2 id="contact-title" className="display">Checkout</h2></div>
            <p><a href={`mailto:${SITE.email}?cc=${SITE.emailCc}`} className="display link text-3xl sm:text-5xl">{SITE.email}</a></p>
            <ul className="stack">
              {contactLinks.map((link) => <li key={link.href}><a href={link.href} className="chip link" target="_blank" rel="noreferrer">{link.label}</a></li>)}
            </ul>
          </div>
        </section>
      </main>
      <QuickFooter />
    </>
  );
}

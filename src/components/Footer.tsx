import Link from "next/link";
import { CONFIRMED, NOW, SITE, STATUS, formatDate } from "@/lib/content";
import { CopyEmail, MAILTO } from "./CopyEmail";
import { Flake } from "./icons";

export function Footer() {
  return (
    <footer className="footer" aria-labelledby="footer-title">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Flake className="footer-mark" />
          </div>
          <div>
            <p className="chapter-mark" style={{ marginBottom: 28 }}>
              <span className="chapter-no">04</span> Contact
            </p>
            <h2 id="footer-title" className="t-display" style={{ maxWidth: "18ch" }}>
              Have something worth <em className="serif">building</em>?
            </h2>
            <p className="t-lead" style={{ marginTop: 18, maxWidth: "52ch" }}>
              {STATUS}
            </p>
            <div className="intro-actions" style={{ marginTop: 20, alignItems: "center" }}>
              <a href={MAILTO} className="arrow-link" style={{ fontSize: 20 }}>
                <span className="label">{SITE.email}</span>
              </a>
              <CopyEmail />
            </div>

            <div className="footer-cards">
              <section className="card wide" aria-labelledby="now-title">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <h3 id="now-title" className="t-meta" style={{ margin: 0 }}>
                    Changelog · now
                  </h3>
                  <p className="t-meta" style={{ margin: 0 }}>
                    Updated <time dateTime={CONFIRMED}>{formatDate(CONFIRMED)}</time>
                  </p>
                </div>
                <div style={{ marginTop: 10 }}>
                  {NOW.rows.map((r) => (
                    <div className="now-row" key={r.what}>
                      <span className="now-verb" data-verb={r.verb.toLowerCase()}>
                        <i aria-hidden />
                        {r.verb}
                      </span>
                      <span>
                        {r.href ? (
                          <Link href={r.href} className="link">
                            {r.what}
                          </Link>
                        ) : (
                          r.what
                        )}
                        <span className="t-small" style={{ display: "block" }}>
                          {r.detail}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>
              <nav className="card" aria-labelledby="site-links">
                <h3 id="site-links" className="t-meta" style={{ margin: 0 }}>
                  Site
                </h3>
                <ul>
                  <li>
                    <Link href="/">Home</Link>
                  </li>
                  <li>
                    <Link href="/#work">Work</Link>
                  </li>
                  <li>
                    <Link href="/about">About</Link>
                  </li>
                  <li>
                    <Link href="/#experiments">Experiments</Link>
                  </li>
                </ul>
              </nav>
              <nav className="card" aria-labelledby="elsewhere">
                <h3 id="elsewhere" className="t-meta" style={{ margin: 0 }}>
                  Elsewhere
                </h3>
                <ul>
                  <li>
                    <a href={MAILTO}>Email</a>
                  </li>
                  <li>
                    <a href={SITE.github} rel="noopener">
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href={SITE.linkedin} rel="noopener">
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a href={SITE.resume}>Résumé (PDF)</a>
                  </li>
                  <li>
                    <a href={SITE.studioUrl} rel="noopener">
                      SNOWBROS
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="footer-base" id="page-end">
              <span>© 2026 Ved S. Chauhan · {SITE.location}</span>
              <span>Built by hand with Next.js. No trackers.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

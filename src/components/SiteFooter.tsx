import Link from "next/link";
import { SITE } from "@/lib/site";
import { ShopHours } from "./ShopHours";

const SIDE_A = [
  { label: "The shop floor", href: "/" },
  { label: "The records", href: "/#work" },
  { label: "Discography", href: "/#discography" },
  { label: "The back catalogue", href: "/#catalogue" },
  { label: "Behind the counter", href: "/#about" },
  { label: "Awards wall", href: "/#recognition" },
];

const SIDE_B = [
  { label: "Email", href: `mailto:${SITE.email}` },
  { label: "GitHub", href: SITE.github },
  { label: "LinkedIn", href: SITE.linkedin },
  { label: "SNOWBROS studio", href: SITE.studioUrl },
  { label: "Résumé (PDF)", href: SITE.resume },
];

/** Bars that encode the catalogue number: each digit sets the widths of a bar pair. */
function barcode(code: string) {
  const out = [2, 1, 2];
  for (const d of code.replace(/\D/g, "").split("").map(Number)) out.push(1 + (d % 3), 1 + Math.floor(d / 4), 1, 1 + ((d + 1) % 2));
  return [...out, 2, 1, 2];
}

/**
 * Closing time: the footer is the back of the sleeve. Side A and side B are the track list,
 * the liner credits say who made it, the barcode carries the catalogue number, and a record
 * slides half out of the top.
 */
export function SiteFooter() {
  const bars = barcode("VED 2026 000");
  return (
    <footer className="site-footer">
      <div className="footer-sleeve-edge" aria-hidden>
        <div className="vinyl footer-vinyl">
          <div className="vinyl-label" style={{ background: "#e3a72f", color: "#1d1712" }}>
            <b>VED</b>
            <span>Side B</span>
          </div>
        </div>
      </div>
      <div className="frame footer-inner">
        <div className="footer-top">
          <p className="footer-sign">Ved Records</p>
          <ShopHours />
        </div>

        <div className="footer-cols">
          <nav aria-label="Side A, the aisles">
            <p className="footer-head">Side A</p>
            <ol className="footer-tracks">
              {SIDE_A.map((l, k) => (
                <li key={l.label}>
                  <span className="track-no">A{k + 1}</span>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ol>
          </nav>
          <nav aria-label="Side B, elsewhere">
            <p className="footer-head">Side B</p>
            <ol className="footer-tracks">
              {SIDE_B.map((l, k) => (
                <li key={l.label}>
                  <span className="track-no">B{k + 1}</span>
                  <a href={l.href} {...(l.href.startsWith("http") || l.href.endsWith(".pdf") ? { target: "_blank", rel: "noreferrer" } : {})}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="footer-credits">
            <p className="footer-head">Liner credits</p>
            <p>
              Written, produced and engineered by Ved S. Chauhan. Recorded in {SITE.location.split(",")[0]}. Released through SNOWBROS since February
              2026.
            </p>
            <p>Pressed with Next.js, React, three.js and GSAP. Every number in this shop traces to a repository or a live product.</p>
            <p>
              Open to software engineering internships and entry-level full-stack roles. Press <span className="kbd">/</span> to search the shop.
            </p>
          </div>
          <div className="footer-code">
            <span className="barcode" aria-hidden>
              {bars.map((w, k) => (
                <i key={k} style={{ width: w * 2, marginRight: k % 2 ? 2 : 1 }} />
              ))}
            </span>
            <span className="cat">VED 2026 · 33⅓ RPM · Stereo</span>
          </div>
        </div>

        <div className="footer-base">
          <p>℗ © 2026 Ved S. Chauhan. All rights reserved, no rights invented.</p>
          <p>
            <a href="https://github.com/VED2107/portfolio" target="_blank" rel="noreferrer">
              Source on GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

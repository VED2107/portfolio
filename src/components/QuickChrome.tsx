import Link from "next/link";
import { SITE } from "@/lib/content";

const sections = ["work", "studio", "releases", "about", "playground", "contact"] as const;

export function QuickHeader({ inQuickView = false }: { inQuickView?: boolean }) {
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <header className="qv-head">
        <div className="wrap">
          <Link href="/quick" className="qv-brand">{SITE.name}<i aria-hidden="true" /></Link>
          <nav className="qv-nav" aria-label="Main navigation">
            {sections.map((section) => (
              <Link key={section} href={`${inQuickView ? "" : "/quick"}#${section}`}>
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </Link>
            ))}
            <Link href="/" className="btn btn-accent">Walk into the store</Link>
          </nav>
        </div>
      </header>
    </>
  );
}

export function QuickFooter() {
  return (
    <footer className="qv-foot">
      <div className="wrap">
        <p>© 2026 Ved S. Chauhan · Built by hand, every number traceable to a repo or a live product.</p>
        <nav aria-label="Footer navigation">
          <ul>
            <li><Link href="/quick" className="link">Quick View</Link></li>
            <li><Link href="/" className="link">The store</Link></li>
            <li><a href={SITE.github} className="link" target="_blank" rel="noreferrer">GitHub</a></li>
            <li><a href={`mailto:${SITE.email}`} className="link">Email</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

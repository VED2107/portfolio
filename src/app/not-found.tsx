import Link from "next/link";
import { Mark } from "@/components/icons";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="wrap lost">
      <div className="inset">
        <Mark className="footer-mark" />
        <p className="t-meta" style={{ margin: "24px 0 12px" }}>
          404
        </p>
        <h1 className="t-display" style={{ maxWidth: "18ch" }}>
          This page doesn&apos;t exist, or it moved when the site was <em className="serif">rebuilt</em>.
        </h1>
        <div className="intro-actions">
          <Link href="/" className="arrow-link">
            <span className="label">Go to the homepage</span> <span className="ar">→</span>
          </Link>
          <Link href="/#work" className="arrow-link">
            <span className="label">See the work</span> <span className="ar">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

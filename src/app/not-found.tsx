import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="frame lost">
      <p className="small muted">404</p>
      <h1 className="h2">Nothing lives at this address.</h1>
      <p className="lede">Every project is on the home page, and the command menu reaches all of them.</p>
      <div className="actions">
        <Link href="/#work" className="btn btn-primary">
          See the work
        </Link>
        <Link href="/" className="btn">
          Home
        </Link>
      </div>
      <p className="small muted">
        Or press <span className="kbd">/</span> to search.
      </p>
    </main>
  );
}

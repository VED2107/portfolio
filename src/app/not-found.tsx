import Link from "next/link";

export const metadata = { title: "Out of stock" };

/** A 404 is a release the shop doesn't carry: an empty sleeve, with its own sticker. */
export default function NotFound() {
  return (
    <main id="main" className="oos grain">
      <div className="frame oos-grid">
        <div className="oos-sleeve" aria-hidden>
          <span className="oos-hole" />
          <span className="cat oos-cat">VED 404</span>
          <span className="sticker oos-sticker" style={{ "--rot": "6deg" } as React.CSSProperties}>
            <b>Out of stock</b>
            <span>check back never</span>
          </span>
        </div>
        <div>
          <p className="pk ink-3">VED 404 · Out of stock</p>
          <h1 className="h1">Not in the crate.</h1>
          <p className="lede oos-lede">Nothing was ever pressed at this address. Everything that was is on the shelf.</p>
          <div className="oos-actions">
            <Link href="/#records" className="press">
              Dig through the records
            </Link>
            <span className="small">
              or press <span className="kbd">/</span> to search the catalogue
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

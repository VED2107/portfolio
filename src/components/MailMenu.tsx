import { SITE } from "@/lib/site";
import { CopyEmail } from "./CopyEmail";

/**
 * The header address. At rest it shows the personal address with a copy button. Hover, or move
 * keyboard focus into it, and a small glass panel offers both addresses, each with its own copy
 * button, so the studio address is one step away without crowding the header.
 */
export function MailMenu() {
  return (
    <div className="mail-menu">
      <CopyEmail showAddress label="Copy personal email address" />
      <div className="mail-pop" role="group" aria-label="Email addresses">
        <div className="mail-row">
          <span className="mail-kind">Personal</span>
          <a href={`mailto:${SITE.email}`} className="mail-addr">
            {SITE.email}
          </a>
          <CopyEmail address={SITE.email} label="Copy personal email address" />
        </div>
        <div className="mail-row">
          <span className="mail-kind">Studio</span>
          <a href={`mailto:${SITE.studioEmail}`} className="mail-addr">
            {SITE.studioEmail}
          </a>
          <CopyEmail address={SITE.studioEmail} label="Copy studio email address" />
        </div>
      </div>
    </div>
  );
}

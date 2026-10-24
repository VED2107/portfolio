"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { bars, getRelease } from "@/lib/catalog";
import { useBasket } from "@/lib/basket";
import { copyText, toast } from "@/lib/events";
import { play } from "@/lib/sound";

/** Bar positions for the receipt's barcode: alternate bars and gaps, from the encoded widths. */
function barRects(code: string) {
  const widths = bars(code);
  const starts = widths.map((_, i) => 5 + widths.slice(0, i).reduce((a, b) => a + b, 0));
  return widths.map((w, i) => ({ x: starts[i], w })).filter((_, i) => i % 2 === 0);
}

const NEEDS = ["a product", "a developer tool", "a website", "a mobile app", "a dashboard", "you on my team", "something else"];
const WHEN = ["within a month", "in one to three months", "later this year", "no fixed date"];

/**
 * Checkout. Contact as a special-order slip: finish the sentence and the receipt beside it
 * prints the order, including every record you pulled out while you were here. Nothing is sent
 * from the page; "Place the order" opens your own mail app with the receipt as the email.
 */
export function Checkout() {
  const basket = useBasket();
  const [who, setWho] = useState("");
  const [need, setNeed] = useState(NEEDS[0]);
  const [when, setWhen] = useState(WHEN[0]);
  const [must, setMust] = useState("");
  const [stamp, setStamp] = useState("");

  useEffect(() => {
    const f = () => setStamp(new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date()) + " IST");
    f();
    const id = window.setInterval(f, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const browsed = basket.map((s) => getRelease(s)).filter(Boolean);
  const subject = `Special order: ${need}, ${when}`;
  const body = [
    "Hi Ved,",
    "",
    `I'm ${who.trim() || "…"}, and I need ${need} ${when}.`,
    must.trim() ? `It has to ${must.trim().replace(/\.$/, "")}.` : "It has to …",
    ...(browsed.length ? ["", "I pulled these out while browsing:", ...browsed.map((r) => `  ${r!.cat}  ${r!.title}`)] : []),
  ].join("\n");
  const href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const ready = who.trim().length > 0 && must.trim().length > 0;
  const code = `VED${(basket.length + 1) * 101}${new Date().getFullYear()}`;

  return (
    <section id="checkout" className="checkout grain" aria-labelledby="checkout-title">
      <div className="frame checkout-grid">
        <div className="slip">
          <p className="pk ink-3">Aisle D · Checkout</p>
          <h2 id="checkout-title" className="h1">
            Special orders
            <br />
            taken here
          </h2>
          <p className="lede slip-lede">Something not on the shelf yet? Finish the sentence. The receipt prints as you type, and your mail app sends it.</p>

          <form
            className="slip-form"
            onSubmit={(e) => {
              e.preventDefault();
              play("needle");
              window.location.href = href;
            }}
          >
            <p className="slip-line">
              Hi Ved, I&rsquo;m{" "}
              <label className="sr-only" htmlFor="o-who">
                Your name
              </label>
              <input id="o-who" className="slip-in" value={who} onChange={(e) => setWho(e.target.value)} placeholder="your name" autoComplete="name" maxLength={80} size={9} />
              , and I need{" "}
              <label className="sr-only" htmlFor="o-need">
                What you need
              </label>
              <select id="o-need" className="slip-in slip-sel" value={need} onChange={(e) => setNeed(e.target.value)}>
                {NEEDS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>{" "}
              <label className="sr-only" htmlFor="o-when">
                When
              </label>
              <select id="o-when" className="slip-in slip-sel" value={when} onChange={(e) => setWhen(e.target.value)}>
                {WHEN.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
              . It has to{" "}
              <label className="sr-only" htmlFor="o-must">
                What it has to do
              </label>
              <input id="o-must" className="slip-in slip-wide" value={must} onChange={(e) => setMust(e.target.value)} placeholder="run offline on a four-year-old laptop" maxLength={300} />.
            </p>
            <div className="slip-actions">
              <button type="submit" className="press" disabled={!ready}>
                Place the order
              </button>
              <button
                type="button"
                className="press"
                data-tone="paper"
                onClick={async () => {
                  play("key");
                  toast((await copyText(SITE.email)) ? `Copied ${SITE.email}` : `It’s ${SITE.email}`);
                }}
              >
                Copy the address
              </button>
            </div>
            <p className="small slip-help">{ready ? "Opens your mail app with the receipt as the email." : "Add your name and what it has to do to place the order."}</p>
          </form>

          <ul className="elsewhere" aria-label="Elsewhere">
            {[
              { l: "Email", h: `mailto:${SITE.email}`, d: SITE.email },
              { l: "GitHub", h: SITE.github, d: "VED2107" },
              { l: "LinkedIn", h: SITE.linkedin, d: "ved-chauhan2107" },
              { l: "SNOWBROS", h: SITE.studioUrl, d: "snowbros.me" },
            ].map((x) => (
              <li key={x.l}>
                <a href={x.h} target={x.h.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer" className="elsewhere-link">
                  <span className="pk ink-3">{x.l}</span>
                  <span>{x.d}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <figure className="receipt-paper" aria-label="Your receipt">
          <div className="rcpt">
            <p className="rcpt-head">
              VED RECORDS &amp; FILM
              <br />
              Ahmedabad · est. 2024
            </p>
            <p className="rcpt-line">{stamp || " "}</p>
            <p className="rcpt-rule">--------------------------------</p>
            {browsed.length ? (
              browsed.map((r) => (
                <p key={r!.slug} className="rcpt-item">
                  <span>
                    {r!.cat} {r!.title}
                  </span>
                  <span>browsed</span>
                </p>
              ))
            ) : (
              <p className="rcpt-item rcpt-empty">
                <span>Nothing pulled out yet</span>
                <span>—</span>
              </p>
            )}
            <p className="rcpt-rule">--------------------------------</p>
            <p className="rcpt-item">
              <span>SPECIAL ORDER</span>
              <span>1</span>
            </p>
            <p className="rcpt-order">
              {need}, {when}
              {who.trim() && (
                <>
                  <br />
                  for {who.trim()}
                </>
              )}
              {must.trim() && (
                <>
                  <br />
                  must {must.trim().replace(/\.$/, "")}
                </>
              )}
            </p>
            <p className="rcpt-rule">================================</p>
            <p className="rcpt-item rcpt-total">
              <span>TOTAL DUE</span>
              <span>a conversation</span>
            </p>
            <p className="rcpt-foot">
              Browsing is free. Returns are never needed.
              <br />
              {SITE.email}
            </p>
            <svg className="rcpt-bars" viewBox={`0 0 ${bars(code).reduce((a, b) => a + b, 0) + 10} 30`} aria-hidden preserveAspectRatio="none">
              {barRects(code).map((b) => (
                <rect key={b.x} x={b.x} y={0} width={b.w} height={30} />
              ))}
            </svg>
            <p className="rcpt-code cat">{code}</p>
          </div>
        </figure>
      </div>
    </section>
  );
}

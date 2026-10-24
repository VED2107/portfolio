import Link from "next/link";
import { NOW, SITE } from "@/lib/site";
import { RELEASES, equipment } from "@/lib/catalog";
import { Deck } from "./Deck";
import { PayTerminal } from "./PayTerminal";

/** Shelf talkers: the handwritten cards staff clip to the shelf. These are the principles. */
const PICKS = [
  {
    line: "Same code in, same result out.",
    see: "Snowbros Atlas",
    href: "/work/snowbros-atlas",
    rot: -2.2,
  },
  {
    line: "Money is an integer.",
    see: "Accounic",
    href: "/work/accounic",
    rot: 1.6,
  },
  {
    line: "The database decides. Clients display.",
    see: "Accounic",
    href: "/work/accounic",
    rot: -0.8,
  },
  {
    line: "Evidence or silence.",
    see: "Snowbros Atlas",
    href: "/work/snowbros-atlas",
    rot: 2.4,
  },
];

/**
 * Behind the counter. The staff badge and who runs the shop; the turntable with what's playing
 * right now and the queue stacked beside it; staff picks hanging off the shelf; and the gear rack
 * every record was made on, one rack unit per technology, its lights counting the releases.
 */
export function Counter() {
  const gear = equipment().slice(0, 16);
  const most = gear[0]?.[1] ?? 1;
  return (
    <section
      id="counter"
      className="counter grain"
      aria-labelledby="counter-title"
    >
      <div className="counter-top" aria-hidden />
      <div className="frame counter-grid">
        <div className="counter-about">
          <p className="pk ink-3">Aisle C · Behind the counter</p>
          <h2 id="counter-title" className="h1">
            Who runs
            <br />
            the shop
          </h2>
          <div className="counter-objects">
            <div className="badge" aria-label="Staff badge">
              <span className="badge-clip" aria-hidden />
              <span className="pk badge-role">Owner · Engineer</span>
              <span className="badge-name display">Ved</span>
              <span className="badge-ask small">
                Ask me about Rust, Postgres, and anything that handles money.
              </span>
              <span className="badge-strip pk" aria-hidden>
                Staff · since 2024
              </span>
            </div>
            <PayTerminal />
          </div>
          <p className="counter-text">
            I&rsquo;m Ved S. Chauhan, a software engineer in Ahmedabad. I study
            computer engineering at U.V. Patel College of Engineering and run{" "}
            <a
              className="ink-link"
              href={SITE.studioUrl}
              target="_blank"
              rel="noreferrer"
            >
              SNOWBROS
            </a>
            , a small software studio. I ship systems end to end, from the
            schema and its access rules to the native binary and the pipeline
            that releases it.
          </p>
          <p className="counter-text ink-2">
            I like software that can explain itself: a balance you can trace, a
            finding that shows its evidence, a till that never loses a paisa.
          </p>
          <p className="counter-also small">
            Also on the rota: Secretary, IEEE GUNI Student Branch · Visual Lead,
            GDG On Campus Ganpat University.
          </p>
          <div className="counter-links">
            <a
              className="press"
              href={SITE.resume}
              target="_blank"
              rel="noreferrer"
            >
              Résumé, PDF
            </a>
            <a
              className="ink-link"
              href={SITE.github}
              target="_blank"
              rel="noreferrer"
            >
              github.com/{SITE.githubHandle}
            </a>
          </div>
        </div>

        <div className="counter-side">
          <Deck rows={NOW.rows} updated={NOW.updated} lead={RELEASES[0]} />
          {/* Staff picks hang off the shelf edge on clips. */}
          <div className="picks" aria-labelledby="picks-title">
            <h3 id="picks-title" className="pk ink-2">
              Staff picks
            </h3>
            <div className="picks-ledge" aria-hidden />
            <ul className="picks-row">
              {PICKS.map((p) => (
                <li
                  key={p.line}
                  className="talker"
                  style={{ "--rot": `${p.rot}deg` } as React.CSSProperties}
                >
                  <span className="talker-clip" aria-hidden />
                  <p className="talker-line">{p.line}</p>
                  <p className="talker-see small">
                    Heard on{" "}
                    <Link href={p.href} className="ink-link">
                      {p.see}
                    </Link>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* The gear rack: one unit per technology; the lights count the releases it's on. */}
      <div className="frame gear" aria-labelledby="gear-title">
        <div className="gear-head">
          <h3 id="gear-title" className="h2">
            The gear rack
          </h3>
          <p className="small gear-note">
            What the records were made on, counted from their credits. Each
            light is a release the unit played on.
          </p>
        </div>
        <ul className="rack">
          {gear.map(([name, n]) => (
            <li key={name} className="rack-unit">
              <span className="rack-screw" aria-hidden />
              <span className="rack-name">{name}</span>
              <span className="rack-leds" aria-hidden>
                {Array.from({ length: most }, (_, i) => (
                  <i key={i} data-on={i < n || undefined} />
                ))}
              </span>
              <span className="rack-count cat">
                {n} {n === 1 ? "release" : "releases"}
              </span>
              <span className="rack-screw" aria-hidden />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

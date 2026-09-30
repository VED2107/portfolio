import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Activity as Data } from "@/lib/github";
import { SITE } from "@/lib/site";
import { DrawOnView } from "./DrawOnView";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ago(iso: string) {
  const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? "a month ago" : `${months} months ago`;
}

/** A year of work drawn as a trace, week by week. Not the green grid. */
function Trace({ weeks }: { weeks: { start: string; count: number }[] }) {
  const W = 720;
  const H = 150;
  const max = Math.max(1, ...weeks.map((w) => w.count));
  const step = W / weeks.length;
  const busiest = weeks.reduce((a, b) => (b.count > a.count ? b : a), weeks[0]);
  const ticks = weeks
    .map((w, i) => ({ i, d: new Date(w.start) }))
    .filter(({ i, d }) => i > 2 && d.getUTCDate() <= 7);

  return (
    <DrawOnView>
      <svg viewBox={`0 0 ${W} ${H + 28}`} className="block h-auto w-full overflow-visible" role="img" aria-label={`Weekly contributions over the last year. Busiest week: ${busiest.count} contributions, week of ${busiest.start}.`}>
        <line x1={0} y1={H} x2={W} y2={H} className="d-line" pathLength={1} />
        {weeks.map((w, i) => {
          const h = w.count === 0 ? 0 : Math.max(2, (w.count / max) * (H - 8));
          const on = w === busiest;
          return (
            <g key={w.start}>
              <title>{`Week of ${w.start}: ${w.count} contributions`}</title>
              <rect
                x={i * step + 2}
                y={H - h}
                width={Math.max(2, step - 4)}
                height={h}
                className="bar"
                style={{ "--i": i * 0.25, fill: on ? "var(--accent)" : "var(--ink)" } as React.CSSProperties}
              />
            </g>
          );
        })}
        {ticks.map(({ i, d }) => (
          <text key={i} x={i * step} y={H + 20} className="d-num draw-fade">
            {MONTHS[d.getUTCMonth()]}
          </text>
        ))}
      </svg>
    </DrawOnView>
  );
}

export function Activity({ data }: { data: Data | null }) {
  if (!data) {
    return (
      <p className="t-body">
        Live activity is unavailable right now. The record is on{" "}
        <a className="link" href={SITE.github}>
          GitHub
        </a>
        .
      </p>
    );
  }

  const stats = data.year
    ? [
        { v: data.year.total.toLocaleString("en-US"), l: "contributions, last 12 months" },
        { v: data.year.commits.toLocaleString("en-US"), l: "commits" },
        { v: String(data.publicRepos), l: "public repositories" },
      ]
    : [{ v: String(data.publicRepos), l: "public repositories" }];

  return (
    <div className="grid gap-10">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.l} className="flex flex-col-reverse justify-end gap-1">
            <dt className="t-small">{s.l}</dt>
            <dd className="text-[clamp(2rem,1.4rem+2vw,3rem)] font-extrabold leading-none tracking-[-0.03em] [font-stretch:118%]">{s.v}</dd>
          </div>
        ))}
      </dl>

      {data.year && data.year.weeks.length > 0 && <Trace weeks={data.year.weeks} />}

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h4 className="t-h3 mb-3">Languages, by repository</h4>
          <div className="flex h-3 w-full gap-[3px]" aria-hidden>
            {data.languages.map((l, i) => (
              <span key={l.name} style={{ width: `${l.share * 100}%`, background: i === 0 ? "var(--ink)" : `color-mix(in srgb, var(--ink) ${Math.max(18, 78 - i * 14)}%, var(--paper))` }} />
            ))}
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[0.93rem]">
            {data.languages.map((l) => (
              <li key={l.name} className="flex justify-between gap-2">
                <span>{l.name}</span>
                <span className="ref">{Math.round(l.share * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="t-h3 mb-3">Recently pushed</h4>
          <ul className="grid">
            {data.recent.map((r) => (
              <li key={r.name}>
                <a href={r.url} target="_blank" rel="noreferrer" className="group flex items-baseline justify-between gap-3 border-b border-[var(--rule-soft)] py-2 no-underline">
                  <span className="font-mono text-[0.88rem] transition-colors duration-200 group-hover:text-[var(--accent)]">{r.name}</span>
                  <span className="t-small flex items-center gap-1.5 whitespace-nowrap">
                    {r.language ?? ""} {r.language ? "·" : ""} {ago(r.pushedAt)}
                    <ArrowUpRight size={13} aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

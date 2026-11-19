import Link from "next/link";
import { getFiling, storyOf } from "@/lib/content";
import { Notes } from "./Notes";
import { STAGE_ALT, STAGE_CLASS, StageArt } from "./Stage";

/**
 * One project: a dominant image composition, then a two-part caption (title, plain benefit) and
 * quiet metadata. The whole card is one link with a meaningful name; nothing interactive nests in it.
 */
export function Feature({ slug, priority, headingLevel = 3, index, total }: { slug: string; priority?: boolean; headingLevel?: 2 | 3; index?: number; total?: number }) {
  const f = getFiling(slug)!;
  const s = storyOf(slug);
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="feature" data-reveal>
      <Link href={`/work/${slug}`} className="feature-link" aria-label={`${f.title}: ${s.headline}. Read the case study.`}>
        <div className={`stage ${STAGE_CLASS[slug] ?? ""}`}>
          <div className="stage-inner" role="img" aria-label={STAGE_ALT[slug]}>
            <StageArt slug={slug} priority={priority} />
          </div>
          <Notes slug={slug} />
        </div>
        <div className="caption">
          <H className="caption-title">
            {f.title} <span className="ar" aria-hidden>→</span>
          </H>
          <p className="caption-benefit">{s.headline}.</p>
          <div className="caption-meta">
            {index !== undefined && total !== undefined && (
              <span className="t-meta caption-index" aria-hidden>
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            )}
            <span className="t-meta">{f.field}</span>
            <span className="t-meta" style={{ color: "var(--ink-3)" }}>
              {s.period}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

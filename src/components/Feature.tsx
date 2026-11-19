import Link from "next/link";
import { getFiling, storyOf } from "@/lib/content";
import { STAGE_ALT, STAGE_CLASS, StageArt } from "./Stage";

/**
 * One project: a dominant image composition, then a two-part caption (title, plain benefit) and
 * quiet metadata. The whole card is one link with a meaningful name; nothing interactive nests in it.
 */
export function Feature({ slug, priority, headingLevel = 3 }: { slug: string; priority?: boolean; headingLevel?: 2 | 3 }) {
  const f = getFiling(slug)!;
  const s = storyOf(slug);
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="feature" data-reveal>
      <Link href={`/work/${slug}`} className="feature-link" aria-label={`${f.title}: ${s.headline}. Read the case study.`}>
        <div className={`stage ${STAGE_CLASS[slug] ?? ""}`} role="img" aria-label={STAGE_ALT[slug]}>
          <div className="stage-inner">
            <StageArt slug={slug} priority={priority} />
          </div>
        </div>
        <div className="caption">
          <H className="caption-title">
            {f.title} <span className="ar" aria-hidden>→</span>
          </H>
          <p className="caption-benefit">{s.headline}.</p>
          <div className="caption-meta">
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

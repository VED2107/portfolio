import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/CaseStudy";
import { QuickFooter, QuickHeader } from "@/components/QuickChrome";
import { ALL_RECORDS, FILINGS, SITE, getFiling, proofOf } from "@/lib/content";

export function generateStaticParams() {
  return FILINGS.map((f) => ({ slug: f.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const f = getFiling(slug);
  if (!f) notFound();
  const image = `/api/og?slug=${encodeURIComponent(f.slug)}`;
  return {
    title: f.title,
    description: f.short,
    alternates: { canonical: `/work/${f.slug}` },
    openGraph: {
      type: "article",
      url: `/work/${f.slug}`,
      title: f.title,
      description: f.short,
      images: [{ url: image, width: 1200, height: 630, alt: f.title }],
    },
    twitter: { card: "summary_large_image", title: f.title, description: f.short, images: [image] },
  };
}

export default async function WorkPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const f = getFiling(slug);
  if (!f) notFound();
  const next = getFiling(ALL_RECORDS[(ALL_RECORDS.indexOf(slug) + 1) % ALL_RECORDS.length]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: f.title,
    description: f.short,
    author: { "@type": "Person", name: SITE.person },
    url: `${SITE.url}/work/${f.slug}`,
  };

  return (
    <>
      <QuickHeader />
      <main id="main" className="case-page">
        <div className="wrap">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/quick#work" className="back">← All records</Link>
            <Link href={`/?at=${slug}`} className="btn">Open it in the store</Link>
          </div>
          <div className="case-body"><CaseStudy f={f} proof={proofOf(slug) ?? null} headingLevel={1} /></div>
          {next && <nav className="case-next" aria-label="Next record"><Link href={`/work/${next.slug}`} className="link">Next record: {next.title}</Link></nav>}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        </div>
      </main>
      <QuickFooter />
    </>
  );
}

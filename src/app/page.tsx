import type { Metadata } from "next";
import { Explore } from "@/components/store/Explore";
import SNAPSHOT from "@/lib/github-snapshot.json";
import { album, awardPhoto, awardPhotos } from "@/lib/photos";
import { ALL_RECORDS, ARCHIVE, CRATE, DISCOGRAPHY, FILINGS, HONORS, SITE, STATUS, WALL, getFiling, proofOf, studio, ABOUT, EDUCATION, ROLES } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * The store. The server sends the front door, readable and linkable on its own: who this is, a
 * way straight to Quick View, and a directory of every record. The 3D shop loads behind it.
 */
export default function Home() {
  const titles = Object.fromEntries(FILINGS.map((f) => [f.slug, f.title]));
  const records = ALL_RECORDS.map((s) => getFiling(s)!).filter(Boolean);
  return (
    <Explore
      world={{
        wall: WALL,
        crate: CRATE,
        titles,
        arcade: ARCHIVE.map((a) => a.title),
        releases: DISCOGRAPHY.map((d) => ({ when: d.when, title: d.title, slug: d.slug })),
        honors: HONORS.map((h) => ({ title: h.title, by: h.by, when: h.when, photo: awardPhoto(h.id)?.src })),
      }}
      records={records}
      proofs={Object.fromEntries(records.map((f) => [f.slug, proofOf(f.slug) ?? null]))}
      archive={ARCHIVE}
      discography={DISCOGRAPHY}
      honors={HONORS}
      studio={studio()}
      about={ABOUT}
      education={EDUCATION}
      roles={ROLES}
      site={SITE}
      status={STATUS}
      photos={{ awards: Object.fromEntries(HONORS.map((h) => [h.id, awardPhotos(h.id)])), album: album() }}
      pressing={[...SNAPSHOT.repos]
        .sort((a, b) => a.pushed.localeCompare(b.pushed))
        .map((r) => ({ name: r.name, language: r.language, size: Object.values(r.languages ?? {}).reduce((a: number, b) => a + Number(b), 0) }))}
    />
  );
}

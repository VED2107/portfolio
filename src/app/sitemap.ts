import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { FILINGS } from "@/lib/work";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: "weekly", priority: 1 },
    ...FILINGS.map((f) => ({ url: `${SITE.url}/work/${f.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}

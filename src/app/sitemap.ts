import type { MetadataRoute } from "next";
import { FILINGS, SITE } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, priority: 1 },
    { url: `${SITE.url}/quick`, priority: 0.9 },
    ...FILINGS.map((f) => ({ url: `${SITE.url}/work/${f.slug}`, priority: 0.8 })),
  ];
}

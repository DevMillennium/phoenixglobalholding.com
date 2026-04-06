import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl, localizedPath } from "@/lib/site-config";

const staticPaths = ["/", "/privacy", "/terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      const locPath = localizedPath(locale, path);
      entries.push({
        url: `${baseUrl}${locPath === "/" ? "/" : locPath}`,
        lastModified: new Date(),
        changeFrequency: path === "/" ? "monthly" : "yearly",
        priority: path === "/" ? 1 : 0.5,
      });
    }
  }

  return entries;
}

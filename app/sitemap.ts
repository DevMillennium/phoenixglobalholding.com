import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { DIVISION_SLUGS } from "@/lib/divisions";
import { getSiteUrl, localizedPath } from "@/lib/site-config";

const staticPaths = [
  "/",
  "/privacy",
  "/terms",
  "/contact",
  ...DIVISION_SLUGS.map((slug) => `/divisions/${slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      const locPath = localizedPath(locale, path);
      entries.push({
        url: `${baseUrl}${locPath === "/" ? "/" : locPath}`,
        lastModified: new Date(),
        changeFrequency: path === "/" ? "monthly" : "weekly",
        priority:
          path === "/"
            ? 1
            : path === "/contact"
              ? 0.9
              : path.startsWith("/divisions/")
                ? 0.85
                : 0.5,
      });
    }
  }

  return entries;
}

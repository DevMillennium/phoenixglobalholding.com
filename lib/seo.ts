import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl, localizedPath } from "@/lib/site-config";

/** Mapa `hreflang` alinhado a `localePrefix: as-needed` (locale por defeito sem prefixo). */
export function hreflangAlternates(path: string): Record<string, string> {
  const normalized =
    path === "" || path === "/"
      ? "/"
      : path.startsWith("/")
        ? path
        : `/${path}`;
  const out: Record<string, string> = {};
  for (const loc of routing.locales) {
    out[loc] = localizedPath(loc, normalized === "/" ? "/" : normalized);
  }
  return out;
}

export function absolutePageUrl(locale: string, path: string): string {
  const base = getSiteUrl();
  const p = localizedPath(
    locale,
    path === "" || path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`,
  );
  if (p === "/") return `${base}/`;
  return `${base}${p}`;
}

/** Open Graph e Twitter alinhados; `og:image` vem de `opengraph-image.tsx` no segmento `[locale]`. */
export function socialMetadata(input: {
  title: string;
  description: string;
  locale: string;
  /** Caminho lógico sem domínio (ex.: `/`, `/contact`, `/divisions/import-export`). */
  path: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const url = absolutePageUrl(input.locale, input.path);
  return {
    openGraph: {
      title: input.title,
      description: input.description,
      type: "website",
      url,
      locale: input.locale,
      siteName: "Phoenix Global Holding",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  };
}

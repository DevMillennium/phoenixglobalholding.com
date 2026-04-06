import { getSiteUrl } from "@/lib/site-config";

type Item = { name: string; path: string };

/** Schema.org BreadcrumbList com URLs absolutas. */
export function BreadcrumbJsonLd({ items }: { items: Item[] }) {
  const base = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => {
      const path = it.path.startsWith("/") ? it.path : `/${it.path}`;
      const url = path === "/" ? `${base}/` : `${base}${path}`;
      return {
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        item: url,
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

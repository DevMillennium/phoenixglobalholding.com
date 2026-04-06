import { getSiteUrl } from "@/lib/site-config";

export function WebsiteJsonLd() {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Phoenix Global Holding",
    url,
    description:
      "Grupo empresarial internacional con sede en Paraguay: comercio internacional, tecnología y estructuración corporativa.",
    publisher: {
      "@type": "Organization",
      name: "Phoenix Global Holding",
      url,
    },
    inLanguage: ["es", "pt", "en"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

import { getTranslations } from "next-intl/server";
import { getSiteUrl } from "@/lib/site-config";

export async function WebsiteJsonLd({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "JsonLd" });
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Phoenix Global Holding",
    url,
    description: t("webSiteDescription"),
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

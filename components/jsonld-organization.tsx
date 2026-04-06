import { getTranslations } from "next-intl/server";
import { getSiteUrl } from "@/lib/site-config";

type Props = { locale: string };

export async function JsonLdOrganization({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "JsonLd" });
  const url = getSiteUrl();

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Phoenix Global Holding",
    description: t("organizationDescription"),
    url,
    address: {
      "@type": "PostalAddress",
      addressCountry: "PY",
    },
    subOrganization: [
      { "@type": "Organization", name: "Phoenix Global Import and Export" },
      { "@type": "Organization", name: "Phoenix Global Developer" },
      { "@type": "Organization", name: "Phoenix Global Enterprise Solution" },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

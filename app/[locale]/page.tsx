import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AboutSection } from "@/components/sections/about-section";
import { ContactSection } from "@/components/sections/contact-section";
import { DeveloperSection } from "@/components/sections/developer-section";
import { EnterpriseSolutionSection } from "@/components/sections/enterprise-solution-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ImportExportSection } from "@/components/sections/import-export-section";
import { IntegrationSection } from "@/components/sections/integration-section";
import { VisionSection } from "@/components/sections/vision-section";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const baseUrl = getSiteUrl();

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical:
        locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: {
        es: "/",
        pt: "/pt",
        en: "/en",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale,
      type: "website",
      url: baseUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Phoenix Global Holding",
    description:
      "Grupo empresarial internacional: comercio internacional, tecnología, innovación digital y estructuración corporativa en Paraguay.",
    url: getSiteUrl(),
    address: {
      "@type": "PostalAddress",
      addressCountry: "PY",
    },
    subOrganization: [
      {
        "@type": "Organization",
        name: "Phoenix Global Import and Export",
      },
      {
        "@type": "Organization",
        name: "Phoenix Global Developer",
      },
      {
        "@type": "Organization",
        name: "Phoenix Global Enterprise Solution",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <ImportExportSection />
        <DeveloperSection />
        <EnterpriseSolutionSection />
        <IntegrationSection />
        <VisionSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}

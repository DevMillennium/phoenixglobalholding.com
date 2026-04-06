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
import { JsonLdOrganization } from "@/components/jsonld-organization";
import { PartnersStrip } from "@/components/partners-strip";
import { WebsiteJsonLd } from "@/components/website-jsonld";
import { routing } from "@/i18n/routing";
import { hreflangAlternates, socialMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const path = locale === routing.defaultLocale ? "/" : `/${locale}`;
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: t("keywords"),
    alternates: {
      canonical: path,
      languages: hreflangAlternates("/"),
    },
    ...socialMetadata({
      title,
      description,
      locale,
      path: "/",
    }),
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <JsonLdOrganization locale={locale} />
      <WebsiteJsonLd locale={locale} />
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 scroll-mt-20 outline-none"
      >
        <HeroSection />
        <AboutSection />
        <ImportExportSection />
        <DeveloperSection />
        <EnterpriseSolutionSection />
        <IntegrationSection />
        <VisionSection />
        <PartnersStrip />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}

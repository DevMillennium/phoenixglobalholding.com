import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LegalDocument } from "@/components/legal-document";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl, localizedPath } from "@/lib/site-config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LegalTerms" });
  const baseUrl = getSiteUrl();
  const path = localizedPath(locale, "/terms");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: path,
      languages: {
        es: "/terms",
        pt: "/pt/terms",
        en: "/en/terms",
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
      url: `${baseUrl}${path === "/" ? "" : path}`,
    },
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const b = await getTranslations("Breadcrumb");
  const f = await getTranslations("Footer");

  return (
    <>
      <SiteHeader />
      <Breadcrumbs
        items={[
          { label: b("home"), href: "/" },
          { label: f("terms") },
        ]}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 scroll-mt-20 outline-none"
      >
        <LegalDocument namespace="LegalTerms" />
      </main>
      <SiteFooter />
    </>
  );
}

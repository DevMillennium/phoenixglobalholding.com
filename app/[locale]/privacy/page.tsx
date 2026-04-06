import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl, localizedPath } from "@/lib/site-config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LegalPrivacy" });
  const baseUrl = getSiteUrl();
  const path = localizedPath(locale, "/privacy");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: path,
      languages: {
        es: "/privacy",
        pt: "/pt/privacy",
        en: "/en/privacy",
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

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <LegalDocument namespace="LegalPrivacy" />
      </main>
      <SiteFooter />
    </>
  );
}

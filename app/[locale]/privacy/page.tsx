import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LegalDocument } from "@/components/legal-document";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { localizedPath } from "@/lib/site-config";
import { hreflangAlternates, socialMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LegalPrivacy" });
  const path = localizedPath(locale, "/privacy");
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: hreflangAlternates("/privacy"),
    },
    robots: { index: true, follow: true },
    ...socialMetadata({
      title,
      description,
      locale,
      path: "/privacy",
    }),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const b = await getTranslations("Breadcrumb");
  const f = await getTranslations("Footer");
  const homePath = localizedPath(locale, "/");
  const privacyPath = localizedPath(locale, "/privacy");

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: b("home"), path: homePath },
          { name: f("privacy"), path: privacyPath },
        ]}
      />
      <SiteHeader />
      <Breadcrumbs
        items={[
          { label: b("home"), href: "/" },
          { label: f("privacy") },
        ]}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 scroll-mt-20 outline-none"
      >
        <LegalDocument namespace="LegalPrivacy" />
      </main>
      <SiteFooter />
    </>
  );
}

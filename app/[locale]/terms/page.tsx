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
  const t = await getTranslations({ locale, namespace: "LegalTerms" });
  const path = localizedPath(locale, "/terms");
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: hreflangAlternates("/terms"),
    },
    robots: { index: true, follow: true },
    ...socialMetadata({
      title,
      description,
      locale,
      path: "/terms",
    }),
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const b = await getTranslations("Breadcrumb");
  const f = await getTranslations("Footer");
  const homePath = localizedPath(locale, "/");
  const termsPath = localizedPath(locale, "/terms");

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: b("home"), path: homePath },
          { name: f("terms"), path: termsPath },
        ]}
      />
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

import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DivisionDetail } from "@/components/division-detail";
import { DeveloperDivisionPage } from "@/components/divisions/developer/developer-division-page";
import { ImportExportDivisionPage } from "@/components/divisions/import-export/import-export-division-page";
import { EnterpriseDivisionPage } from "@/components/divisions/enterprise/enterprise-division-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";
import {
  DIVISION_SLUGS,
  divisionNamespace,
  isDivisionSlug,
  type DivisionSlug,
} from "@/lib/divisions";
import { localizedPath } from "@/lib/site-config";
import { hreflangAlternates, socialMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const out: { locale: string; slug: DivisionSlug }[] = [];
  for (const locale of routing.locales) {
    for (const slug of DIVISION_SLUGS) {
      out.push({ locale, slug });
    }
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isDivisionSlug(slug)) return {};
  const ns = divisionNamespace[slug];
  const t = await getTranslations({ locale, namespace: ns });
  const path = localizedPath(locale, `/divisions/${slug}`);
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: hreflangAlternates(`/divisions/${slug}`),
    },
    ...socialMetadata({
      title,
      description,
      locale,
      path: `/divisions/${slug}`,
    }),
    robots: { index: true, follow: true },
  };
}

export default async function DivisionPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isDivisionSlug(slug)) notFound();

  setRequestLocale(locale);
  const ns = divisionNamespace[slug];
  const b = await getTranslations("Breadcrumb");
  const nav = await getTranslations("Nav");

  const divisionLabel =
    slug === "import-export"
      ? nav("divisionImport")
      : slug === "developer"
        ? nav("divisionDeveloper")
        : nav("divisionEnterprise");

  const homePath = localizedPath(locale, "/");
  const divisionUrlPath = localizedPath(locale, `/divisions/${slug}`);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: b("home"), path: homePath },
          { name: divisionLabel, path: divisionUrlPath },
        ]}
      />
      <SiteHeader />
      <Breadcrumbs
        items={[
          { label: b("home"), href: "/" },
          { label: nav("divisionsMenu") },
          { label: divisionLabel },
        ]}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 scroll-mt-20 outline-none"
      >
        {slug === "developer" ? (
          <DeveloperDivisionPage />
        ) : slug === "import-export" ? (
          <ImportExportDivisionPage />
        ) : slug === "enterprise-solution" ? (
          <EnterpriseDivisionPage />
        ) : (
          <DivisionDetail namespace={ns} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}

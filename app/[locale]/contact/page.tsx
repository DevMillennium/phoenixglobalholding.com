import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { localizedPath } from "@/lib/site-config";
import { hreflangAlternates, socialMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContactPage" });
  const path = localizedPath(locale, "/contact");
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: hreflangAlternates("/contact"),
    },
    ...socialMetadata({
      title,
      description,
      locale,
      path: "/contact",
    }),
    robots: { index: true, follow: true },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ContactPage");
  const b = await getTranslations("Breadcrumb");
  const nav = await getTranslations("Nav");

  const homePath = localizedPath(locale, "/");
  const contactPath = localizedPath(locale, "/contact");

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: b("home"), path: homePath },
          { name: nav("contactPage"), path: contactPath },
        ]}
      />
      <SiteHeader />
      <Breadcrumbs
        items={[
          { label: b("home"), href: "/" },
          { label: nav("contactPage") },
        ]}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 scroll-mt-20 outline-none"
      >
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-32">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{t("subtitle")}</p>
          <p className="mt-3 text-sm text-muted">{t("sla")}</p>
          <div className="mt-10 max-w-xl">
            <ContactForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

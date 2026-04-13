import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Outfit, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { AppShell } from "@/components/app-shell";
import { LocaleHtmlLang } from "@/components/locale-html-lang";
import { getSiteUrl } from "@/lib/site-config";
import type { Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
};

export const viewport: Viewport = {
  themeColor: "#07080c",
  width: "device-width",
  initialScale: 1,
};

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <div
      className={`${outfit.variable} ${playfair.variable} h-full antialiased`}
    >
      <div
        className={`${outfit.className} flex min-h-full flex-col bg-background pb-24 text-foreground md:pb-0`}
      >
        <NextIntlClientProvider messages={messages}>
          <LocaleHtmlLang />
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
      </div>
    </div>
  );
}

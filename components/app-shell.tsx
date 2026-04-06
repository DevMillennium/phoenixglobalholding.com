"use client";

import { CookieBanner } from "@/components/cookie-banner";
import { ConsentProvider } from "@/components/consent-context";
import { GoogleAnalytics } from "@/components/google-analytics";
import { SkipLink } from "@/components/skip-link";
import { StickyCta } from "@/components/sticky-cta";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <SkipLink />
      {children}
      <StickyCta />
      <CookieBanner />
      <GoogleAnalytics />
    </ConsentProvider>
  );
}

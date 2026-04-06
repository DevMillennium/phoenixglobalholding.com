"use client";

import Script from "next/script";
import { useConsent } from "@/components/consent-context";

/** Só carrega se o utilizador aceitar cookies e existir NEXT_PUBLIC_GA_MEASUREMENT_ID. */
export function GoogleAnalytics() {
  const { consent } = useConsent();
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  if (consent !== "accepted" || !id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}

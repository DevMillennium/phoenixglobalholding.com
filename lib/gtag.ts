"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

import { collectAnalyticsEvent } from "@/lib/analytics-client";

/** Dispara evento GA4 só se `gtag` estiver disponível (cookies aceites + script carregado). */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;

  const locale =
    typeof params?.page_locale === "string"
      ? params.page_locale
      : undefined;

  collectAnalyticsEvent({
    type: "click",
    name: eventName,
    path: window.location.pathname,
    locale,
    payload: params as Record<string, unknown>,
  });

  if (typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", eventName, params ?? {});
}

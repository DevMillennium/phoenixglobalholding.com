declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Dispara evento GA4 só se `gtag` estiver disponível (cookies aceites + script carregado). */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", eventName, params ?? {});
}

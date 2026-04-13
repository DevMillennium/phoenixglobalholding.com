"use client";

function visitorKey(): string {
  if (typeof window === "undefined") return "";
  try {
    let k = localStorage.getItem("phx_vid");
    if (!k) {
      k =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("phx_vid", k);
    }
    return k;
  } catch {
    return "";
  }
}

export function collectAnalyticsEvent(args: {
  type: "page_view" | "click" | "conversion" | "custom";
  name: string;
  path?: string;
  locale?: string;
  payload?: Record<string, unknown>;
}): void {
  if (typeof window === "undefined") return;
  const body = {
    type: args.type,
    name: args.name,
    path: args.path ?? window.location.pathname,
    locale: args.locale,
    visitorKey: visitorKey() || undefined,
    payload: args.payload,
  };
  fetch("/api/analytics/collect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    /* silencioso */
  });
}

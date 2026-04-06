"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useConsent } from "@/components/consent-context";

export function CookieBanner() {
  const t = useTranslations("CookieBanner");
  const { consent, accept, reject } = useConsent();

  if (consent !== null) return null;

  return (
    <div
      className="fixed inset-x-4 bottom-24 z-50 max-w-lg rounded-2xl border border-border bg-surface-elevated p-4 shadow-2xl shadow-black/40 md:bottom-6 md:left-auto md:right-6"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <h2
        id="cookie-banner-title"
        className="font-display text-base font-semibold text-foreground"
      >
        {t("title")}
      </h2>
      <p
        id="cookie-banner-desc"
        className="mt-2 text-sm leading-relaxed text-muted"
      >
        {t("description")}{" "}
        <Link href="/privacy" className="text-accent underline-offset-2 hover:underline">
          {t("privacyLink")}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={accept}
          className="focus-ring rounded-full bg-accent px-4 py-2 text-sm font-semibold text-[#07080c]"
        >
          {t("accept")}
        </button>
        <button
          type="button"
          onClick={reject}
          className="focus-ring rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground"
        >
          {t("reject")}
        </button>
      </div>
    </div>
  );
}

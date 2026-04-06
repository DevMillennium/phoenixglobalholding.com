"use client";

import { useTranslations } from "next-intl";
import { TrackedLink } from "@/components/tracked-link";

/** Barra fixa em mobile com CTA principal para página de contacto. */
export function StickyCta() {
  const t = useTranslations("StickyCta");

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-md md:hidden"
      role="region"
      aria-label={t("aria")}
    >
      <TrackedLink
        href="/contact"
        eventName="sticky_cta_contact"
        eventParams={{ placement: "mobile_footer" }}
        className="focus-ring flex w-full items-center justify-center rounded-full bg-accent py-3.5 text-center text-sm font-semibold text-[#07080c] shadow-lg shadow-accent/25"
      >
        {t("label")}
      </TrackedLink>
    </div>
  );
}

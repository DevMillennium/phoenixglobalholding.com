"use client";

import { useTranslations } from "next-intl";

export function SkipLink() {
  const t = useTranslations("SkipLink");

  return (
    <a
      href="#main-content"
      className="focus-ring sr-only left-4 top-4 z-[100] rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#07080c] focus:not-sr-only focus:absolute focus:inline-block"
    >
      {t("label")}
    </a>
  );
}

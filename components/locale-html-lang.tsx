"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/** Sincroniza <html lang> com o locale atual (layout [locale] não envolve <html>). */
export function LocaleHtmlLang() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

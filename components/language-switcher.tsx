"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Languages");

  return (
    <div
      className={cn(
        "flex rounded-lg border border-border bg-surface-elevated p-0.5",
        className,
      )}
      role="group"
      aria-label="Idioma"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          className={cn(
            "focus-ring rounded-md px-2.5 py-1.5 text-xs font-semibold tracking-wide transition-colors",
            locale === l
              ? "bg-accent text-[#07080c] shadow-sm"
              : "text-muted hover:bg-white/5 hover:text-foreground",
          )}
        >
          {t(l)}
        </button>
      ))}
    </div>
  );
}

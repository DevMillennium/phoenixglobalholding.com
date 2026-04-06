"use client";

import { useTranslations } from "next-intl";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";

const sectionLinks = [
  { href: "/#group", key: "group" as const },
  { href: "/#integration", key: "integration" as const },
  { href: "/#vision", key: "vision" as const },
] as const;

const divisionRoutes = [
  { href: "/divisions/import-export", key: "divisionImport" as const },
  { href: "/divisions/developer", key: "divisionDeveloper" as const },
  {
    href: "/divisions/enterprise-solution",
    key: "divisionEnterprise" as const,
  },
] as const;

export function SiteHeader() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="focus-ring shrink-0 rounded-md font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          Phoenix Global{" "}
          <span className="text-accent">Holding</span>
        </Link>

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label={t("mainNavAria")}
        >
          {sectionLinks.map(({ href, key }) => (
            <Link
              key={key}
              href={href}
              className="focus-ring rounded-md px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {t(key)}
            </Link>
          ))}

          <details className="group relative">
            <summary
              className="focus-ring flex cursor-pointer list-none items-center gap-1 rounded-md px-2.5 py-2 text-sm font-medium text-muted marker:hidden transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden"
              aria-haspopup="true"
            >
              {t("divisionsMenu")}
              <ChevronDown className="size-4 opacity-70 group-open:rotate-180" />
            </summary>
            <div className="absolute left-0 top-full z-50 mt-1 min-w-[220px] rounded-xl border border-border bg-surface-elevated py-2 shadow-xl">
              {divisionRoutes.map(({ href, key }) => (
                <Link
                  key={key}
                  href={href}
                  className="block px-4 py-2.5 text-sm text-foreground hover:bg-white/5"
                >
                  {t(key)}
                </Link>
              ))}
            </div>
          </details>

          <Link
            href="/#contact"
            className="focus-ring rounded-md px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            {t("contact")}
          </Link>

          <Link
            href="/contact"
            className="focus-ring ml-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-[#07080c] transition hover:bg-[#f0c65c]"
          >
            {t("contactPage")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher className="hidden sm:flex" />
          <button
            type="button"
            className="focus-ring inline-flex rounded-lg border border-border bg-surface-elevated p-2 text-foreground lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
            <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        className={cn(
          "border-t border-border bg-background lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6"
          aria-label={t("mainNavAria")}
        >
          {sectionLinks.map(({ href, key }) => (
            <Link
              key={key}
              href={href}
              className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-surface-elevated"
              onClick={() => setOpen(false)}
            >
              {t(key)}
            </Link>
          ))}
          <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-muted">
            {t("divisionsMenu")}
          </p>
          {divisionRoutes.map(({ href, key }) => (
            <Link
              key={key}
              href={href}
              className="rounded-lg px-3 py-3 pl-6 text-base font-medium text-foreground hover:bg-surface-elevated"
              onClick={() => setOpen(false)}
            >
              {t(key)}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-surface-elevated"
            onClick={() => setOpen(false)}
          >
            {t("contact")}
          </Link>
          <Link
            href="/contact"
            className="mx-3 mt-2 rounded-full bg-accent py-3 text-center text-sm font-semibold text-[#07080c]"
            onClick={() => setOpen(false)}
          >
            {t("contactPage")}
          </Link>
          <div className="pt-2">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}

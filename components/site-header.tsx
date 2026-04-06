"use client";

import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";

const navKeys = [
  { href: "#group", key: "group" as const },
  { href: "#import-export", key: "importExport" as const },
  { href: "#developer", key: "developer" as const },
  { href: "#integration", key: "integration" as const },
  { href: "#vision", key: "vision" as const },
  { href: "#contact", key: "contact" as const },
];

export function SiteHeader() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="focus-ring shrink-0 rounded-md font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          Phoenix Global{" "}
          <span className="text-accent">Holding</span>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Principal"
        >
          {navKeys.map(({ href, key }) => (
            <a
              key={key}
              href={href}
              className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {t(key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
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
          aria-label="Principal móvel"
        >
          {navKeys.map(({ href, key }) => (
            <a
              key={key}
              href={href}
              className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-surface-elevated"
              onClick={() => setOpen(false)}
            >
              {t(key)}
            </a>
          ))}
          <div className="pt-2">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}

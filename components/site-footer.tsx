import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div>
          <p className="font-display text-lg font-semibold text-foreground">
            Phoenix Global Holding
          </p>
          <p className="mt-1 text-sm text-muted">{t("tagline")}</p>
        </div>
        <nav
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm"
          aria-label={t("legal")}
        >
          <Link
            href="/privacy"
            className="text-muted underline-offset-4 transition hover:text-foreground hover:underline"
          >
            {t("privacy")}
          </Link>
          <Link
            href="/terms"
            className="text-muted underline-offset-4 transition hover:text-foreground hover:underline"
          >
            {t("terms")}
          </Link>
        </nav>
        <p className="text-sm text-muted lg:text-right">
          © {year} Phoenix Global Holding. {t("rights")}
        </p>
      </div>
    </footer>
  );
}

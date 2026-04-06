import { Mail, MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getContactEmail,
  getWhatsAppDisplayNumber,
  getWhatsAppHref,
} from "@/lib/site-config";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();
  const contactEmail = getContactEmail();
  const whatsappHref = getWhatsAppHref();
  const whatsappDisplay = getWhatsAppDisplayNumber();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div>
          <p className="font-display text-lg font-semibold text-foreground">
            Phoenix Global Holding
          </p>
          <p className="mt-1 text-sm text-muted">{t("tagline")}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">
            {t("contactQuick")}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <a
              href={`mailto:${contactEmail}`}
              aria-label={t("emailAria")}
              className="focus-ring inline-flex items-center gap-2 text-muted underline-offset-4 transition hover:text-foreground hover:underline"
            >
              <Mail className="size-4 shrink-0 text-accent" aria-hidden />
              <span>{contactEmail}</span>
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("whatsappAria")}
              className="focus-ring inline-flex items-center gap-2 text-muted underline-offset-4 transition hover:text-emerald-400 hover:underline"
            >
              <MessageCircle className="size-4 shrink-0 text-emerald-500" aria-hidden />
              <span className="tabular-nums">{whatsappDisplay}</span>
            </a>
          </div>
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

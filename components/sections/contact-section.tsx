import { Mail, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { getContactEmail } from "@/lib/site-config";

export async function ContactSection() {
  const t = await getTranslations("Contact");
  const contactEmail = getContactEmail();

  return (
    <section
      id="contact"
      className="scroll-mt-24 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-muted">{t("subtitle")}</p>

          <div className="mt-12 grid gap-6 rounded-2xl border border-border bg-surface-elevated p-6 sm:grid-cols-2 sm:p-8">
            <div className="flex gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent-dim text-accent">
                <Mail className="size-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {t("emailLabel")}
                </p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="focus-ring mt-1 inline-block text-base font-medium text-foreground underline-offset-4 hover:text-accent hover:underline"
                >
                  {contactEmail}
                </a>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent-blue/15 text-accent-blue">
                <MapPin className="size-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {t("locationLabel")}
                </p>
                <p className="mt-1 text-base font-medium leading-relaxed text-foreground">
                  {t("locationValue")}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10 rounded-2xl border border-accent/30 bg-accent-dim/30 p-6 sm:p-8">
            <p className="font-medium text-foreground">{t("formCta")}</p>
            <p className="mt-2 text-sm text-muted">{t("formCtaSub")}</p>
            <Link
              href="/contact"
              className="focus-ring mt-5 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[#07080c] transition hover:bg-[#f0c65c]"
            >
              {t("formButton")}
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">{t("disclaimer")}</p>
        </Reveal>
      </div>
    </section>
  );
}

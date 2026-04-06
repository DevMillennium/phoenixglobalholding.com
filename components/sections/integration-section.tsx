import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";

const itemKeys = [
  "automation",
  "platforms",
  "logistics",
  "expansion",
] as const;

export async function IntegrationSection() {
  const t = await getTranslations("Integration");

  return (
    <section
      id="integration"
      className="scroll-mt-24 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-surface-elevated via-surface to-background p-8 sm:p-12 lg:p-16">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 max-w-3xl text-lg text-muted">{t("subtitle")}</p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {itemKeys.map((key) => (
                <li
                  key={key}
                  className="flex gap-3 rounded-xl border border-border/60 bg-background/40 px-4 py-3 backdrop-blur-sm"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="text-sm leading-relaxed text-foreground sm:text-base">
                    {t(`items.${key}`)}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

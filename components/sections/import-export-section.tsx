import { Globe2, Package, Store } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";

const icons = [Package, Globe2, Store] as const;

export async function ImportExportSection() {
  const t = await getTranslations("ImportExport");

  const cards = [
    { titleKey: "importTitle" as const, descKey: "importDesc" as const, Icon: icons[0] },
    { titleKey: "exportTitle" as const, descKey: "exportDesc" as const, Icon: icons[1] },
    { titleKey: "localTitle" as const, descKey: "localDesc" as const, Icon: icons[2] },
  ];

  return (
    <section
      id="import-export"
      className="scroll-mt-24 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-blue">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-muted">{t("subtitle")}</p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map(({ titleKey, descKey, Icon }, i) => (
            <Reveal key={titleKey} delay={i * 0.08}>
              <article className="group h-full rounded-2xl border border-border bg-surface-elevated p-6 transition hover:border-accent/30 hover:shadow-lg hover:shadow-black/20 sm:p-8">
                <div className="flex size-12 items-center justify-center rounded-xl bg-accent-dim text-accent">
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
                  {t(titleKey)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  {t(descKey)}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

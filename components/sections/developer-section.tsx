import { Brain, Layers, Server } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";

export async function DeveloperSection() {
  const t = await getTranslations("Developer");

  const cards = [
    { titleKey: "aiTitle" as const, descKey: "aiDesc" as const, Icon: Brain },
    { titleKey: "appsTitle" as const, descKey: "appsDesc" as const, Icon: Layers },
    { titleKey: "infraTitle" as const, descKey: "infraDesc" as const, Icon: Server },
  ];

  return (
    <section
      id="developer"
      className="scroll-mt-24 border-t border-border bg-surface py-20 sm:py-28"
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
              <article className="h-full rounded-2xl border border-border bg-background p-6 transition hover:border-accent-blue/35 sm:p-8">
                <div className="flex size-12 items-center justify-center rounded-xl bg-accent-blue/15 text-accent-blue">
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

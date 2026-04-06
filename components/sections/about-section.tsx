import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";

export async function AboutSection() {
  const t = await getTranslations("About");

  const stats = [
    { label: t("stats.divisions"), value: t("statDivisionsValue") },
    { label: t("stats.focus"), value: t("statFocusValue") },
    { label: t("stats.reach"), value: t("statReachValue") },
  ];

  return (
    <section
      id="group"
      className="scroll-mt-24 border-t border-border bg-surface py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_280px] lg:gap-16">
            <div className="space-y-6 text-base leading-relaxed text-muted sm:text-lg">
              <p>{t("p1")}</p>
              <p>{t("p2")}</p>
            </div>
            <ul className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-elevated p-6">
              {stats.map((s) => (
                <li
                  key={s.label}
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <p className="font-display text-2xl font-semibold text-accent">
                    {s.value}
                  </p>
                  <p className="mt-1 text-sm text-muted">{s.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

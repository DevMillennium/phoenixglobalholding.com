import {
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  Globe2,
  Radio,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";

type ServiceBlock = { title: string; items: string[] };

const diffKeys = [
  "remote",
  "speed",
  "jurisdiction",
  "tax",
  "eas",
] as const;

export async function EnterpriseSolutionSection() {
  const t = await getTranslations("EnterpriseSolution");
  const valueProps = t.raw("valueProps") as string[];
  const serviceBlocks = t.raw("serviceBlocks") as ServiceBlock[];
  const audiences = t.raw("audiences") as string[];

  const icons = [Building2, BadgeCheck, Briefcase, Radio] as const;

  return (
    <section
      id="enterprise-solution"
      className="scroll-mt-24 border-t border-border bg-surface py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-jade">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 max-w-4xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-muted">{t("subtitle")}</p>

          <figure className="mt-10 rounded-2xl border border-accent-jade/25 bg-accent-jade-dim px-6 py-6 sm:px-8">
            <blockquote>
              <p className="font-display text-lg font-medium italic text-accent-jade sm:text-xl">
                “{t("positioningEn")}”
              </p>
              <figcaption className="mt-3 text-sm text-muted">
                {t("positioningCaption")}
              </figcaption>
            </blockquote>
          </figure>
        </Reveal>

        <Reveal delay={0.06}>
          <h3 className="mt-14 font-display text-xl font-semibold text-foreground">
            {t("valueTitle")}
          </h3>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {valueProps.map((text, idx) => (
              <li
                key={`vp-${idx}`}
                className="flex gap-3 rounded-xl border border-border bg-background/60 px-4 py-3"
              >
                <span className="mt-1 flex size-2 shrink-0 rounded-full bg-accent-jade" />
                <span className="text-sm leading-relaxed text-muted sm:text-base">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <h3 className="mt-16 font-display text-xl font-semibold text-foreground">
            {t("servicesTitle")}
          </h3>
        </Reveal>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {serviceBlocks.map((block, i) => {
            const Icon = icons[i] ?? Building2;
            return (
              <Reveal key={block.title} delay={0.05 * i}>
                <article className="h-full rounded-2xl border border-border bg-surface-elevated p-6 transition hover:border-accent-jade/35 sm:p-7">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-accent-jade-dim text-accent-jade">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <h4 className="mt-5 font-display text-lg font-semibold text-foreground">
                    {block.title}
                  </h4>
                  <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted sm:text-base">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="text-accent-jade">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.08}>
          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                <Globe2 className="size-5 text-accent-jade" aria-hidden />
                {t("audiencesTitle")}
              </h3>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
                {audiences.map((line, idx) => (
                  <li key={`aud-${idx}`} className="flex gap-2">
                    <span className="text-accent-jade">—</span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-6 sm:p-8">
              <h3 className="font-display text-xl font-semibold text-foreground">
                {t("diffTitle")}
              </h3>
              <ul className="mt-5 space-y-3">
                {diffKeys.map((key) => (
                  <li key={key} className="flex gap-3 text-sm sm:text-base">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-jade/20 text-accent-jade">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    <span className="leading-relaxed text-muted">
                      {t(`diffItems.${key}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-14 border-t border-border pt-10 text-base leading-relaxed text-muted sm:text-lg">
            {t("institutional")}
          </p>
        </Reveal>

        <EnterpriseLegalDisclaimer />
      </div>
    </section>
  );
}

async function EnterpriseLegalDisclaimer() {
  const d = await getTranslations("EnterpriseDisclaimer");

  return (
    <aside
      className="mt-10 rounded-2xl border border-amber-500/25 bg-amber-500/5 px-5 py-4 sm:px-6"
      aria-labelledby="enterprise-disclaimer-title"
    >
      <h3
        id="enterprise-disclaimer-title"
        className="font-display text-sm font-semibold uppercase tracking-wider text-amber-200/90"
      >
        {d("title")}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{d("body")}</p>
    </aside>
  );
}

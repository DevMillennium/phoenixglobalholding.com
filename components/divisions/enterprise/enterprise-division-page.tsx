import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";
import { TrackedLink } from "@/components/tracked-link";

type ProcessStep = { title: string; body: string };
type Faq = { q: string; a: string };
type Pillar = { title: string; body: string };

export async function EnterpriseDivisionPage() {
  const t = await getTranslations("DivisionEnterprise");
  const nav = await getTranslations("Nav");

  const processSteps = t.raw("processSteps") as ProcessStep[];
  const faqs = t.raw("faqs") as Faq[];
  const pillars = t.raw("pillars") as Pillar[];
  const frameworkPoints = t.raw("frameworkPoints") as string[];
  const legalGroundPoints = t.raw("legalGroundPoints") as string[];
  const correlationBullets = t.raw("correlationBullets") as string[];
  const trustItems = t.raw("trustItems") as string[];

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(52rem,120vh)] bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(74,158,255,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(40rem,90vh)] bg-[radial-gradient(ellipse_80%_40%_at_80%_0%,rgba(232,180,79,0.06),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3] [mask-image:linear-gradient(180deg,black,transparent_72%)] grid-phoenix"
        aria-hidden
      />

      <article className="relative mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-32">
        <Reveal>
          <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-10">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-blue/95">
              {t("heroEyebrow")}
            </p>
            <div className="h-px w-20 bg-gradient-to-r from-accent-blue via-accent/60 to-transparent" />
            <h1 className="max-w-4xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-lg font-medium text-[#c8cbd4] sm:text-xl">
              {t("subtitle")}
            </p>
            <p className="max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
              {t("intro")}
            </p>
            <p className="max-w-3xl text-xs leading-relaxed text-muted/80 sm:text-sm">
              {t("disclaimer")}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.04}>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-y border-white/[0.06] py-5 sm:justify-start sm:gap-x-8">
            {trustItems.map((label) => (
              <span
                key={label}
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted sm:text-[11px]"
              >
                {label}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <section className="mt-16 lg:mt-20" aria-labelledby="ent-pillars-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2
                id="ent-pillars-heading"
                className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
              >
                {t("pillarsTitle")}
              </h2>
              <p className="max-w-md text-sm text-muted">{t("pillarsLead")}</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pillars.map((p, i) => (
                <div
                  key={p.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[linear-gradient(145deg,rgba(22,28,38,0.95),rgba(10,11,15,0.97))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] transition hover:border-accent-blue/30"
                >
                  <span
                    className="font-display text-4xl font-semibold tabular-nums text-accent-blue/25 transition group-hover:text-accent-blue/40"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-[#e8eaef]">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section
            className="mt-16 rounded-3xl border border-accent-blue/20 bg-[linear-gradient(125deg,rgba(74,158,255,0.07),rgba(15,17,23,0.94))] p-6 sm:p-10 lg:mt-24"
            aria-labelledby="ent-framework-heading"
          >
            <h2
              id="ent-framework-heading"
              className="font-display text-xl font-semibold text-foreground sm:text-2xl"
            >
              {t("frameworkTitle")}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
              {t("frameworkLead")}
            </p>
            <ul className="mt-8 space-y-4">
              {frameworkPoints.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 text-sm leading-relaxed text-[#b4b8c4] sm:text-base"
                >
                  <span
                    className="mt-2 inline-block size-1.5 shrink-0 rounded-full bg-accent-blue/90"
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal delay={0.09}>
          <section
            className="mt-16 rounded-3xl border border-white/[0.08] bg-surface-elevated/35 p-6 sm:p-10"
            aria-labelledby="ent-legal-heading"
          >
            <h2
              id="ent-legal-heading"
              className="font-display text-xl font-semibold text-foreground sm:text-2xl"
            >
              {t("legalGroundTitle")}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
              {t("legalGroundLead")}
            </p>
            <ul className="mt-8 space-y-4">
              {legalGroundPoints.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 text-sm leading-relaxed text-[#b4b8c4] sm:text-base"
                >
                  <span
                    className="mt-2 inline-block size-1.5 shrink-0 rounded-full bg-accent/80"
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <section className="mt-16 lg:mt-20" aria-labelledby="ent-correlation-heading">
            <h2
              id="ent-correlation-heading"
              className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
            >
              {t("correlationTitle")}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
              {t("correlationLead")}
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {correlationBullets.map((text) => (
                <div
                  key={text}
                  className="rounded-2xl border border-white/[0.06] bg-surface-elevated/50 px-5 py-4 backdrop-blur-sm"
                >
                  <p className="text-sm leading-relaxed text-[#b8bcc6] sm:text-[15px]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.11}>
          <h2 className="mt-20 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            {t("processTitle")}
          </h2>
          <ol className="mt-10 space-y-0">
            {processSteps.map((step, i) => (
              <li
                key={step.title}
                className="relative border-l border-white/[0.08] pb-12 pl-8 last:pb-0"
              >
                <span className="absolute -left-[5px] top-1 flex size-2.5 rounded-full bg-accent-blue shadow-[0_0_20px_rgba(74,158,255,0.45)]" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  <span className="mr-2 text-accent-blue/80">{i + 1}.</span>
                  {step.title}
                </h3>
                <p className="mt-3 max-w-3xl text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.12}>
          <h2 className="mt-8 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            {t("faqTitle")}
          </h2>
          <dl className="mt-10 space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={`faq-${idx}`}
                className="rounded-2xl border border-white/[0.06] bg-surface/40 px-5 py-5 sm:px-7 sm:py-6"
              >
                <dt className="font-medium text-[#e4e6ec]">{faq.q}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-20 rounded-3xl border border-accent/25 bg-[linear-gradient(160deg,rgba(74,158,255,0.08),rgba(232,180,79,0.06),rgba(7,8,12,0.96))] px-6 py-10 text-center sm:px-12 sm:py-12">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-accent/90">
              Phoenix Global Holding
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted">{t("ctaLead")}</p>
            <p className="mt-8">
              <TrackedLink
                href="/contact"
                eventName="division_enterprise_contact"
                className="inline-flex rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-[#07080c] shadow-[0_12px_40px_rgba(232,180,79,0.22)] transition hover:bg-[#f0c65c]"
              >
                {nav("contactPage")}
              </TrackedLink>
            </p>
          </div>
        </Reveal>
      </article>
    </div>
  );
}

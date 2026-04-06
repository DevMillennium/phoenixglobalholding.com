import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { divisionNamespace, type DivisionSlug } from "@/lib/divisions";

type DivisionNs = (typeof divisionNamespace)[DivisionSlug];

type ProcessStep = { title: string; body: string };
type Faq = { q: string; a: string };

export async function DivisionDetail({ namespace }: { namespace: DivisionNs }) {
  const t = await getTranslations(namespace);
  const nav = await getTranslations("Nav");
  const processSteps = t.raw("processSteps") as ProcessStep[];
  const faqs = t.raw("faqs") as Faq[];

  return (
    <article className="mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-6 lg:px-8 lg:pb-28">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-muted">{t("subtitle")}</p>
        <p className="mt-8 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
          {t("intro")}
        </p>
      </Reveal>

      <Reveal delay={0.06}>
        <h2 className="mt-16 font-display text-2xl font-semibold text-foreground">
          {t("processTitle")}
        </h2>
        <ol className="mt-8 space-y-6 border-l border-border pl-6">
          {processSteps.map((step, i) => (
            <li key={`step-${i}`} className="relative">
              <span className="absolute -left-[29px] top-1 flex size-3 rounded-full bg-accent" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                {i + 1}. {step.title}
              </h3>
              <p className="mt-2 max-w-3xl text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={0.1}>
        <h2 className="mt-16 font-display text-2xl font-semibold text-foreground">
          {t("faqTitle")}
        </h2>
        <dl className="mt-8 space-y-6">
          {faqs.map((faq, idx) => (
            <div
              key={`faq-${idx}`}
              className="rounded-2xl border border-border bg-surface-elevated px-5 py-4 sm:px-6"
            >
              <dt className="font-medium text-foreground">{faq.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                {faq.a}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal delay={0.12}>
        <div className="mt-14 rounded-2xl border border-accent/25 bg-accent-dim px-6 py-8 text-center sm:px-10">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Phoenix Global Holding
          </p>
          <p className="mt-3">
            <Link
              href="/contact"
              className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[#07080c] transition hover:bg-[#f0c65c]"
            >
              {nav("contactPage")}
            </Link>
          </p>
        </div>
      </Reveal>
    </article>
  );
}

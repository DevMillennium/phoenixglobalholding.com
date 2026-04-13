import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";
import { TrackedLink } from "@/components/tracked-link";
import { MatrixCanvasGlobal } from "@/components/divisions/developer/matrix-canvas-global";

type MatrixPoint = { title: string; body: string; points: string[] };
type DeliverItem = { strong: string; text: string };
type StackRow = { label: string; text: string };

type MatrixContent = {
  matrixEyebrow: string;
  detailHeadline: string;
  detailLead: string;
  videoCaption: string;
  superiorityTitle: string;
  superiorityItems: string[];
  comparisonHeading: string;
  patternLabel: string;
  phoenixLabel: string;
  patternBullets: string[];
  phoenixBullets: string[];
  servicesTitle: string;
  serviceCards: MatrixPoint[];
  deliverTitle: string;
  deliverItems: DeliverItem[];
  qualityTitle: string;
  qualityLead: string;
  qualityChips: string[];
  stackTitle: string;
  stackLead: string;
  stackRows: StackRow[];
  ctaStrong: string;
  ctaText: string;
  ctaButton: string;
};

export async function DeveloperDivisionPage() {
  const t = await getTranslations("DivisionDeveloper");
  const nav = await getTranslations("Nav");
  const raw = t.raw("matrixContent");
  const m = raw as MatrixContent;

  const processSteps = t.raw("processSteps") as { title: string; body: string }[];
  const faqs = t.raw("faqs") as { q: string; a: string }[];

  return (
    <>
      <MatrixCanvasGlobal />
      <div className="relative z-10">
        <article className="mx-auto max-w-6xl px-4 pb-12 pt-4 sm:px-6 lg:px-8 lg:pb-24">
          <Reveal>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#8dffc4]">
              {m.matrixEyebrow}
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-muted">{t("subtitle")}</p>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
              {t("intro")}
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
              <div className="rounded-2xl border border-[rgba(0,255,102,0.28)] bg-[linear-gradient(125deg,rgba(0,55,28,0.45),rgba(0,15,8,0.85))] p-6 sm:p-8 lg:col-span-7">
                <p className="font-display text-lg font-semibold text-[#c8ffe0] sm:text-xl">
                  {m.superiorityTitle}
                </p>
                <ul className="mt-4 list-none space-y-2.5 text-sm text-[#9ab39e] sm:text-base">
                  {m.superiorityItems.map((item) => (
                    <li key={item} className="relative pl-5">
                      <span className="absolute left-0 top-2 size-1.5 rounded-full bg-[#00ff66] shadow-[0_0_8px_rgba(0,255,102,0.5)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mx-auto w-full max-w-xs overflow-hidden rounded-2xl border border-[rgba(0,255,102,0.28)] bg-[#030805] shadow-[0_12px_48px_rgba(0,0,0,0.45)] sm:max-w-sm lg:col-span-5 lg:max-w-none">
                <video
                  className="aspect-square w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={m.videoCaption}
                >
                  <source src="/divisions/developer/phoenix-hero.mov" type="video/quicktime" />
                </video>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.07}>
            <p className="mt-14 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#8dffc4]">
              {m.matrixEyebrow}
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {m.detailHeadline}
            </h2>
            <p className="mt-4 max-w-3xl text-muted">{m.detailLead}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="mt-16 font-display text-xl font-semibold text-foreground sm:text-2xl">
              {m.comparisonHeading}
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
              <div className="rounded-2xl border border-border bg-surface-elevated/80 p-6">
                <p className="font-mono text-xs uppercase tracking-wider text-muted">
                  {m.patternLabel}
                </p>
                <ul className="mt-4 list-none space-y-2 text-sm text-muted">
                  {m.patternBullets.map((line) => (
                    <li key={line} className="before:mr-2 before:text-muted before:content-['·']">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-[rgba(0,255,102,0.35)] bg-[linear-gradient(155deg,rgba(0,45,22,0.55),rgba(5,12,8,0.95))] p-6 shadow-[0_0_32px_rgba(0,255,102,0.08)]">
                <p className="font-mono text-xs uppercase tracking-wider text-[#00ff66]">
                  {m.phoenixLabel}
                </p>
                <ul className="mt-4 list-none space-y-2 text-sm text-[#9aaa9e]">
                  {m.phoenixBullets.map((line) => (
                    <li key={line} className="pl-1 before:mr-2 before:text-[#00ff66] before:content-['▸']">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.09}>
            <h2 className="mt-16 font-display text-2xl font-semibold text-foreground">
              {m.servicesTitle}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {m.serviceCards.map((card) => (
                <article
                  key={card.title}
                  className="flex h-full flex-col rounded-2xl border border-[rgba(0,255,102,0.2)] bg-[linear-gradient(155deg,rgba(0,28,14,0.65),rgba(10,12,14,0.92))] p-5 transition hover:border-[rgba(0,255,102,0.45)]"
                >
                  <h3 className="font-display text-lg font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{card.body}</p>
                  <ul className="mt-3 list-none space-y-1 border-t border-white/5 pt-3 text-xs text-[#8a9a8e]">
                    {card.points.map((p) => (
                      <li key={p} className="before:mr-1.5 before:text-[#00ff66] before:content-['•']">
                        {p}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-16 grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">{m.deliverTitle}</h2>
                <ol className="mt-6 space-y-5 border-l border-[rgba(0,255,102,0.2)] pl-6">
                  {m.deliverItems.map((item, i) => (
                    <li key={item.strong} className="relative">
                      <span className="absolute -left-[29px] top-1 flex size-3 rounded-full bg-[#00ff66]" />
                      <p className="font-mono text-xs text-[#00ff66]">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <p className="font-display text-base font-semibold text-foreground">{item.strong}</p>
                      <p className="mt-1 text-sm text-muted">{item.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl border border-[rgba(0,255,102,0.2)] bg-[linear-gradient(160deg,rgba(0,35,18,0.55),rgba(8,10,12,0.95))] p-6">
                <h2 className="font-display text-xl font-semibold text-foreground">{m.qualityTitle}</h2>
                <p className="mt-2 text-sm text-[#8a9a8e]">{m.qualityLead}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.qualityChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-md border border-[rgba(0,255,102,0.22)] bg-[rgba(0,25,12,0.6)] px-2.5 py-1 font-mono text-xs text-[#a8c4b0]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.11}>
            <h2 className="mt-16 font-display text-xl font-semibold text-foreground">{m.stackTitle}</h2>
            <p className="mt-2 text-sm text-[#8a9a8e]">{m.stackLead}</p>
            <div className="mt-6 space-y-3">
              {m.stackRows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-2 rounded-xl border border-[rgba(0,255,102,0.16)] bg-[rgba(0,20,10,0.45)] p-4 sm:grid-cols-[120px_1fr]"
                >
                  <span className="font-mono text-xs uppercase tracking-wider text-[#8dffc4]">
                    {row.label}
                  </span>
                  <p className="text-sm text-muted">{row.text}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-14 flex flex-col gap-4 rounded-2xl border border-[rgba(0,255,102,0.28)] bg-[linear-gradient(120deg,rgba(0,255,102,0.08),transparent)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="font-display text-lg font-semibold text-[#c8ffe0]">{m.ctaStrong}</p>
                <p className="mt-1 max-w-xl text-sm text-[#9aaa9e]">{m.ctaText}</p>
              </div>
              <TrackedLink
                href="/contact"
                eventName="developer_matrix_cta"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00ff66,#00aa55)] px-6 py-3 text-sm font-semibold text-[#020403] shadow-[0_8px_36px_rgba(0,255,102,0.28)] transition hover:shadow-[0_12px_44px_rgba(0,255,102,0.4)]"
              >
                {m.ctaButton}
              </TrackedLink>
            </div>
          </Reveal>

          <Reveal delay={0.13}>
            <h2 className="mt-16 font-display text-2xl font-semibold text-foreground">
              {t("processTitle")}
            </h2>
            <ol className="mt-8 space-y-6 border-l border-border pl-6">
              {processSteps.map((step, i) => (
                <li key={step.title} className="relative">
                  <span className="absolute -left-[29px] top-1 flex size-3 rounded-full bg-accent" />
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="mt-2 max-w-3xl text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.14}>
            <h2 className="mt-16 font-display text-2xl font-semibold text-foreground">{t("faqTitle")}</h2>
            <dl className="mt-8 space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={`faq-${idx}`}
                  className="rounded-2xl border border-border bg-surface-elevated px-5 py-4 sm:px-6"
                >
                  <dt className="font-medium text-foreground">{faq.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-14 rounded-2xl border border-accent/25 bg-accent-dim px-6 py-8 text-center sm:px-10">
              <p className="text-sm font-medium uppercase tracking-widest text-accent">
                Phoenix Global Holding
              </p>
              <p className="mt-3">
                <TrackedLink
                  href="/contact"
                  eventName="developer_division_footer_contact"
                  className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[#07080c] transition hover:bg-[#f0c65c]"
                >
                  {nav("contactPage")}
                </TrackedLink>
              </p>
            </div>
          </Reveal>
        </article>
      </div>
    </>
  );
}

import { getTranslations } from "next-intl/server";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

type Namespace = "LegalPrivacy" | "LegalTerms";

export async function LegalDocument({ namespace }: { namespace: Namespace }) {
  const t = await getTranslations(namespace);
  const sections = t.raw("sections") as LegalSection[];

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <header className="border-b border-border pb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          Phoenix Global Holding
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm text-muted">{t("lastUpdated")}</p>
        <p className="mt-8 text-base leading-relaxed text-muted sm:text-lg">
          {t("intro")}
        </p>
      </header>
      <div className="mt-12 space-y-12">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-xl font-semibold text-foreground">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-muted">
              {section.paragraphs.map((p, i) => (
                <p key={`${section.heading}-${i}`}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

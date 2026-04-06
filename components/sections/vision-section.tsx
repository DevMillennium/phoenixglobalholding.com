import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";

export async function VisionSection() {
  const t = await getTranslations("Vision");

  return (
    <section
      id="vision"
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
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted sm:text-xl">
            {t("text")}
          </p>
          <div className="mt-10">
            <Link
              href="/#contact"
              className="focus-ring inline-flex rounded-full border border-accent/50 bg-accent/10 px-8 py-3.5 text-sm font-semibold text-accent transition hover:bg-accent/20"
            >
              {t("cta")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

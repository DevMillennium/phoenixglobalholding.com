import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";

export async function HeroSection() {
  const t = await getTranslations("Hero");

  return (
    <section className="relative overflow-hidden radial-glow">
      <div
        className="pointer-events-none absolute inset-0 grid-phoenix opacity-60"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 sm:pb-32 sm:pt-20 lg:px-8 lg:pt-28">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            {t("eyebrow")}
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            {t("subtitle")}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/#import-export"
              className="focus-ring inline-flex items-center justify-center rounded-full bg-accent px-8 py-3.5 text-center text-sm font-semibold text-[#07080c] shadow-lg shadow-accent/20 transition hover:bg-[#f0c65c]"
            >
              {t("ctaPrimary")}
            </Link>
            <a
              href="#contact"
              className="focus-ring inline-flex items-center justify-center rounded-full border border-border bg-surface-elevated px-8 py-3.5 text-sm font-semibold text-foreground transition hover:border-accent/40 hover:bg-white/5"
            >
              {t("ctaSecondary")}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

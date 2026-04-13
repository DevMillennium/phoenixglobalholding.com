import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";
import { TrackedLink } from "@/components/tracked-link";

export async function DeveloperSection() {
  const t = await getTranslations("DivisionDeveloper");

  return (
    <section
      id="developer"
      className="scroll-mt-24 border-t border-[rgba(0,255,102,0.12)] bg-[linear-gradient(180deg,#050806_0%,#07080c_100%)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#8dffc4]">
            Phoenix Global Developer
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-muted">{t("subtitle")}</p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">{t("intro")}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <TrackedLink
              href="/divisions/developer"
              eventName="home_developer_division"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#00ff66,#00aa55)] px-8 py-3.5 text-center text-sm font-semibold text-[#020403] shadow-[0_8px_36px_rgba(0,255,102,0.28)] transition hover:shadow-[0_12px_44px_rgba(0,255,102,0.4)]"
            >
              {t("matrixContent.ctaButton")}
            </TrackedLink>
            <TrackedLink
              href="/contact"
              eventName="home_developer_contact"
              className="inline-flex items-center justify-center rounded-full border border-[rgba(0,255,102,0.35)] bg-transparent px-8 py-3.5 text-sm font-semibold text-[#c8ffe0] transition hover:bg-[rgba(0,255,102,0.08)]"
            >
              {t("matrixContent.ctaStrong")} — contacto
            </TrackedLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

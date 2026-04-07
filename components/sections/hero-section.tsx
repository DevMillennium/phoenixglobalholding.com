import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { HeroCtas } from "@/components/hero-ctas";
import { Reveal } from "@/components/reveal";

const HERO_AMBIENT = "/brand/hero-ambient.png";

export async function HeroSection() {
  const t = await getTranslations("Hero");
  const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim();

  return (
    <section className="relative overflow-hidden radial-glow">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={HERO_AMBIENT}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.2]"
        />
      </div>
      {videoUrl ? (
        <video
          className="hero-video-media absolute inset-0 h-full w-full object-cover opacity-25"
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_AMBIENT}
          aria-hidden
          src={videoUrl}
        />
      ) : null}
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
          <HeroCtas
            primaryHref="/divisions/import-export"
            primaryLabel={t("ctaPrimary")}
            secondaryHref="/contact"
            secondaryLabel={t("ctaSecondary")}
          />
        </Reveal>
      </div>
    </section>
  );
}

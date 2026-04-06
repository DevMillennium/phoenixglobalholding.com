import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getPartnerLogoFiles } from "@/lib/partners";

export async function PartnersStrip() {
  const files = getPartnerLogoFiles();
  if (files.length === 0) return null;

  const t = await getTranslations("Partners");

  return (
    <section
      className="border-t border-border bg-surface py-16 sm:py-20"
      aria-labelledby="partners-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          id="partners-heading"
          className="font-display text-center text-2xl font-semibold text-foreground"
        >
          {t("title")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted">
          {t("subtitle")}
        </p>
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {files.map((file) => (
            <li key={file}>
              <Image
                src={`/partners/${file}`}
                alt=""
                width={140}
                height={56}
                className="h-12 w-auto max-w-[140px] object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

"use client";

import { TrackedLink } from "@/components/tracked-link";

type Props = {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export function HeroCtas({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: Props) {
  return (
    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
      <TrackedLink
        href={primaryHref}
        eventName="hero_cta_primary"
        eventParams={{ destination: primaryHref }}
        className="focus-ring inline-flex items-center justify-center rounded-full bg-accent px-8 py-3.5 text-center text-sm font-semibold text-[#07080c] shadow-lg shadow-accent/20 transition hover:bg-[#f0c65c]"
      >
        {primaryLabel}
      </TrackedLink>
      <TrackedLink
        href={secondaryHref}
        eventName="hero_cta_secondary"
        eventParams={{ destination: secondaryHref }}
        className="focus-ring inline-flex items-center justify-center rounded-full border border-border bg-surface-elevated px-8 py-3.5 text-sm font-semibold text-foreground transition hover:border-accent/40 hover:bg-white/5"
      >
        {secondaryLabel}
      </TrackedLink>
    </div>
  );
}

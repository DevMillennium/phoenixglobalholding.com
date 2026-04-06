"use client";

import type { ComponentProps } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trackEvent } from "@/lib/gtag";

type LinkProps = ComponentProps<typeof Link>;

type Props = LinkProps & {
  eventName: string;
  eventParams?: Record<string, string | number | boolean>;
};

export function TrackedLink({
  eventName,
  eventParams,
  onClick,
  ...rest
}: Props) {
  const locale = useLocale();
  return (
    <Link
      {...rest}
      onClick={(e) => {
        trackEvent(eventName, {
          ...eventParams,
          page_locale: locale,
        });
        onClick?.(e);
      }}
    />
  );
}

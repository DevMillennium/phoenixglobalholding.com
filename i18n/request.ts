import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const common = (await import(`../messages/${locale}.json`)).default;
  const legal = (await import(`../messages/legal/${locale}.json`)).default;
  const ui = (await import(`../messages/ui/${locale}.json`)).default;
  const divisions = (await import(`../messages/divisions/${locale}.json`)).default;

  return {
    locale,
    messages: { ...common, ...legal, ...ui, ...divisions },
  };
});

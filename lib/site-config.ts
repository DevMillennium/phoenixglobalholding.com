import { routing } from "@/i18n/routing";

/** Valores oficiais por defeito; sobrescreva com variáveis de ambiente em produção. */
export const SITE_DEFAULTS = {
  /** URL canónica do site (sem barra final). */
  url: "https://www.phoenixglobalholding.com",
  /** Correio institucional exibido no site e políticas. */
  email: "contacto@phoenixglobalholding.com",
} as const;

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return SITE_DEFAULTS.url;
  return raw.replace(/\/+$/, "");
}

export function getContactEmail(): string {
  const raw = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return raw || SITE_DEFAULTS.email;
}

/** Caminho com prefixo de locale quando necessário (ex.: `/pt/privacy`). */
export function localizedPath(locale: string, pathname: string): string {
  if (pathname === "" || pathname === "/") {
    return locale === routing.defaultLocale ? "/" : `/${locale}`;
  }
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (locale === routing.defaultLocale) return path;
  return `/${locale}${path}`;
}

import { routing } from "@/i18n/routing";

/** Valores oficiais por defeito; sobrescreva com variáveis de ambiente em produção. */
export const SITE_DEFAULTS = {
  /** URL canónica do site (sem barra final). */
  url: "https://www.phoenixglobalholding.com",
  /** Correio institucional exibido no site, mailto e destino por defeito do formulário. */
  email: "diretoria@phoenixglobalholding.com",
  /**
   * WhatsApp em E.164 sem o sinal + (ex.: +595 992 799 800 → 595992799800).
   * Sobrescreva com NEXT_PUBLIC_WHATSAPP_E164 se necessário.
   */
  whatsappE164: "595992799800",
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

/** URL `https://wa.me/...` para abrir conversa no WhatsApp. */
export function getWhatsAppHref(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_E164?.trim().replace(/\D/g, "");
  const digits = raw || SITE_DEFAULTS.whatsappE164;
  return `https://wa.me/${digits}`;
}

/** Número formatado para exibição (PT/ES/EN igual). */
export function getWhatsAppDisplayNumber(): string {
  const custom = process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY?.trim();
  if (custom) return custom;
  return "+595 992 799 800";
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

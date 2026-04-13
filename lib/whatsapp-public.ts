/**
 * URL de WhatsApp para componentes cliente (NEXT_PUBLIC_* inyectada en build).
 */
export function getPublicWhatsAppHref(): string {
  const raw =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_WHATSAPP_E164?.replace(/\D/g, "")
      : undefined;
  const digits = raw && raw.length > 0 ? raw : "595992799800";
  return `https://wa.me/${digits}`;
}

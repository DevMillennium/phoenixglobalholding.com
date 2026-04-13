"use server";

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validations/contact";
import { getContactEmail } from "@/lib/site-config";

export type ContactActionState = {
  ok: boolean;
  errorKey?: string;
  fieldErrors?: Record<string, string[]>;
  /** Preenchido em `ok: true` para analytics no cliente. */
  intent?: "commerce" | "tech" | "corporate" | "institutional" | "other";
};

export async function submitContact(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    phone: formData.get("phone") ?? "",
    intent: formData.get("intent"),
    message: formData.get("message"),
    consent: formData.get("consent") === "on",
  };

  const parsed = contactFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const data = parsed.data;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const to = process.env.RESEND_TO_EMAIL?.trim() || getContactEmail();

  const subject = `[Phoenix Global Holding] ${data.intent} — ${data.company}`;
  const html = `
    <h2>Novo pedido de contacto (site)</h2>
    <p><strong>Nome:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Empresa:</strong> ${escapeHtml(data.company)}</p>
    ${data.phone ? `<p><strong>Telefone:</strong> ${escapeHtml(data.phone)}</p>` : ""}
    <p><strong>Intenção:</strong> ${escapeHtml(data.intent)}</p>
    <p><strong>Mensagem:</strong></p>
    <pre style="white-space:pre-wrap;font-family:sans-serif">${escapeHtml(data.message)}</pre>
  `;

  if (apiKey && from) {
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to: [to],
        replyTo: data.email,
        subject,
        html,
      });
      if (error) {
        console.error("[contact] Resend:", error);
        return { ok: false, errorKey: "sendFailed" };
      }
      try {
        await prisma.lead.create({
          data: {
            name: data.name,
            email: data.email,
            company: data.company,
            phone: data.phone || undefined,
            intent: data.intent,
            message: data.message,
            consent: data.consent,
            sourcePath: "/contact",
          },
        });
      } catch (e) {
        console.error("[contact] lead persist", e);
      }
      return { ok: true, intent: data.intent };
    } catch (e) {
      console.error("[contact]", e);
      return { ok: false, errorKey: "sendFailed" };
    }
  }

  return { ok: false, errorKey: "notConfigured" };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const contactInitialState: ContactActionState = { ok: false };

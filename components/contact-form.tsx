"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getContactEmail } from "@/lib/site-config";
import { contactInitialState, submitContact } from "@/app/actions/contact";

type FieldKey = "name" | "email" | "company" | "intent" | "message" | "consent";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("ContactForm");

  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-[#07080c] disabled:opacity-60"
    >
      {pending ? t("sending") : t("submit")}
    </button>
  );
}

export function ContactForm() {
  const t = useTranslations("ContactForm");
  const tPage = useTranslations("ContactPage");
  const [state, formAction] = useActionState(submitContact, contactInitialState);

  const mailtoHref = (() => {
    const subject = encodeURIComponent(tPage("mailtoSubject"));
    const body = encodeURIComponent(tPage("mailtoBody"));
    return `mailto:${getContactEmail()}?subject=${subject}&body=${body}`;
  })();

  const fieldError = (name: FieldKey) => {
    if (!state.fieldErrors?.[name]?.[0]) return null;
    switch (name) {
      case "name":
        return t("errors.name");
      case "email":
        return t("errors.email");
      case "company":
        return t("errors.company");
      case "intent":
        return t("errors.intent");
      case "message":
        return t("errors.message");
      case "consent":
        return t("errors.consent");
      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface-elevated p-6 sm:p-8">
      {state.ok ? (
        <p className="text-center text-lg font-medium text-accent" role="status">
          {t("success")}
        </p>
      ) : (
        <form action={formAction} className="space-y-5" noValidate>
          {state.errorKey === "sendFailed" && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {t("sendFailed")}
            </p>
          )}
          {state.errorKey === "notConfigured" && (
            <div className="rounded-lg border border-accent/30 bg-accent-dim px-4 py-3 text-sm text-foreground">
              <p>{t("notConfigured")}</p>
              <a
                href={mailtoHref}
                className="mt-2 inline-block font-semibold text-accent underline-offset-2 hover:underline"
              >
                {t("mailtoCta")}
              </a>
            </div>
          )}

          <div>
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              {t("name")} *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="focus-ring mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground"
              aria-invalid={!!state.fieldErrors?.name}
              aria-describedby={state.fieldErrors?.name ? "err-name" : undefined}
            />
            {state.fieldErrors?.name && (
              <p id="err-name" className="mt-1 text-sm text-red-300">
                {fieldError("name")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              {t("email")} *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="focus-ring mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground"
              aria-invalid={!!state.fieldErrors?.email}
            />
            {state.fieldErrors?.email && (
              <p className="mt-1 text-sm text-red-300">{fieldError("email")}</p>
            )}
          </div>

          <div>
            <label htmlFor="company" className="text-sm font-medium text-foreground">
              {t("company")} *
            </label>
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              required
              className="focus-ring mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground"
              aria-invalid={!!state.fieldErrors?.company}
            />
            {state.fieldErrors?.company && (
              <p className="mt-1 text-sm text-red-300">{fieldError("company")}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              {t("phone")}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className="focus-ring mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground"
            />
          </div>

          <div>
            <label htmlFor="intent" className="text-sm font-medium text-foreground">
              {t("intent")} *
            </label>
            <select
              id="intent"
              name="intent"
              required
              defaultValue="commerce"
              className="focus-ring mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground"
              aria-invalid={!!state.fieldErrors?.intent}
            >
              <option value="commerce">{t("intentCommerce")}</option>
              <option value="tech">{t("intentTech")}</option>
              <option value="corporate">{t("intentCorporate")}</option>
              <option value="institutional">{t("intentInstitutional")}</option>
              <option value="other">{t("intentOther")}</option>
            </select>
            {state.fieldErrors?.intent && (
              <p className="mt-1 text-sm text-red-300">{fieldError("intent")}</p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="text-sm font-medium text-foreground">
              {t("message")} *
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="focus-ring mt-1.5 w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-foreground"
              aria-invalid={!!state.fieldErrors?.message}
            />
            {state.fieldErrors?.message && (
              <p className="mt-1 text-sm text-red-300">{fieldError("message")}</p>
            )}
          </div>

          <div className="flex gap-3">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              className="focus-ring mt-1 size-4 rounded border-border"
              aria-invalid={!!state.fieldErrors?.consent}
            />
            <label htmlFor="consent" className="text-sm text-muted">
              {t("consentLabel")}{" "}
              <Link
                href="/privacy"
                className="text-accent underline-offset-2 hover:underline"
              >
                {t("privacyLink")}
              </Link>
            </label>
          </div>
          {state.fieldErrors?.consent && (
            <p className="text-sm text-red-300">{fieldError("consent")}</p>
          )}

          <SubmitButton />
        </form>
      )}
    </div>
  );
}

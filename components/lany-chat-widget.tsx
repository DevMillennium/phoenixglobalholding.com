"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AtendimentoResponse =
  | { ok: true; answer: string }
  | { ok: false; error?: string };

const WHATSAPP_URL = "https://wa.me/595992799800";

export function LanyChatWidget() {
  const t = useTranslations("LanyChat");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const canSend = input.trim().length > 0 && !isSending;

  const visibleMessages = useMemo<ChatMessage[]>(() => {
    if (messages.length > 0) return messages;
    return [{ role: "assistant", content: t("welcome") }];
  }, [messages, t]);

  async function onSend() {
    const message = input.trim();
    if (!message || isSending) return;

    const userMsg: ChatMessage = { role: "user", content: message };
    const history = messages.slice(-12);

    setInput("");
    setError("");
    setIsSending(true);
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch("/api/atendimento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history,
          locale,
        }),
      });

      const data = (await response.json()) as AtendimentoResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.ok ? t("genericError") : (data.error ?? t("genericError")));
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch {
      setError(t("genericError"));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      {isOpen ? (
        <section
          className="fixed bottom-24 right-4 z-50 flex h-[70vh] w-[min(28rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl md:bottom-6"
          aria-label={t("aria")}
        >
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{t("title")}</p>
              <p className="text-xs text-muted">{t("subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="focus-ring rounded-md p-2 text-muted hover:bg-surface-elevated hover:text-foreground"
              aria-label={t("close")}
            >
              <X className="size-4" aria-hidden />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {visibleMessages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}-${msg.content.slice(0, 24)}`}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === "assistant"
                    ? "bg-surface-elevated text-foreground"
                    : "ml-auto bg-accent text-[#07080c]"
                  }`}
              >
                {msg.content}
              </div>
            ))}

            {isSending ? (
              <div className="max-w-[90%] rounded-2xl bg-surface-elevated px-3 py-2 text-sm text-muted">
                {t("thinking")}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}{" "}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {t("whatsappCta")}
                </a>
              </div>
            ) : null}
          </div>

          <footer className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void onSend();
                  }
                }}
                placeholder={t("inputPlaceholder")}
                className="focus-ring w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted"
                maxLength={1500}
              />
              <button
                type="button"
                onClick={() => void onSend()}
                disabled={!canSend}
                className="focus-ring inline-flex items-center justify-center rounded-xl bg-accent px-3 text-[#07080c] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={t("send")}
              >
                <Send className="size-4" aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-xs text-muted">{t("hint")}</p>
          </footer>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="focus-ring fixed bottom-24 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-[#07080c] shadow-lg shadow-accent/30 md:bottom-6"
        aria-label={t("open")}
      >
        <MessageCircle className="size-4" aria-hidden />
        {t("button")}
      </button>
    </>
  );
}

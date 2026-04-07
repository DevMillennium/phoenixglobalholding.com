import { NextResponse } from "next/server";
import { LANY_SYSTEM_PROMPT } from "@/lib/lany-system-prompt";

type ClientMessage = {
  role: "user" | "assistant";
  content: string;
};

type RequestBody = {
  message?: string;
  history?: ClientMessage[];
};

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";
const MAX_HISTORY = 12;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const userMessage = normalizeText(body.message);
    const history = sanitizeHistory(body.history);

    if (!userMessage) {
      return NextResponse.json(
        { ok: false, error: "Mensagem invalida." },
        { status: 400 },
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Atendimento indisponivel no momento. Chame no WhatsApp: https://wa.me/595992799800",
        },
        { status: 503 },
      );
    }

    const model = process.env.DEEPSEEK_MODEL?.trim() || DEFAULT_MODEL;

    const payload = {
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: LANY_SYSTEM_PROMPT },
        ...history,
        { role: "user", content: userMessage },
      ],
    };

    const upstream = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!upstream.ok) {
      const fallback = await safeReadText(upstream);
      console.error("[atendimento] deepseek error", upstream.status, fallback);
      return NextResponse.json(
        {
          ok: false,
          error:
            "Nao consegui responder agora. Fale com nossa equipe no WhatsApp: https://wa.me/595992799800",
        },
        { status: 502 },
      );
    }

    const data = (await upstream.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const answer = normalizeText(data.choices?.[0]?.message?.content);

    if (!answer) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Nao consegui concluir a resposta agora. Fale com nossa equipe no WhatsApp: https://wa.me/595992799800",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, answer });
  } catch (error) {
    console.error("[atendimento] route error", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Atendimento indisponivel no momento. Fale com nossa equipe no WhatsApp: https://wa.me/595992799800",
      },
      { status: 500 },
    );
  }
}

function sanitizeHistory(history?: ClientMessage[]): ClientMessage[] {
  if (!Array.isArray(history)) return [];
  const clipped = history.slice(-MAX_HISTORY);
  return clipped
    .filter(
      (item): item is ClientMessage =>
        (item?.role === "user" || item?.role === "assistant") &&
        typeof item.content === "string",
    )
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, 3000),
    }))
    .filter((item) => item.content.length > 0);
}

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

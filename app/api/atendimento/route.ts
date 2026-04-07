import { NextResponse } from "next/server";
import { LANY_SYSTEM_PROMPT } from "@/lib/lany-system-prompt";

type ClientMessage = {
  role: "user" | "assistant";
  content: string;
};

type RequestBody = {
  message?: string;
  history?: ClientMessage[];
  locale?: string;
};

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";
const MAX_HISTORY = 12;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const userMessage = normalizeText(body.message);
    const history = sanitizeHistory(body.history);
    const locale = normalizeLocale(body.locale);

    if (!userMessage) {
      return NextResponse.json(
        { ok: false, error: "Mensagem invalida." },
        { status: 400 },
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({
        ok: true,
        answer: buildFallbackAnswer(userMessage, locale),
        source: "fallback",
      });
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
      return NextResponse.json({
        ok: true,
        answer: buildFallbackAnswer(userMessage, locale),
        source: "fallback",
      });
    }

    const data = (await upstream.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const answer = normalizeText(data.choices?.[0]?.message?.content);

    if (!answer) {
      return NextResponse.json({
        ok: true,
        answer: buildFallbackAnswer(userMessage, locale),
        source: "fallback",
      });
    }

    return NextResponse.json({ ok: true, answer });
  } catch (error) {
    console.error("[atendimento] route error", error);
    return NextResponse.json(
      {
        ok: true,
        answer: buildFallbackAnswer("", "pt"),
        source: "fallback",
      },
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

function normalizeLocale(locale?: string): "pt" | "es" | "en" {
  if (locale === "es" || locale === "en" || locale === "pt") return locale;
  return "pt";
}

function buildFallbackAnswer(message: string, locale: "pt" | "es" | "en"): string {
  const lower = message.toLowerCase();
  const wantsTech = hasAny(lower, ["tech", "ia", "ai", "app", "plataforma", "developer", "software", "api"]);
  const wantsTrade = hasAny(lower, ["import", "export", "comercio", "trade", "logistica", "marketplace"]);
  const wantsCorporate = hasAny(lower, ["eas", "ruc", "paraguai", "paraguay", "societ", "corporat", "fiscal"]);
  const wantsPrice = hasAny(lower, ["preco", "precio", "price", "valor", "quanto", "cuanto", "cost"]);
  const wantsDeadline = hasAny(lower, ["prazo", "plazo", "deadline", "tempo", "time"]);

  if (locale === "es") {
    if (wantsTrade) {
      return "Claro. En Import & Export apoyamos importacion, exportacion y redistribucion regional desde Paraguay. Beneficio: integracion operativa para reducir friccion en la expansion. Si quiere, le guio con su caso y luego lo derivo al equipo humano por WhatsApp: https://wa.me/595992799800";
    }
    if (wantsTech) {
      return "Claro. En Developer trabajamos con IA, apps, plataformas web e integraciones para operaciones empresariales. Beneficio: soluciones alineadas al negocio y escalables. Si quiere, le ayudo a definir alcance y lo paso al equipo por WhatsApp: https://wa.me/595992799800";
    }
    if (wantsCorporate) {
      return "Claro. En Enterprise Solution apoyamos estructuracion corporativa en Paraguay (incluyendo EAS y activacion operativa segun el caso), con gestion remota. Beneficio: proceso mas organizado para operar en la region. Si quiere, compartame su objetivo y lo derivo al equipo por WhatsApp: https://wa.me/595992799800";
    }
    if (wantsPrice || wantsDeadline) {
      return "Entiendo. En el sitio institucional no publicamos precio final ni plazo exacto porque dependen de la complejidad de cada caso. Beneficio: propuesta ajustada a su necesidad real. Si quiere, le ayudo a preparar un resumen para cotizacion por WhatsApp: https://wa.me/595992799800";
    }
    return "Puedo ayudarte con dudas de Import & Export, Developer y Enterprise Solution. Beneficio: orientacion comercial rapida y clara para avanzar. Si quieres, empecemos por tu objetivo principal y te guio al siguiente paso por WhatsApp: https://wa.me/595992799800";
  }

  if (locale === "en") {
    if (wantsTrade) {
      return "Sure. In Import & Export we support importing, exporting, and regional redistribution from Paraguay. Benefit: integrated operations to reduce expansion friction. If you want, I can guide your case and then route you to our team on WhatsApp: https://wa.me/595992799800";
    }
    if (wantsTech) {
      return "Sure. In Developer we build AI solutions, apps, web platforms, and integrations for business operations. Benefit: scalable delivery aligned with business goals. If you want, I can help define scope and route you to our team on WhatsApp: https://wa.me/595992799800";
    }
    if (wantsCorporate) {
      return "Sure. In Enterprise Solution we support corporate structuring in Paraguay (including EAS and operational activation when applicable), with remote management. Benefit: a more structured path to operate in the region. If you want, share your objective and I will route you to our team on WhatsApp: https://wa.me/595992799800";
    }
    if (wantsPrice || wantsDeadline) {
      return "Understood. We do not publish final prices or exact timelines on the institutional site because they depend on case complexity. Benefit: proposal tailored to your real scope. If you want, I can help you prepare a quote request for WhatsApp: https://wa.me/595992799800";
    }
    return "I can help with Import & Export, Developer, and Enterprise Solution questions. Benefit: clear commercial guidance so you can move forward quickly. If you want, tell me your main objective and I will guide your next step via WhatsApp: https://wa.me/595992799800";
  }

  if (wantsTrade) {
    return "Claro. Na divisao Import & Export apoiamos importacao, exportacao e redistribuicao regional a partir do Paraguai. Beneficio: integracao operacional para reduzir friccao na expansao. Se quiser, eu ja te ajudo com seu caso e encaminho para o time no WhatsApp: https://wa.me/595992799800";
  }
  if (wantsTech) {
    return "Claro. Na divisao Developer atuamos com IA, apps, plataformas web e integracoes para operacoes empresariais. Beneficio: solucoes escalaveis alinhadas ao negocio. Se quiser, te ajudo a definir o escopo e encaminho para o time no WhatsApp: https://wa.me/595992799800";
  }
  if (wantsCorporate) {
    return "Claro. Na Enterprise Solution apoiamos estruturacao corporativa no Paraguai (incluindo EAS e ativacao operacional quando aplicavel), com gestao remota. Beneficio: processo mais organizado para operar na regiao. Se quiser, me passe seu objetivo e eu te encaminho para o time no WhatsApp: https://wa.me/595992799800";
  }
  if (wantsPrice || wantsDeadline) {
    return "Entendi. No site institucional nao publicamos preco final nem prazo exato porque isso depende da complexidade de cada caso. Beneficio: proposta aderente ao seu cenario real. Se quiser, eu te ajudo agora a montar o pedido de orcamento no WhatsApp: https://wa.me/595992799800";
  }
  return "Posso te orientar sobre Import & Export, Developer e Enterprise Solution. Beneficio: direcionamento comercial claro para avancar mais rapido. Se quiser, me diga seu objetivo principal e eu te conduzo para o proximo passo no WhatsApp: https://wa.me/595992799800";
}

function hasAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

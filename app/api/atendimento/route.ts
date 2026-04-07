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
const MAX_RETRIES = 2;

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

    const data = (await requestDeepSeekWithRetry(apiKey, payload)) as {
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
  const variant = Math.abs(message.length) % 3;

  if (locale === "es") {
    if (wantsTrade) {
      return variant === 0
        ? "En Import & Export operamos importacion, exportacion y redistribucion regional desde Paraguay. Ventaja: una operacion integrada para escalar con menos friccion. Si me comparte producto, destino y volumen estimado, le doy una recomendacion inicial."
        : "Para este frente, la division Import & Export es la correcta. Ganancia principal: coordinacion comercial y logistica regional en una misma estructura. Si desea, preparo un encuadre rapido de su caso.";
    }
    if (wantsTech) {
      return variant === 1
        ? "Developer cubre IA, apps, plataformas web e integraciones empresariales. Beneficio: soluciones con foco en resultado de negocio y escalabilidad. Si me cuenta su objetivo tecnico, le propongo el mejor enfoque."
        : "Para tecnologia, activamos la division Developer. Punto fuerte: implementaciones practicas con arquitectura preparada para crecer. Si quiere, definimos alcance en dos o tres bloques.";
    }
    if (wantsCorporate) {
      return "Enterprise Solution atiende estructuracion corporativa en Paraguay, incluyendo EAS y activacion operativa segun el caso. Beneficio: ruta remota y organizada para iniciar operacion regional. Si me indica su pais de origen y actividad, le doy el siguiente paso.";
    }
    if (wantsPrice || wantsDeadline) {
      return "Precio final y plazo exacto dependen del alcance, documentacion y complejidad del caso. Ventaja: propuesta ajustada a su contexto real. Si desea, le ayudo a estructurar un brief corto para cotizacion.";
    }
    return variant === 2
      ? "Puedo orientarte en Import & Export, Developer o Enterprise Solution con enfoque ejecutivo. Dime tu objetivo principal y te propongo el camino mas eficiente."
      : "Estoy para ayudarte con una orientacion comercial directa en cualquiera de las divisiones. Si me dices tu meta, te doy recomendacion puntual.";
  }

  if (locale === "en") {
    if (wantsTrade) {
      return "Import & Export handles importing, exporting, and regional redistribution from Paraguay. Main benefit: integrated operations with lower expansion friction. Share product, target market, and expected volume and I will map the best next move.";
    }
    if (wantsTech) {
      return "Developer covers AI solutions, apps, web platforms, and enterprise integrations. Benefit: scalable delivery tied to business outcomes. If you share your technical objective, I can outline scope quickly.";
    }
    if (wantsCorporate) {
      return "Enterprise Solution supports corporate structuring in Paraguay, including EAS and operational activation when applicable. Benefit: a structured remote path to start regional operations. Share your business activity and origin country for a practical next step.";
    }
    if (wantsPrice || wantsDeadline) {
      return "Final pricing and exact timelines depend on scope complexity and documentation. Benefit: a proposal aligned with your real scenario. If you want, I can help structure a concise quote brief.";
    }
    return "I can support Import & Export, Developer, and Enterprise Solution with direct business guidance. Tell me your main goal and I will recommend the best path.";
  }

  if (wantsTrade) {
    return variant === 0
      ? "Na divisao Import & Export atuamos com importacao, exportacao e redistribuicao regional a partir do Paraguai. Beneficio principal: operacao integrada para acelerar expansao com menos friccao. Se me passar produto, destino e volume estimado, eu te direciono com precisao."
      : "Esse tema entra em Import & Export. Valor para voce: coordenacao comercial e logistica regional no mesmo fluxo. Posso te dar um plano inicial se me contar o objetivo comercial.";
  }
  if (wantsTech) {
    return variant === 1
      ? "Na divisao Developer trabalhamos com IA, apps, plataformas web e integracoes empresariais. Beneficio: solucao escalavel e orientada a resultado de negocio. Se voce me disser o problema principal, eu te proponho um escopo objetivo."
      : "Para tecnologia, a frente correta e a Developer. Diferencial: arquitetura pratica para evolucao continua. Se quiser, estruturamos o projeto em etapas curtas agora.";
  }
  if (wantsCorporate) {
    return "Na Enterprise Solution apoiamos estruturacao corporativa no Paraguai, incluindo EAS e ativacao operacional quando aplicavel. Beneficio: processo remoto e organizado para operar na regiao. Se me informar atividade e pais de origem, eu te passo o proximo passo.";
  }
  if (wantsPrice || wantsDeadline) {
    return "Preco final e prazo exato variam conforme escopo, documentacao e complexidade. Beneficio: proposta aderente ao seu cenario real. Se quiser, eu te ajudo a montar um briefing curto para orcamento.";
  }
  return variant === 2
    ? "Posso te orientar em Import & Export, Developer ou Enterprise Solution com foco executivo e resposta direta. Me diga seu objetivo principal e eu te dou o caminho."
    : "Consigo te apoiar com direcionamento comercial nas tres divisoes da holding. Compartilha a meta principal que eu te entrego uma recomendacao objetiva.";
}

function hasAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

async function requestDeepSeekWithRetry(
  apiKey: string,
  payload: object,
): Promise<unknown> {
  let lastStatus = 0;
  let lastBody = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (res.ok) {
      return res.json();
    }

    lastStatus = res.status;
    lastBody = await safeReadText(res);
    if (!isRetriableStatus(res.status) || attempt === MAX_RETRIES) {
      break;
    }
    await sleep(250 * attempt);
  }

  console.error("[atendimento] deepseek error", lastStatus, lastBody);
  throw new Error("deepseek_unavailable");
}

function isRetriableStatus(status: number): boolean {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

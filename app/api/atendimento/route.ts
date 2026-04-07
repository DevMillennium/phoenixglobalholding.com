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

type LeadStage = "descoberta" | "qualificacao" | "handoff";

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
    const stage = detectLeadStage(userMessage, history);
    const qualified = isQualifiedLead(userMessage, history);
    if (!apiKey) {
      logAtendimento({
        source: "fallback",
        locale,
        stage,
        qualified,
        message: userMessage,
      });
      return NextResponse.json({
        ok: true,
        answer: buildFallbackAnswer(userMessage, history, locale),
        source: "fallback",
        stage,
        qualified,
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
      logAtendimento({
        source: "fallback",
        locale,
        stage,
        qualified,
        message: userMessage,
      });
      return NextResponse.json({
        ok: true,
        answer: buildFallbackAnswer(userMessage, history, locale),
        source: "fallback",
        stage,
        qualified,
      });
    }

    logAtendimento({
      source: "deepseek",
      locale,
      stage,
      qualified,
      message: userMessage,
    });

    return NextResponse.json({
      ok: true,
      answer,
      source: "deepseek",
      stage,
      qualified,
    });
  } catch (error) {
    console.error("[atendimento] route error", error);
    const stage: LeadStage = "descoberta";
    const qualified = false;
    logAtendimento({
      source: "fallback",
      locale: "pt",
      stage,
      qualified,
      message: "",
    });
    return NextResponse.json(
      {
        ok: true,
        answer: buildFallbackAnswer("", [], "pt"),
        source: "fallback",
        stage,
        qualified,
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

function buildFallbackAnswer(
  message: string,
  history: ClientMessage[],
  locale: "pt" | "es" | "en",
): string {
  const lower = message.toLowerCase();
  const wantsTech = hasAny(lower, ["tech", "ia", "ai", "app", "plataforma", "developer", "software", "api"]);
  const wantsTrade = hasAny(lower, ["import", "export", "comercio", "trade", "logistica", "marketplace"]);
  const wantsCorporate = hasAny(lower, ["eas", "ruc", "paraguai", "paraguay", "societ", "corporat", "fiscal"]);
  const wantsPrice = hasAny(lower, ["preco", "precio", "price", "valor", "quanto", "cuanto", "cost"]);
  const wantsDeadline = hasAny(lower, ["prazo", "plazo", "deadline", "tempo", "time"]);
  const variant = Math.abs(message.length) % 3;
  const qualified = isQualifiedLead(message, history);

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
      return qualified
        ? "Enterprise Solution atiende estructuracion corporativa en Paraguay, incluyendo EAS y activacion operativa segun el caso. Su perfil ya esta bien encaminado para avanzar. Si quiere, lo conecto ahora con el equipo por WhatsApp: https://wa.me/595992799800"
        : "Enterprise Solution atiende estructuracion corporativa en Paraguay, incluyendo EAS y activacion operativa segun el caso. Para orientarte con precision, dime tu pais de origen y la actividad principal del negocio.";
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
      return qualified
        ? "Enterprise Solution supports corporate structuring in Paraguay, including EAS and operational activation when applicable. Your profile is already clear enough to move forward. If you want, I can connect you to our team on WhatsApp now: https://wa.me/595992799800"
        : "Enterprise Solution supports corporate structuring in Paraguay, including EAS and operational activation when applicable. To guide you precisely, share your business activity and origin country.";
    }
    if (wantsPrice || wantsDeadline) {
      return "Final pricing and exact timelines depend on scope complexity and documentation. Benefit: a proposal aligned with your real scenario. If you want, I can help structure a concise quote brief.";
    }
    return qualified
      ? "I can take this forward now with our specialist team. If you want immediate follow-up, we can continue on WhatsApp: https://wa.me/595992799800"
      : "I can support Import & Export, Developer, and Enterprise Solution with direct business guidance. Tell me your main goal and I will recommend the best path.";
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
    return qualified
      ? "Na Enterprise Solution apoiamos estruturacao corporativa no Paraguai, incluindo EAS e ativacao operacional quando aplicavel. Seu perfil ja esta bem qualificado para avancarmos. Se quiser, te conecto agora ao time no WhatsApp: https://wa.me/595992799800"
      : "Na Enterprise Solution apoiamos estruturacao corporativa no Paraguai, incluindo EAS e ativacao operacional quando aplicavel. Para te orientar com precisao, me diga sua atividade principal e pais de origem.";
  }
  if (wantsPrice || wantsDeadline) {
    return "Preco final e prazo exato variam conforme escopo, documentacao e complexidade. Beneficio: proposta aderente ao seu cenario real. Se quiser, eu te ajudo a montar um briefing curto para orcamento.";
  }
  if (qualified) {
    return "Perfeito, seu caso ja esta qualificado para avancarmos com atendimento especializado. Se quiser continuidade imediata, te encaminho agora no WhatsApp: https://wa.me/595992799800";
  }
  return variant === 2
    ? "Posso te orientar em Import & Export, Developer ou Enterprise Solution com foco executivo e resposta direta. Para eu te direcionar com precisao, qual e seu objetivo principal neste momento?"
    : "Consigo te apoiar com direcionamento comercial nas tres divisoes da holding. Me diga sua meta principal e o prazo que voce tem em mente.";
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

function isQualifiedLead(message: string, history: ClientMessage[]): boolean {
  const text = `${history.map((h) => h.content).join(" ")} ${message}`.toLowerCase();
  let score = 0;

  const hasObjective = hasAny(text, [
    "quero",
    "preciso",
    "objetivo",
    "projeto",
    "abrir",
    "estruturar",
    "implantar",
    "expandir",
    "i want",
    "need",
    "project",
    "quiero",
    "necesito",
    "proyecto",
  ]);
  if (hasObjective) score++;

  const hasScope = hasAny(text, [
    "import",
    "export",
    "developer",
    "ia",
    "app",
    "eas",
    "ruc",
    "enterprise",
    "maquila",
    "logistica",
  ]);
  if (hasScope) score++;

  const hasTimeline = hasAny(text, [
    "prazo",
    "urgente",
    "mes",
    "semana",
    "quando",
    "deadline",
    "timeline",
    "plazo",
    "urgente",
    "cuándo",
  ]);
  if (hasTimeline) score++;

  const hasBusinessProfile = hasAny(text, [
    "empresa",
    "sou",
    "represento",
    "investidor",
    "cfo",
    "ceo",
    "founder",
    "company",
    "empresa",
    "inversor",
  ]);
  if (hasBusinessProfile) score++;

  const hasReadinessSignal = hasAny(text, [
    "orcamento",
    "proposta",
    "reuniao",
    "chamada",
    "whatsapp",
    "email",
    "quote",
    "proposal",
    "meeting",
    "presupuesto",
    "propuesta",
    "reunion",
  ]);
  if (hasReadinessSignal) score++;

  return score >= 2;
}

function detectLeadStage(message: string, history: ClientMessage[]): LeadStage {
  const text = `${history.map((h) => h.content).join(" ")} ${message}`.toLowerCase();
  const qualified = isQualifiedLead(message, history);
  const asksHandoff = hasAny(text, [
    "whatsapp",
    "zap",
    "falar com humano",
    "atendente",
    "ligacao",
    "reuniao",
    "agendar",
    "chamada",
    "speak to team",
    "human support",
    "hablar con humano",
  ]);

  if (qualified && asksHandoff) return "handoff";
  if (qualified) return "qualificacao";
  return "descoberta";
}

function logAtendimento(args: {
  source: "deepseek" | "fallback";
  locale: "pt" | "es" | "en";
  stage: LeadStage;
  qualified: boolean;
  message: string;
}): void {
  const preview = args.message.replace(/\s+/g, " ").slice(0, 140);
  console.info(
    `[atendimento] source=${args.source} locale=${args.locale} stage=${args.stage} qualified=${args.qualified} message="${preview}"`,
  );
}

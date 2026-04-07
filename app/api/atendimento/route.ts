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
  const qualified = isQualifiedLead(message, history);
  const nextQuestion = nextQualificationQuestion(message, history, locale);

  if (locale === "es") {
    if (wantsTrade) {
      return qualified
        ? "En Import & Export de la holding estructuramos importacion, exportacion y redistribucion regional desde Paraguay con foco en eficiencia operativa y comercial. Tu caso ya tiene base para avanzar. Si quieres, te conecto con el equipo comercial para iniciar propuesta en WhatsApp: https://wa.me/595992799800"
        : `En Import & Export de la holding te ayudamos a estructurar importacion, exportacion y redistribucion regional desde Paraguay, con coordinacion operativa y comercial integrada. ${nextQuestion}`;
    }
    if (wantsTech) {
      return qualified
        ? "La division Developer de la holding cubre IA, apps, plataformas web e integraciones empresariales con enfoque de resultado y escalabilidad. Tu escenario ya esta bien encaminado para ejecucion. Si quieres, te paso ahora con el equipo en WhatsApp: https://wa.me/595992799800"
        : `La division Developer de la holding cubre IA, apps, plataformas web e integraciones empresariales. Enfoque: resolver problema de negocio con arquitectura escalable. ${nextQuestion}`;
    }
    if (wantsCorporate) {
      return qualified
        ? "Enterprise Solution de la holding cubre estructuracion corporativa en Paraguay (incluyendo EAS y activacion operativa segun el caso) con conduccion remota y segura. Tu caso ya esta listo para avance comercial. Si quieres, te conecto con el equipo en WhatsApp: https://wa.me/595992799800"
        : `Enterprise Solution de la holding cubre estructuracion corporativa en Paraguay (incluyendo EAS y activacion operativa segun el caso), siempre con conduccion de nuestra equipe. ${nextQuestion}`;
    }
    if (wantsPrice || wantsDeadline) {
      return `Precio final y plazo exacto dependen del alcance, documentacion y complejidad del caso; por eso trabajamos con estimacion guiada por la holding para evitar promesas irreales. ${nextQuestion}`;
    }
    return `Puedo orientarte con criterio consultivo en Import & Export, Developer o Enterprise Solution, siempre por la holding. ${nextQuestion}`;
  }

  if (locale === "en") {
    if (wantsTrade) {
      return qualified
        ? "Our holding's Import & Export division structures importing, exporting, and regional redistribution from Paraguay with integrated commercial and operational execution. Your case is already qualified to move forward. If you want, I can connect you to our team on WhatsApp now: https://wa.me/595992799800"
        : `Our holding's Import & Export division structures importing, exporting, and regional redistribution from Paraguay with integrated commercial and operational execution. ${nextQuestion}`;
    }
    if (wantsTech) {
      return qualified
        ? "Our Developer division handles AI solutions, apps, web platforms, and enterprise integrations with business-outcome focus. Your case is already qualified to proceed. If you want, I can connect you to our team on WhatsApp now: https://wa.me/595992799800"
        : `Our Developer division handles AI solutions, apps, web platforms, and enterprise integrations with business-outcome focus. ${nextQuestion}`;
    }
    if (wantsCorporate) {
      return qualified
        ? "Our Enterprise Solution division supports corporate structuring in Paraguay, including EAS and operational activation when applicable, led by our holding team. Your case is ready to move forward. If you want, I can connect you to our team on WhatsApp now: https://wa.me/595992799800"
        : `Our Enterprise Solution division supports corporate structuring in Paraguay, including EAS and operational activation when applicable, led by our holding team. ${nextQuestion}`;
    }
    if (wantsPrice || wantsDeadline) {
      return `Final pricing and exact timeline depend on scope complexity and documentation, so we provide a guided estimate through our holding team. ${nextQuestion}`;
    }
    return qualified
      ? "I can move this forward now with our specialist team. If you want immediate follow-up, we can continue on WhatsApp: https://wa.me/595992799800"
      : `I can support you with consultative guidance across Import & Export, Developer, and Enterprise Solution through our holding team. ${nextQuestion}`;
  }

  if (wantsTrade) {
    return qualified
      ? "Na divisao Import & Export da holding estruturamos importacao, exportacao e redistribuicao regional a partir do Paraguai com coordenacao comercial e operacional integrada. Seu caso ja esta qualificado para avancar. Se quiser, te conecto agora ao time no WhatsApp: https://wa.me/595992799800"
      : `Na divisao Import & Export da holding estruturamos importacao, exportacao e redistribuicao regional a partir do Paraguai, com condução direta da nossa equipe. ${nextQuestion}`;
  }
  if (wantsTech) {
    return qualified
      ? "Na divisao Developer da holding atuamos com IA, apps, plataformas web e integracoes empresariais com foco em resultado real. Seu caso ja tem elementos para avancar com o time. Se quiser, te encaminho no WhatsApp: https://wa.me/595992799800"
      : `Na divisao Developer da holding trabalhamos com IA, apps, plataformas web e integracoes empresariais para resolver problema de negocio com escalabilidade. ${nextQuestion}`;
  }
  if (wantsCorporate) {
    return qualified
      ? "Na Enterprise Solution da holding apoiamos estruturacao corporativa no Paraguai, incluindo EAS e ativacao operacional quando aplicavel, com condução pela nossa equipe. Seu perfil esta qualificado para avancar. Se quiser, te conecto agora ao time no WhatsApp: https://wa.me/595992799800"
      : `Na Enterprise Solution da holding apoiamos estruturacao corporativa no Paraguai, incluindo EAS e ativacao operacional quando aplicavel, sempre com orientacao da nossa equipe. ${nextQuestion}`;
  }
  if (wantsPrice || wantsDeadline) {
    return `Preco final e prazo exato variam conforme escopo, documentacao e complexidade; por isso a orientacao e feita pela holding, com criterio tecnico-comercial. ${nextQuestion}`;
  }
  if (qualified) {
    return "Perfeito, seu caso ja esta qualificado para avancarmos com atendimento especializado. Se quiser continuidade imediata, te encaminho agora no WhatsApp: https://wa.me/595992799800";
  }
  return `Consigo te orientar com criterio consultivo nas tres divisoes da holding e conduzir seu caso do inicio ao encaminhamento. ${nextQuestion}`;
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

function nextQualificationQuestion(
  message: string,
  history: ClientMessage[],
  locale: "pt" | "es" | "en",
): string {
  const text = `${history.map((h) => h.content).join(" ")} ${message}`.toLowerCase();
  const missingObjective = !hasAny(text, [
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
  const missingScope = !hasAny(text, [
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
  const missingTimeline = !hasAny(text, [
    "prazo",
    "urgente",
    "mes",
    "semana",
    "quando",
    "deadline",
    "timeline",
    "plazo",
    "cuándo",
  ]);
  const missingProfile = !hasAny(text, [
    "empresa",
    "sou",
    "represento",
    "investidor",
    "cfo",
    "ceo",
    "founder",
    "company",
    "inversor",
  ]);

  if (locale === "es") {
    if (missingObjective) return "Para orientarte con precision, cual es tu objetivo principal con este proyecto?";
    if (missingScope) return "Que frente quieres priorizar ahora: Import & Export, Developer o Enterprise Solution?";
    if (missingTimeline) return "En que ventana quieres iniciar: inmediato, 30 dias o 60+ dias?";
    if (missingProfile) return "Actuas como empresa, inversor o emprendedor individual?";
    return "Si te parece, avanzamos con una propuesta inicial y te explico el siguiente hito de ejecucion.";
  }

  if (locale === "en") {
    if (missingObjective) return "To guide you precisely, what is your primary objective with this project?";
    if (missingScope) return "Which front should we prioritize now: Import & Export, Developer, or Enterprise Solution?";
    if (missingTimeline) return "What is your target start window: immediate, 30 days, or 60+ days?";
    if (missingProfile) return "Are you acting as a company, investor, or individual entrepreneur?";
    return "If you agree, we can move to an initial proposal and I will map the next execution milestone.";
  }

  if (missingObjective) return "Para te orientar com precisao, qual e o objetivo principal deste projeto?";
  if (missingScope) return "Qual frente voce quer priorizar agora: Import & Export, Developer ou Enterprise Solution?";
  if (missingTimeline) return "Qual e sua janela de inicio: imediato, 30 dias ou acima de 60 dias?";
  if (missingProfile) return "Voce esta conduzindo isso como empresa, investidor ou empreendedor individual?";
  return "Se fizer sentido para voce, avancamos para uma proposta inicial e eu te explico o proximo marco de execucao.";
}

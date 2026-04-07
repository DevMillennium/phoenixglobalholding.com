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
type LeadDivision = "import_export" | "developer" | "enterprise_solution" | "general";

type LeadAssessment = {
  division: LeadDivision;
  score: number;
  threshold: number;
  qualified: boolean;
  asksHandoff: boolean;
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
    const assessment = assessLead(userMessage, history);
    const stage = detectLeadStage(assessment);
    const qualified = assessment.qualified;
    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        error: "Atendimento indisponivel no momento. Tente novamente em instantes.",
        source: "error",
        stage,
        qualified,
      }, { status: 503 });
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
        ok: false,
        error: "Nao foi possivel concluir a resposta agora. Tente novamente.",
        source: "error",
        stage,
        qualified,
      }, { status: 502 });
    }

    const governedAnswer = enforceLeadPolicy(
      answer,
      assessment,
      locale,
      userMessage,
      history,
    );

    logAtendimento({
      source: "deepseek",
      locale,
      stage,
      qualified,
      message: userMessage,
    });

    return NextResponse.json({
      ok: true,
      answer: governedAnswer,
      source: "deepseek",
      stage,
      qualified,
      score: assessment.score,
      threshold: assessment.threshold,
      division: assessment.division,
    });
  } catch (error) {
    console.error("[atendimento] route error", error);
    const stage: LeadStage = "descoberta";
    const qualified = false;
    return NextResponse.json(
      {
        ok: false,
        error: "Atendimento indisponivel no momento. Tente novamente em instantes.",
        source: "error",
        stage,
        qualified,
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

function normalizeLocale(locale?: string): "pt" | "es" | "en" {
  if (locale === "es" || locale === "en" || locale === "pt") return locale;
  return "pt";
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

function assessLead(message: string, history: ClientMessage[]): LeadAssessment {
  const text = `${history.map((h) => h.content).join(" ")} ${message}`.toLowerCase();
  const division = detectDivision(text);
  const threshold = division === "general" ? 3 : 4;
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

  return {
    division,
    score,
    threshold,
    qualified: score >= threshold,
    asksHandoff,
  };
}

function detectLeadStage(assessment: LeadAssessment): LeadStage {
  if (assessment.qualified && assessment.asksHandoff) return "handoff";
  if (assessment.qualified) return "qualificacao";
  return "descoberta";
}

function logAtendimento(args: {
  source: "deepseek" | "error";
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

function detectDivision(text: string): LeadDivision {
  if (hasAny(text, ["eas", "ruc", "enterprise solution", "societ", "paraguai", "paraguay"])) {
    return "enterprise_solution";
  }
  if (hasAny(text, ["ia", "ai", "app", "aplicativo", "plataforma", "software", "api", "developer"])) {
    return "developer";
  }
  if (hasAny(text, ["import", "export", "logistica", "aduana", "marketplace", "comercio"])) {
    return "import_export";
  }
  return "general";
}

function enforceLeadPolicy(
  answer: string,
  assessment: LeadAssessment,
  locale: "pt" | "es" | "en",
  message: string,
  history: ClientMessage[],
): string {
  if (assessment.qualified) return answer;

  const withoutWhatsApp = answer
    .replace(/https?:\/\/wa\.me\/\d+/gi, "")
    .replace(/whatsapp/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const nextQuestion = buildNextQuestion(assessment, locale, message, history);
  if (withoutWhatsApp.length === 0) return nextQuestion;
  if (withoutWhatsApp.includes("?")) return withoutWhatsApp;
  return `${withoutWhatsApp} ${nextQuestion}`.trim();
}

function buildNextQuestion(
  assessment: LeadAssessment,
  locale: "pt" | "es" | "en",
  message: string,
  history: ClientMessage[],
): string {
  const text = `${history.map((h) => h.content).join(" ")} ${message}`.toLowerCase();
  const missingObjective = !hasAny(text, ["quero", "preciso", "objetivo", "projeto", "i want", "need", "project", "quiero", "necesito", "proyecto"]);
  const missingScope = !hasAny(text, ["import", "export", "developer", "ia", "ai", "app", "eas", "ruc", "enterprise", "maquila", "logistica"]);
  const missingTimeline = !hasAny(text, ["prazo", "urgente", "mes", "semana", "quando", "deadline", "timeline", "plazo", "cuándo"]);
  const missingProfile = !hasAny(text, ["empresa", "sou", "represento", "investidor", "cfo", "ceo", "founder", "company", "inversor"]);

  if (locale === "es") {
    if (missingObjective) return "¿Cuál es tu objetivo principal con este proyecto?";
    if (missingScope) return "¿Qué frente quieres priorizar: Import & Export, Developer o Enterprise Solution?";
    if (missingTimeline) return "¿En qué ventana deseas iniciar: inmediato, 30 días o 60+ días?";
    if (missingProfile) return "¿Actúas como empresa, inversor o emprendedor individual?";
    return assessment.division === "developer"
      ? "¿Cuál es el principal resultado de negocio que esperas con esta solución de IA?"
      : "¿Cuál sería el siguiente hito que te gustaría ejecutar primero?";
  }

  if (locale === "en") {
    if (missingObjective) return "What is your primary objective with this project?";
    if (missingScope) return "Which front do you want to prioritize: Import & Export, Developer, or Enterprise Solution?";
    if (missingTimeline) return "What is your target start window: immediate, 30 days, or 60+ days?";
    if (missingProfile) return "Are you acting as a company, investor, or individual entrepreneur?";
    return assessment.division === "developer"
      ? "What business outcome should this AI solution deliver first?"
      : "What execution milestone would you like to prioritize first?";
  }

  if (missingObjective) return "Qual e o objetivo principal desse projeto para voce?";
  if (missingScope) return "Qual frente voce quer priorizar: Import & Export, Developer ou Enterprise Solution?";
  if (missingTimeline) return "Qual e sua janela de inicio: imediato, 30 dias ou acima de 60 dias?";
  if (missingProfile) return "Voce atua como empresa, investidor ou empreendedor individual?";
  return assessment.division === "developer"
    ? "Qual resultado de negocio voce quer que essa solucao de IA entregue primeiro?"
    : "Qual e o primeiro marco de execucao que voce quer priorizar agora?";
}

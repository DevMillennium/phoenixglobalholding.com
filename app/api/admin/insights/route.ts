import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-session";
import { buildInsightsContextMarkdown } from "@/lib/admin-stats";
import { deepseekChat } from "@/lib/deepseek-client";

const SYSTEM = `És o analista estratégico do painel institucional da Phoenix Global Holding.
Recebes dados agregados (eventos de clique/CTA, leads, estados) do site.
Objetivo: recomendações acionáveis para aumentar conversão, qualidade de leads e performance comercial, sempre alinhadas a um site institucional B2B sério.
Regras:
- Escreve em português europeu (PT-PT) claro e profissional.
- Não inventes números que não estejam no contexto.
- Estrutura: (1) Resumo executivo (2) Oportunidades (3) Riscos ou fricção (4) Plano de 30 dias com passos concretos (5) Métricas a acompanhar.
- Não és assessor jurídico nem fiscal; evita alegações legais.
- Máximo ~900 palavras.`;

export async function POST() {
  const ctx = await getAdminSession();
  if (!ctx) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const context = await buildInsightsContextMarkdown();
    const periodKey = new Date().toISOString().slice(0, 7);

    const content = await deepseekChat({
      system: SYSTEM,
      user: `Contexto de dados reais do painel:\n\n${context}\n\nGera o relatório estratégico.`,
      temperature: 0.35,
    });

    await prisma.insightReport.upsert({
      where: { periodKey },
      create: { periodKey, contentMd: content, model: "deepseek-chat" },
      update: { contentMd: content, model: "deepseek-chat" },
    });

    await prisma.auditLog.create({
      data: {
        userId: ctx.user.id,
        action: "generate_insights",
        resource: "insight_report",
        metadata: { periodKey },
      },
    });

    return NextResponse.json({ ok: true, content, periodKey });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro";
    console.error("[admin/insights]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}

export async function GET() {
  const ctx = await getAdminSession();
  if (!ctx) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const periodKey = new Date().toISOString().slice(0, 7);
  try {
    const row = await prisma.insightReport.findUnique({ where: { periodKey } });
    return NextResponse.json({
      ok: true,
      periodKey,
      content: row?.contentMd ?? null,
    });
  } catch (e) {
    console.error("[admin/insights GET]", e);
    return NextResponse.json({ ok: false, error: "db" }, { status: 503 });
  }
}

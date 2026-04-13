import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    events7,
    events30,
    leads7,
    leads30,
    leadsByStatus,
    topEvents,
    recentLeads,
  ] = await Promise.all([
    prisma.analyticsEvent.count({ where: { createdAt: { gte: d7 } } }),
    prisma.analyticsEvent.count({ where: { createdAt: { gte: d30 } } }),
    prisma.lead.count({ where: { createdAt: { gte: d7 } } }),
    prisma.lead.count({ where: { createdAt: { gte: d30 } } }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["name"],
      where: { createdAt: { gte: d30 }, type: "click" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 12,
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        intent: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const clickCtas = topEvents.map((e) => ({
    name: e.name,
    count: e._count.id,
  }));

  return {
    period: { from: d30.toISOString(), to: now.toISOString() },
    events: { last7d: events7, last30d: events30 },
    leads: { last7d: leads7, last30d: leads30 },
    leadsByStatus: Object.fromEntries(
      leadsByStatus.map((r) => [r.status, r._count.id]),
    ) as Record<string, number>,
    topClicks: clickCtas,
    recentLeads,
  };
}

export async function buildInsightsContextMarkdown(): Promise<string> {
  const s = await getDashboardStats();
  const lines: string[] = [
    "## Dados agregados (Phoenix Global Holding — painel)",
    `- Eventos registados (7d / 30d): ${s.events.last7d} / ${s.events.last30d}`,
    `- Leads (7d / 30d): ${s.leads.last7d} / ${s.leads.last30d}`,
    `- Leads por estado: ${JSON.stringify(s.leadsByStatus)}`,
    `- Top cliques (CTA / eventos nomeados, 30d):`,
    ...s.topClicks.map((c) => `  - ${c.name}: ${c.count}`),
    `- Últimos leads (amostra):`,
    ...s.recentLeads.map(
      (l) =>
        `  - ${l.createdAt.toISOString().slice(0, 10)} | ${l.intent} | ${l.company} | ${l.status}`,
    ),
  ];
  return lines.join("\n");
}

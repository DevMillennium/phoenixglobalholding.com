import { getAdminSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InsightsGenerateButton } from "@/components/admin/insights-generate-button";

export default async function AdminInsightsPage() {
  const ctx = await getAdminSession();
  if (!ctx) redirect("/admin/login");

  const periodKey = new Date().toISOString().slice(0, 7);
  let content: string | null = null;
  try {
    const row = await prisma.insightReport.findUnique({ where: { periodKey } });
    content = row?.contentMd ?? null;
  } catch {
    content = null;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Insights estratégicos (IA)</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#9ca3af]">
        Relatório gerado com DeepSeek a partir dos dados reais do painel (eventos, leads, CTAs).
        Usa a mesma chave <code className="text-xs text-[#e8b44f]">DEEPSEEK_API_KEY</code> do
        assistente Lany.
      </p>
      <div className="mt-6">
        <InsightsGenerateButton hasCached={Boolean(content)} />
      </div>
      <article className="mt-10 max-w-none rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-sm leading-relaxed sm:p-8">
        {content ? (
          <div className="whitespace-pre-wrap text-[#d1d5db]">{content}</div>
        ) : (
          <p className="text-[#6b7280]">
            Ainda não há relatório para {periodKey}. Gere acima (requer API DeepSeek configurada).
          </p>
        )}
      </article>
    </div>
  );
}

import { getAdminSession } from "@/lib/admin-session";
import { getDashboardStats } from "@/lib/admin-stats";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const ctx = await getAdminSession();
  if (!ctx) redirect("/admin/login");

  let stats: Awaited<ReturnType<typeof getDashboardStats>> | null = null;
  let dbError = false;
  try {
    stats = await getDashboardStats();
  } catch {
    dbError = true;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Dashboard executivo</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#9ca3af]">
        Olá, {ctx.user.name || ctx.user.email} · {ctx.user.role}. Resumo operacional e
        conversão (dados reais do painel).
      </p>

      {dbError ? (
        <p className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Base de dados indisponível. Configure <code className="text-xs">DATABASE_URL</code> e
          execute <code className="text-xs">npx prisma migrate deploy</code>.
        </p>
      ) : stats ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Eventos (7 dias)" value={stats.events.last7d} />
          <StatCard label="Eventos (30 dias)" value={stats.events.last30d} />
          <StatCard label="Leads (7 dias)" value={stats.leads.last7d} />
          <StatCard label="Leads (30 dias)" value={stats.leads.last30d} />
          <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#e8b44f]">
              Top cliques (CTA) · 30 dias
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#c4c8d4]">
              {stats.topClicks.length === 0 ? (
                <li className="text-[#6b7280]">Sem eventos ainda — navegue no site para popular.</li>
              ) : (
                stats.topClicks.map((c) => (
                  <li key={c.name} className="flex justify-between gap-4">
                    <span className="font-mono text-xs">{c.name}</span>
                    <span>{c.count}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent px-5 py-4">
      <p className="text-xs text-[#9ca3af]">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

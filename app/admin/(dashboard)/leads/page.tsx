import { getAdminSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminLeadsPage() {
  const ctx = await getAdminSession();
  if (!ctx) redirect("/admin/login");

  let leads: Awaited<ReturnType<typeof prisma.lead.findMany>> = [];
  try {
    leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  } catch {
    leads = [];
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Leads</h1>
      <p className="mt-2 text-sm text-[#9ca3af]">
        Pedidos de contacto gravados após envio bem-sucedido do formulário.
      </p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/[0.08] bg-white/[0.04] text-xs uppercase tracking-wider text-[#9ca3af]">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Intenção</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#6b7280]">
                  Nenhum lead ainda.
                </td>
              </tr>
            ) : (
              leads.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-4 py-3 text-[#c4c8d4]">
                    {l.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="px-4 py-3 text-white">{l.company}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${l.email}`} className="text-[#6eb3ff] hover:underline">
                      {l.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-[#c4c8d4]">{l.intent}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#e8b44f]">{l.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { canExport, getAdminSession } from "@/lib/admin-session";
import { canCreateUsers } from "@/lib/admin-guards";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const ctx = await getAdminSession();
  const showUsers = ctx ? canCreateUsers(ctx.user.role) : false;
  const showExportLeads = ctx ? canExport(ctx.user.role) : false;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050608]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/admin"
              className="font-display text-lg font-semibold tracking-tight text-[#e8b44f]"
            >
              Phoenix · Painel
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm text-[#9ca3af]">
              <Link href="/admin" className="hover:text-white">
                Dashboard
              </Link>
              <Link href="/admin/leads" className="hover:text-white">
                Leads
              </Link>
              {showExportLeads ? (
                <a
                  href="/api/admin/leads/export"
                  className="hover:text-white"
                  download
                >
                  Exportar CSV
                </a>
              ) : null}
              <Link href="/admin/insights" className="hover:text-white">
                Insights IA
              </Link>
              {showUsers ? (
                <Link href="/admin/users" className="hover:text-white">
                  Utilizadores
                </Link>
              ) : null}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-[#9ca3af] hover:text-white"
              target="_blank"
              rel="noreferrer"
            >
              Ver site
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </>
  );
}

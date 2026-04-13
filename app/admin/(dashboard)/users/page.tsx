import { getAdminSession } from "@/lib/admin-session";
import { assignableRoles, canCreateUsers } from "@/lib/admin-guards";
import { redirect } from "next/navigation";
import { UsersPanel } from "./users-panel";

export default async function AdminUsersPage() {
  const ctx = await getAdminSession();
  if (!ctx) redirect("/admin/login");
  if (!canCreateUsers(ctx.user.role)) {
    redirect("/admin");
  }

  const roles = assignableRoles(ctx.user.role);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Utilizadores</h1>
      <p className="mt-2 text-sm text-[#9ca3af]">
        Criar contas de acesso ao painel. Apenas papéis permitidos pelo seu nível.
      </p>
      <div className="mt-8">
        <UsersPanel assignableRoles={roles} />
      </div>
    </div>
  );
}

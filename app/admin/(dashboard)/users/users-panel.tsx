"use client";

import { useCallback, useEffect, useState } from "react";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  active: boolean;
  createdAt: string;
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Administrador",
  ANALYST: "Analista",
  VIEWER: "Leitura",
};

export function UsersPanel({
  assignableRoles,
}: {
  assignableRoles: string[];
}) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState(assignableRoles[0] ?? "ANALYST");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = (await res.json()) as { ok?: boolean; users?: UserRow[] };
      if (!res.ok || !data.users) throw new Error("Não foi possível carregar.");
      setUsers(data.users);
    } catch {
      setError("Erro ao carregar utilizadores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined, role }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar.");
        return;
      }
      setEmail("");
      setPassword("");
      setName("");
      await load();
    } catch {
      setError("Erro de rede.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Novo utilizador</h2>
        <p className="mt-1 text-sm text-[#9ca3af]">
          Palavra-passe com pelo menos 10 caracteres.
        </p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs text-[#9ca3af]">E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/[0.12] bg-[#0c0e12] px-3 py-2 text-sm text-white outline-none focus:border-[#e8b44f]/50"
            />
          </label>
          <label className="block">
            <span className="text-xs text-[#9ca3af]">Palavra-passe</span>
            <input
              type="password"
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/[0.12] bg-[#0c0e12] px-3 py-2 text-sm text-white outline-none focus:border-[#e8b44f]/50"
            />
          </label>
          <label className="block">
            <span className="text-xs text-[#9ca3af]">Nome (opcional)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/[0.12] bg-[#0c0e12] px-3 py-2 text-sm text-white outline-none focus:border-[#e8b44f]/50"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-[#9ca3af]">Papel</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/[0.12] bg-[#0c0e12] px-3 py-2 text-sm text-white outline-none focus:border-[#e8b44f]/50"
            >
              {assignableRoles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r] ?? r}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className="text-sm text-red-400 sm:col-span-2">{error}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#e8b44f] px-4 py-2 text-sm font-medium text-[#0a0b0d] hover:bg-[#f0c56a] disabled:opacity-50 sm:col-span-2 sm:w-fit"
          >
            {saving ? "A guardar…" : "Criar utilizador"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-white">Lista</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/[0.08] bg-white/[0.04] text-xs uppercase tracking-wider text-[#9ca3af]">
              <tr>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3">Ativo</th>
                <th className="px-4 py-3">Criado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-[#6b7280]">
                    A carregar…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-[#6b7280]">
                    Sem utilizadores.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white">{u.email}</td>
                    <td className="px-4 py-3 text-[#c4c8d4]">
                      {ROLE_LABELS[u.role] ?? u.role}
                    </td>
                    <td className="px-4 py-3 text-[#c4c8d4]">{u.active ? "Sim" : "Não"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#9ca3af]">
                      {new Date(u.createdAt).toLocaleString("pt-PT")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

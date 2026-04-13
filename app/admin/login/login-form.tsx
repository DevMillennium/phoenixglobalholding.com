"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function AdminLoginForm() {
  const params = useSearchParams();
  const setup = params.get("setup") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Falha no login");
        return;
      }
      // Navegação completa garante que o cookie httpOnly definido na resposta é enviado no GET /admin
      // (router.push cliente por vezes corre antes do cookie ficar disponível para o próximo pedido).
      window.location.assign("/admin");
    } catch {
      setError("Erro de rede");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/[0.1] bg-white/[0.04] p-8 shadow-2xl">
        <p className="font-display text-xl font-semibold text-[#e8b44f]">Phoenix · Painel</p>
        <h1 className="mt-2 text-lg text-white">Entrar</h1>
        {setup ? (
          <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            Configure <code className="text-[10px]">ADMIN_JWT_SECRET</code> (≥32 caracteres) e
            a base de dados. Crie o primeiro utilizador com{" "}
            <code className="text-[10px]">node scripts/seed-admin.mjs</code>.
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9ca3af]">E-mail</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-[#0a0c10] px-3 py-2.5 text-sm text-white outline-none focus:border-[#e8b44f]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9ca3af]">Palavra-passe</label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-[#0a0c10] px-3 py-2.5 text-sm text-white outline-none focus:border-[#e8b44f]/50"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#e8b44f] py-3 text-sm font-semibold text-[#07080c] hover:bg-[#f0c65c] disabled:opacity-50"
          >
            {loading ? "A entrar…" : "Entrar"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-[#6b7280]">
          <Link href="/" className="hover:text-[#e8b44f]">
            Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}

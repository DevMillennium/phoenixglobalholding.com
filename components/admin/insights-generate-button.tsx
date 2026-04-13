"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function InsightsGenerateButton({ hasCached }: { hasCached: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/insights", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Falha ao gerar");
        return;
      }
      router.refresh();
    } catch {
      setError("Erro de rede");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <button
        type="button"
        disabled={loading}
        onClick={() => void generate()}
        className="inline-flex rounded-full bg-[#e8b44f] px-6 py-2.5 text-sm font-semibold text-[#07080c] transition hover:bg-[#f0c65c] disabled:opacity-50"
      >
        {loading ? "A gerar…" : hasCached ? "Regenerar relatório (mês)" : "Gerar relatório estratégico"}
      </button>
      {error ? <span className="text-sm text-red-400">{error}</span> : null}
    </div>
  );
}

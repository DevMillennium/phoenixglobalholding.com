"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const LABELS: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Contactado",
  QUALIFIED: "Qualificado",
  WON: "Ganho",
  LOST: "Perdido",
};

type Props = {
  leadId: string;
  status: string;
  readOnly?: boolean;
};

export function LeadStatusSelect({ leadId, status, readOnly }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  if (readOnly) {
    return (
      <span className="font-mono text-xs text-[#e8b44f]">
        {LABELS[status] ?? status}
      </span>
    );
  }

  async function onChange(next: string) {
    setValue(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar");
      router.refresh();
    } catch {
      setValue(status);
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      className="rounded-lg border border-white/[0.12] bg-[#0c0e12] px-2 py-1 font-mono text-xs text-[#e8b44f] outline-none focus:border-[#e8b44f]/50"
      value={value}
      disabled={busy}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Estado do lead"
    >
      {Object.entries(LABELS).map(([k, label]) => (
        <option key={k} value={k}>
          {label}
        </option>
      ))}
    </select>
  );
}

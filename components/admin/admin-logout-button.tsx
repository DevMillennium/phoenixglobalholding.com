"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-[#e8e9ed] hover:bg-white/5"
    >
      Sair
    </button>
  );
}

import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getDashboardStats } from "@/lib/admin-stats";

export async function GET() {
  const ctx = await getAdminSession();
  if (!ctx) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ ok: true, stats });
  } catch (e) {
    console.error("[admin/stats]", e);
    return NextResponse.json({ ok: false, error: "db" }, { status: 500 });
  }
}

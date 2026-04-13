import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-session";

export async function GET(req: Request) {
  const ctx = await getAdminSession();
  if (!ctx) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get("take")) || 50, 200);
  const status = searchParams.get("status");

  const where = status
    ? { status: status as "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST" }
    : {};

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
  });

  return NextResponse.json({ ok: true, leads });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canExport, getAdminSession } from "@/lib/admin-session";

function csvEscape(s: string): string {
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const ctx = await getAdminSession();
  if (!ctx || !canExport(ctx.user.role)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "id",
    "createdAt",
    "name",
    "email",
    "company",
    "phone",
    "intent",
    "status",
    "sourcePath",
    "message",
  ].join(",");

  const rows = leads.map((l) =>
    [
      l.id,
      l.createdAt.toISOString(),
      l.name,
      l.email,
      l.company,
      l.phone ?? "",
      l.intent,
      l.status,
      l.sourcePath ?? "",
      l.message.replace(/\r?\n/g, " ").slice(0, 2000),
    ]
      .map((c) => csvEscape(String(c)))
      .join(","),
  );

  const body = [header, ...rows].join("\n");

  await prisma.auditLog.create({
    data: {
      userId: ctx.user.id,
      action: "leads_export_csv",
      resource: "leads",
      metadata: { count: leads.length },
    },
  });

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="phoenix-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

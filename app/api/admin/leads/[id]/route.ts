import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-session";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"]).optional(),
  notes: z.string().max(5000).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const ctx = await getAdminSession();
  if (!ctx) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (ctx.user.role === "VIEWER") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const { id } = await params;
  const json = (await req.json()) as unknown;
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: ctx.user.id,
      action: "lead_update",
      resource: id,
      metadata: { status: lead.status },
    },
  });

  return NextResponse.json({ ok: true, lead });
}

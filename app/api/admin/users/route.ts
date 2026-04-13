import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-session";
import {
  assertAssignable,
  canCreateUsers,
} from "@/lib/admin-guards";
import type { AdminRole } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(200),
  name: z.string().max(120).optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "ANALYST", "VIEWER"]),
});

export async function GET() {
  const ctx = await getAdminSession();
  if (!ctx || !canCreateUsers(ctx.user.role)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, users });
}

export async function POST(req: Request) {
  const ctx = await getAdminSession();
  if (!ctx || !canCreateUsers(ctx.user.role)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const json = (await req.json()) as unknown;
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }

  const { email, password, name, role } = parsed.data;
  if (!assertAssignable(ctx.user.role, role as AdminRole)) {
    return NextResponse.json(
      { ok: false, error: "Não pode atribuir este papel." },
      { status: 403 },
    );
  }

  const exists = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (exists) {
    return NextResponse.json({ ok: false, error: "E-mail já registado." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.create({
    data: {
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name?.trim() || null,
      role: role as AdminRole,
    },
    select: { id: true, email: true, role: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: ctx.user.id,
      action: "user_create",
      resource: user.id,
      metadata: { email: user.email, role: user.role },
    },
  });

  return NextResponse.json({ ok: true, user });
}

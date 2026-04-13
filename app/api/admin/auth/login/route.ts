import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAdminToken, adminCookieName } from "@/lib/admin-jwt";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

const loginAttempts = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 20;

function allowLogin(ip: string): boolean {
  const now = Date.now();
  const arr = (loginAttempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_ATTEMPTS) {
    loginAttempts.set(ip, arr);
    return false;
  }
  arr.push(now);
  loginAttempts.set(ip, arr);
  return true;
}

function isDbConnectionError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes("Can't reach database") ||
    msg.includes("P1001") ||
    msg.includes("P1017") ||
    msg.includes("SQLITE_CANTOPEN") ||
    msg.includes("ENOENT") ||
    msg.includes("PrismaClientInitializationError") ||
    msg.includes("Server has closed the connection")
  );
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip")?.trim() ||
      "unknown";
    if (!allowLogin(ip)) {
      return NextResponse.json(
        { ok: false, error: "Muitas tentativas. Aguarde." },
        { status: 429 },
      );
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Pedido inválido." }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
    }

    const { email, password } = parsed.data;

    let user: Awaited<ReturnType<typeof prisma.adminUser.findUnique>>;
    try {
      user = await prisma.adminUser.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch (e) {
      console.error("[admin login] prisma findUnique", e);
      if (isDbConnectionError(e)) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Base de dados indisponível. Confirme DATABASE_URL, migrações (prisma migrate deploy) e rede.",
          },
          { status: 503 },
        );
      }
      throw e;
    }

    if (!user || !user.active) {
      return NextResponse.json({ ok: false, error: "Credenciais inválidas." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Credenciais inválidas." }, { status: 401 });
    }

    let token: string;
    try {
      token = await signAdminToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    } catch {
      return NextResponse.json(
        { ok: false, error: "Servidor sem ADMIN_JWT_SECRET configurada." },
        { status: 503 },
      );
    }

    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "login",
          resource: "session",
          ipMasked: ip.slice(0, 12) + "…",
        },
      });
    } catch (e) {
      console.error("[admin login] auditLog (login continua)", e);
    }

    const res = NextResponse.json({
      ok: true,
      user: { email: user.email, name: user.name, role: user.role },
    });
    res.cookies.set(adminCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error("[admin login]", e);
    const hint =
      process.env.NODE_ENV === "development" && e instanceof Error
        ? ` ${e.message}`
        : "";
    return NextResponse.json(
      { ok: false, error: `Erro no servidor.${hint ? ` (${hint.slice(0, 200)})` : ""}` },
      { status: 500 },
    );
  }
}

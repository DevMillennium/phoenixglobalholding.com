import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime/library";
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

function isPrismaClientError(e: unknown): boolean {
  return (
    e instanceof PrismaClientInitializationError ||
    e instanceof PrismaClientKnownRequestError ||
    e instanceof PrismaClientUnknownRequestError ||
    e instanceof PrismaClientRustPanicError
  );
}

/** Resposta HTTP para falhas de Prisma (nunca deixa cair no catch genérico). */
function responseForDbError(e: unknown, context: string) {
  const dev = process.env.NODE_ENV === "development";
  console.error(`[admin login] ${context}`, e);

  if (isPrismaClientError(e)) {
    const code = e instanceof PrismaClientKnownRequestError ? e.code : "";
    const suffix = dev ? ` (${e instanceof Error ? e.name : "?"}${code ? ` ${code}` : ""})` : "";
    return NextResponse.json(
      {
        ok: false,
        error:
          "Base de dados: ligação ou consulta falhou. Na Vercel use Postgres em DATABASE_URL, defina variáveis e execute prisma migrate deploy no deploy." +
          suffix,
      },
      { status: 503 },
    );
  }

  const msg = e instanceof Error ? e.message : String(e);
  return NextResponse.json(
    {
      ok: false,
      error: dev
        ? `Base de dados: ${msg.slice(0, 400)}`
        : "Não foi possível aceder à base de dados. Confirme DATABASE_URL e migrações.",
    },
    { status: 503 },
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
      return responseForDbError(e, "prisma findUnique");
    }

    if (!user || !user.active) {
      return NextResponse.json({ ok: false, error: "Credenciais inválidas." }, { status: 401 });
    }

    let passwordOk: boolean;
    try {
      passwordOk = await bcrypt.compare(password, user.passwordHash);
    } catch (e) {
      console.error("[admin login] bcrypt.compare", e);
      return NextResponse.json(
        { ok: false, error: "Erro ao validar a palavra-passe (dados do utilizador corruptos?)." },
        { status: 500 },
      );
    }

    if (!passwordOk) {
      return NextResponse.json({ ok: false, error: "Credenciais inválidas." }, { status: 401 });
    }

    let token: string;
    try {
      token = await signAdminToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (e) {
      console.error("[admin login] signAdminToken", e);
      return NextResponse.json(
        {
          ok: false,
          error:
            "Servidor sem ADMIN_JWT_SECRET válida (mín. 32 caracteres). Configure na Vercel em Environment Variables.",
        },
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
    try {
      res.cookies.set(adminCookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    } catch (e) {
      console.error("[admin login] cookies.set", e);
      return NextResponse.json(
        { ok: false, error: "Erro ao definir sessão (cookie). Tente noutro browser ou em janela privada." },
        { status: 500 },
      );
    }
    return res;
  } catch (e) {
    console.error("[admin login] inesperado", e);
    const dev = process.env.NODE_ENV === "development";
    const msg = e instanceof Error ? e.message.slice(0, 300) : String(e).slice(0, 300);
    return NextResponse.json(
      {
        ok: false,
        error: dev
          ? `Erro inesperado: ${msg}`
          : "Erro inesperado no servidor. Veja os logs (Vercel → Functions) ou tente mais tarde.",
      },
      { status: 500 },
    );
  }
}

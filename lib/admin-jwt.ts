import { SignJWT, jwtVerify } from "jose";
import type { AdminRole } from "@prisma/client";

const COOKIE = "phx_admin";
const TTL = 60 * 60 * 24 * 7; // 7 dias

function getSecret(): Uint8Array {
  const raw = process.env.ADMIN_JWT_SECRET?.trim();
  if (!raw || raw.length < 32) {
    throw new Error("ADMIN_JWT_SECRET em falta ou curta (mín. 32 caracteres).");
  }
  return new TextEncoder().encode(raw);
}

export type AdminTokenPayload = {
  sub: string;
  email: string;
  role: AdminRole;
};

export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${TTL}s`)
    .sign(getSecret());
}

export async function verifyAdminToken(
  token: string,
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    const sub = payload.sub;
    const email = typeof payload.email === "string" ? payload.email : null;
    const role = payload.role as AdminRole | undefined;
    if (!sub || !email || !role) return null;
    return { sub, email, role };
  } catch {
    return null;
  }
}

export const adminCookieName = COOKIE;

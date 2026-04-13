import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { adminCookieName, verifyAdminToken } from "@/lib/admin-jwt";

export async function POST() {
  try {
    const jar = await cookies();
    const raw = jar.get(adminCookieName)?.value;
    if (raw) {
      const t = await verifyAdminToken(raw);
      if (t) {
        await prisma.auditLog.create({
          data: {
            userId: t.sub,
            action: "logout",
            resource: "session",
          },
        });
      }
    }
  } catch {
    /* ignore */
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

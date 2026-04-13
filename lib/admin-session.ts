import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { adminCookieName, verifyAdminToken, type AdminTokenPayload } from "@/lib/admin-jwt";
import type { AdminRole, AdminUser } from "@prisma/client";

export type AdminContext = {
  token: AdminTokenPayload;
  user: AdminUser;
};

export async function getAdminSession(): Promise<AdminContext | null> {
  const jar = await cookies();
  const raw = jar.get(adminCookieName)?.value;
  if (!raw) return null;
  const token = await verifyAdminToken(raw);
  if (!token) return null;
  const user = await prisma.adminUser.findUnique({
    where: { id: token.sub, active: true },
  });
  if (!user) return null;
  return { token, user };
}

export function canManageUsers(role: AdminRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canExport(role: AdminRole): boolean {
  return role !== "VIEWER";
}

export function canViewInsights(role: AdminRole): boolean {
  return true;
}

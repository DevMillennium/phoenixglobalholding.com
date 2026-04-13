import type { AdminRole } from "@prisma/client";

export function isSuperAdmin(role: AdminRole): boolean {
  return role === "SUPER_ADMIN";
}

/** Quem pode criar utilizadores no painel. */
export function canCreateUsers(role: AdminRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

/** Papéis que este utilizador pode atribuir a novos utilizadores. */
export function assignableRoles(actor: AdminRole): AdminRole[] {
  if (actor === "SUPER_ADMIN") {
    return ["SUPER_ADMIN", "ADMIN", "ANALYST", "VIEWER"];
  }
  if (actor === "ADMIN") {
    return ["ANALYST", "VIEWER"];
  }
  return [];
}

export function assertAssignable(actor: AdminRole, target: AdminRole): boolean {
  return assignableRoles(actor).includes(target);
}

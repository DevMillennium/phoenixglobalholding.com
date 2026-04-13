/**
 * Garante DIRECT_URL antes do Prisma (schema exige ambas).
 * Se só existir DATABASE_URL (Docker local ou config simples), replica.
 * Supabase em produção: defina DIRECT_URL = non-pooling explicitamente.
 */
export function register() {
  const u = process.env.DATABASE_URL?.trim();
  if (u && !process.env.DIRECT_URL?.trim()) {
    process.env.DIRECT_URL = u;
  }
}

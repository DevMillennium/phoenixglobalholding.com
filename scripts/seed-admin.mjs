/**
 * Cria o primeiro utilizador admin (bcrypt + Prisma).
 * Uso: DATABASE_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/seed-admin.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD?.trim();

if (!email || !password || password.length < 10) {
  console.error("Defina ADMIN_EMAIL e ADMIN_PASSWORD (mín. 10 caracteres).");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.upsert({
    where: { email },
    create: {
      email,
      passwordHash: hash,
      name: "Administrador",
      role: "SUPER_ADMIN",
    },
    update: {
      passwordHash: hash,
      role: "SUPER_ADMIN",
      active: true,
    },
  });
  console.log("OK:", user.email, user.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

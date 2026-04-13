/**
 * Configura .env.local (DATABASE_URL + ADMIN_JWT_SECRET), corre migrações,
 * cria o primeiro SUPER_ADMIN (só se ainda não existir ninguém) e grava credenciais em .admin-primeiro-acesso.txt.
 *
 * Uso: na raiz do projeto: npm run db:primeiro-acesso
 */
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envLocal = path.join(root, ".env.local");
const credFile = path.join(root, ".admin-primeiro-acesso.txt");

const defaultEmail = "admin@phoenixglobalholding.com";

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function ensureEnvLocal() {
  let existing = "";
  if (fs.existsSync(envLocal)) {
    existing = fs.readFileSync(envLocal, "utf8");
  }

  const lines = existing.split(/\r?\n/).filter(Boolean);
  const has = (key) => lines.some((l) => l.startsWith(`${key}=`));

  const toAdd = [];
  const localPg = "postgresql://phoenix:phoenix@localhost:5432/phoenix";
  if (!has("DATABASE_URL")) {
    toAdd.push(`DATABASE_URL="${localPg}"`);
  }
  if (!has("DIRECT_URL")) {
    toAdd.push(`DIRECT_URL="${localPg}"`);
  }
  if (!has("ADMIN_JWT_SECRET")) {
    const jwtSecret = crypto.randomBytes(32).toString("hex");
    toAdd.push(`ADMIN_JWT_SECRET="${jwtSecret}"`);
  }

  if (toAdd.length) {
    const block = `\n# Primeiro acesso (gerado por scripts/primeiro-acesso.mjs)\n${toAdd.join("\n")}\n`;
    fs.appendFileSync(envLocal, (existing.endsWith("\n") || !existing ? "" : "\n") + block, "utf8");
    console.log("Atualizado .env.local (DATABASE_URL, DIRECT_URL e/ou ADMIN_JWT_SECRET).");
  } else {
    console.log(".env.local já continha as chaves necessárias (nada acrescentado).");
  }
}

async function main() {
  process.chdir(root);
  ensureEnvLocal();
  parseEnvFile(envLocal);

  console.log("A executar prisma migrate deploy…");
  execSync("npx prisma migrate deploy", { stdio: "inherit", env: { ...process.env } });

  const prisma = new PrismaClient();
  const count = await prisma.adminUser.count();
  await prisma.$disconnect();

  if (count > 0) {
    console.log(
      "Já existe pelo menos um utilizador admin. Não foi criado novo primeiro acesso nem alterada palavra-passe.",
    );
    return;
  }

  const password = crypto.randomBytes(16).toString("base64url");
  console.log("A criar primeiro administrador…");
  execSync("node scripts/seed-admin.mjs", {
    stdio: "inherit",
    env: {
      ...process.env,
      ADMIN_EMAIL: defaultEmail,
      ADMIN_PASSWORD: password,
    },
  });

  const body = [
    "Phoenix Holding — primeiro acesso ao painel /admin",
    "",
    `E-mail: ${defaultEmail}`,
    `Palavra-passe: ${password}`,
    "",
    `Gerado: ${new Date().toISOString()}`,
    "",
    "Guarde estes dados em gestor de palavras-passe e apague este ficheiro.",
    "O ficheiro .admin-primeiro-acesso.txt está no .gitignore.",
  ].join("\n");

  fs.writeFileSync(credFile, body, "utf8");
  console.log("");
  console.log("Credenciais gravadas em .admin-primeiro-acesso.txt (não vai para o Git).");
  console.log("Inicie o servidor com: npm run dev  →  http://localhost:3000/admin/login");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

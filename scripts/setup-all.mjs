#!/usr/bin/env node
/**
 * Configuração automática local: .env.local, Docker Postgres (se aplicável),
 * prisma generate, migrate deploy, ADMIN_JWT_SECRET mínimo.
 *
 * Uso: npm run setup
 * Supabase/Vercel: copie as URLs para .env.local (ou use vercel env pull).
 */
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { loadProjectEnv, projectRoot } from "./load-env.mjs";

const envLocal = path.join(projectRoot, ".env.local");
const envExample = path.join(projectRoot, ".env.example");

function ensureEnvLocalFile() {
  if (fs.existsSync(envLocal)) return;
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envLocal);
    console.log("✓ Criado .env.local a partir de .env.example\n");
  } else {
    const fallback = `# Gerado por npm run setup\nDATABASE_URL="postgresql://phoenix:phoenix@localhost:5432/phoenix"\nDIRECT_URL="postgresql://phoenix:phoenix@localhost:5432/phoenix"\n`;
    fs.writeFileSync(envLocal, fallback, "utf8");
    console.log("✓ Criado .env.local mínimo (Postgres local Docker)\n");
  }
}

function appendIfMissing(key, value) {
  let text = fs.existsSync(envLocal) ? fs.readFileSync(envLocal, "utf8") : "";
  const lines = text.split(/\r?\n/);
  const has = lines.some((l) => l.trim().startsWith(`${key}=`));
  if (has) return false;
  const escaped = String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const block = `\n# setup-all.mjs\n${key}="${escaped}"\n`;
  fs.appendFileSync(envLocal, (text.endsWith("\n") || !text ? "" : "\n") + block, "utf8");
  return true;
}

function tryDockerPostgres() {
  const url = process.env.DATABASE_URL || "";
  if (!/localhost|127\.0\.0\.1/.test(url)) {
    console.log("→ DATABASE_URL não é localhost — a saltar Docker.\n");
    return;
  }
  try {
    execSync("docker info", { stdio: "ignore" });
  } catch {
    console.warn("→ Docker não disponível. Arranque Postgres manualmente ou use Supabase.\n");
    return;
  }
  try {
    console.log("→ A subir Postgres (docker compose up -d)…\n");
    execSync("docker compose up -d", { stdio: "inherit", cwd: projectRoot, env: process.env });
    console.log("");
  } catch {
    console.warn("→ docker compose falhou — verifique o Docker Desktop.\n");
  }
}

function main() {
  console.log("Phoenix — configuração automática\n");

  ensureEnvLocalFile();
  loadProjectEnv();

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("Defina DATABASE_URL em .env.local (ex.: Supabase ou postgresql://phoenix:phoenix@localhost:5432/phoenix).");
    process.exit(1);
  }

  if (!process.env.ADMIN_JWT_SECRET?.trim() || process.env.ADMIN_JWT_SECRET.length < 32) {
    const secret = crypto.randomBytes(32).toString("hex");
    appendIfMissing("ADMIN_JWT_SECRET", secret);
    loadProjectEnv();
    console.log("✓ ADMIN_JWT_SECRET gerado e guardado em .env.local\n");
  }

  tryDockerPostgres();
  loadProjectEnv();

  console.log("→ prisma generate…\n");
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });

  console.log("→ prisma migrate deploy…\n");
  execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });

  console.log(`
✓ Pronto.

  Desenvolvimento:  npm run dev
  Painel:           http://localhost:3000/admin/login

  Primeiro admin (só se a BD estiver vazia):
    npm run db:primeiro-acesso

  Ou com e-mail/palavra-passe à escolha:
    ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:seed

  Produção (Vercel): defina DATABASE_URL, DIRECT_URL e ADMIN_JWT_SECRET no painel;
  o build já corre migrações (npm run build).
`);
}

main();

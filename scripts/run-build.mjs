/**
 * Build de produção: carrega .env.local / .env (como o Next.js) para o Prisma ver DATABASE_URL,
 * depois migrate deploy + next build. Na Vercel as variáveis já vêm no ambiente.
 */
import { config } from "dotenv";
import { execSync } from "node:child_process";
import fs from "node:fs";

// Não sobrescrever variáveis já definidas (ex.: CI / Vercel).
if (fs.existsSync(".env.local")) {
  config({ path: ".env.local", override: false });
}
if (fs.existsSync(".env")) {
  config({ path: ".env", override: false });
}

const dbUrl = process.env.DATABASE_URL?.trim();
if (dbUrl && !process.env.DIRECT_URL?.trim()) {
  process.env.DIRECT_URL = dbUrl;
}

execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
execSync("npx next build", { stdio: "inherit", env: process.env });

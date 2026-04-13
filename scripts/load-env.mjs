/**
 * Alinhado ao Next.js: .env primeiro, depois .env.local com prioridade (override).
 * Assim chaves só em .env (ex.: DEEPSEEK) não ficam bloqueadas por .env.local parcial.
 * Replica DATABASE_URL → DIRECT_URL se DIRECT_URL estiver vazio.
 */
import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(__dirname, "..");

export function loadProjectEnv() {
  process.chdir(projectRoot);
  const envFile = path.join(projectRoot, ".env");
  const local = path.join(projectRoot, ".env.local");

  if (fs.existsSync(envFile)) {
    config({ path: envFile, override: false });
  }
  if (fs.existsSync(local)) {
    config({ path: local, override: true });
  }

  const u = process.env.DATABASE_URL?.trim();
  if (u && !process.env.DIRECT_URL?.trim()) {
    process.env.DIRECT_URL = u;
  }
}

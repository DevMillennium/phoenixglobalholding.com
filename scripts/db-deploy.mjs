#!/usr/bin/env node
/** prisma migrate deploy com .env.local carregado + fallback DIRECT_URL */
import { execSync } from "node:child_process";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();
execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });

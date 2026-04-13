#!/usr/bin/env node
/** npm run db:seed com carregamento de .env.local */
import { execSync } from "node:child_process";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();
execSync("node scripts/seed-admin.mjs", { stdio: "inherit", env: process.env });

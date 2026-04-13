#!/usr/bin/env node
/**
 * Reencoda phoenix-hero.mov → MP4 (H.264) + WebM (VP9) com máxima qualidade por tamanho.
 * Uso: node scripts/encode-phoenix-hero.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ffmpegPath from "ffmpeg-static";
import ffprobeMod from "ffprobe-static";

const ffprobePath =
  typeof ffprobeMod === "string" ? ffprobeMod : ffprobeMod.path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const pub = path.join(root, "public/divisions/developer");
const input = path.join(pub, "phoenix-hero.mov");
const outMp4 = path.join(pub, "phoenix-hero.mp4");
const outWebm = path.join(pub, "phoenix-hero.webm");

function run(bin, args) {
  const r = spawnSync(bin, args, { stdio: "inherit", encoding: "utf8" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (!fs.existsSync(input)) {
  console.error("Falta:", input);
  process.exit(1);
}

if (!ffmpegPath || !ffprobePath) {
  console.error("ffmpeg-static ou ffprobe-static indisponível.");
  process.exit(1);
}

// Mantém resolução de origem; só limita largura máxima se for 4K+ (evita ficheiros desnecessários para web)
const probe = spawnSync(
  ffprobePath,
  [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "csv=s=x:p=0",
    input,
  ],
  { encoding: "utf8" },
);
const dims = probe.stdout?.trim().split("x").map(Number) ?? [];
const w = dims[0] || 1920;
const h = dims[1] || 1080;
const maxW = 1920;
const vf =
  w > maxW
    ? `scale=${maxW}:-2:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p`
    : "format=yuv420p";

console.log(`Origem: ${w}x${h} → filtro: ${vf}`);

// H.264: CRF baixo = mais qualidade; preset slow = melhor compressão
run(ffmpegPath, [
  "-y",
  "-i",
  input,
  "-vf",
  vf,
  "-c:v",
  "libx264",
  "-preset",
  "slow",
  "-crf",
  "18",
  "-profile:v",
  "high",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  "-an",
  outMp4,
]);

// VP9: bom para web, ficheiro tipicamente menor que H.264 ao mesmo nível visual
run(ffmpegPath, [
  "-y",
  "-i",
  input,
  "-vf",
  vf,
  "-c:v",
  "libvpx-vp9",
  "-crf",
  "28",
  "-b:v",
  "0",
  "-row-mt",
  "1",
  "-an",
  outWebm,
]);

for (const f of [outMp4, outWebm]) {
  const st = fs.statSync(f);
  console.log(path.basename(f), (st.size / (1024 * 1024)).toFixed(2), "MB");
}

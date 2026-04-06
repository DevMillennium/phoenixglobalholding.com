import fs from "fs";
import path from "path";

const EXT = /\.(png|svg|webp|jpe?g)$/i;

/** Logos em `public/partners/` — só ficheiros reais; se a pasta estiver vazia, retorna []. */
export function getPartnerLogoFiles(): string[] {
  const dir = path.join(process.cwd(), "public", "partners");
  try {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => EXT.test(f) && !f.startsWith("."));
  } catch {
    return [];
  }
}

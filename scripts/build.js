import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

await rm(dist, { force: true, recursive: true });
await mkdir(dist, { recursive: true });

for (const entry of ["index.html", "public", "src", "sw.js", "supabase.config.js"]) {
  await cp(join(root, entry), join(dist, entry), { recursive: true });
}

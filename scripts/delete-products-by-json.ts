/**
 * Borra de Supabase los productos cuyos `id` aparecen en un JSON array (mismo formato que generan los build-*).
 *
 *   npx tsx scripts/delete-products-by-json.ts data/generated-usados-plancha.json --dry-run
 *   npx tsx scripts/delete-products-by-json.ts data/generated-usados-plancha.json --yes
 *
 * Requiere .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnvLocal() {
  const p = join(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

function extractProductIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const ids: string[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const id = (x as { id?: unknown }).id;
    if (typeof id === "string" && id.trim()) ids.push(id.trim());
  }
  return ids;
}

async function deleteByIds(supabase: SupabaseClient, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from("products").delete().in("id", ids);
  if (error) throw new Error(error.message);
}

async function main() {
  loadEnvLocal();
  const dry = process.argv.includes("--dry-run");
  const yes = process.argv.includes("--yes");
  const jsonPath =
    process.argv.find((a) => a.endsWith(".json") && !a.includes("--")) ??
    join(process.cwd(), "data/generated-usados-plancha.json");

  if (!existsSync(jsonPath)) {
    console.error(`No existe: ${jsonPath}`);
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(jsonPath, "utf8")) as unknown;
  const ids = extractProductIds(raw);
  if (ids.length === 0) {
    console.error("No se encontraron ids de producto en el JSON.");
    process.exit(1);
  }

  console.log(`Archivo: ${jsonPath}`);
  console.log(`IDs a borrar (${ids.length}):`);
  ids.forEach((id) => console.log(`  ${id}`));

  if (dry) {
    console.log("\n[--dry-run] No se borró nada. Ejecutá con --yes para confirmar.");
    process.exit(0);
  }

  if (!yes) {
    console.error("\nAgregá --yes para borrar esas filas en public.products.\n");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (.env.local).");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await deleteByIds(supabase, ids);
  console.log(`Listo. Se eliminaron ${ids.length} productos.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

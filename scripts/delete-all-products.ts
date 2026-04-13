/**
 * Borra **todas** las filas de `public.products` (service role).
 *
 * No toca `content_entries` (ej. `home.featured` puede seguir con IDs viejos: limpiálos a mano si hace falta).
 * No borra archivos en Storage; las URLs quedarán rotas hasta que borres objetos en el bucket.
 *
 * Requiere `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
 *
 *   npx tsx scripts/delete-all-products.ts --dry-run   # solo cuenta y muestra muestra
 *   npx tsx scripts/delete-all-products.ts --yes       # borra de verdad
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BATCH = 500;

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

async function countProducts(supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function fetchIdBatch(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.from("products").select("id").limit(BATCH);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => String((r as { id: string }).id));
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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (.env.local).");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const total = await countProducts(supabase);
  console.log(`Productos en la base: ${total}`);

  if (total === 0) {
    console.log("Nada que borrar.");
    process.exit(0);
  }

  if (dry) {
    const sample = await fetchIdBatch(supabase);
    console.log("\n[--dry-run] Primeros IDs (máx. " + BATCH + "):");
    sample.slice(0, 15).forEach((id) => console.log("  ", id));
    if (sample.length > 15) console.log("  …");
    console.log("\nSin --dry-run y con --yes se borrarían todas las filas.");
    process.exit(0);
  }

  if (!yes) {
    console.error(
      "\nOperación destructiva. Ejecutá de nuevo con --yes para confirmar:\n  npx tsx scripts/delete-all-products.ts --yes\n",
    );
    process.exit(1);
  }

  let removed = 0;
  for (;;) {
    const ids = await fetchIdBatch(supabase);
    if (ids.length === 0) break;
    await deleteByIds(supabase, ids);
    removed += ids.length;
    console.log(`Eliminados ${removed} / ~${total}…`);
    if (ids.length < BATCH) break;
  }

  const left = await countProducts(supabase);
  console.log(left === 0 ? `Listo. Tabla products vacía (${removed} filas).` : `Quedan ${left} filas (revisá errores o RLS).`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

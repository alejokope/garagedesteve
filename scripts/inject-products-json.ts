/**
 * Carga un array de productos (mismo shape que genera build-products-from-price-tsv.ts)
 * en Supabase `public.products` vía upsert por `id`.
 *
 * Requiere en .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 *   npx tsx scripts/inject-products-json.ts
 *   npx tsx scripts/inject-products-json.ts data/generated-nuevos-plancha.json
 *   npx tsx scripts/inject-products-json.ts --dry-run
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

function normalizeForDb(row: Record<string, unknown>): Record<string, unknown> {
  const out = { ...row };
  if (!Array.isArray(out.gallery_images)) out.gallery_images = [];
  if (out.sellable_variants == null) out.sellable_variants = [];
  if (out.variant_groups == null) out.variant_groups = [];
  if (out.detail == null) out.detail = {};

  const id = typeof out.id === "string" ? out.id : "";
  if (id.startsWith("usado-")) {
    out.stock_condition = "used";
    if (out.badge == null || String(out.badge).trim() === "") out.badge = "Usado";
  }

  return out;
}

async function upsertChunk(supabase: SupabaseClient, rows: Record<string, unknown>[]) {
  const { error } = await supabase.from("products").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

async function main() {
  loadEnvLocal();
  const dry = process.argv.includes("--dry-run");
  const pathArg = process.argv.find((a) => a.endsWith(".json") && !a.includes("--"));
  const jsonPath = pathArg ?? join(process.cwd(), "data/generated-nuevos-plancha.json");

  if (!existsSync(jsonPath)) {
    console.error(`No existe el archivo: ${jsonPath}`);
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(jsonPath, "utf8")) as unknown;
  if (!Array.isArray(raw)) {
    console.error("El JSON debe ser un array de productos.");
    process.exit(1);
  }

  const payloads = raw
    .filter((x) => x && typeof x === "object")
    .map((x) => normalizeForDb(x as Record<string, unknown>));

  console.log(`Archivo: ${jsonPath} → ${payloads.length} productos`);

  if (dry) {
    console.log("\n[--dry-run] Primer ítem normalizado:\n");
    console.log(JSON.stringify(payloads[0], null, 2));
    process.exit(0);
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

  const chunk = 40;
  for (let i = 0; i < payloads.length; i += chunk) {
    const slice = payloads.slice(i, i + chunk);
    await upsertChunk(supabase, slice);
    console.log(`Upsert ${i + 1}–${Math.min(i + chunk, payloads.length)} / ${payloads.length}`);
  }

  console.log("Listo. Revisá el catálogo en la tienda o en Supabase → Table Editor → products.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

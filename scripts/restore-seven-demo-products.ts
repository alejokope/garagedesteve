/**
 * Borra todos los productos y carga los 7 iPhones de demo (snapshot histórico del seed demo).
 *
 *   npx tsx scripts/restore-seven-demo-products.ts --dry-run
 *   npx tsx scripts/restore-seven-demo-products.ts --yes
 *
 * Requiere .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const IMG =
  "https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80";

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

/** Los 7 primeros INSERT de `supabase/seed/demo_products.sql` (catálogo chico de prueba). */
const SEVEN = [
  {
    id: "an-iphone-13-128gb-560-a-confirmar",
    name: "iPhone 13 128GB",
    short: "A confirmar según stock · Oficial 12 meses",
    category: "iphone",
    price: 560,
    badge: "Nuevo sellado",
    variant_groups: [] as unknown[],
    sort_order: 0,
  },
  {
    id: "an-iphone-14",
    name: "iPhone 14",
    short: "Elegí capacidad u opciones abajo · precios en USD",
    category: "iphone",
    price: 600,
    badge: "Nuevo sellado",
    variant_groups: [
      {
        id: "almacenamiento",
        kind: "storage",
        uiKind: "storage",
        label: "Capacidad",
        pricingMode: "absolute",
        options: [
          { id: "an-iphone-14-128gb-600-a-confirmar", label: "128GB", price: 600 },
          { id: "an-iphone-14-512gb-710-a-confirmar", label: "512GB", price: 710 },
        ],
      },
    ],
    sort_order: 1,
  },
  {
    id: "an-iphone-15",
    name: "iPhone 15",
    short: "Elegí capacidad u opciones abajo · precios en USD",
    category: "iphone",
    price: 700,
    badge: "Nuevo sellado",
    variant_groups: [
      {
        id: "almacenamiento",
        kind: "storage",
        uiKind: "storage",
        label: "Capacidad",
        pricingMode: "absolute",
        options: [
          { id: "an-iphone-15-128gb-700-a-confirmar", label: "128GB", price: 700 },
          { id: "an-iphone-15-256gb-770-a-confirmar", label: "256GB", price: 770 },
        ],
      },
    ],
    sort_order: 2,
  },
  {
    id: "an-iphone-15-plus",
    name: "iPhone 15 PLUS",
    short: "Elegí capacidad u opciones abajo · precios en USD",
    category: "iphone",
    price: 790,
    badge: "Nuevo sellado",
    variant_groups: [
      {
        id: "almacenamiento",
        kind: "storage",
        uiKind: "storage",
        label: "Capacidad",
        pricingMode: "absolute",
        options: [
          { id: "an-iphone-15-plus-128gb-790-a-confirmar", label: "128GB", price: 790 },
          { id: "an-iphone-15-plus-512gb-880-a-confirmar", label: "512GB", price: 880 },
        ],
      },
    ],
    sort_order: 3,
  },
  {
    id: "an-iphone-16-128gb-780-a-confirmar",
    name: "iPhone 16 128GB",
    short: "A confirmar según stock · Oficial 12 meses",
    category: "iphone",
    price: 780,
    badge: "Nuevo sellado",
    variant_groups: [],
    sort_order: 4,
  },
  {
    id: "an-iphone-16-plus-128gb-920-a-confirmar",
    name: "iPhone 16 PLUS 128GB",
    short: "A confirmar según stock · Oficial 12 meses",
    category: "iphone",
    price: 920,
    badge: "Nuevo sellado",
    variant_groups: [],
    sort_order: 5,
  },
  {
    id: "an-iphone-16-pro-128gb-1110-a-confirmar",
    name: "iPhone 16 PRO 128GB",
    short: "A confirmar según stock · Oficial 12 meses",
    category: "iphone",
    price: 1110,
    badge: "Nuevo sellado",
    variant_groups: [],
    sort_order: 6,
  },
];

const BATCH = 500;

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

async function deleteAllProducts(supabase: SupabaseClient): Promise<number> {
  let removed = 0;
  for (;;) {
    const ids = await fetchIdBatch(supabase);
    if (ids.length === 0) break;
    await deleteByIds(supabase, ids);
    removed += ids.length;
    if (ids.length < BATCH) break;
  }
  return removed;
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

  const before = await countProducts(supabase);
  console.log(`Productos actuales: ${before}`);
  console.log(`Se cargarán ${SEVEN.length} productos demo:\n${SEVEN.map((p) => `  - ${p.id}`).join("\n")}`);

  if (dry) {
    console.log("\n[--dry-run] Sin cambios. Usá --yes para borrar todo e insertar los 7.");
    process.exit(0);
  }

  if (!yes) {
    console.error(
      "\nOperación destructiva (borra todos los productos). Confirmá con:\n  npx tsx scripts/restore-seven-demo-products.ts --yes\n",
    );
    process.exit(1);
  }

  const removed = await deleteAllProducts(supabase);
  console.log(`Eliminados ${removed} producto(s).`);

  const rows = SEVEN.map((p) => ({
    id: p.id,
    name: p.name,
    short: p.short,
    category: p.category,
    brand: null as string | null,
    price: p.price,
    stock_condition: "new" as const,
    badge: p.badge,
    image: IMG,
    image_alt: "Producto",
    gallery_images: [] as string[],
    variant_groups: p.variant_groups,
    sellable_variants: [] as unknown[],
    detail: null as unknown,
    compare_at_price: null as number | null,
    discount_percent: null as number | null,
    published: true,
    sort_order: p.sort_order,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("products").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(error.message);

  const after = await countProducts(supabase);
  console.log(`Listo. Productos en la base: ${after} (esperado ${SEVEN.length}).`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

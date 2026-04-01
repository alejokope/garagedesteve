/**
 * Inyecta solo iphone-nuevos + resto-apples-nuevos. Para **todos** los JSON de newdata usá
 * `scripts/inject-all-newdata.ts` o `npm run inject:newdata:all`.
 *
 * Inyecta productos desde data/newdata/*.json a Supabase (tabla public.products).
 *
 * Requiere en .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 *   npx tsx scripts/inject-newdata-products.ts           # upsert real
 *   npx tsx scripts/inject-newdata-products.ts --dry-run
 *
 * Los precios del JSON son referenciales en USD (la tienda hoy formatea como ARS;
 * ajustá cotización o formato si hace falta). El campo stock del JSON se ignora.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type Opt = { value: string; price?: number; sku?: string; stock?: unknown };

type RawRow = {
  product: string;
  model?: string | null;
  chip?: string;
  screen?: string;
  ram?: string;
  processor?: string;
  color?: string;
  storage?: string;
  status?: string;
  warranty?: string;
  options?: Record<string, Opt[]>;
  price?: number;
  sku?: string;
};

type VariantGroup = {
  id: string;
  kind: string;
  uiKind: "storage" | "select" | "color";
  label: string;
  pricingMode: "absolute" | "delta";
  options: { id: string; label: string; price?: number; priceDelta?: number }[];
};

const OPTION_KEY_ORDER = ["storage", "ram", "screen", "color"] as const;

const KEY_LABEL: Record<string, string> = {
  storage: "Capacidad",
  ram: "Memoria",
  screen: "Tamaño",
  color: "Color",
};

const PRODUCT_LABEL: Record<string, string> = {
  IPHONE: "iPhone",
  IPAD: "iPad",
  MACBOOK: "MacBook",
  "APPLE WATCH": "Apple Watch",
  IMAC: "iMac",
  AIRPODS: "AirPods",
};

const CATEGORY_MAP: Record<string, string> = {
  IPHONE: "iphone",
  IPAD: "ipad",
  MACBOOK: "mac",
  "APPLE WATCH": "watch",
  IMAC: "desktop",
  AIRPODS: "audio",
};

const PLACEHOLDER_IMAGE: Record<string, string> = {
  iphone: "https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80",
  mac: "https://images.unsplash.com/photo-1517336714731-489689fd4ca8?w=800&q=80",
  ipad: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
  watch: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80",
  desktop: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
  audio: "https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80",
  otros: "https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80",
};

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

function slug(s: string): string {
  const t = String(s)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/["""''`´]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return t || "x";
}

function titleModel(s: string): string {
  return String(s)
    .trim()
    .split(/\s+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

function warrantyPretty(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function isOptArray(x: unknown): x is Opt[] {
  return (
    Array.isArray(x) &&
    x.every((o) => o != null && typeof o === "object" && typeof (o as Opt).value === "string")
  );
}

function minPriceFromRow(row: RawRow, groups: VariantGroup[]): number {
  let m = Infinity;
  if (typeof row.price === "number" && !Number.isNaN(row.price)) m = Math.min(m, row.price);
  for (const g of groups) {
    if (g.pricingMode !== "absolute") continue;
    for (const o of g.options) {
      if (typeof o.price === "number") m = Math.min(m, o.price);
    }
  }
  if (!Number.isFinite(m)) return 0;
  return m;
}

function buildVariantGroups(row: RawRow): VariantGroup[] {
  const groups: VariantGroup[] = [];
  const opts = row.options;

  for (const key of OPTION_KEY_ORDER) {
    const arr = opts?.[key];
    if (!isOptArray(arr) || arr.length === 0) continue;

    const hasPrice = arr.some((o) => typeof o.price === "number" && !Number.isNaN(o.price));

    if (key === "color" && !hasPrice) {
      groups.push({
        id: "color",
        kind: "select",
        uiKind: "select",
        label: KEY_LABEL.color,
        pricingMode: "delta",
        options: arr.map((o, i) => ({
          id: slug(o.sku || `color-${o.value}-${i}`),
          label: titleModel(o.value),
          priceDelta: 0,
        })),
      });
      continue;
    }

    if (!hasPrice) continue;

    const ui: "storage" | "select" = key === "storage" ? "storage" : "select";
    groups.push({
      id: key,
      kind: key === "storage" ? "storage" : "select",
      uiKind: ui,
      label: KEY_LABEL[key] ?? key,
      pricingMode: "absolute",
      options: arr.map((o, i) => ({
        id: slug(o.sku || `${key}-${slug(o.value)}-${i}`),
        label: o.value,
        price: o.price as number,
      })),
    });
  }

  const hasColorGroup = groups.some((g) => g.id === "color");
  if (row.color?.trim() && !hasColorGroup) {
    groups.push({
      id: "color",
      kind: "select",
      uiKind: "select",
      label: KEY_LABEL.color,
      pricingMode: "delta",
      options: [
        {
          id: slug(row.color),
          label: titleModel(row.color),
          priceDelta: 0,
        },
      ],
    });
  }

  return groups;
}

function buildDescriptionItems(row: RawRow): string[] {
  const lines: string[] = [];
  if (row.chip) lines.push(`Chip ${row.chip}.`);
  if (row.screen) lines.push(`Pantalla ${row.screen}.`);
  if (row.ram) lines.push(`${row.ram}.`);
  if (row.processor) lines.push(`GPU / CPU: ${row.processor}.`);
  if (row.storage && row.options) lines.push(`Almacenamiento fijo: ${row.storage}.`);
  if (row.storage && !row.options && typeof row.price === "number")
    lines.push(`Almacenamiento: ${row.storage}.`);
  lines.push("Precios expresados en USD como referencia; consultá cotización del día.");
  return lines;
}

function buildProductId(row: RawRow, used: Set<string>): string {
  let base: string;
  if (!row.options && row.sku) {
    base = `nuevo-${slug(row.sku)}`;
  } else {
    const parts = [
      row.product,
      row.model ?? "base",
      row.chip,
      row.screen,
      row.ram,
      row.processor,
      row.storage,
    ].filter((x) => x != null && String(x).trim() !== "");
    base = `nuevo-${parts.map((p) => slug(String(p))).join("-")}`.replace(/-+/g, "-");
  }
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n++}`;
  }
  used.add(id);
  return id;
}

function rowToPayload(row: RawRow, sortOrder: number, usedIds: Set<string>) {
  const product = String(row.product || "").toUpperCase();
  const category = CATEGORY_MAP[product] ?? "otros";
  const pretty = PRODUCT_LABEL[product] ?? titleModel(product);
  const model = row.model == null || String(row.model).trim() === "" ? "" : String(row.model).trim();
  const name = model ? `${pretty} ${titleModel(model)}` : pretty;

  const variantGroups = buildVariantGroups(row);
  const price = minPriceFromRow(row, variantGroups);
  const warranty = row.warranty?.trim() ? warrantyPretty(row.warranty) : "";
  const descriptionItems = buildDescriptionItems(row);
  const longDescription = descriptionItems.join("\n\n");

  const detail = {
    images: [] as string[],
    longDescription,
    descriptionItems,
    ...(warranty ? { warranty } : {}),
    specs: [] as unknown[],
    relatedIds: [] as string[],
    accessoryIds: [] as string[],
    reviews: [] as unknown[],
  };

  const id = buildProductId(row, usedIds);
  const stock_condition = row.status === "used" ? "used" : "new";

  return {
    id,
    name,
    short: `${warranty || "Consultá garantía"} · Precios referencia USD`,
    category,
    brand: null as string | null,
    price,
    stock_condition,
    badge: "Nuevo sellado",
    image: PLACEHOLDER_IMAGE[category] ?? PLACEHOLDER_IMAGE.otros,
    image_alt: name,
    variant_groups: variantGroups,
    detail,
    compare_at_price: null as number | null,
    discount_percent: null as number | null,
    published: true,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  };
}

function readRows(): RawRow[] {
  const dir = join(process.cwd(), "data/newdata");
  const paths = [
    join(dir, "iphone-nuevos.json"),
    join(dir, "resto-apples-nuevos.json"),
  ];
  const out: RawRow[] = [];
  for (const p of paths) {
    const raw = readFileSync(p, "utf8");
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) throw new Error(`No es un array: ${p}`);
    for (const x of arr) {
      if (x && typeof x === "object") out.push(x as RawRow);
    }
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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!dry && (!url || !key)) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (.env.local).");
    process.exit(1);
  }

  const data = readRows();
  const usedIds = new Set<string>();
  const payloads = data.map((row, i) => rowToPayload(row, 1000 + i, usedIds));

  console.log(`Filas en JSON: ${data.length} → productos: ${payloads.length}`);

  if (dry) {
    console.log("\n[--dry-run] Primeros 2 payloads:\n");
    console.log(JSON.stringify(payloads.slice(0, 2), null, 2));
    process.exit(0);
  }

  const supabase = createClient(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const chunk = 40;
  for (let i = 0; i < payloads.length; i += chunk) {
    const slice = payloads.slice(i, i + chunk);
    await upsertChunk(supabase, slice as unknown as Record<string, unknown>[]);
    console.log(`Upsert ${i + 1}–${Math.min(i + chunk, payloads.length)} / ${payloads.length}`);
  }

  console.log("Listo. Revalidá la tienda o revisá en Supabase Table Editor.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

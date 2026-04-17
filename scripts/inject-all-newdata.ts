/**
 * Lee todos los `*.json` en `data/newdata/` y hace upsert en `public.products`.
 *
 * Convención por nombre de archivo:
 *   - `*usados*`     → prefijo id `usado-`, badge / resumen como usados
 *   - `*otras*`      → prefijo id `otras-`
 *   - resto (iphone-nuevos, resto-apples-nuevos, etc.) → prefijo `nuevo-`, texto USD en ficha
 *
 * Requiere .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 *   npx tsx scripts/inject-all-newdata.ts
 *   npx tsx scripts/inject-all-newdata.ts --dry-run
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

type FileKind = "nuevo" | "usado" | "otras";

type Opt = {
  value: string | number;
  price?: number;
  sku?: string;
  stock?: unknown;
  colors?: string[];
};

type RawRow = {
  product: string;
  model?: string | null;
  chip?: string;
  screen?: string;
  ram?: string;
  processor?: string;
  color?: string;
  storage?: string;
  capacity?: string;
  quality?: string;
  battery?: string;
  status?: string;
  warranty?: string | null;
  options?: Record<string, Opt[] | undefined>;
  price?: number;
  sku?: string;
};

type RowWithMeta = { row: RawRow; fileKind: FileKind; sourceFile: string };

type VariantGroup = {
  id: string;
  kind: string;
  uiKind: "storage" | "select" | "color";
  label: string;
  pricingMode: "absolute" | "delta";
  options: { id: string; label: string; price?: number; priceDelta?: number }[];
};

const OPTION_KEY_ORDER = ["price", "capacity", "storage", "ram", "screen", "color"] as const;

const KEY_LABEL: Record<string, string> = {
  price: "Precio",
  storage: "Capacidad",
  capacity: "Capacidad",
  ram: "Memoria RAM",
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
  PARLANTE: "Parlante",
  AURICULARES: "Auriculares",
  CONSOLAS: "Consola",
  TELEFONO: "Teléfono",
  TABLET: "Tablet",
};

const CATEGORY_MAP: Record<string, string> = {
  IPHONE: "iphone",
  IPAD: "ipad",
  MACBOOK: "mac",
  "APPLE WATCH": "watch",
  IMAC: "desktop",
  AIRPODS: "audio",
  PARLANTE: "audio",
  AURICULARES: "audio",
  CONSOLAS: "otros",
  TELEFONO: "otros",
  TABLET: "ipad",
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

const APPLE_PRODUCTS = new Set([
  "IPHONE",
  "IPAD",
  "MACBOOK",
  "APPLE WATCH",
  "IMAC",
  "AIRPODS",
]);

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

function fileKindFromFilename(filename: string): FileKind {
  const n = filename.toLowerCase();
  if (n.includes("usados")) return "usado";
  if (n.includes("otras")) return "otras";
  return "nuevo";
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

function cleanModelLabel(s: string): string {
  return String(s)
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isPlaceholderStockColor(c: string | undefined): boolean {
  if (!c?.trim()) return false;
  const t = c.trim().toUpperCase();
  return t.includes("CONFIRMAR") && t.includes("STOCK");
}

function warrantyPretty(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function optValueStr(o: Opt): string {
  const v = o.value;
  if (typeof v === "number") return String(v);
  return String(v ?? "");
}

function isOptArray(x: unknown): x is Opt[] {
  return (
    Array.isArray(x) &&
    x.every((o) => {
      if (o == null || typeof o !== "object") return false;
      const v = (o as Opt).value;
      return typeof v === "string" || typeof v === "number";
    })
  );
}

function collectNestedColors(arr: Opt[]): string[] {
  const s = new Set<string>();
  for (const o of arr) {
    if (!Array.isArray(o.colors)) continue;
    for (const c of o.colors) {
      if (typeof c === "string" && c.trim()) s.add(c.trim());
    }
  }
  return [...s];
}

function minPriceFromRow(row: RawRow, groups: VariantGroup[]): number {
  let m = Infinity;
  if (typeof row.price === "number" && !Number.isNaN(row.price)) m = Math.min(m, row.price);
  const po = row.options?.price;
  if (isOptArray(po)) {
    for (const o of po) {
      const p =
        typeof o.price === "number"
          ? o.price
          : typeof o.value === "number"
            ? o.value
            : Number.NaN;
      if (!Number.isNaN(p)) m = Math.min(m, p);
    }
  }
  for (const g of groups) {
    if (g.pricingMode !== "absolute") continue;
    for (const opt of g.options) {
      if (typeof opt.price === "number") m = Math.min(m, opt.price);
    }
  }
  if (!Number.isFinite(m)) return 0;
  return m;
}

function buildVariantGroups(row: RawRow): VariantGroup[] {
  const groups: VariantGroup[] = [];
  const opts = row.options;

  if (opts) {
    for (const key of OPTION_KEY_ORDER) {
      const arr = opts[key];
      if (!isOptArray(arr) || arr.length === 0) continue;

      if (key === "price") {
        groups.push({
          id: "precio-variante",
          kind: "select",
          uiKind: "select",
          label: KEY_LABEL.price,
          pricingMode: "absolute",
          options: arr.map((o, i) => {
            const priceNum =
              typeof o.price === "number" && !Number.isNaN(o.price)
                ? o.price
                : typeof o.value === "number"
                  ? o.value
                  : Number(String(optValueStr(o)).replace(/\s/g, "").replace(",", ".")) || 0;
            const label =
              typeof o.value === "number" ? `${priceNum}` : titleModel(optValueStr(o));
            return {
              id: slug(o.sku || `pv-${slug(String(priceNum))}-${i}`),
              label,
              price: priceNum,
            };
          }),
        });
        continue;
      }

      const isStorageLike = key === "storage" || key === "capacity";
      const hasPrice = arr.some((o) => typeof o.price === "number" && !Number.isNaN(o.price));

      if (key === "color") {
        const colorOpts = arr.filter((o) => !isPlaceholderStockColor(optValueStr(o)));
        if (colorOpts.length === 0) continue;
        const hasPriceColor = colorOpts.some(
          (o) => typeof o.price === "number" && !Number.isNaN(o.price),
        );
        if (!hasPriceColor) {
          groups.push({
            id: "color",
            kind: "select",
            uiKind: "select",
            label: KEY_LABEL.color,
            pricingMode: "delta",
            options: colorOpts.map((o, i) => ({
              id: slug(o.sku || `color-${slug(optValueStr(o))}-${i}`),
              label: titleModel(optValueStr(o)),
              priceDelta: 0,
            })),
          });
        } else {
          groups.push({
            id: "color",
            kind: "select",
            uiKind: "select",
            label: KEY_LABEL.color,
            pricingMode: "absolute",
            options: colorOpts.map((o, i) => ({
              id: slug(o.sku || `color-${slug(optValueStr(o))}-${i}`),
              label: titleModel(optValueStr(o)),
              price: o.price as number,
            })),
          });
        }
        continue;
      }

      if (isStorageLike) {
        if (!hasPrice) continue;
        const gid = key === "capacity" ? "capacity" : "storage";
        groups.push({
          id: gid,
          kind: "storage",
          uiKind: "storage",
          label: KEY_LABEL[key],
          pricingMode: "absolute",
          options: arr.map((o, i) => ({
            id: slug(o.sku || `${gid}-${slug(optValueStr(o))}-${i}`),
            label: optValueStr(o),
            price: o.price as number,
          })),
        });
        const nestedColors = collectNestedColors(arr);
        if (nestedColors.length > 0 && !groups.some((g) => g.id === "color")) {
          groups.push({
            id: "color",
            kind: "select",
            uiKind: "select",
            label: KEY_LABEL.color,
            pricingMode: "delta",
            options: nestedColors.map((c, i) => ({
              id: slug(`color-${slug(c)}-${i}`),
              label: titleModel(c),
              priceDelta: 0,
            })),
          });
        }
        continue;
      }

      if (!hasPrice) continue;

      groups.push({
        id: key,
        kind: "select",
        uiKind: "select",
        label: KEY_LABEL[key] ?? key,
        pricingMode: "absolute",
        options: arr.map((o, i) => ({
          id: slug(o.sku || `${key}-${slug(optValueStr(o))}-${i}`),
          label: optValueStr(o),
          price: o.price as number,
        })),
      });
    }
  }

  const hasColorGroup = groups.some((g) => g.id === "color");
  if (row.color?.trim() && !hasColorGroup && !isPlaceholderStockColor(row.color)) {
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

function buildDescriptionItems(row: RawRow, fileKind: FileKind): string[] {
  const lines: string[] = [];
  const cap = row.capacity ?? row.storage;
  if (cap) lines.push(`Capacidad ${cap}.`);
  if (row.ram) lines.push(`RAM ${row.ram}.`);
  if (row.chip) lines.push(`Chip ${row.chip}.`);
  if (row.screen) lines.push(`Pantalla ${row.screen}.`);
  if (row.processor) lines.push(`Procesador: ${row.processor}.`);
  if (row.quality) lines.push(`Estética ${row.quality}.`);
  if (row.battery) lines.push(`Batería ${row.battery}.`);

  if (fileKind === "nuevo") {
    lines.push("Precios expresados en USD como referencia; consultá cotización del día.");
  } else if (lines.length === 0) {
    lines.push("Consultá disponibilidad y colores por WhatsApp.");
  }

  return lines;
}

function buildShortAppleNuevo(row: RawRow, warranty: string): string {
  return `${warranty || "Consultá garantía"} · Precios referencia USD`;
}

function buildShortGeneral(row: RawRow, warranty: string): string {
  const parts: string[] = [];
  if (row.status === "used") {
    if (row.quality?.trim()) parts.push(`Estética ${row.quality.trim()}`);
    if (row.battery?.trim()) parts.push(`Batería ${row.battery.trim()}`);
  }
  parts.push(warranty || "Consultá garantía");
  const s = parts.join(" · ");
  return s.length > 220 ? `${s.slice(0, 217)}…` : s;
}

function inferBrand(row: RawRow): string | null {
  const p = String(row.product || "").toUpperCase();
  if (APPLE_PRODUCTS.has(p)) return "Apple";
  return null;
}

function buildProductId(row: RawRow, used: Set<string>, fileKind: FileKind): string {
  const prefix = fileKind;

  if (fileKind === "nuevo" && !row.options && row.sku?.trim()) {
    let id = `nuevo-${slug(String(row.sku))}`;
    let n = 2;
    while (used.has(id)) id = `nuevo-${slug(String(row.sku))}-${n++}`;
    used.add(id);
    return id;
  }

  if ((fileKind === "usado" || fileKind === "otras") && row.sku?.trim()) {
    let id = `${prefix}-${slug(String(row.sku))}`;
    let n = 2;
    while (used.has(id)) id = `${prefix}-${slug(String(row.sku))}-${n++}`;
    used.add(id);
    return id;
  }

  const parts = [
    row.product,
    row.model ?? "base",
    row.capacity ?? row.storage,
    row.ram,
    row.chip,
    row.screen,
    row.processor,
    row.quality,
    row.battery,
  ].filter((x) => x != null && String(x).trim() !== "");
  const base = `${prefix}-${parts.map((p) => slug(String(p))).join("-")}`.replace(/-+/g, "-");
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n++}`;
  }
  used.add(id);
  return id;
}

function rowToPayload(
  { row, fileKind }: RowWithMeta,
  sortOrder: number,
  usedIds: Set<string>,
) {
  const product = String(row.product || "").toUpperCase();
  const category = CATEGORY_MAP[product] ?? "otros";
  const pretty = PRODUCT_LABEL[product] ?? titleModel(product);
  const modelRaw = row.model == null || String(row.model).trim() === "" ? "" : String(row.model).trim();
  const model = cleanModelLabel(modelRaw);
  const name = model ? `${pretty} ${titleModel(model)}` : pretty;

  const variantGroups = buildVariantGroups(row);
  const price = minPriceFromRow(row, variantGroups);
  const w = row.warranty != null && typeof row.warranty === "string" ? row.warranty.trim() : "";
  const warranty = w ? warrantyPretty(w) : "";
  const descriptionItems = buildDescriptionItems(row, fileKind);
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

  const id = buildProductId(row, usedIds, fileKind);
  const stock_condition = row.status === "used" ? "used" : "new";

  let badge: string;
  if (stock_condition === "used") badge = "Usado";
  else if (fileKind === "nuevo") badge = "Nuevo sellado";
  else badge = "Nuevo";

  const short =
    fileKind === "nuevo" ? buildShortAppleNuevo(row, warranty) : buildShortGeneral(row, warranty);

  const brand = inferBrand(row);

  return {
    id,
    name,
    short,
    category,
    brand,
    price,
    stock_condition,
    badge,
    image: PLACEHOLDER_IMAGE[category] ?? PLACEHOLDER_IMAGE.otros,
    image_alt: name,
    variant_groups: variantGroups,
    sellable_variants: [] as unknown[],
    detail,
    compare_at_price: null as number | null,
    discount_percent: null as number | null,
    published: true,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  };
}

function readAllRows(): RowWithMeta[] {
  const dir = join(process.cwd(), "data/newdata");
  if (!existsSync(dir)) {
    throw new Error(`No existe la carpeta ${dir}`);
  }

  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    throw new Error(`No hay archivos .json en ${dir}`);
  }

  const out: RowWithMeta[] = [];
  for (const file of files) {
    const full = join(dir, file);
    const fileKind = fileKindFromFilename(file);
    const raw = readFileSync(full, "utf8");
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) throw new Error(`No es un array: ${full}`);
    let n = 0;
    for (const x of arr) {
      if (x && typeof x === "object") {
        out.push({ row: x as RawRow, fileKind, sourceFile: file });
        n++;
      }
    }
    console.log(`  ${file} (${fileKind}): ${n} filas`);
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

  console.log("Leyendo data/newdata/*.json …");
  const data = readAllRows();

  const usedIds = new Set<string>();
  const payloads = data.map((item, i) => rowToPayload(item, 1000 + i, usedIds));

  console.log(`\nTotal: ${data.length} filas → ${payloads.length} productos (ids únicos).`);

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

  console.log("Listo.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

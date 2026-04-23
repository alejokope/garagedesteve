/**
 * Arma borradores de publicaciones (JSON listo para Supabase / inject) desde una plancha TSV.
 *
 * Formatos TSV (tab):
 *
 * **Nuevo (Excel):** Modelo | Capacidad | Color | Precio final | Garantía | Chip | Tamaño pantalla | RAM | Procesador | MARCA
 * La línea de producto (iPhone / MacBook / iPad / Watch / iMac / AirPods) se infiere del modelo + capacidad (p. ej. `SSD` → Mac).
 * `MARCA` se guarda en `brand`. Ignorá la fila de encabezado si la primera celda es «Modelo».
 *
 * **Legacy:** familia | modelo | almacenamiento | color/stock | precio | garantía | chip | pantalla | ram | extra
 * (familia = IPHONE, MACBOOK, …). Modelos con sufijo "+ LTE" se fusionan (opción Conectividad).
 *
 *   npx tsx scripts/build-products-from-price-tsv.ts
 *   npx tsx scripts/build-products-from-price-tsv.ts --write data/generated-nuevos-plancha.json
 *   npx tsx scripts/build-products-from-price-tsv.ts ruta/al/archivo.tsv --write out.json
 *
 * Sin --write imprime JSON a stdout.
 *
 * Una sola opción que varía (ej. solo capacidad): `sellable_variants` vacío y precio en cada opción
 * (`pricingMode: absolute`). Dos o más dimensiones: matriz `sellable_variants` para tuplas válidas.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { ProductVariantGroup } from "@/lib/product-variants";
import type { SellableVariant } from "@/lib/sellable-variants";
import { validateSellableMatrix } from "@/lib/sellable-variants";

type SheetRow = {
  family: string;
  modelRaw: string;
  baseModel: string;
  lteInName: boolean;
  storage: string;
  color: string;
  price: number;
  warranty: string;
  chip: string;
  screen: string;
  ram: string;
  extra: string;
  /** Columna MARCA (formato nuevo); vacío en legacy. */
  brand: string;
};

const PLACEHOLDER_COLOR = /^a\s+confirmar\b/i;

const OLD_FAMILY_FIRST_COL = new Set([
  "IPHONE",
  "MACBOOK",
  "IPAD",
  "APPLE WATCH",
  "IMAC",
  "AIRPODS",
]);

/** Plancha sin columna «familia»: deducimos IPHONE | MACBOOK | IPAD | APPLE WATCH | IMAC | AIRPODS. */
function inferFamilyFromModelSheet(modelRaw: string, capacity: string): string {
  const m = modelRaw.trim().toUpperCase();
  const c = capacity.trim().toUpperCase();

  if (/GENERACI[oó]N/i.test(modelRaw)) return "AIRPODS";
  if (m === "" || m === "-" || m === "—") return "IMAC";
  if (m.startsWith("SERIES ") || m.startsWith("ULTRA")) return "APPLE WATCH";
  if (c.includes("SSD") || m === "NEO") return "MACBOOK";
  if (m.startsWith("MINI ") || /^A\d+$/i.test(modelRaw.trim())) return "IPAD";
  if (m === "AIR" && !c.includes("SSD")) return "IPAD";
  if ((m === "PRO" || m.startsWith("PRO +")) && !c.includes("SSD")) return "IPAD";
  return "IPHONE";
}

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

/** Orden fijo de dimensiones al armar grupos (solo entran las que varían en ese producto). */
const DIM_ORDER = ["connectivity", "storage", "chip", "screen", "ram", "processor"] as const;
type Dim = (typeof DIM_ORDER)[number];

const DIM_META: Record<
  Dim,
  { id: string; label: string; kind: string; uiKind: "storage" | "select"; pricingMode: "absolute" | "delta" }
> = {
  connectivity: {
    id: "connectivity",
    label: "Conectividad",
    kind: "select",
    uiKind: "select",
    pricingMode: "delta",
  },
  storage: { id: "storage", label: "Capacidad", kind: "storage", uiKind: "storage", pricingMode: "delta" },
  chip: { id: "chip", label: "Chip / Procesador", kind: "select", uiKind: "select", pricingMode: "delta" },
  screen: { id: "screen", label: "Pantalla / caja", kind: "select", uiKind: "select", pricingMode: "delta" },
  ram: { id: "ram", label: "Memoria RAM", kind: "select", uiKind: "select", pricingMode: "delta" },
  processor: { id: "processor", label: "CPU / GPU", kind: "select", uiKind: "select", pricingMode: "delta" },
};

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

function titleCaseWords(s: string): string {
  return String(s)
    .trim()
    .split(/\s+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

function cell(v: string): string {
  const t = v.trim();
  if (!t || t === "-") return "";
  return t;
}

function parsePrice(s: string): number {
  const n = Number(String(s).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function splitLteModel(modelCol: string): { base: string; lteInName: boolean } {
  const t = modelCol.trim();
  const m = t.match(/^(.+?)\s*\+\s*LTE\s*$/i);
  if (m) return { base: m[1].trim(), lteInName: true };
  return { base: t, lteInName: false };
}

function parseLine(line: string): SheetRow | null {
  const lineTrim = line.trim();
  if (!lineTrim || lineTrim.startsWith("#")) return null;
  const parts = lineTrim.split("\t").map((c) => c.trim());
  while (parts.length < 10) parts.push("");

  const c0 = (parts[0] || "").toUpperCase();
  if (c0 === "MODELO") return null;

  let family: string;
  let modelCol: string;
  let stor: string;
  let col: string;
  let priceS: string;
  let war: string;
  let chip: string;
  let scr: string;
  let ram: string;
  let extra: string;
  let brand = "";

  if (OLD_FAMILY_FIRST_COL.has(c0)) {
    const [fam, mod, ...rest] = parts;
    family = fam!.toUpperCase();
    modelCol = mod ?? "";
    while (rest.length < 8) rest.push("");
    [stor, col, priceS, war, chip, scr, ram, extra] = rest.slice(0, 8);
  } else {
    [modelCol, stor, col, priceS, war, chip, scr, ram, extra, brand] = parts;
    family = inferFamilyFromModelSheet(modelCol, stor);
  }

  if (!family) return null;
  const { base, lteInName } = splitLteModel(modelCol || "");
  const price = parsePrice(priceS || "");
  if (!Number.isFinite(price)) return null;
  return {
    family,
    modelRaw: modelCol || "",
    baseModel: base,
    lteInName,
    storage: cell(stor),
    color: PLACEHOLDER_COLOR.test(cell(col)) ? "" : cell(col),
    price,
    warranty: cell(war),
    chip: cell(chip),
    screen: cell(scr),
    ram: cell(ram),
    extra: cell(extra),
    brand: cell(brand),
  };
}

function rowDims(r: SheetRow): Record<Dim, string> {
  const connectivity = r.lteInName ? "LTE" : "Wi‑Fi";
  return {
    connectivity,
    storage: r.storage,
    chip: r.chip,
    screen: r.screen,
    ram: r.ram,
    processor: r.extra,
  };
}

function groupKey(r: SheetRow): string {
  return `${r.family}\0${r.baseModel}`;
}

function displayName(r: SheetRow): string {
  const pretty = PRODUCT_LABEL[r.family] ?? titleCaseWords(r.family);
  const bm = r.baseModel.trim();
  if (r.family === "IMAC") return pretty;
  if (!bm || bm === "-") return pretty;
  return `${pretty} ${titleCaseWords(bm)}`;
}

function varyingDims(rows: SheetRow[]): Dim[] {
  const dims: Dim[] = [];
  for (const d of DIM_ORDER) {
    const vals = new Set<string>();
    for (const r of rows) {
      const v = rowDims(r)[d];
      if (v) vals.add(v);
    }
    if (vals.size >= 2) dims.push(d);
  }
  return dims;
}

function buildGroups(rows: SheetRow[], dims: Dim[]): ProductVariantGroup[] {
  const groups: ProductVariantGroup[] = [];
  for (const d of dims) {
    const meta = DIM_META[d];
    const labels = new Set<string>();
    for (const r of rows) {
      const v = rowDims(r)[d];
      if (v) labels.add(v);
    }
    const sorted = [...labels].sort((a, b) => a.localeCompare(b, "es"));
    const options = sorted.map((label, i) => ({
      id: slug(`${meta.id}-${label}-${i}`),
      label,
      priceDelta: 0,
    }));
    groups.push({
      id: meta.id,
      kind: meta.kind,
      uiKind: meta.uiKind,
      label: meta.label,
      pricingMode: meta.pricingMode,
      options,
    });
  }
  return groups;
}

/** Un solo grupo con precio final por opción (sin matriz vendible). */
function buildSingleDimensionAbsoluteGroup(rows: SheetRow[], d: Dim, productLabel: string): ProductVariantGroup[] {
  const meta = DIM_META[d];
  const priceByLabel = new Map<string, number>();
  for (const r of rows) {
    const label = rowDims(r)[d];
    if (!label) throw new Error(`${productLabel}: falta «${meta.label}» en una fila.`);
    const prev = priceByLabel.get(label);
    if (prev !== undefined && prev !== r.price) {
      throw new Error(
        `${productLabel}: la opción «${label}» aparece con dos precios distintos (${prev} vs ${r.price}).`,
      );
    }
    priceByLabel.set(label, r.price);
  }
  const sorted = [...priceByLabel.keys()].sort((a, b) => a.localeCompare(b, "es"));
  const options = sorted.map((label, i) => ({
    id: slug(`${meta.id}-${label}-${i}`),
    label,
    price: priceByLabel.get(label)!,
  }));
  return [
    {
      id: meta.id,
      kind: meta.kind,
      uiKind: meta.uiKind,
      label: meta.label,
      pricingMode: "absolute" as const,
      options,
    },
  ];
}

function buildSellableRows(rows: SheetRow[], dims: Dim[]): SellableVariant[] {
  if (dims.length === 0) return [];
  const groups = buildGroups(rows, dims);
  const out: SellableVariant[] = [];
  rows.forEach((r, i) => {
    const selections: Record<string, string> = {};
    const rd = rowDims(r);
    for (const d of dims) {
      const meta = DIM_META[d];
      const label = rd[d];
      if (!label) throw new Error(`Falta «${meta.label}» para precio ${r.price} (${r.baseModel})`);
      const g = groups.find((x) => x.id === meta.id)!;
      const opt = g.options.find((o) => o.label === label);
      if (!opt) throw new Error(`Opción inválida ${label} en ${meta.id}`);
      selections[meta.id] = opt.id;
    }
    const key = dims.map((d) => slug(rd[d])).join("-");
    out.push({
      id: `sv-${slug(r.baseModel)}-${i}-${key}`.slice(0, 120),
      selections,
      price: r.price,
      label: null,
    });
  });
  return out;
}

function buildDescriptionItems(rows: SheetRow[]): string[] {
  const r0 = rows[0];
  const lines: string[] = [];
  if (r0?.warranty) lines.push(`Garantía: ${titleCaseWords(r0.warranty)}.`);
  lines.push("Color / acabado: a confirmar según stock disponible.");
  lines.push("Precios expresados en USD como referencia; consultá cotización del día.");
  return lines;
}

function productPayload(rows: SheetRow[], sortOrder: number, usedIds: Set<string>) {
  const r0 = rows[0]!;
  const category = CATEGORY_MAP[r0.family] ?? "otros";
  const name = displayName(r0);
  const dims = varyingDims(rows);

  let variant_groups: ProductVariantGroup[];
  let sellable_variants: SellableVariant[];

  if (dims.length <= 1) {
    sellable_variants = [];
    variant_groups =
      dims.length === 1 ? buildSingleDimensionAbsoluteGroup(rows, dims[0]!, name) : [];
  } else {
    variant_groups = buildGroups(rows, dims);
    sellable_variants = buildSellableRows(rows, dims);
  }

  const minP = Math.min(...rows.map((x) => x.price));

  let baseId = `nuevo-${slug(category)}-${slug(r0.baseModel || "base")}`.replace(/-+/g, "-");
  if (usedIds.has(baseId)) {
    let n = 2;
    while (usedIds.has(`${baseId}-${n}`)) n++;
    baseId = `${baseId}-${n}`;
  }
  usedIds.add(baseId);

  const warrantyShort = r0.warranty ? titleCaseWords(r0.warranty) : "Consultá garantía";
  const brandOut = r0.brand ? titleCaseWords(r0.brand) : null;
  const detail = {
    images: [] as string[],
    longDescription: buildDescriptionItems(rows).join("\n\n"),
    descriptionItems: buildDescriptionItems(rows),
    ...(r0.warranty ? { warranty: titleCaseWords(r0.warranty) } : {}),
    specs: [] as unknown[],
    relatedIds: [] as string[],
    accessoryIds: [] as string[],
    reviews: [] as unknown[],
  };

  const err = validateSellableMatrix(variant_groups, sellable_variants);
  if (err) throw new Error(`${name}: ${err}`);

  return {
    id: baseId,
    name,
    short: `${warrantyShort} · Precios referencia USD`,
    category,
    brand: brandOut,
    price: minP,
    stock_condition: "new" as const,
    badge: "Nuevo sellado",
    image: PLACEHOLDER_IMAGE[category] ?? PLACEHOLDER_IMAGE.otros,
    image_alt: name,
    variant_groups,
    sellable_variants,
    detail,
    compare_at_price: null as number | null,
    discount_percent: null as number | null,
    published: true,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  };
}

function readSheetRows(path?: string): SheetRow[] {
  let text: string;
  if (path && existsSync(path)) {
    text = readFileSync(path, "utf8");
  } else {
    const def = join(process.cwd(), "data/precios-nuevos-plancha.tsv");
    if (existsSync(def)) text = readFileSync(def, "utf8");
    else text = EMBEDDED_TSV;
  }
  const out: SheetRow[] = [];
  for (const line of text.split(/\n/)) {
    const p = parseLine(line);
    if (p) out.push(p);
  }
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  const writeIdx = argv.indexOf("--write");
  const outPath = writeIdx >= 0 ? argv[writeIdx + 1] : null;
  const fileArg = argv.find((a) => !a.startsWith("--") && a !== outPath);

  const all = readSheetRows(fileArg);
  const byKey = new Map<string, SheetRow[]>();
  for (const r of all) {
    const k = groupKey(r);
    const arr = byKey.get(k) ?? [];
    arr.push(r);
    byKey.set(k, arr);
  }

  const usedIds = new Set<string>();
  let order = 2000;
  const payloads: ReturnType<typeof productPayload>[] = [];
  for (const [, groupRows] of byKey) {
    payloads.push(productPayload(groupRows, order++, usedIds));
  }

  payloads.sort((a, b) => a.name.localeCompare(b.name, "es"));

  const json = JSON.stringify(payloads, null, 2);
  if (outPath) {
    writeFileSync(outPath, json, "utf8");
    console.error(`OK ${payloads.length} productos → ${outPath}`);
  } else {
    console.log(json);
  }
}

/** Legacy 10 col (familia+…); se convierte a Modelo…MARCA para el embebido. Preferí `data/precios-nuevos-plancha.tsv`. */
const EMBEDDED_LEGACY_ROWS = [
  ["IPHONE", "13", "128GB", "A CONFIRMAR SEGUN STOCK", "560", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "14", "128GB", "A CONFIRMAR SEGUN STOCK", "600", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "15", "128GB", "A CONFIRMAR SEGUN STOCK", "700", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "15 PLUS", "128GB", "A CONFIRMAR SEGUN STOCK", "800", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "15 PLUS", "512GB", "A CONFIRMAR SEGUN STOCK", "890", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "16", "128GB", "A CONFIRMAR SEGUN STOCK", "800", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "16 PRO", "128GB", "A CONFIRMAR SEGUN STOCK", "1050", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "16 PRO MAX", "256GB", "A CONFIRMAR SEGUN STOCK", "1300", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "17", "256GB", "A CONFIRMAR SEGUN STOCK", "920", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "17 PRO", "256GB", "A CONFIRMAR SEGUN STOCK", "1370", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "17 PRO", "512GB", "A CONFIRMAR SEGUN STOCK", "1570", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "17 PRO", "1TB", "A CONFIRMAR SEGUN STOCK", "1790", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "17 PRO MAX", "256GB", "A CONFIRMAR SEGUN STOCK", "1510", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "17 PRO MAX", "512GB", "A CONFIRMAR SEGUN STOCK", "1720", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "17 PRO MAX", "1TB", "A CONFIRMAR SEGUN STOCK", "1950", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["IPHONE", "17 PRO MAX", "2TB", "A CONFIRMAR SEGUN STOCK", "2330", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["MACBOOK", "NEO", "256GB SSD", "A CONFIRMAR SEGUN STOCK", "870", "OFICIAL DE 12 MESES", "A18 PRO", "13”", "8GB RAM", "-"],
  ["MACBOOK", "NEO", "512GB SSD", "A CONFIRMAR SEGUN STOCK", "980", "OFICIAL DE 12 MESES", "A18 PRO", "13”", "8GB RAM", "-"],
  ["MACBOOK", "AIR", "256GB SSD", "A CONFIRMAR SEGUN STOCK", "1180", "OFICIAL DE 12 MESES", "M4", "13”", "16GB RAM", "-"],
  ["MACBOOK", "AIR", "512GB SSD", "A CONFIRMAR SEGUN STOCK", "1450", "OFICIAL DE 12 MESES", "M4", "13”", "16GB RAM", "-"],
  ["MACBOOK", "AIR", "256GB SSD", "A CONFIRMAR SEGUN STOCK", "1370", "OFICIAL DE 12 MESES", "M4", "15”", "16GB RAM", "-"],
  ["MACBOOK", "AIR", "512GB SSD", "A CONFIRMAR SEGUN STOCK", "1580", "OFICIAL DE 12 MESES", "M4", "15”", "16GB RAM", "-"],
  ["MACBOOK", "AIR", "512GB SSD", "A CONFIRMAR SEGUN STOCK", "1420", "OFICIAL DE 12 MESES", "M5", "13”", "16GB RAM", "-"],
  ["MACBOOK", "AIR", "1TB SSD", "A CONFIRMAR SEGUN STOCK", "1630", "OFICIAL DE 12 MESES", "M5", "13”", "16GB RAM", "-"],
  ["MACBOOK", "AIR", "1TB SSD", "A CONFIRMAR SEGUN STOCK", "1850", "OFICIAL DE 12 MESES", "M5", "13”", "24GB RAM", "-"],
  ["MACBOOK", "AIR", "512GB SSD", "A CONFIRMAR SEGUN STOCK", "1650", "OFICIAL DE 12 MESES", "M5", "15”", "16GB RAM", "-"],
  ["MACBOOK", "AIR", "1TB SSD", "A CONFIRMAR SEGUN STOCK", "1870", "OFICIAL DE 12 MESES", "M5", "15”", "16GB RAM", "-"],
  ["MACBOOK", "AIR", "1TB SSD", "A CONFIRMAR SEGUN STOCK", "2000", "OFICIAL DE 12 MESES", "M5", "15”", "24GB RAM", "-"],
  ["MACBOOK", "PRO", "512GB SSD", "A CONFIRMAR SEGUN STOCK", "1820", "OFICIAL DE 12 MESES", "M4", "14”", "16GB RAM", "-"],
  ["MACBOOK", "PRO", "512GB SSD", "A CONFIRMAR SEGUN STOCK", "2250", "OFICIAL DE 12 MESES", "M4 PRO", "14”", "24GB RAM", "-"],
  ["MACBOOK", "PRO", "512GB SSD", "A CONFIRMAR SEGUN STOCK", "2850", "OFICIAL DE 12 MESES", "M4", "16”", "24GB RAM", "-"],
  ["MACBOOK", "PRO", "512GB SSD", "A CONFIRMAR SEGUN STOCK", "3290", "OFICIAL DE 12 MESES", "M4", "16”", "48GB RAM", "-"],
  ["MACBOOK", "PRO", "512GB SSD", "A CONFIRMAR SEGUN STOCK", "1830", "OFICIAL DE 12 MESES", "M5", "14”", "16GB RAM", "-"],
  ["MACBOOK", "PRO", "1TB SSD", "A CONFIRMAR SEGUN STOCK", "2050", "OFICIAL DE 12 MESES", "M5", "14”", "16GB RAM", "-"],
  ["MACBOOK", "PRO", "1TB SSD", "A CONFIRMAR SEGUN STOCK", "2300", "OFICIAL DE 12 MESES", "M5", "14”", "24GB RAM", "-"],
  ["MACBOOK", "PRO", "1TB SSD", "A CONFIRMAR SEGUN STOCK", "2670", "OFICIAL DE 12 MESES", "M5 PRO", "14”", "24GB RAM", "-"],
  ["MACBOOK", "PRO", "2TB SSD", "A CONFIRMAR SEGUN STOCK", "3390", "OFICIAL DE 12 MESES", "M5 PRO", "14”", "24GB RAM", "-"],
  ["MACBOOK", "PRO", "1TB SSD", "A CONFIRMAR SEGUN STOCK", "4800", "OFICIAL DE 12 MESES", "M5 MAX", "14”", "16GB RAM", "-"],
  ["MACBOOK", "PRO", "1TB SSD", "A CONFIRMAR SEGUN STOCK", "5400", "OFICIAL DE 12 MESES", "M5 MAX", "14”", "24GB RAM", "-"],
  ["IPAD", "MINI 7MA GEN", "128GB", "A CONFIRMAR SEGUN STOCK", "620", "OFICIAL DE 12 MESES", "A17 PRO", "8.3”", "-", "-"],
  ["IPAD", "MINI 7MA GEN", "256GB", "A CONFIRMAR SEGUN STOCK", "720", "OFICIAL DE 12 MESES", "A17 PRO", "8.3”", "-", "-"],
  ["IPAD", "A16", "128GB", "A CONFIRMAR SEGUN STOCK", "510", "OFICIAL DE 12 MESES", "A16", "11”", "-", "-"],
  ["IPAD", "A16", "256GB", "A CONFIRMAR SEGUN STOCK", "620", "OFICIAL DE 12 MESES", "A16", "11”", "-", "-"],
  ["IPAD", "AIR", "128GB", "A CONFIRMAR SEGUN STOCK", "700", "OFICIAL DE 12 MESES", "M3", "11”", "-", "-"],
  ["IPAD", "AIR", "256GB", "A CONFIRMAR SEGUN STOCK", "850", "OFICIAL DE 12 MESES", "M3", "11”", "-", "-"],
  ["IPAD", "AIR", "128GB", "A CONFIRMAR SEGUN STOCK", "920", "OFICIAL DE 12 MESES", "M3", "13”", "-", "-"],
  ["IPAD", "AIR", "256GB", "A CONFIRMAR SEGUN STOCK", "1060", "OFICIAL DE 12 MESES", "M3", "13”", "-", "-"],
  ["IPAD", "AIR", "128GB", "A CONFIRMAR SEGUN STOCK", "780", "OFICIAL DE 12 MESES", "M4", "11”", "-", "-"],
  ["IPAD", "AIR", "256GB", "A CONFIRMAR SEGUN STOCK", "890", "OFICIAL DE 12 MESES", "M4", "11”", "-", "-"],
  ["IPAD", "AIR", "128GB", "A CONFIRMAR SEGUN STOCK", "1000", "OFICIAL DE 12 MESES", "M4", "13”", "-", "-"],
  ["IPAD", "AIR", "256GB", "A CONFIRMAR SEGUN STOCK", "1100", "OFICIAL DE 12 MESES", "M4", "13”", "-", "-"],
  ["IPAD", "PRO", "256GB", "A CONFIRMAR SEGUN STOCK", "1100", "OFICIAL DE 12 MESES", "M4", "11”", "-", "-"],
  ["IPAD", "PRO + LTE", "256GB", "A CONFIRMAR SEGUN STOCK", "1140", "OFICIAL DE 12 MESES", "M4", "11”", "-", "-"],
  ["IPAD", "PRO", "512GB", "A CONFIRMAR SEGUN STOCK", "1450", "OFICIAL DE 12 MESES", "M4", "11”", "-", "-"],
  ["IPAD", "PRO", "256GB", "A CONFIRMAR SEGUN STOCK", "1370", "OFICIAL DE 12 MESES", "M4", "13”", "-", "-"],
  ["IPAD", "PRO", "256GB", "A CONFIRMAR SEGUN STOCK", "1120", "OFICIAL DE 12 MESES", "M5", "11”", "-", "-"],
  ["IPAD", "PRO", "512GB", "A CONFIRMAR SEGUN STOCK", "1420", "OFICIAL DE 12 MESES", "M5", "11”", "-", "-"],
  ["IPAD", "PRO", "256GB", "A CONFIRMAR SEGUN STOCK", "1470", "OFICIAL DE 12 MESES", "M5", "13”", "-", "-"],
  ["IPAD", "PRO + LTE", "256GB", "A CONFIRMAR SEGUN STOCK", "2040", "OFICIAL DE 12 MESES", "M5", "13”", "-", "-"],
  ["IPAD", "PRO", "512GB", "A CONFIRMAR SEGUN STOCK", "1790", "OFICIAL DE 12 MESES", "M5", "13”", "-", "-"],
  ["IPAD", "PRO + LTE", "512GB", "A CONFIRMAR SEGUN STOCK", "2240", "OFICIAL DE 12 MESES", "M5", "13”", "-", "-"],
  ["IPAD", "PRO", "1TB", "A CONFIRMAR SEGUN STOCK", "2390", "OFICIAL DE 12 MESES", "M5", "13”", "-", "-"],
  ["IPAD", "PRO + LTE", "1TB", "A CONFIRMAR SEGUN STOCK", "2790", "OFICIAL DE 12 MESES", "M5", "13”", "-", "-"],
  ["APPLE WATCH", "SERIES SE 2", "-", "A CONFIRMAR SEGUN STOCK", "280", "OFICIAL DE 12 MESES", "-", "40MM", "-", "-"],
  ["APPLE WATCH", "SERIES SE 2", "-", "A CONFIRMAR SEGUN STOCK", "310", "OFICIAL DE 12 MESES", "-", "44MM", "-", "-"],
  ["APPLE WATCH", "SERIES SE 2 + LTE", "-", "A CONFIRMAR SEGUN STOCK", "320", "OFICIAL DE 12 MESES", "-", "44MM", "-", "-"],
  ["APPLE WATCH", "SERIES SE 3", "-", "A CONFIRMAR SEGUN STOCK", "330", "OFICIAL DE 12 MESES", "-", "40MM", "-", "-"],
  ["APPLE WATCH", "SERIES SE 3", "-", "A CONFIRMAR SEGUN STOCK", "370", "OFICIAL DE 12 MESES", "-", "44MM", "-", "-"],
  ["APPLE WATCH", "SERIES 10", "-", "A CONFIRMAR SEGUN STOCK", "390", "OFICIAL DE 12 MESES", "-", "42MM", "-", "-"],
  ["APPLE WATCH", "SERIES 11", "-", "A CONFIRMAR SEGUN STOCK", "430", "OFICIAL DE 12 MESES", "-", "42MM", "-", "-"],
  ["APPLE WATCH", "SERIES 11", "-", "A CONFIRMAR SEGUN STOCK", "460", "OFICIAL DE 12 MESES", "-", "46MM", "-", "-"],
  ["APPLE WATCH", "ULTRA 2", "-", "A CONFIRMAR SEGUN STOCK", "790", "OFICIAL DE 12 MESES", "-", "49MM", "-", "-"],
  ["APPLE WATCH", "ULTRA 3", "-", "A CONFIRMAR SEGUN STOCK", "840", "OFICIAL DE 12 MESES", "-", "49MM", "-", "-"],
  ["IMAC", "-", "256GB", "A CONFIRMAR SEGUN STOCK", "1990", "OFICIAL DE 12 MESES", "M4", "24”", "16GB", "8 CORE CPU-GPU"],
  ["IMAC", "-", "256GB", "A CONFIRMAR SEGUN STOCK", "2200", "OFICIAL DE 12 MESES", "M4", "24”", "16GB", "10 CORE CPU-GPU"],
  ["IMAC", "-", "512GB", "A CONFIRMAR SEGUN STOCK", "2460", "OFICIAL DE 12 MESES", "M4", "24”", "16GB", "10 CORE CPU-GPU"],
  ["IMAC", "-", "512GB", "A CONFIRMAR SEGUN STOCK", "2680", "OFICIAL DE 12 MESES", "M4", "24”", "24GB", "10 CORE CPU-GPU"],
  ["IMAC", "-", "1TB", "A CONFIRMAR SEGUN STOCK", "3350", "OFICIAL DE 12 MESES", "M4", "24”", "24GB", "10 CORE CPU-GPU"],
  ["AIRPODS", "3RA GENERACION", "-", "-", "200", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["AIRPODS", "4TA GENERACION", "-", "-", "180", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["AIRPODS", "4TA GENERACION (NOISE CANCELLING)", "-", "-", "230", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
  ["AIRPODS", "PRO 3RA GENERACION", "-", "-", "310", "OFICIAL DE 12 MESES", "-", "-", "-", "-"],
];

const EMBEDDED_TSV = [
  "Modelo\tCapacidad\tColor\tPrecio final\tGarantia\tChip\tTamaño Pantalla\tRAM\tProcesador\tMARCA",
  ...EMBEDDED_LEGACY_ROWS.map((cols) => [...cols.slice(1), "Apple"].join("\t")),
].join("\n");

main();

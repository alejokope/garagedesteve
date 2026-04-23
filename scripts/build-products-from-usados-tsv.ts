/**
 * Arma publicaciones **usadas** (iPhone) desde TSV exportado de Excel.
 *
 * Columnas (tab): Modelo | Capacidad | Color | Calidad | Bateria | Precio final | Garantia | Marca
 * Se agrupa por modelo (misma publicación); opciones que varían + matriz vendible si hace falta.
 *
 *   npx tsx scripts/build-products-from-usados-tsv.ts --write data/generated-usados-plancha.json
 *   npx tsx scripts/build-products-from-usados-tsv.ts ruta/archivo.tsv --write out.json
 *
 * Carga: `npx tsx scripts/inject-products-json.ts data/generated-usados-plancha.json`
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { ProductVariantGroup } from "@/lib/product-variants";
import type { SellableVariant } from "@/lib/sellable-variants";
import { validateSellableMatrix } from "@/lib/sellable-variants";

type UsedRow = {
  model: string;
  storage: string;
  color: string;
  quality: string;
  battery: string;
  price: number;
  warranty: string;
  brand: string;
};

const USED_DIM_ORDER = ["storage", "color", "quality", "battery"] as const;
type UsedDim = (typeof USED_DIM_ORDER)[number];

const USED_DIM_META: Record<
  UsedDim,
  { id: string; label: string; kind: string; uiKind: "storage" | "select"; pricingMode: "absolute" | "delta" }
> = {
  storage: { id: "storage", label: "Capacidad", kind: "storage", uiKind: "storage", pricingMode: "delta" },
  color: { id: "color", label: "Color", kind: "color", uiKind: "color", pricingMode: "delta" },
  quality: { id: "quality", label: "Calidad estética", kind: "select", uiKind: "select", pricingMode: "delta" },
  battery: { id: "battery", label: "Batería", kind: "select", uiKind: "select", pricingMode: "delta" },
};

const PLACEHOLDER_IPHONE =
  "https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80";

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

function normModelKey(model: string): string {
  return model.trim().replace(/\s+/g, " ").toUpperCase();
}

function parseUsedLine(line: string): UsedRow | null {
  const t = line.trim();
  if (!t || t.startsWith("#")) return null;
  const parts = t.split("\t").map((c) => c.trim());
  while (parts.length < 8) parts.push("");
  if (/^modelo$/i.test(parts[0] || "")) return null;

  const [model, storage, color, quality, battery, priceS, warranty, brand] = parts;
  const price = parsePrice(priceS || "");
  if (!Number.isFinite(price) || !cell(model)) return null;

  return {
    model: cell(model),
    storage: cell(storage),
    color: cell(color),
    quality: cell(quality),
    battery: cell(battery),
    price,
    warranty: cell(warranty),
    brand: cell(brand),
  };
}

function rowDims(r: UsedRow): Record<UsedDim, string> {
  return {
    storage: r.storage,
    color: r.color,
    quality: r.quality,
    battery: r.battery,
  };
}

function usedDisplayName(r: UsedRow): string {
  const b = r.brand.trim().toLowerCase();
  const prefix = b === "apple" || !r.brand ? "iPhone" : titleCaseWords(r.brand);
  return `${prefix} ${r.model.trim()}`.replace(/\s+/g, " ");
}

function varyingUsedDims(rows: UsedRow[]): UsedDim[] {
  const dims: UsedDim[] = [];
  for (const d of USED_DIM_ORDER) {
    const vals = new Set<string>();
    for (const row of rows) {
      const v = rowDims(row)[d];
      if (v) vals.add(v);
    }
    if (vals.size >= 2) dims.push(d);
  }
  return dims;
}

function buildUsedGroups(rows: UsedRow[], dims: UsedDim[]): ProductVariantGroup[] {
  const groups: ProductVariantGroup[] = [];
  for (const d of dims) {
    const meta = USED_DIM_META[d];
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

function buildSingleUsedAbsoluteGroup(rows: UsedRow[], d: UsedDim, productLabel: string): ProductVariantGroup[] {
  const meta = USED_DIM_META[d];
  const priceByLabel = new Map<string, number>();
  for (const r of rows) {
    const label = rowDims(r)[d];
    if (!label) throw new Error(`${productLabel}: falta «${meta.label}» en una fila.`);
    const prev = priceByLabel.get(label);
    if (prev !== undefined && prev !== r.price) {
      throw new Error(
        `${productLabel}: la opción «${label}» tiene dos precios (${prev} vs ${r.price}).`,
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

function buildUsedSellableRows(rows: UsedRow[], dims: UsedDim[]): SellableVariant[] {
  if (dims.length === 0) return [];
  const groups = buildUsedGroups(rows, dims);
  const out: SellableVariant[] = [];
  rows.forEach((r, i) => {
    const selections: Record<string, string> = {};
    const rd = rowDims(r);
    for (const d of dims) {
      const meta = USED_DIM_META[d];
      const label = rd[d];
      if (!label) throw new Error(`Falta «${meta.label}» en fila ${usedDisplayName(r)}`);
      const g = groups.find((x) => x.id === meta.id)!;
      const opt = g.options.find((o) => o.label === label);
      if (!opt) throw new Error(`Opción inválida ${label}`);
      selections[meta.id] = opt.id;
    }
    const key = dims.map((d) => slug(rd[d])).join("-");
    out.push({
      id: `sv-usado-${slug(r.model)}-${i}-${key}`.slice(0, 120),
      selections,
      price: r.price,
      label: null,
    });
  });
  return out;
}

function buildUsedShort(rows: UsedRow[]): string {
  const r0 = rows[0]!;
  const warranty = r0.warranty || "Consultá garantía";
  if (rows.length === 1) {
    const parts: string[] = [];
    if (r0.quality) parts.push(`Estética ${r0.quality}`);
    if (r0.battery) parts.push(`Batería ${r0.battery}`);
    parts.push(warranty);
    const s = parts.join(" · ");
    return s.length > 220 ? `${s.slice(0, 217)}…` : s;
  }
  const s = `${warranty} · Varias capacidades / colores · USD referencia`;
  return s.length > 220 ? `${s.slice(0, 217)}…` : s;
}

function buildUsedDetail(rows: UsedRow[]): Record<string, unknown> {
  const r0 = rows[0]!;
  const items: string[] = [];
  items.push("Condición de publicación: usado (etiqueta «Usado» en catálogo y ficha).");
  items.push("Equipo usado revisado; estado según calidad y batería indicadas en cada variante.");
  if (r0.warranty) items.push(`Garantía: ${r0.warranty}.`);
  items.push("Precios en USD referencia; consultá cotización del día.");
  const longDescription = items.join("\n\n");
  return {
    images: [],
    longDescription,
    descriptionItems: items,
    ...(r0.warranty ? { warranty: r0.warranty } : {}),
    specs: [],
    relatedIds: [],
    accessoryIds: [],
    reviews: [],
    /** Espejo de columnas BD para quien lea solo el JSON / detail. */
    stock_condition: "used",
    badge: "Usado",
  };
}

function usedProductPayload(rows: UsedRow[], sortOrder: number, usedIds: Set<string>) {
  const r0 = rows[0]!;
  const name = usedDisplayName(r0);
  const dims = varyingUsedDims(rows);

  let variant_groups: ProductVariantGroup[];
  let sellable_variants: SellableVariant[];

  if (dims.length <= 1) {
    sellable_variants = [];
    variant_groups =
      dims.length === 1 ? buildSingleUsedAbsoluteGroup(rows, dims[0]!, name) : [];
  } else {
    variant_groups = buildUsedGroups(rows, dims);
    sellable_variants = buildUsedSellableRows(rows, dims);
  }

  const minP = Math.min(...rows.map((x) => x.price));
  const modelKey = normModelKey(r0.model);
  let baseId = `usado-iphone-${slug(modelKey)}`.replace(/-+/g, "-");
  if (usedIds.has(baseId)) {
    let n = 2;
    while (usedIds.has(`${baseId}-${n}`)) n++;
    baseId = `${baseId}-${n}`;
  }
  usedIds.add(baseId);

  const brandOut = r0.brand ? titleCaseWords(r0.brand) : "Apple";
  const detail = buildUsedDetail(rows);
  const err = validateSellableMatrix(variant_groups, sellable_variants);
  if (err) throw new Error(`${name}: ${err}`);

  return {
    id: baseId,
    name,
    short: buildUsedShort(rows),
    category: "iphone",
    brand: brandOut,
    price: minP,
    stock_condition: "used" as const,
    badge: "Usado",
    image: PLACEHOLDER_IPHONE,
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

function readUsedRows(path?: string): UsedRow[] {
  let text: string;
  if (path && existsSync(path)) {
    text = readFileSync(path, "utf8");
  } else {
    const def = join(process.cwd(), "data/precios-usados-plancha.tsv");
    if (existsSync(def)) text = readFileSync(def, "utf8");
    else text = EMBEDDED_USADOS_TSV;
  }
  const out: UsedRow[] = [];
  for (const line of text.split(/\n/)) {
    const p = parseUsedLine(line);
    if (p) out.push(p);
  }
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  const writeIdx = argv.indexOf("--write");
  const outPath = writeIdx >= 0 ? argv[writeIdx + 1] : null;
  const fileArg = argv.find((a) => !a.startsWith("--") && a !== outPath);

  const all = readUsedRows(fileArg);
  const byKey = new Map<string, UsedRow[]>();
  for (const r of all) {
    const k = normModelKey(r.model);
    const arr = byKey.get(k) ?? [];
    arr.push(r);
    byKey.set(k, arr);
  }

  const usedIds = new Set<string>();
  let order = 4000;
  const payloads: ReturnType<typeof usedProductPayload>[] = [];
  for (const [, groupRows] of byKey) {
    payloads.push(usedProductPayload(groupRows, order++, usedIds));
  }

  payloads.sort((a, b) => a.name.localeCompare(b.name, "es"));

  const json = JSON.stringify(payloads, null, 2);
  if (outPath) {
    writeFileSync(outPath, json, "utf8");
    console.error(`OK ${payloads.length} productos usados → ${outPath}`);
  } else {
    console.log(json);
  }
}

const EMBEDDED_USADOS_TSV = [
  "Modelo\tCapacidad\tColor\tCalidad\tBateria\tPrecio final\tGarantia\tMarca",
  ["13 (PREVENTA)", "128GB", "COLORES MIX", "A/A+", "100%", "330", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["13 PRO", "128GB", "GRAPHITE", "A/B", "100%", "430", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["13 PRO", "128GB", "GRAPHITE, BLUE, GREEN", "A/A+", "100%", "450", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["13 PRO", "256GB", "BLUE", "A/A+", "100%", "470", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["13 PRO MAX", "128GB", "BLUE, GRAPHITE", "A/A+", "100%", "490", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["14", "128GB", "RED", "A/A+", "100%", "375", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["14 PRO", "128GB", "SILVER, PURPLE", "A/A+", "100%", "480", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["14 PRO MAX", "128GB", "PURPLE, GOLD", "A/A+", "100%", "540", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["14 PRO MAX", "256GB", "BLACK, PURPLE", "A/A+", "100%", "580", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["15", "128GB", "PINK, BLACK", "A/A+", "100%", "490", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["15 (PREVENTA)", "128GB", "COLORES MIX", "A/A+", "100%", "465", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["15 PRO", "128GB", "BLUE", "A/A+", "100%", "570", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["15 PRO MAX", "256GB", "BLACK", "A/A+", "100%", "690", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["16 PRO (PREVENTA)", "128GB", "COLORES MIX", "A/A+", "90% o mas", "740", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
  ["16 PRO MAX", "256GB", "BLACK", "A/A+", "95% o mas", "900", "1 MES, SE EXTIENDE POR 3 MESES ADQUIRIENDO EL CARGADOR ORIGINAL", "Apple"].join("\t"),
].join("\n");

main();

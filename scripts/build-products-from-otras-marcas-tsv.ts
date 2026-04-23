/**
 * Equipos nuevos de otras marcas desde TSV (Excel).
 *
 * Columnas (tab): Producto | Modelo | Capacidad | RAM | Color | Precio final | Garantia | Marca
 * - «Producto» se mapea a categoría: Parlante/Auriculares → audio, Consolas → consolas, Telefono → smartphones, Tablet → tablets.
 * - Precios tipo `U$D 60` o `60` se normalizan a número.
 *
 * Requiere migración `012_product_categories_otras.sql` aplicada en Supabase (categorías consolas, smartphones, tablets).
 *
 *   npm run build:products:otras:tsv
 *   npx tsx scripts/build-products-from-otras-marcas-tsv.ts ruta.tsv --write out.json
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { ProductVariantGroup } from "@/lib/product-variants";
import type { SellableVariant } from "@/lib/sellable-variants";
import { validateSellableMatrix } from "@/lib/sellable-variants";

type OtrasRow = {
  productType: string;
  model: string;
  modelClean: string;
  storage: string;
  ram: string;
  color: string;
  price: number;
  warranty: string;
  brand: string;
};

const PLACEHOLDER_COLOR = /^a\s+confirmar\b/i;

const DIM_ORDER = ["storage", "ram", "color", "price_list"] as const;
type Dim = (typeof DIM_ORDER)[number];

const DIM_META: Record<
  Dim,
  { id: string; label: string; kind: string; uiKind: "storage" | "select"; pricingMode: "absolute" | "delta" }
> = {
  storage: { id: "storage", label: "Capacidad", kind: "storage", uiKind: "storage", pricingMode: "delta" },
  ram: { id: "ram", label: "RAM", kind: "select", uiKind: "select", pricingMode: "delta" },
  color: { id: "color", label: "Color", kind: "color", uiKind: "color", pricingMode: "delta" },
  price_list: {
    id: "price_list",
    label: "Precio",
    kind: "select",
    uiKind: "select",
    pricingMode: "delta",
  },
};

const PLACEHOLDER_IMAGE: Record<string, string> = {
  audio: "https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80",
  consolas: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
  smartphones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
  tablets: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
  otros: "https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80",
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

/** Quita emojis / símbolos típicos al inicio del modelo (🔊 📱 …). */
function cleanModelName(raw: string): string {
  return raw
    .replace(/^[\s\u200d\ufe0f🔊📱🎮✨]+/giu, "")
    .trim()
    .replace(/\s+/g, " ");
}

function parsePriceUsd(raw: string): number {
  const t = String(raw)
    .replace(/u\s*\$?\s*d/gi, "")
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .trim();
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

function mapProductTypeToCategory(producto: string): string {
  const p = producto
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (p.includes("PARLANT")) return "audio";
  if (p.includes("AURICULAR")) return "audio";
  if (p.includes("CONSOL")) return "consolas";
  if (p.includes("TELEFON") || p.includes("TELÉFON")) return "smartphones";
  if (p.includes("TABLET")) return "tablets";
  return "otros";
}

function parseOtrasLine(line: string): OtrasRow | null {
  const t = line.trim();
  if (!t || t.startsWith("#")) return null;
  const parts = t.split("\t").map((c) => c.trim());
  while (parts.length < 8) parts.push("");
  if (/^producto$/i.test(parts[0] || "")) return null;

  const [producto, modelo, cap, ram, color, priceS, garantia, marca] = parts;
  const price = parsePriceUsd(priceS || "");
  if (!Number.isFinite(price) || !cell(modelo)) return null;
  const rawModel = cell(modelo);
  return {
    productType: cell(producto),
    model: rawModel,
    modelClean: cleanModelName(rawModel),
    storage: cell(cap),
    ram: cell(ram),
    color: PLACEHOLDER_COLOR.test(cell(color)) ? "" : cell(color),
    price,
    warranty: cell(garantia),
    brand: cell(marca) || "Sin marca",
  };
}

function rowDims(r: OtrasRow): Record<Dim, string> {
  return {
    storage: r.storage,
    ram: r.ram,
    color: r.color,
    price_list: String(r.price),
  };
}

function groupKey(r: OtrasRow): string {
  return `${mapProductTypeToCategory(r.productType)}\0${r.modelClean.toLowerCase()}`;
}

function dedupeRows(rows: OtrasRow[]): OtrasRow[] {
  const seen = new Set<string>();
  const out: OtrasRow[] = [];
  for (const r of rows) {
    const k = [r.storage, r.ram, r.color, r.price].join("\t");
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

function varyingDims(rows: OtrasRow[]): Dim[] {
  const dims: Dim[] = [];
  for (const d of DIM_ORDER) {
    if (d === "price_list") continue;
    const vals = new Set<string>();
    for (const r of rows) {
      const v = rowDims(r)[d];
      if (v) vals.add(v);
    }
    if (vals.size >= 2) dims.push(d);
  }
  const prices = new Set(rows.map((r) => r.price));
  if (dims.length === 0 && prices.size >= 2) dims.push("price_list");
  return dims;
}

function buildGroups(rows: OtrasRow[], dims: Dim[]): ProductVariantGroup[] {
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
      label: d === "price_list" ? `U$S ${label}` : label,
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

function buildSingleAbsoluteGroup(rows: OtrasRow[], d: Dim, productLabel: string): ProductVariantGroup[] {
  const meta = DIM_META[d];
  const priceByLabel = new Map<string, number>();
  for (const r of rows) {
    const rawLabel = rowDims(r)[d];
    if (!rawLabel) throw new Error(`${productLabel}: falta «${meta.label}».`);
    const label = d === "price_list" ? `U$S ${rawLabel}` : rawLabel;
    const prev = priceByLabel.get(label);
    if (prev !== undefined && prev !== r.price) {
      throw new Error(`${productLabel}: conflicto de precio en «${label}».`);
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

function buildSellableRows(rows: OtrasRow[], dims: Dim[]): SellableVariant[] {
  if (dims.length === 0) return [];
  const groups = buildGroups(rows, dims);
  const out: SellableVariant[] = [];
  rows.forEach((r, i) => {
    const selections: Record<string, string> = {};
    const rd = rowDims(r);
    for (const d of dims) {
      const meta = DIM_META[d];
      const raw = rd[d];
      if (!raw) throw new Error(`Falta ${meta.label}`);
      const labelForLookup = d === "price_list" ? `U$S ${raw}` : raw;
      const g = groups.find((x) => x.id === meta.id)!;
      const opt = g.options.find((o) => o.label === labelForLookup);
      if (!opt) throw new Error(`Opción no encontrada: ${labelForLookup}`);
      selections[meta.id] = opt.id;
    }
    const key = dims.map((d) => slug(rd[d])).join("-");
    out.push({
      id: `sv-otras-${slug(r.modelClean)}-${i}-${key}`.slice(0, 120),
      selections,
      price: r.price,
      label: null,
    });
  });
  return out;
}

function displayName(r: OtrasRow): string {
  return r.modelClean || r.model;
}

function buildDetail(rows: OtrasRow[]): Record<string, unknown> {
  const r0 = rows[0]!;
  const items: string[] = [];
  items.push("Equipo nuevo. Consultá stock de colores y versiones.");
  if (r0.warranty) items.push(`Garantía: ${r0.warranty}.`);
  items.push("Precios en USD referencia.");
  return {
    images: [],
    longDescription: items.join("\n\n"),
    descriptionItems: items,
    ...(r0.warranty ? { warranty: r0.warranty } : {}),
    specs: [],
    relatedIds: [],
    accessoryIds: [],
    reviews: [],
  };
}

function otrasPayload(rows: OtrasRow[], sortOrder: number, usedIds: Set<string>) {
  const rowsD = dedupeRows(rows);
  const r0 = rowsD[0]!;
  const category = mapProductTypeToCategory(r0.productType);
  const name = displayName(r0);
  const dims = varyingDims(rowsD);

  let variant_groups: ProductVariantGroup[];
  let sellable_variants: SellableVariant[];

  if (dims.length <= 1) {
    sellable_variants = [];
    variant_groups =
      dims.length === 1 ? buildSingleAbsoluteGroup(rowsD, dims[0]!, name) : [];
  } else {
    variant_groups = buildGroups(rowsD, dims);
    sellable_variants = buildSellableRows(rowsD, dims);
  }

  const minP = Math.min(...rowsD.map((x) => x.price));
  let baseId = `otras-${slug(category)}-${slug(r0.modelClean)}`.replace(/-+/g, "-");
  if (usedIds.has(baseId)) {
    let n = 2;
    while (usedIds.has(`${baseId}-${n}`)) n++;
    baseId = `${baseId}-${n}`;
  }
  usedIds.add(baseId);

  const brandOut = titleCaseWords(r0.brand);
  const warrantyShort = r0.warranty || "Consultá garantía";
  const short = `${warrantyShort} · Precios referencia USD`.slice(0, 240);
  const detail = buildDetail(rowsD);

  const err = validateSellableMatrix(variant_groups, sellable_variants);
  if (err) throw new Error(`${name}: ${err}`);

  return {
    id: baseId,
    name,
    short,
    category,
    brand: brandOut,
    price: minP,
    stock_condition: "new" as const,
    badge: "Nuevo",
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

function readRows(path?: string): OtrasRow[] {
  let text: string;
  if (path && existsSync(path)) {
    text = readFileSync(path, "utf8");
  } else {
    const def = join(process.cwd(), "data/precios-otras-marcas.tsv");
    if (existsSync(def)) text = readFileSync(def, "utf8");
    else text = EMBEDDED_TSV;
  }
  const out: OtrasRow[] = [];
  for (const line of text.split(/\n/)) {
    const p = parseOtrasLine(line);
    if (p) out.push(p);
  }
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  const writeIdx = argv.indexOf("--write");
  const outPath = writeIdx >= 0 ? argv[writeIdx + 1] : null;
  const fileArg = argv.find((a) => !a.startsWith("--") && a !== outPath);

  const all = readRows(fileArg);
  const byKey = new Map<string, OtrasRow[]>();
  for (const r of all) {
    const k = groupKey(r);
    const arr = byKey.get(k) ?? [];
    arr.push(r);
    byKey.set(k, arr);
  }

  const usedIds = new Set<string>();
  let order = 5500;
  const payloads: ReturnType<typeof otrasPayload>[] = [];
  for (const [, groupRows] of byKey) {
    payloads.push(otrasPayload(groupRows, order++, usedIds));
  }

  payloads.sort((a, b) => a.name.localeCompare(b.name, "es"));

  const json = JSON.stringify(payloads, null, 2);
  if (outPath) {
    writeFileSync(outPath, json, "utf8");
    console.error(`OK ${payloads.length} productos (otras marcas) → ${outPath}`);
  } else {
    console.log(json);
  }
}

/** Solo si no existe `data/precios-otras-marcas.tsv`. */
const EMBEDDED_TSV = [
  "Producto\tModelo\tCapacidad\tRAM\tColor\tPrecio final\tGarantia\tMarca",
  ["Parlante", "Parlante demo", "-", "-", "A CONFIRMAR SEGUN STOCK", "99", "", "Marca"].join("\t"),
].join("\n");

main();

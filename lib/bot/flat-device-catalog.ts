import "server-only";

import { productRowFromRecord, productRowToProduct } from "@/lib/backoffice/products-db";
import type { Product } from "@/lib/data";
import type { ProductDetailBlock } from "@/lib/product-detail-data";
import type { ProductVariantGroup } from "@/lib/product-variants";
import { getVariantUiKind, resolveVariantPrice, type VariantSelections } from "@/lib/product-variants";
import {
  parseSellableVariants,
  resolvePriceWithSellableMatrix,
  type SellableVariant,
} from "@/lib/sellable-variants";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

/** Ítem de catálogo expuesto en la API (solo campos con valor). */
export type FlatDeviceItem = {
  precio_final: number;
  /** `products.name` — “Nombre en la tienda” del backoffice. */
  nombre?: string;
  modelo?: string;
  capacidad?: string;
  color?: string;
  garantia?: string;
  chip?: string;
  tamano_pantalla?: string;
  ram?: string;
  procesador?: string;
  product_id?: string;
  condicion?: string;
};

/** `{ IPHONE: [...], MACBOOK: [...] }` */
export type FlatDeviceCatalog = Record<string, FlatDeviceItem[]>;

type FlatDeviceRowDraft = {
  nombre: string;
  modelo: string;
  capacidad: string;
  color: string;
  precio_final: number;
  garantia: string;
  chip: string;
  tamano_pantalla: string;
  ram: string;
  procesador: string;
  product_id: string;
  condicion: string;
};

const DEFAULT_COLOR = "A CONFIRMAR SEGUN STOCK";

const CATEGORY_TO_PRODUCTO: Record<string, string> = {
  iphone: "IPHONE",
  mac: "MACBOOK",
  ipad: "IPAD",
  watch: "APPLE WATCH",
  desktop: "IMAC",
  audio: "AIRPODS",
};

const PRODUCTO_PREFIX: Record<string, string> = {
  IPHONE: "iPhone",
  MACBOOK: "MacBook",
  IPAD: "iPad",
  "APPLE WATCH": "Apple Watch",
  IMAC: "iMac",
  AIRPODS: "AirPods",
};

const CATEGORY_ORDER = [
  "iphone",
  "mac",
  "ipad",
  "watch",
  "desktop",
  "audio",
  "consolas",
  "smartphones",
  "tablets",
  "servicio",
  "otros",
] as const;

/** Dimensiones del import TSV → ids de `variant_groups`. */
const DIM_GROUP_IDS = ["connectivity", "storage", "chip", "screen", "ram", "processor"] as const;
type DimGroupId = (typeof DIM_GROUP_IDS)[number];

const FLAT_CATALOG_COLUMNS =
  "id,name,category,price,stock_condition,variant_groups,sellable_variants,detail,short,sort_order,published" as const;

function isActiveProductRow(raw: Record<string, unknown>): boolean {
  return raw.published === true || raw.published === "true" || raw.published === 1;
}

function trimOrEmpty(value: string): string {
  return value.trim();
}

function extractWarranty(product: Product): string {
  const detail = product.detail;
  if (detail && typeof detail === "object" && "warranty" in detail) {
    const w = (detail as ProductDetailBlock).warranty;
    if (typeof w === "string" && w.trim()) return w.trim();
  }
  const short = product.short.trim();
  if (short) {
    const head = short.split("·")[0]?.trim();
    if (head && /garant/i.test(head)) return head;
  }
  return "";
}

function categoryToProducto(category: string): string {
  return CATEGORY_TO_PRODUCTO[category] ?? category.toUpperCase();
}

function optionLabel(
  groups: ProductVariantGroup[],
  groupId: string,
  optionId: string | undefined,
): string {
  if (!optionId) return "";
  const group = groups.find((g) => g.id === groupId);
  const opt = group?.options.find((o) => o.id === optionId);
  return opt?.label?.trim() ?? "";
}

function selectionLabels(
  groups: ProductVariantGroup[],
  selections: VariantSelections,
): Record<DimGroupId, string> {
  const out = {} as Record<DimGroupId, string>;
  for (const id of DIM_GROUP_IDS) {
    out[id] = optionLabel(groups, id, selections[id]);
  }
  return out;
}

function buildModelo(producto: string, productName: string, connectivity: string): string {
  const prefix = PRODUCTO_PREFIX[producto];
  let base = productName.trim();
  if (prefix && base.toLowerCase().startsWith(prefix.toLowerCase())) {
    base = base.slice(prefix.length).trim();
  }
  if (producto === "IMAC") return "";

  const upper = base.toUpperCase();
  const conn = connectivity.trim().toUpperCase();
  if (conn.includes("LTE") && !upper.includes("+ LTE")) {
    return `${upper} + LTE`.trim();
  }
  return upper;
}

function resolveRowPrice(
  product: Product,
  groups: ProductVariantGroup[],
  selections: VariantSelections,
  sellableRow?: SellableVariant,
): number {
  const sellable = parseSellableVariants(product.sellableVariants);
  if (sellableRow?.price != null && Number.isFinite(Number(sellableRow.price))) {
    return Number(sellableRow.price);
  }
  if (sellable.length) {
    return resolvePriceWithSellableMatrix(product.price, groups, selections, sellable);
  }
  return resolveVariantPrice(product.price, groups, selections);
}

function flatRowFromSelections(
  product: Product,
  groups: ProductVariantGroup[],
  selections: VariantSelections,
  sellableRow?: SellableVariant,
): FlatDeviceRowDraft {
  const labels = selectionLabels(groups, selections);
  const producto = categoryToProducto(product.category);
  const modelo = buildModelo(producto, product.name, labels.connectivity);

  const colorGroup = groups.find((g) => getVariantUiKind(g) === "color");
  const colorLabel = colorGroup ? optionLabel(groups, colorGroup.id, selections[colorGroup.id]) : "";
  const color =
    colorLabel && !/^a\s+confirmar\b/i.test(colorLabel) ? colorLabel : DEFAULT_COLOR;

  return {
    nombre: product.name.trim(),
    modelo,
    capacidad: trimOrEmpty(labels.storage),
    color,
    precio_final: resolveRowPrice(product, groups, selections, sellableRow),
    garantia: extractWarranty(product),
    chip: trimOrEmpty(labels.chip),
    tamano_pantalla: trimOrEmpty(labels.screen),
    ram: trimOrEmpty(labels.ram),
    procesador: trimOrEmpty(labels.processor),
    product_id: product.id,
    condicion: product.condition ?? "new",
  };
}

/** Omite campos vacíos o placeholder `-` en la respuesta JSON. */
export function compactDeviceItem(row: FlatDeviceRowDraft): FlatDeviceItem {
  const item: FlatDeviceItem = { precio_final: row.precio_final };

  if (row.nombre.trim()) item.nombre = row.nombre.trim();
  if (row.modelo.trim()) item.modelo = row.modelo.trim();
  if (row.capacidad.trim()) item.capacidad = row.capacidad.trim();
  if (row.color.trim()) item.color = row.color.trim();
  if (row.garantia.trim()) item.garantia = row.garantia.trim();
  if (row.chip.trim()) item.chip = row.chip.trim();
  if (row.tamano_pantalla.trim()) item.tamano_pantalla = row.tamano_pantalla.trim();
  if (row.ram.trim()) item.ram = row.ram.trim();
  if (row.procesador.trim()) item.procesador = row.procesador.trim();
  if (row.product_id.trim()) item.product_id = row.product_id.trim();
  if (row.condicion.trim()) item.condicion = row.condicion.trim();

  return item;
}

function expandSingleAbsoluteGroup(product: Product, group: ProductVariantGroup): FlatDeviceRowDraft[] {
  const groups = product.variantGroups ?? [];
  return group.options.map((opt) => {
    const selections: VariantSelections = { [group.id]: opt.id };
    const sellableRow =
      group.pricingMode === "absolute" && opt.price != null
        ? ({ id: opt.id, selections, price: opt.price } satisfies SellableVariant)
        : undefined;
    return flatRowFromSelections(product, groups, selections, sellableRow);
  });
}

/** Expande un producto publicado a filas planas (inverso del import TSV). */
export function expandProductToFlatRows(product: Product): FlatDeviceRowDraft[] {
  const groups = product.variantGroups ?? [];
  const sellable = parseSellableVariants(product.sellableVariants);

  if (sellable.length > 0) {
    return sellable.map((row) => flatRowFromSelections(product, groups, row.selections, row));
  }

  const absoluteGroups = groups.filter(
    (g) => g.pricingMode === "absolute" && g.options.length > 0,
  );
  if (absoluteGroups.length === 1) {
    return expandSingleAbsoluteGroup(product, absoluteGroups[0]!);
  }

  if (groups.length === 0) {
    return [flatRowFromSelections(product, groups, {})];
  }

  const pricedGroup = groups.find((g) => g.options.some((o) => o.price != null));
  if (pricedGroup) {
    return expandSingleAbsoluteGroup(product, pricedGroup);
  }

  return [flatRowFromSelections(product, groups, {})];
}

function categorySortIndex(slug: string): number {
  const idx = CATEGORY_ORDER.indexOf(slug as (typeof CATEGORY_ORDER)[number]);
  return idx >= 0 ? idx : CATEGORY_ORDER.length + 1;
}

function compareFlatRows(a: FlatDeviceRowDraft, b: FlatDeviceRowDraft): number {
  return (
    a.modelo.localeCompare(b.modelo, "es") ||
    a.capacidad.localeCompare(b.capacidad, "es") ||
    a.chip.localeCompare(b.chip, "es") ||
    a.tamano_pantalla.localeCompare(b.tamano_pantalla, "es") ||
    a.ram.localeCompare(b.ram, "es") ||
    a.procesador.localeCompare(b.procesador, "es") ||
    a.precio_final - b.precio_final
  );
}

/** Agrupa filas planas por nombre de categoría (`IPHONE`, `MACBOOK`, …). */
export function buildFlatDeviceCatalog(products: Product[]): FlatDeviceCatalog {
  const bySlug = new Map<string, FlatDeviceRowDraft[]>();

  for (const product of products) {
    const rows = expandProductToFlatRows(product);
    const slug = product.category.trim() || "otros";
    const bucket = bySlug.get(slug) ?? [];
    bucket.push(...rows);
    bySlug.set(slug, bucket);
  }

  const catalog: FlatDeviceCatalog = {};
  for (const [slug, rows] of [...bySlug.entries()].sort(
    ([a], [b]) => categorySortIndex(a) - categorySortIndex(b) || a.localeCompare(b, "es"),
  )) {
    const categoryName = categoryToProducto(slug);
    const items = rows.sort(compareFlatRows).map(compactDeviceItem);
    if (items.length > 0) catalog[categoryName] = items;
  }

  return catalog;
}

function normalizeProductSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[\s_-]+/g, " ");
}

function buildCategoryAliasMap(catalog: FlatDeviceCatalog): Map<string, string> {
  const map = new Map<string, string>();
  for (const key of Object.keys(catalog)) {
    map.set(normalizeProductSearchText(key), key);
  }
  for (const [slug, producto] of Object.entries(CATEGORY_TO_PRODUCTO)) {
    if (!catalog[producto]) continue;
    map.set(normalizeProductSearchText(slug), producto);
    map.set(normalizeProductSearchText(producto), producto);
  }
  for (const [producto, prefix] of Object.entries(PRODUCTO_PREFIX)) {
    if (!catalog[producto]) continue;
    map.set(normalizeProductSearchText(prefix), producto);
  }
  return map;
}

function itemMatchesProductQuery(
  item: FlatDeviceItem,
  categoryKey: string,
  query: string,
): boolean {
  const haystacks = [categoryKey, item.nombre, item.modelo, item.product_id]
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .map(normalizeProductSearchText);

  return haystacks.some((h) => h.includes(query) || h === query);
}

export type FlatDeviceStateFilter = "new" | "used";

/** `state=usado|used` o `state=nuevo|new|no usado`. Valor inválido → `null` (sin filtrar). */
export function parseFlatDeviceStateFilter(stateQuery: string): FlatDeviceStateFilter | null {
  const q = normalizeProductSearchText(stateQuery);
  if (!q) return null;
  if (q === "usado" || q === "used") return "used";
  if (q === "nuevo" || q === "new" || q === "no usado") return "new";
  return null;
}

function itemMatchesStateFilter(item: FlatDeviceItem, state: FlatDeviceStateFilter): boolean {
  const condicion = normalizeProductSearchText(item.condicion ?? "new");
  return condicion === state;
}

function filterFlatDeviceCatalogByState(
  catalog: FlatDeviceCatalog,
  state: FlatDeviceStateFilter,
): FlatDeviceCatalog {
  const filtered: FlatDeviceCatalog = {};
  for (const [key, items] of Object.entries(catalog)) {
    const matched = items.filter((item) => itemMatchesStateFilter(item, state));
    if (matched.length > 0) filtered[key] = matched;
  }
  return filtered;
}

export type FlatDeviceFilterOptions = {
  product?: string;
  state?: FlatDeviceStateFilter;
};

/** Aplica filtros opcionales de `product` y/o `state` sobre el catálogo agrupado. */
export function applyFlatDeviceFilters(
  catalog: FlatDeviceCatalog,
  options: FlatDeviceFilterOptions,
): FlatDeviceCatalog {
  let result = catalog;
  if (options.product?.trim()) {
    result = filterFlatDeviceCatalog(result, options.product);
  }
  if (options.state) {
    result = filterFlatDeviceCatalogByState(result, options.state);
  }
  return result;
}

/**
 * Filtra el catálogo por `product`: categoría (IPHONE, iphone, …), nombre en tienda, modelo o product_id.
 * Coincidencia parcial, case-insensitive.
 */
export function filterFlatDeviceCatalog(
  catalog: FlatDeviceCatalog,
  productQuery: string,
): FlatDeviceCatalog {
  const query = normalizeProductSearchText(productQuery);
  if (!query) return catalog;

  const categoryKey = buildCategoryAliasMap(catalog).get(query);
  if (categoryKey && catalog[categoryKey]) {
    return { [categoryKey]: catalog[categoryKey] };
  }

  const filtered: FlatDeviceCatalog = {};
  for (const [key, items] of Object.entries(catalog)) {
    const matched = items.filter((item) => itemMatchesProductQuery(item, key, query));
    if (matched.length > 0) filtered[key] = matched;
  }
  return filtered;
}

/** Misma lógica que {@link filterFlatDeviceCatalog}, pero devuelve ítems sueltos (sin agrupar por categoría). */
export function filterFlatDeviceItems(
  catalog: FlatDeviceCatalog,
  options: FlatDeviceFilterOptions = {},
): FlatDeviceItem[] {
  return Object.values(applyFlatDeviceFilters(catalog, options)).flat();
}

/** Solo productos activos en el BO (`published = true`, visible en tienda). */
async function loadActiveProductsForFlatCatalog(): Promise<Product[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("products")
      .select(FLAT_CATALOG_COLUMNS)
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data?.length) return [];
    return data
      .filter((raw) => isActiveProductRow(raw as Record<string, unknown>))
      .map((raw) => productRowToProduct(productRowFromRecord(raw as Record<string, unknown>)));
  } catch {
    return [];
  }
}

export async function loadFlatDeviceCatalog(): Promise<FlatDeviceCatalog> {
  const products = await loadActiveProductsForFlatCatalog();
  return buildFlatDeviceCatalog(products);
}

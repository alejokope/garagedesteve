import type { CategoryId, Product, ProductStockCondition } from "@/lib/data";
import { productCarouselUrls } from "@/lib/product-carousel";
import {
  defaultVariantSelections,
  getVariantUiKind,
  optionVariantImageUrls,
  resolveVariantPrimaryImageUrl,
} from "@/lib/product-variants";
import {
  defaultSelectionsWithSellable,
  parseSellableVariants,
} from "@/lib/sellable-variants";
import { isStockConditionUsed, stockConditionLabel } from "@/lib/stock-condition";

export type { ProductStockCondition };

/**
 * Miniatura en grillas: si hay grupo **color**, usa la opción enlazada a la primera miniatura del carrusel
 * (`carouselIndex === 0`) vía `defaultVariantSelections`; si no hay match, la primera opción.
 * Sin grupo color, conserva la lógica general de variantes.
 */
export function catalogProductPreviewImage(p: Product): string {
  const groups = p.variantGroups ?? [];
  const sellable = parseSellableVariants(p.sellableVariants);
  const sel =
    sellable.length > 0
      ? defaultSelectionsWithSellable(groups, sellable, () => defaultVariantSelections(p.variantGroups))
      : defaultVariantSelections(p.variantGroups);
  const carousel = productCarouselUrls(p);
  const colorGroup = groups.find((g) => getVariantUiKind(g) === "color");
  if (colorGroup) {
    const oid = sel[colorGroup.id];
    const opt = oid ? colorGroup.options.find((o) => o.id === oid) : undefined;
    const urls = opt ? optionVariantImageUrls(opt) : [];
    const first = urls[0]?.trim();
    if (first) return first;
    if (opt && carousel.length) {
      const raw = opt.carouselIndex;
      const idx =
        typeof raw === "number" &&
        Number.isInteger(raw) &&
        raw >= 0 &&
        raw < carousel.length
          ? raw
          : 0;
      return carousel[idx] ?? (p.image ?? "").trim();
    }
    return (p.image ?? "").trim();
  }
  return resolveVariantPrimaryImageUrl(p.image ?? "", groups, sel, carousel);
}

/**
 * Clave interna para filtrar por marca (minúsculas, espacios colapsados).
 * Productos sin `brand` en BD usan {@link SIN_MARCA_BUCKET_ID} y se muestran bajo "Otras marcas".
 */
export type ShopBrandFilterId = string;

/** Valor reservado: productos sin campo `brand` (filtro "Otras marcas"). */
export const SIN_MARCA_BUCKET_ID = "__sin_marca__";

export function normalizeBrandFilterKey(raw: string): ShopBrandFilterId {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

export function shopBrandKeyFromProduct(p: Product): ShopBrandFilterId {
  const b = p.brand?.trim();
  if (b) return normalizeBrandFilterKey(b);
  return SIN_MARCA_BUCKET_ID;
}

/**
 * Opciones del filtro Marca: una entrada por cada texto distinto en `product.brand`,
 * más "Otras marcas" si hay algún producto sin marca.
 */
export function brandFilterOptionsFromProducts(products: Product[]): { id: ShopBrandFilterId; label: string }[] {
  const labelByKey = new Map<string, string>();
  let hasSinMarca = false;

  for (const p of products) {
    const b = p.brand?.trim();
    if (!b) {
      hasSinMarca = true;
      continue;
    }
    const key = normalizeBrandFilterKey(b);
    if (!labelByKey.has(key)) labelByKey.set(key, b);
  }

  const sorted = [...labelByKey.entries()].sort((a, b) =>
    a[1].localeCompare(b[1], "es", { sensitivity: "base" }),
  );
  const out: { id: ShopBrandFilterId; label: string }[] = sorted.map(([id, label]) => ({ id, label }));
  if (hasSinMarca) {
    out.push({ id: SIN_MARCA_BUCKET_ID, label: "Otras marcas" });
  }
  return out;
}

/** Normaliza tokens de URL (compat: valores viejos Apple/Samsung/Otras). */
export function parseBrandFilterKeysFromUrlParam(param: string | null): ShopBrandFilterId[] {
  const tokens = param
    ?.split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  if (!tokens?.length) return [];
  return tokens.map((t) => {
    const lower = t.toLowerCase();
    if (t === "Otras" || lower === "otras") return SIN_MARCA_BUCKET_ID;
    return normalizeBrandFilterKey(t);
  });
}

export type ShopTipo =
  | "smartphones"
  | "accessories"
  | "smartwatch"
  | "audio"
  | "mac"
  | "tablet"
  | "desktop"
  | "servicio"
  | "otro";

export type CatalogEstado = "nuevo" | "oferta" | "mas-vendido";

export type EnrichedProduct = Product & {
  /** Clave para el filtro de marcas (ver {@link shopBrandKeyFromProduct}). */
  shopBrand: ShopBrandFilterId;
  compareAtPrice: number | null;
  discountPercent: number | null;
  estado: CatalogEstado;
  shopTipo: ShopTipo;
  categoryLabel: string;
};

const categoryLabels: Record<CategoryId, string> = {
  mac: "MAC",
  ipad: "IPAD",
  iphone: "IPHONE",
  watch: "WATCH",
  audio: "AUDIO",
  desktop: "IMAC",
  servicio: "SERVICIO",
  otros: "ACCESORIOS",
  consolas: "CONSOLAS",
  smartphones: "CELULARES",
  tablets: "TABLETS",
};

/** Etiqueta para filtros / UI cuando el id no está en el mapa fijo. */
export function categoryLabelForProduct(category: string): string {
  const known = categoryLabels[category as CategoryId];
  if (known) return known;
  return category
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Derivado de la categoría del producto (backoffice); usado para orden “relevancia” y datos enriquecidos. */
export function shopTipoFromCategory(c: string): ShopTipo {
  switch (c) {
    case "iphone":
    case "smartphones":
      return "smartphones";
    case "watch":
      return "smartwatch";
    case "audio":
      return "audio";
    case "ipad":
    case "tablets":
      return "tablet";
    case "mac":
      return "mac";
    case "desktop":
      return "desktop";
    case "servicio":
      return "servicio";
    case "otros":
      return "accessories";
    case "consolas":
      return "otro";
    default:
      return "otro";
  }
}

function hashSeed(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
  return Math.abs(h);
}

/** Enriquece datos de catálogo (badges, precio tachado) de forma determinista. */
export function enrichProduct(p: Product): EnrichedProduct {
  const seed = hashSeed(p.id);
  const shopBrand = shopBrandKeyFromProduct(p);
  const shopTipo = shopTipoFromCategory(p.category);
  const categoryLabel = categoryLabelForProduct(p.category);

  let compareAtPrice: number | null = null;
  let discountPercent: number | null = null;
  let estado: CatalogEstado;

  const badgeLower = p.badge?.toLowerCase() ?? "";
  const cmp = p.compareAtPrice;
  const pct = p.discountPercent;
  const hasRealPromo =
    p.price > 0 &&
    typeof cmp === "number" &&
    typeof pct === "number" &&
    pct > 0 &&
    pct <= 100 &&
    cmp > p.price;

  if (hasRealPromo) {
    compareAtPrice = cmp;
    discountPercent = pct;
    estado = "oferta";
  } else if (badgeLower.includes("nuevo") && !isStockConditionUsed(p.condition)) {
    estado = "nuevo";
  } else if (seed % 7 === 0 && p.category !== "servicio" && !isStockConditionUsed(p.condition)) {
    estado = "mas-vendido";
  } else {
    estado = "nuevo";
  }

  return {
    ...p,
    shopBrand,
    compareAtPrice,
    discountPercent,
    estado,
    shopTipo,
    categoryLabel,
  };
}

export const PAGE_SIZE = 9;

export const shopTipos: { id: ShopTipo; label: string }[] = [
  { id: "smartphones", label: "Smartphones" },
  { id: "accessories", label: "Accesorios" },
  { id: "smartwatch", label: "Smartwatch" },
  { id: "audio", label: "Audio" },
  { id: "mac", label: "Mac" },
  { id: "tablet", label: "Tablet" },
  { id: "desktop", label: "Escritorio" },
  { id: "servicio", label: "Servicio técnico" },
  { id: "otro", label: "Otros" },
];

const shopTipoIds = new Set(shopTipos.map((t) => t.id));

function categoryIdFromLegacyShopTipo(t: ShopTipo): CategoryId | null {
  const m: Record<ShopTipo, CategoryId | null> = {
    smartphones: "iphone",
    accessories: "otros",
    smartwatch: "watch",
    audio: "audio",
    mac: "mac",
    tablet: "ipad",
    desktop: "desktop",
    servicio: "servicio",
    otro: null,
  };
  return m[t] ?? null;
}

/**
 * Categorías seleccionadas al cargar el catálogo: `cat` (ids separados por coma, ej. iphone,ipad)
 * o compatibilidad con URLs viejas `tipos` (smartphones, tablet, …).
 */
const URL_CATEGORY_SLUG = /^[a-z0-9_-]{1,64}$/;

export function catalogCategoriesFromUrl(searchParams: {
  get: (key: string) => string | null;
}): string[] {
  const rawCat = searchParams.get("cat");
  if (rawCat?.trim()) {
    const parts = rawCat.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
    const out = parts.filter((p) => URL_CATEGORY_SLUG.test(p));
    if (out.length) return [...new Set(out)];
  }
  const rawTipos = searchParams.get("tipos");
  if (rawTipos?.trim()) {
    const parts = rawTipos.split(",").map((x) => x.trim()).filter(Boolean);
    const fromTipos: string[] = [];
    for (const part of parts) {
      if (!shopTipoIds.has(part as ShopTipo)) continue;
      const cid = categoryIdFromLegacyShopTipo(part as ShopTipo);
      if (cid) fromTipos.push(cid);
    }
    if (fromTipos.length) return [...new Set(fromTipos)];
  }
  return [];
}

export const shopEstados: { id: CatalogEstado; label: string }[] = [
  { id: "nuevo", label: "Nuevo" },
  { id: "oferta", label: "Oferta" },
  { id: "mas-vendido", label: "Más vendido" },
];

/**
 * Condiciones de stock presentes en el catálogo cargado (slug + etiqueta).
 * Los slugs permitidos en BO están en {@link STOCK_CONDITION_OPTIONS}.
 */
export function stockFilterOptionsFromProducts(products: Product[]): { id: string; label: string }[] {
  const ids = new Set<string>();
  for (const p of products) {
    const c = p.condition?.trim();
    if (c) ids.add(c);
  }
  if (ids.size === 0) return [];
  return [...ids]
    .sort((a, b) =>
      stockConditionLabel(a).localeCompare(stockConditionLabel(b), "es", { sensitivity: "base" }),
    )
    .map((id) => ({ id, label: stockConditionLabel(id) }));
}

/**
 * Categorías que tienen al menos un producto en el listado; la etiqueta viene del diccionario
 * (Listas → Categorías) cuando existe.
 */
export function categoryFilterOptionsFromProducts(
  products: Product[],
  dictionary: { id: string; label: string }[],
): { id: string; label: string }[] {
  const idsInCatalog = new Set(products.map((p) => p.category).filter(Boolean));
  if (idsInCatalog.size === 0) return [];
  const dictLabel = new Map(dictionary.map((d) => [d.id, d.label]));
  const ids = [...idsInCatalog].sort((a, b) =>
    (dictLabel.get(a) ?? categoryLabelForProduct(a)).localeCompare(
      dictLabel.get(b) ?? categoryLabelForProduct(b),
      "es",
      { sensitivity: "base" },
    ),
  );
  return ids.map((id) => ({
    id,
    label: dictLabel.get(id) ?? categoryLabelForProduct(id),
  }));
}

/** Etiquetas de catálogo (nuevo / oferta / más vendido) presentes en el listado enriquecido. */
export function estadoFilterOptionsFromEnriched(
  list: EnrichedProduct[],
): { id: CatalogEstado; label: string }[] {
  const seen = new Set<CatalogEstado>();
  for (const p of list) {
    seen.add(p.estado);
  }
  return shopEstados.filter((e) => seen.has(e.id));
}

export type SortKey = "relevancia" | "precio-asc" | "novedad";

export function filterEnriched(
  list: EnrichedProduct[],
  opts: {
    q: string;
    marcas: ShopBrandFilterId[];
    /** Filtro por categoría de producto (misma clave que en la tienda / backoffice). */
    categorias: string[];
    estados: CatalogEstado[];
    stockConditions: ProductStockCondition[];
    precioMax: number;
  },
): EnrichedProduct[] {
  const q = opts.q.trim().toLowerCase();
  return list.filter((p) => {
    if (q) {
      const blob = `${p.name} ${p.short} ${p.brand ?? ""}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    if (opts.marcas.length > 0 && !opts.marcas.includes(p.shopBrand)) return false;
    if (opts.categorias.length > 0 && !opts.categorias.includes(p.category)) return false;
    if (opts.estados.length) {
      const matchEstado = opts.estados.some((e) => {
        if (e === "nuevo") return p.estado === "nuevo" && !isStockConditionUsed(p.condition);
        return p.estado === e;
      });
      if (!matchEstado) return false;
    }
    if (opts.stockConditions.length) {
      const c = p.condition;
      if (!c || !opts.stockConditions.includes(c)) return false;
    }
    if (p.price > opts.precioMax) return false;
    return true;
  });
}

export function sortEnriched(list: EnrichedProduct[], sort: SortKey): EnrichedProduct[] {
  const copy = [...list];
  if (sort === "precio-asc") {
    copy.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
  } else if (sort === "novedad") {
    copy.reverse();
  }
  return copy;
}

/** Estado de filtros tal como se refleja en `/tienda?…` (compartir / copiar enlace). */
export type CatalogUrlState = {
  q: string;
  sort: SortKey;
  /** Página mostrada (1-based), ya acotada al total de páginas. */
  page: number;
  marcas: ShopBrandFilterId[];
  categorias: string[];
  estados: CatalogEstado[];
  stockConditions: ProductStockCondition[];
  clampedPrecioMax: number;
  minCatalogPrice: number;
  maxCatalogPrice: number;
};

/**
 * Query string para `/tienda` (sin `?` ni hash). Orden de claves estable.
 * `marcas`: {@link SIN_MARCA_BUCKET_ID} se serializa como `Otras` (misma convención que {@link parseBrandFilterKeysFromUrlParam}).
 */
export function buildCatalogUrlSearchString(opts: CatalogUrlState): string {
  const u = new URLSearchParams();
  const q = opts.q.trim();
  if (q) u.set("q", q);
  if (opts.sort !== "relevancia") u.set("sort", opts.sort);
  if (opts.page > 1) u.set("page", String(opts.page));
  if (opts.categorias.length) {
    u.set("cat", [...opts.categorias].sort().join(","));
  }
  if (opts.marcas.length) {
    u.set(
      "marcas",
      [...opts.marcas]
        .map((id) => (id === SIN_MARCA_BUCKET_ID ? "Otras" : id))
        .sort()
        .join(","),
    );
  }
  if (opts.estados.length) {
    u.set("estados", [...opts.estados].sort().join(","));
  }
  if (opts.stockConditions.length) {
    u.set("condicion", [...opts.stockConditions].sort().join(","));
  }
  if (opts.maxCatalogPrice > opts.minCatalogPrice && opts.clampedPrecioMax < opts.maxCatalogPrice) {
    u.set("max", String(Math.round(opts.clampedPrecioMax)));
  }
  return u.toString();
}

/**
 * Clave estable para remontar el catálogo al cambiar filtros “por enlace” (home, etc.).
 * Omite `q` y `max` para no perder foco al buscar ni al arrastrar el tope de precio.
 */
export function catalogFilterLayoutKeyFromSearchParams(sp: {
  get: (key: string) => string | null;
}): string {
  const u = new URLSearchParams();
  const sort = sp.get("sort");
  if (sort && sort !== "relevancia") u.set("sort", sort);
  const page = sp.get("page");
  if (page && page !== "1") u.set("page", page);
  const cat = sp.get("cat");
  if (cat?.trim()) u.set("cat", cat.trim().toLowerCase());
  const tipos = sp.get("tipos");
  if (tipos?.trim()) u.set("tipos", tipos.trim());
  const marcas = sp.get("marcas");
  if (marcas?.trim()) u.set("marcas", marcas.trim());
  const estados = sp.get("estados");
  if (estados?.trim()) u.set("estados", estados.trim());
  const condicion = sp.get("condicion");
  if (condicion?.trim()) u.set("condicion", condicion.trim());
  return u.toString();
}

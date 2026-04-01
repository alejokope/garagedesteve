import type { CategoryId, Product, ProductStockCondition } from "@/lib/data";

export type { ProductStockCondition };

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
};

function shopTipoFromCategory(c: CategoryId): ShopTipo {
  switch (c) {
    case "iphone":
      return "smartphones";
    case "watch":
      return "smartwatch";
    case "audio":
      return "audio";
    case "ipad":
      return "tablet";
    case "mac":
      return "mac";
    case "desktop":
      return "desktop";
    case "servicio":
      return "servicio";
    case "otros":
      return "accessories";
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
  const categoryLabel = categoryLabels[p.category];

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
  } else if (badgeLower.includes("nuevo") && p.condition !== "used") {
    estado = "nuevo";
  } else if (seed % 7 === 0 && p.category !== "servicio") {
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
  { id: "servicio", label: "Servicio" },
  { id: "otro", label: "Otros" },
];

export const shopEstados: { id: CatalogEstado; label: string }[] = [
  { id: "nuevo", label: "Nuevo" },
  { id: "oferta", label: "Oferta" },
  { id: "mas-vendido", label: "Más vendido" },
];

export const shopStockConditions: { id: ProductStockCondition; label: string }[] = [
  { id: "new", label: "Nuevo" },
  { id: "used", label: "Usado" },
];

export type SortKey = "relevancia" | "precio-asc" | "novedad";

export function filterEnriched(
  list: EnrichedProduct[],
  opts: {
    q: string;
    marcas: ShopBrandFilterId[];
    tipos: ShopTipo[];
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
    if (opts.tipos.length && !opts.tipos.includes(p.shopTipo)) return false;
    if (opts.estados.length) {
      const matchEstado = opts.estados.some((e) => {
        if (e === "nuevo") return p.estado === "nuevo" && p.condition !== "used";
        return p.estado === e;
      });
      if (!matchEstado) return false;
    }
    if (opts.stockConditions.length) {
      const c = p.condition;
      const matchesNew = c !== "used";
      const matchesUsed = c === "used";
      const wantNew = opts.stockConditions.includes("new");
      const wantUsed = opts.stockConditions.includes("used");
      let ok = false;
      if (wantNew && matchesNew) ok = true;
      if (wantUsed && matchesUsed) ok = true;
      if (!ok) return false;
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

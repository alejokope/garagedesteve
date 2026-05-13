/**
 * Condición de stock en `products.stock_condition` (slug) + etiquetas para BO, grilla y filtros.
 */

export const STOCK_CONDITION_SLUG_MAX = 40;

const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/;

/** Valores del desplegable en BO (solo nuevas opciones: editá este array). */
export const STOCK_CONDITION_OPTIONS: readonly { id: string; label: string }[] = [
  { id: "new", label: "Nuevo" },
  { id: "used", label: "Usado" },
] as const;

const LABEL_BY_ID = new Map(STOCK_CONDITION_OPTIONS.map((o) => [o.id, o.label]));

const ALLOWED_IDS = new Set(STOCK_CONDITION_OPTIONS.map((o) => o.id));

export function isAllowedStockConditionId(id: string | null | undefined): boolean {
  return Boolean(id && ALLOWED_IDS.has(id));
}

/** Normaliza slug para guardar en BD / comparar en filtros. */
export function normalizeStockConditionSlug(raw: string | null | undefined): string | null {
  const t = (raw ?? "").trim().toLowerCase();
  if (!t || t.length > STOCK_CONDITION_SLUG_MAX) return null;
  if (!SLUG_RE.test(t)) return null;
  return t;
}

/** Etiqueta corta para chips en tienda y BO. */
export function stockConditionLabel(id: string | null | undefined): string {
  if (!id) return "";
  return LABEL_BY_ID.get(id) ?? titleCaseSlug(id);
}

function titleCaseSlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function isStockConditionUsed(id: string | null | undefined): boolean {
  return id === "used";
}

export function isStockConditionNew(id: string | null | undefined): boolean {
  return id === "new";
}

/** Para estilos: usado, nuevo sellado, u otros slugs. */
export type StockRibbonTone = "used" | "new" | "extra";

export function stockConditionRibbonTone(id: string | null | undefined): StockRibbonTone {
  if (isStockConditionUsed(id)) return "used";
  if (isStockConditionNew(id)) return "new";
  return "extra";
}

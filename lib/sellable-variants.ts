/**
 * Variantes vendibles: combinaciones explícitas (no producto cartesiano).
 * `variant_groups` sigue definiendo etiquetas, UI y precios por opción;
 * `sellableVariants` restringe qué tuplas existen.
 */

import type { ProductVariantGroup } from "@/lib/product-variants";
import { resolveVariantPrice, type VariantSelections } from "@/lib/product-variants";

export type SellableVariant = {
  id: string;
  selections: VariantSelections;
  /**
   * Precio final USD para esta fila. Si falta, se usa `resolveVariantPrice`
   * con los grupos y `selections`.
   */
  price?: number | null;
  /** Texto auxiliar (p. ej. SKU); la tienda usa las etiquetas de los grupos. */
  label?: string | null;
};

export function parseSellableVariants(raw: unknown): SellableVariant[] {
  return normalizeSellableRows(raw);
}

export function normalizeSellableRows(raw: unknown): SellableVariant[] {
  if (!Array.isArray(raw)) return [];
  const out: SellableVariant[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    if (!id) continue;
    const selRaw = o.selections;
    if (!selRaw || typeof selRaw !== "object") continue;
    const selections: VariantSelections = {};
    for (const [k, v] of Object.entries(selRaw as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim()) selections[k] = v.trim();
    }
    let price: number | undefined;
    if (o.price === null || o.price === undefined) {
      price = undefined;
    } else if (typeof o.price === "number" && Number.isFinite(o.price)) {
      price = o.price;
    } else if (typeof o.price === "string") {
      const n = Number(String(o.price).replace(/\s/g, "").replace(",", "."));
      if (!Number.isNaN(n) && Number.isFinite(n)) price = n;
    }
    const label =
      o.label === null || o.label === undefined
        ? null
        : typeof o.label === "string"
          ? o.label.trim() || null
          : null;
    out.push({ id, selections, ...(price !== undefined ? { price } : {}), label });
  }
  return out;
}

export function isSellableMatrixActive(rows: SellableVariant[]): boolean {
  return rows.length > 0;
}

export function rowMatchesGroupDefinitions(
  row: SellableVariant,
  groups: ProductVariantGroup[],
): boolean {
  if (!groups.length) return false;
  for (const g of groups) {
    const oid = row.selections[g.id];
    if (!oid || !g.options.some((o) => o.id === oid)) return false;
  }
  return true;
}

export function variantsMatchingFixedSelections(
  groups: ProductVariantGroup[],
  rows: SellableVariant[],
  fixed: VariantSelections,
): SellableVariant[] {
  const keys = Object.keys(fixed);
  return rows.filter((row) => keys.every((k) => fixed[k] === row.selections[k]));
}

/** Opciones del grupo `groupIndex` compatibles con las elecciones anteriores (orden de `groups`). */
export function allowedOptionIdsForGroupIndex(
  groups: ProductVariantGroup[],
  rows: SellableVariant[],
  groupIndex: number,
  partial: VariantSelections,
): string[] {
  if (groupIndex < 0 || groupIndex >= groups.length) return [];
  const prefix: VariantSelections = {};
  for (let i = 0; i < groupIndex; i++) {
    const gid = groups[i]!.id;
    const v = partial[gid];
    if (typeof v === "string" && v) prefix[gid] = v;
  }
  const pool = variantsMatchingFixedSelections(groups, rows, prefix);
  const gid = groups[groupIndex]!.id;
  const seen = new Set<string>();
  for (const row of pool) {
    const o = row.selections[gid];
    if (typeof o === "string" && o) seen.add(o);
  }
  return [...seen];
}

/** Ajusta grupos desde `fromIndexInclusive` en adelante para que la tupla caiga en alguna fila del matrix. */
export function cascadeSelectionsFromIndex(
  groups: ProductVariantGroup[],
  rows: SellableVariant[],
  base: VariantSelections,
  fromIndexInclusive: number,
): VariantSelections {
  const out = { ...base };
  for (let j = fromIndexInclusive; j < groups.length; j++) {
    const gid = groups[j]!.id;
    const allowed = allowedOptionIdsForGroupIndex(groups, rows, j, out);
    if (!allowed.length) continue;
    const cur = out[gid];
    if (!cur || !allowed.includes(cur)) out[gid] = allowed[0]!;
  }
  return out;
}

export function findMatchingSellableRow(
  groups: ProductVariantGroup[],
  rows: SellableVariant[],
  selections: VariantSelections,
): SellableVariant | undefined {
  return rows.find((row) => groups.every((g) => row.selections[g.id] === selections[g.id]));
}

export function resolvePriceWithSellableMatrix(
  basePrice: number,
  groups: ProductVariantGroup[] | undefined,
  selections: VariantSelections,
  rows: SellableVariant[],
): number {
  const g = groups ?? [];
  if (!rows.length) return resolveVariantPrice(basePrice, g, selections);
  const row = findMatchingSellableRow(g, rows, selections);
  if (!row) return resolveVariantPrice(basePrice, g, selections);
  if (row.price != null && Number.isFinite(Number(row.price))) return Number(row.price);
  return resolveVariantPrice(basePrice, g, selections);
}

export function defaultSelectionsWithSellable(
  groups: ProductVariantGroup[],
  rows: SellableVariant[],
  legacyDefault: () => VariantSelections,
): VariantSelections {
  if (!rows.length || !groups.length) return legacyDefault();
  const seed = { ...rows[0].selections };
  return cascadeSelectionsFromIndex(groups, rows, seed, 0);
}

export function validateSellableMatrix(
  groups: ProductVariantGroup[],
  rows: SellableVariant[],
): string | null {
  if (rows.length === 0) return null;
  if (!groups.length) {
    return "Hay combinaciones vendibles cargadas: agregá al menos un grupo de opciones arriba.";
  }
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row.id?.trim()) return "Cada combinación vendible necesita un identificador interno.";
    for (const g of groups) {
      const oid = row.selections[g.id];
      if (!oid) return `En una combinación falta la opción del grupo «${g.label}».`;
      if (!g.options.some((o) => o.id === oid)) {
        return `Hay una opción que ya no existe en el grupo «${g.label}». Revisá las combinaciones vendibles.`;
      }
    }
    const key = groups.map((g) => `${g.id}=${row.selections[g.id]}`).join("&");
    if (seen.has(key)) return "Hay dos combinaciones vendibles idénticas (misma elección en todos los grupos).";
    seen.add(key);
    if (row.price != null) {
      const p = Number(row.price);
      if (!Number.isFinite(p) || p < 0) return "El precio de una combinación vendible es inválido.";
    }
  }
  return null;
}

import "server-only";

import type {
  ProductCategoryRow,
  VariantKindDefinitionRow,
  VariantPricingModeLabelRow,
} from "@/lib/catalog-dictionary-types";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type { ProductCategoryRow, VariantKindDefinitionRow, VariantPricingModeLabelRow };

export async function listProductCategoriesAdmin(): Promise<ProductCategoryRow[]> {
  const { data, error } = await createSupabaseServiceClient()
    .from("product_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ProductCategoryRow[];
}

export async function listProductCategoriesPublic(): Promise<{ id: string; label: string }[]> {
  const rows = await listProductCategoriesAdmin();
  return rows.filter((r) => r.active).map((r) => ({ id: r.id, label: r.label }));
}

export async function listVariantKindDefinitionsAdmin(): Promise<VariantKindDefinitionRow[]> {
  const { data, error } = await createSupabaseServiceClient()
    .from("variant_kind_definitions")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as VariantKindDefinitionRow[];
}

export async function listVariantKindDefinitionsActive(): Promise<VariantKindDefinitionRow[]> {
  const rows = await listVariantKindDefinitionsAdmin();
  return rows.filter((r) => r.active);
}

export async function listVariantPricingModeLabelsAdmin(): Promise<VariantPricingModeLabelRow[]> {
  const { data, error } = await createSupabaseServiceClient()
    .from("variant_pricing_mode_labels")
    .select("*")
    .order("mode", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as VariantPricingModeLabelRow[];
}

export async function countProductsByCategory(categoryId: string): Promise<number> {
  const { count, error } = await createSupabaseServiceClient()
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category", categoryId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function countProductsUsingVariantKind(kindId: string): Promise<number> {
  const { data, error } = await createSupabaseServiceClient().from("products").select("id, variant_groups");
  if (error) throw new Error(error.message);
  const needle = `"kind":"${kindId}"`;
  let n = 0;
  for (const row of data ?? []) {
    const raw = row.variant_groups;
    if (raw == null) continue;
    const s = typeof raw === "string" ? raw : JSON.stringify(raw);
    if (s.includes(needle)) n += 1;
  }
  return n;
}

export async function listProductPickerOptions(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await createSupabaseServiceClient()
    .from("products")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: string; name: string }[];
}

const FALLBACK_CATEGORY_IDS = new Set([
  "mac",
  "ipad",
  "iphone",
  "watch",
  "audio",
  "desktop",
  "servicio",
  "otros",
]);

/** Valida contra la tabla; si no hay filas (migración pendiente), acepta slugs del catálogo estático. */
export async function categoryExistsActive(id: string): Promise<boolean> {
  const supabase = createSupabaseServiceClient();
  const { count, error: countErr } = await supabase
    .from("product_categories")
    .select("*", { count: "exact", head: true });
  if (countErr) {
    return FALLBACK_CATEGORY_IDS.has(id);
  }
  if ((count ?? 0) === 0) {
    return FALLBACK_CATEGORY_IDS.has(id);
  }

  const { data, error } = await supabase
    .from("product_categories")
    .select("id")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data != null;
}

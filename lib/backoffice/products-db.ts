import "server-only";

import type { Product } from "@/lib/data";
import type { ProductVariantGroup } from "@/lib/product-variants";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type ProductRow = {
  id: string;
  name: string;
  short: string;
  category: string;
  price: number;
  badge: string | null;
  image: string;
  image_alt: string;
  variant_groups: unknown;
  detail: unknown | null;
  compare_at_price: number | null;
  discount_percent: number | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function num(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") return Number(v);
  return 0;
}

export function productRowFromRecord(r: Record<string, unknown>): ProductRow {
  return mapRow(r);
}

function mapRow(r: Record<string, unknown>): ProductRow {
  return {
    id: String(r.id),
    name: String(r.name),
    short: String(r.short),
    category: String(r.category),
    price: num(r.price),
    badge: r.badge != null ? String(r.badge) : null,
    image: String(r.image),
    image_alt: String(r.image_alt),
    variant_groups: r.variant_groups,
    detail: r.detail ?? null,
    compare_at_price: r.compare_at_price != null ? num(r.compare_at_price) : null,
    discount_percent:
      r.discount_percent != null ? Number.parseInt(String(r.discount_percent), 10) : null,
    published: Boolean(r.published),
    sort_order: Number(r.sort_order) || 0,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  };
}

export async function listProductsAdmin(): Promise<ProductRow[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function getProductAdmin(id: string): Promise<ProductRow | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRow(data as Record<string, unknown>);
}

/** Para la tienda pública: fila Supabase → tipo `Product` del sitio. */
export function productRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    short: row.short,
    category: row.category as Product["category"],
    price: row.price,
    badge: row.badge ?? undefined,
    image: row.image,
    imageAlt: row.image_alt,
    variantGroups: Array.isArray(row.variant_groups)
      ? (row.variant_groups as ProductVariantGroup[])
      : undefined,
    detail: row.detail ?? undefined,
  };
}

export type ProductUpsertInput = {
  id: string;
  name: string;
  short: string;
  category: string;
  price: number;
  badge: string | null;
  image: string;
  image_alt: string;
  variant_groups: unknown;
  detail: unknown | null;
  compare_at_price: number | null;
  discount_percent: number | null;
  published: boolean;
  sort_order: number;
};

export async function upsertProductAdmin(row: ProductUpsertInput): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const payload = {
    id: row.id,
    name: row.name,
    short: row.short,
    category: row.category,
    price: row.price,
    badge: row.badge,
    image: row.image,
    image_alt: row.image_alt,
    variant_groups: row.variant_groups,
    detail: row.detail,
    compare_at_price: row.compare_at_price,
    discount_percent: row.discount_percent,
    published: row.published,
    sort_order: row.sort_order,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("products").upsert(payload, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function deleteProductAdmin(id: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

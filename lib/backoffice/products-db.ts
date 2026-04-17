import "server-only";

import type { ProductRow } from "@/lib/backoffice/product-row-shared";
import {
  parseGalleryImagesColumn,
  productRowToProduct,
} from "@/lib/backoffice/product-row-shared";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type { ProductRow } from "@/lib/backoffice/product-row-shared";
export { parseGalleryImagesColumn, productRowToProduct } from "@/lib/backoffice/product-row-shared";

function num(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") return Number(v);
  return 0;
}

export function productRowFromRecord(r: Record<string, unknown>): ProductRow {
  return mapRow(r);
}

function parseStockCondition(v: unknown): string | null {
  if (v !== "new" && v !== "used") return null;
  return v;
}

function mapRow(r: Record<string, unknown>): ProductRow {
  return {
    id: String(r.id),
    name: String(r.name),
    short: r.short != null && r.short !== "" ? String(r.short) : "",
    category: String(r.category ?? ""),
    brand: r.brand != null && String(r.brand).trim() !== "" ? String(r.brand).trim() : null,
    price: num(r.price),
    stock_condition: parseStockCondition(r.stock_condition),
    badge: r.badge != null ? String(r.badge) : null,
    image: r.image != null && String(r.image) !== "" ? String(r.image) : "",
    image_alt: r.image_alt != null ? String(r.image_alt) : "",
    gallery_images: r.gallery_images ?? [],
    variant_groups: r.variant_groups,
    sellable_variants: r.sellable_variants ?? [],
    detail: r.detail ?? null,
    compare_at_price: r.compare_at_price != null ? num(r.compare_at_price) : null,
    discount_percent:
      r.discount_percent != null ? Number.parseInt(String(r.discount_percent), 10) : null,
    published: Boolean(r.published),
    sort_order: Number(r.sort_order) || 0,
    created_at: r.created_at != null ? String(r.created_at) : "",
    updated_at: r.updated_at != null ? String(r.updated_at) : "",
  };
}

/** Columnas para tabla del BO / picker de contenido: sin `detail` ni `variant_groups` (JSON pesado). */
const PRODUCT_ADMIN_LIST_COLUMNS =
  "id,name,brand,price,category,stock_condition,published,sort_order" as const;

export type ProductAdminCatalogRow = Pick<
  ProductRow,
  "id" | "name" | "brand" | "price" | "category" | "stock_condition" | "published"
>;

export async function listProductsAdmin(): Promise<ProductAdminCatalogRow[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_ADMIN_LIST_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((raw) => {
    const r = raw as Record<string, unknown>;
    return {
      id: String(r.id),
      name: String(r.name),
      brand: r.brand != null && String(r.brand).trim() !== "" ? String(r.brand).trim() : null,
      price: num(r.price),
      category: String(r.category ?? ""),
      stock_condition: parseStockCondition(r.stock_condition),
      published: Boolean(r.published),
    };
  });
}

export async function getProductAdmin(id: string): Promise<ProductRow | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRow(data as Record<string, unknown>);
}

export type ProductUpsertInput = {
  id: string;
  name: string;
  short: string;
  category: string;
  brand: string | null;
  price: number;
  stock_condition: string | null;
  badge: string | null;
  image: string;
  image_alt: string;
  gallery_images: string[];
  variant_groups: unknown;
  sellable_variants: unknown;
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
    brand: row.brand,
    price: row.price,
    stock_condition: row.stock_condition,
    badge: row.badge,
    image: row.image,
    image_alt: row.image_alt,
    gallery_images: row.gallery_images,
    variant_groups: row.variant_groups,
    sellable_variants: row.sellable_variants,
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

export async function updateProductPublishedAdmin(id: string, published: boolean): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("products")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteProductAdmin(id: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

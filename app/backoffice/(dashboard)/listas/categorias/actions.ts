"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { countProductsByCategory } from "@/lib/backoffice/catalog-dictionaries-db";
import { uploadCategoryDefaultImage } from "@/lib/backoffice/storage/product-images";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { requireBackofficeSession } from "@/lib/backoffice/session";
import { slugifyLabel } from "@/lib/slug";

function revalidateListas() {
  revalidatePath("/backoffice/listas/categorias");
  revalidatePath("/backoffice/productos");
  revalidatePath("/backoffice/productos/nuevo");
  revalidatePath("/", "layout");
}

export async function createCategory(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  await requireBackofficeSession();
  const rawId = String(formData.get("id") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const sortRaw = String(formData.get("sort_order") ?? "").trim();
  const active = formData.get("active") === "on";

  const id = slugifyLabel(rawId.replace(/\s+/g, "-")) || slugifyLabel(label);
  if (!id || !label) return { error: "Completá identificador y nombre" };

  const sort_order = sortRaw ? Number.parseInt(sortRaw, 10) : 0;
  if (Number.isNaN(sort_order)) return { error: "Orden inválido" };

  const defaultImage = String(formData.get("default_image") ?? "").trim();
  const defaultImageAlt = String(formData.get("default_image_alt") ?? "").trim();

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("product_categories").insert({
    id,
    label,
    sort_order,
    active,
    default_image: defaultImage || null,
    default_image_alt: defaultImageAlt || null,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    if (error.code === "23505") return { error: "Ya existe una categoría con ese identificador" };
    return { error: error.message };
  }
  revalidateListas();
  return null;
}

/** Formulario server (un solo argumento); no usar con useActionState. */
export async function updateCategory(formData: FormData): Promise<void> {
  await requireBackofficeSession();
  const id = String(formData.get("id") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const sortRaw = String(formData.get("sort_order") ?? "").trim();
  const active = formData.get("active") === "on";
  const defaultImage = String(formData.get("default_image") ?? "").trim();
  const defaultImageAlt = String(formData.get("default_image_alt") ?? "").trim();

  if (!id || !label) return;
  const sort_order = sortRaw ? Number.parseInt(sortRaw, 10) : 0;
  if (Number.isNaN(sort_order)) return;

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("product_categories")
    .update({
      label,
      sort_order,
      active,
      default_image: defaultImage || null,
      default_image_alt: defaultImageAlt || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateListas();
}

export async function deleteCategory(formData: FormData) {
  await requireBackofficeSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/backoffice/listas/categorias");

  const n = await countProductsByCategory(id);
  if (n > 0) {
    redirect(
      `/backoffice/listas/categorias?error=${encodeURIComponent(
        `No se puede eliminar: hay ${n} producto(s) con esta categoría.`,
      )}`,
    );
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("product_categories").delete().eq("id", id);
  if (error) {
    redirect(`/backoffice/listas/categorias?error=${encodeURIComponent(error.message)}`);
  }
  revalidateListas();
  redirect("/backoffice/listas/categorias");
}

export type UploadCategoryImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function uploadCategoryDefaultImageFormAction(
  formData: FormData,
): Promise<UploadCategoryImageResult> {
  await requireBackofficeSession();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const file = formData.get("file");
  if (!categoryId) return { ok: false, error: "Falta la categoría" };
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Elegí un archivo de imagen" };
  }
  try {
    const url = await uploadCategoryDefaultImage(categoryId, file);
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo subir" };
  }
}

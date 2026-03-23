"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  countProductsByCategory,
  listProductCategoriesAdmin,
} from "@/lib/backoffice/catalog-dictionaries-db";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { requireBackofficeSession } from "@/lib/backoffice/session";
import { slugifyLabel } from "@/lib/slug";

function revalidateListas() {
  revalidatePath("/backoffice/listas/categorias");
  revalidatePath("/backoffice/productos");
  revalidatePath("/backoffice/productos/nuevo");
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

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("product_categories").insert({
    id,
    label,
    sort_order,
    active,
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

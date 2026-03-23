"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  countProductsUsingVariantKind,
  listVariantKindDefinitionsAdmin,
} from "@/lib/backoffice/catalog-dictionaries-db";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { requireBackofficeSession } from "@/lib/backoffice/session";
import { slugifyLabel } from "@/lib/slug";

function revalidate() {
  revalidatePath("/backoffice/listas/tipos-opcion");
  revalidatePath("/backoffice/productos");
  revalidatePath("/backoffice/productos/nuevo");
}

export async function createVariantKind(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  await requireBackofficeSession();
  const rawId = String(formData.get("id") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const hint = String(formData.get("hint") ?? "").trim();
  const ui_behavior = String(formData.get("ui_behavior") ?? "select") as
    | "color"
    | "storage"
    | "select";
  const sortRaw = String(formData.get("sort_order") ?? "").trim();
  const active = formData.get("active") === "on";

  const id = slugifyLabel(rawId.replace(/\s+/g, "-")) || slugifyLabel(label);
  if (!id || !label) return { error: "Completá identificador y nombre" };
  if (!["color", "storage", "select"].includes(ui_behavior)) return { error: "Comportamiento inválido" };

  const sort_order = sortRaw ? Number.parseInt(sortRaw, 10) : 0;
  if (Number.isNaN(sort_order)) return { error: "Orden inválido" };

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("variant_kind_definitions").insert({
    id,
    label,
    hint: hint || null,
    ui_behavior,
    sort_order,
    active,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    if (error.code === "23505") return { error: "Ya existe un tipo con ese identificador" };
    return { error: error.message };
  }
  revalidate();
  return null;
}

/** Formulario server (un solo argumento); no usar con useActionState. */
export async function updateVariantKind(formData: FormData): Promise<void> {
  await requireBackofficeSession();
  const id = String(formData.get("id") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const hint = String(formData.get("hint") ?? "").trim();
  const ui_behavior = String(formData.get("ui_behavior") ?? "select") as
    | "color"
    | "storage"
    | "select";
  const sortRaw = String(formData.get("sort_order") ?? "").trim();
  const active = formData.get("active") === "on";

  if (!id || !label) return;
  if (!["color", "storage", "select"].includes(ui_behavior)) return;

  const sort_order = sortRaw ? Number.parseInt(sortRaw, 10) : 0;
  if (Number.isNaN(sort_order)) return;

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("variant_kind_definitions")
    .update({
      label,
      hint: hint || null,
      ui_behavior,
      sort_order,
      active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidate();
}

export async function deleteVariantKind(formData: FormData) {
  await requireBackofficeSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/backoffice/listas/tipos-opcion");

  const n = await countProductsUsingVariantKind(id);
  if (n > 0) {
    redirect(
      `/backoffice/listas/tipos-opcion?error=${encodeURIComponent(
        `No se puede eliminar: ${n} producto(s) usan este tipo en variantes.`,
      )}`,
    );
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("variant_kind_definitions").delete().eq("id", id);
  if (error) {
    redirect(`/backoffice/listas/tipos-opcion?error=${encodeURIComponent(error.message)}`);
  }
  revalidate();
  redirect("/backoffice/listas/tipos-opcion");
}

export async function loadVariantKindsAdmin() {
  await requireBackofficeSession();
  return listVariantKindDefinitionsAdmin();
}

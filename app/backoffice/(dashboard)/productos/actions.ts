"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { categoryExistsActive } from "@/lib/backoffice/catalog-dictionaries-db";
import { deleteProductAdmin, upsertProductAdmin } from "@/lib/backoffice/products-db";
import { requireBackofficeSession } from "@/lib/backoffice/session";
import { uploadProductMainImage } from "@/lib/backoffice/storage/product-images";

function parseJsonField(raw: string, label: string): { ok: true; value: unknown } | { ok: false; error: string } {
  const t = raw.trim();
  if (!t) return { ok: true, value: null };
  try {
    return { ok: true, value: JSON.parse(t) };
  } catch {
    return { ok: false, error: `${label}: JSON inválido` };
  }
}

export async function saveProduct(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireBackofficeSession();

  const mode = String(formData.get("mode") ?? "");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "El identificador (slug) es obligatorio" };

  const name = String(formData.get("name") ?? "").trim();
  const short = String(formData.get("short") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const imageFile = formData.get("image_file");
  let image = String(formData.get("image") ?? "").trim();
  const image_alt = String(formData.get("image_alt") ?? "").trim();

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      image = await uploadProductMainImage(id, imageFile);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "No se pudo subir la imagen principal" };
    }
  }

  if (!name || !short || !image_alt) {
    return { error: "Completá nombre, resumen y texto alternativo de la imagen" };
  }

  if (!image) {
    return { error: "Subí una imagen principal (archivo) o editá un producto que ya tenga foto." };
  }

  if (!(await categoryExistsActive(categoryRaw))) {
    return {
      error:
        "Categoría inválida o inactiva. Creala o activala en Listas del catálogo → Categorías.",
    };
  }

  const price = Number(String(formData.get("price") ?? "").replace(/\s/g, "").replace(",", "."));
  if (Number.isNaN(price) || price < 0) {
    return { error: "Precio inválido" };
  }

  const badgeRaw = String(formData.get("badge") ?? "").trim();
  const compareRaw = String(formData.get("compare_at_price") ?? "").trim();
  const discountRaw = String(formData.get("discount_percent") ?? "").trim();
  const sortRaw = String(formData.get("sort_order") ?? "").trim();
  const published = formData.get("published") === "on";

  let compare_at_price: number | null = null;
  if (compareRaw) {
    const c = Number(compareRaw.replace(/\s/g, "").replace(",", "."));
    if (Number.isNaN(c) || c < 0) return { error: "Precio tachado inválido" };
    compare_at_price = c;
  }

  let discount_percent: number | null = null;
  if (discountRaw) {
    const d = Number.parseInt(discountRaw, 10);
    if (Number.isNaN(d) || d < 0 || d > 100) return { error: "Descuento % debe ser 0–100" };
    discount_percent = d;
  }

  const sort_order = sortRaw ? Number.parseInt(sortRaw, 10) : 0;
  if (Number.isNaN(sort_order)) return { error: "Orden inválido" };

  const vgRaw = String(formData.get("variant_groups") ?? "");
  const vgParsed = parseJsonField(vgRaw, "variant_groups");
  if (!vgParsed.ok) return { error: vgParsed.error };
  const variant_groups = vgParsed.value === null ? [] : vgParsed.value;
  if (!Array.isArray(variant_groups)) {
    return { error: "variant_groups debe ser un array JSON" };
  }

  const detailRaw = String(formData.get("detail") ?? "");
  const detailParsed = parseJsonField(detailRaw, "detail");
  if (!detailParsed.ok) return { error: detailParsed.error };
  const detail = detailParsed.value;

  try {
    await upsertProductAdmin({
      id,
      name,
      short,
      category: categoryRaw,
      price,
      badge: badgeRaw || null,
      image,
      image_alt,
      variant_groups,
      detail,
      compare_at_price,
      discount_percent,
      published,
      sort_order,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar" };
  }

  revalidatePath("/backoffice/productos");
  revalidatePath("/tienda");
  revalidatePath(`/tienda/${id}`);

  if (mode === "create") {
    redirect(`/backoffice/productos/${encodeURIComponent(id)}`);
  }
  redirect("/backoffice/productos");
}

export async function deleteProductAdminAction(formData: FormData) {
  await requireBackofficeSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/backoffice/productos");

  await deleteProductAdmin(id);

  revalidatePath("/backoffice/productos");
  revalidatePath("/tienda");
  redirect("/backoffice/productos");
}

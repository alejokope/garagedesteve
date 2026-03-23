"use server";

import { uploadProductGalleryImage } from "@/lib/backoffice/storage/product-images";
import { requireBackofficeSession } from "@/lib/backoffice/session";

export async function uploadGalleryImageAction(
  _prev: { ok?: boolean; url?: string; error?: string } | null,
  formData: FormData,
): Promise<{ ok?: boolean; url?: string; error?: string }> {
  await requireBackofficeSession();

  const productId = String(formData.get("productId") ?? "").trim();
  const file = formData.get("file");

  if (!productId) {
    return { error: "Completá el ID del producto (arriba) antes de subir fotos a la galería." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Elegí un archivo de imagen." };
  }

  try {
    const url = await uploadProductGalleryImage(productId, file);
    return { ok: true, url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo subir la imagen" };
  }
}

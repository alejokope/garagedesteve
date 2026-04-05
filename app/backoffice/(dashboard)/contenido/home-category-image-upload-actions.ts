"use server";

import { uploadHomeCategoryImage } from "@/lib/backoffice/storage/product-images";
import { requireBackofficeSession } from "@/lib/backoffice/session";

export async function uploadHomeCategoryImageAction(
  formData: FormData,
): Promise<{ ok?: boolean; url?: string; error?: string }> {
  await requireBackofficeSession();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Elegí un archivo de imagen." };
  }

  try {
    const url = await uploadHomeCategoryImage(file);
    return { ok: true, url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo subir la imagen" };
  }
}

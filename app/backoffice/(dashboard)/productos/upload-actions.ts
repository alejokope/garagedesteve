"use server";

import { deleteMediaGalleryItemById, listMediaGalleryPage } from "@/lib/backoffice/media-gallery-db";
import {
  uploadMediaGalleryInboxImage,
  uploadProductGalleryImage,
  uploadProductVariantOptionImage,
} from "@/lib/backoffice/storage/product-images";
import { requireBackofficeSession } from "@/lib/backoffice/session";

export async function listMediaGalleryPageAction(page: number) {
  await requireBackofficeSession();
  return listMediaGalleryPage(page);
}

export async function deleteMediaGalleryItemAction(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  await requireBackofficeSession();
  return deleteMediaGalleryItemById(id);
}

export async function uploadMediaGalleryInboxAction(
  _prev: { ok?: boolean; url?: string; id?: string | null; error?: string } | null,
  formData: FormData,
): Promise<{ ok?: boolean; url?: string; id?: string | null; error?: string }> {
  await requireBackofficeSession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Elegí un archivo de imagen." };
  }
  try {
    const { url, id } = await uploadMediaGalleryInboxImage(file);
    return { ok: true, url, id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo subir" };
  }
}

export async function uploadVariantOptionImageAction(
  _prev: { ok?: boolean; url?: string; error?: string } | null,
  formData: FormData,
): Promise<{ ok?: boolean; url?: string; error?: string }> {
  await requireBackofficeSession();

  const productId = String(formData.get("productId") ?? "").trim();
  const groupId = String(formData.get("groupId") ?? "").trim();
  const optionId = String(formData.get("optionId") ?? "").trim();
  const file = formData.get("file");

  if (!productId) {
    return {
      error: "Completá el ID del producto (arriba) antes de subir la foto de esta opción.",
    };
  }
  if (!groupId || !optionId) {
    return { error: "Falta identificar el grupo u opción de variante." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Elegí un archivo de imagen." };
  }

  try {
    const url = await uploadProductVariantOptionImage(productId, groupId, optionId, file);
    return { ok: true, url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo subir la imagen" };
  }
}

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

import "server-only";

import {
  getR2BucketName,
  isR2Configured,
  publicMediaUrlForKey,
  putR2PublicObject,
} from "@/lib/backoffice/storage/r2-client";

const MAX_BYTES = 5 * 1024 * 1024;

function assertR2OrThrow(): void {
  if (!isR2Configured()) {
    throw new Error(
      "R2 no está configurado. Completá R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET y NEXT_PUBLIC_MEDIA_URL_BASE (ver env.example).",
    );
  }
}

/** @deprecated Usá `getR2BucketName()` desde `r2-client`; se mantiene por compat. */
export function getProductImagesBucket(): string {
  assertR2OrThrow();
  return getR2BucketName();
}

function extFromFile(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "png";
  if (name.endsWith(".webp")) return "webp";
  if (name.endsWith(".gif")) return "gif";
  return "jpg";
}

function safeProductPathSegment(productId: string): string {
  return productId.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 120) || "producto";
}

function safeVariantPathSegment(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 80) || "x";
}

async function uploadImageBytes(storageKey: string, buf: Buffer, contentType: string): Promise<string> {
  assertR2OrThrow();
  const key = storageKey.replace(/^\/+/, "");
  await putR2PublicObject(key, buf, contentType);
  return publicMediaUrlForKey(key);
}

export async function uploadProductMainImage(productId: string, file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen no puede superar 5 MB");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Subí un archivo de imagen (JPG, PNG, WebP o GIF)");
  }

  const safe = safeProductPathSegment(productId);
  const uid = crypto.randomUUID();
  const ext = extFromFile(file);
  const path = `products/${safe}/main-${uid}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  return uploadImageBytes(path, buf, file.type);
}

/** Imágenes de tarjetas “Categorías” en la home (`content_entries` → `home.categories`). */
export async function uploadHomeCategoryImage(file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen no puede superar 5 MB");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Subí un archivo de imagen (JPG, PNG, WebP o GIF)");
  }

  const uid = crypto.randomUUID();
  const ext = extFromFile(file);
  const path = `home/categories/${uid}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  return uploadImageBytes(path, buf, file.type);
}

function safeCategoryPathSegment(categoryId: string): string {
  return categoryId.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 120) || "categoria";
}

/** Imagen por defecto de categoría (`product_categories.default_image`). */
export async function uploadCategoryDefaultImage(categoryId: string, file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen no puede superar 5 MB");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Subí un archivo de imagen (JPG, PNG, WebP o GIF)");
  }

  const safe = safeCategoryPathSegment(categoryId);
  const uid = crypto.randomUUID();
  const ext = extFromFile(file);
  const path = `catalog/defaults/${safe}-${uid}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  return uploadImageBytes(path, buf, file.type);
}

export async function uploadProductGalleryImage(productId: string, file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen no puede superar 5 MB");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Subí un archivo de imagen (JPG, PNG, WebP o GIF)");
  }

  const safe = safeProductPathSegment(productId);
  const uid = crypto.randomUUID();
  const ext = extFromFile(file);
  const path = `products/${safe}/gallery-${uid}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  return uploadImageBytes(path, buf, file.type);
}

/** Foto de variante (color, etc.) bajo la carpeta del producto. */
export async function uploadProductVariantOptionImage(
  productId: string,
  variantGroupId: string,
  optionId: string,
  file: File,
): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen no puede superar 5 MB");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Subí un archivo de imagen (JPG, PNG, WebP o GIF)");
  }

  const safe = safeProductPathSegment(productId);
  const g = safeVariantPathSegment(variantGroupId);
  const o = safeVariantPathSegment(optionId);
  const uid = crypto.randomUUID();
  const ext = extFromFile(file);
  const path = `products/${safe}/variant-${g}-${o}-${uid}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  return uploadImageBytes(path, buf, file.type);
}

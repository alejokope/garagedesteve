import "server-only";

import { createSupabaseServiceClient } from "@/lib/supabase/service";

const MAX_BYTES = 5 * 1024 * 1024;

export function getProductImagesBucket(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "product-images";
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

  const supabase = createSupabaseServiceClient();
  const bucket = getProductImagesBucket();

  const { error } = await supabase.storage.from(bucket).upload(path, buf, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
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

  const supabase = createSupabaseServiceClient();
  const bucket = getProductImagesBucket();

  const { error } = await supabase.storage.from(bucket).upload(path, buf, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

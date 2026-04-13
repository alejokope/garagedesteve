import "server-only";

import { deleteR2Object, getR2BucketName, isR2Configured } from "@/lib/backoffice/storage/r2-client";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type MediaGallerySource =
  | "product-main"
  | "product-gallery"
  | "variant-option"
  | "media-inbox"
  | "home-category"
  | "category-default";

export type MediaGalleryListRow = {
  id: string;
  public_url: string;
  bytes: number;
  created_at: string;
};

const PAGE = 48;

/**
 * Inserta fila de galería; ignora duplicado (mismo bucket+path).
 * No lanza si la tabla aún no existe en dev (log y sigue).
 */
/** Devuelve el `id` de la fila insertada, o `null` si duplicado / tabla ausente / error. */
export async function insertMediaGalleryRow(input: {
  bucket: string;
  storage_path: string;
  public_url: string;
  bytes: number;
  content_type: string | null;
  source: MediaGallerySource;
}): Promise<string | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("media_gallery_items")
    .insert({
      bucket: input.bucket,
      storage_path: input.storage_path,
      public_url: input.public_url,
      bytes: input.bytes,
      content_type: input.content_type,
      source: input.source,
    })
    .select("id")
    .maybeSingle();
  if (!error && data?.id) return String(data.id);
  if (error?.code === "23505" || error?.message.includes("duplicate")) return null;
  if (error?.message.includes("does not exist") || error?.code === "42P01") {
    console.warn("[media_gallery_items] tabla ausente; aplicá migraciones 009.");
    return null;
  }
  console.warn("[media_gallery_items] insert:", error?.message);
  return null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Quita el objeto en Storage y la fila del índice. Si Storage falla, igual intenta borrar la fila
 * para que no quede un ítem “fantasma” en la galería del BO.
 */
export async function deleteMediaGalleryItemById(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  const raw = id.trim();
  if (!UUID_RE.test(raw)) return { error: "Identificador de imagen inválido." };

  const supabase = createSupabaseServiceClient();
  const { data: row, error: selErr } = await supabase
    .from("media_gallery_items")
    .select("bucket, storage_path")
    .eq("id", raw)
    .maybeSingle();

  if (selErr) {
    if (selErr.message.includes("does not exist") || selErr.code === "42P01") {
      return { error: "La tabla de galería no está disponible." };
    }
    return { error: selErr.message };
  }
  if (!row || typeof row.bucket !== "string" || typeof row.storage_path !== "string") {
    return { error: "No se encontró esa imagen en la galería." };
  }

  const useR2 = isR2Configured() && row.bucket === getR2BucketName();
  if (useR2) {
    try {
      await deleteR2Object(row.storage_path);
    } catch (e) {
      console.warn(
        "[media_gallery_items] R2 remove:",
        e instanceof Error ? e.message : e,
      );
    }
  } else if (!isR2Configured()) {
    console.warn(
      "[media_gallery_items] R2 no configurado; se elimina solo la fila (bucket en fila:",
      row.bucket,
      ").",
    );
  } else {
    console.warn(
      "[media_gallery_items] bucket distinto al R2 actual; se elimina solo la fila:",
      row.bucket,
    );
  }

  const { error: delErr } = await supabase.from("media_gallery_items").delete().eq("id", raw);
  if (delErr) {
    return { error: delErr.message };
  }
  return { ok: true };
}

/**
 * Paginación por offset (índice en created_at desc, id desc).
 * Para volúmenes típicos de galería es suficiente; solo se piden columnas livianas.
 */
export async function listMediaGalleryPage(page: number): Promise<{
  items: MediaGalleryListRow[];
  hasMore: boolean;
}> {
  const supabase = createSupabaseServiceClient();
  const p = Number.isFinite(page) && page >= 0 ? Math.floor(page) : 0;
  const from = p * PAGE;
  /** Inclusive end: pedimos PAGE+1 filas para saber si hay página siguiente. */
  const to = from + PAGE;

  const { data, error } = await supabase
    .from("media_gallery_items")
    .select("id, public_url, bytes, created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (error) {
    if (error.message.includes("does not exist") || error.code === "42P01") {
      return { items: [], hasMore: false };
    }
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const hasMore = rows.length > PAGE;
  const slice = hasMore ? rows.slice(0, PAGE) : rows;
  const items: MediaGalleryListRow[] = slice.map((r) => ({
    id: String(r.id),
    public_url: String(r.public_url ?? "").trim(),
    bytes: Number(r.bytes) || 0,
    created_at: String(r.created_at ?? ""),
  }));

  return { items, hasMore };
}

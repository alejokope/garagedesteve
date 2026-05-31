import { createClient } from "@supabase/supabase-js";

/**
 * Cliente anon sin cookies: lecturas públicas (catálogo, contenido).
 * Seguro dentro de `unstable_cache` y fuera del contexto de request.
 */
export function createSupabasePublicReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local",
    );
  }
  return createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  FOOTER_CONTENT_KEY,
  mergeFooterContentDefaults,
  type FooterContentPayload,
} from "@/lib/footer-content-schema";

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function fetchFooterPayload(): Promise<unknown | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_entries")
      .select("payload")
      .eq("key", FOOTER_CONTENT_KEY)
      .maybeSingle();
    if (error) return null;
    const row = data as { payload?: unknown } | null;
    return row?.payload ?? null;
  } catch {
    return null;
  }
}

export async function getFooterContent(): Promise<FooterContentPayload> {
  const raw = await fetchFooterPayload();
  return mergeFooterContentDefaults(raw);
}

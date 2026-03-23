import "server-only";

import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type ContentEntryRow = {
  key: string;
  label: string | null;
  payload: unknown;
  updated_at: string;
};

export async function listContentEntriesAdmin(): Promise<ContentEntryRow[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("content_entries")
    .select("*")
    .order("key", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    key: String((r as { key: string }).key),
    label: (r as { label: string | null }).label ?? null,
    payload: (r as { payload: unknown }).payload,
    updated_at: String((r as { updated_at: string }).updated_at),
  }));
}

export async function getContentEntryAdmin(key: string): Promise<ContentEntryRow | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("content_entries").select("*").eq("key", key).maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    key: String((data as { key: string }).key),
    label: (data as { label: string | null }).label ?? null,
    payload: (data as { payload: unknown }).payload,
    updated_at: String((data as { updated_at: string }).updated_at),
  };
}

export async function upsertContentEntryAdmin(input: {
  key: string;
  label: string | null;
  payload: unknown;
}): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("content_entries").upsert(
    {
      key: input.key,
      label: input.label,
      payload: input.payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
}

export async function deleteContentEntryAdmin(key: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("content_entries").delete().eq("key", key);
  if (error) throw new Error(error.message);
}

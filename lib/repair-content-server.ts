import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  REPAIR_FORM_KEY,
  mergeRepairFormDefaults,
  type RepairFormPayload,
} from "@/lib/repair-form-schema";
import {
  REPAIR_PRICING_KEY,
  mergeRepairPricingDefaults,
  type RepairPricingPayload,
} from "@/lib/repair-pricing-schema";

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function fetchContentPayload(key: string): Promise<unknown | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_entries")
      .select("payload")
      .eq("key", key)
      .maybeSingle();
    if (error) return null;
    const row = data as { payload?: unknown } | null;
    return row?.payload ?? null;
  } catch {
    return null;
  }
}

export async function getRepairPricingConfig(): Promise<RepairPricingPayload> {
  const raw = await fetchContentPayload(REPAIR_PRICING_KEY);
  return mergeRepairPricingDefaults(raw);
}

export async function getRepairFormConfig(): Promise<RepairFormPayload> {
  const raw = await fetchContentPayload(REPAIR_FORM_KEY);
  return mergeRepairFormDefaults(raw);
}

import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  SELL_PRICING_KEY,
  mergeSellPricingDefaults,
  type SellPricingPayload,
} from "@/lib/sell-pricing-schema";

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

export async function getSellPricingConfig(): Promise<SellPricingPayload> {
  const raw = await fetchContentPayload(SELL_PRICING_KEY);
  return mergeSellPricingDefaults(raw);
}

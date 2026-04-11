import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeFloatingContactPublic } from "@/lib/floating-contact-resolve";
import {
  FLOATING_CONTACT_KEY,
  mergeFloatingContactDefaults,
  type FloatingContactPublic,
} from "@/lib/floating-contact-schema";
import { buildSellDeviceWhatsAppMessage } from "@/lib/sell-device-whatsapp";
import { whatsappUrl } from "@/lib/whatsapp-url";

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function fetchFloatingPayload(): Promise<unknown | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_entries")
      .select("payload")
      .eq("key", FLOATING_CONTACT_KEY)
      .maybeSingle();
    if (error) return null;
    const row = data as { payload?: unknown } | null;
    return row?.payload ?? null;
  } catch {
    return null;
  }
}

export async function getFloatingContactPublic(): Promise<FloatingContactPublic> {
  const raw = await fetchFloatingPayload();
  const merged = mergeFloatingContactDefaults(raw);
  return computeFloatingContactPublic(merged);
}

export async function getSellDeviceWhatsAppHrefServer(): Promise<string | null> {
  const pub = await getFloatingContactPublic();
  if (!pub.phoneDigits) return null;
  const text = buildSellDeviceWhatsAppMessage(pub.brandName);
  return whatsappUrl(pub.phoneDigits, text);
}

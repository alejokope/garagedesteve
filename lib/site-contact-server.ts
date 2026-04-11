import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FOOTER_CONTENT_KEY } from "@/lib/footer-content-schema";
import {
  SITE_CONTACT_KEY,
  mergeSiteContactDefaults,
  migrateFromLegacyFooterContact,
  pickupAreaShortLabel,
  type SiteContactPayload,
  type SiteContactPublic,
} from "@/lib/site-contact-schema";

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

export async function getSiteContact(): Promise<SiteContactPayload> {
  const raw = await fetchContentPayload(SITE_CONTACT_KEY);
  if (raw) return mergeSiteContactDefaults(raw);

  const footerRaw = await fetchContentPayload(FOOTER_CONTENT_KEY);
  if (footerRaw && typeof footerRaw === "object") {
    const migrated = migrateFromLegacyFooterContact(
      (footerRaw as Record<string, unknown>).contact,
    );
    if (migrated) return mergeSiteContactDefaults(migrated);
  }

  return mergeSiteContactDefaults(null);
}

export async function getSiteContactPublic(): Promise<SiteContactPublic> {
  const p = await getSiteContact();
  return {
    offices: p.offices,
    phone: p.phone,
    email: p.email,
    hours: p.hours,
    pickupAreaShort: pickupAreaShortLabel(p),
  };
}

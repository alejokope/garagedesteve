"use server";

import { revalidatePath } from "next/cache";

import { upsertContentEntryAdmin } from "@/lib/backoffice/content-db";
import { requireBackofficeSession } from "@/lib/backoffice/session";
import {
  SITE_CONTACT_KEY,
  siteContactPayloadSchema,
} from "@/lib/site-contact-schema";

export type SaveSiteContactResult = { ok: true } | { ok: false; error: string };

export async function saveSiteContactAction(payload: unknown): Promise<SaveSiteContactResult> {
  await requireBackofficeSession();
  const parsed = siteContactPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.map(String).join(".") || "dato"}: ${i.message}`)
      .join(" · ");
    return { ok: false, error: msg };
  }
  try {
    await upsertContentEntryAdmin({
      key: SITE_CONTACT_KEY,
      label: "Sitio — Datos de contacto (oficinas, teléfono, email, horario)",
      payload: parsed.data,
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo guardar",
    };
  }
  revalidatePath("/", "layout");
  revalidatePath("/backoffice/contenido/contacto");
  return { ok: true };
}

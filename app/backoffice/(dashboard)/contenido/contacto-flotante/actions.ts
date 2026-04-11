"use server";

import { revalidatePath } from "next/cache";

import { upsertContentEntryAdmin } from "@/lib/backoffice/content-db";
import {
  FLOATING_CONTACT_KEY,
  floatingContactPayloadSchema,
} from "@/lib/floating-contact-schema";
import { requireBackofficeSession } from "@/lib/backoffice/session";

export type SaveFloatingContactResult = { ok: true } | { ok: false; error: string };

function normalizeInstagramInput(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export async function saveFloatingContactAction(
  payload: unknown,
): Promise<SaveFloatingContactResult> {
  await requireBackofficeSession();
  const parsed = floatingContactPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.map(String).join(".") || "dato"}: ${i.message}`)
      .join(" · ");
    return { ok: false, error: msg };
  }
  const data = parsed.data;
  try {
    await upsertContentEntryAdmin({
      key: FLOATING_CONTACT_KEY,
      label: "Sitio — Botones flotantes (Instagram / WhatsApp)",
      payload: {
        ...data,
        instagramUrl: normalizeInstagramInput(data.instagramUrl),
        whatsappPhone: data.whatsappPhone.replace(/\D/g, ""),
        cartFreeShippingMinUsd: Math.round(data.cartFreeShippingMinUsd),
      },
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo guardar",
    };
  }
  revalidatePath("/", "layout");
  revalidatePath("/backoffice/contenido/contacto-flotante");
  return { ok: true };
}

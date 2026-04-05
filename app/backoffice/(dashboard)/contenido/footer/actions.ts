"use server";

import { revalidatePath } from "next/cache";

import { upsertContentEntryAdmin } from "@/lib/backoffice/content-db";
import {
  FOOTER_CONTENT_KEY,
  footerContentPayloadSchema,
} from "@/lib/footer-content-schema";
import { requireBackofficeSession } from "@/lib/backoffice/session";

export type SaveFooterContentResult = { ok: true } | { ok: false; error: string };

export async function saveFooterContentAction(
  payload: unknown,
): Promise<SaveFooterContentResult> {
  await requireBackofficeSession();
  const parsed = footerContentPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.map(String).join(".") || "dato"}: ${i.message}`)
      .join(" · ");
    return { ok: false, error: msg };
  }
  try {
    await upsertContentEntryAdmin({
      key: FOOTER_CONTENT_KEY,
      label: "Sitio — Footer",
      payload: parsed.data,
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo guardar",
    };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteContentEntryAdmin,
  upsertContentEntryAdmin,
} from "@/lib/backoffice/content-db";
import { requireBackofficeSession } from "@/lib/backoffice/session";

export async function saveContentEntry(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireBackofficeSession();

  const mode = String(formData.get("mode") ?? "");
  const key = String(formData.get("key") ?? "").trim();
  if (!key) return { error: "La clave es obligatoria" };

  const label = String(formData.get("label") ?? "").trim();
  const payloadRaw = String(formData.get("payload") ?? "").trim();

  let payload: unknown;
  try {
    payload = payloadRaw ? JSON.parse(payloadRaw) : {};
  } catch {
    return { error: "El payload debe ser JSON válido" };
  }

  try {
    await upsertContentEntryAdmin({
      key,
      label: label || null,
      payload,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar" };
  }

  revalidatePath("/backoffice/contenido");
  if (mode === "create") {
    redirect(`/backoffice/contenido/${encodeURIComponent(key)}`);
  }
  redirect("/backoffice/contenido");
}

export async function deleteContentEntryAction(formData: FormData) {
  await requireBackofficeSession();
  const key = String(formData.get("key") ?? "").trim();
  if (!key) redirect("/backoffice/contenido");

  await deleteContentEntryAdmin(key);

  revalidatePath("/backoffice/contenido");
  redirect("/backoffice/contenido");
}

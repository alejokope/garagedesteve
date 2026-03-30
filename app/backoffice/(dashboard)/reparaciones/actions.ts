"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addRepairMessageAdmin,
  createRepairAdmin,
  getRepairAdmin,
  updateRepairDetailsAdmin,
  updateRepairStatusAdmin,
} from "@/lib/backoffice/repairs-db";
import { sendRepairCreatedEmail } from "@/lib/email/send-repair-created-email";
import { sendRepairFinishedEmail } from "@/lib/email/send-repair-finished-email";
import { requireBackofficeSession } from "@/lib/backoffice/session";
import { type RepairStatus } from "@/lib/repairs-types";

/** Fecha/hora civil en Argentina (UTC-3 fijo) → ISO para guardar en DB. */
function parseArWallToIso(dateYmd: string, timeHm: string): string | null {
  const d = dateYmd.trim();
  if (!d) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const t = timeHm.trim();
  const hm = /^\d{2}:\d{2}$/.test(t) ? t : "12:00";
  const dt = new Date(`${d}T${hm}:00-03:00`);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

/** Compat: formulario viejo con datetime-local (una sola cadena). */
function parseEstimatedReadyAtLegacy(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const m = t.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::(\d{2}))?$/);
  if (m) {
    return parseArWallToIso(m[1], m[2]);
  }
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function createRepairAndNotifyAction(formData: FormData) {
  await requireBackofficeSession();
  const email = String(formData.get("email") ?? "");
  const description = String(formData.get("description") ?? "");
  const datePart = String(formData.get("estimated_date") ?? "").trim();
  const timePart = String(formData.get("estimated_time") ?? "").trim();
  const legacy = String(formData.get("estimated_ready_at") ?? "").trim();
  const estimated_ready_at = datePart
    ? parseArWallToIso(datePart, timePart)
    : legacy
      ? parseEstimatedReadyAtLegacy(legacy)
      : null;

  const row = await createRepairAdmin({
    email,
    description,
    estimated_ready_at,
  });

  const sent = await sendRepairCreatedEmail({
    to: row.email,
    trackingCode: row.tracking_code,
  });

  revalidatePath("/backoffice/reparaciones");
  revalidatePath(`/backoffice/reparaciones/${row.id}`);

  const q = sent.ok ? "" : "?notify=email_failed";
  redirect(`/backoffice/reparaciones/${row.id}${q}`);
}

export async function updateRepairDetailsAction(formData: FormData) {
  await requireBackofficeSession();
  const id = String(formData.get("id") ?? "").trim();
  const email = String(formData.get("email") ?? "");
  const datePart = String(formData.get("estimated_date") ?? "").trim();
  const timePart = String(formData.get("estimated_time") ?? "").trim();
  if (!id) throw new Error("ID inválido");
  const estimated_ready_at = datePart ? parseArWallToIso(datePart, timePart) : null;
  await updateRepairDetailsAdmin({
    id,
    email,
    estimated_ready_at,
  });
  revalidatePath("/backoffice/reparaciones");
  revalidatePath(`/backoffice/reparaciones/${id}`);
}

export async function updateRepairStatusAction(input: { id: string; newStatus: RepairStatus }) {
  await requireBackofficeSession();
  await updateRepairStatusAdmin(input);
  if (input.newStatus === "finalizado") {
    const row = await getRepairAdmin(input.id);
    if (row) {
      const sent = await sendRepairFinishedEmail({
        to: row.email,
        trackingCode: row.tracking_code,
      });
      if (!sent.ok) {
        console.error("[reparaciones] Email de finalizado no enviado:", sent.message);
      }
    }
  }
  revalidatePath("/backoffice/reparaciones");
  revalidatePath(`/backoffice/reparaciones/${input.id}`);
}

export async function addRepairTrackingMessageAction(formData: FormData) {
  await requireBackofficeSession();
  const repairId = String(formData.get("repair_id") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  if (!repairId) throw new Error("ID inválido");
  await addRepairMessageAdmin({ repairId, body });
  revalidatePath("/backoffice/reparaciones");
  revalidatePath(`/backoffice/reparaciones/${repairId}`);
}

export async function resendRepairTrackingEmailAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireBackofficeSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "ID inválido" };
  const row = await getRepairAdmin(id);
  if (!row) return { ok: false, message: "Reparación no encontrada" };
  const r = await sendRepairCreatedEmail({
    to: row.email,
    trackingCode: row.tracking_code,
  });
  if (!r.ok) {
    return { ok: false, message: r.message };
  }
  revalidatePath(`/backoffice/reparaciones/${id}`);
  return { ok: true };
}

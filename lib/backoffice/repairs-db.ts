import "server-only";

import { randomInt } from "node:crypto";

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isRepairStatus, type RepairStatus } from "@/lib/repairs-types";

const CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LEN = 8;
const MAX_CODE_ATTEMPTS = 12;

export type RepairRow = {
  id: string;
  tracking_code: string;
  email: string;
  description: string;
  status: RepairStatus;
  estimated_ready_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RepairStatusHistoryRow = {
  id: string;
  repair_id: string;
  from_status: RepairStatus | null;
  to_status: RepairStatus;
  changed_at: string;
};

export type RepairTrackingMessageRow = {
  id: string;
  repair_id: string;
  body: string;
  created_at: string;
};

export function generateTrackingCode(): string {
  let s = "";
  for (let i = 0; i < CODE_LEN; i++) {
    s += CODE_CHARS[randomInt(CODE_CHARS.length)]!;
  }
  return s;
}

export function normalizeTrackingCodeInput(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export async function createRepairAdmin(input: {
  email: string;
  description: string;
  estimated_ready_at: string | null;
}): Promise<RepairRow> {
  const supabase = createSupabaseServiceClient();
  const email = input.email.trim();
  const description = input.description.trim();
  if (!email || !description) {
    throw new Error("Email y descripción son obligatorios");
  }

  let lastErr: Error | null = null;
  for (let a = 0; a < MAX_CODE_ATTEMPTS; a++) {
    const tracking_code = generateTrackingCode();
    const { data, error } = await supabase
      .from("repairs")
      .insert({
        tracking_code,
        email,
        description,
        estimated_ready_at: input.estimated_ready_at,
        status: "pendiente",
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (!error && data) {
      const row = data as RepairRow;
      const histErr = await supabase.from("repair_status_history").insert({
        repair_id: row.id,
        to_status: "pendiente",
      });
      if (histErr.error) {
        await supabase.from("repairs").delete().eq("id", row.id);
        throw new Error(histErr.error.message);
      }
      return row;
    }
    if (error?.code === "23505") {
      lastErr = new Error("Código duplicado, reintentá");
      continue;
    }
    throw new Error(error?.message ?? "No se pudo crear la reparación");
  }
  throw lastErr ?? new Error("No se pudo generar un código único");
}

export async function listRepairsAdmin(): Promise<RepairRow[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("repairs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as RepairRow[];
}

export async function getRepairAdmin(id: string): Promise<RepairRow | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("repairs").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (data as RepairRow) : null;
}

/** Borra la reparación; historial y mensajes se eliminan por `on delete cascade` en la migración. */
export async function deleteRepairAdmin(id: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const trimmed = id.trim();
  if (!trimmed) throw new Error("ID inválido");
  const { error } = await supabase.from("repairs").delete().eq("id", trimmed);
  if (error) throw new Error(error.message);
}

export async function listRepairHistoryAdmin(repairId: string): Promise<RepairStatusHistoryRow[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("repair_status_history")
    .select("*")
    .eq("repair_id", repairId)
    .order("changed_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as RepairStatusHistoryRow[];
}

export async function listRepairMessagesAdmin(repairId: string): Promise<RepairTrackingMessageRow[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("repair_tracking_messages")
    .select("*")
    .eq("repair_id", repairId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as RepairTrackingMessageRow[];
}

export async function addRepairMessageAdmin(input: {
  repairId: string;
  body: string;
}): Promise<RepairTrackingMessageRow> {
  const supabase = createSupabaseServiceClient();
  const body = input.body.trim();
  if (!body) throw new Error("El mensaje no puede estar vacío");
  const { data, error } = await supabase
    .from("repair_tracking_messages")
    .insert({ repair_id: input.repairId, body })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as RepairTrackingMessageRow;
}

export async function updateRepairDetailsAdmin(input: {
  id: string;
  email: string;
  estimated_ready_at: string | null;
}): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const email = input.email.trim();
  if (!email) throw new Error("El email es obligatorio");
  const { error } = await supabase
    .from("repairs")
    .update({
      email,
      estimated_ready_at: input.estimated_ready_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);
  if (error) throw new Error(error.message);
}

export async function updateRepairStatusAdmin(input: {
  id: string;
  newStatus: RepairStatus;
}): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const current = await getRepairAdmin(input.id);
  if (!current) throw new Error("Reparación no encontrada");
  if (current.status === input.newStatus) return;

  const { error: hErr } = await supabase.from("repair_status_history").insert({
    repair_id: input.id,
    from_status: current.status,
    to_status: input.newStatus,
  });
  if (hErr) throw new Error(hErr.message);

  const { error } = await supabase
    .from("repairs")
    .update({
      status: input.newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);
  if (error) throw new Error(error.message);
}

/** Mensaje visible en seguimiento público (sin datos internos). */
export type RepairPublicMessage = {
  id: string;
  body: string;
  created_at: string;
};

/** Datos visibles al cliente al consultar por código (sin email). */
export type RepairPublicTracking = {
  status: RepairStatus;
  estimated_ready_at: string | null;
  description: string;
  updated_at: string;
  messages: RepairPublicMessage[];
};

export async function getRepairByTrackingCodePublic(
  code: string,
): Promise<RepairPublicTracking | null> {
  const normalized = normalizeTrackingCodeInput(code);
  if (normalized.length < 6) return null;

  const supabase = createSupabaseServiceClient();
  const { data: repair, error: rErr } = await supabase
    .from("repairs")
    .select("id, status, estimated_ready_at, description, updated_at")
    .eq("tracking_code", normalized)
    .maybeSingle();

  if (rErr) throw new Error(rErr.message);
  if (!repair) return null;
  const row = repair as {
    id: string;
    status: string;
    estimated_ready_at: string | null;
    description: string;
    updated_at: string;
  };
  if (!isRepairStatus(row.status)) return null;

  const { data: msgRows, error: mErr } = await supabase
    .from("repair_tracking_messages")
    .select("id, body, created_at")
    .eq("repair_id", row.id)
    .order("created_at", { ascending: true });

  if (mErr) throw new Error(mErr.message);

  return {
    status: row.status,
    estimated_ready_at: row.estimated_ready_at,
    description: row.description,
    updated_at: row.updated_at,
    messages: (msgRows ?? []) as RepairPublicMessage[],
  };
}

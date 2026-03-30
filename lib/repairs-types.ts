export const REPAIR_STATUSES = [
  "pendiente",
  "revision",
  "reparando",
  "finalizado",
] as const;

export type RepairStatus = (typeof REPAIR_STATUSES)[number];

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  pendiente: "Pendiente",
  revision: "En revisión",
  reparando: "Reparando",
  finalizado: "Finalizado",
};

export function isRepairStatus(v: string): v is RepairStatus {
  return (REPAIR_STATUSES as readonly string[]).includes(v);
}

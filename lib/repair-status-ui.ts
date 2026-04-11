import type { RepairStatus } from "@/lib/repairs-types";

/** Contenedor principal del resultado en seguimiento público. */
export const repairStatusPublicPanelClass: Record<RepairStatus, string> = {
  pendiente:
    "border-amber-200/90 bg-gradient-to-br from-amber-50/95 via-orange-50/50 to-white",
  revision:
    "border-sky-200/90 bg-gradient-to-br from-sky-50/95 via-blue-50/40 to-white",
  reparando:
    "border-violet-200/90 bg-gradient-to-br from-violet-50/95 via-fuchsia-50/35 to-white",
  finalizado:
    "border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-teal-50/35 to-white",
};

/** Pastilla del estado (público y admin). */
export const repairStatusBadgeClass: Record<RepairStatus, string> = {
  pendiente: "bg-amber-600 text-white shadow-sm shadow-amber-900/20",
  revision: "bg-sky-600 text-white shadow-sm shadow-sky-900/20",
  reparando: "bg-violet-600 text-white shadow-sm shadow-violet-900/20",
  finalizado: "bg-emerald-600 text-white shadow-sm shadow-emerald-900/20",
};

/** Etiqueta “Estado actual” / subtítulos alineados al tono. */
export const repairStatusPublicLabelClass: Record<RepairStatus, string> = {
  pendiente: "text-amber-900",
  revision: "text-sky-900",
  reparando: "text-violet-900",
  finalizado: "text-emerald-900",
};

/** Tarjetas de mensajes del taller dentro del panel. */
export const repairStatusMessageCardClass: Record<RepairStatus, string> = {
  pendiente: "border-amber-200/80 bg-white/90",
  revision: "border-sky-200/80 bg-white/90",
  reparando: "border-violet-200/80 bg-white/90",
  finalizado: "border-emerald-200/80 bg-white/90",
};

/** Listado admin (historial): borde izquierdo según estado destino. */
export const repairStatusHistoryBorderClass: Record<RepairStatus, string> = {
  pendiente: "border-l-4 border-l-amber-500",
  revision: "border-l-4 border-l-sky-500",
  reparando: "border-l-4 border-l-violet-500",
  finalizado: "border-l-4 border-l-emerald-500",
};

/** Badge en listado backoffice (oscuro). */
export const repairStatusBackofficeBadgeClass: Record<RepairStatus, string> = {
  pendiente: "bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/40",
  revision: "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40",
  reparando: "bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/40",
  finalizado: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40",
};

/** Botón de estado activo en ficha admin. */
export const repairStatusAdminActiveButtonClass: Record<RepairStatus, string> = {
  pendiente: "bg-amber-600 text-white ring-2 ring-amber-400/50",
  revision: "bg-sky-600 text-white ring-2 ring-sky-400/50",
  reparando: "bg-violet-600 text-white ring-2 ring-violet-400/50",
  finalizado: "bg-emerald-600 text-white ring-2 ring-emerald-400/50",
};

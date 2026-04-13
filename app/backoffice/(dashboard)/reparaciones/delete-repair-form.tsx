"use client";

import { deleteRepairAction } from "./actions";

export function DeleteRepairForm({
  id,
  trackingCode,
  className = "",
}: {
  id: string;
  trackingCode: string;
  /** Clases del botón (ej. ancho completo en móvil). */
  className?: string;
}) {
  return (
    <form
      action={deleteRepairAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `¿Eliminar la reparación ${trackingCode}? Se borran el historial de estados y los mensajes de seguimiento. No se puede deshacer.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={
          className ||
          "rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200/95 hover:bg-red-500/20"
        }
      >
        Eliminar
      </button>
    </form>
  );
}

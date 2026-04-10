"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { createRepairAndNotifyAction } from "@/app/backoffice/(dashboard)/reparaciones/actions";
import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";

const FORM_ID = "bo-nueva-reparacion-form";

function FormPendingBridge({ onPending }: { onPending: (p: boolean) => void }) {
  const { pending } = useFormStatus();
  useEffect(() => {
    onPending(pending);
  }, [pending, onPending]);
  return null;
}

export function NuevaReparacionForm() {
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);

  const snap = useMemo(() => {
    if (!dirty && !pending) return null;
    return {
      isDirty: dirty || pending,
      isSaving: pending,
      error: null,
      onSave: async () => {
        const el = document.getElementById(FORM_ID);
        if (el instanceof HTMLFormElement) el.requestSubmit();
      },
      onDiscard: () => {
        const el = document.getElementById(FORM_ID);
        if (el instanceof HTMLFormElement) el.reset();
        setDirty(false);
      },
    };
  }, [dirty, pending]);

  useBackofficeSaveBarReporter(snap);

  return (
    <form
      id={FORM_ID}
      action={createRepairAndNotifyAction}
      onChange={() => setDirty(true)}
      onInput={() => setDirty(true)}
      className="max-w-2xl space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
    >
      <FormPendingBridge onPending={setPending} />
      <p className="rounded-xl border border-violet-500/20 bg-violet-950/20 px-4 py-3 text-sm text-slate-300">
        Completá los datos y usá <strong className="text-white">Guardar cambios</strong> abajo para guardar y enviar el
        email al cliente.
      </p>
      <label className="block">
        <span className="text-sm font-medium text-slate-300">Email del cliente</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-white/[0.1] bg-black/30 px-4 py-3 text-sm text-white outline-none ring-violet-500/30 focus:ring-2"
          placeholder="cliente@email.com"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-300">Descripción</span>
        <textarea
          name="description"
          required
          rows={6}
          className="mt-2 min-h-[160px] w-full rounded-xl border border-white/[0.1] bg-black/30 px-4 py-3 text-sm leading-relaxed text-white outline-none ring-violet-500/30 focus:ring-2"
          placeholder="Equipo, falla reportada, accesorios incluidos…"
        />
      </label>
      <div className="block">
        <span className="text-sm font-medium text-slate-300">
          Tiempo pendiente estimado (opcional)
        </span>
        <p className="mt-1 text-xs text-slate-500">
          Dejá vacío si aún no hay fecha. Solo fecha → se usa 12:00 (Argentina).
        </p>
        <div
          className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          style={{ colorScheme: "dark" }}
        >
          <label className="block min-w-0 sm:min-w-[11rem]">
            <span className="mb-1 block text-xs text-slate-500">Fecha</span>
            <input
              name="estimated_date"
              type="date"
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-4 py-3 text-sm text-white outline-none ring-violet-500/30 focus:ring-2"
            />
          </label>
          <label className="block min-w-0 sm:min-w-[9rem]">
            <span className="mb-1 block text-xs text-slate-500">Hora</span>
            <input
              name="estimated_time"
              type="time"
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-4 py-3 text-sm text-white outline-none ring-violet-500/30 focus:ring-2"
            />
          </label>
        </div>
      </div>
      <div className="pt-2">
        <Link
          href="/backoffice/reparaciones"
          className="inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

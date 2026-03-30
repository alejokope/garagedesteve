import Link from "next/link";

import { createRepairAndNotifyAction } from "@/app/backoffice/(dashboard)/reparaciones/actions";

export default function NuevaReparacionPage() {
  return (
    <div className="space-y-8 p-4 sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Reparaciones
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
          Nueva reparación
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          Se genera un código único automáticamente. Al enviar, se guarda el registro y se manda un
          email al cliente con el código (Resend).
        </p>
      </div>

      <form
        action={createRepairAndNotifyAction}
        className="max-w-2xl space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
      >
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
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30"
          >
            Guardar y enviar email
          </button>
          <Link
            href="/backoffice/reparaciones"
            className="inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

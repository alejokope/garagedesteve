import Link from "next/link";

import { listRepairsAdmin } from "@/lib/backoffice/repairs-db";
import { REPAIR_STATUS_LABELS } from "@/lib/repairs-types";

function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function BackofficeReparacionesPage() {
  let rows: Awaited<ReturnType<typeof listRepairsAdmin>> = [];
  let loadError: string | null = null;
  try {
    rows = await listRepairsAdmin();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "No se pudo cargar el listado";
  }

  return (
    <div className="space-y-6 p-4 pb-10 sm:space-y-8 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Operaciones
          </p>
          <h1 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl md:text-3xl">
            Reparaciones
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Cada caso tiene un código único de seguimiento para el cliente. Los cambios de estado
            quedan en el historial de la ficha.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/backoffice"
            className="text-sm font-medium text-violet-300/90 hover:text-violet-200"
          >
            ← Inicio
          </Link>
          <Link
            href="/backoffice/reparaciones/nuevo"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/[0.12]"
          >
            Nueva reparación
          </Link>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {loadError}
          {loadError.includes("repairs") || loadError.includes("schema") ? (
            <p className="mt-2 text-xs text-red-200/80">
              ¿Aplicaste la migración{" "}
              <code className="rounded bg-black/30 px-1">004_repairs.sql</code> en Supabase?
            </p>
          ) : null}
        </div>
      ) : null}

      {!loadError && rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] px-6 py-14 text-center text-sm text-slate-400">
          No hay reparaciones cargadas.{" "}
          <Link href="/backoffice/reparaciones/nuevo" className="text-violet-300 hover:text-violet-200">
            Crear la primera
          </Link>
          .
        </div>
      ) : null}

      {!loadError && rows.length > 0 ? (
        <>
          {/* Móvil: tarjetas */}
          <ul className="space-y-3 md:hidden" aria-label="Listado de reparaciones">
            {rows.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 ring-1 ring-white/[0.04]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-semibold tracking-wider text-white">
                      {r.tracking_code}
                    </p>
                    <p className="mt-2 break-all text-xs leading-snug text-slate-400">{r.email}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-slate-200">
                    {REPAIR_STATUS_LABELS[r.status]}
                  </span>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">Alta: {formatShortDate(r.created_at)}</p>
                <Link
                  href={`/backoffice/reparaciones/${r.id}`}
                  className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-violet-600/90 text-sm font-semibold text-white hover:bg-violet-600"
                >
                  Abrir ficha
                </Link>
              </li>
            ))}
          </ul>

          {/* Tablet/desktop: tabla */}
          <div className="hidden overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02] md:block">
            <table className="min-w-[640px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Alta</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/[0.05] last:border-0">
                    <td className="px-4 py-3 font-mono text-xs font-semibold tracking-wider text-white">
                      {r.tracking_code}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-300">{r.email}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-200">
                      {REPAIR_STATUS_LABELS[r.status]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {formatShortDate(r.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/backoffice/reparaciones/${r.id}`}
                        className="text-sm font-medium text-violet-300 hover:text-violet-200"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}

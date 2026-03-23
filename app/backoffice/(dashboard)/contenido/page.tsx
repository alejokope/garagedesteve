import Link from "next/link";

import { listContentEntriesAdmin } from "@/lib/backoffice/content-db";

import { deleteContentEntryAction } from "./actions";

export default async function BackofficeContenidoPage() {
  let rows: Awaited<ReturnType<typeof listContentEntriesAdmin>> = [];
  let loadError: string | null = null;

  try {
    rows = await listContentEntriesAdmin();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "No se pudo cargar el contenido";
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Contenido
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
            Sitio y mensajes
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Entradas en{" "}
            <code className="rounded bg-white/[0.06] px-1 font-mono text-xs">content_entries</code>. La home
            pública las consume con la anon key (claves{" "}
            <code className="rounded bg-white/[0.06] px-1 font-mono text-[11px]">home.*</code>).
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/backoffice"
            className="text-sm font-medium text-violet-300/90 hover:text-violet-200"
          >
            ← Inicio
          </Link>
          <Link
            href="/backoffice/contenido/nuevo"
            className="rounded-xl bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/[0.12]"
          >
            Nueva entrada
          </Link>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {loadError}
        </div>
      ) : null}

      {!loadError && rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] px-6 py-14 text-center text-sm text-slate-400">
          No hay entradas todavía. Creá una con{" "}
          <Link href="/backoffice/contenido/nuevo" className="text-violet-300 hover:text-violet-200">
            Nueva entrada
          </Link>
          .
        </div>
      ) : null}

      {!loadError && rows.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Clave</th>
                <th className="px-4 py-3 font-medium">Etiqueta</th>
                <th className="px-4 py-3 font-medium">Actualizado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-violet-200/90">{row.key}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-slate-300">
                    {row.label ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {new Date(row.updated_at).toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`/backoffice/contenido/${encodeURIComponent(row.key)}`}
                        className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white hover:bg-white/[0.1]"
                      >
                        Editar
                      </Link>
                      <form action={deleteContentEntryAction} className="inline">
                        <input type="hidden" name="key" value={row.key} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200/95 hover:bg-red-500/20"
                        >
                          Borrar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

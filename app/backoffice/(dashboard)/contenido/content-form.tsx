"use client";

import { useActionState } from "react";

import type { ContentEntryRow } from "@/lib/backoffice/content-db";

import { saveContentEntry } from "./actions";

function stringifyPayload(payload: unknown): string {
  try {
    return JSON.stringify(payload ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

export function ContentForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: ContentEntryRow | null;
}) {
  const [state, formAction, pending] = useActionState(saveContentEntry, null);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="mode" value={mode} />

      {state?.error ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {state.error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Clave y etiqueta</h2>
        <div className="mt-4 space-y-4">
          {mode === "create" ? (
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Clave única (ej. home.testimonials)
              </span>
              <input
                name="key"
                required
                defaultValue={initial?.key ?? ""}
                className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 font-mono text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </label>
          ) : (
            <>
              <input type="hidden" name="key" value={initial?.key ?? ""} />
              <p className="text-sm text-slate-400">
                Clave:{" "}
                <code className="rounded bg-white/[0.06] px-2 py-0.5 font-mono text-slate-200">
                  {initial?.key}
                </code>
              </p>
            </>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Etiqueta (opcional, para el panel)
            </span>
            <input
              name="label"
              defaultValue={initial?.label ?? ""}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="Testimonios home"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Datos (formato JSON)</h2>
        <p className="mt-1 text-sm text-slate-500">
          Uso avanzado. Para la página de inicio usá los formularios en{" "}
          <span className="text-slate-400">Contenido</span>.
        </p>
        <textarea
          name="payload"
          required
          rows={18}
          defaultValue={stringifyPayload(initial?.payload)}
          className="mt-4 w-full resize-y rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2.5 font-mono text-xs leading-relaxed text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/40"
          spellCheck={false}
        />
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/25 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar contenido"}
      </button>
    </form>
  );
}

"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";
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
  revision,
}: {
  mode: "create" | "edit";
  initial?: ContentEntryRow | null;
  revision: string;
}) {
  const [state, formAction, pending] = useActionState(saveContentEntry, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.error) {
      toast.error("No se pudo guardar", { description: state.error });
    }
  }, [state?.error]);

  const baselineKey = mode === "create" ? "" : (initial?.key ?? "");
  const baselineLabel = initial?.label ?? "";
  const baselinePayload = useMemo(
    () => stringifyPayload(initial?.payload),
    [initial?.payload, revision],
  );

  const [keyValue, setKeyValue] = useState(baselineKey);
  const [label, setLabel] = useState(baselineLabel);
  const [payloadText, setPayloadText] = useState(baselinePayload);

  useEffect(() => {
    setKeyValue(baselineKey);
    setLabel(baselineLabel);
    setPayloadText(baselinePayload);
  }, [revision, baselineKey, baselineLabel, baselinePayload]);

  const isDirty =
    (mode === "create" ? keyValue !== baselineKey : false) ||
    label !== baselineLabel ||
    payloadText !== baselinePayload;

  const snap = useMemo(() => {
    if (!isDirty && !pending && !state?.error) return null;
    return {
      isDirty: isDirty || Boolean(state?.error),
      isSaving: pending,
      error: state?.error ?? null,
      onSave: async () => {
        const el = formRef.current;
        if (el instanceof HTMLFormElement) el.requestSubmit();
      },
      onDiscard: () => {
        setKeyValue(baselineKey);
        setLabel(baselineLabel);
        setPayloadText(baselinePayload);
      },
    };
  }, [isDirty, pending, state?.error, baselineKey, baselineLabel, baselinePayload]);

  useBackofficeSaveBarReporter(snap);

  const fieldClass =
    "w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40";

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      <input type="hidden" name="mode" value={mode} />

      {state?.error ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {state.error}
        </div>
      ) : null}

      <p className="rounded-xl border border-violet-500/20 bg-violet-950/20 px-4 py-3 text-sm text-slate-300">
        Los cambios quedan en borrador hasta que pulses <strong className="text-white">Guardar cambios</strong> en la
        barra inferior.
      </p>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Clave y etiqueta</h2>
        <div className="mt-4 space-y-4">
          {mode === "create" ? (
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Clave única (ej. home.faq)
              </span>
              <input
                name="key"
                required
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                className={`${fieldClass} font-mono`}
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
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={fieldClass}
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
          value={payloadText}
          onChange={(e) => setPayloadText(e.target.value)}
          className="mt-4 w-full resize-y rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2.5 font-mono text-xs leading-relaxed text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/40"
          spellCheck={false}
        />
      </section>
    </form>
  );
}

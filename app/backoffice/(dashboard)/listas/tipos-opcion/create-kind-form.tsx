"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";

import { createVariantKind } from "./actions";

const FORM_ID = "bo-create-variant-kind-form";

export function CreateVariantKindForm() {
  const [state, formAction, pending] = useActionState(createVariantKind, null);
  const [dirty, setDirty] = useState(false);
  const [formNonce, setFormNonce] = useState(0);
  const prevPending = useRef(false);

  useEffect(() => {
    if (prevPending.current && !pending && !state?.error) {
      setDirty(false);
      setFormNonce((n) => n + 1);
    }
    prevPending.current = pending;
  }, [pending, state?.error]);

  const snap = useMemo(() => {
    const show = dirty || pending || Boolean(state?.error);
    if (!show) return null;
    return {
      isDirty: dirty || Boolean(state?.error),
      isSaving: pending,
      error: state?.error ?? null,
      onSave: async () => {
        const el = document.getElementById(FORM_ID);
        if (el instanceof HTMLFormElement) el.requestSubmit();
      },
      onDiscard: () => {
        setFormNonce((n) => n + 1);
        setDirty(false);
      },
    };
  }, [dirty, pending, state?.error]);

  useBackofficeSaveBarReporter(snap, { priority: 1 });

  return (
    <form
      key={formNonce}
      id={FORM_ID}
      action={formAction}
      onChange={() => setDirty(true)}
      onInput={() => setDirty(true)}
      className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
    >
      <h2 className="font-display text-lg font-semibold text-white">Nuevo tipo de opción</h2>
      <p className="text-sm text-slate-500">
        El comportamiento define si en la tienda se muestran muestras de color, rejilla tipo
        capacidad o una lista simple. Guardá con la barra inferior.
      </p>
      {state?.error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200/95">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-slate-500">Identificador</span>
          <input
            name="id"
            required
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 font-mono text-sm text-white"
            placeholder="malla"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-slate-500">Nombre visible</span>
          <input
            name="label"
            required
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
            placeholder="Tipo de malla"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs text-slate-500">Ayuda (opcional)</span>
          <input
            name="hint"
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-slate-500">Comportamiento en tienda</span>
          <select
            name="ui_behavior"
            className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="color">Color / muestras</option>
            <option value="storage">Rejilla (capacidad / precio)</option>
            <option value="select">Lista simple</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-slate-500">Orden</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={0}
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="flex items-center gap-2 pt-6">
          <input name="active" type="checkbox" defaultChecked className="h-4 w-4 rounded" />
          <span className="text-sm text-slate-300">Activo</span>
        </label>
      </div>
    </form>
  );
}

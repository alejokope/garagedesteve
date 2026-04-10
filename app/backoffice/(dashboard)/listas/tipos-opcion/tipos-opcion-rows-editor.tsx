"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";
import type { VariantKindDefinitionRow } from "@/lib/catalog-dictionary-types";

import { updateVariantKind } from "./actions";

type Draft = {
  id: string;
  label: string;
  hint: string;
  ui_behavior: "color" | "storage" | "select";
  sort_order: number;
  active: boolean;
};

function rowToDraft(r: VariantKindDefinitionRow): Draft {
  return {
    id: r.id,
    label: r.label,
    hint: r.hint ?? "",
    ui_behavior: r.ui_behavior,
    sort_order: r.sort_order,
    active: r.active,
  };
}

function equal(a: Draft, b: Draft) {
  return (
    a.label === b.label &&
    a.hint === b.hint &&
    a.ui_behavior === b.ui_behavior &&
    a.sort_order === b.sort_order &&
    a.active === b.active
  );
}

export function TiposOpcionRowsEditor({
  rows,
  revision,
}: {
  rows: VariantKindDefinitionRow[];
  revision: string;
}) {
  const router = useRouter();
  const baseline = useMemo(() => rows.map(rowToDraft), [revision, rows]);
  const [drafts, setDrafts] = useState<Draft[]>(() => rows.map(rowToDraft));

  useEffect(() => {
    setDrafts(rows.map(rowToDraft));
  }, [revision, rows]);

  const isDirty = useMemo(() => {
    if (drafts.length !== baseline.length) return true;
    return drafts.some((d, i) => !equal(d, baseline[i]!));
  }, [drafts, baseline]);

  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const discard = useCallback(() => {
    setErr(null);
    setDrafts(baseline.map((b) => ({ ...b })));
  }, [baseline]);

  const performSave = useCallback(async () => {
    setErr(null);
    setSaving(true);
    try {
      for (let i = 0; i < drafts.length; i++) {
        const d = drafts[i]!;
        const b = baseline[i];
        if (b && equal(d, b)) continue;
        const fd = new FormData();
        fd.set("id", d.id);
        fd.set("label", d.label);
        fd.set("hint", d.hint);
        fd.set("ui_behavior", d.ui_behavior);
        fd.set("sort_order", String(d.sort_order));
        if (d.active) fd.set("active", "on");
        await updateVariantKind(fd);
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }, [drafts, baseline, router]);

  const snap = useMemo(() => {
    if (!isDirty && !saving && !err) return null;
    return {
      isDirty,
      isSaving: saving,
      error: err,
      onSave: performSave,
      onDiscard: discard,
    };
  }, [isDirty, saving, err, performSave, discard]);

  useBackofficeSaveBarReporter(snap, { priority: 0 });

  const inputClass =
    "w-full rounded-lg border border-white/[0.1] bg-black/40 px-3 py-2 text-sm text-white";

  return (
    <>
      <p className="mb-4 rounded-xl border border-violet-500/20 bg-violet-950/20 px-4 py-3 text-sm text-slate-300">
        Editá los tipos y guardá todo junto con <strong className="text-white">Guardar cambios</strong> abajo.
      </p>
      <div className="mt-4 space-y-4">
        {drafts.map((d, i) => (
          <div
            key={d.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4 lg:flex-row lg:flex-wrap lg:items-end"
          >
            <div className="font-mono text-xs text-slate-500 lg:w-28">{d.id}</div>
            <label className="min-w-[140px] flex-1">
              <span className="mb-1 block text-[11px] text-slate-500">Nombre</span>
              <input
                className={inputClass}
                value={d.label}
                onChange={(e) => {
                  const v = e.target.value;
                  setDrafts((prev) => {
                    const next = [...prev];
                    next[i] = { ...next[i]!, label: v };
                    return next;
                  });
                }}
              />
            </label>
            <label className="min-w-[200px] flex-[2]">
              <span className="mb-1 block text-[11px] text-slate-500">Ayuda</span>
              <input
                className={inputClass}
                value={d.hint}
                onChange={(e) => {
                  const v = e.target.value;
                  setDrafts((prev) => {
                    const next = [...prev];
                    next[i] = { ...next[i]!, hint: v };
                    return next;
                  });
                }}
              />
            </label>
            <label className="min-w-[180px]">
              <span className="mb-1 block text-[11px] text-slate-500">Comportamiento</span>
              <select
                className={inputClass}
                value={d.ui_behavior}
                onChange={(e) => {
                  const v = e.target.value as Draft["ui_behavior"];
                  setDrafts((prev) => {
                    const next = [...prev];
                    next[i] = { ...next[i]!, ui_behavior: v };
                    return next;
                  });
                }}
              >
                <option value="color">Color / muestras</option>
                <option value="storage">Rejilla</option>
                <option value="select">Lista</option>
              </select>
            </label>
            <label className="w-24">
              <span className="mb-1 block text-[11px] text-slate-500">Orden</span>
              <input
                type="number"
                className={inputClass}
                value={d.sort_order}
                onChange={(e) => {
                  const n = Number.parseInt(e.target.value, 10);
                  setDrafts((prev) => {
                    const next = [...prev];
                    next[i] = { ...next[i]!, sort_order: Number.isNaN(n) ? 0 : n };
                    return next;
                  });
                }}
              />
            </label>
            <label className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                checked={d.active}
                onChange={(e) => {
                  const on = e.target.checked;
                  setDrafts((prev) => {
                    const next = [...prev];
                    next[i] = { ...next[i]!, active: on };
                    return next;
                  });
                }}
                className="h-4 w-4 rounded"
              />
              <span className="text-xs text-slate-400">Activo</span>
            </label>
          </div>
        ))}
      </div>
    </>
  );
}

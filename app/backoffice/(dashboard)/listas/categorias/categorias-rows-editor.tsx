"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";
import type { ProductCategoryRow } from "@/lib/catalog-dictionary-types";

import { updateCategory } from "./actions";

type Draft = { id: string; label: string; sort_order: number; active: boolean };

function rowToDraft(r: ProductCategoryRow): Draft {
  return { id: r.id, label: r.label, sort_order: r.sort_order, active: r.active };
}

function equalDraft(a: Draft, b: Draft) {
  return a.label === b.label && a.sort_order === b.sort_order && a.active === b.active;
}

export function CategoriasRowsEditor({
  rows,
  revision,
}: {
  rows: ProductCategoryRow[];
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
    return drafts.some((d, i) => !equalDraft(d, baseline[i]!));
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
        if (b && equalDraft(d, b)) continue;
        const fd = new FormData();
        fd.set("id", d.id);
        fd.set("label", d.label);
        fd.set("sort_order", String(d.sort_order));
        if (d.active) fd.set("active", "on");
        await updateCategory(fd);
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
        Cambiá nombre, orden o activa; todo se guarda junto con <strong className="text-white">Guardar cambios</strong>{" "}
        abajo.
      </p>
      <div className="mt-4 space-y-4">
        {drafts.map((d, i) => (
          <div
            key={d.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4 sm:flex-row sm:flex-wrap sm:items-end"
          >
            <div className="font-mono text-xs text-slate-500 sm:w-28">{d.id}</div>
            <label className="min-w-[160px] flex-1">
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
              <span className="text-xs text-slate-400">Activa</span>
            </label>
          </div>
        ))}
      </div>
    </>
  );
}

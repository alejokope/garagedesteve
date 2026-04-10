"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";
import type { VariantPricingModeLabelRow } from "@/lib/catalog-dictionary-types";

import { updatePricingModeLabel } from "./actions";

type RowDraft = { mode: "absolute" | "delta"; label: string; hint: string };

function rowToDraft(r: VariantPricingModeLabelRow): RowDraft {
  return { mode: r.mode, label: r.label, hint: r.hint ?? "" };
}

function equal(a: RowDraft, b: RowDraft) {
  return a.label === b.label && a.hint === b.hint;
}

export function ModosPrecioEditor({
  rows,
  revision,
}: {
  rows: VariantPricingModeLabelRow[];
  revision: string;
}) {
  const router = useRouter();
  const baseline = useMemo(() => rows.map(rowToDraft), [revision, rows]);
  const [drafts, setDrafts] = useState<RowDraft[]>(() => rows.map(rowToDraft));

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
        fd.set("mode", d.mode);
        fd.set("label", d.label);
        fd.set("hint", d.hint);
        await updatePricingModeLabel(fd);
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

  useBackofficeSaveBarReporter(snap);

  const field =
    "mt-1 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white";

  return (
    <>
      <p className="mb-4 rounded-xl border border-violet-500/20 bg-violet-950/20 px-4 py-3 text-sm text-slate-300">
        Los dos modos se guardan juntos con <strong className="text-white">Guardar cambios</strong> en la barra inferior.
      </p>
      <div className="space-y-6">
        {drafts.map((d, i) => (
          <div
            key={d.mode}
            className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
          >
            <h2 className="font-display text-lg font-semibold text-white">
              Modo {d.mode === "absolute" ? "precio final" : "suma al base"}{" "}
              <span className="font-mono text-sm font-normal text-slate-500">({d.mode})</span>
            </h2>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Título en el desplegable</span>
              <input
                required
                className={field}
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
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Texto de ayuda</span>
              <textarea
                rows={2}
                className={field}
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
          </div>
        ))}
      </div>
    </>
  );
}

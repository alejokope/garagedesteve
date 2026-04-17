"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { saveSellPricingAction } from "@/app/backoffice/(dashboard)/vende-tu-equipo/actions";
import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";
import {
  boEditorH2,
  boEditorInput,
  boEditorSection,
} from "@/app/components/backoffice/bo-editor-styles";
import {
  DEFAULT_SELL_QUALITY,
  SELL_BATTERY_70_90,
  SELL_BATTERY_90_PLUS,
  defaultSellPricingPayload,
  type SellCurrency,
  type SellPricingPayload,
  type SellPricingRow,
} from "@/lib/sell-pricing-schema";

function uid() {
  return `sell-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function sellPricingSnapshot(p: SellPricingPayload): string {
  const rows = [...p.rows].sort((a, b) => {
    const m = a.model.localeCompare(b.model, "es", { sensitivity: "base" });
    if (m !== 0) return m;
    if (a.capacityGb !== b.capacityGb) return a.capacityGb - b.capacityGb;
    return a.battery.localeCompare(b.battery, "es", { sensitivity: "base" });
  });
  return JSON.stringify({ ...p, rows });
}

const fieldClass =
  "min-w-0 rounded-lg border border-white/[0.1] bg-black/35 px-2 py-1.5 text-xs text-white outline-none focus:border-violet-400/40";

export function SellPricingEditor({
  initial,
  revision,
}: {
  initial: SellPricingPayload;
  revision: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<SellPricingPayload>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setData(initial);
  }, [revision, initial]);

  const isDirty = sellPricingSnapshot(data) !== sellPricingSnapshot(initial);

  const discard = useCallback(() => {
    setErr(null);
    setData(structuredClone(initial));
  }, [initial]);

  const performSave = useCallback(async () => {
    setErr(null);
    setSaving(true);
    try {
      await saveSellPricingAction(data);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al guardar";
      setErr(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  }, [data, router]);

  const saveBarSnapshot = useMemo(() => {
    if (!isDirty && !saving && !err) return null;
    return {
      isDirty,
      isSaving: saving,
      error: err,
      onSave: performSave,
      onDiscard: discard,
    };
  }, [isDirty, saving, err, performSave, discard]);

  useBackofficeSaveBarReporter(saveBarSnapshot);

  function updateRow(id: string, patch: Partial<SellPricingRow>) {
    setData((d) => ({
      ...d,
      rows: d.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }

  function removeRow(id: string) {
    setData((d) => ({ ...d, rows: d.rows.filter((r) => r.id !== id) }));
  }

  function addRow() {
    const base = defaultSellPricingPayload().rows[0];
    const row: SellPricingRow = {
      ...base,
      id: uid(),
      model: "16",
      capacityGb: 128,
      battery: SELL_BATTERY_90_PLUS,
      price: 0,
    };
    setData((d) => ({ ...d, rows: [...d.rows, row] }));
  }

  return (
    <div className="space-y-8">
      {err ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </p>
      ) : null}

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Textos del simulador</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-slate-500">Badge</span>
            <input
              className={boEditorInput}
              value={data.badge}
              onChange={(e) => setData((d) => ({ ...d, badge: e.target.value }))}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-slate-500">Título</span>
            <input
              className={boEditorInput}
              value={data.title}
              onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-slate-500">Subtítulo</span>
            <textarea
              className={`${boEditorInput} min-h-[4.5rem]`}
              value={data.subtitle}
              onChange={(e) => setData((d) => ({ ...d, subtitle: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Moneda por defecto</span>
            <select
              className={boEditorInput}
              value={data.defaultCurrency}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  defaultCurrency: e.target.value as SellCurrency,
                }))
              }
            >
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-slate-500">Nota legal / aclaración</span>
            <textarea
              className={`${boEditorInput} min-h-[5rem]`}
              value={data.legalNote}
              onChange={(e) => setData((d) => ({ ...d, legalNote: e.target.value }))}
            />
          </label>
        </div>
      </section>

      <section className={boEditorSection}>
        <div className="mb-4 flex flex-col gap-3 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-base font-semibold tracking-tight text-white sm:text-lg">
            Filas de precios
          </h2>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/30 px-4 text-sm font-semibold text-violet-100 ring-1 ring-violet-500/35 transition hover:bg-violet-600/45"
          >
            + Agregar fila
          </button>
        </div>
        <p className="mb-4 text-xs text-slate-500">
          Cada combinación modelo + GB + batería debe ser única. Texto de batería debe coincidir
          exactamente entre filas que comparten selector (podés usar los valores sugeridos abajo).
        </p>

        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full min-w-[880px] border-collapse text-left text-xs">
            <thead className="bg-white/[0.04] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Producto</th>
                <th className="px-2 py-2">Modelo</th>
                <th className="px-2 py-2">GB</th>
                <th className="px-2 py-2">Calidad</th>
                <th className="px-2 py-2">Batería</th>
                <th className="px-2 py-2">Precio</th>
                <th className="px-2 py-2">Moneda</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {data.rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-2 py-2">
                    <input
                      className={`${fieldClass} w-[5.5rem]`}
                      value={r.product}
                      onChange={(e) => updateRow(r.id, { product: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      className={`${fieldClass} w-[6.5rem]`}
                      value={r.model}
                      onChange={(e) => updateRow(r.id, { model: e.target.value })}
                      placeholder="16 PRO MAX"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={1}
                      className={`${fieldClass} w-16`}
                      value={r.capacityGb}
                      onChange={(e) =>
                        updateRow(r.id, {
                          capacityGb: Math.max(1, parseInt(e.target.value, 10) || 1),
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <textarea
                      className={`${fieldClass} h-16 w-[10rem] resize-y`}
                      value={r.quality}
                      onChange={(e) => updateRow(r.id, { quality: e.target.value })}
                      placeholder={DEFAULT_SELL_QUALITY}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <textarea
                      className={`${fieldClass} h-16 w-[12rem] resize-y`}
                      value={r.battery}
                      onChange={(e) => updateRow(r.id, { battery: e.target.value })}
                      placeholder={`${SELL_BATTERY_70_90} / ${SELL_BATTERY_90_PLUS}`}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      className={`${fieldClass} w-20`}
                      value={r.price}
                      onChange={(e) =>
                        updateRow(r.id, {
                          price: Math.max(0, parseFloat(e.target.value) || 0),
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select
                      className={`${fieldClass} w-[5.5rem]`}
                      value={r.currency ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateRow(r.id, {
                          currency: v === "" ? null : (v as SellCurrency),
                        });
                      }}
                    >
                      <option value="">(defecto)</option>
                      <option value="USD">USD</option>
                      <option value="ARS">ARS</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(r.id)}
                      className="rounded-lg px-2 py-1 text-[11px] font-semibold text-red-300/90 hover:bg-red-500/15"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

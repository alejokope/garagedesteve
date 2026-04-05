"use client";

import { useMemo, useState } from "react";

import type { VariantKindDefinitionRow, VariantPricingModeLabelRow } from "@/lib/catalog-dictionary-types";
import type {
  ProductVariantGroup,
  ProductVariantOption,
  ProductVariantPricingMode,
  VariantUiKind,
} from "@/lib/product-variants";
import { getVariantUiKind } from "@/lib/product-variants";
import { slugifyLabel } from "@/lib/slug";

function newOptionId(): string {
  return `opt-${crypto.randomUUID().slice(0, 8)}`;
}

function emptyGroup(
  kindDefinitions: VariantKindDefinitionRow[],
): ProductVariantGroup {
  const uid = `grupo-${Date.now()}`;
  const d = kindDefinitions[0];
  return {
    id: uid,
    kind: d?.id ?? "select",
    uiKind: (d?.ui_behavior as VariantUiKind) ?? "select",
    label: "Nuevo grupo",
    pricingMode: "delta",
    options: [
      {
        id: newOptionId(),
        label: "Opción 1",
        priceDelta: 0,
      },
    ],
  };
}

function normalizeGroups(raw: unknown): ProductVariantGroup[] {
  if (!Array.isArray(raw)) return [];
  return (raw as ProductVariantGroup[]).map((g) => ({
    ...g,
    uiKind: g.uiKind ?? getVariantUiKind(g),
  }));
}

function normalizeOptionForMode(
  opt: ProductVariantOption,
  mode: ProductVariantPricingMode,
): ProductVariantOption {
  if (mode === "absolute") {
    const { priceDelta: _d, ...rest } = opt;
    return { ...rest, price: opt.price ?? 0 };
  }
  const { price: _p, ...rest } = opt;
  return { ...rest, priceDelta: opt.priceDelta ?? 0 };
}

export function VariantGroupsEditor({
  initialGroups,
  kindDefinitions,
  pricingModes,
}: {
  initialGroups: unknown;
  kindDefinitions: VariantKindDefinitionRow[];
  pricingModes: VariantPricingModeLabelRow[];
}) {
  const defs = kindDefinitions.filter((d) => d.active);
  const modes = pricingModes.length
    ? pricingModes
    : [
        {
          mode: "absolute" as const,
          label: "Precio final por opción",
          hint: null,
        },
        { mode: "delta" as const, label: "Suma al precio base", hint: null },
      ];

  const parsed = useMemo((): ProductVariantGroup[] => normalizeGroups(initialGroups), [initialGroups]);

  const [groups, setGroups] = useState<ProductVariantGroup[]>(() =>
    parsed.length ? parsed : [],
  );

  const json = useMemo(() => JSON.stringify(groups), [groups]);

  function updateGroup(i: number, patch: Partial<ProductVariantGroup>) {
    setGroups((prev) => {
      const next = [...prev];
      const g = { ...next[i], ...patch };
      if (patch.pricingMode && patch.pricingMode !== next[i].pricingMode) {
        g.options = g.options.map((o) => normalizeOptionForMode(o, patch.pricingMode!));
      }
      next[i] = g;
      return next;
    });
  }

  function updateOption(gi: number, oi: number, patch: Partial<ProductVariantOption>) {
    setGroups((prev) => {
      const next = [...prev];
      const g = { ...next[gi] };
      const opts = [...g.options];
      opts[oi] = { ...opts[oi], ...patch };
      g.options = opts;
      next[gi] = g;
      return next;
    });
  }

  function addGroup() {
    setGroups((prev) => [...prev, emptyGroup(defs.length ? defs : kindDefinitions)]);
  }

  function removeGroup(i: number) {
    setGroups((prev) => prev.filter((_, j) => j !== i));
  }

  function addOption(gi: number) {
    setGroups((prev) => {
      const next = [...prev];
      const g = { ...next[gi] };
      const id = newOptionId();
      const base: ProductVariantOption =
        g.pricingMode === "absolute"
          ? { id, label: `Opción ${g.options.length + 1}`, price: g.options[0]?.price ?? 0 }
          : { id, label: `Opción ${g.options.length + 1}`, priceDelta: 0 };
      g.options = [...g.options, base];
      next[gi] = g;
      return next;
    });
  }

  function removeOption(gi: number, oi: number) {
    setGroups((prev) => {
      const next = [...prev];
      const g = { ...next[gi] };
      if (g.options.length <= 1) return prev;
      g.options = g.options.filter((_, j) => j !== oi);
      next[gi] = g;
      return next;
    });
  }

  function kindHintFor(g: ProductVariantGroup): string | null {
    const def = defs.find((d) => d.id === g.kind);
    return def?.hint ?? null;
  }

  function pricingHintFor(mode: ProductVariantPricingMode): string | null {
    return modes.find((m) => m.mode === mode)?.hint ?? null;
  }

  function onKindChange(gi: number, kindId: string) {
    const def = defs.find((d) => d.id === kindId);
    const uiKind: VariantUiKind =
      (def?.ui_behavior as VariantUiKind) ||
      getVariantUiKind({ kind: kindId, uiKind: undefined });
    updateGroup(gi, { kind: kindId, uiKind });
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="variant_groups" value={json} readOnly />

      {groups.length === 0 ? (
        <p className="rounded-xl border border-white/[0.08] bg-black/20 px-4 py-6 text-sm leading-relaxed text-slate-400">
          <span className="font-medium text-slate-200">Nada cargado.</span> Es lo normal para productos de un solo
          precio: no hace falta hacer nada. Si necesitás color o memoria, tocá{" "}
          <span className="text-violet-200/95">+ Agregar grupo de opciones</span> abajo.
        </p>
      ) : null}

      {groups.map((g, gi) => (
        <div
          key={g.id}
          className="rounded-2xl border border-white/[0.1] bg-black/25 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.06] pb-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
                Grupo {gi + 1}
              </p>
              <p className="text-xs text-slate-500">Lo verá el cliente con la etiqueta que elijas.</p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200/95 hover:bg-red-500/20"
              onClick={() => removeGroup(gi)}
            >
              Quitar grupo
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-slate-300">
                Título del grupo (ej. Color, Almacenamiento, Correa)
              </span>
              <input
                type="text"
                value={g.label}
                onChange={(e) => {
                  const label = e.target.value;
                  updateGroup(gi, {
                    label,
                    id: slugifyLabel(label) || g.id,
                  });
                }}
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-300">
                Cómo se muestra al cliente (lista, color, etc.)
              </span>
              <select
                value={defs.some((d) => d.id === g.kind) ? g.kind : g.kind}
                onChange={(e) => onKindChange(gi, e.target.value)}
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                {!defs.some((d) => d.id === g.kind) ? (
                  <option value={g.kind}>{g.kind} (sin lista)</option>
                ) : null}
                {defs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[11px] text-slate-500">
                {kindHintFor(g) ?? "Definí tipos en Listas del catálogo → Tipos de opción."}
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-300">Precio de cada opción</span>
              <select
                value={g.pricingMode}
                onChange={(e) =>
                  updateGroup(gi, { pricingMode: e.target.value as ProductVariantPricingMode })
                }
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                {modes.map((m) => (
                  <option key={m.mode} value={m.mode}>
                    {m.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[11px] text-slate-500">
                {pricingHintFor(g.pricingMode) ?? ""}
              </span>
            </label>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Opciones del grupo
            </p>
            {g.options.map((opt, oi) => (
              <div
                key={opt.id}
                className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 sm:flex-row sm:flex-wrap sm:items-end"
              >
                <label className="min-w-[140px] flex-1">
                  <span className="mb-1 block text-[11px] text-slate-500">Nombre visible</span>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => updateOption(gi, oi, { label: e.target.value })}
                    className="w-full rounded-lg border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                </label>

                {getVariantUiKind(g) === "color" ? (
                  <label className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Color</span>
                    <input
                      type="color"
                      value={opt.hex?.startsWith("#") ? opt.hex : "#888888"}
                      onChange={(e) => updateOption(gi, oi, { hex: e.target.value })}
                      className="h-10 w-14 cursor-pointer rounded border border-white/10 bg-transparent"
                    />
                  </label>
                ) : null}

                {g.pricingMode === "absolute" ? (
                  <label className="min-w-[140px]">
                    <span className="mb-1 block text-[11px] text-slate-500">Precio final (USD)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={opt.price ?? ""}
                      onChange={(e) => {
                        const n = Number(String(e.target.value).replace(/\s/g, "").replace(",", "."));
                        updateOption(gi, oi, { price: Number.isNaN(n) ? 0 : n });
                      }}
                      className="w-full rounded-lg border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </label>
                ) : (
                  <label className="min-w-[140px]">
                    <span className="mb-1 block text-[11px] text-slate-500">Suma al precio base (USD)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={opt.priceDelta ?? 0}
                      onChange={(e) => {
                        const n = Number(String(e.target.value).replace(/\s/g, "").replace(",", "."));
                        updateOption(gi, oi, { priceDelta: Number.isNaN(n) ? 0 : n });
                      }}
                      className="w-full rounded-lg border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </label>
                )}

                <button
                  type="button"
                  className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  onClick={() => removeOption(gi, oi)}
                  disabled={g.options.length <= 1}
                >
                  Quitar opción
                </button>
              </div>
            ))}
            <button
              type="button"
              className="rounded-lg border border-dashed border-white/[0.15] bg-transparent px-4 py-2 text-sm text-violet-200/90 hover:bg-white/[0.04]"
              onClick={() => addOption(gi)}
            >
              + Agregar opción
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addGroup}
        className="w-full rounded-xl border border-dashed border-violet-500/35 bg-violet-500/10 py-3 text-sm font-medium text-violet-100/95 hover:bg-violet-500/15"
      >
        + Agregar grupo de opciones
      </button>
    </div>
  );
}

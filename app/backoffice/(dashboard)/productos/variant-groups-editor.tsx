"use client";

import { useMemo, useState } from "react";

import type { VariantKindDefinitionRow, VariantPricingModeLabelRow } from "@/lib/catalog-dictionary-types";
import {
  getVariantUiKind,
  optionVariantImageUrls,
  type ProductVariantGroup,
  type ProductVariantOption,
  type ProductVariantPricingMode,
  type VariantSelections,
  type VariantUiKind,
} from "@/lib/product-variants";
import type { SellableVariant } from "@/lib/sellable-variants";
import { normalizeSellableRows } from "@/lib/sellable-variants";

function newOptionId(): string {
  return `opt-${crypto.randomUUID().slice(0, 8)}`;
}

function newSellableId(): string {
  return `sv-${crypto.randomUUID().slice(0, 10)}`;
}

const MAX_SELLABLE_CARTESIAN = 400;

function cartesianSelections(groups: ProductVariantGroup[]): VariantSelections[] {
  if (!groups.length) return [{}];
  const [head, ...rest] = groups;
  const tail = cartesianSelections(rest);
  const out: VariantSelections[] = [];
  for (const opt of head.options) {
    for (const t of tail) {
      out.push({ [head.id]: opt.id, ...t });
    }
  }
  return out;
}

function defaultSellableRow(groups: ProductVariantGroup[]): SellableVariant {
  const sel: VariantSelections = {};
  for (const g of groups) {
    sel[g.id] = g.options[0]?.id ?? "";
  }
  return { id: newSellableId(), selections: sel };
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

function migrateOptionImages(opt: ProductVariantOption): ProductVariantOption {
  const urls = optionVariantImageUrls(opt);
  const next: ProductVariantOption = { ...opt };
  delete next.imageUrl;
  delete next.imageUrls;
  if (urls.length) next.imageUrls = urls;
  return next;
}

function normalizeGroups(raw: unknown): ProductVariantGroup[] {
  if (!Array.isArray(raw)) return [];
  return (raw as ProductVariantGroup[]).map((g) => {
    const uiKind = g.uiKind ?? getVariantUiKind(g);
    const pricingMode = g.pricingMode === "absolute" ? "absolute" : "delta";
    const vk = getVariantUiKind({ ...g, uiKind });
    const options = (g.options ?? []).map((o) => {
      let x = normalizeOptionForMode(migrateOptionImages(o as ProductVariantOption), pricingMode);
      if (
        vk === "color" &&
        !optionVariantImageUrls(x).length &&
        (x.carouselIndex === undefined || x.carouselIndex === null)
      ) {
        x = { ...x, carouselIndex: 0 };
      }
      return x;
    });
    return { ...g, uiKind, options, defaultOptionId: undefined };
  });
}

function normalizeOptionForMode(
  opt: ProductVariantOption,
  mode: ProductVariantPricingMode,
): ProductVariantOption {
  if (mode === "absolute") {
    const out: ProductVariantOption = { ...opt, price: opt.price ?? 0 };
    delete out.priceDelta;
    return out;
  }
  const out: ProductVariantOption = { ...opt, priceDelta: opt.priceDelta ?? 0 };
  delete out.price;
  return out;
}

function clampCarouselIndex(idx: number, len: number): number {
  if (len <= 0) return 0;
  if (!Number.isFinite(idx)) return 0;
  return Math.max(0, Math.min(Math.floor(idx), len - 1));
}

export function VariantGroupsEditor({
  initialGroups,
  initialSellableVariants,
  kindDefinitions,
  pricingModes,
  carouselThumbSrcs,
  onMarkDirty,
}: {
  initialGroups: unknown;
  initialSellableVariants?: unknown;
  kindDefinitions: VariantKindDefinitionRow[];
  pricingModes: VariantPricingModeLabelRow[];
  /** Orden del carrusel del producto (misma longitud que índices `carouselIndex`). */
  carouselThumbSrcs: string[];
  /** JSON de variantes no dispara `change` del formulario. */
  onMarkDirty?: () => void;
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

  const parsedSellable = useMemo(
    () => normalizeSellableRows(initialSellableVariants),
    [initialSellableVariants],
  );
  const [sellableRows, setSellableRows] = useState<SellableVariant[]>(() => parsedSellable);

  const json = useMemo(() => JSON.stringify(groups), [groups]);
  const sellableJson = useMemo(() => JSON.stringify(sellableRows), [sellableRows]);
  const slotCount = carouselThumbSrcs.length;

  function updateGroup(i: number, patch: Partial<ProductVariantGroup>) {
    onMarkDirty?.();
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
    onMarkDirty?.();
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
    onMarkDirty?.();
    setGroups((prev) => [...prev, emptyGroup(defs.length ? defs : kindDefinitions)]);
  }

  function removeGroup(i: number) {
    onMarkDirty?.();
    setGroups((prev) => prev.filter((_, j) => j !== i));
  }

  function addOption(gi: number) {
    onMarkDirty?.();
    setGroups((prev) => {
      const next = [...prev];
      const g = { ...next[gi] };
      const id = newOptionId();
      const base: ProductVariantOption =
        g.pricingMode === "absolute"
          ? { id, label: `Opción ${g.options.length + 1}`, price: g.options[0]?.price ?? 0 }
          : { id, label: `Opción ${g.options.length + 1}`, priceDelta: 0 };
      if (getVariantUiKind(g) === "color") {
        base.carouselIndex = 0;
      }
      g.options = [...g.options, base];
      next[gi] = g;
      return next;
    });
  }

  function removeOption(gi: number, oi: number) {
    onMarkDirty?.();
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
    updateGroup(gi, { kind: kindId, uiKind, defaultOptionId: undefined });
  }

  function updateSellableRow(i: number, patch: Partial<SellableVariant>) {
    onMarkDirty?.();
    setSellableRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  function updateSellableSelection(i: number, groupId: string, optionId: string) {
    onMarkDirty?.();
    setSellableRows((prev) => {
      const next = [...prev];
      const row = next[i];
      if (!row) return prev;
      next[i] = { ...row, selections: { ...row.selections, [groupId]: optionId } };
      return next;
    });
  }

  function addSellableRow() {
    if (!groups.length) return;
    onMarkDirty?.();
    setSellableRows((prev) => [...prev, defaultSellableRow(groups)]);
  }

  function removeSellableRow(i: number) {
    onMarkDirty?.();
    setSellableRows((prev) => prev.filter((_, j) => j !== i));
  }

  function generateAllSellableCombinations() {
    if (!groups.length) return;
    onMarkDirty?.();
    const combos = cartesianSelections(groups);
    const sliced = combos.slice(0, MAX_SELLABLE_CARTESIAN);
    setSellableRows(sliced.map((selections) => ({ id: newSellableId(), selections })));
  }

  function clearSellableRows() {
    onMarkDirty?.();
    setSellableRows([]);
  }

  const cartesianCount = useMemo(() => {
    if (!groups.length) return 0;
    return groups.reduce((acc, g) => acc * Math.max(1, g.options.length), 1);
  }, [groups]);

  return (
    <div className="space-y-4">
      <input type="hidden" name="variant_groups" value={json} readOnly />
      <input type="hidden" name="sellable_variants" value={sellableJson} readOnly />

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
                onChange={(e) => updateGroup(gi, { label: e.target.value })}
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
            {g.options.map((opt, oi) => {
              const isColor = getVariantUiKind(g) === "color";
              const legacyUrls = optionVariantImageUrls(opt);
              const selectedIdx =
                slotCount > 0
                  ? clampCarouselIndex(
                      typeof opt.carouselIndex === "number" ? opt.carouselIndex : 0,
                      slotCount,
                    )
                  : 0;
              return (
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

                  {isColor ? (
                    <>
                      <label className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">Muestra</span>
                        <input
                          type="color"
                          value={opt.hex?.startsWith("#") ? opt.hex : "#888888"}
                          onChange={(e) => updateOption(gi, oi, { hex: e.target.value })}
                          className="h-10 w-14 cursor-pointer rounded border border-white/10 bg-transparent"
                        />
                      </label>
                      <div className="w-full min-w-0 space-y-2 border-t border-white/[0.06] pt-3 sm:col-span-2">
                        <span className="block text-[11px] font-medium text-slate-400">
                          Foto del carrusel para este color
                        </span>
                        {legacyUrls.length ? (
                          <p className="text-[11px] text-amber-200/90">
                            Este color tenía fotos propias en el JSON (formato anterior). Elegí una miniatura abajo para
                            pasar al carrusel del producto: al elegir se borran esas URLs viejas al guardar.
                          </p>
                        ) : null}
                        {slotCount === 0 ? (
                          <p className="text-[11px] text-slate-500">
                            Subí al menos la imagen principal del producto (sección de fotos arriba) para elegir qué
                            miniatura corresponde a este color.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {carouselThumbSrcs.map((src, ii) => (
                              <button
                                key={`${src}-${ii}`}
                                type="button"
                                title={`Foto ${ii + 1}`}
                                onClick={() =>
                                  updateOption(gi, oi, {
                                    carouselIndex: ii,
                                    imageUrls: undefined,
                                    imageUrl: undefined,
                                  })
                                }
                                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                  selectedIdx === ii
                                    ? "border-violet-400 ring-2 ring-violet-500/30"
                                    : "border-white/10 hover:border-white/25"
                                }`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt="" className="h-full w-full object-contain bg-black/40" />
                                <span className="absolute bottom-0.5 left-0.5 rounded bg-black/70 px-1 text-[9px] font-medium text-white">
                                  {ii + 1}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
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
              );
            })}
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

      {groups.length > 0 ? (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200/95">
                Combinaciones que existen
              </p>
              <p className="text-xs text-slate-400">
                Una fila = una variante real (ej. 256 GB + titanio negro). Si no cargás nada acá, el cliente puede
                combinar libremente todos los grupos de arriba.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addSellableRow}
                className="rounded-lg border border-emerald-400/35 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-100/95 hover:bg-emerald-500/25"
              >
                + Fila
              </button>
              <button
                type="button"
                onClick={generateAllSellableCombinations}
                className="rounded-lg border border-white/[0.12] bg-black/30 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/[0.06]"
                title={`Producto cartesiano: hasta ${MAX_SELLABLE_CARTESIAN} filas`}
              >
                Generar todas ({cartesianCount})
              </button>
              <button
                type="button"
                onClick={clearSellableRows}
                className="rounded-lg border border-white/[0.1] px-3 py-1.5 text-xs text-slate-400 hover:bg-white/[0.05] hover:text-white"
              >
                Vaciar
              </button>
            </div>
          </div>

          {cartesianCount > MAX_SELLABLE_CARTESIAN ? (
            <p className="mt-3 text-[11px] text-amber-200/90">
              Son {cartesianCount} combinaciones: al generar todas, se guardan solo las primeras {MAX_SELLABLE_CARTESIAN}.
              Borrá opciones en los grupos o cargá filas a mano.
            </p>
          ) : null}

          {sellableRows.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              <span className="font-medium text-slate-300">Lista vacía.</span> Modo clásico: todas las mezclas de los
              grupos son válidas.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {sellableRows.map((row, ri) => (
                <div
                  key={row.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-black/25 p-4 lg:flex-row lg:flex-wrap lg:items-end"
                >
                  <span className="text-[10px] font-mono text-slate-500 lg:min-w-[4.5rem]">{row.id}</span>
                  {groups.map((g) => (
                    <label key={`${row.id}-${g.id}`} className="min-w-[140px] flex-1">
                      <span className="mb-1 block text-[11px] text-slate-500">{g.label}</span>
                      <select
                        value={row.selections[g.id] ?? ""}
                        onChange={(e) => updateSellableSelection(ri, g.id, e.target.value)}
                        className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-2 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/35"
                      >
                        {g.options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                  <label className="min-w-[120px]">
                    <span className="mb-1 block text-[11px] text-slate-500">Precio final (opc.)</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Auto"
                      value={row.price === null || row.price === undefined ? "" : String(row.price)}
                      onChange={(e) => {
                        const t = e.target.value.trim();
                        if (!t) {
                          updateSellableRow(ri, { price: undefined });
                          return;
                        }
                        const n = Number(t.replace(/\s/g, "").replace(",", "."));
                        updateSellableRow(ri, { price: Number.isNaN(n) ? undefined : n });
                      }}
                      className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-2 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/35"
                    />
                  </label>
                  <label className="min-w-[140px] flex-1">
                    <span className="mb-1 block text-[11px] text-slate-500">Nota interna (opc.)</span>
                    <input
                      type="text"
                      value={row.label ?? ""}
                      onChange={(e) => updateSellableRow(ri, { label: e.target.value.trim() || null })}
                      className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-2 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/35"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSellableRow(ri)}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200/95 hover:bg-red-500/20"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

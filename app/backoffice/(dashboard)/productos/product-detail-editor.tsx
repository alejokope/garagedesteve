"use client";

import { useMemo, useState, type ReactNode } from "react";

import type { ProductDetailBlock, ProductDetailPair } from "@/lib/product-detail-data";

function parsePairsFromRaw(raw: unknown): ProductDetailPair[] {
  if (!raw || typeof raw !== "object") return [{ key: "", value: "" }];
  const r = raw as Record<string, unknown>;

  if (Array.isArray(r.detailPairs) && r.detailPairs.length > 0) {
    const rows = r.detailPairs
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const o = x as Record<string, unknown>;
        return {
          key: String(o.key ?? "").trim(),
          value: String(o.value ?? "").trim(),
        };
      })
      .filter((x): x is ProductDetailPair => x != null && (Boolean(x.key) || Boolean(x.value)));
    if (rows.length > 0) return rows;
  }

  if (Array.isArray(r.descriptionItems) && r.descriptionItems.length > 0) {
    const lines = (r.descriptionItems as unknown[])
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.replace(/\r\n/g, "\n").trimEnd())
      .filter(Boolean);
    if (lines.length > 0) return lines.map((value) => ({ key: "", value }));
  }

  const longDescription = String(r.longDescription ?? "").trim();
  if (longDescription) return [{ key: "", value: longDescription }];

  return [{ key: "", value: "" }];
}

function parseDetailMeta(raw: unknown): Pick<ProductDetailBlock, "warranty" | "relatedIds" | "accessoryIds"> {
  if (!raw || typeof raw !== "object") {
    return { warranty: "", relatedIds: [], accessoryIds: [] };
  }
  const r = raw as Record<string, unknown>;
  return {
    warranty: typeof r.warranty === "string" ? r.warranty : "",
    relatedIds: Array.isArray(r.relatedIds) ? (r.relatedIds as string[]) : [],
    accessoryIds: Array.isArray(r.accessoryIds) ? (r.accessoryIds as string[]) : [],
  };
}

function DetailAccordion({
  title,
  subtitle,
  defaultOpen,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen: boolean;
  badge?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
        aria-expanded={open}
      >
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-200"
          aria-hidden
        >
          {open ? "−" : "+"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-base font-semibold text-white">{title}</span>
            {badge ? (
              <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {badge}
              </span>
            ) : null}
          </span>
          {subtitle ? <span className="mt-0.5 block text-sm text-slate-500">{subtitle}</span> : null}
        </span>
      </button>
      {open ? <div className="border-t border-white/[0.06] px-5 pb-5 pt-4">{children}</div> : null}
    </div>
  );
}

function ProductIdPicker({
  selectedIds,
  onChange,
  options,
  excludeId,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  options: { id: string; name: string }[];
  excludeId?: string;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const base = options.filter((o) => !excludeId || o.id !== excludeId);
    const qq = q.trim().toLowerCase();
    if (!qq) return base;
    return base.filter(
      (o) => o.name.toLowerCase().includes(qq) || o.id.toLowerCase().includes(qq),
    );
  }, [options, q, excludeId]);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre o ID…"
        className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
      />
      <div className="max-h-52 overflow-y-auto rounded-xl border border-white/[0.08] bg-black/25">
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-slate-500">No hay coincidencias.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {filtered.map((o) => (
              <li key={o.id}>
                <label className="flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-white/[0.04]">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(o.id)}
                    onChange={() => toggle(o.id)}
                    className="mt-1 h-4 w-4 rounded border-white/20"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-slate-200">{o.name}</span>
                    <span className="font-mono text-[11px] text-slate-500">{o.id}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedIds.length > 0 ? (
        <p className="text-xs text-slate-500">Seleccionados: {selectedIds.length}</p>
      ) : null}
    </div>
  );
}

const fieldClass =
  "w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500/40";

export function ProductDetailEditor({
  initialDetail,
  catalogProductOptions,
  currentProductId,
}: {
  initialDetail: unknown;
  catalogProductOptions: { id: string; name: string }[];
  currentProductId?: string;
}) {
  const basePairs = useMemo(() => parsePairsFromRaw(initialDetail), [initialDetail]);
  const baseMeta = useMemo(() => parseDetailMeta(initialDetail), [initialDetail]);

  const [pairs, setPairs] = useState<ProductDetailPair[]>(() => basePairs);
  const [warranty, setWarranty] = useState(baseMeta.warranty ?? "");
  const [relatedIds, setRelatedIds] = useState<string[]>(baseMeta.relatedIds);
  const [accessoryIds, setAccessoryIds] = useState<string[]>(baseMeta.accessoryIds);

  const detailJson = useMemo(() => {
    const cleaned = pairs
      .map((p) => ({ key: p.key.trim(), value: p.value.trim() }))
      .filter((p) => p.key || p.value);

    const longDescription = cleaned.map((p) => (p.key ? `${p.key}: ${p.value}` : p.value)).join("\n\n");

    const block: ProductDetailBlock = {
      images: [],
      longDescription,
      specs: [],
      relatedIds,
      accessoryIds,
      reviews: [],
    };
    if (cleaned.length > 0) block.detailPairs = cleaned;

    const w = warranty.trim();
    if (w) block.warranty = w;

    return JSON.stringify(block);
  }, [pairs, warranty, relatedIds, accessoryIds]);

  function updatePair(i: number, patch: Partial<ProductDetailPair>) {
    setPairs((prev) => {
      const next = [...prev];
      next[i] = { ...next[i]!, ...patch };
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="detail" value={detailJson} readOnly />

      <DetailAccordion
        title="Garantía"
        subtitle="Texto destacado en verde en la página del producto. Vacío = no se muestra."
        defaultOpen={Boolean(baseMeta.warranty?.trim())}
        badge="Opcional"
      >
        <textarea
          value={warranty}
          onChange={(e) => setWarranty(e.target.value)}
          rows={3}
          className="w-full resize-y rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm leading-relaxed text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500/40"
          placeholder="Ej. Garantía oficial 12 meses"
        />
      </DetailAccordion>

      <DetailAccordion
        title="Datos en la ficha"
        subtitle="Cada fila: etiqueta (ej. Pantalla) y valor (ej. 6,1″ OLED). Podés dejar solo valor si querés una línea suelta."
        defaultOpen
      >
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-lg bg-white/[0.08] px-3 py-2 text-xs font-medium text-white hover:bg-white/[0.12]"
              onClick={() => setPairs((rows) => [...rows, { key: "", value: "" }])}
            >
              + Agregar fila
            </button>
          </div>
          <div className="hidden gap-3 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:px-1">
            <span>Etiqueta</span>
            <span className="sm:col-span-1">Valor</span>
            <span className="w-16 text-center"> </span>
          </div>
          {pairs.map((row, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-black/20 p-3 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:items-center sm:gap-3"
            >
              <label className="block min-w-0 sm:mb-0">
                <span className="mb-1 block text-[11px] text-slate-500 sm:hidden">Etiqueta</span>
                <input
                  className={fieldClass}
                  value={row.key}
                  onChange={(e) => updatePair(i, { key: e.target.value })}
                  placeholder="Ej. Memoria"
                />
              </label>
              <label className="block min-w-0 sm:mb-0">
                <span className="mb-1 block text-[11px] text-slate-500 sm:hidden">Valor</span>
                <input
                  className={fieldClass}
                  value={row.value}
                  onChange={(e) => updatePair(i, { value: e.target.value })}
                  placeholder="Ej. 256 GB"
                />
              </label>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-white/[0.1] px-3 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300 sm:justify-self-end"
                onClick={() =>
                  setPairs((rows) => {
                    if (rows.length <= 1) return [{ key: "", value: "" }];
                    return rows.filter((_, j) => j !== i);
                  })
                }
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </DetailAccordion>

      <DetailAccordion
        title="Productos relacionados"
        subtitle="Sugerencias al final de la ficha en la tienda."
        defaultOpen={baseMeta.relatedIds.length > 0}
      >
        <ProductIdPicker
          selectedIds={relatedIds}
          onChange={setRelatedIds}
          options={catalogProductOptions}
          excludeId={currentProductId}
        />
      </DetailAccordion>

      <DetailAccordion
        title="Accesorios sugeridos"
        subtitle="Misma lista del catálogo, sin escribir IDs a mano."
        defaultOpen={baseMeta.accessoryIds.length > 0}
      >
        <ProductIdPicker
          selectedIds={accessoryIds}
          onChange={setAccessoryIds}
          options={catalogProductOptions}
          excludeId={currentProductId}
        />
      </DetailAccordion>
    </div>
  );
}

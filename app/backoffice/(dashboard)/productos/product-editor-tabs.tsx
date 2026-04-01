"use client";

import { useId, type ReactNode } from "react";

export type ProductEditorTabId = "catalogo" | "opciones" | "ficha";

const TABS: {
  id: ProductEditorTabId;
  label: string;
  description: string;
}[] = [
  {
    id: "catalogo",
    label: "Catálogo",
    description: "Nombre, precio, foto y cómo se ve en el listado",
  },
  {
    id: "opciones",
    label: "Opciones",
    description: "Memoria, color u otras variantes con precio",
  },
  {
    id: "ficha",
    label: "Página del producto",
    description: "Texto largo, galería, fichas técnicas y sugeridos",
  },
];

export function ProductEditorTabs({
  active,
  onChange,
  panels,
}: {
  active: ProductEditorTabId;
  onChange: (id: ProductEditorTabId) => void;
  panels: Record<ProductEditorTabId, ReactNode>;
}) {
  const baseId = useId();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div
          className="grid gap-1 sm:grid-cols-3"
          role="tablist"
          aria-label="Secciones del producto"
        >
          {TABS.map((t, i) => {
            const selected = active === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => onChange(t.id)}
                className={[
                  "rounded-xl px-3 py-3 text-left transition-colors sm:px-4",
                  selected
                    ? "bg-violet-600/90 text-white shadow-lg shadow-violet-950/40 ring-1 ring-white/10"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200",
                ].join(" ")}
              >
                <span className="flex items-baseline gap-2">
                  <span
                    className={[
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                      selected ? "bg-white/20 text-white" : "bg-white/[0.08] text-slate-500",
                    ].join(" ")}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <span className="font-display text-sm font-semibold tracking-tight">{t.label}</span>
                </span>
                <span
                  className={[
                    "mt-1 block pl-8 text-[11px] leading-snug sm:text-xs",
                    selected ? "text-violet-100/85" : "text-slate-500",
                  ].join(" ")}
                >
                  {t.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {TABS.map((t) => (
        <div
          key={t.id}
          id={`${baseId}-panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${t.id}`}
          hidden={active !== t.id}
        >
          {panels[t.id]}
        </div>
      ))}
    </div>
  );
}

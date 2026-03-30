"use client";

import { useMemo, useState, useTransition } from "react";

import { saveRepairPricingAction } from "@/app/backoffice/(dashboard)/servicio-tecnico/actions";
import {
  boEditorH2,
  boEditorSection,
  boEditorToolbar,
} from "@/app/components/backoffice/bo-editor-styles";
import {
  defaultRepairPricingPayload,
  type RepairCurrency,
  type RepairPricingPayload,
} from "@/lib/repair-pricing-schema";

function uid() {
  return `id-${Math.random().toString(36).slice(2, 9)}`;
}

export function RepairPricingEditor({ initial }: { initial: RepairPricingPayload }) {
  const [data, setData] = useState<RepairPricingPayload>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const jsonPreview = useMemo(() => JSON.stringify(data, null, 2), [data]);

  function save() {
    setErr(null);
    startTransition(async () => {
      try {
        await saveRepairPricingAction(data);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <div className="min-w-0 space-y-6 pb-28 sm:space-y-8 sm:pb-10 lg:pb-8">
      {err ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {err}
        </div>
      ) : null}

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Encabezado</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Badge</span>
            <input
              value={data.badge}
              onChange={(e) => setData((d) => ({ ...d, badge: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Título</span>
            <input
              value={data.title}
              onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Subtítulo</span>
            <textarea
              value={data.subtitle}
              onChange={(e) => setData((d) => ({ ...d, subtitle: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Moneda por defecto
            </span>
            <select
              value={data.defaultCurrency}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  defaultCurrency: e.target.value as RepairCurrency,
                }))
              }
              className="mt-1 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
            >
              <option value="ARS">Pesos (ARS)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Las filas pueden fijar ARS/USD individual o heredar esta moneda.
            </p>
          </label>
        </div>
      </section>

      <section className={boEditorSection}>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h2 className={boEditorH2}>Filtros de dispositivo</h2>
          <button
            type="button"
            className="rounded-lg bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white hover:bg-white/[0.12]"
            onClick={() =>
              setData((d) => ({
                ...d,
                deviceFilters: [...d.deviceFilters, { id: uid(), label: "Nuevo" }],
              }))
            }
          >
            + Filtro
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {data.deviceFilters.map((f, i) => (
            <div key={f.id} className="flex flex-wrap gap-2 rounded-xl bg-black/20 p-3">
              <input
                value={f.id}
                onChange={(e) => {
                  const id = e.target.value;
                  setData((d) => {
                    const next = [...d.deviceFilters];
                    next[i] = { ...next[i]!, id };
                    return { ...d, deviceFilters: next };
                  });
                }}
                placeholder="id (ej. iphone)"
                className="min-w-[8rem] flex-1 rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1.5 font-mono text-xs text-white"
              />
              <input
                value={f.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setData((d) => {
                    const next = [...d.deviceFilters];
                    next[i] = { ...next[i]!, label };
                    return { ...d, deviceFilters: next };
                  });
                }}
                placeholder="Etiqueta"
                className="min-w-[8rem] flex-1 rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1.5 text-sm text-white"
              />
              <button
                type="button"
                className="text-xs text-red-300 hover:text-red-200"
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    deviceFilters: d.deviceFilters.filter((_, j) => j !== i),
                  }))
                }
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={boEditorSection}>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h2 className={boEditorH2}>Categorías de precios</h2>
          <button
            type="button"
            className="rounded-lg bg-violet-600/40 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600/55"
            onClick={() =>
              setData((d) => ({
                ...d,
                categories: [
                  ...d.categories,
                  {
                    id: uid(),
                    deviceFilterIds: [],
                    title: "Nueva categoría",
                    headerTone: "blue",
                    iconEmoji: "🔧",
                    layout: "table",
                    tableRows: [],
                    footerBullets: [],
                    highlights: [],
                  },
                ],
              }))
            }
          >
            + Categoría
          </button>
        </div>

        <div className="mt-6 space-y-8">
          {data.categories.map((cat, ci) => (
            <div key={cat.id} className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-medium text-violet-200">Categoría {ci + 1}</h3>
                <button
                  type="button"
                  className="text-xs text-red-300 hover:text-red-200"
                  onClick={() =>
                    setData((d) => ({
                      ...d,
                      categories: d.categories.filter((_, j) => j !== ci),
                    }))
                  }
                >
                  Eliminar categoría
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs text-slate-500">ID</span>
                  <input
                    value={cat.id}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) => {
                        const c = [...d.categories];
                        c[ci] = { ...c[ci]!, id: v };
                        return { ...d, categories: c };
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1.5 font-mono text-xs text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-500">Título</span>
                  <input
                    value={cat.title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) => {
                        const c = [...d.categories];
                        c[ci] = { ...c[ci]!, title: v };
                        return { ...d, categories: c };
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1.5 text-sm text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-500">Tono cabecera</span>
                  <select
                    value={cat.headerTone}
                    onChange={(e) => {
                      const v = e.target.value as RepairPricingPayload["categories"][number]["headerTone"];
                      setData((d) => {
                        const c = [...d.categories];
                        c[ci] = { ...c[ci]!, headerTone: v };
                        return { ...d, categories: c };
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1.5 text-sm text-white"
                  >
                    {(["blue", "green", "purple", "orange", "red"] as const).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-slate-500">Emoji ícono</span>
                  <input
                    value={cat.iconEmoji}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) => {
                        const c = [...d.categories];
                        c[ci] = { ...c[ci]!, iconEmoji: v };
                        return { ...d, categories: c };
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1.5 text-sm text-white"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs text-slate-500">
                    Filtros aplicables (ids, coma; vacío = todos)
                  </span>
                  <input
                    value={cat.deviceFilterIds.join(", ")}
                    onChange={(e) => {
                      const ids = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      setData((d) => {
                        const c = [...d.categories];
                        c[ci] = { ...c[ci]!, deviceFilterIds: ids };
                        return { ...d, categories: c };
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1.5 font-mono text-xs text-white"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs text-slate-500">Layout</span>
                  <select
                    value={cat.layout}
                    onChange={(e) => {
                      const v = e.target.value as "table" | "highlights";
                      setData((d) => {
                        const c = [...d.categories];
                        c[ci] = { ...c[ci]!, layout: v };
                        return { ...d, categories: c };
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1.5 text-sm text-white"
                  >
                    <option value="table">Tabla de precios</option>
                    <option value="highlights">Cajas destacadas (ej. GRATIS)</option>
                  </select>
                </label>
              </div>

              {cat.layout === "table" ? (
                <div className="mt-6 min-w-0 max-w-full">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-medium text-slate-300">Filas</span>
                    <button
                      type="button"
                      className="text-xs text-violet-300 hover:text-violet-200"
                      onClick={() =>
                        setData((d) => {
                          const c = [...d.categories];
                          const rows = [
                            ...c[ci]!.tableRows,
                            {
                              model: "",
                              price: 0,
                              currency: null as RepairCurrency | null,
                              time: "",
                              warrantyLabel: "6 meses",
                            },
                          ];
                          c[ci] = { ...c[ci]!, tableRows: rows };
                          return { ...d, categories: c };
                        })
                      }
                    >
                      + Fila
                    </button>
                  </div>
                  <div className="mt-3 w-full min-w-0 max-w-full touch-pan-x overflow-x-auto overscroll-x-contain rounded-xl border border-white/[0.08] bg-black/25 p-2 [-webkit-overflow-scrolling:touch]">
                    {cat.tableRows.map((row, ri) => (
                      <div
                        key={ri}
                        className="mb-2 grid min-w-[640px] grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 rounded-lg bg-black/35 p-2 last:mb-0"
                      >
                        <input
                          placeholder="Modelo"
                          value={row.model}
                          onChange={(e) => {
                            const v = e.target.value;
                            setData((d) => {
                              const c = [...d.categories];
                              const rows = [...c[ci]!.tableRows];
                              rows[ri] = { ...rows[ri]!, model: v };
                              c[ci] = { ...c[ci]!, tableRows: rows };
                              return { ...d, categories: c };
                            });
                          }}
                          className="rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-xs text-white"
                        />
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="Precio"
                          value={row.price}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setData((d) => {
                              const c = [...d.categories];
                              const rows = [...c[ci]!.tableRows];
                              rows[ri] = { ...rows[ri]!, price: v };
                              c[ci] = { ...c[ci]!, tableRows: rows };
                              return { ...d, categories: c };
                            });
                          }}
                          className="rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-xs text-white"
                        />
                        <select
                          value={row.currency ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const currency =
                              raw === "" ? null : (raw as RepairCurrency);
                            setData((d) => {
                              const c = [...d.categories];
                              const rows = [...c[ci]!.tableRows];
                              rows[ri] = { ...rows[ri]!, currency };
                              c[ci] = { ...c[ci]!, tableRows: rows };
                              return { ...d, categories: c };
                            });
                          }}
                          className="rounded border border-white/[0.08] bg-black/40 px-1 py-1 text-[11px] text-white"
                        >
                          <option value="">Hereda</option>
                          <option value="ARS">ARS</option>
                          <option value="USD">USD</option>
                        </select>
                        <input
                          placeholder="Tiempo"
                          value={row.time}
                          onChange={(e) => {
                            const v = e.target.value;
                            setData((d) => {
                              const c = [...d.categories];
                              const rows = [...c[ci]!.tableRows];
                              rows[ri] = { ...rows[ri]!, time: v };
                              c[ci] = { ...c[ci]!, tableRows: rows };
                              return { ...d, categories: c };
                            });
                          }}
                          className="rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-xs text-white"
                        />
                        <input
                          placeholder="Garantía"
                          value={row.warrantyLabel}
                          onChange={(e) => {
                            const v = e.target.value;
                            setData((d) => {
                              const c = [...d.categories];
                              const rows = [...c[ci]!.tableRows];
                              rows[ri] = { ...rows[ri]!, warrantyLabel: v };
                              c[ci] = { ...c[ci]!, tableRows: rows };
                              return { ...d, categories: c };
                            });
                          }}
                          className="rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-xs text-white"
                        />
                        <button
                          type="button"
                          className="text-xs text-red-400"
                          onClick={() =>
                            setData((d) => {
                              const c = [...d.categories];
                              const rows = c[ci]!.tableRows.filter((_, j) => j !== ri);
                              c[ci] = { ...c[ci]!, tableRows: rows };
                              return { ...d, categories: c };
                            })
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="mt-4 block">
                    <span className="text-xs text-slate-500">Viñetas pie (una por línea)</span>
                    <textarea
                      value={cat.footerBullets.join("\n")}
                      onChange={(e) => {
                        const bullets = e.target.value.split("\n").filter((l) => l.trim());
                        setData((d) => {
                          const c = [...d.categories];
                          c[ci] = { ...c[ci]!, footerBullets: bullets };
                          return { ...d, categories: c };
                        });
                      }}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1.5 text-sm text-white"
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {cat.highlights.map((h, hi) => (
                    <div key={hi} className="flex gap-2">
                      <input
                        value={h.label}
                        onChange={(e) => {
                          const v = e.target.value;
                          setData((d) => {
                            const c = [...d.categories];
                            const hl = [...c[ci]!.highlights];
                            hl[hi] = { ...hl[hi]!, label: v };
                            c[ci] = { ...c[ci]!, highlights: hl };
                            return { ...d, categories: c };
                          });
                        }}
                        className="flex-1 rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
                      />
                      <input
                        value={h.value}
                        onChange={(e) => {
                          const v = e.target.value;
                          setData((d) => {
                            const c = [...d.categories];
                            const hl = [...c[ci]!.highlights];
                            hl[hi] = { ...hl[hi]!, value: v };
                            c[ci] = { ...c[ci]!, highlights: hl };
                            return { ...d, categories: c };
                          });
                        }}
                        className="flex-1 rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
                      />
                      <button
                        type="button"
                        className="text-red-400"
                        onClick={() =>
                          setData((d) => {
                            const c = [...d.categories];
                            const hl = c[ci]!.highlights.filter((_, j) => j !== hi);
                            c[ci] = { ...c[ci]!, highlights: hl };
                            return { ...d, categories: c };
                          })
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="text-xs text-violet-300"
                    onClick={() =>
                      setData((d) => {
                        const c = [...d.categories];
                        c[ci] = {
                          ...c[ci]!,
                          highlights: [...c[ci]!.highlights, { label: "", value: "" }],
                        };
                        return { ...d, categories: c };
                      })
                    }
                  >
                    + Caja
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Barra lateral (garantía)</h2>
        <div className="mt-4 grid gap-3">
          <input
            value={data.sidebarWarranty.title}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                sidebarWarranty: { ...d.sidebarWarranty, title: e.target.value },
              }))
            }
            className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <textarea
            value={data.sidebarWarranty.bullets.join("\n")}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                sidebarWarranty: {
                  ...d.sidebarWarranty,
                  bullets: e.target.value.split("\n").filter(Boolean),
                },
              }))
            }
            rows={4}
            className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              placeholder="Texto botón"
              value={data.sidebarWarranty.buttonLabel}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  sidebarWarranty: { ...d.sidebarWarranty, buttonLabel: e.target.value },
                }))
              }
              className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
            />
            <input
              placeholder="URL botón (opcional)"
              value={data.sidebarWarranty.buttonHref ?? ""}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  sidebarWarranty: {
                    ...d.sidebarWarranty,
                    buttonHref: e.target.value || undefined,
                  },
                }))
              }
              className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>
      </section>

      <section className={boEditorSection}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className={boEditorH2}>Info rápida (cajas)</h2>
          <button
            type="button"
            className="text-xs text-violet-300"
            onClick={() =>
              setData((d) => ({
                ...d,
                sidebarQuickInfo: [
                  ...d.sidebarQuickInfo,
                  { title: "", body: "", iconEmoji: "ℹ️" },
                ],
              }))
            }
          >
            + Caja
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {data.sidebarQuickInfo.map((box, i) => (
            <div key={i} className="rounded-xl bg-black/25 p-3">
              <input
                value={box.iconEmoji}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const q = [...d.sidebarQuickInfo];
                    q[i] = { ...q[i]!, iconEmoji: v };
                    return { ...d, sidebarQuickInfo: q };
                  });
                }}
                className="mb-2 w-16 rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-xs text-white"
              />
              <input
                value={box.title}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const q = [...d.sidebarQuickInfo];
                    q[i] = { ...q[i]!, title: v };
                    return { ...d, sidebarQuickInfo: q };
                  });
                }}
                className="mb-2 w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <textarea
                value={box.body}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const q = [...d.sidebarQuickInfo];
                    q[i] = { ...q[i]!, body: v };
                    return { ...d, sidebarQuickInfo: q };
                  });
                }}
                rows={2}
                className="w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
            </div>
          ))}
        </div>
      </section>

      <section className={boEditorSection}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className={boEditorH2}>Acordeón garantía</h2>
          <button
            type="button"
            className="text-xs text-violet-300"
            onClick={() =>
              setData((d) => ({
                ...d,
                warrantyAccordion: [
                  ...d.warrantyAccordion,
                  { id: uid(), title: "Nuevo", bullets: [] },
                ],
              }))
            }
          >
            + Ítem
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {data.warrantyAccordion.map((acc, i) => (
            <div key={acc.id} className="rounded-xl bg-black/25 p-3">
              <input
                value={acc.id}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const w = [...d.warrantyAccordion];
                    w[i] = { ...w[i]!, id: v };
                    return { ...d, warrantyAccordion: w };
                  });
                }}
                className="mb-2 w-full font-mono text-xs text-white"
              />
              <input
                value={acc.title}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const w = [...d.warrantyAccordion];
                    w[i] = { ...w[i]!, title: v };
                    return { ...d, warrantyAccordion: w };
                  });
                }}
                className="mb-2 w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <textarea
                value={acc.bullets.join("\n")}
                onChange={(e) => {
                  const bullets = e.target.value.split("\n").filter(Boolean);
                  setData((d) => {
                    const w = [...d.warrantyAccordion];
                    w[i] = { ...w[i]!, bullets };
                    return { ...d, warrantyAccordion: w };
                  });
                }}
                rows={4}
                className="w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
            </div>
          ))}
        </div>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Banner WhatsApp (pie)</h2>
        <div className="mt-4 grid gap-3">
          <input
            value={data.ctaBanner.title}
            onChange={(e) =>
              setData((d) => ({ ...d, ctaBanner: { ...d.ctaBanner, title: e.target.value } }))
            }
            className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <textarea
            value={data.ctaBanner.subtitle}
            onChange={(e) =>
              setData((d) => ({ ...d, ctaBanner: { ...d.ctaBanner, subtitle: e.target.value } }))
            }
            rows={2}
            className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <input
            value={data.ctaBanner.buttonLabel}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                ctaBanner: { ...d.ctaBanner, buttonLabel: e.target.value },
              }))
            }
            className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <input
            value={data.ctaBanner.hoursLine ?? ""}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                ctaBanner: { ...d.ctaBanner, hoursLine: e.target.value || undefined },
              }))
            }
            placeholder="Línea de horarios (opcional)"
            className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
        </div>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>JSON (solo lectura)</h2>
        <pre className="mt-3 max-h-48 overflow-x-auto overflow-y-auto rounded-xl border border-white/[0.06] bg-black/55 p-3 text-[10px] leading-relaxed text-slate-400 sm:max-h-64 sm:p-4 sm:text-[11px]">
          {jsonPreview}
        </pre>
      </section>

      <div className={boEditorToolbar}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-900/25 disabled:opacity-60 sm:flex-none sm:min-w-[10rem] sm:px-8"
          >
            {pending ? "Guardando…" : "Guardar precios"}
          </button>
          <button
            type="button"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.06] px-4 text-sm font-medium text-slate-200 hover:bg-white/[0.1] sm:flex-none"
            onClick={() => setData(defaultRepairPricingPayload())}
          >
            Valores por defecto
          </button>
        </div>
      </div>
    </div>
  );
}

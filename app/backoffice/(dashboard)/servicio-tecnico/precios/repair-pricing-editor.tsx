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
  repairRowMatchesDeviceFilter,
  repairUniqueDeviceId,
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
  const [newDeviceLabel, setNewDeviceLabel] = useState("");
  const [previewDeviceId, setPreviewDeviceId] = useState<string | "all">("all");

  const jsonPreview = useMemo(() => JSON.stringify(data, null, 2), [data]);

  const sortedEditorDevices = useMemo(() => {
    return [...data.devices].sort((a, b) =>
      a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
    );
  }, [data.devices]);

  function save() {
    setErr(null);
    startTransition(async () => {
      try {
        const payload: RepairPricingPayload = {
          ...data,
          deviceFilters: data.devices.length > 0 ? [] : data.deviceFilters,
        };
        await saveRepairPricingAction(payload);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  function addDevice() {
    const label = newDeviceLabel.trim();
    if (!label) return;
    const ids = new Set(data.devices.map((d) => d.id));
    const id = repairUniqueDeviceId(label, ids);
    setData((d) => ({ ...d, devices: [...d.devices, { id, label }] }));
    setNewDeviceLabel("");
  }

  function removeDevice(deviceId: string) {
    const dev = data.devices.find((x) => x.id === deviceId);
    const fallbackLabel = dev?.label ?? "";
    setData((d) => ({
      ...d,
      devices: d.devices.filter((x) => x.id !== deviceId),
      categories: d.categories.map((cat) => ({
        ...cat,
        deviceFilterIds: cat.deviceFilterIds.filter((id) => id !== deviceId),
        tableRows: cat.tableRows.map((row) =>
          row.deviceId === deviceId
            ? { ...row, deviceId: "", model: row.model.trim() || fallbackLabel }
            : row,
        ),
      })),
    }));
    if (previewDeviceId === deviceId) setPreviewDeviceId("all");
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
        <h2 className={boEditorH2}>Dispositivos (modelos)</h2>
        <p className="mt-2 text-sm text-slate-400">
          Lista maestra: cada fila de precios y cada categoría referencian estos modelos. El id se genera
          al crear; podés editar solo la etiqueta visible.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={newDeviceLabel}
            onChange={(e) => setNewDeviceLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDevice();
              }
            }}
            placeholder="Ej. iPhone 15 Pro"
            className="min-w-[12rem] flex-1 rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={addDevice}
            className="rounded-xl bg-white/[0.1] px-4 py-2 text-sm font-medium text-white hover:bg-white/[0.14]"
          >
            Agregar dispositivo
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {data.devices.length === 0 ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100/90">
              Agregá al menos un dispositivo para usar el selector en las filas.
            </p>
          ) : null}
          {data.devices.map((dev) => (
            <div
              key={dev.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2"
            >
              <span className="font-mono text-[11px] text-slate-500">{dev.id}</span>
              <input
                value={dev.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setData((d) => ({
                    ...d,
                    devices: d.devices.map((x) => (x.id === dev.id ? { ...x, label } : x)),
                    categories: d.categories.map((cat) => ({
                      ...cat,
                      tableRows: cat.tableRows.map((row) =>
                        row.deviceId === dev.id ? { ...row, model: label } : row,
                      ),
                    })),
                  }));
                }}
                className="min-w-[10rem] flex-1 rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1.5 text-sm text-white"
              />
              <button
                type="button"
                className="text-xs text-red-300 hover:text-red-200"
                onClick={() => removeDevice(dev.id)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Vista al editar tablas</h2>
        <p className="mt-2 text-sm text-slate-400">
          Igual que en la web pública: filtrá por modelo para ver solo las filas relevantes mientras
          editás.
        </p>
        <label className="mt-4 block max-w-md">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Dispositivo (vista)
          </span>
          <select
            value={previewDeviceId}
            onChange={(e) => {
              const v = e.target.value;
              setPreviewDeviceId(v === "all" ? "all" : v);
            }}
            className="mt-1 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="all">Todos los modelos</option>
            {sortedEditorDevices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        {previewDeviceId !== "all" ? (
          <p className="mt-2 text-xs text-violet-300/90">
            Mostrando solo filas de{" "}
            <span className="font-medium text-white">
              {data.devices.find((x) => x.id === previewDeviceId)?.label ?? previewDeviceId}
            </span>
            .
          </p>
        ) : null}
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
                <div className="block sm:col-span-2">
                  <span className="text-xs text-slate-500">
                    Dispositivos aplicables a esta categoría
                  </span>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Sin marcar ninguno = la categoría se muestra para todos los modelos al filtrar en la
                    web.
                  </p>
                  <div className="mt-2 flex max-h-36 flex-wrap gap-x-4 gap-y-2 overflow-y-auto rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2">
                    {data.devices.length === 0 ? (
                      <span className="text-xs text-slate-500">Agregá dispositivos arriba.</span>
                    ) : (
                      sortedEditorDevices.map((dev) => (
                        <label
                          key={dev.id}
                          className="flex cursor-pointer items-center gap-2 text-xs text-slate-200"
                        >
                          <input
                            type="checkbox"
                            checked={cat.deviceFilterIds.includes(dev.id)}
                            onChange={(e) => {
                              const on = e.target.checked;
                              setData((d) => {
                                const c = [...d.categories];
                                const cur = c[ci]!;
                                const nextIds = on
                                  ? [...new Set([...cur.deviceFilterIds, dev.id])]
                                  : cur.deviceFilterIds.filter((id) => id !== dev.id);
                                c[ci] = { ...cur, deviceFilterIds: nextIds };
                                return { ...d, categories: c };
                              });
                            }}
                            className="rounded border-white/20 bg-black/40"
                          />
                          {dev.label}
                        </label>
                      ))
                    )}
                  </div>
                </div>
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
                              deviceId: "",
                              model: "",
                              price: 0,
                              currency: null as RepairCurrency | null,
                              priceLabel: "",
                              partBrand: "",
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
                    {cat.tableRows.length > 0 &&
                    previewDeviceId !== "all" &&
                    !cat.tableRows.some((row) =>
                      repairRowMatchesDeviceFilter(row, previewDeviceId, data.devices),
                    ) ? (
                      <p className="px-2 py-6 text-center text-xs text-slate-500">
                        Ninguna fila coincide con el filtro de vista. Cambiá a «Todos los modelos» o
                        elegí otro dispositivo.
                      </p>
                    ) : null}
                    {cat.tableRows.map((row, ri) =>
                      !repairRowMatchesDeviceFilter(row, previewDeviceId, data.devices) ? null : (
                      <div
                        key={ri}
                        className="mb-2 grid min-w-[920px] grid-cols-[1.4fr_1fr_0.75fr_1fr_0.65fr_0.85fr_0.85fr_auto] gap-2 rounded-lg bg-black/35 p-2 last:mb-0"
                      >
                        <select
                          value={row.deviceId || ""}
                          onChange={(e) => {
                            const id = e.target.value;
                            const dev = data.devices.find((x) => x.id === id);
                            setData((d) => {
                              const c = [...d.categories];
                              const rows = [...c[ci]!.tableRows];
                              rows[ri] = {
                                ...rows[ri]!,
                                deviceId: id,
                                model: dev?.label ?? rows[ri]!.model,
                              };
                              c[ci] = { ...c[ci]!, tableRows: rows };
                              return { ...d, categories: c };
                            });
                          }}
                          className="rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-xs text-white"
                        >
                          <option value="">— Elegir modelo —</option>
                          {sortedEditorDevices.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                        <input
                          placeholder="Marca repuesto"
                          value={row.partBrand ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setData((d) => {
                              const c = [...d.categories];
                              const rows = [...c[ci]!.tableRows];
                              rows[ri] = { ...rows[ri]!, partBrand: v };
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
                        <input
                          placeholder='Texto precio (ej. "Consultar")'
                          value={row.priceLabel ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setData((d) => {
                              const c = [...d.categories];
                              const rows = [...c[ci]!.tableRows];
                              rows[ri] = { ...rows[ri]!, priceLabel: v };
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
                    )
                    )}
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

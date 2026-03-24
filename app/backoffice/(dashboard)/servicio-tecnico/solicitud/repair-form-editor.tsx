"use client";

import { useMemo, useState, useTransition } from "react";

import { saveRepairFormAction } from "@/app/backoffice/(dashboard)/servicio-tecnico/actions";
import {
  defaultRepairFormPayload,
  type RepairFormPayload,
} from "@/lib/repair-form-schema";
import type { RepairCurrency } from "@/lib/repair-pricing-schema";

function uid() {
  return `id-${Math.random().toString(36).slice(2, 9)}`;
}

export function RepairFormEditor({ initial }: { initial: RepairFormPayload }) {
  const [data, setData] = useState<RepairFormPayload>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const jsonPreview = useMemo(() => JSON.stringify(data, null, 2), [data]);

  function save() {
    setErr(null);
    startTransition(async () => {
      try {
        await saveRepairFormAction(data);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <div className="space-y-8">
      {err ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {err}
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Hero</h2>
        <div className="mt-4 space-y-3">
          <input
            value={data.heroTitle}
            onChange={(e) => setData((d) => ({ ...d, heroTitle: e.target.value }))}
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <textarea
            value={data.heroSubtitle}
            onChange={(e) => setData((d) => ({ ...d, heroSubtitle: e.target.value }))}
            rows={3}
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <label className="block">
            <span className="text-xs text-slate-500">Nombre negocio (WhatsApp, opcional)</span>
            <input
              value={data.whatsappBusinessName ?? ""}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  whatsappBusinessName: e.target.value || undefined,
                }))
              }
              className="mt-1 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="flex justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Tipos de servicio (tarjetas)</h2>
          <button
            type="button"
            className="text-xs text-violet-300"
            onClick={() =>
              setData((d) => ({
                ...d,
                serviceTypes: [
                  ...d.serviceTypes,
                  {
                    id: uid(),
                    title: "Nuevo",
                    iconEmoji: "🛠️",
                    priceFrom: 0,
                    currency: "ARS" as RepairCurrency,
                  },
                ],
              }))
            }
          >
            + Tipo
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {data.serviceTypes.map((s, i) => (
            <div key={s.id} className="grid gap-2 rounded-xl bg-black/25 p-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                value={s.id}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const st = [...d.serviceTypes];
                    st[i] = { ...st[i]!, id: v };
                    return { ...d, serviceTypes: st };
                  });
                }}
                className="font-mono text-xs text-white"
              />
              <input
                value={s.title}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const st = [...d.serviceTypes];
                    st[i] = { ...st[i]!, title: v };
                    return { ...d, serviceTypes: st };
                  });
                }}
                placeholder="Título"
                className="rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <input
                value={s.subtitle ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const st = [...d.serviceTypes];
                    st[i] = { ...st[i]!, subtitle: v || undefined };
                    return { ...d, serviceTypes: st };
                  });
                }}
                placeholder="Subtítulo"
                className="rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={s.priceFrom}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setData((d) => {
                      const st = [...d.serviceTypes];
                      st[i] = { ...st[i]!, priceFrom: v };
                      return { ...d, serviceTypes: st };
                    });
                  }}
                  className="w-24 rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
                />
                <select
                  value={s.currency}
                  onChange={(e) => {
                    const v = e.target.value as RepairCurrency;
                    setData((d) => {
                      const st = [...d.serviceTypes];
                      st[i] = { ...st[i]!, currency: v };
                      return { ...d, serviceTypes: st };
                    });
                  }}
                  className="rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-xs text-white"
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <input
                value={s.iconEmoji}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const st = [...d.serviceTypes];
                    st[i] = { ...st[i]!, iconEmoji: v };
                    return { ...d, serviceTypes: st };
                  });
                }}
                className="rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <button
                type="button"
                className="text-xs text-red-400 sm:col-span-2 lg:col-span-1"
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    serviceTypes: d.serviceTypes.filter((_, j) => j !== i),
                  }))
                }
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="flex flex-wrap justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-white">Marcas</h2>
          <button
            type="button"
            className="text-xs text-violet-300"
            onClick={() =>
              setData((d) => ({
                ...d,
                brands: [...d.brands, { id: uid(), label: "Marca" }],
              }))
            }
          >
            + Marca
          </button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {data.brands.map((b, i) => (
            <div key={b.id} className="flex gap-2">
              <input
                value={b.id}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const br = [...d.brands];
                    br[i] = { ...br[i]!, id: v };
                    return { ...d, brands: br };
                  });
                }}
                className="w-24 rounded border border-white/[0.08] bg-black/40 px-2 py-1 font-mono text-xs text-white"
              />
              <input
                value={b.label}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const br = [...d.brands];
                    br[i] = { ...br[i]!, label: v };
                    return { ...d, brands: br };
                  });
                }}
                className="flex-1 rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="flex justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Modelos (marca = brandId)</h2>
          <button
            type="button"
            className="text-xs text-violet-300"
            onClick={() =>
              setData((d) => ({
                ...d,
                models: [
                  ...d.models,
                  {
                    id: uid(),
                    brandId: d.brands[0]?.id ?? "apple",
                    label: "Modelo",
                  },
                ],
              }))
            }
          >
            + Modelo
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {data.models.map((m, i) => (
            <div key={m.id} className="flex flex-wrap gap-2 rounded-lg bg-black/25 p-2">
              <input
                value={m.id}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const mo = [...d.models];
                    mo[i] = { ...mo[i]!, id: v };
                    return { ...d, models: mo };
                  });
                }}
                className="w-24 font-mono text-xs text-white"
              />
              <select
                value={m.brandId}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const mo = [...d.models];
                    mo[i] = { ...mo[i]!, brandId: v };
                    return { ...d, models: mo };
                  });
                }}
                className="rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-xs text-white"
              >
                {data.brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
              <input
                value={m.label}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const mo = [...d.models];
                    mo[i] = { ...mo[i]!, label: v };
                    return { ...d, models: mo };
                  });
                }}
                className="min-w-[8rem] flex-1 rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <button
                type="button"
                className="text-xs text-red-400"
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    models: d.models.filter((_, j) => j !== i),
                  }))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Problema y contacto</h2>
        <div className="mt-4 grid gap-3">
          <input
            value={data.problemLabel}
            onChange={(e) => setData((d) => ({ ...d, problemLabel: e.target.value }))}
            className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <textarea
            value={data.problemPlaceholder}
            onChange={(e) => setData((d) => ({ ...d, problemPlaceholder: e.target.value }))}
            rows={2}
            className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={data.contactNameLabel}
              onChange={(e) => setData((d) => ({ ...d, contactNameLabel: e.target.value }))}
              className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
            />
            <input
              value={data.contactPhoneLabel}
              onChange={(e) => setData((d) => ({ ...d, contactPhoneLabel: e.target.value }))}
              className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
            />
            <input
              value={data.contactEmailLabel ?? ""}
              onChange={(e) => setData((d) => ({ ...d, contactEmailLabel: e.target.value }))}
              className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
            />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={data.showEmailField}
                onChange={(e) => setData((d) => ({ ...d, showEmailField: e.target.checked }))}
              />
              Mostrar campo email
            </label>
          </div>
          <input
            value={data.fileUploadTitle}
            onChange={(e) => setData((d) => ({ ...d, fileUploadTitle: e.target.value }))}
            className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <textarea
            value={data.fileUploadHint}
            onChange={(e) => setData((d) => ({ ...d, fileUploadHint: e.target.value }))}
            rows={2}
            className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <input
            value={data.ctaButtonLabel}
            onChange={(e) => setData((d) => ({ ...d, ctaButtonLabel: e.target.value }))}
            className="rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="flex justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Prioridades</h2>
          <button
            type="button"
            className="text-xs text-violet-300"
            onClick={() =>
              setData((d) => ({
                ...d,
                priorities: [
                  ...d.priorities,
                  { id: uid(), label: "Nueva", description: "" },
                ],
              }))
            }
          >
            + Prioridad
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {data.priorities.map((p, i) => (
            <div key={p.id} className="flex flex-wrap gap-2 rounded-xl bg-black/25 p-3">
              <input
                value={p.id}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const pr = [...d.priorities];
                    pr[i] = { ...pr[i]!, id: v };
                    return { ...d, priorities: pr };
                  });
                }}
                className="w-24 font-mono text-xs text-white"
              />
              <input
                value={p.label}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const pr = [...d.priorities];
                    pr[i] = { ...pr[i]!, label: v };
                    return { ...d, priorities: pr };
                  });
                }}
                className="rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <input
                value={p.description}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const pr = [...d.priorities];
                    pr[i] = { ...pr[i]!, description: v };
                    return { ...d, priorities: pr };
                  });
                }}
                className="min-w-[8rem] flex-1 rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <label className="flex items-center gap-1 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={p.default ?? false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setData((d) => {
                      const pr = d.priorities.map((x, j) =>
                        j === i
                          ? { ...x, default: checked }
                          : { ...x, default: checked ? false : x.default },
                      );
                      return { ...d, priorities: pr };
                    });
                  }}
                />
                default
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="flex justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Entrega</h2>
          <button
            type="button"
            className="text-xs text-violet-300"
            onClick={() =>
              setData((d) => ({
                ...d,
                deliveryOptions: [
                  ...d.deliveryOptions,
                  { id: uid(), title: "Nuevo", description: "" },
                ],
              }))
            }
          >
            + Opción
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {data.deliveryOptions.map((d, i) => (
            <div key={d.id} className="rounded-xl bg-black/25 p-3">
              <input
                value={d.id}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const del = [...d.deliveryOptions];
                    del[i] = { ...del[i]!, id: v };
                    return { ...d, deliveryOptions: del };
                  });
                }}
                className="mb-2 w-full font-mono text-xs text-white"
              />
              <input
                value={d.title}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const del = [...d.deliveryOptions];
                    del[i] = { ...del[i]!, title: v };
                    return { ...d, deliveryOptions: del };
                  });
                }}
                className="mb-2 w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <textarea
                value={d.description}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const del = [...d.deliveryOptions];
                    del[i] = { ...del[i]!, description: v };
                    return { ...d, deliveryOptions: del };
                  });
                }}
                rows={2}
                className="mb-2 w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <input
                value={d.addressLine ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const del = [...d.deliveryOptions];
                    del[i] = { ...del[i]!, addressLine: v || undefined };
                    return { ...d, deliveryOptions: del };
                  });
                }}
                placeholder="Dirección (opcional)"
                className="w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-xs text-white"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Sidebar</h2>
        <div className="mt-4 space-y-4">
          <input
            value={data.sidebarDiagnosis.title}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                sidebarDiagnosis: { ...d.sidebarDiagnosis, title: e.target.value },
              }))
            }
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <textarea
            value={data.sidebarDiagnosis.bullets.join("\n")}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                sidebarDiagnosis: {
                  ...d.sidebarDiagnosis,
                  bullets: e.target.value.split("\n").filter(Boolean),
                },
              }))
            }
            rows={4}
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <input
            value={data.sidebarTimes.title}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                sidebarTimes: { ...d.sidebarTimes, title: e.target.value },
              }))
            }
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          {data.sidebarTimes.items.map((it, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={it.label}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const items = [...d.sidebarTimes.items];
                    items[i] = { ...items[i]!, label: v };
                    return { ...d, sidebarTimes: { ...d.sidebarTimes, items } };
                  });
                }}
                className="flex-1 rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <input
                value={it.time}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const items = [...d.sidebarTimes.items];
                    items[i] = { ...items[i]!, time: v };
                    return { ...d, sidebarTimes: { ...d.sidebarTimes, items } };
                  });
                }}
                className="w-24 rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
            </div>
          ))}
          <input
            value={data.sidebarContact.title}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                sidebarContact: { ...d.sidebarContact, title: e.target.value },
              }))
            }
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <input
            value={data.sidebarContact.phone}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                sidebarContact: { ...d.sidebarContact, phone: e.target.value },
              }))
            }
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
          <input
            value={data.sidebarContact.email}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                sidebarContact: { ...d.sidebarContact, email: e.target.value },
              }))
            }
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Bloque “Tu dispositivo…”</h2>
        <input
          value={data.featuresSection.title}
          onChange={(e) =>
            setData((d) => ({
              ...d,
              featuresSection: { ...d.featuresSection, title: e.target.value },
            }))
          }
          className="mt-3 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
        />
        <div className="mt-4 space-y-3">
          {data.featuresSection.items.map((it, i) => (
            <div key={i} className="rounded-xl bg-black/25 p-3">
              <input
                value={it.iconEmoji}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const items = [...d.featuresSection.items];
                    items[i] = { ...items[i]!, iconEmoji: v };
                    return { ...d, featuresSection: { ...d.featuresSection, items } };
                  });
                }}
                className="mb-2 w-16 rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-xs text-white"
              />
              <input
                value={it.title}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const items = [...d.featuresSection.items];
                    items[i] = { ...items[i]!, title: v };
                    return { ...d, featuresSection: { ...d.featuresSection, items } };
                  });
                }}
                className="mb-2 w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <textarea
                value={it.description}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const items = [...d.featuresSection.items];
                    items[i] = { ...items[i]!, description: v };
                    return { ...d, featuresSection: { ...d.featuresSection, items } };
                  });
                }}
                rows={2}
                className="w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Cómo funciona</h2>
        <input
          value={data.howItWorks.title}
          onChange={(e) =>
            setData((d) => ({
              ...d,
              howItWorks: { ...d.howItWorks, title: e.target.value },
            }))
          }
          className="mt-3 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
        />
        <div className="mt-4 space-y-3">
          {data.howItWorks.steps.map((step, i) => (
            <div key={i} className="rounded-xl bg-black/25 p-3">
              <input
                value={step.title}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const steps = [...d.howItWorks.steps];
                    steps[i] = { ...steps[i]!, title: v };
                    return { ...d, howItWorks: { ...d.howItWorks, steps } };
                  });
                }}
                className="mb-2 w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <textarea
                value={step.description}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const steps = [...d.howItWorks.steps];
                    steps[i] = { ...steps[i]!, description: v };
                    return { ...d, howItWorks: { ...d.howItWorks, steps } };
                  });
                }}
                rows={2}
                className="w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Testimonios</h2>
        <input
          value={data.testimonials.sectionTitle}
          onChange={(e) =>
            setData((d) => ({
              ...d,
              testimonials: { ...d.testimonials, sectionTitle: e.target.value },
            }))
          }
          className="mt-3 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
        />
        <textarea
          value={data.testimonials.sectionSubtitle ?? ""}
          onChange={(e) =>
            setData((d) => ({
              ...d,
              testimonials: {
                ...d.testimonials,
                sectionSubtitle: e.target.value || undefined,
              },
            }))
          }
          rows={2}
          className="mt-2 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
        />
        <div className="mt-4 space-y-4">
          {data.testimonials.items.map((t, i) => (
            <div key={i} className="rounded-xl bg-black/25 p-3">
              <textarea
                value={t.quote}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const items = [...d.testimonials.items];
                    items[i] = { ...items[i]!, quote: v };
                    return { ...d, testimonials: { ...d.testimonials, items } };
                  });
                }}
                rows={2}
                className="w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
              />
              <div className="mt-2 flex gap-2">
                <input
                  value={t.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const items = [...d.testimonials.items];
                      items[i] = { ...items[i]!, name: v };
                      return { ...d, testimonials: { ...d.testimonials, items } };
                    });
                  }}
                  className="flex-1 rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
                />
                <input
                  value={t.location}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const items = [...d.testimonials.items];
                      items[i] = { ...items[i]!, location: v };
                      return { ...d, testimonials: { ...d.testimonials, items } };
                    });
                  }}
                  className="w-32 rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={t.rating}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setData((d) => {
                      const items = [...d.testimonials.items];
                      items[i] = { ...items[i]!, rating: v };
                      return { ...d, testimonials: { ...d.testimonials, items } };
                    });
                  }}
                  className="w-14 rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-sm text-white"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">JSON (solo lectura)</h2>
        <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-black/50 p-4 text-[11px] text-slate-400">
          {jsonPreview}
        </pre>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar formulario"}
        </button>
        <button
          type="button"
          className="rounded-xl border border-white/[0.12] px-6 py-3 text-sm text-slate-300 hover:bg-white/[0.05]"
          onClick={() => setData(defaultRepairFormPayload())}
        >
          Restaurar valores por defecto (local)
        </button>
      </div>
    </div>
  );
}

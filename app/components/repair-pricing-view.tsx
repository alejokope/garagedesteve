"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  formatRepairPrice,
  type RepairCurrency,
  type RepairPricingPayload,
} from "@/lib/repair-pricing-schema";
import {
  buildRepairPricingWhatsAppMessage,
  repairWhatsAppHref,
} from "@/lib/repair-whatsapp";

const headerToneClass: Record<
  RepairPricingPayload["categories"][number]["headerTone"],
  string
> = {
  blue: "bg-gradient-to-r from-blue-600 to-indigo-600",
  green: "bg-gradient-to-r from-emerald-600 to-teal-600",
  purple: "bg-gradient-to-r from-violet-600 to-purple-600",
  orange: "bg-gradient-to-r from-orange-500 to-amber-600",
  red: "bg-gradient-to-r from-red-600 to-rose-600",
};

function rowCurrency(
  defaultC: RepairCurrency,
  row: { currency?: RepairCurrency | null },
): RepairCurrency {
  if (row.currency === "ARS" || row.currency === "USD") return row.currency;
  return defaultC;
}

export function RepairPricingView({ config }: { config: RepairPricingPayload }) {
  const [filterId, setFilterId] = useState<string | "all">(
    config.deviceFilters[0]?.id ?? "all",
  );

  const visibleCategories = useMemo(() => {
    return config.categories.filter((cat) => {
      if (cat.deviceFilterIds.length === 0) return true;
      if (filterId === "all") return true;
      return cat.deviceFilterIds.includes(filterId);
    });
  }, [config.categories, filterId]);

  const waCta = useMemo(() => {
    const text = buildRepairPricingWhatsAppMessage();
    return repairWhatsAppHref(text);
  }, []);

  const [openAccordion, setOpenAccordion] = useState<string | null>(
    config.warrantyAccordion[0]?.id ?? null,
  );

  return (
    <div className="min-h-screen bg-[#f9fafb] pb-16 pt-[3.5rem] sm:pt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <nav className="text-sm text-neutral-500" aria-label="Migas de pan">
          <Link href="/" className="hover:text-[var(--brand-from)]">
            Inicio
          </Link>
          <span className="mx-2 text-neutral-300">/</span>
          <Link href="/servicio-tecnico/solicitud" className="hover:text-[var(--brand-from)]">
            Servicio técnico
          </Link>
          <span className="mx-2 text-neutral-300">/</span>
          <span className="font-medium text-neutral-700">Precios</span>
        </nav>

        <div className="mt-6 max-w-3xl">
          <span className="inline-flex rounded-full bg-[var(--brand-from)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-from)]">
            {config.badge}
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {config.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 sm:text-base">
            {config.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/servicio-tecnico/solicitud"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white shadow-md transition hover:bg-[#20bd5a]"
            >
              Solicitar reparación
            </Link>
            <span className="self-center text-xs text-neutral-500">
              Cotización final por WhatsApp · sin pago en la web
            </span>
          </div>
        </div>

        {config.deviceFilters.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterId("all")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filterId === "all"
                  ? "bg-gradient-brand text-white shadow-md"
                  : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50"
              }`}
            >
              Todos
            </button>
            {config.deviceFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterId(f.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filterId === f.id
                    ? "bg-gradient-brand text-white shadow-md"
                    : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-10">
          <div className="min-w-0 flex-1 space-y-8">
            {visibleCategories.map((cat) => (
              <section
                key={cat.id}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm"
              >
                <div
                  className={`flex items-center gap-3 px-5 py-4 text-white ${headerToneClass[cat.headerTone]}`}
                >
                  <span className="text-2xl" aria-hidden>
                    {cat.iconEmoji}
                  </span>
                  <h2 className="font-display text-lg font-bold sm:text-xl">{cat.title}</h2>
                </div>

                {cat.layout === "table" ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
                          <th className="px-4 py-3 font-semibold">Modelo</th>
                          <th className="px-4 py-3 font-semibold">Precio</th>
                          <th className="px-4 py-3 font-semibold">Tiempo</th>
                          <th className="px-4 py-3 font-semibold">Garantía</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.tableRows.map((row, i) => {
                          const cur = rowCurrency(config.defaultCurrency, row);
                          return (
                            <tr
                              key={`${cat.id}-${i}`}
                              className="border-b border-neutral-100 last:border-0"
                            >
                              <td className="px-4 py-3 font-medium text-neutral-900">
                                {row.model}
                              </td>
                              <td className="px-4 py-3 font-display font-bold tabular-nums text-[var(--brand-from)]">
                                {formatRepairPrice(row.price, cur)}
                              </td>
                              <td className="px-4 py-3 text-neutral-600">{row.time}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                                  {row.warrantyLabel}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid gap-4 p-5 sm:grid-cols-2">
                    {cat.highlights.map((h, i) => (
                      <div
                        key={`${cat.id}-h-${i}`}
                        className="rounded-2xl border border-neutral-100 bg-gradient-to-br from-neutral-50 to-white p-6 text-center shadow-inner"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          {h.label}
                        </p>
                        <p className="mt-2 font-display text-2xl font-bold text-neutral-900">
                          {h.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {cat.layout === "table" && cat.footerBullets.length > 0 ? (
                  <ul className="space-y-2 border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 text-sm text-neutral-600">
                    {cat.footerBullets.map((b, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-emerald-600" aria-hidden>
                          ✓
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {visibleCategories.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-12 text-center text-neutral-500">
                No hay precios para este filtro. Probá otra categoría o contactanos por WhatsApp.
              </p>
            ) : null}

            <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-neutral-900">
                Condiciones de garantía
              </h2>
              <div className="mt-4 divide-y divide-neutral-100 rounded-xl border border-neutral-100">
                {config.warrantyAccordion.map((item) => {
                  const open = openAccordion === item.id;
                  return (
                    <div key={item.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                        onClick={() => setOpenAccordion(open ? null : item.id)}
                        aria-expanded={open}
                      >
                        {item.title}
                        <span className="text-neutral-400" aria-hidden>
                          {open ? "−" : "+"}
                        </span>
                      </button>
                      {open ? (
                        <div className="border-t border-neutral-100 bg-neutral-50/50 px-4 py-3">
                          <ul className="list-inside list-disc space-y-1.5 text-sm text-neutral-600">
                            {item.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="w-full shrink-0 space-y-6 lg:sticky lg:top-24 lg:max-w-sm">
            <div className="rounded-2xl bg-gradient-brand p-6 text-white shadow-lg">
              <div className="flex items-start gap-3">
                <span className="text-3xl" aria-hidden>
                  🛡️
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold">{config.sidebarWarranty.title}</h2>
                  <ul className="mt-3 space-y-2 text-sm text-white/90">
                    {config.sidebarWarranty.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2">
                        <span aria-hidden>•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  {config.sidebarWarranty.buttonHref ? (
                    <Link
                      href={config.sidebarWarranty.buttonHref}
                      className="mt-5 inline-flex rounded-xl border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                    >
                      {config.sidebarWarranty.buttonLabel}
                    </Link>
                  ) : (
                    <span className="mt-5 inline-block rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white/90">
                      {config.sidebarWarranty.buttonLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {config.sidebarQuickInfo.map((box, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
              >
                <div className="flex gap-3">
                  <span className="text-2xl">{box.iconEmoji}</span>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-neutral-900">
                      {box.title}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600">{box.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </aside>
        </div>

        <section className="mt-14 overflow-hidden rounded-2xl bg-gradient-brand p-8 text-center text-white shadow-xl sm:p-10">
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl">
              💬
            </div>
            <h2 className="font-display text-xl font-bold sm:text-2xl">{config.ctaBanner.title}</h2>
            <p className="mt-2 text-sm text-white/90 sm:text-base">{config.ctaBanner.subtitle}</p>
            {waCta ? (
              <a
                href={waCta}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-[48px] w-full max-w-md items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[var(--brand-from)] shadow-lg transition hover:bg-white/95 sm:text-base"
              >
                {config.ctaBanner.buttonLabel}
              </a>
            ) : (
              <p className="mt-4 text-sm text-white/80">
                Configurá{" "}
                <code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_WHATSAPP_NUMBER</code>
              </p>
            )}
            {config.ctaBanner.hoursLine ? (
              <p className="mt-4 text-xs text-white/75">{config.ctaBanner.hoursLine}</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

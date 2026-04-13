"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useFloatingContact } from "@/app/context/floating-contact-context";
import {
  formatRepairTablePriceCell,
  repairCategoryVisibleForDevice,
  repairRowMatchesDeviceFilter,
  repairRowModelDisplay,
  type RepairPricingPayload,
} from "@/lib/repair-pricing-schema";
import { repairWhatsAppHref } from "@/lib/repair-whatsapp";

/** Cabeceras de categoría: variaciones solo en escala de grises (marca monocroma). */
const headerToneClass: Record<
  RepairPricingPayload["categories"][number]["headerTone"],
  string
> = {
  blue: "bg-neutral-950",
  green: "bg-neutral-900",
  purple: "bg-zinc-900",
  orange: "bg-neutral-800",
  red: "bg-black",
};

export function RepairPricingView({
  config,
  variant = "page",
}: {
  config: RepairPricingPayload;
  variant?: "page" | "section";
}) {
  const { phoneDigits, servicioTecnicoMessage } = useFloatingContact();
  const isSection = variant === "section";
  const [deviceFilterId, setDeviceFilterId] = useState<string | "all">("all");

  const sortedDevices = useMemo(() => {
    return [...config.devices].sort((a, b) =>
      a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
    );
  }, [config.devices]);

  const visibleCategories = useMemo(() => {
    return config.categories.filter((cat) =>
      repairCategoryVisibleForDevice(cat, deviceFilterId),
    );
  }, [config.categories, deviceFilterId]);

  const waCta = useMemo(() => {
    return repairWhatsAppHref(servicioTecnicoMessage, phoneDigits);
  }, [servicioTecnicoMessage, phoneDigits]);

  const [openAccordion, setOpenAccordion] = useState<string | null>(
    config.warrantyAccordion[0]?.id ?? null,
  );

  const [deviceSheetOpen, setDeviceSheetOpen] = useState(false);

  const selectedDeviceLabel = useMemo(() => {
    if (deviceFilterId === "all") return "Todos los modelos";
    return sortedDevices.find((d) => d.id === deviceFilterId)?.label ?? "Todos los modelos";
  }, [deviceFilterId, sortedDevices]);

  useEffect(() => {
    if (!deviceSheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeviceSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [deviceSheetOpen]);

  function pickDevice(id: string | "all") {
    setDeviceFilterId(id);
    setDeviceSheetOpen(false);
  }

  return (
    <div
      className={
        isSection ? "w-full" : "min-h-screen bg-[#f9fafb] pb-16 pt-[3.5rem] sm:pt-16"
      }
    >
      <div
        className={
          isSection ? "w-full" : "mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10"
        }
      >
        {!isSection ? (
          <nav className="text-sm text-neutral-500" aria-label="Migas de pan">
            <Link href="/" className="hover:text-[var(--brand-from)]">
              Inicio
            </Link>
            <span className="mx-2 text-neutral-300">/</span>
            <Link href="/servicio-tecnico" className="hover:text-[var(--brand-from)]">
              Servicio técnico
            </Link>
            <span className="mx-2 text-neutral-300">/</span>
            <span className="font-medium text-neutral-700">Precios</span>
          </nav>
        ) : null}

        <div className={isSection ? "max-w-3xl" : "mt-6 max-w-3xl"}>
          <span className="inline-flex rounded-full bg-[var(--brand-from)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-from)]">
            {config.badge}
          </span>
          <h1
            className={`font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl ${isSection ? "mt-2" : "mt-4"}`}
          >
            {config.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 sm:text-base">
            {config.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={waCta ?? "/servicio-tecnico#seguimiento"}
              target={waCta ? "_blank" : undefined}
              rel={waCta ? "noopener noreferrer" : undefined}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white shadow-md transition hover:bg-[#20bd5a]"
            >
              Escribir por WhatsApp
            </a>
            <span className="self-center text-xs text-neutral-500">
              Cerramos precio y turno por chat · sin pago en la web
            </span>
          </div>
        </div>

        {sortedDevices.length > 0 ? (
          <>
            <div className="mt-8 hidden max-w-xl md:block">
              <label
                htmlFor="repair-device-filter"
                className="block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Buscar por dispositivo
              </label>
              <select
                id="repair-device-filter"
                value={deviceFilterId}
                onChange={(e) => {
                  const v = e.target.value;
                  setDeviceFilterId(v === "all" ? "all" : v);
                }}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 shadow-sm ring-0 focus:border-[var(--brand-from)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-from)]/25"
              >
                <option value="all">Todos los modelos</option>
                {sortedDevices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-neutral-500">
                Mostramos solo las filas del modelo elegido en cada tabla.
              </p>
            </div>

            <div className="mt-8 md:hidden">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Buscar por dispositivo
              </p>
              <button
                type="button"
                onClick={() => setDeviceSheetOpen(true)}
                className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white p-4 text-left shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)] ring-1 ring-neutral-100 transition active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-from)]/35"
                aria-haspopup="dialog"
                aria-expanded={deviceSheetOpen}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-from)]/15 to-violet-500/10 text-lg">
                  📱
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-semibold text-neutral-900">
                    {selectedDeviceLabel}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    Tocá para filtrar precios por modelo
                  </span>
                </span>
                <svg
                  className="h-5 w-5 shrink-0 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {deviceSheetOpen ? (
              <div
                className="fixed inset-0 z-[90] md:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Elegir dispositivo"
              >
                <button
                  type="button"
                  className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                  onClick={() => setDeviceSheetOpen(false)}
                  aria-label="Cerrar"
                />
                <div
                  className="absolute inset-x-0 bottom-0 max-h-[min(85dvh,100%)] overflow-hidden rounded-t-[1.35rem] bg-white shadow-[0_-12px_48px_-12px_rgba(15,23,42,0.25)]"
                  style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                    <p className="font-display text-base font-semibold text-neutral-900">
                      Dispositivo
                    </p>
                    <button
                      type="button"
                      onClick={() => setDeviceSheetOpen(false)}
                      className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                      aria-label="Cerrar"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="max-h-[min(72dvh,520px)] overflow-y-auto overscroll-contain px-2 py-2">
                    <button
                      type="button"
                      onClick={() => pickDevice("all")}
                      className={`flex w-full items-center rounded-xl px-4 py-3.5 text-left text-sm font-medium transition ${
                        deviceFilterId === "all"
                          ? "bg-[var(--brand-from)]/12 text-[var(--brand-from)] ring-2 ring-[var(--brand-from)]/25"
                          : "text-neutral-800 hover:bg-neutral-50"
                      }`}
                    >
                      Todos los modelos
                    </button>
                    {sortedDevices.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => pickDevice(d.id)}
                        className={`mt-1 flex w-full items-center rounded-xl px-4 py-3.5 text-left text-sm font-medium transition ${
                          deviceFilterId === d.id
                            ? "bg-[var(--brand-from)]/12 text-[var(--brand-from)] ring-2 ring-[var(--brand-from)]/25"
                            : "text-neutral-800 hover:bg-neutral-50"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-10">
          <div className="min-w-0 flex-1 space-y-8">
            {visibleCategories.map((cat) => {
              const filteredRows =
                cat.layout === "table"
                  ? cat.tableRows.filter((row) =>
                      repairRowMatchesDeviceFilter(row, deviceFilterId, config.devices),
                    )
                  : cat.tableRows;
              const showBrand =
                cat.layout === "table" &&
                filteredRows.some((r) => r.partBrand?.trim());

              return (
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
                    {filteredRows.length === 0 ? (
                      <p className="px-5 py-8 text-center text-sm text-neutral-500">
                        No hay precios cargados para este modelo en esta categoría.
                      </p>
                    ) : (
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
                          <th className="whitespace-nowrap px-4 py-3 font-semibold">Modelo</th>
                          {showBrand ? (
                            <th className="px-4 py-3 font-semibold">Repuesto</th>
                          ) : null}
                          <th className="px-4 py-3 font-semibold">Precio</th>
                          <th className="px-4 py-3 font-semibold">Tiempo</th>
                          <th className="whitespace-nowrap px-4 py-3 font-semibold">Garantía</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((row, i) => {
                          const priceText = formatRepairTablePriceCell(row, config.defaultCurrency);
                          const priceIsNumeric = !row.priceLabel?.trim();
                          const modelDisplay = repairRowModelDisplay(row, config.devices);
                          return (
                            <tr
                              key={`${cat.id}-${row.deviceId || row.model}-${i}`}
                              className="border-b border-neutral-100 last:border-0"
                            >
                              <td className="whitespace-nowrap px-4 py-3 font-medium text-neutral-900 align-middle">
                                {modelDisplay}
                              </td>
                              {showBrand ? (
                                <td className="px-4 py-3 text-neutral-600">
                                  {row.partBrand?.trim() || "—"}
                                </td>
                              ) : null}
                              <td
                                className={`px-4 py-3 font-display font-bold text-[var(--brand-from)] ${priceIsNumeric ? "tabular-nums" : ""}`}
                              >
                                {priceText}
                              </td>
                              <td className="px-4 py-3 text-neutral-600">{row.time}</td>
                              <td className="whitespace-nowrap px-4 py-3 align-middle">
                                <span className="inline-flex whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                                  {row.warrantyLabel}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    )}
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
            );
            })}

            {visibleCategories.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-12 text-center text-neutral-500">
                No hay precios para este modelo. Probá otro filtro o escribinos por WhatsApp.
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
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-white shadow-lg">
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

        <section className="mt-14 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-8 text-center text-white shadow-xl sm:p-10">
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
                className="mt-6 inline-flex min-h-[48px] w-full max-w-md items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-neutral-950 shadow-lg transition hover:bg-neutral-100 sm:text-base"
              >
                {config.ctaBanner.buttonLabel}
              </a>
            ) : (
              <p className="mt-4 text-sm text-white/80">
                Configurá el número en{" "}
                <span className="font-semibold text-white">Contenido → Botones flotantes</span> o en{" "}
                <code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_WHATSAPP_NUMBER</code>.
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

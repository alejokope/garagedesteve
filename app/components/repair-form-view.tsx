"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  formatServicePrice,
  type RepairFormPayload,
} from "@/lib/repair-form-schema";
import {
  buildRepairFormWhatsAppMessage,
  repairWhatsAppHref,
} from "@/lib/repair-whatsapp";

export function RepairFormView({
  config,
  variant = "page",
}: {
  config: RepairFormPayload;
  variant?: "page" | "section";
}) {
  const isSection = variant === "section";
  const [serviceId, setServiceId] = useState(
    () => config.serviceTypes[0]?.id ?? "",
  );
  const [brandId, setBrandId] = useState(() => config.brands[0]?.id ?? "");
  const [modelId, setModelId] = useState("");
  const [problem, setProblem] = useState("");
  const [priorityId, setPriorityId] = useState(() => {
    const d = config.priorities.find((p) => p.default);
    return d?.id ?? config.priorities[0]?.id ?? "";
  });
  const [deliveryId, setDeliveryId] = useState(
    () => config.deliveryOptions[0]?.id ?? "",
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);

  const modelsForBrand = useMemo(() => {
    return config.models.filter((m) => m.brandId === brandId);
  }, [config.models, brandId]);

  useEffect(() => {
    const first = modelsForBrand[0];
    setModelId(first?.id ?? "");
  }, [brandId, modelsForBrand]);

  const serviceType = config.serviceTypes.find((s) => s.id === serviceId);
  const brand = config.brands.find((b) => b.id === brandId);
  const model = config.models.find((m) => m.id === modelId);
  const priority = config.priorities.find((p) => p.id === priorityId);
  const delivery = config.deliveryOptions.find((d) => d.id === deliveryId);

  const waHref = useMemo(() => {
    if (!serviceType || !brand || !model || !priority || !delivery) return null;
    const text = buildRepairFormWhatsAppMessage({
      businessName: config.whatsappBusinessName,
      serviceTypeLabel: serviceType.title,
      brandLabel: brand.label,
      modelLabel: model.label,
      problem,
      priorityLabel: priority.label,
      deliveryLabel: delivery.title,
      customerName: name.trim() || "(sin nombre)",
      phone: phone.trim() || "(sin teléfono)",
      email: config.showEmailField ? email : undefined,
      fileNames,
    });
    return repairWhatsAppHref(text);
  }, [
    serviceType,
    brand,
    model,
    priority,
    delivery,
    problem,
    name,
    phone,
    email,
    fileNames,
    config.showEmailField,
    config.whatsappBusinessName,
  ]);

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list?.length) {
      setFileNames([]);
      return;
    }
    setFileNames(Array.from(list, (f) => f.name));
  }

  return (
    <div
      className={
        isSection ? "w-full" : "min-h-screen bg-[#f9fafb] pb-20 pt-[3.5rem] sm:pt-16"
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
            <span className="font-medium text-neutral-700">Solicitud</span>
          </nav>
        ) : null}

        <div className={isSection ? "flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12" : "mt-6 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12"}>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              {config.heroTitle}
            </h1>
            <p className="mt-2 text-sm text-neutral-600 sm:text-base">{config.heroSubtitle}</p>
            <p className="mt-3 text-sm">
              <a
                href="/servicio-tecnico#precios"
                className="font-medium text-[var(--brand-from)] underline-offset-4 hover:underline"
              >
                Ver lista de precios orientativos
              </a>
            </p>

            <section className="mt-8">
              <h2 className="text-sm font-semibold text-neutral-900">Tipo de servicio</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {config.serviceTypes.map((s) => {
                  const active = serviceId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceId(s.id)}
                      className={`flex flex-col rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-[var(--brand-from)] bg-[var(--brand-from)]/5 ring-2 ring-[var(--brand-from)]/30"
                          : "border-[var(--border)] bg-white hover:border-neutral-300"
                      }`}
                    >
                      <span className="text-2xl">{s.iconEmoji}</span>
                      <span className="mt-2 font-display font-semibold text-neutral-900">
                        {s.title}
                      </span>
                      {s.subtitle ? (
                        <span className="mt-0.5 text-xs text-neutral-500">{s.subtitle}</span>
                      ) : null}
                      <span className="mt-2 text-sm font-bold text-[var(--brand-from)]">
                        {formatServicePrice(s.priceFrom, s.currency)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-neutral-900">Marca del dispositivo</span>
                <select
                  value={brandId}
                  onChange={(e) => {
                    setBrandId(e.target.value);
                    setModelId("");
                  }}
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-[var(--brand-from)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-from)]/20"
                >
                  {config.brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-neutral-900">Modelo</span>
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  disabled={modelsForBrand.length === 0}
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-[var(--brand-from)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-from)]/20 disabled:opacity-60"
                >
                  {modelsForBrand.length === 0 ? (
                    <option value="">Sin modelos (configurá en el panel)</option>
                  ) : (
                    modelsForBrand.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))
                  )}
                </select>
              </label>
            </section>

            <label className="mt-6 block">
              <span className="text-sm font-semibold text-neutral-900">{config.problemLabel}</span>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={5}
                placeholder={config.problemPlaceholder}
                className="mt-2 w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--brand-from)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-from)]/20"
              />
            </label>

            <section className="mt-8">
              <h2 className="text-sm font-semibold text-neutral-900">Prioridad de reparación</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {config.priorities.map((p) => {
                  const active = priorityId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriorityId(p.id)}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                        active
                          ? "border-[var(--brand-from)] bg-[var(--brand-from)]/8 font-semibold text-neutral-900 ring-1 ring-[var(--brand-from)]/40"
                          : "border-[var(--border)] bg-white text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <span className="block font-display text-[15px]">{p.label}</span>
                      <span className="mt-1 block text-xs text-neutral-500">{p.description}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-semibold text-neutral-900">{config.fileUploadTitle}</h2>
              <p className="mt-1 text-xs text-neutral-500">{config.fileUploadHint}</p>
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-white px-6 py-10 text-center transition hover:border-[var(--brand-from)]/40 hover:bg-neutral-50/80">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={onFilesChange}
                />
                <span className="text-3xl" aria-hidden>
                  📎
                </span>
                <span className="mt-2 text-sm font-medium text-neutral-700">
                  Tocá para elegir fotos
                </span>
                <span className="mt-1 text-xs text-neutral-500">
                  Los archivos no se suben al sitio; se listan en el mensaje de WhatsApp.
                </span>
                {fileNames.length > 0 ? (
                  <span className="mt-3 max-w-full truncate text-xs text-neutral-600">
                    {fileNames.join(", ")}
                  </span>
                ) : null}
              </label>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-semibold text-neutral-900">Tipo de entrega</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {config.deliveryOptions.map((d) => {
                  const active = deliveryId === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDeliveryId(d.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-[var(--brand-from)] bg-[var(--brand-from)]/5 ring-2 ring-[var(--brand-from)]/25"
                          : "border-[var(--border)] bg-white hover:border-neutral-300"
                      }`}
                    >
                      <span className="font-display font-semibold text-neutral-900">{d.title}</span>
                      <p className="mt-1 text-sm text-neutral-600">{d.description}</p>
                      {d.addressLine ? (
                        <p className="mt-2 text-xs text-neutral-500">{d.addressLine}</p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-neutral-900">
                  {config.contactNameLabel}
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-[var(--brand-from)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-from)]/20"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-neutral-900">
                  {config.contactPhoneLabel}
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-[var(--brand-from)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-from)]/20"
                />
              </label>
              {config.showEmailField ? (
                <label className="block">
                  <span className="text-sm font-semibold text-neutral-900">
                    {config.contactEmailLabel ?? "Email"}
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-[var(--brand-from)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-from)]/20"
                  />
                </label>
              ) : null}
            </section>

            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 text-sm font-semibold text-white shadow-lg transition hover:bg-[#20bd5a] sm:text-base"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {config.ctaButtonLabel}
              </a>
            ) : (
              <p className="mt-10 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
                Configurá{" "}
                <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">
                  NEXT_PUBLIC_WHATSAPP_NUMBER
                </code>{" "}
                para enviar la solicitud.
              </p>
            )}
          </div>

          <aside className="w-full shrink-0 space-y-6 lg:sticky lg:top-24 lg:max-w-sm">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-white shadow-lg">
              <h2 className="font-display text-lg font-bold">{config.sidebarDiagnosis.title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/90">
                {config.sidebarDiagnosis.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden>✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <h2 className="font-display text-sm font-semibold text-neutral-900">
                {config.sidebarTimes.title}
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                {config.sidebarTimes.items.map((it, i) => (
                  <li key={i} className="flex justify-between gap-4 border-b border-neutral-100 border-dashed pb-2 last:border-0">
                    <span>{it.label}</span>
                    <span className="font-medium text-neutral-900">{it.time}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <h2 className="font-display text-sm font-semibold text-neutral-900">
                {config.sidebarContact.title}
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                <a href={`tel:${config.sidebarContact.phone.replace(/\s/g, "")}`} className="text-[var(--brand-from)] hover:underline">
                  {config.sidebarContact.phone}
                </a>
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                <a href={`mailto:${config.sidebarContact.email}`} className="text-[var(--brand-from)] hover:underline">
                  {config.sidebarContact.email}
                </a>
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-16 border-t border-[var(--border)] pt-14">
          <h2 className="text-center font-display text-2xl font-bold text-neutral-900">
            {config.featuresSection.title}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {config.featuresSection.items.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--border)] bg-white p-5 text-center shadow-sm"
              >
                <span className="text-3xl">{item.iconEmoji}</span>
                <h3 className="mt-3 font-display text-sm font-semibold text-neutral-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 border-t border-[var(--border)] pt-14">
          <h2 className="text-center font-display text-2xl font-bold text-neutral-900">
            {config.howItWorks.title}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {config.howItWorks.steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-from)]/15 text-sm font-bold text-[var(--brand-from)]">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-display text-sm font-semibold text-neutral-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 border-t border-[var(--border)] pt-14">
          <h2 className="text-center font-display text-2xl font-bold text-neutral-900">
            {config.testimonials.sectionTitle}
          </h2>
          {config.testimonials.sectionSubtitle ? (
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-neutral-600">
              {config.testimonials.sectionSubtitle}
            </p>
          ) : null}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {config.testimonials.items.map((t, i) => (
              <blockquote
                key={i}
                className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm"
              >
                <div className="flex gap-0.5 text-amber-400" aria-hidden>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-700">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 text-sm">
                  <span className="font-semibold text-neutral-900">{t.name}</span>
                  <span className="text-neutral-500"> · {t.location}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

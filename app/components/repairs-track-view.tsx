"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useFloatingContact } from "@/app/context/floating-contact-context";
import { repairWhatsAppHref } from "@/lib/repair-whatsapp";
import {
  repairStatusBadgeClass,
  repairStatusMessageCardClass,
  repairStatusPublicLabelClass,
  repairStatusPublicPanelClass,
} from "@/lib/repair-status-ui";
import {
  REPAIR_STATUS_LABELS,
  type RepairStatus,
} from "@/lib/repairs-types";

type TrackOk = {
  status: RepairStatus;
  estimated_ready_at: string | null;
  description: string;
  updated_at: string;
  messages: { id: string; body: string; created_at: string }[];
};

const AR_TZ = "America/Argentina/Buenos_Aires";

function partsInAr(iso: string, withTime: boolean) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: AR_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(withTime
      ? { hour: "2-digit" as const, minute: "2-digit" as const, hour12: false }
      : {}),
  }).formatToParts(d);
}

function pickPart(parts: Intl.DateTimeFormatPart[], t: Intl.DateTimeFormatPartTypes) {
  return parts.find((p) => p.type === t)?.value ?? "";
}

/** Igual en SSR y cliente (sin .format es-AR → evita mismatch Node vs Chrome). */
function formatEsDateTime(iso: string): string {
  try {
    const parts = partsInAr(iso, true);
    const y = pickPart(parts, "year");
    const m = pickPart(parts, "month");
    const day = pickPart(parts, "day");
    const h = pickPart(parts, "hour");
    const min = pickPart(parts, "minute");
    if (!y || !m || !day) return iso;
    return `${day}/${m}/${y}, ${h || "00"}:${min || "00"}`;
  } catch {
    return iso;
  }
}

function formatEsDate(iso: string): string {
  try {
    const parts = partsInAr(iso, false);
    const y = pickPart(parts, "year");
    const m = pickPart(parts, "month");
    const day = pickPart(parts, "day");
    if (!y || !m || !day) return iso;
    return `${day}/${m}/${y}`;
  } catch {
    return iso;
  }
}

export function RepairsTrackView({ variant = "page" }: { variant?: "page" | "section" }) {
  const { phoneDigits, servicioTecnicoMessage } = useFloatingContact();
  const isSection = variant === "section";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackOk | null>(null);
  const [invalidAttempt, setInvalidAttempt] = useState(false);

  const waHref = useMemo(() => {
    return repairWhatsAppHref(servicioTecnicoMessage, phoneDigits);
  }, [servicioTecnicoMessage, phoneDigits]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInvalidAttempt(false);
    setResult(null);
    const trimmed = code.trim();
    if (trimmed.length < 6) {
      setInvalidAttempt(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reparaciones/seguimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      if (res.ok) {
        const body = (await res.json()) as { ok: true; data: TrackOk };
        const d = body.data;
        setResult({
          ...d,
          messages: Array.isArray(d.messages) ? d.messages : [],
        });
        setInvalidAttempt(false);
      } else {
        setResult(null);
        setInvalidAttempt(true);
      }
    } catch {
      setResult(null);
      setInvalidAttempt(true);
    } finally {
      setLoading(false);
    }
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
            <span className="font-medium text-neutral-700">Seguimiento</span>
          </nav>
        ) : null}

        <div className={isSection ? "grid gap-10 lg:grid-cols-2 lg:gap-12" : "mt-8 grid gap-10 lg:grid-cols-2 lg:gap-12"}>
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-8">
            <span className="inline-flex rounded-full bg-[var(--brand-from)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-from)]">
              Cómo funciona
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Reparaciones y trámite
            </h1>
            <ol className="mt-5 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-neutral-600">
              <li>
                Si todavía no coordinaste el ingreso o el presupuesto, escribinos por WhatsApp: lo
                vemos rápido y sin vueltas.
              </li>
              <li>
                Cuando damos de alta tu caso, te enviamos un{" "}
                <strong className="font-semibold text-neutral-800">código de seguimiento</strong> por
                correo.
              </li>
              <li>
                En el panel de la derecha podés ver el{" "}
                <strong className="font-semibold text-neutral-800">estado</strong> y la{" "}
                <strong className="font-semibold text-neutral-800">fecha estimada</strong> cuando esté
                cargada.
              </li>
            </ol>
            <p className="mt-5 text-sm text-neutral-500">
              Presupuesto, pagos y detalle del trámite siguen por WhatsApp; acá el foco es el estado del
              taller.
            </p>
            <div className="mt-6">
              {waHref ? (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#25D366] px-6 text-sm font-semibold text-white shadow-md transition hover:bg-[#20bd5a]"
                >
                  Abrir WhatsApp
                </a>
              ) : (
                <p className="text-sm text-amber-800">
                  Configurá el número en <span className="font-semibold">Contenido → Botones flotantes</span> o{" "}
                  <code className="rounded bg-neutral-100 px-1">NEXT_PUBLIC_WHATSAPP_NUMBER</code>.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-xl font-bold text-neutral-900">Código de seguimiento</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Ingresá el código que te enviamos por correo (letras y números, sin espacios).
            </p>
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <label className="block">
                <span className="sr-only">Código de seguimiento</span>
                <input
                  type="text"
                  name="code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setInvalidAttempt(false);
                    setResult(null);
                  }}
                  autoComplete="off"
                  placeholder="Ej. A1B2C3D4"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 font-mono text-base uppercase tracking-wider text-neutral-900 outline-none ring-[var(--brand-from)]/25 placeholder:text-neutral-400 placeholder:normal-case placeholder:tracking-normal focus:border-[var(--brand-from)] focus:bg-white focus:ring-2"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60 sm:w-auto"
              >
                {loading ? "Buscando…" : "Ver estado"}
              </button>
            </form>

            {invalidAttempt && !loading ? (
              <div
                className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center"
                role="status"
              >
                <p className="text-sm font-medium text-neutral-700">No encontramos ese código</p>
                <p className="mt-2 text-sm text-neutral-500">
                  Revisá mayúsculas y números, o el email donde te lo enviamos. Si acabás de
                  registrar el equipo, esperá a recibir el correo.
                </p>
              </div>
            ) : null}

            {result ? (
              <div
                className={`mt-6 space-y-4 rounded-xl border p-5 shadow-sm ${repairStatusPublicPanelClass[result.status]}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide ${repairStatusPublicLabelClass[result.status]}`}
                  >
                    Estado actual
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${repairStatusBadgeClass[result.status]}`}
                  >
                    {REPAIR_STATUS_LABELS[result.status]}
                  </span>
                </div>
                <dl className="grid gap-3 text-sm">
                  <div>
                    <dt className="font-medium text-neutral-600">Tiempo estimado</dt>
                    <dd className="mt-0.5 text-neutral-900">
                      {result.estimated_ready_at
                        ? formatEsDate(result.estimated_ready_at)
                        : "Aún sin fecha estimada — consultá por WhatsApp si necesitás urgencia."}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-neutral-600">Última actualización</dt>
                    <dd className="mt-0.5 text-neutral-900">{formatEsDateTime(result.updated_at)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-neutral-600">Detalle registrado</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-neutral-800">{result.description}</dd>
                  </div>
                  {result.messages.length > 0 ? (
                    <div className="border-t border-neutral-200/70 pt-3">
                      <dt className="font-medium text-neutral-600">Actualizaciones del taller</dt>
                      <dd className="mt-2 space-y-3">
                        {result.messages.map((m) => (
                          <div
                            key={m.id}
                            className={`rounded-lg border px-3 py-2 text-neutral-800 shadow-sm ${repairStatusMessageCardClass[result.status]}`}
                          >
                            <time
                              className="font-mono text-[11px] text-neutral-500"
                              dateTime={m.created_at}
                            >
                              {formatEsDateTime(m.created_at)}
                            </time>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                              {m.body}
                            </p>
                          </div>
                        ))}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

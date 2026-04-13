"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";

import {
  addRepairTrackingMessageAction,
  resendRepairTrackingEmailAction,
  updateRepairDetailsAction,
  updateRepairStatusAction,
} from "@/app/backoffice/(dashboard)/reparaciones/actions";
import { DeleteRepairForm } from "@/app/backoffice/(dashboard)/reparaciones/delete-repair-form";
import type {
  RepairRow,
  RepairStatusHistoryRow,
  RepairTrackingMessageRow,
} from "@/lib/backoffice/repairs-db";
import {
  repairStatusAdminActiveButtonClass,
  repairStatusHistoryBorderClass,
} from "@/lib/repair-status-ui";
import {
  REPAIR_STATUSES,
  REPAIR_STATUS_LABELS,
  type RepairStatus,
} from "@/lib/repairs-types";

/** Valor para `datetime-local` igual en Node y en el navegador (zona AR fija). */
function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const v = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value ?? "";
  const y = v("year");
  const m = v("month");
  const day = v("day");
  const h = v("hour");
  const min = v("minute");
  if (!y || !m || !day) return "";
  return `${y}-${m}-${day}T${h || "00"}:${min || "00"}`;
}

function isoToArDateAndTime(iso: string | null | undefined): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const combined = isoToDatetimeLocal(iso);
  if (!combined.includes("T")) return { date: "", time: "" };
  const [d, rest] = combined.split("T");
  return { date: d ?? "", time: (rest ?? "").slice(0, 5) };
}

/**
 * Fecha/hora en AR sin usar `format()` con locale es-AR: en Node y Chrome el mes sale distinto
 * ("mar" vs "03") y rompe la hidratación. Los armamos desde formatToParts (en-CA + TZ fija).
 */
function formatHistDate(iso: string): string {
  try {
    const d = new Date(iso);
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);
    const v = (t: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === t)?.value ?? "";
    const y = v("year");
    const m = v("month");
    const day = v("day");
    const h = v("hour");
    const min = v("minute");
    if (!y || !m || !day) return iso;
    return `${day}/${m}/${y}, ${h || "00"}:${min || "00"}`;
  } catch {
    return iso;
  }
}

export function RepairDetailEditor({
  repair: initial,
  history: initialHistory,
  messages: initialMessages,
  emailFailedBanner,
}: {
  repair: RepairRow;
  history: RepairStatusHistoryRow[];
  messages: RepairTrackingMessageRow[];
  emailFailedBanner: boolean;
}) {
  const router = useRouter();
  const [repair, setRepair] = useState(initial);
  const [history, setHistory] = useState(initialHistory);
  const [email, setEmail] = useState(initial.email);
  const [estDate, setEstDate] = useState(() => isoToArDateAndTime(initial.estimated_ready_at).date);
  const [estTime, setEstTime] = useState(() => isoToArDateAndTime(initial.estimated_ready_at).time);
  const [status, setStatus] = useState<RepairStatus>(repair.status);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [pendingDetails, startDetailsSave] = useTransition();
  const [pendingResend, startResend] = useTransition();
  const [messages, setMessages] = useState(initialMessages);
  const [messageDraft, setMessageDraft] = useState("");

  useEffect(() => {
    setRepair(initial);
    setHistory(initialHistory);
    setMessages(initialMessages);
    setEmail(initial.email);
    const dt = isoToArDateAndTime(initial.estimated_ready_at);
    setEstDate(dt.date);
    setEstTime(dt.time);
    setStatus(initial.status);
  }, [initial, initialHistory, initialMessages]);

  const contactBaseline = useMemo(() => {
    const dt = isoToArDateAndTime(initial.estimated_ready_at);
    return { email: initial.email, estDate: dt.date, estTime: dt.time };
  }, [initial]);

  const detailsDirty =
    email.trim() !== contactBaseline.email.trim() ||
    estDate !== contactBaseline.estDate ||
    estTime !== contactBaseline.estTime;

  const discardContact = useCallback(() => {
    setErr(null);
    setEmail(contactBaseline.email);
    setEstDate(contactBaseline.estDate);
    setEstTime(contactBaseline.estTime);
  }, [contactBaseline]);

  const saveDetailsAsync = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        setErr(null);
        setMsg(null);
        startDetailsSave(async () => {
          try {
            const fd = new FormData();
            fd.set("id", repair.id);
            fd.set("email", email);
            fd.set("estimated_date", estDate);
            fd.set("estimated_time", estTime);
            await updateRepairDetailsAction(fd);
            setMsg("Datos guardados.");
            router.refresh();
            resolve();
          } catch (e) {
            const m = e instanceof Error ? e.message : "No se pudo guardar";
            setErr(m);
            reject(new Error(m));
          }
        });
      }),
    [repair.id, email, estDate, estTime, router],
  );

  const contactSaveBar = useMemo(() => {
    if (!detailsDirty && !pendingDetails) return null;
    return {
      isDirty: detailsDirty,
      isSaving: pendingDetails,
      error: null,
      onSave: saveDetailsAsync,
      onDiscard: discardContact,
    };
  }, [detailsDirty, pendingDetails, saveDetailsAsync, discardContact]);

  useBackofficeSaveBarReporter(contactSaveBar);

  function applyStatus(next: RepairStatus) {
    setErr(null);
    setMsg(null);
    startTransition(async () => {
      try {
        await updateRepairStatusAction({ id: repair.id, newStatus: next });
        setMsg("Estado actualizado.");
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "No se pudo cambiar el estado");
      }
    });
  }

  function addTrackingMessage() {
    const t = messageDraft.trim();
    if (!t) return;
    setErr(null);
    setMsg(null);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("repair_id", repair.id);
        fd.set("body", t);
        await addRepairTrackingMessageAction(fd);
        setMessageDraft("");
        setMsg("Mensaje publicado en el seguimiento.");
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "No se pudo guardar el mensaje");
      }
    });
  }

  function resendEmail() {
    setErr(null);
    setMsg(null);
    startResend(async () => {
      const fd = new FormData();
      fd.set("id", repair.id);
      const r = await resendRepairTrackingEmailAction(fd);
      if (r.ok) {
        setMsg("Email reenviado.");
        router.refresh();
      } else {
        setErr(r.message);
      }
    });
  }

  return (
    <div className="space-y-8">
      {emailFailedBanner ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
          La reparación se guardó pero <strong>no se pudo enviar el email</strong>. Revisá{" "}
          <code className="rounded bg-black/30 px-1">RESEND_API_KEY</code> y{" "}
          <code className="rounded bg-black/30 px-1">RESEND_FROM_EMAIL</code>, y usá{" "}
          <strong>Reenviar código por email</strong> abajo.
        </div>
      ) : null}

      {err ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {err}
        </div>
      ) : null}
      {msg ? (
        <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100/95">
          {msg}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <h2 className="font-display text-lg font-semibold text-white">Identificación</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">ID interno</dt>
              <dd className="mt-1 font-mono text-xs text-slate-300">{repair.id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Código de seguimiento</dt>
              <dd className="mt-1 font-mono text-lg font-semibold tracking-wider text-white">
                {repair.tracking_code}
              </dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-white/[0.06] pt-6">
            <h3 className="text-sm font-semibold text-white">Descripción</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {repair.description}
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h2 className="font-display text-lg font-semibold text-white">Contacto y plazo</h2>
            <p className="mt-2 text-xs text-slate-500">
              Email y fecha estimada se guardan con <strong className="text-slate-400">Guardar cambios</strong> en la
              barra inferior. Estado del trámite y mensajes al cliente se aplican al instante con sus botones.
            </p>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-xs text-slate-500">Email del cliente</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="mt-1 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
                />
              </label>
              <div className="block">
                <span className="text-xs text-slate-500">Tiempo pendiente estimado (opcional)</span>
                <p className="mt-1 text-xs text-slate-600">
                  Elegí día y hora con los selectores del sistema. Si dejás la hora vacía, se guarda
                  como 12:00 (Argentina). Podés dejar todo vacío para no mostrar fecha al cliente.
                </p>
                <div
                  className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
                  style={{ colorScheme: "dark" }}
                >
                  <label className="block min-w-0 sm:min-w-[11rem]">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Fecha
                    </span>
                    <input
                      type="date"
                      value={estDate}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEstDate(v);
                        if (!v) setEstTime("");
                      }}
                      className="w-full cursor-pointer rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white"
                    />
                  </label>
                  <label className="block min-w-0 sm:min-w-[9rem]">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Hora
                    </span>
                    <input
                      type="time"
                      value={estTime}
                      onChange={(e) => setEstTime(e.target.value)}
                      disabled={!estDate}
                      className="w-full cursor-pointer rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEstDate("");
                      setEstTime("");
                    }}
                    className="rounded-xl border border-white/[0.12] bg-transparent px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:border-red-500/40 hover:text-red-200"
                  >
                    Quitar fecha
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 border-t border-white/[0.06] pt-6">
              <button
                type="button"
                disabled={pendingResend}
                onClick={resendEmail}
                className="text-sm font-medium text-violet-300 hover:text-violet-200 disabled:opacity-50"
              >
                {pendingResend ? "Enviando…" : "Reenviar código por email"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h2 className="font-display text-lg font-semibold text-white">Mensajes en el seguimiento</h2>
            <p className="mt-1 text-xs text-slate-500">
              Lo que escribas acá lo ve el cliente cuando ingresa su código en la web (apartado
              seguimiento).
            </p>
            {messages.length > 0 ? (
              <ul className="mt-4 max-h-48 space-y-3 overflow-y-auto border-t border-white/[0.06] pt-4 text-sm">
                {messages.map((m) => (
                  <li key={m.id} className="rounded-lg bg-black/20 px-3 py-2">
                    <time
                      className="font-mono text-[11px] text-slate-500"
                      dateTime={m.created_at}
                    >
                      {formatHistDate(m.created_at)}
                    </time>
                    <p className="mt-1 whitespace-pre-wrap text-slate-200">{m.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Todavía no hay mensajes para el cliente.</p>
            )}
            <label className="mt-4 block">
              <span className="text-xs text-slate-500">Nuevo mensaje</span>
              <textarea
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
                rows={3}
                placeholder="Ej. Ya tenemos el repuesto, mañana probamos el equipo…"
                className="mt-1 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-600"
              />
            </label>
            <button
              type="button"
              disabled={pending || !messageDraft.trim()}
              onClick={addTrackingMessage}
              className="mt-3 rounded-xl bg-violet-600/90 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-40"
            >
              {pending ? "Publicando…" : "Publicar mensaje"}
            </button>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h2 className="font-display text-lg font-semibold text-white">Estado del taller</h2>
            <p className="mt-1 text-xs text-slate-500">
              Cada cambio queda registrado en el historial y se envía un{" "}
              <strong className="text-slate-400">email al cliente</strong> indicando el estado
              anterior y el nuevo (incluye enlace al seguimiento y, si aplica, aviso de finalizado).
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {REPAIR_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={pending || status === s}
                  onClick={() => applyStatus(s)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    status === s
                      ? repairStatusAdminActiveButtonClass[s]
                      : "bg-white/[0.06] text-slate-200 ring-1 ring-white/10 hover:bg-white/[0.1]"
                  } disabled:opacity-40`}
                >
                  {REPAIR_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Historial de estados</h2>
        {history.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Sin movimientos registrados.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/[0.06]">
            {history.map((h) => (
              <li
                key={h.id}
                className={`flex flex-wrap items-baseline justify-between gap-2 rounded-r-lg py-3 pl-3 text-sm ${repairStatusHistoryBorderClass[h.to_status]}`}
              >
                <span className="text-slate-300">
                  {h.from_status ? (
                    <>
                      <span className="text-slate-500">
                        {REPAIR_STATUS_LABELS[h.from_status]}
                      </span>
                      <span className="mx-2 text-slate-600">→</span>
                    </>
                  ) : (
                    <span className="text-slate-500">Alta · </span>
                  )}
                  <span className="font-medium text-white">{REPAIR_STATUS_LABELS[h.to_status]}</span>
                </span>
                <time className="font-mono text-xs text-slate-500" dateTime={h.changed_at}>
                  {formatHistDate(h.changed_at)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-6">
        <h2 className="font-display text-lg font-semibold text-red-100/95">Zona peligrosa</h2>
        <p className="mt-2 text-sm text-red-200/80">
          Eliminar la reparación borra el caso, el historial de estados y los mensajes visibles en el seguimiento por
          código. El cliente ya no podrá consultar este código.
        </p>
        <div className="mt-4">
          <DeleteRepairForm id={repair.id} trackingCode={repair.tracking_code} />
        </div>
      </section>

      <p>
        <Link href="/backoffice/reparaciones" className="text-sm font-medium text-violet-300 hover:text-violet-200">
          ← Volver al listado
        </Link>
      </p>
    </div>
  );
}

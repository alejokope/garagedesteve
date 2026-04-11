"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";
import {
  boEditorH2,
  boEditorSection,
} from "@/app/components/backoffice/bo-editor-styles";
import {
  defaultSiteContactPayload,
  pickupAreaShortLabel,
  type SiteContactPayload,
  type SiteOffice,
} from "@/lib/site-contact-schema";

import { saveSiteContactAction } from "./actions";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500";
const inputClass =
  "mt-1 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500/40";

function emptyOffice(): SiteOffice {
  return { name: "", address: "" };
}

export function SiteContactEditor({
  initial,
  revision,
}: {
  initial: SiteContactPayload;
  revision: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<SiteContactPayload>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setData(initial);
  }, [revision, initial]);

  const pickupPreview = useMemo(() => pickupAreaShortLabel(data), [data]);

  const isDirty = JSON.stringify(data) !== JSON.stringify(initial);

  const discard = useCallback(() => {
    setErr(null);
    setData(structuredClone(initial));
  }, [initial]);

  const performSave = useCallback(async () => {
    setErr(null);
    setSaving(true);
    try {
      const r = await saveSiteContactAction(data);
      if (!r.ok) {
        setErr(r.error);
        throw new Error(r.error);
      }
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo guardar";
      setErr(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  }, [data, router]);

  const saveBarSnapshot = useMemo(() => {
    if (!isDirty && !saving && !err) return null;
    return {
      isDirty,
      isSaving: saving,
      error: err,
      onSave: performSave,
      onDiscard: discard,
    };
  }, [isDirty, saving, err, performSave, discard]);

  useBackofficeSaveBarReporter(saveBarSnapshot);

  return (
    <div className="min-w-0 space-y-6 pb-28 sm:space-y-8 sm:pb-10 lg:pb-8">
      <p className="rounded-xl border border-violet-500/20 bg-violet-950/20 px-4 py-3 text-sm text-slate-300">
        Estos datos son la <strong className="text-white">fuente única</strong> para el bloque de contacto del footer,
        textos del carrito que mencionan retiro y la página &quot;Vendé tu equipo&quot; (email y teléfono de respaldo).
        Los cambios son borrador hasta que pulses <strong className="text-white">Guardar cambios</strong> en la barra
        inferior.
      </p>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Oficinas / sedes</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Podés sumar varias. El <strong className="text-slate-400">nombre</strong> es opcional (ej. barrio); si lo
          dejás vacío, en textos cortos del sitio se usa un recorte de la dirección.
        </p>
        <p className="mt-2 text-xs text-slate-600">
          Vista previa de texto corto (carrito):{" "}
          <span className="font-medium text-violet-200/90">{pickupPreview}</span>
        </p>
        <div className="mt-4 space-y-6">
          {data.offices.map((office, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 ring-1 ring-white/[0.04]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sede {i + 1}</p>
                {data.offices.length > 1 ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-red-300/90 hover:text-red-200"
                    onClick={() =>
                      setData((d) => ({
                        ...d,
                        offices: d.offices.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    Quitar
                  </button>
                ) : null}
              </div>
              <label className="mt-3 block">
                <span className={labelClass}>Nombre (opcional)</span>
                <input
                  value={office.name ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const offices = [...d.offices];
                      offices[i] = { ...offices[i]!, name: v };
                      return { ...d, offices };
                    });
                  }}
                  placeholder="Ej. Retiro, Microcentro"
                  className={inputClass}
                />
              </label>
              <label className="mt-3 block">
                <span className={labelClass}>Dirección / cómo llegar</span>
                <textarea
                  value={office.address}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const offices = [...d.offices];
                      offices[i] = { ...offices[i]!, address: v };
                      return { ...d, offices };
                    });
                  }}
                  rows={3}
                  className={inputClass}
                />
              </label>
            </div>
          ))}
          <button
            type="button"
            className="text-xs font-medium text-violet-300 hover:text-violet-200"
            onClick={() => setData((d) => ({ ...d, offices: [...d.offices, emptyOffice()] }))}
          >
            + Agregar otra sede
          </button>
        </div>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Teléfono, email y horario</h2>
        <p className="mt-2 text-sm text-slate-500">
          El WhatsApp del sitio sigue en{" "}
          <strong className="text-slate-400">Contenido → Botones flotantes</strong>. Acá va el teléfono que mostramos
          como enlace <code className="text-violet-200/80">tel:</code> en el footer (puede ser el mismo número).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Teléfono</span>
            <input
              value={data.phone}
              onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Email</span>
            <input
              value={data.email}
              onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Horario de atención</span>
            <input
              value={data.hours}
              onChange={(e) => setData((d) => ({ ...d, hours: e.target.value }))}
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Restablecer</h2>
        <p className="mt-2 text-sm text-slate-500">
          Vuelve a los valores por defecto del código (site-config), útil en entornos de prueba.
        </p>
        <button
          type="button"
          className="mt-3 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.1]"
          onClick={() => setData(defaultSiteContactPayload())}
        >
          Cargar defaults del código
        </button>
      </section>

      {err ? (
        <p className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">{err}</p>
      ) : null}
    </div>
  );
}

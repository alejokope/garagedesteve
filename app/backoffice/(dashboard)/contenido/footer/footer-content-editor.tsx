"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";
import {
  boEditorH2,
  boEditorSection,
} from "@/app/components/backoffice/bo-editor-styles";
import {
  defaultFooterContentPayload,
  type FooterContentPayload,
  type FooterSocialIcon,
} from "@/lib/footer-content-schema";

import { saveFooterContentAction } from "./actions";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500";
const inputClass =
  "mt-1 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500/40";

const SOCIAL_ICONS: { value: FooterSocialIcon; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "link", label: "Enlace (Linktree, web)" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X (Twitter)" },
];

const COLUMN_HINTS = [
  "Columna 1 (ej. Compañía)",
  "Columna 2 (ej. Productos)",
  "Columna 3 (bajo «Soporte», primera lista)",
  "Columna 4 (bajo «Soporte», segunda lista)",
];

export function FooterContentEditor({
  initial,
  revision,
}: {
  initial: FooterContentPayload;
  revision: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<FooterContentPayload>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setData(initial);
  }, [revision, initial]);

  const jsonPreview = useMemo(() => JSON.stringify(data, null, 2), [data]);

  const isDirty = JSON.stringify(data) !== JSON.stringify(initial);

  const discard = useCallback(() => {
    setErr(null);
    setData(structuredClone(initial));
  }, [initial]);

  const performSave = useCallback(async () => {
    setErr(null);
    setSaving(true);
    try {
      const r = await saveFooterContentAction(data);
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
        Los cambios son borrador hasta que pulses <strong className="text-white">Guardar cambios</strong> en la barra
        inferior.
      </p>
      {err ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {err}
        </div>
      ) : null}

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Texto principal</h2>
        <label className="mt-4 block">
          <span className={labelClass}>Bajada bajo el nombre de la marca</span>
          <textarea
            value={data.blurb}
            onChange={(e) => setData((d) => ({ ...d, blurb: e.target.value }))}
            rows={3}
            className={inputClass}
          />
        </label>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Bloque sedes (#sedes)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelClass}>Título</span>
            <input
              value={data.sedesTitle}
              onChange={(e) => setData((d) => ({ ...d, sedesTitle: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Texto</span>
            <textarea
              value={data.sedesBody}
              onChange={(e) => setData((d) => ({ ...d, sedesBody: e.target.value }))}
              rows={2}
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Bloque vendé tu equipo (#vende)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Título</span>
            <input
              value={data.vendeTitle}
              onChange={(e) => setData((d) => ({ ...d, vendeTitle: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Texto del enlace</span>
            <input
              value={data.vendeLinkLabel}
              onChange={(e) => setData((d) => ({ ...d, vendeLinkLabel: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>URL del enlace (ruta interna o https://…)</span>
            <input
              value={data.vendeLinkHref}
              onChange={(e) => setData((d) => ({ ...d, vendeLinkHref: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Descripción</span>
            <textarea
              value={data.vendeBody}
              onChange={(e) => setData((d) => ({ ...d, vendeBody: e.target.value }))}
              rows={2}
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Redes sociales</h2>
        <p className="mt-2 text-sm text-slate-400">
          Solo se muestran íconos con URL válida. Podés quitar filas con el botón ×.
        </p>
        <div className="mt-4 space-y-3">
          {data.social.map((s, i) => (
            <div
              key={i}
              className="flex flex-wrap items-end gap-2 rounded-xl border border-white/[0.08] bg-black/25 p-3"
            >
              <label className="min-w-[7rem] flex-1">
                <span className={labelClass}>Etiqueta</span>
                <input
                  value={s.label}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const social = [...d.social];
                      social[i] = { ...social[i]!, label: v };
                      return { ...d, social };
                    });
                  }}
                  className={inputClass}
                />
              </label>
              <label className="min-w-[12rem] flex-[2]">
                <span className={labelClass}>URL</span>
                <input
                  value={s.href}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const social = [...d.social];
                      social[i] = { ...social[i]!, href: v };
                      return { ...d, social };
                    });
                  }}
                  className={inputClass}
                />
              </label>
              <label className="min-w-[8rem]">
                <span className={labelClass}>Ícono</span>
                <select
                  value={s.icon}
                  onChange={(e) => {
                    const v = e.target.value as FooterSocialIcon;
                    setData((d) => {
                      const social = [...d.social];
                      social[i] = { ...social[i]!, icon: v };
                      return { ...d, social };
                    });
                  }}
                  className={inputClass}
                >
                  {SOCIAL_ICONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="mb-0.5 text-sm text-red-300 hover:text-red-200"
                onClick={() =>
                  setData((d) => ({ ...d, social: d.social.filter((_, j) => j !== i) }))
                }
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm text-violet-300 hover:text-violet-200"
            onClick={() =>
              setData((d) => ({
                ...d,
                social: [
                  ...d.social,
                  { label: "Nuevo", href: "https://", icon: "link" as FooterSocialIcon },
                ],
              }))
            }
          >
            + Red
          </button>
        </div>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Columnas de enlaces</h2>
        <p className="mt-2 text-sm text-slate-400">
          Son exactamente cuatro: las dos primeras son columnas propias; la 3 y 4 se muestran juntas bajo el
          título «Soporte» (dos listas seguidas).
        </p>
        {data.columns.map((col, ci) => (
          <div
            key={ci}
            className="mt-6 rounded-2xl border border-white/[0.06] bg-black/20 p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {COLUMN_HINTS[ci]}
            </p>
            <label className="mt-2 block">
              <span className={labelClass}>Título de la columna</span>
              <input
                value={col.title}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const columns = [...d.columns];
                    columns[ci] = { ...columns[ci]!, title: v };
                    return { ...d, columns };
                  });
                }}
                className={inputClass}
              />
            </label>
            <p className="mt-4 text-sm font-medium text-slate-300">Enlaces</p>
            <div className="mt-2 space-y-2">
              {col.links.map((link, li) => (
                <div key={li} className="flex flex-wrap gap-2">
                  <input
                    placeholder="Texto"
                    value={link.label}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) => {
                        const columns = [...d.columns];
                        const links = [...columns[ci]!.links];
                        links[li] = { ...links[li]!, label: v };
                        columns[ci] = { ...columns[ci]!, links };
                        return { ...d, columns };
                      });
                    }}
                    className={`${inputClass} min-w-[8rem] flex-1`}
                  />
                  <input
                    placeholder="/ruta o URL"
                    value={link.href}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) => {
                        const columns = [...d.columns];
                        const links = [...columns[ci]!.links];
                        links[li] = { ...links[li]!, href: v };
                        columns[ci] = { ...columns[ci]!, links };
                        return { ...d, columns };
                      });
                    }}
                    className={`${inputClass} min-w-[10rem] flex-[2]`}
                  />
                  <button
                    type="button"
                    className="text-xs text-red-400"
                    onClick={() =>
                      setData((d) => {
                        const columns = [...d.columns];
                        columns[ci] = {
                          ...columns[ci]!,
                          links: columns[ci]!.links.filter((_, j) => j !== li),
                        };
                        return { ...d, columns };
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
                    const columns = [...d.columns];
                    columns[ci] = {
                      ...columns[ci]!,
                      links: [...columns[ci]!.links, { label: "", href: "/" }],
                    };
                    return { ...d, columns };
                  })
                }
              >
                + Enlace
              </button>
            </div>
          </div>
        ))}
        <label className="mt-6 block max-w-md">
          <span className={labelClass}>Título de la sección que agrupa columna 3 y 4</span>
          <input
            value={data.supportColumnTitle}
            onChange={(e) => setData((d) => ({ ...d, supportColumnTitle: e.target.value }))}
            className={inputClass}
          />
        </label>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Contacto en el pie</h2>
        <p className="mt-2 text-sm text-slate-500">
          Dirección, teléfono, email y horarios se editan en{" "}
          <Link href="/backoffice/contenido/contacto" className="font-medium text-violet-300 hover:text-violet-200">
            Contenido → Datos de contacto
          </Link>{" "}
          (fuente única para el sitio público).
        </p>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Enlaces legales (pie mínimo)</h2>
        <div className="mt-4 space-y-2">
          {data.legalLinks.map((link, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <input
                value={link.label}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const legalLinks = [...d.legalLinks];
                    legalLinks[i] = { ...legalLinks[i]!, label: v };
                    return { ...d, legalLinks };
                  });
                }}
                className={`${inputClass} min-w-[6rem] flex-1`}
              />
              <input
                value={link.href}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const legalLinks = [...d.legalLinks];
                    legalLinks[i] = { ...legalLinks[i]!, href: v };
                    return { ...d, legalLinks };
                  });
                }}
                className={`${inputClass} min-w-[8rem] flex-[2]`}
              />
              <button
                type="button"
                className="text-xs text-red-400"
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    legalLinks: d.legalLinks.filter((_, j) => j !== i),
                  }))
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
              setData((d) => ({
                ...d,
                legalLinks: [...d.legalLinks, { label: "", href: "/#faq" }],
              }))
            }
          >
            + Enlace
          </button>
        </div>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>JSON (solo lectura)</h2>
        <p className="mt-2 text-xs text-slate-500">
          Cargá la plantilla del código en el editor (borrador local hasta que guardes).
        </p>
        <button
          type="button"
          className="mt-3 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
          onClick={() => {
            setData(defaultFooterContentPayload());
            setErr(null);
          }}
        >
          Cargar plantilla por defecto
        </button>
        <pre className="mt-3 max-h-48 overflow-auto rounded-xl border border-white/[0.06] bg-black/55 p-3 text-[10px] text-slate-400 sm:text-[11px]">
          {jsonPreview}
        </pre>
      </section>
    </div>
  );
}

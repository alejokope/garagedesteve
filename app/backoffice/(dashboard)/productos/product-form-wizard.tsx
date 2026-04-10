"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";

export type ProductWizardStepMeta = {
  id: string;
  label: string;
  title: string;
  hint: string;
  optional?: boolean;
};

const CREATE_STEPS: ProductWizardStepMeta[] = [
  {
    id: "intro",
    label: "Inicio",
    title: "Crear producto con el asistente",
    hint: "Te guiamos paso a paso. Volvé atrás cuando quieras. Al final guardás una sola vez con todos los datos.",
  },
  {
    id: "identity",
    label: "Nombre",
    title: "¿Cómo se llama?",
    hint: "ID para la URL, nombre visible y resumen del catálogo.",
  },
  {
    id: "store",
    label: "Tienda",
    title: "¿Dónde se muestra y a qué precio?",
    hint: "Categoría del catálogo y precio en USD. Condición, orden y si está publicado.",
  },
  {
    id: "image",
    label: "Foto",
    title: "Imagen principal",
    hint: "Subí archivo y describí la imagen. El ID del paso 1 tiene que estar listo.",
  },
  {
    id: "promo",
    label: "Oferta",
    title: "¿Hay promoción?",
    hint: "Opcional: precio tachado y % en la grilla.",
    optional: true,
  },
  {
    id: "variants",
    label: "Variantes",
    title: "¿Color, memoria u otras opciones?",
    hint: "Solo si cambia el precio. Un solo precio → saltá.",
    optional: true,
  },
  {
    id: "detail",
    label: "Texto",
    title: "Ficha y relacionados",
    hint: "Filas etiqueta + valor en la ficha, garantía y productos sugeridos. Opcional.",
    optional: true,
  },
  {
    id: "review",
    label: "Listo",
    title: "Revisá y publicá",
    hint: "Última mirada antes de guardar.",
  },
];

export function getCreateWizardSteps(): ProductWizardStepMeta[] {
  return CREATE_STEPS;
}

export function validateCreateWizardStep(
  stepIndex: number,
  form: HTMLFormElement,
): string | null {
  const fd = new FormData(form);
  switch (stepIndex) {
    case 0:
      return null;
    case 1: {
      const id = String(fd.get("id") ?? "").trim();
      const name = String(fd.get("name") ?? "").trim();
      const short = String(fd.get("short") ?? "").trim();
      if (!id) return "Completá el identificador del producto (sin espacios).";
      if (!name) return "Completá el nombre en la tienda.";
      if (!short) return "Completá el resumen del listado.";
      return null;
    }
    case 2: {
      const cat = String(fd.get("category") ?? "").trim();
      const priceRaw = String(fd.get("price") ?? "").replace(/\s/g, "").replace(",", ".");
      const price = Number(priceRaw);
      if (!cat) return "Elegí una categoría.";
      if (Number.isNaN(price) || price < 0) return "Ingresá un precio base válido (USD).";
      return null;
    }
    case 3: {
      const alt = String(fd.get("image_alt") ?? "").trim();
      if (!alt) return "Completá el texto alternativo de la imagen.";
      const fileInput = form.querySelector<HTMLInputElement>('input[name="image_file"]');
      const hasFile = !!fileInput?.files?.length;
      const existing = String(fd.get("image") ?? "").trim();
      if (!hasFile && !existing) return "Subí una imagen principal (archivo).";
      return null;
    }
    default:
      return null;
  }
}

function ProductWizardReview({ formId }: { formId: string }) {
  const [tick, setTick] = useState(0);
  const lines = useMemo(() => {
    const form = typeof document !== "undefined" ? (document.getElementById(formId) as HTMLFormElement | null) : null;
    if (!form) return [];
    const fd = new FormData(form);
    const id = String(fd.get("id") ?? "").trim();
    const name = String(fd.get("name") ?? "").trim();
    const short = String(fd.get("short") ?? "").trim();
    const brand = String(fd.get("brand") ?? "").trim();
    const category = String(fd.get("category") ?? "").trim();
    const price = String(fd.get("price") ?? "").trim();
    const published = fd.get("published") === "on" ? "Sí" : "No";
    const alt = String(fd.get("image_alt") ?? "").trim();
    const fileInput = form.querySelector<HTMLInputElement>('input[name="image_file"]');
    const hasNewImage = !!fileInput?.files?.length;
    const imgNote = hasNewImage ? "Nueva imagen lista para subir" : String(fd.get("image") ?? "").trim() ? "Imagen existente" : "—";

    return [
      { k: "ID / URL", v: id || "—" },
      { k: "Nombre", v: name || "—" },
      { k: "Resumen", v: short ? (short.length > 90 ? `${short.slice(0, 90)}…` : short) : "—" },
      { k: "Marca", v: brand || "—" },
      { k: "Categoría", v: category || "—" },
      { k: "Precio base (USD)", v: price || "—" },
      { k: "Visible", v: published },
      { k: "Imagen", v: imgNote },
      { k: "Texto alt", v: alt ? (alt.length > 70 ? `${alt.slice(0, 70)}…` : alt) : "—" },
    ];
  }, [formId, tick]);

  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-emerald-100/95">Resumen</p>
        <button
          type="button"
          onClick={() => setTick((t) => t + 1)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-white/10"
        >
          Actualizar vista
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Variantes y texto extra se incluyen si los cargaste. El servidor valida categoría e imagen.
      </p>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {lines.map((row) => (
          <div key={row.k} className="rounded-lg bg-black/20 px-3 py-2">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{row.k}</dt>
            <dd className="mt-0.5 font-medium text-slate-100">{row.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ProductFormWizardCreate({
  formId,
  steps,
  stepIndex,
  onStepChange,
  stepBodies,
  pending,
  onPreferClassic,
}: {
  formId: string;
  steps: ProductWizardStepMeta[];
  stepIndex: number;
  onStepChange: (n: number) => void;
  /** Un nodo por paso; todos permanecen en el DOM (ocultos) para el envío del formulario */
  stepBodies: ReactNode[];
  pending: boolean;
  onPreferClassic?: () => void;
}) {
  const meta = steps[stepIndex] ?? steps[0]!;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  const goNext = useCallback(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    const err = validateCreateWizardStep(stepIndex, form);
    if (err) {
      window.alert(err);
      return;
    }
    onStepChange(Math.min(steps.length - 1, stepIndex + 1));
  }, [formId, stepIndex, steps.length, onStepChange]);

  const goBack = useCallback(() => {
    onStepChange(Math.max(0, stepIndex - 1));
  }, [stepIndex, onStepChange]);

  const skipOptional = useCallback(() => {
    onStepChange(Math.min(steps.length - 1, stepIndex + 1));
  }, [stepIndex, steps.length, onStepChange]);

  const jumpTo = useCallback(
    (target: number) => {
      if (target <= stepIndex) {
        onStepChange(target);
        return;
      }
      const form = document.getElementById(formId) as HTMLFormElement | null;
      if (!form) return;
      for (let j = 1; j < target; j++) {
        const e = validateCreateWizardStep(j, form);
        if (e) {
          window.alert(`Antes completá el paso ${j + 1}: ${e}`);
          onStepChange(j);
          return;
        }
      }
      onStepChange(target);
    },
    [formId, stepIndex, onStepChange],
  );

  const pct = useMemo(
    () => Math.round(((stepIndex + 1) / steps.length) * 100),
    [stepIndex, steps.length],
  );

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Asistente · {stepIndex + 1} / {steps.length}
          </p>
          <span className="text-xs font-medium text-violet-300">{pct}%</span>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-black/40"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-4 flex gap-1 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          {steps.map((s, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => jumpTo(i)}
                className={[
                  "flex min-w-[4.5rem] shrink-0 flex-col items-center gap-1 rounded-xl px-2 py-2 text-center transition sm:min-w-[5.5rem]",
                  active
                    ? "bg-violet-600/90 text-white shadow-lg shadow-violet-950/30"
                    : done
                      ? "bg-white/[0.08] text-emerald-200/90 hover:bg-white/[0.12]"
                      : "bg-white/[0.03] text-slate-500 hover:bg-white/[0.06]",
                ].join(" ")}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                  {done ? "✓" : i + 1}
                </span>
                <span className="max-w-[5rem] text-[10px] font-medium leading-tight sm:text-[11px]">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cabecera del paso visible */}
      <div className="bo-wizard-panel rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-8">
        <header className="mb-6 border-b border-white/[0.06] pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300/90">{meta.label}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {meta.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{meta.hint}</p>
          {meta.optional ? (
            <p className="mt-2 inline-flex rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-slate-400">
              Opcional · podés usar Saltar
            </p>
          ) : null}
        </header>

        {/* Cuerpos: todos montados; solo el activo visible */}
        {steps.map((s, i) => (
          <div
            key={s.id}
            hidden={stepIndex !== i}
            className={stepIndex === i ? "space-y-6" : "space-y-6"}
            aria-hidden={stepIndex !== i}
          >
            {stepBodies[i]}
            {s.id === "review" ? (
              <div className="pt-2">
                <ProductWizardReview formId={formId} />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 pt-2 [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-white/[0.12] bg-slate-950/95 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={isFirst || pending}
              className="rounded-xl border border-white/[0.12] bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Atrás
            </button>
            {onPreferClassic ? (
              <button
                type="button"
                onClick={() => {
                  const ok = window.confirm(
                    "¿Pasás a formulario en una página? Si ya cargaste datos en el asistente sin guardar, conviene guardar antes o copiar los textos.",
                  );
                  if (ok) onPreferClassic();
                }}
                className="text-xs text-slate-500 underline decoration-slate-600 underline-offset-2 hover:text-slate-300"
              >
                Modo página única
              </button>
            ) : null}
          </div>
          <div className="flex flex-1 flex-wrap justify-end gap-2">
            {!isFirst && !isLast && meta.optional ? (
              <button
                type="button"
                onClick={skipOptional}
                disabled={pending}
                className="rounded-xl border border-dashed border-white/20 px-4 py-2.5 text-sm font-medium text-slate-400 hover:border-white/30 hover:text-slate-200"
              >
                Saltar
              </button>
            ) : null}
            {!isLast ? (
              <button
                type="button"
                onClick={goNext}
                disabled={pending}
                className="min-w-[140px] rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 disabled:opacity-60"
              >
                {stepIndex === 0 ? "Comenzar" : "Continuar"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={pending}
                className="min-w-[180px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 disabled:opacity-60"
              >
                {pending ? "Guardando…" : "Guardar producto"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

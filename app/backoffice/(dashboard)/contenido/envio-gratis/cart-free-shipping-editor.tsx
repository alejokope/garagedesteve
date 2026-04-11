"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";
import { boEditorH2, boEditorSection } from "@/app/components/backoffice/bo-editor-styles";
import {
  CART_FREE_SHIPPING_CONTENT_KEY,
  defaultCartFreeShippingPayload,
  type CartFreeShippingPayload,
} from "@/lib/cart-free-shipping-content-schema";

import { saveCartFreeShippingAction } from "./actions";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500";
const inputClass =
  "mt-1 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500/40";

export function CartFreeShippingEditor({
  initial,
  revision,
}: {
  initial: CartFreeShippingPayload;
  revision: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<CartFreeShippingPayload>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setData(initial);
  }, [revision, initial]);

  const isDirty = JSON.stringify(data) !== JSON.stringify(initial);

  const discard = useCallback(() => {
    setErr(null);
    setData(structuredClone(initial));
  }, [initial]);

  const performSave = useCallback(async () => {
    setErr(null);
    setSaving(true);
    try {
      const r = await saveCartFreeShippingAction(data);
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
    <div className="min-w-0 space-y-8 pb-28 sm:pb-10 lg:pb-8">
      <p className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-4 py-3 text-sm text-slate-300">
        Solo afecta textos y avisos de <strong className="text-white">envío gratis</strong> en la página del carrito.
        El cierre real sigue por WhatsApp. Clave:{" "}
        <code className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs text-emerald-200/90">
          {CART_FREE_SHIPPING_CONTENT_KEY}
        </code>
        .{" "}
        <Link href="/backoffice/contenido/contacto-flotante" className="text-emerald-200/90 hover:text-emerald-100">
          Plantillas de WhatsApp
        </Link>{" "}
        están en contacto rápido.
      </p>
      {err ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {err}
        </div>
      ) : null}

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Promo en el carrito</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          Controla el encabezado, el bloque bajo la lista, la fila «Envío» del resumen y la barra fija móvil. Si lo
          desactivás, el envío queda en «A coordinar» en todos esos lugares.
        </p>
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 size-4 shrink-0 rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-500/40"
            checked={data.enabled}
            onChange={(e) => setData((d) => ({ ...d, enabled: e.target.checked }))}
          />
          <span>
            <span className="font-medium text-white">Ofrecer envío gratis según umbral</span>
            <span className="mt-1 block text-xs text-slate-500">
              Mostrar progreso «te faltan X» y marcar envío en verde al alcanzar el mínimo.
            </span>
          </span>
        </label>
        <label className="mt-5 block max-w-md">
          <span className={labelClass}>Subtotal mínimo (USD, orientativo)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={1}
            disabled={!data.enabled}
            value={data.minUsd}
            onChange={(e) => {
              const raw = e.target.value;
              const n = parseFloat(raw);
              setData((d) => ({
                ...d,
                minUsd: Number.isFinite(n) ? Math.min(999_999, Math.max(0, n)) : d.minUsd,
              }));
            }}
            className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-45`}
          />
          <span className="mt-2 block text-xs text-slate-500">
            Ej. <strong className="font-medium text-slate-400">800</strong> = gratis desde US$ 800. Con{" "}
            <strong className="font-medium text-slate-400">0</strong> = gratis en cuanto hay total en USD (si aplica).
          </span>
        </label>
        <button
          type="button"
          className="mt-6 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.1]"
          onClick={() => setData(defaultCartFreeShippingPayload())}
        >
          Restaurar valores por defecto
        </button>
      </section>
    </div>
  );
}

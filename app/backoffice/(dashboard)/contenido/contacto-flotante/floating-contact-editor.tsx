"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";
import {
  boEditorH2,
  boEditorSection,
} from "@/app/components/backoffice/bo-editor-styles";
import {
  buildCartNotaBlock,
  buildCartPedidoBlock,
} from "@/lib/whatsapp";
import {
  DEFAULT_CART_MESSAGE_TEMPLATE,
  DEFAULT_FAB_MESSAGE_TEMPLATE,
  FLOATING_CONTACT_KEY,
  type FloatingContactPayload,
} from "@/lib/floating-contact-schema";
import {
  buildFabTemplateVars,
  computeFloatingContactPublic,
  interpolateFabTemplate,
  interpolateRichTemplate,
} from "@/lib/floating-contact-resolve";
import type { CartItem } from "@/lib/types";
import { saveFloatingContactAction } from "./actions";

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500";
const inputClass =
  "mt-1 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500/40";

const VARIABLES: { token: string; title: string; hint: string }[] = [
  { token: "{{marca}}", title: "Marca", hint: "Nombre para saludar (también usa el sitio en carrito y más)." },
  {
    token: "{{sitio}}",
    title: "Sitio",
    hint: "URL del sitio: NEXT_PUBLIC_SITE_URL en entorno, o el dominio en site-config (elgaragedesteve.com).",
  },
  { token: "{{instagram}}", title: "Instagram", hint: "URL del perfil configurada arriba (o la del sitio)." },
  { token: "{{linktree}}", title: "Linktree", hint: "Enlace oficial del sitio en código." },
  { token: "{{año}}", title: "Año", hint: "Año actual (automático)." },
];

const CART_ONLY_VARIABLES: { token: string; title: string; hint: string }[] = [
  {
    token: "{{pedido}}",
    title: "Pedido",
    hint: "Ítems numerados, cantidades, subtotales y línea de total (generado automáticamente).",
  },
  {
    token: "{{nota}}",
    title: "Nota",
    hint: "Texto que el cliente escribe en el carrito; vacío si no escribió nada.",
  },
];

/** Muestra de carrito solo para vista previa en el panel. */
const CART_PREVIEW_ITEMS: CartItem[] = [
  {
    lineKey: "preview-1",
    product: {
      id: "preview-iphone",
      name: "iPhone 15 128GB",
      short: "Preview",
      category: "iphone",
      price: 950,
      image: "/placeholder",
      imageAlt: "",
      variantGroups: [],
    },
    qty: 1,
  },
];

export function FloatingContactEditor({
  initial,
  revision,
}: {
  initial: FloatingContactPayload;
  revision: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<FloatingContactPayload>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setData(initial);
  }, [revision, initial]);

  const previewPublic = useMemo(() => computeFloatingContactPublic(data), [data]);
  const previewMessage = useMemo(() => {
    const vars = buildFabTemplateVars(data);
    return interpolateFabTemplate(data.fabMessageTemplate, vars);
  }, [data]);

  const previewCartMessage = useMemo(() => {
    const vars = buildFabTemplateVars(data);
    const pedido = buildCartPedidoBlock(CART_PREVIEW_ITEMS, 950);
    const nota = buildCartNotaBlock("Retiro viernes por la tarde");
    return interpolateRichTemplate(data.cartMessageTemplate, { ...vars, pedido, nota });
  }, [data]);

  const isDirty = JSON.stringify(data) !== JSON.stringify(initial);

  const discard = useCallback(() => {
    setErr(null);
    setData(structuredClone(initial));
  }, [initial]);

  const insertFabToken = useCallback((token: string) => {
    setData((d) => ({
      ...d,
      fabMessageTemplate: `${d.fabMessageTemplate}${token}`,
    }));
  }, []);

  const insertCartToken = useCallback((token: string) => {
    setData((d) => ({
      ...d,
      cartMessageTemplate: `${d.cartMessageTemplate}${token}`,
    }));
  }, []);

  const performSave = useCallback(async () => {
    setErr(null);
    setSaving(true);
    try {
      const r = await saveFloatingContactAction(data);
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
      <p className="rounded-xl border border-violet-500/20 bg-violet-950/20 px-4 py-3 text-sm text-slate-300">
        Botón flotante, carrito y número en un solo lugar. Guardá con la barra inferior. Clave:{" "}
        <code className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs text-violet-200/90">
          {FLOATING_CONTACT_KEY}
        </code>
      </p>
      {err ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {err}
        </div>
      ) : null}

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>Instagram</h2>
        <label className="mt-4 block">
          <span className={labelClass}>URL del perfil</span>
          <input
            value={data.instagramUrl}
            onChange={(e) => setData((d) => ({ ...d, instagramUrl: e.target.value }))}
            placeholder="https://www.instagram.com/tu_perfil/"
            className={inputClass}
          />
          <span className="mt-2 block text-xs text-slate-500">
            Podés pegar solo <code className="text-violet-300/90">instagram.com/…</code>; se agrega https si falta.
          </span>
        </label>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 size-4 shrink-0 rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-500/40"
            checked={data.showInstagramFab}
            onChange={(e) => setData((d) => ({ ...d, showInstagramFab: e.target.checked }))}
          />
          <span>
            <span className="font-medium text-white">Mostrar botón flotante de Instagram</span>
            <span className="mt-1 block text-xs text-slate-500">Queda arriba del de WhatsApp.</span>
          </span>
        </label>
      </section>

      <section className={boEditorSection}>
        <h2 className={boEditorH2}>WhatsApp</h2>
        <label className="mt-4 block">
          <span className={labelClass}>Número (código país sin +)</span>
          <input
            value={data.whatsappPhone}
            onChange={(e) => setData((d) => ({ ...d, whatsappPhone: e.target.value }))}
            placeholder="54911…"
            inputMode="tel"
            autoComplete="tel"
            className={inputClass}
          />
          <span className="mt-2 block text-xs text-slate-500">
            Se guarda solo con dígitos. Si lo dejás vacío, el sitio intenta usar{" "}
            <code className="text-violet-300/90">NEXT_PUBLIC_WHATSAPP_NUMBER</code> como respaldo.
          </span>
        </label>
        <label className="mt-4 block">
          <span className={labelClass}>Nombre para mensajes ({"{{marca}}"})</span>
          <input
            value={data.brandName}
            onChange={(e) => setData((d) => ({ ...d, brandName: e.target.value }))}
            placeholder="El Garage de Steve"
            className={inputClass}
          />
          <span className="mt-2 block text-xs text-slate-500">
            También lo usan carrito, fichas de producto y formularios que abren WhatsApp.
          </span>
        </label>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 size-4 shrink-0 rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-500/40"
            checked={data.showWhatsappFab}
            onChange={(e) => setData((d) => ({ ...d, showWhatsappFab: e.target.checked }))}
          />
          <span>
            <span className="font-medium text-white">Mostrar botón flotante de WhatsApp</span>
            <span className="mt-1 block text-xs text-slate-500">
              El saludo rápido usa la plantilla «flotante»; el carrito tiene su propia plantilla más abajo.
            </span>
          </span>
        </label>
      </section>

      <section
        className={`${boEditorSection} relative overflow-hidden border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/30 via-violet-950/20 to-transparent ring-1 ring-fuchsia-500/15`}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
        <h2 className={`${boEditorH2} relative`}>Mensaje del botón flotante</h2>
        <p className="relative mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          Armá el texto que se abre en WhatsApp al tocar el globo verde. Usá variables para que el saludo y los enlaces
          queden prolijos sin reescribir cada año.
        </p>

        <div className="relative mt-6">
          <p className={labelClass}>Variables — tocá para agregar al final del mensaje</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {VARIABLES.map((v) => (
              <button
                key={v.token}
                type="button"
                onClick={() => insertFabToken(v.token)}
                className="group rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-left text-xs font-medium text-slate-200 ring-1 ring-white/5 transition hover:border-fuchsia-400/35 hover:bg-fuchsia-500/10 hover:text-white"
                title={v.hint}
              >
                <span className="font-mono text-[11px] text-fuchsia-200/90">{v.token}</span>
                <span className="ml-2 text-slate-500 group-hover:text-slate-300">{v.title}</span>
              </button>
            ))}
          </div>
        </div>

        <label className="relative mt-6 block">
          <span className={labelClass}>Plantilla</span>
          <textarea
            value={data.fabMessageTemplate}
            onChange={(e) => setData((d) => ({ ...d, fabMessageTemplate: e.target.value }))}
            rows={12}
            className={`${inputClass} font-mono text-[13px] leading-relaxed`}
          />
        </label>
        <div className="relative mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setData((d) => ({ ...d, fabMessageTemplate: DEFAULT_FAB_MESSAGE_TEMPLATE }))
            }
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10"
          >
            Restaurar ejemplo por defecto
          </button>
        </div>

        <div className="relative mt-8 rounded-2xl border border-white/[0.08] bg-black/25 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Vista previa del mensaje</p>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black/40 p-4 text-[13px] leading-relaxed text-slate-200 ring-1 ring-white/5">
            {previewMessage}
          </pre>
          <p className="mt-3 text-xs text-slate-500">
            Enlace resultante (botón verde):{" "}
            {previewPublic.whatsappFabHref ? (
              <span className="break-all text-emerald-300/90">wa.me con texto codificado</span>
            ) : (
              <span className="text-amber-200/90">falta número válido o el botón está oculto</span>
            )}
          </p>
        </div>
      </section>

      <section
        className={`${boEditorSection} relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-950/25 via-teal-950/15 to-transparent ring-1 ring-emerald-500/15`}
      >
        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <h2 className={`${boEditorH2} relative`}>Mensaje del carrito (Finalizar por WhatsApp)</h2>
        <p className="relative mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          Es <strong className="font-medium text-slate-300">independiente</strong> del botón flotante: acá definís cómo se
          arma el mensaje cuando alguien tiene productos en el carrito y toca finalizar. Incluí{" "}
          <code className="rounded bg-white/10 px-1 font-mono text-[11px] text-emerald-200/90">{"{{pedido}}"}</code>{" "}
          para insertar el listado y totales;{" "}
          <code className="rounded bg-white/10 px-1 font-mono text-[11px] text-emerald-200/90">{"{{nota}}"}</code> para
          lo que escriban en «Preferencias / consultas».
        </p>

        <div className="relative mt-6">
          <p className={labelClass}>Variables del carrito</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[...VARIABLES, ...CART_ONLY_VARIABLES].map((v) => (
              <button
                key={`cart-${v.token}`}
                type="button"
                onClick={() => insertCartToken(v.token)}
                className="group rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-left text-xs font-medium text-slate-200 ring-1 ring-white/5 transition hover:border-emerald-400/35 hover:bg-emerald-500/10 hover:text-white"
                title={v.hint}
              >
                <span className="font-mono text-[11px] text-emerald-200/90">{v.token}</span>
                <span className="ml-2 text-slate-500 group-hover:text-slate-300">{v.title}</span>
              </button>
            ))}
          </div>
        </div>

        <label className="relative mt-6 block">
          <span className={labelClass}>Plantilla del carrito</span>
          <textarea
            value={data.cartMessageTemplate}
            onChange={(e) => setData((d) => ({ ...d, cartMessageTemplate: e.target.value }))}
            rows={16}
            className={`${inputClass} font-mono text-[13px] leading-relaxed`}
          />
        </label>
        <div className="relative mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setData((d) => ({ ...d, cartMessageTemplate: DEFAULT_CART_MESSAGE_TEMPLATE }))
            }
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10"
          >
            Restaurar plantilla por defecto
          </button>
        </div>

        <div className="relative mt-8 rounded-2xl border border-white/[0.08] bg-black/25 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Vista previa (ejemplo: 1 iPhone + nota)
          </p>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black/40 p-4 text-[13px] leading-relaxed text-slate-200 ring-1 ring-white/5">
            {previewCartMessage}
          </pre>
        </div>
      </section>
    </div>
  );
}

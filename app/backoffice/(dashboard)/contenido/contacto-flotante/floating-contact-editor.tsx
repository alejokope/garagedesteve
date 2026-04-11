"use client";

import Link from "next/link";
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
  DEFAULT_SERVICIO_TECNICO_MESSAGE_TEMPLATE,
  FLOATING_CONTACT_KEY,
  type FloatingContactPayload,
} from "@/lib/floating-contact-schema";
import type { CartFreeShippingPayload } from "@/lib/cart-free-shipping-content-schema";
import type { SiteContactPayload } from "@/lib/site-contact-schema";
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
  {
    token: "{{telefono}}",
    title: "Teléfono",
    hint: "Desde Contenido → Datos de contacto (texto que se muestra en el footer).",
  },
  {
    token: "{{email}}",
    title: "Email",
    hint: "Desde Contenido → Datos de contacto.",
  },
  {
    token: "{{horario}}",
    title: "Horario",
    hint: "Horario de atención desde Datos de contacto.",
  },
  {
    token: "{{retiro}}",
    title: "Retiro",
    hint: "Texto corto para “retiro en …” (nombre de sede o dirección).",
  },
  {
    token: "{{direccion}}",
    title: "Direcciones",
    hint: "Todas las oficinas en texto plano (una por línea).",
  },
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
  siteContactPreview,
  cartFreePreview,
}: {
  initial: FloatingContactPayload;
  revision: string;
  /** Datos de contacto actuales (misma fuente que el footer) para vista previa de plantillas. */
  siteContactPreview: SiteContactPayload;
  /** Promo envío gratis (pantalla aparte) para vista previa del contexto público. */
  cartFreePreview: CartFreeShippingPayload;
}) {
  const router = useRouter();
  const [data, setData] = useState<FloatingContactPayload>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [messageTab, setMessageTab] = useState<"fab" | "cart" | "servicio">("fab");

  useEffect(() => {
    setData(initial);
  }, [revision, initial]);

  const previewPublic = useMemo(
    () => computeFloatingContactPublic(data, siteContactPreview, cartFreePreview),
    [data, siteContactPreview, cartFreePreview],
  );
  const previewMessage = useMemo(() => {
    const vars = buildFabTemplateVars(data, siteContactPreview);
    return interpolateFabTemplate(data.fabMessageTemplate, vars);
  }, [data, siteContactPreview]);

  const previewCartMessage = useMemo(() => {
    const vars = buildFabTemplateVars(data, siteContactPreview);
    const pedido = buildCartPedidoBlock(CART_PREVIEW_ITEMS, 950);
    const nota = buildCartNotaBlock("Retiro viernes por la tarde");
    return interpolateRichTemplate(data.cartMessageTemplate, { ...vars, pedido, nota });
  }, [data, siteContactPreview]);

  const previewServicioMessage = useMemo(() => {
    const vars = buildFabTemplateVars(data, siteContactPreview);
    return interpolateFabTemplate(data.servicioTecnicoMessageTemplate, vars);
  }, [data, siteContactPreview]);

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

  const insertServicioToken = useCallback((token: string) => {
    setData((d) => ({
      ...d,
      servicioTecnicoMessageTemplate: `${d.servicioTecnicoMessageTemplate}${token}`,
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
        Botón flotante, plantillas de mensaje y número. La promo de envío gratis del carrito está en{" "}
        <Link href="/backoffice/contenido/envio-gratis" className="font-medium text-violet-200 underline-offset-2 hover:underline">
          Envío gratis
        </Link>
        . En las plantillas podés usar{" "}
        <code className="font-mono text-violet-200/90">{"{{telefono}}"}</code>,{" "}
        <code className="font-mono text-violet-200/90">{"{{retiro}}"}</code>, etc.: se rellenan desde{" "}
        <Link href="/backoffice/contenido/contacto" className="font-medium text-violet-200 underline-offset-2 hover:underline">
          Datos de contacto
        </Link>
        . Guardá con la barra inferior. Clave:{" "}
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
              El saludo del globo verde está en «Botón flotante»; el carrito y servicio técnico tienen cada uno su
              plantilla en las otras pestañas.
            </span>
          </span>
        </label>
      </section>

      <section
        className={`${boEditorSection} relative overflow-hidden border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/25 via-violet-950/20 to-emerald-950/20 ring-1 ring-white/10`}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <h2 className={`${boEditorH2} relative`}>Plantillas de WhatsApp</h2>
        <p className="relative mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          Elegí la pestaña: saludo del botón flotante, cierre del pedido desde el carrito, o mensajes de servicio técnico
          (precios, seguimiento y base del formulario de reparación).
        </p>

        <div className="relative mt-6 flex flex-wrap gap-2 border-b border-white/[0.08] pb-px">
          <button
            type="button"
            onClick={() => setMessageTab("fab")}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
              messageTab === "fab"
                ? "bg-white/[0.1] text-white ring-1 ring-white/15 ring-b-0"
                : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
            }`}
          >
            Botón flotante
          </button>
          <button
            type="button"
            onClick={() => setMessageTab("cart")}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
              messageTab === "cart"
                ? "bg-white/[0.1] text-white ring-1 ring-white/15 ring-b-0"
                : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
            }`}
          >
            Mensaje del carrito
          </button>
          <button
            type="button"
            onClick={() => setMessageTab("servicio")}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
              messageTab === "servicio"
                ? "bg-white/[0.1] text-white ring-1 ring-white/15 ring-b-0"
                : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
            }`}
          >
            Servicio técnico
          </button>
        </div>

        <div className="relative rounded-b-xl rounded-tr-xl border border-t-0 border-white/[0.08] bg-black/20 p-5 sm:p-6">
          {messageTab === "fab" ? (
            <>
              <p className="text-sm text-slate-400">
                Texto que se abre al tocar el globo verde. Usá variables para saludo y enlaces.
              </p>
              <div className="mt-6">
                <p className={labelClass}>Variables — tocá para agregar al final</p>
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
              <label className="mt-6 block">
                <span className={labelClass}>Plantilla</span>
                <textarea
                  value={data.fabMessageTemplate}
                  onChange={(e) => setData((d) => ({ ...d, fabMessageTemplate: e.target.value }))}
                  rows={12}
                  className={`${inputClass} font-mono text-[13px] leading-relaxed`}
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
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
              <div className="mt-8 rounded-2xl border border-white/[0.08] bg-black/25 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Vista previa del mensaje
                </p>
                <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black/40 p-4 text-[13px] leading-relaxed text-slate-200 ring-1 ring-white/5">
                  {previewMessage}
                </pre>
                <p className="mt-3 text-xs text-slate-500">
                  Enlace (botón verde):{" "}
                  {previewPublic.whatsappFabHref ? (
                    <span className="text-emerald-300/90">wa.me con texto codificado</span>
                  ) : (
                    <span className="text-amber-200/90">falta número válido o el botón está oculto</span>
                  )}
                </p>
              </div>
            </>
          ) : messageTab === "servicio" ? (
            <>
              <p className="text-sm text-slate-400">
                Usan este texto los enlaces a WhatsApp en precios de reparación, seguimiento de reparaciones y el
                encabezado del mensaje del formulario de servicio; en el formulario se agrega abajo el detalle del equipo
                y el problema (no usás{" "}
                <code className="rounded bg-white/10 px-1 font-mono text-[11px] text-slate-300">
                  {"{{pedido}}"}
                </code>{" "}
                ni{" "}
                <code className="rounded bg-white/10 px-1 font-mono text-[11px] text-slate-300">
                  {"{{nota}}"}
                </code>
                ).
              </p>
              <div className="mt-6">
                <p className={labelClass}>Variables — tocá para agregar al final</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {VARIABLES.map((v) => (
                    <button
                      key={`st-${v.token}`}
                      type="button"
                      onClick={() => insertServicioToken(v.token)}
                      className="group rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-left text-xs font-medium text-slate-200 ring-1 ring-white/5 transition hover:border-teal-400/35 hover:bg-teal-500/10 hover:text-white"
                      title={v.hint}
                    >
                      <span className="font-mono text-[11px] text-teal-200/90">{v.token}</span>
                      <span className="ml-2 text-slate-500 group-hover:text-slate-300">{v.title}</span>
                    </button>
                  ))}
                </div>
              </div>
              <label className="mt-6 block">
                <span className={labelClass}>Plantilla de servicio técnico</span>
                <textarea
                  value={data.servicioTecnicoMessageTemplate}
                  onChange={(e) =>
                    setData((d) => ({ ...d, servicioTecnicoMessageTemplate: e.target.value }))
                  }
                  rows={14}
                  className={`${inputClass} font-mono text-[13px] leading-relaxed`}
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setData((d) => ({
                      ...d,
                      servicioTecnicoMessageTemplate: DEFAULT_SERVICIO_TECNICO_MESSAGE_TEMPLATE,
                    }))
                  }
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10"
                >
                  Restaurar ejemplo por defecto
                </button>
              </div>
              <div className="mt-8 rounded-2xl border border-white/[0.08] bg-black/25 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Vista previa del mensaje
                </p>
                <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black/40 p-4 text-[13px] leading-relaxed text-slate-200 ring-1 ring-white/5">
                  {previewServicioMessage}
                </pre>
                <p className="mt-3 text-xs text-slate-500">
                  En el formulario web, debajo de este texto se concatenan modelo, problema y datos de contacto.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-400">
                Independiente del flotante. Incluí{" "}
                <code className="rounded bg-white/10 px-1 font-mono text-[11px] text-emerald-200/90">
                  {"{{pedido}}"}
                </code>{" "}
                y{" "}
                <code className="rounded bg-white/10 px-1 font-mono text-[11px] text-emerald-200/90">
                  {"{{nota}}"}
                </code>
                .
              </p>
              <div className="mt-6">
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
              <label className="mt-6 block">
                <span className={labelClass}>Plantilla del carrito</span>
                <textarea
                  value={data.cartMessageTemplate}
                  onChange={(e) => setData((d) => ({ ...d, cartMessageTemplate: e.target.value }))}
                  rows={16}
                  className={`${inputClass} font-mono text-[13px] leading-relaxed`}
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
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
              <div className="mt-8 rounded-2xl border border-white/[0.08] bg-black/25 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Vista previa (1 ítem + nota de ejemplo)
                </p>
                <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black/40 p-4 text-[13px] leading-relaxed text-slate-200 ring-1 ring-white/5">
                  {previewCartMessage}
                </pre>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

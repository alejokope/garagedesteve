import { z } from "zod";

import { siteConfig } from "@/lib/site-config";

export const FLOATING_CONTACT_KEY = "site.floating_contact" as const;

/** Plantilla por defecto del mensaje al tocar el botón flotante de WhatsApp. */
export const DEFAULT_FAB_MESSAGE_TEMPLATE = `Hola {{marca}} 👋

Te escribo desde la web ({{sitio}}).

Quiero hacer una consulta — ¿me orientan?

¡Gracias! ✨`;

/** Plantilla al pulsar «Finalizar por WhatsApp» en el carrito (distinta del botón flotante). */
export const DEFAULT_CART_MESSAGE_TEMPLATE = `Hola {{marca}}, ¿cómo están? 👋

1) Quiero coordinar la compra de un equipo / producto.

{{pedido}}{{nota}}

¿Me confirman disponibilidad, retiro en oficina (Microcentro) y formas de pago? Si vieron otro precio, lo vemos y lo intentamos mejorar 🙂

Listado y links: {{linktree}}

Gracias.`;

export const floatingContactPayloadSchema = z.object({
  /** URL completa del perfil de Instagram (https://…). Vacío = usar el del sitio en código. */
  instagramUrl: z.string().max(500).default(""),
  /** Solo dígitos o formato libre; al guardar se normaliza. Vacío = usar variable de entorno si existe. */
  whatsappPhone: z.string().max(40).default(""),
  /** Texto con variables {{marca}}, {{sitio}}, {{instagram}}, {{linktree}}, {{año}} */
  fabMessageTemplate: z.string().min(1).max(2000).default(DEFAULT_FAB_MESSAGE_TEMPLATE),
  /**
   * Mensaje del carrito: mismas variables + {{pedido}} (ítems y total) y {{nota}} (nota del cliente o vacío).
   */
  cartMessageTemplate: z.string().min(1).max(4000).default(DEFAULT_CART_MESSAGE_TEMPLATE),
  /** Nombre con el que te saludan en el mensaje y en otras pantallas del sitio. */
  brandName: z.string().max(120).default(""),
  showInstagramFab: z.boolean().default(true),
  showWhatsappFab: z.boolean().default(true),
});

export type FloatingContactPayload = z.infer<typeof floatingContactPayloadSchema>;

/** Variables resueltas para plantillas (servidor y cliente). */
export type FloatingMessageTemplateVars = {
  marca: string;
  sitio: string;
  instagram: string;
  linktree: string;
  año: string;
};

export type FloatingContactPublic = {
  phoneDigits: string | null;
  brandName: string;
  instagramHref: string | null;
  whatsappFabHref: string | null;
  showInstagramFab: boolean;
  showWhatsappFab: boolean;
  cartMessageTemplate: string;
  messageTemplateVars: FloatingMessageTemplateVars;
};

export function defaultFloatingContactPayload(): FloatingContactPayload {
  return floatingContactPayloadSchema.parse({
    instagramUrl: siteConfig.publicLinks.instagram,
    whatsappPhone: "",
    fabMessageTemplate: DEFAULT_FAB_MESSAGE_TEMPLATE,
    cartMessageTemplate: DEFAULT_CART_MESSAGE_TEMPLATE,
    brandName: siteConfig.brandName,
    showInstagramFab: true,
    showWhatsappFab: true,
  });
}

export function mergeFloatingContactDefaults(partial: unknown): FloatingContactPayload {
  const base = defaultFloatingContactPayload();
  if (!partial || typeof partial !== "object") return base;
  const o = partial as Record<string, unknown>;

  try {
    return floatingContactPayloadSchema.parse({
      ...base,
      instagramUrl: typeof o.instagramUrl === "string" ? o.instagramUrl : base.instagramUrl,
      whatsappPhone: typeof o.whatsappPhone === "string" ? o.whatsappPhone : base.whatsappPhone,
      fabMessageTemplate:
        typeof o.fabMessageTemplate === "string" ? o.fabMessageTemplate : base.fabMessageTemplate,
      cartMessageTemplate:
        typeof o.cartMessageTemplate === "string" ? o.cartMessageTemplate : base.cartMessageTemplate,
      brandName: typeof o.brandName === "string" ? o.brandName : base.brandName,
      showInstagramFab: typeof o.showInstagramFab === "boolean" ? o.showInstagramFab : base.showInstagramFab,
      showWhatsappFab: typeof o.showWhatsappFab === "boolean" ? o.showWhatsappFab : base.showWhatsappFab,
    });
  } catch {
    return base;
  }
}

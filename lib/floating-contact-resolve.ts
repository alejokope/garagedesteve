import { whatsappUrl } from "@/lib/whatsapp-url";
import { siteConfig } from "@/lib/site-config";
import type { CartFreeShippingPayload } from "@/lib/cart-free-shipping-content-schema";
import { mergeCartFreeShippingDefaults } from "@/lib/cart-free-shipping-content-schema";
import {
  defaultSiteContactPayload,
  formatOfficesForTemplate,
  pickupAreaShortLabel,
  type SiteContactPayload,
} from "@/lib/site-contact-schema";

import type {
  FloatingContactPayload,
  FloatingContactPublic,
  FloatingMessageTemplateVars,
} from "@/lib/floating-contact-schema";
import { mergeFloatingContactDefaults } from "@/lib/floating-contact-schema";

export type FabTemplateVars = FloatingMessageTemplateVars;

export type RichTemplateVars = FabTemplateVars & {
  /** Listado del carrito + total (generado). */
  pedido: string;
  /** Nota del cliente o cadena vacía. */
  nota: string;
};

export function interpolateFabTemplate(template: string, vars: FabTemplateVars): string {
  return template
    .split("{{marca}}")
    .join(vars.marca)
    .split("{{sitio}}")
    .join(vars.sitio)
    .split("{{instagram}}")
    .join(vars.instagram)
    .split("{{linktree}}")
    .join(vars.linktree)
    .split("{{año}}")
    .join(vars.año)
    .split("{{telefono}}")
    .join(vars.telefono)
    .split("{{email}}")
    .join(vars.email)
    .split("{{horario}}")
    .join(vars.horario)
    .split("{{retiro}}")
    .join(vars.retiro)
    .split("{{direccion}}")
    .join(vars.direccion);
}

export function interpolateRichTemplate(template: string, vars: RichTemplateVars): string {
  return interpolateFabTemplate(template, vars)
    .split("{{pedido}}")
    .join(vars.pedido)
    .split("{{nota}}")
    .join(vars.nota);
}

function normalizeInstagramHref(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.href;
  } catch {
    return null;
  }
}

function resolvePhoneDigits(payload: FloatingContactPayload): string | null {
  const fromDb = payload.whatsappPhone.replace(/\D/g, "");
  if (fromDb.length >= 8) return fromDb;
  const fromEnv =
    typeof process.env.NEXT_PUBLIC_WHATSAPP_NUMBER === "string"
      ? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/\D/g, "")
      : "";
  if (fromEnv.length >= 8) return fromEnv;
  return null;
}

function resolveBrandName(payload: FloatingContactPayload): string {
  const trimmed = payload.brandName.trim();
  if (trimmed) return trimmed;
  const env = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NAME?.trim();
  if (env) return env;
  return siteConfig.brandName;
}

function resolveSiteLabel(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || siteConfig.siteUrl
  );
}

export function buildFabTemplateVars(
  payload: FloatingContactPayload,
  siteContact: SiteContactPayload,
): FabTemplateVars {
  const brandName = resolveBrandName(payload);
  const igDisplay =
    payload.instagramUrl.trim() ||
    siteConfig.publicLinks.instagram;
  return {
    marca: brandName,
    sitio: resolveSiteLabel(),
    instagram: igDisplay,
    linktree: siteConfig.publicLinks.linktree,
    año: String(new Date().getFullYear()),
    telefono: siteContact.phone,
    email: siteContact.email,
    horario: siteContact.hours,
    retiro: pickupAreaShortLabel(siteContact),
    direccion: formatOfficesForTemplate(siteContact),
  };
}

export function computeFloatingContactPublic(
  payload: FloatingContactPayload,
  siteContact: SiteContactPayload,
  cartFreeShipping: CartFreeShippingPayload,
): FloatingContactPublic {
  const phoneDigits = resolvePhoneDigits(payload);
  const brandName = resolveBrandName(payload);
  const igRaw = payload.instagramUrl.trim() || siteConfig.publicLinks.instagram;
  const instagramHref =
    payload.showInstagramFab ? normalizeInstagramHref(igRaw) : null;

  const vars = buildFabTemplateVars(payload, siteContact);
  const message = interpolateFabTemplate(payload.fabMessageTemplate, vars);

  const whatsappFabHref =
    payload.showWhatsappFab && phoneDigits
      ? whatsappUrl(phoneDigits, message)
      : null;

  return {
    phoneDigits,
    brandName,
    instagramHref,
    whatsappFabHref,
    showInstagramFab: payload.showInstagramFab,
    showWhatsappFab: payload.showWhatsappFab,
    cartMessageTemplate: payload.cartMessageTemplate,
    messageTemplateVars: vars,
    cartFreeShippingEnabled: cartFreeShipping.enabled,
    cartFreeShippingMinUsd: cartFreeShipping.minUsd,
  };
}

/** Fallback cuando no hay proveedor React (p. ej. fuera del layout del sitio). */
export function computeFloatingContactPublicFromDefaults(): FloatingContactPublic {
  return computeFloatingContactPublic(
    mergeFloatingContactDefaults(null),
    defaultSiteContactPayload(),
    mergeCartFreeShippingDefaults(null),
  );
}

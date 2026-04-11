import { z } from "zod";

import { siteConfig } from "@/lib/site-config";

export const siteOfficeSchema = z.object({
  /** Opcional: ej. barrio o nombre comercial de la sede */
  name: z.string().optional(),
  address: z.string().min(1),
});

export type SiteOffice = z.infer<typeof siteOfficeSchema>;

export const siteContactPayloadSchema = z.object({
  offices: z.array(siteOfficeSchema).min(1),
  phone: z.string(),
  email: z.string(),
  hours: z.string(),
});

export type SiteContactPayload = z.infer<typeof siteContactPayloadSchema>;

/** Forma serializada al cliente (layout del sitio público). */
export type SiteContactPublic = {
  offices: SiteContactPayload["offices"];
  phone: string;
  email: string;
  hours: string;
  pickupAreaShort: string;
};

export const SITE_CONTACT_KEY = "site.contact" as const;

export function defaultSiteContactPayload(): SiteContactPayload {
  return siteContactPayloadSchema.parse({
    offices: [{ address: siteConfig.contact.address }],
    phone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    hours: siteConfig.contact.hours,
  });
}

export function mergeSiteContactDefaults(partial: unknown): SiteContactPayload {
  const base = defaultSiteContactPayload();
  if (!partial || typeof partial !== "object") return base;
  const o = partial as Record<string, unknown>;

  const officesRaw = Array.isArray(o.offices) ? o.offices : null;
  let offices = base.offices;
  if (officesRaw && officesRaw.length > 0) {
    try {
      offices = z.array(siteOfficeSchema).min(1).parse(officesRaw);
    } catch {
      /* keep base */
    }
  }

  try {
    return siteContactPayloadSchema.parse({
      ...base,
      ...o,
      offices,
      phone: typeof o.phone === "string" ? o.phone : base.phone,
      email: typeof o.email === "string" ? o.email : base.email,
      hours: typeof o.hours === "string" ? o.hours : base.hours,
    });
  } catch {
    return base;
  }
}

/** Migra el bloque `contact` antiguo del footer (una sola dirección). */
export function migrateFromLegacyFooterContact(contact: unknown): Partial<SiteContactPayload> | null {
  if (!contact || typeof contact !== "object") return null;
  const c = contact as Record<string, unknown>;
  const address = typeof c.address === "string" ? c.address.trim() : "";
  const hasAny =
    address.length > 0 ||
    (typeof c.phone === "string" && c.phone.trim().length > 0) ||
    (typeof c.email === "string" && c.email.trim().length > 0) ||
    (typeof c.hours === "string" && c.hours.trim().length > 0);
  if (!hasAny) return null;
  return {
    offices: address ? [{ address }] : undefined,
    phone: typeof c.phone === "string" ? c.phone : undefined,
    email: typeof c.email === "string" ? c.email : undefined,
    hours: typeof c.hours === "string" ? c.hours : undefined,
  };
}

/** Todas las sedes en texto plano (p. ej. plantillas de WhatsApp). */
export function formatOfficesForTemplate(contact: SiteContactPayload): string {
  return contact.offices
    .map((o) => {
      const name = o.name?.trim();
      return name ? `${name}: ${o.address}` : o.address;
    })
    .join("\n");
}

/** Texto corto para microcopy (carrito): nombre de sede o primer fragmento de dirección. */
export function pickupAreaShortLabel(contact: SiteContactPayload): string {
  const first = contact.offices[0];
  if (!first) return "oficina";
  const n = first.name?.trim();
  if (n) return n;
  const line = first.address.split(/[·\n]/)[0]?.trim() ?? first.address;
  if (!line) return "oficina";
  return line.length > 48 ? `${line.slice(0, 45)}…` : line;
}

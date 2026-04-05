import { z } from "zod";

import { siteConfig } from "@/lib/site-config";

export const footerSocialIconSchema = z.enum(["facebook", "instagram", "linkedin", "x", "link"]);
export type FooterSocialIcon = z.infer<typeof footerSocialIconSchema>;

export const footerSocialEntrySchema = z.object({
  label: z.string(),
  href: z.string(),
  icon: footerSocialIconSchema,
});

export const footerNavLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const footerColumnSchema = z.object({
  title: z.string(),
  links: z.array(footerNavLinkSchema).default([]),
});

export const footerContentPayloadSchema = z.object({
  blurb: z.string(),
  sedesTitle: z.string(),
  sedesBody: z.string(),
  vendeTitle: z.string(),
  vendeBody: z.string(),
  vendeLinkLabel: z.string(),
  vendeLinkHref: z.string(),
  social: z.array(footerSocialEntrySchema).default([]),
  /** Cuatro columnas: [0][1] arriba a la derecha; [2] y [3] se listan bajo `supportColumnTitle`. */
  columns: z.array(footerColumnSchema).length(4),
  supportColumnTitle: z.string(),
  contact: z.object({
    address: z.string(),
    phone: z.string(),
    email: z.string(),
    hours: z.string(),
  }),
  legalLinks: z.array(footerNavLinkSchema).default([]),
});

export type FooterContentPayload = z.infer<typeof footerContentPayloadSchema>;

export const FOOTER_CONTENT_KEY = "site.footer" as const;

function cloneColumnsFromSiteConfig(): FooterContentPayload["columns"] {
  return siteConfig.footer.columns.map((c) => ({
    title: c.title,
    links: c.links.map((l) => ({ label: l.label, href: l.href })),
  })) as FooterContentPayload["columns"];
}

function cloneSocialFromSiteConfig(): FooterContentPayload["social"] {
  return siteConfig.footer.social.map((s) => ({
    label: s.label,
    href: s.href,
    icon: s.icon as FooterSocialIcon,
  }));
}

export function defaultFooterContentPayload(): FooterContentPayload {
  return footerContentPayloadSchema.parse({
    blurb: siteConfig.footer.blurb,
    sedesTitle: "Nuestras sedes",
    sedesBody:
      "Coordinamos retiro y envíos. Consultá horarios y disponibilidad por WhatsApp.",
    vendeTitle: "Vendé tu equipo",
    vendeBody: "Cotización por WhatsApp según modelo, capacidad y estado. Sin vueltas.",
    vendeLinkLabel: "Ver cómo funciona",
    vendeLinkHref: "/vende-tu-equipo",
    social: cloneSocialFromSiteConfig(),
    columns: cloneColumnsFromSiteConfig(),
    supportColumnTitle: "Soporte",
    contact: {
      address: siteConfig.contact.address,
      phone: siteConfig.contact.phone,
      email: siteConfig.contact.email,
      hours: siteConfig.contact.hours,
    },
    legalLinks: [
      { label: "Privacidad", href: "/#faq" },
      { label: "Términos", href: "/#faq" },
    ],
  });
}

export function mergeFooterContentDefaults(partial: unknown): FooterContentPayload {
  const base = defaultFooterContentPayload();
  if (!partial || typeof partial !== "object") return base;
  const o = partial as Record<string, unknown>;

  const columnsRaw = Array.isArray(o.columns) ? o.columns : null;
  const columns =
    columnsRaw && columnsRaw.length >= 4
      ? z.array(footerColumnSchema).length(4).parse(columnsRaw.slice(0, 4))
      : base.columns;

  const socialRaw = Array.isArray(o.social) ? o.social : null;
  const social =
    socialRaw && socialRaw.length > 0
      ? z.array(footerSocialEntrySchema).parse(socialRaw)
      : base.social;

  const legalRaw = Array.isArray(o.legalLinks) ? o.legalLinks : null;
  const legalLinks =
    legalRaw && legalRaw.length > 0
      ? z.array(footerNavLinkSchema).parse(legalRaw)
      : base.legalLinks;

  const contactBase = base.contact;
  const contactObj =
    o.contact && typeof o.contact === "object" ? (o.contact as Record<string, unknown>) : {};

  try {
    return footerContentPayloadSchema.parse({
      ...base,
      ...o,
      columns,
      social,
      legalLinks,
      contact: {
        address: typeof contactObj.address === "string" ? contactObj.address : contactBase.address,
        phone: typeof contactObj.phone === "string" ? contactObj.phone : contactBase.phone,
        email: typeof contactObj.email === "string" ? contactObj.email : contactBase.email,
        hours: typeof contactObj.hours === "string" ? contactObj.hours : contactBase.hours,
      },
    });
  } catch {
    return base;
  }
}

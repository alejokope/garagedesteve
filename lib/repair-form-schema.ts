import { z } from "zod";

import { repairCurrencySchema, type RepairCurrency } from "@/lib/repair-pricing-schema";

export const repairFormServiceTypeSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  iconEmoji: z.string().default("🛠️"),
  priceFrom: z.number().nonnegative(),
  currency: repairCurrencySchema.default("USD"),
});

export const repairFormBrandSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const repairFormModelSchema = z.object({
  id: z.string(),
  brandId: z.string(),
  label: z.string(),
});

export const repairFormPrioritySchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  default: z.boolean().optional(),
});

export const repairFormDeliverySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  addressLine: z.string().optional(),
});

export const repairFormPayloadSchema = z.object({
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  serviceTypes: z.array(repairFormServiceTypeSchema).default([]),
  brands: z.array(repairFormBrandSchema).default([]),
  models: z.array(repairFormModelSchema).default([]),
  problemLabel: z.string(),
  problemPlaceholder: z.string(),
  priorities: z.array(repairFormPrioritySchema).default([]),
  deliveryOptions: z.array(repairFormDeliverySchema).default([]),
  contactNameLabel: z.string(),
  contactPhoneLabel: z.string(),
  contactEmailLabel: z.string().optional(),
  showEmailField: z.boolean().default(false),
  fileUploadTitle: z.string(),
  fileUploadHint: z.string(),
  sidebarDiagnosis: z.object({
    title: z.string(),
    bullets: z.array(z.string()).default([]),
  }),
  sidebarTimes: z.object({
    title: z.string(),
    items: z.array(z.object({ label: z.string(), time: z.string() })).default([]),
  }),
  sidebarContact: z.object({
    title: z.string(),
    phone: z.string(),
    email: z.string(),
  }),
  featuresSection: z.object({
    title: z.string(),
    items: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        iconEmoji: z.string().default("✓"),
      }),
    ),
  }),
  howItWorks: z.object({
    title: z.string(),
    steps: z.array(z.object({ title: z.string(), description: z.string() })),
  }),
  testimonials: z.object({
    sectionTitle: z.string(),
    sectionSubtitle: z.string().optional(),
    items: z.array(
      z.object({
        quote: z.string(),
        name: z.string(),
        location: z.string(),
        rating: z.number().min(1).max(5).default(5),
      }),
    ),
  }),
  ctaButtonLabel: z.string(),
  whatsappBusinessName: z.string().optional(),
});

export type RepairFormPayload = z.infer<typeof repairFormPayloadSchema>;

export const REPAIR_FORM_KEY = "repair.form" as const;

export function parseRepairFormPayload(raw: unknown): RepairFormPayload {
  const p = repairFormPayloadSchema.safeParse(raw);
  if (p.success) return p.data;
  return defaultRepairFormPayload();
}

export function mergeRepairFormDefaults(partial: unknown): RepairFormPayload {
  const base = defaultRepairFormPayload();
  if (!partial || typeof partial !== "object") return base;
  const o = partial as Record<string, unknown>;
  try {
    return repairFormPayloadSchema.parse({
      ...base,
      ...o,
      serviceTypes: Array.isArray(o.serviceTypes) ? o.serviceTypes : base.serviceTypes,
      brands: Array.isArray(o.brands) ? o.brands : base.brands,
      models: Array.isArray(o.models) ? o.models : base.models,
      priorities: Array.isArray(o.priorities) ? o.priorities : base.priorities,
      deliveryOptions: Array.isArray(o.deliveryOptions) ? o.deliveryOptions : base.deliveryOptions,
      sidebarDiagnosis: o.sidebarDiagnosis
        ? { ...base.sidebarDiagnosis, ...(o.sidebarDiagnosis as object) }
        : base.sidebarDiagnosis,
      sidebarTimes: o.sidebarTimes
        ? { ...base.sidebarTimes, ...(o.sidebarTimes as object) }
        : base.sidebarTimes,
      sidebarContact: o.sidebarContact
        ? { ...base.sidebarContact, ...(o.sidebarContact as object) }
        : base.sidebarContact,
      featuresSection: o.featuresSection
        ? { ...base.featuresSection, ...(o.featuresSection as object) }
        : base.featuresSection,
      howItWorks: o.howItWorks
        ? { ...base.howItWorks, ...(o.howItWorks as object) }
        : base.howItWorks,
      testimonials: o.testimonials
        ? { ...base.testimonials, ...(o.testimonials as object) }
        : base.testimonials,
    });
  } catch {
    return base;
  }
}

export function defaultRepairFormPayload(): RepairFormPayload {
  return repairFormPayloadSchema.parse({
    heroTitle: "Servicio técnico Apple",
    heroSubtitle:
      "Contanos el problema y el modelo: te respondemos por WhatsApp para agilizar la cotización. Si podemos, evaluamos sin cargo al inicio.",
    serviceTypes: [
      {
        id: "pantalla",
        title: "Cambio de pantalla",
        subtitle: "Roturas, táctil, manchas",
        iconEmoji: "📱",
        priceFrom: 40,
        currency: "USD",
      },
      {
        id: "bateria",
        title: "Cambio de batería",
        iconEmoji: "🔋",
        priceFrom: 35,
        currency: "USD",
      },
      {
        id: "carga",
        title: "Pin / placa de carga",
        iconEmoji: "⚡",
        priceFrom: 45,
        currency: "USD",
      },
      {
        id: "otro",
        title: "Otro / no estoy seguro",
        iconEmoji: "❓",
        priceFrom: 0,
        currency: "USD",
      },
    ],
    brands: [
      { id: "apple", label: "Apple" },
      { id: "otro", label: "Otra marca" },
    ],
    models: [
      { id: "ip14", brandId: "apple", label: "iPhone 14" },
      { id: "ip15", brandId: "apple", label: "iPhone 15" },
      { id: "ipad-air", brandId: "apple", label: "iPad Air" },
      { id: "otro-m", brandId: "otro", label: "Otro modelo" },
    ],
    problemLabel: "¿Qué reparación necesitás?",
    problemPlaceholder:
      "Detallá lo mejor posible: qué falla, desde cuándo, si hubo golpe o líquido, y el modelo exacto si no lo elegiste arriba.",
    priorities: [
      { id: "normal", label: "Normal", description: "3–5 días hábiles" },
      { id: "urgente", label: "Urgente", description: "24–48 hs", default: true },
      { id: "express", label: "Express", description: "En el día (sujeto a stock)" },
    ],
    deliveryOptions: [
      {
        id: "tienda",
        title: "Traer el equipo (Microcentro)",
        description: "Retiro en oficina comercial con seguridad; coordinamos día y horario por WhatsApp. Recordá DNI para recepción.",
        addressLine: "Microcentro, CABA",
      },
      {
        id: "domicilio",
        title: "Otra modalidad",
        description: "Consultanos por envío u otras opciones según caso.",
      },
    ],
    contactNameLabel: "Nombre completo",
    contactPhoneLabel: "Teléfono (WhatsApp)",
    contactEmailLabel: "Email (opcional)",
    showEmailField: true,
    fileUploadTitle: "Fotos o video del equipo",
    fileUploadHint:
      "Si hay rotura o desgaste, las fotos o un video corto ayudan a cotizar sin idas y vueltas. También podés mandarlos por WhatsApp después.",
    sidebarDiagnosis: {
      title: "Diagnóstico claro",
      bullets: [
        "Te decimos qué conviene antes de avanzar",
        "Sin compromiso hasta que apruebes el presupuesto",
        "Especializados en Apple",
      ],
    },
    sidebarTimes: {
      title: "Tiempos orientativos",
      items: [
        { label: "Módulo (pantalla)", time: "2–4 hs" },
        { label: "Batería", time: "30–60 min" },
        { label: "Placa / líquidos", time: "Según diagnóstico" },
      ],
    },
    sidebarContact: {
      title: "¿Dudas?",
      phone: "+54 11 0000-0000",
      email: "hola@theiphone.example",
    },
    featuresSection: {
      title: "Por qué elegirnos",
      items: [
        {
          title: "Repuestos de primera",
          description: "Marcas reconocidas y alternativas de igual o mejor calidad cuando hace falta.",
          iconEmoji: "📦",
        },
        {
          title: "Garantía escrita",
          description: "Sabés qué cubre y por cuánto tiempo antes de dejar el equipo.",
          iconEmoji: "🛡️",
        },
        {
          title: "Coordinación rápida",
          description: "Te respondemos por WhatsApp y cerramos día de ingreso y retiro sin vueltas.",
          iconEmoji: "⚡",
        },
        {
          title: "También vendemos Apple",
          description: "iPhone nuevo o usado, Mac, iPad, Watch y accesorios. Pedinos listado.",
          iconEmoji: "🍎",
        },
      ],
    },
    howItWorks: {
      title: "Cómo funciona",
      steps: [
        { title: "Escribinos con detalle", description: "Modelo, falla y fotos si aplica." },
        { title: "Presupuesto", description: "Te pasamos precio y plazo por WhatsApp." },
        { title: "Reparación", description: "Aprobás y dejás el equipo; probamos al entregar." },
        { title: "Retiro", description: "Microcentro, con seguridad. Coordinado por chat." },
      ],
    },
    testimonials: {
      sectionTitle: "Clientes satisfechos",
      sectionSubtitle: "Experiencias reales de quienes confiaron en nosotros",
      items: [
        {
          quote: "Me arreglaron la pantalla el mismo día. Muy claros con el presupuesto.",
          name: "Lucía M.",
          location: "CABA",
          rating: 5,
        },
        {
          quote: "Buen trato y seguimiento por WhatsApp en cada paso.",
          name: "Martín R.",
          location: "Zona Norte",
          rating: 5,
        },
        {
          quote: "Batería nueva y el equipo quedó como nuevo.",
          name: "Paula G.",
          location: "GBA",
          rating: 5,
        },
      ],
    },
    ctaButtonLabel: "Enviar consulta por WhatsApp",
  });
}

export function formatServicePrice(amount: number, currency: RepairCurrency): string {
  if (amount <= 0) return "A convenir";
  if (currency === "USD") {
    return `Desde ${new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)}`;
  }
  return `Desde ${new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

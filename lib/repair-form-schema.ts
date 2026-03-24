import { z } from "zod";

import { repairCurrencySchema, type RepairCurrency } from "@/lib/repair-pricing-schema";

export const repairFormServiceTypeSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  iconEmoji: z.string().default("🛠️"),
  priceFrom: z.number().nonnegative(),
  currency: repairCurrencySchema.default("ARS"),
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
    heroTitle: "Solicitud de servicio técnico",
    heroSubtitle:
      "Completá el formulario. Te respondemos por WhatsApp con el próximo paso. Diagnóstico sin cargo en la mayoría de los casos.",
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
        currency: "ARS",
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
    problemLabel: "Descripción del problema",
    problemPlaceholder: "Contanos qué pasó, hace cuánto y si hubo golpe o líquido…",
    priorities: [
      { id: "normal", label: "Normal", description: "3–5 días hábiles" },
      { id: "urgente", label: "Urgente", description: "24–48 hs", default: true },
      { id: "express", label: "Express", description: "En el día (sujeto a stock)" },
    ],
    deliveryOptions: [
      {
        id: "tienda",
        title: "Llevar a la tienda",
        description: "Coordinamos turno por WhatsApp.",
        addressLine: "Av. Corrientes 1234, CABA",
      },
      {
        id: "domicilio",
        title: "Retiro a domicilio",
        description: "Solo CABA y GBA según zona.",
      },
    ],
    contactNameLabel: "Nombre completo",
    contactPhoneLabel: "Teléfono (WhatsApp)",
    contactEmailLabel: "Email (opcional)",
    showEmailField: true,
    fileUploadTitle: "Fotos del equipo",
    fileUploadHint: "Podés adjuntar imágenes; también las podés enviar luego por WhatsApp.",
    sidebarDiagnosis: {
      title: "Diagnóstico gratis",
      bullets: [
        "Evaluación inicial sin costo en muchos casos",
        "Sin compromiso de reparación",
        "Especialistas certificados",
      ],
    },
    sidebarTimes: {
      title: "Tiempos orientativos",
      items: [
        { label: "Pantalla", time: "2–4 hs" },
        { label: "Batería", time: "1–2 hs" },
        { label: "Placa / líquidos", time: "24–72 hs" },
      ],
    },
    sidebarContact: {
      title: "¿Dudas?",
      phone: "+54 11 0000-0000",
      email: "hola@theiphone.example",
    },
    featuresSection: {
      title: "Tu dispositivo en las mejores manos",
      items: [
        {
          title: "Técnicos especializados",
          description: "Experiencia en Apple y electrónica en general.",
          iconEmoji: "👷",
        },
        {
          title: "Repuestos de calidad",
          description: "Según disponibilidad y presupuesto acordado.",
          iconEmoji: "📦",
        },
        {
          title: "Garantía en el trabajo",
          description: "Te informamos cobertura antes de avanzar.",
          iconEmoji: "🛡️",
        },
        {
          title: "Trabajos ágiles",
          description: "Prioridades express cuando el repuesto está en stock.",
          iconEmoji: "⚡",
        },
      ],
    },
    howItWorks: {
      title: "Cómo funciona",
      steps: [
        { title: "Completá el formulario", description: "Detallá marca, modelo y falla." },
        { title: "Diagnóstico", description: "Te guiamos por WhatsApp." },
        { title: "Reparación", description: "Presupuesto y autorización." },
        { title: "Entrega", description: "Retiro en tienda o envío coordinado." },
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
    ctaButtonLabel: "Consultar reparación por WhatsApp",
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

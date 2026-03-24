import { z } from "zod";

/** Moneda: global por página o por fila de precio. */
export const repairCurrencySchema = z.enum(["ARS", "USD"]);
export type RepairCurrency = z.infer<typeof repairCurrencySchema>;

export const repairPricingTableRowSchema = z.object({
  model: z.string(),
  price: z.number().nonnegative(),
  /** Si falta, usa `defaultCurrency` de la página. */
  currency: repairCurrencySchema.nullable().optional(),
  time: z.string(),
  warrantyLabel: z.string(),
});

export const repairPricingCategorySchema = z.object({
  id: z.string(),
  /** Filtros de dispositivo (ids). Vacío = visible en todos. */
  deviceFilterIds: z.array(z.string()).default([]),
  title: z.string(),
  headerTone: z.enum(["blue", "green", "purple", "orange", "red"]).default("blue"),
  iconEmoji: z.string().default("🔧"),
  layout: z.enum(["table", "highlights"]).default("table"),
  tableRows: z.array(repairPricingTableRowSchema).default([]),
  /** Viñetas bajo la tabla (solo layout table). */
  footerBullets: z.array(z.string()).default([]),
  /** Solo layout highlights: cajas tipo GRATIS / 24h */
  highlights: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
});

export const repairPricingPayloadSchema = z.object({
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  /** Moneda por defecto para filas sin `currency` propia. */
  defaultCurrency: repairCurrencySchema.default("ARS"),
  deviceFilters: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
  categories: z.array(repairPricingCategorySchema).default([]),
  sidebarWarranty: z.object({
    title: z.string(),
    bullets: z.array(z.string()).default([]),
    buttonLabel: z.string(),
    buttonHref: z.string().optional(),
  }),
  sidebarQuickInfo: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
        iconEmoji: z.string().default("ℹ️"),
      }),
    )
    .default([]),
  warrantyAccordion: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        bullets: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  ctaBanner: z.object({
    title: z.string(),
    subtitle: z.string(),
    buttonLabel: z.string(),
    hoursLine: z.string().optional(),
  }),
});

export type RepairPricingPayload = z.infer<typeof repairPricingPayloadSchema>;

export const REPAIR_PRICING_KEY = "repair.pricing" as const;

function emptyCategory(): RepairPricingPayload["categories"][number] {
  return {
    id: "categoria",
    deviceFilterIds: [],
    title: "",
    headerTone: "blue",
    iconEmoji: "🔧",
    layout: "table",
    tableRows: [],
    footerBullets: [],
    highlights: [],
  };
}

export function parseRepairPricingPayload(raw: unknown): RepairPricingPayload {
  return mergeRepairPricingDefaults(raw);
}

export function mergeRepairPricingDefaults(partial: unknown): RepairPricingPayload {
  const base = defaultRepairPricingPayload();
  if (!partial || typeof partial !== "object") return base;
  const o = partial as Record<string, unknown>;

  const categoriesRaw = Array.isArray(o.categories) ? o.categories : base.categories;
  const categories = categoriesRaw.map((c) =>
    repairPricingCategorySchema.parse({
      ...emptyCategory(),
      ...(typeof c === "object" && c ? c : {}),
    }),
  );

  try {
    return repairPricingPayloadSchema.parse({
      ...base,
      ...o,
      defaultCurrency:
        o.defaultCurrency === "ARS" || o.defaultCurrency === "USD"
          ? o.defaultCurrency
          : base.defaultCurrency,
      deviceFilters: Array.isArray(o.deviceFilters) ? o.deviceFilters : base.deviceFilters,
      categories: categories.length > 0 ? categories : base.categories,
      sidebarWarranty:
        o.sidebarWarranty && typeof o.sidebarWarranty === "object"
          ? { ...base.sidebarWarranty, ...(o.sidebarWarranty as object) }
          : base.sidebarWarranty,
      sidebarQuickInfo: Array.isArray(o.sidebarQuickInfo)
        ? o.sidebarQuickInfo
        : base.sidebarQuickInfo,
      warrantyAccordion: Array.isArray(o.warrantyAccordion)
        ? o.warrantyAccordion
        : base.warrantyAccordion,
      ctaBanner:
        o.ctaBanner && typeof o.ctaBanner === "object"
          ? { ...base.ctaBanner, ...(o.ctaBanner as object) }
          : base.ctaBanner,
    });
  } catch {
    return base;
  }
}

export function defaultRepairPricingPayload(): RepairPricingPayload {
  return repairPricingPayloadSchema.parse({
    badge: "Reparación en el momento",
    title: "Precios y cobertura de reparaciones",
    subtitle:
      "Valores orientativos. La cotización final se confirma en tienda o por WhatsApp según el diagnóstico.",
    defaultCurrency: "ARS",
    deviceFilters: [
      { id: "iphone", label: "iPhone" },
      { id: "watch", label: "Apple Watch" },
      { id: "ipad", label: "iPad" },
      { id: "mac", label: "MacBook" },
    ],
    categories: [
      {
        id: "pantalla",
        deviceFilterIds: ["iphone"],
        title: "Cambio de pantalla",
        headerTone: "blue",
        iconEmoji: "📱",
        layout: "table",
        tableRows: [
          {
            model: "iPhone 13 Pro Max",
            price: 220,
            currency: "USD",
            time: "2–4 hs",
            warrantyLabel: "6 meses",
          },
          {
            model: "iPhone 14",
            price: 180,
            currency: "USD",
            time: "2–4 hs",
            warrantyLabel: "6 meses",
          },
        ],
        footerBullets: [
          "Mano de obra incluida",
          "Repuesto según disponibilidad",
          "Face ID: consultamos modelo",
        ],
        highlights: [],
      },
      {
        id: "bateria",
        deviceFilterIds: ["iphone"],
        title: "Cambio de batería",
        headerTone: "green",
        iconEmoji: "🔋",
        layout: "table",
        tableRows: [
          {
            model: "iPhone 12 en adelante",
            price: 85,
            currency: "USD",
            time: "1–2 hs",
            warrantyLabel: "6 meses",
          },
        ],
        footerBullets: ["Calibración incluida"],
        highlights: [],
      },
      {
        id: "carga",
        deviceFilterIds: ["iphone", "ipad"],
        title: "Pin de carga",
        headerTone: "purple",
        iconEmoji: "⚡",
        layout: "table",
        tableRows: [
          {
            model: "iPhone / iPad (según modelo)",
            price: 65,
            currency: null,
            time: "1–3 hs",
            warrantyLabel: "6 meses",
          },
        ],
        footerBullets: [],
        highlights: [],
      },
      {
        id: "diag",
        deviceFilterIds: [],
        title: "Diagnóstico técnico",
        headerTone: "orange",
        iconEmoji: "🔍",
        layout: "highlights",
        tableRows: [],
        footerBullets: [],
        highlights: [
          { label: "Diagnóstico inicial", value: "GRATIS" },
          { label: "Tiempo estimado", value: "24h" },
        ],
      },
    ],
    sidebarWarranty: {
      title: "Garantía completa",
      bullets: [
        "Control de calidad al entregar",
        "Repuestos según disponibilidad",
        "Asesoramiento antes de reparar",
      ],
      buttonLabel: "Políticas de garantía",
      buttonHref: "/#faq",
    },
    sidebarQuickInfo: [
      { title: "Repuestos", body: "Originales o equivalentes según stock.", iconEmoji: "📦" },
      { title: "Tiempos", body: "Varían según complejidad y repuesto.", iconEmoji: "⏱️" },
    ],
    warrantyAccordion: [
      {
        id: "cubre",
        title: "¿Qué cubre la garantía?",
        bullets: [
          "Defectos de la reparación realizada",
          "Repuesto instalado en el servicio",
          "Plazos según lo informado al cliente",
        ],
      },
      {
        id: "no-cubre",
        title: "¿Qué NO cubre la garantía?",
        bullets: [
          "Daños por caídas o líquidos posteriores",
          "Desgaste normal de batería",
          "Intervenciones de terceros",
        ],
      },
      {
        id: "pagos",
        title: "Medios de pago",
        bullets: ["Coordinamos en tienda o por WhatsApp según el caso."],
      },
    ],
    ctaBanner: {
      title: "¿Necesitás una cotización personalizada?",
      subtitle: "Envianos un mensaje por WhatsApp con modelo y falla.",
      buttonLabel: "Contactar por WhatsApp",
      hoursLine: "Respuesta en menos de 10 min. (Lun – Sáb 10–19 hs)",
    },
  });
}

export function formatRepairPrice(
  amount: number,
  currency: RepairCurrency,
): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

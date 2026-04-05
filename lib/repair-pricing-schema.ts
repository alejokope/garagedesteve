import { z } from "zod";

/** Moneda: global por página o por fila de precio. */
export const repairCurrencySchema = z.enum(["ARS", "USD"]);
export type RepairCurrency = z.infer<typeof repairCurrencySchema>;

/** Modelo / dispositivo tipado (lista maestra en el payload). */
export const repairDeviceEntrySchema = z.object({
  id: z.string(),
  label: z.string(),
});
export type RepairDeviceEntry = z.infer<typeof repairDeviceEntrySchema>;

export const repairPricingTableRowSchema = z.object({
  /** Referencia a `devices[].id`. Si falta, se usa `model` como respaldo (contenido legado). */
  deviceId: z.string().default(""),
  model: z.string(),
  price: z.number().nonnegative(),
  /** Si falta, usa `defaultCurrency` de la página. */
  currency: repairCurrencySchema.nullable().optional(),
  /**
   * Texto libre que reemplaza el precio numérico (ej. "Consultar").
   * Si está vacío, se muestra `formatRepairPrice(price, currency)`.
   */
  priceLabel: z.string().default(""),
  /** Marca del repuesto (ej. Ampsentrix). Opcional; si hay filas con valor, la tabla muestra columna. */
  partBrand: z.string().default(""),
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
  /**
   * Lista maestra de dispositivos (ej. iPhone 11). Los filtros por categoría y las filas referencian estos ids.
   * @deprecated Usar solo `devices`. Se mantiene vacío al guardar desde el backoffice nuevo.
   */
  deviceFilters: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
  devices: z.array(repairDeviceEntrySchema).default([]),
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

function normalizeDeviceLabelKey(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Etiqueta del dispositivo por id, o null si no existe. */
export function repairDeviceLabel(
  devices: RepairDeviceEntry[],
  deviceId: string,
): string | null {
  const id = deviceId.trim();
  if (!id) return null;
  const d = devices.find((x) => x.id === id);
  return d?.label ?? null;
}

/** Texto a mostrar en columna Modelo (prioriza lista maestra). */
export function repairRowModelDisplay(
  row: { deviceId?: string; model: string },
  devices: RepairDeviceEntry[],
): string {
  const fromId = row.deviceId?.trim()
    ? repairDeviceLabel(devices, row.deviceId.trim())
    : null;
  if (fromId) return fromId;
  return row.model?.trim() || "—";
}

/** Fila visible para el filtro global por dispositivo. */
export function repairRowMatchesDeviceFilter(
  row: { deviceId?: string; model: string },
  selectedId: string | "all",
  devices: RepairDeviceEntry[],
): boolean {
  if (selectedId === "all") return true;
  if (row.deviceId?.trim() === selectedId) return true;
  const want = repairDeviceLabel(devices, selectedId);
  if (want && normalizeDeviceLabelKey(row.model) === normalizeDeviceLabelKey(want)) {
    return true;
  }
  return false;
}

/** Categoría visible según dispositivo seleccionado y `deviceFilterIds`. */
export function repairCategoryVisibleForDevice(
  cat: { deviceFilterIds: string[]; layout: "table" | "highlights" },
  selectedId: string | "all",
): boolean {
  if (selectedId === "all") return true;
  if (cat.deviceFilterIds.length === 0) return true;
  return cat.deviceFilterIds.includes(selectedId);
}

/** Id estable a partir de etiqueta (para alta rápida en backoffice). */
export function repairSlugDeviceId(label: string): string {
  const base = label
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return (base || "device").slice(0, 48);
}

/** Genera id único ante colisiones. */
export function repairUniqueDeviceId(label: string, existingIds: Set<string>): string {
  let base = repairSlugDeviceId(label);
  let id = base;
  let n = 0;
  while (existingIds.has(id)) {
    n += 1;
    id = `${base}-${n}`;
  }
  return id;
}

/** Texto de precio para una fila: etiqueta libre o importe formateado. */
export function formatRepairTablePriceCell(
  row: {
    price: number;
    priceLabel?: string;
    currency?: RepairCurrency | null;
  },
  defaultCurrency: RepairCurrency,
): string {
  const label = row.priceLabel?.trim();
  if (label) return label;
  const cur =
    row.currency === "ARS" || row.currency === "USD" ? row.currency : defaultCurrency;
  return formatRepairPrice(row.price, cur);
}

export function parseRepairPricingPayload(raw: unknown): RepairPricingPayload {
  return mergeRepairPricingDefaults(raw);
}

function resolveDevicesFromPartial(
  o: Record<string, unknown>,
  base: RepairPricingPayload,
): RepairDeviceEntry[] {
  if (Array.isArray(o.devices) && o.devices.length > 0) {
    try {
      return z.array(repairDeviceEntrySchema).parse(o.devices);
    } catch {
      return base.devices;
    }
  }
  if (Array.isArray(o.deviceFilters) && o.deviceFilters.length > 0) {
    try {
      return z.array(repairDeviceEntrySchema).parse(o.deviceFilters);
    } catch {
      return base.devices;
    }
  }
  return base.devices;
}

function matchModelToDeviceId(model: string, devices: RepairDeviceEntry[]): string {
  const k = normalizeDeviceLabelKey(model);
  if (!k) return "";
  for (const d of devices) {
    if (normalizeDeviceLabelKey(d.label) === k) return d.id;
  }
  return "";
}

function sanitizeCategoriesDevices(
  categories: RepairPricingPayload["categories"],
  devices: RepairDeviceEntry[],
): RepairPricingPayload["categories"] {
  const deviceIdSet = new Set(devices.map((d) => d.id));
  return categories.map((cat) => ({
    ...cat,
    deviceFilterIds: cat.deviceFilterIds.filter((id) => deviceIdSet.has(id)),
    tableRows: cat.tableRows.map((row) => {
      let deviceId = row.deviceId?.trim() ?? "";
      if (!deviceId && row.model.trim()) {
        const m = matchModelToDeviceId(row.model, devices);
        if (m) deviceId = m;
      }
      const label = deviceId ? repairDeviceLabel(devices, deviceId) : null;
      const model = label ?? row.model;
      return { ...row, deviceId, model };
    }),
  }));
}

export function mergeRepairPricingDefaults(partial: unknown): RepairPricingPayload {
  const base = defaultRepairPricingPayload();
  if (!partial || typeof partial !== "object") return base;
  const o = partial as Record<string, unknown>;

  const devices = resolveDevicesFromPartial(o, base);

  const categoriesRaw = Array.isArray(o.categories) ? o.categories : base.categories;
  let categories = categoriesRaw.map((c) =>
    repairPricingCategorySchema.parse({
      ...emptyCategory(),
      ...(typeof c === "object" && c ? c : {}),
    }),
  );
  if (categories.length === 0) categories = base.categories;
  categories = sanitizeCategoriesDevices(categories, devices);

  const legacyFilters = Array.isArray(o.deviceFilters) ? o.deviceFilters : base.deviceFilters;

  try {
    return repairPricingPayloadSchema.parse({
      ...base,
      ...o,
      defaultCurrency:
        o.defaultCurrency === "ARS" || o.defaultCurrency === "USD"
          ? o.defaultCurrency
          : base.defaultCurrency,
      devices,
      deviceFilters: devices.length > 0 ? [] : legacyFilters,
      categories,
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
    deviceFilters: [],
    devices: [
      { id: "iphone-13-pro-max", label: "iPhone 13 Pro Max" },
      { id: "iphone-14", label: "iPhone 14" },
      { id: "iphone-12-plus", label: "iPhone 12 en adelante" },
      { id: "iphone-ipad-carga", label: "iPhone / iPad (según modelo)" },
    ],
    categories: [
      {
        id: "pantalla",
        deviceFilterIds: [],
        title: "Cambio de pantalla",
        headerTone: "blue",
        iconEmoji: "📱",
        layout: "table",
        tableRows: [
          {
            deviceId: "iphone-13-pro-max",
            model: "iPhone 13 Pro Max",
            price: 220,
            currency: "USD",
            time: "2–4 hs",
            warrantyLabel: "6 meses",
          },
          {
            deviceId: "iphone-14",
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
        deviceFilterIds: [],
        title: "Cambio de batería",
        headerTone: "green",
        iconEmoji: "🔋",
        layout: "table",
        tableRows: [
          {
            deviceId: "iphone-12-plus",
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
        deviceFilterIds: [],
        title: "Pin de carga",
        headerTone: "purple",
        iconEmoji: "⚡",
        layout: "table",
        tableRows: [
          {
            deviceId: "iphone-ipad-carga",
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

import { z } from "zod";

export const sellCurrencySchema = z.enum(["ARS", "USD"]);
export type SellCurrency = z.infer<typeof sellCurrencySchema>;

/** Etiquetas de batería tal como las cargás en el panel (coinciden con el simulador). */
export const SELL_BATTERY_70_90 = "ENTRE 70% Y 90%" as const;
export const SELL_BATTERY_90_PLUS = "SOLO DE 90% EN ADELANTE" as const;

export const DEFAULT_SELL_QUALITY =
  "SIN DETALLES, 100% FUNCIONAL Y SIN PIEZAS DESCONOCIDAS" as const;

export const sellPricingRowSchema = z.object({
  id: z.string(),
  product: z.string().default("IPHONE"),
  model: z.string(),
  capacityGb: z.number().int().positive(),
  quality: z.string(),
  battery: z.string(),
  price: z.number().nonnegative(),
  currency: sellCurrencySchema.nullable().optional(),
});

export type SellPricingRow = z.infer<typeof sellPricingRowSchema>;

export const sellPricingPayloadSchema = z.object({
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  defaultCurrency: sellCurrencySchema.default("USD"),
  /** Texto legal / aclaración bajo el simulador. */
  legalNote: z.string(),
  rows: z.array(sellPricingRowSchema).default([]),
});

export type SellPricingPayload = z.infer<typeof sellPricingPayloadSchema>;

export const SELL_PRICING_KEY = "sell.pricing" as const;

type Bat = "70" | "90";

const SEED_COMPACT: readonly { model: string; cap: number; bat: Bat; price: number }[] = [
  { model: "11", cap: 128, bat: "70", price: 80 },
  { model: "11", cap: 256, bat: "70", price: 100 },
  { model: "11 PRO", cap: 256, bat: "70", price: 150 },
  { model: "11 PRO MAX", cap: 256, bat: "70", price: 250 },
  { model: "12", cap: 64, bat: "70", price: 100 },
  { model: "12", cap: 128, bat: "70", price: 150 },
  { model: "12", cap: 256, bat: "70", price: 180 },
  { model: "12 PRO", cap: 128, bat: "70", price: 200 },
  { model: "12 PRO", cap: 256, bat: "70", price: 230 },
  { model: "12 PRO MAX", cap: 128, bat: "70", price: 300 },
  { model: "12 PRO MAX", cap: 256, bat: "70", price: 320 },
  { model: "13", cap: 128, bat: "70", price: 220 },
  { model: "13", cap: 256, bat: "70", price: 250 },
  { model: "13 PRO", cap: 128, bat: "70", price: 320 },
  { model: "13 PRO", cap: 256, bat: "70", price: 350 },
  { model: "13 PRO MAX", cap: 128, bat: "70", price: 370 },
  { model: "13 PRO MAX", cap: 256, bat: "70", price: 420 },
  { model: "14", cap: 128, bat: "70", price: 270 },
  { model: "14", cap: 256, bat: "70", price: 300 },
  { model: "14 PRO", cap: 128, bat: "70", price: 380 },
  { model: "14 PRO", cap: 128, bat: "90", price: 410 },
  { model: "14 PRO", cap: 256, bat: "70", price: 420 },
  { model: "14 PRO", cap: 256, bat: "90", price: 450 },
  { model: "14 PRO MAX", cap: 128, bat: "70", price: 450 },
  { model: "14 PRO MAX", cap: 128, bat: "90", price: 480 },
  { model: "14 PRO MAX", cap: 256, bat: "70", price: 480 },
  { model: "14 PRO MAX", cap: 256, bat: "90", price: 510 },
  { model: "15", cap: 128, bat: "70", price: 400 },
  { model: "15", cap: 128, bat: "90", price: 430 },
  { model: "15", cap: 256, bat: "70", price: 450 },
  { model: "15", cap: 256, bat: "90", price: 480 },
  { model: "15 PRO", cap: 128, bat: "70", price: 470 },
  { model: "15 PRO", cap: 128, bat: "90", price: 500 },
  { model: "15 PRO", cap: 256, bat: "70", price: 520 },
  { model: "15 PRO", cap: 256, bat: "90", price: 550 },
  { model: "15 PRO MAX", cap: 256, bat: "70", price: 600 },
  { model: "15 PRO MAX", cap: 256, bat: "90", price: 630 },
  { model: "15 PRO MAX", cap: 512, bat: "70", price: 650 },
  { model: "15 PRO MAX", cap: 512, bat: "90", price: 670 },
  { model: "16", cap: 128, bat: "90", price: 550 },
  { model: "16", cap: 256, bat: "90", price: 580 },
  { model: "16", cap: 512, bat: "90", price: 600 },
  { model: "16 PRO", cap: 128, bat: "90", price: 650 },
  { model: "16 PRO", cap: 256, bat: "90", price: 680 },
  { model: "16 PRO", cap: 512, bat: "90", price: 700 },
  { model: "16 PRO MAX", cap: 256, bat: "90", price: 700 },
  { model: "17", cap: 256, bat: "90", price: 700 },
  { model: "17", cap: 512, bat: "90", price: 770 },
  { model: "17 PRO", cap: 256, bat: "90", price: 1100 },
  { model: "17 PRO", cap: 512, bat: "90", price: 1200 },
  { model: "17 PRO MAX", cap: 256, bat: "90", price: 1200 },
  { model: "17 PRO MAX", cap: 512, bat: "90", price: 1300 },
];

function batteryLabel(bat: Bat): string {
  return bat === "70" ? SELL_BATTERY_70_90 : SELL_BATTERY_90_PLUS;
}

function seedRowsFromCompact(): SellPricingRow[] {
  return SEED_COMPACT.map((r, i) => ({
    id: `sell-seed-${i}`,
    product: "IPHONE",
    model: r.model,
    capacityGb: r.cap,
    quality: DEFAULT_SELL_QUALITY,
    battery: batteryLabel(r.bat),
    price: r.price,
    currency: null,
  }));
}

export function defaultSellPricingPayload(): SellPricingPayload {
  return sellPricingPayloadSchema.parse({
    badge: "Compra de usados",
    title: "Simulador de valor",
    subtitle:
      "Elegí modelo, memoria y rango de batería. Es una referencia para equipos en condición impecable; el precio final lo cerramos al revisar el equipo.",
    defaultCurrency: "USD",
    legalNote:
      "Valores orientativos para iPhone en excelente estado según la tabla cargada. No incluye negociaciones por operador, iCloud o accesorios. La oferta definitiva puede variar al inspeccionar el dispositivo.",
    rows: seedRowsFromCompact(),
  });
}

function normalizeKeyPart(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function mergeSellPricingDefaults(partial: unknown): SellPricingPayload {
  const base = defaultSellPricingPayload();
  if (!partial || typeof partial !== "object") return base;
  const o = partial as Record<string, unknown>;
  try {
    const rowsRaw = Array.isArray(o.rows) ? o.rows : base.rows;
    const rows = rowsRaw.map((r, i) => {
      const row = typeof r === "object" && r ? (r as Record<string, unknown>) : {};
      const id = typeof row.id === "string" && row.id.trim() ? row.id.trim() : `row-${i}`;
      const product =
        typeof row.product === "string" && row.product.trim() ? row.product.trim() : "IPHONE";
      const model = typeof row.model === "string" ? row.model.trim() : "";
      const capacityGb =
        typeof row.capacityGb === "number" && Number.isFinite(row.capacityGb)
          ? Math.round(row.capacityGb)
          : typeof row.capacityGb === "string"
            ? Math.max(1, parseInt(row.capacityGb, 10) || 128)
            : 128;
      const quality =
        typeof row.quality === "string" && row.quality.trim()
          ? row.quality.trim()
          : DEFAULT_SELL_QUALITY;
      const battery = typeof row.battery === "string" ? row.battery.trim() : "";
      const price =
        typeof row.price === "number" && Number.isFinite(row.price) ? Math.max(0, row.price) : 0;
      const currency =
        row.currency === "ARS" || row.currency === "USD" ? row.currency : null;
      return sellPricingRowSchema.parse({
        id,
        product,
        model,
        capacityGb,
        quality,
        battery,
        price,
        currency,
      });
    });
    return sellPricingPayloadSchema.parse({
      ...base,
      ...o,
      defaultCurrency:
        o.defaultCurrency === "ARS" || o.defaultCurrency === "USD"
          ? o.defaultCurrency
          : base.defaultCurrency,
      legalNote: typeof o.legalNote === "string" ? o.legalNote : base.legalNote,
      rows: rows.length > 0 ? rows : base.rows,
    });
  } catch {
    return base;
  }
}

export function parseSellPricingPayload(raw: unknown): SellPricingPayload {
  return mergeSellPricingDefaults(raw);
}

export function formatSellPrice(amount: number, currency: SellCurrency): string {
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

/** Orden de modelos en el selector (generación y variante). */
export function sellModelSortKey(model: string): [number, number] {
  const u = normalizeKeyPart(model);
  const gen = parseInt(u.split(" ")[0] || "0", 10) || 0;
  let tier = 0;
  if (u.includes("PRO MAX")) tier = 3;
  else if (u.includes("PRO")) tier = 2;
  else tier = 1;
  return [gen, tier];
}

export function uniqueSortedModels(rows: SellPricingRow[]): string[] {
  const byNorm = new Map<string, string>();
  for (const r of rows) {
    const raw = r.model.trim();
    if (!raw) continue;
    const k = normalizeKeyPart(raw);
    if (!byNorm.has(k)) byNorm.set(k, raw);
  }
  return [...byNorm.entries()]
    .sort(([ka], [kb]) => {
      const a = sellModelSortKey(ka);
      const b = sellModelSortKey(kb);
      if (a[0] !== b[0]) return a[0] - b[0];
      return a[1] - b[1];
    })
    .map(([, label]) => label);
}

export function formatIphoneModelLabel(model: string): string {
  const parts = normalizeKeyPart(model).split(" ");
  const rest = parts
    .slice(1)
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
  const first = parts[0] ?? "";
  return rest ? `iPhone ${first} ${rest}` : `iPhone ${first}`;
}

export function sellRowMatchKey(row: SellPricingRow): string {
  return [
    normalizeKeyPart(row.product),
    normalizeKeyPart(row.model),
    String(row.capacityGb),
    normalizeKeyPart(row.battery),
  ].join("|");
}

export function findSellPriceRow(
  rows: SellPricingRow[],
  input: { product: string; model: string; capacityGb: number; battery: string },
): SellPricingRow | null {
  const pk = normalizeKeyPart(input.product);
  const mk = normalizeKeyPart(input.model);
  const bk = normalizeKeyPart(input.battery);
  return (
    rows.find(
      (r) =>
        normalizeKeyPart(r.product) === pk &&
        normalizeKeyPart(r.model) === mk &&
        r.capacityGb === input.capacityGb &&
        normalizeKeyPart(r.battery) === bk,
    ) ?? null
  );
}

export function batteryShortLabel(battery: string): string {
  const u = normalizeKeyPart(battery);
  if (u.includes("90% EN ADELANTE") || u.includes("SOLO DE 90")) return "≥ 90%";
  if (u.includes("70") && u.includes("90")) return "70% – 90%";
  return battery;
}

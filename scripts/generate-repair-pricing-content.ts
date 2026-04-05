/**
 * Lee data/repair-pricing.tsv y escribe SQL para `content_entries` (repair.pricing).
 *
 * Uso: npx tsx scripts/generate-repair-pricing-content.ts > supabase/seed/repair_pricing.sql
 */
import * as fs from "node:fs";
import * as path from "node:path";

import {
  mergeRepairPricingDefaults,
  REPAIR_PRICING_KEY,
  repairUniqueDeviceId,
  type RepairDeviceEntry,
  type RepairPricingPayload,
} from "../lib/repair-pricing-schema";

type Tone = RepairPricingPayload["categories"][number]["headerTone"];

const META: Record<
  string,
  { id: string; title: string; iconEmoji: string; headerTone: Tone; footerBullets: string[] }
> = {
  Bateria: {
    id: "bateria",
    title: "Cambio de batería",
    iconEmoji: "🔋",
    headerTone: "green",
    footerBullets: ["Mano de obra incluida", "Precio final según diagnóstico y stock"],
  },
  Modulo: {
    id: "modulo",
    title: "Módulo (pantalla completa)",
    iconEmoji: "📱",
    headerTone: "blue",
    footerBullets: ["Incluye panel y táctil según modelo"],
  },
  Speaker: {
    id: "speaker",
    title: "Speaker (altavoz auricular)",
    iconEmoji: "🔊",
    headerTone: "purple",
    footerBullets: [],
  },
  Buzzer: {
    id: "buzzer",
    title: "Buzzer (vibrador)",
    iconEmoji: "📳",
    headerTone: "orange",
    footerBullets: [],
  },
  "Mic / Pin de carga": {
    id: "mic-pin-carga",
    title: "Micrófono / pin de carga",
    iconEmoji: "⚡",
    headerTone: "purple",
    footerBullets: [],
  },
  "Camara Trasera": {
    id: "camara-trasera",
    title: "Cámara trasera",
    iconEmoji: "📷",
    headerTone: "blue",
    footerBullets: [],
  },
  "Camara Frontal": {
    id: "camara-frontal",
    title: "Cámara frontal",
    iconEmoji: "🤳",
    headerTone: "blue",
    footerBullets: [],
  },
  "Vidrio de Camara": {
    id: "vidrio-camara",
    title: "Vidrio de cámara",
    iconEmoji: "🔎",
    headerTone: "green",
    footerBullets: [],
  },
  "Tapa Trasera": {
    id: "tapa-trasera",
    title: "Tapa trasera",
    iconEmoji: "🧩",
    headerTone: "red",
    footerBullets: [],
  },
};

function normalizeWarranty(s: string): string {
  if (s.trim() === "3 Meses") return "3 meses";
  return s.trim();
}

function normalizeTime(s: string): string {
  const t = s.trim();
  if (t === "2 Horas") return "2 hs";
  if (t === "4 Horas") return "4 hs";
  return t;
}

function parsePrice(raw: string): { price: number; priceLabel: string } {
  const t = raw.trim();
  if (t === "Consultar") return { price: 0, priceLabel: "Consultar" };
  const compact = t.replace(/\s+/g, "");
  const m = compact.match(/^U\$D(\d+)$/i) ?? t.match(/U\$D\s*(\d+)/i);
  if (m) return { price: Number(m[1]), priceLabel: "" };
  throw new Error(`Precio no reconocido: ${JSON.stringify(raw)}`);
}

function formatModel(model: string): string {
  const m = model.trim();
  if (m === "—" || m === "-") return "—";
  if (/^iphone\s/i.test(m)) return m;
  return `iPhone ${m}`;
}

function buildDevicesFromTsvLines(lines: string[]): RepairDeviceEntry[] {
  const labels = new Set<string>();
  for (const line of lines) {
    const parts = line.split("\t");
    if (parts.length < 2) continue;
    if (parts[0] === "Trabajos de placa") continue;
    const label = formatModel(parts[1]!);
    if (label !== "—") labels.add(label);
  }
  const sorted = [...labels].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  const used = new Set<string>();
  const devices: RepairDeviceEntry[] = [];
  for (const label of sorted) {
    const id = repairUniqueDeviceId(label, used);
    used.add(id);
    devices.push({ id, label });
  }
  return devices;
}

function parseTsv(
  filePath: string,
): { categories: RepairPricingPayload["categories"]; devices: RepairDeviceEntry[] } {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\n/).map((l) => l.trimEnd()).filter((l) => l.length > 0);

  const devices = buildDevicesFromTsvLines(lines);
  const labelToId = new Map(devices.map((d) => [d.label, d.id] as const));

  const byRepair = new Map<string, typeof lines>();
  for (const line of lines) {
    const parts = line.split("\t");
    if (parts.length < 6) {
      throw new Error(`Línea TSV inválida (esperaba 6 columnas tab): ${line}`);
    }
    const repair = parts[0]!;
    if (!byRepair.has(repair)) byRepair.set(repair, []);
    byRepair.get(repair)!.push(line);
  }

  const categories: RepairPricingPayload["categories"] = [];

  for (const [repair, groupLines] of byRepair) {
    if (repair === "Trabajos de placa") {
      categories.push({
        id: "trabajos-placa",
        deviceFilterIds: [],
        title: "Trabajos de placa",
        headerTone: "orange",
        iconEmoji: "🧪",
        layout: "highlights",
        tableRows: [],
        footerBullets: [],
        highlights: [
          { label: "Presupuesto", value: "Consultar" },
          { label: "Plazo / garantía", value: "Consultar" },
          { label: "Coordinación", value: "WhatsApp o tienda" },
        ],
      });
      continue;
    }

    const meta = META[repair];
    if (!meta) throw new Error(`Tipo de reparación sin metadatos: ${repair}`);

    const tableRows: RepairPricingPayload["categories"][number]["tableRows"] = [];

    for (const line of groupLines) {
      const [, modelo, marca, precioRaw, garRaw, demRaw] = line.split("\t");
      const { price, priceLabel } = parsePrice(precioRaw!);
      const modelLabel = formatModel(modelo!);
      const deviceId =
        modelLabel === "—" ? "" : (labelToId.get(modelLabel) ?? "");
      tableRows.push({
        deviceId,
        model: modelLabel,
        partBrand: marca!.trim(),
        price,
        priceLabel,
        currency: "USD",
        time: normalizeTime(demRaw!),
        warrantyLabel: normalizeWarranty(garRaw!),
      });
    }

    categories.push({
      id: meta.id,
      deviceFilterIds: [],
      title: meta.title,
      headerTone: meta.headerTone,
      iconEmoji: meta.iconEmoji,
      layout: "table",
      tableRows,
      footerBullets: meta.footerBullets,
      highlights: [],
    });
  }

  return { categories, devices };
}

function main() {
  const tsvPath = path.join(process.cwd(), "data/repair-pricing.tsv");
  if (!fs.existsSync(tsvPath)) {
    console.error("Falta", tsvPath);
    process.exit(1);
  }

  const { categories, devices } = parseTsv(tsvPath);
  const payload = mergeRepairPricingDefaults({
    defaultCurrency: "USD",
    badge: "Reparación en el momento",
    title: "Precios y cobertura de reparaciones",
    subtitle:
      "Valores en USD con repuesto indicado. Donde dice «Consultar», cotizamos por WhatsApp o en tienda según stock y diagnóstico.",
    devices,
    categories,
    sidebarQuickInfo: [
      { title: "Repuestos", body: "Marcas según fila (Ampsentrix, Repart, VEZR, etc.).", iconEmoji: "📦" },
      { title: "Tiempos", body: "Orientativos; pueden variar según complejidad.", iconEmoji: "⏱️" },
    ],
  });

  const body = JSON.stringify(payload);
  const tag = `rp${Date.now().toString(36)}`;

  const sql = `-- Generado por scripts/generate-repair-pricing-content.ts (no editar a mano)
begin;

insert into public.content_entries (key, label, payload, updated_at)
values (
  '${REPAIR_PRICING_KEY}',
  'Servicio técnico — Precios',
  $${tag}$${body}$${tag}$::jsonb,
  now()
)
on conflict (key) do update set
  payload = excluded.payload,
  label = excluded.label,
  updated_at = now();

commit;
`;

  process.stdout.write(sql);
}

main();

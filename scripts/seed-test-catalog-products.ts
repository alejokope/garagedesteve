/**
 * Inserta / actualiza (upsert) productos de prueba para el BO y la tienda.
 *
 * - iPhone **nuevo** y **usado**, cada uno con **3 grupos** de opciones (capacidad + color + extra).
 * - MacBook, iPad, AirPods y un ítem “random” (accesorio).
 *
 * IDs fijos con prefijo `bo-test-`: podés borrarlos a mano o re-ejecutar el script para refrescar.
 *
 *   npx tsx scripts/seed-test-catalog-products.ts --dry-run
 *   npx tsx scripts/seed-test-catalog-products.ts
 *
 * Requiere .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnvLocal() {
  const p = join(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

const IMG_MAIN =
  "https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80";
const IMG_2 = "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80";
const IMG_3 = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80";

const IPHONE_GALLERY = [IMG_MAIN, IMG_2, IMG_3];

/** Tres listas: capacidad (precio absoluto), color (delta + carrusel), presentación (delta). */
function tripleOptionIphoneVariantGroups(prefix: string, prices: { g128: number; g256: number; g512: number }) {
  return [
    {
      id: `${prefix}-storage`,
      kind: "storage",
      uiKind: "storage",
      label: "Capacidad",
      pricingMode: "absolute" as const,
      options: [
        { id: `${prefix}-128`, label: "128 GB", price: prices.g128 },
        { id: `${prefix}-256`, label: "256 GB", price: prices.g256 },
        { id: `${prefix}-512`, label: "512 GB", price: prices.g512 },
      ],
    },
    {
      id: `${prefix}-color`,
      kind: "color",
      uiKind: "color",
      label: "Color",
      pricingMode: "delta" as const,
      defaultOptionId: `${prefix}-c-natural`,
      options: [
        {
          id: `${prefix}-c-natural`,
          label: "Titanio natural",
          hex: "#8D8C85",
          priceDelta: 0,
          carouselIndex: 0,
        },
        {
          id: `${prefix}-c-azul`,
          label: "Ultramarino",
          hex: "#2E4A62",
          priceDelta: 0,
          carouselIndex: 1,
        },
        {
          id: `${prefix}-c-blanco`,
          label: "Blanco",
          hex: "#F2F2F0",
          priceDelta: 0,
          carouselIndex: 2,
        },
      ],
    },
    {
      id: `${prefix}-caja`,
      kind: "select",
      uiKind: "select",
      label: "Presentación",
      pricingMode: "delta" as const,
      options: [
        { id: `${prefix}-sellado`, label: "Sellado de fábrica", priceDelta: 0 },
        { id: `${prefix}-apertura`, label: "Apertura solo para control", priceDelta: -30 },
      ],
    },
  ];
}

type ProductRow = {
  id: string;
  name: string;
  short: string;
  category: string;
  brand: string | null;
  price: number;
  stock_condition: "new" | "used" | null;
  badge: string | null;
  image: string;
  image_alt: string;
  gallery_images: string[];
  variant_groups: unknown;
  detail: unknown | null;
  compare_at_price: number | null;
  discount_percent: number | null;
  published: boolean;
  sort_order: number;
  updated_at: string;
};

const TEST_PRODUCTS: ProductRow[] = [
  {
    id: "bo-test-iphone-nuevo-triple",
    name: "iPhone 17 Pro (test · nuevo)",
    short: "Demo BO: tres selectores — capacidad, color y presentación.",
    category: "iphone",
    brand: "Apple",
    price: 1099,
    stock_condition: "new",
    badge: "Nuevo sellado",
    image: IMG_MAIN,
    image_alt: "iPhone de prueba nuevo",
    gallery_images: [...IPHONE_GALLERY],
    variant_groups: tripleOptionIphoneVariantGroups("bo-test-in", {
      g128: 1099,
      g256: 1199,
      g512: 1349,
    }),
    detail: null,
    compare_at_price: null,
    discount_percent: null,
    published: true,
    sort_order: 9001,
    updated_at: new Date().toISOString(),
  },
  {
    id: "bo-test-iphone-usado-triple",
    name: "iPhone 14 Pro (test · usado)",
    short: "Demo BO: mismo esquema de 3 listas, equipo usado premium.",
    category: "iphone",
    brand: "Apple",
    price: 689,
    stock_condition: "used",
    badge: "Usado premium",
    image: IMG_2,
    image_alt: "iPhone de prueba usado",
    gallery_images: [...IPHONE_GALLERY],
    variant_groups: tripleOptionIphoneVariantGroups("bo-test-iu", {
      g128: 689,
      g256: 749,
      g512: 829,
    }),
    detail: null,
    compare_at_price: 799,
    discount_percent: 14,
    published: true,
    sort_order: 9002,
    updated_at: new Date().toISOString(),
  },
  {
    id: "bo-test-macbook-air-m3",
    name: "MacBook Air 13\" M3 (test)",
    short: "Demo: RAM fija + SSD con precio final por talla.",
    category: "mac",
    brand: "Apple",
    price: 1049,
    stock_condition: "new",
    badge: null,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd4ca8?w=800&q=80",
    image_alt: "MacBook de prueba",
    gallery_images: [],
    variant_groups: [
      {
        id: "bo-test-mba-ssd",
        kind: "storage",
        uiKind: "storage",
        label: "Almacenamiento SSD",
        pricingMode: "absolute",
        options: [
          { id: "bo-test-mba-256", label: "256 GB", price: 1049 },
          { id: "bo-test-mba-512", label: "512 GB", price: 1199 },
        ],
      },
      {
        id: "bo-test-mba-ram",
        kind: "select",
        uiKind: "select",
        label: "Memoria unificada",
        pricingMode: "delta",
        options: [
          { id: "bo-test-mba-8g", label: "8 GB (base)", priceDelta: 0 },
          { id: "bo-test-mba-16g", label: "16 GB", priceDelta: 200 },
        ],
      },
    ],
    detail: null,
    compare_at_price: null,
    discount_percent: null,
    published: true,
    sort_order: 9003,
    updated_at: new Date().toISOString(),
  },
  {
    id: "bo-test-ipad-air-wifi",
    name: "iPad Air 11\" Wi‑Fi (test)",
    short: "Demo tablet: color con delta + conectividad.",
    category: "ipad",
    brand: "Apple",
    price: 649,
    stock_condition: "new",
    badge: null,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
    image_alt: "iPad de prueba",
    gallery_images: [],
    variant_groups: [
      {
        id: "bo-test-ipad-color",
        kind: "color",
        uiKind: "color",
        label: "Color",
        pricingMode: "delta",
        defaultOptionId: "bo-test-ipad-gris",
        options: [
          { id: "bo-test-ipad-gris", label: "Gris espacial", hex: "#636366", priceDelta: 0, carouselIndex: 0 },
          { id: "bo-test-ipad-azul", label: "Azul", hex: "#64A5D9", priceDelta: 0, carouselIndex: 0 },
        ],
      },
      {
        id: "bo-test-ipad-cell",
        kind: "select",
        uiKind: "select",
        label: "Conectividad",
        pricingMode: "delta",
        options: [
          { id: "bo-test-ipad-wifi", label: "Solo Wi‑Fi", priceDelta: 0 },
          { id: "bo-test-ipad-5g", label: "Wi‑Fi + Cellular", priceDelta: 150 },
        ],
      },
    ],
    detail: null,
    compare_at_price: null,
    discount_percent: null,
    published: true,
    sort_order: 9004,
    updated_at: new Date().toISOString(),
  },
  {
    id: "bo-test-airpods-pro-3",
    name: "AirPods Pro 3 (test)",
    short: "Demo audio: una sola lista de edición / acabado.",
    category: "audio",
    brand: "Apple",
    price: 279,
    stock_condition: "new",
    badge: "Nuevo",
    image: "https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80",
    image_alt: "AirPods de prueba",
    gallery_images: [],
    variant_groups: [
      {
        id: "bo-test-app-edition",
        kind: "select",
        uiKind: "select",
        label: "Edición",
        pricingMode: "absolute",
        options: [
          { id: "bo-test-app-std", label: "Estándar con estuche USB‑C", price: 279 },
          { id: "bo-test-app-hear", label: "Con prueba de audición", price: 299 },
        ],
      },
    ],
    detail: null,
    compare_at_price: null,
    discount_percent: null,
    published: true,
    sort_order: 9005,
    updated_at: new Date().toISOString(),
  },
  {
    id: "bo-test-hub-usb-c-random",
    name: "Hub USB‑C 7 en 1 (test · random)",
    short: "Demo categoría otros: accesorio genérico sin variantes.",
    category: "otros",
    brand: "Genérico",
    price: 42.9,
    stock_condition: "new",
    badge: null,
    image: "https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80",
    image_alt: "Hub USB-C de prueba",
    gallery_images: [],
    variant_groups: [],
    detail: null,
    compare_at_price: 59,
    discount_percent: 27,
    published: true,
    sort_order: 9006,
    updated_at: new Date().toISOString(),
  },
];

async function main() {
  loadEnvLocal();
  const dry = process.argv.includes("--dry-run");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (.env.local).");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Productos de prueba a upsert: ${TEST_PRODUCTS.length}`);
  TEST_PRODUCTS.forEach((p) => console.log(`  - ${p.id} (${p.category})`));

  if (dry) {
    console.log("\n[--dry-run] Sin cambios. Ejecutá sin --dry-run para insertar/actualizar.");
    process.exit(0);
  }

  const { error } = await supabase.from("products").upsert(TEST_PRODUCTS, { onConflict: "id" });
  if (error) throw new Error(error.message);

  console.log("\nListo. Revisá el backoffice o la tienda con los IDs bo-test-*.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

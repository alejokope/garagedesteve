import type { ProductVariantGroup } from "./product-variants";

export type CategoryId =
  | "mac"
  | "ipad"
  | "iphone"
  | "watch"
  | "audio"
  | "desktop"
  | "servicio"
  | "otros";

export type Product = {
  id: string;
  name: string;
  short: string;
  category: CategoryId;
  /** Precio orientativo en ARS — el cliente confirma por WhatsApp */
  price: number;
  badge?: string;
  image: string;
  imageAlt: string;
  /**
   * Características seleccionables (color, almacenamiento, etc.).
   * Mismo shape que puede devolver un BO en el futuro.
   */
  variantGroups?: ProductVariantGroup[];
  /** JSONB `detail` desde Supabase (ficha larga); si falta, se usa `lib/product-detail-data`. */
  detail?: unknown;
};

export const categories: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "Todo" },
  { id: "mac", label: "MacBook" },
  { id: "ipad", label: "iPad" },
  { id: "iphone", label: "iPhone" },
  { id: "watch", label: "Apple Watch" },
  { id: "audio", label: "AirPods" },
  { id: "desktop", label: "iMac" },
  { id: "servicio", label: "Servicio técnico" },
  { id: "otros", label: "Otros" },
];

export const products: Product[] = [
  {
    id: "mb-14-m3",
    name: "MacBook Pro 14″ M3",
    short: "Rendimiento pro, pantalla Liquid Retina XDR.",
    category: "mac",
    price: 2_850_000,
    badge: "Nuevo sellado",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd4ca8?w=800&q=80",
    imageAlt: "MacBook Pro sobre mesa",
    variantGroups: [
      {
        id: "finish",
        kind: "color",
        label: "Acabado",
        pricingMode: "delta",
        options: [
          { id: "space-gray", label: "Gris espacial", hex: "#3d3d3f", priceDelta: 0 },
          { id: "silver", label: "Plata", hex: "#d6d6d7", priceDelta: 0 },
        ],
      },
      {
        id: "storage",
        kind: "storage",
        label: "SSD",
        pricingMode: "absolute",
        options: [
          { id: "ssd512", label: "512 GB", price: 2_850_000 },
          { id: "ssd1tb", label: "1 TB", price: 3_180_000 },
          { id: "ssd2tb", label: "2 TB", price: 3_520_000 },
        ],
      },
    ],
  },
  {
    id: "mb-air-m2",
    name: "MacBook Air 15″ M2",
    short: "Ultrafina, silenciosa, batería de larga duración.",
    category: "mac",
    price: 1_650_000,
    badge: "Premium usado",
    image:
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80",
    imageAlt: "MacBook Air abierta",
    variantGroups: [
      {
        id: "finish",
        kind: "color",
        label: "Color",
        pricingMode: "delta",
        options: [
          { id: "midnight", label: "Medianoche", hex: "#2e2a2b", priceDelta: 0 },
          { id: "starlight", label: "Luz estelar", hex: "#e3dcd1", priceDelta: 0 },
          { id: "space-gray", label: "Gris espacial", hex: "#525252", priceDelta: 0 },
        ],
      },
      {
        id: "ram",
        kind: "select",
        label: "Memoria unificada",
        pricingMode: "absolute",
        options: [
          { id: "8gb-256", label: "8 GB / 256 GB", price: 1_650_000 },
          { id: "8gb-512", label: "8 GB / 512 GB", price: 1_820_000 },
          { id: "16gb-512", label: "16 GB / 512 GB", price: 1_980_000 },
        ],
      },
    ],
  },
  {
    id: "ipad-pro-m4",
    name: "iPad Pro 11″ M4",
    short: "OLED, Apple Pencil Pro, productividad total.",
    category: "ipad",
    price: 1_980_000,
    badge: "Nuevo sellado",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
    imageAlt: "iPad con teclado",
    variantGroups: [
      {
        id: "color",
        kind: "color",
        label: "Color",
        pricingMode: "delta",
        options: [
          { id: "black", label: "Negro", hex: "#1c1c1e", priceDelta: 0 },
          { id: "silver", label: "Plata", hex: "#e8e8ed", priceDelta: 0 },
        ],
      },
      {
        id: "storage",
        kind: "storage",
        label: "Almacenamiento",
        pricingMode: "absolute",
        options: [
          { id: "256", label: "256 GB", price: 1_980_000 },
          { id: "512", label: "512 GB", price: 2_240_000 },
          { id: "1tb", label: "1 TB", price: 2_580_000 },
          { id: "2tb", label: "2 TB", price: 2_980_000 },
        ],
      },
    ],
  },
  {
    id: "ipad-air",
    name: "iPad Air M2",
    short: "Equilibrio perfecto entre potencia y portabilidad.",
    category: "ipad",
    price: 920_000,
    image:
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=80",
    imageAlt: "iPad Air",
    variantGroups: [
      {
        id: "color",
        kind: "color",
        label: "Color",
        pricingMode: "delta",
        options: [
          { id: "blue", label: "Azul", hex: "#6b8cbc", priceDelta: 0 },
          { id: "purple", label: "Violeta", hex: "#9b8fb8", priceDelta: 0 },
          { id: "starlight", label: "Luz estelar", hex: "#e3dcd1", priceDelta: 0 },
          { id: "gray", label: "Gris", hex: "#8e8e93", priceDelta: 0 },
        ],
      },
      {
        id: "storage",
        kind: "storage",
        label: "Capacidad",
        pricingMode: "absolute",
        options: [
          { id: "128", label: "128 GB", price: 920_000 },
          { id: "256", label: "256 GB", price: 1_050_000 },
          { id: "512", label: "512 GB", price: 1_280_000 },
        ],
      },
    ],
  },
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    short: "Titanio, cámara 48 MP, Action Button.",
    category: "iphone",
    price: 1_420_000,
    badge: "Nuevo sellado",
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
    imageAlt: "iPhone Pro",
    variantGroups: [
      {
        id: "color",
        kind: "color",
        label: "Color",
        pricingMode: "delta",
        options: [
          { id: "blue", label: "Azul", hex: "#3d4f6f", priceDelta: 0 },
          { id: "gray", label: "Titanio", hex: "#3a3a3c", priceDelta: 0 },
          { id: "silver", label: "Plata", hex: "#e3e4e6", priceDelta: 0 },
          { id: "gold", label: "Oro", hex: "#e6d4b8", priceDelta: 0 },
        ],
      },
      {
        id: "storage",
        kind: "storage",
        label: "Almacenamiento",
        pricingMode: "absolute",
        options: [
          { id: "128", label: "128GB", price: 1_420_000 },
          { id: "256", label: "256GB", price: 1_540_000 },
          { id: "512", label: "512GB", price: 1_780_000 },
          { id: "1tb", label: "1TB", price: 2_050_000 },
        ],
      },
    ],
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    short: "Dynamic Island, USB-C, colores premium.",
    category: "iphone",
    price: 890_000,
    badge: "Premium usado",
    image:
      "https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80",
    imageAlt: "iPhone 15",
    variantGroups: [
      {
        id: "color",
        kind: "color",
        label: "Color",
        pricingMode: "delta",
        options: [
          { id: "black", label: "Negro", hex: "#1c1c1e", priceDelta: 0 },
          { id: "blue", label: "Azul", hex: "#4a6fa5", priceDelta: 0 },
          { id: "green", label: "Verde", hex: "#4f6f5e", priceDelta: 0 },
          { id: "yellow", label: "Amarillo", hex: "#e8d4a2", priceDelta: 0 },
          { id: "pink", label: "Rosa", hex: "#e8b4b8", priceDelta: 0 },
        ],
      },
      {
        id: "storage",
        kind: "storage",
        label: "Almacenamiento",
        pricingMode: "absolute",
        options: [
          { id: "128", label: "128 GB", price: 890_000 },
          { id: "256", label: "256 GB", price: 990_000 },
          { id: "512", label: "512 GB", price: 1_180_000 },
        ],
      },
    ],
  },
  {
    id: "watch-ultra-2",
    name: "Apple Watch Ultra 2",
    short: "GPS de doble frecuencia, resistencia extrema.",
    category: "watch",
    price: 980_000,
    badge: "Nuevo sellado",
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80",
    imageAlt: "Apple Watch",
    variantGroups: [
      {
        id: "case",
        kind: "color",
        label: "Caja titanio",
        pricingMode: "delta",
        options: [
          { id: "natural", label: "Natural", hex: "#c4b8a8", priceDelta: 0 },
          { id: "black", label: "Negro", hex: "#2c2c2e", priceDelta: 0 },
        ],
      },
      {
        id: "band",
        kind: "select",
        label: "Correa",
        pricingMode: "delta",
        options: [
          { id: "ocean", label: "Ocean", priceDelta: 0 },
          { id: "alpine", label: "Alpine Loop", priceDelta: 25_000 },
          { id: "trail", label: "Trail Loop", priceDelta: 25_000 },
        ],
      },
    ],
  },
  {
    id: "watch-series-10",
    name: "Apple Watch Series 10",
    short: "Pantalla más grande, carga rápida.",
    category: "watch",
    price: 520_000,
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80",
    imageAlt: "Apple Watch Series",
    variantGroups: [
      {
        id: "size",
        kind: "select",
        label: "Tamaño caja",
        pricingMode: "absolute",
        options: [
          { id: "42", label: "42 mm", price: 520_000 },
          { id: "46", label: "46 mm", price: 560_000 },
        ],
      },
      {
        id: "color",
        kind: "color",
        label: "Acabado",
        pricingMode: "delta",
        options: [
          { id: "silver", label: "Plata", hex: "#d1d1d6", priceDelta: 0 },
          { id: "rose", label: "Rosa", hex: "#e8c4c0", priceDelta: 0 },
          { id: "black", label: "Negro", hex: "#2c2c2e", priceDelta: 0 },
        ],
      },
    ],
  },
  {
    id: "airpods-pro-2",
    name: "AirPods Pro 2 USB-C",
    short: "Cancelación activa, audio espacial.",
    category: "audio",
    price: 320_000,
    badge: "Nuevo sellado",
    image:
      "https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80",
    imageAlt: "AirPods Pro",
    variantGroups: [
      {
        id: "edition",
        kind: "select",
        label: "Presentación",
        pricingMode: "absolute",
        options: [
          { id: "usb-c", label: "Estuche USB-C", price: 320_000 },
          { id: "magsafe", label: "Estuche MagSafe", price: 345_000 },
        ],
      },
    ],
  },
  {
    id: "airpods-max",
    name: "AirPods Max",
    short: "Sonido Hi‑Fi con cancelación de ruido.",
    category: "audio",
    price: 680_000,
    badge: "Premium usado",
    image:
      "https://images.unsplash.com/photo-1625245488600-f03c431a446c?w=800&q=80",
    imageAlt: "AirPods Max",
    variantGroups: [
      {
        id: "color",
        kind: "color",
        label: "Color",
        pricingMode: "absolute",
        options: [
          { id: "space-gray", label: "Gris espacial", hex: "#4a4a4c", price: 680_000 },
          { id: "silver", label: "Plata", hex: "#d6d6d8", price: 680_000 },
          { id: "blue", label: "Azul cielo", hex: "#7eb5d6", price: 695_000 },
          { id: "pink", label: "Rosa", hex: "#e8b8c8", price: 695_000 },
          { id: "green", label: "Verde", hex: "#8fbc8f", price: 695_000 },
        ],
      },
    ],
  },
  {
    id: "imac-m3",
    name: "iMac 24″ M3",
    short: "Todo en uno para estudio y creatividad.",
    category: "desktop",
    price: 2_100_000,
    badge: "Nuevo sellado",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
    imageAlt: "iMac en escritorio",
    variantGroups: [
      {
        id: "color",
        kind: "color",
        label: "Color",
        pricingMode: "delta",
        options: [
          { id: "blue", label: "Azul", hex: "#6b9bd1", priceDelta: 0 },
          { id: "green", label: "Verde", hex: "#7cb88e", priceDelta: 0 },
          { id: "pink", label: "Rosa", hex: "#e8b4b8", priceDelta: 0 },
          { id: "silver", label: "Plata", hex: "#e8e8ed", priceDelta: 0 },
        ],
      },
      {
        id: "config",
        kind: "select",
        label: "Configuración",
        pricingMode: "absolute",
        options: [
          { id: "8-256", label: "8 GB RAM · 256 GB SSD", price: 2_100_000 },
          { id: "8-512", label: "8 GB RAM · 512 GB SSD", price: 2_320_000 },
          { id: "16-512", label: "16 GB RAM · 512 GB SSD", price: 2_520_000 },
        ],
      },
    ],
  },
  {
    id: "svc-diagnostico",
    name: "Diagnóstico técnico especializado",
    short: "Evaluación completa + informe y presupuesto.",
    category: "servicio",
    price: 25_000,
    image:
      "https://images.unsplash.com/photo-1580894894513-541e068a3e2e?w=800&q=80",
    imageAlt: "Reparación de laptop",
  },
  {
    id: "svc-bateria",
    name: "Cambio de batería certificada",
    short: "MacBook / iPhone con piezas de calidad.",
    category: "servicio",
    price: 0,
    badge: "Consultar",
    image:
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80",
    imageAlt: "Herramientas de reparación",
  },
  {
    id: "otro-proyector",
    name: "Proyector 4K compacto",
    short: "Ideal para home office y entretenimiento.",
    category: "otros",
    price: 890_000,
    image:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
    imageAlt: "Proyector",
  },
  {
    id: "otro-laptop-win",
    name: "Laptop Windows premium",
    short: "Marcas seleccionadas, stock rotativo.",
    category: "otros",
    price: 0,
    badge: "Consultar",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    imageAlt: "Laptop",
  },
  {
    id: "acc-hub",
    name: "Kit hub USB-C + accesorios",
    short: "Cargadores, fundas y cables certificados.",
    category: "otros",
    price: 45_000,
    image:
      "https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80",
    imageAlt: "Accesorios USB-C",
    variantGroups: [
      {
        id: "kit",
        kind: "select",
        label: "Kit",
        pricingMode: "absolute",
        options: [
          { id: "basic", label: "Básico (hub + cable)", price: 45_000 },
          { id: "plus", label: "Plus (+ funda + adaptador)", price: 72_000 },
          { id: "pro", label: "Pro (todo lo anterior + teclado)", price: 115_000 },
        ],
      },
    ],
  },
];

export const trustPoints = [
  { title: "Stock verificado", desc: "Equipos nuevos sellados y usados premium revisados." },
  { title: "Servicio técnico", desc: "Especialistas en ecosistema Apple y más marcas." },
  { title: "Compra guiada", desc: "Te asesoramos por WhatsApp antes de cerrar." },
];

/** IDs para la grilla de destacados en la home (orden fijo, 4×2) */
export const featuredProductIds = [
  "mb-14-m3",
  "iphone-16-pro",
  "ipad-pro-m4",
  "watch-ultra-2",
  "airpods-pro-2",
  "imac-m3",
  "iphone-15",
  "airpods-max",
] as const;

export function getFeaturedProducts(): Product[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  return featuredProductIds
    .map((id) => byId.get(id))
    .filter((p): p is Product => p != null);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getAllProductIds(): string[] {
  return products.map((p) => p.id);
}

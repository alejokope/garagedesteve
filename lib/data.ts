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

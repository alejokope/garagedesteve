import type { Product } from "@/lib/data";

/** Fila clave → valor en la ficha del producto (BO y tienda). */
export type ProductDetailPair = {
  key: string;
  value: string;
};

export type ProductSpec = {
  key: string;
  title: string;
  value: string;
  desc: string;
  icon: "chip" | "camera" | "display" | "battery" | "memory" | "water";
};

export type ProductDetailBlock = {
  images: string[];
  /** Texto corrido; respaldo si no hay `detailPairs` / `descriptionItems`. */
  longDescription: string;
  /** Filas etiqueta + valor (preferido en BO actual). */
  detailPairs?: ProductDetailPair[];
  /** Legado: lista de textos sin clave. */
  descriptionItems?: string[];
  /** Garantía destacada en la ficha (backoffice: campo propio). */
  warranty?: string;
  specs: ProductSpec[];
  relatedIds: string[];
  accessoryIds: string[];
  reviews: {
    name: string;
    avatar: string;
    rating: number;
    text: string;
  }[];
};

const IPHONE_IMAGES = [
  "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=85",
  "https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=1200&q=85",
  "https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=1200&q=85&auto=format&fit=crop&w=800",
  "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=1200&q=85",
];

export const productDetailById: Record<string, ProductDetailBlock> = {
  "iphone-16-pro": {
    images: IPHONE_IMAGES,
    longDescription:
      "El iPhone más avanzado con chasis de titanio, chip A18 Pro y sistema de cámaras profesional. Pantalla Super Retina XDR con ProMotion y la mejor batería hasta la fecha en un iPhone Pro.",
    specs: [
      {
        key: "cpu",
        icon: "chip",
        title: "PROCESADOR",
        value: "A18 Pro",
        desc: "Neural Engine de 16 núcleos y GPU con trazado de rayos.",
      },
      {
        key: "cam",
        icon: "camera",
        title: "CÁMARA PRINCIPAL",
        value: "48 MP",
        desc: "Fusiones de píxeles y zoom óptico de hasta 5×.",
      },
      {
        key: "screen",
        icon: "display",
        title: "PANTALLA",
        value: '6.3" XDR',
        desc: "ProMotion 120 Hz, Always-On y HDR extremo.",
      },
      {
        key: "bat",
        icon: "battery",
        title: "BATERÍA",
        value: "Hasta 29 h",
        desc: "Reproducción de video según uso y modo de bajo consumo.",
      },
      {
        key: "ram",
        icon: "memory",
        title: "MEMORIA",
        value: "8 GB RAM",
        desc: "Multitarea fluida y modelos de IA en dispositivo.",
      },
      {
        key: "water",
        icon: "water",
        title: "RESISTENCIA",
        value: "IP68",
        desc: "Hasta 6 m de profundidad durante 30 minutos.",
      },
    ],
    relatedIds: ["iphone-15", "watch-ultra-2", "airpods-pro-2", "ipad-pro-m4"],
    accessoryIds: ["airpods-pro-2", "acc-hub", "airpods-max"],
    reviews: [
      {
        name: "Lucía M.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80",
        rating: 5,
        text: "Pantalla increíble y batería que rinde todo el día. La cámara superó expectativas.",
      },
      {
        name: "Martín P.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80",
        rating: 5,
        text: "Compra sellada, entrega en fecha. Atención muy clara por WhatsApp.",
      },
      {
        name: "Paula G.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&q=80",
        rating: 4,
        text: "Excelente relación calidad-precio. El titanio se siente premium.",
      },
    ],
  },
};

export function getProductDetailExtra(id: string): ProductDetailBlock | null {
  return productDetailById[id] ?? null;
}

/** Pares a mostrar en la tienda: `detailPairs` o, si no hay, datos viejos. */
export function getDetailPairs(block: ProductDetailBlock): ProductDetailPair[] {
  const raw = block.detailPairs?.filter((p) => p.key?.trim() || p.value?.trim()) ?? [];
  if (raw.length > 0) return raw.map((p) => ({ key: p.key.trim(), value: p.value.trim() }));

  if (block.descriptionItems?.length) {
    return block.descriptionItems
      .map((s) => s.replace(/\r\n/g, "\n").trim())
      .filter(Boolean)
      .map((s) => ({ key: "", value: s }));
  }

  const ld = block.longDescription.trim();
  if (ld) return [{ key: "", value: ld }];

  return [];
}

export function buildFallbackDetail(p: Product): ProductDetailBlock {
  const short = p.short.trim();
  return {
    images: [p.image],
    longDescription: p.short,
    detailPairs: short ? [{ key: "", value: short }] : [],
    specs: [],
    relatedIds: [],
    accessoryIds: [],
    reviews: [],
  };
}

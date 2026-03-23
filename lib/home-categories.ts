import type { CategoryId } from "@/lib/data";

export type HomeCategoryTile =
  | {
      kind: "product";
      title: string;
      description: string;
      href: string;
      image: string;
      imageAlt: string;
      category: CategoryId;
    }
  | {
      kind: "service";
      title: string;
      description: string;
      href: string;
    };

export const homeCategoryTiles: HomeCategoryTile[] = [
  {
    kind: "product",
    title: "iPhone",
    description: "Los últimos modelos con garantía y financiación.",
    href: "/tienda?cat=iphone#catalogo",
    category: "iphone",
    image:
      "https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=85",
    imageAlt: "iPhone",
  },
  {
    kind: "product",
    title: "iPad",
    description: "Productividad y creatividad en cualquier lugar.",
    href: "/tienda?cat=ipad#catalogo",
    category: "ipad",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=85",
    imageAlt: "iPad",
  },
  {
    kind: "product",
    title: "Accesorios",
    description: "Fundas, cargadores y más para tu ecosistema.",
    href: "/tienda?cat=otros#catalogo",
    category: "otros",
    image:
      "https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=85",
    imageAlt: "Accesorios",
  },
  {
    kind: "product",
    title: "Apple Watch",
    description: "Salud y conectividad en tu muñeca.",
    href: "/tienda?cat=watch#catalogo",
    category: "watch",
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=85",
    imageAlt: "Apple Watch",
  },
  {
    kind: "product",
    title: "AirPods",
    description: "Sonido premium con cancelación de ruido.",
    href: "/tienda?cat=audio#catalogo",
    category: "audio",
    image:
      "https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=85",
    imageAlt: "AirPods",
  },
  {
    kind: "service",
    title: "Servicio Técnico",
    description: "Resolvemos cualquier problema con tu dispositivo.",
    href: "/#servicio-tecnico",
  },
];

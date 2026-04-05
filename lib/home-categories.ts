import type { CategoryId } from "@/lib/data";

/**
 * Debe coincidir con el recuadro de la home (`aspect-[4/3]` en `HomeCategoriesGrid`).
 * Sirve para orientar al cliente al exportar o recortar antes de subir.
 */
export const HOME_CATEGORY_TILE_RECOMMENDED_PX = { width: 1200, height: 900 } as const;
export const HOME_CATEGORY_TILE_ASPECT_LABEL = "4:3 (horizontal)";

/** Párrafo para el backoffice: tamaño y comportamiento de `object-cover` en la web. */
export const HOME_CATEGORY_TILE_IMAGE_GUIDE_ES = `Proporción ${HOME_CATEGORY_TILE_ASPECT_LABEL}, ideal ${HOME_CATEGORY_TILE_RECOMMENDED_PX.width}×${HOME_CATEGORY_TILE_RECOMMENDED_PX.height}px (también sirve 800×600). En la página la foto rellena el recuadro y puede recortarse en los bordes si no es 4:3.`;

/** Una línea para repetir junto a “subir archivo” sin duplicar todo el párrafo. */
export const HOME_CATEGORY_TILE_IMAGE_UPLOAD_HINT_ES = `Misma proporción que la nota de arriba: ${HOME_CATEGORY_TILE_ASPECT_LABEL}, ${HOME_CATEGORY_TILE_RECOMMENDED_PX.width}×${HOME_CATEGORY_TILE_RECOMMENDED_PX.height}px.`;

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
      /** Si falta en datos viejos, `mergeCategories` completa con {@link SERVICE_CATEGORY_DEFAULT_IMAGE}. */
      image?: string;
      imageAlt?: string;
    };

/** Foto por defecto para tarjetas “Servicio” en la home (taller / reparación). */
export const SERVICE_CATEGORY_DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=85";
export const SERVICE_CATEGORY_DEFAULT_ALT =
  "Técnico reparando un smartphone en banco de trabajo";

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
    href: "/servicio-tecnico",
    image: SERVICE_CATEGORY_DEFAULT_IMAGE,
    imageAlt: SERVICE_CATEGORY_DEFAULT_ALT,
  },
];

/** Si una tarjeta de producto no tiene imagen en BD, usamos la de la misma categoría en los defaults. */
export function fallbackImageForProductCategory(category: CategoryId): {
  image: string;
  imageAlt: string;
} {
  const hit = homeCategoryTiles.find(
    (t): t is Extract<HomeCategoryTile, { kind: "product" }> =>
      t.kind === "product" && t.category === category,
  );
  if (hit?.image?.trim()) {
    return { image: hit.image, imageAlt: hit.imageAlt || hit.title };
  }
  return {
    image: "https://images.unsplash.com/photo-14919333824374-121287b29b84?w=800&q=85",
    imageAlt: "Productos Apple",
  };
}

/** Garantiza imagen en todas las tarjetas (producto y servicio). */
export function normalizeHomeCategoryTiles(tiles: HomeCategoryTile[]): HomeCategoryTile[] {
  return tiles.map((t) => {
    if (t.kind === "product") {
      const hasImg = t.image?.trim() && t.imageAlt?.trim();
      if (hasImg) return t;
      const fb = fallbackImageForProductCategory(t.category);
      return {
        ...t,
        image: t.image?.trim() || fb.image,
        imageAlt: t.imageAlt?.trim() || fb.imageAlt,
      };
    }
    const img = t.image?.trim();
    const alt = t.imageAlt?.trim();
    if (img && alt) return t;
    return {
      ...t,
      image: img || SERVICE_CATEGORY_DEFAULT_IMAGE,
      imageAlt: alt || SERVICE_CATEGORY_DEFAULT_ALT,
    };
  });
}

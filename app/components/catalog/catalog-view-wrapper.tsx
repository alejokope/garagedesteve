"use client";

import { useSearchParams } from "next/navigation";

import { CatalogView } from "@/app/components/catalog/catalog-view";
import { catalogFilterLayoutKeyFromSearchParams } from "@/lib/catalog";

/**
 * Remonta el catálogo cuando cambian filtros “de layout” en la URL (enlaces desde la home, etc.),
 * sin incluir `q` ni `max` en la clave para no cortar la búsqueda ni el slider de precio.
 */
export function CatalogViewWrapper() {
  const searchParams = useSearchParams();
  const layoutKey = catalogFilterLayoutKeyFromSearchParams(searchParams);
  return <CatalogView key={layoutKey} />;
}

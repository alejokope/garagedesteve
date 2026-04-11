/**
 * Promo orientativa de envío gratis (carrito y otros avisos del sitio).
 * Los valores vienen del panel → `site.floating_contact`.
 */
export function computeCartFreeShipping(
  enabled: boolean,
  minUsd: number,
  subtotal: number,
): {
  /** Mostrar textos / badges de la promo (checkbox del panel). */
  showPromo: boolean;
  hasFreeShipping: boolean;
  untilFree: number;
} {
  const showPromo = enabled;
  const hasFreeShipping =
    enabled && subtotal > 0 && (minUsd <= 0 || subtotal >= minUsd);
  const untilFree =
    enabled && minUsd > 0 ? Math.max(0, minUsd - subtotal) : 0;
  return { showPromo, hasFreeShipping, untilFree };
}

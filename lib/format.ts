/** Precios de tienda, carrito y catálogo en dólares estadounidenses. */
export function formatMoneyUsd(n: number): string {
  if (n <= 0) return "Consultar";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Como `formatMoneyUsd`, pero permite mostrar US$ 0 (p. ej. total tras entrega de usado). */
export function formatMoneyUsdCheckout(n: number): string {
  if (n === 0) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);
  }
  return formatMoneyUsd(n);
}

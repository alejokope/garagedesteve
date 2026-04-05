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

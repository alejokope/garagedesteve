import type { CartItem } from "@/lib/types";

function formatMoney(n: number, locale = "es-AR") {
  if (n <= 0) return "A convenir";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export function buildWhatsAppOrderMessage(
  items: CartItem[],
  total: number,
  opts?: { businessName?: string; customerNote?: string },
) {
  const name = opts?.businessName ?? "El Garage de Steve";
  const lines: string[] = [
    `Hola ${name}, quiero consultar / pedir lo siguiente:`,
    "",
  ];

  items.forEach((line, i) => {
    const sub = line.product.price * line.qty;
    const pricePart =
      line.product.price > 0
        ? ` — ${formatMoney(sub)}`
        : " — precio a confirmar";
    lines.push(`${i + 1}. ${line.product.name} × ${line.qty}${pricePart}`);
  });

  lines.push("");
  if (total > 0) {
    lines.push(`Total orientativo: ${formatMoney(total)}`);
  } else {
    lines.push("Total orientativo: a convenir (ítems con precio consultar).");
  }

  if (opts?.customerNote?.trim()) {
    lines.push("");
    lines.push(`Nota: ${opts.customerNote.trim()}`);
  }

  lines.push("");
  lines.push("¿Me confirmás disponibilidad y formas de pago? ¡Gracias!");

  return lines.join("\n");
}

export function whatsappUrl(phoneDigits: string, text: string) {
  const clean = phoneDigits.replace(/\D/g, "");
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${clean}?text=${encoded}`;
}

import { cartLineDisplayName, cartLineUnitPrice } from "@/lib/cart-line";
import { formatMoneyUsd } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { CartItem } from "@/lib/types";

function formatOrderMoney(n: number) {
  if (n <= 0) return "A convenir";
  return formatMoneyUsd(n);
}

export function buildWhatsAppOrderMessage(
  items: CartItem[],
  total: number,
  opts?: { businessName?: string; customerNote?: string },
) {
  const name = opts?.businessName ?? siteConfig.brandName;
  const lines: string[] = [
    `Hola ${name}, ¿cómo están? 👋`,
    "",
    "1) Quiero coordinar la compra de un equipo / producto.",
    "",
    "Pedido:",
    "",
  ];

  items.forEach((line, i) => {
    const unit = cartLineUnitPrice(line);
    const sub = unit * line.qty;
    const label = cartLineDisplayName(line);
    const pricePart =
      unit > 0 ? ` — ${formatOrderMoney(sub)}` : " — precio a confirmar";
    lines.push(`${i + 1}. ${label} × ${line.qty}${pricePart}`);
  });

  lines.push("");
  if (total > 0) {
    lines.push(`Total orientativo: ${formatOrderMoney(total)}`);
  } else {
    lines.push("Total orientativo: a convenir (ítems con precio consultar).");
  }

  if (opts?.customerNote?.trim()) {
    lines.push("");
    lines.push(`Preferencias / consultas: ${opts.customerNote.trim()}`);
  }

  lines.push("");
  lines.push(
    "¿Me confirman disponibilidad, retiro en oficina (Microcentro) y formas de pago? Si vieron otro precio, lo vemos y lo intentamos mejorar 🙂",
  );
  lines.push("");
  lines.push(`Listado y links: ${siteConfig.publicLinks.linktree}`);
  lines.push("");
  lines.push("Gracias.");

  return lines.join("\n");
}

export function whatsappUrl(phoneDigits: string, text: string) {
  const clean = phoneDigits.replace(/\D/g, "");
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${clean}?text=${encoded}`;
}

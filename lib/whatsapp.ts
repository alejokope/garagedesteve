import { cartLineDisplayName, cartLineUnitPrice } from "@/lib/cart-line";
import {
  interpolateRichTemplate,
  type FabTemplateVars,
  type RichTemplateVars,
} from "@/lib/floating-contact-resolve";
import { DEFAULT_CART_MESSAGE_TEMPLATE } from "@/lib/floating-contact-schema";
import { formatMoneyUsd } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { CartItem } from "@/lib/types";

export { whatsappUrl } from "@/lib/whatsapp-url";

function formatOrderMoney(n: number) {
  if (n <= 0) return "A convenir";
  return formatMoneyUsd(n);
}

/** Bloque generado: listado numerado + total (sin nota del cliente). */
export function buildCartPedidoBlock(items: CartItem[], total: number): string {
  const lines: string[] = ["Pedido:", ""];

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

  return lines.join("\n");
}

/** Texto para {{nota}}: vacío si no hay nota. */
export function buildCartNotaBlock(customerNote?: string): string {
  const t = customerNote?.trim();
  if (!t) return "";
  return `\n\nPreferencias / consultas: ${t}`;
}

function fallbackTemplateVars(businessName?: string): FabTemplateVars {
  const marca = businessName?.trim() || siteConfig.brandName;
  return {
    marca,
    sitio:
      (typeof process.env.NEXT_PUBLIC_SITE_URL === "string"
        ? process.env.NEXT_PUBLIC_SITE_URL.trim()
        : "") || siteConfig.siteUrl,
    instagram: siteConfig.publicLinks.instagram,
    linktree: siteConfig.publicLinks.linktree,
    año: String(new Date().getFullYear()),
  };
}

export function buildWhatsAppOrderMessage(
  items: CartItem[],
  total: number,
  opts?: {
    businessName?: string;
    customerNote?: string;
    /** Plantilla desde BO; si no hay, se usa el default del esquema. */
    cartMessageTemplate?: string;
    /** Variables {{marca}}, {{sitio}}, etc.; si no hay, se arma desde sitio + env. */
    templateVars?: FabTemplateVars;
  },
) {
  const baseVars = opts?.templateVars ?? fallbackTemplateVars(opts?.businessName);
  const pedido = buildCartPedidoBlock(items, total);
  const nota = buildCartNotaBlock(opts?.customerNote);
  const vars: RichTemplateVars = { ...baseVars, pedido, nota };
  const template =
    opts?.cartMessageTemplate?.trim() || DEFAULT_CART_MESSAGE_TEMPLATE;
  let body = interpolateRichTemplate(template, vars);
  if (!template.includes("{{pedido}}")) {
    body = `${body.trimEnd()}\n\n${pedido}`;
  }
  if (!template.includes("{{nota}}") && nota) {
    body = `${body.trimEnd()}${nota}`;
  }
  return body;
}

import { siteConfig } from "@/lib/site-config";
import { whatsappUrl } from "@/lib/whatsapp";

const LINKTREE = siteConfig.publicLinks.linktree;
const IG_SHORT = "instagram.com/elgaragedesteve";

export function buildRepairPricingWhatsAppMessage(): string {
  const name =
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NAME ?? siteConfig.brandName;
  return [
    `Hola ${name}, ¿cómo están? 👋`,
    "",
    `Somos ${IG_SHORT}.`,
    "",
    "2) Necesito reparar un equipo.",
    "",
    "Quiero consultar precios / cobertura de servicio técnico (vi la tabla en la web).",
    "",
    `En este link están productos y servicio técnico: ${LINKTREE}`,
    "",
    "¡Gracias!",
  ].join("\n");
}

export function buildRepairFormWhatsAppMessage(input: {
  businessName?: string;
  serviceTypeLabel: string;
  brandLabel: string;
  modelLabel: string;
  problem: string;
  priorityLabel: string;
  deliveryLabel: string;
  customerName: string;
  phone: string;
  email?: string;
  fileNames: string[];
}): string {
  const name =
    input.businessName ??
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NAME ??
    siteConfig.brandName;
  const lines: string[] = [
    `Hola ${name}, ¿cómo están?`,
    "",
    "2) Necesito reparar un equipo.",
    "",
    "¿Qué reparación quiero hacer? Detalle del problema y modelo:",
    "",
    `• Tipo de trabajo: ${input.serviceTypeLabel}`,
    `• Marca: ${input.brandLabel}`,
    `• Modelo: ${input.modelLabel}`,
    `• Prioridad: ${input.priorityLabel}`,
    `• Entrega / retiro: ${input.deliveryLabel}`,
    "",
    "Problema (detalle):",
    input.problem.trim() || "(completo en el próximo mensaje)",
    "",
    `Nombre: ${input.customerName}`,
    `Tel / WhatsApp: ${input.phone}`,
  ];
  if (input.email?.trim()) {
    lines.push(`Email: ${input.email.trim()}`);
  }
  if (input.fileNames.length > 0) {
    lines.push("");
    lines.push(`Adjuntos en el chat: ${input.fileNames.join(", ")}`);
  } else {
    lines.push("");
    lines.push("Si hace falta, mando fotos o video por este chat.");
  }
  lines.push("");
  lines.push(`Referencia de precios y catálogo: ${LINKTREE}`);
  lines.push("");
  lines.push("¿Me indican próximos pasos? Gracias.");
  return lines.join("\n");
}

export function repairWhatsAppHref(text: string): string | null {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  if (!phone) return null;
  return whatsappUrl(phone, text);
}

/** Mensaje para coordinar una reparación por WhatsApp (página de seguimiento / trámite). */
export function buildRepairsFlowWhatsAppMessage(): string {
  const name =
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NAME ?? siteConfig.brandName;
  return [
    `Hola ${name}, ¿cómo están?`,
    "",
    "Quiero coordinar o seguir el trámite de una reparación (presupuesto, ingreso del equipo o consulta).",
    "",
    `Si aplica, mi código de seguimiento lo paso en el próximo mensaje.`,
    "",
    `Info general: ${LINKTREE}`,
    "",
    "Gracias.",
  ].join("\n");
}

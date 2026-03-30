import { siteConfig } from "@/lib/site-config";
import { whatsappUrl } from "@/lib/whatsapp";

export function buildRepairPricingWhatsAppMessage(): string {
  const name =
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NAME ?? siteConfig.brandName;
  return [
    `Hola ${name},`,
    "",
    "Quiero una cotización / más información sobre reparaciones (precios y cobertura).",
    "",
    "Gracias.",
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
    `Hola ${name},`,
    "",
    "Solicitud de servicio técnico:",
    "",
    `• Tipo de servicio: ${input.serviceTypeLabel}`,
    `• Marca: ${input.brandLabel}`,
    `• Modelo: ${input.modelLabel}`,
    `• Prioridad: ${input.priorityLabel}`,
    `• Entrega: ${input.deliveryLabel}`,
    "",
    "Problema:",
    input.problem.trim() || "(sin detalle)",
    "",
    `Nombre: ${input.customerName}`,
    `Tel / WhatsApp: ${input.phone}`,
  ];
  if (input.email?.trim()) {
    lines.push(`Email: ${input.email.trim()}`);
  }
  if (input.fileNames.length > 0) {
    lines.push("");
    lines.push(`Archivos seleccionados (enviar por chat): ${input.fileNames.join(", ")}`);
  } else {
    lines.push("");
    lines.push("Fotos: las envío por este chat si las necesitan.");
  }
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
    `Hola ${name},`,
    "",
    "Quiero coordinar o seguir el trámite de una reparación (envío, presupuesto o consulta).",
    "",
    "Gracias.",
  ].join("\n");
}

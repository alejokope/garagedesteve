import { whatsappUrl } from "@/lib/whatsapp";

export type RepairFormWhatsAppFields = {
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
};

/** Cuerpo del mensaje (modelo, problema, datos de contacto); el saludo va en la plantilla de Contacto flotante. */
export function buildRepairFormWhatsAppBody(input: RepairFormWhatsAppFields): string {
  const lines: string[] = [
    "Detalle del pedido de servicio técnico:",
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
    lines.push(`Archivos a enviar por el chat: ${input.fileNames.join(", ")}`);
  } else {
    lines.push("");
    lines.push("Si hace falta, mando fotos o video por este chat.");
  }
  lines.push("");
  lines.push("¿Me indican próximos pasos? Gracias.");
  return lines.join("\n");
}

/** Prefijo desde plantilla «Servicio técnico» + detalle del formulario. */
export function composeRepairFormWhatsAppMessage(
  introFromTemplate: string,
  input: RepairFormWhatsAppFields,
): string {
  const body = buildRepairFormWhatsAppBody(input);
  const intro = introFromTemplate.trim();
  return intro ? `${intro}\n\n${body}` : body;
}

export function repairWhatsAppHref(
  text: string,
  phoneDigitsOverride?: string | null,
): string | null {
  const fromOverride = phoneDigitsOverride?.replace(/\D/g, "") ?? "";
  const phone =
    fromOverride ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
    "";
  if (!phone) return null;
  return whatsappUrl(phone, text);
}
